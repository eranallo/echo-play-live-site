'use client'
import { useState } from 'react'
import { track } from '@/lib/track'

export default function HubShare({ name, slug, path }) {
  const [status, setStatus] = useState('')
  const url = `https://echoplay.live${path}`
  async function share(copyOnly = false) {
    setStatus('')
    try {
      if (!copyOnly && navigator.share) await navigator.share({ title: name, url })
      else {
        await navigator.clipboard.writeText(url)
        setStatus('Link copied.')
      }
      try {
        track('Share link hub', { band: slug })
      } catch {}
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('You can select and copy the link below.')
    }
  }
  return (
    <details className="hub-share">
      <summary>
        Share this page & download QR code <span aria-hidden="true">+</span>
      </summary>
      <div className="hub-share-content">
        <div className="hub-share-actions">
          <button type="button" onClick={() => share()}>
            Share page ↗
          </button>
          <button type="button" onClick={() => share(true)}>
            Copy link
          </button>
        </div>
        <label>
          Page link
          <input readOnly value={url} onFocus={(event) => event.target.select()} />
        </label>
        <p role="status" className="hub-status">
          {status}
        </p>
        <img
          src={`/qr/${slug}.svg`}
          alt={`QR code for ${name} links`}
          width="160"
          height="160"
          loading="lazy"
        />
        <div className="hub-share-actions">
          <a href={`/qr/${slug}.png`} download={`${slug}-qr.png`}>
            Download PNG ↓
          </a>
          <a href={`/qr/${slug}.svg`} download={`${slug}-qr.svg`}>
            Download SVG ↓
          </a>
        </div>
        <p>This code opens this page. Keep using it as show dates and links change.</p>
      </div>
    </details>
  )
}
