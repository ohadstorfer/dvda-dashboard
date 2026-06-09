import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ERROR_MESSAGES = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'User already registered': 'Ya existe una cuenta con ese email',
}

export default function LoginScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setBusy(true)
    const { data, error: err } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (err) {
      setError(ERROR_MESSAGES[err.message] || 'Error: ' + err.message)
    } else if (mode === 'signup' && !data.session) {
      // Fallback if email confirmation is enabled on the Supabase project
      setInfo('Cuenta creada — revisá tu email para confirmarla')
    }
    // On success with a session, AuthContext picks it up and the app renders
  }

  function switchMode(m) { setMode(m); setError(''); setInfo('') }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">Proyectos</div>
        <div className="auth-sub">gestor personal</div>
        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input id="password" className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
        <div className="auth-toggle">
          {mode === 'login'
            ? <>¿No tenés cuenta? <button type="button" className="auth-link" onClick={() => switchMode('signup')}>Creá una</button></>
            : <>¿Ya tenés cuenta? <button type="button" className="auth-link" onClick={() => switchMode('login')}>Iniciá sesión</button></>}
        </div>
      </form>
    </div>
  )
}
