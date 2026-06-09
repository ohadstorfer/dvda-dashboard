import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { projectFromRow, taskFromRow } from '../lib/mappers'
import { useToast } from '../context/ToastContext'

const SAVE_ERROR = 'Error al guardar — reintentá'

export function useProjects(userId) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const toast = useToast()
  const notesTimers = useRef({})

  const refetch = useCallback(async () => {
    setLoadError(false)
    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .order('created_at', { ascending: false })
    if (error) { setLoadError(true); setLoading(false); return }
    setProjects(data.map(projectFromRow))
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const createProject = useCallback(async (fields) => {
    const { data, error } = await supabase.from('projects')
      .insert({ user_id: userId, name: fields.name, type: fields.type, status: fields.status, descripcion: fields.desc })
      .select('*, tasks(*)')
      .single()
    if (error) { toast(SAVE_ERROR); return false }
    setProjects(ps => [projectFromRow(data), ...ps])
    toast('Proyecto creado ✓')
    return true
  }, [userId, toast])

  const updateProject = useCallback(async (id, fields) => {
    const { error } = await supabase.from('projects')
      .update({ name: fields.name, type: fields.type, status: fields.status, descripcion: fields.desc })
      .eq('id', id)
    if (error) { toast(SAVE_ERROR); return false }
    setProjects(ps => ps.map(p => p.id === id ? { ...p, name: fields.name, type: fields.type, status: fields.status, desc: fields.desc } : p))
    toast('Proyecto actualizado ✓')
    return true
  }, [toast])

  const deleteProject = useCallback(async (id) => {
    const prev = projects
    setProjects(ps => ps.filter(p => p.id !== id))
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) { setProjects(prev); toast(SAVE_ERROR); return }
    toast('Proyecto eliminado')
  }, [projects, toast])

  const changeStatus = useCallback(async (id, status) => {
    const prev = projects
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status } : p))
    const { error } = await supabase.from('projects').update({ status }).eq('id', id)
    if (error) { setProjects(prev); toast(SAVE_ERROR); return }
    toast('Estado actualizado')
  }, [projects, toast])

  const saveNotes = useCallback((id, notes) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, notes } : p))
    clearTimeout(notesTimers.current[id])
    notesTimers.current[id] = setTimeout(async () => {
      const { error } = await supabase.from('projects').update({ notes }).eq('id', id)
      if (error) toast(SAVE_ERROR)
    }, 800)
  }, [toast])

  const addTask = useCallback(async (projId, fields) => {
    const proj = projects.find(p => p.id === projId)
    const position = proj ? proj.tasks.length : 0
    const { data, error } = await supabase.from('tasks')
      .insert({ project_id: projId, name: fields.name, priority: fields.priority, due_date: fields.date, assignee: fields.assignee, position })
      .select()
      .single()
    if (error) { toast(SAVE_ERROR); return false }
    setProjects(ps => ps.map(p => p.id === projId ? { ...p, tasks: [...p.tasks, taskFromRow(data)] } : p))
    toast('Tarea agregada ✓')
    return true
  }, [projects, toast])

  const toggleTask = useCallback(async (projId, taskId) => {
    const proj = projects.find(p => p.id === projId)
    const task = proj && proj.tasks.find(t => t.id === taskId)
    if (!task) return
    const done = !task.done
    const prev = projects
    setProjects(ps => ps.map(p => p.id === projId
      ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done } : t) }
      : p))
    const { error } = await supabase.from('tasks').update({ done }).eq('id', taskId)
    if (error) { setProjects(prev); toast(SAVE_ERROR) }
  }, [projects, toast])

  const deleteTask = useCallback(async (projId, taskId) => {
    const prev = projects
    setProjects(ps => ps.map(p => p.id === projId
      ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
      : p))
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) { setProjects(prev); toast(SAVE_ERROR); return }
    toast('Tarea eliminada')
  }, [projects, toast])

  const importBackup = useCallback(async (parsed) => {
    // Insert in reverse so the first project in the file gets the newest
    // created_at and therefore appears first (matches the HTML's array order).
    for (const p of [...parsed].reverse()) {
      const { data, error } = await supabase.from('projects')
        .insert({ user_id: userId, name: p.name, type: p.type, status: p.status, descripcion: p.desc, notes: p.notes })
        .select()
        .single()
      if (error) { toast('Error al importar'); return false }
      if (p.tasks.length) {
        const { error: taskError } = await supabase.from('tasks').insert(
          p.tasks.map(t => ({ project_id: data.id, name: t.name, done: t.done, priority: t.priority, due_date: t.date, assignee: t.assignee, position: t.position })),
        )
        if (taskError) { toast('Error al importar'); return false }
      }
    }
    await refetch()
    toast('Backup importado ✓')
    return true
  }, [userId, refetch, toast])

  return {
    projects, loading, loadError, refetch,
    createProject, updateProject, deleteProject, changeStatus, saveNotes,
    addTask, toggleTask, deleteTask, importBackup,
  }
}
