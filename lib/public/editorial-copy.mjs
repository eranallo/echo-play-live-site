// Website edits of specific public source versions, reviewed September 7, 2026.
// Original CMS records and musician interviews remain intact. A new or removed
// source bio automatically takes precedence over an older website edit.
import { createHash } from 'node:crypto'

export const reviewedCopyRules = {
  'musician:josh-miller': {
    sourceSha256: '9ec68b5f77a8c0b3f266f64c6d73382666cb298c81a3f8f1d6bf9ae94909e937',
    copy: 'Josh Miller sings for Jambi. He started on saxophone in sixth grade, then picked up guitar and bass while continuing to sing. His parents encouraged him to make music from an early age.\n\nFor Josh, playing is a way to clear his head. He values the friendships in the band, including his thirty-year friendship with Kevin, and enjoys shows where the band plays well and the crowd is right there with them.',
  },
  'musician:kenny-koulabouth': {
    sourceSha256: '6ad4f9f6fc7142d211c17c930250561357f8b9e8b3b62203e8bfe11ae843354e',
    copy: 'Kenny Koulabouth plays drums in Jambi and Elite. He grew up around his uncle’s bands and tried the instruments in their rehearsal room, but always came back to the drums.\n\nKenny values the close friendships that come with being in a band. He puts a lot of energy into playing and wants people to enjoy watching the drummer, even from the back of the stage.',
  },
  'musician:patrick-mclemore': {
    sourceSha256: '5fe13a646e6084193837fcede8d6ed36766806f3c584c4592df06c27f0f134b2',
    copy: 'Patrick McLemore runs visuals for Jambi. His friend Cody introduced him to TOOL and brought him into the local music scene. When the band needed someone to handle video, Patrick took on the role.\n\nHe builds and times the visuals around the songs, then adjusts as the band plays. He enjoys seeing the audience react when the music and video come together. When the band takes a song somewhere unexpected, he has to be ready for that, too.',
  },
  'musician:evan-ranallo': {
    sourceSha256: '7d5330cfeccd4572d9376ae122689ace6de787dbf8ae6f42b9724491f45f9e26',
    copy: 'Evan Ranallo is a guitarist, bassist and the founder of Echo Play Live. Alongside performing, he handles booking, show coordination and production planning for the bands.\n\nMusic has been part of Evan’s life since childhood. His dad played bass, and Evan was going to band practice with him before picking up an instrument himself. Today, he cares about putting in the rehearsal time, communicating with the people working on a show and making sure the audience has a good time.',
  },
  'musician:irfan-malik': {
    sourceSha256: '274ad2801d53ae79d99b824b307d90395e6f1e7f63cafccad696cc2d79c0c2e6',
    copy: 'Irfan Malik plays drums in So Long Goodnight and occasionally fills in with The Dick Beldings. He started at around nine years old after watching his older brothers play in the garage.\n\nIrfan likes having something he can work at and be proud of. Preparation matters to him, from practicing the songs to getting the transitions right. On stage, he works to stay focused on his playing while keeping an eye on the crowd.',
  },
  'musician:kevin-scott': {
    sourceSha256: '811209275d1959e2576cc38adc712e20314ca8b528b30ceb2d95b52b7f1190ca',
    copy: 'Kevin Scott plays bass in So Long Goodnight, Jambi and Elite. That means moving between 2000s emo, TOOL and Deftones, often with the same bandmates.\n\nAsk Kevin what he brings to a band and he’ll tell you: energy. He enjoys getting lost in the music and giving the audience a good show. Playing also gives him a sense of purpose and something to keep working toward.',
  },
  'musician:paul-seidler': {
    sourceSha256: 'd90770d6d2a7478723723f157a0e717ff08ac6c0f54a1ba9c43c67f15e9c47eb',
    copy: 'Paul Seidler plays guitar in So Long Goodnight and The Dick Beldings. He cares about playing the songs accurately and having fun with the people on stage and in the crowd.\n\nPaul also has a way with words, as his interview below makes clear. Asked why he likes playing Weezer’s “Say It Ain’t So,” though, he keeps it short: “Because it rocks.”',
  },
}

export function reviewedCopy(key, source) {
  const rule = reviewedCopyRules[key]
  if (!rule || typeof source !== 'string' || !source.trim()) return source
  const normalized = source.replace(/\s+/g, ' ').trim()
  const fingerprint = createHash('sha256').update(normalized).digest('hex')
  return fingerprint === rule.sourceSha256 ? rule.copy : source
}
