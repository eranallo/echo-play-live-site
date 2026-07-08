'use client'

import { useState } from 'react'

function isHigh(task) {
  return ['High', 'Urgent'].includes(task.priority)
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (isHigh(a) && !isHigh(b)) return -1
    if (!isHigh(a) && isHigh(b)) return 1
    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

function buildSourceNotes(task) {
  return [
    task.body || task.notes,
    task.href ? `Source: ${task.href}` : '',
    task.due ? `Due context: ${task.due}` : '',
  ].filter(Boolean).join('\n')
}

function TaskRow({ task, source, onComplete, onCreateFromTask, busy }) {
  const effectiveSource = task.type === 'Airtable' ? 'Airtable' : source
  const high = isHigh(task)
  const canComplete = effectiveSource === 'Airtable' && task.id && !task.isDone
  const canCreate = effectiveSource !== 'Airtable'

  return (
    <div className={`tqc-row ${high ? 'tqc-high' : ''}`}>
      <div className="tqc-type"><span>{effectiveSource}</span><strong>{task.type || task.source || 'Task'}</strong></div>
      <div className="tqc-main"><h3>{task.title}</h3><p>{task.body || task.notes || task.relatedShow || 'No notes yet.'}</p></div>
      <div className="tqc-meta"><span>{task.priority || 'Normal'}</span><em>{task.due || task.dueLabel || 'No due date'}</em></div>
      <div className="tqc-actions">
        {task.href && <a href={task.href}>Open</a>}
        {canComplete && <button disabled={busy} onClick={() => onComplete(task.id)}>Done</button>}
        {canCreate && <button disabled={busy} onClick={() => onCreateFromTask(task)}>Make Task</button>}
      </div>
    </div>
  )
}

function Column({ title, items, source, onComplete, onCreateFromTask, busy }) {
  return (
    <section className="tqc-column">
      <div className="tqc-col-head"><span>{items.length}</span><h2>{title}</h2></div>
      <div className="tqc-list">
        {items.length ? items.map(item => <TaskRow key={`${source}-${item.id}`} task={item} source={source} onComplete={onComplete} onCreateFromTask={onCreateFromTask} busy={busy} />) : <p className="tqc-empty">Nothing here.</p>}
      </div>
    </section>
  )
}

export default function TaskQueueClient({ airtableTasks = [], inferredTasks = [], tasksTableReady = false }) {
  const [tasks, setTasks] = useState(airtableTasks)
  const [inferred, setInferred] = useState(inferredTasks)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ title: '', priority: 'Normal', dueDate: '', owner: '', notes: '' })

  const openAirtableTasks = tasks.filter(task => !task.isDone)
  const all = sortTasks([...openAirtableTasks, ...inferred])
  const high = all.filter(isHigh)
  const normal = all.filter(task => !isHigh(task))

  function updateForm(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function createTask(payload, removeInferredId = null) {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Task creation failed.')
      setTasks(current => [data.task, ...current])
      if (removeInferredId) setInferred(current => current.filter(item => item.id !== removeInferredId))
      setForm({ title: '', priority: 'Normal', dueDate: '', owner: '', notes: '' })
      setMessage({ type: 'success', text: 'Task created in Airtable.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Task creation failed.' })
    } finally {
      setBusy(false)
    }
  }

  async function createManualTask(event) {
    event.preventDefault()
    await createTask({
      title: form.title,
      priority: form.priority,
      dueDate: form.dueDate,
      owner: form.owner,
      notes: form.notes,
      source: 'Manual',
      status: 'Todo',
    })
  }

  async function createFromInferred(task) {
    await createTask({
      title: task.title,
      priority: task.priority || 'Normal',
      notes: buildSourceNotes(task),
      source: task.type || 'Inferred',
      status: 'Todo',
    }, task.id)
  }

  async function completeTask(taskId) {
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
      setMessage({ type: 'success', text: 'Task marked done.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Task update failed.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tqc-shell">
      <style>{`
        .tqc-shell{display:grid;gap:var(--s-6)}.tqc-create{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5);display:grid;gap:var(--s-4)}.tqc-create h2,.tqc-col-head h2{font-family:var(--ff-display);font-size:var(--t-h2);line-height:.9;letter-spacing:var(--ls-display)}.tqc-form{display:grid;grid-template-columns:minmax(220px,1fr) 150px 150px 150px auto;gap:10px;align-items:end}.tqc-field{display:grid;gap:7px}.tqc-field span,.tqc-col-head span,.tqc-type span,.tqc-meta span,.tqc-meta em,.tqc-actions a,.tqc-actions button,.tqc-message{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl);font-style:normal}.tqc-field input,.tqc-field select{width:100%;border:1px solid var(--c-border);background:#050505;color:var(--c-text-muted);min-height:42px;padding:0 12px;font:inherit}.tqc-field-wide{grid-column:1 / -2}.tqc-create button,.tqc-actions button,.tqc-actions a{border:1px solid var(--c-epl-line);background:rgba(212,160,23,.06);color:var(--c-epl);min-height:42px;padding:0 12px;text-decoration:none;display:inline-grid;place-items:center;cursor:pointer}.tqc-create button:hover,.tqc-actions button:hover,.tqc-actions a:hover{background:var(--c-epl);color:#050505}.tqc-create button:disabled,.tqc-actions button:disabled{opacity:.5;cursor:not-allowed}.tqc-message{line-height:var(--lh-base)}.tqc-error{color:#f3a6a6}.tqc-board{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-5);align-items:start}.tqc-column{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5)}.tqc-col-head{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid var(--c-border);padding-bottom:var(--s-4);margin-bottom:var(--s-4)}.tqc-list{display:grid;gap:10px}.tqc-row{display:grid;grid-template-columns:130px 1fr minmax(120px,.22fr) auto;gap:14px;align-items:center;color:inherit;text-decoration:none;border:1px solid var(--c-border);background:#070707;padding:14px;transition:border-color .18s ease}.tqc-row:hover{border-color:var(--c-epl-line)}.tqc-high{border-color:rgba(255,106,0,.36)}.tqc-type strong{display:block;color:var(--c-text-faint);font-size:12px;margin-top:6px}.tqc-main h3{color:var(--c-text);font-size:16px;margin-bottom:5px}.tqc-main p{color:var(--c-text-dim);line-height:var(--lh-snug);white-space:pre-wrap}.tqc-meta{display:grid;gap:6px;text-align:right}.tqc-meta em{color:var(--c-text-faint)}.tqc-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.tqc-empty{color:var(--c-text-muted);border:1px dashed var(--c-border);padding:var(--s-4)}.tqc-note{border:1px solid var(--c-border);padding:var(--s-4);color:var(--c-text-dim);line-height:var(--lh-base);background:rgba(255,255,255,.018)}@media(max-width:1160px){.tqc-form{grid-template-columns:1fr 1fr}.tqc-field-wide{grid-column:1 / -1}.tqc-board{grid-template-columns:1fr}.tqc-row{grid-template-columns:1fr}.tqc-meta{text-align:left;display:flex;gap:10px;flex-wrap:wrap}.tqc-actions{justify-content:flex-start}}@media(max-width:680px){.tqc-create,.tqc-column{padding:var(--s-4);margin-left:calc(var(--gutter-fluid)*-.25);margin-right:calc(var(--gutter-fluid)*-.25)}.tqc-form{grid-template-columns:1fr}.tqc-create button{width:100%}}
      `}</style>

      <section className="tqc-create">
        <div>
          <span className="tqc-message">Create Task</span>
          <h2>Add work</h2>
        </div>
        <form className="tqc-form" onSubmit={createManualTask}>
          <label className="tqc-field"><span>Task</span><input value={form.title} onChange={event => updateForm('title', event.target.value)} required placeholder="Follow up with venue…" /></label>
          <label className="tqc-field"><span>Priority</span><select value={form.priority} onChange={event => updateForm('priority', event.target.value)}><option>Normal</option><option>High</option><option>Urgent</option><option>Low</option></select></label>
          <label className="tqc-field"><span>Due</span><input type="date" value={form.dueDate} onChange={event => updateForm('dueDate', event.target.value)} /></label>
          <label className="tqc-field"><span>Owner</span><input value={form.owner} onChange={event => updateForm('owner', event.target.value)} placeholder="Evan" /></label>
          <label className="tqc-field tqc-field-wide"><span>Notes</span><input value={form.notes} onChange={event => updateForm('notes', event.target.value)} placeholder="Context, next step, or source…" /></label>
          <button disabled={busy || !form.title}>{busy ? 'Saving…' : 'Create'}</button>
        </form>
        {message && <p className={`tqc-message ${message.type === 'error' ? 'tqc-error' : ''}`}>{message.text}</p>}
      </section>

      <section className="tqc-board">
        <Column title="High Priority" items={high} source="Queue" onComplete={completeTask} onCreateFromTask={createFromInferred} busy={busy} />
        <Column title="Normal Priority" items={normal} source="Queue" onComplete={completeTask} onCreateFromTask={createFromInferred} busy={busy} />
      </section>

      <div className="tqc-note">
        {tasksTableReady
          ? 'TASKS is connected. Manual tasks and inferred tasks can now become hard Airtable records, and Airtable tasks can be marked done from here.'
          : 'The interface is ready, but Airtable TASKS is not connected yet. Create the TASKS table with Name, Status, Priority, Due Date, Owner, Source, Related Show, Notes, and Completed At to activate writes.'}
      </div>
    </div>
  )
}
