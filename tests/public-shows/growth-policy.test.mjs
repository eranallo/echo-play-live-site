import test from 'node:test'
import assert from 'node:assert/strict'
import { checkUploadQuota } from '../../lib/uploads/quota.mjs'
import { recapIsPublished } from '../../lib/public/recap-policy.mjs'
import { SHOW_FIELD_IDS as F } from '../../lib/public/shows-contract.mjs'

test('crowd uploads share a network without losing daily, monthly, byte or retry limits', () => {
  const now = 1_800_000_000_000
  const rows = count => Array.from({ length: count }, (_, i) => ({ id: String(i), ip: 'venue', total: 1000, at: now - 10000 }))
  const next = { id: 'new', total: 1000, ip: 'venue', now }
  assert.equal(checkUploadQuota(rows(4), next).code, 'available')
  assert.equal(checkUploadQuota(rows(39), next).code, 'available')
  assert.equal(checkUploadQuota(rows(40), next).code, 'upload_quota')
  assert.equal(checkUploadQuota(rows(80), { ...next, ip: 'another' }).code, 'upload_quota')
  assert.equal(checkUploadQuota(rows(150).map(row => ({ ...row, at: now - 2 * 86400000 })), next).code, 'upload_quota')
  assert.equal(checkUploadQuota([{ id: 'old', ip: 'elsewhere', total: 100_000_000_000, at: now }], next).code, 'upload_quota')
  assert.equal(checkUploadQuota(rows(40), { ...next, id: '0' }).code, 'reserved')
  assert.equal(checkUploadQuota(rows(40), { ...next, id: '0', total: 2000 }).code, 'session_conflict')
  assert.equal(checkUploadQuota(rows(150).map(row => ({ ...row, at: now - 32 * 86400000 })), next).code, 'available')
})
test('editorial recaps require every exact source show to remain completed, published and in the past', () => {
  const sources = [{ id: 'first', band: 'band-a', venue: 'venue' }, { id: 'second', band: 'band-b', venue: 'venue' }]
  const records = sources.map(s => ({ id: s.id, fields: { [F.publish]: true, [F.date]: '2026-07-10', [F.bands]: [s.band], [F.venue]: ['venue'], [F.status]: 'Completed' } }))
  const now = new Date('2026-07-11T05:00:00Z')
  assert.equal(recapIsPublished(records, sources, '2026-07-10', now), true)
  assert.equal(recapIsPublished(records, sources, '2026-07-10', new Date('2026-07-11T04:59:59Z')), false)
  for (const [field, value] of [[F.publish, false], [F.status, 'Canceled'], [F.status, 'Confirmed'], [F.bands, ['different-band']], [F.venue, ['different-venue']]]) {
    const changed = structuredClone(records); changed[0].fields[field] = value
    assert.equal(recapIsPublished(changed, sources, '2026-07-10', now), false)
  }
  assert.equal(recapIsPublished(records.slice(1), sources, '2026-07-10', now), false)
  assert.equal(recapIsPublished(records, sources, '2026-07-10', new Date('invalid')), false)
})
