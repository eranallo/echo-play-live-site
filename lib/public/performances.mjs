// Official channel performances supplied by Evan and checked September 7, 2026.
// These are separate from the short, silent band-header loops.
export const performances = Object.freeze({
  elite: Object.freeze({
    band: 'Elite',
    title: 'Royal',
    artist: 'Deftones',
    venue: 'Granada Theater · Dallas',
    videoId: 'gris-rqAgCI',
    channel: 'https://www.youtube.com/@Elite-TributeToDeftones',
    poster: '/press/bands/elite/detail.jpg',
  }),
  jambi: Object.freeze({
    band: 'Jambi',
    title: 'Stinkfist',
    artist: 'TOOL',
    venue: 'Granada Theater · Dallas',
    videoId: 'g91UvnjoroM',
    channel: 'https://www.youtube.com/@JambiLive',
    poster: '/press/bands/jambi/detail.jpg',
  }),
})
export const getPerformance = (slug) => performances[slug] || null
export const performanceUrl = (performance) => `https://www.youtube.com/watch?v=${performance.videoId}`
