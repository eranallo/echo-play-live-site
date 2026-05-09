// Server-side helper for the /musicians roster page.
//
// Fetches active members from the Airtable MEMBERS table at build/request time
// and normalizes them into a shape the route pages can render.
//
// Phase 10A foundation. Bio fields (Bio Short / Bio Long) are read if present
// but are not yet on the table; pages handle their absence gracefully and the
// content will start showing once Evan adds the fields.
//
// Photo URLs returned by Airtable are signed and expire (typically a few hours).
// We use ISR with revalidate: 1800 (30 min) so the URLs stay fresh.

import { bands, bandNameToSlug } from '@/lib/bands'

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const MEMBERS_TABLE = 'tbliQzVzmfMfcNpjI'

// Map Airtable band record IDs to band slugs for fast lookup
const bandIdToSlug = Object.fromEntries(
  Object.values(bands).map(b => [b.airtableId, b.slug])
)

// Normalize a member name into a URL-safe slug.
// "Kevin Scott" → "kevin-scott", "Patrick McLemore" → "patrick-mclemore".
export function memberSlug(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip accents
    .replace(/['']/g, '')               // drop apostrophes (don't, o'connor)
    .replace(/[^a-z0-9]+/g, '-')       // any non-alphanum → dash
    .replace(/^-+|-+$/g, '')           // trim leading/trailing dashes
}

// Fetch all active members from Airtable.
// Returns [] on any error (so the page can render an empty state instead of crashing the build).
export async function getMusicians() {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) {
    console.warn('[musicians] AIRTABLE_API_TOKEN not set — returning empty roster')
    return []
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${MEMBERS_TABLE}?` +
    `filterByFormula=${encodeURIComponent('{Active}=1')}` +
    `&pageSize=100`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 1800 }, // 30 min
    })

    if (!res.ok) {
      const txt = await res.text()
      console.warn('[musicians] Airtable fetch failed:', res.status, txt)
      return []
    }

    const data = await res.json()
    const records = Array.isArray(data.records) ? data.records : []

    return records
      .map(rec => normalizeMember(rec))
      .filter(Boolean)
      // Sort: by primary band slug (so members of the same band cluster), then by name
      .sort((a, b) => {
        const aBand = a.bands[0]?.slug || 'zzz'
        const bBand = b.bands[0]?.slug || 'zzz'
        if (aBand !== bBand) return aBand.localeCompare(bBand)
        return a.name.localeCompare(b.name)
      })
  } catch (err) {
    console.warn('[musicians] fetch threw:', err?.message)
    return []
  }
}

// Convenience: find a member by slug.
export async function getMusician(slug) {
  const all = await getMusicians()
  return all.find(m => m.slug === slug) || null
}

// Convenience: list of slugs for generateStaticParams.
export async function getMusicianSlugs() {
  const all = await getMusicians()
  return all.map(m => ({ slug: m.slug }))
}

// Map an Airtable record to the shape the UI consumes.
function normalizeMember(rec) {
  const f = rec.fields || {}
  const name = (f['Member Name'] || '').trim()
  if (!name) return null

  const primaryBandIds = Array.isArray(f['Primary Bands']) ? f['Primary Bands'] : []
  const subBandIds = Array.isArray(f['Can Sub For']) ? f['Can Sub For'] : []

  // Map record IDs → band objects from lib/bands.js (filters out LimeWyre + others not on the site)
  const primaryBands = primaryBandIds
    .map(id => bandIdToSlug[id])
    .filter(Boolean)
    .map(slug => ({ slug, name: bands[slug].name, color: bands[slug].color, shortName: bands[slug].shortName }))

  const subBands = subBandIds
    .map(id => bandIdToSlug[id])
    .filter(Boolean)
    // Don't list a band as "sub for" if they're already a primary
    .filter(slug => !primaryBands.some(b => b.slug === slug))
    .map(slug => ({ slug, name: bands[slug].name, color: bands[slug].color, shortName: bands[slug].shortName }))

  // Photo: take first attachment if present
  const photoArr = Array.isArray(f['Photo']) ? f['Photo'] : []
  const photoRaw = photoArr[0]
  const photo = photoRaw
    ? {
        url: photoRaw.url,
        // Prefer "large" thumbnail when available — smaller bytes, longer-lived URL
        thumb: photoRaw.thumbnails?.large?.url || photoRaw.url,
        width: photoRaw.thumbnails?.large?.width || photoRaw.width,
        height: photoRaw.thumbnails?.large?.height || photoRaw.height,
      }
    : null

  // Instruments: multipleSelects → array of strings
  const instrumentsRaw = Array.isArray(f['Instruments']) ? f['Instruments'] : []
  const instruments = instrumentsRaw
    .map(i => (typeof i === 'string' ? i : i?.name))
    .filter(Boolean)

  return {
    id: rec.id,
    slug: memberSlug(name),
    name,
    instruments,
    bands: primaryBands,    // primary
    subBands,               // sub-for (not double-counted)
    photo,
    bioShort: (f['Bio Short'] || '').trim() || null,
    bioLong: (f['Bio Long'] || '').trim() || null,
    experienceLevel: f['Experience Level']?.name || f['Experience Level'] || null,
  }
}
