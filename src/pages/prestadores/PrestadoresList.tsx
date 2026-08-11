import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatarCnpj } from '../../lib/cnpj'
import type { Prestador } from '../../lib/types'

export default function PrestadoresList() {
  const [prestadores, setPrestadores] = useState<Prestador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase.from('prestadores').select('*').order('razao_social')

    if (error) {
      setError(error.message)
    } else {
      setPrestadores(data)
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Prestadores de serviço</h1>
        <Link to="/prestadores/novo">
          <button type="button" className="primary">
            + Novo prestador
          </button>
        </Link>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-text">Erro ao carregar prestadores: {error}</p>}

      {!loading && !error && prestadores.length === 0 && <p>Nenhum prestador cadastrado ainda.</p>}

      {!loading && prestadores.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Razão social</th>
              <th>CNPJ</th>
              <th>Responsável</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prestadores.map((p) => (
              <tr key={p.id}>
                <td>{p.razao_social}</td>
                <td>{formatarCnpj(p.cnpj)}</td>
                <td>{p.responsavel_nome ?? '—'}</td>
                <td>
                  <span className="badge">{p.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td>
                  <Link to={`/prestadores/${p.id}`}>Ver detalhes</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
