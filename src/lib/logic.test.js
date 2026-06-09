import { describe, it, expect } from 'vitest'
import { progress, getFiltered, getCounts, VIEW_LABELS, STATUS_LABELS } from './logic'

const P = (over = {}) => ({ id: '1', type: 'obra', status: 'active', tasks: [], ...over })

describe('progress', () => {
  it('returns 0 for empty task list', () => {
    expect(progress([])).toBe(0)
  })
  it('rounds the done percentage', () => {
    expect(progress([{ done: true }, { done: false }, { done: false }])).toBe(33)
  })
  it('returns 100 when all done', () => {
    expect(progress([{ done: true }, { done: true }])).toBe(100)
  })
})

describe('getFiltered', () => {
  const ps = [
    P({ id: 'a', type: 'obra', status: 'active' }),
    P({ id: 'b', type: 'personal', status: 'paused' }),
    P({ id: 'c', type: 'personal', status: 'done' }),
  ]
  it('returns all for view=all', () => expect(getFiltered(ps, 'all')).toHaveLength(3))
  it('filters by type', () => {
    expect(getFiltered(ps, 'obra').map(p => p.id)).toEqual(['a'])
    expect(getFiltered(ps, 'personal').map(p => p.id)).toEqual(['b', 'c'])
  })
  it('filters by status', () => {
    expect(getFiltered(ps, 'active').map(p => p.id)).toEqual(['a'])
    expect(getFiltered(ps, 'paused').map(p => p.id)).toEqual(['b'])
    expect(getFiltered(ps, 'done').map(p => p.id)).toEqual(['c'])
  })
})

describe('getCounts', () => {
  it('counts every view bucket', () => {
    const ps = [
      P({ type: 'obra', status: 'active' }),
      P({ type: 'personal', status: 'active' }),
      P({ type: 'personal', status: 'done' }),
    ]
    expect(getCounts(ps)).toEqual({ all: 3, obra: 1, personal: 2, active: 2, paused: 0, done: 1 })
  })
})

describe('labels', () => {
  it('matches the original HTML copy', () => {
    expect(VIEW_LABELS.all).toBe('Todos los proyectos')
    expect(VIEW_LABELS.obra).toBe('Obras y trabajos')
    expect(STATUS_LABELS.paused).toBe('Pausado')
  })
})
