'use client'

// Phase 18: Songs catalog section for band pages.
//
// Collapsed state: stats + preview row of 8 popular covers + "Show all N songs"
//                  button. Keeps the band page light by default.
// Expanded state: search bar + full responsive album-art grid. Click any cover
//                 to open the song's Spotify page in a new tab.
//
// Data comes from getSongsForBand() in lib/songs.js — the server enriches
// each song with Spotify album art before this component receives it.

import { useEffect, useMemo, useState } from 'react'

export default function SongsSection({ band, defaultExpanded = false }) {
  const [songs, setSongs] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [query, setQuery] = useState('')

  // Fetch the catalog on mount. The endpoint caches server-side for 1h, so
  // this is a fast call after the first hit. We deliberately load on every
  // band-page mount (instead of SSR'ing in the parent) because the page is
  // a client component for parallax + reveal animations.
  useEffect(() => {
    if (!band?.slug) return
    let cancelled = false
    fetch(`/api/songs/${band.slug}`)
      .then(r => r.ok ? r.json() : { songs: [] })
      .then(data => {
        if (!cancelled) {
          setSongs(Array.isArray(data?.songs) ? data.songs : [])
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [band?.slug])

  // Hide the section entirely until we've heard back, AND when no live songs
  // are tagged for this band yet — better to omit than show "0 songs" on the
  // public site.
  if (!loaded) return null
  if (!songs.length) return null

  // De-dup artists for the summary line.
  const uniqueArtists = useMemo(() => {
    const set = new Set(songs.map(s => s.artist?.toLowerCase()).filter(Boolean))
    return set.size
  }, [songs])

  // Featured preview row — top 8 by popularity (already pre-sorted upstream).
  const previewSongs = useMemo(() => songs.slice(0, 8), [songs])

  // Live search across title + artist + album. Case-insensitive, trims.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs
    return songs.filter(s => {
      const hay = [s.title, s.artist, s.album].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [songs, query])

  const accent = band?.color || 'var(--c-epl)'
  const accentSoft = `${accent}15`

  return (
    <section
      id="songs"
      style={{
        padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)',
        borderTop: '1px solid var(--c-border)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ marginBottom: 'var(--s-6)' }}>
          <div className="section-label" style={{ color: accent, marginBottom: 'var(--s-3)' }}>
            Songs We Play
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
              The Catalog
            </h2>
            {/* Summary line */}
            <div style={{
              fontFamily: 'var(--ff-body)',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--c-text)', fontWeight: 600 }}>{songs.length}</strong>{' '}live songs across{' '}
              <strong style={{ color: 'var(--c-text)', fontWeight: 600 }}>{uniqueArtists}</strong>{' '}artists
            </div>
          </div>
        </div>

        {/* COLLAPSED — preview strip + expand CTA */}
        {!expanded && (
          <>
            <div className="songs-preview-grid">
              {previewSongs.map(song => (
                <SongCard key={song.id} song={song} accent={accent} compact />
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 'var(--s-5)',
            }}>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                style={{
                  fontFamily: 'var(--ff-label)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: 'var(--ls-label-tight)',
                  textTransform: 'uppercase',
                  color: 'var(--c-bg)',
                  background: accent,
                  border: 'none',
                  padding: '14px 28px',
                  cursor: 'pointer',
                  transition: 'opacity var(--d-fast) var(--ease-in-out)',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Show all {songs.length} songs
              </button>
            </div>
          </>
        )}

        {/* EXPANDED — search + full grid */}
        {expanded && (
          <>
            {/* Search input */}
            <div style={{
              position: 'relative',
              marginBottom: 'var(--s-5)',
              maxWidth: '520px',
            }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by song, artist, or album…"
                aria-label="Search the song catalog"
                autoFocus
                style={{
                  width: '100%',
                  fontFamily: 'var(--ff-body)',
                  fontSize: '15px',
                  color: 'var(--c-text)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '14px 18px 14px 44px',
                  outline: 'none',
                  transition: 'border-color var(--d-fast) var(--ease-in-out), background var(--d-fast) var(--ease-in-out)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = accent
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
              />
              {/* Search icon */}
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                  pointerEvents: 'none',
                }}
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {/* Result count */}
              <div style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: 'var(--ff-label)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                pointerEvents: 'none',
              }}>
                {filtered.length}/{songs.length}
              </div>
            </div>

            {/* Full grid */}
            {filtered.length > 0 ? (
              <div className="songs-full-grid">
                {filtered.map(song => (
                  <SongCard key={song.id} song={song} accent={accent} />
                ))}
              </div>
            ) : (
              <div style={{
                padding: 'var(--s-7) var(--s-4)',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'var(--ff-body)',
                fontSize: '15px',
              }}>
                Nothing matches "<strong style={{ color: 'var(--c-text)' }}>{query}</strong>"
                <span style={{ display: 'block', marginTop: 'var(--s-2)', fontSize: '13px' }}>
                  Try the song title or original artist.
                </span>
              </div>
            )}

            <div style={{
              display: 'flex', justifyContent: 'center',
              marginTop: 'var(--s-6)',
            }}>
              <button
                type="button"
                onClick={() => { setExpanded(false); setQuery('') }}
                style={{
                  fontFamily: 'var(--ff-label)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: 'var(--ls-label-tight)',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  transition: 'border-color var(--d-fast) var(--ease-in-out), color var(--d-fast) var(--ease-in-out)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = accent
                  e.currentTarget.style.color = 'var(--c-text)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                ↑ Collapse catalog
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        /* Compact preview row — same card style, just fewer per row */
        .songs-preview-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 14px;
        }
        .songs-full-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .songs-preview-grid { grid-template-columns: repeat(6, 1fr); }
          .songs-full-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (max-width: 860px) {
          .songs-preview-grid { grid-template-columns: repeat(4, 1fr); }
          .songs-full-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 600px) {
          .songs-preview-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .songs-full-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        }
      `}</style>
    </section>
  )
}

// Single album-art card. Clickable when Spotify URL is available, static otherwise.
function SongCard({ song, accent, compact = false }) {
  const Wrapper = song.spotifyUrl ? 'a' : 'div'
  const linkProps = song.spotifyUrl
    ? { href: song.spotifyUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrapper
      {...linkProps}
      className="song-card"
      title={`${song.title} — ${song.artist}${song.album ? ` (${song.album})` : ''}`}
      style={{
        position: 'relative',
        display: 'block',
        background: '#0a0a0a',
        textDecoration: 'none',
        color: 'var(--c-text)',
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        cursor: song.spotifyUrl ? 'pointer' : 'default',
        // CSS var for hover overlay accent.
        '--card-accent': accent,
      }}
    >
      {song.albumArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={song.albumArt}
          alt={`${song.album || song.title} cover`}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            display: 'block',
            transition: 'transform var(--d-base) var(--ease-in-out)',
          }}
        />
      ) : (
        // Placeholder when Spotify didn't resolve — show title + artist over a
        // band-color tinted block so the card still reads as content, not a bug.
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '14px',
          background: `linear-gradient(135deg, ${accent}22 0%, #0a0a0a 100%)`,
        }}>
          <div style={{
            fontFamily: 'var(--ff-display)',
            fontSize: compact ? '14px' : '16px',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: '6px',
            color: 'var(--c-text)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>{song.title}</div>
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: accent,
          }}>{song.artist}</div>
        </div>
      )}

      {/* Hover/focus overlay with title + artist. Always present (just hidden)
          so the layout doesn't reflow on hover. */}
      <div className="song-card-overlay">
        <div className="song-card-title">{song.title}</div>
        <div className="song-card-artist">{song.artist}</div>
        {song.year && <div className="song-card-year">{song.year}</div>}
      </div>

      {/* Spotify play badge — only shown when we have a link */}
      {song.spotifyUrl && (
        <div className="song-card-spotify" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
      )}

      <style jsx>{`
        .song-card:hover img {
          transform: scale(1.05);
        }
        .song-card-overlay {
          position: absolute;
          inset: 0;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%);
          opacity: 0;
          transition: opacity var(--d-fast) var(--ease-in-out);
          pointer-events: none;
        }
        .song-card:hover .song-card-overlay,
        .song-card:focus-visible .song-card-overlay {
          opacity: 1;
        }
        .song-card-title {
          font-family: var(--ff-display);
          font-size: 15px;
          letter-spacing: 0.02em;
          line-height: 1.1;
          color: var(--c-text);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .song-card-artist {
          font-family: var(--ff-label);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--card-accent);
          margin-top: 4px;
        }
        .song-card-year {
          font-family: var(--ff-body);
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          margin-top: 4px;
        }
        .song-card-spotify {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: rgba(0,0,0,0.65);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1DB954;
          opacity: 0;
          transition: opacity var(--d-fast) var(--ease-in-out);
        }
        .song-card:hover .song-card-spotify {
          opacity: 1;
        }
        .song-card:focus-visible {
          outline: 2px solid var(--card-accent);
          outline-offset: 2px;
        }
      `}</style>
    </Wrapper>
  )
}
