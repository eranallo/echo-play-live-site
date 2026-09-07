'use client'

import { useEffect, useRef, useState } from 'react'

export default function BandHeaderVideo({ src, poster, objectPosition }) {
  const videoRef = useRef(null)
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotionAllowed(!preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  if (!motionAllowed || failed) return null

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => setPlaying(false))
    else video.pause()
  }

  return (
    <>
      <video
        ref={videoRef}
        className="band-header-video"
        src={src}
        poster={poster}
        style={{ objectPosition }}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        className="band-header-motion"
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        onClick={togglePlayback}
      >
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>
        {playing ? 'Pause motion' : 'Play motion'}
      </button>
    </>
  )
}
