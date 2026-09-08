'use client'
import { useState } from 'react'
import { track } from '@/lib/track'
import { qrPlacements, qrAsset } from '@/lib/public/qr-placements.mjs'

export default function HubShare({ name, slug, path }) {
  const [status, setStatus] = useState('')
  const [placement, setPlacement] = useState('standard')
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
        <label>Where will you use this code?<select value={placement} onChange={e => setPlacement(e.target.value)}>{qrPlacements.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <img
          src={qrAsset(slug, placement, 'svg')}
          alt={`QR code for ${name} links`}
          width="160"
          height="160"
          loading="lazy"
        />
        <div className="hub-share-actions">
          <a href={qrAsset(slug, placement, 'png')} download={`${slug}-${placement}-qr.png`} onClick={() => track('QR download', { band: slug === 'hub' ? 'echo-play-live' : slug, placement })}>
            Download PNG ↓
          </a>
          <a href={qrAsset(slug, placement, 'svg')} download={`${slug}-${placement}-qr.svg`} onClick={() => track('QR download', { band: slug === 'hub' ? 'echo-play-live' : slug, placement })}>
            Download SVG ↓
          </a>
        </div>
        <p>Every version opens this page and keeps working as dates and links change. Choose a placement to help us see where visitors find us.</p>
      </div>
    </details>
  )
}
