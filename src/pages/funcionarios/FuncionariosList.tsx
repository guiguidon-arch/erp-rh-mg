import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { FuncionarioComObra, Obra, StatusFuncionario } from '../../lib/types'

const statusLabel: Record<StatusFuncionario, string> = {
  ativo: 'Ativo',
  afastado: 'Afastado',
  ferias: 'Férias',
  desligado: 'Desligado',
}

export default function FuncionariosList() {
  const [funcionarios, setFuncionarios] = useState<FuncionarioComObra[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtroStatus, setFiltroStatus] = useState<StatusFuncionario | ''>('')
  const [filtroObra, setFiltroObra] = useState<string>('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    supabase
      .from('obras')
      .select('*')
      .order('nome')
      .then(({ data }) => setObras(data ?? []))
  }, [])

  useEffect(() => {
    carregar()
  }, [filtroStatus, filtroObra])

  async function carregar() {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('funcionarios')
      .select('*, obra:obras(id, nome)')
      .order('nome')

    if (filtroStatus) query = query.eq('status', filtroStatus)
    if (filtroObra) query = query.eq('obra_id', filtroObra)

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setFuncionarios(data as unknown as FuncionarioComObra[])
    }
    setLoading(false)
  }

  const funcionariosFiltrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) || f.cpf.includes(busca)
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Funcionários</h1>
        <Link to="/funcionarios/novo">
          <button type="button" className="primary">
            + Novo funcionário
          </button>
        </Link>
      </div>

      <div className="form-row" style={{ marginBottom: 16 }}>
        <input
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusFuncionario | '')}>
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="afastado">Afastado</option>
          <option value="ferias">Férias</option>
          <option value="desligado">Desligado</option>
        </select>
        <select value={filtroObra} onChange={(e) => setFiltroObra(e.target.value)}>
          <option value="">Todas as obras</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nome}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-text">Erro ao carregar funcionários: {error}</p>}

      {!loading && !error && funcionariosFiltrados.length === 0 && <p>Nenhum funcionário encontrado.</p>}

      {!loading && funcionariosFiltrados.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Obra</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {funcionariosFiltrados.map((f) => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{f.cargo ?? '—'}</td>
                <td>{f.obra?.nome ?? '—'}</td>
                <td>
                  <span className="badge">{statusLabel[f.status]}</span>
                </td>
                <td>
                  <Link to={`/funcionarios/${f.id}`}>Ver detalhes</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
