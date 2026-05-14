// Phase 33 — Booking form for QR landing pages.
//
// POSTs to /api/inquiry (existing endpoint with rate limit + validation from
// Phase 38). Passes inquirySource so the lead is tagged in Airtable INQUIRIES
// with the QR-landing channel.

'use client'

import { useState } from 'react'

const FIELD_STYLE = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
  fontFamily: 'var(--ff-body, sans-serif)',
  fontSize: '15px',
  borderRadius: '4px',
  outline: 'none',
}

export default function BookingForm({ bandName, bandSlug, bookingEmail, primaryColor = '#D4A017', inquirySource }) {
  const [state, setState] = useState({ name: '', email: '', date: '', venue: '', message: '', website: '' })
  const [status, setStatus] = useState('idle')  // idle | submitting | sent | error
  const [errMsg, setErrMsg] = useState('')

  function set(field, value) { setState(s => ({ ...s, [field]: value })) }

  async function submit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrMsg('')
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          band: bandName || '',
          inquirySource: inquirySource || (bandSlug ? `qr-landing:${bandSlug}` : 'qr-landing:hub'),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '24px 20px', textAlign: 'center', color: '#fff' }}>
        <div
          style={{
            fontFamily: 'var(--ff-display, sans-serif)',
            fontSize: '28px',
            color: primaryColor,
            marginBottom: '8px',
          }}
        >
          Got it.
        </div>
        <p
          style={{
            fontFamily: 'var(--ff-body, sans-serif)',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0,
          }}
        >
          We will be in touch within 24 hours.
          {bookingEmail ? (
            <>
              <br />Or reach us directly at{' '}
              <a href={`mailto:${bookingEmail}`} style={{ color: primaryColor }}>{bookingEmail}</a>.
            </>
          ) : null}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ padding: '0 20px 32px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={state.website}
        onChange={e => set('website', e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          required
          placeholder="Your name"
          value={state.name}
          onChange={e => set('name', e.target.value)}
          style={FIELD_STYLE}
          maxLength={80}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={state.email}
          onChange={e => set('email', e.target.value)}
          style={FIELD_STYLE}
          maxLength={120}
        />
        <input
          type="date"
          placeholder="Event date"
          value={state.date}
          onChange={e => set('date', e.target.value)}
          style={FIELD_STYLE}
        />
        <input
          type="text"
          placeholder="Venue or event name"
          value={state.venue}
          onChange={e => set('venue', e.target.value)}
          style={FIELD_STYLE}
          maxLength={120}
        />
        <textarea
          placeholder="Tell us about the event"
          value={state.message}
          onChange={e => set('message', e.target.value)}
          rows={3}
          style={{ ...FIELD_STYLE, resize: 'vertical', minHeight: '90px' }}
          maxLength={2000}
        />

        {status === 'error' && (
          <div
            role="alert"
            style={{
              padding: '12px',
              background: 'rgba(220,50,50,0.15)',
              border: '1px solid rgba(220,50,50,0.4)',
              color: '#ffb4b4',
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: '14px',
              borderRadius: '4px',
            }}
          >
            {errMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            padding: '16px 20px',
            background: primaryColor,
            border: 'none',
            color: '#0a0a0a',
            fontFamily: 'var(--ff-label, sans-serif)',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            borderRadius: '4px',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            opacity: status === 'submitting' ? 0.6 : 1,
            transition: 'transform 100ms ease',
          }}
        >
          {status === 'submitting' ? 'Sending…' : `Book ${bandName ? bandName : 'us'}`}
        </button>
      </div>
    </form>
  )
}
