import { BlobPreconditionFailedError } from '@vercel/blob'
import { readJournal, writeJournal } from './uploads/journal.mjs'

// Attempt cap, including retries, stays below the provider's 100/day allowance.
// Only timestamps are retained; no inquiry/contact content is stored here.
export const BOOKING_DAILY_CAP = 50
export function bookingQuota(entries, now) {
  if (!Array.isArray(entries) || entries.some(at => !Number.isSafeInteger(at) || at < 0 || at > now + 60000)) throw new Error('quota_invalid')
  const active = entries.filter(at => at > now - 86400000)
  return { available: active.length < BOOKING_DAILY_CAP, active }
}
export async function reserveBookingSend({ read=readJournal, write=writeJournal, now=Date.now() } = {}) {
  for (let attempt=0; attempt<6; attempt++) {
    const row = await read('booking-email/v1-quota.json')
    const quota = bookingQuota(row === null ? [] : row?.data?.attempts, now)
    if (!quota.available) throw new Error('booking_cap')
    try {
      await write('booking-email/v1-quota.json', {attempts:[...quota.active,now]}, row?.etag)
      return
    } catch (error) {
      if (!(error instanceof BlobPreconditionFailedError) && !/already exists/i.test(error.message)) throw error
    }
  }
  throw new Error('quota_busy')
}
