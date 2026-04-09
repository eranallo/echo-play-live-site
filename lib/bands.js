export const bands = {
  'so-long-goodnight': {
    slug: 'so-long-goodnight',
    name: 'So Long Goodnight',
    shortName: 'SLGN',
    tagline: "DFW's Most Requested 2000s Cover Band",
    description: "DFW's premier live emo band experience. Each show packs a whopping 3+ hours of emo hits from the 2000s. Our mission is to provide an authentic and organic emo experience to bring us back to the days of our youth. No Spotify DJs here — all of our tributes are played live with a full band, just like the days of Warped Tour and Taste of Chaos. Come scream along to those choruses. We'll see you in the pit.",
    genre: ['2000s Emo', 'Pop Punk', 'Post-Hardcore'],
    era: 'Warped Tour Era',
    color: '#00B4D8',
    colorDark: '#005F73',
    colorRgb: '0, 180, 216',
    number: '01',
    social: {
      facebook: 'https://www.facebook.com/slgnband',
      instagram: 'https://www.instagram.com/slgnband',
    },
    pattern: 'wave',
  },
  'the-dick-beldings': {
    slug: 'the-dick-beldings',
    name: 'The Dick Beldings',
    shortName: 'TDB',
    tagline: "Your 90s Playlist… Live.",
    description: "90s cover band playing songs that make you spit out your beer and yell... \"I love that song!\" Five Fort Worth gentlemen who enjoy the musical tunes from the 1990s — with fervor, excitement, and a genuine transparency. Named after the legendary principal of Bayside High, The Dick Beldings are the 90s tribute band everyone is talking about.",
    genre: ['90s Rock', 'Alternative', 'Grunge'],
    era: '90s Alternative Era',
    color: '#FF6B35',
    colorDark: '#C1440E',
    colorRgb: '255, 107, 53',
    number: '02',
    social: {
      facebook: 'https://www.facebook.com/TheDickBeldings',
      instagram: 'https://www.instagram.com/thedickbeldings',
    },
    pattern: 'grid',
  },
  'jambi': {
    slug: 'jambi',
    name: 'Jambi',
    shortName: 'JAMBI',
    tagline: "A TOOL Experience",
    description: "DFW's premier TOOL tribute, delivering faithful, explosive recreations of TOOL's most powerful songs with stunning precision — including live visuals. We strive to bring to life every aspect of a real TOOL concert. Prepare to be moved in ways you didn't expect. This is not just a cover band — this is a spiritual experience.",
    genre: ['Progressive Metal', 'Art Rock', 'Psychedelic'],
    era: 'Progressive Metal',
    color: '#9D4EDD',
    colorDark: '#5A189A',
    colorRgb: '157, 78, 221',
    number: '03',
    social: {
      facebook: 'https://www.facebook.com/JambiToolTribute',
    },
    pattern: 'spiral',
    // Art-directed hero photos — curated by number from blob store
    heroPhoto: 'https://wkqcpwrvrb9fa0hy.public.blob.vercel-storage.com/Jambi/Media/7-B1500592-81AB-4D02-A952-E2C23A6BD777_1_105_c.jpg',
    featurePhoto: 'https://wkqcpwrvrb9fa0hy.public.blob.vercel-storage.com/Jambi/Media/11-6FA12D4C-8B9F-478B-8551-DD2A9AC79AFA_1_105_c.jpg',
    crowdPhoto: 'https://wkqcpwrvrb9fa0hy.public.blob.vercel-storage.com/Jambi/Media/41-6F34CBD5-B6B5-448D-984B-CE8F0DED63FC_1_105_c.jpg',
  },
  'elite': {
    slug: 'elite',
    name: 'Elite',
    shortName: 'ELITE',
    tagline: "A Texas Tribute to Deftones",
    description: "Texas's own Deftones tribute band, delivering the raw emotion, crushing heaviness, and ethereal beauty that defines Deftones' legendary sound. Elite captures every dimension of the Deftones experience — from the heaviest breakdowns to the most delicate atmospheric passages. Vocals, guitar, drums, bass — all faithful, all live.",
    genre: ['Alternative Metal', 'Nu-Metal', 'Shoegaze'],
    era: 'Alternative Metal',
    color: '#E63946',
    colorDark: '#9D0208',
    colorRgb: '230, 57, 70',
    number: '04',
    social: {
      facebook: 'https://www.facebook.com/EliteDeftones',
      instagram: 'https://www.instagram.com/elitedeftones',
    },
    pattern: 'diagonal',
  },
}

export const bandsList = Object.values(bands)

export function getBand(slug) {
  return bands[slug] || null
}
