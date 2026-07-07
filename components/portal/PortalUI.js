const colors = {
  bg: '#0a0a0f',
  panel: '#111118',
  card: '#0f0f16',
  border: '#232333',
  muted: '#7b7f91',
  text: '#f4f4f6',
  accent: '#d4a017',
  accentSoft: 'rgba(212, 160, 23, 0.1)',
}

export function PortalShell({ children }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        padding: '18px 16px 48px',
      }}>
        {children}
      </div>
    </main>
  )
}

export function PortalTopBar({ title, subtitle, backHref = '/portal' }) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      margin: '-18px -16px 20px',
      padding: '12px 16px',
      background: 'rgba(10, 10, 15, 0.94)',
      borderBottom: `1px solid ${colors.border}`,
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <a href={backHref} style={{ color: colors.accent, textDecoration: 'none', fontSize: 24, lineHeight: 1 }}>
        ‹
      </a>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

export function PortalHero({ eyebrow, title, subtitle, children }) {
  return (
    <section style={{ textAlign: 'center', padding: '28px 4px 20px' }}>
      <img src="/logo.png" alt="Echo Play Live" style={{ width: 88, height: 88, objectFit: 'contain', marginBottom: 16, mixBlendMode: 'screen' }} />
      {eyebrow && <div style={{ color: colors.accent, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>{eyebrow}</div>}
      <h1 style={{ fontSize: 30, lineHeight: 1, margin: 0, letterSpacing: '-0.04em' }}>{title}</h1>
      {subtitle && <p style={{ color: colors.muted, fontSize: 14, lineHeight: 1.45, margin: '12px auto 0', maxWidth: 340 }}>{subtitle}</p>}
      {children}
    </section>
  )
}

export function Card({ children, href, accent = false }) {
  const body = (
    <div style={{
      background: accent ? colors.accentSoft : colors.card,
      border: `1px solid ${accent ? 'rgba(212, 160, 23, 0.45)' : colors.border}`,
      borderRadius: 16,
      padding: 16,
      color: colors.text,
    }}>
      {children}
    </div>
  )

  if (!href) return body

  return (
    <a href={href} style={{ display: 'block', textDecoration: 'none' }}>
      {body}
    </a>
  )
}

export function PersonRow({ person, href }) {
  const initials = person.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <a href={href} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: `1px solid ${colors.border}` }}>
        {person.photo ? (
          <img src={person.photo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: colors.accentSoft, color: colors.accent, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800 }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: colors.text, fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</div>
          {person.role && <div style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{person.role}</div>}
        </div>
        <div style={{ color: colors.accent, fontSize: 20 }}>›</div>
      </div>
    </a>
  )
}

export function SectionLabel({ children }) {
  return <div style={{ color: colors.muted, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, margin: '22px 0 10px' }}>{children}</div>
}

export function Pill({ children, accent = false }) {
  return <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 999, background: accent ? colors.accentSoft : '#181824', color: accent ? colors.accent : colors.muted, border: `1px solid ${accent ? 'rgba(212, 160, 23, 0.35)' : colors.border}`, fontSize: 11, fontWeight: 700 }}>{children}</span>
}

export function MetricGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {items.map(item => (
        <Card key={item.label} href={item.href} accent={item.accent}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
          <div style={{ color: colors.accent, fontSize: 24, fontWeight: 800 }}>{item.value}</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{item.label}</div>
          <div style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{item.sub}</div>
        </Card>
      ))}
    </div>
  )
}

export function ShowCard({ show, href, roleLabels = [] }) {
  const days = show.daysUntil
  const dayLabel = days === null ? '—' : days === 0 ? 'Today' : `${days}d`

  return (
    <Card href={href} accent={days !== null && days <= 7}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {show.bandNames.map(name => <Pill key={name} accent>{name}</Pill>)}
            {roleLabels.map(label => <Pill key={label}>{label}</Pill>)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{show.venueName}</div>
          <div style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>{show.dateLabel}</div>
        </div>
        <div style={{ width: 54, flexShrink: 0, borderRadius: 14, background: '#181824', color: colors.accent, padding: '8px 4px', textAlign: 'center', fontWeight: 800 }}>
          <div style={{ fontSize: 17 }}>{dayLabel}</div>
          <div style={{ color: colors.muted, fontSize: 9, textTransform: 'uppercase' }}>away</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        <TimeBlock label="Load" value={show.loadIn} />
        <TimeBlock label="Start" value={show.start} />
        <TimeBlock label="End" value={show.end} />
      </div>
      {show.venueAddress && <div style={{ color: colors.muted, fontSize: 12, marginTop: 12 }}>📍 {show.venueAddress}</div>}
    </Card>
  )
}

export function TimeBlock({ label, value }) {
  return (
    <div style={{ background: '#08080c', border: `1px solid ${colors.border}`, borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
      <div style={{ color: colors.muted, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ color: colors.text, fontSize: 12, fontWeight: 800 }}>{value || 'TBD'}</div>
    </div>
  )
}

export function InfoRow({ label, value, href }) {
  if (!value) return null
  const content = (
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ color: colors.muted, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800 }}>{label}</div>
      <div style={{ color: href ? colors.accent : colors.text, fontSize: 14, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
  return href ? <a href={href} style={{ textDecoration: 'none' }}>{content}</a> : content
}

export function ErrorCard({ message }) {
  return (
    <PortalShell>
      <PortalHero eyebrow="Portal Error" title="Couldn’t load this page" subtitle={message || 'Something went wrong loading the portal.'} />
      <Card href="/portal" accent>Back to Portal</Card>
    </PortalShell>
  )
}
