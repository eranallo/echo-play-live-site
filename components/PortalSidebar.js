import Link from 'next/link'
import { publicBandPresentation } from '@/lib/public/bands-presentation'

export function PortalBox({ title, children, className = '' }) {
  return <section className={`portal-box ${className}`}>
    <div className="scene-section-bar"><h2>{title}</h2></div>
    <div className="portal-box-body">{children}</div>
  </section>
}

const notes = {
  help: ['Find your way', 'Explore the roster, find an announced show or get in touch about booking.', 'Browse the bands →', '/bands'],
  bands: ['Find your sound', '90s alternative, 2000s emo and pop punk, TOOL and Deftones. Four bands, each with its own show.', 'Find the right band →', '#find-band'],
  press: ['Press desk', 'Bios, photography, logos and complete band kits for venues, promoters and media.', 'Request production materials →', '/contact'],
  booking: ['Booking desk', 'Send Evan your date, venue and the music you have in mind. We’ll work through availability and the details with you.', 'eranallo@echoplay.live ↗', 'mailto:eranallo@echoplay.live'],
  requests: ['How requests work', 'Choose a band, suggest something new or vote for a song you’d like us to bring back. Your picks help us decide what to learn.', 'Explore the bands →', '/bands'],
  about: ['Echo Play Live', 'Fort Worth, Texas. Established in 2023. Four tribute and cover bands, managed by musicians.', 'Meet the musicians →', '/musicians'],
  musicians: ['Meet the players', 'Get to know the musicians, the instruments they play and the bands they’re part of.', 'All musician profiles →', '/musicians'],
  event: ['Plan your night', 'Find the venue, show time and available ticket or table reservation links in the show details.', 'All announced shows →', '/shows'],
  recap: ['From the show', 'Photos and moments from the stage. Find another date and come see us again.', 'Find a show →', '/shows'],
  podcast: ['Behind the music', 'Conversations about cover bands, tributes and the DFW music scene with Evan Ranallo and Aaron Allen.', 'Meet Echo Play Live →', '/about'],
  upload: ['Your show footage', 'Choose the show and send photos or videos to the band. Files stay private; permission to repost is your choice.', 'How we handle your files →', '/privacy'],
  privacy: ['Your information', 'Questions about a submission, your choices or your information? Get in touch with Evan.', 'eranallo@echoplay.live ↗', 'mailto:eranallo@echoplay.live'],
}

export default function PortalSidebar({ section = 'bands', band }) {
  const note = notes[section] || notes.bands
  return <aside className="portal-sidebar" aria-label={band ? `${band.name} information` : 'Page information'}>
    {band ? <>
      <PortalBox title="Artist profile">
        <h3>{band.name}</h3>
        <p>{band.genre?.join(' / ') || band.label}</p>
        <Link className="button portal-sidebar-button" href={`/contact?band=${band.slug}`}>Ask about a date ↗</Link>
        <Link className="text-link" href={section === 'kit' ? `/bands/${band.slug}` : `/press/${band.slug}`}>{section === 'kit' ? 'Visit the band page →' : 'View the band kit →'}</Link>
      </PortalBox>
      <PortalBox title="Keep up with the band">
        <div className="portal-link-list">
          <Link href={`/shows?band=${band.slug}`}>Announced dates <span aria-hidden="true">→</span></Link>
          <Link href={`/requests?band=${band.slug}`}>Request a song <span aria-hidden="true">→</span></Link>
          <Link href={`/${band.slug}`}>Social & quick links <span aria-hidden="true">→</span></Link>
        </div>
      </PortalBox>
    </> : <PortalBox title={note[0]}>
      <p>{note[1]}</p><Link className="text-link" href={note[3]}>{note[2]}</Link>
    </PortalBox>}
    {section !== 'privacy' && section !== 'upload' && <PortalBox title={band ? 'More from the roster' : 'Artist directory'}>
      <div className="portal-directory">{publicBandPresentation.filter(item => item.slug !== band?.slug).map(item => <Link key={item.slug} href={`/bands/${item.slug}`}>
        <img src={`/press/bands/${item.slug}/cover.jpg`} width="40" height="40" alt="" loading="lazy" />
        <span>{item.name}</span><span aria-hidden="true">›</span>
      </Link>)}</div>
    </PortalBox>}
  </aside>
}
