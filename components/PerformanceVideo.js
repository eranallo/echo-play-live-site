'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { track } from '@/lib/track'
import { performanceUrl } from '@/lib/public/performances.mjs'

export default function PerformanceVideo({ performance, slug }) {
  const [playing, setPlaying] = useState(false)
  const playButton = useRef(null)
  const hasPlayed = useRef(false)
  useEffect(() => {
    if (!playing && hasPlayed.current) playButton.current?.focus()
  }, [playing])
  const title = `${performance.band} — ${performance.title} by ${performance.artist}`
  function play() {
    hasPlayed.current = true
    setPlaying(true)
    try { track('Performance player opened', { band: slug, video: performance.videoId }) } catch {}
  }
  return (
    <section id="watch" className="shell section-bottom performance-section">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">From the stage</p>
          <h2 className="section-title">See {performance.band} live.</h2>
        </div>
        <a className="text-link" href={performance.channel} target="_blank" rel="noopener noreferrer">
          More on YouTube ↗
        </a>
      </div>
      <div className="performance-player">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${performance.videoId}?autoplay=1&playsinline=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={(event) => event.currentTarget.focus()}
          />
        ) : (
          <button ref={playButton} className="performance-play" onClick={play} aria-label={`Play ${title}`}>
            <Image src={performance.poster} alt="" fill sizes="(max-width: 760px) 92vw, 1120px" style={{ objectFit: 'cover' }} />
            <span className="performance-shade" />
            <span className="performance-play-icon" aria-hidden="true">▶</span>
            <span className="performance-play-label">Watch the performance</span>
          </button>
        )}
      </div>
      <div className="performance-caption">
        <div><h3>“{performance.title}” · {performance.artist}</h3><p>{performance.venue} · Full-song performance</p></div>
        {playing && <button className="text-link" onClick={() => setPlaying(false)}>Close video</button>}
      </div>
      <p className="form-note">
        Press play to load YouTube. You can also{' '}
        <a href={performanceUrl(performance)} target="_blank" rel="noopener noreferrer">watch directly on YouTube ↗</a>.
      </p>
    </section>
  )
}
