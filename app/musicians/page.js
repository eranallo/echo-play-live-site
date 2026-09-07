import Link from 'next/link'
import Image from 'next/image'
import { Page, Intro } from '@/components/SiteParts'
import { getMusicians } from '@/lib/musicians'
export const revalidate = 1800
export default async function MusiciansPage() {
  const musicians = await getMusicians()
  return (
    <Page>
      <Intro
        eyebrow="The people behind the show"
        title={
          <>
            Meet the
            <br />
            musicians.
          </>
        }
      >
        <p>Get to know the people playing in our bands.</p>
      </Intro>
      <section className="shell section-bottom">
        {musicians.length ? (
          <div className="three-columns">
            {musicians.map((m) => (
              <Link
                className="content-panel musician-card"
                href={`/musicians/${m.slug}`}
                key={m.slug}
              >
                {m.photo?.url && (
                  <div className="photo-tile">
                    <Image
                      src={m.photo.url}
                      alt={m.name}
                      fill
                      sizes="(max-width: 760px) 90vw, 30vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h2 style={{ marginTop: 22 }}>{m.name}</h2>
                <p>{m.instruments.join(' · ')}</p>
                <p>{m.bands.map((b) => b.name).join(' / ')}</p>
                <span className="text-link">Meet {m.name.split(' ')[0]} ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Get to know the bands.</h2>
            <p>
              We couldn’t load the individual profiles. You can still visit the band pages below.
            </p>
            <Link className="button" href="/bands">
              Meet the bands →
            </Link>
          </div>
        )}
      </section>
    </Page>
  )
}
