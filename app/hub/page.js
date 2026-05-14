// Phase 34 — EPL Hub QR landing.
//
// Hybrid business pitch + band roster grid. Lives at /hub. Linked from the
// EPL master QR code (different from per-band codes).

import { getHubData, inquirySourceLabelFor } from '@/lib/qr-landing'
import Hero from '@/components/landing/Hero'
import RosterGrid from '@/components/landing/RosterGrid'
import BookingCTA from '@/components/landing/BookingCTA'

export const revalidate = 1800

export default async function HubPage() {
  const data = await getHubData()

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Hero
        name={data.heroHeadline}
        tagline={data.heroSubhead}
        heroImage={data.heroImage}
        primaryColor="#D4A017"
      />

      {data.about && (
        <section
          style={{
            padding: '32px 20px',
            maxWidth: '600px',
            margin: '0 auto',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--ff-body, sans-serif)',
            fontSize: '15px',
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
          style={{
            padding: '24px 20px 8px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            What we do
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: '14px',
              lineHeight: 1.6,
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
        primaryColor="#D4A017"
        inquirySource={inquirySourceLabelFor('hub')}
      />

      <footer
        style={{
          padding: '24px 20px 40px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'var(--ff-label, sans-serif)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          echoplay.live
        </a>
      </footer>
    </main>
  )
}
