import AdminNav from '@/components/admin/AdminNav'
import ShowCreateForm from '@/components/admin/ShowCreateForm'
import { getCachedAdminShowFormOptions } from '@/lib/admin/cachedAirtable'

export const dynamic = 'force-dynamic'

export default async function NewAdminShowPage() {
  const options = await getCachedAdminShowFormOptions()

  return (
    <main className="ns-shell">
      <AdminNav contextLabel="Create Show" backHref="/admin/shows" backLabel="Shows" />
      <style>{`
        .ns-shell{min-height:100vh;padding:clamp(82px,8vw,122px) var(--gutter-fluid);padding-bottom:clamp(88px,8vw,122px);background:radial-gradient(circle at 8% 0%,rgba(212,160,23,.18),transparent 34%),linear-gradient(180deg,#101010,#060606 44%,#030303);color:var(--c-text)}.ns-wrap{max-width:1000px;margin:0 auto}.ns-hero{border-bottom:1px solid var(--c-border);padding-bottom:var(--s-6);margin-bottom:var(--s-6)}.ns-label{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--c-epl)}.ns-hero h1{font-family:var(--ff-display);font-size:clamp(68px,10vw,132px);line-height:.78;letter-spacing:var(--ls-display);margin:var(--s-3) 0}.ns-hero p{color:var(--c-text-muted);font-size:var(--t-body-l);line-height:var(--lh-base);max-width:720px}.ns-error{border:1px solid #8a3030;color:#f3a6a6;padding:var(--s-4);margin-bottom:var(--s-5)}
      `}</style>
      <div className="ns-wrap">
        <header className="ns-hero"><span className="ns-label">Command Center</span><h1>New show.</h1><p>Create the core Airtable record here. The working file opens immediately so you can staff it, build the timeline, and advance the campaign.</p></header>
        {!options.ok && <div className="ns-error">{options.error}</div>}
        <ShowCreateForm options={options} />
      </div>
    </main>
  )
}
