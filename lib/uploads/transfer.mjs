import { UPLOAD_CHUNK_BYTES } from './files.mjs'
export function receivedOffset(status, range, total) {
  if(status===200 || status===201) return total
  if(status!==308) throw new Error(status===404?'session_gone':'transfer_failed')
  if(!range) return 0
  const match=/^bytes=0-(\d+)$/.exec(range)
  const offset=match ? Number(match[1])+1 : NaN
  if(!Number.isSafeInteger(offset) || offset<1 || offset>total) throw new Error('invalid_upload_position')
  return offset
}
export const nextChunkEnd=(offset,total)=>Math.min(offset+UPLOAD_CHUNK_BYTES,total)
export async function fingerprintFile(file) {
  const first=await file.slice(0,65536).arrayBuffer(), last=await file.slice(Math.max(0,file.size-65536)).arrayBuffer()
  const label=new TextEncoder().encode(`${file.name}:${file.size}:`)
  const bytes=new Uint8Array(label.length+first.byteLength+last.byteLength)
  bytes.set(label);bytes.set(new Uint8Array(first),label.length);bytes.set(new Uint8Array(last),label.length+first.byteLength)
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')
}
