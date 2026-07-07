'use client'

import { useState } from 'react'

function ActionButton({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      border: '1px solid var(--c-epl-line)',
      color: disabled ? 'var(--c-text-faint)' : 'var(--c-epl)',
      padding: '12px 14px',
      fontFamily: 'var(--ff-label)',
      fontSize: '11px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      background: disabled ? 'var(--c-surface-2)' : 'rgba(212, 160, 23, 0.06)',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      {children}
    </button>
  )
}

function Message({ message }) {
  if (!message) return null

  return (
    <div style={{
      border: `1px solid ${message.type === 'error' ? '#8a3030' : 'var(--c-epl-line)'}`,
      background: message.type === 'error' ? 'rgba(138, 48, 48, 0.12)' : 'rgba(212, 160, 23, 0.06)',
      color: message.type === 'error' ? '#f3a6a6' : 'var(--c-text-muted)',
      padding: 'var(--s-4)',
      lineHeight: 'var(--lh-base)',
    }}>
      {message.text}
    </div>
  )
}

function MiniCard({ label, value, sub }) {
  return (
    <div style={{
      border: '1px solid var(--c-border)',
      background: 'var(--c-surface-2)',
      padding: 'var(--s-4)',
    }}>
      <div style={{ fontFamily: 'var(--ff-label)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 'var(--s-2)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '38px', lineHeight: 0.9, letterSpacing: 'var(--ls-display)', color: 'var(--c-epl)' }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ color: 'var(--c-text-dim)', fontSize: '13px', marginTop: 'var(--s-2)' }}>{sub}</div>}
    </div>
  )
}

function Section({ title, eyebrow, children }) {
  return (
    <section style={{
      border: '1px solid var(--c-border)',
      background: 'rgba(255, 255, 255, 0.015)',
      padding: 'var(--s-5)',
      display: 'grid',
      gap: 'var(--s-4)',
    }}>
      {eyebrow && <div className="section-label">{eyebrow}</div>}
      <h2 style={{
        fontFamily: 'var(--ff-display)',
        fontSize: 'var(--t-h3)',
        letterSpacing: 'var(--ls-display)',
        lineHeight: 0.95,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Pill({ children, active }) {
  return (
    <span style={{
      display: 'inline-flex',
      border: `1px solid ${active ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
      background: active ? 'rgba(212, 160, 23, 0.08)' : 'var(--c-surface-2)',
      color: active ? 'var(--c-epl)' : 'var(--c-text-dim)',
      padding: '5px 8px',
      fontFamily: 'var(--ff-label)',
      fontSize: '10px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function PriorityItem({ item }) {
  return (
    <article style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-4)', display: 'grid', gap: 'var(--s-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '30px', letterSpacing: 'var(--ls-display)', lineHeight: 0.95 }}>
          {item.title || item.label || 'Priority'}
        </h3>
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          <Pill active>{item.urgency || 'Priority'}</Pill>
          <Pill>{item.ownerSpecialist || item.specialist || 'Chief of Staff'}</Pill>
        </div>
      </div>
      {item.showLabel && <p style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.showLabel}</p>}
      {item.reason && <p style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)' }}>{item.reason}</p>}
      {item.recommendedAction && <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-base)' }}>{item.recommendedAction}</p>}
      {item.showId && (
        <a href={`/admin/shows/${item.showId}`} style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Open Show →
        </a>
      )}
    </article>
  )
}

function SpecialistCard({ specialist }) {
  return (
    <article style={{ border: '1px solid var(--c-border-subtle)', background: 'var(--c-surface-2)', padding: 'var(--s-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--ff-label)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-epl)', marginBottom: 'var(--s-2)' }}>
            {specialist.lane || 'Specialist'}
          </div>
          <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '32px', letterSpacing: 'var(--ls-display)', lineHeight: 0.9 }}>{specialist.name}</h3>
        </div>
        <Pill active={specialist.openItems > 0}>{specialist.openItems || 0} Open</Pill>
      </div>
      {Array.isArray(specialist.topItems) && specialist.topItems.length > 0 && (
        <ul style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem', marginTop: 'var(--s-4)' }}>
          {specialist.topItems.map((item, index) => (
            <li key={`${specialist.name}-${index}`}>{item.title} — {item.showLabel}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function ChiefOfStaffConsole({ initialBrief }) {
  const [brief, setBrief] = useState(initialBrief)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function generateBrief() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/chief-of-staff/brief', { method: 'POST' })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Chief of Staff brief failed.')
      }

      setBrief(data.brief)
      setMessage({
        type: 'success',
        text: data.aiRunId
          ? `Brief generated and logged to AI RUNS. Run: ${data.aiRunId}`
          : data.aiRunError
            ? `Brief generated. Run log failed: ${data.aiRunError}`
            : 'Brief generated.',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Chief of Staff brief failed.' })
    } finally {
      setLoading(false)
    }
  }

  const health = brief?.health || {}
  const priorities = Array.isArray(brief?.priorities) ? brief.priorities : []
  const specialists = Array.isArray(brief?.specialistQueue) ? brief.specialistQueue : []
  const risks = Array.isArray(brief?.risks) ? brief.risks : []
  const nextActions = Array.isArray(brief?.nextActions) ? brief.nextActions : []
  const quickWins = Array.isArray(brief?.quickWins) ? brief.quickWins : []
  const approvals = Array.isArray(brief?.approvalsToReview) ? brief.approvalsToReview : []

  return (
    <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <ActionButton onClick={generateBrief} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Fresh Brief'}
        </ActionButton>
        <Pill active>{brief?.mode === 'ai' ? 'AI Brief' : 'Deterministic Brief'}</Pill>
        {brief?.usedFallback && <Pill>Fallback Safe Mode</Pill>}
      </div>

      <Message message={message} />
      {brief?.generationWarning && <Message message={{ type: 'error', text: brief.generationWarning }} />}

      <Section eyebrow="Chief of Staff" title="Command Brief">
        <p style={{ color: 'var(--c-text-muted)', fontSize: 'var(--t-body-l)', lineHeight: 'var(--lh-base)' }}>
          {brief?.executiveSummary || 'No executive summary generated yet.'}
        </p>
        <p style={{ color: 'var(--c-epl)', lineHeight: 'var(--lh-base)' }}>
          {brief?.todayFocus || 'Generate a fresh brief to establish today’s focus.'}
        </p>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--s-4)' }}>
        <MiniCard label="Upcoming" value={health.upcomingShows} sub="shows loaded" />
        <MiniCard label="Attention" value={health.showsNeedingAttention} sub="shows with gaps" />
        <MiniCard label="Approvals" value={health.pendingApprovals} sub="pending review" />
        <MiniCard label="Agents" value={health.activeAgents} sub={`tables ${health.supportTablesReady || '—'}`} />
      </div>

      <Section eyebrow="Triage" title="Priority Queue">
        {priorities.length > 0 ? (
          <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
            {priorities.slice(0, 10).map((item, index) => <PriorityItem key={`${item.title}-${item.showId || index}`} item={item} />)}
          </div>
        ) : (
          <p style={{ color: 'var(--c-text-muted)' }}>No priorities generated yet.</p>
        )}
      </Section>

      <Section eyebrow="Specialists" title="Dispatch Board">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--s-4)' }}>
          {specialists.map(specialist => <SpecialistCard key={specialist.name} specialist={specialist} />)}
        </div>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'var(--s-5)' }}>
        <Section eyebrow="Risk" title="Watch List">
          {risks.length ? (
            <ul style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem' }}>
              {risks.map((risk, index) => <li key={index}>{risk}</li>)}
            </ul>
          ) : <p style={{ color: 'var(--c-text-muted)' }}>No risks called out.</p>}
        </Section>

        <Section eyebrow="Next" title="Actions">
          {nextActions.length ? (
            <ol style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem' }}>
              {nextActions.map((action, index) => <li key={index}>{action}</li>)}
            </ol>
          ) : <p style={{ color: 'var(--c-text-muted)' }}>No next actions generated.</p>}
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'var(--s-5)' }}>
        <Section eyebrow="Easy Wins" title="Quick Wins">
          {quickWins.length ? (
            <ul style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem' }}>
              {quickWins.map((item, index) => <li key={index}>{item.label} — {item.showLabel}</li>)}
            </ul>
          ) : <p style={{ color: 'var(--c-text-muted)' }}>No quick wins detected.</p>}
        </Section>

        <Section eyebrow="Review" title="Approvals Waiting">
          {approvals.length ? (
            <ul style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem' }}>
              {approvals.map((item, index) => <li key={item.id || index}>{item.item || item.name || 'Approval item'}</li>)}
            </ul>
          ) : <p style={{ color: 'var(--c-text-muted)' }}>No pending approvals detected.</p>}
        </Section>
      </div>
    </div>
  )
}
