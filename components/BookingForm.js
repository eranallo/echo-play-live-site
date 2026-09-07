'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
export default function BookingForm({ bands, initialBand = '' }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    band: initialBand,
    eventType: '',
    date: '',
    venue: '',
    message: '',
    attendance: '',
    budget: '',
    production: '',
    website: '',
  })
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const statusRef = useRef(null)
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const contact = bands.find((b) => b.name === form.band)?.email || 'eranallo@echoplay.live'
  const emailLink = `mailto:${contact}?subject=${encodeURIComponent('Booking inquiry' + (form.band ? ' · ' + form.band : ''))}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nBand: ${form.band}\nEvent: ${form.eventType}\nDate: ${form.date}\nVenue: ${form.venue}\nAudience: ${form.attendance || 'Not sure yet'}\nBudget: ${form.budget || 'Not sure yet'}\nProduction: ${form.production || 'To discuss'}\n\n${form.message}`)}`
  async function submit(e) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError('')
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(15000),
      })
      const data = await response.json()
      if (!response.ok || data.success !== true)
        throw new Error(data.error || 'We couldn’t save your inquiry. Please try again.')
      setReceipt(data)
      setState('success')
      requestAnimationFrame(() => statusRef.current?.focus())
      window.dispatchEvent(new CustomEvent('epl:inquiry-saved'))
    } catch (err) {
      setState('error')
      setError(
        err.name === 'TimeoutError'
          ? 'We couldn’t confirm delivery. Please email us before sending again to avoid a duplicate inquiry.'
          : err.message || 'We couldn’t confirm delivery. Your details are still here.',
      )
      requestAnimationFrame(() => statusRef.current?.focus())
    }
  }
  if (state === 'success')
    return (
      <div className="booking-form booking-success" role="status" tabIndex={-1} ref={statusRef}>
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>
        <h2>Thanks for reaching out!</h2>
        <p>
          We’ve received your inquiry. We’ll review the details and follow up at{' '}
          <strong>{form.email}</strong>.
        </p>
        <p>Your booking still needs to be confirmed.</p>
        <Link className="button" href="/bands">
          Explore the bands →
        </Link>
        {receipt?.bookingEmail && (
          <p>
            Need to add something?{' '}
            <a className="text-link" href={`mailto:${receipt.bookingEmail}`}>
              Email the booking team
            </a>
          </p>
        )}
      </div>
    )
  return (
    <form className="booking-form" onSubmit={submit} aria-label="Booking inquiry">
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          value={form.website}
          onChange={update}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Your name *</label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            maxLength={80}
            value={form.name}
            onChange={update}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email address *</label>
          <input
            id="email"
            name="email"
            required
            type="email"
            autoComplete="email"
            maxLength={120}
            value={form.email}
            onChange={update}
          />
        </div>
        <div className="field">
          <label htmlFor="band">Which band?</label>
          <select id="band" name="band" value={form.band} onChange={update}>
            <option value="">Help me choose</option>
            {bands.map((b) => (
              <option key={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="eventType">Event type</label>
          <select id="eventType" name="eventType" value={form.eventType} onChange={update}>
            <option value="">Select an event type</option>
            {['Bar / Venue Show', 'Festival', 'Private Event', 'Corporate Event', 'Other'].map(
              (type) => (
                <option key={type}>{type}</option>
              ),
            )}
          </select>
        </div>
        <div className="field">
          <label htmlFor="date">Preferred date</label>
          <input id="date" name="date" type="date" value={form.date} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="venue">Venue / city</label>
          <input id="venue" name="venue" maxLength={120} value={form.venue} onChange={update} />
        </div>
        <div className="field field-wide">
          <label htmlFor="message">Tell us about your event *</label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={2000}
            value={form.message}
            onChange={update}
            placeholder="Where is the event, who’s coming, and what music do you have in mind?"
          />
        </div>
      </div>
      <details className="booking-extra">
        <summary>A few more details (optional)</summary>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="attendance">Expected audience size</label>
            <input id="attendance" name="attendance" type="number" inputMode="numeric" min="1" max="1000000" step="1" placeholder="Leave blank if you’re not sure" value={form.attendance} onChange={update} />
          </div>
          <div className="field">
            <label htmlFor="budget">Budget for the band</label>
            <input id="budget" name="budget" maxLength={80} placeholder="A range is fine, or leave blank" value={form.budget} onChange={update} />
          </div>
          <div className="field field-wide">
            <label htmlFor="production">Sound, lighting & stage</label>
            <textarea id="production" name="production" maxLength={400} placeholder="What does the venue provide, and what would you need from us? It’s okay if you’re still figuring this out." value={form.production} onChange={update} />
          </div>
        </div>
      </details>
      <p className="form-note">
        * Required. Your details are used to respond to this inquiry.{' '}
        <Link href="/privacy">Privacy details</Link>.
      </p>
      {error && (
        <div className="form-error" ref={statusRef} role="alert" tabIndex={-1}>
          {error}
          <br />
          <a href={emailLink}>Open an email draft instead ↗</a>
          <br />
          <small>You’ll need to send the draft from your email app.</small>
        </div>
      )}
      <button className="button" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending your inquiry…' : 'Send booking inquiry ↗'}
      </button>
    </form>
  )
}
