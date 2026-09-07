import Link from 'next/link'
import TrackedLink from './TrackedLink'
import { kitPdfPath } from '@/lib/press/kit-content.mjs'

const formats = {
  'so-long-goodnight': [
    'The Warped Tour era',
    '2000s emo, pop punk and post-hardcore. Come out and sing with us.',
  ],
  'the-dick-beldings': [
    'Your 90s playlist, live',
    '90s alternative and grunge from a Fort Worth band that has been playing together for more than a decade.',
  ],
  jambi: [
    'A TOOL tribute experience',
    'TOOL’s music takes work. We put in the rehearsal time to get the rhythms, dynamics and feel right.',
  ],
  elite: [
    'A Deftones tribute experience',
    'A Fort Worth Deftones tribute playing the heavy riffs and quieter songs since 2017.',
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
          <h2 className="section-title">Book {band.name}.</h2>
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
              ? 'Planning a full night?'
              : 'How long should we play?'}
          </h3>
          <p>
            {band.slug === 'so-long-goodnight'
              ? 'Tell us your schedule and the music you have in mind. We’ll discuss the set length and breaks with you.'
              : 'Let us know your schedule. We’ll work through the set length, breaks and any music you have in mind.'}
          </p>
        </article>
        <article>
          <span>03 / The location</span>
          <h3>Fort Worth & beyond.</h3>
          <p>
            We’re based in DFW and consider shows outside the area, too. Send us your venue and city
            so we can discuss travel.
          </p>
        </article>
        <article>
          <span>04 / The production</span>
          <h3>Let’s talk production.</h3>
          <p>
            Let us know what sound and lighting your venue provides. We’ll work through the rest
            with you. Ask us for the current stage plot and input list.
          </p>
        </article>
      </div>
      <div className="booking-resource-row">
        <Link className="button" href={`/contact?band=${band.slug}`}>
          Start a booking inquiry ↗
        </Link>
        <TrackedLink
          className="text-link"
          href={kitPdfPath(band.slug)}
          event="Press download"
          band={band.slug}
          download
        >
          Download band kit ↓
        </TrackedLink>
        <Link className="text-link" href={`/press/${band.slug}`}>
          Explore the full band kit ↗
        </Link>
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
