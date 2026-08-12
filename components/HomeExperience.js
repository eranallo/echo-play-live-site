'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'
import './HomeExperience.css'

const pad = value => String(value + 1).padStart(2, '0')

function useReveal() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-home-reveal]')]
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(node => node.setAttribute('data-visible', 'true'))
      return
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true')
          observer.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 })
    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

function EditorialHero({ featured }) {
  const heroRef = useRef(null)

  useEffect(() => {
    const node = heroRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const onPointer = event => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        node.style.setProperty('--pointer-x', `${x * -13}px`)
        node.style.setProperty('--pointer-y', `${y * -13}px`)
      })
    }
    node.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', onPointer)
    }
  }, [])

  const image = featured?.featurePhoto || featured?.heroPhoto

  return <section className="editorial-hero" ref={heroRef} aria-labelledby="home-title">
    <div className="editorial-hero__index">EPL / 2026</div>
    <div className="editorial-hero__status"><i /> Independent live entertainment<br />Fort Worth, Texas</div>

    <h1 id="home-title" className="editorial-hero__title">
      <span className="editorial-hero__word editorial-hero__word--echo" aria-hidden="true">Echo</span>
      <span className="editorial-hero__script" aria-hidden="true">the songs still know you</span>
      <span className="editorial-hero__word editorial-hero__word--play" aria-hidden="true">Play</span>
      <span className="editorial-hero__word editorial-hero__word--live" aria-hidden="true">Live</span>
      <span className="sr-only">Echo Play Live. The songs still know you.</span>
    </h1>

    <div className="editorial-hero__portrait">
      {image && <Image src={image} alt={`${featured.name} performing live`} fill priority sizes="(max-width: 720px) 43vw, 30vw" style={{ objectFit: 'cover', objectPosition: featured.heroObjectPosition || 'center' }} />}
      <span>Live / loud / in the room</span>
    </div>

    <p className="editorial-hero__intro">We build full-scale live shows around the music people never stopped loving. Tribute acts, era bands, and rooms that sing every word back.</p>
    <div className="editorial-hero__warning">Scroll with your volume up</div>

    <div className="editorial-hero__marquee" aria-hidden="true"><div>
      <span>DFW</span> Cover bands <b>✦</b> Tribute shows <b>✦</b> Festivals <b>✦</b> Private events <b>✦</b>
      <span>DFW</span> Cover bands <b>✦</b> Tribute shows <b>✦</b> Festivals <b>✦</b> Private events <b>✦</b>
    </div></div>

    <nav className="editorial-hero__links" aria-label="Homepage shortcuts">
      <span>Start here</span>
      <Link href="#roster"><strong>Meet the roster</strong><small>The eras, artists, and sounds we bring back.</small></Link>
      <Link href="#shows"><strong>Find a show</strong><small>Pick a date. Bring your voice.</small></Link>
      <Link href="/contact"><strong>Book the night</strong><small>Venues, festivals, and private events.</small></Link>
    </nav>
  </section>
}

function Manifesto() {
  return <section className="home-manifesto" data-home-reveal>
    <div className="home-manifesto__eyebrow">A note from the stage</div>
    <div className="home-manifesto__copy">
      <p>People do not need another band playing politely in the corner.</p>
      <p>They need the opening chord that changes the room. The chorus everybody knows. The show that makes strangers feel like old friends for three hours.</p>
      <p>That is what we build.</p>
    </div>
    <div className="home-manifesto__signoff">Echo Play Live / Fort Worth, TX</div>
  </section>
}

function BandRow({ band, index, active, onActivate }) {
  const title = band.name
  const splitAt = Math.max(2, Math.round(title.length * 0.52))
  return <li className={`home-band-row ${active ? 'is-active' : ''}`} style={{ '--accent': band.color }}>
    <Link href={`/bands/${band.slug}`} onPointerEnter={onActivate} onFocus={onActivate} aria-label={`Explore ${band.name}`}>
      <span className="home-band-row__echo home-band-row__echo--before" aria-hidden="true">{title} {title}</span>
      <span className="home-band-row__title"><small>({pad(index)})</small><b>{title.slice(0, splitAt)}</b><i /><b>{title.slice(splitAt)}</b></span>
      <span className="home-band-row__echo home-band-row__echo--after" aria-hidden="true">{title} {title}</span>
    </Link>
  </li>
}

function RosterSection() {
  const [activeSlug, setActiveSlug] = useState(bandsList[0]?.slug)
  const activeBand = bandsList.find(band => band.slug === activeSlug) || bandsList[0]
  const image = activeBand?.featurePhoto || activeBand?.heroPhoto || activeBand?.crowdPhoto

  return <section className="home-roster" id="roster" data-home-reveal>
    <header className="home-section-title">
      <span>(01) Roster</span>
      <h2>Pick your<br />era.</h2>
      <p>Four distinct live experiences. One standard: the room has to feel it.</p>
    </header>
    <div className="home-roster__preview" aria-hidden="true">
      {image && <Image key={activeBand.slug} src={image} alt="" fill sizes="(max-width: 800px) 100vw, 32vw" style={{ objectFit: 'cover', objectPosition: activeBand.heroObjectPosition || 'center' }} />}
      <span>{activeBand.era}</span>
    </div>
    <ol className="home-roster__list">
      {bandsList.map((band, index) => <BandRow key={band.slug} band={band} index={index} active={activeSlug === band.slug} onActivate={() => setActiveSlug(band.slug)} />)}
    </ol>
    <Link className="home-text-link" href="/musicians">Meet the people behind the noise <span>↗</span></Link>
  </section>
}

function formatShowTime(value) {
  if (!value || value === 'TBD' || value === 'Time TBD') return 'Time TBD'
  const text = String(value).trim()
  const parsed = new Date(text)
  if (text.includes('T') && !Number.isNaN(parsed.getTime())) return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(parsed)
  return text
}

function ShowCard({ show, index }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.heroPhoto || band?.featurePhoto
  const details = [show.venueName, formatShowTime(show.startTime), show.ticketLabel].filter(Boolean)
  return <article className="home-show-card" style={{ '--accent': show.bandColor || '#d4a017' }}>
    <div className="home-show-card__meta"><span>({pad(index)})</span><span>{show.dateLabel || 'Date TBD'}</span></div>
    <div className="home-show-card__image">{image && <Image src={image} alt="" fill sizes="(max-width: 760px) 100vw, 34vw" style={{ objectFit: 'cover', objectPosition: band?.heroObjectPosition || 'center' }} />}</div>
    <div className="home-show-card__body">
      <span>{show.supportNames?.length ? `With ${show.supportNames.join(' + ')}` : 'Echo Play Live presents'}</span>
      <h3>{show.bandName}</h3>
      <p>{details.join(' / ')}</p>
      {show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Get tickets <b>↗</b></a> : <Link href="/shows">Show details <b>→</b></Link>}
    </div>
  </article>
}

function ShowsSection({ shows }) {
  const upcoming = shows.slice(0, 4)
  return <section className="home-shows" id="shows" data-home-reveal>
    <header className="home-section-title home-section-title--shows">
      <span>(02) On the calendar</span>
      <h2>Go hear<br />it live.</h2>
      <p>Announced public dates from the Echo Play Live roster. Built from the same live show calendar our team uses.</p>
    </header>
    {upcoming.length ? <div className="home-shows__grid">{upcoming.map((show, index) => <ShowCard key={show.id || index} show={show} index={index} />)}</div> : <div className="home-shows__empty"><span>New dates incoming.</span><p>The calendar is quiet for a minute. It will not stay that way.</p></div>}
    <Link className="home-text-link home-text-link--dark" href="/shows">View the full calendar <span>↗</span></Link>
  </section>
}

function BookingSection({ featured }) {
  const image = featured?.crowdPhoto || featured?.heroPhoto || featured?.featurePhoto
  return <section className="home-booking" data-home-reveal>
    <div className="home-booking__image">{image && <Image src={image} alt="Crowd at an Echo Play Live show" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />}</div>
    <div className="home-booking__noise" aria-hidden="true">LOUD<br />ENOUGH<br />TO<br />REMEMBER</div>
    <div className="home-booking__content">
      <span>(03) For venues, festivals, and private events</span>
      <h2>Give them a<br /><i>reason</i> to show up.</h2>
      <p>Tell us the room, the crowd, and the kind of night you want. We will match the right act, build the production, and make the event feel bigger than another date on the calendar.</p>
      <div><Link href="/contact">Start a booking <b>↗</b></Link><Link href="/press">Open the press kit <b>→</b></Link></div>
    </div>
  </section>
}

export default function HomeExperience({ shows = [] }) {
  useReveal()
  const featured = useMemo(() => bandsList.find(band => band.slug === 'so-long-goodnight') || bandsList[0], [])
  return <>
    <Nav />
    <main className="ep-home ep-home--editorial" id="main-content">
      <EditorialHero featured={featured} />
      <Manifesto />
      <RosterSection />
      <ShowsSection shows={shows} />
      <BookingSection featured={featured} />
    </main>
    <Footer />
  </>
}
