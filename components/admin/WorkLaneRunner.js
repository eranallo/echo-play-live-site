'use client'

import { useState } from 'react'

const LANES = [
  { kind: 'advance', label: 'Show Advance', helper: 'Call sheet, venue questions, readiness gaps.', group: 'Show Ops' },
  { kind: 'promo', label: 'Promo Plan', helper: 'Event copy, captions, listing language.', group: 'Marketing' },
  { kind: 'design', label: 'Design Brief', helper: 'Canva-ready brief, text, sizes, assets.', group: 'Creative' },
  { kind: 'booking', label: 'Booking / Venue CRM', helper: 'Venue follow-up, deal questions, outreach draft.', group: 'Revenue' },
  { kind: 'finance', label: 'Finance / Settlement', helper: 'Payout fields, expenses, settlement checklist.', group: 'Finance' },
  { kind: 'content', label: 'Content Capture', helper: 'Shot list, recap plan, capture assignments.', group: 'Content' },
  { kind: 'web', label: 'Web / SEO', helper: 'Public listing audit, metadata, indexing checks.', group: 'Website' },
  { kind: 'merch', label: 'Merch Ops', helper: 'Table setup, POS, inventory, closeout notes.', group: 'Show Ops' },
]

function Button({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} className="wl-button">
      {children}
    </button>
  )
}

function SmallList({ title, items }) {
  if (!items?.length) return null
  return (
    <div className="wl-small-block">
      <strong>{title}</strong>
      <ul>
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </div>
  )
}

function SpecialistTasks({ output }) {
  const [busy, setBusy] = useState(null)
  const [created, setCreated] = useState([])
  const [message, setMessage] = useState(null)
  const actions = output?.recommendedNextActions || []

  if (!actions.length) return null

  async function createTask(action, index) {
    setBusy(index)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: action,
          priority: 'Normal',
          source: `Specialist: ${output.specialist?.label || output.lane || 'Unknown'}`,
          notes: [
            output.summary,
            output.show?.title ? `Show: ${output.show.title}` : '',
            output.show?.showId ? `Show ID: ${output.show.showId}` : '',
          ].filter(Boolean).join('\n'),
          status: 'Todo',
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Task creation failed.')
      setCreated(current => [...current, index])
      setMessage({ type: 'success', text: 'Task sent to Airtable.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Task creation failed.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="wl-task-actions">
      <strong>Create tasks from next actions</strong>
      <div className="wl-action-list">
        {actions.map((action, index) => (
          <div key={`${action}-${index}`} className="wl-action-row">
            <span>{action}</span>
            <button disabled={busy !== null || created.includes(index)} onClick={() => createTask(action, index)}>{created.includes(index) ? 'Created' : busy === index ? 'Saving…' : 'Make Task'}</button>
          </div>
        ))}
      </div>
      {message && <p className={`wl-message ${message.type === 'error' ? 'wl-message-error' : ''}`}>{message.text}</p>}
    </div>
  )
}

function PreviewValue({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>)}
      </ul>
    )
  }

  if (value && typeof value === 'object') {
    return (
      <div className="wl-object-grid">
        {Object.entries(value).map(([key, child]) => (
          <div key={key} className="wl-object-row">
            <span>{key.replace(/([A-Z])/g, ' $1')}</span>
            <em>{Array.isArray(child) ? child.join(' · ') : typeof child === 'object' ? JSON.stringify(child) : String(child)}</em>
          </div>
        ))}
      </div>
    )
  }

  return <p>{String(value || '—')}</p>
}

function WorkPreview({ work }) {
  if (!work) return null
  return (
    <div className="wl-work-preview">
      {Object.entries(work).map(([key, value]) => (
        <div key={key} className="wl-work-card">
          <strong>{key.replace(/([A-Z])/g, ' $1')}</strong>
          <PreviewValue value={value} />
        </div>
      ))}
    </div>
  )
}

function OutputBlock({ result }) {
  if (!result?.output) return null
  const output = result.output
  const specialist = output.specialist || {}

  return (
    <article className="wl-output">
      <div className="wl-output-head">
        <div>
          <span className="wl-eyebrow">{specialist.group || output.lane}</span>
          <h3>{output.title}</h3>
        </div>
        <div className="wl-badges">
          <span>{specialist.risk || 'Review'}</span>
          {result.reviewItemId ? <span className="wl-badge-gold">Review queued</span> : <span>Logged</span>}
        </div>
      </div>

      <p className="wl-summary">{output.summary}</p>

      <div className="wl-output-grid">
        <SmallList title="Readout" items={output.executiveReadout} />
        <SmallList title="Next Actions" items={output.recommendedNextActions} />
        <SmallList title="Open Items" items={output.missing} />
      </div>

      <SpecialistTasks output={output} />

      <WorkPreview work={output.work} />

      <details className="wl-details">
        <summary>Raw specialist output</summary>
        <pre>{JSON.stringify(output, null, 2)}</pre>
      </details>

      <div className="wl-log-row">
        {result.aiRunId && <span>AI RUNS: {result.aiRunId}</span>}
        {result.reviewItemId && <a href="/admin/approvals">Open Review Queue →</a>}
        {result.aiRunError && <span className="wl-error">AI RUN log issue: {result.aiRunError}</span>}
        {result.reviewError && <span className="wl-error">Review queue issue: {result.reviewError}</span>}
      </div>
    </article>
  )
}

export default function WorkLaneRunner({ showId }) {
  const [instruction, setInstruction] = useState('')
  const [running, setRunning] = useState(null)
  const [message, setMessage] = useState(null)
  const [results, setResults] = useState([])

  async function run(kind) {
    setRunning(kind)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/work-lanes/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, showId, instruction }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Runner failed.')
      setResults(current => [data, ...current])
      setMessage({ type: 'success', text: 'Specialist run complete.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Runner failed.' })
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="wl-shell">
      <style>{`
        .wl-shell { display:grid; gap:var(--s-5); }
        .wl-note { border:1px solid var(--c-epl-line); background:rgba(212,160,23,.055); color:var(--c-text-muted); padding:var(--s-4); line-height:var(--lh-base); }
        .wl-note strong { color:var(--c-epl); }
        .wl-input { width:100%; border:1px solid var(--c-border); background:var(--c-bg); color:var(--c-text-muted); padding:var(--s-3); font:inherit; line-height:var(--lh-base); resize:vertical; }
        .wl-lanes { display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:var(--s-3); }
        .wl-lane { border:1px solid var(--c-border); background:linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.012)); padding:var(--s-4); display:grid; gap:var(--s-3); min-height:178px; }
        .wl-lane:hover { border-color:var(--c-epl-line); }
        .wl-eyebrow, .wl-lane span { color:var(--c-epl); font-family:var(--ff-label); font-size:10px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
        .wl-lane strong { display:block; color:var(--c-text); font-size:16px; margin-top:6px; }
        .wl-lane p, .wl-summary, .wl-small-block li, .wl-object-row em, .wl-action-row span { color:var(--c-text-dim); line-height:var(--lh-snug); }
        .wl-lane p { font-size:13px; margin-top:8px; }
        .wl-button, .wl-action-row button { align-self:end; border:1px solid var(--c-epl-line); color:var(--c-epl); padding:12px 14px; font-family:var(--ff-label); font-size:11px; letter-spacing:.14em; text-transform:uppercase; background:rgba(212,160,23,.06); cursor:pointer; transition:background .18s ease, color .18s ease, opacity .18s ease; }
        .wl-button:disabled, .wl-action-row button:disabled { opacity:.48; cursor:not-allowed; color:var(--c-text-faint); border-color:var(--c-border); background:var(--c-surface-2); }
        .wl-button:not(:disabled):hover, .wl-action-row button:not(:disabled):hover { background:var(--c-epl); color:var(--c-bg); }
        .wl-message { color:var(--c-epl); line-height:var(--lh-base); }
        .wl-message-error { color:#f3a6a6; }
        .wl-results { display:grid; gap:var(--s-4); }
        .wl-output { border:1px solid var(--c-border); background:var(--c-surface-2); padding:var(--s-5); display:grid; gap:var(--s-4); }
        .wl-output-head { display:flex; justify-content:space-between; gap:var(--s-3); flex-wrap:wrap; }
        .wl-output h3 { font-family:var(--ff-display); font-size:var(--t-h3); letter-spacing:var(--ls-display); line-height:.92; margin-top:6px; }
        .wl-badges { display:flex; gap:8px; flex-wrap:wrap; align-items:flex-start; }
        .wl-badges span { border:1px solid var(--c-border); color:var(--c-text-dim); padding:6px 8px; font-family:var(--ff-label); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
        .wl-badges .wl-badge-gold { color:var(--c-epl); border-color:var(--c-epl-line); background:rgba(212,160,23,.06); }
        .wl-output-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:var(--s-3); }
        .wl-small-block, .wl-work-card, .wl-task-actions { border:1px solid var(--c-border); background:rgba(0,0,0,.18); padding:var(--s-4); }
        .wl-small-block strong, .wl-work-card strong, .wl-task-actions > strong { display:block; color:var(--c-text-muted); margin-bottom:10px; }
        .wl-small-block ul, .wl-work-card ul { padding-left:18px; display:grid; gap:6px; }
        .wl-action-list { display:grid; gap:8px; }
        .wl-action-row { display:grid; grid-template-columns:1fr auto; gap:12px; align-items:center; border:1px solid var(--c-border); background:var(--c-bg); padding:10px; }
        .wl-action-row button { padding:9px 10px; font-size:10px; }
        .wl-work-preview { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:var(--s-3); }
        .wl-object-grid { display:grid; gap:1px; background:var(--c-border); }
        .wl-object-row { display:grid; grid-template-columns:minmax(110px,.42fr) 1fr; gap:10px; background:var(--c-bg); padding:9px 10px; }
        .wl-object-row span { color:var(--c-text-faint); font-family:var(--ff-label); font-size:9px; letter-spacing:.12em; text-transform:uppercase; }
        .wl-object-row em { font-style:normal; overflow-wrap:anywhere; }
        .wl-details { border:1px solid var(--c-border); padding:var(--s-3); }
        .wl-details summary { cursor:pointer; color:var(--c-epl); font-family:var(--ff-label); font-size:11px; letter-spacing:.14em; text-transform:uppercase; }
        .wl-details pre { white-space:pre-wrap; overflow:auto; color:var(--c-text-dim); background:var(--c-bg); border:1px solid var(--c-border); padding:var(--s-3); font-size:12px; line-height:1.5; margin-top:var(--s-3); }
        .wl-log-row { display:flex; flex-wrap:wrap; gap:12px; color:var(--c-text-faint); font-size:12px; }
        .wl-log-row a { color:var(--c-epl); font-family:var(--ff-label); font-size:11px; letter-spacing:.14em; text-transform:uppercase; text-decoration:none; }
        .wl-error { color:#f3a6a6; }
        @media(max-width:640px){ .wl-output { padding:var(--s-4); } .wl-object-row, .wl-action-row { grid-template-columns:1fr; } }
      `}</style>

      <div className="wl-note">
        <strong>Specialist guardrail:</strong> outputs can draft, plan, and queue work. Public posts, emails, website changes, booking confirmations, and financial changes still require approval before action.
      </div>

      <textarea value={instruction} onChange={event => setInstruction(event.target.value)} rows={3} placeholder="Optional instruction for this run… Example: make this less salesy, focus on venue ops, or build for mobile-first promo." className="wl-input" />

      <div className="wl-lanes">
        {LANES.map(lane => (
          <div key={lane.kind} className="wl-lane">
            <div>
              <span>{lane.group}</span>
              <strong>{lane.label}</strong>
              <p>{lane.helper}</p>
            </div>
            <Button onClick={() => run(lane.kind)} disabled={Boolean(running)}>{running === lane.kind ? 'Running…' : 'Run'}</Button>
          </div>
        ))}
      </div>

      {message && <p className={`wl-message ${message.type === 'error' ? 'wl-message-error' : ''}`}>{message.text}</p>}

      <div className="wl-results">
        {results.map((result, index) => <OutputBlock key={index} result={result} />)}
      </div>
    </div>
  )
}
