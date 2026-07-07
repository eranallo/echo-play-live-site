export function PortalShell({ children, active = 'portal', showDock = true }) {
  return (
    <main className="portal-app">
      <div className="portal-frame portal-fade-in">
        {children}
      </div>
      {showDock && <PortalDock active={active} />}
    </main>
  )
}

export function PortalDock({ active = 'portal' }) {
  const items = [
    { key: 'portal', href: '/portal', icon: '⌂', label: 'Portal' },
    { key: 'site', href: '/', icon: '★', label: 'Site' },
    { key: 'admin', href: '/admin', icon: '⚙', label: 'Admin' },
  ]

  return (
    <nav className="portal-dock" aria-label="Portal navigation">
      {items.map(item => (
        <a key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
          <span className="portal-dock-icon">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  )
}

export function PortalTopBar({ title, subtitle, backHref = '/portal' }) {
  return (
    <div className="portal-topbar">
      <a className="portal-back" href={backHref} aria-label="Go back">
        ‹
      </a>
      <div className="portal-topbar-title">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <img className="portal-logo-mark" src="/logo.png" alt="" />
    </div>
  )
}

export function PortalHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="portal-hero">
      <div className="portal-hero-logo-wrap">
        <img className="portal-hero-logo" src="/logo.png" alt="Echo Play Live" />
      </div>
      {eyebrow && <div className="portal-eyebrow">{eyebrow}</div>}
      <h1 className="portal-hero-title">{title}</h1>
      {subtitle && <p className="portal-hero-subtitle">{subtitle}</p>}
      {children}
    </section>
  )
}

export function Card({ children, href, accent = false }) {
  const body = (
    <div className={`portal-card ${accent ? 'portal-card-accent' : ''}`}>
      {children}
    </div>
  )

  if (!href) return body

  return (
    <a className="portal-card-link" href={href}>
      {body}
    </a>
  )
}

export function PersonRow({ person, href }) {
  const initials = person.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <a className="portal-person-row" href={href}>
      {person.photo ? (
        <img className="portal-avatar" src={person.photo} alt="" />
      ) : (
        <div className="portal-avatar-fallback">
          {initials}
        </div>
      )}
      <div className="portal-person-meta">
        <strong>{person.name}</strong>
        {person.role && <span>{person.role}</span>}
      </div>
      <div className="portal-chevron">›</div>
    </a>
  )
}

export function SectionLabel({ children }) {
  return <div className="portal-section-label">{children}</div>
}

export function Pill({ children, accent = false }) {
  return <span className={`portal-pill ${accent ? 'portal-pill-accent' : ''}`}>{children}</span>
}

export function MetricGrid({ items }) {
  return (
    <div className="portal-metric-grid portal-stagger">
      {items.map(item => (
        <Card key={item.label} href={item.href} accent={item.accent}>
          <div className="portal-metric-icon">{item.icon}</div>
          <div className="portal-metric-value">{item.value}</div>
          <div className="portal-metric-label">{item.label}</div>
          <div className="portal-metric-sub">{item.sub}</div>
        </Card>
      ))}
    </div>
  )
}

export function ShowCard({ show, href, roleLabels = [] }) {
  const days = show.daysUntil
  const dayLabel = days === null ? '—' : days === 0 ? 'Today' : `${days}d`
  const urgent = days !== null && days <= 7

  return (
    <Card href={href} accent={urgent}>
      <div className="portal-show-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="portal-show-kicker">
            {show.bandNames.map(name => <Pill key={name} accent>{name}</Pill>)}
            {roleLabels.map(label => <Pill key={label}>{label}</Pill>)}
          </div>
          <div className="portal-show-title">{show.venueName}</div>
          <div className="portal-show-date">{show.dateLabel}</div>
        </div>
        <div className="portal-countdown">
          <div>
            <strong>{dayLabel}</strong>
            <span>{days === 0 ? 'show day' : 'away'}</span>
          </div>
        </div>
      </div>
      <div className="portal-time-grid">
        <TimeBlock label="Load" value={show.loadIn} />
        <TimeBlock label="Start" value={show.start} />
        <TimeBlock label="End" value={show.end} />
      </div>
      {show.venueAddress && <div className="portal-location"><span>📍</span><span>{show.venueAddress}</span></div>}
    </Card>
  )
}

export function TimeBlock({ label, value }) {
  return (
    <div className="portal-time-block">
      <div className="portal-time-label">{label}</div>
      <div className="portal-time-value">{value || 'TBD'}</div>
    </div>
  )
}

export function InfoRow({ label, value, href }) {
  if (!value) return null
  const content = (
    <div className="portal-info-row">
      <div className="portal-info-label">{label}</div>
      <div className="portal-info-value">{value}</div>
    </div>
  )
  return href ? <a className="portal-info-link" href={href} style={{ textDecoration: 'none' }}>{content}</a> : content
}

export function InlineActions({ actions }) {
  return (
    <div className="portal-inline-actions">
      {actions.filter(Boolean).map(action => (
        <a className="portal-action" key={action.href} href={action.href}>{action.label}</a>
      ))}
    </div>
  )
}

export function PersonHeader({ person, type = 'Member' }) {
  const initials = person.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <section style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      {person.photo ? (
        <img className="portal-avatar" src={person.photo} alt="" style={{ width: 64, height: 64, borderRadius: 22 }} />
      ) : (
        <div className="portal-avatar-fallback" style={{ width: 64, height: 64, borderRadius: 22 }}>
          {initials}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="portal-eyebrow">{type}</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 52, lineHeight: 0.86, letterSpacing: 'var(--ls-display)', margin: '6px 0 0' }}>{person.name}</h1>
        {person.role && <div style={{ marginTop: 10 }}><Pill accent>{person.role}</Pill></div>}
      </div>
    </section>
  )
}

export function EmptyState({ title = 'Nothing here yet', body }) {
  return (
    <Card>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 34, lineHeight: 0.95, letterSpacing: 'var(--ls-display)' }}>{title}</div>
      {body && <p style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-snug)', marginTop: 10 }}>{body}</p>}
    </Card>
  )
}

export function ErrorCard({ message }) {
  return (
    <PortalShell>
      <PortalHero eyebrow="Portal Error" title="Couldn’t load this page" subtitle={message || 'Something went wrong loading the portal.'} />
      <Card href="/portal" accent>Back to Portal</Card>
    </PortalShell>
  )
}
