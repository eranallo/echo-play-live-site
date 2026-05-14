// Phase 35 — Admin QR generator.
//
// Renders a list of all QR-able pages (4 bands + EPL hub) with PNG + SVG
// download buttons per page. Client-side generation using the qrcode library.
// Gated by ?key= query string matched against ADMIN_KEY env var. Without
// the right key, shows a minimal "Not found" page (mirrors a 404 for casual
// discovery).
//
// NOTE: this is light-touch gating, not real auth. Anyone who knows the key
// can use the tool. The threat model is "don't let casual visitors stumble
// onto it" — not "lock down admin access." Treat the key like a soft secret.

'use client'

import { use, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { bandsList } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'

const PAGES = [
  ...bandsList.map(b => ({
    label: b.name,
    url: `${SITE_URL}/${b.slug}`,
    filenameBase: `epl-qr-${b.slug}`,
    color: b.color || '#D4A017',
  })),
  {
    label: 'Echo Play Live (Hub)',
    url: `${SITE_URL}/hub`,
    filenameBase: 'epl-qr-hub',
    color: '#D4A017',
  },
]

const QR_OPTIONS = {
  errorCorrectionLevel: 'H',  // High — survives partial damage / overlay
  margin: 2,
  color: { dark: '#0a0a0a', light: '#ffffff' },
  width: 1024,
}

function QrTile({ page }) {
  const [pngDataUrl, setPngDataUrl] = useState(null)
  const [svgString, setSvgString] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      QRCode.toDataURL(page.url, QR_OPTIONS),
      QRCode.toString(page.url, { ...QR_OPTIONS, type: 'svg' }),
    ])
      .then(([png, svg]) => {
        if (!active) return
        setPngDataUrl(png)
        setSvgString(svg)
      })
      .catch(e => active && setErr(e?.message || 'Failed to generate'))
    return () => { active = false }
  }, [page.url])

  function download(format) {
    let blob, filename
    if (format === 'png' && pngDataUrl) {
      // Convert data URL back to blob
      const byteString = atob(pngDataUrl.split(',')[1])
      const mime = pngDataUrl.match(/^data:([^;]+);/)[1]
      const bytes = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
      blob = new Blob([bytes], { type: mime })
      filename = `${page.filenameBase}.png`
    } else if (format === 'svg' && svgString) {
      blob = new Blob([svgString], { type: 'image/svg+xml' })
      filename = `${page.filenameBase}.svg`
    } else {
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        background: '#1a1a1a',
        border: `1.5px solid ${page.color}40`,
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--ff-label, sans-serif)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: page.color,
            marginBottom: '4px',
          }}
        >
          {page.label}
        </div>
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            wordBreak: 'break-all',
          }}
        >
          {page.url}
        </a>
      </div>
      <div
        style={{
          aspectRatio: '1/1',
          background: '#fff',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {err ? (
          <span style={{ color: '#c00', fontSize: '13px' }}>{err}</span>
        ) : pngDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pngDataUrl}
            alt={`QR code for ${page.label}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ color: '#999', fontSize: '13px' }}>Generating…</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => download('png')}
          disabled={!pngDataUrl}
          style={{
            flex: 1,
            padding: '10px',
            background: page.color,
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--ff-label, sans-serif)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: pngDataUrl ? 'pointer' : 'not-allowed',
            opacity: pngDataUrl ? 1 : 0.4,
          }}
        >
          PNG
        </button>
        <button
          type="button"
          onClick={() => download('svg')}
          disabled={!svgString}
          style={{
            flex: 1,
            padding: '10px',
            background: 'transparent',
            color: page.color,
            border: `1.5px solid ${page.color}`,
            borderRadius: '4px',
            fontFamily: 'var(--ff-label, sans-serif)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: svgString ? 'pointer' : 'not-allowed',
            opacity: svgString ? 1 : 0.4,
          }}
        >
          SVG
        </button>
      </div>
    </div>
  )
}

export default function AdminQrPage({ searchParams }) {
  const params = use(searchParams)
  const providedKey = params?.key || ''
  // NEXT_PUBLIC because we need to validate client-side. The key is "soft
  // secret" — it gates discovery, not real access.
  const expectedKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''
  const unlocked = expectedKey && providedKey === expectedKey

  if (!unlocked) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontFamily: 'monospace',
          fontSize: '14px',
        }}
      >
        Not found.
      </main>
    )
  }

  return (
    <main style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: 'var(--ff-label, sans-serif)',
            fontSize: '11px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#D4A017',
            marginBottom: '8px',
          }}
        >
          Admin
        </div>
        <h1
          style={{
            fontFamily: 'var(--ff-display, sans-serif)',
            fontSize: 'clamp(36px, 6vw, 56px)',
            color: '#fff',
            margin: 0,
          }}
        >
          QR Generator
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--ff-body, sans-serif)',
            fontSize: '14px',
            marginTop: '8px',
            maxWidth: '600px',
          }}
        >
          Download print-ready QR codes for each band landing page plus the EPL hub. PNG for high-quality print
          materials, SVG for any scale (banners, vehicle wraps, infinite zoom). Codes use the high error-correction
          setting so they scan reliably even with a logo overlay or partial damage.
        </p>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {PAGES.map(p => (
          <QrTile key={p.url} page={p} />
        ))}
      </div>
    </main>
  )
}
