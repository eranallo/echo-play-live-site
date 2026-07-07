import { Card, ErrorCard, InfoRow, Pill, PortalShell, PortalTopBar, SectionLabel, TimeBlock } from '@/components/portal/PortalUI'
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

  return (
    <PortalShell>
      <PortalTopBar title="Show Detail" subtitle={show.dateLabel} backHref={backHref} />

      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {show.bandNames.map(name => <Pill key={name} accent>{name}</Pill>)}
          {show.indoorOutdoor && <Pill>{show.indoorOutdoor}</Pill>}
        </div>
        <h1 style={{ fontSize: 32, lineHeight: 1, margin: 0, letterSpacing: '-0.04em' }}>{show.venueName}</h1>
        <p style={{ color: '#7b7f91', margin: '10px 0 0', fontSize: 14 }}>{show.dateLabel}</p>
      </section>

      <Card accent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <TimeBlock label="Load" value={show.loadIn} />
          <TimeBlock label="Start" value={show.start} />
          <TimeBlock label="End" value={show.end} />
        </div>
      </Card>

      <SectionLabel>Venue</SectionLabel>
      <Card>
        <InfoRow label="Venue" value={show.venueName} />
        <InfoRow label="Address" value={show.venueAddress} href={mapHref} />
        <InfoRow label="Age" value={show.ageRestriction} />
        <InfoRow label="Ticket" value={show.ticketPrice || (show.ticketUrl ? 'Ticket link available' : 'TBD')} href={show.ticketUrl || null} />
      </Card>

      <SectionLabel>People</SectionLabel>
      <Card>
        <InfoRow label="Members" value={show.memberNames.join(', ')} />
        <InfoRow label="Sound" value={show.soundEngineerNames.join(', ')} />
        <InfoRow label="Merch" value={show.merchPersonNames.join(', ')} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
              <div style={{ fontWeight: 800 }}>{detail.setlist.name}</div>
              {detail.setlist.length && <div style={{ color: '#7b7f91', fontSize: 12 }}>{detail.setlist.length}</div>}
            </div>
            {detail.setlist.songs.length ? (
              <ol style={{ margin: 0, paddingLeft: 20, color: '#f4f4f6', lineHeight: 1.55 }}>
                {detail.setlist.songs.map(song => (
                  <li key={song.id}>
                    {song.title}{song.artist ? <span style={{ color: '#7b7f91' }}> — {song.artist}</span> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ color: '#7b7f91' }}>No songs attached to this setlist yet.</div>
            )}
          </div>
        ) : (
          <div style={{ color: '#7b7f91' }}>No setlist attached yet.</div>
        )}
      </Card>
    </PortalShell>
  )
}
