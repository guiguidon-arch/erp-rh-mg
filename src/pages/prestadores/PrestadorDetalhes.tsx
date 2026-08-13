import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatarCnpj } from '../../lib/cnpj'
import { formatarData } from '../../lib/formatters'
import { gerarBlobPdf, gerarEAbrirPdf } from '../../lib/gerarPdf'
import { enviarParaAssinatura, verificarStatusAssinatura } from '../../lib/autentique'
import { EMPRESA } from '../../lib/empresa'
import { ContratoPrestacaoServicos } from '../../pdf/ContratoPrestacaoServicos'
import type { ContratoPrestador, EnvioAssinatura, Obra, Prestador } from '../../lib/types'

const statusAssinaturaLabel: Record<EnvioAssinatura['status'], string> = {
  enviado: 'Aguardando assinatura',
  assinado: 'Assinado',
  rejeitado: 'Rejeitado',
}

export default function PrestadorDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [prestador, setPrestador] = useState<Prestador | null>(null)
  const [contratos, setContratos] = useState<ContratoPrestador[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [envios, setEnvios] = useState<EnvioAssinatura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gerandoPdf, setGerandoPdf] = useState<string | null>(null)
  const [enviandoAssinatura, setEnviandoAssinatura] = useState<string | null>(null)
  const [verificandoStatus, setVerificandoStatus] = useState<string | null>(null)

  const [escopoServico, setEscopoServico] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [prazoDias, setPrazoDias] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [obraId, setObraId] = useState('')
  const [localAssinatura, setLocalAssinatura] = useState('')
  const [dataAssinatura, setDataAssinatura] = useState('')
  const [salvandoContrato, setSalvandoContrato] = useState(false)

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setLoading(true)
    setError(null)

    const [{ data: p, error: erroP }, { data: cs }, { data: os }, { data: enviosData }] = await Promise.all([
      supabase.from('prestadores').select('*').eq('id', id).single(),
      supabase.from('contratos_prestador').select('*').eq('prestador_id', id).order('created_at', { ascending: false }),
      supabase.from('obras').select('*').order('nome'),
      supabase.from('envios_assinatura').select('*').eq('prestador_id', id).order('created_at', { ascending: false }),
    ])

    if (erroP) {
      setError(erroP.message)
    } else {
      setPrestador(p)
      setContratos(cs ?? [])
      setObras(os ?? [])
      setEnvios(enviosData ?? [])
    }
    setLoading(false)
  }

  async function adicionarContrato(event: FormEvent) {
    event.preventDefault()
    if (!escopoServico.trim()) return

    setSalvandoContrato(true)

    const { error } = await supabase.from('contratos_prestador').insert({
      prestador_id: id,
      escopo_servico: escopoServico,
      valor_total: valorTotal ? Number(valorTotal) : null,
      forma_pagamento: formaPagamento || null,
      prazo_dias: prazoDias ? Number(prazoDias) : null,
      data_inicio: dataInicio || null,
      obra_id: obraId || null,
      local_assinatura: localAssinatura || null,
      data_assinatura: dataAssinatura || null,
    })

    setSalvandoContrato(false)

    if (error) {
      setError(error.message)
      return
    }

    setEscopoServico('')
    setValorTotal('')
    setFormaPagamento('')
    setPrazoDias('')
    setDataInicio('')
    setObraId('')
    setLocalAssinatura('')
    setDataAssinatura('')
    carregar()
  }

  async function removerContrato(contratoId: string) {
    await supabase.from('contratos_prestador').delete().eq('id', contratoId)
    carregar()
  }

  async function gerarPdfContrato(contrato: ContratoPrestador) {
    if (!prestador) return
    setGerandoPdf(contrato.id)
    try {
      const obra = obras.find((o) => o.id === contrato.obra_id) ?? null
      await gerarEAbrirPdf(
        <ContratoPrestacaoServicos prestador={prestador} contrato={contrato} obra={obra} />,
        `contrato-prestacao-servicos-${prestador.razao_social}.pdf`
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar PDF.')
    } finally {
      setGerandoPdf(null)
    }
  }

  async function enviarAssinaturaContrato(contrato: ContratoPrestador) {
    if (!prestador) return

    if (!prestador.email) {
      setError('Este prestador não tem e-mail cadastrado. Edite o cadastro e adicione um e-mail antes de enviar para assinatura.')
      return
    }

    setEnviandoAssinatura(contrato.id)
    setError(null)

    try {
      const obra = obras.find((o) => o.id === contrato.obra_id) ?? null
      const blob = await gerarBlobPdf(<ContratoPrestacaoServicos prestador={prestador} contrato={contrato} obra={obra} />)
      const { documentId } = await enviarParaAssinatura(blob, `contrato-prestacao-servicos-${prestador.razao_social}.pdf`, [
        { name: prestador.responsavel_nome ?? prestador.razao_social, email: prestador.email },
        { name: EMPRESA.representante.nome, email: EMPRESA.representante.email },
      ])

      const { error: erroInsert } = await supabase.from('envios_assinatura').insert({
        prestador_id: id,
        contrato_prestador_id: contrato.id,
        tipo_documento: 'contrato_prestacao',
        autentique_document_id: documentId,
      })

      if (erroInsert) {
        setError(erroInsert.message)
        return
      }

      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar para assinatura.')
    } finally {
      setEnviandoAssinatura(null)
    }
  }

  async function atualizarStatusEnvio(envio: EnvioAssinatura) {
    setVerificandoStatus(envio.id)
    setError(null)

    try {
      const { status, linkDocumento } = await verificarStatusAssinatura(envio.autentique_document_id)

      const { error: erroUpdate } = await supabase
        .from('envios_assinatura')
        .update({ status, link_documento: linkDocumento })
        .eq('id', envio.id)

      if (erroUpdate) {
        setError(erroUpdate.message)
        return
      }

      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao verificar status.')
    } finally {
      setVerificandoStatus(null)
    }
  }

  if (loading) return <p>Carregando...</p>
  if (error) return <p className="error-text">Erro: {error}</p>
  if (!prestador) return <p>Prestador não encontrado.</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1>{prestador.razao_social}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/prestadores/${id}/editar`}>
            <button type="button">Editar</button>
          </Link>
          <button type="button" onClick={() => navigate('/prestadores')}>
            Voltar
          </button>
        </div>
      </div>

      <span className="badge">{prestador.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>

      <section style={{ marginTop: 24 }}>
        <h2>Dados do prestador</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
          <dt style={{ color: 'var(--text-muted)' }}>CNPJ</dt>
          <dd style={{ margin: 0 }}>{formatarCnpj(prestador.cnpj)}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Responsável</dt>
          <dd style={{ margin: 0 }}>{prestador.responsavel_nome ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Endereço</dt>
          <dd style={{ margin: 0 }}>{prestador.endereco ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Telefone</dt>
          <dd style={{ margin: 0 }}>{prestador.telefone ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>E-mail</dt>
          <dd style={{ margin: 0 }}>{prestador.email ?? '—'}</dd>
        </dl>
      </section>

      <section style={{ marginTop: 24, marginBottom: 24 }}>
        <h2>Contratos de empreitada</h2>
        {contratos.length === 0 && <p>Nenhum contrato cadastrado ainda.</p>}
        {contratos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Escopo</th>
                <th>Valor total</th>
                <th>Prazo</th>
                <th>Obra</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td style={{ maxWidth: 280 }}>{c.escopo_servico}</td>
                  <td>{c.valor_total != null ? `R$ ${c.valor_total.toFixed(2)}` : '—'}</td>
                  <td>{c.prazo_dias != null ? `${c.prazo_dias} dias` : '—'}</td>
                  <td>{obras.find((o) => o.id === c.obra_id)?.nome ?? '—'}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" disabled={gerandoPdf !== null} onClick={() => gerarPdfContrato(c)}>
                      {gerandoPdf === c.id ? 'Gerando...' : 'Baixar PDF'}
                    </button>
                    <button type="button" disabled={enviandoAssinatura !== null} onClick={() => enviarAssinaturaContrato(c)}>
                      {enviandoAssinatura === c.id ? 'Enviando...' : 'Enviar p/ assinatura'}
                    </button>
                    <button type="button" className="danger" onClick={() => removerContrato(c.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={adicionarContrato} style={{ marginTop: 16, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2 style={{ fontSize: 16 }}>Novo contrato</h2>

          <label htmlFor="escopo">Escopo do serviço</label>
          <textarea
            id="escopo"
            rows={3}
            value={escopoServico}
            onChange={(e) => setEscopoServico(e.target.value)}
            required
          />

          <div className="form-row">
            <div>
              <label htmlFor="valor_total">Valor total (R$)</label>
              <input
                id="valor_total"
                type="number"
                step="0.01"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="prazo_dias">Prazo (dias)</label>
              <input id="prazo_dias" type="number" value={prazoDias} onChange={(e) => setPrazoDias(e.target.value)} />
            </div>
          </div>

          <label htmlFor="forma_pagamento">Forma de pagamento</label>
          <input
            id="forma_pagamento"
            placeholder="Ex.: medições quinzenais de R$ X/m²"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
          />

          <div className="form-row">
            <div>
              <label htmlFor="data_inicio">Data de início</label>
              <input id="data_inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <label htmlFor="obra_id">Obra</label>
              <select id="obra_id" value={obraId} onChange={(e) => setObraId(e.target.value)}>
                <option value="">Sem obra vinculada</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="local_assinatura">Local de assinatura</label>
              <input
                id="local_assinatura"
                placeholder="Ex.: Barueri"
                value={localAssinatura}
                onChange={(e) => setLocalAssinatura(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="data_assinatura">Data de assinatura</label>
              <input
                id="data_assinatura"
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div style={{ marginTop: 8 }}>
            <button type="submit" className="primary" disabled={salvandoContrato}>
              {salvandoContrato ? 'Salvando...' : 'Adicionar contrato'}
            </button>
          </div>
        </form>
      </section>

      {envios.length > 0 && (
        <section style={{ marginTop: 24, marginBottom: 24 }}>
          <h2>Histórico de assinaturas</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Enviado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {envios.map((envio) => (
                <tr key={envio.id}>
                  <td>
                    <span className="badge">{statusAssinaturaLabel[envio.status]}</span>
                  </td>
                  <td>{formatarData(envio.created_at)}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button type="button" disabled={verificandoStatus !== null} onClick={() => atualizarStatusEnvio(envio)}>
                      {verificandoStatus === envio.id ? 'Verificando...' : 'Verificar status'}
                    </button>
                    {envio.link_documento && (
                      <a href={envio.link_documento} target="_blank" rel="noreferrer">
                        Baixar assinado
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
