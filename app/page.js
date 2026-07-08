'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const marquee = ['ECHO PLAY LIVE', 'DFW', 'TRIBUTE BANDS', 'COVER BANDS', 'LIVE ROOMS', 'BOOKING']
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
    ref.current?.querySelectorAll('.mx-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function useMotionField(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const move = event => {
      const x = event.clientX / window.innerWidth
      const y = event.clientY / window.innerHeight
      el.style.setProperty('--mx', `${event.clientX}px`)
      el.style.setProperty('--my', `${event.clientY}px`)
      el.style.setProperty('--tilt-x', `${(y - .5) * -10}deg`)
      el.style.setProperty('--tilt-y', `${(x - .5) * 10}deg`)
    }

    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [ref])
}

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link className="mx-band mx-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 85}ms` }}>
      <div className="mx-band-noise" />
      <div className="mx-band-image">
        {image && <Image src={image} alt={`${band.name} live`} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}
      </div>
      <div className="mx-band-top"><span>0{index + 1}</span><b>{band.genre?.[0]}</b></div>
      <div className="mx-band-name"><h3 data-text={band.name}>{band.name}</h3></div>
      <div className="mx-band-action">Enter →</div>
    </Link>
  )
}

export default function Home() {
  const pageRef = useReveal()
  useMotionField(pageRef)
  const lead = bandsList[0]
  const support = bandsList[1]
  const jambi = bandsList.find(band => band.slug === 'jambi') || bandsList[2]

  return (
    <>
      <Nav />
      <main ref={pageRef} className="mx-site">
        <style>{`
          .mx-site{--line:rgba(245,238,226,.16);--line-strong:rgba(245,238,226,.3);--muted:rgba(245,238,226,.6);--dim:rgba(245,238,226,.38);--mx:50vw;--my:20vh;--tilt-x:0deg;--tilt-y:0deg;min-height:100vh;color:#f5eee2;background:#030303;overflow:hidden;perspective:1200px}.mx-site:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px);background-size:92px 92px;opacity:.3;mask-image:linear-gradient(to bottom,#000,transparent 84%);animation:mxGrid 18s linear infinite}.mx-site:after{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at var(--mx) var(--my),rgba(212,160,23,.22),transparent 18rem),radial-gradient(circle at 82% 20%,rgba(255,255,255,.05),transparent 28rem);mix-blend-mode:screen}.mx-noise{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:.09;background-image:repeating-radial-gradient(circle at 20% 20%,rgba(255,255,255,.9) 0 1px,transparent 1px 4px);animation:mxNoise .6s steps(2,end) infinite;mix-blend-mode:screen}.mx-scan{position:fixed;inset:0;z-index:3;pointer-events:none;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.045),transparent);height:40vh;animation:mxScan 5.5s linear infinite;opacity:.25}.mx-wrap{width:min(1500px,calc(100vw - clamp(28px,7vw,108px)));margin:0 auto;position:relative;z-index:5}.mx-label{font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:var(--c-epl)}.mx-hero{min-height:96svh;display:grid;align-items:end;padding:clamp(116px,12vw,180px) 0 clamp(42px,7vw,82px);border-bottom:1px solid var(--line);position:relative}.mx-hero:before{content:'LIVE / LOUD / DFW';position:absolute;left:50%;top:18%;transform:translateX(-50%);font-family:var(--ff-display);font-size:18vw;line-height:.72;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.06);white-space:nowrap;z-index:1;animation:mxDrift 18s ease-in-out infinite}.mx-hero-grid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(300px,1.08fr);gap:clamp(26px,5vw,80px);align-items:end}.mx-title{font-family:var(--ff-display);font-size:clamp(90px,16vw,260px);line-height:.69;letter-spacing:-.01em;margin:18px 0 20px;text-transform:uppercase;position:relative;text-shadow:0 0 48px rgba(212,160,23,.08)}.mx-title span{display:block;color:var(--c-epl);position:relative}.mx-title span:before,.mx-title span:after{content:attr(data-text);position:absolute;inset:0;pointer-events:none;opacity:0}.mx-title span:before{color:#ff3d3d;transform:translateX(-3px);animation:mxGlitch 4.2s infinite}.mx-title span:after{color:#33d6ff;transform:translateX(3px);animation:mxGlitch 3.7s infinite reverse}.mx-copy{max-width:600px;color:var(--muted);font-size:clamp(16px,1.35vw,20px);line-height:1.55}.mx-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.mx-btn{min-height:50px;display:inline-flex;align-items:center;justify-content:center;padding:0 18px;border:1px solid var(--line-strong);color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;background:#080808;transition:transform .18s ease,border-color .18s ease,color .18s ease,background .18s ease,box-shadow .18s ease}.mx-btn:hover{transform:translateY(-2px) skewX(-5deg);border-color:var(--c-epl);color:var(--c-epl);box-shadow:0 0 30px rgba(212,160,23,.16)}.mx-btn-primary{background:var(--c-epl);border-color:var(--c-epl);color:#070707}.mx-btn-primary:hover{color:#070707;background:#f0c64b}.mx-collage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:570px;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y));transform-style:preserve-3d;transition:transform .18s ease}.mx-frame{position:relative;overflow:hidden;border:1px solid var(--line);background:#111;isolation:isolate}.mx-frame:first-child{grid-row:span 2;transform:translateZ(34px)}.mx-frame:nth-child(2){transform:translateZ(18px)}.mx-frame:nth-child(3){transform:translateZ(54px)}.mx-frame:before{content:'';position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:translateX(-120%);animation:mxShine 4.5s ease-in-out infinite}.mx-frame:after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.7));mix-blend-mode:multiply}.mx-frame img{filter:saturate(.82) contrast(1.16);transform:scale(1.04);animation:mxPhoto 12s ease-in-out infinite alternate}.mx-frame:nth-child(2) img{animation-delay:-3s}.mx-frame:nth-child(3) img{animation-delay:-7s}.mx-marquee{position:relative;z-index:6;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#050505;overflow:hidden}.mx-track{display:flex;width:max-content;gap:40px;padding:16px 0;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.48);animation:mxMarquee 24s linear infinite}.mx-track span{display:flex;gap:40px}.mx-track b{color:var(--c-epl)}.mx-index{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line);background:#040404;position:relative;z-index:6}.mx-index a{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:82px;padding:0 clamp(18px,3vw,34px);text-decoration:none;color:#f5eee2;border-right:1px solid var(--line);font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;overflow:hidden}.mx-index a:before{content:'';position:absolute;inset:0;background:var(--c-epl);transform:translateY(100%);transition:transform .22s ease;z-index:-1}.mx-index a:hover:before{transform:translateY(0)}.mx-index a:hover{color:#050505}.mx-index a:last-child{border-right:0}.mx-index span{color:var(--c-epl)}.mx-index a:hover span{color:#050505}.mx-section{padding:clamp(58px,8vw,112px) 0;border-bottom:1px solid var(--line);position:relative}.mx-section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,390px);gap:clamp(22px,5vw,74px);align-items:end;margin-bottom:clamp(26px,4vw,52px)}.mx-section-head h2,.mx-book h2{font-family:var(--ff-display);font-size:clamp(58px,9vw,138px);line-height:.74;letter-spacing:-.01em;text-transform:uppercase}.mx-section-head p,.mx-book p,.mx-fit p{color:var(--muted);line-height:1.62}.mx-bands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mx-band{min-height:590px;position:relative;overflow:hidden;border:1px solid var(--line);text-decoration:none;color:#fff;background:#090909;opacity:0;transform:translateY(22px);transition:opacity .65s ease var(--delay),transform .65s ease var(--delay),border-color .18s ease,clip-path .35s ease;clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}.mx-band.is-visible{opacity:1;transform:translateY(0)}.mx-band:hover{border-color:var(--band);clip-path:polygon(3% 0,100% 0,97% 100%,0 100%)}.mx-band-noise{position:absolute;inset:0;z-index:4;opacity:0;background:repeating-linear-gradient(0deg,transparent 0 7px,rgba(255,255,255,.12) 8px);mix-blend-mode:screen;pointer-events:none}.mx-band:hover .mx-band-noise{opacity:.16;animation:mxNoise .35s steps(2,end) infinite}.mx-band-image{position:absolute;inset:0;opacity:.72;transform:scale(1.03);transition:transform .75s ease,opacity .75s ease,filter .75s ease;filter:saturate(.82) contrast(1.14)}.mx-band:hover .mx-band-image{opacity:.9;transform:scale(1.08) rotate(.6deg);filter:saturate(1) contrast(1.2)}.mx-band-image:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.86))}.mx-band-top{position:absolute;z-index:5;top:0;left:0;right:0;display:flex;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.14);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band);background:rgba(0,0,0,.38)}.mx-band-name{position:absolute;z-index:5;left:0;right:0;bottom:0;padding:clamp(24px,4vw,40px)}.mx-band-name h3{font-family:var(--ff-display);font-size:clamp(60px,7.8vw,118px);line-height:.72;letter-spacing:-.01em;text-transform:uppercase;position:relative}.mx-band:hover h3:before{content:attr(data-text);position:absolute;inset:0;color:var(--band);transform:translate(4px,-3px);opacity:.45;mix-blend-mode:screen}.mx-band-action{position:absolute;right:18px;bottom:18px;z-index:6;color:var(--band);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;opacity:0;transform:translateX(12px);transition:opacity .2s ease,transform .2s ease}.mx-band:hover .mx-band-action{opacity:1;transform:none}.mx-fit-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);background:var(--line)}.mx-fit{min-height:235px;background:#050505;padding:clamp(22px,3vw,34px);display:grid;align-content:end;position:relative;overflow:hidden}.mx-fit:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(212,160,23,.12),transparent);transform:translateX(-120%);transition:transform .4s ease}.mx-fit:hover:before{transform:translateX(120%)}.mx-fit span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:var(--c-epl)}.mx-fit h3{font-family:var(--ff-display);font-size:clamp(36px,4vw,58px);line-height:.84;margin:24px 0 10px;text-transform:uppercase}.mx-book{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:stretch}.mx-book-media{min-height:520px;border:1px solid var(--line);position:relative;overflow:hidden;background:#111}.mx-book-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.7))}.mx-book-media img{filter:saturate(.85) contrast(1.18);animation:mxPhoto 14s ease-in-out infinite alternate}.mx-book-card{border:1px solid var(--line);padding:clamp(28px,5vw,56px);background:#070707;display:grid;align-content:center;position:relative;overflow:hidden}.mx-book-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 20%,rgba(212,160,23,.16),transparent 32rem);animation:mxPulse 3.8s ease-in-out infinite}.mx-book-card>*{position:relative;z-index:1}.mx-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}.mx-reveal.is-visible{opacity:1;transform:translateY(0)}@keyframes mxGrid{from{background-position:0 0,0 0}to{background-position:92px 92px,92px 92px}}@keyframes mxNoise{0%{transform:translate(0)}25%{transform:translate(-2%,1%)}50%{transform:translate(1%,-2%)}75%{transform:translate(2%,2%)}100%{transform:translate(0)}}@keyframes mxScan{from{transform:translateY(-45vh)}to{transform:translateY(120vh)}}@keyframes mxDrift{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-47%) translateY(18px)}}@keyframes mxGlitch{0%,92%,100%{opacity:0;clip-path:inset(0)}93%{opacity:.75;clip-path:inset(0 0 70% 0)}94%{opacity:.45;clip-path:inset(45% 0 20% 0)}95%{opacity:.8;clip-path:inset(75% 0 0 0)}}@keyframes mxPhoto{from{transform:scale(1.04)}to{transform:scale(1.13) translate3d(-1.5%,1%,0)}}@keyframes mxShine{0%,55%{transform:translateX(-120%)}72%,100%{transform:translateX(120%)}}@keyframes mxMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes mxPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.8;transform:scale(1.08)}}@media(max-width:1080px){.mx-fit-grid{grid-template-columns:repeat(2,1fr)}.mx-index{grid-template-columns:repeat(2,1fr)}.mx-index a:nth-child(2){border-right:0}.mx-index a:nth-child(-n+2){border-bottom:1px solid var(--line)}}@media(max-width:920px){.mx-hero-grid,.mx-section-head,.mx-book{grid-template-columns:1fr}.mx-collage{min-height:420px}.mx-book-media{min-height:380px}}@media(max-width:740px){.mx-wrap{width:min(100% - 26px,1500px)}.mx-hero{min-height:auto;padding:108px 0 44px}.mx-hero:before{font-size:32vw;top:10%;opacity:.8}.mx-title{font-size:clamp(72px,23vw,138px)}.mx-copy{font-size:16px}.mx-actions{display:grid;grid-template-columns:1fr}.mx-btn{width:100%}.mx-collage{margin-top:24px;grid-template-columns:1fr;min-height:auto;transform:none}.mx-frame{aspect-ratio:1.15}.mx-frame:first-child{grid-row:auto}.mx-frame:nth-child(n){transform:none}.mx-marquee .mx-track{animation-duration:18s}.mx-index{grid-template-columns:1fr}.mx-index a{border-right:0;border-bottom:1px solid var(--line);min-height:64px}.mx-index a:last-child{border-bottom:0}.mx-section{padding:50px 0}.mx-bands{grid-template-columns:1fr}.mx-band{min-height:420px}.mx-band-name h3{font-size:clamp(50px,17vw,82px)}.mx-fit-grid{grid-template-columns:1fr}.mx-fit{min-height:auto;padding:28px}.mx-book-media{aspect-ratio:1.08;min-height:auto}.mx-book h2{font-size:clamp(52px,17vw,92px)}}@media(prefers-reduced-motion:reduce){.mx-site:before,.mx-noise,.mx-scan,.mx-hero:before,.mx-title span:before,.mx-title span:after,.mx-frame:before,.mx-frame img,.mx-track,.mx-band-noise,.mx-book-media img,.mx-book-card:before{animation:none}.mx-reveal,.mx-band{opacity:1;transform:none;transition:none}.mx-collage{transform:none}.mx-band-image{transition:none}}
        `}</style>
        <div className="mx-noise" aria-hidden="true" />
        <div className="mx-scan" aria-hidden="true" />

        <section className="mx-hero">
          <div className="mx-wrap mx-hero-grid">
            <div>
              <div className="mx-label mx-reveal">Fort Worth / DFW</div>
              <h1 className="mx-title mx-reveal">Echo Play <span data-text="Live">Live</span></h1>
              <p className="mx-copy mx-reveal">Tribute and cover bands for venues, festivals, private events, and rooms that need a real live set.</p>
              <div className="mx-actions mx-reveal"><Link className="mx-btn mx-btn-primary" href="/shows">Shows</Link><Link className="mx-btn" href="/contact">Booking</Link></div>
            </div>
            <div className="mx-collage mx-reveal" aria-hidden="true">
              <div className="mx-frame">{lead.heroPhoto && <Image src={lead.heroPhoto} alt="" fill sizes="(max-width: 900px) 100vw, 42vw" style={{ objectFit: 'cover', objectPosition: lead.heroObjectPosition || 'center' }} />}</div>
              <div className="mx-frame">{support.featurePhoto && <Image src={support.featurePhoto} alt="" fill sizes="(max-width: 900px) 100vw, 24vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div>
              <div className="mx-frame">{jambi.featurePhoto && <Image src={jambi.featurePhoto} alt="" fill sizes="(max-width: 900px) 100vw, 24vw" style={{ objectFit: 'cover', objectPosition: jambi.heroObjectPosition || 'center' }} />}</div>
            </div>
          </div>
        </section>

        <section className="mx-marquee" aria-label="Echo Play Live keywords"><div className="mx-track"><span>{marquee.map((item, idx) => <b key={`${item}-${idx}`}>{item}</b>)}</span><span>{marquee.map((item, idx) => <b key={`${item}-again-${idx}`}>{item}</b>)}</span></div></section>

        <nav className="mx-index" aria-label="Homepage sections"><Link href="#roster"><span>01</span>Roster</Link><Link href="/shows"><span>02</span>Shows</Link><Link href="#booking"><span>03</span>Booking</Link><Link href="/contact"><span>04</span>Contact</Link></nav>

        <section className="mx-section" id="roster"><div className="mx-wrap"><div className="mx-section-head mx-reveal"><h2>Roster</h2><p>Four live acts. Different audiences. Different rooms.</p></div><div className="mx-bands">{bandsList.slice(0, 4).map((band, index) => <BandCard key={band.slug} band={band} index={index} />)}</div></div></section>

        <section className="mx-section"><div className="mx-wrap"><div className="mx-section-head mx-reveal"><h2>Rooms</h2><p>Book the act that fits the night.</p></div><div className="mx-fit-grid mx-reveal">{fitCards.map(([title, body], index) => <article className="mx-fit" key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

        <section className="mx-section" id="booking"><div className="mx-wrap mx-book"><div className="mx-book-media mx-reveal">{support.crowdPhoto && <Image src={support.crowdPhoto} alt="Live crowd at an Echo Play Live show" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div><article className="mx-book-card mx-reveal"><div className="mx-label">Booking</div><h2>Bring a band to the room.</h2><p>Send the venue, date, event type, and expected crowd.</p><div className="mx-actions"><Link className="mx-btn mx-btn-primary" href="/contact">Contact</Link><Link className="mx-btn" href="/shows">Shows</Link></div></article></div></section>
      </main>
      <Footer />
    </>
  )
}
