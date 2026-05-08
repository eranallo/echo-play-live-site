// Next.js auto-generates /robots.txt from this file.

const SITE_URL = 'https://echoplay.live'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
