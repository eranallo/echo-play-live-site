export const SITE_URL = 'https://echoplay.live'
export const DEFAULT_SHARE_IMAGE = '/opengraph-image.png'

export function pageMetadata({ title, description, path, image = DEFAULT_SHARE_IMAGE, imageAlt = 'Echo Play Live', noindex = false, canonical = path, type = 'website' }) {
  const shareTitle = title.includes('Echo Play Live') ? title : `${title} | Echo Play Live`
  const images = [{ url: image, width: 1200, height: 630, alt: imageAlt }]
  return {
    title, description,
    alternates: { canonical },
    ...(noindex ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
    openGraph: { type, title: shareTitle, description, url: `${SITE_URL}${path}`, siteName: 'Echo Play Live', locale: 'en_US', images },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images: images.map(({ url }) => url) },
  }
}

export const bandSearchCopy = {
  'so-long-goodnight': { title: 'So Long Goodnight · Emo & Pop Punk Cover Band', description: 'So Long Goodnight brings 2000s emo and pop punk to DFW. Explore the songs, find upcoming shows, and book the band for your venue or event.' },
  'the-dick-beldings': { title: 'The Dick Beldings · 90s Cover Band in DFW', description: 'The Dick Beldings play your 90s rock and alternative favorites across Dallas–Fort Worth. Find shows, browse the songs, and get in touch about booking.' },
  jambi: { title: 'Jambi · TOOL Tribute Band in DFW', description: 'Jambi is a TOOL tribute band from Dallas–Fort Worth. Watch a live performance, find upcoming shows, explore the music, and ask about booking.' },
  elite: { title: 'Elite · Deftones Tribute Band in Texas', description: 'Elite is a Fort Worth Deftones tribute band. Watch the band live, find upcoming shows, explore the music, and get in touch to book your event.' },
}
