'use client'

import Image from 'next/image'
import Link from 'next/link'

function SocialIcon({ platform }) {
  const icons = {
    facebook: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>,
    youtube: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#080808" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>,
    tiktok: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/></svg>,
  }
  return icons[platform] || null
}

export default function BandHero({ band, heroImg, heroParallaxRef, allowHeroVideo }) {
  const stats = band.stats || []

  return (
    <section className="bh" style={{ '--band': band.color }}>
      <style>{`
        .bh{min-height:100svh;position:relative;overflow:hidden;display:grid;align-items:end;padding:clamp(118px,13vw,190px) 0 clamp(42px,7vw,92px);background:#050505;color:#fff;isolation:isolate}.bh:before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 20% 0%,var(--band),transparent 34rem);opacity:.18}.bh:after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.18) 40%,rgba(0,0,0,.86) 82%,#080808 100%)}
        .bh-media{position:absolute;inset:0;z-index:0;will-change:transform}.bh-media img,.bh-media video{filter:saturate(.9) contrast(1.08)}.bh-grid{width:min(1500px,calc(100vw - clamp(32px,7vw,112px)));margin:0 auto;position:relative;z-index:3;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(290px,.8fr);gap:clamp(28px,6vw,88px);align-items:end}.bh-kicker{display:flex;align-items:center;gap:10px;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:var(--band);margin-bottom:18px}.bh-kicker:before{content:'';width:8px;height:8px;border-radius:50%;background:var(--band);box-shadow:0 0 22px var(--band)}.bh-tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:24px}.bh-tags span{border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.68);background:rgba(0,0,0,.32);backdrop-filter:blur(10px);border-radius:999px;padding:8px 11px;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.bh h1{font-family:var(--ff-display);font-size:clamp(78px,15vw,220px);line-height:.72;letter-spacing:-.015em;text-shadow:0 3px 46px rgba(0,0,0,.75);max-width:1050px}.bh-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.bh-btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 20px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.34);color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;backdrop-filter:blur(14px);transition:transform .22s ease,border-color .22s ease,background .22s ease}.bh-btn:hover{transform:translateY(-3px);border-color:var(--band);background:color-mix(in srgb,var(--band) 10%,rgba(0,0,0,.38))}.bh-btn-primary{background:var(--band);border-color:var(--band);color:#070707}.bh-panel{border:1px solid rgba(255,255,255,.13);border-radius:34px;padding:clamp(20px,3vw,30px);background:rgba(0,0,0,.34);backdrop-filter:blur(22px);box-shadow:0 40px 130px rgba(0,0,0,.35)}.bh-panel-label{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--band);margin-bottom:18px}.bh-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.bh-stat{border:1px solid rgba(255,255,255,.11);border-radius:18px;padding:14px;background:rgba(255,255,255,.035)}.bh-stat strong{display:block;font-family:var(--ff-display);font-size:32px;line-height:.82}.bh-stat span{display:block;margin-top:8px;color:rgba(255,255,255,.42);font-size:10px;letter-spacing:.14em;text-transform:uppercase}.bh-social{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.bh-social a{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:10px 13px;color:rgba(255,255,255,.58);text-decoration:none;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;background:rgba(0,0,0,.22)}.bh-social a:hover{color:var(--band);border-color:var(--band)}@media(max-width:980px){.bh-grid{grid-template-columns:1fr}.bh-panel{max-width:760px}.bh-stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.bh{padding-bottom:88px}.bh-grid{width:min(100% - 28px,1500px)}.bh h1{font-size:clamp(72px,23vw,136px)}.bh-stats{grid-template-columns:1fr}}
      `}</style>

      {heroImg && <div ref={heroParallaxRef} className="bh-media"><Image src={heroImg.url} alt={`${band.name} live`} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center 20%' }} />{band.heroVideo && allowHeroVideo && <video src={band.heroVideo} poster={heroImg.url} autoPlay muted loop playsInline preload="auto" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center 20%', pointerEvents: 'none' }} />}</div>}

      <div className="bh-grid">
        <div>
          <div className="bh-kicker"><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Echo Play Live</Link><span style={{ opacity: .55 }}>→</span>{band.era}</div>
          <h1>{band.name}</h1>
          <div className="bh-tags">{band.genre.map(item => <span key={item}>{item}</span>)}<span>Fort Worth, TX</span></div>
          <div className="bh-actions"><Link className="bh-btn bh-btn-primary" href="/contact">Booking</Link><Link className="bh-btn" href="/shows">Shows</Link></div>
        </div>

        <aside className="bh-panel">
          <div className="bh-panel-label">At a glance</div>
          {stats.length > 0 && <div className="bh-stats">{stats.slice(0, 4).map(stat => <div className="bh-stat" key={`${stat.value}-${stat.label}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>}
          <div className="bh-social">{Object.entries(band.social || {}).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer"><SocialIcon platform={platform} />{platform}</a>)}</div>
        </aside>
      </div>
    </section>
  )
}
