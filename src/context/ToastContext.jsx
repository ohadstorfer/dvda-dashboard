import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Set())

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts(ts => [...ts, { id, msg }])
    const tid = setTimeout(() => {
      timers.current.delete(tid)
      setToasts(ts => ts.filter(t => t.id !== id))
    }, 2400)
    timers.current.add(tid)
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </ToastContext.Provider>
  )
}
