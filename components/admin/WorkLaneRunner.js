'use client'

import { useState } from 'react'

const LANES = [
  { kind: 'advance', label: 'Run Show Advance', helper: 'Call sheet, checklist, and venue questions' },
  { kind: 'promo', label: 'Run Promo Plan', helper: 'Event copy, captions, and listing draft' },
  { kind: 'design', label: 'Create Design Brief', helper: 'Canva-ready brief and required sizes' },
]

function Button({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ border: '1px solid var(--c-epl-line)', color: disabled ? 'var(--c-text-faint)' : 'var(--c-epl)', padding: '12px 14px', fontFamily: 'var(--ff-label)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: disabled ? 'var(--c-surface-2)' : 'rgba(212,160,23,0.06)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {children}
    </button>
  )
}

function OutputBlock({ result }) {
  if (!result?.output) return null
  const output = result.output
  return (
    <article style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface-2)', padding: 'var(--s-4)', display: 'grid', gap: 'var(--s-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: 'var(--t-h3)', letterSpacing: 'var(--ls-display)', lineHeight: 0.95 }}>{output.title}</h3>
        {result.reviewItemId && <span style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Review queued</span>}
      </div>
      <p style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)' }}>{output.summary}</p>
      <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', color: 'var(--c-text-dim)', background: 'var(--c-bg)', border: '1px solid var(--c-border)', padding: 'var(--s-3)', fontSize: '12px', lineHeight: 1.5 }}>{JSON.stringify(output, null, 2)}</pre>
      {result.aiRunId && <p style={{ color: 'var(--c-text-faint)', fontSize: '12px' }}>Logged to AI RUNS: {result.aiRunId}</p>}
      {result.reviewItemId && <a href="/admin/approvals" style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>Open Review Queue →</a>}
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
      setMessage({ type: 'success', text: 'Work lane completed.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Runner failed.' })
    } finally {
      setRunning(null)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <textarea value={instruction} onChange={event => setInstruction(event.target.value)} rows={3} placeholder="Optional instruction for this run…" style={{ width: '100%', border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text-muted)', padding: 'var(--s-3)', font: 'inherit', lineHeight: 'var(--lh-base)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 'var(--s-3)' }}>
        {LANES.map(lane => (
          <div key={lane.kind} style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface-2)', padding: 'var(--s-4)', display: 'grid', gap: 'var(--s-3)' }}>
            <div>
              <div style={{ color: 'var(--c-text-muted)', fontWeight: 700 }}>{lane.label}</div>
              <p style={{ color: 'var(--c-text-dim)', fontSize: '13px', lineHeight: 'var(--lh-snug)', marginTop: 'var(--s-2)' }}>{lane.helper}</p>
            </div>
            <Button onClick={() => run(lane.kind)} disabled={Boolean(running)}>{running === lane.kind ? 'Running…' : 'Run'}</Button>
          </div>
        ))}
      </div>
      {message && <p style={{ color: message.type === 'error' ? '#f3a6a6' : 'var(--c-epl)', lineHeight: 'var(--lh-base)' }}>{message.text}</p>}
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {results.map((result, index) => <OutputBlock key={index} result={result} />)}
      </div>
    </div>
  )
}
