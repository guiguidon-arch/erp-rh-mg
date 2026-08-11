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
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <img
              src="/logo.png"
              alt=""
              style={{ height: 32, width: 'auto' }}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <strong style={{ fontSize: 15, letterSpacing: 0.2 }}>ERP RH</strong>
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <NavLink to="/funcionarios" style={linkStyle}>
              Funcionários
            </NavLink>
            <NavLink to="/obras" style={linkStyle}>
              Obras
            </NavLink>
            <NavLink to="/prestadores" style={linkStyle}>
              Prestadores
            </NavLink>
          </div>
        </nav>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</span>
          <button type="button" onClick={() => signOut()}>
            Sair
          </button>
        </div>
      </header>
      <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="card" style={{ padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
