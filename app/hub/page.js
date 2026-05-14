// Phase 34 / 42 — EPL Hub QR landing.
//
// Phase 42 refinements: RevealOnView wrapper + gold-tinted background gradient.

import { getHubData, inquirySourceLabelFor } from '@/lib/qr-landing'
import Hero from '@/components/landing/Hero'
import RosterGrid from '@/components/landing/RosterGrid'
import BookingCTA from '@/components/landing/BookingCTA'
import RevealOnView from '@/components/RevealOnView'

export const revalidate = 1800

const ACCENT = '#D4A017'

export default async function HubPage() {
  const data = await getHubData()

  return (
    <RevealOnView>
      <main
        style={{
          background: `radial-gradient(ellipse at 50% 90%, ${ACCENT}15 0%, transparent 50%), #0a0a0a`,
          minHeight: '100vh',
        }}
      >
        <Hero
          name={data.heroHeadline}
          tagline={data.heroSubhead}
          heroImage={data.heroImage}
          primaryColor={ACCENT}
        />

        {data.about && (
          <section
            className="reveal-up"
            style={{
              padding: '48px 24px 12px',
              maxWidth: '640px',
              margin: '0 auto',
              color: 'rgba(255,255,255,0.88)',
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: '16px',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              textAlign: 'center',
            }}
          >
            {data.about}
          </section>
        )}

        <RosterGrid bands={data.bands} />

        {data.services && (
          <section
            className="reveal-up"
            style={{
              padding: '32px 24px 16px',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            <div
              aria-hidden
              style={{
                width: '40px',
                height: '2px',
                background: ACCENT,
                margin: '0 auto 16px',
                boxShadow: `0 0 12px ${ACCENT}80`,
              }}
            />
            <div
              style={{
                fontFamily: 'var(--ff-label, sans-serif)',
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: ACCENT,
                textAlign: 'center',
                marginBottom: '14px',
              }}
            >
              What we do
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'var(--ff-body, sans-serif)',
                fontSize: '15px',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
              }}
            >
              {data.services}
            </div>
          </section>
        )}

        <BookingCTA
          bandName="Echo Play Live"
          bandSlug="hub"
          bookingEmail={data.bookingEmail}
          primaryColor={ACCENT}
          inquirySource={inquirySourceLabelFor('hub')}
        />

        <footer
          style={{
            padding: '32px 20px 48px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--ff-label, sans-serif)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            echoplay.live
          </a>
        </footer>
      </main>
    </RevealOnView>
  )
}
