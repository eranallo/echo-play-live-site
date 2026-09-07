'use client'
import { useState } from 'react'
import { track } from '@vercel/analytics'

export default function ShareShow({ title, path, showId }) {
  const [status, setStatus] = useState('')
  const [fallback, setFallback] = useState(false)
  const url = `https://echoplay.live${path}`
  async function share() {
    setStatus('')
    try {
      if (navigator.share) await navigator.share({ title, url })
      else {
        await navigator.clipboard.writeText(url)
        setStatus('Link copied.')
      }
      try {
        track('Share show', { show: showId })
      } catch {}
    } catch (error) {
      if (error.name !== 'AbortError') {
        setFallback(true)
        setStatus('Copy the show link below.')
      }
    }
  }
  return (
    <div className="share-show">
      <button type="button" className="text-link" onClick={share}>
        Share this show ↗
      </button>
      <span className="form-note" role="status">
        {status}
      </span>
      {fallback && (
        <input
          aria-label="Show link"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  )
}
