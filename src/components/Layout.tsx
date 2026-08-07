import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'var(--accent)' : 'inherit',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 400,
  })

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.png" alt="" style={{ height: 28, width: 'auto' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
            <strong>ERP RH</strong>
          </Link>
          <NavLink to="/funcionarios" style={linkStyle}>
            Funcionários
          </NavLink>
          <NavLink to="/obras" style={linkStyle}>
            Obras
          </NavLink>
        </nav>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</span>
          <button type="button" onClick={() => signOut()}>
            Sair
          </button>
        </div>
      </header>
      <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>{children}</main>
    </div>
  )
}
