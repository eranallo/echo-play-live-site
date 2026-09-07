import './globals.css'
import './design.css'
import localFont from 'next/font/local'
import SiteMeasurement from '@/components/SiteMeasurement'

import { bandsList } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'
const gotham = localFont({
  src: './fonts/Gotham-Bold.ttf',
  variable: '--font-gotham',
  weight: '700',
  style: 'normal',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Echo Play Live | Tribute & Cover Band Management · DFW',
    template: '%s | Echo Play Live',
  },
  description:
    'DFW tribute and cover band management. Home of So Long Goodnight, The Dick Beldings, Jambi, and Elite. Live, full-band performances. Book a band for your venue, festival, or event.',
  authors: [{ name: 'Echo Play Live' }],
  creator: 'Echo Play Live',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Echo Play Live',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Echo Play Live' }],
    title: 'Echo Play Live | Tribute & Cover Band Management · DFW',
    description:
      'DFW tribute and cover band management. Live, full-band performances. Book a band for your venue, festival, or event.',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image.png'],
    title: 'Echo Play Live | Tribute & Cover Band Management · DFW',
    description:
      'DFW tribute and cover band management. Live, full-band performances. Book a band for your venue, festival, or event.',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
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
    ...bandsList.map((band) => ({
      '@type': 'MusicGroup',
      '@id': `${SITE_URL}/bands/${band.slug}#group`,
      name: band.name,
      url: `${SITE_URL}/bands/${band.slug}`,
      description: band.description,
      foundingLocation: { '@type': 'Place', name: 'Fort Worth, TX' },
      genre: band.genre,
      image: [`${SITE_URL}/social/${band.slug}.png`],
      sameAs: [band.social?.facebook, band.social?.instagram, band.social?.bandsintown, band.social?.youtube].filter(
        Boolean,
      ),
      email: band.bookingEmail,
    })),
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={gotham.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <SiteMeasurement />
      </body>
    </html>
  )
}
