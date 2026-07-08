'use client'

import { useState } from 'react'

const CHECKBOX_FIELDS = [
  ['Contract Signed', 'Contract Signed'],
  ['Graphic Created', 'Graphic Created'],
  ['Trailer Reserved', 'Trailer Reserved'],
  ['Facebook Event Created', 'Facebook Event Created'],
  ['Bandsintown Posted', 'Bandsintown Posted'],
  ['Promotion Released', 'Promotion Released'],
  ['Ads Running', 'Ads Running'],
]

const NOTE_FIELDS = [
  ['Show Notes', 'Show', 'General context, venue notes, or internal reminders.'],
  ['Sound Notes', 'Sound', 'Production notes, sound provider, stage, input, and load-in context.'],
  ['Merch Notes', 'Merch', 'Merch table, staffing, inventory, settlement, or post-show notes.'],
]

function Message({ message }) {
  if (!message) return null
  return <p className={`sc-message ${message.type === 'error' ? 'sc-error' : ''}`}>{message.text}</p>
}

export default function ShowControls({ showId, notes, checklist }) {
  const [form, setForm] = useState({
    'Show Notes': notes?.showNotes || '',
    'Sound Notes': notes?.soundNotes || '',
    'Merch Notes': notes?.merchNotes || '',
  })
  const [checkboxes, setCheckboxes] = useState(() => {
    const values = {}
    for (const [fieldName, label] of CHECKBOX_FIELDS) {
      const item = checklist?.find(entry => entry.label === label)
      values[fieldName] = Boolean(item?.complete)
    }
    return values
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  function updateText(fieldName, value) {
    setForm(prev => ({ ...prev, [fieldName]: value }))
  }

  async function saveFields(fields, successText) {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Show update failed.')
      setMessage({ type: 'success', text: successText })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Show update failed.' })
    } finally {
      setSaving(false)
    }
  }

  async function saveNote(fieldName) {
    await saveFields({ [fieldName]: form[fieldName] }, `${fieldName} saved.`)
  }

  async function saveAllNotes() {
    await saveFields(form, 'All notes saved to Airtable.')
  }

  async function toggleCheckbox(fieldName) {
    const nextValue = !checkboxes[fieldName]
    setCheckboxes(prev => ({ ...prev, [fieldName]: nextValue }))
    await saveFields({ [fieldName]: nextValue }, `${fieldName} updated.`)
  }

  return (
    <div className="sc-shell">
      <style>{`
        .sc-shell{display:grid;gap:var(--s-5)}.sc-status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.sc-check{border:1px solid var(--c-border);background:#070707;color:var(--c-text-muted);padding:14px;text-align:left;display:grid;gap:10px;min-height:92px;cursor:pointer;transition:border-color .18s ease,background .18s ease,color .18s ease}.sc-check:hover{border-color:var(--c-epl-line)}.sc-check-active{border-color:var(--c-epl-line);background:rgba(212,160,23,.07);color:var(--c-epl)}.sc-check span,.sc-label,.sc-save,.sc-message{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.sc-check strong{font-size:14px;color:inherit}.sc-note-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sc-note{border:1px solid var(--c-border);background:#070707;padding:14px;display:grid;gap:10px}.sc-note-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.sc-label{color:var(--c-epl)}.sc-note-head p{color:var(--c-text-faint);font-size:12px;line-height:var(--lh-snug);font-family:var(--ff-body);letter-spacing:0;text-transform:none;font-weight:400}.sc-note textarea{width:100%;min-height:148px;border:1px solid var(--c-border);background:#050505;color:var(--c-text-muted);padding:12px;font:inherit;line-height:var(--lh-base);resize:vertical}.sc-save{border:1px solid var(--c-epl-line);background:rgba(212,160,23,.06);color:var(--c-epl);padding:11px 13px;cursor:pointer}.sc-save:hover{background:var(--c-epl);color:#050505}.sc-save:disabled,.sc-check:disabled{opacity:.48;cursor:not-allowed}.sc-actions{display:flex;gap:10px;flex-wrap:wrap}.sc-message{color:var(--c-epl);line-height:var(--lh-base)}.sc-error{color:#f3a6a6}@media(max-width:920px){.sc-note-grid{grid-template-columns:1fr}.sc-note textarea{min-height:120px}}@media(max-width:620px){.sc-status-grid{grid-template-columns:1fr}.sc-actions{display:grid}.sc-save{width:100%}}
      `}</style>

      <section>
        <div className="sc-label" style={{ marginBottom: 10 }}>Show status toggles</div>
        <div className="sc-status-grid">
          {CHECKBOX_FIELDS.map(([fieldName, label]) => (
            <button key={fieldName} onClick={() => toggleCheckbox(fieldName)} disabled={saving} className={`sc-check ${checkboxes[fieldName] ? 'sc-check-active' : ''}`}>
              <span>{checkboxes[fieldName] ? 'Complete' : 'Open'}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="sc-label" style={{ marginBottom: 10 }}>Notes</div>
        <div className="sc-note-grid">
          {NOTE_FIELDS.map(([fieldName, label, helper]) => (
            <label key={fieldName} className="sc-note">
              <div className="sc-note-head"><span className="sc-label">{label}</span></div>
              <p>{helper}</p>
              <textarea value={form[fieldName]} onChange={event => updateText(fieldName, event.target.value)} />
              <button type="button" className="sc-save" onClick={() => saveNote(fieldName)} disabled={saving}>Save {label}</button>
            </label>
          ))}
        </div>
      </section>

      <div className="sc-actions"><button className="sc-save" onClick={saveAllNotes} disabled={saving}>Save all notes</button></div>
      <Message message={message} />
    </div>
  )
}
