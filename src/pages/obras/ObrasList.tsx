import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Obra } from '../../lib/types'

const statusLabel: Record<Obra['status'], string> = {
  ativa: 'Ativa',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

export default function ObrasList() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase.from('obras').select('*').order('nome')

    if (error) {
      setError(error.message)
    } else {
      setObras(data)
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Obras</h1>
        <Link to="/obras/nova">
          <button type="button" className="primary">
            + Nova obra
          </button>
        </Link>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-text">Erro ao carregar obras: {error}</p>}

      {!loading && !error && obras.length === 0 && <p>Nenhuma obra cadastrada ainda.</p>}

      {!loading && obras.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id}>
                <td>{obra.nome}</td>
                <td>{obra.endereco ?? '—'}</td>
                <td>
                  <span className="badge">{statusLabel[obra.status]}</span>
                </td>
                <td>
                  <Link to={`/obras/${obra.id}/editar`}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
