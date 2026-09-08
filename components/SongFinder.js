'use client'
import { useEffect, useId, useRef, useState } from 'react'

export default function SongFinder({onAdd,busy,full,onSuggest,initialQuery=''}) {
  const id=useId()
  const request=useRef(null)
  const [query,setQuery]=useState(initialQuery)
  const [results,setResults]=useState(null)
  const [searching,setSearching]=useState(false)
  const [error,setError]=useState('')
  async function search(event) {
    event?.preventDefault()
    if(query.trim().length<2)return
    request.current?.abort()
    const controller=new AbortController();request.current=controller
    const timer=setTimeout(()=>controller.abort(),15000)
    setSearching(true);setError('');setResults(null)
    try {
      const response=await fetch(`/api/song-search?q=${encodeURIComponent(query.trim())}`,{signal:controller.signal})
      const data=await response.json()
      if(!response.ok) throw new Error(data.error || 'Please try searching again.')
      if(request.current===controller)setResults(data.songs || [])
    } catch(error) {if(request.current===controller)setError(error.name==='AbortError'?'Search took too long. Please try again.':error.message)}
    finally {clearTimeout(timer);if(request.current===controller){setSearching(false);request.current=null}}
  }
  useEffect(()=>()=>{request.current?.abort();request.current=null},[])
  return <section className="song-finder" aria-labelledby={`${id}-title`}>
    <div className="song-finder-heading"><div><p className="eyebrow">Something we haven’t played?</p><h3 id={`${id}-title`}>Add a song to learn.</h3></div><span className="song-finder-mark" aria-hidden="true">＋</span></div>
    <p>Find the original track, then add it to the chart with your vote. Everyone can vote for it from there.</p>
    <form onSubmit={search} className="song-finder-form">
      <label className="sr-only" htmlFor={`${id}-query`}>Search for a new song or artist</label>
      <input id={`${id}-query`} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Song, artist, or Spotify track link" minLength={2} maxLength={180} required />
      <button className="button" type="submit" disabled={searching}>{searching?'Searching…':'Find a song ↗'}</button>
    </form>
    {error && <p className="form-error" role="alert">{error}</p>}
    {results && <div className="song-search-results">
      <p className="form-note" role="status">{results.length ? 'Choose the version you have in mind. Results from Spotify.' : 'No matches yet. Try the title and artist together, or send us a suggestion below.'}</p>
      <div className="request-card-grid">{results.map(song=><article className="request-song-card" key={song.spotifyId}>
        <a className="request-song-cover" href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${song.title} by ${song.artist} on Spotify`}>
          {song.albumArt?<img src={song.albumArt} alt="" loading="lazy" width="64" height="64"/>:<span aria-hidden="true">♪</span>}
        </a>
        <div className="request-song-info"><strong>{song.title}</strong><small>{song.artist}</small><a className="request-spotify" href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">Spotify ↗</a></div>
        <button className="request-vote-button" disabled={busy || full} onClick={async()=>{if(await onAdd(song.spotifyId)){setResults(null);setQuery('')}}} type="button" aria-label={`Request ${song.title} by ${song.artist}`}>Add + vote</button>
      </article>)}</div>
      {full && <p className="form-note">Your three picks are full. Remove one below to add another song.</p>}
    </div>}
    <button className="song-finder-fallback text-link" type="button" onClick={onSuggest}>Can’t find it? Send us a suggestion ↗</button>
    <p className="song-finder-note">Only the song and artist appear publicly. You’re helping us choose what to learn, not booking a place in the set.</p>
  </section>
}
