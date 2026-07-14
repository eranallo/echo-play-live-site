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
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', update) }
  }, [])

  const first = clamp(1 - progress / .28)
  const second = clamp(1 - Math.abs(progress - .47) / .22)
  const third = clamp((progress - .66) / .22)

  return (
    <>
      <Nav />
      <main className="world-site">
        <section className="world-journey" ref={journeyRef}>
          <div className="world-stage">
            <StageExperience progress={progress} />
            <div className="world-vignette" /><div className="world-grain" />

            <div className="world-copy world-copy-one" style={{ opacity: first, transform: `translate3d(0,${(1-first)*35}px,0)` }}>
              <span>Echo Play Live presents</span><h1>Walk into<br />the night.</h1><p>Scroll to enter the room.</p>
            </div>
            <div className="world-copy world-copy-two" style={{ opacity: second, transform: `translate3d(0,${(1-second)*35}px,0)` }}>
              <span>The house lights fall</span><h2>Anticipation<br />is the opening act.</h2><p>The camera moves. The rig wakes up. The space reveals itself.</p>
            </div>
            <div className="world-copy world-copy-three" style={{ opacity: third, transform: `translate3d(0,${(1-third)*35}px,0)` }}>
              <span>Live music. Real nostalgia.</span><h2>The lights<br />go down.</h2><p>Premium tribute bands, cover acts, and themed experiences built for nights people remember.</p><div className="world-actions"><Link href="/shows" className="world-btn world-primary">Get tickets</Link><Link href="/contact" className="world-btn">Book a band</Link></div>
            </div>
            <div className="world-meter"><i style={{ transform: `scaleY(${progress})` }} /><b>{String(Math.round(progress*100)).padStart(2,'0')}</b></div>
            <div className="world-audio">Visual experience<br /><b>Sound remains off</b></div>
          </div>
        </section>

        <section className="world-ticker"><div>THE SHOW STARTS BEFORE SHOWTIME · ECHO PLAY LIVE · THE SHOW STARTS BEFORE SHOWTIME · ECHO PLAY LIVE ·</div></section>

        <section className="world-section world-statement"><div className="world-wrap"><span className="world-label">Beyond the landing page</span><h2>A website should not describe the feeling.<em>It should create it.</em></h2><p>Echo Play is becoming a digital venue: one connected experience where fans discover shows, venues understand the product, and every band has a world worth entering.</p></div></section>

        <section className="world-section world-feature"><div className="world-wrap world-feature-grid"><div className="world-feature-copy"><span className="world-label">Featured room</span><h2>{featured.name}</h2><p>{featured.tagline || 'A live show engineered around recognition, release, and the songs a crowd already carries with them.'}</p><Link href={`/bands/${featured.slug}`} className="world-text-link">Enter this world <span>↗</span></Link></div><Link href={`/bands/${featured.slug}`} className="world-portal">{(featured.heroPhoto || featured.featurePhoto) && <Image src={featured.heroPhoto || featured.featurePhoto} alt={`${featured.name} performing`} fill sizes="(max-width: 900px) 100vw, 58vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}<div className="world-portal-frame"/><div className="world-portal-flare"/><span>Now entering</span></Link></div></section>

        <section className="world-section world-roster"><div className="world-wrap world-roster-head"><div><span className="world-label">Seven different atmospheres</span><h2>Choose<br />your room.</h2></div><p>Each act receives its own visual language, motion system, and emotional entry point.</p></div><div className="world-poster-rail">{bandsList.slice(0,7).map((band,index)=><Poster key={band.slug} band={band} index={index}/>)}</div></section>

        <section className="world-book"><div className="world-book-light"/><div className="world-wrap world-book-inner"><span className="world-label">Bring the crowd in</span><h2>Build a night<br />worth entering.</h2><p>Tell us the room, the date, and the feeling you want. We’ll match the right act and build from there.</p><div className="world-actions"><Link href="/contact" className="world-btn world-primary">Start a booking</Link><Link href="/shows" className="world-btn">Upcoming shows</Link></div></div></section>

        <style>{`
          .world-site{--gold:#d4a017;--cream:#f3ead8;--line:rgba(243,234,216,.15);background:#030303;color:var(--cream);overflow:hidden}.world-wrap{width:min(1480px,calc(100vw - clamp(28px,7vw,112px)));margin:auto}.world-journey{height:360vh}.world-stage{position:sticky;top:0;height:100svh;overflow:hidden;background:#020202;isolation:isolate}.stage-webgl{position:absolute;inset:0;z-index:-5}.stage-webgl canvas{display:block;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease}.stage-webgl.is-ready canvas{opacity:1}.stage-loading{position:absolute;inset:0;display:grid;place-items:center;color:rgba(243,234,216,.42);font:900 9px/1 var(--ff-label);letter-spacing:.22em;text-transform:uppercase}.stage-webgl.is-ready .stage-loading{opacity:0}.world-vignette{position:absolute;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(circle at 50% 48%,transparent 25%,rgba(0,0,0,.36) 65%,rgba(0,0,0,.92) 100%),linear-gradient(180deg,rgba(0,0,0,.3),transparent 28%,rgba(0,0,0,.66))}.world-grain{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.12;mix-blend-mode:soft-light;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")}.world-copy{position:absolute;left:clamp(18px,7vw,112px);bottom:clamp(70px,10vh,116px);max-width:min(980px,82vw);will-change:opacity,transform;transition:opacity .12s linear}.world-copy-two{left:auto;right:clamp(18px,7vw,112px);text-align:right}.world-copy span,.world-label{display:block;color:var(--gold);font:900 10px/1 var(--ff-label);letter-spacing:.24em;text-transform:uppercase;margin-bottom:18px}.world-copy h1,.world-copy h2{font-family:var(--ff-display);font-size:clamp(74px,11.4vw,188px);line-height:.72;text-transform:uppercase;letter-spacing:-.015em;margin:0;text-shadow:0 16px 60px rgba(0,0,0,.86)}.world-copy-one h1{color:transparent;-webkit-text-stroke:1px rgba(243,234,216,.8)}.world-copy-two h2{font-size:clamp(58px,8.8vw,145px)}.world-copy p{max-width:570px;color:rgba(243,234,216,.7);font-size:clamp(15px,1.2vw,19px);line-height:1.65;margin:24px 0 0}.world-copy-two p{margin-left:auto}.world-actions{display:flex;width:max-content;max-width:100%;border:1px solid var(--line);margin-top:28px;background:rgba(3,3,3,.65);backdrop-filter:blur(12px)}.world-btn{min-height:54px;padding:0 20px;display:grid;place-items:center;color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.17em;text-transform:uppercase;transition:.25s}.world-btn+.world-btn{border-left:1px solid var(--line)}.world-btn:hover,.world-primary{background:var(--gold);color:#030303}.world-meter{position:absolute;right:24px;top:50%;width:1px;height:160px;background:rgba(255,255,255,.18);transform:translateY(-50%)}.world-meter i{position:absolute;inset:0;background:var(--gold);transform-origin:top}.world-meter b{position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);font:900 9px/1 var(--ff-label);letter-spacing:.12em;color:rgba(243,234,216,.55)}.world-audio{position:absolute;top:98px;right:24px;text-align:right;color:rgba(243,234,216,.38);font:800 8px/1.5 var(--ff-label);letter-spacing:.16em;text-transform:uppercase}.world-audio b{color:var(--gold)}.world-ticker{border-block:1px solid var(--line);overflow:hidden;background:#080808}.world-ticker div{width:max-content;padding:18px 0;color:rgba(243,234,216,.62);font:900 10px/1 var(--ff-label);letter-spacing:.24em;animation:worldRun 30s linear infinite}.world-section{padding:clamp(82px,11vw,170px) 0;border-bottom:1px solid var(--line)}.world-statement h2,.world-feature h2,.world-roster h2,.world-book h2{font-family:var(--ff-display);font-size:clamp(64px,9.5vw,148px);line-height:.76;text-transform:uppercase;margin:0}.world-statement h2 em{display:block;color:var(--gold);font-style:normal}.world-statement p{max-width:620px;margin:34px 0 0 auto;color:rgba(243,234,216,.66);font-size:clamp(16px,1.35vw,20px);line-height:1.7}.world-feature-grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:clamp(35px,7vw,108px);align-items:center}.world-feature-copy h2{margin-bottom:24px}.world-feature-copy p,.world-roster-head>p,.world-book p{color:rgba(243,234,216,.65);font-size:clamp(15px,1.25vw,19px);line-height:1.7}.world-text-link{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-block:1px solid var(--line);margin-top:32px;color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.world-portal{position:relative;display:block;min-height:clamp(520px,64vw,850px);overflow:hidden;color:var(--cream);transform:perspective(1300px) rotateY(-4deg);box-shadow:0 55px 120px rgba(0,0,0,.65)}.world-portal img{filter:saturate(.68) contrast(1.2);transition:transform 1.4s ease,filter .8s ease}.world-portal:hover img{transform:scale(1.06);filter:saturate(.94) contrast(1.25)}.world-portal:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.74))}.world-portal-frame{position:absolute;inset:20px;border:1px solid rgba(243,234,216,.32);z-index:2}.world-portal-flare{position:absolute;z-index:3;top:-20%;left:-30%;width:55%;height:150%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.14),transparent);transform:translateX(-100%);transition:transform 1.2s ease}.world-portal:hover .world-portal-flare{transform:translateX(290%)}.world-portal>span{position:absolute;z-index:4;left:38px;bottom:34px;color:var(--gold);font:900 10px/1 var(--ff-label);letter-spacing:.2em;text-transform:uppercase}.world-roster-head{display:grid;grid-template-columns:1fr minmax(270px,400px);gap:50px;align-items:end;margin-bottom:58px}.world-poster-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(300px,27vw);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 max(14px,calc((100vw - 1480px)/2)) 38px}.world-poster{position:relative;min-height:650px;overflow:hidden;color:var(--cream);text-decoration:none;scroll-snap-align:center;background:#111}.world-poster-image{position:absolute;inset:0}.world-poster img{filter:saturate(.58) contrast(1.22);transition:transform 1s ease,filter .7s ease}.world-poster:hover img{transform:scale(1.065);filter:saturate(.92) contrast(1.25)}.world-poster:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.48),transparent 35%,rgba(0,0,0,.94))}.world-poster-glass{position:absolute;z-index:2;inset:-30%;background:linear-gradient(108deg,transparent 36%,rgba(255,255,255,.13),transparent 60%);transform:translateX(-80%);transition:transform .9s ease}.world-poster:hover .world-poster-glass{transform:translateX(70%)}.world-poster-meta,.world-poster-copy{position:absolute;z-index:3;left:0;right:0}.world-poster-meta{top:0;display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid rgba(255,255,255,.18);color:var(--accent);font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.world-poster-copy{bottom:0;padding:24px}.world-poster-copy small,.world-poster-copy b{font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.world-poster-copy small{color:var(--accent)}.world-poster-copy h3{font-family:var(--ff-display);font-size:clamp(52px,6vw,92px);line-height:.75;text-transform:uppercase;margin:14px 0 24px}.world-poster-copy b{display:block;padding-top:16px;border-top:1px solid rgba(255,255,255,.22)}.world-book{position:relative;min-height:86svh;display:grid;align-items:center;overflow:hidden}.world-book-light{position:absolute;inset:-35%;background:conic-gradient(from 180deg at 50% 50%,transparent,rgba(212,160,23,.12),transparent 32%);animation:worldSpin 16s linear infinite}.world-book-inner{position:relative;text-align:center;padding:110px 0}.world-book h2{font-size:clamp(70px,12vw,190px)}.world-book p{max-width:630px;margin:28px auto}.world-book .world-actions{margin:30px auto 0}.world-site :focus-visible{outline:2px solid var(--gold);outline-offset:4px}@keyframes worldRun{to{transform:translateX(-50%)}}@keyframes worldSpin{to{transform:rotate(360deg)}}
          @media(max-width:900px){.world-feature-grid,.world-roster-head{grid-template-columns:1fr}.world-feature-copy{max-width:650px}.world-portal{transform:none}.world-roster-head>p{max-width:540px}.world-poster-rail{grid-auto-columns:minmax(290px,58vw)}}
          @media(max-width:680px){.world-journey{height:320vh}.world-copy{left:16px;right:16px;bottom:70px;max-width:none}.world-copy-two{left:16px;right:16px;text-align:left}.world-copy-two p{margin-left:0}.world-copy h1,.world-copy h2,.world-copy-two h2{font-size:clamp(60px,20vw,108px)}.world-copy p{font-size:15px;max-width:92%}.world-meter{right:10px;height:110px}.world-audio{display:none}.world-actions{width:100%}.world-btn{flex:1;padding:0 12px}.world-section{padding:72px 0}.world-statement h2,.world-feature h2,.world-roster h2,.world-book h2{font-size:clamp(56px,18vw,92px)}.world-statement p{margin-left:0}.world-feature-grid{gap:42px}.world-portal{min-height:520px;margin-inline:-14px}.world-poster-rail{grid-auto-columns:82vw;padding-left:14px}.world-poster{min-height:560px}.world-book-inner{text-align:left}.world-book p{margin-left:0}.world-book .world-actions{margin-left:0}}
          @media(prefers-reduced-motion:reduce){.world-ticker div,.world-book-light{animation:none}.world-portal img{transition:none}}
        `}</style>
      </main>
      <Footer />
    </>
  )
}
