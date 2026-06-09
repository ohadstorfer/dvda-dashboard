import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts(ts => [...ts, { id, msg }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2400)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </ToastContext.Provider>
  )
}
