'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FILE_TYPES, mediaType, validateUploadSizes } from '@/lib/uploads/files.mjs'
import { checkSelectedMedia, fingerprintFile, nextChunkEnd, receivedOffset } from '@/lib/uploads/transfer.mjs'
import { track } from '@/lib/track'

const STORAGE='epl-fan-upload-v1'
const sizeLabel=n=>n>=1e9?`${(n/1e9).toFixed(2)} GB`:`${(n/1e6).toFixed(1)} MB`
const dateLabel=date=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`))
async function api(token, body) {
  const response=await fetch('/api/uploads',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body),cache:'no-store'})
  const data=await response.json()
  if(!response.ok) throw new Error(data.error || 'We couldn’t reach the upload service. Please try again.')
  return data
}
function putFile(url,file,start,end,onProgress,signal) {
  return new Promise((resolve,reject)=>{
    const xhr=new XMLHttpRequest()
    const abort=()=>xhr.abort()
    if(signal.aborted){reject(new Error('paused'));return}
    signal.addEventListener('abort',abort,{once:true})
    xhr.open('PUT',url)
    xhr.timeout=180000
    xhr.setRequestHeader('Content-Range',end===start?`bytes */${file.size}`:`bytes ${start}-${end-1}/${file.size}`)
    if(end!==start) xhr.setRequestHeader('Content-Type',mediaType(file.name))
    xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(Math.min(start+e.loaded,file.size-1))}
    const cleanup=()=>signal.removeEventListener('abort',abort)
    xhr.onload=()=>{cleanup();try{resolve(receivedOffset(xhr.status,xhr.getResponseHeader('Range'),file.size))}catch(e){reject(e)}}
    xhr.onerror=()=>{cleanup();reject(new Error('network'))}
    xhr.ontimeout=xhr.onerror
    xhr.onabort=()=>{cleanup();reject(new Error('paused'))}
    xhr.send(end===start?null:file.slice(start,end))
  })
}
export default function FanUpload({bands,initialBand=''}) {
  const [shows,setShows]=useState([]), [loading,setLoading]=useState(true), [band,setBand]=useState(initialBand)
  const [show,setShow]=useState(''), [files,setFiles]=useState([]), [details,setDetails]=useState({name:'',email:'',credit:'',authority:false,repost:false})
  const [session,setSession]=useState(null), [token,setToken]=useState(''), [saved,setSaved]=useState(false)
  const [busy,setBusy]=useState(false), [message,setMessage]=useState(''), [progress,setProgress]=useState([]), [phase,setPhase]=useState('')
  const controller=useRef(null), fileInput=useRef(null)
  useEffect(()=>{
    let active=true
    fetch('/api/uploads',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);if(active)setShows(d.shows)}).catch(e=>active&&setMessage(e.message)).finally(()=>active&&setLoading(false))
    try{const value=localStorage.getItem(STORAGE);if(/^[a-f0-9]{64}$/.test(value || '')){setToken(value);setSaved(true)}}catch{}
    return ()=>{active=false;controller.current?.abort()}
  },[])
  useEffect(()=>{if(!busy)return;const warn=e=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[busy])
  async function chooseFiles(event) {
    const selected=Array.from(event.target.files || [])
    setMessage('')
    if(!validateUploadSizes(selected).ok){setFiles([]);setMessage('Choose up to 20 files, no larger than 10 GB each or 20 GB together.');event.target.value='';return}
    if(selected.some(f=>!mediaType(f.name))){setFiles([]);event.target.value='';setMessage('Please choose JPG, PNG, WebP, HEIC, HEIF, AVIF, MP4, MOV, M4V or WebM files.');return}
    setFiles(selected);setProgress(selected.map(()=>0))
  }
  async function restore() {
    setBusy(true);setMessage('');setPhase('Finding your submission…')
    try {const s=await api(token,{action:'resume'});setSession(s);setShow(s.show.id);setProgress(s.files.map(()=>0));setSaved(false);if(s.complete)localStorage.removeItem(STORAGE)}catch(e){setMessage(e.message)}finally{setBusy(false);setPhase('')}
  }
  function reset() {
    controller.current?.abort();try{localStorage.removeItem(STORAGE)}catch{}
    setSession(null);setToken('');setSaved(false);setFiles([]);setProgress([]);setMessage('');setPhase('');setDetails({name:'',email:'',credit:'',authority:false,repost:false});if(fileInput.current)fileInput.current.value=''
  }
  async function upload(event) {
    event.preventDefault();setBusy(true);setMessage('');setPhase('Reading your files…')
    const aborter=new AbortController();controller.current=aborter
    let activeToken=token, current=session
    try {
      if(!files.length)throw new Error('Choose your photos and videos first.')
      const descriptors=await Promise.all(files.map(async f=>{await checkSelectedMedia(f);return {name:f.name,size:f.size,fingerprint:await fingerprintFile(f)}}))
      if(aborter.signal.aborted)throw new Error('paused')
      if(current){
        const unmatched=[...descriptors]
        if(current.files.length!==descriptors.length || current.files.some(expected=>{const i=unmatched.findIndex(f=>f.fingerprint===expected.fingerprint);if(i<0)return true;unmatched.splice(i,1);return false})) throw new Error('Please select the same original files for this submission. You can start a new submission to choose different files.')
        current=await api(activeToken,{action:'resume'})
        track('Upload resumed', { band: band || initialBand })
      } else {
        if(!activeToken){activeToken=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');setToken(activeToken);try{localStorage.setItem(STORAGE,activeToken)}catch{}}
        setPhase('Preparing your submission…')
        current=await api(activeToken,{action:'start',show,files:descriptors,...details})
        track('Upload started', { band: band || initialBand })
      }
      setSession(current);setSaved(false)
      if(current.complete){try{localStorage.removeItem(STORAGE)}catch{};return}
      const positions=current.files.map(()=>0)
      for(let index=0;index<current.files.length;index++) {
        const expected=current.files[index], file=files[descriptors.findIndex(f=>f.fingerprint===expected.fingerprint)]
        let url=expected.uploadUrl, offset=0, failures=0
        const report=n=>{positions[index]=n;setProgress([...positions])}
        setPhase(`Uploading file ${index+1} of ${current.files.length}`)
        const position=async()=>{
          try{
            // Some browsers cannot read Google's final response or Range header.
            // The website can confirm the position without proxying media bytes.
            try{const n=await putFile(url,file,0,0,()=>{},aborter.signal);if(n>0)return n}catch(e){if(e.message==='paused' || e.message==='session_gone')throw e}
            const status=await api(activeToken,{action:'file-status',index})
            if(status.complete)return file.size
            if(status.expired)throw new Error('session_gone')
            return status.offset
          }catch(e){
            if(e.message!=='session_gone')throw e
            const restarted=await api(activeToken,{action:'restart-file',index})
            if(restarted.fileComplete)return file.size
            url=restarted.uploadUrl;return 0
          }
        }
        offset=await position();report(offset)
        while(offset<file.size) {
          if(aborter.signal.aborted)throw new Error('paused')
          const end=nextChunkEnd(offset,file.size)
          try {
            const next=await putFile(url,file,offset,end,report,aborter.signal)
            if(next<=offset)throw new Error('transfer_failed')
            offset=next;failures=0;report(offset)
          } catch(e) {
            if(e.message==='paused')throw e
            if(++failures>3)throw new Error('Your connection was interrupted. Keep this page open and choose Resume upload when you’re ready.')
            setPhase('Connection interrupted. Checking the last saved part…')
            await new Promise(resolve=>setTimeout(resolve,1000*2**failures))
            offset=await position();report(offset)
            setPhase(`Uploading file ${index+1} of ${current.files.length}`)
          }
        }
      }
      setPhase('Checking delivery…')
      const completed=await api(activeToken,{action:'complete'})
      if(completed.complete)track('Upload completed', { band: band || initialBand })
      setSession(completed);try{localStorage.removeItem(STORAGE)}catch{}
    } catch(e) {track(e.message==='paused'?'Upload paused':'Upload interrupted', { band: band || initialBand });setMessage(e.message==='paused'?'Upload paused. Choose Resume upload when you’re ready.':/^(network|transfer_failed|invalid_upload_position)$/.test(e.message)?'Your connection was interrupted. Choose Resume upload when you’re ready.':e.message)} finally {setBusy(false);setPhase('');controller.current=null}
  }
  const available=shows.filter(s=>!band || s.bands.some(b=>b.slug===band))
  const total=(session?.files || files).reduce((n,f)=>n+f.size,0), received=progress.reduce((n,p)=>n+p,0)
  if(session?.complete)return <section className="fan-upload-panel fan-upload-thanks" aria-live="polite"><span className="fan-upload-check" aria-hidden="true">✓</span><h2>We got your files.</h2><p>Thanks for sharing the night with us. Your {session.files.length===1?'file is':'files are'} saved with {session.show.bands.map(b=>b.name).join(' + ')}’s {dateLabel(session.show.date)} show at {session.show.venue}.</p><p className="muted">Your reference: {session.reference}</p><button type="button" className="button button-dark" onClick={reset}>Share more photos & videos</button><Link href={initialBand?`/${initialBand}`:'/hub'}>Back to the links →</Link></section>
  return <form onSubmit={upload} className="fan-upload-panel">
    {saved && <div className="fan-upload-recovery"><strong>You have a saved submission.</strong><p>Pick up where you left off. After reopening the page, you’ll need to select the same original files.</p><button type="button" onClick={restore} disabled={busy}>Find my submission</button><button type="button" onClick={reset} disabled={busy}>Start fresh</button></div>}
    <fieldset disabled={busy || Boolean(session) || saved}>
      <legend><span>01</span> Find your show</legend>
      <label>Band<select value={band} onChange={e=>{setBand(e.target.value);setShow('')}}><option value="">All bands</option>{bands.map(b=><option value={b.slug} key={b.slug}>{b.name}</option>)}</select></label>
      <label>Show<select required value={show} onChange={e=>setShow(e.target.value)}><option value="">{loading?'Loading shows…':'Choose a show'}</option>{available.map(s=><option key={s.id} value={s.id}>{dateLabel(s.date)} · {s.venue} · {s.bands.map(b=>b.name).join(' + ')}</option>)}</select></label>
      {!loading && !available.length && <p>No shows are available for uploads here yet.</p>}
      <p className="muted">Announced shows from today and earlier. All dates use Central Time.</p>
    </fieldset>
    {session && <p className="fan-upload-selected"><strong>{session.show.bands.map(b=>b.name).join(' + ')}</strong><br/>{dateLabel(session.show.date)} · {session.show.venue}<br/><small>Reference: {session.reference}</small></p>}
    <fieldset disabled={busy || saved}>
      <legend><span>02</span> Add your photos & videos</legend>
      <label className="fan-upload-picker">{session?'Select the same original photos or videos to resume':'Choose photos or videos from your device'}<input ref={fileInput} type="file" multiple accept={[...Object.keys(FILE_TYPES).map(ext=>`.${ext}`),...new Set(Object.values(FILE_TYPES))].join(',')} onChange={chooseFiles}/></label>
      <p className="muted">Photos and videos only: JPG, PNG, WebP, HEIC, HEIF, AVIF, MP4, MOV, M4V and WebM.</p>
      <p className="muted">Up to 10 GB per file · 20 files · 20 GB per submission. Originals stay at their original quality.</p>
      {Boolean((session?.files || files).length) && <ul className="fan-upload-files">{(session?.files || files).map((f,i)=><li key={`${f.name}-${i}`}><span>{f.name}<small>{sizeLabel(f.size)}</small></span><span>{progress[i]>=f.size?'Uploaded':progress[i]>0?`${Math.floor(progress[i]/f.size*100)}%`:''}</span></li>)}</ul>}
    </fieldset>
    {!session && <fieldset disabled={busy || saved}><legend><span>03</span> A couple of details</legend>
      <div className="fan-upload-details"><label>Name <small>(optional)</small><input maxLength={80} autoComplete="name" value={details.name} onChange={e=>setDetails({...details,name:e.target.value})}/></label><label>Email <small>(optional)</small><input type="email" maxLength={120} autoComplete="email" value={details.email} onChange={e=>setDetails({...details,email:e.target.value})}/></label></div>
      <label>Photo or video credit <small>(optional)</small><input maxLength={100} placeholder="Your name or Instagram handle" value={details.credit} onChange={e=>setDetails({...details,credit:e.target.value})}/></label>
      <label className="fan-upload-consent"><input type="checkbox" required checked={details.authority} onChange={e=>setDetails({...details,authority:e.target.checked})}/><span>I took these photos or videos, or I have permission to share them with Echo Play Live.</span></label>
      <label className="fan-upload-consent"><input type="checkbox" checked={details.repost} onChange={e=>setDetails({...details,repost:e.target.checked})}/><span>Echo Play Live and the band may repost these photos or videos on their website and social pages. <small>Optional. You can still send your files without choosing this.</small></span></label>
    </fieldset>}
    {busy && <div role="status" className="fan-upload-progress"><strong>{phase}</strong><progress max={total || 1} value={received}/><small>{sizeLabel(received)} of {sizeLabel(total)} uploaded</small></div>}
    {message && <p role="alert" className="fan-upload-message">{message}</p>}
    <div className="fan-upload-actions"><button className="button button-dark" type="submit" disabled={busy || saved || (!session && (!show || !files.length))}>{busy?'Working…':session?'Resume upload':'Send photos & videos'}</button>{busy && <button type="button" onClick={()=>controller.current?.abort()} disabled={!controller.current}>Pause</button>}{!busy && token && !saved && <button type="button" onClick={reset}>Start a new submission</button>}</div>
    <p className="fan-upload-note">Keep this page open while uploading. If your connection drops, you can resume here for up to three days. Your files go to the band’s private show folder. This does not sign you up for email updates. <Link href="/privacy">Privacy details</Link>.</p>
  </form>
}
