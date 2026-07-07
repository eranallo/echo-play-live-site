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

export function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function isUpcomingDate(value) {
  const date = parseDateOnly(value)
  if (!date) return false
  const compare = new Date(date)
  compare.setHours(0, 0, 0, 0)
  return compare >= startOfToday()
}

export function daysUntilDate(value) {
  const date = parseDateOnly(value)
  if (!date) return null
  const compare = new Date(date)
  compare.setHours(0, 0, 0, 0)
  return Math.ceil((compare - startOfToday()) / 86400000)
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
