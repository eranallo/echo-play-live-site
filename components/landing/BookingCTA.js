// Phase 33 — Booking CTA section + collapsible BookingForm.
//
// Renders a single big CTA at the bottom of every QR landing. Clicking
// expands the BookingForm inline (no modal — modals are tricky on mobile and
// hostile to deep-linking).

'use client'

import { useState } from 'react'
import BookingForm from './BookingForm'

export default function BookingCTA({ bandName, bandSlug, bookingEmail, primaryColor = '#D4A017', inquirySource }) {
  const [open, setOpen] = useState(false)

  return (
    <section
      id="book"
      style={{
        padding: '24px 0 48px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      {!open && (
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <div
            style={{
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '12px',
            }}
          >
            Booking
          </div>
          <h2
            style={{
              fontFamily: 'var(--ff-display, sans-serif)',
              fontSize: 'clamp(32px, 7vw, 44px)',
              color: '#fff',
              lineHeight: 0.95,
              margin: '0 0 24px',
            }}
          >
            Book {bandName ? bandName : 'a band'}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: '16px 32px',
              background: primaryColor,
              border: 'none',
              color: '#0a0a0a',
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Get in touch
          </button>
          {bookingEmail && (
            <p
              style={{
                marginTop: '20px',
                fontFamily: 'var(--ff-body, sans-serif)',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Or email{' '}
              <a href={`mailto:${bookingEmail}`} style={{ color: primaryColor }}>
                {bookingEmail}
              </a>
            </p>
          )}
        </div>
      )}
      {open && (
        <div>
          <div style={{ textAlign: 'center', padding: '24px 20px 8px' }}>
            <h2
              style={{
                fontFamily: 'var(--ff-display, sans-serif)',
                fontSize: 'clamp(28px, 6vw, 36px)',
                color: '#fff',
                margin: '0 0 6px',
              }}
            >
              Book {bandName ? bandName : 'a band'}
            </h2>
            <p
              style={{
                fontFamily: 'var(--ff-body, sans-serif)',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                margin: 0,
              }}
            >
              We respond within 24 hours.
            </p>
          </div>
          <BookingForm
            bandName={bandName}
            bandSlug={bandSlug}
            bookingEmail={bookingEmail}
            primaryColor={primaryColor}
            inquirySource={inquirySource}
          />
        </div>
      )}
    </section>
  )
}
