import { getAirtableSetupStatus } from '@/lib/admin/airtableMeta'

export const dynamic = 'force-dynamic'

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

function FieldList({ title, fields, emptyText, highlight }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--ff-label)',
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: highlight ? 'var(--c-epl)' : 'var(--c-text-faint)',
        marginBottom: 'var(--s-2)',
      }}>
        {title}
      </div>
      {fields.length === 0 ? (
        <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-base)' }}>{emptyText}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {fields.map(field => (
            <span key={typeof field === 'string' ? field : field.id} style={{
              border: '1px solid var(--c-border)',
              background: 'var(--c-surface-2)',
              color: highlight ? 'var(--c-epl)' : 'var(--c-text-muted)',
              padding: '6px 9px',
              fontSize: '12px',
            }}>
              {typeof field === 'string' ? field : `${field.name} · ${field.type}`}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SupportTableCard({ table }) {
  return (
    <article style={{
      border: `1px solid ${table.ready ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
      background: table.ready ? 'rgba(212, 160, 23, 0.04)' : 'rgba(255, 255, 255, 0.015)',
      padding: 'var(--s-6)',
      display: 'grid',
      gap: 'var(--s-4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
        <div>
          <div className="section-label" style={{ marginBottom: 'var(--s-3)', color: 'var(--c-epl)' }}>
            {table.exists ? 'Table Found' : 'Missing Table'}
          </div>
          <h2 style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'var(--t-h3)',
            letterSpacing: 'var(--ls-display)',
            marginBottom: 'var(--s-2)',
          }}>
            {table.name}
          </h2>
          <p style={{ color: 'var(--c-text-dim)', lineHeight: 'var(--lh-base)', maxWidth: '760px' }}>
            {table.purpose}
          </p>
        </div>
        <StatusPill active={table.ready}>
          {table.ready ? 'Ready' : table.exists ? 'Fields Needed' : 'Create Table'}
        </StatusPill>
      </div>

      {table.id && (
        <p style={{ color: 'var(--c-text-faint)', fontSize: '13px' }}>
          Airtable table ID: {table.id}
        </p>
      )}

      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <FieldList
          title="Missing Required Fields"
          fields={table.missingFields}
          emptyText="No required fields are missing."
          highlight
        />
        <FieldList
          title="Current Fields"
          fields={table.fields}
          emptyText="No fields detected yet."
        />
      </div>
    </article>
  )
}

export default async function AdminSetupPage() {
  const setup = await getAirtableSetupStatus()

  return (
    <main style={{
      minHeight: '100vh',
      padding: 'clamp(96px, 10vw, 140px) var(--gutter-fluid)',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--c-epl-soft) 0%, transparent 60%), var(--c-bg)',
    }}>
      <section style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
        <a href="/admin" style={{ color: 'var(--c-epl)', textDecoration: 'none', fontFamily: 'var(--ff-label)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ← Back to Command Center
        </a>

        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--s-7)',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 'var(--s-7)',
          marginTop: 'var(--s-6)',
          marginBottom: 'var(--s-7)',
        }}>
          <div style={{ maxWidth: '820px' }}>
            <div className="section-label" style={{ color: 'var(--c-epl)', marginBottom: 'var(--s-4)' }}>
              Admin Setup
            </div>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'var(--t-display)',
              lineHeight: 'var(--lh-display)',
              letterSpacing: 'var(--ls-display)',
              marginBottom: 'var(--s-4)',
            }}>
              Airtable Safety Layer
            </h1>
            <p style={{ fontSize: 'var(--t-body-l)', color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)' }}>
              This page checks whether the support tables for agents, approvals, and run logs are ready for the dashboard. It reads Airtable metadata server-side using the current deployment environment and does not expose credentials.
            </p>
          </div>

          <div style={{
            border: '1px solid var(--c-epl-line)',
            background: 'rgba(212, 160, 23, 0.06)',
            padding: 'var(--s-5)',
            minWidth: '260px',
          }}>
            <div style={{ fontFamily: 'var(--ff-label)', fontSize: 'var(--t-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--c-epl)', marginBottom: 'var(--s-2)' }}>
              Setup Status
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '44px', lineHeight: 1 }}>
              {setup.counts.ready}/{setup.counts.required}
            </div>
            <p style={{ color: 'var(--c-text-dim)', marginTop: 'var(--s-3)', lineHeight: 'var(--lh-snug)' }}>
              support tables ready
            </p>
          </div>
        </header>

        {!setup.ok && (
          <section style={{
            border: '1px solid var(--c-epl-line)',
            background: 'rgba(212, 160, 23, 0.06)',
            padding: 'var(--s-5)',
            marginBottom: 'var(--s-6)',
            color: 'var(--c-text-muted)',
            lineHeight: 'var(--lh-base)',
          }}>
            <strong style={{ color: 'var(--c-epl)' }}>Metadata check warning:</strong>
            <br />
            {setup.error}
          </section>
        )}

        <div style={{ display: 'grid', gap: 'var(--s-5)' }}>
          {setup.supportTables.map(table => (
            <SupportTableCard key={table.name} table={table} />
          ))}
        </div>
      </section>
    </main>
  )
}
