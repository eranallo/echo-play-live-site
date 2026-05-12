// /podcast — Echo Play Podcast landing page.
//
// Server component. Episode list lives in lib/podcast.js. Buzzsprout iframe
// players are embedded inline (lazy-loaded so they don't block render).

import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import RevealOnView from '@/components/RevealOnView'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import {
  podcast,
  episodes,
  buzzsproutEmbedUrl,
  buzzsproutEpisodeUrl,
  formatEpisodeDate,
} from '@/lib/podcast'

export const revalidate = 3600

// Inline brand icons so we don't pull in an icon library for one page.
const Icons = {
  spotify: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  ),
  apple: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4.5c1.93 0 3.5 1.57 3.5 3.5 0 1.93-1.57 3.5-3.5 3.5S8.5 11.93 8.5 10c0-1.93 1.57-3.5 3.5-3.5zm0 9c2.5 0 4.5 1 4.5 2.25v.75H7.5v-.75c0-1.25 2-2.25 4.5-2.25z"/>
    </svg>
  ),
  amazon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.61 17.61 0 01-4.83.612c-2.85 0-5.523-.502-8.017-1.508-2.495-1.006-4.685-2.42-6.57-4.244-.18-.18-.21-.32-.084-.43zm5.535-5.84c0-.99.244-1.84.73-2.555.488-.716 1.158-1.258 2.01-1.626.787-.34 1.756-.583 2.906-.732 1.15-.146 2.535-.218 4.156-.218v-.36c0-.95-.073-1.6-.218-1.95-.146-.35-.39-.6-.732-.748-.34-.146-.78-.218-1.32-.218-.78 0-1.408.18-1.876.536-.47.357-.78.86-.932 1.508-.073.18-.197.27-.37.27l-2.34-.318c-.21-.04-.318-.146-.318-.318 0-.04.007-.087.022-.14.51-2.668 2.488-4.003 5.932-4.003 1.86 0 3.34.42 4.44 1.26.65.49 1.06 1.09 1.23 1.8.17.71.255 1.66.255 2.85v3.92c0 1.05.16 1.85.49 2.42.32.56.84.84 1.55.84.13 0 .26.04.4.12.39.27.6.49.6.66 0 .12-.05.23-.16.34-1.05 1.05-2.06 1.83-3.04 2.33-.66.32-1.39.5-2.18.5-1.31 0-2.31-.42-2.99-1.26-.68-.84-1.03-1.95-1.03-3.32v-.43c-.7 1.49-1.71 2.51-3.04 3.05-.7.27-1.45.4-2.27.4-1.16 0-2.13-.39-2.91-1.16-.78-.78-1.17-1.83-1.17-3.16z"/>
    </svg>
  ),
  rss: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 3a16 16 0 0116 16h-3a13 13 0 00-13-13V3zm0 7a9 9 0 019 9h-3a6 6 0 00-6-6v-3zm3 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
    </svg>
  ),
}

const subscribeLinks = [
  { name: 'Spotify',         href: podcast.subscribe.spotify,        icon: Icons.spotify, accent: '#1DB954' },
  { name: 'Apple Podcasts',  href: podcast.subscribe.applePodcasts,  icon: Icons.apple,   accent: '#A855F7' },
  { name: 'Amazon Music',    href: podcast.subscribe.amazonMusic,    icon: Icons.amazon,  accent: '#00A8E1' },
  { name: 'RSS Feed',        href: podcast.subscribe.rss,            icon: Icons.rss,     accent: '#F5A623' },
]

export default function PodcastPage() {
  const latest = episodes[0]
  const rest = episodes.slice(1)

  return (
    <>
      <ScrollToTopOnMount />
      <Nav />
      <RevealOnView>
      <main style={{ background: 'var(--c-bg)', minHeight: '100vh' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(120px, 16vw, 200px) var(--gutter-fluid) clamp(60px, 8vw, 100px)',
          borderBottom: '1px solid var(--c-border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle ambient gradient */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: 'radial-gradient(ellipse 70% 60% at 30% 20%, rgba(245,197,24,0.06), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(157,78,221,0.04), transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            maxWidth: 'var(--layout-max)', margin: '0 auto', position: 'relative', zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: 'clamp(40px, 6vw, 96px)',
            alignItems: 'center',
          }} className="podcast-hero-grid">

            <div>
              <div className="reveal-up" style={{
                fontFamily: 'var(--ff-label)',
                fontSize: 'var(--t-label-s)',
                fontWeight: 600,
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--c-epl)',
                marginBottom: 'var(--s-4)',
              }}>
                The Podcast
              </div>
              <h1 className="reveal delay-100" style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'clamp(56px, 11vw, 148px)',
                letterSpacing: '0.01em',
                lineHeight: 0.88,
                color: 'var(--c-text)',
                marginBottom: 'var(--s-5)',
              }}>
                ECHO PLAY<br />PODCAST
              </h1>
              <p className="reveal-up delay-200" style={{
                fontFamily: 'var(--ff-body)',
                fontSize: 'clamp(17px, 1.9vw, 21px)',
                lineHeight: 1.6,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: 'var(--s-6)',
                maxWidth: '560px',
              }}>
                {podcast.description}
              </p>

              <div className="reveal-up delay-300" style={{
                display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)',
              }}>
                {subscribeLinks.map(s => (
                  <a key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="podcast-subscribe-btn"
                    style={{ '--accent': s.accent }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                      {s.icon}
                      <span>{s.name}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Cover art */}
            <div className="reveal-zoom" style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              maxWidth: '440px',
              width: '100%',
              justifySelf: 'center',
            }}>
              <Image
                src={podcast.artworkUrl}
                alt={`${podcast.title} cover art`}
                fill
                priority
                unoptimized
                sizes="(max-width: 900px) 80vw, 440px"
                style={{ objectFit: 'cover', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </section>

        {/* ── LATEST EPISODE ────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
          borderBottom: '1px solid var(--c-border)',
        }}>
          <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
            <div className="reveal-up" style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
              marginBottom: 'var(--s-3)',
            }}>
              Latest Episode
            </div>
            <h2 className="reveal delay-100" style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(36px, 6vw, 72px)',
              letterSpacing: '0.01em',
              lineHeight: 0.95,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-3)',
            }}>
              {latest.title}
            </h2>
            <div className="reveal-up delay-200" style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              fontWeight: 500,
              letterSpacing: 'var(--ls-label-tight)',
              textTransform: 'uppercase',
              color: 'var(--c-text-dim)',
              marginBottom: 'var(--s-5)',
            }}>
              Episode {latest.number} · {formatEpisodeDate(latest.date)} · {latest.duration}
            </div>
            <p className="reveal-up delay-300" style={{
              fontFamily: 'var(--ff-body)',
              fontSize: 'clamp(16px, 1.7vw, 18px)',
              lineHeight: 1.75,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 'var(--s-6)',
              maxWidth: '780px',
            }}>
              {latest.description}
            </p>

            <div className="reveal delay-300" style={{ borderRadius: 0, overflow: 'hidden' }}>
              <iframe
                src={buzzsproutEmbedUrl(latest.buzzsproutId)}
                loading="lazy"
                title={`Listen to ${latest.title}`}
                width="100%"
                height="200"
                frameBorder="0"
                scrolling="no"
                style={{ display: 'block', width: '100%', border: '1px solid var(--c-border)' }}
              />
            </div>
          </div>
        </section>

        {/* ── ABOUT ─────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
          borderBottom: '1px solid var(--c-border)',
          background: 'var(--c-surface-2)',
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div className="reveal-up" style={{
              width: '32px', height: '3px',
              background: 'var(--c-epl)',
              margin: '0 auto var(--s-5)',
            }} />
            <div className="section-label reveal" style={{ marginBottom: 'var(--s-4)' }}>
              About the show
            </div>
            <p className="reveal-up delay-100" style={{
              fontFamily: 'var(--ff-body)',
              fontSize: 'clamp(17px, 1.9vw, 21px)',
              lineHeight: 1.7,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 'var(--s-6)',
            }}>
              {podcast.longDescription}
            </p>
            <div className="reveal-up delay-200" style={{
              display: 'flex', justifyContent: 'center', gap: 'var(--s-6)', flexWrap: 'wrap',
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              letterSpacing: 'var(--ls-label-tight)',
              textTransform: 'uppercase',
              color: 'var(--c-text-dim)',
            }}>
              <div>
                <div style={{ color: 'var(--c-text)', fontFamily: 'var(--ff-display)', fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '0.02em', lineHeight: 1 }}>
                  {podcast.hosts.map(h => h.name).join(' · ')}
                </div>
                <div style={{ marginTop: 'var(--s-2)' }}>Hosts</div>
              </div>
              <div>
                <div style={{ color: 'var(--c-text)', fontFamily: 'var(--ff-display)', fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '0.02em', lineHeight: 1 }}>
                  Since {podcast.startYear}
                </div>
                <div style={{ marginTop: 'var(--s-2)' }}>{episodes.length} episodes</div>
              </div>
              <div>
                <div style={{ color: 'var(--c-text)', fontFamily: 'var(--ff-display)', fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '0.02em', lineHeight: 1 }}>
                  Platinum Music
                </div>
                <div style={{ marginTop: 'var(--s-2)' }}>Recorded at</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── EPISODE ARCHIVE ───────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
          borderBottom: '1px solid var(--c-border)',
        }}>
          <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
            <div className="reveal-up" style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
              marginBottom: 'var(--s-3)',
            }}>
              The Archive
            </div>
            <h2 className="reveal delay-100" style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(36px, 6vw, 72px)',
              letterSpacing: '0.01em',
              lineHeight: 0.95,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-7)',
            }}>
              Every Episode
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {rest.map((ep, i) => (
                <article
                  key={ep.buzzsproutId}
                  className="podcast-episode-row reveal"
                  style={{ transitionDelay: `${Math.min(i * 50, 400)}ms` }}
                >
                  <div style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    letterSpacing: '0.02em',
                    color: 'var(--c-text-dim)',
                    lineHeight: 1,
                    paddingTop: '4px',
                    minWidth: '64px',
                  }}>
                    {String(ep.number).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--ff-display)',
                      fontSize: 'clamp(20px, 2.4vw, 28px)',
                      letterSpacing: '0.02em',
                      color: 'var(--c-text)',
                      lineHeight: 1.15,
                      marginBottom: 'var(--s-2)',
                    }}>{ep.title}</h3>
                    <div style={{
                      fontFamily: 'var(--ff-label)',
                      fontSize: 'var(--t-label-s)',
                      fontWeight: 500,
                      letterSpacing: 'var(--ls-label-tight)',
                      textTransform: 'uppercase',
                      color: 'var(--c-text-faint)',
                      marginBottom: 'var(--s-3)',
                    }}>
                      {formatEpisodeDate(ep.date)} · {ep.duration}
                    </div>
                    <p style={{
                      fontFamily: 'var(--ff-body)',
                      fontSize: 'clamp(14px, 1.5vw, 16px)',
                      lineHeight: 1.75,
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.55)',
                      marginBottom: 'var(--s-3)',
                    }}>{ep.description}</p>
                    <a
                      href={buzzsproutEpisodeUrl(ep.buzzsproutId, ep.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        fontFamily: 'var(--ff-label)',
                        fontSize: 'var(--t-label)',
                        fontWeight: 600,
                        letterSpacing: 'var(--ls-label-tight)',
                        textTransform: 'uppercase',
                        color: 'var(--c-epl)',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(245,197,24,0.4)',
                        paddingBottom: '2px',
                      }}
                    >
                      Listen →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── SUBSCRIBE FOOTER ──────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 className="reveal" style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(36px, 6vw, 64px)',
              letterSpacing: '0.01em',
              lineHeight: 0.95,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-5)',
            }}>
              Subscribe wherever you listen
            </h2>
            <div className="reveal-up delay-200" style={{
              display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', justifyContent: 'center',
            }}>
              {subscribeLinks.map(s => (
                <a key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="podcast-subscribe-btn"
                  style={{ '--accent': s.accent }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                    {s.icon}
                    <span>{s.name}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>
      </RevealOnView>
      <Footer />
    </>
  )
}
