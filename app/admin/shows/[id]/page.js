import CampaignDraftPanel from '@/components/admin/CampaignDraftPanel'
import ShowControls from '@/components/admin/ShowControls'
import { getAdminShowDetail } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

function StatusPill({ children, active }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
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

function Section({ title, eyebrow, children }) {
  return (
    <section style={{
      border: '1px solid var(--c-border)',
      background: 'rgba(255, 255, 255, 0.015)',
      padding: 'var(--s-6)',
    }}>
      {eyebrow && (
        <div className="section-label" style={{ marginBottom: 'var(--s-3)' }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontFamily: 'var(--ff-display)',
        fontSize: 'var(--t-h3)',
        letterSpacing: 'var(--ls-display)',
        marginBottom: 'var(--s-5)',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function DetailGrid({ rows }) {
  return (
    <div style={{ display: 'grid', gap: '1px', background: 'var(--c-border-subtle)' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(150px, 220px) 1fr',
          gap: 'var(--s-4)',
          background: 'var(--c-bg)',
          padding: 'var(--s-3) var(--s-4)',
        }}>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--c-text-faint)',
          }}>
            {label}
          </div>
          <div style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-snug)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}

function Checklist({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s-3)' }}>
      {items.map(item => (
        <div key={item.label} style={{
          border: `1px solid ${item.complete ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
          background: item.complete ? 'rgba(212, 160, 23, 0.06)' : 'var(--c-surface-2)',
          padding: 'var(--s-4)',
        }}>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: item.complete ? 'var(--c-epl)' : 'var(--c-text-faint)',
            marginBottom: 'var(--s-2)',
          }}>
            {item.complete ? 'Complete' : 'Open'}
          </div>
          <div style={{ color: 'var(--c-text-muted)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default async function AdminShowDetailPage({ params }) {
  const resolvedParams = await params
  const showId = resolvedParams?.id
  const detail = showId
    ? await getAdminShowDetail(showId)
    : { ok: false, show: null, error: 'No show ID was provided in the admin route.' }

  if (!detail.ok || !detail.show) {
    return (
      <main style={{ minHeight: '100vh', padding: 'clamp(96px, 10vw, 140px) var(--gutter-fluid)', background: 'var(--c-bg)' }}>
        <section style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
          <a href="/admin" style={{ color: 'var(--c-epl)', textDecoration: 'none', fontFamily: 'var(--ff-label)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ← Back to Command Center
          </a>
          <div style={{ marginTop: 'var(--s-7)', border: '1px solid var(--c-epl-line)', background: 'rgba(212, 160, 23, 0.06)', padding: 'var(--s-6)', color: 'var(--c-text-muted)' }}>
            <strong style={{ color: 'var(--c-epl)' }}>Show detail could not be loaded.</strong>
            <br />
            {detail.error}
          </div>
        </section>
      </main>
    )
  }

  const show = detail.show

  return (
    <main style={{
      minHeight: '100vh',
      padding: 'clamp(96px, 10vw, 140px) var(--gutter-fluid)',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--c-epl-soft) 0%, transparent 60%), var(--c-bg)',
    }}>
      <section style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
        <a href="/admin" style={{ color: 'var(--c-epl)', textDecoration: 'none', fontFamily: 'var(--ff-label)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ← Back to Command Center
        </a>

        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--s-7)',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 'var(--s-7)',
          marginTop: 'var(--s-6)',
          marginBottom: 'var(--s-7)',
        }}>
          <div style={{ maxWidth: '820px' }}>
            <div className="section-label" style={{ color: 'var(--c-epl)', marginBottom: 'var(--s-4)' }}>
              Admin Show Detail
            </div>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'var(--t-display)',
              lineHeight: 'var(--lh-display)',
              letterSpacing: 'var(--ls-display)',
              marginBottom: 'var(--s-4)',
            }}>
              {show.band}
            </h1>
            <p style={{ fontSize: 'var(--t-body-l)', color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)' }}>
              {show.venue} · {show.dateLabel} · {show.startTime}
            </p>
          </div>

          <div style={{
            border: '1px solid var(--c-epl-line)',
            background: 'rgba(212, 160, 23, 0.06)',
            padding: 'var(--s-5)',
            minWidth: '260px',
          }}>
            <div style={{ fontFamily: 'var(--ff-label)', fontSize: 'var(--t-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--c-epl)', marginBottom: 'var(--s-2)' }}>
              Show Status
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '44px', lineHeight: 1 }}>
              {show.needsAttention ? 'Needs Work' : 'On Track'}
            </div>
            <p style={{ color: 'var(--c-text-dim)', marginTop: 'var(--s-3)', lineHeight: 'var(--lh-snug)' }}>
              {show.status} · {show.missingFlags.length} open items
            </p>
          </div>
        </header>

        {show.missingFlags.length > 0 && (
          <section style={{
            border: '1px solid var(--c-epl-line)',
            background: 'rgba(212, 160, 23, 0.06)',
            padding: 'var(--s-5)',
            marginBottom: 'var(--s-6)',
          }}>
            <div className="section-label" style={{ marginBottom: 'var(--s-3)' }}>Needs Attention</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
              {show.missingFlags.map(flag => <StatusPill key={flag} active>{flag}</StatusPill>)}
            </div>
          </section>
        )}

        <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
          <Section eyebrow="Phase 1.4" title="Manual Airtable Updates">
            <ShowControls showId={show.id} notes={show.editableNotes} checklist={show.checklist} />
          </Section>

          <Section eyebrow="Phase 1.6–1.7" title="Show Campaign Agent Draft">
            <CampaignDraftPanel showId={show.id} />
          </Section>

          <Section eyebrow="Status" title="Workflow Checklist">
            <Checklist items={show.checklist} />
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: 'var(--s-6)' }}>
            <Section eyebrow="Advance" title="Logistics">
              <DetailGrid rows={show.logistics} />
            </Section>

            <Section eyebrow="Booking" title="Deal Snapshot">
              <DetailGrid rows={show.deal} />
            </Section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: 'var(--s-6)' }}>
            <Section eyebrow="Team" title="People">
              <DetailGrid rows={show.people} />
            </Section>

            <Section eyebrow="Files" title="Assets & Publishing">
              <DetailGrid rows={show.assets} />
            </Section>
          </div>

          <Section eyebrow="Internal" title="Notes Snapshot">
            <DetailGrid rows={show.notes} />
          </Section>
        </div>
      </section>
    </main>
  )
}
