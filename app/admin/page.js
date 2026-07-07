import { getAdminShowsOverview } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

const statusCards = [
  {
    eyebrow: 'Phase 1',
    title: 'Admin Shell',
    body: 'Private command-center route is active. This page is intentionally not linked from the public navigation.',
  },
  {
    eyebrow: 'Security',
    title: 'Protected Access',
    body: 'The /admin route requires ADMIN_USERNAME and ADMIN_PASSWORD environment variables before it can be viewed.',
  },
  {
    eyebrow: 'Data Layer',
    title: 'Read-Only Airtable',
    body: 'Upcoming shows are now pulled server-side from Airtable. No write actions or public data exposure yet.',
  },
]

const workflowCards = [
  'Show Campaign Agent',
  'Approval Queue',
  'AI Run Log',
  'Creative Briefs',
  'Website Publishing',
  'Venue Follow-Ups',
]

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

function ShowCard({ show }) {
  return (
    <article style={{
      border: '1px solid var(--c-border)',
      background: show.needsAttention ? 'rgba(212, 160, 23, 0.035)' : 'rgba(255, 255, 255, 0.015)',
      padding: 'var(--s-5)',
      display: 'grid',
      gap: 'var(--s-4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
        <div>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: 'var(--t-label-s)',
            letterSpacing: 'var(--ls-label-tight)',
            color: 'var(--c-epl)',
            textTransform: 'uppercase',
            marginBottom: 'var(--s-2)',
          }}>
            {show.dateLabel} · {show.startTime}
          </div>
          <h3 style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'clamp(28px, 3vw, 42px)',
            letterSpacing: 'var(--ls-display)',
            lineHeight: 0.95,
          }}>
            {show.band}
          </h3>
          <p style={{ color: 'var(--c-text-muted)', marginTop: 'var(--s-2)', lineHeight: 'var(--lh-snug)' }}>
            {show.venue}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <StatusPill active={show.needsAttention}>
            {show.needsAttention ? 'Needs Attention' : 'On Track'}
          </StatusPill>
          <p style={{ color: 'var(--c-text-faint)', marginTop: 'var(--s-2)', fontSize: '13px' }}>
            {show.status}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
        <StatusPill active={show.contractSigned}>Contract</StatusPill>
        <StatusPill active={show.graphicCreated}>Graphic</StatusPill>
        <StatusPill active={show.facebookEventCreated}>FB Event</StatusPill>
        <StatusPill active={show.bandsintownPosted}>Bandsintown</StatusPill>
        <StatusPill active={show.promotionReleased}>Promo</StatusPill>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'var(--s-3)',
        color: 'var(--c-text-dim)',
        fontSize: '14px',
      }}>
        <div><strong style={{ color: 'var(--c-text-muted)' }}>Age:</strong> {show.ageRestriction}</div>
        <div><strong style={{ color: 'var(--c-text-muted)' }}>Ticket:</strong> {show.ticketPrice || (show.ticketUrl ? 'Link Available' : 'TBD')}</div>
      </div>

      {show.missingFlags.length > 0 && (
        <div style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-3)' }}>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            color: 'var(--c-text-faint)',
            textTransform: 'uppercase',
            marginBottom: 'var(--s-2)',
          }}>
            Missing / Incomplete
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
            {show.missingFlags.map(flag => (
              <StatusPill key={flag} active>{flag}</StatusPill>
            ))}
          </div>
        </div>
      )}

      <a href={`/admin/shows/${show.id}`} style={{
        justifySelf: 'start',
        border: '1px solid var(--c-epl-line)',
        color: 'var(--c-epl)',
        padding: '10px 14px',
        fontFamily: 'var(--ff-label)',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        background: 'rgba(212, 160, 23, 0.06)',
      }}>
        Open Show Detail
      </a>
    </article>
  )
}

export default async function AdminPage() {
  const showsOverview = await getAdminShowsOverview()

  return (
    <main style={{
      minHeight: '100vh',
      padding: 'clamp(96px, 10vw, 140px) var(--gutter-fluid)',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--c-epl-soft) 0%, transparent 60%), var(--c-bg)',
    }}>
      <section style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--s-7)',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 'var(--s-7)',
          marginBottom: 'var(--s-7)',
        }}>
          <div style={{ maxWidth: '780px' }}>
            <div className="section-label" style={{ marginBottom: 'var(--s-4)', color: 'var(--c-epl)' }}>
              Echo Play Live Private Ops
            </div>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'var(--t-display)',
              lineHeight: 'var(--lh-display)',
              letterSpacing: 'var(--ls-display)',
              marginBottom: 'var(--s-5)',
            }}>
              Command Center
            </h1>
            <p style={{
              maxWidth: '680px',
              fontSize: 'var(--t-body-l)',
              lineHeight: 'var(--lh-base)',
              color: 'var(--c-text-muted)',
            }}>
              Phase 1 creates the private admin foundation for Echo Play Live. This page is the safe starting point for shows, campaigns, approvals, agent logs, and future specialist workflows.
            </p>
          </div>

          <div style={{
            border: '1px solid var(--c-epl-line)',
            background: 'rgba(212, 160, 23, 0.06)',
            padding: 'var(--s-5)',
            minWidth: '260px',
          }}>
            <div style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
              marginBottom: 'var(--s-2)',
            }}>
              Current Status
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '44px', lineHeight: 1 }}>
              {showsOverview.ok ? 'Live Data' : 'Foundation'}
            </div>
            <p style={{ color: 'var(--c-text-dim)', marginTop: 'var(--s-3)', lineHeight: 'var(--lh-snug)' }}>
              {showsOverview.ok
                ? `${showsOverview.counts.total} upcoming shows loaded. ${showsOverview.counts.needsAttention} need attention.`
                : 'Airtable data is not loading yet. Check env vars and deployment logs.'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--s-5)',
          marginBottom: 'var(--s-8)',
        }}>
          {statusCards.map(card => (
            <article key={card.title} style={{
              border: '1px solid var(--c-border)',
              background: 'var(--c-surface-2)',
              padding: 'var(--s-5)',
            }}>
              <div style={{
                fontFamily: 'var(--ff-label)',
                fontSize: 'var(--t-label-s)',
                letterSpacing: 'var(--ls-label-tight)',
                textTransform: 'uppercase',
                color: 'var(--c-epl)',
                marginBottom: 'var(--s-3)',
              }}>
                {card.eyebrow}
              </div>
              <h2 style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'var(--t-h3)',
                letterSpacing: 'var(--ls-display)',
                marginBottom: 'var(--s-3)',
              }}>
                {card.title}
              </h2>
              <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-base)' }}>
                {card.body}
              </p>
            </article>
          ))}
        </div>

        <section style={{
          border: '1px solid var(--c-border)',
          background: 'rgba(255, 255, 255, 0.015)',
          padding: 'var(--s-6)',
          marginBottom: 'var(--s-8)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--s-5)', flexWrap: 'wrap', marginBottom: 'var(--s-5)' }}>
            <div>
              <div className="section-label" style={{ marginBottom: 'var(--s-3)' }}>
                Upcoming Shows
              </div>
              <h2 style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'var(--t-h2)',
                letterSpacing: 'var(--ls-display)',
                lineHeight: 1,
              }}>
                Read-Only Airtable Dashboard
              </h2>
            </div>
            {showsOverview.ok && (
              <StatusPill active>
                {showsOverview.counts.needsAttention} Need Attention
              </StatusPill>
            )}
          </div>

          {!showsOverview.ok ? (
            <div style={{
              border: '1px solid var(--c-epl-line)',
              background: 'rgba(212, 160, 23, 0.06)',
              padding: 'var(--s-5)',
              color: 'var(--c-text-muted)',
              lineHeight: 'var(--lh-base)',
            }}>
              <strong style={{ color: 'var(--c-epl)' }}>Airtable is not connected on this deployment.</strong>
              <br />
              {showsOverview.error}
            </div>
          ) : showsOverview.shows.length === 0 ? (
            <p style={{ color: 'var(--c-text-dim)' }}>No upcoming shows found.</p>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
              {showsOverview.shows.map(show => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </section>

        <section style={{
          border: '1px solid var(--c-border)',
          background: 'rgba(255, 255, 255, 0.015)',
          padding: 'var(--s-6)',
        }}>
          <div className="section-label" style={{ marginBottom: 'var(--s-4)' }}>
            Planned Admin Modules
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--s-3)',
          }}>
            {workflowCards.map(name => (
              <div key={name} style={{
                border: '1px solid var(--c-border-subtle)',
                background: 'var(--c-surface-2)',
                padding: 'var(--s-4)',
                fontFamily: 'var(--ff-label)',
                fontSize: 'var(--t-body-s)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--c-text-muted)',
              }}>
                {name}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
