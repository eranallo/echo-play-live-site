import AcknowledgmentPanel from '@/components/portal/AcknowledgmentPanel'
import {
  Card,
  ContactCard,
  ErrorCard,
  InfoRow,
  InlineActions,
  Pill,
  PortalShell,
  PortalTopBar,
  ReadinessCard,
  SectionLabel,
  TimeBlock,
} from '@/components/portal/PortalUI'
import { getPortalShow } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

function backHref(searchParams) {
  const from = searchParams?.from
  const person = searchParams?.person
  if (from === 'member' && person) return `/portal/member/${person}`
  if (from === 'crew' && person) return `/portal/crew/${person}`
  return '/portal'
}

function portalContext(searchParams) {
  const from = searchParams?.from
  const personId = searchParams?.person
  if (!personId || !['member', 'crew'].includes(from)) return {}
  return { personType: from, personId }
}

function SetlistCard({ setlist }) {
  return (
    <Card>
      <div className="portal-setlist-head">
        <div>
          <div className="portal-eyebrow">{setlist.bandNames.join(' • ') || 'Setlist'}</div>
          <h2>{setlist.name}</h2>
        </div>
        <div className="portal-show-kicker">
          {setlist.duration && <Pill>{setlist.duration}</Pill>}
          {setlist.lastUpdatedLabel && <Pill>Updated {setlist.lastUpdatedLabel}</Pill>}
        </div>
      </div>

      {setlist.notes && <p className="portal-setlist-notes">{setlist.notes}</p>}

      {setlist.songs.length ? (
        <ol className="portal-song-list">
          {setlist.songs.map(song => (
            <li key={song.id}>
              <div className="portal-song-number" aria-hidden="true" />
              <div>
                <strong>{song.title}</strong>
                <span>
                  {[song.artist, song.album, song.year].filter(Boolean).join(' • ')}
                </span>
                {song.notes && <small>{song.notes}</small>}
              </div>
              {song.duration && <div className="portal-song-duration">{song.duration}</div>}
            </li>
          ))}
        </ol>
      ) : (
        <div className="portal-muted-copy">No songs are attached to this setlist yet.</div>
      )}
    </Card>
  )
}

export default async function PortalShowPage({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const context = portalContext(resolvedSearch)
  const detail = await getPortalShow(resolvedParams?.id, context)

  if (!detail.ok || !detail.show) {
    return <ErrorCard message={detail.error} />
  }

  const { show, venue, contacts, setlists, readiness, personContext } = detail
  const mapHref = show.venueAddress ? `https://maps.apple.com/?q=${encodeURIComponent(show.venueAddress)}` : null
  const ticketLabel = typeof show.ticketPrice === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(show.ticketPrice)
    : show.ticketPrice || (show.ticketUrl ? 'Ticket link available' : 'TBD')
  const runContext = context.personType && context.personId
    ? `?from=${encodeURIComponent(context.personType)}&person=${encodeURIComponent(context.personId)}`
    : ''
  const runOfShowHref = `/portal/shows/${show.id}/run-of-show${runContext}`
  const pdfHref = `/api/portal/shows/${show.id}/run-of-show.pdf`

  return (
    <PortalShell>
      <PortalTopBar title="Show Detail" subtitle={show.dateLabel} backHref={backHref(resolvedSearch)} />

      <header className="portal-show-detail-header">
        <div className="portal-show-kicker">
          {show.bandNames.map(name => <Pill key={name} accent>{name}</Pill>)}
          {personContext?.roles.map(role => <Pill key={role}>{role}</Pill>)}
          {show.indoorOutdoor && <Pill>{show.indoorOutdoor}</Pill>}
          {show.ageRestriction && <Pill>{show.ageRestriction}</Pill>}
        </div>
        <h1 className="portal-hero-title">{show.venueName}</h1>
        <p className="portal-hero-subtitle">{show.dateLabel}</p>
        <InlineActions actions={[
          { href: runOfShowHref, label: 'Run of Show' },
          mapHref ? { href: mapHref, label: 'Open Map' } : null,
        ]} />
      </header>

      {personContext && (
        <AcknowledgmentPanel
          showId={show.id}
          personType={context.personType}
          personId={context.personId}
          personName={personContext.person.name}
          roles={personContext.roles}
          fingerprint={personContext.acknowledgment.fingerprint}
          current={personContext.acknowledgment.current}
          acknowledgedAtLabel={personContext.acknowledgment.acknowledgedAtLabel}
        />
      )}

      <SectionLabel>Call Times</SectionLabel>
      <Card accent>
        <div className="portal-time-grid portal-time-grid-run-summary portal-time-grid-detail">
          <TimeBlock label="Trailer Load-In" value={show.trailerLoadIn} />
          <TimeBlock label="Venue Load-In" value={show.loadIn} />
          <TimeBlock label="Soundcheck" value={show.soundCheck} />
          <TimeBlock label="Show Start" value={show.start} />
          <TimeBlock label="Show End" value={show.end} />
        </div>
      </Card>

      <SectionLabel>Missing Information</SectionLabel>
      <ReadinessCard readiness={readiness} />

      <SectionLabel>Venue & Production</SectionLabel>
      <Card>
        <InfoRow label="Venue" value={show.venueName} />
        <InfoRow label="Address" value={show.venueAddress || 'Address is still pending.'} href={mapHref} />
        <InfoRow label="Contact" value={venue?.contactName || 'No venue contact listed.'} />
        <InfoRow label="Phone" value={venue?.contactPhone || ''} href={venue?.contactPhone ? `tel:${venue.contactPhone}` : null} />
        <InfoRow label="Email" value={venue?.contactEmail || ''} href={venue?.contactEmail ? `mailto:${venue.contactEmail}` : null} />
        <InfoRow label="Parking" value={venue?.parkingNotes || 'No parking notes listed.'} />
        <InfoRow label="Stage" value={venue?.stageSpecs || 'No stage specs listed.'} />
        <InfoRow label="Console" value={venue?.houseConsole || 'Not listed.'} />
        <InfoRow label="PA" value={venue?.paSystem || 'Not listed.'} />
        <InfoRow label="FOH" value={venue?.fohLocation || 'Not listed.'} />
        <InfoRow label="Power" value={venue?.powerDrops || 'Not listed.'} />
        <InfoRow label="Green Room" value={venue?.greenRoom ? 'Available' : 'Not confirmed'} />
        <InfoRow label="Ticket" value={ticketLabel} href={show.ticketUrl || null} />
      </Card>

      <SectionLabel>Show Notes</SectionLabel>
      <div className="portal-notes-grid">
        <Card>
          <div className="portal-eyebrow">General</div>
          <p>{show.showNotes || 'No general show notes listed.'}</p>
        </Card>
        <Card>
          <div className="portal-eyebrow">Production</div>
          <p>{show.productionNotes || 'No production notes listed.'}</p>
        </Card>
        <Card>
          <div className="portal-eyebrow">Sound</div>
          <p>{show.soundNotes || venue?.soundNotes || 'No sound notes listed.'}</p>
        </Card>
        <Card>
          <div className="portal-eyebrow">Merch</div>
          <p>{show.merchNotes || 'No merch notes listed.'}</p>
        </Card>
      </div>

      <SectionLabel>People & Contacts</SectionLabel>
      {contacts.length ? (
        <div className="portal-contact-grid">
          {contacts.map(contact => <ContactCard key={`${contact.type}-${contact.id}`} contact={contact} />)}
        </div>
      ) : (
        <Card><div className="portal-muted-copy">No members or crew are assigned yet.</div></Card>
      )}

      <SectionLabel>Setlists</SectionLabel>
      <div className="portal-setlist-grid">
        {setlists.length ? (
          setlists.map(setlist => <SetlistCard key={setlist.id} setlist={setlist} />)
        ) : (
          <Card><div className="portal-muted-copy">No setlist is attached yet.</div></Card>
        )}
      </div>

      <SectionLabel>Show Documents</SectionLabel>
      <Card>
        <div className="portal-document-list">
          <a href={runOfShowHref}>
            <span>Live schedule</span>
            <strong>View Run of Show</strong>
          </a>
          <a href={pdfHref}>
            <span>Downloadable PDF</span>
            <strong>Run of Show PDF</strong>
          </a>
          {show.driveFolder ? (
            <a href={show.driveFolder}>
              <span>Show files</span>
              <strong>Open Drive Folder</strong>
            </a>
          ) : (
            <div>
              <span>Show files</span>
              <strong>Drive folder pending</strong>
            </div>
          )}
        </div>
      </Card>
    </PortalShell>
  )
}
