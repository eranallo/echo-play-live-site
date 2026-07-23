'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AcknowledgmentPanel({
  showId,
  personType,
  personId,
  personName,
  roles = [],
  fingerprint,
  current = false,
  acknowledgedAtLabel = '',
}) {
  const router = useRouter()
  const [isCurrent, setIsCurrent] = useState(current)
  const [timestamp, setTimestamp] = useState(acknowledgedAtLabel)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function acknowledge() {
    setPending(true)
    setError('')

    try {
      const response = await fetch(`/api/portal/shows/${showId}/acknowledgment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personType,
          personId,
          fingerprint,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'The acknowledgment could not be saved.')
      }

      setIsCurrent(true)
      setTimestamp(data.acknowledgedAtLabel || 'Just now')
      router.refresh()
    } catch (acknowledgmentError) {
      setError(acknowledgmentError.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className={`portal-ack ${isCurrent ? 'portal-ack-current' : 'portal-ack-required'}`} aria-live="polite">
      <div className="portal-ack-icon" aria-hidden="true">{isCurrent ? '✓' : '!'}</div>
      <div className="portal-ack-copy">
        <div className="portal-eyebrow">{isCurrent ? 'Review complete' : 'Review required'}</div>
        <h2>{isCurrent ? `${personName} is up to date` : 'Confirm the show details'}</h2>
        <p>
          {isCurrent
            ? `Acknowledged ${timestamp || 'recently'}. If an important show detail changes, this will automatically require another review.`
            : 'Review the schedule, assignments, notes, setlists, contacts, and documents below before confirming.'}
        </p>
        {roles.length > 0 && <div className="portal-ack-roles">{roles.join(' • ')}</div>}
        {!isCurrent && (
          <button type="button" onClick={acknowledge} disabled={pending}>
            {pending ? 'Saving…' : 'I reviewed this show'}
          </button>
        )}
        {error && <div className="portal-form-error">{error}</div>}
      </div>
    </section>
  )
}
