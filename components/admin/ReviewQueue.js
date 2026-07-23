'use client'

import { useState } from 'react'

function Pill({ children, active }) {
  return (
    <span style={{ display: 'inline-flex', border: `1px solid ${active ? 'var(--c-epl-line)' : 'var(--c-border)'}`, background: active ? 'rgba(212, 160, 23, 0.08)' : 'var(--c-surface-2)', color: active ? 'var(--c-epl)' : 'var(--c-text-dim)', padding: '5px 8px', fontFamily: 'var(--ff-label)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

function parsePayload(text) {
  if (!text || typeof text !== 'string') return null
  const start = text.indexOf('{')
  if (start === -1) return null
  try { return JSON.parse(text.slice(start)) } catch { return null }
}

export default function ReviewQueue({ approvals = [] }) {
  const [items, setItems] = useState(() => approvals.map(item => ({ ...item, payload: parsePayload(item.proposedChange) })))
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState(null)

  async function decide(item, status) {
    setBusyId(item.id)
    setMessage(null)
    try {
      const executesEventDescription = status === 'Approved' && (item.actionType === 'save_event_description' || item.payload?.actionType === 'save_event_description')
      const response = await fetch(
        executesEventDescription ? `/api/admin/approvals/${item.id}/approve` : `/api/admin/approvals/${item.id}`,
        {
          method: executesEventDescription ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: executesEventDescription ? undefined : JSON.stringify({ status }),
        }
      )
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Approval update failed.')
      setItems(current => current.map(entry => entry.id === item.id ? { ...entry, status } : entry))
      setMessage({ type: 'success', text: executesEventDescription ? 'Approved and saved to the show.' : `Marked ${status.toLowerCase()}.` })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Approval update failed.' })
    } finally {
      setBusyId('')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      {message && <p style={{ color: message.type === 'error' ? '#f3a6a6' : 'var(--c-epl)' }}>{message.text}</p>}
      {items.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>No review items found.</p>
      ) : items.map(item => (
        <article key={item.id} style={{ border: '1px solid var(--c-border)', background: item.status === 'Pending' ? 'rgba(212, 160, 23, 0.04)' : 'var(--c-surface-2)', padding: 'var(--s-5)', display: 'grid', gap: 'var(--s-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'var(--t-h3)', letterSpacing: 'var(--ls-display)', lineHeight: 0.95 }}>{item.item}</h2>
            <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
              <Pill active={item.status === 'Pending'}>{item.status}</Pill>
              <Pill>{item.riskLevel}</Pill>
            </div>
          </div>
          <p style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', whiteSpace: 'pre-wrap' }}>{item.proposedChange || 'No notes.'}</p>
          {(item.payload?.showId || item.relatedShowIds?.[0]) && (
            <a href={`/admin/shows/${item.payload?.showId || item.relatedShowIds[0]}`} style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>Open Related Show →</a>
          )}
          {item.status === 'Pending' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button disabled={busyId === item.id} onClick={() => decide(item, 'Approved')} style={{ border: 0, background: 'var(--c-epl)', color: '#050505', minHeight: 42, padding: '0 13px', fontFamily: 'var(--ff-label)', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Approve</button>
              <button disabled={busyId === item.id} onClick={() => decide(item, 'Changes Requested')} style={{ border: '1px solid var(--c-border)', background: 'transparent', color: 'var(--c-text-muted)', minHeight: 42, padding: '0 13px', fontFamily: 'var(--ff-label)', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Request changes</button>
              <button disabled={busyId === item.id} onClick={() => decide(item, 'Rejected')} style={{ border: '1px solid #8a3030', background: 'transparent', color: '#f3a6a6', minHeight: 42, padding: '0 13px', fontFamily: 'var(--ff-label)', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Reject</button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
