import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, signOut } = useAuth()

  return (
    <div style={{ padding: 24 }}>
      <h1>ERP RH</h1>
      <p>Logado como: {user?.email}</p>
      <button type="button" onClick={() => signOut()}>
        Sair
      </button>
    </div>
  )
}
