import { Page, Intro, BandCard, BookingCta } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
export const metadata = {
  title: 'The Bands',
  description:
    'Meet So Long Goodnight, The Dick Beldings, Jambi and Elite. Four distinct live music experiences from Echo Play Live.',
  alternates: { canonical: '/bands' },
}
export default function BandsPage() {
  return (
    <Page>
      <Intro
        eyebrow="The Echo Play Live roster"
        title={
          <>
            Find your
            <br />
            frequency.
          </>
        }
      >
        <p>
          Emo anthems. 90s favorites. The worlds of TOOL and Deftones.
          <br />
          Explore the band that feels like you.
        </p>
      </Intro>
      <section className="shell section-bottom">
        <div className="band-grid">
          {bandsList.map((band, index) => (
            <BandCard key={band.slug} band={band} index={index} />
          ))}
        </div>
      </section>
      <BookingCta />
    </Page>
  )
}
