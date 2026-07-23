'use client'

import { useState } from 'react'

export default function ShowTaskPanel({ showId, owner = '', initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [form, setForm] = useState({ title: '', priority: 'Normal', dueDate: '', owner, notes: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }))
  }

  async function create(event) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, relatedShow: showId, source: 'Manual', status: 'To Do' }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Task creation failed.')
      setTasks(current => [data.task, ...current])
      setForm(current => ({ ...current, title: '', dueDate: '', notes: '' }))
      setMessage({ type: 'success', text: 'Task added to the show.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Task creation failed.' })
    } finally {
      setBusy(false)
    }
  }

  async function complete(taskId) {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Task update failed.')
      setTasks(current => current.map(task => task.id === taskId ? data.task : task))
      setMessage({ type: 'success', text: 'Task completed.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Task update failed.' })
    } finally {
      setBusy(false)
    }
  }

  const openTasks = tasks.filter(task => !task.isDone)

  return (
    <div className="stp-shell">
      <style>{`
        .stp-shell{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.75fr);gap:var(--s-4)}.stp-list{display:grid;gap:8px}.stp-task{border:1px solid var(--c-border);background:#070707;padding:12px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.stp-task span,.stp-form label span{font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-epl)}.stp-task strong{display:block;color:var(--c-text);margin:5px 0}.stp-task p{color:var(--c-text-dim);font-size:13px;line-height:var(--lh-snug)}.stp-task button{border:1px solid var(--c-epl-line);background:transparent;color:var(--c-epl);min-height:38px;padding:0 11px;font-family:var(--ff-label);font-size:9px;letter-spacing:.11em;text-transform:uppercase;cursor:pointer}.stp-form{border:1px solid var(--c-border);background:#070707;padding:var(--s-4);display:grid;gap:10px}.stp-form h3{font-family:var(--ff-display);font-size:34px;line-height:.9}.stp-form label{display:grid;gap:7px}.stp-form input,.stp-form select,.stp-form textarea{width:100%;min-height:42px;border:1px solid var(--c-border);background:#050505;color:var(--c-text-muted);padding:9px 10px;font:inherit}.stp-form textarea{min-height:86px;resize:vertical}.stp-form button{min-height:44px;border:0;background:var(--c-epl);color:#050505;font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.stp-empty{border:1px dashed var(--c-border);padding:var(--s-4);color:var(--c-text-muted)}.stp-message{grid-column:1/-1;color:var(--c-epl);font-size:13px}.stp-error{color:#f3a6a6}@media(max-width:850px){.stp-shell{grid-template-columns:1fr}.stp-form{order:-1}}
      `}</style>
      <div className="stp-list">{openTasks.length ? openTasks.map(task => <article className="stp-task" key={task.id}><div><span>{task.priority} · {task.dueLabel}</span><strong>{task.title}</strong>{task.notes && <p>{task.notes}</p>}</div><button type="button" disabled={busy} onClick={() => complete(task.id)}>Done</button></article>) : <div className="stp-empty">No open tasks tied to this show.</div>}</div>
      <form className="stp-form" onSubmit={create}>
        <h3>Add task</h3>
        <label><span>Task</span><input required value={form.title} onChange={event => update('title', event.target.value)} /></label>
        <label><span>Priority</span><select value={form.priority} onChange={event => update('priority', event.target.value)}><option>Normal</option><option>High</option><option>Urgent</option></select></label>
        <label><span>Due date</span><input type="date" value={form.dueDate} onChange={event => update('dueDate', event.target.value)} /></label>
        <label><span>Owner</span><input value={form.owner} onChange={event => update('owner', event.target.value)} /></label>
        <label><span>Notes</span><textarea value={form.notes} onChange={event => update('notes', event.target.value)} /></label>
        <button disabled={busy}>{busy ? 'Adding…' : 'Add task'}</button>
      </form>
      {message && <p className={`stp-message ${message.type === 'error' ? 'stp-error' : ''}`}>{message.text}</p>}
    </div>
  )
}
