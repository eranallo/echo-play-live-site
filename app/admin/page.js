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
    eyebrow: 'Next Step',
    title: 'Read-Only Airtable',
    body: 'Next we connect upcoming shows, bands, and venues in a read-only mode before allowing agent-generated drafts.',
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

export default function AdminPage() {
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
              Foundation
            </div>
            <p style={{ color: 'var(--c-text-dim)', marginTop: 'var(--s-3)', lineHeight: 'var(--lh-snug)' }}>
              No private data is displayed yet. This keeps the first admin release safe and reviewable.
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
