import { Page, Intro, BandCard, BookingCta } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
export const metadata = {
  title: 'The Bands',
  description:
    'Meet So Long Goodnight, The Dick Beldings, Jambi and Elite. Tribute and cover bands based in Dallas-Fort Worth.',
  alternates: { canonical: '/bands' },
}
export default function BandsPage() {
  return (
    <Page>
      <Intro
        eyebrow="The Echo Play Live roster"
        title={
          <>
            Meet the
            <br />
            bands.
          </>
        }
      >
        <p>
          Here’s our lineup: 90s alternative, 2000s emo and pop punk,
          <br />
          plus tributes to TOOL and Deftones.
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
