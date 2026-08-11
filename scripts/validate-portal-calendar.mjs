import assert from 'node:assert/strict'
import {
  availableCalendarYears,
  calendarMonthGrid,
  calendarMonthKey,
  filterCalendarShows,
  groupCalendarShowsByDate,
  shiftCalendarMonth,
  showsInCalendarMonth,
} from '../lib/portal/calendar.mjs'
import { namesForLinkedRecords } from '../lib/portal/model.mjs'

const shows = [
  { id: 'past', date: '2026-08-10', bandNames: ['Jambi'], venueName: 'Haltom Theater', lifecycle: 'Completed', start: '8:00 PM' },
  { id: 'today', date: '2026-08-11', bandNames: ['Elite'], venueName: 'Granada Theater', lifecycle: 'Confirmed', start: '9:00 PM' },
  { id: 'future', date: '2027-01-15', bandNames: ['Faking Benjamin'], venueName: 'The Revel', lifecycle: 'Tentative', start: '' },
  { id: 'future-2', date: '2027-01-15', bandNames: ['Session'], venueName: 'The Revel', lifecycle: 'Confirmed', start: '10:00 PM' },
  { id: 'undated', date: '', bandNames: ['Corestalgia'], venueName: 'Venue TBD', lifecycle: 'Inquiry', start: '' },
]

assert.deepEqual(
  namesForLinkedRecords(['rec-member'], undefined, record => record?.fields?.Name),
  [],
  'Calendar show normalization must tolerate member and crew maps that were not loaded.'
)
assert.deepEqual(
  namesForLinkedRecords(
    ['rec-member'],
    new Map([['rec-member', { fields: { Name: 'Evan' } }]]),
    record => record?.fields?.Name
  ),
  ['Evan']
)

assert.equal(calendarMonthKey('2027-01-15'), '2027-01')
assert.equal(shiftCalendarMonth('2026-12', 1), '2027-01')
assert.equal(shiftCalendarMonth('2027-01', -1), '2026-12')

const augustGrid = calendarMonthGrid('2026-08')
assert.equal(augustGrid.length, 42)
assert.equal(augustGrid[0].dateKey, '2026-07-26')
assert.equal(augustGrid.at(-1).dateKey, '2026-09-05')

assert.deepEqual(availableCalendarYears(shows, '2026-08-11'), ['2026', '2027'])

const active = filterCalendarShows(shows, { todayKey: '2026-08-11' })
assert.deepEqual(active.map(show => show.id), ['today', 'future', 'future-2', 'undated'])

const allDates = filterCalendarShows(shows, { todayKey: '2026-08-11', includePrevious: true })
assert.equal(allDates.length, 5)

const revel = filterCalendarShows(shows, { todayKey: '2026-08-11', venue: 'The Revel' })
assert.deepEqual(revel.map(show => show.id), ['future', 'future-2'])

const confirmed = filterCalendarShows(shows, { todayKey: '2026-08-11', lifecycle: 'Confirmed' })
assert.deepEqual(confirmed.map(show => show.id), ['today', 'future-2'])

const january = showsInCalendarMonth(active, '2027-01')
assert.deepEqual(january.map(show => show.id), ['future', 'future-2'])

const groups = groupCalendarShowsByDate(january)
assert.equal(groups.length, 1)
assert.equal(groups[0].date, '2027-01-15')
assert.equal(groups[0].shows.length, 2)

console.log('Portal master-calendar fixtures passed.')
