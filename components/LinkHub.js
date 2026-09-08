import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import TrackedLink from './TrackedLink'
import FanSignup from './FanSignup'
import HubShare from './HubShare'
import BrandLogo from './BrandLogo'
import { linkHubs, nextHubShow } from '@/lib/public/link-hubs.mjs'
import { getPublicShows } from '@/lib/public/shows'
import { showPath } from '@/lib/public/show-presentation.mjs'
import { uploadsEnabled } from '@/lib/uploads/service.mjs'

const showsHref = (hub) => (hub.slug === 'hub' ? '/shows' : `/shows?band=${hub.slug}`)
function ShowLink({ hub, loading = false }) {
  return (
    <TrackedLink className="hub-next-show" href={showsHref(hub)} event="Hub shows" band={hub.slug}>
      <div>
        <span className="hub-kicker">Come see us play</span>
        <h2>Upcoming shows</h2>
        <p>{loading ? 'Checking the latest dates…' : 'See announced dates and ticket details.'}</p>
      </div>
      <span aria-hidden="true">↗</span>
    </TrackedLink>
  )
}
async function NextShow({ hub }) {
  const result = await getPublicShows()
  const show = result.ok ? nextHubShow(result.shows, hub.slug) : null
  if (!show) return <ShowLink hub={hub} />
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${show.date}T12:00:00Z`))
  return (
    <div className="hub-show-group">
      <TrackedLink
        className="hub-next-show"
        href={showPath(show)}
        event="Hub next show"
        band={hub.slug}
        showId={show.id}
      >
        <div>
          <span className="hub-kicker">Next show · {date}</span>
          <h2>{show.venue.name}</h2>
          <p>
            {hub.slug === 'hub'
              ? show.bands.map((band) => band.name).join(' + ')
              : 'Show information & ticket details'}
          </p>
        </div>
        <span aria-hidden="true">↗</span>
      </TrackedLink>
      <Link className="hub-all-shows" href={showsHref(hub)} prefetch={false}>
        All upcoming shows →
      </Link>
    </div>
  )
}
export default function LinkHub({ hub }) {
  const company = hub.slug === 'hub'
  return (
    <main id="main-content" className="link-hub" tabIndex={-1}>
      <div className="hub-cover" aria-hidden="true">
        <Image
          src={hub.cover}
          alt=""
          fill
          priority
          sizes="(max-width: 600px) 100vw, 600px"
          style={{ objectFit: 'cover', objectPosition: hub.coverPosition }}
        />
      </div>
      <div className="hub-body">
        <header className="hub-header">
          <Link className="hub-home" href={company ? '/' : '/hub'}>
            {company ? 'echoplay.live' : '← Echo Play Live'}
          </Link>
          <h1 className="sr-only">{hub.name} · Official links</h1>
          <div className={`hub-logo hub-logo-${hub.logoStyle}`}>
            <Image
              src={hub.logo}
              alt={hub.name}
              fill
              priority
              sizes="(max-width: 600px) 75vw, 320px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p className="hub-label">{hub.label}</p>
          <p className="hub-intro">{hub.intro}</p>
        </header>
        <section aria-label="Upcoming shows" className="hub-show-slot">
          <Suspense fallback={<ShowLink hub={hub} loading />}>
            <NextShow hub={hub} />
          </Suspense>
        </section>
        {company && (
          <section className="hub-roster">
            <h2>Our bands</h2>
            <div>
              {linkHubs
                .filter((item) => item.slug !== 'hub')
                .map((band) => (
                  <Link href={band.path} key={band.slug} className="hub-roster-band">
                    <div>
                      <Image
                        src={band.logo}
                        alt=""
                        fill
                        sizes="140px"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <strong>{band.name}</strong>
                    <small>{band.label}</small>
                  </Link>
                ))}
            </div>
          </section>
        )}
        <nav aria-label={`${hub.name} links`} className="hub-links">
          {uploadsEnabled() && <Link className="hub-link" href={company?'/upload':`/upload?band=${hub.slug}`} prefetch={false}><span><strong>Share your photos & videos</strong><small>Got a good shot from a show? Send it to us.</small></span><span aria-hidden="true">↑</span></Link>}
          {hub.links.map(([label, detail, href]) => (
            <TrackedLink
              key={href}
              href={href}
              event="Hub link"
              band={hub.slug}
              className="hub-link"
            >
              <span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span aria-hidden="true">↗</span>
            </TrackedLink>
          ))}
        </nav>
        <section className="hub-social" aria-label="Social profiles">
          {Object.entries(hub.social).map(([label, href]) => (
            <TrackedLink
              key={label}
              href={href}
              event="Hub social"
              band={hub.slug}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label} ↗
            </TrackedLink>
          ))}
          <a href={`mailto:${hub.bookingEmail}`}>Email us ↗</a>
        </section>

        <details className="hub-signup">
          <summary>
            Get show updates by email <span aria-hidden="true">+</span>
          </summary>
          <FanSignup bandSlug={company ? '' : hub.slug} compact />
        </details>
        <HubShare name={hub.name} path={hub.path} slug={hub.slug} />
        <footer className="hub-footer">
          <Link href="/" aria-label="Echo Play Live home">
            <BrandLogo variant="white" size={65} />
          </Link>
          <p>Thanks for supporting live music.</p>
          <Link href="/">Visit echoplay.live ↗</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  )
}
