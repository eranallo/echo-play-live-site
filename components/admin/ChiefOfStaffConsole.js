'use client'

import { useState } from 'react'

function ActionButton({ children, disabled, onClick, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
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

function SuggestedAction({ action }) {
  return (
    <a href={action.href || '/admin/chief-of-staff'} style={{
      display: 'block',
      border: `1px solid ${action.requiresApproval ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
      background: action.requiresApproval ? 'rgba(212, 160, 23, 0.06)' : 'var(--c-surface-2)',
      color: 'inherit',
      textDecoration: 'none',
      padding: 'var(--s-3)',
    }}>
      <div style={{ display: 'flex', gap: 'var(--s-2)', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <strong style={{ color: action.requiresApproval ? 'var(--c-epl)' : 'var(--c-text-muted)' }}>{action.label}</strong>
        {action.requiresApproval && <Pill active>Approval</Pill>}
      </div>
      {action.specialist && <div style={{ color: 'var(--c-text-faint)', fontFamily: 'var(--ff-label)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 'var(--s-2)' }}>{action.specialist}</div>}
      {action.description && <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-snug)', marginTop: 'var(--s-2)' }}>{action.description}</p>}
    </a>
  )
}

function ChatResponse({ response }) {
  if (!response) return null

  const routing = Array.isArray(response.specialistRouting) ? response.specialistRouting : []
  const actions = Array.isArray(response.suggestedActions) ? response.suggestedActions : []
  const shows = Array.isArray(response.referencedShows) ? response.referencedShows : []
  const warnings = Array.isArray(response.approvalWarnings) ? response.approvalWarnings : []
  const followUps = Array.isArray(response.followUpQuestions) ? response.followUpQuestions : []

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <p style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', whiteSpace: 'pre-wrap' }}>{response.answer}</p>

      {shows.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {shows.map(show => (
            <a key={show.id || show.href} href={show.href || `/admin/shows/${show.id}`} style={{ color: 'var(--c-epl)', textDecoration: 'none' }}>
              <Pill active>{show.label || 'Open Show'}</Pill>
            </a>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
          <div className="section-label">Suggested Actions</div>
          {actions.map((action, index) => <SuggestedAction key={`${action.label}-${index}`} action={action} />)}
        </div>
      )}

      {routing.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
          <div className="section-label">Specialist Routing</div>
          {routing.map((item, index) => (
            <div key={`${item.specialist}-${index}`} style={{ border: '1px solid var(--c-border-subtle)', background: 'var(--c-surface-2)', padding: 'var(--s-3)' }}>
              <strong style={{ color: 'var(--c-epl)' }}>{item.specialist || 'Chief of Staff'}</strong>
              {item.reason && <p style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-snug)', marginTop: 'var(--s-2)' }}>{item.reason}</p>}
              {Array.isArray(item.actions) && item.actions.length > 0 && (
                <ul style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem', marginTop: 'var(--s-2)' }}>
                  {item.actions.map((action, actionIndex) => <li key={actionIndex}>{action}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <details style={{ border: '1px solid var(--c-epl-line)', background: 'rgba(212, 160, 23, 0.04)', padding: 'var(--s-3)', color: 'var(--c-text-muted)' }}>
          <summary style={{ color: 'var(--c-epl)', cursor: 'pointer', fontFamily: 'var(--ff-label)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '11px' }}>Approval Guardrails</summary>
          <ul style={{ lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem', marginTop: 'var(--s-3)' }}>
            {warnings.slice(0, 8).map((warning, index) => <li key={index}>{warning}</li>)}
          </ul>
        </details>
      )}

      {followUps.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {followUps.slice(0, 3).map(question => <Pill key={question}>{question}</Pill>)}
        </div>
      )}
    </div>
  )
}

function ChiefOfStaffChat() {
  const [question, setQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I’m ready. Ask me what needs attention, which specialist should handle something, or how to get a show ready.',
      response: null,
    },
  ])

  async function askQuestion(event, overrideQuestion) {
    event?.preventDefault()
    const cleanQuestion = String(overrideQuestion || question).trim()
    if (!cleanQuestion) return

    const userMessage = { role: 'user', content: cleanQuestion }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setQuestion('')
    setSending(true)
    setChatError(null)

    try {
      const response = await fetch('/api/admin/chief-of-staff/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cleanQuestion,
          history: nextMessages.slice(-8).map(message => ({ role: message.role, content: message.content })),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Chief of Staff chat failed.')
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.response?.answer || 'I generated a response.',
        response: data.response,
        aiRunId: data.aiRunId,
        aiRunError: data.aiRunError,
      }
      setMessages(current => [...current, assistantMessage])
    } catch (error) {
      setChatError(error?.message || 'Chief of Staff chat failed.')
      setMessages(current => [...current, { role: 'assistant', content: 'I hit an issue answering that. Try again or narrow the question to a specific show.', response: null }])
    } finally {
      setSending(false)
    }
  }

  const quickPrompts = [
    'What needs my attention today?',
    'Which shows need graphics?',
    'What approvals are waiting?',
    'What should the Campaign Agent handle next?',
  ]

  return (
    <Section eyebrow="Conversation" title="Talk to Your Chief of Staff">
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {quickPrompts.map(prompt => (
            <button key={prompt} type="button" onClick={event => askQuestion(event, prompt)} disabled={sending} style={{
              border: '1px solid var(--c-border)',
              background: 'var(--c-surface-2)',
              color: 'var(--c-text-muted)',
              padding: '8px 10px',
              fontFamily: 'var(--ff-label)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: sending ? 'not-allowed' : 'pointer',
            }}>
              {prompt}
            </button>
          ))}
        </div>

        <div style={{
          border: '1px solid var(--c-border)',
          background: 'rgba(0, 0, 0, 0.16)',
          padding: 'var(--s-4)',
          display: 'grid',
          gap: 'var(--s-4)',
          maxHeight: '760px',
          overflow: 'auto',
        }}>
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} style={{
              justifySelf: message.role === 'user' ? 'end' : 'start',
              maxWidth: 'min(100%, 860px)',
              border: `1px solid ${message.role === 'user' ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
              background: message.role === 'user' ? 'rgba(212, 160, 23, 0.07)' : 'var(--c-surface-2)',
              padding: 'var(--s-4)',
              color: 'var(--c-text-muted)',
            }}>
              <div style={{ fontFamily: 'var(--ff-label)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: message.role === 'user' ? 'var(--c-epl)' : 'var(--c-text-faint)', marginBottom: 'var(--s-2)' }}>
                {message.role === 'user' ? 'You' : 'Chief of Staff'}
              </div>
              {message.response ? <ChatResponse response={message.response} /> : <p style={{ lineHeight: 'var(--lh-base)' }}>{message.content}</p>}
              {message.aiRunId && <p style={{ color: 'var(--c-text-faint)', fontSize: '12px', marginTop: 'var(--s-3)' }}>Logged to AI RUNS: {message.aiRunId}</p>}
              {message.aiRunError && <p style={{ color: '#f3a6a6', fontSize: '12px', marginTop: 'var(--s-3)' }}>Run log failed: {message.aiRunError}</p>}
            </div>
          ))}
          {sending && <p style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Thinking…</p>}
        </div>

        {chatError && <Message message={{ type: 'error', text: chatError }} />}

        <form onSubmit={askQuestion} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--s-3)' }}>
          <textarea
            value={question}
            onChange={event => setQuestion(event.target.value)}
            rows={3}
            placeholder="Ask your Chief of Staff…"
            style={{
              width: '100%',
              border: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
              color: 'var(--c-text-muted)',
              padding: 'var(--s-3)',
              font: 'inherit',
              lineHeight: 'var(--lh-base)',
              resize: 'vertical',
            }}
          />
          <ActionButton type="submit" disabled={sending || !question.trim()}>
            Send
          </ActionButton>
        </form>
      </div>
    </Section>
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

      <ChiefOfStaffChat />

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
