'use client'

import { useMemo, useRef, useState } from 'react'
import styles from './AvailabilityForm.module.css'

const TIME_ZONE = 'America/Chicago'

const CHOICES = [
  { value: 'Available', label: 'Available', icon: '✓' },
  { value: 'Maybe', label: 'Maybe', icon: '?' },
  { value: 'Unavailable', label: 'Unavailable', icon: '×' },
]

const REASONS = ['Personal', 'Family', 'Vacation', 'Other Gig', 'Other']

function initialAnswer(item) {
  return {
    response: item.response === 'Pending' ? '' : item.response,
    reason: item.reason || '',
    notes: item.notes || '',
    hardBlackout: item.hardBlackout === true,
  }
}

function answerComplete(answer) {
  if (!answer?.response) return false
  return !(
    (answer.response === 'Maybe' || answer.response === 'Unavailable')
    && !answer.reason
  )
}

function groupByBand(items) {
  const groups = []
  const map = new Map()

  for (const item of items) {
    const key = item.bandId || item.bandName

    if (!map.has(key)) {
      const group = {
        key,
        bandName: item.bandName,
        items: [],
      }
      map.set(key, group)
      groups.push(group)
    }

    map.get(key).items.push(item)
  }

  return groups
}

function dateParts(item) {
  const date = new Date(item.start)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))

  return {
    weekday: values.weekday || '',
    month: values.month || '',
    day: values.day || '',
  }
}

function statusLabel(status) {
  if (status?.state === 'saving') return 'Saving...'
  if (status?.state === 'saved') return 'Saved'
  if (status?.state === 'needsReason') return 'Choose a reason'
  if (status?.state === 'error') return status.message || 'Save failed'
  return 'Not answered'
}

function monthSummary(month, answers) {
  const answered = month.items.filter(item => answerComplete(answers[item.responseId])).length
  const unavailable = month.items.filter(item => (
    answers[item.responseId]?.response === 'Unavailable'
  )).length
  const maybe = month.items.filter(item => (
    answers[item.responseId]?.response === 'Maybe'
  )).length

  return {
    answered,
    pending: Math.max(0, month.items.length - answered),
    unavailable,
    maybe,
  }
}

function DateRow({
  item,
  answer,
  status,
  onUpdate,
  onSave,
  readOnly = false,
}) {
  const date = dateParts(item)
  const needsReason = answer.response === 'Maybe' || answer.response === 'Unavailable'
  const disabled = readOnly || item.editable === false

  return (
    <article
      className={`${styles.dateRow} ${disabled ? styles.dateRowReadOnly : ''}`}
      id={`date-${item.responseId}`}
    >
      <div className={styles.dateIdentity}>
        <div className={styles.dateBadge} aria-hidden="true">
          <span>{date.month}</span>
          <strong>{date.day}</strong>
          <small>{date.weekday}</small>
        </div>

        <div className={styles.dateCopy}>
          <div className={styles.dateTopline}>
            <span className={styles.bandPill}>{item.bandName}</span>
            <span className={styles.eventPill}>{item.eventType}</span>
            {item.isPastDate && <span className={styles.pastPill}>Past</span>}
          </div>
          <h4>{item.dateLabel}</h4>
          <p>{item.timeLabel}</p>
          {item.location && <small>{item.location}</small>}
        </div>
      </div>

      {item.existingBlackout && (
        <div className={styles.conflictNote}>
          <strong>Blackout already on file:</strong> {item.existingBlackout.reason}
          {item.existingBlackout.notes && <span>{item.existingBlackout.notes}</span>}
        </div>
      )}

      <div className={styles.choiceGrid} role="group" aria-label={`${item.bandName} availability for ${item.dateLabel}`}>
        {CHOICES.map(choice => (
          <button
            className={`${styles.choiceButton} ${answer.response === choice.value ? styles.choiceSelected : ''}`}
            key={choice.value}
            type="button"
            aria-pressed={answer.response === choice.value}
            disabled={disabled}
            onClick={() => onUpdate(item, { response: choice.value })}
          >
            <span className={styles.choiceIcon}>{choice.icon}</span>
            <span>{choice.label}</span>
          </button>
        ))}
      </div>

      {needsReason && (
        <div className={styles.followupGrid}>
          <label className={styles.field}>
            <span>Reason</span>
            <select
              value={answer.reason}
              disabled={disabled}
              onChange={event => onUpdate(item, { reason: event.target.value })}
              required
            >
              <option value="">Choose a reason</option>
              {REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
            </select>
          </label>

          <label className={styles.field}>
            <span>Note <em>optional</em></span>
            <textarea
              rows="2"
              maxLength="500"
              value={answer.notes}
              disabled={disabled}
              placeholder="Add context only when it helps with scheduling."
              onChange={event => onUpdate(item, { notes: event.target.value }, false)}
              onBlur={() => onSave(item, answer)}
            />
          </label>

          {answer.response === 'Unavailable' && (
            <label className={styles.blackoutToggle}>
              <input
                type="checkbox"
                checked={answer.hardBlackout}
                disabled={disabled}
                onChange={event => onUpdate(item, { hardBlackout: event.target.checked })}
              />
              <span>
                <strong>Add this as a {item.bandName} blackout</strong>
                <small>Use this when the conflict should block other scheduling for this band.</small>
              </span>
            </label>
          )}
        </div>
      )}

      <div className={styles.saveLine}>
        {disabled ? (
          <span className={styles.readOnlyStatus}>
            {item.response === 'Pending' ? 'No answer recorded' : item.response}
          </span>
        ) : (
          <span className={`${styles.saveStatus} ${styles[`saveStatus_${status?.state || 'idle'}`]}`}>
            {statusLabel(status)}
          </span>
        )}

        {status?.state === 'error' && !disabled && (
          <button
            className={styles.retryButton}
            type="button"
            onClick={() => onSave(item, answer)}
          >
            Retry
          </button>
        )}
      </div>
    </article>
  )
}

function MonthSection({
  month,
  answers,
  statuses,
  expanded,
  onToggle,
  onUpdate,
  onSave,
  readOnly = false,
}) {
  const summary = monthSummary(month, answers)
  const groups = groupByBand(month.items)

  return (
    <section
      className={`${styles.monthSection} ${month.isCurrent ? styles.monthSectionCurrent : ''}`}
      id={`month-${month.key}`}
    >
      <button
        className={styles.monthHeader}
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div>
          <div className={styles.monthEyebrow}>
            {month.isCurrent ? 'Current month' : readOnly ? 'Past month' : 'Rolling schedule'}
          </div>
          <h2>{month.label}</h2>
          <p>
            {month.itemCount} practice {month.itemCount === 1 ? 'date' : 'dates'}
            {summary.unavailable > 0 ? ` · ${summary.unavailable} unavailable` : ''}
            {summary.maybe > 0 ? ` · ${summary.maybe} maybe` : ''}
          </p>
        </div>

        <div className={styles.monthHeaderRight}>
          <div className={styles.monthProgress}>
            <strong>{summary.answered}/{month.itemCount}</strong>
            <span>answered</span>
          </div>
          <span className={`${styles.monthChevron} ${expanded ? styles.monthChevronOpen : ''}`} aria-hidden="true">⌄</span>
        </div>
      </button>

      {expanded && (
        <div className={styles.monthBody}>
          {groups.length > 0 ? groups.map(group => (
            <section className={styles.bandGroup} key={group.key}>
              <div className={styles.bandGroupHeader}>
                <h3>{group.bandName}</h3>
                <span>{group.items.length} {group.items.length === 1 ? 'date' : 'dates'}</span>
              </div>

              <div className={styles.dateList}>
                {group.items.map(item => (
                  <DateRow
                    key={item.responseId}
                    item={item}
                    answer={answers[item.responseId]}
                    status={statuses[item.responseId]}
                    onUpdate={onUpdate}
                    onSave={(row, currentAnswer) => onSave(row, currentAnswer || answers[row.responseId])}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </section>
          )) : (
            <div className={styles.emptyMonth}>
              No practice dates are scheduled for your bands this month.
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function AvailabilityForm({ data, token }) {
  const visibleMonths = useMemo(
    () => data.months.map(month => {
      const items = month.items.filter(item => !item.isPastDate)
      return { ...month, items, itemCount: items.length }
    }),
    [data.months]
  )
  const rollingItems = useMemo(
    () => visibleMonths.flatMap(month => month.items),
    [visibleMonths]
  )
  const historyItems = useMemo(
    () => data.historyMonths.flatMap(month => month.items),
    [data.historyMonths]
  )
  const allItems = useMemo(
    () => [...rollingItems, ...historyItems],
    [rollingItems, historyItems]
  )

  const [answers, setAnswers] = useState(() => Object.fromEntries(
    allItems.map(item => [item.responseId, initialAnswer(item)])
  ))
  const [statuses, setStatuses] = useState(() => Object.fromEntries(
    allItems.map(item => [
      item.responseId,
      item.response === 'Pending' ? { state: 'idle' } : { state: 'saved' },
    ])
  ))
  const [expandedMonths, setExpandedMonths] = useState(() => new Set(
    visibleMonths.slice(0, 2).map(month => month.key)
  ))
  const [historyMonthKey, setHistoryMonthKey] = useState('')

  const answersRef = useRef(answers)
  const requestVersion = useRef({})

  const answeredCount = rollingItems.filter(item => (
    answerComplete(answers[item.responseId])
  )).length
  const unavailableCount = rollingItems.filter(item => (
    answers[item.responseId]?.response === 'Unavailable'
  )).length
  const savingCount = Object.values(statuses).filter(item => item.state === 'saving').length
  const errorCount = Object.values(statuses).filter(item => item.state === 'error').length
  const pendingCount = Math.max(0, rollingItems.length - answeredCount)

  const selectedHistoryMonth = data.historyMonths.find(month => (
    month.key === historyMonthKey
  )) || null

  function setStatus(id, state, message = '') {
    setStatuses(current => ({ ...current, [id]: { state, message } }))
  }

  async function save(item, providedAnswer) {
    const answer = providedAnswer || answersRef.current[item.responseId]

    if (!item.editable) return

    if (!answerComplete(answer)) {
      setStatus(item.responseId, answer.response ? 'needsReason' : 'idle')
      return
    }

    const id = item.responseId
    const version = (requestVersion.current[id] || 0) + 1
    requestVersion.current[id] = version
    setStatus(id, 'saving')

    try {
      const response = await fetch(`/api/availability/${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: { responseId: id, ...answer } }),
      })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || 'This change could not be saved.')
      }

      if (requestVersion.current[id] === version) {
        setStatus(id, 'saved')
      }
    } catch (error) {
      if (requestVersion.current[id] === version) {
        setStatus(id, 'error', error.message || 'This change could not be saved.')
      }
    }
  }

  function update(item, changes, shouldSave = true) {
    if (!item.editable) return

    const current = answersRef.current[item.responseId]
    const next = { ...current, ...changes }

    if (changes.response === 'Available') {
      next.reason = ''
      next.hardBlackout = false
    }

    if (changes.response === 'Maybe') {
      next.hardBlackout = false
    }

    const nextAnswers = { ...answersRef.current, [item.responseId]: next }
    answersRef.current = nextAnswers
    setAnswers(nextAnswers)

    if (shouldSave) save(item, next)
  }

  function toggleMonth(monthKey) {
    setExpandedMonths(current => {
      const next = new Set(current)
      if (next.has(monthKey)) next.delete(monthKey)
      else next.add(monthKey)
      return next
    })
  }

  function goToMonth(monthKey) {
    setExpandedMonths(current => new Set(current).add(monthKey))

    window.requestAnimationFrame(() => {
      document.getElementById(`month-${monthKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const liveStatus = errorCount > 0
    ? `${errorCount} change${errorCount === 1 ? '' : 's'} need attention`
    : savingCount > 0
      ? `Saving ${savingCount} change${savingCount === 1 ? '' : 's'}...`
      : pendingCount > 0
        ? `${pendingCount} future date${pendingCount === 1 ? '' : 's'} not answered`
        : 'All future dates are answered'

  return (
    <div className={styles.form}>
      <section className={styles.introCard}>
        <div className={styles.introTopline}>
          <div>
            <div className={styles.eyebrow}>Master practice availability</div>
            <h1>{data.memberName}</h1>
          </div>

          <div className={styles.progressBadge}>
            <strong>{answeredCount}/{rollingItems.length}</strong>
            <span>answered</span>
          </div>
        </div>

        <h2>{data.rangeLabel}</h2>
        <p>
          This permanent page always shows the current month plus the next 11 months.
          Update any future practice date whenever your plans change.
        </p>

        <div className={styles.liveStatus}>
          <span className={styles.liveDot} aria-hidden="true" />
          <div>
            <strong>{liveStatus}</strong>
            <span>
              Changes save automatically. Keep this private link and use it all year.
            </span>
          </div>
        </div>

        <div className={styles.metricStrip}>
          <div>
            <strong>{rollingItems.length}</strong>
            <span>rolling dates</span>
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>not answered</span>
          </div>
          <div>
            <strong>{unavailableCount}</strong>
            <span>unavailable</span>
          </div>
        </div>

        {data.isPreview && (
          <div className={styles.previewNote}>
            Test mode: this preview uses the permanent-dashboard structure, but no musician reminder email has been sent.
          </div>
        )}
      </section>

      <section className={styles.historyControls}>
        <div>
          <div className={styles.eyebrow}>History</div>
          <h2>Past months</h2>
          <p>Completed months stay available for reference without cluttering the rolling schedule.</p>
        </div>

        <label className={styles.historySelect}>
          <span>View a past month</span>
          <select
            value={historyMonthKey}
            disabled={data.historyMonths.length === 0}
            onChange={event => setHistoryMonthKey(event.target.value)}
          >
            <option value="">
              {data.historyMonths.length === 0 ? 'No past months yet' : 'Choose a month'}
            </option>
            {data.historyMonths.map(month => (
              <option key={month.key} value={month.key}>{month.label}</option>
            ))}
          </select>
        </label>
      </section>

      {selectedHistoryMonth && (
        <div className={styles.historyPanel}>
          <MonthSection
            month={selectedHistoryMonth}
            answers={answers}
            statuses={statuses}
            expanded
            onToggle={() => setHistoryMonthKey('')}
            onUpdate={update}
            onSave={save}
            readOnly
          />
        </div>
      )}

      <nav className={styles.monthRail} aria-label="Rolling availability months">
        {visibleMonths.map(month => {
          const summary = monthSummary(month, answers)
          return (
            <button
              className={`${styles.monthChip} ${month.isCurrent ? styles.monthChipCurrent : ''}`}
              key={month.key}
              type="button"
              onClick={() => goToMonth(month.key)}
            >
              <span>{month.shortLabel}</span>
              <strong>{summary.answered}/{month.itemCount}</strong>
            </button>
          )
        })}
      </nav>

      <div className={styles.monthList}>
        {visibleMonths.map(month => (
          <MonthSection
            key={month.key}
            month={month}
            answers={answers}
            statuses={statuses}
            expanded={expandedMonths.has(month.key)}
            onToggle={() => toggleMonth(month.key)}
            onUpdate={update}
            onSave={save}
          />
        ))}
      </div>

      <section className={styles.footerCard}>
        <div className={styles.eyebrow}>How this stays current</div>
        <h2>A rolling 12-month window</h2>
        <p>
          When a month ends, it moves into Past Months and a new future month appears automatically.
          Reminder emails always return you to this same private page.
        </p>
      </section>
    </div>
  )
}
