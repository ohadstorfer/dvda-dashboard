import { useRef, useState } from 'react'

export default function ProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project?.name || '')
  const [desc, setDesc] = useState(project?.desc || '')
  const [type, setType] = useState(project?.type || 'obra')
  const [status, setStatus] = useState(project?.status || 'active')
  const nameRef = useRef(null)

  async function save() {
    if (!name.trim()) { nameRef.current.focus(); return }
    const ok = await onSave({ name: name.trim(), desc: desc.trim(), type, status })
    if (ok) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{project ? 'Editar proyecto' : 'Nuevo proyecto'}</div>
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input ref={nameRef} className="form-input" placeholder="Ej: Obra Libertador 2460" autoFocus
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea className="form-textarea" placeholder="Detalle del proyecto..."
            value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="obra">Obra / Trabajo</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="done">Finalizado</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>
            {project ? 'Guardar cambios' : 'Guardar proyecto'}
          </button>
        </div>
      </div>
    </div>
  )
}
