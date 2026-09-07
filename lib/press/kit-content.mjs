// Public editorial content only. Source notes live in docs/BAND_KITS.md.
// Keep private contacts, source-system IDs, rates and availability out of this file.
export const KIT_REVISION = '20260907'
export const KIT_EDITION = 'September 2026'
export const kitPdfPath = (slug) => `/api/press/${slug}?v=${KIT_REVISION}`

export const bandKits = [
  {
    slug: 'so-long-goodnight',
    name: 'So Long Goodnight',
    label: '2000s emo / pop punk / post-hardcore',
    headline: ['The songs that', 'raised you.'],
    intro:
      'A full-band return to the Warped Tour era, built around the songs the room still knows by heart.',
    bio: 'So Long Goodnight brings the emo, pop punk and post-hardcore songs of the 2000s back to the stage. My Chemical Romance, Taking Back Sunday, The Used, Thursday and more form the soundtrack to a night of loud guitars and shared choruses. Based in Dallas-Fort Worth, SLGN makes the audience part of the show: familiar openings, big sing-alongs and the feeling of finding your people in the crowd.',
    soundTitle: 'The Warped Tour era, in full voice.',
    sound: [
      'My Chemical Romance',
      'Taking Back Sunday',
      'The Used',
      'Thursday',
      'Senses Fail',
      'Hawthorne Heights',
    ],
    soundNote:
      'Artist highlights from the band’s repertoire. Final set selections are discussed for each show.',
    features: [
      [
        'A room that sings',
        'Recognizable choruses and a full-band sound put the crowd at the center of the night.',
      ],
      [
        'More than one mood',
        'Emo anthems, pop punk momentum and a post-hardcore edge carry the show.',
      ],
      [
        'A shared soundtrack',
        'A focused music identity for themed venue nights, festivals and private celebrations.',
      ],
    ],
    stages: ['Texas Live'],
    bookingEmail: 'slgn@echoplay.live',
    color: '#A33157',
    coverPosition: 'center 42%',
    logoStyle: 'stacked',
    social: {
      Facebook: 'https://www.facebook.com/slgnband',
      Instagram: 'https://www.instagram.com/slgnband',
    },
  },
  {
    slug: 'the-dick-beldings',
    name: 'The Dick Beldings',
    label: '90s rock / alternative / grunge',
    headline: ['Your 90s playlist.', 'Turned all the way up.'],
    intro:
      'Fort Worth roots. Familiar hooks. A room full of people remembering why they loved these songs.',
    bio: 'The Dick Beldings turn 90s alternative rock and grunge into a night of familiar riffs, big choruses and good company. The band began with a simple idea on a Fort Worth patio: give the songs of the 90s their own live celebration. More than a decade later, that spirit still drives the show. From guitar-heavy favorites to the songs you forgot you knew every word to, the Beldings bring personality and a sense of fun to the stage.',
    soundTitle: 'Familiar from the first few notes.',
    sound: ['Stone Temple Pilots', 'Sublime', 'Weezer', 'Nirvana', 'Green Day', 'Foo Fighters'],
    soundNote:
      'Artist highlights from the band’s repertoire. Final set selections are discussed for each show.',
    features: [
      [
        'Rock with recognition',
        'Alternative and grunge favorites sit alongside hooks made for singing back.',
      ],
      [
        'Fort Worth originals',
        'A band with more than a decade of shared history and a clear love for the material.',
      ],
      [
        'A night with personality',
        'A playful live experience for venue stages, throwback events and private parties.',
      ],
    ],
    stages: ['Texas Live', 'O’Shea’s', 'Queen City Music Hall'],
    bookingEmail: 'dickbeldings@echoplay.live',
    color: '#AD292D',
    coverPosition: 'center 25%',
    logoStyle: 'badge',
    social: {
      Facebook: 'https://www.facebook.com/TheDickBeldings',
      Instagram: 'https://www.instagram.com/thedickbeldings',
    },
  },
  {
    slug: 'jambi',
    name: 'Jambi',
    label: 'TOOL tribute / progressive metal',
    headline: ['Precision.', 'Weight. Atmosphere.'],
    intro:
      'An immersive TOOL tribute from Dallas-Fort Worth, built around the detail and dynamics of the music.',
    bio: 'Jambi brings the tension, weight and release of TOOL’s music to the stage. The Dallas-Fort Worth tribute has developed its sound through years of rehearsal, study and live performance, with close attention to the rhythms, dynamics and atmosphere that define the catalog. From its debut at Gas Monkey Bar n’ Grill to appearances at Granada Theater and Legacy Hall, the band has built a show for listeners who know this music deeply.',
    soundTitle: 'The detail is part of the experience.',
    sound: [
      'TOOL’s progressive rhythms',
      'Long-form tension and release',
      'Heavy, atmospheric dynamics',
    ],
    soundNote:
      'A dedicated tribute experience. Discuss repertoire, show length and production with the booking team.',
    features: [
      [
        'Musical precision',
        'A performance shaped by the intricate rhythms and shifting dynamics of TOOL’s catalog.',
      ],
      ['Space and intensity', 'The quiet passages carry as much intention as the heavy ones.'],
      [
        'Made for close listening',
        'A focused tribute for rock venues, theater stages and progressive music audiences.',
      ],
    ],
    stages: ['Granada Theater', 'Legacy Hall', 'Haltom Theater'],
    bookingEmail: 'jambi@echoplay.live',
    color: '#9C4B37',
    coverPosition: 'center 45%',
    logoStyle: 'wide',
    social: { Facebook: 'https://www.facebook.com/JambiToolTribute' },
  },
  {
    slug: 'elite',
    name: 'Elite',
    label: 'Deftones tribute / alternative metal',
    headline: ['Heavy.', 'Delicate. Entirely live.'],
    intro:
      'A Texas tribute to Deftones, moving between the weight of the riffs and the space inside the songs.',
    bio: 'Elite has brought Deftones to Texas stages since 2017. Based in Fort Worth, the band approaches the music through both its heaviness and its vulnerability: forceful riffs, atmospheric passages and the dynamic shifts fans know by heart. From O’Shea’s in Hurst to Granada Theater in Dallas, Elite has shaped a live tribute for longtime Deftones listeners and people discovering the catalog for the first time.',
    soundTitle: 'Heavy music. Room to breathe.',
    sound: [
      'Deftones’ heavy and atmospheric sides',
      'Alternative metal with a shoegaze edge',
      'Songs built around changing dynamics',
    ],
    soundNote:
      'A dedicated tribute experience. Discuss repertoire, show length and production with the booking team.',
    features: [
      [
        'The full dynamic range',
        'A show that makes room for both the atmospheric passages and the heavier moments.',
      ],
      ['Texas roots', 'A Fort Worth tribute bringing Deftones to the stage since 2017.'],
      [
        'A distinct mood',
        'An immersive live setting for alternative metal audiences and curated tribute bills.',
      ],
    ],
    stages: ['Granada Theater', 'Haltom Theater', 'O’Shea’s'],
    bookingEmail: 'elite@echoplay.live',
    color: '#9D3443',
    coverPosition: 'center 35%',
    logoStyle: 'wide',
    social: {
      Facebook: 'https://www.facebook.com/EliteDeftones',
      Instagram: 'https://www.instagram.com/elitedeftones',
    },
  },
]

export const getBandKit = (slug) => bandKits.find((kit) => kit.slug === slug) || null
export const kitAssetPath = (slug, asset) => `/press/bands/${slug}/${asset}`

export const planningDetails = [
  ['Your event', 'Share the date, venue, city and kind of event you are planning.'],
  ['The performance', 'Discuss the playing window, set length, breaks and music priorities.'],
  [
    'The production',
    'Review sound, lighting, stage space, load-in and the current technical documents.',
  ],
  [
    'The proposal',
    'The booking team will work through fit, availability, travel and event-specific terms with you.',
  ],
]
