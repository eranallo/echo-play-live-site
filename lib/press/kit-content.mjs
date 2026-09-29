// Public editorial content only. Source notes live in docs/BAND_KITS.md and docs/VOICE_AND_COPY.md.
// Keep private contacts, source-system IDs, rates and availability out of this file.
import kitPhotos from './photos.json' with { type: 'json' }
export const KIT_REVISION = '20260914-credit-free'
export const KIT_EDITION = 'September 2026'
export const kitPdfPath = (slug) => `/api/press/${slug}?v=${KIT_REVISION}`
export const bandKits = [
  {
    slug: 'so-long-goodnight',
    name: 'So Long Goodnight',
    label: '2000s emo / pop punk / post-hardcore',
    headline: ['For the', 'Warped Tour crowd.'],
    intro:
      'My Chemical Romance, Taking Back Sunday, The Used and more. A full band playing the songs you grew up with.',
    bio: 'Formed in 2022, So Long Goodnight has grown from sold-out local brewery shows to performing for 2,000 people at Hurricane Alley. The Dallas-Fort Worth band plays 2000s emo, pop punk and post-hardcore from My Chemical Romance, Taking Back Sunday, The Used and more. SLGN combines attention to the original songs with the energy and crowd interaction this music calls for. The show is a natural fit for emo nights, festival lineups and private events. Echo Play Live handles booking and production coordination, working with your team on set length, sound, lighting and the details that make a show run well.',
    modifiedDate: '2026-09-14',
    catalogLinkLabel: 'View the song catalog',
    catalogLinkNote: 'Browse songs, album artwork and Spotify links.',
    soundTitle: 'A few names you’ll recognize.',
    sound: [
      'My Chemical Romance',
      'Taking Back Sunday',
      'The Used',
      'Senses Fail',
      'Hawthorne Heights',
    ],
    soundNote:
      'A sample of the artists we cover. Browse the catalog, then talk with us about the songs and set length for your event.',
    features: [
      ['Since 2022', 'From sold-out local brewery shows to performing for 2,000 people at Hurricane Alley.'],
      ['The performance', 'Attention to the songs and transitions, with the energy and crowd interaction this music calls for.'],
      [
        'Booking support',
        'Echo Play Live coordinates the date, set length and production details with your team.',
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
    headline: ['Your 90s playlist,', 'live.'],
    intro:
      '90s alternative and grunge from a Fort Worth band that has been at this for more than a decade.',
    bio: "The Dick Beldings have been playing 90s alternative rock and grunge for more than a decade. Rooted in Fort Worth, the band covers Stone Temple Pilots, Nirvana, Sublime, Weezer and more, giving bookers a recognizable mix that moves between heavier songs and familiar sing-alongs. The repertoire suits a 90s night, festival bill or private event built around the era. Years on local stages give the band experience bringing that music to a live audience. Echo Play Live handles booking and production coordination, working with your team on the set, schedule and technical details.",
    modifiedDate: '2026-09-14',
    catalogLinkLabel: 'View the song catalog',
    catalogLinkNote: 'Browse songs, album artwork and Spotify links.',
    soundTitle: "A few names you’ll recognize.",
    sound: ['Stone Temple Pilots', 'Sublime', 'Weezer', 'Nirvana', 'Green Day', 'Foo Fighters'],
    soundNote: "A sample of the artists we cover. Browse the catalog, then ask about the set for your event.",
    features: [
        [
            "Fort Worth roots",
            "More than a decade of playing 90s rock, with roots in the local bar scene."
        ],
        [
            "A recognizable repertoire",
            "Alternative rock and grunge, from Stone Temple Pilots and Nirvana to Sublime and Weezer."
        ],
        [
            "Booking support",
            "Echo Play Live coordinates the date, set length and production details with your team."
        ]
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
    headline: ['A TOOL tribute', 'from DFW.'],
    intro:
      'TOOL’s music takes work. Jambi puts in the rehearsal time to get the rhythms, dynamics and feel right.',
    bio: "Jambi is a Dallas-Fort Worth TOOL tribute with years of rehearsal and live performance behind it, including appearances at Granada Theater and Legacy Hall. The band works through the intricate rhythms, dynamics and transitions that make TOOL’s music demanding to perform. The quieter passages receive the same care as the heavy sections, giving the set room to build. For bookers planning a dedicated tribute night or a progressive-metal bill, Jambi brings a focused show around TOOL’s catalog. Echo Play Live coordinates booking and production with your team. Watch the Granada performance and explore the repertoire to assess the fit for your event.",
    modifiedDate: '2026-09-14',
    catalogLinkLabel: 'View the song catalog',
    catalogLinkNote: 'Browse songs, album artwork and Spotify links.',
    soundTitle: 'Getting the songs right.',
    sound: [
      'Intricate rhythms and time changes',
      'Long songs with room to build',
      'Quiet passages and heavy riffs',
    ],
    soundNote: "Watch the live performance and explore the catalog. We’ll work through the set and production with your team.",
    features: [
        [
            "Attention to the detail",
            "Rehearsal focuses on TOOL’s rhythms, transitions and dynamics, including the quieter passages."
        ],
        [
            "See the band on stage",
            "The Granada Theater performance gives bookers a direct look at the live show."
        ],
        [
            "Booking support",
            "Echo Play Live coordinates the lineup, show length and production requirements with your team."
        ]
    ],
    stages: ['Granada Theater', 'Legacy Hall', 'Haltom Theater'],
    bookingEmail: 'jambi@echoplay.live',
    color: '#9C4B37',
    coverPosition: 'center 45%',
    logoStyle: 'wide',
    social: {
      Facebook: 'https://www.facebook.com/JambiToolTribute',
      YouTube: 'https://www.youtube.com/@JambiLive',
    },
  },
  {
    slug: 'elite',
    name: 'Elite',
    label: 'Deftones tribute / alternative metal',
    headline: ['A Texas tribute', 'to Deftones.'],
    intro:
      'A Fort Worth band playing Deftones since 2017, from the heavy riffs to the quieter, atmospheric songs.',
    bio: "Elite has been performing Deftones’ music since 2017. Based in Fort Worth, the band brings years of tribute experience to a show that gives equal attention to heavy riffs, atmospheric textures and the changes between them. Its stage history includes Granada Theater in Dallas and O’Shea’s in Hurst. For venues and talent buyers, Elite offers a dedicated Deftones show for tribute nights, alternative-metal bills and private events. The Granada performance gives a direct look at the band on stage. Echo Play Live handles booking and production coordination, working with your team on the set length and technical requirements.",
    modifiedDate: '2026-09-14',
    catalogLinkLabel: 'View the song catalog',
    catalogLinkNote: 'Browse songs, album artwork and Spotify links.',
    soundTitle: 'Both sides of Deftones.',
    sound: [
      'Heavy riffs and quiet passages',
      'Alternative metal and shoegaze',
      'The changes that make the songs work',
    ],
    soundNote: "Watch the live performance and explore the catalog. We’ll work through the set and production with your team.",
    features: [
        [
            "Performing since 2017",
            "A Fort Worth tribute with years of live experience playing Deftones."
        ],
        [
            "Heavy and atmospheric",
            "The quieter textures and changes receive the same attention as the heavy riffs."
        ],
        [
            "Booking support",
            "Echo Play Live coordinates the lineup, show length and production requirements with your team."
        ]
    ],
    stages: ['Granada Theater', 'Haltom Theater', 'O’Shea’s'],
    bookingEmail: 'elite@echoplay.live',
    color: '#9D3443',
    coverPosition: 'center 35%',
    logoStyle: 'wide',
    social: {
      Facebook: 'https://www.facebook.com/EliteDeftones',
      Instagram: 'https://www.instagram.com/elitedeftones',
      YouTube: 'https://www.youtube.com/@Elite-TributeToDeftones',
    },
  },
].map(kit => ({ ...kit, photoAlts: kitPhotos[kit.slug].photoAlts }))
export const getBandKit = (slug) => bandKits.find((kit) => kit.slug === slug) || null
export const kitAssetPath = (slug, asset) => `/press/bands/${slug}/${asset}?v=${KIT_REVISION}`
export const planningDetails = [
  ['Your event', 'Send us the date, venue, city and kind of event you’re planning.'],
  ['The set', 'Let us know how long you’d like us to play and any music you have in mind.'],
  [
    'Production',
    'We’ll discuss sound, lighting, stage space and load-in. Ask us for the current stage plot and input list.',
  ],
  [
    'Next steps',
    'We’ll check availability and work through travel, pricing and the booking details with you.',
  ],
]
