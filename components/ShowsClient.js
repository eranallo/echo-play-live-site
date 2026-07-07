'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
    ref.current?.querySelectorAll('.ps-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function showTime(value) {
  if (!value || value === 'Time TBD' || value === 'TBD') return ''
  const text = String(value).trim()
  const date = new Date(text)
  if (text.includes('T') && !Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(date)
  }
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
  if (filter === 'all') return 'All Shows'
  return bandsList.find(band => band.slug === filter)?.name || 'This band'
}

function EventCard({ show, index }) {
  const color = show.bandColor || '#D4A017'
  const time = showTime(show.startTime)
  const support = Array.isArray(show.supportNames) && show.supportNames.length ? show.supportNames.join(' + ') : ''

  return (
    <article className="ps-event ps-reveal" style={{ '--accent': color, '--delay': `${index * 70}ms` }}>
      <div className="ps-event-date">
        <span>{show.dateLabel?.split(',')[0] || 'Date'}</span>
        <strong>{show.dateLabel?.replace(/,/g, '').split(' ').slice(1).join(' ') || 'TBD'}</strong>
        {time && <em>{time}</em>}
      </div>
      <div className="ps-event-main">
        <div className="ps-billing">
          {show.bandSlug ? <Link href={`/bands/${show.bandSlug}`}>{show.bandName}</Link> : <span>{show.bandName}</span>}
          {support && <small>with {support}</small>}
        </div>
        <h2>{show.venueName}</h2>
        <p>{showDetails(show)}</p>
      </div>
      <div className="ps-event-action">
        {show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets →</a> : <span>Details soon</span>}
      </div>
    </article>
  )
}

export default function ShowsClient({ shows = [] }) {
  const ref = useReveal()
  const [filter, setFilter] = useState('all')
  const filteredShows = filter === 'all' ? shows : shows.filter(show => Array.isArray(show.bandSlugs) && show.bandSlugs.includes(filter))
  const nextShow = filteredShows[0]

  return (
    <>
      <Nav />
      <main ref={ref} className="ps-site">
        <style>{`
          .ps-site { min-height:100vh; background:radial-gradient(circle at 15% -5%, rgba(212,160,23,.18), transparent 32%), radial-gradient(circle at 88% 8%, rgba(255,255,255,.07), transparent 28%), linear-gradient(180deg,#0e0e0e 0%,#050505 48%,#030303 100%); color:var(--c-text); overflow:hidden; }
          .ps-site::before { content:''; position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px); background-size:72px 72px; mask-image:linear-gradient(to bottom,#000,transparent 72%); opacity:.55; }
          .ps-wrap { width:min(1520px, calc(100vw - clamp(32px,7vw,112px))); margin:0 auto; position:relative; z-index:1; }
          .ps-hero { padding:clamp(120px,14vw,200px) 0 clamp(44px,7vw,92px); position:relative; }
          .ps-hero-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:clamp(28px,6vw,86px); align-items:end; }
          .ps-kicker { display:inline-flex; gap:12px; align-items:center; font-family:var(--ff-label); font-size:11px; letter-spacing:.26em; text-transform:uppercase; color:var(--c-epl); font-weight:800; }
          .ps-kicker::before { content:''; width:9px; height:9px; border-radius:50%; background:var(--c-epl); box-shadow:0 0 24px var(--c-epl); }
          .ps-title { font-family:var(--ff-display); font-size:clamp(76px,15vw,220px); line-height:.76; letter-spacing:-.015em; margin:18px 0 22px; }
          .ps-title span { color:var(--c-epl); }
          .ps-copy { color:rgba(255,255,255,.58); font-size:clamp(16px,1.5vw,21px); line-height:1.6; max-width:700px; }
          .ps-feature { min-height:370px; border:1px solid rgba(255,255,255,.10); border-radius:38px; background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.018)); padding:28px; position:relative; overflow:hidden; box-shadow:0 44px 130px rgba(0,0,0,.44); }
          .ps-feature::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--feature, #D4A017) 26%, transparent), transparent 42%); pointer-events:none; }
          .ps-feature span { font-family:var(--ff-label); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--c-epl); position:relative; z-index:1; }
          .ps-feature strong { display:block; font-family:var(--ff-display); font-size:clamp(48px,7vw,92px); line-height:.82; margin:18px 0 12px; position:relative; z-index:1; }
          .ps-feature p { color:rgba(255,255,255,.58); line-height:1.55; position:relative; z-index:1; }
          .ps-filter { position:sticky; top:60px; z-index:10; border-top:1px solid rgba(255,255,255,.08); border-bottom:1px solid rgba(255,255,255,.08); background:rgba(6,6,6,.78); backdrop-filter:blur(24px); }
          .ps-filter-scroll { display:flex; gap:10px; overflow-x:auto; padding:12px 0; scrollbar-width:none; }
          .ps-filter-scroll::-webkit-scrollbar { display:none; }
          .ps-filter button { flex:0 0 auto; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.025); color:rgba(255,255,255,.50); border-radius:999px; padding:12px 16px; font-family:var(--ff-label); font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; cursor:pointer; transition:transform .2s ease,border-color .2s ease,color .2s ease,background .2s ease; }
          .ps-filter button:hover { transform:translateY(-2px); }
          .ps-filter button.active { color:#080808; background:var(--filter); border-color:var(--filter); }
          .ps-list { padding:clamp(58px,9vw,126px) 0; }
          .ps-list-head { display:flex; justify-content:space-between; align-items:end; gap:24px; margin-bottom:34px; }
          .ps-list-head h2 { font-family:var(--ff-display); font-size:clamp(44px,8vw,112px); line-height:.82; letter-spacing:-.01em; }
          .ps-list-head p { color:rgba(255,255,255,.48); max-width:420px; line-height:1.55; }
          .ps-events { display:grid; gap:18px; }
          .ps-event { display:grid; grid-template-columns:minmax(128px,.22fr) minmax(0,1fr) auto; gap:clamp(18px,4vw,60px); align-items:center; min-height:260px; border:1px solid rgba(255,255,255,.10); border-radius:34px; padding:clamp(22px,3vw,36px); background:linear-gradient(180deg,rgba(255,255,255,.052),rgba(255,255,255,.015)); box-shadow:0 30px 110px rgba(0,0,0,.30); position:relative; overflow:hidden; opacity:0; transform:translateY(28px); transition:opacity .7s ease var(--delay), transform .7s ease var(--delay), border-color .25s ease; }
          .ps-event.is-visible { opacity:1; transform:translateY(0); }
          .ps-event::after { content:''; position:absolute; inset:-40% -25% auto auto; width:55%; height:120%; background:radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 64%); pointer-events:none; }
          .ps-event:hover { border-color:color-mix(in srgb, var(--accent) 55%, white 8%); }
          .ps-event-date span,.ps-billing a,.ps-billing span { font-family:var(--ff-label); font-size:11px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:var(--accent); text-decoration:none; }
          .ps-event-date strong { display:block; white-space:pre-line; font-family:var(--ff-display); font-size:clamp(44px,6vw,86px); line-height:.78; color:#fff; margin:10px 0; }
          .ps-event-date em { color:rgba(255,255,255,.42); font-style:normal; font-size:13px; letter-spacing:.08em; text-transform:uppercase; }
          .ps-billing { display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
          .ps-billing small { color:rgba(255,255,255,.44); font-size:14px; }
          .ps-event-main h2 { font-family:var(--ff-display); font-size:clamp(46px,7vw,108px); line-height:.82; letter-spacing:-.01em; margin:0 0 16px; }
          .ps-event-main p { color:rgba(255,255,255,.50); }
          .ps-event-action a,.ps-event-action span { display:inline-flex; align-items:center; justify-content:center; min-height:52px; padding:0 20px; border:1px solid color-mix(in srgb, var(--accent) 72%, transparent); color:var(--accent); border-radius:999px; text-decoration:none; font-family:var(--ff-label); font-size:11px; letter-spacing:.15em; text-transform:uppercase; white-space:nowrap; }
          .ps-event-action a { background:color-mix(in srgb, var(--accent) 10%, transparent); }
          .ps-empty { border:1px solid rgba(255,255,255,.10); border-radius:34px; padding:44px; background:rgba(255,255,255,.028); color:rgba(255,255,255,.58); line-height:1.65; }
          .ps-bottom { padding:0 0 clamp(70px,10vw,140px); }
          .ps-follow { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }
          .ps-follow a { border:1px solid rgba(255,255,255,.10); border-radius:999px; padding:10px 14px; text-decoration:none; font-family:var(--ff-label); font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:rgba(255,255,255,.54); }
          .ps-reveal { opacity:0; transform:translateY(28px); transition:opacity .72s ease, transform .72s ease; }
          .ps-reveal.is-visible { opacity:1; transform:translateY(0); }
          @media (max-width:960px){ .ps-hero-grid,.ps-event{grid-template-columns:1fr}.ps-event-action{justify-self:start}.ps-list-head{display:grid}.ps-title{font-size:clamp(70px,22vw,150px)} }
          @media (prefers-reduced-motion:reduce){ .ps-reveal,.ps-event{transition:none;opacity:1;transform:none} }
        `}</style>

        <section className="ps-hero">
          <div className="ps-wrap ps-hero-grid">
            <div>
              <div className="ps-kicker ps-reveal">Announced public dates only</div>
              <h1 className="ps-title ps-reveal">Shows that feel like <span>events.</span></h1>
              <p className="ps-copy ps-reveal">Browse upcoming Echo Play Live dates. We only publish shows once they are approved for public release, so what you see here is ready for fans.</p>
            </div>
            <aside className="ps-feature ps-reveal" style={{ '--feature': nextShow?.bandColor || '#D4A017' }}>
              <span>Next announced show</span>
              <strong>{nextShow ? nextShow.bandName : 'More dates soon'}</strong>
              <p>{nextShow ? `${nextShow.venueName} · ${nextShow.dateLabel}` : 'Follow the bands and check back as campaigns go live.'}</p>
            </aside>
          </div>
        </section>

        <nav className="ps-filter" aria-label="Show filters">
          <div className="ps-wrap ps-filter-scroll">
            {['all', ...bandsList.map(band => band.slug)].map(slug => {
              const band = slug === 'all' ? null : bandsList.find(item => item.slug === slug)
              const active = filter === slug
              const color = band?.color || '#D4A017'
              return <button className={active ? 'active' : ''} style={{ '--filter': color }} key={slug} onClick={() => setFilter(slug)}>{slug === 'all' ? 'All Shows' : band.shortName || band.name}</button>
            })}
          </div>
        </nav>

        <section className="ps-list">
          <div className="ps-wrap">
            <div className="ps-list-head ps-reveal">
              <h2>{filteredShows.length || 'No'} announced {filteredShows.length === 1 ? 'show' : 'shows'}</h2>
              <p>{filter === 'all' ? 'Everything currently approved for public release.' : `Public dates featuring ${filterName(filter)}.`}</p>
            </div>
            {filteredShows.length ? <div className="ps-events">{filteredShows.map((show, index) => <EventCard key={show.id} show={show} index={index} />)}</div> : <div className="ps-empty">No announced public shows for {filterName(filter)} yet. Check back soon or follow the band for new date announcements.</div>}
          </div>
        </section>

        <section className="ps-bottom">
          <div className="ps-wrap">
            <div className="ps-kicker ps-reveal">Follow the roster</div>
            <div className="ps-follow ps-reveal">
              {bandsList.filter(band => band.social?.bandsintown).map(band => <a key={band.slug} href={band.social.bandsintown} target="_blank" rel="noopener noreferrer">{band.shortName || band.name} →</a>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
