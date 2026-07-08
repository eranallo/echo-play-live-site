'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import SongsSection from '@/components/SongsSection'
import TributeDiscographySection from '@/components/TributeDiscographySection'
import { bandsList } from '@/lib/bands'
import BandHero from '@/components/band/BandHero'
import BandAbout from '@/components/band/BandAbout'
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

export default function BandPageClient({ band }) {
  const pageRef = useScrollReveal()
  const heroParallaxRef = useParallaxY(0.25)
  const [images, setImages] = useState([])
  const [lightboxImg, setLightboxImg] = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [lineup, setLineup] = useState([])
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
  }, [band])

  useEffect(() => {
    if (!band) return
    fetch(`/api/musicians?band=${band.slug}`)
      .then(r => r.json())
      .then(data => setLineup(Array.isArray(data.members) ? data.members : []))
      .catch(() => setLineup([]))
  }, [band])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setLightboxImg(null)
      if (e.key === 'ArrowRight' && lightboxImg && images.length) {
        const next = (lightboxIdx + 1) % images.length
        setLightboxIdx(next)
        setLightboxImg(images[next])
      }
      if (e.key === 'ArrowLeft' && lightboxImg && images.length) {
        const prev = (lightboxIdx - 1 + images.length) % images.length
        setLightboxIdx(prev)
        setLightboxImg(images[prev])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxImg, lightboxIdx, images])

  const otherBands = bandsList.filter(b => b.slug !== band.slug)
  const curatedUrls = new Set([band.heroPhoto, band.featurePhoto, band.crowdPhoto].filter(Boolean))
  const heroImg = band.heroPhoto ? { url: band.heroPhoto } : (images[0] || null)
  const featureImg = band.featurePhoto ? { url: band.featurePhoto } : (images[1] || null)
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
        <BandAbout band={band} featureImg={featureImg} openLightbox={openLightbox} />
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

      <Link href="/contact" className="mobile-book-cta" aria-label={`Book ${band.name}`}>
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
