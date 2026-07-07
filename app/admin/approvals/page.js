import ReviewQueue from '@/components/admin/ReviewQueue'
import { getAdminOpsFoundation } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  const ops = await getAdminOpsFoundation()

  return (
    <main style={{ minHeight: '100vh', padding: 'clamp(96px, 10vw, 140px) var(--gutter-fluid)', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--c-epl-soft) 0%, transparent 60%), var(--c-bg)' }}>
      <section style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
        <a href="/admin" style={{ color: 'var(--c-epl)', textDecoration: 'none', fontFamily: 'var(--ff-label)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>← Back to Command Center</a>
        <header style={{ borderBottom: '1px solid var(--c-border)', paddingBottom: 'var(--s-7)', marginTop: 'var(--s-6)', marginBottom: 'var(--s-7)' }}>
          <div className="section-label" style={{ color: 'var(--c-epl)', marginBottom: 'var(--s-4)' }}>Phase 3</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'var(--t-display)', lineHeight: 'var(--lh-display)', letterSpacing: 'var(--ls-display)', marginBottom: 'var(--s-4)' }}>Review Queue</h1>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 'var(--t-body-l)', lineHeight: 'var(--lh-base)', maxWidth: '760px' }}>Generated work and routed tasks land here for review before they become source-of-truth updates.</p>
        </header>
        {!ops.ok && <p style={{ color: '#f3a6a6', marginBottom: 'var(--s-5)' }}>{ops.error}</p>}
        <ReviewQueue approvals={ops.approvals || []} />
      </section>
    </main>
  )
}
