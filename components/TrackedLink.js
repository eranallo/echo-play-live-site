'use client'
import { track } from '@vercel/analytics'

export default function TrackedLink({ event, band, showId, children, ...props }) {
  return (
    <a
      {...props}
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
