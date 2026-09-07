'use client'
import { useState } from 'react'

export default function CopyBandBio({ bio }) {
  const [status, setStatus] = useState('')
  const [showText, setShowText] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(bio)
      setStatus('Bio copied.')
      setShowText(false)
    } catch {
      setStatus('Select and copy the bio below.')
      setShowText(true)
    }
  }
  return (
    <div className="copy-bio">
      <button className="text-link" type="button" onClick={copy}>
        Copy band bio ↗
      </button>
      <span className="form-note" role="status">
        {status}
      </span>
      {showText && (
        <textarea
          aria-label="Band bio to copy"
          readOnly
          value={bio}
          rows={7}
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  )
}
