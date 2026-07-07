function StatusPill({ children, active }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      border: `1px solid ${active ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
      background: active ? 'rgba(212, 160, 23, 0.08)' : 'var(--c-surface-2)',
      color: active ? 'var(--c-epl)' : 'var(--c-text-dim)',
      padding: '5px 8px',
      fontFamily: 'var(--ff-label)',
      fontSize: '10px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function EmptyState({ children }) {
  return (
    <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-base)' }}>
      {children}
    </p>
  )
}

function OpsTableStatus({ tables }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-3)' }}>
      {tables.map(table => (
        <article key={table.label} style={{
          border: `1px solid ${table.ready ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
          background: table.ready ? 'rgba(212, 160, 23, 0.045)' : 'var(--c-surface-2)',
          padding: 'var(--s-4)',
        }}>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: table.ready ? 'var(--c-epl)' : 'var(--c-text-faint)',
            marginBottom: 'var(--s-2)',
          }}>
            {table.ready ? 'Ready' : table.missing ? 'Setup Needed' : 'Check Needed'}
          </div>
          <h3 style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'var(--t-h3)',
            letterSpacing: 'var(--ls-display)',
            marginBottom: 'var(--s-2)',
          }}>
            {table.label}
          </h3>
          <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-snug)' }}>
            {table.ready ? `${table.records} records found.` : 'This Airtable table is not available yet.'}
          </p>
        </article>
      ))}
    </div>
  )
}

function MiniList({ title, items, emptyText, renderItem }) {
  return (
    <section style={{
      border: '1px solid var(--c-border)',
      background: 'rgba(255, 255, 255, 0.015)',
      padding: 'var(--s-5)',
    }}>
      <h3 style={{
        fontFamily: 'var(--ff-display)',
        fontSize: 'var(--t-h3)',
        letterSpacing: 'var(--ls-display)',
        marginBottom: 'var(--s-4)',
      }}>
        {title}
      </h3>
      {items.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
          {items.map(renderItem)}
        </div>
      )}
    </section>
  )
}

export default function OpsFoundation({ ops }) {
  return (
    <section style={{
      border: '1px solid var(--c-border)',
      background: 'rgba(255, 255, 255, 0.015)',
      padding: 'var(--s-6)',
      marginBottom: 'var(--s-8)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--s-5)', flexWrap: 'wrap', marginBottom: 'var(--s-5)' }}>
        <div>
          <div className="section-label" style={{ marginBottom: 'var(--s-3)' }}>
            Phase 1.3
          </div>
          <h2 style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'var(--t-h2)',
            letterSpacing: 'var(--ls-display)',
            lineHeight: 1,
          }}>
            Approval Queue + AI Run Log
          </h2>
          <p style={{ color: 'var(--c-text-dim)', maxWidth: '760px', lineHeight: 'var(--lh-base)', marginTop: 'var(--s-3)' }}>
            This safety layer keeps agent actions reviewable. Agents can draft work, but anything risky should become an approval item and every run should be logged before future write actions are enabled.
          </p>
        </div>
        <StatusPill active={ops.ok}>
          {ops.counts.tablesReady}/3 Tables Ready
        </StatusPill>
      </div>

      <OpsTableStatus tables={ops.tables} />

      {!ops.ok && (
        <div style={{
          border: '1px solid var(--c-epl-line)',
          background: 'rgba(212, 160, 23, 0.06)',
          padding: 'var(--s-5)',
          color: 'var(--c-text-muted)',
          lineHeight: 'var(--lh-base)',
          marginTop: 'var(--s-5)',
        }}>
          <strong style={{ color: 'var(--c-epl)' }}>Setup still needed:</strong> create the Airtable support tables named AI AGENTS, APPROVAL QUEUE, and AI RUNS. The dashboard is ready to read from them once they exist.
        </div>
      )}

      {ops.ok && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'var(--s-4)',
          marginTop: 'var(--s-5)',
        }}>
          <MiniList
            title="Pending Approvals"
            items={ops.approvals.slice(0, 4)}
            emptyText="No approval items yet. Future agent outputs will land here before anything is saved, sent, posted, or published."
            renderItem={item => (
              <article key={item.id} style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-3)' }}>
                <div style={{ color: 'var(--c-text-muted)' }}>{item.item}</div>
                <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-2)' }}>
                  <StatusPill active={item.status === 'Pending'}>{item.status}</StatusPill>
                  <StatusPill active={item.riskLevel === 'High'}>{item.riskLevel}</StatusPill>
                </div>
              </article>
            )}
          />

          <MiniList
            title="Recent AI Runs"
            items={ops.runs.slice(0, 4)}
            emptyText="No agent runs have been logged yet. This will fill in once campaign drafts and approval workflows are active."
            renderItem={run => (
              <article key={run.id} style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-3)' }}>
                <div style={{ color: 'var(--c-text-muted)' }}>{run.name}</div>
                <p style={{ color: 'var(--c-text-faint)', fontSize: '13px', marginTop: 'var(--s-1)' }}>{run.createdAt}</p>
              </article>
            )}
          />

          <MiniList
            title="AI Specialists"
            items={ops.agents.slice(0, 4)}
            emptyText="No specialist records yet. Start with Chief of Staff, Show Campaign, Creative / Canva, and Web Developer."
            renderItem={agent => (
              <article key={agent.id} style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-3)' }}>
                <div style={{ color: 'var(--c-text-muted)' }}>{agent.name}</div>
                <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-2)' }}>
                  <StatusPill active={agent.status === 'Active'}>{agent.status}</StatusPill>
                  <StatusPill active>{agent.type}</StatusPill>
                </div>
              </article>
            )}
          />
        </div>
      )}
    </section>
  )
}
