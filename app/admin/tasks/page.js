import AdminNav from '@/components/admin/AdminNav'
import TaskQueueClient from '@/components/admin/TaskQueueClient'
import { getCachedAdminOpsFoundation, getCachedAdminShowsOverview } from '@/lib/admin/cachedAirtable'

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

export default async function AdminTasksPage() {
  const [showsOverview, opsFoundation] = await Promise.all([
    getCachedAdminShowsOverview(),
    getCachedAdminOpsFoundation(),
  ])

  const shows = showsOverview?.shows || []
  const approvals = opsFoundation?.approvals || []
  const airtableTasks = (opsFoundation?.tasks || []).filter(task => !task.isDone)
  const inferred = inferredTasks(shows, approvals)
  const tasksTable = opsFoundation?.tables?.find(table => table.label === 'TASKS')

  return (
    <main className="tq-shell">
      <AdminNav contextLabel="Tasks" backHref="/admin" backLabel="Command Center" />
      <style>{`
        .tq-shell{min-height:100vh;padding:clamp(82px,8vw,122px) var(--gutter-fluid);padding-bottom:clamp(88px,8vw,122px);background:radial-gradient(circle at 10% 0%,rgba(212,160,23,.16),transparent 32%),linear-gradient(180deg,#101010,#050505 42%,#030303);color:var(--c-text)}.tq-wrap{max-width:var(--layout-max);margin:0 auto}.tq-label{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--c-epl);text-decoration:none;font-style:normal}.tq-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.45fr);gap:var(--s-6);align-items:end;margin-bottom:var(--s-6)}.tq-hero h1{font-family:var(--ff-display);font-size:clamp(64px,10vw,140px);line-height:.78;letter-spacing:var(--ls-display);margin:var(--s-3) 0}.tq-hero p{color:var(--c-text-muted);font-size:var(--t-body-l);line-height:var(--lh-base);max-width:760px}.tq-status{border:1px solid var(--c-epl-line);background:rgba(212,160,23,.06);padding:var(--s-5)}.tq-status strong{display:block;font-family:var(--ff-display);font-size:58px;line-height:.85;color:var(--c-epl);margin:8px 0}.tq-status p{color:var(--c-text-dim);line-height:var(--lh-base)}@media(max-width:980px){.tq-hero{grid-template-columns:1fr}}@media(max-width:680px){.tq-shell{padding-top:74px}.tq-hero h1{font-size:clamp(58px,20vw,92px)}}
      `}</style>
      <div className="tq-wrap">
        <header className="tq-hero"><div><span className="tq-label">Work Queue</span><h1>Tasks</h1><p>This is the hard-data work layer. Create tasks, convert inferred work into Airtable records, and mark work complete when it is done.</p></div><aside className="tq-status"><span className="tq-label">Task table</span><strong>{tasksTable?.ready ? 'On' : 'Pending'}</strong><p>{tasksTable?.ready ? `${airtableTasks.length} open Airtable task${airtableTasks.length === 1 ? '' : 's'}` : 'The command center is ready for a TASKS table, but it is not connected yet.'}</p></aside></header>
        <TaskQueueClient airtableTasks={airtableTasks} inferredTasks={inferred} tasksTableReady={Boolean(tasksTable?.ready)} />
      </div>
    </main>
  )
}
