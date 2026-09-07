/** @type {import('next').NextConfig} */
import { newsletterForm, validNewsletterForm } from './lib/public/newsletter-config.mjs'

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://widget.bandsintown.com https://connect.facebook.net https://analytics.tiktok.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.vercel-storage.com https://*.airtableusercontent.com https://dl.airtable.com https://www.buzzsprout.com https://i.scdn.co https://mosaic.scdn.co https://www.facebook.com https://analytics.tiktok.com https://*.tiktok.com",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com https://*.vercel-storage.com https://*.airtableusercontent.com",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.spotify.com https://api.airtable.com https://accounts.spotify.com https://rest.bandsintown.com https://www.facebook.com https://graph.facebook.com https://analytics.tiktok.com https://*.tiktok.com",
  "frame-src 'self' https://widget.bandsintown.com https://open.spotify.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self'${validNewsletterForm(newsletterForm) ? ` ${new URL(newsletterForm.action).origin}` : ''}`,
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
  },
  { key: 'Content-Security-Policy', value: CSP },
]

const nextConfig = {
  outputFileTracingIncludes: {
    '/api/press/[slug]': ['./public/press/kits/*.pdf'],
    '/api/press/[slug]/photo': [
      './public/bands/*/hero.jpg',
      './public/bands/jambi/gallery/photo-2.jpg',
      './public/bands/elite/gallery/photo-1.jpg',
    ],
  },
  async redirects() {
    return [{ source: '/book', destination: '/contact', permanent: true }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wkqcpwrvrb9fa0hy.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.airtableusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
      },
      {
        protocol: 'https',
        hostname: 'www.buzzsprout.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

export default nextConfig
