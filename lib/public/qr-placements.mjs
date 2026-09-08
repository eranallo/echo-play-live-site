export const qrPlacements = Object.freeze([['standard', 'Anywhere'], ['poster', 'Show poster'], ['table', 'Table card'], ['merch', 'Merch table']])
export function hubQrUrl(path, slug, placement = 'standard') {
  if (!qrPlacements.some(([id]) => id === placement)) throw new Error('Invalid QR placement')
  const url = new URL(path, 'https://echoplay.live')
  if (url.origin !== 'https://echoplay.live' || url.pathname !== (slug === 'hub' ? '/hub' : `/${slug}`)) throw new Error('Invalid hub')
  if (placement !== 'standard') {
    url.searchParams.set('utm_source', 'qr')
    url.searchParams.set('utm_medium', 'offline')
    url.searchParams.set('utm_campaign', slug === 'hub' ? 'echo-play-live' : slug)
    url.searchParams.set('utm_content', placement)
  }
  return url.toString()
}
export const qrAsset = (slug, placement, type) => `/qr/${slug}${placement === 'standard' ? '' : `-${placement}`}.${type}`
