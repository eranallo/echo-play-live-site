'use client'
import Link from 'next/link'
export default function ErrorPage({ reset }) {
  return (
    <main className="shell page-intro">
      <p className="eyebrow">Something went wrong</p>
      <h1>One more try.</h1>
      <p className="intro-copy">We couldn’t load this page. Please try again.</p>
      <div className="button-row" style={{ marginTop: 30 }}>
        <button className="button" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="text-link">
          Back to the music →
        </Link>
      </div>
    </main>
  )
}
