import { useRef, useState } from 'react'

export default function TaskModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState('media')
  const [date, setDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [busy, setBusy] = useState(false)
  const nameRef = useRef(null)

  async function save() {
    if (!name.trim()) { nameRef.current?.focus(); return }
    if (busy) return
    setBusy(true)
    try {
      const ok = await onSave({ name: name.trim(), priority, date: date.trim(), assignee: assignee.trim() })
      if (ok) onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nueva tarea</div>
        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <input ref={nameRef} className="form-input" placeholder="¿Qué hay que hacer?" autoFocus
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prioridad</label>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha límite</label>
            <input className="form-input" placeholder="dd/mm o dd/mm/aaaa"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Responsable</label>
          <input className="form-input" placeholder="Ej: Ana, yo, arquitecto..."
            value={assignee} onChange={e => setAssignee(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>Agregar tarea</button>
        </div>
      </div>
    </div>
  )
}
