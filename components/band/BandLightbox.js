'use client'

export default function BandLightbox({ band, images, lightboxImg, lightboxIdx, setLightboxImg, setLightboxIdx }) {
  return (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', cursor: 'zoom-out',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Prev/Next arrows */}
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); const p = (lightboxIdx - 1 + images.length) % images.length; setLightboxIdx(p); setLightboxImg(images[p]) }}
                style={{
                  position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >←</button>
              <button onClick={e => { e.stopPropagation(); const n = (lightboxIdx + 1) % images.length; setLightboxIdx(n); setLightboxImg(images[n]) }}
                style={{
                  position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >→</button>
            </>
          )}

          <div style={{ position: 'relative', maxWidth: '88vw', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImg.url}
              alt={band.name}
              style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', display: 'block' }}
            />
            <button onClick={() => setLightboxImg(null)} style={{
              position: 'absolute', top: '-40px', right: '0',
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '28px', cursor: 'pointer', lineHeight: 1,
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >×</button>
            <div style={{
              position: 'absolute', bottom: '-32px', left: '0',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px', letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.25)',
            }}>{lightboxIdx + 1} / {images.length}</div>
          </div>
        </div>
  )
}
