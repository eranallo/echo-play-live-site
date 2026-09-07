'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
const Songs = dynamic(() => import('./SongsSection'), {
  loading: () => <p>Loading the song library…</p>,
})
const Discography = dynamic(() => import('./TributeDiscographySection'), {
  loading: () => <p>Loading the discography…</p>,
})
export default function BandExperienceDetails({ band }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="band-listen">
      <h3>The music behind the night.</h3>
      <p className="muted">
        Explore {band.tributeMode ? 'the albums and songs' : 'the song library'} and request a
        favorite.
      </p>
      <button
        className="text-link"
        style={{ background: 'none', border: 0, padding: 0, marginTop: 12 }}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close the song library ↑' : 'Explore the song library ↓'}
      </button>
      {open && (
        <div className="music-library">
          {band.tributeMode ? <Discography band={band} /> : <Songs band={band} defaultExpanded />}
        </div>
      )}
    </div>
  )
}
