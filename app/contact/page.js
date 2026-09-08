import { Page, Intro } from '@/components/SiteParts'
import BookingForm from '@/components/BookingForm'
import { bandsList } from '@/lib/bands'
import { FAQ_CONTACT } from '@/lib/faqs'
export default async function ContactPage({ searchParams }) {
  const query = await searchParams
  const selected = bandsList.find((b) => b.slug === query?.band)?.name || ''
  const selectedEvent = ['Bar / Venue Show', 'Festival', 'Private Event', 'Corporate Event'].includes(query?.event) ? query.event : ''
  return (
    <Page>
      <Intro
        eyebrow="Booking inquiries"
        title={
          <>
            Let’s book
            <br />a show.
          </>
        }
      >
        <p>
          Have a date in mind? Tell us about your event.
          <br />
          We’ll check availability and work through the details with you.
        </p>
      </Intro>
      <section className="shell booking-layout">
        <BookingForm
          initialBand={selected}
          initialEvent={selectedEvent}
          bands={bandsList.map((b) => ({ name: b.name, slug: b.slug, email: b.bookingEmail }))}
        />
        <aside className="booking-aside">
          <h2>Not sure which band?</h2>
          <p>
            Tell us about your audience and the music you want to hear. We can help you choose a
            band for your venue, festival, private party or corporate event.
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
        <h2 className="section-title">Common booking questions</h2>
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
