import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatarCpf } from '../../lib/cpf'
import { formatarData } from '../../lib/formatters'
import { categoriaLabel, statusVencimento } from '../../lib/documentos'
import { EPIS_PADRAO } from '../../lib/episPadrao'
import { gerarEAbrirPdf } from '../../lib/gerarPdf'
import { FichaRegistro } from '../../pdf/FichaRegistro'
import { ContratoExperiencia } from '../../pdf/ContratoExperiencia'
import { ContratoPrestacaoServicosPF } from '../../pdf/ContratoPrestacaoServicosPF'
import { FichaEpi } from '../../pdf/FichaEpi'
import type {
  CategoriaDocumento,
  Dependente,
  DocumentoFuncionario,
  EpiFuncionario,
  FuncionarioComObra,
  HistoricoFuncionario,
  StatusFuncionario,
} from '../../lib/types'

const statusLabel: Record<StatusFuncionario, string> = {
  ativo: 'Ativo',
  afastado: 'Afastado',
  ferias: 'Férias',
  desligado: 'Desligado',
}

const tipoHistoricoLabel: Record<HistoricoFuncionario['tipo'], string> = {
  promocao: 'Mudança de função',
  reajuste_salarial: 'Reajuste salarial',
  mudanca_obra: 'Mudança de obra',
  mudanca_status: 'Mudança de status',
  mudanca_tipo_contrato: 'Mudança de tipo de contrato',
  outro: 'Outro',
}

export default function FuncionarioDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [funcionario, setFuncionario] = useState<FuncionarioComObra | null>(null)
  const [dependentes, setDependentes] = useState<Dependente[]>([])
  const [documentos, setDocumentos] = useState<DocumentoFuncionario[]>([])
  const [epis, setEpis] = useState<EpiFuncionario[]>([])
  const [historico, setHistorico] = useState<HistoricoFuncionario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gerandoPdf, setGerandoPdf] = useState<string | null>(null)

  const [novoEpiTipo, setNovoEpiTipo] = useState('')
  const [novoEpiQuantidade, setNovoEpiQuantidade] = useState('1')
  const [novoEpiCa, setNovoEpiCa] = useState('')
  const [novoEpiFabricante, setNovoEpiFabricante] = useState('')
  const [novoEpiEntrega, setNovoEpiEntrega] = useState(() => new Date().toISOString().slice(0, 10))
  const [adicionandoEpisPadrao, setAdicionandoEpisPadrao] = useState(false)

  const [novoDependenteNome, setNovoDependenteNome] = useState('')
  const [novoDependenteParentesco, setNovoDependenteParentesco] = useState('')
  const [novoDependenteNascimento, setNovoDependenteNascimento] = useState('')
  const [novoDependenteCpf, setNovoDependenteCpf] = useState('')
  const [novoDependenteIr, setNovoDependenteIr] = useState<'' | 'sim' | 'nao'>('')

  const [categoriaUpload, setCategoriaUpload] = useState<CategoriaDocumento | ''>('')
  const [vencimentoUpload, setVencimentoUpload] = useState('')
  const [enviando, setEnviando] = useState(false)
  const arquivoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setLoading(true)
    setError(null)

    const [{ data: func, error: erroFunc }, { data: deps }, { data: docs }, { data: episData }, { data: hist }] = await Promise.all([
      supabase.from('funcionarios').select('*, obra:obras(id, nome)').eq('id', id).single(),
      supabase.from('dependentes').select('*').eq('funcionario_id', id).order('nome'),
      supabase.from('documentos_funcionario').select('*').eq('funcionario_id', id).order('created_at', { ascending: false }),
      supabase.from('epis_funcionario').select('*').eq('funcionario_id', id).order('data_entrega', { ascending: false }),
      supabase.from('historico_funcionario').select('*').eq('funcionario_id', id).order('data', { ascending: false }),
    ])

    if (erroFunc) {
      setError(erroFunc.message)
    } else {
      setFuncionario(func as unknown as FuncionarioComObra)
      setDependentes(deps ?? [])
      setDocumentos(docs ?? [])
      setEpis(episData ?? [])
      setHistorico(hist ?? [])
    }
    setLoading(false)
  }

  async function adicionarEpi(event: FormEvent) {
    event.preventDefault()
    if (!novoEpiTipo.trim()) return

    const { error } = await supabase.from('epis_funcionario').insert({
      funcionario_id: id,
      tipo_epi: novoEpiTipo,
      quantidade: Number(novoEpiQuantidade) || 1,
      numero_ca: novoEpiCa || null,
      fabricante: novoEpiFabricante || null,
      data_entrega: novoEpiEntrega,
    })

    if (error) {
      setError(error.message)
      return
    }

    setNovoEpiTipo('')
    setNovoEpiQuantidade('1')
    setNovoEpiCa('')
    setNovoEpiFabricante('')
    setNovoEpiEntrega(new Date().toISOString().slice(0, 10))
    carregar()
  }

  async function removerEpi(epiId: string) {
    await supabase.from('epis_funcionario').delete().eq('id', epiId)
    carregar()
  }

  async function adicionarEpisPadrao() {
    setAdicionandoEpisPadrao(true)

    const hoje = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('epis_funcionario').insert(
      EPIS_PADRAO.map((epi) => ({
        funcionario_id: id,
        tipo_epi: epi.tipo_epi,
        quantidade: epi.quantidade,
        numero_ca: epi.numero_ca,
        data_entrega: hoje,
      }))
    )

    setAdicionandoEpisPadrao(false)

    if (error) {
      setError(error.message)
      return
    }

    carregar()
  }

  async function gerarPdf(tipo: 'ficha_registro' | 'contrato_experiencia' | 'contrato_prestacao' | 'ficha_epi') {
    if (!funcionario) return
    setGerandoPdf(tipo)
    try {
      if (tipo === 'ficha_registro') {
        await gerarEAbrirPdf(<FichaRegistro funcionario={funcionario} dependentes={dependentes} />, `ficha-registro-${funcionario.nome}.pdf`)
      } else if (tipo === 'contrato_experiencia') {
        await gerarEAbrirPdf(<ContratoExperiencia funcionario={funcionario} />, `contrato-experiencia-${funcionario.nome}.pdf`)
      } else if (tipo === 'contrato_prestacao') {
        await gerarEAbrirPdf(<ContratoPrestacaoServicosPF funcionario={funcionario} />, `contrato-prestacao-servicos-${funcionario.nome}.pdf`)
      } else {
        await gerarEAbrirPdf(<FichaEpi funcionario={funcionario} epis={epis} />, `ficha-epi-${funcionario.nome}.pdf`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar PDF.')
    } finally {
      setGerandoPdf(null)
    }
  }

  async function enviarDocumento(event: FormEvent) {
    event.preventDefault()
    const arquivo = arquivoInputRef.current?.files?.[0]
    if (!arquivo || !categoriaUpload) return

    setEnviando(true)
    setError(null)

    const caminho = `${id}/${Date.now()}-${arquivo.name}`

    const { error: erroUpload } = await supabase.storage.from('documentos-funcionarios').upload(caminho, arquivo)

    if (erroUpload) {
      setEnviando(false)
      setError(erroUpload.message)
      return
    }

    const { error: erroInsert } = await supabase.from('documentos_funcionario').insert({
      funcionario_id: id,
      categoria: categoriaUpload,
      nome_arquivo: arquivo.name,
      storage_path: caminho,
      data_vencimento: vencimentoUpload || null,
    })

    setEnviando(false)

    if (erroInsert) {
      setError(erroInsert.message)
      return
    }

    setCategoriaUpload('')
    setVencimentoUpload('')
    if (arquivoInputRef.current) arquivoInputRef.current.value = ''
    carregar()
  }

  async function baixarDocumento(doc: DocumentoFuncionario) {
    const { data, error } = await supabase.storage
      .from('documentos-funcionarios')
      .createSignedUrl(doc.storage_path, 60)

    if (error || !data) {
      setError(error?.message ?? 'Não foi possível gerar o link de download.')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  async function removerDocumento(doc: DocumentoFuncionario) {
    await supabase.storage.from('documentos-funcionarios').remove([doc.storage_path])
    await supabase.from('documentos_funcionario').delete().eq('id', doc.id)
    carregar()
  }

  async function adicionarDependente(event: FormEvent) {
    event.preventDefault()
    if (!novoDependenteNome.trim()) return

    const { error } = await supabase.from('dependentes').insert({
      funcionario_id: id,
      nome: novoDependenteNome,
      parentesco: novoDependenteParentesco || null,
      data_nascimento: novoDependenteNascimento || null,
      cpf: novoDependenteCpf.replace(/\D/g, '') || null,
      dependente_ir: novoDependenteIr === '' ? null : novoDependenteIr === 'sim',
    })

    if (error) {
      setError(error.message)
      return
    }

    setNovoDependenteNome('')
    setNovoDependenteParentesco('')
    setNovoDependenteNascimento('')
    setNovoDependenteCpf('')
    setNovoDependenteIr('')
    carregar()
  }

  async function removerDependente(dependenteId: string) {
    await supabase.from('dependentes').delete().eq('id', dependenteId)
    carregar()
  }

  if (loading) return <p>Carregando...</p>
  if (error) return <p className="error-text">Erro: {error}</p>
  if (!funcionario) return <p>Funcionário não encontrado.</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1>{funcionario.nome}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/funcionarios/${id}/editar`}>
            <button type="button">Editar</button>
          </Link>
          <button type="button" onClick={() => navigate('/funcionarios')}>
            Voltar
          </button>
        </div>
      </div>

      <span className="badge">{statusLabel[funcionario.status]}</span>

      <section style={{ marginTop: 24 }}>
        <h2>Documentos para assinatura</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" disabled={gerandoPdf !== null} onClick={() => gerarPdf('ficha_registro')}>
            {gerandoPdf === 'ficha_registro' ? 'Gerando...' : 'Gerar Ficha de Registro (PDF)'}
          </button>
          {funcionario.tipo_contrato !== 'PJ' && funcionario.tipo_contrato !== 'Empreita' && (
            <button type="button" disabled={gerandoPdf !== null} onClick={() => gerarPdf('contrato_experiencia')}>
              {gerandoPdf === 'contrato_experiencia' ? 'Gerando...' : 'Gerar Contrato de Experiência (PDF)'}
            </button>
          )}
          {(funcionario.tipo_contrato === 'PJ' || funcionario.tipo_contrato === 'Empreita') && (
            <button type="button" disabled={gerandoPdf !== null} onClick={() => gerarPdf('contrato_prestacao')}>
              {gerandoPdf === 'contrato_prestacao' ? 'Gerando...' : 'Gerar Contrato de Prestação de Serviços (PDF)'}
            </button>
          )}
          <button type="button" disabled={gerandoPdf !== null} onClick={() => gerarPdf('ficha_epi')}>
            {gerandoPdf === 'ficha_epi' ? 'Gerando...' : 'Gerar Ficha de EPI (PDF)'}
          </button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Dados pessoais</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
          <dt style={{ color: 'var(--text-muted)' }}>CPF</dt>
          <dd style={{ margin: 0 }}>{formatarCpf(funcionario.cpf)}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>RG</dt>
          <dd style={{ margin: 0 }}>
            {funcionario.rg ?? '—'}
            {funcionario.rg_orgao_emissor ? ` — ${funcionario.rg_orgao_emissor}` : ''}
          </dd>
          <dt style={{ color: 'var(--text-muted)' }}>Nacionalidade</dt>
          <dd style={{ margin: 0 }}>{funcionario.nacionalidade ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Nascimento</dt>
          <dd style={{ margin: 0 }}>{formatarData(funcionario.data_nascimento)}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Local de nascimento</dt>
          <dd style={{ margin: 0 }}>{funcionario.local_nascimento ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Telefone</dt>
          <dd style={{ margin: 0 }}>{funcionario.telefone ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>E-mail</dt>
          <dd style={{ margin: 0 }}>{funcionario.email ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Endereço</dt>
          <dd style={{ margin: 0 }}>{funcionario.endereco ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Estado civil</dt>
          <dd style={{ margin: 0 }}>{funcionario.estado_civil ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Sexo</dt>
          <dd style={{ margin: 0 }}>{funcionario.sexo ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Raça/Cor</dt>
          <dd style={{ margin: 0 }}>{funcionario.raca_cor ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Escolaridade</dt>
          <dd style={{ margin: 0 }}>{funcionario.escolaridade ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Nome da mãe</dt>
          <dd style={{ margin: 0 }}>{funcionario.nome_mae ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Nome do pai</dt>
          <dd style={{ margin: 0 }}>{funcionario.nome_pai ?? '—'}</dd>
        </dl>
      </section>

      {(funcionario.estado_civil === 'Casado(a)' || funcionario.estado_civil === 'União Estável') && (
        <section style={{ marginTop: 24 }}>
          <h2>Cônjuge</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
            <dt style={{ color: 'var(--text-muted)' }}>CPF</dt>
            <dd style={{ margin: 0 }}>{funcionario.conjuge_cpf ? formatarCpf(funcionario.conjuge_cpf) : '—'}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>Nascimento</dt>
            <dd style={{ margin: 0 }}>{formatarData(funcionario.conjuge_data_nascimento)}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>Trabalha?</dt>
            <dd style={{ margin: 0 }}>{funcionario.conjuge_trabalha == null ? '—' : funcionario.conjuge_trabalha ? 'Sim' : 'Não'}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>Dependente de IR?</dt>
            <dd style={{ margin: 0 }}>
              {funcionario.conjuge_dependente_ir == null ? '—' : funcionario.conjuge_dependente_ir ? 'Sim' : 'Não'}
            </dd>
          </dl>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Documentos e informações</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
          <dt style={{ color: 'var(--text-muted)' }}>CTPS</dt>
          <dd style={{ margin: 0 }}>
            {funcionario.ctps_numero
              ? `${funcionario.ctps_numero}${funcionario.ctps_serie ? ' série ' + funcionario.ctps_serie : ''}${funcionario.ctps_uf ? '/' + funcionario.ctps_uf : ''}`
              : '—'}
          </dd>
          <dt style={{ color: 'var(--text-muted)' }}>PIS/PASEP</dt>
          <dd style={{ margin: 0 }}>{funcionario.pis ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Título de eleitor</dt>
          <dd style={{ margin: 0 }}>{funcionario.titulo_eleitor ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>CNH</dt>
          <dd style={{ margin: 0 }}>
            {funcionario.cnh_numero
              ? `${funcionario.cnh_numero}${funcionario.cnh_categoria ? ' cat. ' + funcionario.cnh_categoria : ''} — validade ${formatarData(funcionario.cnh_data_vencimento)}`
              : '—'}
          </dd>
        </dl>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Dados bancários e benefícios</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
          <dt style={{ color: 'var(--text-muted)' }}>Banco</dt>
          <dd style={{ margin: 0 }}>{funcionario.banco ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Agência / Conta</dt>
          <dd style={{ margin: 0 }}>
            {funcionario.agencia || funcionario.conta ? `${funcionario.agencia ?? '—'} / ${funcionario.conta ?? '—'}` : '—'}
          </dd>
          <dt style={{ color: 'var(--text-muted)' }}>Tipo de conta</dt>
          <dd style={{ margin: 0 }}>
            {funcionario.tipo_conta === 'corrente' && 'Conta corrente'}
            {funcionario.tipo_conta === 'poupanca' && 'Conta poupança'}
            {funcionario.tipo_conta === 'salario' && 'Conta salário'}
            {!funcionario.tipo_conta && '—'}
          </dd>
          <dt style={{ color: 'var(--text-muted)' }}>Vale-transporte</dt>
          <dd style={{ margin: 0 }}>
            {funcionario.vale_transporte == null ? '—' : funcionario.vale_transporte ? `Sim (${funcionario.tipo_transporte ?? 'tipo não informado'})` : 'Não'}
          </dd>
        </dl>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Dados contratuais</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
          <dt style={{ color: 'var(--text-muted)' }}>Função</dt>
          <dd style={{ margin: 0 }}>{funcionario.cargo ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Departamento</dt>
          <dd style={{ margin: 0 }}>{funcionario.departamento ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Salário</dt>
          <dd style={{ margin: 0 }}>{funcionario.salario != null ? `R$ ${funcionario.salario.toFixed(2)}` : '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Admissão</dt>
          <dd style={{ margin: 0 }}>{formatarData(funcionario.data_admissao)}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Tipo de contrato</dt>
          <dd style={{ margin: 0 }}>{funcionario.tipo_contrato ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Jornada</dt>
          <dd style={{ margin: 0 }}>{funcionario.jornada ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Obra atual</dt>
          <dd style={{ margin: 0 }}>{funcionario.obra?.nome ?? 'Sem obra vinculada'}</dd>
        </dl>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Dependentes</h2>
        {dependentes.length === 0 && <p>Nenhum dependente cadastrado.</p>}
        {dependentes.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Parentesco</th>
                <th>CPF</th>
                <th>Nascimento</th>
                <th>Dep. IR</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dependentes.map((dep) => (
                <tr key={dep.id}>
                  <td>{dep.nome}</td>
                  <td>{dep.parentesco ?? '—'}</td>
                  <td>{dep.cpf ? formatarCpf(dep.cpf) : '—'}</td>
                  <td>{formatarData(dep.data_nascimento)}</td>
                  <td>{dep.dependente_ir == null ? '—' : dep.dependente_ir ? 'Sim' : 'Não'}</td>
                  <td>
                    <button type="button" className="danger" onClick={() => removerDependente(dep.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={adicionarDependente} className="form-row" style={{ marginTop: 12, alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="dep-nome">Nome</label>
            <input id="dep-nome" value={novoDependenteNome} onChange={(e) => setNovoDependenteNome(e.target.value)} />
          </div>
          <div>
            <label htmlFor="dep-parentesco">Parentesco</label>
            <select
              id="dep-parentesco"
              value={novoDependenteParentesco}
              onChange={(e) => setNovoDependenteParentesco(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Cônjuge">Cônjuge</option>
              <option value="Companheiro(a)">Companheiro(a)</option>
              <option value="Filho(a)">Filho(a)</option>
              <option value="Enteado(a)">Enteado(a)</option>
              <option value="Pai">Pai</option>
              <option value="Mãe">Mãe</option>
              <option value="Irmão(a)">Irmão(a)</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="dep-cpf">CPF</label>
            <input id="dep-cpf" value={novoDependenteCpf} onChange={(e) => setNovoDependenteCpf(e.target.value)} />
          </div>
          <div>
            <label htmlFor="dep-nascimento">Nascimento</label>
            <input
              id="dep-nascimento"
              type="date"
              value={novoDependenteNascimento}
              onChange={(e) => setNovoDependenteNascimento(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="dep-ir">Dependente de IR?</label>
            <select id="dep-ir" value={novoDependenteIr} onChange={(e) => setNovoDependenteIr(e.target.value as '' | 'sim' | 'nao')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <button type="submit">Adicionar</button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Documentos</h2>
        {documentos.length === 0 && <p>Nenhum documento anexado ainda.</p>}
        {documentos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Arquivo</th>
                <th>Vencimento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => {
                const vencimento = statusVencimento(doc.data_vencimento)
                return (
                  <tr key={doc.id}>
                    <td>{categoriaLabel[doc.categoria]}</td>
                    <td>{doc.nome_arquivo}</td>
                    <td>
                      {formatarData(doc.data_vencimento)}{' '}
                      {vencimento === 'vencido' && (
                        <span className="badge" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          Vencido
                        </span>
                      )}
                      {vencimento === 'vencendo' && <span className="badge">Vence em breve</span>}
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => baixarDocumento(doc)}>
                        Baixar
                      </button>
                      <button type="button" className="danger" onClick={() => removerDocumento(doc)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <form onSubmit={enviarDocumento} className="form-row" style={{ marginTop: 12, alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="doc-arquivo">Arquivo</label>
            <input id="doc-arquivo" type="file" ref={arquivoInputRef} required />
          </div>
          <div>
            <label htmlFor="doc-categoria">Categoria</label>
            <select
              id="doc-categoria"
              value={categoriaUpload}
              onChange={(e) => setCategoriaUpload(e.target.value as CategoriaDocumento)}
              required
            >
              <option value="">Selecione...</option>
              {Object.entries(categoriaLabel).map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="doc-vencimento">Vencimento (opcional)</label>
            <input
              id="doc-vencimento"
              type="date"
              value={vencimentoUpload}
              onChange={(e) => setVencimentoUpload(e.target.value)}
            />
          </div>
          <button type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Anexar'}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>EPIs entregues</h2>
        {epis.length === 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ marginBottom: 8 }}>Nenhum EPI cadastrado ainda.</p>
            <button type="button" disabled={adicionandoEpisPadrao} onClick={adicionarEpisPadrao}>
              {adicionandoEpisPadrao ? 'Adicionando...' : 'Usar lista padrão de EPIs'}
            </button>
          </div>
        )}
        {epis.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Qtd.</th>
                <th>Tipo</th>
                <th>Nº CA</th>
                <th>Entrega</th>
                <th>Devolução</th>
                <th>Fabricante</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {epis.map((epi) => (
                <tr key={epi.id}>
                  <td>{epi.quantidade}</td>
                  <td>{epi.tipo_epi}</td>
                  <td>{epi.numero_ca ?? '—'}</td>
                  <td>{formatarData(epi.data_entrega)}</td>
                  <td>{formatarData(epi.data_devolucao)}</td>
                  <td>{epi.fabricante ?? '—'}</td>
                  <td>
                    <button type="button" className="danger" onClick={() => removerEpi(epi.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={adicionarEpi} className="form-row" style={{ marginTop: 12, alignItems: 'flex-end' }}>
          <div style={{ maxWidth: 70 }}>
            <label htmlFor="epi-qtd">Qtd.</label>
            <input
              id="epi-qtd"
              type="number"
              min="1"
              value={novoEpiQuantidade}
              onChange={(e) => setNovoEpiQuantidade(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="epi-tipo">Tipo de EPI</label>
            <input
              id="epi-tipo"
              placeholder="Ex.: Capacete, luvas..."
              value={novoEpiTipo}
              onChange={(e) => setNovoEpiTipo(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="epi-ca">Nº CA</label>
            <input id="epi-ca" value={novoEpiCa} onChange={(e) => setNovoEpiCa(e.target.value)} />
          </div>
          <div>
            <label htmlFor="epi-fabricante">Fabricante</label>
            <input id="epi-fabricante" value={novoEpiFabricante} onChange={(e) => setNovoEpiFabricante(e.target.value)} />
          </div>
          <div>
            <label htmlFor="epi-entrega">Data de entrega</label>
            <input id="epi-entrega" type="date" value={novoEpiEntrega} onChange={(e) => setNovoEpiEntrega(e.target.value)} />
          </div>
          <button type="submit">Adicionar</button>
        </form>
      </section>

      <section style={{ marginTop: 24, marginBottom: 24 }}>
        <h2>Histórico de alterações</h2>
        {historico.length === 0 && <p>Nenhuma alteração registrada ainda.</p>}
        {historico.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>De</th>
                <th>Para</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.id}>
                  <td>{formatarData(h.data)}</td>
                  <td>{tipoHistoricoLabel[h.tipo]}</td>
                  <td>{h.valor_anterior ?? '—'}</td>
                  <td>{h.valor_novo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
