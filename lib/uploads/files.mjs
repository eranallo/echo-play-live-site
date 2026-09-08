export const MAX_UPLOAD_FILE_BYTES = 10_000_000_000
export const MAX_UPLOAD_BATCH_BYTES = 20_000_000_000
export const MAX_UPLOAD_FILES = 20
export const UPLOAD_CHUNK_BYTES = 8 * 1024 * 1024
export const FILE_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  heic: 'image/heic', heif: 'image/heif', avif: 'image/avif',
  mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v', webm: 'video/webm',
}
export function mediaType(name) { const extension=String(name).split('.').pop().toLowerCase();return Object.hasOwn(FILE_TYPES,extension)?FILE_TYPES[extension]:null }
export function hasMediaSignature(bytes, mimeType) {
  const hex=Array.from(bytes.slice(0,12),b=>b.toString(16).padStart(2,'0')).join('')
  const ascii=new TextDecoder('latin1').decode(bytes)
  if(mimeType==='image/jpeg')return hex.startsWith('ffd8ff')
  if(mimeType==='image/png')return hex.startsWith('89504e470d0a1a0a')
  if(mimeType==='image/webp')return ascii.startsWith('RIFF') && ascii.slice(8,12)==='WEBP'
  if(mimeType==='video/webm')return hex.startsWith('1a45dfa3')
  if(mimeType==='video/quicktime' && ['moov','wide','mdat'].includes(ascii.slice(4,8)))return true
  if(ascii.slice(4,8)!=='ftyp')return false
  const brands=ascii.slice(8,64)
  if(['image/heic','image/heif'].includes(mimeType))return /heic|heix|hevc|hevx|mif1|msf1/.test(brands)
  if(mimeType==='image/avif')return /avif|avis/.test(brands)
  return ['video/mp4','video/quicktime','video/x-m4v'].includes(mimeType) && /isom|iso[2-9]|mp4[12]|avc1|M4V |M4VH|M4VP|qt  |MSNV|3gp/.test(brands)
}
export function validateUploadSizes(files) {
  if (!Array.isArray(files) || !files.length || files.length > MAX_UPLOAD_FILES) return { ok: false, reason: 'file_count' }
  let total = 0
  for (const file of files) {
    if (!Number.isSafeInteger(file?.size) || file.size <= 0 || file.size > MAX_UPLOAD_FILE_BYTES) return { ok: false, reason: 'file_size' }
    total += file.size
    if (total > MAX_UPLOAD_BATCH_BYTES) return { ok: false, reason: 'batch_size' }
  }
  return { ok: true, total }
}
export function validateSubmission(body) {
  const sizes = validateUploadSizes(body?.files)
  if (!sizes.ok) throw new Error('Choose up to 20 files, no larger than 10 GB each or 20 GB together.')
  if (body.authority !== true) throw new Error('Please confirm that you have permission to share these files.')
  if (!/^uploadshow_[A-Za-z0-9_-]{24}$/.test(body.show || '')) throw new Error('Please choose a show from the list.')
  const files = body.files.map((f) => {
    if (typeof f.name !== 'string' || !f.name.trim() || f.name.length > 180 || /[\x00-\x1f\x7f/\\]/.test(f.name) || !mediaType(f.name)) throw new Error('Please choose supported photos or videos with valid filenames.')
    if (!/^[a-f0-9]{64}$/.test(f.fingerprint || '')) throw new Error('We couldn’t read one of your files. Please select it again.')
    return { name: f.name, size: f.size, mimeType: mediaType(f.name), fingerprint: f.fingerprint }
  })
  const details = {}
  for (const [key, limit] of [['name', 80], ['email', 120], ['credit', 100]]) {
    if (body[key] != null && typeof body[key] !== 'string') throw new Error('Please check your contact details.')
    details[key] = (body[key] || '').trim()
    if (details[key].length > limit || /[\x00-\x1f\x7f]/.test(details[key])) throw new Error('Please shorten your contact details.')
  }
  if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) throw new Error('Please check your email address or leave it blank.')
  return { show: body.show, files, total: sizes.total, ...details, authority: true, repost: body.repost === true, consentVersion: '2026-09-07' }
}
