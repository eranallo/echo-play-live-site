'use client'
import { useState, useRef } from 'react'
import { track } from '@/lib/track'
export default function PodcastPlayer({ id, title }) {
  const [open, setOpen] = useState(false)
  const button = useRef(null)
  if (!/^\d+$/.test(id || '')) return null
  return <div className="podcast-player">
    {open ? <>
      <iframe src={`https://www.buzzsprout.com/2377760/episodes/${id}?client_source=small_player&iframe=true`} title={`Listen to ${title}`} allow="autoplay" loading="lazy" />
      <button className="text-link" onClick={() => { setOpen(false); requestAnimationFrame(() => button.current?.focus()) }}>Close player</button>
    </> : <button className="button" ref={button} onClick={() => { setOpen(true); track('Podcast player opened') }}>Listen here ▶</button>}
    <p className="form-note">The player connects to Buzzsprout when you choose Listen here.</p>
  </div>
}
