// Phase 32 — Server-side data fetchers for QR landing pages.
//
// Architecture: lib/bands.js is the canonical source for band metadata
// (slug, name, color, hero photo, booking email). Airtable BANDS extended
// fields layered on top: when Tagline/Bio/Hero Image/colors etc. are present
// in Airtable, they override; when absent, lib/bands.js basics ensure the
// page always renders.
//
// Related-table fetches (LINKS, MEDIA HIGHLIGHTS) follow the standard "filter
// by band Airtable ID" pattern. Both tables are optional — empty arrays
// render empty sections.

import { TABLES, tableUrl } from '@/lib/airtable'
import { getBand, bandsList } from '@/lib/bands'

// Airtable table IDs added in Phase 31 (not in TABLES export yet):
const LINKS_TABLE_ID = 'tblVtQc1KQkByU6nq'
const MEDIA_HIGHLIGHTS_TABLE_ID = 'tbld3YL7f3MIzRBmt'
const HUB_CONTENT_TABLE_ID = 'tbl8wCZu6Z6p2is0X'

// BANDS extended field IDs (Phase 31 schema):
const BAND_FIELDS = {
  Slug: 'fldawGQgr8rDWDCob',
  Tagline: 'fldqNQ24SObtedtq8',
  Bio: 'fldmys1KNmLdnxgeS',
  HeroImage: 'fldAO2VsXVgScFJj2',
  HeroVideoURL: 'fld7uqNVz0312Y564',
  PrimaryColorHex: 'fldtTlgYwyRSbKk24',
  SecondaryColorHex: 'fldM8Qz0NDhGyc9GX',
  BookingEmail: 'fldeMrdUpRWnK36iz',
  DisplayOrder: 'fldjeMSjGNU9KCG3t',
}

const LINK_FIELDS = {
  Label: 'fldP7kuIUVVoNqESN',
  Band: 'fldM3AoTcY61pgeQ6',
  URL: 'fld5DpZpBBxIMW1Iu',
  Icon: 'fldYM8nXGD6nBeO1a',
  Order: 'fldXceNNZlFK4Zf4f',
  Active: 'fldSu7IeD0eska9ow',
}

const MEDIA_FIELDS = {
  Title: 'flds3Z2v0k3tzC4c2',
  Band: 'fldH4xPrCq3Vgj6v9',
  Type: 'flds2KWfAtK4Z5BZh',
  File: 'fldbE1wB0pZRqA8iF',
  URL: 'fldGD7QwjNjxun6P8',
  Caption: 'fldpegoDHjfExwx8p',
  Order: 'fldlLW7Ta93qGBSFs',
  Active: 'fldMQUF3MNk9X9nVb',
}

const HUB_FIELDS = {
  HeroHeadline: 'fldQN9WlpP9rEtwzN',
  HeroSubhead: 'fldPQQdBLJsqS25ea',
  About: 'fldms4REAcovXZJB3',
  Services: 'fldx0LDvFCclpiQlJ',
  BookingEmail: 'fldepzrdgo6Rfckex',
  HeroImage: 'fldWnrQJMjFZVN8pN',
}

// ── Helpers ────────────────────────────────────────────────────────

function authedFetch(url, opts = {}) {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) return Promise.resolve(null)
  return fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    next: { revalidate: 1800, ...(opts.next || {}) },
  })
}

function pickAttachmentUrl(attachField) {
  if (!Array.isArray(attachField) || attachField.length === 0) return null
  return attachField[0]?.url || null
}

// ── Band landing data ──────────────────────────────────────────────

/**
 * Load all data for /[slug] band QR landing page.
 *
 * @param {string} slug - the URL slug (e.g., 'the-dick-beldings')
 * @returns {Promise<Object|null>} merged landing data, or null if slug doesn't match a band
 */
export async function getBandLandingData(slug) {
  // Canonical lookup from lib/bands.js
  const band = getBand(slug)
  if (!band) return null

  // Defaults from lib/bands.js — always present
  const result = {
    slug: band.slug,
    name: band.name,
    shortName: band.shortName,
    tagline: band.tagline || null,
    bio: null,                       // Airtable only — lib/bands.js doesn't have a "bio" field
    heroImage: band.heroPhoto || null,
    heroVideoUrl: null,
    primaryColor: band.color,
    secondaryColor: band.colorDark || band.color,
    bookingEmail: band.bookingEmail,
    links: [],
    media: [],
  }

  // Layer Airtable BANDS extended fields if present
  try {
    const url = `${tableUrl(TABLES.BANDS)}/${band.airtableId}?returnFieldsByFieldId=true`
    const res = await authedFetch(url)
    if (res && res.ok) {
      const data = await res.json()
      const f = data.fields || {}
      if (f[BAND_FIELDS.Tagline]) result.tagline = f[BAND_FIELDS.Tagline]
      if (f[BAND_FIELDS.Bio]) result.bio = f[BAND_FIELDS.Bio]
      const airtableHero = pickAttachmentUrl(f[BAND_FIELDS.HeroImage])
      if (airtableHero) result.heroImage = airtableHero
      if (f[BAND_FIELDS.HeroVideoURL]) result.heroVideoUrl = f[BAND_FIELDS.HeroVideoURL]
      if (f[BAND_FIELDS.PrimaryColorHex]) result.primaryColor = f[BAND_FIELDS.PrimaryColorHex]
      if (f[BAND_FIELDS.SecondaryColorHex]) result.secondaryColor = f[BAND_FIELDS.SecondaryColorHex]
      if (f[BAND_FIELDS.BookingEmail]) result.bookingEmail = f[BAND_FIELDS.BookingEmail]
    }
  } catch (err) {
    console.warn('[qr-landing] BANDS extended fetch failed:', err?.message)
  }

  // Fetch related Links
  try {
    const params = new URLSearchParams()
    params.append('filterByFormula', `AND({${LINK_FIELDS.Active}}=TRUE(), FIND("${band.airtableId}", ARRAYJOIN({${LINK_FIELDS.Band}}))>0)`)
    params.append('sort[0][field]', LINK_FIELDS.Order)
    params.append('sort[0][direction]', 'asc')
    params.append('returnFieldsByFieldId', 'true')
    const res = await authedFetch(`${tableUrl(LINKS_TABLE_ID)}?${params}`)
    if (res && res.ok) {
      const data = await res.json()
      result.links = (data.records || []).map(r => ({
        id: r.id,
        label: r.fields?.[LINK_FIELDS.Label] || '',
        url: r.fields?.[LINK_FIELDS.URL] || '',
        icon: r.fields?.[LINK_FIELDS.Icon]?.name || null,
        order: r.fields?.[LINK_FIELDS.Order] || 0,
      })).filter(l => l.label && l.url)
    }
  } catch (err) {
    console.warn('[qr-landing] LINKS fetch failed:', err?.message)
  }

  // Fetch related Media Highlights
  try {
    const params = new URLSearchParams()
    params.append('filterByFormula', `AND({${MEDIA_FIELDS.Active}}=TRUE(), FIND("${band.airtableId}", ARRAYJOIN({${MEDIA_FIELDS.Band}}))>0)`)
    params.append('sort[0][field]', MEDIA_FIELDS.Order)
    params.append('sort[0][direction]', 'asc')
    params.append('returnFieldsByFieldId', 'true')
    const res = await authedFetch(`${tableUrl(MEDIA_HIGHLIGHTS_TABLE_ID)}?${params}`)
    if (res && res.ok) {
      const data = await res.json()
      result.media = (data.records || []).map(r => ({
        id: r.id,
        title: r.fields?.[MEDIA_FIELDS.Title] || '',
        type: r.fields?.[MEDIA_FIELDS.Type]?.name || 'Photo',
        fileUrl: pickAttachmentUrl(r.fields?.[MEDIA_FIELDS.File]),
        url: r.fields?.[MEDIA_FIELDS.URL] || null,
        caption: r.fields?.[MEDIA_FIELDS.Caption] || '',
        order: r.fields?.[MEDIA_FIELDS.Order] || 0,
      })).filter(m => m.fileUrl || m.url)
    }
  } catch (err) {
    console.warn('[qr-landing] MEDIA HIGHLIGHTS fetch failed:', err?.message)
  }

  return result
}

// ── EPL Hub data ───────────────────────────────────────────────────

export async function getHubData() {
  const result = {
    heroHeadline: 'Echo Play Live',
    heroSubhead: 'Tribute & cover band management — DFW',
    about: null,
    services: null,
    bookingEmail: 'eranallo@echoplay.live',
    heroImage: null,
    bands: bandsList.map(b => ({
      slug: b.slug,
      name: b.name,
      shortName: b.shortName,
      tagline: b.tagline,
      color: b.color,
      heroImage: b.heroPhoto || null,
    })),
  }

  // Try EPL HUB CONTENT (single-row table)
  try {
    const res = await authedFetch(`${tableUrl(HUB_CONTENT_TABLE_ID)}?maxRecords=1&returnFieldsByFieldId=true`)
    if (res && res.ok) {
      const data = await res.json()
      const f = data.records?.[0]?.fields || {}
      if (f[HUB_FIELDS.HeroHeadline]) result.heroHeadline = f[HUB_FIELDS.HeroHeadline]
      if (f[HUB_FIELDS.HeroSubhead]) result.heroSubhead = f[HUB_FIELDS.HeroSubhead]
      if (f[HUB_FIELDS.About]) result.about = f[HUB_FIELDS.About]
      if (f[HUB_FIELDS.Services]) result.services = f[HUB_FIELDS.Services]
      if (f[HUB_FIELDS.BookingEmail]) result.bookingEmail = f[HUB_FIELDS.BookingEmail]
      const hero = pickAttachmentUrl(f[HUB_FIELDS.HeroImage])
      if (hero) result.heroImage = hero
    }
  } catch (err) {
    console.warn('[qr-landing] HUB CONTENT fetch failed:', err?.message)
  }

  return result
}

// ── Inquiry-source mapping ─────────────────────────────────────────

/**
 * Map a band slug to the Airtable Inquiry Source choice for QR-landing forms.
 * Used by /api/inquiry when the form posts with { inquirySource: 'qr-landing', bandSlug }.
 */
export function inquirySourceLabelFor(slug) {
  const map = {
    'the-dick-beldings': 'TDB QR landing',
    'elite': 'Elite QR landing',
    'jambi': 'Jambi QR landing',
    'so-long-goodnight': 'SLGN QR landing',
    'hub': 'EPL Hub QR landing',
  }
  return map[slug] || 'Other'
}
