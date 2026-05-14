// Phase 34 — Band QR landing page (root slug, e.g., /the-dick-beldings).
//
// Server component. Pulls merged data via getBandLandingData (lib/bands.js
// canonical + Airtable overrides). Returns 404 for unknown slugs. Doesn't
// conflict with explicit routes (about/contact/shows/etc.) because Next.js
// resolves those first.

import { notFound } from 'next/navigation'
import { getBandLandingData, inquirySourceLabelFor } from '@/lib/qr-landing'
import { bandsList } from '@/lib/bands'
import Hero from '@/components/landing/Hero'
import LinkList from '@/components/landing/LinkList'
import MediaHighlights from '@/components/landing/MediaHighlights'
import BookingCTA from '@/components/landing/BookingCTA'

export const revalidate = 1800

export async function generateStaticParams() {
  return bandsList.map(b => ({ slug: b.slug }))
}

export default async function BandLandingPage({ params }) {
  const { slug } = await params
  const data = await getBandLandingData(slug)
  if (!data) notFound()

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Hero
        name={data.name}
        shortName={data.shortName}
        tagline={data.tagline}
        heroImage={data.heroImage}
        heroVideoUrl={data.heroVideoUrl}
        primaryColor={data.primaryColor}
      />

      {data.bio && (
        <section
          style={{
            padding: '24px 20px',
            maxWidth: '480px',
            margin: '0 auto',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--ff-body, sans-serif)',
            fontSize: '15px',
            lineHeight: 1.6,
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
          Echo Play Live
        </a>
      </footer>
    </main>
  )
}
