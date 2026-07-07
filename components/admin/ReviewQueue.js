'use client'

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
  const items = approvals.map(item => ({ ...item, payload: parsePayload(item.proposedChange) }))

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
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
          {item.payload?.showId && (
            <a href={`/admin/shows/${item.payload.showId}`} style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>Open Related Show →</a>
          )}
        </article>
      ))}
    </div>
  )
}
