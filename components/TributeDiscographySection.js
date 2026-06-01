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
            Tap any album to see its tracks. Songs we perform are highlighted. Click any of them to open in Spotify. See one we don't play that you want to hear? Tap "Request" to send it to the band.
          </p>
        </div>

        {/* Albums */}
        {/* Phase 48: smaller inter-album gap since each album collapses to a
            compact header row. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
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

// Phase 48: collapsible album cards. Each album is now a single clickable
// header row (thumbnail + name + meta + badge + chevron). The track list is
// hidden by default and revealed on click. This keeps the discography page
// short while still surfacing the "X in set" badge so fans can spot albums
// with songs they recognize from the band's set.
function AlbumBlock({ album, accent, band, onRequest }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const performedInAlbum = useMemo(
    () => album.tracks.filter(t => t.isPerformed).length,
    [album]
  )
  const panelId = `album-tracks-${album.id}`

  return (
    <article style={{
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'var(--c-bg)',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="disco-album-header"
        style={{
          display: 'grid',
          gridTemplateColumns: '80px minmax(0, 1fr) auto auto',
          alignItems: 'center',
          gap: 'clamp(12px, 1.5vw, 20px)',
          width: '100%',
          padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 2vw, 24px)',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {album.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={album.coverUrl}
            alt={`${album.name} cover`}
            loading="lazy"
            style={{
              width: 80, height: 80, display: 'block',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ width: 80, height: 80, background: '#080808' }} />
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'clamp(18px, 2vw, 22px)',
            letterSpacing: '0.02em',
            lineHeight: 1.15,
            color: 'var(--c-text)',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{album.name}</div>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}>{album.year || '—'} · {album.tracks.length} tracks</div>
        </div>

        {performedInAlbum > 0 ? (
          <div className="disco-album-badge" style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: accent,
            background: `${accent}15`,
            border: `1px solid ${accent}40`,
            padding: '4px 8px',
            whiteSpace: 'nowrap',
          }}>{performedInAlbum} in set</div>
        ) : <span aria-hidden="true" />}

        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24, height: 24,
            color: 'rgba(255,255,255,0.5)',
            transition: 'transform 200ms ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {isExpanded && (
        <ol
          id={panelId}
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 'clamp(4px, 1vw, 8px) 0',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {album.tracks.map((track, idx) => (
            <TrackRow
              key={track.id || `${album.id}-${idx}`}
              track={track}
              accent={accent}
              onRequest={() => onRequest(track)}
            />
          ))}
        </ol>
      )}

      <style jsx>{`
        .disco-album-header:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .disco-album-header:focus-visible {
          outline: 2px solid ${accent};
          outline-offset: -2px;
        }
        @media (max-width: 520px) {
          .disco-album-badge {
            display: none;
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
