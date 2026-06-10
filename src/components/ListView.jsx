import { getFiltered, VIEW_LABELS } from '../lib/logic'
import ProjectCard from './ProjectCard'

export default function ListView({ projects, view, onSelect, onNewProject, onOpenMenu, menuBtnRef }) {
  const ps = getFiltered(projects, view)
  const allTasks = projects.flatMap(p => p.tasks)
  const pending = allTasks.filter(t => !t.done).length
  const done = allTasks.filter(t => t.done).length
  const activeProjs = projects.filter(p => p.status === 'active').length

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button ref={menuBtnRef} className="menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" aria-haspopup="dialog">☰</button>
          <div>
            <div className="page-title">{VIEW_LABELS[view]}</div>
            <div className="page-subtitle">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onNewProject}>+ Nuevo proyecto</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Proyectos activos</div>
          <div className="stat-value">{activeProjs}</div>
          <div className="stat-desc">de {projects.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tareas pendientes</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-desc">sin completar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completadas</div>
          <div className="stat-value">{done}</div>
          <div className="stat-desc">de {allTasks.length} tareas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Progreso global</div>
          <div className="stat-value">{allTasks.length ? Math.round(done / allTasks.length * 100) : 0}%</div>
          <div className="stat-desc">completado</div>
        </div>
      </div>

      <div className="projects-grid">
        {ps.length ? ps.map(p => (
          <ProjectCard key={p.id} project={p} onClick={() => onSelect(p.id)} />
        )) : (
          <div className="empty" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">📁</div>
            <div className="empty-title">Sin proyectos</div>
            <div className="empty-desc">Creá el primer proyecto con el botón de arriba</div>
          </div>
        )}
      </div>
    </>
  )
}
