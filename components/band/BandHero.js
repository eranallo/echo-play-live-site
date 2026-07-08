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
        .bh{min-height:100svh;position:relative;overflow:hidden;display:grid;align-items:end;padding:clamp(112px,12vw,180px) 0 clamp(40px,6vw,82px);background:#040404;color:#fff;isolation:isolate;border-bottom:1px solid rgba(255,255,255,.14)}.bh:before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px);background-size:94px 94px;opacity:.22}.bh:after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.24),rgba(0,0,0,.08) 36%,rgba(0,0,0,.78)),linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.22) 42%,rgba(0,0,0,.9) 86%,#080808 100%)}
        .bh-media{position:absolute;inset:0;z-index:0;will-change:transform}.bh-media img,.bh-media video{filter:saturate(.78) contrast(1.18)}.bh-grid{width:min(1500px,calc(100vw - clamp(28px,7vw,108px)));margin:0 auto;position:relative;z-index:3;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr);gap:clamp(22px,5vw,78px);align-items:end}.bh-kicker{display:flex;align-items:center;gap:10px;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:var(--band);margin-bottom:16px}.bh-kicker:before{content:'';width:30px;height:2px;background:var(--band)}.bh h1{font-family:var(--ff-display);font-size:clamp(82px,15vw,222px);line-height:.72;letter-spacing:-.01em;text-transform:uppercase;text-shadow:0 3px 38px rgba(0,0,0,.7);max-width:1060px}.bh-tags{display:flex;flex-wrap:wrap;margin-top:24px;border:1px solid rgba(255,255,255,.15);width:max-content;max-width:100%}.bh-tags span{border-right:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.72);background:rgba(0,0,0,.44);padding:10px 12px;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.bh-tags span:last-child{border-right:0}.bh-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.bh-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 18px;border:1px solid rgba(255,255,255,.22);background:#060606;color:#fff;text-decoration:none;font-family:var(--ff-label);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;transition:transform .18s ease,border-color .18s ease,color .18s ease,background .18s ease}.bh-btn:hover{transform:translateY(-2px);border-color:var(--band);color:var(--band)}.bh-btn-primary{background:var(--band);border-color:var(--band);color:#060606}.bh-btn-primary:hover{color:#060606}.bh-panel{border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.5)}.bh-panel-label{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:var(--band);padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.14)}.bh-stats{display:grid;grid-template-columns:repeat(2,1fr);background:rgba(255,255,255,.14);gap:1px}.bh-stat{background:#060606;padding:16px}.bh-stat strong{display:block;font-family:var(--ff-display);font-size:34px;line-height:.82;text-transform:uppercase}.bh-stat span{display:block;margin-top:8px;color:rgba(255,255,255,.45);font-size:10px;letter-spacing:.14em;text-transform:uppercase}.bh-social{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:rgba(255,255,255,.14);border-top:1px solid rgba(255,255,255,.14)}.bh-social a{display:inline-flex;align-items:center;gap:8px;padding:13px 15px;color:rgba(255,255,255,.62);text-decoration:none;font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;background:#060606}.bh-social a:hover{color:var(--band)}@media(max-width:980px){.bh-grid{grid-template-columns:1fr}.bh-panel{max-width:760px}.bh-stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.bh{min-height:auto;padding:108px 0 70px}.bh-grid{width:min(100% - 26px,1500px)}.bh h1{font-size:clamp(72px,24vw,136px)}.bh-tags{width:100%}.bh-tags span{flex:1 1 auto}.bh-actions{display:grid;grid-template-columns:1fr}.bh-btn{width:100%}.bh-stats,.bh-social{grid-template-columns:1fr}}
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
