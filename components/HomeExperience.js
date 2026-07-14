'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const clamp = value => Math.max(0, Math.min(1, value))

function useJourneyProgress(ref) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const distance = Math.max(node.offsetHeight - window.innerHeight, 1)
      setProgress(clamp(-rect.top / distance))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])
  return progress
}

function StageWorld({ progress, heroImage, objectPosition }) {
  const push = clamp(progress / .72)
  const reveal = clamp((progress - .16) / .42)
  const finale = clamp((progress - .62) / .25)
  const beamSweep = `${-16 + progress * 31}deg`
  return (
    <div className="ep-stage-world" style={{ '--push': push, '--reveal': reveal, '--finale': finale, '--beam-sweep': beamSweep }} aria-hidden="true">
      <div className="ep-stage-photo">{heroImage && <Image src={heroImage} alt="" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition: objectPosition || 'center' }} />}</div>
      <div className="ep-stage-ceiling"><i/><i/><i/><i/><i/></div>
      <div className="ep-stage-beam ep-beam-one"/><div className="ep-stage-beam ep-beam-two"/><div className="ep-stage-beam ep-beam-three"/>
      <div className="ep-stage-screen"><span>Echo Play</span><b>Live</b></div>
      <div className="ep-stage-deck"/><div className="ep-stage-floor"/>
      <div className="ep-crowd">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ '--i': i }}/>)}</div>
      <div className="ep-haze"/><div className="ep-grain"/><div className="ep-vignette"/>
    </div>
  )
}

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link href={`/bands/${band.slug}`} className="ep-band-card" style={{ '--accent': band.color || '#d4a017', '--i': index }}>
      <div className="ep-band-image">{image && <Image src={image} alt={`${band.name} performing live`} fill sizes="(max-width:760px) 82vw, 30vw" style={{ objectFit:'cover', objectPosition: band.heroObjectPosition || 'center' }} />}</div>
      <div className="ep-band-top"><span>{String(index + 1).padStart(2,'0')}</span><span>{band.genre?.[0] || 'Live'}</span></div>
      <div className="ep-band-copy"><small>Echo Play Live</small><h3>{band.name}</h3><b>Explore the band →</b></div>
    </Link>
  )
}

function ShowCard({ show, index }) {
  const band = bandsList.find(item => item.slug === show.bandSlug) || bandsList.find(item => item.name === show.bandName)
  const image = band?.featurePhoto || band?.heroPhoto || band?.crowdPhoto
  const action = show.ticketUrl || '/shows'
  return (
    <article className="ep-show-card" style={{ '--accent': show.bandColor || '#d4a017', '--i': index }}>
      <div className="ep-show-image">{image && <Image src={image} alt={`${show.bandName} live`} fill sizes="(max-width:760px) 100vw, 40vw" style={{ objectFit:'cover', objectPosition: band?.heroObjectPosition || 'center' }} />}</div>
      <div className="ep-show-date"><strong>{show.dateLabel || 'Date TBA'}</strong><span>{show.startTime || 'Showtime TBA'}</span></div>
      <div className="ep-show-copy"><span>Upcoming show</span><h3>{show.billLabel || show.bandName}</h3><p>{show.venueName || 'Venue announcement coming soon'}</p><a href={action} target={show.ticketUrl ? '_blank' : undefined} rel={show.ticketUrl ? 'noreferrer' : undefined}>{show.ticketUrl ? 'Get tickets' : 'View show'} →</a></div>
    </article>
  )
}

export default function HomeExperience({ shows = [] }) {
  const journeyRef = useRef(null)
  const progress = useJourneyProgress(journeyRef)
  const featured = useMemo(() => bandsList.find(b => b.slug === 'so-long-goodnight') || bandsList[0], [])
  const heroImage = featured?.heroPhoto || featured?.featurePhoto || featured?.crowdPhoto
  const intro = clamp(1 - progress / .28)
  const identity = clamp(1 - Math.abs(progress - .47) / .24)
  const cta = clamp((progress - .67) / .2)
  const upcoming = shows.slice(0, 4)

  return <>
    <Nav />
    <main className="ep-home">
      <section className="ep-journey" ref={journeyRef}>
        <div className="ep-sticky">
          <StageWorld progress={progress} heroImage={heroImage} objectPosition={featured?.heroObjectPosition} />
          <div className="ep-hero-copy ep-copy-intro" style={{ opacity:intro, transform:`translate3d(0,${(1-intro)*30}px,0)` }}><span>Fort Worth / DFW</span><h1>The room<br/>is waiting.</h1><p>Scroll to enter.</p></div>
          <div className="ep-hero-copy ep-copy-middle" style={{ opacity:identity, transform:`translate3d(0,${(1-identity)*30}px,0)` }}><span>Live music. Real nostalgia.</span><h2>Feel the night<br/>before it begins.</h2></div>
          <div className="ep-hero-copy ep-copy-final" style={{ opacity:cta, transform:`translate3d(0,${(1-cta)*30}px,0)` }}><span>Echo Play Live</span><h2>Find your<br/>next show.</h2><p>Tribute bands, cover acts, and themed live experiences built for unforgettable rooms.</p><div className="ep-actions"><Link href="/shows" className="ep-btn ep-primary">Get tickets</Link><Link href="/contact" className="ep-btn">Book a band</Link></div></div>
          <div className="ep-progress"><i style={{ transform:`scaleY(${progress})` }}/></div>
        </div>
      </section>

      <section className="ep-ticker"><div>LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE · LIVE MUSIC · REAL NOSTALGIA · ECHO PLAY LIVE ·</div></section>

      <section className="ep-section ep-shows">
        <div className="ep-wrap ep-section-head"><div><span className="ep-label">On the calendar</span><h2>Your next night out.</h2></div><p>Find a show, grab your people, and step into the songs you already know by heart.</p></div>
        {upcoming.length ? <div className="ep-show-grid">{upcoming.map((show,index)=><ShowCard key={show.id || index} show={show} index={index}/>)}</div> : <div className="ep-empty ep-wrap"><p>New dates are being announced.</p><Link href="/shows">View all shows →</Link></div>}
        <div className="ep-wrap ep-section-link"><Link href="/shows">See every upcoming show <span>↗</span></Link></div>
      </section>

      <section className="ep-section ep-feature">
        <div className="ep-wrap ep-feature-grid"><div className="ep-feature-copy"><span className="ep-label">Featured band</span><h2>{featured.name}</h2><p>{featured.tagline || 'A crowd-powered live show built around the songs, emotion, and release of an unforgettable era.'}</p><Link href={`/bands/${featured.slug}`} className="ep-line-link">Meet the band <span>↗</span></Link></div><Link href={`/bands/${featured.slug}`} className="ep-feature-image">{heroImage && <Image src={heroImage} alt={`${featured.name} performing live`} fill sizes="(max-width:900px) 100vw, 58vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}<div className="ep-feature-frame"/><span>Enter the show</span></Link></div>
      </section>

      <section className="ep-section ep-roster"><div className="ep-wrap ep-section-head"><div><span className="ep-label">The roster</span><h2>Pick your era.<br/>Find your sound.</h2></div><p>From emo and 90s alternative to Tool, Deftones, Linkin Park, Breaking Benjamin, and metalcore.</p></div><div className="ep-band-rail">{bandsList.slice(0,7).map((band,index)=><BandCard key={band.slug} band={band} index={index}/>)}</div><div className="ep-wrap ep-section-link"><Link href="/bands">Explore the full roster <span>↗</span></Link></div></section>

      <section className="ep-section ep-proof"><div className="ep-wrap"><span className="ep-label">Built for the room</span><h2>More than a setlist.</h2><div className="ep-proof-grid"><article><span>01</span><h3>Professional production</h3><p>Organized advance work, prepared assets, and a show designed to fit the venue.</p></article><article><span>02</span><h3>Crowd-first performances</h3><p>Recognizable songs, strong pacing, and the energy that keeps a room involved.</p></article><article><span>03</span><h3>Reliable communication</h3><p>Clear booking, contracting, scheduling, and show-day expectations.</p></article><article><span>04</span><h3>Multiple experiences</h3><p>A focused roster covering different eras, genres, audiences, and room sizes.</p></article></div></div></section>

      <section className="ep-book"><div className="ep-book-bg">{heroImage && <Image src={heroImage} alt="Echo Play Live performance" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:featured.heroObjectPosition || 'center' }} />}</div><div className="ep-wrap ep-book-inner"><span className="ep-label">Book Echo Play Live</span><h2>Give the room<br/>a reason to show up.</h2><p>Tell us the date, venue, city, budget, and crowd. We’ll help match the right act to the night.</p><div className="ep-actions"><Link href="/contact" className="ep-btn ep-primary">Start a booking</Link><Link href="/bands" className="ep-btn">View the roster</Link></div></div></section>
    </main>
    <Footer />

    <style>{`
      .ep-home{--gold:#d4a017;--cream:#f3ead8;--line:rgba(243,234,216,.16);background:#030303;color:var(--cream);overflow:hidden}.ep-wrap{width:min(1480px,calc(100vw - clamp(28px,7vw,112px)));margin:auto}.ep-journey{height:320vh}.ep-sticky{position:sticky;top:0;height:100svh;overflow:hidden;background:#020202;isolation:isolate}.ep-stage-world{position:absolute;inset:0;z-index:0;perspective:900px;overflow:hidden;background:#020202}.ep-stage-photo{position:absolute;inset:-8%;transform:scale(calc(1.16 - var(--push)*.08));opacity:calc(.18 + var(--reveal)*.42);filter:saturate(.45) contrast(1.25) brightness(.45)}.ep-stage-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.16) 50%,rgba(0,0,0,.88)),radial-gradient(circle at 50% 43%,transparent,rgba(0,0,0,.7) 75%)}.ep-stage-ceiling{position:absolute;left:8%;right:8%;top:12%;height:12px;background:#202020;box-shadow:0 0 0 1px #444;transform:translateZ(100px) scale(calc(1 + var(--push)*.09))}.ep-stage-ceiling i{position:absolute;top:-13px;width:25px;height:38px;border-radius:4px;background:linear-gradient(#474747,#101010);box-shadow:0 0 18px rgba(212,160,23,calc(.12 + var(--reveal)*.38))}.ep-stage-ceiling i:nth-child(1){left:8%}.ep-stage-ceiling i:nth-child(2){left:29%}.ep-stage-ceiling i:nth-child(3){left:49%}.ep-stage-ceiling i:nth-child(4){left:69%}.ep-stage-ceiling i:nth-child(5){left:89%}.ep-stage-beam{position:absolute;top:8%;left:50%;width:12vw;height:78vh;transform-origin:50% 0;background:linear-gradient(180deg,rgba(243,234,216,calc(.02 + var(--reveal)*.18)),transparent 78%);filter:blur(12px);mix-blend-mode:screen;clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)}.ep-beam-one{transform:translateX(-50%) rotate(var(--beam-sweep))}.ep-beam-two{left:26%;transform:rotate(calc(var(--beam-sweep) * -.65));background:linear-gradient(180deg,rgba(212,160,23,calc(.02 + var(--reveal)*.2)),transparent 78%)}.ep-beam-three{left:72%;transform:rotate(calc(var(--beam-sweep) * -.8));background:linear-gradient(180deg,rgba(212,160,23,calc(.02 + var(--reveal)*.19)),transparent 78%)}.ep-stage-screen{position:absolute;left:50%;top:28%;width:min(64vw,820px);aspect-ratio:2.45;transform:translate(-50%,calc((1 - var(--reveal))*22px)) scale(calc(.76 + var(--push)*.3));display:grid;place-content:center;text-align:center;border:1px solid rgba(243,234,216,calc(.08 + var(--reveal)*.3));background:radial-gradient(circle,rgba(212,160,23,calc(.05 + var(--reveal)*.12)),rgba(0,0,0,.7));box-shadow:0 0 calc(var(--reveal)*90px) rgba(212,160,23,.2);opacity:calc(.08 + var(--reveal)*.92)}.ep-stage-screen span,.ep-stage-screen b{font-family:var(--ff-display);text-transform:uppercase;line-height:.72}.ep-stage-screen span{font-size:clamp(42px,8vw,124px)}.ep-stage-screen b{font-size:clamp(30px,5vw,80px);color:var(--gold);letter-spacing:.1em}.ep-stage-deck{position:absolute;left:16%;right:16%;bottom:15%;height:20%;background:linear-gradient(#111,#050505);transform:perspective(700px) rotateX(62deg) scale(calc(.82 + var(--push)*.25));transform-origin:bottom;border-top:1px solid #333}.ep-stage-floor{position:absolute;left:-20%;right:-20%;bottom:-30%;height:62%;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 11%),repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 13%),linear-gradient(#080808,#020202);transform:perspective(480px) rotateX(67deg);transform-origin:top}.ep-crowd{position:absolute;left:-2%;right:-2%;bottom:-3%;height:25%;display:flex;align-items:flex-end;justify-content:space-around;filter:drop-shadow(0 -8px 18px #000)}.ep-crowd i{display:block;width:clamp(18px,3vw,48px);height:calc(42% + (var(--i) % 7)*5%);border-radius:50% 50% 8% 8%;background:#010101;transform:translateY(calc((var(--i) % 4)*6px))}.ep-haze{position:absolute;inset:0;background:radial-gradient(circle at 50% 56%,rgba(212,160,23,calc(var(--reveal)*.12)),transparent 43%),linear-gradient(180deg,transparent 35%,rgba(243,234,216,.04));filter:blur(8px)}.ep-grain{position:absolute;inset:0;opacity:.12;mix-blend-mode:soft-light;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}.ep-vignette{position:absolute;inset:0;background:radial-gradient(circle,transparent 26%,rgba(0,0,0,.42) 67%,rgba(0,0,0,.96) 100%),linear-gradient(180deg,rgba(0,0,0,.28),transparent 42%,rgba(0,0,0,.7))}.ep-hero-copy{position:absolute;z-index:4;left:clamp(18px,7vw,112px);bottom:clamp(64px,10vh,112px);max-width:min(1040px,88vw);will-change:opacity,transform}.ep-copy-middle{left:auto;right:clamp(18px,7vw,112px);text-align:right}.ep-copy-final{max-width:min(900px,88vw)}.ep-hero-copy>span,.ep-label{display:block;color:var(--gold);font:900 10px/1 var(--ff-label);letter-spacing:.24em;text-transform:uppercase;margin-bottom:18px}.ep-hero-copy h1,.ep-hero-copy h2{font-family:var(--ff-display);font-size:clamp(74px,11vw,184px);line-height:.72;text-transform:uppercase;margin:0;text-shadow:0 18px 70px #000}.ep-copy-middle h2{font-size:clamp(62px,9vw,148px)}.ep-hero-copy p{color:rgba(243,234,216,.72);font-size:clamp(15px,1.3vw,20px);line-height:1.65;max-width:620px;margin:24px 0 0}.ep-copy-middle p{margin-left:auto}.ep-progress{position:absolute;z-index:5;right:22px;top:42%;height:170px;width:2px;background:rgba(255,255,255,.18)}.ep-progress i{display:block;width:100%;height:100%;background:var(--gold);transform-origin:top}.ep-actions{display:flex;width:max-content;max-width:100%;border:1px solid var(--line);margin-top:30px;background:rgba(3,3,3,.7);backdrop-filter:blur(12px)}.ep-btn{min-height:54px;padding:0 20px;display:grid;place-items:center;color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.ep-btn+.ep-btn{border-left:1px solid var(--line)}.ep-primary{background:var(--gold);color:#030303}.ep-ticker{overflow:hidden;border-block:1px solid var(--line);background:#080808}.ep-ticker div{width:max-content;padding:18px 0;font:900 10px/1 var(--ff-label);letter-spacing:.24em;color:rgba(243,234,216,.62);animation:epTicker 32s linear infinite}.ep-section{padding:clamp(78px,10vw,150px) 0;border-bottom:1px solid var(--line)}.ep-section-head{display:grid;grid-template-columns:1fr minmax(280px,430px);gap:50px;align-items:end;margin-bottom:52px}.ep-section h2,.ep-book h2{font-family:var(--ff-display);font-size:clamp(62px,9vw,142px);line-height:.76;text-transform:uppercase;margin:0}.ep-section-head p,.ep-feature-copy p,.ep-proof p,.ep-book p{color:rgba(243,234,216,.66);font-size:clamp(15px,1.25vw,19px);line-height:1.7}.ep-show-grid{width:min(1480px,calc(100vw - clamp(28px,7vw,112px)));margin:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.ep-show-card{position:relative;min-height:520px;overflow:hidden;background:#101010}.ep-show-image{position:absolute;inset:0}.ep-show-image img{filter:saturate(.58) contrast(1.2);transition:transform 1s ease}.ep-show-card:hover img{transform:scale(1.05)}.ep-show-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),transparent 35%,rgba(0,0,0,.94))}.ep-show-date{position:absolute;z-index:2;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid rgba(255,255,255,.18);font:900 10px/1 var(--ff-label);letter-spacing:.15em;text-transform:uppercase}.ep-show-date strong{color:var(--accent)}.ep-show-copy{position:absolute;z-index:2;left:0;right:0;bottom:0;padding:30px}.ep-show-copy>span{color:var(--accent);font:900 9px/1 var(--ff-label);letter-spacing:.2em;text-transform:uppercase}.ep-show-copy h3{font-family:var(--ff-display);font-size:clamp(44px,6vw,86px);line-height:.78;text-transform:uppercase;margin:14px 0}.ep-show-copy p{color:rgba(243,234,216,.7);margin-bottom:22px}.ep-show-copy a{color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.ep-section-link{margin-top:34px}.ep-section-link a,.ep-line-link{display:flex;justify-content:space-between;padding:18px 0;border-block:1px solid var(--line);color:var(--cream);text-decoration:none;font:900 10px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.ep-feature-grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:clamp(34px,7vw,108px);align-items:center}.ep-feature-copy h2{margin-bottom:24px}.ep-feature-image{position:relative;display:block;min-height:clamp(520px,65vw,860px);overflow:hidden;transform:perspective(1300px) rotateY(-3deg);box-shadow:0 50px 110px rgba(0,0,0,.65);color:var(--cream)}.ep-feature-image img{filter:saturate(.7) contrast(1.2);transition:transform 1.2s ease}.ep-feature-image:hover img{transform:scale(1.055)}.ep-feature-image:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(0,0,0,.78))}.ep-feature-frame{position:absolute;z-index:2;inset:20px;border:1px solid rgba(243,234,216,.3)}.ep-feature-image>span{position:absolute;z-index:3;left:36px;bottom:32px;color:var(--gold);font:900 10px/1 var(--ff-label);letter-spacing:.2em;text-transform:uppercase}.ep-band-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(300px,28vw);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 max(14px,calc((100vw - 1480px)/2)) 34px}.ep-band-card{position:relative;min-height:620px;overflow:hidden;scroll-snap-align:center;color:var(--cream);text-decoration:none;background:#111}.ep-band-image{position:absolute;inset:0}.ep-band-image img{filter:saturate(.55) contrast(1.2);transition:transform 1s ease,filter .7s ease}.ep-band-card:hover img{transform:scale(1.06);filter:saturate(.9) contrast(1.25)}.ep-band-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),transparent 35%,rgba(0,0,0,.94))}.ep-band-top{position:absolute;z-index:2;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid rgba(255,255,255,.18);color:var(--accent);font:900 9px/1 var(--ff-label);letter-spacing:.16em;text-transform:uppercase}.ep-band-copy{position:absolute;z-index:2;left:0;right:0;bottom:0;padding:28px}.ep-band-copy small,.ep-band-copy b{font:900 9px/1 var(--ff-label);letter-spacing:.18em;text-transform:uppercase}.ep-band-copy small{color:var(--accent)}.ep-band-copy h3{font-family:var(--ff-display);font-size:clamp(48px,6vw,90px);line-height:.76;text-transform:uppercase;margin:14px 0 20px}.ep-proof>div>h2{margin-bottom:50px}.ep-proof-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line)}.ep-proof article{padding:30px;min-height:290px;border-right:1px solid var(--line);display:grid;align-content:end}.ep-proof article:last-child{border-right:0}.ep-proof article>span{color:var(--gold);font:900 10px/1 var(--ff-label);letter-spacing:.18em}.ep-proof h3{font-family:var(--ff-display);font-size:clamp(34px,3.5vw,56px);line-height:.82;text-transform:uppercase;margin:18px 0 12px}.ep-book{position:relative;min-height:92svh;display:grid;align-items:end;overflow:hidden}.ep-book-bg{position:absolute;inset:0}.ep-book-bg img{filter:saturate(.42) contrast(1.2) brightness(.42)}.ep-book-bg:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.25)),linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.9))}.ep-book-inner{position:relative;z-index:2;padding-bottom:clamp(70px,10vw,130px)}.ep-book p{max-width:620px}.ep-empty{padding:50px;border:1px solid var(--line)}.ep-empty a{color:var(--gold)}
      @keyframes epTicker{to{transform:translateX(-50%)}}
      @media(max-width:900px){.ep-section-head,.ep-feature-grid{grid-template-columns:1fr}.ep-show-grid{grid-template-columns:1fr}.ep-proof-grid{grid-template-columns:repeat(2,1fr)}.ep-proof article:nth-child(2){border-right:0}.ep-proof article:nth-child(-n+2){border-bottom:1px solid var(--line)}}
      @media(max-width:740px){.ep-journey{height:245vh}.ep-stage-ceiling{left:4%;right:4%;top:14%}.ep-stage-screen{top:31%;width:84vw}.ep-stage-deck{left:6%;right:6%;bottom:16%;height:18%}.ep-crowd{height:22%}.ep-stage-beam{width:30vw}.ep-hero-copy{left:18px;right:18px;bottom:64px;max-width:none}.ep-copy-middle{left:18px;right:18px;text-align:left}.ep-copy-middle p{margin-left:0}.ep-hero-copy h1,.ep-hero-copy h2{font-size:clamp(64px,18vw,104px)}.ep-copy-middle h2{font-size:clamp(52px,15vw,88px)}.ep-progress{right:8px;height:130px}.ep-actions{width:100%}.ep-btn{flex:1;padding:0 12px}.ep-section{padding:64px 0}.ep-section-head{gap:18px;margin-bottom:28px}.ep-section h2,.ep-book h2{font-size:clamp(54px,16vw,88px)}.ep-show-grid{width:100%;gap:1px}.ep-show-card{min-height:470px}.ep-show-copy{padding:24px}.ep-feature-grid{width:100%}.ep-feature-copy{padding:0 14px}.ep-feature-image{min-height:560px;transform:none}.ep-feature-frame{inset:14px}.ep-band-rail{grid-auto-columns:84vw;padding-left:14px}.ep-band-card{min-height:560px}.ep-proof-grid{grid-template-columns:1fr}.ep-proof article{border-right:0;border-bottom:1px solid var(--line);min-height:230px}.ep-proof article:last-child{border-bottom:0}.ep-book{min-height:85svh}.ep-book-inner{padding-bottom:64px}.ep-home :focus-visible{outline:2px solid var(--gold);outline-offset:4px}}
      @media(prefers-reduced-motion:reduce){.ep-ticker div{animation:none}.ep-stage-beam{display:none}.ep-stage-photo,.ep-feature-image,.ep-band-card{transform:none!important}}
    `}</style>
  </>
}
