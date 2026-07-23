import AdminNav from '@/components/admin/AdminNav'
import AdminShowsClient from '@/components/admin/AdminShowsClient'
import { getCachedAdminShowsIndex } from '@/lib/admin/cachedAirtable'

export const dynamic = 'force-dynamic'

export default async function AdminShowsPage() {
  const result = await getCachedAdminShowsIndex()
  const shows = result?.shows || []

  return (
    <main className="as-shell">
      <AdminNav contextLabel="Shows" backHref="/admin" backLabel="Command Center" />
      <style>{`
        .as-shell{min-height:100vh;padding:clamp(82px,8vw,122px) var(--gutter-fluid);padding-bottom:clamp(88px,8vw,122px);background:radial-gradient(circle at 8% 0%,rgba(212,160,23,.18),transparent 34%),linear-gradient(180deg,#101010,#060606 44%,#030303);color:var(--c-text)}.as-wrap{max-width:var(--layout-max);margin:0 auto}.as-hero{display:flex;justify-content:space-between;gap:var(--s-5);align-items:end;border-bottom:1px solid var(--c-border);padding-bottom:var(--s-6);margin-bottom:var(--s-6)}.as-label{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--c-epl)}.as-hero h1{font-family:var(--ff-display);font-size:clamp(68px,10vw,138px);line-height:.78;letter-spacing:var(--ls-display);margin:var(--s-3) 0}.as-hero p{color:var(--c-text-muted);font-size:var(--t-body-l);line-height:var(--lh-base);max-width:720px}.as-add{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 18px;background:var(--c-epl);color:#050505;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}.as-error{border:1px solid #8a3030;background:rgba(138,48,48,.1);color:#f3a6a6;padding:var(--s-4);margin-bottom:var(--s-5)}@media(max-width:720px){.as-shell{padding-top:74px}.as-hero{display:grid}.as-add{width:100%}}
      `}</style>
      <div className="as-wrap">
        <header className="as-hero"><div><span className="as-label">Operations</span><h1>Shows.</h1><p>Filter the full schedule by band, venue, lifecycle, readiness, owner, or date. Every card opens the working show file.</p></div><a className="as-add" href="/admin/shows/new">Create show</a></header>
        {!result?.ok && <div className="as-error">{result?.error || 'Shows could not be loaded.'}</div>}
        <AdminShowsClient shows={shows} />
      </div>
    </main>
  )
}
