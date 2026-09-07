import { showPath, showTitle } from './show-presentation.mjs'

const escapeText = (value) =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
const timestamp = (value) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')

// RFC 5545 limits physical lines to 75 octets, including the continuation space.
function fold(line) {
  let output = '',
    size = 0
  for (const char of line) {
    const bytes = Buffer.byteLength(char)
    if (size + bytes > 75) {
      output += '\r\n '
      size = 1
    }
    output += char
    size += bytes
  }
  return output
}

export function showCalendar(show, now = new Date()) {
  const url = `https://echoplay.live${showPath(show)}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Echo Play Live//Public Shows//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${show.id}@echoplay.live`,
    `DTSTAMP:${timestamp(now)}`,
    show.startTime
      ? `DTSTART:${timestamp(show.startTime)}`
      : `DTSTART;VALUE=DATE:${show.date.replace(/-/g, '')}`,
    `SUMMARY:${escapeText(showTitle(show) + (!show.startTime ? ' (time TBA)' : ''))}`,
    `LOCATION:${escapeText([show.venue.name, show.venue.address].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${escapeText(`${show.state === 'canceled' ? 'Canceled. ' : ''}${!show.startTime ? 'Date reminder only. Start time has not been announced. ' : ''}Check the event page for current details: ${url}`)}`,
    `URL:${url}`,
    `STATUS:${show.state === 'canceled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
