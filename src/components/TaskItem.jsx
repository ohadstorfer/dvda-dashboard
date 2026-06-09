export default function TaskItem({ task: t, onToggle, onDelete }) {
  return (
    <div className="task-item">
      <div className={'task-checkbox' + (t.done ? ' done' : '')} onClick={onToggle} />
      <div className="task-content">
        <div className={'task-name' + (t.done ? ' done' : '')}>{t.name}</div>
        <div className="task-meta-row">
          <span className={`priority-chip priority-${t.priority}`}>
            {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
          </span>
          {t.date && <span className="task-date">📅 {t.date}</span>}
          {t.assignee && <span className="task-assignee">👤 {t.assignee}</span>}
        </div>
      </div>
      <div className="task-actions">
        <button className="task-del-btn" onClick={onDelete} title="Eliminar">✕</button>
      </div>
    </div>
  )
}
