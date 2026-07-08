import CampaignDraftPanel from '@/components/admin/CampaignDraftPanel'
import ShowControls from '@/components/admin/ShowControls'
import WorkLaneRunner from '@/components/admin/WorkLaneRunner'
import { getAdminShowDetail } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

function progress(checklist = []) {
  if (!checklist.length) return 0
  return Math.round((checklist.filter(item => item.complete).length / checklist.length) * 100)
}

function DetailCard({ label, value }) {
  return <div className="sw-detail"><span>{label}</span><strong>{value}</strong></div>
}

function DataPanel({ title, eyebrow, rows }) {
  return (
    <section className="sw-panel">
      <div className="sw-panel-head"><span>{eyebrow}</span><h2>{title}</h2></div>
      <div className="sw-data-grid">{rows.map(([label, value]) => <DetailCard key={label} label={label} value={value} />)}</div>
    </section>
  )
}

function StatusBoard({ items }) {
  return (
    <div className="sw-status-board">
      {items.map(item => <div key={item.label} className={`sw-status ${item.complete ? 'sw-done' : ''}`}><span>{item.complete ? 'Done' : 'Open'}</span><strong>{item.label}</strong></div>)}
    </div>
  )
}

function MissingFlag({ flag }) {
  return <span className="sw-flag">{flag}</span>
}

export default async function AdminShowDetailPage({ params }) {
  const resolvedParams = await params
  const showId = resolvedParams?.id
  const detail = showId ? await getAdminShowDetail(showId) : { ok: false, show: null, error: 'No show ID was provided in the admin route.' }

  if (!detail.ok || !detail.show) {
    return (
      <main className="sw-shell"><div className="sw-wrap"><a className="sw-back" href="/admin">← Command Center</a><section className="sw-panel"><h1>Show could not be loaded.</h1><p>{detail.error}</p></section></div></main>
    )
  }

  const show = detail.show
  const ready = progress(show.checklist)

  return (
    <main className="sw-shell">
      <style>{`
        .sw-shell{min-height:100vh;padding:clamp(76px,8vw,116px) var(--gutter-fluid);background:radial-gradient(circle at 8% 0%,rgba(212,160,23,.18),transparent 32%),linear-gradient(180deg,#101010,#050505 46%,#030303);color:var(--c-text)}.sw-wrap{max-width:var(--layout-max);margin:0 auto}.sw-back{display:inline-flex;color:var(--c-epl);text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:var(--s-5)}.sw-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:var(--s-6);align-items:end;border-bottom:1px solid var(--c-border);padding-bottom:var(--s-6);margin-bottom:var(--s-5)}.sw-label,.sw-panel-head span,.sw-detail span,.sw-status span,.sw-nav a,.sw-flag{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl)}.sw-hero h1{font-family:var(--ff-display);font-size:clamp(60px,10vw,138px);line-height:.78;letter-spacing:var(--ls-display);margin:var(--s-3) 0}.sw-hero p{font-size:var(--t-body-l);color:var(--c-text-muted);line-height:var(--lh-base)}.sw-health{border:1px solid var(--c-epl-line);background:linear-gradient(180deg,rgba(212,160,23,.08),rgba(255,255,255,.016));padding:var(--s-5);display:grid;gap:var(--s-4)}.sw-health strong{font-family:var(--ff-display);font-size:64px;line-height:.85;color:var(--c-epl)}.sw-bar{height:10px;background:rgba(255,255,255,.08);overflow:hidden}.sw-bar i{display:block;height:100%;background:var(--c-epl)}.sw-health p{font-size:14px;color:var(--c-text-dim)}.sw-nav{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:repeat(6,1fr);border:1px solid var(--c-border);background:rgba(5,5,5,.92);backdrop-filter:blur(16px);margin-bottom:var(--s-6)}.sw-nav a{min-height:48px;display:grid;place-items:center;text-decoration:none;color:var(--c-text-muted);border-right:1px solid var(--c-border)}.sw-nav a:last-child{border-right:0}.sw-nav a:hover{background:var(--c-epl);color:#050505}.sw-main{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(340px,.9fr);gap:var(--s-6);align-items:start}.sw-column{display:grid;gap:var(--s-6)}.sw-panel{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5)}.sw-panel-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:var(--s-4)}.sw-panel h2,.sw-panel h1{font-family:var(--ff-display);font-size:var(--t-h2);line-height:.9;letter-spacing:var(--ls-display)}.sw-data-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--c-border);border:1px solid var(--c-border)}.sw-detail{background:#070707;padding:14px;min-height:86px;display:grid;align-content:end}.sw-detail strong{color:var(--c-text-muted);line-height:var(--lh-snug);overflow-wrap:anywhere}.sw-status-board{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.sw-status{border:1px solid var(--c-border);background:#070707;padding:14px;min-height:92px;display:grid;align-content:end}.sw-status strong{color:var(--c-text-muted);margin-top:7px}.sw-done{border-color:var(--c-epl-line);background:rgba(212,160,23,.06)}.sw-flags{display:flex;flex-wrap:wrap;gap:8px}.sw-flag{display:inline-flex;border:1px solid var(--c-epl-line);background:rgba(212,160,23,.08);padding:8px 10px}.sw-empty{color:var(--c-text-muted);border:1px dashed var(--c-border);padding:var(--s-4);line-height:var(--lh-base)}.sw-mobile-actions{display:none;position:sticky;bottom:0;z-index:10;margin:var(--s-6) calc(var(--gutter-fluid) * -1) 0;background:rgba(5,5,5,.95);border-top:1px solid var(--c-border);backdrop-filter:blur(16px);grid-template-columns:repeat(4,1fr)}.sw-mobile-actions a{min-height:54px;display:grid;place-items:center;color:var(--c-text-muted);text-decoration:none;font-family:var(--ff-label);font-size:10px;letter-spacing:.12em;text-transform:uppercase;border-right:1px solid var(--c-border)}.sw-mobile-actions a:first-child{color:var(--c-epl)}@media(max-width:1050px){.sw-hero,.sw-main{grid-template-columns:1fr}.sw-nav{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.sw-shell{padding:70px var(--gutter-fluid) 0}.sw-hero h1{font-size:clamp(56px,19vw,92px)}.sw-nav{display:none}.sw-panel{padding:var(--s-4);margin-left:calc(var(--gutter-fluid) * -.25);margin-right:calc(var(--gutter-fluid) * -.25)}.sw-data-grid,.sw-status-board{grid-template-columns:1fr}.sw-mobile-actions{display:grid}}
      `}</style>
      <div className="sw-wrap">
        <a className="sw-back" href="/admin">← Command Center</a>
        <header className="sw-hero">
          <div><span className="sw-label">Show Workspace</span><h1>{show.band}</h1><p>{show.venue} · {show.dateLabel} · {show.startTime}</p></div>
          <aside className="sw-health"><span className="sw-label">Show Health</span><strong>{ready}%</strong><div className="sw-bar"><i style={{ width: `${ready}%` }} /></div><p>{show.status} · {show.missingFlags.length} open item{show.missingFlags.length === 1 ? '' : 's'}</p></aside>
        </header>

        <nav className="sw-nav"><a href="#overview">Overview</a><a href="#advance">Advance</a><a href="#updates">Updates</a><a href="#specialists">Specialists</a><a href="#promo">Promo</a><a href="#finance">Finance</a></nav>

        <section className="sw-main">
          <div className="sw-column">
            <section id="overview" className="sw-panel"><div className="sw-panel-head"><div><span>Progress</span><h2>Checklist</h2></div></div><StatusBoard items={show.checklist} /></section>
            {show.missingFlags.length > 0 && <section className="sw-panel"><div className="sw-panel-head"><div><span>Needs attention</span><h2>Open items</h2></div></div><div className="sw-flags">{show.missingFlags.map(flag => <MissingFlag key={flag} flag={flag} />)}</div></section>}
            <section id="updates" className="sw-panel"><div className="sw-panel-head"><div><span>Write to Airtable</span><h2>Actions + notes</h2></div></div><ShowControls showId={show.id} notes={show.editableNotes} checklist={show.checklist} /></section>
            <section id="specialists" className="sw-panel"><div className="sw-panel-head"><div><span>AI work lanes</span><h2>Specialists</h2></div></div><WorkLaneRunner showId={show.id} /></section>
            <section id="promo" className="sw-panel"><div className="sw-panel-head"><div><span>Campaign</span><h2>Drafts</h2></div></div><CampaignDraftPanel showId={show.id} /></section>
          </div>

          <aside className="sw-column">
            <DataPanel eyebrow="Advance" title="Logistics" rows={show.logistics} />
            <DataPanel eyebrow="Team" title="People" rows={show.people} />
            <DataPanel eyebrow="Files" title="Assets" rows={show.assets} />
            <div id="finance"><DataPanel eyebrow="Finance" title="Deal" rows={show.deal} /></div>
            <DataPanel eyebrow="Internal" title="Notes" rows={show.notes} />
          </aside>
        </section>
        <nav className="sw-mobile-actions"><a href="#overview">Status</a><a href="#updates">Update</a><a href="#specialists">AI</a><a href="#finance">Deal</a></nav>
      </div>
    </main>
  )
}
