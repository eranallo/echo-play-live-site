'use client'
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'

// Unplayed-song suggestions remain private and separate from public catalog votes.
export default function SongRequestModal({open,onClose,band,prefill=null}) {
  const dialog=useRef(null)
  const close=useRef(onClose)
  close.current=onClose
  const id=useId()
  const [status,setStatus]=useState('idle')
  const [error,setError]=useState('')
  useEffect(()=>{
    if(!open || !dialog.current) return
    setStatus('idle');setError('')
    const previous=document.activeElement
    dialog.current.showModal()
    return ()=>previous?.focus?.()
  },[open])
  async function submit(event) {
    event.preventDefault()
    if(status==='sending')return
    const fields=new FormData(event.currentTarget)
    setStatus('sending');setError('')
    try {
      const response=await fetch('/api/song-request',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({
        bandSlug:band.slug,songTitle:fields.get('songTitle'),originalArtist:fields.get('originalArtist'),
        requesterName:fields.get('requesterName'),requesterEmail:fields.get('requesterEmail'),message:fields.get('message'),company:fields.get('company'),
        album:prefill?.album || '',spotifyTrackId:prefill?.spotifyTrackId || '',spotifyTrackUrl:prefill?.spotifyTrackUrl || '',
      })})
      const data=await response.json()
      if(!response.ok || data.ok!==true)throw new Error(data.error || 'We couldn’t save your suggestion. Please try again.')
      setStatus('success')
    } catch(error){setStatus('error');setError(error.name==='TimeoutError'?'We couldn’t confirm your suggestion. Your details are still here; please try again.':error.message)}
  }
  if(!open)return null
  return <dialog ref={dialog} className="song-suggestion-dialog" aria-labelledby={`${id}-title`} onCancel={()=>close.current?.()} onClick={event=>{if(event.target===dialog.current)close.current?.()}}>
    <div className="suggestion-dialog-body">
      <button type="button" className="suggestion-close" onClick={()=>close.current?.()} aria-label="Close song suggestion">×</button>
      <p className="eyebrow">{band.name || band.shortName}</p>
      <h2 id={`${id}-title`}>{status==='success'?'Thanks for the suggestion!':'What should we learn?'}</h2>
      {status==='success'?<div role="status"><p>Your suggestion is saved for the band to review. It stays private and doesn’t add a vote to the chart.</p><button className="button" type="button" onClick={()=>close.current?.()}>Done</button></div>:<>
        <p>Have something in mind that we don’t play yet? Let us know. Name and email are optional.</p>
        <form onSubmit={submit}>
          <fieldset disabled={status==='sending'}>
            <label>Song title *<input name="songTitle" required maxLength={200} defaultValue={prefill?.songTitle || ''} /></label>
            <label>Original artist *<input name="originalArtist" required maxLength={200} defaultValue={prefill?.originalArtist || ''} /></label>
            <label>Your name (optional)<input name="requesterName" autoComplete="name" maxLength={80}/></label>
            <label>Email (optional)<input name="requesterEmail" type="email" autoComplete="email" maxLength={120}/></label>
            <label>Anything else? (optional)<textarea name="message" maxLength={1000}/></label>
            <div className="hp-field" aria-hidden="true"><label>Leave blank<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
          </fieldset>
          <p className="form-note">* Required. This note goes privately to the band for review. It doesn’t add a public vote or subscribe you to emails. <Link href="/privacy">Privacy details</Link>.</p>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="button" type="submit" disabled={status==='sending'}>{status==='sending'?'Saving…':'Send song suggestion ↗'}</button>
        </form>
      </>}
    </div>
  </dialog>
}
