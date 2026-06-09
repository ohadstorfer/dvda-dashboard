import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginScreen from './components/LoginScreen'

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <LoginScreen />
  // Replaced with <Dashboard userId={session.user.id} /> in Task 8
  return (
    <div className="layout">
      <main className="main" style={{ marginLeft: 0, maxWidth: '100%' }}>
        <div className="page-title">Sesión iniciada: {session.user.email}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  )
}
