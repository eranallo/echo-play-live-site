import assert from 'node:assert/strict'
import {
  centralDateKey,
  groupShowsByYear,
  partitionShowsByDate,
} from '../lib/portal/showNavigation.mjs'

const lateNewYearsEveCentral = new Date('2027-01-01T05:30:00.000Z')
assert.equal(centralDateKey(lateNewYearsEveCentral), '2026-12-31')

const assignments = [
  { id: 'future-2', date: '2027-09-10' },
  { id: 'past-1', date: '2026-08-10' },
  { id: 'future-1', date: '2026-12-31' },
  { id: 'past-2', date: '2025-04-12' },
  { id: 'undated', date: '' },
  { id: 'future-3', date: '2027-01-15' },
]

const partitioned = partitionShowsByDate(assignments, '2026-08-11')
assert.deepEqual(partitioned.upcoming.map(show => show.id), ['future-1', 'future-3', 'future-2', 'undated'])
assert.deepEqual(partitioned.previous.map(show => show.id), ['past-1', 'past-2'])

const upcomingGroups = groupShowsByYear(partitioned.upcoming)
assert.deepEqual(upcomingGroups.map(group => group.year), ['2026', '2027', 'Date TBD'])
assert.deepEqual(upcomingGroups.map(group => group.shows.length), [1, 2, 1])

const previousGroups = groupShowsByYear(partitioned.previous)
assert.deepEqual(previousGroups.map(group => group.year), ['2026', '2025'])

console.log('Portal year and show-history fixtures passed.')
