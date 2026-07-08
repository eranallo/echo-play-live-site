'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const VENUES = ['Granada Theater', 'Texas Live', 'Haltom Theater', 'Magnolia Motor Lounge', 'Legacy Hall', 'The Revel', 'Hurricane Alley', 'Panther Island Pavilion']
const PROCESS = [
  ['01', 'Define the world', 'Audience, era, emotion, and visual identity come first.'],
  ['02', 'Launch the campaign', 'Copy, creative, event pages, and ticket paths work together.'],
  ['03', 'Advance the room', 'Load-in, sound, merch, timing, and expectations are handled.'],
  ['04', 'Extend the night', 'Photos, clips, recaps, and future bookings keep the moment alive.'],
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' })
    ref.current?.querySelectorAll('.cx-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function useAura(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = event => {
      el.style.setProperty('--mx', `${event.clientX}px`)
      el.style.setProperty('--my', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [ref])
}

function BandWorld({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  const points = band.experiencePoints || band.genre || []
  return (
    <Link className="cx-world cx-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 110}ms` }}>
      <div className="cx-world-img">
        {image && <Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}
      </div>
      <div className="cx-world-num">0{index + 1}</div>
      <div className="cx-world-copy">
        <div className="cx-tags"><span>{band.era}</span><span>{band.genre?.[0]}</span></div>
        <h3>{band.name}</h3>
        <p>{band.experienceBody || band.description}</p>
        <div className="cx-points">{points.slice(0, 3).map(point => <b key={point}>{point}</b>)}</div>
      </div>
      <div className="cx-enter">Enter world →</div>
    </Link>
  )
}

function ProcessCard({ item, index }) {
  return <article className="cx-process-card cx-reveal" style={{ '--delay': `${index * 90}ms` }}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>
}

export default function Home() {
  const pageRef = useReveal()
  useAura(pageRef)
  const lead = bandsList[0]
  const support = bandsList[1]

  return (
    <>
      <Nav />
      <main ref={pageRef} className="cx-site">
        <style>{`
          .cx-site{--cx-line:rgba(247,240,228,.12);--cx-muted:rgba(247,240,228,.62);--cx-faint:rgba(247,240,228,.38);--mx:50vw;--my:20vh;min-height:100vh;color:#f7f0e4;background:radial-gradient(circle at var(--mx) var(--my),rgba(212,160,23,.15),transparent 18rem),radial-gradient(circle at 18% -10%,rgba(212,160,23,.22),transparent 34rem),radial-gradient(circle at 86% 18%,rgba(255,255,255,.09),transparent 28rem),linear-gradient(180deg,#111 0%,#050505 44%,#020202 100%);overflow:hidden}
          .cx-site:before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.55;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);background-size:76px 76px;mask-image:linear-gradient(to bottom,#000,transparent 82%)}
          .cx-site:after{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 42%,rgba(0,0,0,.68) 100%)}
          .cx-wrap{width:min(1560px,calc(100vw - clamp(32px,7vw,116px)));margin:0 auto;position:relative;z-index:1}.cx-kicker{display:inline-flex;align-items:center;gap:12px;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;color:var(--c-epl)}.cx-kicker:before{content:'';width:10px;height:10px;border-radius:50%;background:var(--c-epl);box-shadow:0 0 28px rgba(212,160,23,.9)}
          .cx-hero{min-height:100svh;display:grid;align-items:end;padding:clamp(122px,13vw,190px) 0 clamp(48px,7vw,92px);position:relative}.cx-hero-grid{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(340px,.82fr);gap:clamp(30px,6vw,92px);align-items:end}.cx-title{margin:18px 0 26px;font-family:var(--ff-display);font-size:clamp(82px,15.5vw,250px);line-height:.72;letter-spacing:-.018em;max-width:1120px;text-wrap:balance}.cx-title span{color:var(--c-epl);text-shadow:0 0 64px rgba(212,160,23,.25)}.cx-copy{color:var(--cx-muted);font-size:clamp(17px,1.6vw,23px);line-height:1.55;max-width:760px;text-wrap:pretty}.cx-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}.cx-button{min-height:54px;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:0 22px;border-radius:999px;border:1px solid var(--cx-line);color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:rgba(255,255,255,.025);transition:transform .25s ease,border-color .25s ease,background .25s ease}.cx-button:hover{transform:translateY(-3px);border-color:var(--c-epl);background:rgba(212,160,23,.09)}.cx-button-primary{background:var(--c-epl);border-color:var(--c-epl);color:#060606}
          .cx-orbital{min-height:560px;border:1px solid var(--cx-line);border-radius:42px;background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.022));box-shadow:0 50px 150px rgba(0,0,0,.55);backdrop-filter:blur(26px);position:relative;overflow:hidden;isolation:isolate}.cx-orbital:before{content:'';position:absolute;inset:-18%;background:radial-gradient(circle at 72% 14%,rgba(212,160,23,.26),transparent 34%),radial-gradient(circle at 24% 68%,rgba(255,255,255,.12),transparent 32%);z-index:-1}.cx-ring{position:absolute;border:1px solid rgba(212,160,23,.23);border-radius:50%;inset:52px;animation:cxFloat 8s ease-in-out infinite}.cx-ring:nth-child(2){inset:105px;opacity:.5;animation-delay:-2.4s}.cx-ring:nth-child(3){inset:160px;opacity:.32;animation-delay:-4.8s}.cx-live-card{position:absolute;left:24px;right:24px;bottom:24px;border:1px solid var(--cx-line);border-radius:30px;padding:22px;background:rgba(0,0,0,.42);backdrop-filter:blur(18px)}.cx-live-card h2{font-family:var(--ff-display);font-size:clamp(44px,5vw,72px);line-height:.8;letter-spacing:-.01em;color:var(--c-epl);margin-bottom:12px}.cx-live-card p{color:var(--cx-muted);line-height:1.55}.cx-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.cx-metrics div{border:1px solid var(--cx-line);border-radius:18px;padding:12px}.cx-metrics strong{display:block;font-family:var(--ff-display);color:#fff;font-size:34px;line-height:.82}.cx-metrics span{display:block;margin-top:8px;color:var(--cx-faint);font-size:10px;letter-spacing:.14em;text-transform:uppercase}
          .cx-marquee{position:relative;z-index:2;border-top:1px solid var(--cx-line);border-bottom:1px solid var(--cx-line);overflow:hidden;padding:22px 0;background:rgba(255,255,255,.018)}.cx-track{display:flex;gap:42px;width:max-content;white-space:nowrap;animation:cxMarquee 36s linear infinite;font-family:var(--ff-label);font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.42)}.cx-track span{display:flex;gap:42px}
          .cx-section{padding:clamp(82px,12vw,178px) 0;position:relative}.cx-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,430px);gap:clamp(26px,5vw,78px);align-items:end;margin-bottom:clamp(34px,6vw,80px)}.cx-head h2{font-family:var(--ff-display);font-size:clamp(58px,11vw,168px);line-height:.75;letter-spacing:-.015em;text-wrap:balance}.cx-head p{color:var(--cx-muted);line-height:1.65;text-wrap:pretty}.cx-story{display:grid;grid-template-columns:1fr .82fr;gap:18px}.cx-big-card{min-height:500px;border:1px solid var(--cx-line);border-radius:42px;padding:clamp(26px,4vw,48px);background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.016));position:relative;overflow:hidden;box-shadow:0 34px 130px rgba(0,0,0,.36)}.cx-big-card:after{content:'';position:absolute;inset:auto -22% -45% -22%;height:75%;background:radial-gradient(circle,rgba(212,160,23,.17),transparent 63%)}.cx-big-card h3{position:relative;z-index:1;font-family:var(--ff-display);font-size:clamp(54px,8vw,120px);line-height:.78;letter-spacing:-.012em;max-width:820px}.cx-big-card h3 span{color:var(--c-epl)}.cx-big-card p{position:relative;z-index:1;margin-top:28px;color:var(--cx-muted);line-height:1.72;max-width:620px}.cx-proof-stack{display:grid;gap:18px}.cx-proof{min-height:154px;border:1px solid var(--cx-line);border-radius:34px;padding:24px;background:rgba(255,255,255,.036)}.cx-proof strong{display:block;font-family:var(--ff-display);font-size:clamp(38px,5vw,62px);line-height:.82;color:var(--c-epl)}.cx-proof span{display:block;margin-top:14px;color:var(--cx-muted);line-height:1.45}
          .cx-worlds{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.cx-world{min-height:620px;border:1px solid var(--cx-line);border-radius:44px;overflow:hidden;position:relative;color:#fff;text-decoration:none;background:#090909;box-shadow:0 40px 140px rgba(0,0,0,.45);opacity:0;transform:translateY(36px);transition:opacity .85s ease var(--delay),transform .85s ease var(--delay),border-color .25s ease}.cx-world.is-visible{opacity:1;transform:translateY(0)}.cx-world:hover{border-color:var(--band)}.cx-world-img{position:absolute;inset:0;opacity:.6;transform:scale(1.035);filter:saturate(.85) contrast(1.12);transition:transform .9s ease,opacity .9s ease,filter .9s ease}.cx-world:hover .cx-world-img{transform:scale(1.09);opacity:.78;filter:saturate(1.05) contrast(1.14)}.cx-world-img:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.9))}.cx-world-num{position:absolute;top:24px;right:26px;font-family:var(--ff-display);font-size:86px;line-height:.75;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.24)}.cx-world-copy{position:absolute;left:0;right:0;bottom:0;padding:clamp(24px,4vw,44px)}.cx-tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.cx-tags span{border:1px solid var(--band);color:var(--band);border-radius:999px;padding:8px 11px;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;background:rgba(0,0,0,.28)}.cx-world h3{font-family:var(--ff-display);font-size:clamp(56px,8vw,118px);line-height:.76;letter-spacing:-.012em;margin-bottom:18px;max-width:780px}.cx-world p{color:rgba(255,255,255,.66);line-height:1.56;max-width:700px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.cx-points{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}.cx-points b{color:#090909;background:var(--band);border-radius:999px;padding:8px 11px;font-family:var(--ff-label);font-size:10px;letter-spacing:.14em;text-transform:uppercase}.cx-enter{position:absolute;top:28px;left:28px;color:var(--band);font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.17em;text-transform:uppercase}
          .cx-process{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.cx-process-card{min-height:330px;border:1px solid var(--cx-line);border-radius:34px;padding:24px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.014));opacity:0;transform:translateY(32px);transition:opacity .75s ease var(--delay),transform .75s ease var(--delay),background .25s ease,border-color .25s ease}.cx-process-card.is-visible{opacity:1;transform:translateY(0)}.cx-process-card:hover{border-color:rgba(212,160,23,.38);background:rgba(212,160,23,.045)}.cx-process-card span{display:block;color:var(--c-epl);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:28px}.cx-process-card h3{font-family:var(--ff-display);font-size:clamp(38px,4vw,62px);line-height:.82;margin-bottom:18px}.cx-process-card p{color:var(--cx-muted);line-height:1.58}
          .cx-booking{display:grid;grid-template-columns:.86fr 1.14fr;gap:18px;align-items:stretch}.cx-photos{min-height:620px;position:relative}.cx-photo{position:absolute;border:1px solid var(--cx-line);border-radius:38px;overflow:hidden;background:#111;box-shadow:0 32px 110px rgba(0,0,0,.45)}.cx-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(0,0,0,.42))}.cx-photo-a{inset:0 14% 18% 0;transform:rotate(-2deg)}.cx-photo-b{inset:28% 0 0 22%;transform:rotate(2deg)}.cx-book-panel{border:1px solid var(--cx-line);border-radius:44px;padding:clamp(28px,5vw,58px);background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.018));box-shadow:0 38px 140px rgba(0,0,0,.38);display:grid;align-content:center}.cx-book-panel h2{font-family:var(--ff-display);font-size:clamp(62px,10vw,154px);line-height:.75;letter-spacing:-.015em;margin:16px 0 22px}.cx-book-panel h2 span{color:var(--c-epl)}.cx-book-panel p{color:var(--cx-muted);line-height:1.68;max-width:720px}
          .cx-reveal{opacity:0;transform:translateY(34px);transition:opacity .78s ease,transform .78s ease}.cx-reveal.is-visible{opacity:1;transform:translateY(0)}@keyframes cxFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.025)}}@keyframes cxMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
          @media (max-width:1120px){.cx-hero-grid,.cx-head,.cx-story,.cx-booking{grid-template-columns:1fr}.cx-process{grid-template-columns:repeat(2,1fr)}.cx-orbital{min-height:420px}.cx-photos{min-height:520px}}@media (max-width:760px){.cx-title{font-size:clamp(76px,24vw,148px)}.cx-worlds,.cx-process,.cx-metrics{grid-template-columns:1fr}.cx-world{min-height:560px}.cx-orbital{min-height:360px}.cx-photos{display:none}.cx-wrap{width:min(100% - 28px,1560px)}}@media (prefers-reduced-motion:reduce){.cx-reveal,.cx-world,.cx-process-card,.cx-track,.cx-ring{animation:none;transition:none;opacity:1;transform:none}}
        `}</style>

        <section className="cx-hero">
          <div className="cx-wrap cx-hero-grid">
            <div>
              <div className="cx-kicker cx-reveal">DFW nostalgic live entertainment collective</div>
              <h1 className="cx-title cx-reveal">Rooms remember <span>nights.</span></h1>
              <p className="cx-copy cx-reveal">Echo Play Live builds high-impact tribute and cover experiences with the energy of the era, the polish of a production team, and the kind of crowd reaction venues want back.</p>
              <div className="cx-actions cx-reveal">
                <Link className="cx-button cx-button-primary" href="/contact">Build a night →</Link>
                <Link className="cx-button" href="/shows">See live dates</Link>
                <Link className="cx-button" href="#worlds">Enter the roster</Link>
              </div>
            </div>
            <aside className="cx-orbital cx-reveal">
              <div className="cx-ring" /><div className="cx-ring" /><div className="cx-ring" />
              <div className="cx-live-card"><h2>Live is the product.</h2><p>Audience nostalgia, band identity, campaign execution, and production discipline working together as one show system.</p><div className="cx-metrics"><div><strong>{bandsList.length}</strong><span>active worlds</span></div><div><strong>DFW</strong><span>home base</span></div><div><strong>100%</strong><span>live bands</span></div></div></div>
            </aside>
          </div>
        </section>

        <section className="cx-marquee"><div className="cx-track"><span>{VENUES.map(venue => <b key={venue}>{venue}</b>)}</span><span>{VENUES.map(venue => <b key={`${venue}-2`}>{venue}</b>)}</span></div></section>

        <section className="cx-section"><div className="cx-wrap"><div className="cx-head cx-reveal"><h2>Not cover bands. Show worlds.</h2><p>Each act is treated like a complete live entertainment product: music lane, audience promise, visual world, room behavior, campaign voice, and booking fit.</p></div><div className="cx-story"><article className="cx-big-card cx-reveal"><h3>Nostalgia with <span>production value.</span></h3><p>We are building nights people can understand in one second and talk about for a week. Warped Tour sing-alongs. 90s radio explosions. Progressive metal immersion. Heavy alternative atmosphere. The goal is simple: make the room feel like the thing fans came to remember.</p></article><div className="cx-proof-stack"><article className="cx-proof cx-reveal"><strong>Venue-ready</strong><span>Clear communication, public assets, ticket paths, and show advance details.</span></article><article className="cx-proof cx-reveal"><strong>Fan-first</strong><span>The music, copy, imagery, and calls-to-action are built around the audience reaction.</span></article><article className="cx-proof cx-reveal"><strong>Repeatable</strong><span>Every show becomes part of a larger system for marketing, media, booking, and growth.</span></article></div></div></div></section>

        <section id="worlds" className="cx-section"><div className="cx-wrap"><div className="cx-head cx-reveal"><h2>Choose your room.</h2><p>Four different audiences. Four different atmospheres. One operating system behind the scenes.</p></div><div className="cx-worlds">{bandsList.slice(0, 4).map((band, index) => <BandWorld key={band.slug} band={band} index={index} />)}</div></div></section>

        <section className="cx-section"><div className="cx-wrap"><div className="cx-head cx-reveal"><h2>The Echo engine.</h2><p>Behind the stage is a practical system for turning bands into bookable, marketable, repeatable live experiences.</p></div><div className="cx-process">{PROCESS.map((item, index) => <ProcessCard key={item[0]} item={item} index={index} />)}</div></div></section>

        <section className="cx-section"><div className="cx-wrap cx-booking"><div className="cx-photos cx-reveal"><div className="cx-photo cx-photo-a">{lead.heroPhoto && <Image src={lead.heroPhoto} alt="" fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: lead.heroObjectPosition || 'center' }} />}</div><div className="cx-photo cx-photo-b">{(support.crowdPhoto || support.featurePhoto || support.heroPhoto) && <Image src={support.crowdPhoto || support.featurePhoto || support.heroPhoto} alt="" fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div></div><article className="cx-book-panel cx-reveal"><div className="cx-kicker">For venues, festivals, private events</div><h2>Book the <span>reaction.</span></h2><p>You are not just filling a slot. You are choosing the room behavior: singing, nostalgia, heavy immersion, social proof, repeat attendance, and a show that is easier to promote because the concept is clear.</p><div className="cx-actions"><Link className="cx-button cx-button-primary" href="/contact">Start booking →</Link><Link className="cx-button" href="/shows">View announced shows</Link></div></article></div></section>
      </main>
      <Footer />
    </>
  )
}
