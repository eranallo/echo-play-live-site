import test from 'node:test'
import assert from 'node:assert/strict'
import { SHOW_FIELD_IDS as F } from '../../lib/public/shows-contract.mjs'
import { buildUploadShowFormula, isEligibleUploadShow, validateUploadSizes } from '../../lib/uploads/policy.mjs'

const fields = (date, status = 'Completed', publish = true) => ({
  [F.date]: date, [F.status]: status, [F.publish]: publish,
})

test('upload picker requires publication even for past and same-day shows', () => {
  const now = new Date('2026-09-08T04:59:59Z') // September 7 in Chicago
  for (const date of ['2026-09-06', '2026-09-07']) {
    assert.equal(isEligibleUploadShow(fields(date), now), true)
    for (const publish of [false, undefined, 'true', 1]) {
      assert.equal(isEligibleUploadShow({ ...fields(date), [F.publish]: publish }, now), false)
    }
  }
  assert.equal(isEligibleUploadShow(fields('2026-09-08', 'Confirmed'), now), false)
  assert.equal(isEligibleUploadShow(fields('2026-09-08'), now), false)
})

test('show eligibility follows Central calendar midnight in summer and winter', () => {
  const summerShow = fields('2026-09-08', 'Confirmed')
  assert.equal(isEligibleUploadShow(summerShow, new Date('2026-09-08T04:59:59Z')), false)
  assert.equal(isEligibleUploadShow(summerShow, new Date('2026-09-08T05:00:00Z')), true)
  const winterShow = fields('2026-12-08', 'Confirmed')
  assert.equal(isEligibleUploadShow(winterShow, new Date('2026-12-08T05:59:59Z')), false)
  assert.equal(isEligibleUploadShow(winterShow, new Date('2026-12-08T06:00:00Z')), true)
})

test('unpublishing or canceling a show invalidates its eligibility', () => {
  const now = new Date('2026-09-07T18:00:00Z')
  const show = fields('2026-09-07', 'Confirmed')
  assert.equal(isEligibleUploadShow(show, now), true)
  show[F.publish] = false
  assert.equal(isEligibleUploadShow(show, now), false)
  for (const status of ['Cancelled', 'Hold', 'Tentative', '', undefined]) {
    assert.equal(isEligibleUploadShow({ ...fields('2026-09-01'), [F.status]: status }, now), false)
  }
  for (const date of ['2026-02-30', '2026-09-07T12:00:00Z', '', null]) {
    assert.equal(isEligibleUploadShow(fields(date), now), false)
  }
  assert.equal(isEligibleUploadShow(fields('2026-09-01'), new Date('invalid')), false)
})

test('source filter uses both publication and an inclusive past-date boundary', () => {
  assert.equal(buildUploadShowFormula('2026-09-07'), "AND({Publish to Website}=TRUE(),{Date}<='2026-09-07',OR({Status}='Confirmed',{Status}='Completed'))")
  assert.throws(() => buildUploadShowFormula("2026-09-07'"))
})

test('large videos have exact file and batch limits without allocating file bytes', () => {
  assert.deepEqual(validateUploadSizes([{ size: 10_000_000_000 }]), { ok: true, total: 10_000_000_000 })
  assert.equal(validateUploadSizes([{ size: 10_000_000_001 }]).reason, 'file_size')
  assert.equal(validateUploadSizes([{ size: 10_000_000_000 }, { size: 10_000_000_000 }]).ok, true)
  assert.equal(validateUploadSizes([{ size: 10_000_000_000 }, { size: 10_000_000_000 }, { size: 1 }]).reason, 'batch_size')
  for (const size of [0, -1, 0.5, NaN, Infinity, '100']) assert.equal(validateUploadSizes([{ size }]).ok, false)
  assert.equal(validateUploadSizes(Array.from({ length: 21 }, () => ({ size: 1 }))).reason, 'file_count')
  assert.equal(validateUploadSizes([]).ok, false)
})
