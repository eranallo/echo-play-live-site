import { Card, ErrorCard, InfoRow, InlineActions, Pill, PortalShell, PortalTopBar, SectionLabel, TimeBlock } from '@/components/portal/PortalUI'
import { getPortalShow } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

function BackHref({ searchParams }) {
  const from = searchParams?.from
  const person = searchParams?.person
  if (from === 'member' && person) return `/portal/member/${person}`
  if (from === 'crew' && person) return `/portal/crew/${person}`
  return '/portal'
}

export default async function PortalShowPage({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const detail = await getPortalShow(resolvedParams?.id)

  if (!detail.ok || !detail.show) {
    return <ErrorCard message={detail.error} />
  }

  const show = detail.show
  const mapHref = show.venueAddress ? `https://maps.apple.com/?q=${encodeURIComponent(show.venueAddress)}` : null
  const backHref = BackHref({ searchParams: resolvedSearch })
  const ticketLabel = show.ticketPrice || (show.ticketUrl ? 'Ticket link available' : 'TBD')
  const trailerLoadIn = show.trailerLoadIn || show.raw?.['Trailer Load-In Time']

  return (
    <PortalShell>
      <PortalTopBar title="Show Detail" subtitle={show.dateLabel} backHref={backHref} />

      <section style={{ marginBottom: 20 }}>
        <div className="portal-show-kicker">
          {show.bandNames.map(name => <Pill key={name} accent>{name}</Pill>)}
          {show.indoorOutdoor && <Pill>{show.indoorOutdoor}</Pill>}
          {show.ageRestriction && <Pill>{show.ageRestriction}</Pill>}
        </div>
        <h1 className="portal-hero-title" style={{ marginBottom: 8 }}>{show.venueName}</h1>
        <p className="portal-hero-subtitle" style={{ marginTop: 0 }}>{show.dateLabel}</p>
        <InlineActions actions={[
          mapHref ? { href: mapHref, label: 'Open Map' } : null,
          show.ticketUrl ? { href: show.ticketUrl, label: 'Tickets' } : null,
        ]} />
      </section>

      <Card accent>
        <div className="portal-time-grid" style={{ marginTop: 0 }}>
          <TimeBlock label="Trailer Load" value={trailerLoadIn} />
          <TimeBlock label="Venue Load" value={show.loadIn} />
          <TimeBlock label="Start" value={show.start} />
          <TimeBlock label="End" value={show.end} />
        </div>
        <div className="portal-time-grid">
          <TimeBlock label="Sound" value={show.soundCheck} />
          <TimeBlock label="Age" value={show.ageRestriction} />
          <TimeBlock label="Ticket" value={ticketLabel} />
        </div>
      </Card>

      <SectionLabel>Venue</SectionLabel>
      <Card>
        <InfoRow label="Venue" value={show.venueName} />
        <InfoRow label="Address" value={show.venueAddress} href={mapHref} />
        <InfoRow label="Ticket" value={ticketLabel} href={show.ticketUrl || null} />
      </Card>

      <SectionLabel>People</SectionLabel>
      <Card>
        <InfoRow label="Members" value={show.memberNames.join(', ') || 'No members listed.'} />
        <InfoRow label="Sound" value={show.soundEngineerNames.join(', ') || 'No sound engineer listed.'} />
        <InfoRow label="Merch" value={show.merchPersonNames.join(', ') || 'No merch person listed.'} />
      </Card>

      <SectionLabel>Notes</SectionLabel>
      <Card>
        <InfoRow label="Show" value={show.showNotes || 'No show notes listed.'} />
        <InfoRow label="Sound" value={show.soundNotes || 'No sound notes listed.'} />
        <InfoRow label="Merch" value={show.merchNotes || 'No merch notes listed.'} />
      </Card>

      <SectionLabel>Setlist</SectionLabel>
      <Card>
        {detail.setlist ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: 38, lineHeight: 0.9, letterSpacing: 'var(--ls-display)' }}>{detail.setlist.name}</div>
              {detail.setlist.length && <Pill>{detail.setlist.length}</Pill>}
            </div>
            {detail.setlist.songs.length ? (
              <ol style={{ margin: 0, paddingLeft: 22, color: 'var(--c-text)', lineHeight: 1.65 }}>
                {detail.setlist.songs.map(song => (
                  <li key={song.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--c-border)' }}>
                    <strong>{song.title}</strong>{song.artist ? <span style={{ color: 'var(--c-text-dim)' }}> — {song.artist}</span> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ color: 'var(--c-text-muted)' }}>No songs attached to this setlist yet.</div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--c-text-muted)' }}>No setlist attached yet.</div>
        )}
      </Card>
    </PortalShell>
  )
}
