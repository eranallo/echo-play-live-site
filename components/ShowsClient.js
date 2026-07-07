'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('revealed')
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const elements = ref.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    elements?.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return ref
}

function formatShowTime(value) {
  if (!value || value === 'Time TBD' || value === 'TBD') return ''
  const text = String(value).trim()
  const date = new Date(text)

  if (text.includes('T') && !Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    }).format(date)
  }

  return text
}

function filterName(filter) {
  if (filter === 'all') return 'All Shows'
  return bandsList.find(band => band.slug === filter)?.name || 'This band'
}

function ShowCard({ show }) {
  const color = show.bandColor || '#D4A017'
  const displayTime = formatShowTime(show.startTime)
  const hasSupport = Array.isArray(show.supportNames) && show.supportNames.length > 0

  return (
    <article className="show-card" style={{
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.012))',
      padding: 'clamp(20px, 3vw, 34px)',
      display: 'grid',
      gridTemplateColumns: 'minmax(120px, 0.26fr) minmax(0, 1fr) auto',
      gap: 'clamp(18px, 3vw, 36px)',
      alignItems: 'center',
      opacity: 1,
      transform: 'none',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(30px, 5vw, 58px)',
          lineHeight: 0.85,
          letterSpacing: 'var(--ls-display)',
          color,
          whiteSpace: 'pre-line',
        }}>
          {show.dateLabel?.replace(/, /g, '\n') || 'Date TBD'}
        </div>
        {displayTime && (
          <div style={{
            marginTop: 'var(--s-3)',
            fontFamily: 'var(--ff-label)',
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}>
            {displayTime}
          </div>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
          {show.bandSlug ? (
            <Link href={`/bands/${show.bandSlug}`} style={{
              fontFamily: 'var(--ff-label)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color,
              textDecoration: 'none',
            }}>
              {show.bandName}
            </Link>
          ) : (
            <span style={{
              fontFamily: 'var(--ff-label)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color,
            }}>
              {show.bandName}
            </span>
          )}
          {hasSupport && <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px' }}>with {show.supportNames.join(' + ')}</span>}
        </div>

        <h2 style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(34px, 5vw, 70px)',
          lineHeight: 0.9,
          letterSpacing: 'var(--ls-display)',
          color: 'var(--c-text)',
          margin: '0 0 12px',
        }}>
          {show.venueName}
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: 'rgba(255,255,255,0.42)', fontSize: '14px' }}>
          <span>{show.ticketLabel}</span>
          {show.publicStatus && <span>• {show.publicStatus}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
        {show.ticketUrl ? (
          <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#080808',
            background: color,
            padding: '12px 16px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}>
            Tickets →
          </a>
        ) : (
          <span style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color,
            border: `1px solid ${color}66`,
            padding: '12px 16px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            opacity: 0.82,
          }}>
            Details Soon
          </span>
        )}
      </div>
    </article>
  )
}

export default function ShowsClient({ shows = [] }) {
  const pageRef = useScrollReveal()
  const [filter, setFilter] = useState('all')

  const filteredShows = filter === 'all'
    ? shows
    : shows.filter(show => Array.isArray(show.bandSlugs) && show.bandSlugs.includes(filter))

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808', minHeight: '100vh' }}>
        <section style={{
          padding: 'clamp(120px, 16vw, 180px) var(--gutter-fluid) clamp(60px, 8vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(212,160,23,0.04) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div className="section-label reveal" style={{ marginBottom: '16px' }}>On Stage</div>
            <h1 className="reveal delay-100" style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(64px, 14vw, 180px)',
              letterSpacing: '0.01em',
              lineHeight: 0.85,
              marginBottom: '24px',
            }}>
              Shows &<br /><span style={{ color: 'var(--c-epl)' }}>Events</span>
            </h1>
            <p className="reveal delay-200" style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.52)',
              maxWidth: '620px',
            }}>
              Announced public dates only. Ticket links and lineup details are added here as each show campaign goes live.
            </p>
          </div>
        </section>

        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: '60px',
          zIndex: 10,
          background: 'rgba(8,8,8,0.96)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div className="filter-bar-scroll" style={{ padding: '0 var(--gutter-fluid)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {['all', ...bandsList.map(band => band.slug)].map(slug => {
                const band = slug === 'all' ? null : bandsList.find(item => item.slug === slug)
                const isActive = filter === slug

                return (
                  <button key={slug} onClick={() => setFilter(slug)} style={{
                    fontFamily: 'var(--ff-label)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${isActive ? (band ? band.color : '#D4A017') : 'transparent'}`,
                    color: isActive ? (band ? band.color : '#D4A017') : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    marginBottom: '-1px',
                  }}>
                    {slug === 'all' ? 'All Shows' : band.name}
                  </button>
                )
              })}
            </div>
            <div className="filter-bar-fade" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px', background: 'linear-gradient(to right, rgba(8,8,8,0) 0%, rgba(8,8,8,0.96) 100%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <style jsx global>{`
          .filter-bar-scroll::-webkit-scrollbar { display: none; }
          @media (min-width: 769px) { .filter-bar-fade { display: none; } }
          @media (max-width: 760px) { .show-card { grid-template-columns: 1fr !important; } }
        `}</style>

        <section style={{ padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4A017', boxShadow: '0 0 8px #D4A017' }} />
              <div style={{ fontFamily: 'var(--ff-label)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4A017' }}>
                {filteredShows.length ? `${filteredShows.length} Announced ${filteredShows.length === 1 ? 'Show' : 'Shows'}` : filter === 'all' ? 'Announced Shows' : `${filterName(filter)} Shows`}
              </div>
            </div>

            {filteredShows.length ? (
              <div style={{ display: 'grid', gap: '18px' }}>
                {filteredShows.map(show => <ShowCard key={show.id} show={show} />)}
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.018)', padding: '40px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                No announced public shows for {filterName(filter)} yet. Check back soon or follow the band for new date announcements.
              </div>
            )}

            <div style={{ marginTop: '48px', paddingTop: '36px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'var(--ff-label)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
                Follow on Bandsintown
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {bandsList.filter(band => band.social?.bandsintown).map(band => (
                  <a key={band.slug} href={band.social.bandsintown} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--ff-label)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: band.color, border: `1px solid ${band.color}40`, padding: '8px 16px', textDecoration: 'none' }}>
                    {band.shortName} →
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p className="reveal" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
              Interested in booking one of our bands for your venue or event?
            </p>
            <Link className="reveal delay-100" href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--ff-label)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#080808', background: '#D4A017', padding: '14px 28px', textDecoration: 'none' }}>
              Booking Inquiry →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
