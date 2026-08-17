'use client'

import { useMemo, useState } from 'react'
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

export default function AvailabilityForm({ data, token }) {
  const [answers, setAnswers] = useState(() => Object.fromEntries(
    data.items.map(item => [item.responseId, initialAnswer(item)])
  ))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const answeredCount = useMemo(() => data.items.filter(item => {
    const answer = answers[item.responseId]
    return Boolean(answer?.response)
  }).length, [answers, data.items])

  const invalidItems = useMemo(() => data.items.filter(item => {
    const answer = answers[item.responseId]
    if (!answer?.response) return true
    if ((answer.response === 'Maybe' || answer.response === 'Unavailable') && !answer.reason) return true
    return false
  }), [answers, data.items])

  function updateAnswer(responseId, changes) {
    setAnswers(current => {
      const next = { ...current[responseId], ...changes }

      if (changes.response === 'Available') {
        next.reason = ''
        next.hardBlackout = false
      }

      if (changes.response === 'Maybe') {
        next.hardBlackout = false
      }

      return { ...current, [responseId]: next }
    })
    setError('')
  }

  async function submitAvailability(event) {
    event.preventDefault()
    if (invalidItems.length > 0 || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/availability/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: data.items.map(item => ({
            responseId: item.responseId,
            ...answers[item.responseId],
          })),
        }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.error || 'Your availability could not be saved.')
      }

      setSuccess({ blackoutCount: body.blackoutCount || 0 })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (submissionError) {
      setError(submissionError.message || 'Your availability could not be saved.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className={styles.completeCard} aria-live="polite">
        <div className={styles.completeIcon}>✓</div>
        <div className={styles.eyebrow}>Complete</div>
        <h1>Availability saved</h1>
        <p>
          Thanks, {data.memberName}. Your responses for {data.cycleName} are now in Airtable.
        </p>
        {success.blackoutCount > 0 && (
          <p className={styles.completeNote}>
            {success.blackoutCount} blackout {success.blackoutCount === 1 ? 'date was' : 'dates were'} also added.
          </p>
        )}
      </section>
    )
  }

  return (
    <form className={styles.form} onSubmit={submitAvailability}>
      <section className={styles.introCard}>
        <div className={styles.introTopline}>
          <div>
            <div className={styles.eyebrow}>Monthly availability</div>
            <h1>{data.memberName}</h1>
          </div>
          <div className={styles.progressBadge}>
            <strong>{answeredCount}/{data.totalCount}</strong>
            <span>answered</span>
          </div>
        </div>

        <h2>{data.cycleName}</h2>
        <p>Choose Available, Maybe, or Unavailable for every date below.</p>

        <div className={styles.metaRow}>
          {data.dueLabel && <span><strong>Due:</strong> {data.dueLabel}</span>}
          {data.isPreview && <span className={styles.previewPill}>Test mode</span>}
        </div>

        {data.isPreview && (
          <div className={styles.previewNote}>
            This is the private test version. No musician email has been sent.
          </div>
        )}
      </section>

      <div className={styles.optionList}>
        {data.items.map((item, index) => {
          const answer = answers[item.responseId]
          const needsReason = answer.response === 'Maybe' || answer.response === 'Unavailable'

          return (
            <article className={styles.optionCard} key={item.responseId}>
              <div className={styles.optionNumber}>{String(index + 1).padStart(2, '0')}</div>

              <div className={styles.optionHeader}>
                <div>
                  <div className={styles.bandPill}>{item.bandName}</div>
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

              <div className={styles.choiceGrid} role="group" aria-label={`Availability for ${item.dateLabel}`}>
                {CHOICES.map(choice => (
                  <button
                    className={`${styles.choiceButton} ${answer.response === choice.value ? styles.choiceSelected : ''}`}
                    key={choice.value}
                    type="button"
                    aria-pressed={answer.response === choice.value}
                    onClick={() => updateAnswer(item.responseId, { response: choice.value })}
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
                      onChange={event => updateAnswer(item.responseId, { reason: event.target.value })}
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
                      onChange={event => updateAnswer(item.responseId, { notes: event.target.value })}
                    />
                  </label>

                  {answer.response === 'Unavailable' && (
                    <label className={styles.blackoutToggle}>
                      <input
                        type="checkbox"
                        checked={answer.hardBlackout}
                        onChange={event => updateAnswer(item.responseId, { hardBlackout: event.target.checked })}
                      />
                      <span>
                        <strong>Add this as a Jambi blackout date</strong>
                        <small>Use this only when the date is a firm conflict, not just a rehearsal preference.</small>
                      </span>
                    </label>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <section className={styles.submitCard}>
        <div>
          <div className={styles.eyebrow}>Review</div>
          <h2>{invalidItems.length === 0 ? 'Ready to submit' : `${invalidItems.length} date${invalidItems.length === 1 ? '' : 's'} still need attention`}</h2>
          <p>You can change any answer above before submitting.</p>
        </div>

        {error && <div className={styles.errorMessage} role="alert">{error}</div>}

        <button
          className={styles.submitButton}
          type="submit"
          disabled={invalidItems.length > 0 || submitting}
        >
          {submitting ? 'Saving...' : 'Submit availability'}
        </button>
      </section>
    </form>
  )
}
