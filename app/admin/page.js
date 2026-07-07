import { getAdminOpsFoundation, getAdminShowsOverview } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

const TOOL_LINKS = [
  { label: 'Airtable', href: 'https://airtable.com/appYUOoJgvRyZ7fLB', sub: 'Source of truth' },
  { label: 'Google Drive', href: 'https://drive.google.com/drive/my-drive', sub: 'Docs + assets' },
  { label: 'Canva', href: 'https://www.canva.com/', sub: 'Design work' },
  { label: 'Gmail', href: 'https://mail.google.com/', sub: 'Venue comms' },
  { label: 'Calendar', href: 'https://calendar.google.com/', sub: 'Dates + holds' },
  { label: 'GitHub', href: 'https://github.com/eranallo/echo-play-live-site', sub: 'Website repo' },
  { label: 'Vercel', href: 'https://vercel.com/eranallo-6688s-projects/echo-play-live-site', sub: 'Deployments' },
  { label: 'Meta Business', href: 'https://business.facebook.com/', sub: 'Ads + events' },
  { label: 'Bandsintown', href: 'https://artists.bandsintown.com/', sub: 'Listings' },
]

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
  if (days <= 7) return `${days} days`
  return `${days} days`
}

function firstShowLink(shows) {
  return shows?.[0]?.id ? `/admin/shows/${shows[0].id}` : '/admin'
}

function buildTodos(showsOverview, opsFoundation) {
  const shows = showsOverview?.shows || []
  const pendingApprovals = (opsFoundation?.approvals || []).filter(item => item.status === 'Pending')
  const todos = []

  pendingApprovals.slice(0, 3).forEach(item => {
    todos.push({
      eyebrow: 'Review',
      title: item.item || 'Approval waiting',
      body: item.proposedChange || 'Generated work is waiting in the review queue.',
      href: '/admin/approvals',
      cta: 'Open queue',
      tone: 'gold',
    })
  })

  shows
    .filter(show => show.needsAttention)
    .slice(0, 6)
    .forEach(show => {
      const days = daysUntil(show.date)
      todos.push({
        eyebrow: urgencyLabel(days),
        title: `${show.band} at ${show.venue}`,
        body: `${show.missingFlags.slice(0, 4).join(', ')}${show.missingFlags.length > 4 ? '…' : ''}`,
        href: `/admin/shows/${show.id}`,
        cta: 'Work show',
        tone: days !== null && days <= 7 ? 'hot' : 'normal',
      })
    })

  if (todos.length === 0) {
    todos.push({
      eyebrow: 'Clean slate',
      title: 'No urgent dashboard items',
      body: 'Start with the Chief of Staff brief or review the next show while there is room to breathe.',
      href: '/admin/chief-of-staff',
      cta: 'Ask Chief',
      tone: 'normal',
    })
  }

  return todos.slice(0, 7)
}

function ActionCard({ href, eyebrow, title, body, cta, big = false }) {
  return (
    <a className={`cc-card cc-action ${big ? 'cc-action-big' : ''}`} href={href}>
      <span className="cc-eyebrow">{eyebrow}</span>
      <strong>{title}</strong>
      <p>{body}</p>
      <span className="cc-cta">{cta} →</span>
    </a>
  )
}

function TodoItem({ todo, index }) {
  return (
    <a className={`cc-todo cc-todo-${todo.tone}`} href={todo.href} style={{ animationDelay: `${index * 55}ms` }}>
      <div className="cc-todo-index">{String(index + 1).padStart(2, '0')}</div>
      <div>
        <span className="cc-eyebrow">{todo.eyebrow}</span>
        <strong>{todo.title}</strong>
        <p>{todo.body}</p>
      </div>
      <span className="cc-todo-cta">{todo.cta}</span>
    </a>
  )
}

function MiniShow({ show }) {
  const days = daysUntil(show.date)
  return (
    <a className="cc-mini-show" href={`/admin/shows/${show.id}`}>
      <div>
        <span>{urgencyLabel(days)}</span>
        <strong>{show.band}</strong>
        <p>{show.venue} · {show.dateLabel}</p>
      </div>
      <em>{show.needsAttention ? `${show.missingFlags.length} items` : 'On track'}</em>
    </a>
  )
}

function ToolLink({ tool }) {
  return (
    <a className="cc-tool" href={tool.href} target="_blank" rel="noreferrer">
      <strong>{tool.label}</strong>
      <span>{tool.sub}</span>
    </a>
  )
}

export default async function AdminPage() {
  const [showsOverview, opsFoundation] = await Promise.all([
    getAdminShowsOverview(),
    getAdminOpsFoundation(),
  ])

  const shows = showsOverview?.shows || []
  const needsAttention = shows.filter(show => show.needsAttention)
  const pendingApprovals = (opsFoundation?.approvals || []).filter(item => item.status === 'Pending')
  const todos = buildTodos(showsOverview, opsFoundation)
  const nextShow = shows[0]
  const specialistShowLink = firstShowLink(needsAttention.length ? needsAttention : shows)

  return (
    <main className="cc-shell">
      <style>{`
        .cc-shell {
          min-height: 100vh;
          padding: clamp(84px, 8vw, 118px) var(--gutter-fluid);
          background:
            radial-gradient(circle at 12% 0%, rgba(212,160,23,0.20), transparent 34%),
            radial-gradient(circle at 86% 12%, rgba(255,255,255,0.08), transparent 30%),
            linear-gradient(180deg, #101010 0%, var(--c-bg) 38%, #050505 100%);
          color: var(--c-text);
          overflow: hidden;
        }
        .cc-wrap { max-width: var(--layout-max); margin: 0 auto; position: relative; }
        .cc-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 70%);
          opacity: .55;
        }
        .cc-topnav { display:flex; justify-content:space-between; gap:16px; align-items:center; margin-bottom: var(--s-7); position:relative; z-index:1; }
        .cc-brand { display:flex; gap:12px; align-items:center; text-decoration:none; color:inherit; }
        .cc-brand img { width:42px; height:42px; object-fit:contain; border:1px solid var(--c-epl-line); border-radius:16px; padding:5px; background:rgba(212,160,23,.06); }
        .cc-brand span, .cc-eyebrow { font-family:var(--ff-label); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--c-epl); font-weight:800; }
        .cc-navlinks { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
        .cc-navlinks a, .cc-cta-button { color:var(--c-text-muted); text-decoration:none; border:1px solid var(--c-border); background:rgba(255,255,255,.025); padding:9px 12px; border-radius:999px; font-family:var(--ff-label); font-size:10px; letter-spacing:.12em; text-transform:uppercase; transition:transform .2s var(--ease-out), border-color .2s var(--ease-out), color .2s var(--ease-out); }
        .cc-navlinks a:hover, .cc-cta-button:hover { transform:translateY(-2px); border-color:var(--c-epl-line); color:var(--c-epl); }
        .cc-hero { position:relative; z-index:1; display:grid; grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr); gap:var(--s-7); align-items:end; margin-bottom:var(--s-7); animation: ccRise .65s var(--ease-out) both; }
        .cc-hero h1 { font-family:var(--ff-display); font-size:clamp(68px, 10vw, 148px); line-height:.78; letter-spacing:var(--ls-display); max-width:900px; margin:var(--s-3) 0 var(--s-4); }
        .cc-hero p { color:var(--c-text-muted); font-size:var(--t-body-l); line-height:var(--lh-base); max-width:720px; }
        .cc-card { position:relative; overflow:hidden; border:1px solid var(--c-border); background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.014)); box-shadow:0 24px 90px rgba(0,0,0,.34); backdrop-filter:blur(18px); }
        .cc-card::after { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 100% 0%, rgba(212,160,23,.14), transparent 40%); opacity:.9; }
        .cc-card > * { position:relative; z-index:1; }
        .cc-status-card { padding:var(--s-6); border-color:var(--c-epl-line); border-radius:28px; }
        .cc-status-card strong { display:block; font-family:var(--ff-display); font-size:58px; line-height:.85; letter-spacing:var(--ls-display); margin:10px 0; color:var(--c-epl); }
        .cc-status-card p { font-size:14px; color:var(--c-text-dim); }
        .cc-primary-grid { position:relative; z-index:1; display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:var(--s-5); margin-bottom:var(--s-7); }
        .cc-action { display:grid; gap:12px; min-height:220px; padding:var(--s-5); border-radius:28px; text-decoration:none; color:inherit; transition:transform .24s var(--ease-out), border-color .24s var(--ease-out), background .24s var(--ease-out); animation: ccRise .7s var(--ease-out) both; }
        .cc-action:hover { transform:translateY(-5px); border-color:var(--c-epl-line); background:linear-gradient(180deg, rgba(212,160,23,.075), rgba(255,255,255,.018)); }
        .cc-action strong { display:block; font-family:var(--ff-display); font-size:clamp(36px,4vw,58px); line-height:.86; letter-spacing:var(--ls-display); }
        .cc-action p { color:var(--c-text-dim); line-height:var(--lh-base); max-width:410px; }
        .cc-action-big { min-height:260px; border-color:var(--c-epl-line); background:radial-gradient(circle at 0% 0%, rgba(212,160,23,.18), transparent 44%), linear-gradient(180deg, rgba(212,160,23,.07), rgba(255,255,255,.016)); }
        .cc-cta { align-self:end; color:var(--c-epl); font-family:var(--ff-label); font-size:11px; letter-spacing:.14em; text-transform:uppercase; }
        .cc-main-grid { position:relative; z-index:1; display:grid; grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr); gap:var(--s-6); align-items:start; }
        .cc-panel { border:1px solid var(--c-border); border-radius:30px; padding:var(--s-6); background:rgba(255,255,255,.018); box-shadow:0 24px 90px rgba(0,0,0,.24); animation:ccRise .8s var(--ease-out) both; }
        .cc-panel-head { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:var(--s-5); }
        .cc-panel h2 { font-family:var(--ff-display); font-size:var(--t-h2); line-height:.92; letter-spacing:var(--ls-display); }
        .cc-panel-head p { color:var(--c-text-dim); font-size:14px; margin-top:8px; max-width:440px; }
        .cc-todo-list { display:grid; gap:12px; }
        .cc-todo { display:grid; grid-template-columns:42px 1fr auto; gap:14px; align-items:center; color:inherit; text-decoration:none; padding:15px; border:1px solid var(--c-border); border-radius:22px; background:rgba(255,255,255,.024); animation:ccRise .65s var(--ease-out) both; transition:transform .2s var(--ease-out), border-color .2s var(--ease-out); }
        .cc-todo:hover { transform:translateX(4px); border-color:var(--c-epl-line); }
        .cc-todo-index { width:34px; height:34px; display:grid; place-items:center; border:1px solid var(--c-border); border-radius:12px; color:var(--c-text-faint); font-family:var(--ff-label); font-size:10px; }
        .cc-todo strong { display:block; color:var(--c-text); font-size:16px; margin:4px 0; }
        .cc-todo p { color:var(--c-text-dim); font-size:13px; line-height:1.35; }
        .cc-todo-cta { color:var(--c-epl); font-family:var(--ff-label); font-size:10px; letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; }
        .cc-todo-hot { border-color:rgba(212,160,23,.48); background:rgba(212,160,23,.055); }
        .cc-specialists { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .cc-specialist { min-height:150px; border:1px solid var(--c-border); border-radius:24px; background:rgba(255,255,255,.024); padding:16px; text-decoration:none; color:inherit; display:grid; gap:10px; transition:transform .22s var(--ease-out), border-color .22s var(--ease-out); }
        .cc-specialist:hover { transform:translateY(-4px); border-color:var(--c-epl-line); }
        .cc-specialist b { font-family:var(--ff-display); font-size:32px; line-height:.9; letter-spacing:var(--ls-display); }
        .cc-specialist span { color:var(--c-text-dim); font-size:13px; line-height:1.35; }
        .cc-mini-shows { display:grid; gap:10px; }
        .cc-mini-show { display:flex; justify-content:space-between; gap:14px; align-items:center; color:inherit; text-decoration:none; border:1px solid var(--c-border); border-radius:20px; padding:14px; background:rgba(0,0,0,.18); transition:transform .2s var(--ease-out), border-color .2s var(--ease-out); }
        .cc-mini-show:hover { transform:translateY(-3px); border-color:var(--c-epl-line); }
        .cc-mini-show span { color:var(--c-epl); font-family:var(--ff-label); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
        .cc-mini-show strong { display:block; margin-top:5px; }
        .cc-mini-show p, .cc-mini-show em { color:var(--c-text-dim); font-size:13px; font-style:normal; }
        .cc-tools { position:relative; z-index:1; margin-top:var(--s-7); }
        .cc-tool-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; }
        .cc-tool { display:grid; gap:6px; min-height:86px; padding:14px; border:1px solid var(--c-border); border-radius:20px; text-decoration:none; color:inherit; background:rgba(255,255,255,.02); transition:transform .2s var(--ease-out), border-color .2s var(--ease-out); }
        .cc-tool:hover { transform:translateY(-3px); border-color:var(--c-epl-line); }
        .cc-tool strong { color:var(--c-text); }
        .cc-tool span { color:var(--c-text-dim); font-size:12px; }
        @keyframes ccRise { from { opacity:0; transform:translateY(18px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }
        @media (max-width: 980px) { .cc-hero, .cc-main-grid, .cc-primary-grid { grid-template-columns:1fr; } .cc-specialists { grid-template-columns:1fr; } }
        @media (max-width: 640px) { .cc-shell { padding-top:70px; } .cc-topnav { align-items:flex-start; } .cc-navlinks { max-width:220px; } .cc-todo { grid-template-columns:1fr; } .cc-todo-index { display:none; } .cc-todo-cta { justify-self:start; } }
        @media (prefers-reduced-motion: reduce) { .cc-hero, .cc-action, .cc-panel, .cc-todo { animation:none; } .cc-action, .cc-todo, .cc-tool, .cc-specialist, .cc-mini-show { transition:none; } }
      `}</style>

      <section className="cc-wrap">
        <nav className="cc-topnav" aria-label="Command center navigation">
          <a className="cc-brand" href="/admin">
            <img src="/logo.png" alt="" />
            <span>Echo Play Live Ops</span>
          </a>
          <div className="cc-navlinks">
            <a href="/admin/chief-of-staff">Chief</a>
            <a href="/admin/approvals">Reviews</a>
            <a href="/portal">Portal</a>
            <a href="/">Public Site</a>
          </div>
        </nav>

        <header className="cc-hero">
          <div>
            <span className="cc-eyebrow">Private Command Center</span>
            <h1>What needs my attention?</h1>
            <p>
              A practical front door for the work: ask the Chief of Staff, handle today’s todos, run specialists from show pages, and jump into the tools you actually use.
            </p>
          </div>
          <div className="cc-card cc-status-card">
            <span className="cc-eyebrow">Operations Pulse</span>
            <strong>{needsAttention.length}</strong>
            <p>{needsAttention.length === 1 ? 'show needs attention' : 'shows need attention'} · {pendingApprovals.length} review item{pendingApprovals.length === 1 ? '' : 's'} waiting</p>
          </div>
        </header>

        <section className="cc-primary-grid" aria-label="Primary actions">
          <ActionCard
            big
            eyebrow="Start Here"
            title="Talk to Chief of Staff"
            body="Ask what matters today, what to delegate, what show is at risk, or what specialist should run next."
            cta="Open Chief"
            href="/admin/chief-of-staff"
          />
          <ActionCard
            eyebrow="Review"
            title="Approval Queue"
            body="Generated copy, design briefs, and routed work live here before anything becomes official."
            cta="Review work"
            href="/admin/approvals"
          />
          <ActionCard
            eyebrow="Team App"
            title="Musician Portal"
            body="Check the phone-first app your band and crew use for show-day info."
            cta="Open portal"
            href="/portal"
          />
        </section>

        <section className="cc-main-grid">
          <div className="cc-panel">
            <div className="cc-panel-head">
              <div>
                <span className="cc-eyebrow">Today’s Work</span>
                <h2>Todos</h2>
                <p>Less dashboard, more action. These are the things most likely to move the business forward or prevent a show-day scramble.</p>
              </div>
              <a className="cc-cta-button" href="/admin/chief-of-staff">Ask Chief</a>
            </div>
            <div className="cc-todo-list">
              {todos.map((todo, index) => <TodoItem key={`${todo.title}-${index}`} todo={todo} index={index} />)}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
            <div className="cc-panel">
              <div className="cc-panel-head">
                <div>
                  <span className="cc-eyebrow">Specialists</span>
                  <h2>Run a lane</h2>
                  <p>Specialists run from show detail pages so the output stays tied to a real show.</p>
                </div>
              </div>
              <div className="cc-specialists">
                <a className="cc-specialist" href={specialistShowLink}>
                  <b>Advance</b>
                  <span>Call sheet, venue questions, show-day readiness.</span>
                  <span className="cc-cta">Open show →</span>
                </a>
                <a className="cc-specialist" href={specialistShowLink}>
                  <b>Promo</b>
                  <span>Event copy, captions, listing copy, promo steps.</span>
                  <span className="cc-cta">Open show →</span>
                </a>
                <a className="cc-specialist" href={specialistShowLink}>
                  <b>Design</b>
                  <span>Canva-ready brief, required text, sizes, assets.</span>
                  <span className="cc-cta">Open show →</span>
                </a>
              </div>
            </div>

            <div className="cc-panel">
              <div className="cc-panel-head">
                <div>
                  <span className="cc-eyebrow">Operations Rundown</span>
                  <h2>Next shows</h2>
                  <p>Only the near-term shows, not a giant backend table.</p>
                </div>
              </div>
              <div className="cc-mini-shows">
                {shows.length ? shows.slice(0, 4).map(show => <MiniShow key={show.id} show={show} />) : (
                  <p style={{ color: 'var(--c-text-muted)' }}>No upcoming shows loaded.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="cc-tools">
          <div className="cc-panel">
            <div className="cc-panel-head">
              <div>
                <span className="cc-eyebrow">Tool Belt</span>
                <h2>Jump out fast</h2>
                <p>The tools you touch while booking, promoting, designing, and running shows.</p>
              </div>
            </div>
            <div className="cc-tool-grid">
              {TOOL_LINKS.map(tool => <ToolLink key={tool.label} tool={tool} />)}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
