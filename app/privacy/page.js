import { pageMetadata } from '@/lib/public/seo.mjs'
import { Page, Intro } from '@/components/SiteParts'
import { newsletterForm, validNewsletterForm } from '@/lib/public/newsletter-config.mjs'
import MeasurementChoices from '@/components/MeasurementChoices'
export const metadata = pageMetadata({"title": "Privacy", "description": "How Echo Play Live handles booking inquiries, fan email signup, video playback and website measurement.", "path": "/privacy"})
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
          provide. Resend delivers your inquiry to eranallo@echoplay.live, and we use our Google
          Workspace email to review it and respond. New website booking inquiries are not saved
          in Airtable. Sending an inquiry does not confirm a booking or subscribe you to email updates.
        </p>
        {validNewsletterForm(newsletterForm) && (
          <>
            <h2 className="section-title" style={{ marginTop: 45 }}>
              Email updates
            </h2>
            <p>
              When you choose to subscribe, your email address and any band preferences or city you
              provide go to Mailchimp to manage Echo Play Live updates. Follow the confirmation
              steps shown by Mailchimp. You can unsubscribe using the link in our emails. Sending a
              booking inquiry does not subscribe you to the mailing list.
            </p>
          </>
        )}
        <h2 className="section-title" style={{ marginTop: 45 }}>Show photos & videos</h2>
        <p>When you upload photos or videos, the files go to a private show folder in Google Drive that our team and the band can access. We keep a submission record in Airtable, including any name, email or credit you provide and your permission choices. We use Vercel to securely track upload progress and limit misuse. A recovery code saved in your browser lets you resume an interrupted submission for up to three days.</p>
        <p>Permission to repost is optional and separate from sending us a file. Uploading does not subscribe you to email updates, and your file names, contact details and upload links are not included in the measurement events we send. Contact us below about a submission or a change to your permission.</p>
        <h2 className="section-title" style={{ marginTop: 45 }}>
          Website services
        </h2>
        <p>
          This website is hosted by Vercel and uses Vercel Analytics and Speed Insights to
          understand visits and website performance without analytics cookies. If you allow optional cookies,
          configured Google Analytics, Meta and TikTok tools help measure visits, ticket-link clicks,
          press downloads and booking inquiries accepted by our email service. These tools may store cookies or device identifiers.
          Booking-form contents are not included in the measurement events we send. A ticket click does not
          tell us whether you bought a ticket, and a newsletter submission does not confirm a subscription.
        </p>
        <p>Learn <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">how Google uses information from sites that use its services</a>.</p>
        <MeasurementChoices />
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
        <h2 className="section-title" style={{ marginTop: 45 }}>Song votes and suggestions</h2>
        <p>Song voting uses a random identifier saved in your browser to remember up to three choices per band. We store a hashed version with your picks in private website storage. The public chart shows song titles and aggregate vote counts, never names, email addresses or browser identifiers. Voting does not subscribe you to email updates. Clearing browser storage removes your ability to change earlier picks from that browser.</p>
        <p>New-song suggestions are separate and are kept in Airtable for the band to review. If you choose to provide a name, email or note, those details stay out of the public chart. Contact Evan to ask about removing information you submitted.</p>
        <h2 className="section-title" style={{ marginTop: 45 }}>Performance videos</h2>
        <p>Our performance players connect to YouTube only after you press play. YouTube handles playback and may collect information under Google’s privacy policy.</p>
      </section>
    </Page>
  )
}
