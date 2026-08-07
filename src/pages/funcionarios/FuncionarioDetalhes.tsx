import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatarCpf } from '../../lib/cpf'
import { categoriaLabel, statusVencimento } from '../../lib/documentos'
import type {
  CategoriaDocumento,
  Dependente,
  DocumentoFuncionario,
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
  const [historico, setHistorico] = useState<HistoricoFuncionario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [novoDependenteNome, setNovoDependenteNome] = useState('')
  const [novoDependenteParentesco, setNovoDependenteParentesco] = useState('')
  const [novoDependenteNascimento, setNovoDependenteNascimento] = useState('')

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

    const [{ data: func, error: erroFunc }, { data: deps }, { data: docs }, { data: hist }] = await Promise.all([
      supabase.from('funcionarios').select('*, obra:obras(id, nome)').eq('id', id).single(),
      supabase.from('dependentes').select('*').eq('funcionario_id', id).order('nome'),
      supabase.from('documentos_funcionario').select('*').eq('funcionario_id', id).order('created_at', { ascending: false }),
      supabase.from('historico_funcionario').select('*').eq('funcionario_id', id).order('data', { ascending: false }),
    ])

    if (erroFunc) {
      setError(erroFunc.message)
    } else {
      setFuncionario(func as unknown as FuncionarioComObra)
      setDependentes(deps ?? [])
      setDocumentos(docs ?? [])
      setHistorico(hist ?? [])
    }
    setLoading(false)
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
    })

    if (error) {
      setError(error.message)
      return
    }

    setNovoDependenteNome('')
    setNovoDependenteParentesco('')
    setNovoDependenteNascimento('')
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
        <h2>Dados pessoais</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8 }}>
          <dt style={{ color: 'var(--text-muted)' }}>CPF</dt>
          <dd style={{ margin: 0 }}>{formatarCpf(funcionario.cpf)}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>RG</dt>
          <dd style={{ margin: 0 }}>{funcionario.rg ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Nascimento</dt>
          <dd style={{ margin: 0 }}>{funcionario.data_nascimento ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Telefone</dt>
          <dd style={{ margin: 0 }}>{funcionario.telefone ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>E-mail</dt>
          <dd style={{ margin: 0 }}>{funcionario.email ?? '—'}</dd>
          <dt style={{ color: 'var(--text-muted)' }}>Endereço</dt>
          <dd style={{ margin: 0 }}>{funcionario.endereco ?? '—'}</dd>
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
          <dd style={{ margin: 0 }}>{funcionario.data_admissao ?? '—'}</dd>
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
                <th>Nascimento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dependentes.map((dep) => (
                <tr key={dep.id}>
                  <td>{dep.nome}</td>
                  <td>{dep.parentesco ?? '—'}</td>
                  <td>{dep.data_nascimento ?? '—'}</td>
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
            <label htmlFor="dep-nascimento">Nascimento</label>
            <input
              id="dep-nascimento"
              type="date"
              value={novoDependenteNascimento}
              onChange={(e) => setNovoDependenteNascimento(e.target.value)}
            />
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
                      {doc.data_vencimento ?? '—'}{' '}
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
                  <td>{h.data}</td>
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
