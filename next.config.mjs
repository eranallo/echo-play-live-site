/** @type {import('next').NextConfig} */
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
}

export default nextConfig
