'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { galleryImageLoader } from '@/lib/public/gallery-image.mjs'
import styles from './BandPhotoGallery.module.css'

export default function BandPhotoGallery({ name, slug, photos }) {
  const [expanded, setExpanded] = useState(false)
  const [album, setAlbum] = useState('All photos')
  const [active, setActive] = useState(null)
  const dialog = useRef(null)
  const touch = useRef(null)
  const expandButton = useRef(null)
  const extraGrid = useRef(null)
  const albums = [...new Set(photos.map(photo => photo.album))]
  const filtered = album === 'All photos' ? photos : photos.filter(photo => photo.album === album)
  const photo = active === null ? null : filtered[active]
  const isOpen = active !== null

  useEffect(() => {
    if (!isOpen) return
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!element.open) element.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (expanded) extraGrid.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [expanded])

  function close() {
    dialog.current?.close()
    setActive(null)
  }

  function move(direction) {
    setActive(index => (index + direction + filtered.length) % filtered.length)
  }

  function open(id, preview) {
    if (preview) setAlbum('All photos')
    setActive((preview ? photos : filtered).findIndex(item => item.id === id))
  }

  function showAll() {
    setExpanded(true)
  }

  const tile = (item, index, preview = false) => (
    <button
      type="button"
      className={styles.tile}
      key={item.id}
      onClick={() => open(item.id, preview)}
      aria-label={`Enlarge photo: ${item.alt}`}
    >
      <Image
        loader={galleryImageLoader}
        src={item.src}
        alt={item.alt}
        fill
        sizes={preview && index === 0
          ? '(max-width: 700px) 100vw, 50vw'
          : '(max-width: 700px) 50vw, 25vw'}
        style={{ objectFit: 'cover', objectPosition: item.position || 'center' }}
      />
      <span className={styles.enlarge} aria-hidden="true">↗</span>
    </button>
  )

  if (!photos.length) return null

  return (
    <section id="photos" className="shell section-bottom" aria-labelledby="band-photos-heading">
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Photos</p>
          <h2 id="band-photos-heading" className="section-title">A look at {name}.</h2>
        </div>
        <p>{photos.length} photos · Tap to take a closer look.</p>
      </div>
      {!expanded && <div className={styles.preview}>{photos.slice(0, 5).map((item, index) => tile(item, index, true))}</div>}
      {expanded && (
        <div id={`${slug}-full-gallery`} className={styles.fullGallery}>
          {albums.length > 1 && (
            <div className={styles.filters} role="group" aria-label="Filter photos by collection">
              {['All photos', ...albums].map(label => (
                <button key={label} type="button" aria-pressed={album === label} onClick={() => setAlbum(label)}>{label}</button>
              ))}
            </div>
          )}
          <p className={styles.collectionCount} aria-live="polite">{album} · {filtered.length} photos</p>
          <div ref={extraGrid} className={styles.grid}>
            {filtered.map((item, index) => tile(item, index))}
          </div>
        </div>
      )}
      <div className={styles.footer}>
        <button
          type="button"
          className="button button-outline"
          ref={expandButton}
          aria-expanded={expanded}
          aria-controls={`${slug}-full-gallery`}
          onClick={() => {
            if (!expanded) showAll()
            else {
              setExpanded(false)
              setAlbum('All photos')
              expandButton.current?.focus()
            }
          }}
        >
          {expanded ? 'Show fewer photos' : `View all ${photos.length} photos`}
        </button>
        <Link className="text-link" href={`/press/${slug}#materials`}>Need photos for a show? Band kit ↗</Link>
      </div>
      <p className={styles.photographer}>Photos by {[...new Set(photos.map(item => item.credit).filter(Boolean))].join(' · ')}</p>

      <dialog
        ref={dialog}
        className={styles.lightbox}
        aria-label={`${name} photo gallery`}
        onCancel={close}
        onClose={() => setActive(null)}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
        }}
      >
        {photo && (
          <div className={styles.viewer}>
            <div className={styles.viewerHeader}>
              <span>{name}</span>
              <button type="button" onClick={close} aria-label="Close photo gallery" autoFocus>Close ✕</button>
            </div>
            <div
              className={styles.imageStage}
              onTouchStart={event => {
                touch.current = null
                if (event.touches.length === 1) touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
              }}
              onTouchCancel={() => { touch.current = null }}
              onTouchEnd={event => {
                if (!touch.current || !event.changedTouches.length) return
                const dx = event.changedTouches[0].clientX - touch.current.x
                const dy = event.changedTouches[0].clientY - touch.current.y
                touch.current = null
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
              }}
            >
              <Image key={photo.id} loader={galleryImageLoader} src={photo.src} alt={photo.alt} fill sizes="100vw" style={{ objectFit: 'contain' }} />
            </div>
            <div className={styles.viewerFooter}>
              <button type="button" onClick={() => move(-1)} aria-label="Previous photo">←</button>
              <div aria-live="polite" aria-atomic="true">
                <p>{active + 1} / {filtered.length} · {photo.album}</p>
                {photo.credit && <p className={styles.credit}>Photo: {photo.credit}</p>}
              </div>
              <button type="button" onClick={() => move(1)} aria-label="Next photo">→</button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
