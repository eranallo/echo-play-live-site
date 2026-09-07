export const SHOW_ID_PATTERN = /^show_[A-Za-z0-9_-]{22}$/
export const showPath = (show) => `/shows/${show.id}`
export const showTitle = (show) =>
  `${show.bands.map((band) => band.name).join(' + ')} at ${show.venue.name}`
export const showDate = (show) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${show.date}T12:00:00Z`))
export const showTime = (show) =>
  show.startTime
    ? `${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: show.timeZone }).format(new Date(show.startTime))} Central`
    : 'Time to be announced'
