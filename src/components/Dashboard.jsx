import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import Sidebar from './Sidebar'
import ListView from './ListView'
import ProjectDetail from './ProjectDetail'
import ProjectModal from './ProjectModal'
import TaskModal from './TaskModal'

export default function Dashboard({ userId }) {
  const [view, setView] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [modal, setModal] = useState(null)
  // shapes: {kind:'new-project'} | {kind:'edit-project', project} | {kind:'new-task', projectId}
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
            onEdit={() => setModal({ kind: 'edit-project', project: selected })}
            onDelete={() => handleDeleteProject(selected.id)}
            onToggleTask={taskId => data.toggleTask(selected.id, taskId)}
            onDeleteTask={taskId => data.deleteTask(selected.id, taskId)}
            onNewTask={() => setModal({ kind: 'new-task', projectId: selected.id })}
            onSaveNotes={notes => data.saveNotes(selected.id, notes)}
            onChangeStatus={status => data.changeStatus(selected.id, status)}
          />
        ) : (
          <ListView
            projects={data.projects}
            view={view}
            onSelect={setSelectedId}
            onNewProject={() => setModal({ kind: 'new-project' })}
          />
        )}
      </main>
      {modal?.kind === 'new-project' && (
        <ProjectModal onClose={() => setModal(null)} onSave={data.createProject} />
      )}
      {modal?.kind === 'edit-project' && (
        <ProjectModal
          project={modal.project}
          onClose={() => setModal(null)}
          onSave={fields => data.updateProject(modal.project.id, fields)}
        />
      )}
      {modal?.kind === 'new-task' && (
        <TaskModal
          onClose={() => setModal(null)}
          onSave={fields => data.addTask(modal.projectId, fields)}
        />
      )}
    </div>
  )
}
