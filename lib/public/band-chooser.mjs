// Curated from the published roster. These are music suggestions, never availability.
export const musicChoices = [
  ['any', 'I’m still deciding'],
  ['90s', '90s alternative & grunge'],
  ['emo', '2000s emo & pop punk'],
  ['tool', 'TOOL'],
  ['deftones', 'Deftones'],
]
export const audienceChoices = [
  ['any', 'A little of everything'],
  ['covers', 'People who want a mix of artists'],
  ['tribute', 'Fans of one artist'],
]
export const eventChoices = ['Bar / Venue Show', 'Festival', 'Private Event', 'Corporate Event', 'Other']
const roster = [
  { slug:'the-dick-beldings', name:'The Dick Beldings', music:'90s', audience:'covers', description:'90s alternative and grunge, from Nirvana and Stone Temple Pilots to Sublime and Weezer.' },
  { slug:'so-long-goodnight', name:'So Long Goodnight', music:'emo', audience:'covers', description:'2000s emo, pop punk and post-hardcore. My Chemical Romance, Taking Back Sunday, The Used and more.' },
  { slug:'jambi', name:'Jambi', music:'tool', audience:'tribute', description:'A tribute to TOOL, for an audience that wants to spend the night with that catalog.' },
  { slug:'elite', name:'Elite', music:'deftones', audience:'tribute', description:'A tribute to Deftones, from the heavy songs to the quieter moments in between.' },
]
export function chooseBands({ music='any', audience='any' } = {}) {
  const exact = roster.find(band => band.music === music)
  if (exact) return [exact]
  return roster.filter(band => !['covers','tribute'].includes(audience) || band.audience === audience)
}
export function chooserInquiry(slug, event) {
  const query = new URLSearchParams({ source:'band-chooser' })
  if (roster.some(band => band.slug === slug)) query.set('band', slug)
  if (eventChoices.includes(event)) query.set('event', event)
  return `/contact?${query}`
}
