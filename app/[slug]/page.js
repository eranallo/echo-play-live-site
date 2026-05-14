// Phase 34 / 42 — Band QR landing page (root slug, e.g., /the-dick-beldings).
//
// Server component. Pulls merged data via getBandLandingData (lib/bands.js
// canonical + Airtable overrides). Returns 404 for unknown slugs.
//
// Phase 42 refinements: wrapped in RevealOnView for scroll-reveal animations;
// added subtle band-color tinted background gradient at the bottom.

import { notFound } from 'next/navigation'
import { getBandLandingData, inquirySourceLabelFor } from '@/lib/qr-landing'
import { bandsList } from '@/lib/bands'
import Hero from '@/components/landing/Hero'
import LinkList from '@/components/landing/LinkList'
import MediaHighlights from '@/components/landing/MediaHighlights'
import BookingCTA from '@/components/landing/BookingCTA'
import RevealOnView from '@/components/RevealOnView'

export const revalidate = 1800

export async function generateStaticParams() {
  return bandsList.map(b => ({ slug: b.slug }))
}

export default async function BandLandingPage({ params }) {
  const { slug } = await params
  const data = await getBandLandingData(slug)
  if (!data) notFound()

  return (
    <RevealOnView>
      <main
        style={{
          background: `radial-gradient(ellipse at 50% 90%, ${data.primaryColor}15 0%, transparent 50%), #0a0a0a`,
          minHeight: '100vh',
        }}
      >
        <Hero
          name={data.name}
          shortName={data.shortName}
          tagline={data.tagline}
          heroImage={data.heroImage}
          heroVideoUrl={data.heroVideoUrl}
          primaryColor={data.primaryColor}
          secondaryColor={data.secondaryColor}
        />

        {data.bio && (
          <section
            className="reveal-up"
            style={{
              padding: '40px 24px 8px',
              maxWidth: '520px',
              margin: '0 auto',
              color: 'rgba(255,255,255,0.88)',
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: '16px',
              lineHeight: 1.65,
              whiteSpace: 'pre-line',
              textAlign: 'center',
            }}
          >
            {data.bio}
          </section>
        )}

        <LinkList links={data.links} primaryColor={data.primaryColor} />
        <MediaHighlights media={data.media} primaryColor={data.primaryColor} />
        <BookingCTA
          bandName={data.name}
          bandSlug={data.slug}
          bookingEmail={data.bookingEmail}
          primaryColor={data.primaryColor}
          inquirySource={inquirySourceLabelFor(data.slug)}
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
            Echo Play Live
          </a>
        </footer>
      </main>
    </RevealOnView>
  )
}
