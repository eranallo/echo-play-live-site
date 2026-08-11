import { centralDateKey, showDateKey } from './showNavigation.mjs'

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

function normalizedList(value) {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).map(item => String(item)).filter(Boolean)
}

export function calendarMonthKey(value = centralDateKey()) {
  const key = String(value || '').slice(0, 7)
  return MONTH_KEY_PATTERN.test(key) ? key : centralDateKey().slice(0, 7)
}

export function shiftCalendarMonth(monthKey, amount) {
  const normalized = calendarMonthKey(monthKey)
  const [year, month] = normalized.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1 + amount, 1))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`
}

export function calendarMonthGrid(monthKey) {
  const normalized = calendarMonthKey(monthKey)
  const [year, month] = normalized.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - firstDay.getUTCDay()))

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setUTCDate(gridStart.getUTCDate() + index)
    const dateKey = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
    ].join('-')

    return {
      dateKey,
      day: date.getUTCDate(),
      inMonth: dateKey.startsWith(normalized),
    }
  })
}

export function availableCalendarYears(shows = [], todayKey = centralDateKey()) {
  const years = new Set([String(todayKey).slice(0, 4)])

  for (const show of shows) {
    const date = showDateKey(show)
    if (date) years.add(date.slice(0, 4))
  }

  return [...years].filter(year => /^\d{4}$/.test(year)).sort()
}

export function filterCalendarShows(shows = [], filters = {}) {
  const {
    band = '',
    venue = '',
    lifecycle = '',
    query = '',
    includePrevious = false,
    todayKey = centralDateKey(),
  } = filters
  const search = String(query).trim().toLocaleLowerCase()

  return shows.filter(show => {
    const date = showDateKey(show)
    if (date && !includePrevious && date < todayKey) return false
    if (band && !normalizedList(show.bandNames).includes(band)) return false
    if (venue && show.venueName !== venue) return false
    if (lifecycle && show.lifecycle !== lifecycle) return false

    if (search) {
      const haystack = [
        show.name,
        show.venueName,
        show.venueAddress,
        show.lifecycle,
        ...normalizedList(show.bandNames),
      ].filter(Boolean).join(' ').toLocaleLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

export function showsInCalendarMonth(shows = [], monthKey) {
  const normalized = calendarMonthKey(monthKey)
  return shows
    .filter(show => showDateKey(show).startsWith(normalized))
    .sort((a, b) => showDateKey(a).localeCompare(showDateKey(b)) || String(a.start || '').localeCompare(String(b.start || '')))
}

export function groupCalendarShowsByDate(shows = []) {
  const groups = []
  const byDate = new Map()

  for (const show of shows) {
    const date = showDateKey(show)
    if (!date) continue
    let group = byDate.get(date)
    if (!group) {
      group = { date, shows: [] }
      byDate.set(date, group)
      groups.push(group)
    }
    group.shows.push(show)
  }

  return groups
}
