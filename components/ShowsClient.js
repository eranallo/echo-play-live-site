'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'
import './ShowsExperience.css'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' })
    ref.current?.querySelectorAll('.ps-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function showTime(value) {
  if (!value || value === 'Time TBD' || value === 'TBD') return ''
  const text = String(value).trim()
  const date = new Date(text)
  if (text.includes('T') && !Number.isNaN(date.getTime())) return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(date)
  return text
}

function cleanMoneyLabel(value) {
  const text = value === null || value === undefined ? '' : String(value).trim()
  if (!text) return ''
  if (text.toLowerCase().includes('free')) return text
  const stripped = text.replace(/\$/g, '').trim()
  if (/^\d+(\.\d+)?$/.test(stripped)) return `$${Number(stripped).toLocaleString('en-US')}`
  return text
}

function showDetails(show) {
  const ticket = cleanMoneyLabel(show.ticketLabel)
  const status = show.publicStatus || ''
  if (!ticket) return status
  if (!status || ticket.toLowerCase() === status.toLowerCase()) return ticket
  return `${ticket} · ${status}`
}

function filterName(filter) {
  if (filter === 'all') return 'All dates'
  return bandsList.find(band => band.slug === filter)?.name || 'This band'
}

function EventCard({ show, index }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.heroPhoto || band?.featurePhoto || band?.crowdPhoto
  const color = show.bandColor || band?.color || '#D4A017'
  const time = showTime(show.startTime)
  const support = Array.isArray(show.supportNames) && show.supportNames.length ? show.supportNames.join(' + ') : ''
  const dateParts = show.dateLabel?.replace(/,/g, '').split(' ') || []
  const day = show.dateLabel?.split(',')[0] || 'Date'
  const date = dateParts.slice(1).join(' ') || 'TBD'

  return (
    <article className="ps-event ps-reveal" style={{ '--accent': color, '--delay': `${index * 55}ms` }}>
      {image && <div className="ps-event-bg"><Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 72vw" style={{ objectFit: 'cover', objectPosition: band?.heroObjectPosition || 'center' }} /><div className="ps-event-bg-grade" /></div>}
      <div className="ps-event-date"><span>{day}</span><strong>{date}</strong>{time && <em>{time}</em>}</div>
      <div className="ps-event-main">
        <div className="ps-billing">{show.bandSlug ? <Link href={`/bands/${show.bandSlug}`}>{show.bandName}</Link> : <span>{show.bandName}</span>}{support && <small>with {support}</small>}</div>
        <h2>{show.venueName || 'Venue announcement coming soon'}</h2>
        <p>{showDetails(show)}</p>
      </div>
      <div className="ps-event-action">{show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets</a> : <span>Details soon</span>}</div>
    </article>
  )
}

export default function ShowsClient({ shows = [] }) {
  const ref = useReveal()
  const [filter, setFilter] = useState('all')
  const filteredShows = filter === 'all' ? shows : shows.filter(show => Array.isArray(show.bandSlugs) && show.bandSlugs.includes(filter))
  const nextShow = filteredShows[0]
  const nextBand = bandsList.find(item => item.slug === nextShow?.bandSlug) || bandsList.find(item => item.name === nextShow?.bandName)
  const nextImage = nextBand?.heroPhoto || nextBand?.featurePhoto || nextBand?.crowdPhoto

  return <>
    <Nav />
    <main ref={ref} className="ps-site">
      <section className="ps-hero">
        {nextImage && <div className="ps-hero-bg"><Image src={nextImage} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: nextBand?.heroObjectPosition || 'center' }} /><div /></div>}
        <div className="ps-wrap ps-hero-grid">
          <div><div className="ps-kicker ps-reveal">Shows</div><h1 className="ps-title ps-reveal">Upcoming <span>dates.</span></h1><p className="ps-copy ps-reveal">Announced public shows from the Echo Play Live roster.</p></div>
          <aside className="ps-feature ps-reveal" style={{ '--feature': nextShow?.bandColor || nextBand?.color || '#D4A017' }}><span>Next up</span><strong>{nextShow ? nextShow.bandName : 'More soon'}</strong><p>{nextShow ? `${nextShow.venueName} · ${nextShow.dateLabel}` : 'New dates will appear here once announced.'}</p></aside>
        </div>
      </section>

      <nav className="ps-filter" aria-label="Show filters"><div className="ps-wrap ps-filter-scroll">{['all', ...bandsList.map(band => band.slug)].map(slug => { const band = slug === 'all' ? null : bandsList.find(item => item.slug === slug); const color = band?.color || '#D4A017'; return <button className={filter === slug ? 'active' : ''} style={{ '--filter': color }} key={slug} onClick={() => setFilter(slug)}>{slug === 'all' ? 'All' : band.shortName || band.name}</button> })}</div></nav>

      <section className="ps-list"><div className="ps-wrap"><div className="ps-list-head ps-reveal"><h2>{filteredShows.length || 'No'} {filteredShows.length === 1 ? 'date' : 'dates'}</h2><p>{filter === 'all' ? 'All currently announced public dates.' : filterName(filter)}</p></div>{filteredShows.length ? <div className="ps-events">{filteredShows.map((show, index) => <EventCard key={show.id} show={show} index={index} />)}</div> : <div className="ps-empty">No announced dates for {filterName(filter)} yet.</div>}</div></section>

      <section className="ps-bottom"><div className="ps-wrap"><div className="ps-kicker ps-reveal">Bandsintown</div><div className="ps-follow ps-reveal">{bandsList.filter(band => band.social?.bandsintown).map(band => <a key={band.slug} href={band.social.bandsintown} target="_blank" rel="noopener noreferrer">{band.shortName || band.name}</a>)}</div></div></section>
    </main>
    <Footer />
  </>
}