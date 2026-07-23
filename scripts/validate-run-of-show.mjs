import assert from 'node:assert/strict'
import {
  normalizeRunOfShowSegments,
  SEGMENT_TYPES,
} from '../lib/portal/runOfShow.mjs'

const standardShow = normalizeRunOfShowSegments([
  {
    id: 'break',
    fields: {
      'Segment Name': 'Break',
      'Segment Type': 'Break',
      'Start Time': '2026-08-01T03:00:00.000Z',
      'Duration Minutes': 15,
      Order: 3,
    },
  },
  {
    id: 'set-one',
    fields: {
      'Segment Name': 'Set 1',
      'Segment Type': 'Performance',
      'Start Time': '2026-08-01T02:00:00.000Z',
      'End Time': '2026-08-01T03:00:00.000Z',
      Order: 2,
    },
  },
  {
    id: 'doors',
    fields: {
      'Segment Name': 'Doors',
      'Segment Type': 'Production',
      'Start Time': '2026-08-01T01:00:00.000Z',
      Order: 1,
    },
  },
])

assert.deepEqual(standardShow.map(segment => segment.name), ['Doors', 'Set 1', 'Break'])
assert.equal(standardShow[1].durationMinutes, 60)
assert.equal(standardShow[2].endLabel, '10:15 PM')

const openerHeadliner = normalizeRunOfShowSegments([
  {
    id: 'headliner',
    fields: {
      'Segment Name': 'Cole Barnhill',
      'Segment Type': 'Performance',
      'Start Time': '2026-07-26T03:00:00.000Z',
      Order: 4,
    },
  },
  {
    id: 'opener',
    fields: {
      'Segment Name': 'Lowland',
      'Segment Type': 'Guest / Support',
      'Start Time': '2026-07-26T01:30:00.000Z',
      'Duration Minutes': 75,
      Order: 2,
    },
  },
  {
    id: 'changeover',
    fields: {
      'Segment Name': 'Changeover',
      'Segment Type': 'Production',
      'Start Time': '2026-07-26T02:45:00.000Z',
      'Duration Minutes': 15,
      Order: 3,
    },
  },
])

assert.equal(openerHeadliner[0].type, 'Guest / Support')
assert.equal(openerHeadliner[0].durationLabel, '1 hr 15 min')
assert.equal(openerHeadliner[2].startLabel, '10:00 PM')

const privateEvent = normalizeRunOfShowSegments([
  {
    id: 'ceremony',
    fields: {
      'Segment Name': 'Ceremony',
      'Segment Type': 'Wedding / Program',
      'Start Time': '2026-10-10T22:00:00.000Z',
      Order: 1,
      Details: 'Wireless mic ready before guests are seated.',
    },
  },
  {
    id: 'announcement',
    fields: {
      'Segment Name': 'Wedding Party Announcements',
      'Segment Type': 'Wedding / Program',
      Order: 2,
    },
  },
  {
    id: 'custom',
    fields: {
      'Segment Name': 'Client Moment',
      'Segment Type': 'Other',
    },
  },
])

assert.equal(privateEvent[1].timeLabel, 'Time TBD')
assert.equal(privateEvent[2].order, null)
assert.equal(privateEvent[0].details, 'Wireless mic ready before guests are seated.')
assert.equal(SEGMENT_TYPES.length, 7)

console.log('Run-of-show validation passed: standard show, opener/headliner, and private event.')
