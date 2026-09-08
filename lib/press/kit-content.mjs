// Public editorial content only. Source notes live in docs/BAND_KITS.md and docs/VOICE_AND_COPY.md.
// Keep private contacts, source-system IDs, rates and availability out of this file.
import kitPhotos from './photos.json' with { type: 'json' }
export const KIT_REVISION = '20260908-media'
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
    bio: 'So Long Goodnight plays 2000s emo, pop punk and post-hardcore from My Chemical Romance, Taking Back Sunday, The Used, Thursday and more. Based in Dallas-Fort Worth, SLGN puts on a full-band show for people who grew up with this music and still want to sing it out loud. If you ever owned an Atticus shirt, you’ll probably know the words.',
    soundTitle: 'A few names you’ll recognize.',
    sound: [
      'My Chemical Romance',
      'Taking Back Sunday',
      'The Used',
      'Thursday',
      'Senses Fail',
      'Hawthorne Heights',
    ],
    soundNote:
      'These are a few of the artists we cover. Talk with us about the music and set length for your event.',
    features: [
      ['Come sing with us', 'We play the songs people grew up singing. You’re welcome to join in.'],
      ['The 2000s', 'Emo, pop punk and post-hardcore, from big choruses to the heavier songs.'],
      [
        'Plan your show',
        'Tell us about your venue, festival or private event, and we’ll work through the set with you.',
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
    bio: 'The Dick Beldings started on a patio in downtown Fort Worth. Aaron and Paul were watching an 80s cover band and thought they should do the same thing with 90s music. More than a decade later, the band is still playing alternative rock and grunge, from Stone Temple Pilots and Nirvana to Sublime and Weezer. Expect some songs you haven’t thought about in years, and probably still know every word to.',
    soundTitle: 'Yes, we love that song too.',
    sound: ['Stone Temple Pilots', 'Sublime', 'Weezer', 'Nirvana', 'Green Day', 'Foo Fighters'],
    soundNote:
      'These are a few of the artists we cover. Talk with us about the music and set length for your event.',
    features: [
      ['90s favorites', 'Alternative rock, grunge and a few songs you might have forgotten about.'],
      [
        'A Fort Worth band',
        'More than a decade of playing together, with roots in the local bar scene.',
      ],
      [
        'Have an event in mind?',
        'We’d love to hear about it. Send us the date, venue and kind of show you’re planning.',
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
    headline: ['A TOOL tribute', 'from DFW.'],
    intro:
      'TOOL’s music takes work. Jambi puts in the rehearsal time to get the rhythms, dynamics and feel right.',
    bio: 'Jambi is a Dallas-Fort Worth TOOL tribute. The band has spent years rehearsing and playing this music, paying close attention to the rhythms, changes and quieter passages as well as the heavy parts. Jambi’s stage history includes Gas Monkey Bar n’ Grill, Granada Theater and Legacy Hall. The goal is simple: play TOOL’s music with the care that fellow fans expect.',
    soundTitle: 'Getting the songs right.',
    sound: [
      'Intricate rhythms and time changes',
      'Long songs with room to build',
      'Quiet passages and heavy riffs',
    ],
    soundNote: 'Tell us about your event so we can discuss the set, show length and production.',
    features: [
      [
        'Rehearsal matters',
        'We put time into the details of TOOL’s songs before taking them on stage.',
      ],
      ['The quiet parts, too', 'The changes in volume and pace matter as much as the heavy riffs.'],
      [
        'Let’s plan the bill',
        'Send us your venue and date. We’re happy to discuss a tribute night or a place on your lineup.',
      ],
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
    bio: 'Elite is a Fort Worth Deftones tribute that has been playing since 2017. The band works on both sides of the music: the heavy riffs and the quieter, atmospheric passages that make Deftones sound like Deftones. Elite has played O’Shea’s in Hurst, Granada Theater in Dallas and other Texas stages. It’s a show for longtime fans and anyone who wants to hear what they’ve been missing.',
    soundTitle: 'Both sides of Deftones.',
    sound: [
      'Heavy riffs and quiet passages',
      'Alternative metal and shoegaze',
      'The changes that make the songs work',
    ],
    soundNote: 'Tell us about your event so we can discuss the set, show length and production.',
    features: [
      [
        'Heavy and atmospheric',
        'We work on the quieter passages with the same care as the heavier songs.',
      ],
      ['Fort Worth, since 2017', 'A local tribute with years of playing Deftones together.'],
      [
        'Planning a tribute night?',
        'We’d love to hear about it. Get in touch to discuss the lineup and production.',
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
      YouTube: 'https://www.youtube.com/@Elite-TributeToDeftones',
    },
  },
].map(kit => ({ ...kit, ...kitPhotos[kit.slug] }))
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
