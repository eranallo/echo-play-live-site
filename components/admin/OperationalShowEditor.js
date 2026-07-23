'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const PREP_FIELDS = [
  'Contract Signed',
  'Graphic Created',
  'Trailer Reserved',
  'Facebook Event Created',
  'Bandsintown Posted',
  'Promotion Released',
  'Ads Running',
]
const FUNNEL_STEPS = ['Contract', 'Graphic', 'Bandsintown', 'Facebook Event', 'Ads', 'Trailer']

function prepOptions(field) {
  return field === 'Facebook Event Created'
    ? ['To Do', 'Completed', 'Not Needed']
    : ['To Do', 'Complete', 'Not Needed']
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

function CheckGroup({ label, options, selected, onChange }) {
  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  return (
    <fieldset className="ose-check-group">
      <legend>{label}</legend>
      <div className="ose-check-grid">
        {options.map(option => <label className="ose-check" key={option.id}><input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} />{option.label}</label>)}
      </div>
    </fieldset>
  )
}

export default function OperationalShowEditor({ showId, initial, options }) {
  const router = useRouter()
  const [form, setForm] = useState(() => ({
    ...initial,
    trailerLoadIn: toLocalInput(initial.trailerLoadIn),
    loadIn: toLocalInput(initial.loadIn),
    soundCheck: toLocalInput(initial.soundCheck),
    startTime: toLocalInput(initial.startTime),
    endTime: toLocalInput(initial.endTime),
  }))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }))
  }

  function toggleFunnel(step) {
    update('funnelPlan', form.funnelPlan.includes(step)
      ? form.funnelPlan.filter(item => item !== step)
      : [...form.funnelPlan, step])
  }

  function updatePrep(field, value) {
    setForm(current => ({ ...current, prepStates: { ...current.prepStates, [field]: value } }))
  }

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      const fields = {
        Date: form.date,
        Band: form.bandIds,
        Venue: form.venueIds,
        'Lifecycle Stage': form.lifecycleStage,
        'Operational Owner': form.operationalOwner,
        'Trailer Load-In Time': toIso(form.trailerLoadIn),
        'Load-In Time': toIso(form.loadIn),
        'Sound Check Time': toIso(form.soundCheck),
        'Start Time': toIso(form.startTime),
        'End Time': toIso(form.endTime),
        'Publish Date': form.publishDate,
        'Members Playing': form.memberIds,
        'Sound Engineer': form.soundEngineerIds,
        'Merch Person': form.merchPersonIds,
        SETLISTS: form.setlistIds,
        'Drive Folder': form.driveFolder,
        'Ticket Price': form.ticketPrice,
        'Ticket URL': form.ticketUrl,
        'Production Notes': form.productionNotes,
        'Show Notes': form.showNotes,
        'Sound Notes': form.soundNotes,
        'Merch Notes': form.merchNotes,
        'Funnel Plan': form.funnelPlan,
        ...form.prepStates,
      }
      const response = await fetch(`/api/admin/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Show update failed.')
      setMessage({ type: 'success', text: 'Show file saved to Airtable.' })
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Show update failed.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ose-shell">
      <style>{`
        .ose-shell{display:grid;gap:var(--s-4)}.ose-section{border:1px solid var(--c-border);background:#070707;padding:var(--s-4);display:grid;gap:var(--s-4)}.ose-section h3{font-family:var(--ff-display);font-size:36px;line-height:.9}.ose-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ose-field{display:grid;gap:8px}.ose-field span,.ose-check-group legend,.ose-prep-label{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl)}.ose-field input,.ose-field select,.ose-field textarea,.ose-prep select{width:100%;min-height:46px;border:1px solid var(--c-border);background:#050505;color:var(--c-text-muted);padding:10px 12px;font:inherit}.ose-field textarea{min-height:118px;resize:vertical}.ose-wide{grid-column:1/-1}.ose-check-group{border:0;padding:0;margin:0}.ose-check-group legend{margin-bottom:10px}.ose-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:230px;overflow:auto}.ose-check{border:1px solid var(--c-border);background:#050505;padding:10px;display:flex;gap:8px;align-items:center;color:var(--c-text-muted)}.ose-check:has(input:checked){border-color:var(--c-epl-line);background:rgba(212,160,23,.06);color:var(--c-epl)}.ose-prep-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ose-prep{display:grid;grid-template-columns:1fr 130px;align-items:center;gap:10px;border:1px solid var(--c-border);padding:10px;background:#050505}.ose-prep-label{color:var(--c-text-muted)}.ose-toggle{display:flex;align-items:center;gap:9px;min-height:46px;border:1px solid var(--c-border);padding:10px;color:var(--c-text-muted)}.ose-actions{position:sticky;bottom:14px;z-index:4;display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid var(--c-epl-line);background:rgba(5,5,5,.94);backdrop-filter:blur(14px);padding:12px}.ose-save{min-height:46px;border:0;background:var(--c-epl);color:#050505;padding:0 18px;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;cursor:pointer}.ose-save:disabled{opacity:.5}.ose-message{color:var(--c-epl);font-size:13px}.ose-error{color:#f3a6a6}@media(max-width:720px){.ose-grid,.ose-prep-grid,.ose-check-grid{grid-template-columns:1fr}.ose-wide{grid-column:auto}.ose-prep{grid-template-columns:1fr}.ose-actions{display:grid}.ose-save{width:100%}}
      `}</style>

      <section className="ose-section">
        <h3>Lifecycle + core</h3>
        <div className="ose-grid">
          <label className="ose-field"><span>Lifecycle stage</span><select value={form.lifecycleStage} onChange={event => update('lifecycleStage', event.target.value)}>{options.lifecycleStages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
          <label className="ose-field"><span>Operational owner</span><input value={form.operationalOwner} onChange={event => update('operationalOwner', event.target.value)} /></label>
          <label className="ose-field"><span>Date</span><input type="date" value={form.date} onChange={event => update('date', event.target.value)} /></label>
          <label className="ose-field"><span>Band</span><select value={form.bandIds[0] || ''} onChange={event => update('bandIds', event.target.value ? [event.target.value] : [])}>{options.bands.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="ose-field"><span>Venue</span><select value={form.venueIds[0] || ''} onChange={event => update('venueIds', event.target.value ? [event.target.value] : [])}>{options.venues.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <div className="ose-toggle" role="status">Website: {form.publishToWebsite ? 'Published' : 'Not published'} · approval controlled</div>
        </div>
      </section>

      <section className="ose-section">
        <h3>Schedule</h3>
        <div className="ose-grid">
          <label className="ose-field"><span>Trailer load-in</span><input type="datetime-local" value={form.trailerLoadIn} onChange={event => update('trailerLoadIn', event.target.value)} /></label>
          <label className="ose-field"><span>Venue load-in</span><input type="datetime-local" value={form.loadIn} onChange={event => update('loadIn', event.target.value)} /></label>
          <label className="ose-field"><span>Soundcheck</span><input type="datetime-local" value={form.soundCheck} onChange={event => update('soundCheck', event.target.value)} /></label>
          <label className="ose-field"><span>Show start</span><input type="datetime-local" value={form.startTime} onChange={event => update('startTime', event.target.value)} /></label>
          <label className="ose-field"><span>Show end</span><input type="datetime-local" value={form.endTime} onChange={event => update('endTime', event.target.value)} /></label>
          <label className="ose-field"><span>Publish date</span><input type="date" value={form.publishDate} onChange={event => update('publishDate', event.target.value)} /></label>
        </div>
      </section>

      <section className="ose-section">
        <h3>Staffing</h3>
        <div className="ose-grid">
          <CheckGroup label="Members playing" options={options.members} selected={form.memberIds} onChange={value => update('memberIds', value)} />
          <div style={{ display: 'grid', gap: 16 }}>
            <CheckGroup label="Sound engineer" options={options.crew} selected={form.soundEngineerIds} onChange={value => update('soundEngineerIds', value.slice(-1))} />
            <CheckGroup label="Merch person" options={options.crew} selected={form.merchPersonIds} onChange={value => update('merchPersonIds', value.slice(-1))} />
          </div>
        </div>
      </section>

      <section className="ose-section">
        <h3>Campaign readiness</h3>
        <div className="ose-grid">
          <fieldset className="ose-check-group"><legend>Funnel steps</legend><div className="ose-check-grid">{FUNNEL_STEPS.map(step => <label className="ose-check" key={step}><input type="checkbox" checked={form.funnelPlan.includes(step)} onChange={() => toggleFunnel(step)} />{step}</label>)}</div></fieldset>
          <div className="ose-prep-grid">{PREP_FIELDS.map(field => <label className="ose-prep" key={field}><span className="ose-prep-label">{field}</span><select value={form.prepStates[field]} onChange={event => updatePrep(field, event.target.value)}>{prepOptions(field).map(state => <option key={state}>{state}</option>)}</select></label>)}</div>
          <label className="ose-field"><span>Ticket price</span><input type="number" min="0" step="0.01" value={form.ticketPrice} onChange={event => update('ticketPrice', event.target.value)} /></label>
          <label className="ose-field"><span>Ticket URL</span><input type="url" value={form.ticketUrl} onChange={event => update('ticketUrl', event.target.value)} /></label>
        </div>
      </section>

      <section className="ose-section">
        <h3>Documents + notes</h3>
        <div className="ose-grid">
          <label className="ose-field ose-wide"><span>Drive folder</span><input type="url" value={form.driveFolder} onChange={event => update('driveFolder', event.target.value)} /></label>
          <CheckGroup label="Setlists" options={options.setlists} selected={form.setlistIds} onChange={value => update('setlistIds', value)} />
          <label className="ose-field"><span>Production notes</span><textarea value={form.productionNotes} onChange={event => update('productionNotes', event.target.value)} /></label>
          <label className="ose-field"><span>Show notes</span><textarea value={form.showNotes} onChange={event => update('showNotes', event.target.value)} /></label>
          <label className="ose-field"><span>Sound notes</span><textarea value={form.soundNotes} onChange={event => update('soundNotes', event.target.value)} /></label>
          <label className="ose-field"><span>Merch notes</span><textarea value={form.merchNotes} onChange={event => update('merchNotes', event.target.value)} /></label>
        </div>
      </section>

      <div className="ose-actions"><p className={`ose-message ${message?.type === 'error' ? 'ose-error' : ''}`}>{message?.text || 'Internal changes write directly to Airtable; public publishing stays approval controlled.'}</p><button type="button" className="ose-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save show file'}</button></div>
    </div>
  )
}
