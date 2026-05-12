// Phase 15: Echo Play Podcast.
// Static episode data. When Evan publishes a new episode, append it to the
// top of `episodes`. The Buzzsprout iframe player and listen links resolve
// from `buzzsproutId`.

export const podcast = {
  title: 'Echo Play Podcast',
  tagline: 'Cover bands, tributes, and the DFW music scene.',
  description: 'Welcome to our community of cover bands, tributes, and all other music addicts as we discuss the DFW music scene.',
  longDescription:
    "Evan Ranallo and Aaron Allen of The Dick Beldings sit down to talk about the DFW tribute and cover band scene — the venues, the road stories, the songs that shaped them, and the people behind the music. Recorded at Platinum Music Complex. Casual conversation, music industry insight, and a lot of laughs.",
  hosts: [
    { name: 'Evan Ranallo' },
    { name: 'Aaron Allen' },
  ],
  recordedAt: 'Platinum Music Complex · Fort Worth, TX',
  startYear: 2024,
  buzzsproutShowId: '2377760',
  artworkUrl: 'https://www.buzzsprout.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MTI2NDY2MTg4LCJwdXIiOiJibG9iX2lkIn19--4a07ae51d273a28df19c4382e64f92636c8251e4/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZmlsbCI6WzgwMCw4MDAseyJjcm9wIjoiY2VudHJlIn1dLCJzYXZlciI6eyJxdWFsaXR5Ijo2MH0sImNvbG91cnNwYWNlIjoic3JnYiJ9LCJwdXIiOiJ2YXJpYXRpb24ifX0=--ec5d9a0b1f7e6c8e8c8d/EPP_E01.png',
  subscribe: {
    spotify: 'https://open.spotify.com/show/2wnp160etSbFFC0xbU3c4J',
    applePodcasts: 'https://podcasts.apple.com/us/podcast/echo-play-podcast/id1757629556',
    amazonMusic: 'https://music.amazon.com/podcasts/b731392d-607e-4cd6-b23d-0dfc27a1d37b',
    buzzsprout: 'https://echoplay.buzzsprout.com',
    rss: 'https://feeds.buzzsprout.com/2377760.rss',
  },
}

// Episodes in reverse-chronological order (newest first).
// `buzzsproutId` is used to build the iframe embed URL and the listen link.
// `description` is a short preview pulled from Buzzsprout's listing.
export const episodes = [
  {
    number: 13,
    title: 'Your Armpits Deserve Better Deodorant',
    date: '2025-06-12',
    duration: '42:01',
    buzzsproutId: '17326083',
    slug: 'your-armpits-deserve-better-deodorant',
    description:
      'Evan and Aaron return after a brief hiatus, joking about a lost recording that was supposedly their best episode ever. They cover a wide range of topics, from parenting hacks like using a Skylight calendar to deodorant recommendations and band life updates.',
  },
  {
    number: 12,
    title: 'Life After Loss: Talking Through Grief and Recovery',
    date: '2025-04-14',
    duration: '1:33:43',
    buzzsproutId: '16956606',
    slug: 'life-after-loss-talking-through-grief-and-recovery',
    description:
      'There are moments that split life into clear before and after segments. For Evan, that moment came on a late October night when, driving home after a Halloween weekend show, he encountered headlights coming straight at him on the freeway. A raw conversation about grief, recovery, and what comes after.',
  },
  {
    number: 11,
    title: 'Balloon Fiesta Magic and Wedding Planning',
    date: '2024-10-21',
    duration: '37:08',
    buzzsproutId: '15961669',
    slug: 'balloon-fiesta-magic-and-wedding-planning',
    description:
      'After a brief hiatus, we are back. Evan dropped a big announcement — he is engaged. He shares how the proposal went down during the Balloon Fiesta in Albuquerque, plus the wedding planning chaos that followed.',
  },
  {
    number: 10,
    title: 'Acoustic Adventures',
    date: '2024-09-16',
    duration: '22:29',
    buzzsproutId: '15763907',
    slug: 'acoustic-adventures',
    description:
      'We dive into our recent experience playing an acoustic set at Hop Fusion, a refreshing change from our usual plugged-in, high-energy shows. How the stripped-down format let us explore new takes on familiar songs.',
  },
  {
    number: 9,
    title: 'Everything Bagel',
    date: '2024-09-10',
    duration: '32:26',
    buzzsproutId: '15723937',
    slug: 'everything-bagel',
    description:
      'A casual Sunday recording, more chaotic than usual — kids in tow, last-minute schedules, easygoing vibe. We talk about SLGN\'s recent show at Texas Live after a Rangers game, plus other catch-up.',
  },
  {
    number: 8,
    title: 'Crowds, Venues, and Vibes',
    date: '2024-09-02',
    duration: '35:03',
    buzzsproutId: '15682150',
    slug: 'crowds-venues-and-vibes',
    description:
      'We dive into venues and the rollercoaster of playing live across the Dallas–Fort Worth area. Stories about the best places we\'ve performed, like The Backyard at Texas Live where the staff treats us like family.',
  },
  {
    number: 7,
    title: 'Weddings, Gigs, and the Grind',
    date: '2024-08-26',
    duration: '32:28',
    buzzsproutId: '15643443',
    slug: 'weddings-gigs-and-the-grind',
    description:
      'Broadcasting from the Ridglea Theater in Fort Worth, where we played a private event in the Ridglea Room. Memories of playing at weddings, working the grind, and what makes those events different from a regular bar show.',
  },
  {
    number: 6,
    title: 'Life in Music: Albums That Stand the Test of Time',
    date: '2024-08-19',
    duration: '37:07',
    buzzsproutId: '15608552',
    slug: 'life-in-music-albums-that-stand-the-test-of-time',
    description:
      'A lively dive into albums that left a lasting impact. Kicks off with a discussion of Blindside\'s "Silence" — a record that still sends chills down our spines.',
  },
  {
    number: 5,
    title: 'The Albums That Shaped Us',
    date: '2024-08-13',
    duration: '37:39',
    buzzsproutId: '15522195',
    slug: 'the-albums-that-shaped-us',
    description:
      'Diving deep into the music that shaped our lives. Aaron and Evan explore the albums that left a lasting impact — from Underøath\'s powerful "Lost in the Sound of Separation" to other formative records.',
  },
  {
    number: 4,
    title: 'The Cost of Nostalgia',
    date: '2024-08-05',
    duration: '33:49',
    buzzsproutId: '15522190',
    slug: 'the-cost-of-nostalgia',
    description:
      'Aaron and Evan chat about the rare chaos of having all five band members together and bust the myth that bands hang out 24/7. Current top bands — Gojira for their raw heavy energy, plus more.',
  },
  {
    number: 3,
    title: 'Epic Fails and Wild Night Stories',
    date: '2024-07-29',
    duration: '28:54',
    buzzsproutId: '15437733',
    slug: 'epic-fails-and-wild-night-stories',
    description:
      'In the green room with Michael and Paul for another round of laughs, wild stories, and unexpected moments. Chaotic roll call, then straight into the stories you only tell after a show.',
  },
  {
    number: 2,
    title: 'No Gout About It',
    date: '2024-07-22',
    duration: '27:52',
    buzzsproutId: '15382103',
    slug: 'no-gout-about-it',
    description:
      'Hosted by Aaron and Evan. We dive into the hilarious and chaotic world of The Dick Beldings, a 90s cover band with a colorful history. Chat with members Paul, Matt, and Michael about how it all came together.',
  },
  {
    number: 1,
    title: 'The Unlikely Journey from Band to Business',
    date: '2024-07-08',
    duration: '32:16',
    buzzsproutId: '15382172',
    slug: 'the-unlikely-journey-from-band-to-business',
    description:
      'From Evan joining The Dick Beldings during the pandemic to the unforgettable night of a wedding that led to a band breakup, we share it all. The seamless member transition, the nostalgia-inducing 90s music, and how Echo Play Live came to be.',
  },
]

// Helpers
export function buzzsproutEmbedUrl(episodeId) {
  return `https://www.buzzsprout.com/${podcast.buzzsproutShowId}/episodes/${episodeId}?client_source=small_player&iframe=true`
}

export function buzzsproutEpisodeUrl(episodeId, slug) {
  return `https://echoplay.buzzsprout.com/${podcast.buzzsproutShowId}/episodes/${episodeId}-${slug}`
}

export function formatEpisodeDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
