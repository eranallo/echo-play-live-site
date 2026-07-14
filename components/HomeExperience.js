'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const clamp = value => Math.max(0, Math.min(1, value))

function useJourneyController(ref) {
  const [state, setState] = useState({ progress: 0, phase: 'before' })

  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const node = ref.current
      if (!node) return

      const rect = node.getBoundingClientRect()
      const viewport = window.innerHeight
      const distance = Math.max(node.offsetHeight - viewport, 1)
      const progress = clamp(-rect.top / distance)

      let phase = 'before'
      if (rect.top <= 0 && rect.bottom > viewport) phase = 'pinned'
      else if (rect.bottom <= viewport) phase = 'after'

      setState(previous => {
        if (Math.abs(previous.progress - progress) < 0.001 && previous.phase === phase) return previous
        return { progress, phase }
      })
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const previousHtmlOverflow = document.documentElement.style.overflowX
    const previousBodyOverflow = document.body.style.overflowX
    document.documentElement.style.overflowX = 'clip'
    document.body.style.overflowX = 'clip'

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.visualViewport?.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.visualViewport?.removeEventListener('resize', onScroll)
      document.documentElement.style.overflowX = previousHtmlOverflow
      document.body.style.overflowX = previousBodyOverflow
    }
  }, [ref])

  return state
}

function StageWorld({ progress, heroImage, objectPosition }) {
  const push = clamp(progress / .72)
  const reveal = clamp((progress - .16) / .42)
  const finale = clamp((progress - .62) / .25)
  const beamSweep = `${-16 + progress * 31}deg`
  return (
    <div className="ep-stage-world" style={{ '--push': push, '--reveal': reveal, '--finale': finale, '--beam-sweep': beamSweep }} aria-hidden="true">
      <div className="ep-stage-photo">{heroImage && <Image src={heroImage} alt="" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition: objectPosition || 'center' }} />}</div>
      <div className="ep-stage-ceiling"><i/><i/><i/><i/><i/></div>
      <div className="ep-stage-beam ep-beam-one"/><div className="ep-stage-beam ep-beam-two"/><div className="ep-stage-beam ep-beam-three"/>
      <div className="ep-stage-screen"><span>Echo Play</span><b>Live</b></div>
      <div className="ep-stage-deck"/><div className="ep-stage-floor"/>
      <div className="ep-crowd">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ '--i': i }}/>)}</div>
      <div className="ep-haze"/><div className="ep-grain"/><div className="ep-vignette"/>
    </div>
  )
}

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link href={`/bands/${band.slug}`} className="ep-band-card" style={{ '--accent': band.color || '#d4a017', '--i': index }}>
      <div className="ep-band-image">{image && <Image src={image} alt={`${band.name} performing live`} fill sizes="(max-width:760px) 82vw, 30vw" style={{ objectFit:'cover', objectPosition: band.heroObjectPosition || 'center' }} />}</div>
      <div className="ep-band-top"><span>{String(index + 1).padStart(2,'0')}</span><span>{band.genre?.[0] || 'Live'}</span></div>
      <div className="ep-band-copy"><small>Echo Play Live</small><h3>{band.name}</h3><b>Explore the band →</b></div>
    </Link>
  )
}

function ShowCard({ show, index }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.featurePhoto || band?.heroPhoto || band?.crowdPhoto
  const action = show.ticketUrl || '/shows'
  return (
    <article className="ep-show-card" style={{ '--accent': show.bandColor || '#d4a017', '--i': index }}>
      <div className="ep-show-image">{image && <Image src={image} alt={`${show.bandName} live`} fill sizes="(max-width:760px) 100vw, 40vw" style={{ objectFit:'cover', objectPosition: band?.heroObjectPosition || 'center' }} />}</div>
      <div className="ep-show-date"><strong>{show.dateLabel || 'Date TBA'}</strong><span>{show.startTime || 'Showtime TBA'}</span></div>
      <div className="ep-show-copy"><span>Upcoming show</span><h3>{show.billLabel || show.bandName}</h3><p>{show.venueName || 'Venue announcement coming soon'}</p><a href={action} target={show.ticketUrl ? '_blank' : undefined} rel={show.ticketUrl ? 'noreferrer' : undefined}>{show.ticketUrl ? 'Get tickets' : 'View show'} →</a></div>
    </article>
  )
}

export default function HomeExperience({ shows = [] }) {
  const journeyRef = useRef(null)
  const { progress, phase } = useJourneyController(journeyRef)
  const featured = useMemo(() => bandsList.find(b => b.slug === 'so-long-goodnight') || bandsList[0], [])
  const heroImage = featured?.heroPhoto || featured?.featurePhoto || featured?.crowdPhoto
  const intro = clamp(1 - progress / .28)
  const identity = clamp(1 - Math.abs(progress - .47) / .24)
  const cta = clamp((progress - .67) / .2)
  const upcoming = shows.slice(0, 4)

  return <>
    <Nav />
    <main className="ep-home">
      <section className="ep-journey" ref={journeyRef}>
        <div className={`ep-sticky ep-pin-${phase}`}>
          <StageWorld progress={progress} heroImage={heroImage} objectPosition={featured?.heroObjectPosition} />
          <div className="ep-hero-copy ep-copy-intro" style={{ opacity:intro, transform:`translate3d(0,${(1-intro)*30}px,0)` }}><span>Fort Worth / DFW</span><h1>The room<br/>is waiting.</h1><p>Scroll to enter.</p></div>
          <div className="ep-hero-copy ep-copy-middle" style={{ opacity:identity, transform:`translate3d(0,${(1-identity)*30}px,0)` }}><span>Live music. Real nostalgia.</span><h2>Feel the night<br/>before it begins.</h2></div>
          <div className="ep-hero-copy ep-copy-final" style={{ opacity:cta, transform:`translate3d(0,${(1-cta)*30}px,0)` }}><span>Echo Play Live</span><h2>Find your<br/>next show.</h2><p>Tribute bands, cover acts, and themed live experiences built for unforgettable rooms.</p><div className="ep-actions"><Link href="/shows" className="ep-btn ep-primary">Get tickets</Link><Link href="/contact" className="ep-btn">Book a band</Link></div></div>
          <div className="ep-progress"><i style={{ transform:`scaleY(${progress})` }}/></div>
        </div>
      </section>

      <section className="ep-ticker"><div>LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE · LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE ·</div></section>

      <section className="ep-section ep-shows">
        <div className="ep-wrap ep-section-head"><div><span className="ep-label">On the calendar</span><h2>Your next night out.</h2></div><p>Find a show, grab your people, and step into the songs you already know by heart.</p></div>
        {upcoming.length ? <div className="ep-show-grid">{upcoming.map((show,index)=><ShowCard key={show.id || index} show={show} index={index}/>)}</div> : <div className="ep-empty ep-wrap"><p>New dates are being announced.</p><Link href="/shows">View all shows →</Link></div>}
        <div className="ep-wrap ep-section-link"><Link href="/shows">See every upcoming show <span>↗</span></Link></div>
      </section>

      <section className="ep-section ep-feature">
        <div className="ep-wrap ep-feature-grid"><div className="ep-feature-copy"><span className="ep-label">Featured band</span><h2>{featured.name}</h2><p>{featured.tagline || 'A crowd-powered live show built around the songs, emotion, and release of an unforgettable era.'}</p><Link href={`/bands/${featured.slug}`} className="ep-line-link">Meet the band <span>↗</span></Link></div><Link href={`/bands/${featured.slug}`} className="ep-feature-image">{heroImage && <Image src={heroImage} alt={`${featured.name} performing live`} fill sizes="(max-width:900px) 100vw, 58vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}<div className="ep-feature-frame"/><span>Enter the show</span></Link></div>
      </section>

      <section className="ep-section ep-roster"><div className="ep-wrap ep-section-head"><div><span className="ep-label">The roster</span><h2>Pick your era.<br/>Find your sound.</h2></div><p>From emo and 90s alternative to Tool, Deftones, Linkin Park, Breaking Benjamin, and metalcore.</p></div><div className="ep-band-rail">{bandsList.slice(0,7).map((band,index)=><BandCard key={band.slug} band={band} index={index}/>)}</div><div className="ep-wrap ep-section-link"><Link href="/bands">Explore the full roster <span>↗</span></Link></div></section>

      <section className="ep-section ep-proof"><div className="ep-wrap"><span className="ep-label">Built for the room</span><h2>More than a setlist.</h2><div className="ep-proof-grid"><article><span>01</span><h3>Professional production</h3><p>Organized advance work, prepared assets, and a show designed to fit the venue.</p></article><article><span>02</span><h3>Crowd-first performances</h3><p>Recognizable songs, strong pacing, and the energy that keeps a room involved.</p></article><article><span>03</span><h3>Reliable communication</h3><p>Clear booking, contracting, scheduling, and show-day expectations.</p></article><article><span>04</span><h3>Multiple experiences</h3><p>A focused roster covering different eras, genres, audiences, and room sizes.</p></article></div></div></section>

      <section className="ep-book"><div className="ep-book-bg">{heroImage && <Image src={heroImage} alt="Echo Play Live performance" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}</div><div className="ep-wrap ep-book-inner"><span className="ep-label">Book Echo Play Live</span><h2>Give the room<br/>a reason to show up.</h2><p>Tell us the date, venue, city, budget, and crowd. We’ll help match the right act to the night.</p><div className="ep-actions"><Link href="/contact" className="ep-btn ep-primary">Start a booking</Link><Link href="/bands" className="ep-btn">View the roster</Link></div></div></section>
    </main>
    <Footer />
    <style jsx global>{`
      .ep-home{overflow:visible!important}
      .ep-journey{position:relative!important;isolation:isolate}
      .ep-sticky{position:absolute!important;top:0;left:0;right:0;width:100%;height:100svh;height:100dvh}
      .ep-sticky.ep-pin-pinned{position:fixed!important;top:0;bottom:auto;left:0;right:0;width:100%;height:100svh;height:100dvh;z-index:40}
      .ep-sticky.ep-pin-after{position:absolute!important;top:auto;bottom:0;left:0;right:0;width:100%;height:100svh;height:100dvh}
      @supports not (height:100dvh){.ep-sticky,.ep-sticky.ep-pin-pinned,.ep-sticky.ep-pin-after{height:100vh}}
    `}</style>
  </>
}
