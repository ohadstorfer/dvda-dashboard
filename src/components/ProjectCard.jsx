import { progress, STATUS_LABELS } from '../lib/logic'

export default function ProjectCard({ project: p, onClick }) {
  const prog = progress(p.tasks)
  const pending = p.tasks.filter(t => !t.done).length
  const doneCount = p.tasks.filter(t => t.done).length

  return (
    <div className={`project-card ${p.type}`} onClick={onClick}>
      <div className="card-top">
        <div className="card-name">{p.name}</div>
        <span className={`badge badge-${p.type}`}>{p.type === 'obra' ? 'Obra' : 'Personal'}</span>
      </div>
      <div className="card-desc">
        {p.desc || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Sin descripción</span>}
      </div>
      <div className="card-footer">
        <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
        <span className="card-tasks-info">{pending} pendiente{pending !== 1 ? 's' : ''}</span>
      </div>
      <div className="progress-wrap">
        <div className="progress-label">
          <span>{prog}% completado</span>
          <span>{doneCount}/{p.tasks.length}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${prog}%` }} /></div>
      </div>
    </div>
  )
}
