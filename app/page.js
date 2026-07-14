'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const pillars = [
  ['01', 'Professional production', 'A polished, venue-ready experience from advance through show day.'],
  ['02', 'Crowd-first shows', 'Every set is built around recognition, momentum, and participation.'],
  ['03', 'Regional touring acts', 'A focused roster built to travel across Texas and surrounding markets.'],
  ['04', 'Easy booking', 'Clear communication, organized assets, and a straightforward path to contract.'],
]

function useReveal() {
  const root = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
    }, { threshold: 0.12, rootMargin: '0px 0px -56px' })
    root.current?.querySelectorAll('.cin-reveal').forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])
  return root
}

function Poster({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link href={`/bands/${band.slug}`} className="cin-poster cin-reveal" style={{ '--accent': band.color || '#d4a017', '--delay': `${index * 70}ms` }}>
      <div className="cin-poster-image">{image && <Image src={image} alt={`${band.name} live`} fill sizes="(max-width: 760px) 86vw, 30vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}</div>
      <div className="cin-poster-shine" />
      <div className="cin-poster-top"><span>{String(index + 1).padStart(2, '0')}</span><span>{band.genre?.[0] || 'Live'}</span></div>
      <div className="cin-poster-copy"><small>Echo Play Live presents</small><h3>{band.name}</h3><span>Enter the room →</span></div>
    </Link>
  )
}

export default function Home() {
  const root = useReveal()
  const [pointer, setPointer] = useState({ x: 50, y: 42 })
  const featured = useMemo(() => bandsList.find(b => b.slug === 'so-long-goodnight') || bandsList[0], [])
  const heroImage = featured?.heroPhoto || featured?.featurePhoto || featured?.crowdPhoto

  return (
    <>
      <Nav />
      <main ref={root} className="cin-site" onPointerMove={event => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({ x: ((event.clientX - rect.left) / rect.width) * 100, y: Math.min(100, Math.max(0, (event.clientY / window.innerHeight) * 100)) })
      }} style={{ '--mx': `${pointer.x}%`, '--my': `${pointer.y}%` }}>
        <section className="cin-hero">
          <div className="cin-hero-bg">{heroImage && <Image src={heroImage} alt="Echo Play Live concert" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: featured.heroObjectPosition || 'center' }} />}</div>
          <div className="cin-noise" /><div className="cin-beam cin-beam-a" /><div className="cin-beam cin-beam-b" /><div className="cin-haze" />
          <div className="cin-hero-inner">
            <p className="cin-kicker cin-reveal">Fort Worth / DFW — Live entertainment</p>
            <h1 className="cin-title cin-reveal"><span>Feel it</span><strong>before</strong><span>the lights</span><em>go down.</em></h1>
            <div className="cin-hero-bottom cin-reveal">
              <p>Premium tribute bands, nostalgia-driven cover acts, and themed live experiences built for nights people remember.</p>
              <div className="cin-actions"><Link href="/shows" className="cin-btn cin-primary">Get tickets</Link><Link href="/contact" className="cin-btn">Book a band</Link></div>
            </div>
          </div>
          <div className="cin-scroll">Scroll to enter <span>↓</span></div>
        </section>

        <section className="cin-marquee">
          <div className="cin-marquee-track">LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE · LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE ·</div>
        </section>

        <section className="cin-section cin-featured">
          <div className="cin-wrap cin-feature-grid">
            <div className="cin-feature-copy cin-reveal"><span className="cin-eyebrow">Featured experience</span><h2>{featured?.name}</h2><p>{featured?.tagline || 'A live show designed around the songs, energy, and memories that bring a room together.'}</p><Link href={`/bands/${featured?.slug}`} className="cin-text-link">Explore the band →</Link></div>
            <div className="cin-feature-card cin-reveal">{heroImage && <Image src={heroImage} alt={`${featured?.name} performing`} fill sizes="(max-width: 900px) 100vw, 55vw" style={{ objectFit: 'cover', objectPosition: featured.heroObjectPosition || 'center' }} />}<div className="cin-feature-frame" /><span>Now entering</span></div>
          </div>
        </section>

        <section className="cin-section cin-roster" id="bands">
          <div className="cin-wrap"><div className="cin-heading cin-reveal"><span className="cin-eyebrow">The roster</span><h2>Seven rooms.<br />Seven reasons to stay.</h2><p>Each act has its own atmosphere, audience, and point of view.</p></div></div>
          <div className="cin-poster-rail">{bandsList.slice(0, 7).map((band, index) => <Poster key={band.slug} band={band} index={index} />)}</div>
        </section>

        <section className="cin-section cin-trust">
          <div className="cin-wrap"><div className="cin-heading cin-reveal"><span className="cin-eyebrow">Why Echo Play</span><h2>The show starts<br />before showtime.</h2></div><div className="cin-pillars">{pillars.map(([n, title, copy], i) => <article key={title} className="cin-pillar cin-reveal" style={{ '--delay': `${i * 70}ms` }}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
        </section>

        <section className="cin-book">
          <div className="cin-book-glow" /><div className="cin-wrap cin-book-inner cin-reveal"><span className="cin-eyebrow">Bring the room to life</span><h2>Send the date.<br />We’ll build the night.</h2><p>Tell us the venue, city, audience, and experience you want to create.</p><div className="cin-actions"><Link href="/contact" className="cin-btn cin-primary">Start a booking</Link><Link href="/bands" className="cin-btn">View the roster</Link></div></div>
        </section>

        <style>{`
          .cin-site{--gold:#d4a017;--cream:#f3ead8;--line:rgba(243,234,216,.16);background:#050505;color:var(--cream);overflow:hidden}.cin-wrap{width:min(1480px,calc(100vw - clamp(28px,7vw,112px)));margin:auto}.cin-hero{min-height:100svh;position:relative;display:grid;align-items:end;isolation:isolate;background:#070707}.cin-hero-bg{position:absolute;inset:0;z-index:-5;overflow:hidden}.cin-hero-bg img{filter:saturate(.55) contrast(1.22) brightness(.55);transform:scale(1.07)}.cin-hero-bg:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.88) 0%,rgba(0,0,0,.35) 52%,rgba(0,0,0,.62)),linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.88))}.cin-noise{position:absolute;inset:0;z-index:-1;opacity:.14;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E")}.cin-haze{position:absolute;inset:0;z-index:-2;background:radial-gradient(circle at var(--mx) var(--my),rgba(212,160,23,.18),transparent 25rem);transition:background .2s linear}.cin-beam{position:absolute;top:-25%;width:14vw;height:125%;z-index:-2;background:linear-gradient(180deg,rgba(243,234,216,.16),transparent 74%);filter:blur(20px);transform-origin:top;opacity:.55;animation:beam 9s ease-in-out infinite alternate}.cin-beam-a{left:18%;transform:rotate(-14deg)}.cin-beam-b{right:16%;transform:rotate(16deg);animation-delay:-4s}.cin-hero-inner{width:min(1480px,calc(100vw - clamp(28px,7vw,112px)));margin:auto;padding:150px 0 84px}.cin-kicker,.cin-eyebrow{font:900 10px/1 var(--ff-label);letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}.cin-title{font-family:var(--ff-display);font-size:clamp(72px,12.6vw,210px);line-height:.72;letter-spacing:-.02em;text-transform:uppercase;margin:20px 0 34px;max-width:1250px}.cin-title span,.cin-title strong,.cin-title em{display:block}.cin-title strong{font-weight:inherit;color:var(--gold);padding-left:12vw}.cin-title em{font-style:normal;color:transparent;-webkit-text-stroke:1px rgba(243,234,216,.72);padding-left:23vw}.cin-hero-bottom{display:grid;grid-template-columns:minmax(260px,620px) auto;gap:40px;align-items:end}.cin-hero-bottom p,.cin-feature-copy p,.cin-heading p,.cin-pillar p,.cin-book p{color:rgba(243,234,216,.68);font-size:clamp(16px,1.35vw,20px);line-height:1.65}.cin-actions{display:flex;gap:1px;border:1px solid var(--line);width:max-content;max-width:100%}.cin-btn{min-height:54px;padding:0 20px;display:grid;place-items:center;color:var(--cream);text-decoration:none;background:rgba(5,5,5,.72);font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase;transition:.25s}.cin-btn+.cin-btn{border-left:1px solid var(--line)}.cin-btn:hover,.cin-primary{background:var(--gold);color:#050505}.cin-scroll{position:absolute;right:28px;bottom:26px;font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase;color:rgba(243,234,216,.5);writing-mode:vertical-rl}.cin-scroll span{color:var(--gold);margin-top:10px}.cin-marquee{border-block:1px solid var(--line);overflow:hidden;background:#080808}.cin-marquee-track{width:max-content;padding:17px 0;font:900 11px/1 var(--ff-label);letter-spacing:.24em;color:rgba(243,234,216,.66);animation:marquee 28s linear infinite}.cin-section{padding:clamp(72px,10vw,150px) 0;border-bottom:1px solid var(--line)}.cin-feature-grid{display:grid;grid-template-columns:.75fr 1.25fr;gap:clamp(30px,7vw,110px);align-items:center}.cin-feature-copy h2,.cin-heading h2,.cin-book h2{font-family:var(--ff-display);font-size:clamp(58px,9vw,138px);line-height:.76;text-transform:uppercase;margin:18px 0 24px}.cin-text-link{display:inline-block;margin-top:26px;color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.cin-feature-card{position:relative;min-height:clamp(500px,68vw,820px);overflow:hidden;background:#111;box-shadow:0 40px 100px rgba(0,0,0,.55);transform:perspective(1200px) rotateY(-3deg)}.cin-feature-card img{filter:saturate(.72) contrast(1.18)}.cin-feature-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.8))}.cin-feature-frame{position:absolute;inset:18px;border:1px solid rgba(243,234,216,.32);z-index:2}.cin-feature-card>span{position:absolute;z-index:3;left:34px;bottom:32px;font:900 10px/1 var(--ff-label);letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}.cin-heading{display:grid;grid-template-columns:1fr minmax(260px,390px);gap:40px;align-items:end;margin-bottom:52px}.cin-heading .cin-eyebrow{grid-column:1/-1}.cin-heading h2{margin:0}.cin-poster-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(300px,28vw);gap:18px;overflow-x:auto;padding:0 max(14px,calc((100vw - 1480px)/2)) 34px;scroll-snap-type:x mandatory}.cin-poster{position:relative;min-height:620px;overflow:hidden;color:var(--cream);text-decoration:none;scroll-snap-align:center;background:#111;transform:perspective(1100px) rotateY(0deg);transition:transform .5s ease,box-shadow .5s ease;opacity:0}.cin-poster.is-visible{opacity:1;animation:posterIn .75s ease var(--delay) both}.cin-poster:hover{transform:perspective(1100px) rotateY(-5deg) translateY(-10px);box-shadow:0 36px 80px rgba(0,0,0,.55)}.cin-poster-image{position:absolute;inset:0}.cin-poster-image img{filter:saturate(.62) contrast(1.18);transition:transform .9s ease,filter .6s ease}.cin-poster:hover img{transform:scale(1.055);filter:saturate(.88) contrast(1.22)}.cin-poster:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.38),transparent 33%,rgba(0,0,0,.9))}.cin-poster-shine{position:absolute;inset:-30%;z-index:2;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.13),transparent 60%);transform:translateX(-70%);transition:transform .8s ease}.cin-poster:hover .cin-poster-shine{transform:translateX(65%)}.cin-poster-top,.cin-poster-copy{position:absolute;z-index:3;left:0;right:0}.cin-poster-top{top:0;display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid rgba(255,255,255,.18);font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}.cin-poster-copy{bottom:0;padding:28px}.cin-poster-copy small,.cin-poster-copy>span{font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}.cin-poster-copy h3{font-family:var(--ff-display);font-size:clamp(48px,5.8vw,86px);line-height:.76;text-transform:uppercase;margin:15px 0 24px}.cin-pillars{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line)}.cin-pillar{min-height:340px;padding:28px;display:grid;align-content:end;border-right:1px solid var(--line);opacity:0;transform:translateY(22px);transition:.7s var(--delay)}.cin-pillar:last-child{border-right:0}.cin-pillar.is-visible{opacity:1;transform:none}.cin-pillar>span{color:var(--gold);font:900 10px/1 var(--ff-label);letter-spacing:.18em}.cin-pillar h3{font-family:var(--ff-display);font-size:clamp(34px,3.4vw,54px);line-height:.85;text-transform:uppercase;margin:24px 0 14px}.cin-pillar p{font-size:15px}.cin-book{position:relative;min-height:78svh;display:grid;place-items:center;background:radial-gradient(circle at 50% 100%,rgba(212,160,23,.16),transparent 42%),#050505}.cin-book-inner{text-align:center;padding:110px 0;position:relative}.cin-book h2{font-size:clamp(68px,11vw,170px)}.cin-book p{max-width:620px;margin:0 auto 34px}.cin-book .cin-actions{margin:auto}.cin-reveal{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s ease}.cin-reveal.is-visible{opacity:1;transform:none}.cin-site :focus-visible{outline:2px solid var(--gold);outline-offset:4px}@keyframes beam{to{transform:rotate(8deg) translateX(8vw);opacity:.32}}@keyframes marquee{to{transform:translateX(-50%)}}@keyframes posterIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}@media(max-width:900px){.cin-hero-bottom,.cin-feature-grid,.cin-heading{grid-template-columns:1fr}.cin-title strong{padding-left:6vw}.cin-title em{padding-left:12vw}.cin-feature-card{transform:none}.cin-pillars{grid-template-columns:repeat(2,1fr)}.cin-pillar:nth-child(2){border-right:0}.cin-pillar:nth-child(-n+2){border-bottom:1px solid var(--line)}}@media(max-width:640px){.cin-hero-inner{padding:118px 0 54px}.cin-title{font-size:clamp(66px,24vw,116px)}.cin-title strong{padding-left:0}.cin-title em{padding-left:0}.cin-hero-bottom{gap:26px}.cin-actions{width:100%}.cin-btn{flex:1;padding:0 14px}.cin-scroll{display:none}.cin-marquee-track{font-size:9px}.cin-section{padding:64px 0}.cin-feature-copy h2,.cin-heading h2,.cin-book h2{font-size:clamp(54px,18vw,92px)}.cin-feature-card{min-height:470px;margin-inline:-14px}.cin-heading{margin-bottom:28px}.cin-poster-rail{grid-auto-columns:86vw;gap:12px}.cin-poster{min-height:540px}.cin-pillars{grid-template-columns:1fr}.cin-pillar{min-height:235px;border-right:0;border-bottom:1px solid var(--line)}.cin-pillar:last-child{border-bottom:0}.cin-book{min-height:72svh}}
          @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
        `}</style>
      </main>
      <Footer />
    </>
  )
}
