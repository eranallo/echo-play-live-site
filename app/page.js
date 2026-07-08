'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
    }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' })
    ref.current?.querySelectorAll('.ef-reveal').forEach(el => observer.observe(el))
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

function BandCard({ band, index }) {
  const image = band.featurePhoto || band.heroPhoto || band.crowdPhoto
  return (
    <Link className="ef-band ef-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 90}ms` }}>
      <div className="ef-band-media">
        {image && <Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}
      </div>
      <div className="ef-band-info">
        <span>{band.genre?.[0]}</span>
        <h3>{band.name}</h3>
      </div>
    </Link>
  )
}

export default function Home() {
  const pageRef = useReveal()
  useAura(pageRef)
  const lead = bandsList[0]
  const support = bandsList[1]

  return (
    <>
      <Nav />
      <main ref={pageRef} className="ef-site">
        <style>{`
          .ef-site{--line:rgba(247,240,228,.12);--muted:rgba(247,240,228,.58);--soft:rgba(247,240,228,.34);--mx:50vw;--my:18vh;min-height:100vh;color:#f7f0e4;background:radial-gradient(circle at var(--mx) var(--my),rgba(212,160,23,.12),transparent 18rem),radial-gradient(circle at 12% 0%,rgba(212,160,23,.16),transparent 34rem),linear-gradient(180deg,#0c0c0c 0%,#050505 44%,#020202 100%);overflow:hidden}.ef-site:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.42;background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:84px 84px;mask-image:linear-gradient(to bottom,#000,transparent 78%)}.ef-wrap{width:min(1500px,calc(100vw - clamp(30px,7vw,112px)));margin:0 auto;position:relative;z-index:1}.ef-label{font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:var(--c-epl)}.ef-hero{min-height:100svh;display:grid;align-items:end;padding:clamp(126px,15vw,210px) 0 clamp(58px,8vw,106px)}.ef-hero-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(300px,.95fr);gap:clamp(34px,7vw,108px);align-items:end}.ef-title{font-family:var(--ff-display);font-size:clamp(84px,15vw,232px);line-height:.76;letter-spacing:-.015em;margin:18px 0 24px}.ef-title span{display:block;color:var(--c-epl)}.ef-copy{max-width:650px;color:var(--muted);font-size:clamp(17px,1.55vw,22px);line-height:1.6}.ef-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}.ef-btn{min-height:52px;display:inline-flex;align-items:center;justify-content:center;padding:0 20px;border-radius:999px;border:1px solid var(--line);color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;background:rgba(255,255,255,.025);transition:transform .22s ease,border-color .22s ease,background .22s ease}.ef-btn:hover{transform:translateY(-3px);border-color:var(--c-epl);background:rgba(212,160,23,.08)}.ef-btn-primary{background:var(--c-epl);border-color:var(--c-epl);color:#080808}.ef-photo-stack{min-height:590px;position:relative}.ef-photo{position:absolute;border:1px solid var(--line);border-radius:34px;overflow:hidden;background:#111;box-shadow:0 42px 130px rgba(0,0,0,.45)}.ef-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.48))}.ef-photo-a{inset:0 16% 20% 0;transform:rotate(-2deg)}.ef-photo-b{inset:30% 0 0 24%;transform:rotate(2deg)}.ef-section{padding:clamp(74px,11vw,160px) 0}.ef-intro{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:rgba(255,255,255,.018)}.ef-intro-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,420px);gap:clamp(28px,6vw,90px);align-items:center;padding:clamp(48px,7vw,86px) 0}.ef-intro h2,.ef-section-head h2,.ef-book h2{font-family:var(--ff-display);font-size:clamp(52px,9vw,132px);line-height:.78;letter-spacing:-.012em}.ef-intro p,.ef-section-head p,.ef-book p{color:var(--muted);line-height:1.68}.ef-section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,380px);gap:clamp(24px,5vw,80px);align-items:end;margin-bottom:clamp(32px,5vw,64px)}.ef-bands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.ef-band{min-height:620px;position:relative;overflow:hidden;border:1px solid var(--line);border-radius:40px;text-decoration:none;color:#fff;background:#090909;opacity:0;transform:translateY(34px);transition:opacity .78s ease var(--delay),transform .78s ease var(--delay),border-color .22s ease}.ef-band.is-visible{opacity:1;transform:translateY(0)}.ef-band:hover{border-color:var(--band)}.ef-band-media{position:absolute;inset:0;opacity:.67;transform:scale(1.03);filter:saturate(.9) contrast(1.08);transition:transform .8s ease,opacity .8s ease}.ef-band:hover .ef-band-media{transform:scale(1.075);opacity:.82}.ef-band-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.82))}.ef-band-info{position:absolute;left:0;right:0;bottom:0;padding:clamp(24px,4vw,44px)}.ef-band-info span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band)}.ef-band-info h3{font-family:var(--ff-display);font-size:clamp(58px,8vw,116px);line-height:.76;letter-spacing:-.012em;margin-top:12px}.ef-flow{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line)}.ef-flow article{background:#060606;padding:clamp(24px,4vw,42px);min-height:260px}.ef-flow span{color:var(--c-epl);font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.ef-flow h3{font-family:var(--ff-display);font-size:clamp(38px,4vw,62px);line-height:.82;margin:28px 0 14px}.ef-flow p{color:var(--muted);line-height:1.58}.ef-book{display:grid;grid-template-columns:.9fr 1.1fr;gap:18px;align-items:stretch}.ef-book-card{border:1px solid var(--line);border-radius:40px;padding:clamp(30px,5vw,60px);background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.016));display:grid;align-content:center}.ef-book-media{min-height:560px;border:1px solid var(--line);border-radius:40px;position:relative;overflow:hidden;background:#111}.ef-book-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.58))}.ef-reveal{opacity:0;transform:translateY(30px);transition:opacity .75s ease,transform .75s ease}.ef-reveal.is-visible{opacity:1;transform:translateY(0)}@media(max-width:980px){.ef-hero-grid,.ef-intro-grid,.ef-section-head,.ef-book{grid-template-columns:1fr}.ef-photo-stack{min-height:500px}.ef-flow{grid-template-columns:1fr}}@media(max-width:740px){.ef-wrap{width:min(100% - 28px,1500px)}.ef-title{font-size:clamp(76px,23vw,142px)}.ef-bands{grid-template-columns:1fr}.ef-band{min-height:520px}.ef-photo-stack{display:none}.ef-book-media{min-height:380px}}@media(prefers-reduced-motion:reduce){.ef-reveal,.ef-band{opacity:1;transform:none;transition:none}.ef-band-media{transition:none}}
        `}</style>

        <section className="ef-hero">
          <div className="ef-wrap ef-hero-grid">
            <div>
              <div className="ef-label ef-reveal">Fort Worth / DFW</div>
              <h1 className="ef-title ef-reveal">Echo Play <span>Live</span></h1>
              <p className="ef-copy ef-reveal">Tribute and cover bands for venues, festivals, private events, and rooms built around a crowd.</p>
              <div className="ef-actions ef-reveal"><Link className="ef-btn ef-btn-primary" href="/shows">Upcoming shows</Link><Link className="ef-btn" href="/contact">Booking inquiry</Link></div>
            </div>
            <div className="ef-photo-stack ef-reveal" aria-hidden="true">
              <div className="ef-photo ef-photo-a">{lead.heroPhoto && <Image src={lead.heroPhoto} alt="" fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: lead.heroObjectPosition || 'center' }} />}</div>
              <div className="ef-photo ef-photo-b">{(support.crowdPhoto || support.featurePhoto || support.heroPhoto) && <Image src={support.crowdPhoto || support.featurePhoto || support.heroPhoto} alt="" fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div>
            </div>
          </div>
        </section>

        <section className="ef-intro"><div className="ef-wrap ef-intro-grid"><h2 className="ef-reveal">Four bands. Different rooms.</h2><p className="ef-reveal">Each act has its own audience, sound, and visual identity. The site should make that clear without over-explaining it.</p></div></section>

        <section className="ef-section" id="roster"><div className="ef-wrap"><div className="ef-section-head ef-reveal"><h2>Roster</h2><p>Start with the room, then choose the band.</p></div><div className="ef-bands">{bandsList.slice(0, 4).map((band, index) => <BandCard key={band.slug} band={band} index={index} />)}</div></div></section>

        <section className="ef-section"><div className="ef-wrap"><div className="ef-flow ef-reveal"><article><span>01</span><h3>The act</h3><p>Music lane, visual world, and audience fit.</p></article><article><span>02</span><h3>The date</h3><p>Assets, event copy, ticket links, and basic promo.</p></article><article><span>03</span><h3>The room</h3><p>Load-in, sound, schedule, people, and show details.</p></article></div></div></section>

        <section className="ef-section"><div className="ef-wrap ef-book"><div className="ef-book-media ef-reveal">{support.crowdPhoto && <Image src={support.crowdPhoto} alt="" fill sizes="44vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div><article className="ef-book-card ef-reveal"><div className="ef-label">Booking</div><h2>Send the date.</h2><p>Tell us the venue, event type, date, and audience. We’ll help match the right act.</p><div className="ef-actions"><Link className="ef-btn ef-btn-primary" href="/contact">Contact</Link><Link className="ef-btn" href="/shows">Shows</Link></div></article></div></section>
      </main>
      <Footer />
    </>
  )
}
