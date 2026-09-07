import Link from 'next/link'
import TrackedLink from './TrackedLink'

const formats = {
  'so-long-goodnight': [
    'The Warped Tour era',
    '2000s emo, pop punk, and post-hardcore. A full-band show built for the sing-along crowd.',
  ],
  'the-dick-beldings': [
    'Your 90s playlist, live',
    '90s rock, alternative, and grunge from a Fort Worth band with deep roots in these songs.',
  ],
  jambi: [
    'A TOOL tribute experience',
    'A dedicated live tribute to TOOL, from the intricate rhythms to the atmosphere of the show.',
  ],
  elite: [
    'A Deftones tribute experience',
    'A dedicated live tribute to Deftones, carrying the catalog’s heavy and atmospheric sides.',
  ],
}

export default function BookingEssentials({ band, compact = false }) {
  const format = formats[band.slug]
  if (!format) return null
  return (
    <section
      id="booking"
      className={compact ? 'booking-essentials' : 'shell section-bottom booking-essentials'}
    >
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">For venues & event planners</p>
          <h2 className="section-title">Bring {band.shortName || band.name} to your room.</h2>
        </div>
      </div>
      <div className="booking-facts-grid">
        <article>
          <span>01 / The show</span>
          <h3>{format[0]}</h3>
          <p>{format[1]}</p>
        </article>
        <article>
          <span>02 / The set</span>
          <h3>
            {band.slug === 'so-long-goodnight'
              ? 'Built for a full night.'
              : 'The right set for your event.'}
          </h3>
          <p>
            {band.slug === 'so-long-goodnight'
              ? 'A 3+ hour show is part of the SLGN experience. Discuss your schedule, set length, and breaks with the booking team.'
              : 'Tell us your performance window. We’ll discuss set length, breaks, and the format that fits your event.'}
          </p>
        </article>
        <article>
          <span>03 / The location</span>
          <h3>Fort Worth & beyond.</h3>
          <p>
            Based in the DFW scene. Share your venue and city so we can work through travel and
            event requirements.
          </p>
        </article>
        <article>
          <span>04 / The production</span>
          <h3>Details, worked out together.</h3>
          <p>
            Sound, lighting, stage space, and production needs are discussed for each event. Ask for
            the current stage plot and input list.
          </p>
        </article>
      </div>
      <div className="booking-resource-row">
        <Link className="button" href={`/contact?band=${band.slug}`}>
          Start a booking inquiry ↗
        </Link>
        <TrackedLink
          className="text-link"
          href={`/api/press/${band.slug}`}
          event="Press download"
          band={band.slug}
          download
        >
          Download band kit ↓
        </TrackedLink>
        <a
          className="text-link"
          href={`mailto:${band.bookingEmail}?subject=${encodeURIComponent(`${band.name} — production information request`)}`}
        >
          Request production details ↗
        </a>
      </div>
    </section>
  )
}
