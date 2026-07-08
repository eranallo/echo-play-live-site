'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const fitCards = [
  ['Clubs', 'Loud rooms. Late nights. Full-band sets.'],
  ['Theaters', 'Larger stages with a clear audience lane.'],
  ['Festivals', 'Recognizable sets for themed lineups.'],
  ['Private', 'Live music for events that need a real band.'],
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
    }, { threshold: 0.1, rootMargin: '0px 0px -44px 0px' })
    ref.current?.querySelectorAll('.hm-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link className="hm-band hm-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 70}ms` }}>
      <div className="hm-band-image">
        {image && <Image src={image} alt={`${band.name} live`} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}
      </div>
      <div className="hm-band-top"><span>0{index + 1}</span><b>{band.genre?.[0]}</b></div>
      <div className="hm-band-name"><h3>{band.name}</h3></div>
    </Link>
  )
}

export default function Home() {
  const pageRef = useReveal()
  const lead = bandsList[0]
  const support = bandsList[1]

  return (
    <>
      <Nav />
      <main ref={pageRef} className="hm-site">
        <style>{`
          .hm-site{--line:rgba(245,238,226,.16);--line-strong:rgba(245,238,226,.28);--muted:rgba(245,238,226,.58);--dim:rgba(245,238,226,.36);min-height:100vh;color:#f5eee2;background:#050505;overflow:hidden}.hm-site:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px);background-size:96px 96px;opacity:.28;mask-image:linear-gradient(to bottom,#000,transparent 80%)}.hm-site:after{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 18% 4%,rgba(212,160,23,.16),transparent 30rem),radial-gradient(circle at 80% 30%,rgba(255,255,255,.045),transparent 32rem)}.hm-wrap{width:min(1500px,calc(100vw - clamp(28px,7vw,108px)));margin:0 auto;position:relative;z-index:1}.hm-label{font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:var(--c-epl)}.hm-hero{min-height:92svh;display:grid;align-items:end;padding:clamp(118px,12vw,180px) 0 clamp(44px,7vw,82px);border-bottom:1px solid var(--line)}.hm-hero-grid{display:grid;grid-template-columns:minmax(0,.95fr) minmax(300px,1.05fr);gap:clamp(26px,5vw,80px);align-items:end}.hm-title{font-family:var(--ff-display);font-size:clamp(88px,16vw,248px);line-height:.72;letter-spacing:-.01em;margin:18px 0 20px;text-transform:uppercase}.hm-title span{display:block;color:var(--c-epl)}.hm-copy{max-width:600px;color:var(--muted);font-size:clamp(16px,1.35vw,20px);line-height:1.55}.hm-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.hm-btn{min-height:50px;display:inline-flex;align-items:center;justify-content:center;padding:0 18px;border:1px solid var(--line-strong);color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;background:#080808;transition:transform .18s ease,border-color .18s ease,color .18s ease,background .18s ease}.hm-btn:hover{transform:translateY(-2px);border-color:var(--c-epl);color:var(--c-epl)}.hm-btn-primary{background:var(--c-epl);border-color:var(--c-epl);color:#070707}.hm-btn-primary:hover{color:#070707;background:#f0c64b}.hm-collage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:560px}.hm-collage-frame{position:relative;overflow:hidden;border:1px solid var(--line);background:#111}.hm-collage-frame:first-child{grid-row:span 2}.hm-collage-frame:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.62));mix-blend-mode:multiply}.hm-collage-frame img{filter:saturate(.82) contrast(1.14)}.hm-index{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line);border-top:1px solid var(--line);background:#040404}.hm-index a{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:78px;padding:0 clamp(18px,3vw,34px);text-decoration:none;color:#f5eee2;border-right:1px solid var(--line);font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.hm-index a:last-child{border-right:0}.hm-index span{color:var(--c-epl)}.hm-section{padding:clamp(58px,8vw,112px) 0;border-bottom:1px solid var(--line)}.hm-section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,390px);gap:clamp(22px,5vw,74px);align-items:end;margin-bottom:clamp(26px,4vw,52px)}.hm-section-head h2,.hm-book h2{font-family:var(--ff-display);font-size:clamp(56px,9vw,132px);line-height:.76;letter-spacing:-.01em;text-transform:uppercase}.hm-section-head p,.hm-book p,.hm-fit p{color:var(--muted);line-height:1.62}.hm-bands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.hm-band{min-height:570px;position:relative;overflow:hidden;border:1px solid var(--line);text-decoration:none;color:#fff;background:#090909;opacity:0;transform:translateY(22px);transition:opacity .65s ease var(--delay),transform .65s ease var(--delay),border-color .18s ease}.hm-band.is-visible{opacity:1;transform:translateY(0)}.hm-band:hover{border-color:var(--band)}.hm-band-image{position:absolute;inset:0;opacity:.7;transform:scale(1.025);transition:transform .75s ease,opacity .75s ease;filter:saturate(.85) contrast(1.12)}.hm-band:hover .hm-band-image{opacity:.86;transform:scale(1.065)}.hm-band-image:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.86))}.hm-band-top{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.14);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band);background:rgba(0,0,0,.28)}.hm-band-name{position:absolute;left:0;right:0;bottom:0;padding:clamp(24px,4vw,40px)}.hm-band-name h3{font-family:var(--ff-display);font-size:clamp(58px,7.6vw,112px);line-height:.75;letter-spacing:-.01em;text-transform:uppercase}.hm-fit-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);background:var(--line)}.hm-fit{min-height:230px;background:#050505;padding:clamp(22px,3vw,34px);display:grid;align-content:end}.hm-fit span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:var(--c-epl)}.hm-fit h3{font-family:var(--ff-display);font-size:clamp(36px,4vw,58px);line-height:.84;margin:24px 0 10px;text-transform:uppercase}.hm-book{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:stretch}.hm-book-media{min-height:500px;border:1px solid var(--line);position:relative;overflow:hidden;background:#111}.hm-book-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.66))}.hm-book-card{border:1px solid var(--line);padding:clamp(28px,5vw,56px);background:#070707;display:grid;align-content:center}.hm-reveal{opacity:0;transform:translateY(22px);transition:opacity .65s ease,transform .65s ease}.hm-reveal.is-visible{opacity:1;transform:translateY(0)}@media(max-width:1080px){.hm-fit-grid{grid-template-columns:repeat(2,1fr)}.hm-index{grid-template-columns:repeat(2,1fr)}.hm-index a:nth-child(2){border-right:0}.hm-index a:nth-child(-n+2){border-bottom:1px solid var(--line)}}@media(max-width:920px){.hm-hero-grid,.hm-section-head,.hm-book{grid-template-columns:1fr}.hm-collage{min-height:420px}.hm-book-media{min-height:380px}}@media(max-width:740px){.hm-wrap{width:min(100% - 26px,1500px)}.hm-hero{min-height:auto;padding:108px 0 44px}.hm-title{font-size:clamp(72px,23vw,138px)}.hm-copy{font-size:16px}.hm-actions{display:grid;grid-template-columns:1fr}.hm-btn{width:100%}.hm-collage{margin-top:24px;grid-template-columns:1fr;min-height:auto}.hm-collage-frame{aspect-ratio:1.15}.hm-collage-frame:first-child{grid-row:auto}.hm-index{grid-template-columns:1fr}.hm-index a{border-right:0;border-bottom:1px solid var(--line);min-height:64px}.hm-index a:last-child{border-bottom:0}.hm-section{padding:50px 0}.hm-bands{grid-template-columns:1fr}.hm-band{min-height:405px}.hm-band-name h3{font-size:clamp(50px,17vw,82px)}.hm-fit-grid{grid-template-columns:1fr}.hm-fit{min-height:auto;padding:28px}.hm-book-card,.hm-book-media{min-height:auto}.hm-book-media{aspect-ratio:1.1}.hm-book h2{font-size:clamp(52px,17vw,92px)}}@media(prefers-reduced-motion:reduce){.hm-reveal,.hm-band{opacity:1;transform:none;transition:none}.hm-band-image{transition:none}}
        `}</style>

        <section className="hm-hero">
          <div className="hm-wrap hm-hero-grid">
            <div>
              <div className="hm-label hm-reveal">Fort Worth / DFW</div>
              <h1 className="hm-title hm-reveal">Echo Play <span>Live</span></h1>
              <p className="hm-copy hm-reveal">Tribute and cover bands for venues, festivals, private events, and rooms that need a real live set.</p>
              <div className="hm-actions hm-reveal"><Link className="hm-btn hm-btn-primary" href="/shows">Shows</Link><Link className="hm-btn" href="/contact">Booking</Link></div>
            </div>
            <div className="hm-collage hm-reveal" aria-hidden="true">
              <div className="hm-collage-frame">{lead.heroPhoto && <Image src={lead.heroPhoto} alt="" fill sizes="(max-width: 900px) 100vw, 42vw" style={{ objectFit: 'cover', objectPosition: lead.heroObjectPosition || 'center' }} />}</div>
              <div className="hm-collage-frame">{support.featurePhoto && <Image src={support.featurePhoto} alt="" fill sizes="(max-width: 900px) 100vw, 24vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div>
              <div className="hm-collage-frame">{support.crowdPhoto && <Image src={support.crowdPhoto} alt="" fill sizes="(max-width: 900px) 100vw, 24vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div>
            </div>
          </div>
        </section>

        <nav className="hm-index" aria-label="Homepage sections"><Link href="#roster"><span>01</span>Roster</Link><Link href="/shows"><span>02</span>Shows</Link><Link href="#booking"><span>03</span>Booking</Link><Link href="/contact"><span>04</span>Contact</Link></nav>

        <section className="hm-section" id="roster"><div className="hm-wrap"><div className="hm-section-head hm-reveal"><h2>Roster</h2><p>Four live acts. Different audiences. Different rooms.</p></div><div className="hm-bands">{bandsList.slice(0, 4).map((band, index) => <BandCard key={band.slug} band={band} index={index} />)}</div></div></section>

        <section className="hm-section"><div className="hm-wrap"><div className="hm-section-head hm-reveal"><h2>Rooms</h2><p>Book the act that fits the night.</p></div><div className="hm-fit-grid hm-reveal">{fitCards.map(([title, body], index) => <article className="hm-fit" key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

        <section className="hm-section" id="booking"><div className="hm-wrap hm-book"><div className="hm-book-media hm-reveal">{support.crowdPhoto && <Image src={support.crowdPhoto} alt="Live crowd at an Echo Play Live show" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div><article className="hm-book-card hm-reveal"><div className="hm-label">Booking</div><h2>Bring a band to the room.</h2><p>Send the venue, date, event type, and expected crowd.</p><div className="hm-actions"><Link className="hm-btn hm-btn-primary" href="/contact">Contact</Link><Link className="hm-btn" href="/shows">Shows</Link></div></article></div></section>
      </main>
      <Footer />
    </>
  )
}
