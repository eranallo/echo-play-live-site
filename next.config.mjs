/** @type {import('next').NextConfig} */

// ── Content-Security-Policy (Report-Only for v1) ──────────────────
// Browsers REPORT violations to the console but do not block. After observing
// a week or two of report traffic with no false positives, flip the header
// name from 'Content-Security-Policy-Report-Only' to 'Content-Security-Policy'
// in the headers() function below.
//
// 'unsafe-inline' on style-src is required because the codebase uses ~745
// inline style props (see Phase 40a). When that refactor lands, we can drop
// 'unsafe-inline'. Until then it's the realistic compromise.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://widget.bandsintown.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.vercel-storage.com https://*.airtableusercontent.com https://dl.airtable.com https://www.buzzsprout.com https://i.scdn.co https://mosaic.scdn.co",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.spotify.com https://api.airtable.com https://accounts.spotify.com https://rest.bandsintown.com",
  "frame-src 'self' https://widget.bandsintown.com https://open.spotify.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

const SECURITY_HEADERS = [
  // Force HTTPS for 2 years on this domain + all subdomains. Submitting to
  // the HSTS preload list later is a manual step at https://hstspreload.org.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Anti-clickjacking. Stronger than X-Frame-Options.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Trim referrer leakage on cross-origin navigation.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features the site doesn't use.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
  },
  // CSP in Report-Only mode for v1. Flip the header name to enforce once
  // violation reports look clean.
  { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
]

const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage (TDB + Jambi photos, future band media)
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
      // Airtable signed image URLs (member photos from MEMBERS.Website Photo)
      // Phase 10D: enables Next.js Image optimization for musician photos.
      // Airtable signs URLs that expire (~2h); we re-fetch every 60s via the
      // getMusicians revalidate window, so the optimizer always has fresh URLs.
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
      // Buzzsprout podcast cover art (Phase 15).
      {
        protocol: 'https',
        hostname: 'www.buzzsprout.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to every route.
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

export default nextConfig
