import { pageMetadata } from '@/lib/public/seo.mjs'
import { Page, Intro, BandCard, BookingCta } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
export const metadata = pageMetadata({"title": "Tribute & Cover Bands in Dallas–Fort Worth", "description": "Explore Echo Play Live’s four bands: 90s rock, 2000s emo and pop punk, TOOL and Deftones. Find your next show or book a band.", "path": "/bands"})
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
