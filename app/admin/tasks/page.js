import { getAdminOpsFoundation, getAdminShowsOverview } from '@/lib/admin/airtable'

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

function dueText(days) {
  if (days === null) return 'No date'
  if (days < 0) return 'Past'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days`
}

function inferredTasks(shows, approvals) {
  const tasks = []

  approvals.filter(item => item.status === 'Pending').forEach(item => tasks.push({
    id: `approval-${item.id}`,
    type: 'Approval',
    status: 'Review',
    priority: item.riskLevel === 'High' ? 'High' : 'Normal',
    title: item.item,
    body: item.proposedChange || 'Review generated work before anything public or external happens.',
    href: '/admin/approvals',
    due: item.createdAt,
  }))

  shows.forEach(show => {
    const days = daysUntil(show.date)
    show.missingFlags.forEach(flag => tasks.push({
      id: `${show.id}-${flag}`,
      type: 'Show Gap',
      status: 'Open',
      priority: days !== null && days <= 7 ? 'High' : 'Normal',
      title: `${flag}: ${show.band}`,
      body: `${show.venue} · ${show.dateLabel}`,
      href: `/admin/shows/${show.id}`,
      due: dueText(days),
    }))
  })

  return tasks
}

function TaskRow({ task, source = 'Airtable' }) {
  const priorityClass = ['High', 'Urgent'].includes(task.priority) ? 'tq-high' : ''
  return (
    <a className={`tq-row ${priorityClass}`} href={task.href || '#'}>
      <div className="tq-type"><span>{source}</span><strong>{task.type || task.source || 'Task'}</strong></div>
      <div><h3>{task.title}</h3><p>{task.body || task.notes || task.relatedShow || 'No notes yet.'}</p></div>
      <div className="tq-meta"><span>{task.priority || 'Normal'}</span><em>{task.due || task.dueLabel || 'No due date'}</em></div>
    </a>
  )
}

function Column({ title, items, source }) {
  return (
    <section className="tq-column">
      <div className="tq-col-head"><span>{items.length}</span><h2>{title}</h2></div>
      <div className="tq-list">{items.length ? items.map(item => <TaskRow key={item.id} task={item} source={source} />) : <p className="tq-empty">Nothing here.</p>}</div>
    </section>
  )
}

export default async function AdminTasksPage() {
  const [showsOverview, opsFoundation] = await Promise.all([
    getAdminShowsOverview(),
    getAdminOpsFoundation(),
  ])

  const shows = showsOverview?.shows || []
  const approvals = opsFoundation?.approvals || []
  const airtableTasks = (opsFoundation?.tasks || []).filter(task => !['Done', 'Complete', 'Completed'].includes(task.status))
  const inferred = inferredTasks(shows, approvals)
  const high = [...airtableTasks.map(t => ({ ...t, href: '/admin/tasks' })), ...inferred].filter(task => ['High', 'Urgent'].includes(task.priority))
  const normal = [...airtableTasks.map(t => ({ ...t, href: '/admin/tasks' })), ...inferred].filter(task => !['High', 'Urgent'].includes(task.priority))
  const tasksTable = opsFoundation?.tables?.find(table => table.label === 'TASKS')

  return (
    <main className="tq-shell">
      <style>{`
        .tq-shell{min-height:100vh;padding:clamp(76px,8vw,116px) var(--gutter-fluid);background:radial-gradient(circle at 10% 0%,rgba(212,160,23,.16),transparent 32%),linear-gradient(180deg,#101010,#050505 42%,#030303);color:var(--c-text)}.tq-wrap{max-width:var(--layout-max);margin:0 auto}.tq-top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:var(--s-6)}.tq-back,.tq-nav a,.tq-label,.tq-col-head span,.tq-type span,.tq-meta span,.tq-meta em{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl);text-decoration:none;font-style:normal}.tq-nav{display:flex;gap:8px;flex-wrap:wrap}.tq-nav a{border:1px solid var(--c-border);color:var(--c-text-muted);padding:9px 12px;border-radius:999px}.tq-nav a:hover{border-color:var(--c-epl-line);color:var(--c-epl)}.tq-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.45fr);gap:var(--s-6);align-items:end;margin-bottom:var(--s-6)}.tq-hero h1{font-family:var(--ff-display);font-size:clamp(64px,10vw,140px);line-height:.78;letter-spacing:var(--ls-display);margin:var(--s-3) 0}.tq-hero p{color:var(--c-text-muted);font-size:var(--t-body-l);line-height:var(--lh-base);max-width:760px}.tq-status{border:1px solid var(--c-epl-line);background:rgba(212,160,23,.06);padding:var(--s-5)}.tq-status strong{display:block;font-family:var(--ff-display);font-size:58px;line-height:.85;color:var(--c-epl);margin:8px 0}.tq-status p{color:var(--c-text-dim);line-height:var(--lh-base)}.tq-board{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-5);align-items:start}.tq-column{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-5)}.tq-col-head{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid var(--c-border);padding-bottom:var(--s-4);margin-bottom:var(--s-4)}.tq-col-head h2{font-family:var(--ff-display);font-size:var(--t-h2);line-height:.9;letter-spacing:var(--ls-display)}.tq-list{display:grid;gap:10px}.tq-row{display:grid;grid-template-columns:130px 1fr minmax(120px,.22fr);gap:14px;align-items:center;color:inherit;text-decoration:none;border:1px solid var(--c-border);background:#070707;padding:14px;transition:transform .18s ease,border-color .18s ease}.tq-row:hover{transform:translateX(4px);border-color:var(--c-epl-line)}.tq-high{border-color:rgba(255,106,0,.36)}.tq-type strong{display:block;color:var(--c-text-faint);font-size:12px;margin-top:6px}.tq-row h3{color:var(--c-text);font-size:16px;margin-bottom:5px}.tq-row p{color:var(--c-text-dim);line-height:var(--lh-snug)}.tq-meta{display:grid;gap:6px;text-align:right}.tq-meta em{color:var(--c-text-faint)}.tq-empty{color:var(--c-text-muted);border:1px dashed var(--c-border);padding:var(--s-4)}.tq-note{margin-top:var(--s-6);border:1px solid var(--c-border);padding:var(--s-4);color:var(--c-text-dim);line-height:var(--lh-base);background:rgba(255,255,255,.018)}@media(max-width:980px){.tq-hero,.tq-board{grid-template-columns:1fr}.tq-row{grid-template-columns:1fr}.tq-meta{text-align:left;display:flex;gap:10px;flex-wrap:wrap}}@media(max-width:680px){.tq-shell{padding-top:70px}.tq-top{align-items:flex-start}.tq-nav{justify-content:flex-end}.tq-hero h1{font-size:clamp(58px,20vw,92px)}.tq-column{padding:var(--s-4);margin-left:calc(var(--gutter-fluid)*-.25);margin-right:calc(var(--gutter-fluid)*-.25)}}
      `}</style>
      <div className="tq-wrap">
        <nav className="tq-top"><a className="tq-back" href="/admin">← Command Center</a><div className="tq-nav"><a href="/admin/chief-of-staff">Chief</a><a href="/admin/specialists">Specialists</a><a href="/admin/approvals">Approvals</a></div></nav>
        <header className="tq-hero"><div><span className="tq-label">Work Queue</span><h1>Tasks</h1><p>This page is the hard-data work layer. It reads Airtable TASKS when available and also shows operational tasks inferred from show gaps and approval items.</p></div><aside className="tq-status"><span className="tq-label">Task table</span><strong>{tasksTable?.ready ? 'On' : 'Pending'}</strong><p>{tasksTable?.ready ? `${airtableTasks.length} open Airtable task${airtableTasks.length === 1 ? '' : 's'}` : 'The command center is ready for a TASKS table, but it is not connected yet.'}</p></aside></header>
        <section className="tq-board"><Column title="High Priority" items={high} source="Queue" /><Column title="Normal Priority" items={normal} source="Queue" /></section>
        <div className="tq-note">Next phase: create or confirm the Airtable TASKS schema, then let Chief of Staff and specialists create, complete, snooze, and assign real tasks through protected server-side actions.</div>
      </div>
    </main>
  )
}
