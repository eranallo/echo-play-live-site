'use client'
import { track } from '@/lib/track'

export default function TrackedLink({ event, band, showId, children, ...props }) {
  return (
    <a
      {...props}
      data-epl-event={event}
      onClick={() => {
        // Never include form values, subscriber details, or external URL query strings.
        try {
          track(event, { ...(band ? { band } : {}), ...(showId ? { show: showId } : {}) })
        } catch {}
      }}
    >
      {children}
    </a>
  )
}
