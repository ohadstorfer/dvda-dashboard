import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <LoginScreen />
  return <Dashboard userId={session.user.id} />
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
