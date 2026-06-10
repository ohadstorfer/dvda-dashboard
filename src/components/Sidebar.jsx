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
          <span>→</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
