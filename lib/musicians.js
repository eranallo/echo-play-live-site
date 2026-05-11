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
      // 60s window — short enough that Airtable edits (new role, new photo,
      // new bio) show up on next page load, long enough to dedupe bursts of
      // requests during builds. Bump back up later if needed.
      next: { revalidate: 60 },
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

  // Photo: take first attachment from the curated website-photo field.
  // Per Evan 2026-05-09: the app's "Photo" field includes non-professional
  // shots that shouldn't go on the public site, so we read from a separate
  // curated field. Tolerant of common naming variations (singular/plural,
  // capitalization) so a small Airtable rename doesn't break the page.
  const photoField =
    f['Website Photos'] || f['Website Photo'] ||
    f['website photos'] || f['website photo'] ||
    null
  const photoArr = Array.isArray(photoField) ? photoField : []
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

  // Per-band roles: Evan added `Role - {Band Name}` singleSelect fields on
  // MEMBERS (one per band). Build a slug-keyed lookup so band pages can show
  // exactly what each person plays in THAT band. Members may not have a role
  // set for every band they're in — empty cells are skipped.
  const roleByBand = {}
  for (const slug of Object.keys(bands)) {
    const bandName = bands[slug].name
    const raw = f[`Role - ${bandName}`]
    const role = roleToString(raw)
    if (role) roleByBand[slug] = role
  }

  // Generic instruments: prefer the union of per-band roles (the truthful
  // current state). Fall back to the legacy MEMBERS.Instruments multi-select
  // when no per-band roles are filled in yet.
  const roleUnion = uniqInOrder(
    Object.values(roleByBand)
      .flatMap(r => r.split(/\s*\/\s*|\s*,\s*/))
      .map(s => s.trim())
      .filter(Boolean)
  )
  const instrumentsRaw = Array.isArray(f['Instruments']) ? f['Instruments'] : []
  const fallbackInstruments = instrumentsRaw
    .map(i => (typeof i === 'string' ? i : i?.name))
    .filter(Boolean)
  const instruments = roleUnion.length > 0 ? roleUnion : fallbackInstruments

  return {
    id: rec.id,
    slug: memberSlug(name),
    name,
    instruments,           // union (or fallback)
    roleByBand,            // per-band role lookup, slug-keyed
    bands: primaryBands,
    subBands,              // sub-for (not double-counted) — internal only
    photo,
    bioShort: (f['Bio Short'] || '').trim() || null,
    bioLong: (f['Bio Long'] || '').trim() || null,
    experienceLevel: f['Experience Level']?.name || f['Experience Level'] || null,
  }
}

// Airtable singleSelect fields come back as either a string or {id, name, color}
// depending on the API call shape. Normalize to a clean string.
function roleToString(raw) {
  if (!raw) return null
  if (typeof raw === 'string') return raw.trim() || null
  if (typeof raw === 'object' && raw.name) return String(raw.name).trim() || null
  return null
}

function uniqInOrder(arr) {
  const seen = new Set()
  const out = []
  for (const v of arr) {
    if (!seen.has(v)) { seen.add(v); out.push(v) }
  }
  return out
}
