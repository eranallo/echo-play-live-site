'use client'
import { useState, useEffect, useRef } from 'react'
import Nav from '@/components/Nav'
import FaqSection from '@/components/FaqSection'
import { FAQ_CONTACT } from '@/lib/faqs'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const els = ref.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function ContactPage() {
  const pageRef = useScrollReveal()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingEmail, setBookingEmail] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', band: '', eventType: '', date: '', venue: '', message: '',
    website: '', // honeypot. humans never fill this; bots usually do
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  // Resolve mailto fallback: band-specific email when a band is selected,
  // else CC all four band emails so the right team sees it.
  const getMailtoFallback = (bandName) => {
    if (bandName) {
      const band = bandsList.find(b => b.name === bandName)
      if (band?.bookingEmail) return band.bookingEmail
    }
    return bandsList.map(b => b.bookingEmail).filter(Boolean).join(',')
  }

  // Resolve the band-specific email for display in success state.
  const getBandEmail = (bandName) => {
    if (!bandName) return ''
    return bandsList.find(b => b.name === bandName)?.bookingEmail || ''
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)

    // Honeypot trap: if `website` field has any value, silently treat as success
    // without saving. Bots get nothing; humans never see this happen.
    if (form.website && form.website.trim() !== '') {
      setBookingEmail('')
      setSubmitted(true)
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setBookingEmail(data.bookingEmail || '')
        setSubmitted(true)
      } else {
        // Fallback to mailto if API fails
        const subject = encodeURIComponent(`Booking Inquiry${form.band ? ` - ${form.band}` : ''}`)
        const body = encodeURIComponent(
          `Name: ${form.name}\nEmail: ${form.email}\nBand: ${form.band}\nEvent Type: ${form.eventType}\nDate: ${form.date}\nVenue: ${form.venue}\n\nMessage:\n${form.message}`
        )
        window.location.href = `mailto:${getMailtoFallback(form.band)}?subject=${subject}&body=${body}`
        setSubmitted(true)
      }
    } catch {
      // Fallback to mailto
      const subject = encodeURIComponent(`Booking Inquiry${form.band ? ` - ${form.band}` : ''}`)
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nBand: ${form.band}\nEvent Type: ${form.eventType}\nDate: ${form.date}\nVenue: ${form.venue}\n\nMessage:\n${form.message}`)
      window.location.href = `mailto:${getMailtoFallback(form.band)}?subject=${subject}&body=${body}`
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{
          padding: 'clamp(120px, 16vw, 200px) var(--gutter-fluid) clamp(60px, 8vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 30% 60%, rgba(212, 160, 23,0.04) 0%, transparent 60%)',
          }} />
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div className="section-label reveal" style={{ marginBottom: '16px' }}>Get In Touch</div>
            <h1 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(64px, 14vw, 160px)',
              letterSpacing: '0.01em',
              lineHeight: 0.85,
              marginBottom: '24px',
            }}>
              Book a<br />
              <span style={{ color: '#D4A017' }}>Show</span>
            </h1>
            <p className="reveal delay-200" style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: '480px',
            }}>
              Reach out for booking inquiries, venue partnerships, or general questions.
              We'll get back to you quickly.
            </p>
          </div>
        </section>

        {/* Form + Info */}
        <section style={{ padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="contact-layout" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: 'clamp(40px, 6vw, 100px)',
              alignItems: 'start',
            }}>

              {/* Form */}
              <div>
                <div className="section-label reveal" style={{ marginBottom: '32px' }}>Booking Inquiry</div>

                {submitted ? (
                  <div className="reveal" style={{
                    border: '1px solid rgba(212, 160, 23,0.3)',
                    background: 'rgba(212, 160, 23,0.04)',
                    padding: '40px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '48px',
                      letterSpacing: '0.04em',
                      color: '#D4A017',
                      marginBottom: '12px',
                    }}>Inquiry Received</div>
                    <p style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '15px',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.7,
                      marginBottom: '20px',
                    }}>
                      {bookingEmail ? (
                        <>Routed to <strong style={{ color: '#D4A017' }}>{bookingEmail}</strong>. Most bookers hear back within 24 hours.</>
                      ) : (
                        <>Routed to the right band&apos;s booking team. Most bookers hear back within 24 hours.</>
                      )}
                    </p>
                    {/* If a band was selected, offer a direct mailto for urgent cases */}
                    {form.band && getBandEmail(form.band) && (
                      <p style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.35)',
                      }}>
                        Need a faster reply? Email <a
                          href={`mailto:${getBandEmail(form.band)}`}
                          style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}
                        >{getBandEmail(form.band)}</a> directly.
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="reveal delay-100">
                    <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: '8px',
                        }}>Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Full Name"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: '8px',
                        }}>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: '8px',
                        }}>Which Band?</label>
                        <select
                          name="band"
                          value={form.band}
                          onChange={handleChange}
                          className="form-input"
                          style={{ cursor: 'pointer' }}
                        >
                          <option value="">All / Undecided</option>
                          {bandsList.map(b => (
                            <option key={b.slug} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: '8px',
                        }}>Event Type</label>
                        <select
                          name="eventType"
                          value={form.eventType}
                          onChange={handleChange}
                          className="form-input"
                          style={{ cursor: 'pointer' }}
                        >
                          <option value="">Select Type</option>
                          <option>Bar / Venue Show</option>
                          <option>Festival</option>
                          <option>Private Event</option>
                          <option>Corporate Event</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: '8px',
                        }}>Preferred Date</label>
                        <input
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          className="form-input"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: '8px',
                        }}>Venue / Location</label>
                        <input
                          type="text"
                          name="venue"
                          value={form.venue}
                          onChange={handleChange}
                          placeholder="Venue name or city"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.35)',
                        marginBottom: '8px',
                      }}>Message *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us about your event, expected attendance, budget, etc."
                        rows={5}
                        className="form-input"
                        style={{ resize: 'vertical', minHeight: '120px' }}
                      />
                    </div>

                    {/* Honeypot: humans skip this; bots typically auto-fill any field
                        with a name like "website". If filled on submit, we silently bail
                        without saving. Hidden visually + from keyboard + from screen readers. */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        opacity: 0,
                        pointerEvents: 'none',
                      }}
                    >
                      <label htmlFor="hp-website">Website (leave blank)</label>
                      <input
                        id="hp-website"
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em',
                        textTransform: 'uppercase', color: '#080808',
                        background: submitting ? 'rgba(212, 160, 23,0.6)' : '#D4A017',
                        padding: '16px 36px', border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="none" xmlns="http://www.w3.org/2000/svg"
                            className="form-spinner"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10" stroke="#080808" strokeOpacity="0.25" strokeWidth="3" />
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="#080808" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Sending
                        </>
                      ) : 'Send Inquiry →'}
                    </button>
                    <style jsx global>{`
                      .form-spinner {
                        animation: form-spin 0.8s linear infinite;
                        transform-origin: center;
                      }
                      @keyframes form-spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                      }
                      @media (prefers-reduced-motion: reduce) {
                        .form-spinner { animation: none; }
                      }
                    `}</style>
                  </form>
                )}
              </div>

              {/* Contact Info Sidebar */}
              <div className="reveal reveal-right delay-200">
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '36px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: '#D4A017',
                    marginBottom: '20px',
                  }}>Booking Direct</div>
                  <p style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.6,
                    marginBottom: '20px',
                  }}>
                    Email a band directly, or use the form for general inquiries.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bandsList.map(band => (
                      <a
                        key={band.slug}
                        href={`mailto:${band.bookingEmail}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          padding: '10px 0',
                          textDecoration: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
                          textTransform: 'uppercase', color: band.color,
                        }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: band.color }} />
                          {band.name}
                        </div>
                        <span style={{
                          fontFamily: 'Barlow, sans-serif',
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.7)',
                        }}>
                          {band.bookingEmail}
                        </span>
                      </a>
                    ))}
                  </div>
                  <p style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.25)',
                    marginTop: '20px',
                  }}>Fort Worth / DFW, Texas</p>
                </div>

                {/* Band Social Links */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '36px',
                }}>
                  <div style={{
                    fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: '#D4A017',
                    marginBottom: '20px',
                  }}>Follow Our Bands</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bandsList.map(band => (
                      <div key={band.slug}>
                        <div style={{
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: band.color,
                          marginBottom: '6px',
                        }}>{band.name}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {Object.entries(band.social).map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                                fontSize: '10px',
                                fontWeight: 600,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.35)',
                                textDecoration: 'none',
                                padding: '5px 10px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transition: 'color 0.2s ease, border-color 0.2s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color = band.color
                                e.currentTarget.style.borderColor = `${band.color}40`
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                              }}
                            >{platform}</a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FaqSection items={FAQ_CONTACT} heading="Booking FAQ" anchorId="faq" />

      </main>
      <Footer />
    </>
  )
}
