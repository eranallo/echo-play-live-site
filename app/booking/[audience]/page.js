import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Page, Intro } from '@/components/SiteParts'
import FanReviews from '@/components/FanReviews'
import { bookingPages, bandFits } from '@/lib/public/booking-pages.mjs'
import { pageMetadata } from '@/lib/public/seo.mjs'

export const dynamicParams = false
export const generateStaticParams = () => Object.keys(bookingPages).map(audience => ({ audience }))
export async function generateMetadata({ params }) {
  const { audience } = await params
  const page = bookingPages[audience]
  return page ? pageMetadata({ title: page.title, description: page.description, path: `/booking/${audience}` }) : {}
}
export default async function BuyerPage({ params }) {
  const { audience } = await params
  const page = bookingPages[audience]
  if (!page) notFound()
  return <Page>
    <Intro eyebrow={page.eyebrow} title={page.headline}><p>{page.intro}</p></Intro>
    <section className="shell section-bottom">
      <div className="button-row">{page.eventTypes.map(([label, type]) => <Link key={type} href={`/contact?event=${encodeURIComponent(type)}`} className="button">Plan a {label.toLowerCase()} ↗</Link>)}</div>
    </section>
    <section className="shell section-bottom">
      <p className="eyebrow">Four bands. Four different nights.</p>
      <h2 className="section-title">Find your sound.</h2>
      <div className="buyer-band-grid">{bandFits.map(([slug, name, sound, fit]) => <article key={slug} className="buyer-band-card">
        <p className="eyebrow">{sound}</p><h3>{name}</h3><p>{fit}</p>
        <div className="inline-links"><Link href={`/bands/${slug}`}>Meet the band ↗</Link><Link href={`/press/${slug}`}>Band kit ↗</Link></div>
      </article>)}</div>
    </section>
    <section className="shell section-bottom">
      <p className="eyebrow">Booking with Echo Play Live</p><h2 className="section-title">Here’s how we get started.</h2>
      <div className="kit-planning-grid">{page.steps.map(([title, body], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      <p className="form-note">Availability, pricing and production are confirmed for your event. Sending an inquiry doesn’t reserve a date.</p>
    </section>
    <FanReviews />
    <section className="shell section-bottom buyer-close"><h2 className="section-title">Want to see us first?</h2><p>Catch an announced show, watch the live clips on our band pages or send us a few questions.</p><div className="button-row"><Link className="button" href="/shows">Find a show ↗</Link><Link className="text-link" href="/contact">Talk booking ↗</Link></div></section>
  </Page>
}
