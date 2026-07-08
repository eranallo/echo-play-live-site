import AdminNav from '@/components/admin/AdminNav'
import { getCachedAdminShowsOverview } from '@/lib/admin/cachedAirtable'
import { getSpecialistGuide, specialistGuideOptions } from '@/lib/admin/specialistGuides'

export const dynamic = 'force-dynamic'

function ListBlock({ title, items }) {
  return (
    <section className="sg-panel">
      <div className="sg-panel-head"><span>{title}</span></div>
      <ul className="sg-list">{items.map(item => <li key={item}>{item}</li>)}</ul>
    </section>
  )
}

function FlowStep({ index, children }) {
  return <div className="sg-step"><span>{String(index + 1).padStart(2, '0')}</span><p>{children}</p></div>
}

function ShowRow({ show }) {
  return <a className="sg-show" href={`/admin/shows/${show.id}`}><strong>{show.band}</strong><span>{show.venue} · {show.dateLabel}</span><em>{show.needsAttention ? `${show.missingFlags.length} open` : 'Ready'}</em></a>
}

export default async function SpecialistGuidePage({ params }) {
  const resolvedParams = await params
  const guide = getSpecialistGuide(resolvedParams?.kind)
  const showsOverview = await getCachedAdminShowsOverview()
  const shows = showsOverview?.shows || []

  if (!guide) {
    return (
      <main className="sg-shell"><AdminNav contextLabel="Specialist" backHref="/admin/specialists" backLabel="Specialists" /><div className="sg-wrap"><section className="sg-panel"><h1>Specialist not found.</h1><p>Return to the Specialist Hub and choose one of the active lanes.</p></section></div></main>
    )
  }

  const approvalText = guide.approval ? 'Approval required for public or external use' : 'Internal planning lane'

  return (
    <main className="sg-shell">
      <AdminNav contextLabel={guide.label} backHref="/admin/specialists" backLabel="Specialists" />
      <style>{`
        .sg-shell{min-height:100vh;padding:clamp(82px,8vw,122px) var(--gutter-fluid);padding-bottom:clamp(88px,8vw,122px);background:radial-gradient(circle at 8% 0%,rgba(212,160,23,.18),transparent 32%),linear-gradient(180deg,#101010,#050505 42%,#030303);color:var(--c-text)}.sg-wrap{max-width:var(--layout-max);margin:0 auto}.sg-label,.sg-chip,.sg-panel-head span,.sg-step span,.sg-show em{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl);text-decoration:none;font-style:normal}.sg-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.55fr);gap:var(--s-6);align-items:end;margin-bottom:var(--s-6);border-bottom:1px solid var(--c-border);padding-bottom:var(--s-6)}.sg-hero h1{font-family:var(--ff-display);font-size:clamp(68px,11vw,150px);line-height:.76;letter-spacing:var(--ls-display);margin:var(--s-3) 0}.sg-hero p{color:var(--c-text-muted);font-size:var(--t-body-l);line-height:var(--lh-base);max-width:780px}.sg-card{border:1px solid var(--c-epl-line);background:linear-gradient(180deg,rgba(212,160,23,.08),rgba(255,255,255,.018));padding:var(--s-5);display:grid;gap:var(--s-3)}.sg-card strong{font-family:var(--ff-display);font-size:48px;line-height:.85;color:var(--c-epl)}.sg-card p{color:var(--c-text-dim);line-height:var(--lh-base)}.sg-chip-row{display:flex;gap:8px;flex-wrap:wrap}.sg-chip{border:1px solid var(--c-border);padding:8px 10px;color:var(--c-text-muted);background:#070707}.sg-main{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:var(--s-6);align-items:start}.sg-column{display:grid;gap:var(--s-5)}.sg-panel{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5)}.sg-panel h2{font-family:var(--ff-display);font-size:var(--t-h2);line-height:.9;letter-spacing:var(--ls-display)}.sg-panel p{color:var(--c-text-muted);line-height:var(--lh-base)}.sg-panel-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin-bottom:var(--s-4)}.sg-list{display:grid;gap:10px;padding-left:18px;color:var(--c-text-dim);line-height:var(--lh-snug)}.sg-flow{display:grid;gap:10px}.sg-step{display:grid;grid-template-columns:42px 1fr;gap:14px;align-items:start;border:1px solid var(--c-border);background:#070707;padding:14px}.sg-step p{color:var(--c-text-dim);line-height:var(--lh-snug)}.sg-prompt{border:1px solid var(--c-epl-line);background:rgba(212,160,23,.06);padding:var(--s-4);color:var(--c-text-muted);line-height:var(--lh-base);font-size:15px}.sg-actions{display:grid;grid-template-columns:1fr 1fr;gap:1px;border:1px solid var(--c-epl-line);background:var(--c-epl-line)}.sg-actions a{min-height:48px;display:grid;place-items:center;background:#070707;color:var(--c-text);text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.sg-actions a:first-child{background:var(--c-epl);color:#050505}.sg-show-list{display:grid;gap:10px}.sg-show{display:grid;grid-template-columns:1fr auto;gap:8px;color:inherit;text-decoration:none;border:1px solid var(--c-border);background:#070707;padding:14px}.sg-show strong{color:var(--c-text)}.sg-show span{color:var(--c-text-dim)}.sg-show:hover{border-color:var(--c-epl-line)}@media(max-width:1050px){.sg-hero,.sg-main{grid-template-columns:1fr}}@media(max-width:680px){.sg-shell{padding-top:74px}.sg-hero h1{font-size:clamp(58px,20vw,92px)}.sg-panel,.sg-card{padding:var(--s-4);margin-left:calc(var(--gutter-fluid)*-.25);margin-right:calc(var(--gutter-fluid)*-.25)}.sg-actions,.sg-show{grid-template-columns:1fr}.sg-show em{justify-self:start}}
      `}</style>
      <div className="sg-wrap">
        <header className="sg-hero">
          <div>
            <span className="sg-label">{guide.group}</span>
            <h1>{guide.shortLabel}</h1>
            <p>{guide.mission}</p>
            <div className="sg-chip-row"><span className="sg-chip">{guide.risk} risk</span><span className="sg-chip">{approvalText}</span></div>
          </div>
          <aside className="sg-card"><span className="sg-label">Purpose</span><strong>{guide.label}</strong><p>{guide.tagline}</p></aside>
        </header>

        <section className="sg-main">
          <div className="sg-column">
            <section className="sg-panel"><div className="sg-panel-head"><span>What it does</span><h2>Mission</h2></div><p>{guide.mission}</p></section>
            <ListBlock title="Best for" items={guide.bestFor} />
            <ListBlock title="Not for" items={guide.notFor} />
            <section className="sg-panel"><div className="sg-panel-head"><span>How to use it</span><h2>Playbook</h2></div><div className="sg-flow">{guide.playbook.map((step, index) => <FlowStep key={step} index={index}>{step}</FlowStep>)}</div></section>
          </div>

          <aside className="sg-column">
            <section className="sg-panel"><div className="sg-panel-head"><span>Good prompt</span><h2>Ask it this way</h2></div><div className="sg-prompt">{guide.goodPrompt}</div></section>
            <ListBlock title="Inputs it needs" items={guide.inputs} />
            <ListBlock title="Outputs it creates" items={guide.outputs} />
            <ListBlock title="Guardrails" items={guide.guardrails} />
            <section className="sg-panel"><div className="sg-panel-head"><span>Run it</span><h2>From a show</h2></div><p style={{ marginBottom: 'var(--s-4)' }}>Specialists work best when grounded in a real Airtable show record.</p><div className="sg-actions"><a href="/admin#shows">Choose show</a><a href="/admin/tasks">Open tasks</a></div></section>
            <section className="sg-panel"><div className="sg-panel-head"><span>Upcoming</span><h2>Show records</h2></div><div className="sg-show-list">{shows.slice(0, 5).map(show => <ShowRow key={show.id} show={show} />)}</div></section>
          </aside>
        </section>
      </div>
    </main>
  )
}

export function generateStaticParams() {
  return specialistGuideOptions().map(guide => ({ kind: guide.kind }))
}
