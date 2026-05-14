// Phase 33 — Photo + video highlights for QR landing pages.
//
// Renders a horizontally-scrollable strip on mobile, grid on desktop.
// Supports Photo (file URL), Video file (file URL with mp4 etc), YouTube embed (URL).

'use client'

import Image from 'next/image'

function MediaItem({ item, primaryColor }) {
  if (item.type === 'YouTube embed' && item.url) {
    // Extract video ID from YouTube URL (handles watch?v= and youtu.be)
    let videoId = null
    try {
      const u = new URL(item.url)
      if (u.hostname.includes('youtu.be')) videoId = u.pathname.replace('/', '')
      else if (u.searchParams.get('v')) videoId = u.searchParams.get('v')
    } catch {}
    if (!videoId) return null
    return (
      <div
        style={{
          flex: '0 0 280px',
          aspectRatio: '16/9',
          position: 'relative',
          background: '#0a0a0a',
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${primaryColor}30`,
        }}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={item.title || 'Video'}
          allowFullScreen
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    )
  }

  if (item.type === 'Video file' && item.fileUrl) {
    return (
      <div
        style={{
          flex: '0 0 280px',
          aspectRatio: '4/3',
          position: 'relative',
          background: '#0a0a0a',
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${primaryColor}30`,
        }}
      >
        <video
          controls
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src={item.fileUrl} />
        </video>
      </div>
    )
  }

  // Default: Photo
  if (!item.fileUrl) return null
  return (
    <figure
      style={{
        flex: '0 0 280px',
        aspectRatio: '4/3',
        position: 'relative',
        background: '#0a0a0a',
        borderRadius: '4px',
        overflow: 'hidden',
        border: `1px solid ${primaryColor}30`,
        margin: 0,
      }}
    >
      <Image
        src={item.fileUrl}
        alt={item.caption || item.title || 'Band photo'}
        fill
        sizes="280px"
        style={{ objectFit: 'cover' }}
      />
      {item.caption && (
        <figcaption
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            padding: '12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
            color: '#fff',
            fontFamily: 'var(--ff-body, sans-serif)',
            fontSize: '13px',
            lineHeight: 1.3,
          }}
        >
          {item.caption}
        </figcaption>
      )}
    </figure>
  )
}

export default function MediaHighlights({ media, primaryColor = '#D4A017' }) {
  if (!media || media.length === 0) return null

  return (
    <section style={{ padding: '8px 0 24px' }}>
      <div
        style={{
          fontFamily: 'var(--ff-label, sans-serif)',
          fontSize: '11px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        Highlights
      </div>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          padding: '0 20px 16px',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {media.map(item => (
          <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
            <MediaItem item={item} primaryColor={primaryColor} />
          </div>
        ))}
      </div>
    </section>
  )
}
