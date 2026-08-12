import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SESSAO_EXPIRADA_KEY } from '../lib/supabase'

function traduzirErro(mensagem: string): string {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (mensagem.includes('Email not confirmed')) return 'Este e-mail ainda não foi confirmado. Confirme antes de entrar.'
  if (mensagem.toLowerCase().includes('fetch')) return 'Não foi possível conectar ao servidor. Verifique sua internet.'
  return mensagem
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [sessaoExpirada] = useState(() => {
    const expirou = sessionStorage.getItem(SESSAO_EXPIRADA_KEY) === '1'
    if (expirou) sessionStorage.removeItem(SESSAO_EXPIRADA_KEY)
    return expirou
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await signIn(email, password)

    setSubmitting(false)

    if (signInError) {
      setError(traduzirErro(signInError))
      return
    }

    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12, padding: 32 }}
      >
        <img
          src="/logo.png"
          alt=""
          style={{ height: 48, width: 'auto', margin: '0 auto 12px' }}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <h1 style={{ marginBottom: 8, fontSize: 22, textAlign: 'center' }}>ERP RH</h1>

        {sessaoExpirada && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            Sua sessão expirou. Faça login novamente.
          </p>
        )}

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="primary" disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
