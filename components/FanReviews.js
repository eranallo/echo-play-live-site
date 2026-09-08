import { reviewsForBand } from '@/lib/public/reviews.mjs'
import TrackedLink from './TrackedLink'

export default function FanReviews({ band }) {
  const reviews = reviewsForBand(band)
  if (!reviews.length) return null
  return <section className="shell section-bottom fan-reviews" aria-label="Fan recommendations">
    <p className="eyebrow">From the crowd</p>
    <h2 className="section-title">Don’t just take our word for it.</h2>
    <div className={`review-grid ${reviews.length === 1 ? 'review-grid-single' : ''}`}>
      {reviews.map(review => <figure key={review.source} className="review-card">
        <blockquote>“{review.quote}”</blockquote>
        <figcaption>
          <strong>{review.author}</strong>
          <span>Recommends {review.bandName} on Facebook</span>
          <TrackedLink href={review.source} event="Review source" band={review.band} target="_blank" rel="noopener noreferrer">Read the recommendation ↗</TrackedLink>
        </figcaption>
      </figure>)}
    </div>
  </section>
}
