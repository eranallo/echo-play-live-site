import { getAdminOpsFoundation, getAdminShowsOverview } from '@/lib/admin/airtable'
import { workLaneOptions } from '@/lib/admin/specialistPlaceholder'

export const dynamic = 'force-dynamic'

function daysUntil(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date - today) / 86400000)
}

function urgencyLabel(days) {
  if (days === null) return 'Upcoming'
  if (days < 0) return 'Past'
  if (days === 0) return 'Today'
  return `${days} days`
}

function SpecialistCard({ lane }) {
  return (
    <article className="sh-card">
      <div className="sh-card-top">
        <span>{lane.group}</span>
        <em>{lane.risk} risk</em>
      </div>
      <h2>{lane.shortLabel || lane.label}</h2>
      <p>{lane.helper}</p>
      <div className="sh-card-bottom">
        <strong>{lane.review ? 'Approval queued' : 'Logged only'}</strong>
        <span>{lane.review ? 'Public / external guardrail' : 'Internal planning lane'}</span>
      </div>
    </article>
  )
}

function ShowRow({ show }) {
  const days = daysUntil(show.date)
  return (
    <a className="sh-show" href={`/admin/shows/${show.id}`}>
      <div className="sh-show-date">
        <span>{urgencyLabel(days)}</span>
        <strong>{show.dateLabel}</strong>
      </div>
      <div>
        <h3>{show.band}</h3>
        <p>{show.venue} · {show.startTime}</p>
      </div>
      <em>{show.needsAttention ? `${show.missingFlags.length} open` : 'On track'}</em>
    </a>
  )
}

function RunItem({ run }) {
  return (
    <div className="sh-run">
      <span>{run.status}</span>
      <strong>{run.name}</strong>
      <p>{run.createdAt}</p>
    </div>
  )
}

export default async function SpecialistHubPage() {
  const [showsOverview, opsFoundation] = await Promise.all([
    getAdminShowsOverview(),
    getAdminOpsFoundation(),
  ])

  const lanes = workLaneOptions()
  const shows = showsOverview?.shows || []
  const runs = opsFoundation?.runs || []
  const approvals = opsFoundation?.approvals || []
  const pendingApprovals = approvals.filter(item => item.status === 'Pending')

  return (
    <main className="sh-shell">
      <style>{`
        .sh-shell { min-height:100vh; padding:clamp(84px,8vw,124px) var(--gutter-fluid); color:var(--c-text); background:radial-gradient(circle at 8% 0%, rgba(212,160,23,.18), transparent 32%), linear-gradient(180deg,#111,var(--c-bg) 36%,#050505); overflow:hidden; }
        .sh-wrap { max-width:var(--layout-max); margin:0 auto; position:relative; }
        .sh-wrap:before { content:''; position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.014) 1px, transparent 1px); background-size:54px 54px; opacity:.42; mask-image:linear-gradient(to bottom, black, transparent 75%); }
        .sh-wrap > * { position:relative; z-index:1; }
        .sh-nav { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:var(--s-7); }
        .sh-nav a { color:var(--c-text-muted); text-decoration:none; border:1px solid var(--c-border); background:rgba(255,255,255,.025); padding:9px 12px; border-radius:999px; font-family:var(--ff-label); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
        .sh-nav a:hover { border-color:var(--c-epl-line); color:var(--c-epl); }
        .sh-label { font-family:var(--ff-label); font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--c-epl); }
        .sh-hero { display:grid; grid-template-columns:minmax(0,1fr) minmax(280px,.44fr); gap:var(--s-7); align-items:end; margin-bottom:var(--s-7); }
        .sh-hero h1 { font-family:var(--ff-display); font-size:clamp(68px,11vw,150px); line-height:.76; letter-spacing:var(--ls-display); margin:var(--s-3) 0 var(--s-4); max-width:900px; }
        .sh-hero p { color:var(--c-text-muted); font-size:var(--t-body-l); line-height:var(--lh-base); max-width:760px; }
        .sh-pulse { border:1px solid var(--c-epl-line); border-radius:28px; padding:var(--s-6); background:radial-gradient(circle at 100% 0%, rgba(212,160,23,.18), transparent 44%), rgba(255,255,255,.025); box-shadow:0 24px 90px rgba(0,0,0,.28); }
        .sh-pulse strong { display:block; font-family:var(--ff-display); font-size:64px; line-height:.86; color:var(--c-epl); margin:8px 0; }
        .sh-pulse p { font-size:13px; color:var(--c-text-dim); }
        .sh-grid { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:var(--s-3); margin-bottom:var(--s-7); }
        .sh-card { min-height:250px; border:1px solid var(--c-border); border-radius:28px; padding:var(--s-5); background:linear-gradient(180deg, rgba(255,255,255,.044), rgba(255,255,255,.014)); display:grid; gap:var(--s-3); box-shadow:0 18px 70px rgba(0,0,0,.18); }
        .sh-card:hover { border-color:var(--c-epl-line); }
        .sh-card-top { display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .sh-card-top span, .sh-card-top em, .sh-card-bottom strong, .sh-show-date span, .sh-run span { font-family:var(--ff-label); font-size:10px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; color:var(--c-epl); font-style:normal; }
        .sh-card-top em { color:var(--c-text-faint); }
        .sh-card h2 { font-family:var(--ff-display); font-size:clamp(34px,4vw,56px); line-height:.84; letter-spacing:var(--ls-display); }
        .sh-card p, .sh-card-bottom span, .sh-show p, .sh-run p, .sh-rule p { color:var(--c-text-dim); line-height:var(--lh-snug); }
        .sh-card-bottom { align-self:end; display:grid; gap:4px; border-top:1px solid var(--c-border); padding-top:var(--s-3); }
        .sh-lower { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:var(--s-6); align-items:start; }
        .sh-panel { border:1px solid var(--c-border); border-radius:30px; padding:var(--s-6); background:rgba(255,255,255,.018); box-shadow:0 20px 80px rgba(0,0,0,.2); }
        .sh-panel-head { display:flex; justify-content:space-between; gap:16px; align-items:flex-end; margin-bottom:var(--s-5); }
        .sh-panel h2 { font-family:var(--ff-display); font-size:var(--t-h2); line-height:.9; letter-spacing:var(--ls-display); }
        .sh-panel-head p { color:var(--c-text-dim); font-size:14px; margin-top:8px; max-width:520px; }
        .sh-show-list, .sh-run-list, .sh-rule-list { display:grid; gap:10px; }
        .sh-show { color:inherit; text-decoration:none; display:grid; grid-template-columns:150px 1fr auto; gap:16px; align-items:center; border:1px solid var(--c-border); border-radius:22px; background:rgba(0,0,0,.18); padding:15px; transition:transform .18s ease, border-color .18s ease; }
        .sh-show:hover { transform:translateX(4px); border-color:var(--c-epl-line); }
        .sh-show h3 { color:var(--c-text); margin-bottom:4px; }
        .sh-show-date strong { display:block; color:var(--c-text-muted); margin-top:5px; font-size:13px; }
        .sh-show em { color:var(--c-epl); font-style:normal; font-family:var(--ff-label); font-size:10px; letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; }
        .sh-side { display:grid; gap:var(--s-6); }
        .sh-run, .sh-rule { border:1px solid var(--c-border); border-radius:20px; padding:14px; background:rgba(0,0,0,.18); }
        .sh-run strong, .sh-rule strong { display:block; color:var(--c-text-muted); margin:6px 0; }
        .sh-rule p { font-size:13px; }
        @media(max-width:1100px){ .sh-grid { grid-template-columns:repeat(2, minmax(0,1fr)); } .sh-hero, .sh-lower { grid-template-columns:1fr; } }
        @media(max-width:680px){ .sh-shell { padding-top:70px; } .sh-nav { align-items:flex-start; } .sh-nav div { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; } .sh-grid { grid-template-columns:1fr; } .sh-card { min-height:210px; } .sh-show { grid-template-columns:1fr; } .sh-show em { justify-self:start; } }
      `}</style>

      <section className="sh-wrap">
        <nav className="sh-nav" aria-label="Specialist navigation">
          <a href="/admin">← Command Center</a>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <a href="/admin/chief-of-staff">Chief</a>
            <a href="/admin/approvals">Review Queue</a>
          </div>
        </nav>

        <header className="sh-hero">
          <div>
            <span className="sh-label">Specialist Hub</span>
            <h1>Delegate the work.</h1>
            <p>
              Specialists turn a real show record into focused plans, drafts, checklists, and review-ready next steps. They do not bypass approval for public, external, financial, or booking-sensitive actions.
            </p>
          </div>
          <aside className="sh-pulse">
            <span className="sh-label">System</span>
            <strong>{lanes.length}</strong>
            <p>specialists online · {pendingApprovals.length} review item{pendingApprovals.length === 1 ? '' : 's'} waiting</p>
          </aside>
        </header>

        <section className="sh-grid" aria-label="Available specialists">
          {lanes.map(lane => <SpecialistCard key={lane.kind} lane={lane} />)}
        </section>

        <section className="sh-lower">
          <div className="sh-panel">
            <div className="sh-panel-head">
              <div>
                <span className="sh-label">Run from a show</span>
                <h2>Choose the record</h2>
                <p>Specialists are grounded in Airtable show data. Open a show, then run the lane from the Specialist Work Lanes section.</p>
              </div>
            </div>
            <div className="sh-show-list">
              {shows.length ? shows.slice(0, 8).map(show => <ShowRow key={show.id} show={show} />) : <p style={{ color: 'var(--c-text-muted)' }}>No upcoming shows loaded.</p>}
            </div>
          </div>

          <div className="sh-side">
            <div className="sh-panel">
              <div className="sh-panel-head">
                <div>
                  <span className="sh-label">Recent activity</span>
                  <h2>Runs</h2>
                </div>
              </div>
              <div className="sh-run-list">
                {runs.length ? runs.slice(0, 5).map(run => <RunItem key={run.id} run={run} />) : <p style={{ color: 'var(--c-text-muted)' }}>No runs logged yet.</p>}
              </div>
            </div>

            <div className="sh-panel">
              <div className="sh-panel-head">
                <div>
                  <span className="sh-label">Guardrails</span>
                  <h2>Rules</h2>
                </div>
              </div>
              <div className="sh-rule-list">
                <div className="sh-rule"><strong>Draft, don’t publish</strong><p>Promo, design, web, content, and booking outputs are review items first.</p></div>
                <div className="sh-rule"><strong>Server-side data only</strong><p>Airtable writes stay behind protected admin routes.</p></div>
                <div className="sh-rule"><strong>Show-grounded work</strong><p>Each run ties back to a real show ID and logs to AI RUNS when available.</p></div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
