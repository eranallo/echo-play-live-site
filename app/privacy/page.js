import { Page, Intro } from '@/components/SiteParts'
export const metadata = {
  title: 'Privacy',
  alternates: { canonical: '/privacy' },
  description: 'How Echo Play Live uses booking inquiries and website information.',
}
export default function PrivacyPage() {
  return (
    <Page>
      <Intro eyebrow="Website information" title="Your privacy.">
        <p>How information is used on echoplay.live.</p>
      </Intro>
      <section className="shell section-bottom text-body" style={{ maxWidth: 800 }}>
        <h2 className="section-title">Booking inquiries</h2>
        <p>
          When you send an inquiry, we collect the name, email address, and event details you
          provide. We use those details to review your request and respond. Inquiries are stored in
          Airtable, which supports our booking workflow. Sending an inquiry does not confirm a
          booking.
        </p>
        <h2 className="section-title" style={{ marginTop: 45 }}>
          Website services
        </h2>
        <p>
          This website is hosted by Vercel and uses Vercel Analytics and Speed Insights to
          understand visits and website performance. When configured, Meta and TikTok measurement
          tools help measure page visits, ticket-link clicks, and saved booking inquiries.
          Booking-form contents are not included in the measurement events we send.
        </p>
        <h2 className="section-title" style={{ marginTop: 45 }}>
          Other websites
        </h2>
        <p>
          Ticket links, social profiles, music services, and podcast platforms take you to services
          with their own privacy practices. Song requests may collect information you choose to
          provide through that feature.
        </p>
        <h2 className="section-title" style={{ marginTop: 45 }}>
          Questions or requests
        </h2>
        <p>
          For questions about information you have shared with Echo Play Live, contact{' '}
          <a href="mailto:eranallo@echoplay.live" style={{ textDecoration: 'underline' }}>
            eranallo@echoplay.live
          </a>
          .
        </p>
      </section>
    </Page>
  )
}
