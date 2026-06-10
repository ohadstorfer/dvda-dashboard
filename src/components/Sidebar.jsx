import { useRef } from 'react'
import { getCounts } from '../lib/logic'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

export default function Sidebar({ projects, view, detailOpen, onSetView, onExport, onImportFile, onNavigate }) {
  const counts = getCounts(projects)
  const fileRef = useRef(null)
  const toast = useToast()

  const navItem = (key, icon, label) => (
    <div className={'nav-item' + (view === key && !detailOpen ? ' active' : '')} onClick={() => { onSetView(key); onNavigate?.() }}>
      <span className="nav-icon">{icon}</span> {label}
      <span className="nav-count">{counts[key]}</span>
    </div>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">Proyectos</div>
        <div className="logo-sub">gestor personal</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Vistas</div>
        {navItem('all', '⊞', 'Todos')}
        {navItem('obra', '🏗', 'Obras')}
        {navItem('personal', '👤', 'Personal')}
        <div className="nav-section-label" style={{ marginTop: 12 }}>Estado</div>
        {navItem('active', '▶', 'Activos')}
        {navItem('paused', '⏸', 'Pausados')}
        {navItem('done', '✓', 'Finalizados')}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-action" onClick={onExport}>
          <span>⬇</span> Exportar backup
        </button>
        <button className="sidebar-action" onClick={() => fileRef.current.click()}>
          <span>⬆</span> Importar backup
        </button>
        <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={onImportFile} />
        <button className="sidebar-action" onClick={async () => {
          const { error } = await supabase.auth.signOut()
          if (error) toast('Error al cerrar sesión — reintentá')
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
