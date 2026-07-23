'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SHOW_SEGMENT_TYPES } from '@/lib/admin/operations.mjs'

const EMPTY_FORM = {
  name: '',
  type: 'Performance',
  startTime: '',
  endTime: '',
  durationMinutes: '',
  details: '',
}

function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = type => parts.find(part => part.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

function toIso(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function editingForm(segment) {
  return {
    name: segment.name,
    type: segment.type,
    startTime: toLocalInput(segment.startTime),
    endTime: toLocalInput(segment.endTime),
    durationMinutes: segment.durationMinutes || '',
    details: segment.details || '',
  }
}

export default function TimelineBuilder({ showId, initialSegments = [] }) {
  const router = useRouter()
  const [segments, setSegments] = useState(initialSegments)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }))
  }

  function startEdit(segment) {
    setEditingId(segment.id)
    setForm(editingForm(segment))
    setMessage(null)
  }

  function resetForm() {
    setEditingId('')
    setForm(EMPTY_FORM)
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      const payload = {
        ...form,
        startTime: toIso(form.startTime),
        endTime: toIso(form.endTime),
      }
      const endpoint = editingId
        ? `/api/admin/shows/${showId}/segments/${editingId}`
        : `/api/admin/shows/${showId}/segments`
      const response = await fetch(endpoint, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Timeline update failed.')

      setSegments(current => editingId
        ? current.map(item => item.id === editingId ? data.segment : item)
        : [...current, data.segment])
      setMessage({ type: 'success', text: editingId ? 'Segment updated.' : 'Segment added.' })
      resetForm()
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Timeline update failed.' })
    } finally {
      setBusy(false)
    }
  }

  async function remove(segment) {
    if (!window.confirm(`Delete “${segment.name}” from this run of show?`)) return
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/shows/${showId}/segments/${segment.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Segment deletion failed.')
      setSegments(current => current.filter(item => item.id !== segment.id))
      if (editingId === segment.id) resetForm()
      setMessage({ type: 'success', text: 'Segment deleted.' })
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Segment deletion failed.' })
    } finally {
      setBusy(false)
    }
  }

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= segments.length || busy) return
    const previous = segments
    const reordered = [...segments]
    const [item] = reordered.splice(index, 1)
    reordered.splice(target, 0, item)
    setSegments(reordered)
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/shows/${showId}/segments/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map(segment => segment.id) }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Reorder failed.')
      setMessage({ type: 'success', text: 'Timeline order saved.' })
      router.refresh()
    } catch (error) {
      setSegments(previous)
      setMessage({ type: 'error', text: error?.message || 'Reorder failed.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tlb-shell">
      <style>{`
        .tlb-shell{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:var(--s-5);align-items:start}.tlb-list{display:grid;gap:10px}.tlb-row{display:grid;grid-template-columns:46px 110px 1fr auto;gap:12px;align-items:center;border:1px solid var(--c-border);background:#070707;padding:12px}.tlb-order{display:grid;gap:4px}.tlb-order button,.tlb-actions button{border:1px solid var(--c-border);background:#050505;color:var(--c-text-muted);cursor:pointer;min-height:28px}.tlb-order button:disabled,.tlb-actions button:disabled{opacity:.35;cursor:not-allowed}.tlb-time{font-family:var(--ff-display);font-size:27px;color:var(--c-epl);line-height:.9}.tlb-main span{font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-text-faint)}.tlb-main strong{display:block;color:var(--c-text);margin:5px 0}.tlb-main p{color:var(--c-text-dim);font-size:13px;line-height:var(--lh-snug)}.tlb-actions{display:grid;gap:5px}.tlb-actions button{padding:0 9px;font-family:var(--ff-label);font-size:9px;letter-spacing:.1em;text-transform:uppercase}.tlb-form{border:1px solid var(--c-epl-line);background:rgba(212,160,23,.035);padding:var(--s-4);display:grid;gap:12px;position:sticky;top:122px}.tlb-form h3{font-family:var(--ff-display);font-size:38px;line-height:.9}.tlb-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tlb-field{display:grid;gap:7px}.tlb-field span{font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-epl)}.tlb-field input,.tlb-field select,.tlb-field textarea{width:100%;min-height:44px;border:1px solid var(--c-border);background:#050505;color:var(--c-text-muted);padding:9px 10px;font:inherit}.tlb-field textarea{min-height:100px;resize:vertical}.tlb-wide{grid-column:1/-1}.tlb-form-actions{display:flex;gap:8px}.tlb-save,.tlb-cancel{min-height:44px;padding:0 14px;font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.tlb-save{border:0;background:var(--c-epl);color:#050505}.tlb-cancel{border:1px solid var(--c-border);background:transparent;color:var(--c-text-muted)}.tlb-message{grid-column:1/-1;color:var(--c-epl);font-size:13px}.tlb-error{color:#f3a6a6}.tlb-empty{border:1px dashed var(--c-border);padding:var(--s-5);color:var(--c-text-muted);line-height:var(--lh-base)}@media(max-width:980px){.tlb-shell{grid-template-columns:1fr}.tlb-form{position:static;order:-1}}@media(max-width:650px){.tlb-row{grid-template-columns:38px 1fr auto}.tlb-time{grid-column:2/3;grid-row:1}.tlb-main{grid-column:2/3}.tlb-actions{grid-column:3;grid-row:1/3}.tlb-grid{grid-template-columns:1fr}.tlb-wide{grid-column:auto}.tlb-form-actions{display:grid}.tlb-save,.tlb-cancel{width:100%}}
      `}</style>

      <div className="tlb-list">
        {segments.length ? segments.map((segment, index) => (
          <article className="tlb-row" key={segment.id}>
            <div className="tlb-order"><button type="button" aria-label={`Move ${segment.name} earlier`} onClick={() => move(index, -1)} disabled={busy || index === 0}>↑</button><button type="button" aria-label={`Move ${segment.name} later`} onClick={() => move(index, 1)} disabled={busy || index === segments.length - 1}>↓</button></div>
            <div className="tlb-time">{segment.startLabel || 'TBD'}</div>
            <div className="tlb-main"><span>{segment.type}{segment.durationLabel ? ` · ${segment.durationLabel}` : ''}</span><strong>{segment.name}</strong>{segment.details && <p>{segment.details}</p>}</div>
            <div className="tlb-actions"><button type="button" onClick={() => startEdit(segment)} disabled={busy}>Edit</button><button type="button" onClick={() => remove(segment)} disabled={busy}>Delete</button></div>
          </article>
        )) : <div className="tlb-empty">No timeline segments yet. Add the first production, doors, performance, break, or load-out moment using the builder.</div>}
        {message && <p className={`tlb-message ${message.type === 'error' ? 'tlb-error' : ''}`}>{message.text}</p>}
      </div>

      <form className="tlb-form" onSubmit={save}>
        <h3>{editingId ? 'Edit segment' : 'Add segment'}</h3>
        <div className="tlb-grid">
          <label className="tlb-field tlb-wide"><span>Name</span><input required value={form.name} onChange={event => update('name', event.target.value)} placeholder="Doors, Set 1, Changeover…" /></label>
          <label className="tlb-field"><span>Type</span><select value={form.type} onChange={event => update('type', event.target.value)}>{SHOW_SEGMENT_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
          <label className="tlb-field"><span>Duration minutes</span><input type="number" min="1" max="1440" value={form.durationMinutes} onChange={event => update('durationMinutes', event.target.value)} /></label>
          <label className="tlb-field"><span>Start</span><input type="datetime-local" value={form.startTime} onChange={event => update('startTime', event.target.value)} /></label>
          <label className="tlb-field"><span>End</span><input type="datetime-local" value={form.endTime} onChange={event => update('endTime', event.target.value)} /></label>
          <label className="tlb-field tlb-wide"><span>Details</span><textarea value={form.details} onChange={event => update('details', event.target.value)} placeholder="Production notes, changeover details, announcements…" /></label>
        </div>
        <div className="tlb-form-actions"><button className="tlb-save" type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Update segment' : 'Add segment'}</button>{editingId && <button className="tlb-cancel" type="button" onClick={resetForm} disabled={busy}>Cancel edit</button>}</div>
      </form>
    </div>
  )
}
