'use client'

import { useMemo, useState } from 'react'
import {
  availableCalendarYears,
  calendarMonthGrid,
  calendarMonthKey,
  filterCalendarShows,
  groupCalendarShowsByDate,
  shiftCalendarMonth,
  showsInCalendarMonth,
} from '@/lib/portal/calendar.mjs'
import { showDateKey } from '@/lib/portal/showNavigation.mjs'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const LIFECYCLE_ORDER = [
  'Inquiry',
  'Tentative',
  'Confirmed',
  'Advancing',
  'Ready',
  'Completed',
  'Reconciled',
  'Cancelled',
]

function formatDateKey(dateKey, options) {
  if (!dateKey) return 'Date TBD'
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options })
    .format(new Date(Date.UTC(year, month - 1, day, 12)))
}

function lifecycleClass(lifecycle = '') {
  return String(lifecycle).toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function CalendarEvent({ show, monthKey, undated = false }) {
  const dateKey = showDateKey(show)
  const detailHref = `/portal/shows/${show.id}?from=calendar&month=${encodeURIComponent(monthKey)}`
  const bandLabel = show.bandNames.join(' • ') || 'Band TBD'

  return (
    <a className={`portal-calendar-event portal-calendar-event-${lifecycleClass(show.lifecycle)}`} href={detailHref}>
      <div className={`portal-calendar-event-date ${undated ? 'portal-calendar-event-date-tbd' : ''}`}>
        {undated ? (
          <strong>TBD</strong>
        ) : (
          <>
            <span>{formatDateKey(dateKey, { month: 'short' })}</span>
            <strong>{dateKey.slice(-2).replace(/^0/, '')}</strong>
          </>
        )}
      </div>
      <div className="portal-calendar-event-copy">
        <div className="portal-calendar-event-band">{bandLabel}</div>
        <strong>{show.venueName}</strong>
        {show.name && show.name !== show.venueName && <span>{show.name}</span>}
        <div className="portal-calendar-event-meta">
          <span>{show.start || 'Time TBD'}</span>
          <span className={`portal-calendar-status portal-calendar-status-${lifecycleClass(show.lifecycle)}`}>
            {show.lifecycle || 'Inquiry'}
          </span>
        </div>
      </div>
      <span className="portal-calendar-event-chevron" aria-hidden="true">›</span>
    </a>
  )
}

function CalendarFilters({ filters, bands, venues, lifecycles, updateFilter, clearFilters }) {
  const hasFilters = Boolean(filters.band || filters.venue || filters.lifecycle || filters.query)

  return (
    <div className="portal-calendar-filters">
      <label className="portal-calendar-search">
        <span>Search</span>
        <input
          type="search"
          value={filters.query}
          onChange={event => updateFilter('query', event.target.value)}
          placeholder="Band, venue, city..."
        />
      </label>
      <div className="portal-calendar-filter-grid">
        <label>
          <span>Band</span>
          <select value={filters.band} onChange={event => updateFilter('band', event.target.value)}>
            <option value="">All bands</option>
            {bands.map(band => <option key={band}>{band}</option>)}
          </select>
        </label>
        <label>
          <span>Venue</span>
          <select value={filters.venue} onChange={event => updateFilter('venue', event.target.value)}>
            <option value="">All venues</option>
            {venues.map(venue => <option key={venue}>{venue}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={filters.lifecycle} onChange={event => updateFilter('lifecycle', event.target.value)}>
            <option value="">All statuses</option>
            {lifecycles.map(lifecycle => <option key={lifecycle}>{lifecycle}</option>)}
          </select>
        </label>
        <label className="portal-calendar-history-control">
          <input
            type="checkbox"
            checked={filters.includePrevious}
            onChange={event => updateFilter('includePrevious', event.target.checked)}
          />
          <span>Show previous dates</span>
        </label>
      </div>
      {hasFilters && <button className="portal-calendar-clear" type="button" onClick={clearFilters}>Clear filters</button>}
    </div>
  )
}

export default function MasterCalendar({ shows = [], counts, initialMonth, todayKey }) {
  const currentMonth = calendarMonthKey(todayKey)
  const [monthKey, setMonthKey] = useState(calendarMonthKey(initialMonth || currentMonth))
  const [selectedDate, setSelectedDate] = useState('')
  const [filters, setFilters] = useState({
    band: '',
    venue: '',
    lifecycle: '',
    query: '',
    includePrevious: false,
  })

  const bands = useMemo(() => [...new Set(shows.flatMap(show => show.bandNames || []))].sort(), [shows])
  const venues = useMemo(() => [...new Set(shows.map(show => show.venueName).filter(Boolean))].sort(), [shows])
  const lifecycles = useMemo(() => [...new Set(shows.map(show => show.lifecycle).filter(Boolean))]
    .sort((a, b) => {
      const aIndex = LIFECYCLE_ORDER.indexOf(a)
      const bIndex = LIFECYCLE_ORDER.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    }), [shows])
  const years = useMemo(() => [...new Set([
    ...availableCalendarYears(shows, todayKey),
    monthKey.slice(0, 4),
  ])].sort(), [monthKey, shows, todayKey])
  const visibleShows = useMemo(
    () => filterCalendarShows(shows, { ...filters, todayKey }),
    [filters, shows, todayKey]
  )
  const monthShows = useMemo(() => showsInCalendarMonth(visibleShows, monthKey), [visibleShows, monthKey])
  const monthGrid = useMemo(() => calendarMonthGrid(monthKey), [monthKey])
  const showsByDate = useMemo(() => {
    const index = new Map()
    for (const show of monthShows) {
      const date = showDateKey(show)
      const items = index.get(date) || []
      items.push(show)
      index.set(date, items)
    }
    return index
  }, [monthShows])
  const scheduleShows = selectedDate ? monthShows.filter(show => showDateKey(show) === selectedDate) : monthShows
  const scheduleGroups = groupCalendarShowsByDate(scheduleShows)
  const undatedShows = visibleShows.filter(show => !showDateKey(show))
  const [year, month] = monthKey.split('-')
  const monthLabel = `${MONTHS[Number(month) - 1]} ${year}`

  function changeMonth(nextMonth) {
    const normalized = calendarMonthKey(nextMonth)
    setMonthKey(normalized)
    setSelectedDate('')
    const url = new URL(window.location.href)
    url.searchParams.set('month', normalized)
    window.history.replaceState({}, '', url)
  }

  function updateFilter(key, value) {
    setFilters(current => ({ ...current, [key]: value }))
    setSelectedDate('')
  }

  function selectCalendarDay(cell) {
    if (!cell.inMonth) {
      changeMonth(cell.dateKey.slice(0, 7))
      setSelectedDate(cell.dateKey)
      return
    }
    setSelectedDate(current => current === cell.dateKey ? '' : cell.dateKey)
  }

  function clearFilters() {
    setFilters(current => ({ ...current, band: '', venue: '', lifecycle: '', query: '' }))
    setSelectedDate('')
  }

  return (
    <>
      <div className="portal-calendar-overview">
        <div><strong>{counts.upcoming}</strong><span>Upcoming</span></div>
        <div><strong>{bands.length}</strong><span>Bands</span></div>
        <div><strong>{counts.all}</strong><span>All shows</span></div>
      </div>

      <section className="portal-calendar-panel" aria-label="Master calendar controls">
        <div className="portal-calendar-month-nav">
          <button type="button" onClick={() => changeMonth(shiftCalendarMonth(monthKey, -1))} aria-label="Previous month">‹</button>
          <div>
            <span>Master Calendar</span>
            <strong>{monthLabel}</strong>
          </div>
          <button type="button" onClick={() => changeMonth(shiftCalendarMonth(monthKey, 1))} aria-label="Next month">›</button>
        </div>

        <div className="portal-calendar-jump">
          <label>
            <span>Month</span>
            <select value={month} onChange={event => changeMonth(`${year}-${event.target.value}`)}>
              {MONTHS.map((name, index) => (
                <option key={name} value={String(index + 1).padStart(2, '0')}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Year</span>
            <select value={year} onChange={event => changeMonth(`${event.target.value}-${month}`)}>
              {years.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => changeMonth(currentMonth)}>Today</button>
        </div>

        <CalendarFilters
          filters={filters}
          bands={bands}
          venues={venues}
          lifecycles={lifecycles}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
        />

        <div className="portal-calendar-weekdays" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}
        </div>
        <div className="portal-calendar-grid" role="grid" aria-label={monthLabel}>
          {monthGrid.map(cell => {
            const dayShows = showsByDate.get(cell.dateKey) || []
            const isPast = cell.dateKey < todayKey
            const isToday = cell.dateKey === todayKey
            const isSelected = cell.dateKey === selectedDate
            const label = `${formatDateKey(cell.dateKey, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, ${dayShows.length} ${dayShows.length === 1 ? 'show' : 'shows'}`

            return (
              <button
                type="button"
                role="gridcell"
                key={cell.dateKey}
                className={[
                  'portal-calendar-day',
                  !cell.inMonth ? 'portal-calendar-day-outside' : '',
                  isPast ? 'portal-calendar-day-past' : '',
                  isToday ? 'portal-calendar-day-today' : '',
                  isSelected ? 'portal-calendar-day-selected' : '',
                  dayShows.length ? 'portal-calendar-day-active' : '',
                ].filter(Boolean).join(' ')}
                aria-label={label}
                aria-selected={isSelected}
                onClick={() => selectCalendarDay(cell)}
              >
                <span className="portal-calendar-day-number">{cell.day}</span>
                {dayShows.length > 0 && (
                  <span className="portal-calendar-dots" aria-hidden="true">
                    {dayShows.slice(0, 3).map((show, index) => (
                      <i className={`portal-calendar-dot portal-calendar-dot-${Math.max(0, bands.indexOf(show.bandNames[0])) % 4}`} key={show.id} />
                    ))}
                    {dayShows.length > 3 && <small>+{dayShows.length - 3}</small>}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="portal-calendar-agenda" aria-labelledby="portal-calendar-agenda-title">
        <div className="portal-calendar-agenda-heading">
          <div>
            <span>{selectedDate ? 'Selected date' : 'Month schedule'}</span>
            <h2 id="portal-calendar-agenda-title">
              {selectedDate
                ? formatDateKey(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })
                : monthLabel}
            </h2>
          </div>
          {selectedDate && <button type="button" onClick={() => setSelectedDate('')}>Whole month</button>}
        </div>

        {scheduleGroups.length > 0 ? (
          <div className="portal-calendar-agenda-groups">
            {scheduleGroups.map(group => (
              <div className="portal-calendar-agenda-group" key={group.date}>
                <div className="portal-calendar-agenda-date">
                  <strong>{formatDateKey(group.date, { weekday: 'long' })}</strong>
                  <span>{formatDateKey(group.date, { month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="portal-calendar-event-list">
                  {group.shows.map(show => <CalendarEvent key={show.id} show={show} monthKey={monthKey} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="portal-calendar-empty">
            <strong>No visible shows for this {selectedDate ? 'date' : 'month'}.</strong>
            <span>
              {!filters.includePrevious && monthKey <= currentMonth
                ? 'Previous dates are hidden. Turn on “Show previous dates” to include them.'
                : 'Try another month or clear the active filters.'}
            </span>
          </div>
        )}
      </section>

      {undatedShows.length > 0 && (
        <section className="portal-calendar-undated">
          <div className="portal-calendar-agenda-heading">
            <div><span>Needs scheduling</span><h2>Date TBD</h2></div>
            <strong>{undatedShows.length}</strong>
          </div>
          <div className="portal-calendar-event-list">
            {undatedShows.map(show => <CalendarEvent key={show.id} show={show} monthKey={monthKey} undated />)}
          </div>
        </section>
      )}
    </>
  )
}
