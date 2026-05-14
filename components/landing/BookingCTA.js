// Phase 42 — Refined Booking CTA + collapsible form.
//
// Major changes from v1:
// - Larger, more impactful CTA button with band-color glow on hover
// - Better visual hierarchy in expanded state (accent line above heading)
// - Smooth expand transition
// - More prominent "responds within 24h" microcopy as a trust signal

'use client'

import { useState } from 'react'
import BookingForm from './BookingForm'

export default function BookingCTA({ bandName, bandSlug, bookingEmail, primaryColor = '#D4A017', inquirySource }) {
  const [open, setOpen] = useState(false)

  return (
    <section
      id="book"
      className="reveal-up"
      style={{
        padding: '48px 0 64px',
        borderTop: `1px solid ${primaryColor}25`,
        background: `radial-gradient(ellipse at 50% 0%, ${primaryColor}10 0%, transparent 60%), rgba(255,255,255,0.015)`,
      }}
    >
      {!open && (
        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
          {/* Accent line above */}
          <div
            aria-hidden
            style={{
              width: '40px',
              height: '2px',
              background: primaryColor,
              margin: '0 auto 20px',
              boxShadow: `0 0 12px ${primaryColor}80`,
            }}
          />
          <div
            style={{
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: primaryColor,
              marginBottom: '14px',
            }}
          >
            Booking
          </div>
          <h2
            style={{
              fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)',
              fontSize: 'clamp(36px, 8vw, 52px)',
              color: '#fff',
              lineHeight: 0.95,
              letterSpacing: '0.02em',
              margin: '0 0 8px',
            }}
          >
            Book {bandName ? bandName : 'a band'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              margin: '0 0 28px',
            }}
          >
            We respond within 24 hours.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: '18px 40px',
              background: primaryColor,
              border: 'none',
              color: '#0a0a0a',
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              boxShadow: `0 4px 20px ${primaryColor}50`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 8px 28px ${primaryColor}80`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 20px ${primaryColor}50`
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          >
            Get in touch
          </button>
          {bookingEmail && (
            <p
              style={{
                marginTop: '24px',
                fontFamily: 'var(--ff-body, sans-serif)',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Or email{' '}
              <a
                href={`mailto:${bookingEmail}`}
                style={{
                  color: primaryColor,
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  textDecorationColor: `${primaryColor}60`,
                }}
              >
                {bookingEmail}
              </a>
            </p>
          )}
        </div>
      )}
      {open && (
        <div>
          <div style={{ textAlign: 'center', padding: '32px 20px 8px' }}>
            <div
              aria-hidden
              style={{
                width: '40px',
                height: '2px',
                background: primaryColor,
                margin: '0 auto 16px',
                boxShadow: `0 0 12px ${primaryColor}80`,
              }}
            />
            <h2
              style={{
                fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)',
                fontSize: 'clamp(32px, 6vw, 42px)',
                color: '#fff',
                letterSpacing: '0.02em',
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
