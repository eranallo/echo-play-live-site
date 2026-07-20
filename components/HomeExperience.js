'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'
import './HomeExperience.css'
import './CinematicIntro.css'
import './HomepageShows.css'

const clamp = value => Math.max(0, Math.min(1, value))
const windowed = (progress, start, peak, end) => {
  if (progress <= start || progress >= end) return 0
  if (progress < peak) return clamp((progress - start) / (peak - start))
  return clamp(1 - (progress - peak) / (end - peak))
}

function useJourneyController(ref) {
  const [state, setState] = useState({ progress: 0, phase: 'before' })
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const viewport = window.visualViewport?.height || window.innerHeight
      const distance = Math.max(node.offsetHeight - viewport, 1)
      const progress = clamp(-rect.top / distance)
      const phase = rect.top > 0 ? 'before' : rect.bottom > viewport ? 'pinned' : 'after'
      setState(previous => Math.abs(previous.progress - progress) < .001 && previous.phase === phase ? previous : { progress, phase })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.visualViewport?.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.visualViewport?.removeEventListener('resize', onScroll)
    }
  }, [ref])
  return state
}

function MontageFrame({ band, index, progress }) {
  const image = band?.featurePhoto || band?.heroPhoto || band?.crowdPhoto
  const windows = [
    [.09, .24, .55],
    [.18, .36, .64],
    [.30, .49, .72],
    [.42, .61, .78],
  ]
  const [start, peak, end] = windows[index]
  const visibility = windowed(progress, start, peak, end)
  const enter = clamp((progress - start) / Math.max(peak - start, .001))
  const exit = clamp((progress - peak) / Math.max(end - peak, .001))

  return <div
    className={`montage-frame montage-frame-${index + 1}`}
    style={{ '--visible': visibility, '--enter': enter, '--exit': exit, '--index': index }}
  >
    <div className="montage-image-shell">
      {image && <Image
        src={image}
        alt=""
        fill
        priority={index < 2}
        sizes="(max-width: 740px) 120vw, 72vw"
        style={{ objectFit: 'cover', objectPosition: band?.heroObjectPosition || 'center' }}
      />}
      <div className="montage-frame-grade" />
    </div>
    <div className="montage-smoke-edge montage-smoke-edge-a" />
    <div className="montage-smoke-edge montage-smoke-edge-b" />
  </div>
}

function CinematicIntro({ progress, bands }) {
  const montage = clamp((progress - .06) / .62)
  const collapse = clamp((progress - .68) / .13)
  const logo = clamp((progress - .79) / .14)
  const blackout = clamp(1 - progress / .07)
  const cue = clamp(1 - progress / .07)

  return <div
    className="cinematic-intro"
    style={{ '--progress': progress, '--montage': montage, '--collapse': collapse, '--logo': logo, '--blackout': blackout }}
    aria-hidden="true"
  >
    <div className="cinematic-base" />
    <div className="montage-world">
      <div className="montage-backdrop" />
      {bands.slice(0, 4).map((band, index) => <MontageFrame key={band.slug} band={band} index={index} progress={progress} />)}
      <div className="montage-glow montage-glow-left" />
      <div className="montage-glow montage-glow-right" />
      <div className="montage-smoke montage-smoke-1" />
      <div className="montage-smoke montage-smoke-2" />
      <div className="montage-smoke montage-smoke-3" />
      <div className="montage-smoke montage-smoke-4" />
      <div className="montage-flare" />
    </div>
    <div className="cinematic-logo-stage">
      <div className="cinematic-logo-glow" />
      <div className="cinematic-logo"><Image src="/logo.png" alt="" fill sizes="(max-width:740px) 64vw, 34vw" style={{ objectFit:'contain' }} /></div>
    </div>
    <div className="cinematic-blackout" />
    <div className="cinematic-grain" />
    <div className="cinematic-vignette" />
    <div className="cinematic-cue" style={{ opacity: cue }}><span>Scroll to begin</span><i /></div>
  </div>
}

function CinematicJourney({ bands }) {
  const journeyRef = useRef(null)
  const { progress, phase } = useJourneyController(journeyRef)

  return <section className="ep-journey cinematic-journey" ref={journeyRef}>
    <div className={`ep-sticky ep-pin-${phase}`}>
      <CinematicIntro progress={progress} bands={bands} />
      <div className="ep-progress" aria-hidden="true"><i style={{ transform:`scaleY(${progress})` }} /></div>
    </div>
  </section>
}

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return <Link href={`/bands/${band.slug}`} className="ep-band-card" style={{ '--accent':band.color || '#d4a017' }}>
    <div className="ep-band-image">{image && <Image src={image} alt={`${band.name} performing live`} fill sizes="(max-width:760px) 82vw, 30vw" style={{ objectFit:'cover', objectPosition:band.heroObjectPosition || 'center' }} />}</div>
    <div className="ep-band-top"><span>{String(index + 1).padStart(2,'0')}</span><span>{band.genre?.[0] || 'Live'}</span></div>
    <div className="ep-band-copy"><small>Echo Play Live</small><h3>{band.name}</h3><b>Explore the band →</b></div>
  </Link>
}

function showTime(value) {
  if (!value || value === 'Time TBD' || value === 'TBD') return ''
  const text = String(value).trim()
  const date = new Date(text)
  if (text.includes('T') && !Number.isNaN(date.getTime())) return new Intl.DateTimeFormat('en-US', { hour:'numeric', minute:'2-digit', timeZone:'America/Chicago' }).format(date)
  return text
}

function showDetails(show) {
  const ticket = show.ticketLabel ? String(show.ticketLabel).trim() : ''
  const status = show.publicStatus || ''
  if (!ticket) return status
  if (!status || ticket.toLowerCase() === status.toLowerCase()) return ticket
  return `${ticket} · ${status}`
}

function HomeShowRow({ show, index }) {
  const color = show.bandColor || '#D4A017'
  const time = showTime(show.startTime)
  const support = Array.isArray(show.supportNames) && show.supportNames.length ? show.supportNames.join(' + ') : ''
  const dateParts = show.dateLabel?.replace(/,/g, '').split(' ') || []
  const day = show.dateLabel?.split(',')[0] || 'Date'
  const date = dateParts.slice(1).join(' ') || 'TBD'
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.heroPhoto || band?.featurePhoto || band?.crowdPhoto

  return <article className="home-show-row" style={{ '--accent':color, '--row':index }}>
    {image && <div className="home-show-bg" aria-hidden="true">
      <Image src={image} alt="" fill sizes="(max-width:900px) 100vw, 65vw" style={{ objectFit:'cover', objectPosition:band?.heroObjectPosition || 'center' }} />
      <div className="home-show-bg-grade" />
    </div>}
    <div className="home-show-date"><span>{day}</span><strong>{date}</strong>{time && <em>{time}</em>}</div>
    <div className="home-show-main">
      <div className="home-show-billing">{show.bandSlug ? <Link href={`/bands/${show.bandSlug}`}>{show.bandName}</Link> : <span>{show.bandName}</span>}{support && <small>with {support}</small>}</div>
      <h3>{show.venueName || 'Venue announcement coming soon'}</h3>
      <p>{showDetails(show)}</p>
    </div>
    <div className="home-show-action">{show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets</a> : <Link href="/shows">Details</Link>}</div>
  </article>
}

export default function HomeExperience({ shows = [] }) {
  const featured = useMemo(() => bandsList.find(b => b.slug === 'so-long-goodnight') || bandsList[0], [])
  const introBands = useMemo(() => ['so-long-goodnight','the-dick-beldings','jambi','elite'].map(slug => bandsList.find(b => b.slug === slug)).filter(Boolean), [])
  const heroImage = featured?.heroPhoto || featured?.featurePhoto || featured?.crowdPhoto
  const upcoming = shows.slice(0,4)
  return <>
    <Nav />
    <main className="ep-home" id="main-content">
      <h1 className="ep-sr-only">Echo Play Live — DFW tribute and cover band management</h1>
      <CinematicJourney bands={introBands} />
      <section className="ep-ticker"><div>LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE · LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE ·</div></section>
      <section className="ep-section home-shows-section">
        <div className="ep-wrap home-shows-head"><div><span className="ep-label">On the calendar</span><h2>Your next night out.</h2></div><p>Announced public dates from the Echo Play Live roster.</p></div>
        {upcoming.length ? <div className="ep-wrap home-show-list">{upcoming.map((show,index)=><HomeShowRow key={show.id || index} show={show} index={index}/>)}</div> : null}
        <div className="ep-wrap ep-section-link"><Link href="/shows">See every upcoming show <span>↗</span></Link></div>
      </section>
      <section className="ep-section ep-roster"><div className="ep-wrap ep-section-head"><div><span className="ep-label">The roster</span><h2>Pick your era.<br/>Find your sound.</h2></div><p>From emo and 90s alternative to Tool, Deftones, Linkin Park, Breaking Benjamin, and metalcore.</p></div><div className="ep-band-rail">{bandsList.slice(0,7).map((band,index)=><BandCard key={band.slug} band={band} index={index}/>)}</div></section>
      <section className="ep-book"><div className="ep-book-bg">{heroImage && <Image src={heroImage} alt="Echo Play Live performance" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}</div><div className="ep-wrap ep-book-inner"><span className="ep-label">Book Echo Play Live</span><h2>Give the room<br/>a reason to show up.</h2><p>Tell us the date, venue, city, budget, and crowd. We’ll help match the right act to the night.</p><div className="ep-actions"><Link href="/contact" className="ep-btn ep-primary">Start a booking</Link><Link href="/musicians" className="ep-btn">View the roster</Link></div></div></section>
    </main>
    <Footer />
  </>
}
