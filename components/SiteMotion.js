'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const targets = [
  '.scene-welcome', '.page-intro', '.scene-feature', '.scene-panel', '.portal-box',
  '.band-card', '.show-row', '.press-kit-card', '.review-card',
  '.hub-link', '.hub-roster-band', '.booking-banner',
].join(',')

// Progressive enhancement: content is visible before JavaScript and after cleanup.
// Animate individual modules, never the page wrapper or fixed-dialog ancestors.
export default function SiteMotion() {
  const pathname = usePathname()

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!window.IntersectionObserver || !Element.prototype.animate) return
    let observer
    let mutations
    const seen = new WeakSet()
    const animations = new Set()
    const stop = () => {
      observer?.disconnect()
      mutations?.disconnect()
      animations.forEach(animation => animation.cancel())
      animations.clear()
    }
    const start = () => {
      stop()
      if (preference.matches) return
      const main = document.querySelector('main')
      if (!main) return
      observer = new IntersectionObserver(entries => {
        let sequence = 0
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)
          // Never move a control someone is already using.
          if (entry.target.contains(document.activeElement)) return
          const animation = entry.target.animate(
            [{ opacity: 0.72, translate: '0 8px' }, { opacity: 1, translate: '0 0' }],
            { duration: 360, delay: Math.min(sequence++ * 35, 105), easing: 'cubic-bezier(.2,.7,.2,1)' },
          )
          animations.add(animation)
          animation.onfinish = animation.oncancel = () => animations.delete(animation)
        })
      }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' })
      const observe = node => {
        if (!(node instanceof Element)) return
        const candidates = node.matches(targets) ? [node, ...node.querySelectorAll(targets)] : node.querySelectorAll(targets)
        candidates.forEach(element => {
          if (seen.has(element)) return
          seen.add(element)
          observer.observe(element)
        })
      }
      observe(main)
      // Include streamed show rows without a scroll listener or polling.
      mutations = new MutationObserver(records => {
        records.forEach(record => record.addedNodes.forEach(observe))
      })
      mutations.observe(main, { childList: true, subtree: true })
    }
    const finishOnFocus = event => {
      animations.forEach(animation => {
        if (animation.effect?.target?.contains(event.target)) animation.finish()
      })
    }
    start()
    preference.addEventListener('change', start)
    document.addEventListener('focusin', finishOnFocus)
    return () => {
      stop()
      preference.removeEventListener('change', start)
      document.removeEventListener('focusin', finishOnFocus)
    }
  }, [pathname])

  return null
}
