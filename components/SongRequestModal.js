'use client'

// Phase 20: Song request modal.
//
// Used by both the tribute discography view (Elite/Jambi — pre-fills song info
// from the unplayed track) and the regular catalog (SLGN/TDB — user types
// the title and artist themselves). Hidden by default; the parent component
// passes an `open` prop and an `onClose` handler.
//
// On submit, POSTs to /api/song-request. Renders three states: form,
// submitting (button spinner), success (a brief thanks before auto-close).

import { useEffect, useRef, useState } from 'react'

export default function SongRequestModal({
  open,
  onClose,
  band,
  prefill = null,           // { songTitle, originalArtist, album, spotifyTrackId, spotifyTrackUrl }
}) {
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState(null)
  const [form, setForm] = useState({
    songTitle: '',
    originalArtist: '',
    requesterName: '',
    requesterEmail: '',
    message: '',
  })

  // Reset form whenever the modal is opened with new prefill data.
  useEffect(() => {
    if (!open) return
    setStatus('idle')
    setErrorMsg(null)
    setForm({
      songTitle: prefill?.songTitle || '',
      originalArtist: prefill?.originalArtist || '',
      requesterName: '',
      requesterEmail: '',
      message: '',
    })
  }, [open, prefill])

  // Lock body scroll while modal is open; close on Escape.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  // After success, auto-close after a couple seconds.
  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => onClose?.(), 1800)
    return () => clearTimeout(t)
  }, [status, onClose])

  if (!open) return null

  const accent = band?.color || 'var(--c-epl)'

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.songTitle.trim()) {
      setErrorMsg('Song title is required.')
      return
    }
    setStatus('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/song-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandSlug: band.slug,
          songTitle: form.songTitle.trim(),
          originalArtist: form.originalArtist.trim() || prefill?.originalArtist || '',
          album: prefill?.album || '',
          spotifyTrackId: prefill?.spotifyTrackId || '',
          spotifyTrackUrl: prefill?.spotifyTrackUrl || '',
          requesterName: form.requesterName.trim(),
          requesterEmail: form.requesterEmail.trim(),
          message: form.message.trim(),
          // honeypot — real users never fill this; bots do
          company: '',
        }),
      })
      const data = await res.json()
      if (!res.ok || data?.ok !== true) {
        setStatus('error')
        setErrorMsg(data?.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-request-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px)',
        animation: 'songRequestFadeIn 0.18s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--c-bg)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: `3px solid ${accent}`,
          padding: 'clamp(24px, 4vw, 40px)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close request form"
          style={{
            position: 'absolute',
            top: '12px', right: '12px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '26px',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '8px',
            transition: 'color var(--d-fast) var(--ease-in-out)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >×</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '40px', height: '40px',
              margin: '0 auto var(--s-4)',
              borderRadius: '50%',
              background: accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--c-bg)',
              fontFamily: 'var(--ff-display)',
              fontSize: '22px',
            }}>✓</div>
            <h2 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(22px, 3vw, 30px)',
              letterSpacing: '0.02em',
              color: 'var(--c-text)',
              marginBottom: 'var(--s-2)',
            }}>Request sent</h2>
            <p style={{
              fontFamily: 'var(--ff-body)',
              fontSize: '15px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.6,
            }}>Thanks for the request. We'll take a look.</p>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 'var(--s-2)',
            }}>Request a song</div>
            <h2 id="song-request-title" style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              letterSpacing: '0.02em',
              lineHeight: 1.05,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-2)',
            }}>
              {prefill?.songTitle
                ? `Tell ${band.shortName} to learn "${prefill.songTitle}"`
                : `Ask ${band.shortName} to add a song`}
            </h2>
            <p style={{
              fontFamily: 'var(--ff-body)',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              marginBottom: 'var(--s-5)',
            }}>
              Requests go straight to the band. Name and email are optional, but they help us follow up if a song makes it into the set.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {/* Song Title (always shown, prefilled when applicable) */}
              <Field
                label="Song title"
                required
                value={form.songTitle}
                onChange={v => update('songTitle', v)}
                readOnly={Boolean(prefill?.songTitle)}
                accent={accent}
              />
              {/* Original Artist (always shown; prefilled for tributes via prop) */}
              <Field
                label="Original artist"
                value={form.originalArtist}
                onChange={v => update('originalArtist', v)}
                readOnly={Boolean(prefill?.originalArtist)}
                placeholder={prefill?.originalArtist || 'e.g., Brand New, Radiohead'}
                accent={accent}
              />
              <Field
                label="Your name (optional)"
                value={form.requesterName}
                onChange={v => update('requesterName', v)}
                accent={accent}
              />
              <Field
                label="Email (optional)"
                type="email"
                value={form.requesterEmail}
                onChange={v => update('requesterEmail', v)}
                accent={accent}
              />
              <Field
                label="Anything else (optional)"
                multiline
                value={form.message}
                onChange={v => update('message', v)}
                placeholder="Why do you want to hear it? Any specific moment in the song?"
                accent={accent}
              />
              {/* honeypot */}
              <input type="text" name="company" autoComplete="off" tabIndex={-1}
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                aria-hidden="true"
              />

              {errorMsg && (
                <div role="alert" style={{
                  fontFamily: 'var(--ff-body)',
                  fontSize: '13px',
                  color: '#ff8a8a',
                  marginTop: 'var(--s-1)',
                }}>{errorMsg}</div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  marginTop: 'var(--s-3)',
                  fontFamily: 'var(--ff-label)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: 'var(--ls-label-tight)',
                  textTransform: 'uppercase',
                  color: 'var(--c-bg)',
                  background: accent,
                  border: 'none',
                  padding: '14px 24px',
                  cursor: status === 'submitting' ? 'wait' : 'pointer',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  transition: 'opacity var(--d-fast) var(--ease-in-out)',
                }}
              >
                {status === 'submitting' ? 'Sending…' : 'Send request'}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes songRequestFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required, readOnly, multiline, placeholder, accent }) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{
        fontFamily: 'var(--ff-label)',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)',
      }}>{label}{required && <span style={{ color: accent, marginLeft: '4px' }}>*</span>}</span>
      <Tag
        type={multiline ? undefined : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        style={{
          width: '100%',
          fontFamily: 'var(--ff-body)',
          fontSize: '15px',
          color: 'var(--c-text)',
          background: readOnly ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '11px 14px',
          outline: 'none',
          resize: multiline ? 'vertical' : 'none',
          transition: 'border-color var(--d-fast) var(--ease-in-out)',
          fontFamily: multiline ? 'var(--ff-body)' : 'var(--ff-body)',
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = accent }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      />
    </label>
  )
}
