import test from 'node:test'
import assert from 'node:assert/strict'
import { showCalendar } from '../../lib/public/show-calendar.mjs'
import {
  SHOW_ID_PATTERN,
  showPath,
  showTime,
  showDate,
} from '../../lib/public/show-presentation.mjs'
import { publicShowToEventJsonLd } from '../../lib/public/shows-contract.mjs'
import { validNewsletterForm } from '../../lib/public/newsletter-config.mjs'

const show = {
  id: 'show_abcdefghijklmnopqrstuv',
  date: '2026-11-01',
  timeZone: 'America/Chicago',
  startTime: '2026-11-02T03:00:00.000Z',
  bands: [{ slug: 'jambi', name: 'Jambi' }],
  venue: { name: 'A Venue' },
  state: 'scheduled',
  ticket: { url: 'https://example.invalid/tickets' },
}
const now = new Date('2026-09-07T12:00:00Z')

test('event URLs and metadata use the same public identity', () => {
  assert.ok(SHOW_ID_PATTERN.test(show.id))
  assert.equal(SHOW_ID_PATTERN.test('../admin'), false)
  assert.equal(SHOW_ID_PATTERN.test('recPrivateRecord1'), false)
  const metadata = publicShowToEventJsonLd(show)
  assert.equal(metadata.url, `https://echoplay.live${showPath(show)}`)
  assert.equal(metadata['@id'], `${metadata.url}#event`)
})

test('calendar keeps the exact instant across the Central daylight-saving boundary', () => {
  const calendar = showCalendar(show, now)
  assert.match(calendar, /DTSTART:20261102T030000Z\r\n/)
  assert.match(calendar, /UID:show_abcdefghijklmnopqrstuv@echoplay.live/)
  assert.equal(showTime(show), '9:00 PM Central')
  assert.equal(showDate(show), 'Sunday, November 1, 2026')
  assert.doesNotMatch(calendar, /DTEND:/)
})

test('unknown start time creates an explicit date reminder without inventing midnight', () => {
  const calendar = showCalendar({ ...show, startTime: null }, now)
  assert.match(calendar, /DTSTART;VALUE=DATE:20261101/)
  assert.match(calendar, /\(time TBA\)/)
  assert.match(calendar, /Date reminder only/)
  assert.doesNotMatch(calendar, /DTSTART:\d+T000000/)
})

test('calendar escapes text injection and folds Unicode by bytes', () => {
  const hostile = {
    ...show,
    venue: { name: 'Hall, Room; A\\B\r\nATTENDEE:evil' + ' 🎵'.repeat(60) },
  }
  const calendar = showCalendar(hostile, now)
  assert.equal(calendar.split('\r\n').filter((line) => line.startsWith('ATTENDEE:')).length, 0)
  assert.match(calendar, /Hall\\, Room\\; A\\\\B\\nATTENDEE/)
  for (const line of calendar.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75)
  assert.ok(calendar.endsWith('END:VCALENDAR\r\n'))
})

test('canceled events keep stable calendar identity and suppress ticket metadata', () => {
  const canceled = { ...show, state: 'canceled' }
  assert.match(showCalendar(canceled, now), /STATUS:CANCELLED/)
  assert.match(showCalendar(canceled, now), /UID:show_abcdefghijklmnopqrstuv@echoplay.live/)
  assert.equal(publicShowToEventJsonLd(canceled).offers, undefined)
})

test('email collection stays off without a verified public Mailchimp destination', () => {
  assert.equal(validNewsletterForm(null), false)
  const form = {
    action: 'https://example.us1.list-manage.com/subscribe/post?u=abcdef&id=123abc',
    honeypot: 'b_abcdef_123abc',
  }
  assert.equal(validNewsletterForm(form), true)
  for (const action of [
    'https://example.invalid/subscribe/post?u=abcdef&id=123abc',
    'https://example.us1.list-manage.com.evil.invalid/subscribe/post?u=abcdef&id=123abc',
    'http://example.us1.list-manage.com/subscribe/post?u=abcdef&id=123abc',
    'https://user:pass@example.us1.list-manage.com/subscribe/post?u=abcdef&id=123abc',
  ])
    assert.equal(validNewsletterForm({ ...form, action }), false)
})
