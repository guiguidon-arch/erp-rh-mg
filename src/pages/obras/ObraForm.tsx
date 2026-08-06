import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { StatusObra } from '../../lib/types'

export default function ObraForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [status, setStatus] = useState<StatusObra>('ativa')
  const [loading, setLoading] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    supabase
      .from('obras')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else if (data) {
          setNome(data.nome)
          setEndereco(data.endereco ?? '')
          setStatus(data.status)
        }
        setLoading(false)
      })
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSalvando(true)

    const payload = { nome, endereco: endereco || null, status }

    const { error } = editando
      ? await supabase.from('obras').update(payload).eq('id', id)
      : await supabase.from('obras').insert(payload)

    setSalvando(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/obras')
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>{editando ? 'Editar obra' : 'Nova obra'}</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label htmlFor="nome">Nome da obra</label>
        <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label htmlFor="endereco">Endereço</label>
        <input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />

        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as StatusObra)}>
          <option value="ativa">Ativa</option>
          <option value="pausada">Pausada</option>
          <option value="concluida">Concluída</option>
        </select>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/obras')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
