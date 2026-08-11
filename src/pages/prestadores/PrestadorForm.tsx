import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { cnpjValido, formatarCnpj } from '../../lib/cnpj'
import type { StatusPrestador } from '../../lib/types'

export default function PrestadorForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [razaoSocial, setRazaoSocial] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [responsavelNome, setResponsavelNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<StatusPrestador>('ativo')
  const [loading, setLoading] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    supabase
      .from('prestadores')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else if (data) {
          setRazaoSocial(data.razao_social)
          setCnpj(data.cnpj)
          setResponsavelNome(data.responsavel_nome ?? '')
          setEndereco(data.endereco ?? '')
          setTelefone(data.telefone ?? '')
          setEmail(data.email ?? '')
          setStatus(data.status)
        }
        setLoading(false)
      })
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!cnpjValido(cnpj)) {
      setError('CNPJ inválido. Confira os números digitados.')
      return
    }

    setSalvando(true)

    const payload = {
      razao_social: razaoSocial,
      cnpj: cnpj.replace(/\D/g, ''),
      responsavel_nome: responsavelNome || null,
      endereco: endereco || null,
      telefone: telefone || null,
      email: email || null,
      status,
    }

    const { error, data } = editando
      ? await supabase.from('prestadores').update(payload).eq('id', id).select('id').single()
      : await supabase.from('prestadores').insert(payload).select('id').single()

    setSalvando(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate(`/prestadores/${editando ? id : data.id}`)
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>{editando ? 'Editar prestador' : 'Novo prestador'}</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label htmlFor="razao_social">Razão social</label>
        <input id="razao_social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />

        <label htmlFor="cnpj">CNPJ</label>
        <input id="cnpj" value={formatarCnpj(cnpj)} onChange={(e) => setCnpj(e.target.value)} required />

        <label htmlFor="responsavel_nome">Responsável</label>
        <input id="responsavel_nome" value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} />

        <label htmlFor="endereco">Endereço</label>
        <input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />

        <div className="form-row">
          <div>
            <label htmlFor="telefone">Telefone</label>
            <input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as StatusPrestador)}>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
