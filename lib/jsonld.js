// Phase 39 — JSON-LD schema helpers + server-side data fetchers for SEO
// structured data.
//
// Each schema type is built as a plain JS object. Callers pass the result to
// `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.
// (Or use the JsonLd component re-exported below for ergonomics.)
//
// Why server-side: structured data must be in the initial HTML response so
// Google's crawler sees it. Layouts and async pages render it at server time;
// client components inherit it from their server-side parent layout.

const SITE_URL = 'https://echoplay.live'

// ── Breadcrumb ──────────────────────────────────────────────────────
//
// Items shape: [{ name: 'Home', url: '/' }, { name: 'Bands', url: '/bands' }, ...]
// The last item is the current page (Google convention).
//
// Returns a BreadcrumbList schema object suitable for <script type="application/ld+json">.
export function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// ── FAQ ────────────────────────────────────────────────────────────
//
// qa shape: [{ q: 'How do I book?', a: 'Fill the form...' }, ...]
//
// Returns FAQPage schema. Note Google requires the answer text to ALSO appear
// visibly on the page — JSON-LD alone won't get the rich snippet unless the
// page actually displays the FAQ. So pages using this should render the same
// content in their visible HTML.
export function faqPage(qa) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

// ── Upcoming shows for /shows page Event JSON-LD ────────────────────
//
// Uses the same explicit-publication reader and projection as the show pages.
//
// On any error returns []. The shows page renders the JSON-LD only if there
// are events to include, so a fetch failure means no Event schema for that
// build cycle — graceful.
export async function getUpcomingShowsForJsonLd() {
  const { getPublicShows } = await import('./public/shows')
  const { publicShowToEventJsonLd } = await import('./public/shows-contract.mjs')
  const result = await getPublicShows()
  return result.ok ? result.shows.map(show => publicShowToEventJsonLd(show)) : []
}

// ── Convenience render component ───────────────────────────────────
//
// Usage:
//   <JsonLd data={breadcrumbList([...])} />
//
// Renders a single <script type="application/ld+json"> tag. Pass an array of
// data objects to render multiple scripts.
export function JsonLd({ data }) {
  if (!data) return null
  const items = Array.isArray(data) ? data : [data]
  return items.map((d, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
    />
  ))
}
