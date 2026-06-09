// Accepts both the old HTML export format and this app's export format.
export function parseBackup(text) {
  let data
  try { data = JSON.parse(text) } catch { return null }
  if (!Array.isArray(data)) return null
  return data.map(p => ({
    name: String(p.name || 'Sin nombre'),
    type: p.type === 'personal' ? 'personal' : 'obra',
    status: ['active', 'paused', 'done'].includes(p.status) ? p.status : 'active',
    desc: String(p.desc ?? p.descripcion ?? ''),
    notes: String(p.notes ?? ''),
    tasks: Array.isArray(p.tasks) ? p.tasks
      .map((t, i) => ({
        name: String(t.name || ''),
        done: Boolean(t.done),
        priority: ['alta', 'media', 'baja'].includes(t.priority) ? t.priority : 'media',
        date: String(t.date ?? t.due_date ?? ''),
        assignee: String(t.assignee ?? ''),
        position: i,
      }))
      .filter(t => t.name) : [],
  }))
}

export function serializeBackup(projects) {
  return JSON.stringify(projects.map(p => ({
    name: p.name, type: p.type, status: p.status, desc: p.desc, notes: p.notes,
    tasks: p.tasks.map(t => ({ name: t.name, done: t.done, priority: t.priority, date: t.date, assignee: t.assignee })),
  })), null, 2)
}

export function backupFilename(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `backup_proyectos_${y}${m}${d}.json`
}
