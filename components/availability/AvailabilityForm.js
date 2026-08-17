'use client'

import { useMemo, useRef, useState } from 'react'
import styles from './AvailabilityForm.module.css'

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

function complete(answer) {
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
      const group = { key, bandName: item.bandName, items: [] }
      map.set(key, group)
      groups.push(group)
    }
    map.get(key).items.push(item)
  }

  return groups
}

function statusStyle(status) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    padding: '7px 10px',
    fontFamily: 'var(--ff-label)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }

  if (status === 'saving') {
    return { ...base, color: '#d8b4fe', background: 'rgba(157, 78, 221, 0.12)' }
  }
  if (status === 'saved') {
    return { ...base, color: '#8ee0b6', background: 'rgba(42, 196, 119, 0.10)' }
  }
  if (status === 'needsReason') {
    return { ...base, color: '#f3cc66', background: 'rgba(212, 160, 23, 0.10)' }
  }
  if (status === 'error') {
    return { ...base, color: '#ffb3ba', background: 'rgba(230, 57, 70, 0.11)' }
  }
  return { ...base, color: 'var(--c-text-dim)', background: 'rgba(255, 255, 255, 0.035)' }
}

export default function AvailabilityForm({ data, token }) {
  const [answers, setAnswers] = useState(() => Object.fromEntries(
    data.items.map(item => [item.responseId, initialAnswer(item)])
  ))
  const [statuses, setStatuses] = useState(() => Object.fromEntries(
    data.items.map(item => [
      item.responseId,
      item.response === 'Pending' ? { state: 'idle' } : { state: 'saved' },
    ])
  ))

  const answersRef = useRef(answers)
  const requestVersion = useRef({})
  const groups = useMemo(() => groupByBand(data.items), [data.items])
  const answered = data.items.filter(item => complete(answers[item.responseId])).length
  const saving = Object.values(statuses).filter(item => item.state === 'saving').length
  const errors = Object.values(statuses).filter(item => item.state === 'error').length
  const remaining = data.totalCount - answered

  function setStatus(id, state, message = '') {
    setStatuses(current => ({ ...current, [id]: { state, message } }))
  }

  async function save(item, answer) {
    if (!complete(answer)) {
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
      if (!response.ok) throw new Error(body.error || 'This change could not be saved.')

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

  function saveLabel(item) {
    const status = statuses[item.responseId] || { state: 'idle' }

    if (status.state === 'saving') return 'Saving change...'
    if (status.state === 'saved') return '✓ Saved'
    if (status.state === 'needsReason') return 'Choose a reason to save'
    if (status.state === 'error') return status.message || 'Save failed'
    return 'Not answered yet'
  }

  const dashboardStatus = errors > 0
    ? `${errors} change${errors === 1 ? '' : 's'} need attention`
    : saving > 0
      ? `Saving ${saving} change${saving === 1 ? '' : 's'}...`
      : remaining > 0
        ? `${remaining} date${remaining === 1 ? '' : 's'} not answered yet`
        : 'All current changes are saved'

  return (
    <div className={styles.form}>
      <section className={styles.introCard}>
        <div className={styles.introTopline}>
          <div>
            <div className={styles.eyebrow}>Live availability dashboard</div>
            <h1>{data.memberName}</h1>
          </div>
          <div className={styles.progressBadge}>
            <strong>{answered}/{data.totalCount}</strong>
            <span>answered</span>
          </div>
        </div>

        <h2>{data.cycleName}</h2>
        <p>
          Update any date whenever plans change. Completed answers save automatically,
          and this page remains editable while the monthly check is open.
        </p>

        <div className={styles.bandSummary}>
          {groups.map(group => (
            <span className={styles.bandPill} key={group.key}>{group.bandName}</span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 13,
            alignItems: 'center',
            marginTop: 22,
            border: '1px solid rgba(42, 196, 119, 0.26)',
            borderRadius: 17,
            background: 'rgba(42, 196, 119, 0.065)',
            padding: '14px 16px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              flex: '0 0 auto',
              borderRadius: 999,
              background: '#2ac477',
              boxShadow: '0 0 0 6px rgba(42, 196, 119, 0.10)',
            }}
          />
          <div style={{ display: 'grid', gap: 3 }}>
            <strong style={{ fontSize: 14 }}>{dashboardStatus}</strong>
            <span style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>
              Keep this private link and return whenever your availability changes.
            </span>
          </div>
        </div>

        <div className={styles.metaRow}>
          {data.dueLabel && <span><strong>Initial responses due:</strong> {data.dueLabel}</span>}
          {data.isPreview && <span className={styles.previewPill}>Test mode</span>}
        </div>

        {data.isPreview && (
          <div className={styles.previewNote}>
            This is the private test version. No musician email has been sent.
          </div>
        )}
      </section>

      <div className={styles.bandList}>
        {groups.map(group => {
          const bandAnswered = group.items.filter(item => complete(answers[item.responseId])).length

          return (
            <section className={styles.bandSection} key={group.key}>
              <div className={styles.bandSectionHeader}>
                <div>
                  <div className={styles.eyebrow}>Your schedule</div>
                  <h2>{group.bandName}</h2>
                  <p>{group.items.length} practice {group.items.length === 1 ? 'date' : 'dates'} this month</p>
                </div>
                <div className={styles.bandProgress}>
                  <strong>{bandAnswered}/{group.items.length}</strong>
                  <span>answered</span>
                </div>
              </div>

              <div className={styles.optionList}>
                {group.items.map((item, index) => {
                  const answer = answers[item.responseId]
                  const needsReason = answer.response === 'Maybe' || answer.response === 'Unavailable'
                  const status = statuses[item.responseId] || { state: 'idle' }

                  return (
                    <article className={styles.optionCard} key={item.responseId}>
                      <div className={styles.optionNumber}>{String(index + 1).padStart(2, '0')}</div>

                      <div className={styles.optionHeader}>
                        <div>
                          <div className={styles.bandPill}>{item.eventType}</div>
                          <h3>{item.dateLabel}</h3>
                          <div className={styles.optionDetails}>
                            <span>{item.timeLabel}</span>
                            {item.location && <span>{item.location}</span>}
                          </div>
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
                            onClick={() => update(item, { response: choice.value })}
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
                              onChange={event => update(item, { reason: event.target.value })}
                              required
                            >
                              <option value="">Choose a reason</option>
                              {REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
                            </select>
                          </label>

                          <label className={styles.field}>
                            <span>Note <em>optional</em></span>
                            <textarea
                              rows="3"
                              maxLength="500"
                              value={answer.notes}
                              placeholder="Add context only when it helps with scheduling."
                              onChange={event => update(item, { notes: event.target.value }, false)}
                              onBlur={() => save(item, answersRef.current[item.responseId])}
                            />
                          </label>

                          {answer.response === 'Unavailable' && (
                            <label className={styles.blackoutToggle}>
                              <input
                                type="checkbox"
                                checked={answer.hardBlackout}
                                onChange={event => update(item, { hardBlackout: event.target.checked })}
                              />
                              <span>
                                <strong>Add this as a {item.bandName} blackout date</strong>
                                <small>Use this when the conflict should also block other scheduling for this band.</small>
                              </span>
                            </label>
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginTop: 18,
                          paddingTop: 15,
                          borderTop: '1px solid var(--c-border)',
                        }}
                      >
                        <div style={statusStyle(status.state)}>
                          {saveLabel(item)}
                          {status.state === 'error' && (
                            <button
                              type="button"
                              onClick={() => save(item, answersRef.current[item.responseId])}
                              style={{
                                border: '1px solid rgba(255,255,255,0.16)',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.06)',
                                color: '#fff',
                                cursor: 'pointer',
                                font: 'inherit',
                                padding: '4px 8px',
                              }}
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <section className={styles.submitCard}>
        <div>
          <div className={styles.eyebrow}>Always editable</div>
          <h2>No final submit button</h2>
          <p>
            Your latest saved answer is the answer Echo Play Live will use. Reopen this page
            whenever work, family, health, or another booking changes your plans.
          </p>
        </div>
      </section>
    </div>
  )
}
