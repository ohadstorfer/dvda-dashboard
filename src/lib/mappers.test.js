import { describe, it, expect } from 'vitest'
import { projectFromRow, taskFromRow } from './mappers'

describe('taskFromRow', () => {
  it('maps DB columns to app fields', () => {
    expect(taskFromRow({
      id: 't1', name: 'Comprar hierro', done: false, priority: 'media',
      due_date: '12/06', assignee: 'Ana', position: 2,
    })).toEqual({ id: 't1', name: 'Comprar hierro', done: false, priority: 'media', date: '12/06', assignee: 'Ana', position: 2 })
  })
})

describe('projectFromRow', () => {
  it('maps columns, formats createdAt as es-AR, sorts tasks by position', () => {
    const p = projectFromRow({
      id: 'p1', name: 'Obra', type: 'obra', status: 'active',
      descripcion: 'Desc', notes: 'N', created_at: '2026-06-09T12:00:00Z',
      tasks: [
        { id: 'b', name: 'B', done: false, priority: 'media', due_date: '', assignee: '', position: 1 },
        { id: 'a', name: 'A', done: true, priority: 'alta', due_date: '', assignee: '', position: 0 },
      ],
    })
    expect(p.desc).toBe('Desc')
    expect(p.createdAt).toBe(new Date('2026-06-09T12:00:00Z').toLocaleDateString('es-AR'))
    expect(p.tasks.map(t => t.id)).toEqual(['a', 'b'])
  })
  it('tolerates missing tasks array', () => {
    const p = projectFromRow({ id: 'p1', name: 'X', type: 'obra', status: 'active', descripcion: '', notes: '', created_at: '2026-06-09T12:00:00Z' })
    expect(p.tasks).toEqual([])
  })
})
