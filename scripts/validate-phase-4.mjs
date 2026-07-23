import assert from 'node:assert/strict'
import {
  SHOW_LIFECYCLE_STAGES,
  buildOperationalReadiness,
  lifecycleStage,
  normalizeSegmentInput,
  prepStateComplete,
} from '../lib/admin/operations.mjs'

const linked = id => [id]

const completeFields = {
  Date: '2026-09-26',
  Band: linked('recBand'),
  Venue: linked('recVenue'),
  Status: 'Confirmed',
  'Lifecycle Stage': 'Ready',
  'Load-In Time': '2026-09-26T21:00:00.000Z',
  'Sound Check Time': '2026-09-26T22:00:00.000Z',
  'Start Time': '2026-09-27T01:30:00.000Z',
  'End Time': '2026-09-27T05:00:00.000Z',
  'Members Playing': linked('recMember'),
  'Sound Engineer': linked('recCrew'),
  'Production Notes': 'Use venue load-in door.',
  SETLISTS: linked('recSetlist'),
  'Drive Folder': 'https://drive.google.com/example',
  'Event Description': 'Jambi performs Ænima in its entirety.',
  'Publish Date': '2026-08-01',
  'Promotion Released': 'Complete',
  'Funnel Plan': ['Contract', 'Graphic', 'Bandsintown', 'Facebook Event', 'Ads', 'Trailer'],
  'Contract Signed': 'Complete',
  'Graphic Created': 'Complete',
  'Facebook Event Created': 'Completed',
  'Bandsintown Posted': 'Complete',
  'Ads Running': 'Complete',
  'Trailer Reserved': 'Not Needed',
}

assert.deepEqual(SHOW_LIFECYCLE_STAGES, [
  'Inquiry',
  'Tentative',
  'Confirmed',
  'Advancing',
  'Ready',
  'Completed',
  'Reconciled',
  'Cancelled',
])
assert.equal(lifecycleStage({ Status: 'Hold' }), 'Tentative')
assert.equal(lifecycleStage({ Status: 'Confirmed', 'Lifecycle Stage': 'Advancing' }), 'Advancing')
assert.equal(prepStateComplete('Complete'), true)
assert.equal(prepStateComplete('Completed'), true)
assert.equal(prepStateComplete('Not Needed'), true)
assert.equal(prepStateComplete('To Do'), false)

const complete = buildOperationalReadiness(completeFields, {
  now: new Date('2026-07-23T12:00:00-05:00'),
  segmentCount: 8,
  setlistCount: 1,
  socialPosts: [{ fields: { Status: 'Scheduled' } }],
})
assert.equal(complete.score, 100)
assert.equal(complete.warnings.length, 0)
assert.equal(complete.campaignReady, true)
assert.equal(complete.staffingReady, true)

const incomplete = buildOperationalReadiness({
  Date: '2026-07-25',
  Band: linked('recBand'),
  Venue: linked('recVenue'),
  Status: 'Hold',
  'Funnel Plan': ['Contract', 'Graphic', 'Facebook Event'],
  'Contract Signed': 'To Do',
  'Graphic Created': 'To Do',
  'Facebook Event Created': 'To Do',
}, {
  now: new Date('2026-07-23T12:00:00-05:00'),
  segmentCount: 0,
  setlistCount: 0,
})
assert.equal(incomplete.needsAttention, true)
assert(incomplete.score < 45)
assert(incomplete.warnings.some(item => item.field === 'Members Playing' && item.severity === 'High'))
assert(incomplete.warnings.some(item => item.field === 'SHOW SEGMENTS' && item.severity === 'High'))
assert(incomplete.warnings.some(item => item.field === 'Lifecycle Stage' && item.severity === 'High'))

const segment = normalizeSegmentInput({
  name: 'Set 1',
  type: 'Performance',
  startTime: '2026-09-27T01:30:00.000Z',
  durationMinutes: '60',
  order: '4',
  details: 'Full album set.',
})
assert.equal(segment.durationMinutes, 60)
assert.equal(segment.order, 4)
assert.equal(segment.type, 'Performance')
assert.throws(() => normalizeSegmentInput({ name: '', type: 'Performance' }), /required/)
assert.throws(() => normalizeSegmentInput({ name: 'Bad', durationMinutes: 2000 }), /1,440/)

console.log('Phase 4 operational model validation passed.')
