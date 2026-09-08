'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useId, useState } from 'react'
const Songs=dynamic(()=>import('./SongsSection'),{loading:()=> <p>Loading the song library…</p>})
const Discography=dynamic(()=>import('./TributeDiscographySection'),{loading:()=> <p>Loading the discography…</p>})
export default function BandExperienceDetails({band}) {
  const [open,setOpen]=useState(false), [view,setView]=useState('catalog')
  const id=useId()
  return <div className="band-listen">
    <p className="eyebrow">The music</p><h3>The song catalog.</h3>
    <p className="muted">Explore our repertoire, past and present. Open the catalog for album artwork and links to listen on Spotify.</p>
    <div className="band-catalog-actions">
      <button className="button" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{open?'Close the catalog ↑':'Explore the song catalog ↓'}</button>
      {!band.hidden&&<Link className="text-link" href={`/requests?band=${band.slug}`}>What should we learn next? ↗</Link>}
    </div>
    {open&&<div className="music-library" id={id}>
      {band.tributeMode&&<div className="library-mode" role="group" aria-label="Choose a music library">
        <button type="button" aria-pressed={view==='catalog'} onClick={()=>setView('catalog')}>Our song catalog</button>
        <button type="button" aria-pressed={view==='discography'} onClick={()=>setView('discography')}>Explore {band.tributeArtistName} albums</button>
      </div>}
      {view==='discography'?<Discography band={band}/>:<Songs band={band} defaultExpanded/>}
    </div>}
  </div>
}
