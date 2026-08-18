'use client'

import { useMemo, useRef, useState } from 'react'
import styles from './MasterAvailabilityCalendar.module.css'

const CHOICES = [
  { value: 'Available', label: 'Available', icon: '✓' },
  { value: 'Maybe', label: 'Maybe', icon: '?' },
  { value: 'Unavailable', label: 'Unavailable', icon: '×' },
]

const REASONS = ['Personal', 'Family', 'Vacation', 'Other Gig', 'Other']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function initialAnswer(day) {
  return {
    recordId: day.recordId || null,
    response: day.response === 'Pending' ? '' : day.response,
    reason: day.reason || '',
    notes: day.notes || '',
    hardBlackout: day.hardBlackout === true,
    linkedBlackoutId: day.linkedBlackoutId || null,
  }
}

function answerComplete(answer) {
  if (!answer?.response) return false
  return !((answer.response === 'Maybe' || answer.response === 'Unavailable') && !answer.reason)
}

function responseClass(response) {
  if (response === 'Available') return styles.available
  if (response === 'Maybe') return styles.maybe
  if (response === 'Unavailable') return styles.unavailable
  return styles.pending
}

function saveLabel(status) {
  if (status?.state === 'saving') return 'Saving change...'
  if (status?.state === 'saved') return 'Saved'
  if (status?.state === 'needsReason') return 'Choose a reason to save'
  if (status?.state === 'error') return status.message || 'Save failed'
  return 'Not answered'
}

function initialDateKey(data) {
  const month = data.months.find(item => item.key === data.currentMonthKey) || data.months[0]
  if (!month) return ''
  return month.days.find(day => day.editable && (day.shows.length || day.practices.length))?.dateKey
    || month.days.find(day => day.dateKey === data.todayKey)?.dateKey
    || month.days.find(day => day.editable)?.dateKey
    || month.days[0]?.dateKey
    || ''
}

function eventSummary(day) {
  const parts = []
  if (day.shows.length) parts.push(`${day.shows.length} show${day.shows.length === 1 ? '' : 's'}`)
  if (day.practices.length) parts.push(`${day.practices.length} practice${day.practices.length === 1 ? '' : 's'}`)
  return parts.join(' · ') || 'No EPL event is currently scheduled'
}

function LimitCard({ summary }) {
  if (!summary) return null
  const hasWeekendLimit = summary.maxWeekendCommitments !== null
  const hasShowLimit = summary.maxShows !== null

  if (!hasWeekendLimit && !hasShowLimit && !summary.notes) {
    return (
      <div className={styles.limitEmpty}>
        <strong>No personal booking limit is configured.</strong>
        <span>This calendar still tracks all availability, practices, and booked shows.</span>
      </div>
    )
  }

  return (
    <div className={`${styles.limitCard} ${(summary.weekendOverLimit || summary.showOverLimit) ? styles.limitDanger : ''}`}>
      <div className={styles.limitGrid}>
        {hasWeekendLimit && (
          <div>
            <span>Committed weekends</span>
            <strong>{summary.committedWeekends}/{summary.maxWeekendCommitments}</strong>
            <small>{summary.bookedWeekends} booked · {summary.availableWeekends} marked available</small>
          </div>
        )}
        {hasShowLimit && (
          <div>
            <span>Booked shows</span>
            <strong>{summary.bookedShows}/{summary.maxShows}</strong>
            <small>{summary.remainingShows} remaining under this rule</small>
          </div>
        )}
      </div>
      {summary.warnings?.length > 0 && (
        <div className={styles.limitWarnings}>
          {summary.warnings.map(warning => <span key={warning}>{warning}</span>)}
        </div>
      )}
      {summary.notes && <p>{summary.notes}</p>}
    </div>
  )
}

function EventList({ day }) {
  if (!day.shows.length && !day.practices.length) {
    return (
      <div className={styles.noEvents}>
        No show or practice is scheduled. Your answer still tells EPL whether this date is open for a new booking.
      </div>
    )
  }

  return (
    <div className={styles.eventList}>
      {day.shows.map(show => (
        <article className={`${styles.eventCard} ${show.countsTowardLimit ? styles.bookedEvent : ''}`} key={show.id}>
          <span>Show · {show.status}</span>
          <strong>{show.title}</strong>
          <p>{show.bandNames.join(' + ') || 'Echo Play Live'} · {show.venueName}</p>
          <small>{show.timeLabel}{show.rosterAssumed ? ' · Roster assumed from band membership' : ''}</small>
        </article>
      ))}
      {day.practices.map(practice => (
        <article className={styles.eventCard} key={practice.id}>
          <span>Practice</span>
          <strong>{practice.title}</strong>
          <p>{practice.timeLabel}</p>
          {practice.location && <small>{practice.location}</small>}
        </article>
      ))}
    </div>
  )
}

export default function MasterAvailabilityCalendar({ data, token }) {
  const allMonths = useMemo(() => [...data.months, ...data.historyMonths], [data.months, data.historyMonths])
  const allDays = useMemo(() => allMonths.flatMap(month => month.days), [allMonths])
  const startingAnswers = useMemo(
    () => Object.fromEntries(allDays.map(day => [day.dateKey, initialAnswer(day)])),
    [allDays]
  )

  const [answers, setAnswers] = useState(startingAnswers)
  const [statuses, setStatuses] = useState(() => Object.fromEntries(allDays.map(day => [
    day.dateKey,
    day.response === 'Pending' ? { state: 'idle', message: '' } : { state: 'saved', message: '' },
  ])))
  const [selectedMonthKey, setSelectedMonthKey] = useState(data.currentMonthKey)
  const [selectedDateKey, setSelectedDateKey] = useState(() => initialDateKey(data))
  const [historyMonthKey, setHistoryMonthKey] = useState('')
  const [limitSummaries, setLimitSummaries] = useState(() => (
    Object.fromEntries(data.months.map(month => [month.key, month.limitSummary]))
  ))
  const [pageMessage, setPageMessage] = useState('')

  const answersRef = useRef(answers)
  const lastSavedRef = useRef(startingAnswers)
  const requestVersion = useRef({})

  const selectedMonth = allMonths.find(month => month.key === selectedMonthKey) || data.months[0]
  const selectedDay = selectedMonth?.days.find(day => day.dateKey === selectedDateKey) || selectedMonth?.days[0] || null
  const selectedAnswer = selectedDay ? answers[selectedDay.dateKey] : null
  const selectedStatus = selectedDay ? statuses[selectedDay.dateKey] : null
  const selectedLimit = limitSummaries[selectedMonthKey] || selectedMonth?.limitSummary || null
  const selectedIsHistory = selectedMonth?.readOnly === true

  const currentMonth = data.months.find(month => month.key === data.currentMonthKey) || data.months[0]
  const currentDays = currentMonth?.days.filter(day => day.editable) || []
  const currentAnswered = currentDays.filter(day => answerComplete(answers[day.dateKey])).length
  const currentConflicts = currentDays.filter(day => {
    const response = answers[day.dateKey]?.response || 'Pending'
    return (day.booked && response !== 'Available') || (day.practices.length > 0 && response === 'Unavailable')
  }).length
  const savingCount = Object.values(statuses).filter(status => status.state === 'saving').length
  const errorCount = Object.values(statuses).filter(status => status.state === 'error').length

  function setStatus(dateKey, state, message = '') {
    setStatuses(current => ({ ...current, [dateKey]: { state, message } }))
  }

  function chooseMonth(monthKey, history = false) {
    const month = allMonths.find(item => item.key === monthKey)
    if (!month) return

    setSelectedMonthKey(monthKey)
    setHistoryMonthKey(history ? monthKey : '')
    setSelectedDateKey(
      month.days.find(day => day.editable && (day.shows.length || day.practices.length))?.dateKey
      || month.days.find(day => day.editable)?.dateKey
      || month.days[0]?.dateKey
      || ''
    )
    setPageMessage('')
  }

  async function saveDay(day, suppliedAnswer) {
    const answer = suppliedAnswer || answersRef.current[day.dateKey]
    if (!day.editable || selectedIsHistory) return

    if (!answerComplete(answer)) {
      setStatus(day.dateKey, answer.response ? 'needsReason' : 'idle')
      return
    }

    const version = (requestVersion.current[day.dateKey] || 0) + 1
    requestVersion.current[day.dateKey] = version
    setStatus(day.dateKey, 'saving')
    setPageMessage('')

    try {
      const response = await fetch(`/api/availability/${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: { dateKey: day.dateKey, ...answer } }),
      })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        const error = new Error(body.error || 'This change could not be saved.')
        error.status = response.status
        error.limitSummary = body.limitSummary || body.data?.limitSummary
        throw error
      }

      if (requestVersion.current[day.dateKey] !== version) return

      const savedAnswer = {
        ...answer,
        recordId: body.recordId || answer.recordId || null,
        linkedBlackoutId: body.answer?.linkedBlackoutId || null,
      }
      const nextAnswers = { ...answersRef.current, [day.dateKey]: savedAnswer }
      answersRef.current = nextAnswers
      lastSavedRef.current = { ...lastSavedRef.current, [day.dateKey]: savedAnswer }
      setAnswers(nextAnswers)
      setStatus(day.dateKey, 'saved')

      if (body.limitSummary) {
        setLimitSummaries(current => ({ ...current, [day.monthKey]: body.limitSummary }))
      }
      if (body.warning) setPageMessage(body.warning)
    } catch (error) {
      if (requestVersion.current[day.dateKey] !== version) return

      if (error.status === 409) {
        const reverted = lastSavedRef.current[day.dateKey]
        const nextAnswers = { ...answersRef.current, [day.dateKey]: reverted }
        answersRef.current = nextAnswers
        setAnswers(nextAnswers)
        if (error.limitSummary) {
          setLimitSummaries(current => ({ ...current, [day.monthKey]: error.limitSummary }))
        }
      }

      setStatus(day.dateKey, 'error', error.message || 'This change could not be saved.')
    }
  }

  function updateDay(day, changes, saveImmediately = true) {
    if (!day.editable || selectedIsHistory) return

    const current = answersRef.current[day.dateKey]
    const next = { ...current, ...changes }

    if (changes.response === 'Available') {
      next.reason = ''
      next.hardBlackout = false
    }
    if (changes.response === 'Maybe') next.hardBlackout = false

    const nextAnswers = { ...answersRef.current, [day.dateKey]: next }
    answersRef.current = nextAnswers
    setAnswers(nextAnswers)
    setPageMessage('')

    if (saveImmediately) saveDay(day, next)
  }

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <div className={styles.eyebrow}>Master EPL availability</div>
            <h1>{data.memberName}</h1>
          </div>
          <div className={styles.liveBadge}>
            <i />
            <strong>{savingCount ? 'Saving' : errorCount ? 'Needs attention' : 'Live'}</strong>
          </div>
        </div>

        <h2>{data.rangeLabel}</h2>
        <p>
          Mark any future date Available, Maybe, or Unavailable. Your answer applies across Echo Play Live,
          while practices and shows appear on the same calendar.
        </p>

        <div className={styles.bandRow}>
          {data.bandNames.map(name => <span key={name}>{name}</span>)}
        </div>

        <div className={styles.metrics}>
          <div><span>This month</span><strong>{currentAnswered}/{currentDays.length}</strong><small>future dates answered</small></div>
          <div><span>Conflicts</span><strong>{currentConflicts}</strong><small>scheduled dates needing attention</small></div>
          <div><span>Weekend rule</span><strong>{data.rules.maxWeekendCommitments ?? '∞'}</strong><small>monthly commitment maximum</small></div>
          <div><span>Autosave</span><strong>{errorCount || 'On'}</strong><small>{errorCount ? 'changes need retry' : 'no final submit button'}</small></div>
        </div>
      </section>

      <section className={styles.navigation}>
        <div className={styles.navigationTop}>
          <div>
            <div className={styles.eyebrow}>Rolling 12 months</div>
            <h2>Choose a month</h2>
          </div>
          <label>
            <span>Past months</span>
            <select
              value={historyMonthKey}
              onChange={event => {
                const value = event.target.value
                if (value) chooseMonth(value, true)
                else chooseMonth(data.currentMonthKey)
              }}
            >
              <option value="">Select history</option>
              {data.historyMonths.map(month => <option value={month.key} key={month.key}>{month.label}</option>)}
            </select>
          </label>
        </div>

        <div className={styles.monthRail}>
          {data.months.map(month => {
            const editableDays = month.days.filter(day => day.editable)
            const answered = editableDays.filter(day => answerComplete(answers[day.dateKey])).length
            return (
              <button
                className={selectedMonthKey === month.key && !selectedIsHistory ? styles.monthActive : ''}
                type="button"
                key={month.key}
                onClick={() => chooseMonth(month.key)}
              >
                <strong>{month.shortLabel}</strong>
                <span>{answered}/{editableDays.length}</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div>
              <div className={styles.eyebrow}>{selectedIsHistory ? 'Read-only history' : selectedMonth?.isCurrent ? 'Current month' : 'Future month'}</div>
              <h2>{selectedMonth?.label}</h2>
            </div>
            <div className={styles.legend}>
              <span><i className={styles.legendAvailable} />Available</span>
              <span><i className={styles.legendMaybe} />Maybe</span>
              <span><i className={styles.legendUnavailable} />Unavailable</span>
              <span><i className={styles.legendPending} />Unanswered</span>
            </div>
          </div>

          <LimitCard summary={selectedLimit} />

          <div className={styles.weekdays}>
            {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
          </div>

          <div className={styles.calendarGrid}>
            {Array.from({ length: selectedMonth?.firstWeekday || 0 }, (_, index) => (
              <div className={styles.blankDay} key={`blank-${index}`} />
            ))}
            {selectedMonth?.days.map(day => {
              const answer = answers[day.dateKey]
              const response = answer?.response || 'Pending'
              const selected = selectedDateKey === day.dateKey
              const hasEvents = day.shows.length > 0 || day.practices.length > 0
              const conflict = (day.booked && response !== 'Available') || (day.practices.length > 0 && response === 'Unavailable')

              return (
                <button
                  className={`${styles.dayCell} ${responseClass(response)} ${selected ? styles.daySelected : ''} ${day.editable ? '' : styles.dayReadOnly} ${conflict ? styles.dayConflict : ''}`}
                  type="button"
                  key={day.dateKey}
                  onClick={() => setSelectedDateKey(day.dateKey)}
                  aria-label={`${day.dateLabel}: ${response}`}
                >
                  <div className={styles.dayTop}>
                    <strong>{day.day}</strong>
                    {day.weekend && <span>WKND</span>}
                  </div>
                  <div className={styles.dayEvents}>
                    {day.shows.slice(0, 1).map(show => <span className={styles.showChip} key={show.id}>SHOW</span>)}
                    {day.practices.slice(0, 1).map(practice => <span className={styles.practiceChip} key={practice.id}>{practice.bandName.slice(0, 4)}</span>)}
                    {day.shows.length + day.practices.length > 2 && (
                      <span className={styles.moreChip}>+{day.shows.length + day.practices.length - 2}</span>
                    )}
                  </div>
                  <small>{response === 'Pending' ? (hasEvents ? 'Answer needed' : 'Open') : response}</small>
                </button>
              )
            })}
          </div>
        </section>

        <aside className={styles.dayPanel}>
          {selectedDay ? (
            <>
              <div className={styles.dayPanelHeader}>
                <div>
                  <div className={styles.eyebrow}>Selected date</div>
                  <h2>{selectedDay.dateLabel}</h2>
                  <p>{eventSummary(selectedDay)}</p>
                </div>
                <span className={`${styles.statusBadge} ${responseClass(selectedAnswer?.response || 'Pending')}`}>
                  {selectedAnswer?.response || 'Unanswered'}
                </span>
              </div>

              <EventList day={selectedDay} />

              {selectedDay.bandSpecificBlackouts?.length > 0 && (
                <div className={styles.blackoutNotice}>
                  <strong>Band-specific blackout already on file</strong>
                  {selectedDay.bandSpecificBlackouts.map(item => (
                    <span key={item.id}>{item.bandNames.join(', ') || 'Selected bands'}: {item.reason}</span>
                  ))}
                </div>
              )}

              {selectedDay.globalBlackout && (
                <div className={styles.blackoutNotice}>
                  <strong>Global blackout already on file</strong>
                  <span>{selectedDay.globalBlackout.reason}{selectedDay.globalBlackout.notes ? ` · ${selectedDay.globalBlackout.notes}` : ''}</span>
                </div>
              )}

              {selectedDay.editable && !selectedIsHistory ? (
                <div className={styles.editor}>
                  <div className={styles.choiceGrid} role="group" aria-label={`Availability for ${selectedDay.dateLabel}`}>
                    {CHOICES.map(choice => (
                      <button
                        className={`${styles.choiceButton} ${selectedAnswer?.response === choice.value ? styles.choiceSelected : ''}`}
                        type="button"
                        key={choice.value}
                        aria-pressed={selectedAnswer?.response === choice.value}
                        onClick={() => updateDay(selectedDay, { response: choice.value })}
                      >
                        <span>{choice.icon}</span>
                        <strong>{choice.label}</strong>
                      </button>
                    ))}
                  </div>

                  {(selectedAnswer?.response === 'Maybe' || selectedAnswer?.response === 'Unavailable') && (
                    <div className={styles.followups}>
                      <label>
                        <span>Reason</span>
                        <select
                          value={selectedAnswer.reason}
                          onChange={event => updateDay(selectedDay, { reason: event.target.value })}
                        >
                          <option value="">Choose a reason</option>
                          {REASONS.map(reason => <option value={reason} key={reason}>{reason}</option>)}
                        </select>
                      </label>

                      <label>
                        <span>Note <em>optional</em></span>
                        <textarea
                          rows="3"
                          maxLength="500"
                          value={selectedAnswer.notes}
                          placeholder="Add context only when it helps with scheduling."
                          onChange={event => updateDay(selectedDay, { notes: event.target.value }, false)}
                          onBlur={() => saveDay(selectedDay, answersRef.current[selectedDay.dateKey])}
                        />
                      </label>

                      {selectedAnswer.response === 'Unavailable' && (
                        <label className={styles.blackoutToggle}>
                          <input
                            type="checkbox"
                            checked={selectedAnswer.hardBlackout}
                            onChange={event => updateDay(selectedDay, { hardBlackout: event.target.checked })}
                          />
                          <span>
                            <strong>Add to Blackout Dates</strong>
                            <small>This blocks the date across all EPL bands, not only the event shown here.</small>
                          </span>
                        </label>
                      )}
                    </div>
                  )}

                  <div className={`${styles.saveLine} ${styles[`save_${selectedStatus?.state || 'idle'}`]}`}>
                    <span>{saveLabel(selectedStatus)}</span>
                    {selectedStatus?.state === 'error' && (
                      <button type="button" onClick={() => saveDay(selectedDay, answersRef.current[selectedDay.dateKey])}>Retry</button>
                    )}
                  </div>

                  {pageMessage && <div className={styles.pageMessage}>{pageMessage}</div>}
                </div>
              ) : (
                <div className={styles.readOnlyNotice}>This date is in the past and is shown for reference only.</div>
              )}
            </>
          ) : (
            <div className={styles.readOnlyNotice}>Choose a date from the calendar.</div>
          )}
        </aside>
      </div>

      <section className={styles.footerNote}>
        <div className={styles.eyebrow}>One permanent page</div>
        <h2>No monthly submission and no repeated ready checks</h2>
        <p>
          Echo Play Live will use the latest saved answer on this calendar. Reminder emails will always return you to this same private link.
        </p>
      </section>
    </div>
  )
}
