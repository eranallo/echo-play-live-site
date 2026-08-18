'use client'

import { useMemo, useState } from 'react'
import styles from './AvailabilityAdminDashboard.module.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function statusClass(response) {
  if (response === 'Available') return styles.memberAvailable
  if (response === 'Maybe') return styles.memberMaybe
  if (response === 'Unavailable') return styles.memberUnavailable
  return styles.memberPending
}

function countStatuses(states) {
  return states.reduce((counts, state) => {
    const key = state.response || 'Pending'
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, { Available: 0, Maybe: 0, Unavailable: 0, Pending: 0 })
}

function relevantEvents(events, bandId) {
  if (!bandId) return events
  return events.filter(event => event.bandId === bandId || event.bandIds?.includes(bandId))
}

function capacityClass(stats) {
  if (stats.weekendOverLimit || stats.showOverLimit) return styles.capacityDanger
  if (stats.weekendAtLimit || stats.showAtLimit) return styles.capacityWarning
  return ''
}

export default function AvailabilityAdminDashboard({ data }) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(data.currentMonthKey)
  const [selectedBandId, setSelectedBandId] = useState('')
  const [selectedDateKey, setSelectedDateKey] = useState(data.todayKey)

  const month = data.months.find(item => item.key === selectedMonthKey) || data.months[0]
  const roster = useMemo(() => (
    selectedBandId
      ? data.members.filter(member => member.bandIds.includes(selectedBandId))
      : data.members
  ), [data.members, selectedBandId])
  const rosterIds = useMemo(() => new Set(roster.map(member => member.id)), [roster])
  const selectedDay = month.days.find(day => day.dateKey === selectedDateKey) || month.days[0]
  const selectedStates = selectedDay.members.filter(state => rosterIds.has(state.memberId))
  const counts = countStatuses(selectedStates)
  const selectedPractices = relevantEvents(selectedDay.practices, selectedBandId)
  const selectedShows = relevantEvents(selectedDay.shows, selectedBandId)
  const rosterLabel = data.bands.find(band => band.id === selectedBandId)?.name || 'All EPL members'

  function chooseMonth(monthKey) {
    const nextMonth = data.months.find(item => item.key === monthKey)
    if (!nextMonth) return
    setSelectedMonthKey(monthKey)
    setSelectedDateKey(
      nextMonth.days.find(day => day.shows.length || day.practices.length)?.dateKey
      || nextMonth.days[0]?.dateKey
      || ''
    )
  }

  const warningCount = roster.filter(member => {
    const stats = month.stats[member.id]
    return stats?.weekendAtLimit || stats?.weekendOverLimit || stats?.showAtLimit || stats?.showOverLimit
  }).length

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <span>Availability command center</span>
          <h1>Know before you ask.</h1>
          <p>
            One calendar combines member availability, practices, confirmed shows, holds,
            and personal booking limits. Use it before answering a venue or sending another ready check.
          </p>
        </div>
        <aside>
          <span>Rolling window</span>
          <strong>{data.rangeLabel}</strong>
          <small>{data.members.length} active members · {data.bands.length} active bands</small>
        </aside>
      </header>

      <section className={styles.controls}>
        <div>
          <span>Month</span>
          <div className={styles.monthRail}>
            {data.months.map(item => (
              <button
                className={selectedMonthKey === item.key ? styles.activeMonth : ''}
                type="button"
                key={item.key}
                onClick={() => chooseMonth(item.key)}
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
        </div>
        <label>
          <span>Roster filter</span>
          <select value={selectedBandId} onChange={event => setSelectedBandId(event.target.value)}>
            <option value="">All EPL members</option>
            {data.bands.map(band => <option value={band.id} key={band.id}>{band.name}</option>)}
          </select>
        </label>
      </section>

      <section className={styles.metrics}>
        <div><span>Roster</span><strong>{roster.length}</strong><small>{rosterLabel}</small></div>
        <div><span>Available selected date</span><strong>{counts.Available}</strong><small>{selectedDay.dateLabel}</small></div>
        <div><span>Unknown selected date</span><strong>{counts.Pending}</strong><small>Needs a member response</small></div>
        <div><span>Limit warnings</span><strong>{warningCount}</strong><small>{month.label}</small></div>
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.calendarPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Monthly readiness</span>
              <h2>{month.label}</h2>
            </div>
            <div className={styles.legend}>
              <i className={styles.legendAvailable} />A
              <i className={styles.legendMaybe} />M
              <i className={styles.legendUnavailable} />U
              <i className={styles.legendPending} />?
            </div>
          </div>

          <div className={styles.weekdays}>{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
          <div className={styles.calendarGrid}>
            {Array.from({ length: month.firstWeekday }, (_, index) => (
              <div className={styles.blank} key={`blank-${index}`} />
            ))}
            {month.days.map(day => {
              const states = day.members.filter(state => rosterIds.has(state.memberId))
              const dayCounts = countStatuses(states)
              const shows = relevantEvents(day.shows, selectedBandId)
              const practices = relevantEvents(day.practices, selectedBandId)
              const conflicts = states.filter(state => state.conflict).length

              return (
                <button
                  className={`${styles.dayCell} ${selectedDateKey === day.dateKey ? styles.selectedDay : ''} ${conflicts ? styles.conflictDay : ''}`}
                  type="button"
                  key={day.dateKey}
                  onClick={() => setSelectedDateKey(day.dateKey)}
                >
                  <div className={styles.dayTop}><strong>{day.day}</strong>{day.weekend && <span>WKND</span>}</div>
                  <div className={styles.eventChips}>
                    {shows.length > 0 && <span className={styles.showChip}>{shows.length} show{shows.length === 1 ? '' : 's'}</span>}
                    {practices.length > 0 && <span className={styles.practiceChip}>{practices.length} practice{practices.length === 1 ? '' : 's'}</span>}
                  </div>
                  <div className={styles.countGrid}>
                    <span className={styles.countAvailable}>{dayCounts.Available}</span>
                    <span className={styles.countMaybe}>{dayCounts.Maybe}</span>
                    <span className={styles.countUnavailable}>{dayCounts.Unavailable}</span>
                    <span className={styles.countPending}>{dayCounts.Pending}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <aside className={styles.dayPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Booking readiness</span>
              <h2>{selectedDay.dateLabel}</h2>
            </div>
            <strong className={styles.readinessScore}>{counts.Available}/{roster.length}</strong>
          </div>

          <div className={styles.readinessBar}>
            <i style={{ width: `${roster.length ? Math.round((counts.Available / roster.length) * 100) : 0}%` }} />
          </div>

          <div className={styles.dayEvents}>
            {selectedShows.map(show => (
              <article key={show.id}>
                <span>Show · {show.status}</span>
                <strong>{show.title}</strong>
                <small>{show.bandNames.join(' + ')} · {show.venueName} · {show.timeLabel}</small>
              </article>
            ))}
            {selectedPractices.map(practice => (
              <article key={practice.id}>
                <span>Practice</span>
                <strong>{practice.title}</strong>
                <small>{practice.timeLabel} · {practice.location}</small>
              </article>
            ))}
            {!selectedShows.length && !selectedPractices.length && (
              <div className={styles.noEvents}>
                No EPL event is scheduled. Use the roster below to evaluate a potential booking.
              </div>
            )}
          </div>

          <div className={styles.memberList}>
            {roster.map(member => {
              const state = selectedStates.find(item => item.memberId === member.id)
              const stats = month.stats[member.id]
              return (
                <article className={`${styles.memberRow} ${statusClass(state?.response)} ${state?.conflict ? styles.memberConflict : ''}`} key={member.id}>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.bandNames.join(', ') || 'No band assigned'}</span>
                  </div>
                  <div className={styles.memberMeta}>
                    <strong>{state?.response || 'Pending'}</strong>
                    <span>
                      {stats.maxWeekendCommitments === null
                        ? `${stats.bookedWeekends} booked weekends`
                        : `${stats.committedWeekends}/${stats.maxWeekendCommitments} weekends`}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </aside>
      </div>

      <section className={styles.capacityPanel}>
        <div className={styles.panelHeader}>
          <div>
            <span>Monthly capacity</span>
            <h2>Who is actually bookable?</h2>
            <p>Booked weekends and member-selected available weekends are grouped Friday through Sunday.</p>
          </div>
        </div>

        <div className={styles.capacityGrid}>
          {roster.map(member => {
            const stats = month.stats[member.id]
            return (
              <article className={`${styles.capacityCard} ${capacityClass(stats)}`} key={member.id}>
                <div className={styles.capacityTop}>
                  <div><span>Member</span><strong>{member.name}</strong></div>
                  <em>{stats.mode}</em>
                </div>
                <div className={styles.capacityNumbers}>
                  <div><span>Committed weekends</span><strong>{stats.committedWeekends}{stats.maxWeekendCommitments !== null ? `/${stats.maxWeekendCommitments}` : ''}</strong></div>
                  <div><span>Booked weekends</span><strong>{stats.bookedWeekends}</strong></div>
                  <div><span>Available weekends</span><strong>{stats.availableWeekends}</strong></div>
                  <div><span>Shows</span><strong>{stats.bookedShows}{stats.maxShows !== null ? `/${stats.maxShows}` : ''}</strong></div>
                </div>
                {stats.warnings.length > 0 ? (
                  <div className={styles.warningList}>{stats.warnings.map(warning => <span key={warning}>{warning}</span>)}</div>
                ) : (
                  <p>{stats.notes || (stats.maxWeekendCommitments === null && stats.maxShows === null ? 'No booking limit configured.' : 'Within configured limits.')}</p>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
