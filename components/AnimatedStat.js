'use client'
import { useEffect, useRef, useState } from 'react'

// Phase: motion polish — Animated stat counter.
//
// Wraps a stat value string. If the value starts with digits (e.g. "50+",
// "8 Years", "100+"), the leading number ticks from 0 to its target when
// the element scrolls into view. Text-only values (e.g. "Fort Worth", "TX
// & OK", "Sing-Along") render as-is.
//
// Respects prefers-reduced-motion (snaps to final value).

export default function AnimatedStat({ value, duration = 1200 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Parse leading number; if none, no animation needed.
    const match = String(value).match(/^(\d+)(.*)$/)
    if (!match) {
      setDisplay(value)
      return
    }

    const target = parseInt(match[1], 10)
    const suffix = match[2]

    // Respect reduced-motion: snap to final.
    if (typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    // Start at zero only when about to animate (avoid flash of 0 before observer fires).
    let animated = false

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animated) {
            animated = true
            observer.disconnect()
            setDisplay('0' + suffix)
            const startedAt = performance.now()
            const tick = (now) => {
              const elapsed = now - startedAt
              const progress = Math.min(elapsed / duration, 1)
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3)
              const current = Math.round(target * eased)
              setDisplay(current + suffix)
              if (progress < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display}</span>
}
