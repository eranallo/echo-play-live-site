'use client'
import { useState, useEffect, useRef } from 'react'
import Nav from '@/components/Nav'
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
  const [form, setForm] = useState({
    name: '', email: '', band: '', eventType: '', date: '', venue: '', message: ''
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // In production, wire this to your preferred form handler (Formspree, Resend, etc.)
    const subject = encodeURIComponent(`Booking Inquiry${form.band ? ` - ${form.band}` : ''}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nBand: ${form.band}\nEvent Type: ${form.eventType}\nDate: ${form.date}\nVenue: ${form.venue}\n\nMessage:\n${form.message}`
    )
    window.location.href = `mailto:eranallo@echoplay.live?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{
          padding: 'clamp(120px, 16vw, 200px) 32px clamp(60px, 8vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 30% 60%, rgba(245,197,24,0.04) 0%, transparent 60%)',
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
              <span style={{ color: '#F5C518' }}>Show</span>
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
        <section style={{ padding: 'clamp(60px, 10vw, 120px) 32px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
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
                    border: '1px solid rgba(245,197,24,0.3)',
                    background: 'rgba(245,197,24,0.04)',
                    padding: '40px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '48px',
                      letterSpacing: '0.04em',
                      color: '#F5C518',
                      marginBottom: '12px',
                    }}>Message Sent!</div>
                    <p style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '15px',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      We'll be in touch shortly at {form.email}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="reveal delay-100">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

                    <button
                      type="submit"
                      style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#080808',
                        background: '#F5C518',
                        padding: '16px 36px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      Send Inquiry →
                    </button>
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
                    color: '#F5C518',
                    marginBottom: '20px',
                  }}>Direct Contact</div>
                  <a
                    href="mailto:eranallo@echoplay.live"
                    style={{
                      display: 'block',
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      marginBottom: '6px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                  >
                    eranallo@echoplay.live
                  </a>
                  <p style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.25)',
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
                    color: '#F5C518',
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

      </main>
      <Footer />
    </>
  )
}
