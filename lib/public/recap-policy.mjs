import { SHOW_FIELD_IDS as F, chicagoDate, validDateOnly } from './shows-contract.mjs'
// Editorial approval is separate from upload permission. A recap also requires
// every source show to remain published and completed when it is requested.
export function recapIsPublished(records, sources, date, now = new Date()) {
  const today = chicagoDate(now)
  if (!today || !validDateOnly(date) || date >= today || !Array.isArray(records) || records.length !== sources.length) return false
  return sources.every(source => {
    const f = records.find(record => record.id === source.id)?.fields
    return f?.[F.publish] === true && f[F.status] === 'Completed' && f[F.date] === date &&
      Array.isArray(f[F.bands]) && f[F.bands].includes(source.band) &&
      Array.isArray(f[F.venue]) && f[F.venue].length === 1 && f[F.venue][0] === source.venue
  })
}
