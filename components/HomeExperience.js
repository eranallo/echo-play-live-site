'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'
import './HomeExperience.css'

const sections = [
  { id: 'top', label: 'Opening' },
  { id: 'experience', label: 'The feeling' },
  { id: 'roster', label: 'The roster' },
  { id: 'shows', label: 'The calendar' },
  { id: 'book', label: 'Book the night' },
]
const pad = value => String(value + 1).padStart(2, '0')

function formatTime(value) {
  if (!value || value === 'TBD' || value === 'Time TBD') return 'Time TBD'
  const text = String(value).trim()
  const parsed = new Date(text)
  if (text.includes('T') && !Number.isNaN(parsed.getTime())) return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(parsed)
  return text
}

function useActiveSection() {
  const [active, setActive] = useState('top')
  useEffect(() => {
    const nodes = sections.map(section => document.getElementById(section.id)).filter(Boolean)
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) setActive(visible[0].target.id)
    }, { rootMargin: '-28% 0px -48% 0px', threshold: [0, .15, .45] })
    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])
  return active
}

function ExperienceRail({ active, motionOff, setMotionOff }) {
  return <aside className="show-rail" aria-label="Homepage sections">
    <Link href="#top" className="show-rail__mark" aria-label="Back to the opening">EPL</Link>
    <nav>{sections.map((section, index) => <Link key={section.id} href={`#${section.id}`} className={active === section.id ? 'is-active' : ''} aria-current={active === section.id ? 'true' : undefined}><i /><span>{pad(index)} / {section.label}</span></Link>)}</nav>
    <button type="button" onClick={() => setMotionOff(value => !value)} aria-pressed={motionOff}><i /> Motion {motionOff ? 'off' : 'on'}</button>
  </aside>
}

function Hero({ featured, nextShow }) {
  const image = featured?.heroPhoto || featured?.featurePhoto
  return <section className="show-hero" id="top" aria-labelledby="home-title">
    <div className="show-hero__image">{image && <Image src={image} alt={`${featured.name} performing for a live crowd`} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />}</div>
    <div className="show-hero__wash" />
    <div className="show-hero__echo" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="show-hero__meta"><span>Independent live entertainment</span><span>Fort Worth, Texas / Est. 2023</span></div>
    <div className="show-hero__content">
      <div className="show-hero__brand">Echo Play Live</div>
      <h1 id="home-title"><span>The songs</span><span>still know</span><span><em>every</em> word.</span></h1>
      <p>Live tribute and era-defining cover shows built for the moment a room stops watching and starts singing.</p>
      <div className="show-hero__actions"><Link href="#shows">Find your next show <b>↓</b></Link><Link href="/contact">Book a band <b>↗</b></Link></div>
    </div>
    <div className="show-hero__cue"><span>Scroll to enter the room</span><i /></div>
    {nextShow && <Link className="next-up" href="#shows"><span>Next up</span><strong>{nextShow.dateLabel}</strong><b>{nextShow.bandName}</b><em>{nextShow.venueName || 'Venue TBD'}</em><i>↘</i></Link>}
  </section>
}

function ExperienceSection() {
  return <section className="show-experience" id="experience">
    <div className="show-section-index"><span>01</span><p>The feeling</p></div>
    <div className="show-experience__statement"><span className="show-kicker">This is not background music.</span><h2>The room<br /><i>remembers.</i></h2><p>It starts with four notes. Someone turns toward the stage. Someone else is already singing. Then the whole room becomes one voice.</p></div>
    <div className="show-experience__proof"><blockquote>“The best live shows do not recreate the past. They make it present again.”</blockquote><dl><div><dt>100+</dt><dd>Songs ready for the room</dd></div><div><dt>3 hrs</dt><dd>Full-night experiences</dd></div><div><dt>DFW+</dt><dd>Texas and regional dates</dd></div></dl></div>
    <div className="show-experience__ticker" aria-hidden="true"><div>THE FIRST NOTE · THE WHOLE ROOM · THE LAST CHORUS · THE DRIVE HOME · THE ECHO AFTER · THE FIRST NOTE · THE WHOLE ROOM · THE LAST CHORUS · THE DRIVE HOME · THE ECHO AFTER ·</div></div>
  </section>
}

function RosterSection() {
  const [activeSlug, setActiveSlug] = useState(bandsList[0]?.slug)
  const activeBand = bandsList.find(band => band.slug === activeSlug) || bandsList[0]
  const image = activeBand?.featurePhoto || activeBand?.heroPhoto || activeBand?.crowdPhoto
  return <section className="show-roster" id="roster">
    <header className="show-section-header"><div className="show-section-index"><span>02</span><p>The roster</p></div><div><span className="show-kicker">One company. Distinct worlds.</span><h2>Choose the<br />night you want.</h2></div><p>Every act has its own visual identity, catalog, and crowd. The standard underneath them never changes.</p></header>
    <div className="show-roster__stage" style={{ '--band': activeBand.color }}>
      <div className="show-roster__image">{image && <Image key={activeBand.slug} src={image} alt={`${activeBand.name} performing live`} fill sizes="(max-width: 820px) 100vw, 56vw" style={{ objectFit: 'cover', objectPosition: activeBand.heroObjectPosition || 'center' }} />}</div>
      <div className="show-roster__ghost" aria-hidden="true">{activeBand.shortName || activeBand.name}</div>
      <div className="show-roster__copy"><span>{activeBand.era}</span><h3>{activeBand.name}</h3><p>{activeBand.tagline}</p><ul>{activeBand.genre?.slice(0, 3).map(genre => <li key={genre}>{genre}</li>)}</ul><Link href={`/bands/${activeBand.slug}`}>Enter this world <b>↗</b></Link></div>
    </div>
    <div className="show-roster__selector" role="list" aria-label="Select a band">{bandsList.map((band, index) => <button key={band.slug} type="button" onClick={() => setActiveSlug(band.slug)} className={activeBand.slug === band.slug ? 'is-active' : ''} style={{ '--band': band.color }} aria-pressed={activeBand.slug === band.slug}><span>{pad(index)}</span><strong>{band.name}</strong><em>{band.era}</em><i>↗</i></button>)}</div>
  </section>
}

function ShowRow({ show, index }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.featurePhoto || band?.heroPhoto
  return <article className="calendar-row" style={{ '--band': show.bandColor || '#d4a017' }}>
    <span className="calendar-row__number">({pad(index)})</span><div className="calendar-row__date"><strong>{show.dateLabel || 'Date TBD'}</strong><span>{formatTime(show.startTime)}</span></div>
    <div className="calendar-row__bill"><small>{show.supportNames?.length ? `with ${show.supportNames.join(' + ')}` : 'Echo Play Live presents'}</small><h3>{show.bandName}</h3><p>{[show.venueName || 'Venue announcement coming soon', show.ticketLabel].filter(Boolean).join(' · ')}</p></div>
    <div className="calendar-row__image" aria-hidden="true">{image && <Image src={image} alt="" fill sizes="280px" style={{ objectFit: 'cover', objectPosition: band?.heroObjectPosition || 'center' }} />}</div>
    <div className="calendar-row__action">{show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets ↗</a> : <Link href="/shows">Details →</Link>}</div>
  </article>
}

function ShowsSection({ shows }) {
  const upcoming = shows.slice(0, 5)
  return <section className="show-calendar" id="shows">
    <header className="show-section-header show-section-header--calendar"><div className="show-section-index"><span>03</span><p>The calendar</p></div><div><span className="show-kicker">Pick a date. Bring your voice.</span><h2>Go hear<br /><i>it live.</i></h2></div><p>Real announced dates, updated from the same calendar our artists and crew use.</p></header>
    <div className="show-calendar__list">{upcoming.length ? upcoming.map((show, index) => <ShowRow key={show.id || index} show={show} index={index} />) : <div className="show-calendar__empty"><strong>The room is quiet for a minute.</strong><span>New dates are on the way.</span></div>}</div>
    <Link className="show-wide-link" href="/shows"><span>See the complete calendar</span><b>All shows ↗</b></Link>
  </section>
}

function BookingSection({ featured }) {
  const image = featured?.heroPhoto || featured?.crowdPhoto || featured?.featurePhoto
  return <section className="show-booking" id="book">
    <div className="show-booking__image">{image && <Image src={image} alt="An Echo Play Live crowd during a performance" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />}</div><div className="show-booking__rings" aria-hidden="true"><i /><i /><i /></div>
    <div className="show-booking__content"><div className="show-section-index"><span>04</span><p>Book the night</p></div><span className="show-kicker">Venues · festivals · private events</span><h2>Give the room<br />a reason to<br /><i>show up.</i></h2><p>Tell us the date, city, room, and crowd. We will match the right act and help shape a night people actually remember.</p><div><Link href="/contact">Start a booking <b>↗</b></Link><Link href="/press">Press kits <b>→</b></Link></div></div>
    <div className="show-booking__footer"><span>Echo Play Live / Fort Worth, TX</span><span>Quality · Hustle · Love for the show</span></div>
  </section>
}

export default function HomeExperience({ shows = [] }) {
  const active = useActiveSection()
  const [motionOff, setMotionOff] = useState(false)
  const featured = useMemo(() => bandsList.find(band => band.slug === 'so-long-goodnight') || bandsList[0], [])
  return <><Nav /><ExperienceRail active={active} motionOff={motionOff} setMotionOff={setMotionOff} /><main className={`live-home ${motionOff ? 'motion-off' : ''}`} id="main-content"><Hero featured={featured} nextShow={shows[0]} /><ExperienceSection /><RosterSection /><ShowsSection shows={shows} /><BookingSection featured={featured} /></main><Footer /></>
}
