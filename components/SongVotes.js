'use client'
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/track'
import SongRequestModal from './SongRequestModal'
import SongFinder from './SongFinder'

export default function SongVotes({band,initialQuery=''}) {
  const id=useId(), visitor=useRef(null), activeRequest=useRef(null)
  const [board,setBoard]=useState(null), [busy,setBusy]=useState('status')
  const [error,setError]=useState(''), [notice,setNotice]=useState('')
  const [query,setQuery]=useState(''), [page,setPage]=useState(0)
  const [view,setView]=useState('learn'), [suggesting,setSuggesting]=useState(false)
  const [artwork,setArtwork]=useState(null)
  async function update(action='status',song,spotifyId) {
    if(activeRequest.current)return
    const controller=new AbortController();activeRequest.current=controller
    const timeout=setTimeout(()=>controller.abort(),25000)
    setBusy(song || spotifyId || 'status');setError('')
    try {
      if(!visitor.current) {
        let saved;try{saved=localStorage.getItem('epl-song-voter:v1')}catch{}
        visitor.current=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(saved || '') ? saved : crypto.randomUUID()
        try{localStorage.setItem('epl-song-voter:v1',visitor.current)}catch{setNotice('Your browser can remember these picks for this visit only.')}
      }
      const response=await fetch(`/api/song-votes/${band.slug}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,song,spotifyId,visitor:visitor.current}),signal:controller.signal})
      const data=await response.json()
      if(activeRequest.current!==controller)return
      if(Array.isArray(data.songs) && Array.isArray(data.voted))setBoard(data)
      if(!response.ok)throw new Error(data.error || 'Please try again.')
      if(action!=='status') {
        setNotice(action==='remove'?'Vote removed. You can choose another song.':action==='add'?'Your request and vote are saved. Thanks for helping us choose what’s next!':'Your vote is in. Thanks!')
        track('Song vote saved',{band:band.slug})
        if(data.requestedId) {setView(data.songs.find(s=>s.id===data.requestedId)?.kind || 'learn');setQuery('');setPage(0)}
      }
      return true
    } catch(error){if(activeRequest.current===controller)setError(error.name==='AbortError'?'We couldn’t confirm that change. Refresh the chart to check your saved picks.':error.message)}
    finally{clearTimeout(timeout);if(activeRequest.current===controller){activeRequest.current=null;setBusy('')}}
  }
  useEffect(()=>{update();return()=>{const request=activeRequest.current;activeRequest.current=null;request?.abort()}},[])
  useEffect(()=>{
    if(view!=='catalog' || artwork)return
    const controller=new AbortController()
    fetch(`/api/songs/${band.slug}`,{signal:controller.signal}).then(r=>r.ok?r.json():null).then(data=>{if(data&&!controller.signal.aborted)setArtwork(Object.fromEntries((data.songs||[]).map(song=>[song.id,song])))}).catch(()=>{})
    return()=>controller.abort()
  },[view,band.slug,artwork])
  const songs=board?.songs || []
  const selected=songs.filter(song=>song.kind===view)
  const leaders=selected.filter(song=>song.votes>0).slice(0,5), max=leaders[0]?.votes || 1
  const filtered=selected.filter(song=>`${song.title} ${song.artist}`.toLowerCase().includes(query.trim().toLowerCase()))
  const picks=songs.filter(song=>board?.voted.includes(song.id)), pages=Math.ceil(filtered.length/8), currentPage=Math.min(page,Math.max(0,pages-1))
  return <section className="shell section-bottom vote-board request-workspace" aria-labelledby={`${id}-title`} style={{'--request-accent':band.color}}>
    <div className="vote-heading"><h2 id={`${id}-title`}>{band.name} requests</h2><Link className="text-link" href={`/bands/${band.slug}#music`}>Explore our song catalog ↗</Link></div>
    <p className="vote-intro">Add something new, back another fan’s idea, or bring an old favorite back. You get three picks per band, and you can change them anytime.</p>
    <div className="request-view-switch" role="group" aria-label="Choose a request chart">
      <button type="button" aria-pressed={view==='learn'} onClick={()=>{setView('learn');setQuery('');setPage(0)}}>Songs to learn <span>{songs.filter(s=>s.kind==='learn').length}</span></button>
      <button type="button" aria-pressed={view==='catalog'} onClick={()=>{setView('catalog');setQuery('');setPage(0)}}>Bring it back <span>{songs.filter(s=>s.kind==='catalog').length}</span></button>
    </div>
    {view==='learn' && <SongFinder initialQuery={initialQuery} busy={Boolean(busy)} full={picks.length>=3} onAdd={spotifyId=>update('add',undefined,spotifyId)} onSuggest={()=>setSuggesting(true)} />}
    {view==='catalog' && <div className="request-catalog-intro"><h3>An old favorite deserves another night.</h3><p>These songs are in our repertoire, past or present. A vote here asks us to bring one back or keep it in rotation. It doesn’t mean it’s retired—or on tonight’s setlist.</p><Link className="text-link" href={`/bands/${band.slug}#music`}>Browse the artwork and listen on Spotify ↗</Link></div>}
    <div className="vote-status" role="status">{busy==='status'?'Checking the latest votes…':notice}</div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {board && <>
      <div className="request-picks-strip"><h3>Your picks <span>{picks.length}/{board.maxVotes}</span></h3>
        {picks.length?<ul>{picks.map(song=><li key={song.id}><span>{song.title}<small>{song.kind==='learn'?'Learn it':'Bring it back'}</small></span><button type="button" disabled={Boolean(busy)} onClick={()=>update('remove',song.id)} aria-label={`Remove your vote for ${song.title}`}>×</button></li>)}</ul>:<p>Your three picks can include new songs and old favorites.</p>}
      </div>
      <div className="request-results-layout">
        <aside className="request-chart" aria-label={view==='learn'?'Most requested new songs':'Most requested catalog songs'}>
          <p className="eyebrow">The crowd’s picks</p><h3>{view==='learn'?'Next to learn?':'Bring these back.'}</h3>
          <p className="vote-total">{selected.reduce((n,s)=>n+s.votes,0)} votes · {view==='learn'?'new songs':'from our catalog'}</p>
          {leaders.length?<ol className="vote-bars">{leaders.map(song=><li key={song.id}><div className="vote-bar-label"><span><strong>{song.title}</strong><small>{song.artist}</small></span><span>{song.votes}</span></div><div className="vote-bar-track" aria-hidden="true"><div style={{width:`${song.votes/max*100}%`,background:band.color}}/></div></li>)}</ol>:<p className="vote-empty">{view==='learn'?'The next addition could be your idea. Find a song above to start the chart.':'Pick a favorite to start this chart.'}</p>}
          <button type="button" className="text-link request-refresh" disabled={Boolean(busy)} onClick={()=>update()}>Refresh chart ↻</button>
        </aside>
        <div className="request-browse"><div className="request-browse-heading"><h3>{view==='learn'?'Fan requests':'From our catalog'}</h3><span>{selected.length} songs</span></div>
          {selected.length>0 && <><label className="sr-only" htmlFor={`${id}-search`}>Filter {view==='learn'?'fan requests':'the catalog'}</label><input id={`${id}-search`} type="search" className="request-filter" value={query} maxLength={100} onChange={e=>{setQuery(e.target.value);setPage(0)}} placeholder={view==='learn'?'Find a fan request':'Find a song or artist'}/></>}
          <div className="request-card-grid">{filtered.slice(currentPage*8,currentPage*8+8).map(song=>{
            const picked=board.voted.includes(song.id), media=artwork?.[song.id] || song
            return <article className="request-song-card" key={song.id}>
              <div className="request-song-cover">{media.albumArt?<img src={media.albumArt} alt="" width="64" height="64" loading="lazy"/>:<span aria-hidden="true">♪</span>}</div>
              <div className="request-song-info"><strong>{song.title}</strong><small>{song.artist}</small><span className="request-song-count">{song.votes} {song.votes===1?'vote':'votes'}</span>{media.spotifyUrl&&<a className="request-spotify" href={media.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${song.title} on Spotify`}>Spotify ↗</a>}</div>
              <button className="request-vote-button" type="button" aria-pressed={picked} aria-label={`${picked?'Remove your vote for':'Vote for'} ${song.title} by ${song.artist}`} disabled={Boolean(busy)||(!picked&&picks.length>=board.maxVotes)} onClick={()=>update(picked?'remove':'vote',song.id)}>{picked?'Voted ✓':'+ Vote'}</button>
            </article>
          })}</div>
          {!filtered.length&&<div className="request-no-results"><h4>{selected.length?'No matching songs.':'Room for something new.'}</h4><p>{view==='learn'?'Use the song search above to add a request everyone can vote for.':'Try another song title or artist.'}</p></div>}
          {pages>1&&<nav className="request-pagination" aria-label="Song pages"><button type="button" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>← Previous</button><span role="status">{currentPage+1} / {pages}</span><button type="button" disabled={currentPage+1>=pages} onClick={()=>setPage(currentPage+1)}>Next →</button></nav>}
        </div>
      </div>
      <p className="form-note request-privacy">The charts stay open between shows. Picks are remembered in this browser; no account or email needed. Requests help us plan and don’t guarantee a performance. <Link href="/privacy">Privacy details</Link>.</p>
    </>}
    <SongRequestModal open={suggesting} onClose={()=>setSuggesting(false)} band={band}/>
  </section>
}
