import { chicagoDate, validDateOnly, SHOW_FIELD_IDS } from '../public/shows-contract.mjs'

// Upload intake has its own calendar policy; it must not reuse the upcoming-show feed.
export { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_BATCH_BYTES, MAX_UPLOAD_FILES, validateUploadSizes } from './files.mjs'

export function buildUploadShowFormula(today) {
  if (!validDateOnly(today)) throw new Error('INVALID_CHICAGO_DATE')
  return `AND({Publish to Website}=TRUE(),{Date}<='${today}',OR({Status}='Confirmed',{Status}='Completed'))`
}

// Call on authoritative source fields when listing, starting, resuming and completing uploads.
// The request must never supply publication state, the trusted clock or a Drive destination.
export function isEligibleUploadShow(fields, now = new Date()) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return false
  const today = chicagoDate(now)
  const date = fields[SHOW_FIELD_IDS.date]
  return Boolean(today && fields[SHOW_FIELD_IDS.publish] === true &&
    validDateOnly(date) && date <= today &&
    ['Confirmed', 'Completed'].includes(fields[SHOW_FIELD_IDS.status]))
}
