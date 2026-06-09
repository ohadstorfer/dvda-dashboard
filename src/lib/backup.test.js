import { describe, it, expect } from 'vitest'
import { parseBackup, serializeBackup, backupFilename } from './backup'

describe('parseBackup', () => {
  it('returns null for invalid JSON or non-array', () => {
    expect(parseBackup('not json')).toBeNull()
    expect(parseBackup('{"a":1}')).toBeNull()
  })
  it('accepts the old HTML export format (desc/date fields)', () => {
    const out = parseBackup(JSON.stringify([{
      id: 'x', name: 'Obra 1', type: 'obra', status: 'active', desc: 'D', notes: '',
      createdAt: '9/6/2026',
      tasks: [{ id: 'y', name: 'T1', done: true, priority: 'alta', date: '05/06', assignee: 'Ana' }],
    }]))
    expect(out).toHaveLength(1)
    expect(out[0].desc).toBe('D')
    expect(out[0].tasks[0]).toEqual({ name: 'T1', done: true, priority: 'alta', date: '05/06', assignee: 'Ana', position: 0 })
  })
  it('applies safe defaults for bad values', () => {
    const out = parseBackup(JSON.stringify([{ name: 'X', type: 'weird', status: 'weird', tasks: [{ name: 'T', priority: 'weird' }] }]))
    expect(out[0].type).toBe('obra')
    expect(out[0].status).toBe('active')
    expect(out[0].tasks[0].priority).toBe('media')
    expect(out[0].tasks[0].done).toBe(false)
  })
  it('drops tasks without a name', () => {
    const out = parseBackup(JSON.stringify([{ name: 'X', tasks: [{ name: '' }, { name: 'ok' }] }]))
    expect(out[0].tasks).toHaveLength(1)
  })
  it('skips null or non-object entries instead of crashing', () => {
    const out = parseBackup('[null, 5, {"name":"X"}]')
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('X')
  })
  it('skips null task entries instead of crashing', () => {
    const out = parseBackup(JSON.stringify([{ name: 'X', tasks: [null, { name: 'ok' }] }]))
    expect(out[0].tasks).toEqual([{ name: 'ok', done: false, priority: 'media', date: '', assignee: '', position: 0 }])
  })
  it('renumbers positions after dropping nameless tasks', () => {
    const out = parseBackup(JSON.stringify([{ name: 'X', tasks: [{ name: '' }, { name: 'a' }, { name: 'b' }] }]))
    expect(out[0].tasks.map(t => t.position)).toEqual([0, 1])
  })
})

describe('serializeBackup', () => {
  it('round-trips through parseBackup', () => {
    const projects = [{
      id: 'p', name: 'Obra', type: 'obra', status: 'paused', desc: 'D', notes: 'N', createdAt: 'x',
      tasks: [{ id: 't', name: 'T', done: false, priority: 'baja', date: '01/07', assignee: '', position: 0 }],
    }]
    const parsed = parseBackup(serializeBackup(projects))
    expect(parsed[0].name).toBe('Obra')
    expect(parsed[0].tasks[0].date).toBe('01/07')
  })
})

describe('backupFilename', () => {
  it('formats as backup_proyectos_YYYYMMDD.json', () => {
    expect(backupFilename(new Date(2026, 5, 9))).toBe('backup_proyectos_20260609.json')
  })
})
