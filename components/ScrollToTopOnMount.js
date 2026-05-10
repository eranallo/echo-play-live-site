'use client'
import { useEffect } from 'react'

// Forces window scroll to (0, 0) on component mount.
//
// Why we need this: Next.js App Router normally scrolls to top on navigation,
// but server-component routes (like /musicians and /musicians/[slug]) can
// inherit scroll position from the previous page when navigating from a
// taller page. This component is a safety net — mount it inside any route
// that should always open at the top.

export default function ScrollToTopOnMount() {
  useEffect(() => {
    // Use 2-arg form to bypass html { scroll-behavior: smooth } — we want an
    // instant snap to top, not an animated scroll from the inherited position.
    window.scrollTo(0, 0)
  }, [])
  return null
}
