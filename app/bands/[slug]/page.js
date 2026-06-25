'use client'
import { use, useEffect, useRef, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SongsSection from '@/components/SongsSection'
import TributeDiscographySection from '@/components/TributeDiscographySection'
import { getBand, bandsList } from '@/lib/bands'
import BandHero from '@/components/band/BandHero'
import BandStatsBar from '@/components/band/BandStatsBar'
import BandAbout from '@/components/band/BandAbout'
import BandExperience from '@/components/band/BandExperience'
import BandHistory from '@/components/band/BandHistory'
import BandLineup from '@/components/band/BandLineup'
import BandGallery from '@/components/band/BandGallery'
import BandBookingCta from '@/components/band/BandBookingCta'
import OtherBands from '@/components/band/OtherBands'
import BandLightbox from '@/components/band/BandLightbox'

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    const els = ref.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

// Phase 12: Parallax hook — translateY on scroll for depth. Disabled on
// mobile (perf) and reduced-motion. Returns a ref + the current translate
// value (which the component applies inline so transforms stack cleanly
// with the existing image objectPosition).
function useParallaxY(ratio = 0.25, maxOffset = 200) {
  const ref = useRef(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    let raf = 0
    const apply = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // Only translate while the element is roughly within the viewport.
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      const offset = Math.max(-maxOffset, Math.min(maxOffset, window.scrollY * ratio))
      el.style.transform = `translate3d(0, ${offset}px, 0)`
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(apply)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [ratio, maxOffset])
  return ref
}

export default function BandPage({ params }) {
  // Phase 38 hotfix: Next.js 16 made `params` async in client components too.
  // Unwrap with React's use() hook. Without this, params.slug is undefined at
  // hydration time, getBand returns null, notFound() fires, and every band
  // page 404s in the browser.
  const { slug } = use(params)
  const band = getBand(slug)
  const pageRef = useScrollReveal()
  const heroParallaxRef = useParallaxY(0.25)
  const [images, setImages] = useState([])
  const [lightboxImg, setLightboxImg] = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [lineup, setLineup] = useState([])
  // Phase 47: hero video gating. Default false so SSR + reduced-motion users
  // get the still poster (heroPhoto). The effect flips this to true on mount
  // only when the browser is OK with motion.
  const [allowHeroVideo, setAllowHeroVideo] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setAllowHeroVideo(!mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (!band) return

    // Phase 11A: if the band has a curated `galleryPhotos` array in bands.js
    // (SLGN, Elite, future ones), use it directly — skip the Vercel Blob fetch.
    // For bands that still rely on Blob storage (TDB, Jambi), fall back to the
    // existing /api/media flow.
    if (Array.isArray(band.galleryPhotos) && band.galleryPhotos.length > 0) {
      const synthetic = [
        band.heroPhoto && { url: band.heroPhoto },
        band.featurePhoto && { url: band.featurePhoto },
        band.crowdPhoto && { url: band.crowdPhoto },
        ...band.galleryPhotos.map(url => ({ url })),
      ].filter(Boolean)
      setImages(synthetic)
      setMediaLoaded(true)
      return
    }

    fetch(`/api/media?band=${band.slug}`)
      .then(r => r.json())
      .then(data => {
        setImages(data.images || [])
        setMediaLoaded(true)
      })
      .catch(() => setMediaLoaded(true))
  }, [band?.slug])

  // Phase 10C: fetch this band's lineup from /api/musicians and render in a
  // dedicated Lineup section. Sub-band relationships are intentionally not
  // shown — only members who list this band as a Primary Band.
  useEffect(() => {
    if (!band) return
    fetch(`/api/musicians?band=${band.slug}`)
      .then(r => r.json())
      .then(data => setLineup(Array.isArray(data.members) ? data.members : []))
      .catch(() => setLineup([]))
  }, [band?.slug])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setLightboxImg(null)
      if (e.key === 'ArrowRight' && lightboxImg) {
        const next = (lightboxIdx + 1) % images.length
        setLightboxIdx(next)
        setLightboxImg(images[next])
      }
      if (e.key === 'ArrowLeft' && lightboxImg) {
        const prev = (lightboxIdx - 1 + images.length) % images.length
        setLightboxIdx(prev)
        setLightboxImg(images[prev])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxImg, lightboxIdx, images])

  if (!band) notFound()

  const otherBands = bandsList.filter(b => b.slug !== band.slug)
  const stats = band.stats || []

  // Use art-directed curated photos from bands.js if defined, otherwise fall back to API results
  const curatedUrls = new Set([band.heroPhoto, band.featurePhoto, band.crowdPhoto].filter(Boolean))
  const heroImg = band.heroPhoto ? { url: band.heroPhoto } : (images[0] || null)
  const featureImg = band.featurePhoto ? { url: band.featurePhoto } : (images[1] || null)
  const crowdImg = band.crowdPhoto ? { url: band.crowdPhoto } : (images[4] || null)
  // Gallery = all API images except the ones already used as curated hero/feature/crowd
  const galleryImages = images.filter(img => !curatedUrls.has(img.url))

  const openLightbox = (img, idx) => {
    setLightboxImg(img)
    setLightboxIdx(idx)
  }

  return (
    <>
      <Nav />
      <main ref={pageRef} className="band-page-main" style={{ background: '#080808' }}>

        <BandHero band={band} heroImg={heroImg} heroParallaxRef={heroParallaxRef} allowHeroVideo={allowHeroVideo} />

        {stats.length > 0 && <BandStatsBar band={band} stats={stats} />}

        <BandAbout band={band} featureImg={featureImg} openLightbox={openLightbox} />

        {(crowdImg || band.experienceHeadline || band.experienceBody) && (
          <BandExperience band={band} crowdImg={crowdImg} openLightbox={openLightbox} />
        )}

        {band.history && band.history.length > 0 && <BandHistory band={band} />}

        {lineup.length > 0 && <BandLineup band={band} lineup={lineup} />}

        {mediaLoaded && galleryImages.length > 0 && (
          <BandGallery band={band} galleryImages={galleryImages} openLightbox={openLightbox} />
        )}

        {band.tributeMode ? (
          <TributeDiscographySection band={band} />
        ) : (
          <SongsSection band={band} />
        )}

        <BandBookingCta band={band} />

        <OtherBands otherBands={otherBands} />

      </main>

      {/* Sticky bottom Book CTA: mobile only, hidden on desktop via globals.css */}
      <Link
        href="/contact"
        className="mobile-book-cta"
        aria-label={`Book ${band.name}`}
      >
        <span>Book {band.shortName}</span>
        <span style={{ opacity: 0.7 }}>→</span>
      </Link>

      {lightboxImg && (
        <BandLightbox
          band={band}
          images={images}
          lightboxImg={lightboxImg}
          lightboxIdx={lightboxIdx}
          setLightboxImg={setLightboxImg}
          setLightboxIdx={setLightboxIdx}
        />
      )}

      <Footer />
    </>
  )
}
