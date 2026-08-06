import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatarCpf } from '../../lib/cpf'
import type { Dependente, FuncionarioComObra, HistoricoFuncionario, StatusFuncionario } from '../../lib/types'

const statusLabel: Record<StatusFuncionario, string> = {
  ativo: 'Ativo',
  afastado: 'Afastado',
  ferias: 'Férias',
  desligado: 'Desligado',
}

const tipoHistoricoLabel: Record<HistoricoFuncionario['tipo'], string> = {
  promocao: 'Mudança de cargo',
  reajuste_salarial: 'Reajuste salarial',
  mudanca_obra: 'Mudança de obra',
  mudanca_status: 'Mudança de status',
  outro: 'Outro',
}

export default function FuncionarioDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [funcionario, setFuncionario] = useState<FuncionarioComObra | null>(null)
  const [dependentes, setDependentes] = useState<Dependente[]>([])
  const [historico, setHistorico] = useState<HistoricoFuncionario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [novoDependenteNome, setNovoDependenteNome] = useState('')
  const [novoDependenteParentesco, setNovoDependenteParentesco] = useState('')
  const [novoDependenteNascimento, setNovoDependenteNascimento] = useState('')

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setLoading(true)
    setError(null)

    const [{ data: func, error: erroFunc }, { data: deps }, { data: hist }] = await Promise.all([
      supabase.from('funcionarios').select('*, obra:obras(id, nome)').eq('id', id).single(),
      supabase.from('dependentes').select('*').eq('funcionario_id', id).order('nome'),
      supabase.from('historico_funcionario').select('*').eq('funcionario_id', id).order('data', { ascending: false }),
    ])

    if (erroFunc) {
      setError(erroFunc.message)
    } else {
      setFuncionario(func as unknown as FuncionarioComObra)
      setDependentes(deps ?? [])
      setHistorico(hist ?? [])
    }
    setLoading(false)
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
          <dt style={{ color: 'var(--text-muted)' }}>Cargo</dt>
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
            <input
              id="dep-parentesco"
              placeholder="Ex.: Filho(a), cônjuge"
              value={novoDependenteParentesco}
              onChange={(e) => setNovoDependenteParentesco(e.target.value)}
            />
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
