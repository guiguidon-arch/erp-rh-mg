import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/Layout'
import FuncionariosList from './pages/funcionarios/FuncionariosList'
import FuncionarioForm from './pages/funcionarios/FuncionarioForm'
import FuncionarioDetalhes from './pages/funcionarios/FuncionarioDetalhes'
import ObrasList from './pages/obras/ObrasList'
import ObraForm from './pages/obras/ObraForm'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/funcionarios" replace />} />
                <Route path="/funcionarios" element={<FuncionariosList />} />
                <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
                <Route path="/funcionarios/:id" element={<FuncionarioDetalhes />} />
                <Route path="/funcionarios/:id/editar" element={<FuncionarioForm />} />
                <Route path="/obras" element={<ObrasList />} />
                <Route path="/obras/nova" element={<ObraForm />} />
                <Route path="/obras/:id/editar" element={<ObraForm />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
