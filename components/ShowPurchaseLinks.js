import TrackedLink from './TrackedLink'
import { showPurchaseLinks } from '@/lib/public/show-presentation.mjs'

export default function ShowPurchaseLinks({ show, band, className = 'button' }) {
  return showPurchaseLinks(show).map(link => (
    <TrackedLink
      key={link.event}
      className={className}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      event={link.event}
      band={band}
      showId={show.id}
    >
      {link.label} ↗
    </TrackedLink>
  ))
}
