import AdminNav from '@/components/admin/AdminNav'
import { getCachedAdminOpsFoundation, getCachedAdminShowsOverview } from '@/lib/admin/cachedAirtable'
import { specialistGuideOptions } from '@/lib/admin/specialistGuides'

export const dynamic = 'force-dynamic'

const WORK_AREAS = [
  { label: 'Chief', href: '/admin/chief-of-staff', body: 'Ask what matters today, route work, and generate a brief.' },
  { label: 'Shows', href: '/admin#shows', body: 'Upcoming dates, missing details, show health, and actions.' },
  { label: 'Tasks', href: '/admin/tasks', body: 'Hard-data work queue from tasks, approvals, and show gaps.' },
  { label: 'Specialists', href: '/admin/specialists', body: 'Guided agents for show ops, promo, finance, web, merch, booking.' },
  { label: 'Approvals', href: '/admin/approvals', body: 'Review public, external, financial, and booking-sensitive work.' },
]

const TOOLS = [
  ['Airtable', 'https://airtable.com/appYUOoJgvRyZ7fLB'],
  ['Gmail', 'https://mail.google.com/'],
  ['Calendar', 'https://calendar.google.com/'],
  ['Drive', 'https://drive.google.com/drive/my-drive'],
  ['Canva', 'https://www.canva.com/'],
  ['Bandsintown', 'https://artists.bandsintown.com/'],
  ['Meta', 'https://business.facebook.com/'],
  ['Vercel', 'https://vercel.com/eranallo-6688s-projects/echo-play-live-site'],
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

function dueText(days) {
  if (days === null) return 'No date'
  if (days < 0) return 'Past'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days`
}

function taskIsOpen(task) {
  return !['Done', 'Complete', 'Completed'].includes(task.status)
}

function buildQueue(shows, approvals, tasks) {
  const queue = []

  tasks.filter(taskIsOpen).slice(0, 5).forEach(task => queue.push({
    type: 'Task',
    label: task.priority || 'Task',
    title: task.title,
    body: task.notes || `${task.status} · ${task.dueLabel}`,
    href: '/admin/tasks',
    tone: task.priority === 'High' || task.priority === 'Urgent' ? 'hot' : 'normal',
  }))

  approvals.filter(item => item.status === 'Pending').slice(0, 4).forEach(item => queue.push({
    type: 'Approval',
    label: item.riskLevel || 'Review',
    title: item.item,
    body: item.proposedChange || 'Review item waiting.',
    href: '/admin/approvals',
    tone: 'gold',
  }))

  shows.filter(show => show.needsAttention).slice(0, 8).forEach(show => {
    const days = daysUntil(show.date)
    queue.push({
      type: 'Show',
      label: dueText(days),
      title: `${show.band} at ${show.venue}`,
      body: show.missingFlags.join(' · '),
      href: `/admin/shows/${show.id}`,
      tone: days !== null && days <= 7 ? 'hot' : 'normal',
    })
  })

  return queue.slice(0, 10)
}

function Stat({ label, value, sub }) {
  return <div className="cv-stat"><span>{label}</span><strong>{value}</strong><p>{sub}</p></div>
}

function QueueItem({ item, index }) {
  return <a className={`cv-queue cv-${item.tone}`} href={item.href}><div className="cv-num">{String(index + 1).padStart(2, '0')}</div><div><span>{item.type} · {item.label}</span><strong>{item.title}</strong><p>{item.body}</p></div><em>Open</em></a>
}

function ShowCard({ show }) {
  const days = daysUntil(show.date)
  const completeCount = [show.contractSigned, show.graphicCreated, show.facebookEventCreated, show.bandsintownPosted, show.promotionReleased].filter(Boolean).length
  const progress = Math.round((completeCount / 5) * 100)
  return <a className="cv-show" href={`/admin/shows/${show.id}`}><div className="cv-show-top"><span>{dueText(days)}</span><em>{show.status}</em></div><h3>{show.band}</h3><p>{show.venue} · {show.dateLabel} · {show.startTime}</p><div className="cv-progress"><i style={{ width: `${progress}%` }} /></div><div className="cv-show-foot"><span>{progress}% ready</span><b>{show.missingFlags.length ? `${show.missingFlags.length} open` : 'On track'}</b></div></a>
}

function SmallCard({ href, label, title, body }) {
  return <a className="cv-small" href={href}><span>{label}</span><strong>{title}</strong><p>{body}</p></a>
}

function TableStatus({ table }) {
  return <div className={`cv-small ${table.ready ? 'cv-ready' : ''}`}><span>{table.ready ? 'Ready' : table.missing ? 'Missing' : 'Issue'}</span><strong>{table.label}</strong><p>{table.records} records</p></div>
}

export default async function AdminPage() {
  const [showsOverview, opsFoundation] = await Promise.all([
    getCachedAdminShowsOverview(),
    getCachedAdminOpsFoundation(),
  ])

  const shows = showsOverview?.shows || []
  const approvals = opsFoundation?.approvals || []
  const tasks = opsFoundation?.tasks || []
  const tables = opsFoundation?.tables || []
  const specialists = specialistGuideOptions()
  const pendingApprovals = approvals.filter(item => item.status === 'Pending')
  const openTasks = tasks.filter(taskIsOpen)
  const needsAttention = shows.filter(show => show.needsAttention)
  const queue = buildQueue(shows, approvals, tasks)
  const nextShow = shows[0]

  return (
    <main className="cv-shell">
      <AdminNav contextLabel="Command Center" />
      <style>{`
        .cv-shell{min-height:100vh;padding:clamp(82px,8vw,122px) var(--gutter-fluid);padding-bottom:clamp(88px,8vw,122px);background:radial-gradient(circle at 8% 0%,rgba(212,160,23,.18),transparent 34%),linear-gradient(180deg,#101010,#060606 44%,#030303);color:var(--c-text);overflow:hidden}.cv-wrap{max-width:var(--layout-max);margin:0 auto}.cv-label,.cv-stat span,.cv-queue span,.cv-show-top span,.cv-show-top em,.cv-show-foot span,.cv-show-foot b,.cv-small span{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl);font-style:normal}.cv-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:var(--s-6);align-items:end;margin-bottom:var(--s-6)}.cv-hero h1{font-family:var(--ff-display);font-size:clamp(64px,10vw,142px);line-height:.78;letter-spacing:var(--ls-display);margin:var(--s-3) 0 var(--s-4);max-width:900px}.cv-hero p{color:var(--c-text-muted);font-size:var(--t-body-l);line-height:var(--lh-base);max-width:740px}.cv-hero-actions{display:flex;gap:1px;border:1px solid var(--c-epl-line);width:max-content;max-width:100%;margin-top:var(--s-5)}.cv-hero-actions a{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 16px;color:var(--c-text);text-decoration:none;border-right:1px solid var(--c-epl-line);font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.cv-hero-actions a:first-child{background:var(--c-epl);color:#060606}.cv-hero-actions a:last-child{border-right:0}.cv-status{border:1px solid var(--c-epl-line);background:linear-gradient(180deg,rgba(212,160,23,.08),rgba(255,255,255,.018));padding:var(--s-5);display:grid;gap:var(--s-4)}.cv-status h2{font-family:var(--ff-display);font-size:clamp(44px,5vw,74px);line-height:.82}.cv-status p,.cv-stat p,.cv-queue p,.cv-show p,.cv-small p,.cv-empty{color:var(--c-text-dim);line-height:var(--lh-snug)}.cv-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--c-border);border:1px solid var(--c-border);margin-bottom:var(--s-6)}.cv-stat{background:#070707;padding:var(--s-4);min-height:132px;display:grid;align-content:end}.cv-stat strong{font-family:var(--ff-display);font-size:48px;line-height:.85;color:var(--c-text);margin:6px 0}.cv-quick{display:grid;gap:10px;margin-bottom:var(--s-6)}.cv-drawer{border:1px solid var(--c-border);background:rgba(255,255,255,.018)}.cv-drawer summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center;padding:var(--s-4);font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--c-epl)}.cv-drawer summary::-webkit-details-marker{display:none}.cv-drawer summary span{color:var(--c-text-faint)}.cv-drawer[open] summary{border-bottom:1px solid var(--c-border)}.cv-drawer-body{padding:var(--s-4);display:grid;gap:10px}.cv-mini-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.cv-small{border:1px solid var(--c-border);background:#070707;padding:14px;color:inherit;text-decoration:none;display:grid;gap:7px;min-height:118px}.cv-small:hover{border-color:var(--c-epl-line)}.cv-small strong{color:var(--c-text-muted)}.cv-ready{border-color:var(--c-epl-line);background:rgba(212,160,23,.045)}.cv-main{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(340px,.88fr);gap:var(--s-6);align-items:start}.cv-panel{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5)}.cv-panel-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:var(--s-5)}.cv-panel h2{font-family:var(--ff-display);font-size:var(--t-h2);line-height:.92;letter-spacing:var(--ls-display)}.cv-panel-head p{color:var(--c-text-dim);font-size:14px;margin-top:7px;max-width:480px}.cv-queue-list,.cv-show-grid,.cv-area-grid,.cv-tool-grid{display:grid;gap:10px}.cv-queue{display:grid;grid-template-columns:42px 1fr auto;gap:14px;align-items:center;color:inherit;text-decoration:none;border:1px solid var(--c-border);background:#070707;padding:14px;transition:transform .18s ease,border-color .18s ease}.cv-queue:hover{transform:translateX(4px);border-color:var(--c-epl-line)}.cv-queue strong{display:block;color:var(--c-text);margin:5px 0}.cv-queue em{font-family:var(--ff-label);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--c-text-faint);font-style:normal}.cv-num{display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--c-border);font-family:var(--ff-label);font-size:10px;color:var(--c-text-faint)}.cv-hot{border-color:rgba(255,106,0,.34)}.cv-gold{border-color:var(--c-epl-line)}.cv-lower,.cv-side{display:grid;gap:var(--s-6)}.cv-area-grid{grid-template-columns:repeat(2,1fr)}.cv-show-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cv-show{border:1px solid var(--c-border);background:#070707;padding:var(--s-4);color:inherit;text-decoration:none;display:grid;gap:12px;min-height:190px}.cv-show:hover{border-color:var(--c-epl-line)}.cv-show-top,.cv-show-foot{display:flex;justify-content:space-between;gap:10px}.cv-show h3{font-family:var(--ff-display);font-size:42px;line-height:.86}.cv-progress{height:7px;background:rgba(255,255,255,.08);overflow:hidden}.cv-progress i{display:block;height:100%;background:var(--c-epl)}.cv-tool-grid{grid-template-columns:repeat(2,1fr)}.cv-tool{border:1px solid var(--c-border);padding:12px;color:var(--c-text-muted);text-decoration:none;font-family:var(--ff-label);font-size:10px;letter-spacing:.12em;text-transform:uppercase;background:#070707}.cv-tool:hover{color:var(--c-epl);border-color:var(--c-epl-line)}.cv-empty{border:1px dashed var(--c-border);padding:var(--s-4)}@media(max-width:1100px){.cv-hero,.cv-main{grid-template-columns:1fr}.cv-stats,.cv-mini-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:720px){.cv-shell{padding-top:74px}.cv-hero h1{font-size:clamp(58px,20vw,92px)}.cv-hero-actions{display:grid;width:100%;grid-template-columns:1fr 1fr}.cv-hero-actions a{border-right:0;border-bottom:1px solid var(--c-epl-line)}.cv-hero-actions a:last-child{border-bottom:0}.cv-stats,.cv-area-grid,.cv-show-grid,.cv-tool-grid,.cv-mini-grid{grid-template-columns:1fr}.cv-main{gap:var(--s-4)}.cv-panel,.cv-drawer{margin-left:calc(var(--gutter-fluid) * -0.25);margin-right:calc(var(--gutter-fluid) * -0.25)}.cv-panel{padding:var(--s-4)}.cv-panel-head{display:grid}.cv-queue{grid-template-columns:36px 1fr}.cv-queue em{display:none}.cv-show h3{font-size:36px}}
      `}</style>
      <div className="cv-wrap">
        <header className="cv-hero">
          <div><span className="cv-label">Today</span><h1>Run the day.</h1><p>Your command center should show the work, not make you hunt for it. Use the menu for global navigation and the panels below for quick inspection.</p><div className="cv-hero-actions"><a href="/admin/chief-of-staff">Ask Chief</a><a href="/admin/tasks">Open Tasks</a></div></div>
          <aside className="cv-status"><span className="cv-label">Next show</span><h2>{nextShow ? nextShow.band : 'No show loaded'}</h2><p>{nextShow ? `${nextShow.venue} · ${nextShow.dateLabel} · ${nextShow.startTime}` : 'Add shows in Airtable to populate this workspace.'}</p></aside>
        </header>

        <section className="cv-stats"><Stat label="Open Work" value={queue.length} sub="Tasks, approvals, and show gaps" /><Stat label="Shows" value={shows.length} sub={`${needsAttention.length} need attention`} /><Stat label="Approvals" value={pendingApprovals.length} sub="Waiting for review" /><Stat label="Tasks" value={openTasks.length} sub={opsFoundation?.tables?.find(t => t.label === 'TASKS')?.ready ? 'From Airtable' : 'Task table pending'} /></section>

        <section className="cv-quick" aria-label="Command center quick panels">
          <details className="cv-drawer" open><summary>Today quick view <span>{queue.length} items</span></summary><div className="cv-drawer-body"><div className="cv-queue-list">{queue.length ? queue.slice(0, 5).map((item, index) => <QueueItem key={`${item.type}-${item.title}-${index}`} item={item} index={index} />) : <div className="cv-empty">No urgent items loaded.</div>}</div></div></details>
          <details className="cv-drawer"><summary>Specialist shortcuts <span>{specialists.length} homepages</span></summary><div className="cv-drawer-body"><div className="cv-mini-grid">{specialists.map(guide => <SmallCard key={guide.kind} href={`/admin/specialists/${guide.kind}`} label={guide.group} title={guide.shortLabel} body={guide.tagline} />)}</div></div></details>
          <details className="cv-drawer"><summary>Approvals + tasks <span>{pendingApprovals.length + openTasks.length} open</span></summary><div className="cv-drawer-body"><div className="cv-mini-grid">{pendingApprovals.slice(0, 4).map(item => <SmallCard key={item.id} href="/admin/approvals" label={item.status} title={item.item} body={`${item.riskLevel} · ${item.createdAt}`} />)}{openTasks.slice(0, 4).map(task => <SmallCard key={task.id} href="/admin/tasks" label={task.status} title={task.title} body={`${task.dueLabel} · ${task.priority}`} />)}{!pendingApprovals.length && !openTasks.length && <div className="cv-empty">No open approvals or Airtable tasks loaded.</div>}</div></div></details>
          <details className="cv-drawer"><summary>System readiness <span>{tables.filter(table => table.ready).length}/{tables.length} ready</span></summary><div className="cv-drawer-body"><div className="cv-mini-grid">{tables.map(table => <TableStatus key={table.label} table={table} />)}</div></div></details>
        </section>

        <section className="cv-main">
          <div className="cv-lower">
            <section className="cv-panel"><div className="cv-panel-head"><div><span className="cv-label">Work Queue</span><h2>Needs action</h2><p>Prioritized from Airtable show health, approvals, and the task table when available.</p></div><a className="cv-tool" href="/admin/tasks">View all</a></div><div className="cv-queue-list">{queue.length ? queue.map((item, index) => <QueueItem key={`${item.type}-${item.title}-${index}`} item={item} index={index} />) : <div className="cv-empty">No urgent items loaded.</div>}</div></section>
            <section id="shows" className="cv-panel"><div className="cv-panel-head"><div><span className="cv-label">Shows</span><h2>Upcoming</h2><p>Every show is a project workspace with status, details, specialists, notes, and actions.</p></div></div><div className="cv-show-grid">{shows.slice(0, 6).map(show => <ShowCard key={show.id} show={show} />)}</div></section>
          </div>
          <aside className="cv-side">
            <section className="cv-panel"><div className="cv-panel-head"><div><span className="cv-label">Work Areas</span><h2>Navigate</h2></div></div><div className="cv-mini-grid">{WORK_AREAS.map(area => <SmallCard key={area.label} href={area.href} label="Open" title={area.label} body={area.body} />)}</div></section>
            <section className="cv-panel"><div className="cv-panel-head"><div><span className="cv-label">Tools</span><h2>Quick links</h2></div></div><div className="cv-tool-grid">{TOOLS.map(([label, href]) => <a className="cv-tool" href={href} target="_blank" rel="noreferrer" key={label}>{label}</a>)}</div></section>
          </aside>
        </section>
      </div>
    </main>
  )
}
