import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Page, Intro } from '@/components/SiteParts'
import { getMusician } from '@/lib/musicians'
export const revalidate = 1800
export default async function MusicianPage({ params }) {
  const { slug } = await params
  const m = await getMusician(slug)
  if (!m) notFound()
  return (
    <Page>
      <Intro eyebrow={m.instruments.join(' · ')} title={m.name}>
        <div className="inline-links">
          {m.bands.map((b) => (
            <Link key={b.slug} href={`/bands/${b.slug}`}>
              {b.name} ↗
            </Link>
          ))}
        </div>
      </Intro>
      <section className="shell section-bottom band-description">
        {m.photo?.url && (
          <div className="photo-tile">
            <Image
              src={m.photo.url}
              alt={m.name}
              fill
              priority
              sizes="(max-width: 760px) 90vw, 40vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="text-body">
          {(m.bioLong || m.bioShort || '')
            .split('\n')
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          <Link className="text-link" href="/musicians">
            ← All musicians
          </Link>
        </div>
      </section>
      {m.interview?.length > 0 && (
        <section className="shell section-bottom">
          <h2 className="section-title">In their own words.</h2>
          <div className="faq-list">
            {m.interview.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                {item.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </details>
            ))}
          </div>
        </section>
      )}
    </Page>
  )
}
