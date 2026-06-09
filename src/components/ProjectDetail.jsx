import { progress, STATUS_LABELS } from '../lib/logic'
import TaskItem from './TaskItem'

export default function ProjectDetail({
  project: p, onBack, onEdit, onDelete,
  onToggleTask, onDeleteTask, onNewTask, onSaveNotes, onChangeStatus,
}) {
  const prog = progress(p.tasks)

  return (
    <>
      <div className="detail-header">
        <div className="detail-back" onClick={onBack}>← Proyectos</div>
        <div className="detail-title-block">
          <div className="detail-title">{p.name}</div>
          <div className="detail-meta">
            <span className={`badge badge-${p.type}`}>{p.type === 'obra' ? 'Obra' : 'Personal'}</span>
            <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>✏ Editar</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>✕ Eliminar</button>
        </div>
      </div>

      {p.desc && (
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>{p.desc}</div>
      )}

      <div className="detail-body">
        <div>
          <div className="tasks-panel">
            <div className="tasks-panel-header">
              <span className="tasks-panel-title">Tareas · {prog}% completado</span>
              <button className="btn btn-primary btn-sm" onClick={onNewTask}>+ Agregar tarea</button>
            </div>
            <div className="progress-bar" style={{ borderRadius: 0 }}>
              <div className="progress-fill" style={{ width: `${prog}%` }} />
            </div>
            {p.tasks.length ? p.tasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onDelete={() => onDeleteTask(t.id)} />
            )) : (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <div className="empty-title">Sin tareas</div>
                <div className="empty-desc">Agregá la primera tarea del proyecto</div>
              </div>
            )}
          </div>
        </div>

        <div className="info-panel">
          <div className="info-card">
            <div className="info-card-title">Resumen</div>
            <div className="info-row">
              <span className="info-row-label">Total tareas</span>
              <span className="info-row-val">{p.tasks.length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Completadas</span>
              <span className="info-row-val">{p.tasks.filter(t => t.done).length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Pendientes</span>
              <span className="info-row-val">{p.tasks.filter(t => !t.done).length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Alta prioridad</span>
              <span className="info-row-val">{p.tasks.filter(t => !t.done && t.priority === 'alta').length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Creado</span>
              <span className="info-row-val">{p.createdAt}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-title">Notas</div>
            <textarea
              className="notes-area"
              placeholder="Notas, comentarios, recordatorios..."
              value={p.notes}
              onChange={e => onSaveNotes(e.target.value)}
            />
          </div>

          <div className="info-card">
            <div className="info-card-title">Estado</div>
            <select className="form-select" value={p.status} onChange={e => onChangeStatus(e.target.value)}>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="done">Finalizado</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}
