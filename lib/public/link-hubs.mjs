import { getPerformance } from './performances.mjs'
import { bandKits } from '../press/kit-content.mjs'
import { publicBandPresentation } from './bands-presentation.js'

// Permanent owned destinations for printed codes. Public editorial data only.
export const linkHubs = [
  {
    slug: 'hub',
    name: 'Echo Play Live',
    path: '/hub',
    label: 'Tribute & cover bands · Fort Worth, Texas',
    intro: 'Glad you’re here. Find a show, meet the bands or get in touch about booking.',
    cover: '/bands/so-long-goodnight/feature.jpg',
    coverPosition: 'center 45%',
    logo: '/brand/epl-seal-white.png',
    logoStyle: 'seal',
    bookingEmail: 'eranallo@echoplay.live',
    links: [
      ['Book a band', 'Tell us about your event', '/contact'],
      ['Request a song', 'Vote for your favorites and see the crowd’s picks', '/requests'],
      ['Band kits & press', 'Photos, logos and bios', '/press'],
      ['Echo Play Podcast', 'Band life with Evan & Aaron', '/podcast'],
      ['Meet the musicians', 'The people in our bands', '/musicians'],
      ['About Echo Play Live', 'Get to know us', '/about'],
    ],
    social: {
      Facebook: 'https://www.facebook.com/echoplaylive',
      Instagram: 'https://www.instagram.com/echoplaylive/',
      LinkedIn: 'https://www.linkedin.com/company/echoplaylive',
    },
  },
  ...bandKits.map((kit) => ({
    slug: kit.slug,
    name: kit.name,
    path: `/${kit.slug}`,
    label: kit.label,
    intro: kit.intro,
    cover: `/press/bands/${kit.slug}/cover.jpg`,
    coverPosition: kit.coverPosition,
    logo: `/press/bands/${kit.slug}/logo.png`,
    logoStyle: kit.logoStyle,
    bookingEmail: kit.bookingEmail,
    links: [
      ...(getPerformance(kit.slug) ? [['Watch us live', 'A full song at Granada Theater', `/bands/${kit.slug}#watch`]] : []),
      ['Request a song', 'Vote for your favorites and see the crowd’s picks', `/requests?band=${kit.slug}`],
      ['The song catalog', 'See what we play', `/bands/${kit.slug}#music`],
      ['About the band', 'Photos, music and more', `/bands/${kit.slug}`],
      ['Book the band', 'Tell us about your event', `/contact?band=${kit.slug}`],
      ['Band kit & press', 'Download photos, logos and a bio', `/press/${kit.slug}`],
    ],
    social: {
      ...kit.social,
      Bandsintown: publicBandPresentation.find((band) => band.slug === kit.slug).bandsintown,
    },
  })),
]
export const getLinkHub = (slug) => linkHubs.find((hub) => hub.slug === slug) || null
export function nextHubShow(shows, slug) {
  if (!getLinkHub(slug)) return null
  return (
    shows.find(
      (show) =>
        show.state !== 'canceled' &&
        (slug === 'hub' || show.bands.some((band) => band.slug === slug)),
    ) || null
  )
}
