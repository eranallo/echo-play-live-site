'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

const fitCards = [
  ['Venue nights', 'Full-band shows built for bars, clubs, theaters, and music rooms.'],
  ['Festivals', 'Recognizable sets that help anchor themed lineups and multi-band events.'],
  ['Private events', 'Crowd-friendly live music for parties, celebrations, and special events.'],
  ['Community events', 'Professional entertainment for city, corporate, and outdoor gatherings.'],
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
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
    <Link className="ef-band ef-reveal" href={`/bands/${band.slug}`} style={{ '--band': band.color, '--delay': `${index * 80}ms` }}>
      <div className="ef-band-media">
        {image && <Image src={image} alt={`${band.name} live`} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />}
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
          .ef-site{--line:rgba(247,240,228,.12);--muted:rgba(247,240,228,.62);--soft:rgba(247,240,228,.4);--mx:50vw;--my:18vh;min-height:100vh;color:#f7f0e4;background:radial-gradient(circle at var(--mx) var(--my),rgba(212,160,23,.11),transparent 18rem),radial-gradient(circle at 12% 0%,rgba(212,160,23,.14),transparent 32rem),linear-gradient(180deg,#0b0b0b 0%,#050505 46%,#020202 100%);overflow:hidden}.ef-site:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.34;background-image:linear-gradient(rgba(255,255,255,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.01) 1px,transparent 1px);background-size:84px 84px;mask-image:linear-gradient(to bottom,#000,transparent 78%)}.ef-wrap{width:min(1480px,calc(100vw - clamp(28px,7vw,104px)));margin:0 auto;position:relative;z-index:1}.ef-label{font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:var(--c-epl)}.ef-hero{min-height:88svh;display:grid;align-items:end;padding:clamp(118px,13vw,186px) 0 clamp(48px,7vw,86px)}.ef-hero-grid{display:grid;grid-template-columns:minmax(0,1.04fr) minmax(300px,.96fr);gap:clamp(30px,6vw,92px);align-items:end}.ef-title{font-family:var(--ff-display);font-size:clamp(84px,15vw,224px);line-height:.76;letter-spacing:-.015em;margin:18px 0 22px}.ef-title span{display:block;color:var(--c-epl)}.ef-copy{max-width:620px;color:var(--muted);font-size:clamp(17px,1.45vw,21px);line-height:1.58}.ef-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.ef-btn{min-height:52px;display:inline-flex;align-items:center;justify-content:center;padding:0 20px;border-radius:999px;border:1px solid var(--line);color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;background:rgba(255,255,255,.025);transition:transform .22s ease,border-color .22s ease,background .22s ease}.ef-btn:hover{transform:translateY(-3px);border-color:var(--c-epl);background:rgba(212,160,23,.08)}.ef-btn-primary{background:var(--c-epl);border-color:var(--c-epl);color:#080808}.ef-photo-stack{min-height:540px;position:relative}.ef-photo{position:absolute;border:1px solid var(--line);border-radius:34px;overflow:hidden;background:#111;box-shadow:0 42px 130px rgba(0,0,0,.42)}.ef-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.5))}.ef-photo-a{inset:0 16% 18% 0;transform:rotate(-2deg)}.ef-photo-b{inset:30% 0 0 25%;transform:rotate(2deg)}.ef-section{padding:clamp(58px,8vw,118px) 0}.ef-section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,390px);gap:clamp(24px,5vw,76px);align-items:end;margin-bottom:clamp(28px,5vw,56px)}.ef-section-head h2,.ef-book h2{font-family:var(--ff-display);font-size:clamp(52px,8.5vw,122px);line-height:.78;letter-spacing:-.012em}.ef-section-head p,.ef-book p,.ef-fit p{color:var(--muted);line-height:1.65}.ef-bands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.ef-band{min-height:560px;position:relative;overflow:hidden;border:1px solid var(--line);border-radius:38px;text-decoration:none;color:#fff;background:#090909;opacity:0;transform:translateY(28px);transition:opacity .72s ease var(--delay),transform .72s ease var(--delay),border-color .22s ease}.ef-band.is-visible{opacity:1;transform:translateY(0)}.ef-band:hover{border-color:var(--band)}.ef-band-media{position:absolute;inset:0;opacity:.68;transform:scale(1.03);filter:saturate(.9) contrast(1.08);transition:transform .8s ease,opacity .8s ease}.ef-band:hover .ef-band-media{transform:scale(1.07);opacity:.82}.ef-band-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.82))}.ef-band-info{position:absolute;left:0;right:0;bottom:0;padding:clamp(24px,4vw,42px)}.ef-band-info span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band)}.ef-band-info h3{font-family:var(--ff-display);font-size:clamp(56px,7.4vw,106px);line-height:.76;letter-spacing:-.012em;margin-top:12px}.ef-fit-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);background:var(--line)}.ef-fit{min-height:250px;background:#060606;padding:clamp(22px,3vw,36px);display:grid;align-content:end}.ef-fit span{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--c-epl)}.ef-fit h3{font-family:var(--ff-display);font-size:clamp(34px,4vw,58px);line-height:.84;margin:26px 0 12px}.ef-book{display:grid;grid-template-columns:.92fr 1.08fr;gap:18px;align-items:stretch}.ef-book-card{border:1px solid var(--line);border-radius:38px;padding:clamp(30px,5vw,58px);background:linear-gradient(180deg,rgba(255,255,255,.052),rgba(255,255,255,.014));display:grid;align-content:center}.ef-book-media{min-height:500px;border:1px solid var(--line);border-radius:38px;position:relative;overflow:hidden;background:#111}.ef-book-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.58))}.ef-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}.ef-reveal.is-visible{opacity:1;transform:translateY(0)}@media(max-width:1080px){.ef-fit-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:980px){.ef-hero-grid,.ef-section-head,.ef-book{grid-template-columns:1fr}.ef-photo-stack{min-height:460px}.ef-book-media{min-height:420px}}@media(max-width:740px){.ef-wrap{width:min(100% - 28px,1480px)}.ef-hero{min-height:auto;padding:112px 0 58px}.ef-title{font-size:clamp(72px,23vw,136px)}.ef-copy{font-size:16px}.ef-photo-stack{display:block;min-height:330px;margin-top:18px}.ef-photo-a{inset:0 12% 16% 0}.ef-photo-b{inset:44% 0 0 22%}.ef-section{padding:52px 0}.ef-bands{grid-template-columns:1fr;gap:14px}.ef-band{min-height:390px;border-radius:28px}.ef-band-info h3{font-size:clamp(50px,17vw,82px)}.ef-fit-grid{grid-template-columns:1fr}.ef-fit{min-height:auto;padding:28px}.ef-book{gap:14px}.ef-book-media{min-height:330px;border-radius:28px;order:-1}.ef-book-card{border-radius:28px}.ef-actions{gap:10px}.ef-btn{min-height:48px;padding:0 16px}}@media(prefers-reduced-motion:reduce){.ef-reveal,.ef-band{opacity:1;transform:none;transition:none}.ef-band-media{transition:none}}
        `}</style>

        <section className="ef-hero">
          <div className="ef-wrap ef-hero-grid">
            <div>
              <div className="ef-label ef-reveal">Fort Worth / DFW</div>
              <h1 className="ef-title ef-reveal">Echo Play <span>Live</span></h1>
              <p className="ef-copy ef-reveal">Live tribute and cover bands for venues, festivals, private events, and nights built around a crowd.</p>
              <div className="ef-actions ef-reveal"><Link className="ef-btn ef-btn-primary" href="/shows">Upcoming shows</Link><Link className="ef-btn" href="/contact">Book a band</Link></div>
            </div>
            <div className="ef-photo-stack ef-reveal" aria-hidden="true">
              <div className="ef-photo ef-photo-a">{lead.heroPhoto && <Image src={lead.heroPhoto} alt="" fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: lead.heroObjectPosition || 'center' }} />}</div>
              <div className="ef-photo ef-photo-b">{(support.crowdPhoto || support.featurePhoto || support.heroPhoto) && <Image src={support.crowdPhoto || support.featurePhoto || support.heroPhoto} alt="" fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div>
            </div>
          </div>
        </section>

        <section className="ef-section" id="roster"><div className="ef-wrap"><div className="ef-section-head ef-reveal"><h2>Roster</h2><p>Four live acts with clear lanes, recognizable songs, and their own audience.</p></div><div className="ef-bands">{bandsList.slice(0, 4).map((band, index) => <BandCard key={band.slug} band={band} index={index} />)}</div></div></section>

        <section className="ef-section"><div className="ef-wrap"><div className="ef-section-head ef-reveal"><h2>Where we fit</h2><p>Different rooms need different energy. Echo Play Live helps match the act to the night.</p></div><div className="ef-fit-grid ef-reveal">{fitCards.map(([title, body], index) => <article className="ef-fit" key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

        <section className="ef-section"><div className="ef-wrap ef-book"><div className="ef-book-media ef-reveal">{support.crowdPhoto && <Image src={support.crowdPhoto} alt="Live crowd at an Echo Play Live show" fill sizes="(max-width: 900px) 100vw, 44vw" style={{ objectFit: 'cover', objectPosition: support.heroObjectPosition || 'center' }} />}</div><article className="ef-book-card ef-reveal"><div className="ef-label">Booking</div><h2>Bring the right band to the room.</h2><p>Send the venue, date, event type, and expected crowd. We’ll point you toward the best fit.</p><div className="ef-actions"><Link className="ef-btn ef-btn-primary" href="/contact">Contact</Link><Link className="ef-btn" href="/shows">Shows</Link></div></article></div></section>
      </main>
      <Footer />
    </>
  )
}
