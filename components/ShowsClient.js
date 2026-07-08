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
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
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
  const color = show.bandColor || '#D4A017'
  const time = showTime(show.startTime)
  const support = Array.isArray(show.supportNames) && show.supportNames.length ? show.supportNames.join(' + ') : ''

  return (
    <article className="ps-event ps-reveal" style={{ '--accent': color, '--delay': `${index * 60}ms` }}>
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
        {show.ticketUrl ? <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets</a> : <span>Details soon</span>}
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
          .ps-site{min-height:100vh;background:radial-gradient(circle at 16% -4%,rgba(212,160,23,.14),transparent 32%),linear-gradient(180deg,#0d0d0d 0%,#050505 48%,#030303 100%);color:var(--c-text);overflow:hidden}.ps-site:before{content:'';position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:80px 80px;mask-image:linear-gradient(to bottom,#000,transparent 72%);opacity:.42}.ps-wrap{width:min(1480px,calc(100vw - clamp(32px,7vw,112px)));margin:0 auto;position:relative;z-index:1}.ps-hero{padding:clamp(120px,14vw,190px) 0 clamp(48px,7vw,86px)}.ps-hero-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);gap:clamp(28px,6vw,86px);align-items:end}.ps-kicker{font-family:var(--ff-label);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--c-epl);font-weight:800}.ps-title{font-family:var(--ff-display);font-size:clamp(78px,14vw,200px);line-height:.76;letter-spacing:-.015em;margin:18px 0 18px}.ps-title span{color:var(--c-epl)}.ps-copy{color:rgba(255,255,255,.56);font-size:clamp(16px,1.45vw,20px);line-height:1.62;max-width:620px}.ps-feature{min-height:310px;border:1px solid rgba(255,255,255,.10);border-radius:34px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.016));padding:26px;position:relative;overflow:hidden;box-shadow:0 36px 120px rgba(0,0,0,.35)}.ps-feature:after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 82% 0%,color-mix(in srgb,var(--feature,#D4A017) 22%,transparent),transparent 44%);pointer-events:none}.ps-feature span{font-family:var(--ff-label);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--c-epl);position:relative;z-index:1}.ps-feature strong{display:block;font-family:var(--ff-display);font-size:clamp(46px,6vw,82px);line-height:.82;margin:18px 0 12px;position:relative;z-index:1}.ps-feature p{color:rgba(255,255,255,.55);line-height:1.55;position:relative;z-index:1}.ps-filter{position:sticky;top:60px;z-index:10;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);background:rgba(6,6,6,.78);backdrop-filter:blur(22px)}.ps-filter-scroll{display:flex;gap:10px;overflow-x:auto;padding:12px 0;scrollbar-width:none}.ps-filter-scroll::-webkit-scrollbar{display:none}.ps-filter button{flex:0 0 auto;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.025);color:rgba(255,255,255,.50);border-radius:999px;padding:12px 16px;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;cursor:pointer}.ps-filter button.active{color:#080808;background:var(--filter);border-color:var(--filter)}.ps-list{padding:clamp(56px,9vw,118px) 0}.ps-list-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:30px}.ps-list-head h2{font-family:var(--ff-display);font-size:clamp(44px,8vw,104px);line-height:.82;letter-spacing:-.01em}.ps-list-head p{color:rgba(255,255,255,.46);max-width:380px;line-height:1.55}.ps-events{display:grid;gap:14px}.ps-event{display:grid;grid-template-columns:minmax(128px,.22fr) minmax(0,1fr) auto;gap:clamp(18px,4vw,56px);align-items:center;min-height:230px;border:1px solid rgba(255,255,255,.10);border-radius:30px;padding:clamp(22px,3vw,34px);background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014));box-shadow:0 24px 90px rgba(0,0,0,.26);position:relative;overflow:hidden;opacity:0;transform:translateY(24px);transition:opacity .65s ease var(--delay),transform .65s ease var(--delay),border-color .22s ease}.ps-event.is-visible{opacity:1;transform:translateY(0)}.ps-event:after{content:'';position:absolute;inset:-40% -28% auto auto;width:50%;height:120%;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 18%,transparent),transparent 64%);pointer-events:none}.ps-event:hover{border-color:color-mix(in srgb,var(--accent) 46%,white 8%)}.ps-event-date span,.ps-billing a,.ps-billing span{font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:var(--accent);text-decoration:none}.ps-event-date strong{display:block;white-space:pre-line;font-family:var(--ff-display);font-size:clamp(42px,5.7vw,80px);line-height:.78;color:#fff;margin:10px 0}.ps-event-date em{color:rgba(255,255,255,.42);font-style:normal;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.ps-billing{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.ps-billing small{color:rgba(255,255,255,.44);font-size:14px}.ps-event-main h2{font-family:var(--ff-display);font-size:clamp(44px,6.5vw,98px);line-height:.82;letter-spacing:-.01em;margin:0 0 14px}.ps-event-main p{color:rgba(255,255,255,.48)}.ps-event-action a,.ps-event-action span{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 18px;border:1px solid color-mix(in srgb,var(--accent) 66%,transparent);color:var(--accent);border-radius:999px;text-decoration:none;font-family:var(--ff-label);font-size:11px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}.ps-event-action a{background:color-mix(in srgb,var(--accent) 9%,transparent)}.ps-empty{border:1px solid rgba(255,255,255,.10);border-radius:30px;padding:40px;background:rgba(255,255,255,.025);color:rgba(255,255,255,.56);line-height:1.65}.ps-bottom{padding:0 0 clamp(70px,10vw,130px)}.ps-follow{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.ps-follow a{border:1px solid rgba(255,255,255,.10);border-radius:999px;padding:10px 14px;text-decoration:none;font-family:var(--ff-label);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.54)}.ps-reveal{opacity:0;transform:translateY(24px);transition:opacity .68s ease,transform .68s ease}.ps-reveal.is-visible{opacity:1;transform:translateY(0)}@media(max-width:960px){.ps-hero-grid,.ps-event{grid-template-columns:1fr}.ps-event-action{justify-self:start}.ps-list-head{display:grid}.ps-title{font-size:clamp(70px,22vw,142px)}}@media(prefers-reduced-motion:reduce){.ps-reveal,.ps-event{transition:none;opacity:1;transform:none}}
        `}</style>

        <section className="ps-hero">
          <div className="ps-wrap ps-hero-grid">
            <div>
              <div className="ps-kicker ps-reveal">Shows</div>
              <h1 className="ps-title ps-reveal">Upcoming <span>dates.</span></h1>
              <p className="ps-copy ps-reveal">Announced public shows from the Echo Play Live roster.</p>
            </div>
            <aside className="ps-feature ps-reveal" style={{ '--feature': nextShow?.bandColor || '#D4A017' }}>
              <span>Next up</span>
              <strong>{nextShow ? nextShow.bandName : 'More soon'}</strong>
              <p>{nextShow ? `${nextShow.venueName} · ${nextShow.dateLabel}` : 'New dates will appear here once announced.'}</p>
            </aside>
          </div>
        </section>

        <nav className="ps-filter" aria-label="Show filters"><div className="ps-wrap ps-filter-scroll">{['all', ...bandsList.map(band => band.slug)].map(slug => { const band = slug === 'all' ? null : bandsList.find(item => item.slug === slug); const color = band?.color || '#D4A017'; return <button className={filter === slug ? 'active' : ''} style={{ '--filter': color }} key={slug} onClick={() => setFilter(slug)}>{slug === 'all' ? 'All' : band.shortName || band.name}</button> })}</div></nav>

        <section className="ps-list"><div className="ps-wrap"><div className="ps-list-head ps-reveal"><h2>{filteredShows.length || 'No'} {filteredShows.length === 1 ? 'date' : 'dates'}</h2><p>{filter === 'all' ? 'All currently announced public dates.' : filterName(filter)}</p></div>{filteredShows.length ? <div className="ps-events">{filteredShows.map((show, index) => <EventCard key={show.id} show={show} index={index} />)}</div> : <div className="ps-empty">No announced dates for {filterName(filter)} yet.</div>}</div></section>

        <section className="ps-bottom"><div className="ps-wrap"><div className="ps-kicker ps-reveal">Bandsintown</div><div className="ps-follow ps-reveal">{bandsList.filter(band => band.social?.bandsintown).map(band => <a key={band.slug} href={band.social.bandsintown} target="_blank" rel="noopener noreferrer">{band.shortName || band.name}</a>)}</div></div></section>
      </main>
      <Footer />
    </>
  )
}
