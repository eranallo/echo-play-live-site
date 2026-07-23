function Severity({ value }) {
  return <span className={`rdb-severity rdb-${String(value).toLowerCase()}`}>{value}</span>
}

export default function ReadinessBoard({ readiness, socialPosts = [] }) {
  const groups = readiness?.groups || []
  const warnings = readiness?.warnings || []

  return (
    <div className="rdb-shell">
      <style>{`
        .rdb-shell{display:grid;gap:var(--s-4)}.rdb-groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.rdb-group{border:1px solid var(--c-border);background:#070707;padding:14px;display:grid;gap:10px}.rdb-group span,.rdb-warning span,.rdb-post span,.rdb-severity{font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.rdb-group span,.rdb-warning span,.rdb-post span{color:var(--c-text-faint)}.rdb-group strong{font-family:var(--ff-display);font-size:38px;line-height:.85;color:var(--c-epl)}.rdb-progress{height:6px;background:rgba(255,255,255,.08)}.rdb-progress i{display:block;height:100%;background:var(--c-epl)}.rdb-warnings,.rdb-posts{display:grid;gap:8px}.rdb-warning,.rdb-post{display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center;border:1px solid var(--c-border);background:#070707;padding:11px}.rdb-warning strong,.rdb-post strong{color:var(--c-text-muted)}.rdb-severity{border:1px solid var(--c-border);padding:5px 7px;color:var(--c-text-dim)}.rdb-critical{border-color:#9a3737;color:#f3a6a6}.rdb-high{border-color:rgba(255,106,0,.45);color:#ffb27d}.rdb-section h3{font-family:var(--ff-display);font-size:36px;line-height:.9;margin-bottom:12px}.rdb-empty{border:1px dashed var(--c-border);padding:var(--s-4);color:var(--c-text-muted)}@media(max-width:820px){.rdb-groups{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.rdb-groups{grid-template-columns:1fr}.rdb-warning,.rdb-post{grid-template-columns:1fr}.rdb-severity{width:max-content}}
      `}</style>
      <div className="rdb-groups">{groups.map(group => <div className="rdb-group" key={group.name}><span>{group.name} · {group.complete}/{group.total}</span><strong>{group.score}%</strong><div className="rdb-progress"><i style={{ width: `${group.score}%` }} /></div></div>)}</div>
      <section className="rdb-section"><h3>Missing information</h3><div className="rdb-warnings">{warnings.length ? warnings.map(warning => <div className="rdb-warning" key={`${warning.group}-${warning.field}`}><Severity value={warning.severity} /><strong>{warning.label}</strong><span>{warning.group}</span></div>) : <div className="rdb-empty">No readiness warnings. This show is operationally complete against its current funnel.</div>}</div></section>
      <section className="rdb-section"><h3>Campaign plan</h3><div className="rdb-posts">{socialPosts.length ? socialPosts.map(post => <div className="rdb-post" key={post.id}><Severity value={post.status} /><strong>{post.name}</strong><span>{post.channel || post.scheduledDate || 'Unscheduled'}</span></div>) : <div className="rdb-empty">No linked social posts yet. The prep-state checklist above still tracks the core campaign requirements.</div>}</div></section>
    </div>
  )
}
