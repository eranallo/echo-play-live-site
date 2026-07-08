'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const rooms = [
  ['Clubs', 'late-night rooms, bars, music venues'],
  ['Theaters', 'ticketed stages and larger productions'],
  ['Festivals', 'themed lineups and outdoor events'],
  ['Private', 'parties, community events, corporate nights'],
]

function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' })

    ref.current?.querySelectorAll('.ed-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return ref
}

function BandPanel({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto

  return (
    <Link className="ed-artist ed-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 70}ms` }}>
      <div className="ed-artist-meta">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <b>{band.genre?.[0]}</b>
      </div>
      <div className="ed-artist-name">
        <h3>{band.name}</h3>
      </div>
      <div className="ed-artist-image">
        {image && <Image src={image} alt={`${band.name} live`} fill sizes="(max-width: 900px) 100vw, 46vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}
      </div>
      <div className="ed-artist-enter">Open</div>
    </Link>
  )
}

function Room({ item, index }) {
  return (
    <article className="ed-room ed-reveal" style={{ '--delay': `${index * 60}ms` }}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <h3>{item[0]}</h3>
      <p>{item[1]}</p>
    </article>
  )
}

export default function Home() {
  const pageRef = useReveal()
  const jambi = bandsList.find(band => band.slug === 'jambi') || bandsList[2]
  const slg = bandsList.find(band => band.slug === 'so-long-goodnight') || bandsList[0]
  const db = bandsList.find(band => band.slug === 'the-dick-beldings') || bandsList[1]
  const leadImage = jambi.heroPhoto || jambi.featurePhoto || slg.heroPhoto
  const secondImage = db.featurePhoto || db.crowdPhoto || db.heroPhoto

  return (
    <>
      <Nav />
      <main ref={pageRef} className="ed-site">
        <style>{`
          .ed-site{--paper:#f3ead8;--ink:#050505;--line:rgba(243,234,216,.14);--line-strong:rgba(243,234,216,.28);--muted:rgba(243,234,216,.62);min-height:100vh;background:#050505;color:var(--paper);overflow:hidden}.ed-site:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(243,234,216,.025) 1px,transparent 1px),linear-gradient(rgba(243,234,216,.02) 1px,transparent 1px);background-size:24px 24px;opacity:.38}.ed-site:after{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 84% 8%,rgba(212,160,23,.12),transparent 30rem),linear-gradient(180deg,transparent,rgba(0,0,0,.55));}.ed-wrap{width:min(1520px,calc(100vw - clamp(28px,7vw,112px)));margin:0 auto;position:relative;z-index:2}.ed-label{font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:var(--c-epl)}.ed-hero{position:relative;min-height:100svh;display:grid;align-items:end;border-bottom:1px solid var(--line);padding:clamp(114px,12vw,176px) 0 clamp(34px,5vw,64px)}.ed-hero-grid{display:grid;grid-template-columns:minmax(0,.94fr) minmax(360px,1.06fr);gap:clamp(24px,5vw,78px);align-items:end}.ed-hero-copy{padding-bottom:clamp(8px,3vw,34px)}.ed-title{font-family:var(--ff-display);font-size:clamp(88px,15vw,246px);line-height:.72;letter-spacing:-.012em;text-transform:uppercase;margin:18px 0 18px;max-width:980px}.ed-title span{display:block;color:var(--c-epl)}.ed-copy{max-width:560px;color:var(--muted);font-size:clamp(16px,1.35vw,20px);line-height:1.58}.ed-actions{display:flex;flex-wrap:wrap;gap:1px;margin-top:28px;width:max-content;max-width:100%;border:1px solid var(--line-strong)}.ed-btn{min-height:50px;display:inline-flex;align-items:center;justify-content:center;padding:0 18px;background:#070707;color:var(--paper);text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;border-right:1px solid var(--line-strong);transition:background .18s ease,color .18s ease}.ed-btn:last-child{border-right:0}.ed-btn:hover,.ed-btn-primary{background:var(--c-epl);color:#050505}.ed-hero-media{display:grid;grid-template-columns:1fr .62fr;gap:10px;min-height:clamp(520px,70vh,760px)}.ed-frame{position:relative;overflow:hidden;background:#111;border:1px solid var(--line);min-height:100%}.ed-frame-large{grid-row:span 2}.ed-frame-small{min-height:0}.ed-frame:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.62));}.ed-frame img{filter:saturate(.78) contrast(1.12);transform:scale(1.01);transition:transform 1.2s ease,filter .8s ease}.ed-frame:hover img{transform:scale(1.055);filter:saturate(.95) contrast(1.18)}.ed-image-label{position:absolute;z-index:2;left:14px;bottom:14px;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.72)}.ed-side-index{position:absolute;z-index:3;left:0;right:0;bottom:0;border-top:1px solid var(--line);background:rgba(5,5,5,.92);backdrop-filter:blur(14px)}.ed-side-index .ed-wrap{display:grid;grid-template-columns:repeat(4,1fr)}.ed-side-index a{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:58px;padding:0 18px;border-right:1px solid var(--line);color:var(--paper);text-decoration:none;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.ed-side-index a:last-child{border-right:0}.ed-side-index span{color:var(--c-epl)}.ed-side-index a:hover{background:var(--c-epl);color:#050505}.ed-side-index a:hover span{color:#050505}.ed-section{position:relative;z-index:2;padding:clamp(58px,8vw,108px) 0;border-bottom:1px solid var(--line)}.ed-section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,380px);gap:clamp(22px,5vw,74px);align-items:end;margin-bottom:clamp(26px,5vw,56px)}.ed-section-head h2,.ed-book h2{font-family:var(--ff-display);font-size:clamp(58px,9vw,136px);line-height:.76;letter-spacing:-.01em;text-transform:uppercase}.ed-section-head p,.ed-book p,.ed-room p{color:var(--muted);line-height:1.62}.ed-artists{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}.ed-artist{min-height:clamp(410px,54vw,660px);position:relative;overflow:hidden;text-decoration:none;color:var(--paper);background:#050505;opacity:0;transform:translateY(22px);transition:opacity .7s ease var(--delay),transform .7s ease var(--delay)}.ed-artist.is-visible{opacity:1;transform:none}.ed-artist-meta{position:absolute;z-index:3;top:0;left:0;right:0;display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,.14);padding:16px 18px;background:rgba(0,0,0,.52);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band)}.ed-artist-name{position:absolute;z-index:3;left:0;right:0;bottom:0;padding:clamp(22px,4vw,42px)}.ed-artist-name h3{font-family:var(--ff-display);font-size:clamp(54px,7.6vw,116px);line-height:.74;letter-spacing:-.01em;text-transform:uppercase;max-width:780px}.ed-artist-image{position:absolute;inset:0;opacity:.72;transition:opacity .7s ease,transform .9s ease;transform:scale(1.02)}.ed-artist-image:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.84))}.ed-artist:hover .ed-artist-image{opacity:.9;transform:scale(1.06)}.ed-artist-enter{position:absolute;z-index:4;right:18px;bottom:18px;border:1px solid var(--band);color:var(--band);padding:10px 12px;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;background:rgba(0,0,0,.45)}.ed-tour-board{display:grid;grid-template-columns:.62fr 1.38fr;border:1px solid var(--line);background:#070707}.ed-tour-cell{padding:clamp(26px,4vw,48px);border-right:1px solid var(--line);display:grid;align-content:end;min-height:330px}.ed-tour-cell h3{font-family:var(--ff-display);font-size:clamp(48px,7vw,104px);line-height:.76;text-transform:uppercase}.ed-tour-cell p{margin-top:18px;color:var(--muted);line-height:1.62;max-width:420px}.ed-tour-list{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line)}.ed-room{background:#050505;min-height:165px;padding:24px;display:grid;align-content:end;opacity:0;transform:translateY(18px);transition:opacity .65s ease var(--delay),transform .65s ease var(--delay)}.ed-room.is-visible{opacity:1;transform:none}.ed-room span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--c-epl)}.ed-room h3{font-family:var(--ff-display);font-size:clamp(34px,4vw,58px);line-height:.84;text-transform:uppercase;margin:18px 0 8px}.ed-book{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line)}.ed-book-media{position:relative;min-height:500px;background:#111;overflow:hidden}.ed-book-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(0,0,0,.72))}.ed-book-card{padding:clamp(32px,6vw,72px);background:#070707;display:grid;align-content:center}.ed-book-card h2{margin:16px 0 20px}.ed-reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}.ed-reveal.is-visible{opacity:1;transform:none}.ed-mobile-quick{display:none}.ed-site :focus-visible{outline:2px solid var(--c-epl);outline-offset:4px}@media(max-width:1020px){.ed-hero-grid,.ed-section-head,.ed-tour-board,.ed-book{grid-template-columns:1fr}.ed-hero-media{min-height:420px}.ed-tour-cell{border-right:0;border-bottom:1px solid var(--line);min-height:240px}.ed-tour-list{grid-template-columns:repeat(2,1fr)}}@media(max-width:740px){.ed-wrap{width:min(100% - 26px,1520px)}.ed-hero{min-height:auto;padding:104px 0 0;border-bottom:0}.ed-hero-grid{gap:28px}.ed-title{font-size:clamp(70px,24vw,132px);margin:14px 0 16px}.ed-copy{font-size:16px;max-width:34rem}.ed-actions{display:none}.ed-hero-media{display:grid;grid-template-columns:1fr;gap:1px;min-height:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-left:-13px;margin-right:-13px}.ed-frame{aspect-ratio:1.04;min-height:0;border-left:0;border-right:0}.ed-frame-small{display:none}.ed-side-index{position:sticky;top:0}.ed-side-index .ed-wrap{width:100%;grid-template-columns:repeat(4,1fr)}.ed-side-index a{min-height:52px;padding:0 8px;justify-content:center;border-right:1px solid var(--line);font-size:9px}.ed-side-index a span{display:none}.ed-mobile-quick{display:grid;grid-template-columns:1fr 1fr;gap:1px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--line);margin-top:24px}.ed-mobile-quick a{min-height:48px;display:grid;place-items:center;background:#070707;color:var(--paper);text-decoration:none;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.ed-mobile-quick a:first-child{background:var(--c-epl);color:#050505}.ed-section{padding:48px 0}.ed-section-head{gap:14px;margin-bottom:24px}.ed-section-head h2,.ed-book h2{font-size:clamp(50px,17vw,90px)}.ed-artists{grid-template-columns:1fr;margin-left:-13px;margin-right:-13px;border-left:0;border-right:0}.ed-artist{min-height:380px}.ed-artist-name h3{font-size:clamp(48px,16vw,78px)}.ed-artist-enter{display:none}.ed-tour-list{grid-template-columns:1fr}.ed-tour-cell{min-height:220px;padding:28px}.ed-room{min-height:138px;padding:24px}.ed-book{margin-left:-13px;margin-right:-13px;border-left:0;border-right:0}.ed-book-media{min-height:0;aspect-ratio:1.05}.ed-book-card{padding:32px 26px}.ed-book .ed-actions{display:grid;width:100%;grid-template-columns:1fr}.ed-btn{width:100%;border-right:0;border-bottom:1px solid var(--line-strong)}.ed-btn:last-child{border-bottom:0}}@media(prefers-reduced-motion:reduce){.ed-reveal,.ed-artist,.ed-room{opacity:1;transform:none;transition:none}.ed-frame img,.ed-artist-image{transition:none}}
        `}</style>

        <section className="ed-hero">
          <div className="ed-wrap ed-hero-grid">
            <div className="ed-hero-copy">
              <div className="ed-label ed-reveal">Fort Worth / DFW</div>
              <h1 className="ed-title ed-reveal">Echo Play <span>Live</span></h1>
              <p className="ed-copy ed-reveal">A live-music house for tribute and cover bands with real rooms, real crowds, and a roster built for nights people remember.</p>
              <div className="ed-actions ed-reveal"><Link className="ed-btn ed-btn-primary" href="/shows">Shows</Link><Link className="ed-btn" href="/contact">Booking</Link></div>
              <div className="ed-mobile-quick ed-reveal"><Link href="/shows">Shows</Link><Link href="/contact">Booking</Link></div>
            </div>
            <div className="ed-hero-media ed-reveal" aria-label="Echo Play Live show photography">
              <div className="ed-frame ed-frame-large">{leadImage && <Image src={leadImage} alt="Echo Play Live band on stage" fill priority sizes="(max-width: 900px) 100vw, 48vw" style={{ objectFit: 'cover', objectPosition: jambi.heroObjectPosition || 'center' }} />}<span className="ed-image-label">Live room</span></div>
              <div className="ed-frame ed-frame-small">{secondImage && <Image src={secondImage} alt="Echo Play Live crowd" fill sizes="24vw" style={{ objectFit: 'cover', objectPosition: db.heroObjectPosition || 'center' }} />}<span className="ed-image-label">Crowd</span></div>
              <div className="ed-frame ed-frame-small">{slg.featurePhoto && <Image src={slg.featurePhoto} alt="So Long Goodnight performing" fill sizes="24vw" style={{ objectFit: 'cover', objectPosition: slg.heroObjectPosition || 'center' }} />}<span className="ed-image-label">Roster</span></div>
            </div>
          </div>
          <nav className="ed-side-index" aria-label="Homepage sections"><div className="ed-wrap"><Link href="#roster"><span>01</span>Roster</Link><Link href="/shows"><span>02</span>Shows</Link><Link href="#rooms"><span>03</span>Rooms</Link><Link href="#booking"><span>04</span>Booking</Link></div></nav>
        </section>

        <section className="ed-section" id="roster">
          <div className="ed-wrap">
            <div className="ed-section-head ed-reveal"><h2>Roster</h2><p>Each band has its own lane, audience, and reason to be on the bill.</p></div>
            <div className="ed-artists">{bandsList.slice(0, 4).map((band, index) => <BandPanel key={band.slug} band={band} index={index} />)}</div>
          </div>
        </section>

        <section className="ed-section" id="rooms">
          <div className="ed-wrap ed-tour-board">
            <div className="ed-tour-cell ed-reveal"><div className="ed-label">Rooms</div><h3>Fit the night.</h3><p>Start with the room, the crowd, and the feeling you want. Then choose the act.</p></div>
            <div className="ed-tour-list">{rooms.map((item, index) => <Room key={item[0]} item={item} index={index} />)}</div>
          </div>
        </section>

        <section className="ed-section" id="booking">
          <div className="ed-wrap ed-book">
            <div className="ed-book-media ed-reveal">{secondImage && <Image src={secondImage} alt="Echo Play Live audience" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: db.heroObjectPosition || 'center' }} />}</div>
            <article className="ed-book-card ed-reveal"><div className="ed-label">Booking</div><h2>Send the date.</h2><p>Tell us the venue, date, event type, and expected crowd. We’ll help point the night in the right direction.</p><div className="ed-actions"><Link className="ed-btn ed-btn-primary" href="/contact">Contact</Link><Link className="ed-btn" href="/shows">Shows</Link></div></article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
