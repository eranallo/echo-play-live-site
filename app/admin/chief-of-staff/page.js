import ChiefOfStaffConsole from '@/components/admin/ChiefOfStaffConsole'
import { generateChiefOfStaffBrief } from '@/lib/admin/chiefOfStaff'

export const dynamic = 'force-dynamic'

export default async function ChiefOfStaffPage() {
  const result = await generateChiefOfStaffBrief({ logRun: false })
  const brief = result.brief

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
          <div style={{ maxWidth: '860px' }}>
            <div className="section-label" style={{ color: 'var(--c-epl)', marginBottom: 'var(--s-4)' }}>
              Executive Layer
            </div>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'var(--t-display)',
              lineHeight: 'var(--lh-display)',
              letterSpacing: 'var(--ls-display)',
              marginBottom: 'var(--s-4)',
            }}>
              Chief of Staff
            </h1>
            <p style={{ fontSize: 'var(--t-body-l)', color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)' }}>
              The Chief of Staff reviews shows, approvals, run logs, and specialist lanes, then turns the current state into a practical dispatch brief. It coordinates the specialists, but keeps risky actions in approval mode.
            </p>
          </div>

          <div style={{
            border: '1px solid var(--c-epl-line)',
            background: 'rgba(212, 160, 23, 0.06)',
            padding: 'var(--s-5)',
            minWidth: '280px',
          }}>
            <div style={{ fontFamily: 'var(--ff-label)', fontSize: 'var(--t-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--c-epl)', marginBottom: 'var(--s-2)' }}>
              Operating Mode
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '44px', lineHeight: 1 }}>
              Dispatch
            </div>
            <p style={{ color: 'var(--c-text-dim)', marginTop: 'var(--s-3)', lineHeight: 'var(--lh-snug)' }}>
              Read, reason, route, and queue. No public or financial action without approval.
            </p>
          </div>
        </header>

        <ChiefOfStaffConsole initialBrief={brief} />
      </section>
    </main>
  )
}
