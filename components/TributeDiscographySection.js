'use client'

// Phase 20: Tribute band discography view.
//
// Replaces the album-art catalog grid on /bands/elite and /bands/jambi.
// Renders the tributed artist's full discography (Spotify) as a vertical
// stack of albums. Each album shows its cover, name, year, and full track
// list. Tracks the band performs are highlighted in band color and link
// to Spotify on click. Tracks the band doesn't perform are dimmed; click
// opens the SongRequestModal with the song pre-filled.

import { useEffect, useMemo, useState } from 'react'
import SongRequestModal from './SongRequestModal'

function fmtDuration(ms) {
  if (!ms || typeof ms !== 'number') return ''
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TributeDiscographySection({ band }) {
  const [data, setData] = useState(null)        // { artist, albums, performedCount, totalCount }
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [requestFor, setRequestFor] = useState(null) // track object pre-filled into modal

  // Load discography once on mount.
  useEffect(() => {
    if (!band?.slug) return
    let cancelled = false
    fetch(`/api/discography/${band.slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return
        if (!d || !d.albums) {
          setError('Discography unavailable')
          setLoaded(true)
          return
        }
        setData(d)
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Discography unavailable')
          setLoaded(true)
        }
      })
    return () => { cancelled = true }
  }, [band?.slug])

  if (!loaded) return null
  if (error || !data || data.albums.length === 0) return null

  const accent = band.color || 'var(--c-epl)'

  return (
    <section
      id="discography"
      style={{
        padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)',
        borderTop: '1px solid var(--c-border)',
      }}
    >
      <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ marginBottom: 'var(--s-7)' }}>
          <div className="section-label" style={{ color: accent, marginBottom: 'var(--s-3)' }}>
            The Discography
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 'var(--s-4)',
          }}>
            <h2 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(40px, 6vw, 72px)',
              letterSpacing: '0.01em',
              lineHeight: 0.95,
            }}>
              Every {data.artist.name} Album
            </h2>
            <div style={{
              fontFamily: 'var(--ff-body)',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.5,
            }}>
              <strong style={{ color: accent, fontWeight: 600 }}>{data.performedCount}</strong>{' '}of{' '}
              <strong style={{ color: 'var(--c-text)', fontWeight: 600 }}>{data.totalCount}</strong>{' '}tracks
              currently in {band.shortName}'s set
            </div>
          </div>
          <p style={{
            fontFamily: 'var(--ff-body)',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            marginTop: 'var(--s-4)',
            maxWidth: '640px',
          }}>
            Songs we perform are highlighted. Click any of them to open in Spotify. See one we don't play that you want to hear? Tap "Request" to send it to the band.
          </p>
        </div>

        {/* Albums */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          {data.albums.map(album => (
            <AlbumBlock
              key={album.id}
              album={album}
              accent={accent}
              band={band}
              onRequest={(track) => setRequestFor({
                songTitle: track.title,
                originalArtist: data.artist.name,
                album: album.name,
                spotifyTrackId: track.id,
                spotifyTrackUrl: track.spotifyUrl,
              })}
            />
          ))}
        </div>
      </div>

      <SongRequestModal
        open={Boolean(requestFor)}
        onClose={() => setRequestFor(null)}
        band={band}
        prefill={requestFor}
      />
    </section>
  )
}

function AlbumBlock({ album, accent, band, onRequest }) {
  const performedInAlbum = useMemo(
    () => album.tracks.filter(t => t.isPerformed).length,
    [album]
  )

  return (
    <article style={{
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'var(--c-bg)',
      overflow: 'hidden',
    }}>
      <div className="disco-album-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 200px) minmax(0, 1fr)',
        gap: 0,
      }}>
        {/* Cover + meta column */}
        <div style={{
          padding: 'clamp(20px, 2.5vw, 28px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#0a0a0a',
        }}>
          {album.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={album.coverUrl}
              alt={`${album.name} cover`}
              loading="lazy"
              style={{
                width: '100%', height: 'auto', display: 'block',
                aspectRatio: '1 / 1', objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{ aspectRatio: '1 / 1', background: '#080808' }} />
          )}
          <div style={{ marginTop: 'var(--s-3)' }}>
            <div style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(20px, 2.4vw, 26px)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              color: 'var(--c-text)',
              marginBottom: '4px',
            }}>{album.name}</div>
            <div style={{
              fontFamily: 'var(--ff-label)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '10px',
            }}>{album.year || '—'} · {album.tracks.length} tracks</div>
            {performedInAlbum > 0 && (
              <div style={{
                display: 'inline-block',
                fontFamily: 'var(--ff-label)',
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: accent,
                background: `${accent}15`,
                border: `1px solid ${accent}40`,
                padding: '4px 8px',
              }}>{performedInAlbum} in set</div>
            )}
          </div>
        </div>

        {/* Track list */}
        <ol style={{
          listStyle: 'none',
          margin: 0,
          padding: 'clamp(8px, 1vw, 12px) 0',
        }}>
          {album.tracks.map((track, idx) => (
            <TrackRow
              key={track.id || `${album.id}-${idx}`}
              track={track}
              accent={accent}
              onRequest={() => onRequest(track)}
            />
          ))}
        </ol>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .disco-album-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </article>
  )
}

function TrackRow({ track, accent, onRequest }) {
  const isPerformed = Boolean(track.isPerformed)
  const isClickable = isPerformed ? Boolean(track.spotifyUrl) : true

  // For performed tracks, the entire row is a link to Spotify.
  // For unplayed tracks, the entire row is a button that opens the modal.
  const sharedStyle = {
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) auto auto',
    alignItems: 'center',
    gap: 'var(--s-3)',
    padding: '10px clamp(14px, 2vw, 24px)',
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    cursor: isClickable ? 'pointer' : 'default',
    fontSize: '15px',
    fontFamily: 'var(--ff-body)',
    transition: 'background var(--d-fast) var(--ease-in-out)',
    textAlign: 'left',
  }

  const trackNumberStyle = {
    fontFamily: 'var(--ff-label)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: isPerformed ? accent : 'rgba(255,255,255,0.3)',
    textAlign: 'right',
  }

  const titleStyle = {
    fontWeight: isPerformed ? 500 : 300,
    color: isPerformed ? 'var(--c-text)' : 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const durationStyle = {
    fontFamily: 'var(--ff-label)',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    fontVariantNumeric: 'tabular-nums',
  }

  // Played track → anchor to Spotify
  if (isPerformed && track.spotifyUrl) {
    return (
      <li>
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="disco-track-row"
          style={sharedStyle}
        >
          <span style={trackNumberStyle}>{track.trackNumber}</span>
          <span style={titleStyle}>{track.title}</span>
          <span aria-label="Currently in our set" style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--c-bg)',
            background: accent,
            padding: '4px 8px',
            whiteSpace: 'nowrap',
          }}>Played</span>
          <span style={durationStyle}>{fmtDuration(track.durationMs)}</span>
        </a>
      </li>
    )
  }

  // Not played → button that opens request modal
  return (
    <li>
      <button
        type="button"
        onClick={onRequest}
        className="disco-track-row disco-track-row--unplayed"
        style={sharedStyle}
      >
        <span style={trackNumberStyle}>{track.trackNumber}</span>
        <span style={titleStyle}>{track.title}</span>
        <span style={{
          fontFamily: 'var(--ff-label)',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '4px 8px',
          whiteSpace: 'nowrap',
          transition: 'color var(--d-fast) var(--ease-in-out), border-color var(--d-fast) var(--ease-in-out)',
        }}
          className="disco-request-pill"
        >+ Request</span>
        <span style={durationStyle}>{fmtDuration(track.durationMs)}</span>

        <style jsx>{`
          .disco-track-row:hover {
            background: rgba(255,255,255,0.025);
          }
          .disco-track-row--unplayed:hover :global(.disco-request-pill) {
            color: var(--c-text);
            border-color: rgba(255,255,255,0.4);
          }
        `}</style>
      </button>
    </li>
  )
}
