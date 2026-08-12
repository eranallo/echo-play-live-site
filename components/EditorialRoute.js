'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

const pad = value => String(value + 1).padStart(2, '0')

export default function EditorialRoute({ children, variant = 'standard' }) {
  const routeRef = useRef(null)

  useEffect(() => {
    const root = routeRef.current
    if (!root) return undefined

    const main = root.querySelector('main')
    const title = main?.querySelector('h1')
    if (title) title.dataset.echo = title.textContent.replace(/\s+/g, ' ').trim()

    const sections = main
      ? [...main.children].filter(node => ['SECTION', 'HEADER'].includes(node.tagName))
      : []

    sections.forEach((section, index) => {
      section.classList.add('editorial-section')
      section.style.setProperty('--editorial-section-delay', `${Math.min(index * 55, 220)}ms`)
      const label = section.querySelector('.section-label, .ps-kicker')
      if (label) label.dataset.index = pad(index)
    })

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let observer
    if (reduceMotion) {
      sections.forEach(section => section.classList.add('editorial-visible'))
    } else {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('editorial-visible')
          observer.unobserve(entry.target)
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' })
      sections.forEach(section => observer.observe(section))
    }

    let frame
    const updateProgress = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight
      const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0
      root.style.setProperty('--route-progress', progress)
      frame = undefined
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={routeRef} className={`editorial-route editorial-${variant}`}>
      <div className="editorial-progress" aria-hidden="true" />
      {variant === 'landing' && (
        <Link className="editorial-landing-mark" href="/" aria-label="Echo Play Live home">
          <span>EPL</span>
          <small>Echo Play Live</small>
        </Link>
      )}
      {children}
    </div>
  )
}
