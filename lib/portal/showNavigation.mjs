const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function centralDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function showDateKey(show) {
  const value = show?.date || show?.fields?.Date || ''
  const key = String(value).trim().slice(0, 10)
  return DATE_KEY_PATTERN.test(key) ? key : ''
}

export function compareShowsByDateAscending(a, b) {
  const aDate = showDateKey(a)
  const bDate = showDateKey(b)
  if (!aDate && !bDate) return 0
  if (!aDate) return 1
  if (!bDate) return -1
  return aDate.localeCompare(bDate)
}

export function compareShowsByDateDescending(a, b) {
  return compareShowsByDateAscending(b, a)
}

export function partitionShowsByDate(shows = [], todayKey = centralDateKey()) {
  const upcoming = []
  const previous = []

  for (const show of shows) {
    const date = showDateKey(show)
    if (date && date < todayKey) previous.push(show)
    else upcoming.push(show)
  }

  return {
    upcoming: upcoming.sort(compareShowsByDateAscending),
    previous: previous.sort(compareShowsByDateDescending),
  }
}

export function groupShowsByYear(shows = []) {
  const groups = []
  const byYear = new Map()

  for (const show of shows) {
    const date = showDateKey(show)
    const year = date ? date.slice(0, 4) : 'Date TBD'
    let group = byYear.get(year)

    if (!group) {
      group = { year, shows: [] }
      byYear.set(year, group)
      groups.push(group)
    }

    group.shows.push(show)
  }

  return groups
}
