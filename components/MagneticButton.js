'use client'
import { useEffect, useRef } from 'react'

// Phase: motion polish — Magnetic cursor.
//
// Wraps an interactive element (Link, button) in an inline-block span that
// subtly translates toward the cursor when the cursor is near. Adds delight
// to primary CTAs without changing layout.
//
// Disabled on touch devices (no hover capability) and when the user prefers
// reduced motion.
//
// Usage:
//   <MagneticButton>
//     <Link href="/contact" style={...}>Book Now</Link>
//   </MagneticButton>

export default function MagneticButton({
  children,
  strength = 0.25,
  radius = 80,
  style = {},
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip entirely on touch / reduced-motion devices.
    const isTouch = typeof window !== 'undefined'
      && window.matchMedia?.('(hover: none)').matches
    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    let raf = 0
    let inside = false

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      // Influence zone = half of the larger dimension + radius.
      const influence = Math.max(rect.width, rect.height) / 2 + radius

      if (dist < influence) {
        const factor = strength * (1 - dist / influence)
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          el.style.transition = inside ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)'
          el.style.transform = `translate3d(${dx * factor}px, ${dy * factor}px, 0)`
          inside = true
        })
      } else if (inside) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          el.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
          el.style.transform = 'translate3d(0, 0, 0)'
          inside = false
        })
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      if (el) el.style.transform = ''
    }
  }, [strength, radius])

  return (
    <span
      ref={ref}
      style={{ display: 'inline-block', willChange: 'transform', ...style }}
      {...rest}
    >
      {children}
    </span>
  )
}
