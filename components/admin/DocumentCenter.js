function DocumentCard({ showId, document }) {
  const href = `/api/admin/shows/${showId}/documents/${document.id}.pdf`
  const required = document.issues.filter(item => item.severity !== 'Helpful')

  return (
    <article className={`dc-card ${document.id === 'document-package' ? 'dc-package' : ''}`}>
      <div className="dc-card-head">
        <div>
          <span className="dc-audience">{document.audience}</span>
          <h3>{document.label}</h3>
        </div>
        <span className={`dc-status ${document.ready ? 'dc-ready' : 'dc-open'}`}>
          {document.ready ? 'Ready' : `${required.length} open`}
        </span>
      </div>
      <p>{document.description}</p>
      {document.issues.length > 0 && (
        <div className="dc-issues" aria-label={`${document.label} source data gaps`}>
          {document.issues.slice(0, 4).map(item => (
            <span key={`${document.id}-${item.label}`}>
              {item.label}{item.severity === 'Helpful' ? ' · helpful' : ''}
            </span>
          ))}
          {document.issues.length > 4 && <span>+{document.issues.length - 4} more</span>}
        </div>
      )}
      <div className="dc-actions">
        <a href={`${href}?view=1`} target="_blank" rel="noreferrer">Preview / Print</a>
        <a href={href}>Download PDF</a>
      </div>
    </article>
  )
}

export default function DocumentCenter({ showId, document }) {
  if (!document) {
    return <p className="dc-empty">The document package could not be built from the current Airtable record.</p>
  }

  const readyCount = document.documents.filter(item => item.ready).length

  return (
    <div className="dc-shell">
      <style>{`
        .dc-shell{display:grid;gap:var(--s-4)}.dc-summary{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--s-4);align-items:end;border:1px solid var(--c-epl-line);background:linear-gradient(135deg,rgba(212,160,23,.12),rgba(255,255,255,.015));padding:var(--s-4)}.dc-summary p,.dc-card p{color:var(--c-text-muted);font-size:14px;line-height:var(--lh-base)}.dc-meta{display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:8px}.dc-meta div{border-left:2px solid var(--c-epl);padding-left:12px}.dc-meta span,.dc-audience{display:block;font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-epl);margin-bottom:5px}.dc-meta strong{font-size:13px;color:var(--c-text-muted)}.dc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dc-card{border:1px solid var(--c-border);background:#070707;padding:var(--s-4);display:grid;gap:14px;align-content:start}.dc-package{grid-column:1/-1;border-color:var(--c-epl-line);background:linear-gradient(135deg,rgba(212,160,23,.1),#070707 55%)}.dc-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.dc-card h3{font-family:var(--ff-display);font-size:32px;line-height:.9;letter-spacing:var(--ls-display)}.dc-status{flex:0 0 auto;border:1px solid var(--c-border);padding:7px 9px;font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.dc-ready{color:var(--c-epl);border-color:var(--c-epl-line);background:rgba(212,160,23,.08)}.dc-open{color:#efb0a8;border-color:rgba(239,176,168,.35);background:rgba(239,176,168,.05)}.dc-issues{display:flex;flex-wrap:wrap;gap:6px}.dc-issues span{border:1px solid var(--c-border);background:#050505;color:var(--c-text-dim);padding:6px 8px;font-size:11px}.dc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto}.dc-actions a{min-height:40px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--c-epl-line);padding:0 13px;color:var(--c-epl);text-decoration:none;font-family:var(--ff-label);font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.dc-actions a:last-child{background:var(--c-epl);color:#050505}.dc-actions a:hover{transform:translateY(-1px)}.dc-empty{border:1px dashed var(--c-border);padding:var(--s-4);color:var(--c-text-muted)}@media(max-width:780px){.dc-summary{grid-template-columns:1fr}.dc-grid{grid-template-columns:1fr}.dc-package{grid-column:auto}.dc-meta{grid-template-columns:1fr}.dc-card-head{display:grid}.dc-actions a{flex:1}}
      `}</style>
      <section className="dc-summary">
        <div>
          <span className="dc-audience">Single source package</span>
          <p>Every PDF below is generated from the current Airtable show, venue, schedule, staffing, finance, and recap records. Update the show file, save, and the next download reflects the change.</p>
        </div>
        <div className="dc-meta">
          <div><span>Ready now</span><strong>{readyCount} of {document.documents.length}</strong></div>
          <div><span>Show file updated</span><strong>{document.sourceUpdatedLabel}</strong></div>
          <div><span>Version</span><strong>{document.version}</strong></div>
          <div><span>Format</span><strong>Letter PDF · email ready</strong></div>
        </div>
      </section>
      <div className="dc-grid">
        {document.documents.map(item => (
          <DocumentCard key={item.id} showId={showId} document={item} />
        ))}
      </div>
    </div>
  )
}
