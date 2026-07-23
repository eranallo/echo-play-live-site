'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const FUNNEL_STEPS = ['Contract', 'Graphic', 'Bandsintown', 'Facebook Event', 'Ads', 'Trailer']

function toIso(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

export default function ShowCreateForm({ options }) {
  const router = useRouter()
  const [form, setForm] = useState({
    Date: '',
    Band: '',
    Venue: '',
    'Lifecycle Stage': 'Inquiry',
    'Operational Owner': 'Evan Ranallo',
    'Publish Date': '',
    'Trailer Load-In Time': '',
    'Load-In Time': '',
    'Sound Check Time': '',
    'Start Time': '',
    'End Time': '',
    'Funnel Plan': ['Contract', 'Graphic', 'Bandsintown', 'Facebook Event'],
    'Show Notes': '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }))
  }

  function toggleFunnel(step) {
    setForm(current => ({
      ...current,
      'Funnel Plan': current['Funnel Plan'].includes(step)
        ? current['Funnel Plan'].filter(item => item !== step)
        : [...current['Funnel Plan'], step],
    }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const dateTimeFields = ['Trailer Load-In Time', 'Load-In Time', 'Sound Check Time', 'Start Time', 'End Time']
      const fields = {
        ...form,
        Band: [form.Band],
        Venue: [form.Venue],
      }
      for (const field of dateTimeFields) fields[field] = toIso(fields[field])

      const response = await fetch('/api/admin/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Show creation failed.')
      router.push(`/admin/shows/${data.show.id}`)
      router.refresh()
    } catch (submissionError) {
      setError(submissionError?.message || 'Show creation failed.')
      setSaving(false)
    }
  }

  return (
    <form className="nsc-form" onSubmit={submit}>
      <style>{`
        .nsc-form{display:grid;gap:var(--s-5)}.nsc-section{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5)}.nsc-section h2{font-family:var(--ff-display);font-size:var(--t-h2);line-height:.9;margin-bottom:var(--s-4)}.nsc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.nsc-field{display:grid;gap:8px}.nsc-field span,.nsc-funnel legend{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl)}.nsc-field input,.nsc-field select,.nsc-field textarea{width:100%;min-height:48px;border:1px solid var(--c-border);background:#060606;color:var(--c-text-muted);padding:10px 12px;font:inherit}.nsc-field textarea{min-height:120px;resize:vertical}.nsc-wide{grid-column:1/-1}.nsc-funnel{border:0;padding:0;margin:0}.nsc-funnel legend{margin-bottom:12px}.nsc-checks{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.nsc-check{border:1px solid var(--c-border);background:#060606;padding:12px;display:flex;gap:9px;align-items:center;color:var(--c-text-muted)}.nsc-check:has(input:checked){border-color:var(--c-epl-line);color:var(--c-epl);background:rgba(212,160,23,.06)}.nsc-actions{display:flex;gap:10px}.nsc-submit,.nsc-cancel{display:inline-flex;min-height:50px;align-items:center;justify-content:center;padding:0 18px;border:1px solid var(--c-epl-line);font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}.nsc-submit{background:var(--c-epl);color:#050505;cursor:pointer}.nsc-cancel{color:var(--c-epl)}.nsc-submit:disabled{opacity:.5}.nsc-error{border:1px solid #8a3030;background:rgba(138,48,48,.1);color:#f3a6a6;padding:var(--s-4)}@media(max-width:720px){.nsc-section{padding:var(--s-4)}.nsc-grid,.nsc-checks{grid-template-columns:1fr}.nsc-wide{grid-column:auto}.nsc-actions{display:grid}.nsc-submit,.nsc-cancel{width:100%}}
      `}</style>

      <section className="nsc-section">
        <h2>Core details</h2>
        <div className="nsc-grid">
          <label className="nsc-field"><span>Date</span><input type="date" required value={form.Date} onChange={event => update('Date', event.target.value)} /></label>
          <label className="nsc-field"><span>Lifecycle stage</span><select value={form['Lifecycle Stage']} onChange={event => update('Lifecycle Stage', event.target.value)}>{options.lifecycleStages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
          <label className="nsc-field"><span>Band</span><select required value={form.Band} onChange={event => update('Band', event.target.value)}><option value="">Select band</option>{options.bands.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="nsc-field"><span>Venue</span><select required value={form.Venue} onChange={event => update('Venue', event.target.value)}><option value="">Select venue</option>{options.venues.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="nsc-field"><span>Operational owner</span><input value={form['Operational Owner']} onChange={event => update('Operational Owner', event.target.value)} /></label>
          <label className="nsc-field"><span>Publish date</span><input type="date" value={form['Publish Date']} onChange={event => update('Publish Date', event.target.value)} /></label>
        </div>
      </section>

      <section className="nsc-section">
        <h2>Initial schedule</h2>
        <div className="nsc-grid">
          {['Trailer Load-In Time', 'Load-In Time', 'Sound Check Time', 'Start Time', 'End Time'].map(field => <label className="nsc-field" key={field}><span>{field}</span><input type="datetime-local" value={form[field]} onChange={event => update(field, event.target.value)} /></label>)}
        </div>
      </section>

      <section className="nsc-section">
        <h2>Prep funnel</h2>
        <fieldset className="nsc-funnel"><legend>Generate readiness requirements for</legend><div className="nsc-checks">{FUNNEL_STEPS.map(step => <label className="nsc-check" key={step}><input type="checkbox" checked={form['Funnel Plan'].includes(step)} onChange={() => toggleFunnel(step)} />{step}</label>)}</div></fieldset>
      </section>

      <section className="nsc-section">
        <h2>Starting notes</h2>
        <label className="nsc-field"><span>Show notes</span><textarea value={form['Show Notes']} onChange={event => update('Show Notes', event.target.value)} /></label>
      </section>

      {error && <div className="nsc-error">{error}</div>}
      <div className="nsc-actions"><button className="nsc-submit" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create show'}</button><a className="nsc-cancel" href="/admin/shows">Cancel</a></div>
    </form>
  )
}
