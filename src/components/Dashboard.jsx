import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import Sidebar from './Sidebar'
import ListView from './ListView'
import ProjectDetail from './ProjectDetail'

export default function Dashboard({ userId }) {
  const [view, setView] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const data = useProjects(userId)
  const selected = data.projects.find(p => p.id === selectedId) || null

  function handleSetView(v) {
    setView(v)
    setSelectedId(null)
  }

  function handleDeleteProject(id) {
    if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return
    setSelectedId(null)
    data.deleteProject(id)
  }

  if (data.loading) return null

  return (
    <div className="layout">
      <Sidebar
        projects={data.projects}
        view={view}
        detailOpen={!!selected}
        onSetView={handleSetView}
        onExport={() => {}}
        onImportFile={() => {}}
      />
      <main className="main">
        {data.loadError ? (
          <div className="empty">
            <div className="empty-icon">⚠</div>
            <div className="empty-title">No se pudieron cargar los proyectos</div>
            <div className="empty-desc">
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={data.refetch}>Reintentar</button>
            </div>
          </div>
        ) : selected ? (
          <ProjectDetail
            project={selected}
            onBack={() => setSelectedId(null)}
            onEdit={() => {}}
            onDelete={() => handleDeleteProject(selected.id)}
            onToggleTask={taskId => data.toggleTask(selected.id, taskId)}
            onDeleteTask={taskId => data.deleteTask(selected.id, taskId)}
            onNewTask={() => {}}
            onSaveNotes={notes => data.saveNotes(selected.id, notes)}
            onChangeStatus={status => data.changeStatus(selected.id, status)}
          />
        ) : (
          <ListView
            projects={data.projects}
            view={view}
            onSelect={setSelectedId}
            onNewProject={() => {}}
          />
        )}
      </main>
    </div>
  )
}
