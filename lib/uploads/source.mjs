import { createHash } from 'node:crypto'
import { AIRTABLE_BASE, TABLES } from '../airtable.js'
import { bandsList } from '../bands.js'
import { SHOW_FIELD_IDS, VENUE_FIELD_IDS, chicagoDate, validOffset } from '../public/shows-contract.mjs'
import { buildUploadShowFormula, isEligibleUploadShow } from './policy.mjs'

const DRIVE_FIELD = 'fldnqQyo5loU2yac1'
const RECORD = /^rec[A-Za-z0-9]{14}$/
export const uploadShowId = id => `uploadshow_${createHash('sha256').update(`epl-fan-show-v1:${id}`).digest('base64url').slice(0,24)}`
export function driveFolderId(value) {
  if (typeof value !== 'string') return null
  try { const u=new URL(value); return u.protocol === 'https:' && u.hostname === 'drive.google.com' ? u.pathname.match(/^\/drive\/folders\/([-\w]{10,100})\/?$/)?.[1] || null : null } catch { return null }
}
export async function airtable(path, options={}) {
  const token=process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
  if (!token) throw new Error('source_unconfigured')
  const response=await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${path}`,{...options, headers:{Authorization:`Bearer ${token}`, 'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(10000)})
  if(!response.ok) throw new Error(`source_${response.status}`)
  return response.json()
}
export async function loadUploadShows({now=new Date(), request=airtable, approvedBands=bandsList}={}) {
  const rows=[]; const seen=new Set(); let offset
  do {
    const params=new URLSearchParams({returnFieldsByFieldId:'true',pageSize:'100',filterByFormula:buildUploadShowFormula(chicagoDate(now))})
    for(const field of [SHOW_FIELD_IDS.publish,SHOW_FIELD_IDS.date,SHOW_FIELD_IDS.bands,SHOW_FIELD_IDS.venue,SHOW_FIELD_IDS.status,DRIVE_FIELD]) params.append('fields[]',field)
    if(offset) params.set('offset',offset)
    const page=await request(`${TABLES.SHOWS}?${params}`)
    if(!Array.isArray(page.records) || page.records.length>100) throw new Error('source_invalid')
    for(const r of page.records){
      if(!RECORD.test(r?.id) || seen.has(r.id)) throw new Error('source_invalid')
      seen.add(r.id)
      if(isEligibleUploadShow(r.fields,now)) rows.push(r)
    }
    if(page.offset && (!validOffset(page.offset) || seen.has(`offset:${page.offset}`))) throw new Error('source_invalid')
    offset=page.offset; if(offset) seen.add(`offset:${offset}`)
    if(seen.size>5000) throw new Error('source_too_large')
  } while(offset)
  const venueIds=[...new Set(rows.flatMap(r=>Array.isArray(r.fields[SHOW_FIELD_IDS.venue]) ? r.fields[SHOW_FIELD_IDS.venue].filter(id=>RECORD.test(id)):[]))]
  const venues=new Map()
  for(let index=0;index<venueIds.length;index+=50){
    const ids=venueIds.slice(index,index+50)
    const params=new URLSearchParams({returnFieldsByFieldId:'true',pageSize:'100',filterByFormula:`OR(${ids.map(id=>`RECORD_ID()='${id}'`).join(',')})`})
    params.append('fields[]',VENUE_FIELD_IDS.name)
    const result=await request(`${TABLES.VENUES}?${params}`)
    if(!Array.isArray(result.records) || result.offset) throw new Error('venues_unavailable')
    for(const r of result.records) if(ids.includes(r.id) && typeof r.fields?.[VENUE_FIELD_IDS.name]==='string') venues.set(r.id,r.fields[VENUE_FIELD_IDS.name].trim())
  }
  return rows.flatMap(r=>{
    const f=r.fields; const linked=f[SHOW_FIELD_IDS.bands]; const venue=f[SHOW_FIELD_IDS.venue]
    if(!Array.isArray(linked) || !linked.length || linked.some(id=>!RECORD.test(id)) || !Array.isArray(venue) || venue.length!==1) return []
    const bands=linked.map(id=>approvedBands.find(b=>b.airtableId===id && !b.hidden))
    const name=venues.get(venue[0]); const showFolder=driveFolderId(f[DRIVE_FIELD])
    if(bands.some(b=>!b) || !name || /^(?:venue\s+)?(?:tba|tbd)$/i.test(name) || !showFolder) return []
    return [{recordId:r.id,bandIds:linked,showFolder,public:{id:uploadShowId(r.id),date:f[SHOW_FIELD_IDS.date],venue:name,bands:bands.map(b=>({slug:b.slug,name:b.name}))}}]
  }).sort((a,b)=>b.public.date.localeCompare(a.public.date)||a.public.venue.localeCompare(b.public.venue))
}
export async function findEligibleUploadShow(id) {
  if(!/^uploadshow_[A-Za-z0-9_-]{24}$/.test(id || '')) throw new Error('show_unavailable')
  const show=(await loadUploadShows()).find(s=>s.public.id===id)
  if(!show) throw new Error('show_unavailable')
  return show
}
export async function saveUploadReceipt(session, request=airtable) {
  const link=`https://drive.google.com/drive/folders/${session.folderId}`
  const params=new URLSearchParams({filterByFormula:`{Drive Folder Link}='${link}'`,maxRecords:'2',returnFieldsByFieldId:'true'})
  params.append('fields[]','fldmhZqmqlnORGHCx')
  const existing=await request(`${TABLES.UPLOADS}?${params}`)
  if(existing.records?.length===1 && RECORD.test(existing.records[0].id)) return existing.records[0].id
  if(!Array.isArray(existing.records) || existing.records.length>1) throw new Error('receipt_invalid')
  const fields={
    'fld454aOpnDhKrp73':session.name || 'Fan submission',
    'fldvskrMZqNNIewEP':[session.recordId], 'fldlZLnMSnCjqCMtN':session.bandIds,
    'fldoQudHDWll80R7O':session.email, 'fldrPQptDdTJV0Xtr':session.credit,
    'flddxdkTnPpIIjCDv':session.files.length, 'fldmhZqmqlnORGHCx':link,
    'fldWNOwRTucu88ov5':session.repost, 'fldWVAlu5UCU8LVnI':'New',
    'fldv3wY0DRAXuFUvp':`Website submission ${session.id}\nDelivery verified: ${new Date().toISOString()}\nAuthority acknowledged: true\nOptional repost permission: ${session.repost}\nConsent version: ${session.consentVersion}\nOriginal bytes: ${session.total}\nReview permission and source details before reuse. No marketing signup.`,
  }
  // Airtable upsert on the unique submission-folder URL prevents duplicate receipts
  // if a response is lost. The preceding read preserves later review status.
  const result=await request(TABLES.UPLOADS,{method:'PATCH',body:JSON.stringify({performUpsert:{fieldsToMergeOn:['fldmhZqmqlnORGHCx']},records:[{fields}],typecast:false})})
  const id=result.records?.[0]?.id
  if(result.records?.length!==1 || !RECORD.test(id)) throw new Error('receipt_unconfirmed')
  return id
}
