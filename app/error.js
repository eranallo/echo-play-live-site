'use client'
import Link from 'next/link'
import { Page, Intro } from '@/components/SiteParts'

export default function ErrorPage({ reset }) {
  return <Page section="help">
    <Intro eyebrow="Something went wrong" title="One more try.">
      <p>We couldn’t load this page. Please try again.</p>
    </Intro>
    <section className="shell section-bottom">
      <div className="scene-section-bar portal-module-heading"><h2>Get back to the music</h2></div>
      <div className="button-row">
        <button className="button" onClick={reset}>Try again</button>
        <Link href="/" className="text-link">Back to the music →</Link>
      </div>
    </section>
  </Page>
}
