'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import StageExperience from '@/components/StageExperience'
import { bandsList } from '@/lib/bands'

const clamp = value => Math.min(1, Math.max(0, value))

function Poster({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link href={`/bands/${band.slug}`} className="world-poster" style={{ '--accent': band.color || '#d4a017', '--i': index }}>
      <div className="world-poster-image">{image && <Image src={image} alt={`${band.name} live`} fill sizes="(max-width: 760px) 82vw, 29vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}</div>
      <div className="world-poster-glass" />
      <div className="world-poster-meta"><span>{String(index + 1).padStart(2, '0')}</span><span>{band.genre?.[0] || 'Live'}</span></div>
      <div className="world-poster-copy"><small>Echo Play Live presents</small><h3>{band.name}</h3><b>Enter the room →</b></div>
    </Link>
  )
}

export default function Home() {
  const journeyRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const featured = useMemo(() => bandsList.find(b => b.slug === 'so-long-goodnight') || bandsList[0], [])

  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      const section = journeyRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      setProgress(clamp(-rect.top / travel))
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <>
      <Nav />
      <main className="world-site">
        <section ref={journeyRef} className="world-journey" aria-label="Enter the Echo Play Live venue">
          <div className="world-sticky">
            <StageExperience progress={progress} />
            <div className="world-vignette" />
            <div className="world-grain" />

            <div className={`world-beat beat-one ${progress < .23 ? 'is-active' : ''}`}>
              <p>Fort Worth / DFW</p>
              <h1>The room<br />is waiting.</h1>
              <span>Scroll to enter</span>
            </div>

            <div className={`world-beat beat-two ${progress >= .22 && progress < .5 ? 'is-active' : ''}`}>
              <p>Live music / real nostalgia</p>
              <h2>Walk toward<br />the lights.</h2>
            </div>

            <div className={`world-beat beat-three ${progress >= .5 && progress < .76 ? 'is-active' : ''}`}>
              <p>Echo Play Live</p>
              <h2>Feel it before<br />the lights go down.</h2>
            </div>

            <div className={`world-beat beat-four ${progress >= .75 ? 'is-active' : ''}`}>
              <p>Premium live entertainment</p>
              <h2>Your next great<br />night starts here.</h2>
              <div className="world-actions"><Link href="/shows">Get tickets</Link><Link href="/contact">Book a band</Link></div>
            </div>

            <div className="world-progress"><span style={{ transform: `scaleX(${progress})` }} /></div>
          </div>
        </section>

        <section className="world-transition">
          <div className="world-marquee">THE LIGHTS ARE UP · THE ROOM IS OPEN · ECHO PLAY LIVE · THE LIGHTS ARE UP · THE ROOM IS OPEN ·</div>
        </section>

        <section className="world-feature">
          <div className="world-wrap world-feature-grid">
            <div className="world-copy">
              <span>Featured experience</span>
              <h2>{featured?.name}</h2>
              <p>{featured?.tagline || 'A crowd-first live show built around the songs and memories that pull a room together.'}</p>
              <Link href={`/bands/${featured?.slug}`}>Explore the band →</Link>
            </div>
            <div className="world-stage-card">
              {(featured?.heroPhoto || featured?.featurePhoto) && <Image src={featured.heroPhoto || featured.featurePhoto} alt={`${featured.name} performing`} fill sizes="(max-width: 900px) 100vw, 58vw" style={{ objectFit: 'cover', objectPosition: featured.heroObjectPosition || 'center' }} />}
              <div className="world-stage-frame" />
              <strong>Now entering</strong>
            </div>
          </div>
        </section>

        <section className="world-roster">
          <div className="world-wrap world-heading"><span>The roster</span><h2>Every door opens<br />to a different night.</h2><p>Seven acts. Seven atmospheres. One standard for the room.</p></div>
          <div className="world-poster-rail">{bandsList.slice(0, 7).map((band, index) => <Poster key={band.slug} band={band} index={index} />)}</div>
        </section>

        <section className="world-book">
          <div className="world-book-light" />
          <div className="world-wrap world-book-inner"><span>Bring the room to life</span><h2>Send the date.<br />We’ll build the night.</h2><p>Tell us the venue, city, crowd, and experience you want to create.</p><div className="world-actions"><Link href="/contact">Start a booking</Link><Link href="/bands">View the roster</Link></div></div>
        </section>

        <style>{`
          .world-site{--gold:#d4a017;--cream:#f3ead8;--line:rgba(243,234,216,.16);background:#030303;color:var(--cream);overflow:hidden}.world-wrap{width:min(1480px,calc(100vw - clamp(28px,7vw,112px)));margin:auto}.world-journey{height:440vh;position:relative;background:#020202}.world-sticky{position:sticky;top:0;height:100svh;overflow:hidden;isolation:isolate}.stage-webgl{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease;background:#020202}.stage-webgl.is-ready{opacity:1}.stage-webgl canvas{display:block;width:100%;height:100%}.stage-loading{position:absolute;inset:0;display:grid;place-items:center;color:rgba(243,234,216,.42);font:900 9px/1 var(--ff-label);letter-spacing:.22em;text-transform:uppercase}.stage-webgl.is-ready .stage-loading{display:none}.world-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at center,transparent 30%,rgba(0,0,0,.42) 75%,rgba(0,0,0,.9));z-index:2}.world-grain{position:absolute;inset:0;z-index:3;pointer-events:none;opacity:.11;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.48'/%3E%3C/svg%3E")}.world-beat{position:absolute;z-index:4;inset:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;padding:clamp(100px,12vw,170px) clamp(20px,7vw,112px) clamp(58px,7vw,92px);opacity:0;transform:translateY(28px);pointer-events:none;transition:opacity .65s ease,transform .75s cubic-bezier(.22,1,.36,1)}.world-beat.is-active{opacity:1;transform:none;pointer-events:auto}.world-beat p,.world-copy>span,.world-heading>span,.world-book-inner>span{font:900 10px/1 var(--ff-label);letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}.world-beat h1,.world-beat h2{font-family:var(--ff-display);font-size:clamp(72px,12vw,196px);line-height:.74;letter-spacing:-.018em;text-transform:uppercase;max-width:1250px;text-shadow:0 12px 60px rgba(0,0,0,.85)}.world-beat span{margin-top:24px;font:900 9px/1 var(--ff-label);letter-spacing:.2em;text-transform:uppercase;color:rgba(243,234,216,.55)}.beat-two,.beat-three{justify-content:center}.beat-two{align-items:flex-end;text-align:right}.beat-three h2{color:transparent;-webkit-text-stroke:1px rgba(243,234,216,.82)}.beat-four{background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.74))}.world-actions{display:flex;width:max-content;max-width:100%;border:1px solid var(--line);margin-top:30px}.world-actions a{min-height:54px;padding:0 20px;display:grid;place-items:center;color:var(--cream);background:rgba(5,5,5,.76);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.17em;text-transform:uppercase}.world-actions a+a{border-left:1px solid var(--line)}.world-actions a:first-child,.world-actions a:hover{background:var(--gold);color:#050505}.world-progress{position:absolute;z-index:5;left:0;right:0;bottom:0;height:2px;background:rgba(255,255,255,.08)}.world-progress span{display:block;height:100%;transform-origin:left;background:var(--gold)}.world-transition{border-block:1px solid var(--line);overflow:hidden;background:#080808}.world-marquee{width:max-content;padding:18px 0;font:900 11px/1 var(--ff-label);letter-spacing:.24em;color:rgba(243,234,216,.66);animation:worldMarquee 26s linear infinite}.world-feature,.world-roster{padding:clamp(84px,11vw,160px) 0;border-bottom:1px solid var(--line)}.world-feature-grid{display:grid;grid-template-columns:.68fr 1.32fr;gap:clamp(34px,7vw,110px);align-items:center}.world-copy h2,.world-heading h2,.world-book h2{font-family:var(--ff-display);font-size:clamp(60px,9vw,140px);line-height:.76;text-transform:uppercase;margin:18px 0 24px}.world-copy p,.world-heading p,.world-book p{color:rgba(243,234,216,.66);font-size:clamp(16px,1.35vw,20px);line-height:1.65}.world-copy>a{display:inline-block;margin-top:28px;color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.world-stage-card{position:relative;min-height:clamp(520px,68vw,850px);overflow:hidden;transform:perspective(1300px) rotateY(-4deg);box-shadow:0 50px 110px rgba(0,0,0,.6)}.world-stage-card img{filter:saturate(.72) contrast(1.2)}.world-stage-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.82))}.world-stage-frame{position:absolute;inset:18px;border:1px solid rgba(243,234,216,.32);z-index:2}.world-stage-card strong{position:absolute;z-index:3;left:34px;bottom:32px;font:900 10px/1 var(--ff-label);letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}.world-heading{display:grid;grid-template-columns:1fr minmax(250px,390px);gap:40px;align-items:end;margin-bottom:54px}.world-heading>span{grid-column:1/-1}.world-heading h2{margin:0}.world-poster-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(300px,28vw);gap:22px;overflow-x:auto;padding:0 max(14px,calc((100vw - 1480px)/2)) 36px;scroll-snap-type:x mandatory;perspective:1500px}.world-poster{position:relative;min-height:640px;overflow:hidden;color:var(--cream);text-decoration:none;scroll-snap-align:center;background:#111;transform:rotateY(calc((var(--i) - 3) * 1.2deg));transition:transform .6s cubic-bezier(.22,1,.36,1),box-shadow .6s ease}.world-poster:hover{transform:rotateY(-7deg) translateY(-14px) scale(1.02);box-shadow:0 42px 90px rgba(0,0,0,.62)}.world-poster-image{position:absolute;inset:0}.world-poster-image img{filter:saturate(.6) contrast(1.18);transition:transform .9s ease,filter .6s ease}.world-poster:hover img{transform:scale(1.07);filter:saturate(.9) contrast(1.22)}.world-poster:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.42),transparent 35%,rgba(0,0,0,.92))}.world-poster-glass{position:absolute;z-index:2;inset:-35%;background:linear-gradient(108deg,transparent 34%,rgba(255,255,255,.13),transparent 58%);transform:translateX(-70%);transition:transform .9s ease}.world-poster:hover .world-poster-glass{transform:translateX(65%)}.world-poster-meta,.world-poster-copy{position:absolute;z-index:3;left:0;right:0}.world-poster-meta{top:0;display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid rgba(255,255,255,.18);font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}.world-poster-copy{bottom:0;padding:28px}.world-poster-copy small,.world-poster-copy b{display:block;font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.world-poster-copy small{color:var(--accent)}.world-poster-copy h3{font-family:var(--ff-display);font-size:clamp(54px,6vw,94px);line-height:.76;text-transform:uppercase;margin:15px 0 22px}.world-poster-copy b{color:rgba(243,234,216,.72)}.world-book{position:relative;min-height:92svh;display:grid;align-items:center;overflow:hidden;background:#050505}.world-book-light{position:absolute;inset:-20%;background:radial-gradient(circle at 50% 45%,rgba(212,160,23,.22),transparent 30rem);animation:worldPulse 6s ease-in-out infinite}.world-book-inner{position:relative;z-index:2;text-align:center;display:grid;justify-items:center;padding:110px 0}.world-book h2{font-size:clamp(68px,11vw,176px);margin:22px 0}.world-book p{max-width:620px}.world-book .world-actions{margin-top:34px}@keyframes worldMarquee{to{transform:translateX(-50%)}}@keyframes worldPulse{50%{transform:scale(1.15);opacity:.7}}@media(max-width:900px){.world-feature-grid,.world-heading{grid-template-columns:1fr}.world-stage-card{transform:none;min-height:600px}.world-heading>span{grid-column:auto}.world-poster-rail{grid-auto-columns:82vw}.world-poster{min-height:560px}}@media(max-width:680px){.world-journey{height:390vh}.world-beat{padding:100px 18px 62px}.world-beat h1,.world-beat h2{font-size:clamp(62px,20vw,108px)}.beat-two{align-items:flex-start;text-align:left}.world-actions{width:100%}.world-actions a{flex:1;padding:0 12px}.world-feature,.world-roster{padding:72px 0}.world-wrap{width:calc(100vw - 28px)}.world-stage-card{min-height:470px}.world-heading{margin-bottom:34px}.world-poster-rail{grid-auto-columns:86vw;gap:14px}.world-poster{min-height:530px}.world-book-inner{padding:88px 0}.world-book h2{font-size:clamp(64px,19vw,104px)}}@media(prefers-reduced-motion:reduce){.world-marquee,.world-book-light{animation:none}.world-beat{transition:none}.world-poster,.world-poster img{transition:none}}
        `}</style>
      </main>
      <Footer />
    </>
  )
}
