'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const VENUES = ['Granada Theater', 'Texas Live', 'Haltom Theater', 'Magnolia Motor Lounge', 'Legacy Hall', 'The Revel', 'Hurricane Alley', 'Panther Island Pavilion']

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })

    ref.current?.querySelectorAll('.pp-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function BandPanel({ band, index }) {
  return (
    <Link className="pp-band-panel pp-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 90}ms` }}>
      <div className="pp-band-media">
        {band.heroPhoto && <Image src={band.heroPhoto} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />}
      </div>
      <div className="pp-band-content">
        <span>{band.era}</span>
        <h3>{band.name}</h3>
        <p>{band.tagline}</p>
        <em>Explore the show →</em>
      </div>
    </Link>
  )
}

export default function Home() {
  const pageRef = useReveal()
  const featured = bandsList.slice(0, 4)

  return (
    <>
      <Nav />
      <main ref={pageRef} className="pp-site">
        <style>{`
          .pp-site {
            --pp-bg:#050505;
            --pp-card:rgba(255,255,255,.045);
            --pp-line:rgba(255,255,255,.105);
            --pp-muted:rgba(255,255,255,.58);
            --pp-faint:rgba(255,255,255,.34);
            background:
              radial-gradient(circle at 50% -10%, rgba(212,160,23,.22), transparent 34%),
              radial-gradient(circle at 90% 12%, rgba(255,255,255,.08), transparent 28%),
              linear-gradient(180deg,#0d0d0d 0%,#050505 48%,#030303 100%);
            color:var(--c-text);
            overflow:hidden;
          }
          .pp-site::before { content:''; position:fixed; inset:0; pointer-events:none; opacity:.55; background-image:linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px, transparent 1px); background-size:72px 72px; mask-image:linear-gradient(to bottom, #000, transparent 72%); }
          .pp-wrap { width:min(1520px, calc(100vw - clamp(32px, 7vw, 112px))); margin:0 auto; position:relative; z-index:1; }
          .pp-kicker { display:inline-flex; align-items:center; gap:12px; font-family:var(--ff-label); font-size:11px; font-weight:800; letter-spacing:.26em; text-transform:uppercase; color:var(--c-epl); }
          .pp-kicker::before { content:''; width:9px; height:9px; border-radius:50%; background:var(--c-epl); box-shadow:0 0 24px var(--c-epl); }
          .pp-hero { min-height:100svh; display:grid; align-items:end; padding:clamp(120px, 13vw, 190px) 0 clamp(40px, 7vw, 90px); position:relative; }
          .pp-hero-grid { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr); gap:clamp(28px,6vw,88px); align-items:end; }
          .pp-title { font-family:var(--ff-display); font-size:clamp(76px, 15vw, 232px); line-height:.76; letter-spacing:-.015em; margin:18px 0 22px; max-width:1020px; }
          .pp-title span { color:var(--c-epl); text-shadow:0 0 56px rgba(212,160,23,.20); }
          .pp-copy { color:var(--pp-muted); font-size:clamp(16px,1.5vw,21px); line-height:1.6; max-width:720px; }
          .pp-hero-card { border:1px solid var(--pp-line); border-radius:36px; padding:24px; min-height:430px; background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.018)); box-shadow:0 40px 120px rgba(0,0,0,.48); backdrop-filter:blur(20px); position:relative; overflow:hidden; }
          .pp-hero-card::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 70% 10%,rgba(212,160,23,.25),transparent 38%); pointer-events:none; }
          .pp-hero-orbit { position:absolute; inset:36px; border:1px solid rgba(212,160,23,.22); border-radius:50%; animation:ppFloat 7s ease-in-out infinite; }
          .pp-hero-orbit:nth-child(2) { inset:76px; opacity:.55; animation-delay:-2s; }
          .pp-hero-metric { position:absolute; z-index:1; left:24px; bottom:24px; right:24px; display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
          .pp-hero-metric div { border:1px solid var(--pp-line); border-radius:20px; padding:14px; background:rgba(0,0,0,.32); }
          .pp-hero-metric strong { display:block; font-family:var(--ff-display); font-size:42px; line-height:.8; color:var(--c-epl); }
          .pp-hero-metric span { display:block; margin-top:7px; color:var(--pp-faint); font-size:11px; text-transform:uppercase; letter-spacing:.12em; }
          .pp-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:32px; }
          .pp-button { display:inline-flex; align-items:center; gap:10px; min-height:52px; padding:0 20px; border:1px solid var(--pp-line); border-radius:999px; color:#fff; text-decoration:none; font-family:var(--ff-label); font-size:12px; letter-spacing:.15em; text-transform:uppercase; transition:transform .25s ease,border-color .25s ease,background .25s ease; }
          .pp-button:hover { transform:translateY(-3px); border-color:var(--c-epl); background:rgba(212,160,23,.08); }
          .pp-button-primary { background:var(--c-epl); border-color:var(--c-epl); color:#080808; }
          .pp-section { padding:clamp(72px, 11vw, 160px) 0; position:relative; }
          .pp-section-head { display:flex; justify-content:space-between; align-items:end; gap:24px; margin-bottom:clamp(28px,5vw,70px); }
          .pp-section-head h2 { font-family:var(--ff-display); font-size:clamp(52px,10vw,150px); line-height:.78; letter-spacing:-.01em; max-width:920px; }
          .pp-section-head p { color:var(--pp-muted); line-height:1.65; max-width:430px; }
          .pp-highlights { display:grid; grid-template-columns:1.15fr .85fr; gap:18px; }
          .pp-highlight { min-height:360px; border:1px solid var(--pp-line); border-radius:34px; padding:clamp(22px,3vw,36px); background:linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.018)); box-shadow:0 30px 110px rgba(0,0,0,.32); position:relative; overflow:hidden; }
          .pp-highlight::after { content:''; position:absolute; inset:auto -20% -45% -20%; height:70%; background:radial-gradient(circle, rgba(212,160,23,.14), transparent 62%); }
          .pp-highlight h3 { font-family:var(--ff-display); font-size:clamp(40px,6vw,92px); line-height:.86; letter-spacing:-.005em; max-width:760px; position:relative; z-index:1; }
          .pp-highlight p { color:var(--pp-muted); line-height:1.65; max-width:520px; margin-top:20px; position:relative; z-index:1; }
          .pp-highlight-small { display:grid; gap:18px; }
          .pp-mini { min-height:171px; border:1px solid var(--pp-line); border-radius:30px; padding:24px; background:rgba(255,255,255,.034); }
          .pp-mini strong { display:block; font-family:var(--ff-display); font-size:48px; line-height:.85; color:var(--c-epl); }
          .pp-mini span { display:block; margin-top:12px; color:var(--pp-muted); line-height:1.45; }
          .pp-band-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:18px; }
          .pp-band-panel { min-height:520px; border:1px solid var(--pp-line); border-radius:34px; overflow:hidden; position:relative; color:inherit; text-decoration:none; background:#0b0b0b; box-shadow:0 34px 120px rgba(0,0,0,.40); transform:translateY(28px); opacity:0; transition:opacity .7s ease var(--delay), transform .7s ease var(--delay), border-color .25s ease; }
          .pp-band-panel.is-visible { opacity:1; transform:translateY(0); }
          .pp-band-panel:hover { border-color:color-mix(in srgb, var(--band) 60%, white 10%); }
          .pp-band-media { position:absolute; inset:0; opacity:.55; filter:saturate(.8) contrast(1.1); transform:scale(1.03); transition:transform .75s ease, opacity .75s ease; }
          .pp-band-panel:hover .pp-band-media { transform:scale(1.08); opacity:.72; }
          .pp-band-media::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,.10),rgba(0,0,0,.86)), radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--band) 30%, transparent), transparent 44%); }
          .pp-band-content { position:absolute; inset:auto 0 0 0; padding:clamp(22px,3vw,38px); }
          .pp-band-content span { font-family:var(--ff-label); color:var(--band); font-size:11px; letter-spacing:.23em; text-transform:uppercase; font-weight:800; }
          .pp-band-content h3 { font-family:var(--ff-display); font-size:clamp(44px,6vw,88px); line-height:.82; letter-spacing:-.005em; margin:12px 0; max-width:720px; }
          .pp-band-content p { color:rgba(255,255,255,.66); line-height:1.55; max-width:560px; }
          .pp-band-content em { display:inline-flex; margin-top:18px; color:var(--band); font-style:normal; font-family:var(--ff-label); font-size:11px; letter-spacing:.15em; text-transform:uppercase; }
          .pp-venues { border-top:1px solid var(--pp-line); border-bottom:1px solid var(--pp-line); overflow:hidden; padding:24px 0; background:rgba(255,255,255,.018); }
          .pp-marquee { display:flex; gap:36px; white-space:nowrap; animation:ppMarquee 34s linear infinite; color:rgba(255,255,255,.42); font-family:var(--ff-label); letter-spacing:.18em; text-transform:uppercase; font-size:12px; }
          .pp-marquee span { display:inline-flex; gap:36px; }
          .pp-cta { min-height:70svh; display:grid; place-items:center; text-align:center; padding:clamp(84px, 12vw, 170px) 0; }
          .pp-cta h2 { font-family:var(--ff-display); font-size:clamp(64px,14vw,190px); line-height:.78; letter-spacing:-.015em; max-width:1100px; margin:18px auto; }
          .pp-cta p { color:var(--pp-muted); max-width:620px; margin:0 auto; line-height:1.65; }
          .pp-reveal { opacity:0; transform:translateY(28px); transition:opacity .75s ease, transform .75s ease; }
          .pp-reveal.is-visible { opacity:1; transform:translateY(0); }
          @keyframes ppFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-12px) scale(1.02)} }
          @keyframes ppMarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @media (max-width:960px){ .pp-hero-grid,.pp-highlights,.pp-band-grid{grid-template-columns:1fr}.pp-hero-card{min-height:300px}.pp-section-head{display:grid}.pp-title{font-size:clamp(72px,22vw,154px)} }
          @media (prefers-reduced-motion:reduce){ .pp-reveal,.pp-band-panel,.pp-marquee,.pp-hero-orbit{animation:none;transition:none;opacity:1;transform:none} }
        `}</style>

        <section className="pp-hero">
          <div className="pp-wrap pp-hero-grid">
            <div>
              <div className="pp-kicker pp-reveal">DFW tribute & cover band management</div>
              <h1 className="pp-title pp-reveal">Live music with <span>production value.</span></h1>
              <p className="pp-copy pp-reveal">Echo Play Live builds premium live-music experiences for venues, festivals, private events, and fans who still want the room to feel electric.</p>
              <div className="pp-actions pp-reveal">
                <Link className="pp-button pp-button-primary" href="/contact">Book a band →</Link>
                <Link className="pp-button" href="/shows">View shows</Link>
                <Link className="pp-button" href="#roster">Explore roster</Link>
              </div>
            </div>
            <div className="pp-hero-card pp-reveal" aria-hidden="true">
              <div className="pp-hero-orbit" /><div className="pp-hero-orbit" />
              <div className="pp-hero-metric">
                <div><strong>{bandsList.length}</strong><span>active acts</span></div>
                <div><strong>DFW</strong><span>home base</span></div>
                <div><strong>100%</strong><span>live band</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="pp-venues">
          <div className="pp-marquee">
            <span>{VENUES.map(v => <b key={v}>{v}</b>)}</span>
            <span>{VENUES.map(v => <b key={`${v}-2`}>{v}</b>)}</span>
          </div>
        </section>

        <section className="pp-section">
          <div className="pp-wrap">
            <div className="pp-section-head pp-reveal">
              <h2>Built for the room.</h2>
              <p>Not background noise. Not a playlist. These are full-band shows with recognizable songs, production discipline, and real crowd energy.</p>
            </div>
            <div className="pp-highlights">
              <article className="pp-highlight pp-reveal">
                <h3>Tributes, covers, and themed nights that feel like events.</h3>
                <p>From emo and 90s alt-rock to Tool and Deftones-inspired heavy nights, each act is positioned as a complete entertainment product.</p>
              </article>
              <div className="pp-highlight-small">
                <article className="pp-mini pp-reveal"><strong>01</strong><span>Professional show flow for venues and promoters.</span></article>
                <article className="pp-mini pp-reveal"><strong>02</strong><span>Fan-facing campaigns, artwork, listings, and ticket paths.</span></article>
              </div>
            </div>
          </div>
        </section>

        <section id="roster" className="pp-section">
          <div className="pp-wrap">
            <div className="pp-section-head pp-reveal">
              <h2>The roster.</h2>
              <p>Each band has its own sonic lane and visual world. The brand stays premium; the room changes with the act.</p>
            </div>
            <div className="pp-band-grid">
              {featured.map((band, index) => <BandPanel key={band.slug} band={band} index={index} />)}
            </div>
          </div>
        </section>

        <section className="pp-cta">
          <div className="pp-wrap">
            <div className="pp-kicker pp-reveal">Booking, festivals, private events</div>
            <h2 className="pp-reveal">Bring the show to your room.</h2>
            <p className="pp-reveal">Tell us the venue, date, audience, and budget. We’ll help match the right act and build the night around it.</p>
            <div className="pp-actions pp-reveal" style={{ justifyContent: 'center' }}>
              <Link className="pp-button pp-button-primary" href="/contact">Start booking →</Link>
              <Link className="pp-button" href="/shows">See announced dates</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
