'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'
import './HomeExperience.css'

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

function MovingHead({ position, index }) {
  return <div className={`ep-fixture ep-fixture-${position}`} style={{ '--fixture': index }}>
    <span className="ep-fixture-clamp" />
    <span className="ep-fixture-yoke"><i className="ep-fixture-body"><b className="ep-fixture-lens" /></i></span>
  </div>
}

function StageWorld({ progress, heroImage, objectPosition }) {
  const power = clamp((progress - .08) / .28)
  const sweep = clamp((progress - .18) / .42)
  const logo = clamp((progress - .48) / .28)
  const finale = clamp((progress - .72) / .18)
  return <div className="ep-stage-world" style={{ '--power': power, '--sweep': sweep, '--logo': logo, '--finale': finale, '--camera': clamp(progress / .88) }} aria-hidden="true">
    <div className="ep-stage-photo">{heroImage && <Image src={heroImage} alt="" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition:objectPosition || 'center' }} />}</div>
    <div className="ep-stage-roof" />
    <div className="ep-truss ep-truss-main"><span/><span/><span/><span/><span/><span/><span/><span/></div>
    <div className="ep-truss ep-truss-left"><span/><span/><span/><span/><span/></div>
    <div className="ep-truss ep-truss-right"><span/><span/><span/><span/><span/></div>
    <div className="ep-fixtures">
      <MovingHead position="one" index={0}/><MovingHead position="two" index={1}/><MovingHead position="three" index={2}/><MovingHead position="four" index={3}/><MovingHead position="five" index={4}/>
    </div>
    <div className="ep-beam ep-beam-one"/><div className="ep-beam ep-beam-two"/><div className="ep-beam ep-beam-three"/><div className="ep-beam ep-beam-four"/><div className="ep-beam ep-beam-five"/>
    <div className="ep-stage-wall">
      <div className="ep-led-grid" />
      <div className="ep-logo-aura" />
      <div className="ep-logo-mark"><Image src="/logo.png" alt="" fill sizes="(max-width:740px) 48vw, 28vw" style={{ objectFit:'contain' }} /></div>
      <div className="ep-wordmark">Echo Play Live</div>
    </div>
    <div className="ep-side-screen ep-side-screen-left"/><div className="ep-side-screen ep-side-screen-right"/>
    <div className="ep-stage-deck"><span/><span/><span/></div>
    <div className="ep-stage-floor"/>
    <div className="ep-crowd">{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ '--i': i }}/>)}</div>
    <div className="ep-atmosphere ep-atmosphere-one"/><div className="ep-atmosphere ep-atmosphere-two"/>
    <div className="ep-grain"/><div className="ep-vignette"/>
  </div>
}

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return <Link href={`/bands/${band.slug}`} className="ep-band-card" style={{ '--accent':band.color || '#d4a017' }}>
    <div className="ep-band-image">{image && <Image src={image} alt={`${band.name} performing live`} fill sizes="(max-width:760px) 82vw, 30vw" style={{ objectFit:'cover', objectPosition:band.heroObjectPosition || 'center' }} />}</div>
    <div className="ep-band-top"><span>{String(index + 1).padStart(2,'0')}</span><span>{band.genre?.[0] || 'Live'}</span></div>
    <div className="ep-band-copy"><small>Echo Play Live</small><h3>{band.name}</h3><b>Explore the band →</b></div>
  </Link>
}

function ShowCard({ show }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.featurePhoto || band?.heroPhoto || band?.crowdPhoto
  const time = show.startTime && show.startTime.includes('T') ? new Date(show.startTime).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : show.startTime
  return <article className="ep-show-card" style={{ '--accent':show.bandColor || '#d4a017' }}>
    <div className="ep-show-image">{image && <Image src={image} alt={`${show.bandName} live`} fill sizes="(max-width:760px) 100vw, 40vw" style={{ objectFit:'cover', objectPosition:band?.heroObjectPosition || 'center' }} />}</div>
    <div className="ep-show-date"><strong>{show.dateLabel || 'Date TBA'}</strong><span>{time || 'Showtime TBA'}</span></div>
    <div className="ep-show-copy"><span>Upcoming show</span><h3>{show.billLabel || show.bandName}</h3><p>{show.venueName || 'Venue announcement coming soon'}</p><a href={show.ticketUrl || '/shows'} target={show.ticketUrl ? '_blank' : undefined} rel={show.ticketUrl ? 'noreferrer' : undefined}>{show.ticketUrl ? 'Get tickets' : 'View show'} →</a></div>
  </article>
}

export default function HomeExperience({ shows = [] }) {
  const journeyRef = useRef(null)
  const { progress, phase } = useJourneyController(journeyRef)
  const featured = useMemo(() => bandsList.find(b => b.slug === 'so-long-goodnight') || bandsList[0], [])
  const heroImage = featured?.heroPhoto || featured?.featurePhoto || featured?.crowdPhoto
  const cue = clamp(1 - progress / .16)
  const finale = clamp((progress - .72) / .18)
  const upcoming = shows.slice(0,4)
  return <>
    <Nav />
    <main className="ep-home">
      <section className="ep-journey" ref={journeyRef}>
        <div className={`ep-sticky ep-pin-${phase}`}>
          <StageWorld progress={progress} heroImage={heroImage} objectPosition={featured?.heroObjectPosition}/>
          <div className="ep-entry-cue" style={{ opacity:cue }}><span>Echo Play Live</span><h1>The room is waiting.</h1><p>Scroll to enter</p></div>
          <div className="ep-reveal-copy" style={{ opacity:finale, transform:`translate3d(-50%,${(1-finale)*22}px,0)` }}><p>Live music. Real nostalgia.</p><div className="ep-actions"><Link href="/shows" className="ep-btn ep-primary">Get tickets</Link><Link href="/contact" className="ep-btn">Book a band</Link></div></div>
          <div className="ep-progress"><i style={{ transform:`scaleY(${progress})` }}/></div>
        </div>
      </section>
      <section className="ep-ticker"><div>LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE · LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE ·</div></section>
      <section className="ep-section ep-shows"><div className="ep-wrap ep-section-head"><div><span className="ep-label">On the calendar</span><h2>Your next night out.</h2></div><p>Find a show, grab your people, and step into the songs you already know by heart.</p></div>{upcoming.length ? <div className="ep-show-grid">{upcoming.map(show=><ShowCard key={show.id} show={show}/>)}</div> : null}<div className="ep-wrap ep-section-link"><Link href="/shows">See every upcoming show <span>↗</span></Link></div></section>
      <section className="ep-section ep-feature"><div className="ep-wrap ep-feature-grid"><div className="ep-feature-copy"><span className="ep-label">Featured band</span><h2>{featured.name}</h2><p>{featured.tagline}</p><Link href={`/bands/${featured.slug}`} className="ep-line-link">Meet the band <span>↗</span></Link></div><Link href={`/bands/${featured.slug}`} className="ep-feature-image">{heroImage && <Image src={heroImage} alt={`${featured.name} performing live`} fill sizes="(max-width:900px) 100vw, 58vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}<div className="ep-feature-frame"/><span>Enter the show</span></Link></div></section>
      <section className="ep-section ep-roster"><div className="ep-wrap ep-section-head"><div><span className="ep-label">The roster</span><h2>Pick your era.<br/>Find your sound.</h2></div><p>From emo and 90s alternative to Tool, Deftones, Linkin Park, Breaking Benjamin, and metalcore.</p></div><div className="ep-band-rail">{bandsList.slice(0,7).map((band,index)=><BandCard key={band.slug} band={band} index={index}/>)}</div></section>
      <section className="ep-book"><div className="ep-book-bg">{heroImage && <Image src={heroImage} alt="Echo Play Live performance" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}</div><div className="ep-wrap ep-book-inner"><span className="ep-label">Book Echo Play Live</span><h2>Give the room<br/>a reason to show up.</h2><p>Tell us the date, venue, city, budget, and crowd. We’ll help match the right act to the night.</p><div className="ep-actions"><Link href="/contact" className="ep-btn ep-primary">Start a booking</Link><Link href="/bands" className="ep-btn">View the roster</Link></div></div></section>
    </main>
    <Footer />
  </>
}
