export function progress(tasks) {
  if (!tasks.length) return 0
  return Math.round(tasks.filter(t => t.done).length / tasks.length * 100)
}

export function getFiltered(projects, view) {
  if (view === 'obra' || view === 'personal') return projects.filter(p => p.type === view)
  if (view === 'active' || view === 'paused' || view === 'done') return projects.filter(p => p.status === view)
  return projects
}

export function getCounts(projects) {
  return {
    all: projects.length,
    obra: projects.filter(p => p.type === 'obra').length,
    personal: projects.filter(p => p.type === 'personal').length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    done: projects.filter(p => p.status === 'done').length,
  }
}

export const VIEW_LABELS = {
  all: 'Todos los proyectos',
  obra: 'Obras y trabajos',
  personal: 'Proyectos personales',
  active: 'Proyectos activos',
  paused: 'Proyectos pausados',
  done: 'Proyectos finalizados',
}

export const STATUS_LABELS = { active: 'Activo', paused: 'Pausado', done: 'Finalizado' }
