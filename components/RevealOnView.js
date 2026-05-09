'use client'
import { useEffect, useRef } from 'react'

// Client-side wrapper that observes any .reveal / .reveal-left / .reveal-right
// descendants with IntersectionObserver and toggles `.revealed` on first
// intersect — same vocabulary as the band page's useScrollReveal hook,
// but as a wrapper so server-component pages can use it.
//
// The opacity/transform transitions live in globals.css. This component just
// adds the trigger.

export default function RevealOnView({ children, threshold = 0.08, rootMargin = '0px 0px -40px 0px' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const root = ref.current
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          observer.unobserve(e.target)
        }
      }),
      { threshold, rootMargin }
    )

    const els = root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-zoom')
    els.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>
}
