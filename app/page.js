'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const rooms = [
  ['01', 'Clubs', 'Late nights, close rooms, full-band energy.'],
  ['02', 'Theaters', 'Bigger stages with a clear audience lane.'],
  ['03', 'Festivals', 'Recognizable sets for themed lineups.'],
  ['04', 'Private', 'Real bands for events that need a live pulse.'],
]

function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' })

    ref.current?.querySelectorAll('.ed-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return ref
}

function BandPanel({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto

  return (
    <Link className="ed-band ed-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 80}ms` }}>
      <div className="ed-band-image">
        {image && (
          <Image
            src={image}
            alt={`${band.name} live`}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }}
          />
        )}
      </div>
      <div className="ed-band-meta">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{band.genre?.[0]}</span>
      </div>
      <div className="ed-band-title">
        <h3>{band.name}</h3>
        <span>View band</span>
      </div>
    </Link>
  )
}

export default function Home() {
  const pageRef = useReveal()
  const lead = bandsList[0]
  const support = bandsList[1]
  const third = bandsList[2]

  return (
    <>
      <Nav />
      <main ref={pageRef} className="ed-site">
        <style>{`
          .ed-site{--ink:#f4efe6;--paper:#050505;--line:rgba(244,239,230,.16);--muted:rgba(244,239,230,.58);--dim:rgba(244,239,230,.34);min-height:100vh;color:var(--ink);background:var(--paper);overflow:hidden}.ed-site:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:25vw 100%;opacity:.32}.ed-wrap{width:min(1500px,calc(100vw - clamp(28px,7vw,108px)));margin:0 auto;position:relative;z-index:1}.ed-label{font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.26em;text-transform:uppercase;color:var(--c-epl)}.ed-hero{min-height:100svh;display:grid;align-items:end;border-bottom:1px solid var(--line);padding:clamp(120px,12vw,178px) 0 clamp(38px,6vw,76px)}.ed-hero-grid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(320px,1.08fr);gap:clamp(28px,6vw,88px);align-items:end}.ed-title{font-family:var(--ff-display);font-size:clamp(86px,15vw,238px);line-height:.72;letter-spacing:-.012em;text-transform:uppercase;margin:18px 0 24px}.ed-title span{display:block;color:var(--c-epl)}.ed-copy{max-width:600px;color:var(--muted);font-size:clamp(16px,1.35vw,20px);line-height:1.58}.ed-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.ed-button{min-height:50px;display:inline-flex;align-items:center;justify-content:center;padding:0 18px;border:1px solid var(--line);background:#080808;color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.ed-button:hover{border-color:var(--c-epl);color:var(--c-epl)}.ed-button-primary{background:var(--c-epl);border-color:var(--c-epl);color:#050505}.ed-button-primary:hover{color:#050505}.ed-covers{display:grid;grid-template-columns:1.1fr .9fr;grid-template-rows:1fr 1fr;gap:10px;min-height:580px}.ed-cover{position:relative;overflow:hidden;border:1px solid var(--line);background:#111}.ed-cover:first-child{grid-row:span 2}.ed-cover:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 36%,rgba(0,0,0,.72))}.ed-cover img{filter:saturate(.86) contrast(1.12)}.ed-cover-caption{position:absolute;z-index:2;left:18px;right:18px;bottom:16px;display:flex;justify-content:space-between;gap:16px;color:rgba(255,255,255,.62);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.ed-strip{position:relative;z-index:2;border-bottom:1px solid var(--line);background:#050505}.ed-strip-inner{width:min(1500px,calc(100vw - clamp(28px,7vw,108px)));margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr)}.ed-strip a{min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:0 clamp(16px,2.5vw,28px);border-left:1px solid var(--line);color:var(--ink);text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.ed-strip a:last-child{border-right:1px solid var(--line)}.ed-strip span{color:var(--c-epl)}.ed-section{position:relative;z-index:1;padding:clamp(58px,8vw,112px) 0;border-bottom:1px solid var(--line)}.ed-section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,390px);gap:clamp(24px,5vw,76px);align-items:end;margin-bottom:clamp(28px,4.5vw,56px)}.ed-section-head h2,.ed-book h2{font-family:var(--ff-display);font-size:clamp(58px,9vw,132px);line-height:.76;letter-spacing:-.01em;text-transform:uppercase}.ed-section-head p,.ed-book p,.ed-room p{color:var(--muted);line-height:1.62}.ed-bands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ed-band{position:relative;min-height:590px;border:1px solid var(--line);background:#090909;overflow:hidden;text-decoration:none;color:#fff;opacity:0;transform:translateY(24px);transition:opacity .68s ease var(--delay),transform .68s ease var(--delay),border-color .18s ease}.ed-band.is-visible{opacity:1;transform:translateY(0)}.ed-band:hover{border-color:var(--band)}.ed-band-image{position:absolute;inset:0;opacity:.72;filter:saturate(.84) contrast(1.12);transform:scale(1.02);transition:transform .75s ease,opacity .75s ease}.ed-band:hover .ed-band-image{transform:scale(1.06);opacity:.86}.ed-band-image:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.86))}.ed-band-meta{position:absolute;top:0;left:0;right:0;z-index:2;display:flex;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.14);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band);background:rgba(0,0,0,.38)}.ed-band-title{position:absolute;z-index:2;left:0;right:0;bottom:0;padding:clamp(24px,4vw,42px)}.ed-band-title h3{font-family:var(--ff-display);font-size:clamp(58px,7.5vw,112px);line-height:.74;letter-spacing:-.01em;text-transform:uppercase;margin:0 0 18px}.ed-band-title span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band)}.ed-room-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);background:var(--line)}.ed-room{min-height:240px;background:#050505;padding:clamp(22px,3vw,34px);display:grid;align-content:end}.ed-room span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:var(--c-epl)}.ed-room h3{font-family:var(--ff-display);font-size:clamp(36px,4vw,58px);line-height:.84;margin:24px 0 10px;text-transform:uppercase}.ed-book{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ed-book-media{position:relative;min-height:520px;border:1px solid var(--line);overflow:hidden;background:#111}.ed-book-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.72))}.ed-book-card{border:1px solid var(--line);background:#070707;padding:clamp(30px,5vw,58px);display:grid;align-content:center}.ed-reveal{opacity:0;transform:translateY(26px);transition:opacity .72s ease,transform .72s ease}.ed-reveal.is-visible{opacity:1;transform:translateY(0)}@media(max-width:1080px){.ed-room-grid{grid-template-columns:repeat(2,1fr)}.ed-strip-inner{grid-template-columns:repeat(2,1fr)}.ed-strip a:nth-child(-n+2){border-bottom:1px solid var(--line)}}@media(max-width:920px){.ed-hero-grid,.ed-section-head,.ed-book{grid-template-columns:1fr}.ed-covers{min-height:440px}.ed-book-media{min-height:380px}}@media(max-width:740px){.ed-wrap,.ed-strip-inner{width:min(100% - 26px,1500px)}.ed-site:before{background-size:50vw 100%;opacity:.22}.ed-hero{min-height:auto;padding:108px 0 44px}.ed-title{font-size:clamp(72px,23vw,138px)}.ed-copy{font-size:16px}.ed-actions{display:grid;grid-template-columns:1fr}.ed-button{width:100%}.ed-covers{margin-top:24px;grid-template-columns:1fr;grid-template-rows:auto;min-height:auto}.ed-cover{aspect-ratio:1.12}.ed-cover:first-child{grid-row:auto}.ed-strip-inner{grid-template-columns:1fr}.ed-strip a{min-height:62px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}.ed-strip a:last-child{border-bottom:0}.ed-section{padding:50px 0}.ed-bands{grid-template-columns:1fr}.ed-band{min-height:420px}.ed-band-title h3{font-size:clamp(50px,17vw,82px)}.ed-room-grid{grid-template-columns:1fr}.ed-room{min-height:auto;padding:28px}.ed-book-media{aspect-ratio:1.05;min-height:auto}.ed-book h2{font-size:clamp(52px,17vw,92px)}}@media(prefers-reduced-motion:reduce){.ed-reveal,.ed-band{opacity:1;transform:none;transition:none}.ed-band-image{transition:none}}
        `}</style>

        <section className="ed-hero">
          <div className="ed-wrap ed-hero-grid">
            <div>
              <div className="ed-label ed-reveal">Fort Worth / DFW</div>
              <h1 className="ed-title ed-reveal">Echo Play <span>Live</span></h1>
              <p className="ed-copy ed-reveal">Tribute and cover bands for venues, festivals, private events, and rooms that need a real live set.</p>
              <div className="ed-actions ed-reveal">
                <Link className="ed-button ed-button-primary" href="/shows">Shows</Link>
                <Link className="ed-button" href="/contact">Booking</Link>
              </div>
            </div>
            <div className="ed-covers ed-reveal" aria-label="Echo Play Live bands">
              <div className="ed-cover">
                {lead.heroPhoto && <Image src={lead.heroPhoto} alt={`${lead.name} live`} fill priority sizes="(max-width: 900px) 100vw, 44vw" style={{ objectFit: 'cover', objectPosition: lead.heroObjectPosition || 'center' }} />}
                <div className="ed-cover-caption"><span>{lead.name}</span><span>{lead.genre?.[0]}</span></div>
              </div>
              <div className="ed-cover">
                {support.featurePhoto && <Image src={support.featurePhoto} alt={`${support.name} live`} fill sizes="(max-width: 900px) 100vw, 24vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}
                <div className="ed-cover-caption"><span>{support.shortName || support.name}</span><span>{support.genre?.[0]}</span></div>
              </div>
              <div className="ed-cover">
                {third.featurePhoto && <Image src={third.featurePhoto} alt={`${third.name} live`} fill sizes="(max-width: 900px) 100vw, 24vw" style={{ objectFit: 'cover', objectPosition: third.heroObjectPosition || 'center' }} />}
                <div className="ed-cover-caption"><span>{third.shortName || third.name}</span><span>{third.genre?.[0]}</span></div>
              </div>
            </div>
          </div>
        </section>

        <nav className="ed-strip" aria-label="Homepage sections">
          <div className="ed-strip-inner">
            <Link href="#roster"><span>01</span>Roster</Link>
            <Link href="/shows"><span>02</span>Shows</Link>
            <Link href="#booking"><span>03</span>Booking</Link>
            <Link href="/contact"><span>04</span>Contact</Link>
          </div>
        </nav>

        <section className="ed-section" id="roster">
          <div className="ed-wrap">
            <div className="ed-section-head ed-reveal">
              <h2>Roster</h2>
              <p>Four live acts. Different audiences. Different rooms.</p>
            </div>
            <div className="ed-bands">
              {bandsList.slice(0, 4).map((band, index) => <BandPanel key={band.slug} band={band} index={index} />)}
            </div>
          </div>
        </section>

        <section className="ed-section">
          <div className="ed-wrap">
            <div className="ed-section-head ed-reveal">
              <h2>Rooms</h2>
              <p>Book the act that fits the night.</p>
            </div>
            <div className="ed-room-grid ed-reveal">
              {rooms.map(([number, title, body]) => (
                <article className="ed-room" key={title}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ed-section" id="booking">
          <div className="ed-wrap ed-book">
            <div className="ed-book-media ed-reveal">
              {support.crowdPhoto && <Image src={support.crowdPhoto} alt="Live crowd at an Echo Play Live show" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}
            </div>
            <article className="ed-book-card ed-reveal">
              <div className="ed-label">Booking</div>
              <h2>Bring a band to the room.</h2>
              <p>Send the venue, date, event type, and expected crowd.</p>
              <div className="ed-actions">
                <Link className="ed-button ed-button-primary" href="/contact">Contact</Link>
                <Link className="ed-button" href="/shows">Shows</Link>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
