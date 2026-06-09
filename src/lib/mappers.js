export function taskFromRow(r) {
  return {
    id: r.id, name: r.name, done: r.done, priority: r.priority ?? 'media',
    date: r.due_date, assignee: r.assignee, position: r.position,
  }
}

export function projectFromRow(row) {
  const tasks = (row.tasks || []).slice().sort((a, b) => a.position - b.position).map(taskFromRow)
  return {
    id: row.id, name: row.name, type: row.type, status: row.status,
    desc: row.descripcion, notes: row.notes ?? '',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('es-AR') : '',
    tasks,
  }
}
