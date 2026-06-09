import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import Sidebar from './Sidebar'
import ListView from './ListView'

export default function Dashboard({ userId }) {
  const [view, setView] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const data = useProjects(userId)
  const selected = data.projects.find(p => p.id === selectedId) || null

  function handleSetView(v) {
    setView(v)
    setSelectedId(null)
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
