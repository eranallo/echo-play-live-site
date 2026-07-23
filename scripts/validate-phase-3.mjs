import assert from 'node:assert/strict'
import {
  blackoutIncludesDate,
  buildAcknowledgmentSnapshot,
  buildShowReadiness,
  findAvailabilityConflicts,
  formatSongDuration,
  memberRolesForShow,
  stableStringify,
} from '../lib/portal/model.mjs'

const baseShow = {
  id: 'recShowFixture0001',
  date: '2026-09-26',
  dateLabel: 'Sat, Sep 26, 2026',
  bandNames: ['Jambi'],
  venueName: 'Haltom Theater',
  venueAddress: '5601 E Belknap St',
  trailerLoadIn: '4:00 PM',
  loadIn: '5:00 PM',
  soundCheck: '6:00 PM',
  start: '8:30 PM',
  end: '11:30 PM',
  memberNames: ['Evan', 'James'],
  soundEngineerNames: ['Bill'],
  merchPersonNames: ['Lauren'],
  showNotes: 'All ages.',
  soundNotes: 'Use house console.',
  merchNotes: 'Table near entry.',
  productionNotes: 'Bring backdrop.',
  driveFolder: 'https://drive.google.com/example',
}

assert.deepEqual(
  memberRolesForShow(
    { 'Role - Jambi': 'Guitar', Instruments: ['Guitar', 'Vocals'] },
    ['Jambi']
  ),
  ['Jambi: Guitar']
)

assert.deepEqual(
  memberRolesForShow({ Instruments: ['Bass', 'Vocals'] }, ['New Band']),
  ['Bass', 'Vocals']
)

assert.equal(blackoutIncludesDate('2026-09-26', '2026-09-25', '2026-09-27'), true)
assert.equal(blackoutIncludesDate('2026-09-28', '2026-09-25', '2026-09-27'), false)

const conflicts = findAvailabilityConflicts(
  [{ id: 'show-1', date: '2026-09-26' }, { id: 'show-2', date: '2026-10-01' }],
  [{ id: 'blackout-1', date: '2026-09-25', endDate: '2026-09-27' }]
)
assert.equal(conflicts.length, 1)
assert.equal(conflicts[0].show.id, 'show-1')

const ready = buildShowReadiness({
  show: baseShow,
  segmentCount: 8,
  setlistCount: 1,
  personType: 'member',
  roles: ['Jambi: Guitar'],
})
assert.equal(ready.count, 0)

const soundCrewPending = buildShowReadiness({
  show: { ...baseShow, soundNotes: '' },
  segmentCount: 8,
  setlistCount: 1,
  personType: 'crew',
  roles: ['Sound Engineer'],
})
assert.ok(soundCrewPending.pending.includes('Sound notes'))

const incomplete = buildShowReadiness({
  show: { ...baseShow, venueAddress: '', loadIn: '', start: '' },
  segmentCount: 0,
  setlistCount: 0,
  personType: 'member',
})
assert.deepEqual(incomplete.critical, ['Venue address', 'Venue load-in', 'Show start'])
assert.ok(incomplete.pending.includes('Run of show'))
assert.ok(incomplete.pending.includes('Setlist'))

const snapshot = buildAcknowledgmentSnapshot({
  show: baseShow,
  personType: 'member',
  personId: 'recPersonFixture01',
  roles: ['Jambi: Guitar'],
  segments: [{ id: 'seg-1', name: 'Set 1', details: '60 minutes' }],
  setlists: [{ id: 'set-1', name: 'Ænima', songIds: ['song-1'] }],
})
const changedSnapshot = buildAcknowledgmentSnapshot({
  show: { ...baseShow, start: '9:00 PM' },
  personType: 'member',
  personId: 'recPersonFixture01',
  roles: ['Jambi: Guitar'],
  segments: [{ id: 'seg-1', name: 'Set 1', details: '60 minutes' }],
  setlists: [{ id: 'set-1', name: 'Ænima', songIds: ['song-1'] }],
})
assert.notEqual(stableStringify(snapshot), stableStringify(changedSnapshot))
assert.equal(stableStringify({ b: 2, a: 1 }), stableStringify({ a: 1, b: 2 }))

assert.equal(formatSongDuration(245), '4:05')
assert.equal(formatSongDuration(null), '')

console.log('Phase 3 portal fixtures passed.')
