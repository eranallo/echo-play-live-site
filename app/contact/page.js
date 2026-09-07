import { Page, Intro } from '@/components/SiteParts'
import BookingForm from '@/components/BookingForm'
import { bandsList } from '@/lib/bands'
import { FAQ_CONTACT } from '@/lib/faqs'
export default async function ContactPage({ searchParams }) {
  const query = await searchParams
  const selected = bandsList.find((b) => b.slug === query?.band)?.name || ''
  return (
    <Page>
      <Intro
        eyebrow="Let’s make a night of it"
        title={
          <>
            A great show
            <br />
            starts here.
          </>
        }
      >
        <p>
          Have a date in mind? A room to fill? A crowd to bring together?
          <br />
          Tell us what you’re planning. We’ll take it from there.
        </p>
      </Intro>
      <section className="shell booking-layout">
        <BookingForm
          initialBand={selected}
          bands={bandsList.map((b) => ({ name: b.name, slug: b.slug, email: b.bookingEmail }))}
        />
        <aside className="booking-aside">
          <h2>
            The right band.
            <br />A real conversation.
          </h2>
          <p>
            Venues, festivals, private parties, corporate events. Start with your idea and we’ll
            work through fit, availability, and the details with you.
          </p>
          <p>Prefer email? Reach the band directly.</p>
          {bandsList.map((b) => (
            <div className="direct-contact" key={b.slug}>
              <strong>{b.name}</strong>
              <a href={`mailto:${b.bookingEmail}`}>{b.bookingEmail} ↗</a>
            </div>
          ))}
        </aside>
      </section>
      <section className="shell section-bottom">
        <h2 className="section-title">A few helpful answers.</h2>
        <div className="faq-list">
          {FAQ_CONTACT.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Page>
  )
}
