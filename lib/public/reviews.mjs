// Public Facebook recommendations inspected September 8, 2026.
// Exact excerpts from fans; no buyer role, star rating or aggregate rating implied.
export const fanReviews = Object.freeze([
  { band: 'the-dick-beldings', bandName: 'The Dick Beldings', author: 'Shawnee Elise',
    quote: 'These guys put on a killer show!',
    source: 'https://www.facebook.com/shawnee.elise.2025/posts/pfbid0eADn3JfaMzXcCS2HhpjNNYHUpsqTV4WJ31bJEqNehvKQSwepBhJxSPpEcg9ahUgBl' },
  { band: 'so-long-goodnight', bandName: 'So Long Goodnight', author: 'Chris Odom',
    quote: 'much higher energy than I expected- they played a great show in Bossier!',
    source: 'https://www.facebook.com/chris.odom.54011/posts/pfbid032o9JeZByndrDyvYXhwfKhYYYETHVGjZY34UT4NHZEZArbw71XRGc288r6pQsTxM1l' },
])
export const reviewsForBand = band => fanReviews.filter(review => !band || review.band === band)
