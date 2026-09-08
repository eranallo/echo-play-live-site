'use client'
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/track'
import SongRequestModal from './SongRequestModal'

export default function SongVotes({ band }) {
  const id=useId()
  const visitor=useRef(null)
  const activeRequest=useRef(null)
  const [board,setBoard]=useState(null)
  const [busy,setBusy]=useState('status')
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [query,setQuery]=useState('')
  const [limit,setLimit]=useState(30)
  const [suggesting,setSuggesting]=useState(false)
  async function update(action='status',song) {
    if (activeRequest.current) return
    const controller=new AbortController()
    activeRequest.current=controller
    const timeout=setTimeout(()=>controller.abort(),15000)
    setBusy(song || 'status');setError('')
    try {
      if (!visitor.current) {
        let saved
        try {saved=localStorage.getItem('epl-song-voter:v1')} catch {}
        visitor.current=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(saved || '') ? saved : crypto.randomUUID()
        try {localStorage.setItem('epl-song-voter:v1',visitor.current)} catch {setNotice('Your browser can remember these picks for this visit only.')}
      }
      const response=await fetch(`/api/song-votes/${band.slug}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,song,visitor:visitor.current}),signal:controller.signal})
      const data=await response.json()
      if (Array.isArray(data.songs) && Array.isArray(data.voted)) setBoard(data)
      if (!response.ok) throw new Error(data.error || 'Please try again.')
      if (action!=='status') {
        setNotice(action==='vote' ? 'Your vote is in. Thanks for the request!' : 'Vote removed. You can choose another song.')
        track('Song vote saved',{band:band.slug})
      }
    } catch(error) {
      if (!controller.signal.aborted || activeRequest.current===controller) setError(error.name==='AbortError' ? 'We couldn’t confirm that change. Refresh the chart to check your saved picks.' : error.message)
    } finally {
      clearTimeout(timeout)
      if(activeRequest.current===controller) {activeRequest.current=null;setBusy('')}
    }
  }
  useEffect(()=>{
    update()
    return ()=>{const request=activeRequest.current;activeRequest.current=null;request?.abort()}
    // The parent remounts this component when the selected band changes.
  },[])
  const songs=board?.songs || []
  const leaders=songs.filter(song=>song.votes>0).slice(0,10)
  const max=leaders[0]?.votes || 1
  const filtered=songs.filter(song=>`${song.title} ${song.artist}`.toLowerCase().includes(query.trim().toLowerCase()))
  const picks=songs.filter(song=>board?.voted.includes(song.id))
  return <section className="shell section-bottom vote-board" aria-labelledby={`${id}-title`}>
    <div className="vote-heading">
      <div><p className="eyebrow">{band.name}</p><h2 id={`${id}-title`}>What do you want to hear?</h2></div>
      <button type="button" className="button button-outline" onClick={()=>update()} disabled={Boolean(busy)}>Refresh chart ↻</button>
    </div>
    <p className="vote-intro">Pick up to three songs from our catalog. The chart stays open between shows, and you can change your picks anytime. Requests help us plan; they don’t guarantee a song will be played.</p>
    <div className="vote-status" role="status">{busy==='status' ? 'Checking the latest votes…' : notice}</div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {board && <div className="vote-layout">
      <div className="vote-chart">
        <h3>The crowd’s picks</h3>
        <p className="vote-total">{board.totalVotes.toLocaleString()} {board.totalVotes===1 ? 'vote' : 'votes'} · Top {Math.min(10,leaders.length) || 'requests'}</p>
        {leaders.length ? <ol className="vote-bars">{leaders.map(song=><li key={song.id}>
          <div className="vote-bar-label"><span><strong>{song.title}</strong><small>{song.artist}</small></span><span>{song.votes} {song.votes===1?'vote':'votes'}</span></div>
          <div className="vote-bar-track" aria-hidden="true"><div style={{width:`${song.votes/max*100}%`,background:band.color}} /></div>
        </li>)}</ol> : <div className="vote-empty"><p>No votes yet.</p><p>Be the first to put a song on the chart.</p></div>}
        <div className="vote-picks">
          <h3>Your picks · {picks.length}/{board.maxVotes}</h3>
          {picks.length ? <ul>{picks.map(song=><li key={song.id}><span>{song.title}<small>{song.artist}</small></span><button type="button" disabled={Boolean(busy)} onClick={()=>update('remove',song.id)} aria-label={`Remove your vote for ${song.title}`}>Remove</button></li>)}</ul> : <p>Choose a song to get started.</p>}
          <p className="form-note">Picks are remembered in this browser. No account or email needed. <Link href="/privacy">Privacy details</Link>.</p>
        </div>
      </div>
      <div className="vote-catalog">
        <label htmlFor={`${id}-search`}>Find a song or artist</label>
        <input id={`${id}-search`} type="search" value={query} maxLength={100} onChange={e=>{setQuery(e.target.value);setLimit(30)}} placeholder="Search the catalog" />
        <p className="form-note" role="status">{filtered.length} {filtered.length===1?'song':'songs'}{query ? ' found' : ' in the catalog'}</p>
        <ul>{filtered.slice(0,limit).map(song=>{
          const picked=board.voted.includes(song.id)
          return <li key={song.id}><span><strong>{song.title}</strong><small>{song.artist}</small></span><button type="button" aria-pressed={picked} aria-label={`${picked?'Remove your vote for':'Vote for'} ${song.title} by ${song.artist}`} disabled={Boolean(busy) || (!picked && picks.length>=board.maxVotes)} onClick={()=>update(picked?'remove':'vote',song.id)}>{busy===song.id?'Saving…':picked?'Voted ✓':'+ Vote'}</button></li>
        })}</ul>
        {!filtered.length && <p className="vote-empty">No matches. Try another title or artist.</p>}
        {filtered.length>limit && <button type="button" className="text-link vote-more" onClick={()=>setLimit(limit+30)}>Show more songs ↓</button>}
        <div className="vote-suggestion"><p>Something missing?</p><button type="button" className="text-link" onClick={()=>setSuggesting(true)}>Suggest a song for us to learn ↗</button><p className="form-note">Suggestions go to the band for review. They don’t appear on the chart automatically.</p></div>
      </div>
    </div>}
    <SongRequestModal open={suggesting} onClose={()=>setSuggesting(false)} band={band} />
  </section>
}
