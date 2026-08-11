import { centralDateKey } from './portal/showNavigation.mjs'

// Shared date helpers for Airtable date-only fields.
// Airtable date fields usually arrive as YYYY-MM-DD. Parsing those through
// new Date('YYYY-MM-DDT00:00:00') can shift the displayed day depending on the
// runtime timezone. These helpers keep calendar dates stable for public and
// portal pages.

export function parseDateOnly(value) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const raw = String(value).trim()
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (match) {
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateOnlyKey(value) {
  if (!value) return ''
  const raw = String(value).trim()
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : centralDateKey(date)
}

function utcDateKeyValue(value) {
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function startOfToday(now = new Date()) {
  return parseDateOnly(centralDateKey(now))
}

export function isUpcomingDate(value, now = new Date()) {
  const date = dateOnlyKey(value)
  return Boolean(date && date >= centralDateKey(now))
}

export function daysUntilDate(value, now = new Date()) {
  const date = dateOnlyKey(value)
  const today = centralDateKey(now)
  if (!date || !today) return null
  return Math.round((utcDateKeyValue(date) - utcDateKeyValue(today)) / 86400000)
}

export function formatDateOnly(value, options = {}) {
  const date = parseDateOnly(value)
  if (!date) return options.fallback || 'Date TBD'

  return new Intl.DateTimeFormat('en-US', {
    weekday: options.weekday || 'short',
    month: options.month || 'short',
    day: options.day || 'numeric',
    year: options.year || 'numeric',
  }).format(date)
}
