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
  if (text.includes('T') && !Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    }).format(parsed)
  }
  return text
}

function useActiveSection() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const nodes = sections.map(section => document.getElementById(section.id)).filter(Boolean)
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) setActive(visible[0].target.id)
    }, { rootMargin: '-28% 0px -48% 0px', threshold: [0, .15, .45] })

    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return active
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame
    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight
      setProgress(distance > 0 ? Math.min(window.scrollY / distance, 1) : 0)
      frame = undefined
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return progress
}

function useScrollReveal(motionOff) {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-reveal]')]
    if (motionOff) {
      nodes.forEach(node => node.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -12% 0px', threshold: .08 })

    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [motionOff])
}

function ExperienceRail({ active, motionOff, setMotionOff, progress }) {
  return <aside className="show-rail" aria-label="Homepage sections" style={{ '--scroll-progress': progress }}>
    <Link href="#top" className="show-rail__mark" aria-label="Back to the opening">EPL</Link>
    <nav>
      {sections.map((section, index) => <Link key={section.id} href={`#${section.id}`} className={active === section.id ? 'is-active' : ''} aria-current={active === section.id ? 'true' : undefined}>
        <i />
        <span>{pad(index)} / {section.label}</span>
      </Link>)}
    </nav>
    <button type="button" onClick={() => setMotionOff(value => !value)} aria-pressed={motionOff}>Motion {motionOff ? 'off' : 'on'}</button>
  </aside>
}

function Hero({ featured, nextShow }) {
  const image = featured?.heroPhoto || featured?.featurePhoto

  return <section className="show-hero" id="top" aria-labelledby="home-title">
    <div className="show-hero__image">
      {image && <Image src={image} alt={`${featured.name} performing for a live crowd`} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />}
    </div>
    <div className="show-hero__wash" />
    <div className="show-light-sweep" aria-hidden="true" />
    <div className="show-hero__meta"><span>Independent live entertainment</span><span>Fort Worth, Texas / Est. 2023</span></div>
    <div className="show-hero__content">
      <div className="show-hero__brand">Echo Play Live</div>
      <h1 id="home-title">
        <span className="show-echo-line" data-echo="The songs">The songs</span>
        <span className="show-echo-line" data-echo="still know">still know</span>
        <span className="show-echo-line" data-echo="every word."><em>every</em> word.</span>
      </h1>
      <p>Live tribute and era-defining cover shows built for the moment a room stops watching and starts singing.</p>
      <div className="show-hero__actions"><Link href="#shows">Find your next show <b>↓</b></Link><Link href="/contact">Book a band <b>↗</b></Link></div>
    </div>
    <div className="show-hero__cue"><span>Scroll to enter the room</span><i /></div>
    {nextShow && <Link className="next-up" href="#shows"><span>Next up</span><strong>{nextShow.dateLabel}</strong><b>{nextShow.bandName}</b><em>{nextShow.venueName || 'Venue TBD'}</em><i>↘</i></Link>}
  </section>
}

function ExperienceSection() {
  return <section className="show-experience" id="experience">
    <div className="show-section-index" data-reveal><span>01</span><p>The feeling</p></div>
    <div className="show-experience__statement">
      <span className="show-kicker" data-reveal>This is not background music.</span>
      <h2 data-reveal="headline"><span>The room</span><span><i>remembers.</i></span></h2>
      <p data-reveal>It starts with four notes. Someone turns toward the stage. Someone else is already singing. Then the whole room becomes one voice.</p>
    </div>
    <div className="show-experience__proof" data-reveal>
      <blockquote>“The best live shows do not recreate the past. They make it present again.”</blockquote>
      <dl>
        <div><dt>100+</dt><dd>Songs ready for the room</dd></div>
        <div><dt>3 hrs</dt><dd>Full-night experiences</dd></div>
        <div><dt>DFW+</dt><dd>Texas and regional dates</dd></div>
      </dl>
    </div>
    <div className="show-experience__ticker" aria-hidden="true"><div>THE FIRST NOTE · THE WHOLE ROOM · THE LAST CHORUS · THE DRIVE HOME · THE ECHO AFTER · THE FIRST NOTE · THE WHOLE ROOM · THE LAST CHORUS · THE DRIVE HOME · THE ECHO AFTER ·</div></div>
  </section>
}

function RosterSection() {
  const [activeSlug, setActiveSlug] = useState(bandsList[0]?.slug)
  const activeBand = bandsList.find(band => band.slug === activeSlug) || bandsList[0]
  const image = activeBand?.featurePhoto || activeBand?.heroPhoto || activeBand?.crowdPhoto

  return <section className="show-roster" id="roster">
    <header className="show-section-header">
      <div className="show-section-index" data-reveal><span>02</span><p>The roster</p></div>
      <div><span className="show-kicker" data-reveal>One company. Distinct worlds.</span><h2 data-reveal="headline"><span>Choose the</span><span>night you want.</span></h2></div>
      <p data-reveal>Every act has its own visual identity, catalog, and crowd. The standard underneath them never changes.</p>
    </header>
    <div className="show-roster__stage" style={{ '--band': activeBand.color || '#d4a017' }} data-reveal>
      <div className="show-roster__image" key={`image-${activeBand.slug}`}>{image && <Image src={image} alt={`${activeBand.name} performing live`} fill sizes="(max-width: 820px) 100vw, 68vw" style={{ objectFit: 'cover', objectPosition: activeBand.heroObjectPosition || 'center' }} />}</div>
      <div className="show-roster__echoes" key={`echo-${activeBand.slug}`} aria-hidden="true"><span>{activeBand.shortName || activeBand.name}</span><span>{activeBand.shortName || activeBand.name}</span><span>{activeBand.shortName || activeBand.name}</span></div>
      <div className="show-roster__copy" aria-live="polite">
        <span>{activeBand.era}</span>
        <h3>{activeBand.name}</h3>
        <p>{activeBand.tagline}</p>
        <p className="show-roster__genres">{activeBand.genre?.slice(0, 3).join(' / ')}</p>
        <Link href={`/bands/${activeBand.slug}`}>Enter this world <b>↗</b></Link>
      </div>
    </div>
    <div className="show-roster__selector" role="list" aria-label="Select a band">
      {bandsList.map((band, index) => <button key={band.slug} type="button" onClick={() => setActiveSlug(band.slug)} className={activeBand.slug === band.slug ? 'is-active' : ''} style={{ '--band': band.color || '#d4a017' }} aria-pressed={activeBand.slug === band.slug}>
        <span>{pad(index)}</span><strong>{band.name}</strong><em>{band.era}</em><i>↗</i>
      </button>)}
    </div>
  </section>
}

function ShowRow({ show, index }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.featurePhoto || band?.heroPhoto

  return <article className="calendar-row" style={{ '--band': show.bandColor || band?.color || '#d4a017', '--row-delay': `${Math.min(index * 70, 280)}ms` }} data-reveal="row">
    <span className="calendar-row__number">({pad(index)})</span>
    <div className="calendar-row__date"><strong>{show.dateLabel || 'Date TBD'}</strong><span>{formatTime(show.startTime)}</span></div>
    <div className="calendar-row__bill"><small>{show.supportNames?.length ? `with ${show.supportNames.join(' + ')}` : 'Echo Play Live presents'}</small><h3>{show.bandName}</h3><p>{[show.venueName || 'Venue announcement coming soon', show.ticketLabel].filter(Boolean).join(' · ')}</p></div>
    <div className="calendar-row__image" aria-hidden="true">{image && <Image src={image} alt="" fill sizes="320px" style={{ objectFit: 'cover', objectPosition: band?.heroObjectPosition || 'center' }} />}</div>
    <div className="calendar-row__action">{show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets ↗</a> : <Link href="/shows">Details →</Link>}</div>
  </article>
}

function ShowsSection({ shows }) {
  const upcoming = shows.slice(0, 5)

  return <section className="show-calendar" id="shows">
    <header className="show-section-header show-section-header--calendar">
      <div className="show-section-index" data-reveal><span>03</span><p>The calendar</p></div>
      <div><span className="show-kicker" data-reveal>Pick a date. Bring your voice.</span><h2 data-reveal="headline"><span>Go hear</span><span><i>it live.</i></span></h2></div>
      <p data-reveal>Real announced dates, updated from the same calendar our artists and crew use.</p>
    </header>
    <div className="show-calendar__list">{upcoming.length ? upcoming.map((show, index) => <ShowRow key={show.id || index} show={show} index={index} />) : <div className="show-calendar__empty"><strong>The room is quiet for a minute.</strong><span>New dates are on the way.</span></div>}</div>
    <Link className="show-wide-link" href="/shows" data-reveal><span>See the complete calendar</span><b>All shows ↗</b></Link>
  </section>
}

function BookingSection({ featured }) {
  const image = featured?.heroPhoto || featured?.crowdPhoto || featured?.featurePhoto

  return <section className="show-booking" id="book">
    <div className="show-booking__image">{image && <Image src={image} alt="An Echo Play Live crowd during a performance" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />}</div>
    <div className="show-light-sweep show-light-sweep--booking" aria-hidden="true" />
    <div className="show-booking__content">
      <div className="show-section-index" data-reveal><span>04</span><p>Book the night</p></div>
      <span className="show-kicker" data-reveal>Venues · festivals · private events</span>
      <h2 data-reveal="headline"><span className="show-echo-line" data-echo="Give the room">Give the room</span><span>a reason to</span><span className="show-echo-line" data-echo="show up."><i>show up.</i></span></h2>
      <p data-reveal>Tell us the date, city, room, and crowd. We will match the right act and help shape a night people actually remember.</p>
      <div data-reveal><Link href="/contact">Start a booking <b>↗</b></Link><Link href="/press">Press kits <b>→</b></Link></div>
    </div>
    <div className="show-booking__footer"><span>Echo Play Live / Fort Worth, TX</span><span>Quality · Hustle · Love for the show</span></div>
  </section>
}

export default function HomeExperience({ shows = [] }) {
  const active = useActiveSection()
  const progress = useScrollProgress()
  const [motionOff, setMotionOff] = useState(false)
  const featured = useMemo(() => bandsList.find(band => band.slug === 'so-long-goodnight') || bandsList[0], [])
  useScrollReveal(motionOff)

  return <>
    <Nav />
    <ExperienceRail active={active} motionOff={motionOff} setMotionOff={setMotionOff} progress={progress} />
    <main className={`live-home ${motionOff ? 'motion-off' : ''}`} id="main-content">
      <Hero featured={featured} nextShow={shows[0]} />
      <ExperienceSection />
      <RosterSection />
      <ShowsSection shows={shows} />
      <BookingSection featured={featured} />
    </main>
    <Footer />
  </>
}
