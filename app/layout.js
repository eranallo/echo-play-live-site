import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { bands, bandsList } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Echo Play Live | Tribute & Cover Band Management · DFW',
    template: '%s | Echo Play Live',
  },
  description: 'DFW tribute and cover band management. Home of So Long Goodnight, The Dick Beldings, Jambi, and Elite. Live, full-band performances. Book a band for your venue, festival, or event.',
  keywords: [
    'Echo Play Live',
    'DFW band management',
    'tribute bands DFW',
    'cover bands Fort Worth',
    'Fort Worth music',
    'Dallas tribute bands',
    'So Long Goodnight',
    'The Dick Beldings',
    'Jambi TOOL tribute',
    'Elite Deftones tribute',
    'book a band DFW',
    'venue booking Texas',
  ],
  authors: [{ name: 'Echo Play Live' }],
  creator: 'Echo Play Live',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Echo Play Live',
    title: 'Echo Play Live | Tribute & Cover Band Management · DFW',
    description: 'DFW tribute and cover band management. Live, full-band performances. Book a band for your venue, festival, or event.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo Play Live | Tribute & Cover Band Management · DFW',
    description: 'DFW tribute and cover band management. Live, full-band performances. Book a band for your venue, festival, or event.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// JSON-LD: LocalBusiness for the EPL operation, MusicGroup for each band.
// Helps Google show rich knowledge cards and link bands → roster on search.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#organization`,
      name: 'Echo Play Live',
      alternateName: 'EPL',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/opengraph-image.png`,
      description: 'DFW tribute and cover band management. Live, full-band performances.',
      foundingDate: '2023',
      founder: { '@type': 'Person', name: 'Evan Ranallo' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Fort Worth',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
      areaServed: [
        { '@type': 'City', name: 'Fort Worth' },
        { '@type': 'City', name: 'Dallas' },
        { '@type': 'AdministrativeArea', name: 'DFW Metroplex' },
      ],
      makesOffer: { '@type': 'Offer', name: 'Live music booking' },
    },
    ...bandsList.map(band => ({
      '@type': 'MusicGroup',
      '@id': `${SITE_URL}/bands/${band.slug}#group`,
      name: band.name,
      url: `${SITE_URL}/bands/${band.slug}`,
      description: band.description,
      foundingLocation: { '@type': 'Place', name: 'Fort Worth, TX' },
      genre: band.genre,
      image: band.heroPhoto ? [band.heroPhoto] : undefined,
      sameAs: [
        band.social?.facebook,
        band.social?.instagram,
        band.social?.bandsintown,
      ].filter(Boolean),
      email: band.bookingEmail,
    })),
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Barlow+Condensed:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        {/* Phase 13: Vercel Web Analytics (page views + referrers) +
            Speed Insights (real-user Core Web Vitals). Cookieless. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
