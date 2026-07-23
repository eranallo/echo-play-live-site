'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BLACKOUT_REASONS } from '@/lib/portal/model.mjs'

export default function AvailabilityForm({ personType, personId }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    setError('')

    const form = new FormData(event.currentTarget)
    const payload = {
      personType,
      personId,
      date: form.get('date'),
      endDate: form.get('endDate'),
      reason: form.get('reason'),
      notes: form.get('notes'),
    }

    try {
      const response = await fetch('/api/portal/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'The blackout date could not be saved.')
      }

      event.currentTarget.reset()
      setMessage('Blackout added to Airtable.')
      setOpen(false)
      router.refresh()
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="portal-availability-form">
      <button
        className="portal-secondary-button"
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen(value => !value)
          setError('')
          setMessage('')
        }}
      >
        {open ? 'Close form' : 'Add blackout date'}
      </button>

      {open && (
        <form onSubmit={submit}>
          <div className="portal-form-grid">
            <label>
              <span>Start date</span>
              <input name="date" type="date" required />
            </label>
            <label>
              <span>End date</span>
              <input name="endDate" type="date" />
            </label>
          </div>
          <label>
            <span>Reason</span>
            <select name="reason" defaultValue="Personal" required>
              {BLACKOUT_REASONS.map(reason => <option key={reason}>{reason}</option>)}
            </select>
          </label>
          <label>
            <span>Notes <small>optional</small></span>
            <textarea name="notes" rows="3" maxLength="2000" placeholder="Anything Evan should know?" />
          </label>
          <button className="portal-primary-button" type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save blackout'}
          </button>
        </form>
      )}

      {message && <div className="portal-form-success">{message}</div>}
      {error && <div className="portal-form-error">{error}</div>}
    </div>
  )
}
