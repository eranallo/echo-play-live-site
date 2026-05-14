// Phase 17: Per-band press one-pager PDF generator.
//
// GET /api/press/[slug] returns a US-Letter PDF with the band's name,
// tagline, era + genres, bio, key stats, booking email, and EPL footer.
// Generated on the fly with pdf-lib so any band-page copy edit flows
// through to the press kit automatically.
//
// Runtime: Node (pdf-lib uses Node APIs and is heavier than Edge allows).
// Cache: 24 hours on the CDN — band copy changes rarely.

import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } from 'pdf-lib'
import { getBand } from '@/lib/bands'
import fs from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'
export const revalidate = 86400 // 24 hours

// ── Layout constants (US Letter, points) ───────────────────────────
const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 50
const COL_W = PAGE_W - MARGIN * 2

// ── Colors ─────────────────────────────────────────────────────────
const C_BG = rgb(0.031, 0.031, 0.031)     // #080808 — EPL background
const C_TEXT = rgb(1, 1, 1)               // white
const C_DIM = rgb(0.7, 0.7, 0.7)          // soft gray
const C_GOLD = rgb(0.831, 0.627, 0.090)   // #D4A017 — brand gold

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return rgb(((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255)
}

// Phase 25: Load a band hero image and embed it into the PDF.
// Accepts both local /public paths (e.g. "/bands/jambi/hero.jpg") and remote
// URLs (e.g. Vercel Blob URLs still used by The Dick Beldings). Returns the
// embedded PDFImage or null when the load fails (page still renders, just
// without a banner).
async function loadBandHero(pdf, heroPath) {
  if (!heroPath) return null
  try {
    let bytes
    if (/^https?:\/\//i.test(heroPath)) {
      const res = await fetch(heroPath, { cache: 'no-store' })
      if (!res.ok) return null
      bytes = new Uint8Array(await res.arrayBuffer())
    } else {
      // Local path under /public — resolve from the deploy's working dir.
      const full = path.join(process.cwd(), 'public', heroPath.replace(/^\//, ''))
      bytes = await fs.readFile(full)
    }
    // Most band photos are JPG; fall back to PNG if needed.
    try { return await pdf.embedJpg(bytes) } catch {}
    try { return await pdf.embedPng(bytes) } catch {}
    return null
  } catch {
    return null
  }
}

// Phase 25: Draw an image to "cover" a target rect (scaled to fill, cropped to
// the box). pdf-lib doesn't expose a higher-level clip API, so we push a
// clipping path with raw PDF operators around the drawImage call.
function drawCoveredImage(page, image, x, y, w, h) {
  if (!image) return
  const scale = Math.max(w / image.width, h / image.height)
  const drawW = image.width * scale
  const drawH = image.height * scale
  const drawX = x - (drawW - w) / 2
  const drawY = y - (drawH - h) / 2

  page.pushOperators(
    pushGraphicsState(),
    rectangle(x, y, w, h),
    clip(),
    endPath(),
  )
  page.drawImage(image, { x: drawX, y: drawY, width: drawW, height: drawH })
  page.pushOperators(popGraphicsState())
}

// Fetch Bebas Neue once per cold start; cached per Vercel instance.
async function loadBebasNeue() {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const css = await cssRes.text()
    const m = css.match(/src:\s*url\(([^)]+)\)\s*format/)
    if (!m) return null
    const fontRes = await fetch(m[1])
    return await fontRes.arrayBuffer()
  } catch {
    return null
  }
}

// Word-wrap helper — returns array of lines that fit within `maxWidth`.
function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const tentative = line ? `${line} ${word}` : word
    const width = font.widthOfTextAtSize(tentative, size)
    if (width <= maxWidth) {
      line = tentative
    } else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

// Render text in chip style ("Era · Genre" pills).
function drawChip(page, text, x, y, font, opts) {
  const size = opts.size || 9
  const padX = 8
  const padY = 5
  const textWidth = font.widthOfTextAtSize(text, size)
  const chipWidth = textWidth + padX * 2
  const chipHeight = size + padY * 2

  page.drawRectangle({
    x,
    y: y - padY,
    width: chipWidth,
    height: chipHeight,
    color: opts.bg,
    borderColor: opts.border,
    borderWidth: 0.75,
  })
  page.drawText(text, {
    x: x + padX,
    y: y + 2,
    size,
    font,
    color: opts.color,
  })
  return chipWidth + 8 // returns advance distance (chip width + gap)
}

export async function GET(request, { params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) {
    return NextResponse.json({ error: 'Band not found' }, { status: 404 })
  }

  // ── Document setup ────────────────────────────────────────────
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${band.name} — Echo Play Live Press Kit`)
  pdf.setAuthor('Echo Play Live')
  pdf.setSubject(`Press one-pager for ${band.name}`)
  pdf.setCreator('echoplay.live')

  // Standard fonts (built into pdf-lib).
  const helv = await pdf.embedFont(StandardFonts.Helvetica)
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const helvObl = await pdf.embedFont(StandardFonts.HelveticaOblique)

  // Bebas Neue — optional, falls back to Helvetica Bold.
  let display = helvBold
  const bebasBytes = await loadBebasNeue()
  if (bebasBytes) {
    try {
      display = await pdf.embedFont(bebasBytes, { subset: true })
    } catch {}
  }

  const accent = band.color ? hexToRgb(band.color) : C_GOLD

  const page = pdf.addPage([PAGE_W, PAGE_H])

  // ── Background ────────────────────────────────────────────────
  page.drawRectangle({
    x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C_BG,
  })

  // ── Top gold accent bar ───────────────────────────────────────
  page.drawRectangle({
    x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: C_GOLD,
  })

  // ── Hero banner (Phase 25) ────────────────────────────────────
  // Full-width band photo immediately under the gold accent bar. Replaces the
  // empty white space at the top of the previous layout. Falls back to a flat
  // dark block when the image fails to load so the rest of the layout still
  // anchors correctly.
  const BANNER_H = 160
  const BANNER_TOP = PAGE_H - 6                    // 786
  const BANNER_BOTTOM = BANNER_TOP - BANNER_H      // 626

  const heroImage = await loadBandHero(pdf, band.heroPhoto)
  if (heroImage) {
    drawCoveredImage(page, heroImage, 0, BANNER_BOTTOM, PAGE_W, BANNER_H)
  } else {
    page.drawRectangle({
      x: 0, y: BANNER_BOTTOM, width: PAGE_W, height: BANNER_H,
      color: rgb(0.09, 0.09, 0.09),
    })
  }
  // Thin accent rule under the banner for separation from the body.
  page.drawRectangle({
    x: 0, y: BANNER_BOTTOM - 1, width: PAGE_W, height: 1, color: accent,
  })

  // Dark scrim along the top of the banner so the EPL/right labels stay legible
  // regardless of which photo is loaded.
  page.drawRectangle({
    x: 0, y: BANNER_TOP - 28, width: PAGE_W, height: 28,
    color: rgb(0, 0, 0), opacity: 0.5,
  })

  // ── Header: EPL wordmark + section label (overlaid on banner) ─
  const headerY = BANNER_TOP - 20
  page.drawText('ECHO PLAY LIVE', {
    x: MARGIN, y: headerY, size: 11, font: display, color: C_GOLD,
    characterSpacing: 2,
  })
  const rightLabel = 'PRESS ONE-PAGER'
  const rightLabelWidth = display.widthOfTextAtSize(rightLabel, 11) + (rightLabel.length - 1) * 2
  page.drawText(rightLabel, {
    x: PAGE_W - MARGIN - rightLabelWidth, y: headerY,
    size: 11, font: display, color: rgb(0.95, 0.95, 0.95), characterSpacing: 2,
  })

  // ── Band name (display, large) — sits just below banner ──────
  let cursorY = BANNER_BOTTOM - 38
  // Auto-scale band name so very long names (e.g. "The Dick Beldings") still
  // fit. Starting size dropped from 64→48 to make room for the new banner.
  let nameSize = 48
  while (display.widthOfTextAtSize(band.name.toUpperCase(), nameSize) > COL_W && nameSize > 28) {
    nameSize -= 2
  }
  page.drawText(band.name.toUpperCase(), {
    x: MARGIN, y: cursorY, size: nameSize, font: display, color: C_TEXT,
    characterSpacing: 1,
  })

  // ── Tagline ───────────────────────────────────────────────────
  if (band.tagline) {
    cursorY -= 28
    page.drawText(band.tagline, {
      x: MARGIN, y: cursorY, size: 14, font: helvObl, color: accent,
    })
  }

  // ── Accent dot + Era / Genre chips ────────────────────────────
  cursorY -= 28
  let chipX = MARGIN
  // Era chip — accent fill
  if (band.era) {
    const advance = drawChip(page, band.era.toUpperCase(), chipX, cursorY, helvBold, {
      size: 8,
      bg: accent,
      border: accent,
      color: C_BG,
    })
    chipX += advance
  }
  // Genre chips — outline. Skip any genre that exactly matches the era
  // to avoid e.g. "Progressive Metal" appearing twice on Jambi.
  const eraNormalized = (band.era || '').trim().toLowerCase()
  for (const g of band.genre || []) {
    if (g.trim().toLowerCase() === eraNormalized) continue
    const advance = drawChip(page, g.toUpperCase(), chipX, cursorY, helvBold, {
      size: 8,
      bg: rgb(0, 0, 0),
      border: rgb(0.35, 0.35, 0.35),
      color: C_TEXT,
    })
    chipX += advance
    if (chipX > PAGE_W - MARGIN - 60) break // avoid overflow
  }

  // ── Bio paragraph ─────────────────────────────────────────────
  cursorY -= 30
  // Section label
  page.drawText('ABOUT', {
    x: MARGIN, y: cursorY, size: 9, font: helvBold, color: C_GOLD,
    characterSpacing: 2,
  })
  // Underline
  page.drawRectangle({
    x: MARGIN, y: cursorY - 6, width: 24, height: 1, color: C_GOLD,
  })
  cursorY -= 20

  // The bottom of the page uses fixed anchor points rather than flowing
  // from the cursor — this guarantees the booking box and footer never
  // overlap stats regardless of how long the bio runs.
  const FOOTER_Y = MARGIN          // baseline for footer text
  const FOOTER_RULE_Y = FOOTER_Y + 16
  const BOOKING_H = 70
  const BOOKING_Y = FOOTER_RULE_Y + 24            // bottom of booking box
  const STATS_LABEL_Y = BOOKING_Y + BOOKING_H + 22 // y-baseline of small label
  const STATS_VALUE_Y = STATS_LABEL_Y + 18        // y-baseline of big value
  const STATS_RULE_Y = STATS_VALUE_Y + 24         // divider line above stats
  const BIO_BOTTOM_Y = STATS_RULE_Y + 16          // bio can't go below this

  // Bio paragraph (wrap until BIO_BOTTOM_Y).
  const bioLines = wrapText(band.description, helv, 10.5, COL_W)
  for (const line of bioLines) {
    if (cursorY < BIO_BOTTOM_Y) break
    page.drawText(line, {
      x: MARGIN, y: cursorY, size: 10.5, font: helv, color: rgb(0.88, 0.88, 0.88),
    })
    cursorY -= 15
  }

  // ── Recent milestones (fills mid-page space when bio is short) ───
  // Pulls the last 3 entries from band.history so the press kit always
  // shows tangible recent wins (venues, milestones, residencies).
  const milestones = (band.history || []).slice(-3).reverse()
  if (milestones.length && cursorY > BIO_BOTTOM_Y + 80) {
    cursorY -= 20
    page.drawText('RECENT MILESTONES', {
      x: MARGIN, y: cursorY, size: 9, font: helvBold, color: C_GOLD, characterSpacing: 2,
    })
    page.drawRectangle({
      x: MARGIN, y: cursorY - 6, width: 24, height: 1, color: C_GOLD,
    })
    cursorY -= 20

    for (const m of milestones) {
      if (cursorY < BIO_BOTTOM_Y + 14) break
      // Year/label badge column
      const yearText = String(m.year || '').toUpperCase()
      page.drawText(yearText, {
        x: MARGIN, y: cursorY, size: 9, font: helvBold, color: accent,
        characterSpacing: 1.5,
      })
      // Title to the right of the year column
      const titleX = MARGIN + 100
      const titleLines = wrapText(String(m.label || ''), helvBold, 11, COL_W - 100)
      let lineY = cursorY
      for (const tl of titleLines.slice(0, 1)) {
        page.drawText(tl, {
          x: titleX, y: lineY, size: 11, font: helvBold, color: C_TEXT,
        })
        lineY -= 13
      }
      cursorY -= 22
    }
  }

  // ── Stats row ─────────────────────────────────────────────────
  page.drawRectangle({
    x: MARGIN, y: STATS_RULE_Y, width: COL_W, height: 1, color: rgb(0.2, 0.2, 0.2),
  })

  const stats = (band.stats || []).slice(0, 4)
  if (stats.length) {
    const colW = COL_W / stats.length
    const colPad = 8
    stats.forEach((s, i) => {
      const cx = MARGIN + colW * i
      const value = String(s.value || '')
      // Auto-scale value font so it never spills into the next column.
      let valueSize = 18
      while (
        display.widthOfTextAtSize(value, valueSize) > colW - colPad &&
        valueSize > 9
      ) {
        valueSize -= 1
      }
      page.drawText(value, {
        x: cx, y: STATS_VALUE_Y, size: valueSize, font: display, color: accent,
        characterSpacing: 0.5,
      })
      page.drawText(String(s.label || '').toUpperCase(), {
        x: cx, y: STATS_LABEL_Y, size: 7.5, font: helvBold, color: C_DIM,
        characterSpacing: 1.5,
      })
    })
  }

  // ── Booking block ─────────────────────────────────────────────
  page.drawRectangle({
    x: MARGIN, y: BOOKING_Y, width: COL_W, height: BOOKING_H,
    color: rgb(0.06, 0.06, 0.06),
    borderColor: accent, borderWidth: 1,
  })
  page.drawText('BOOKING', {
    x: MARGIN + 16, y: BOOKING_Y + BOOKING_H - 22, size: 9, font: helvBold,
    color: accent, characterSpacing: 2,
  })
  page.drawText(band.bookingEmail || 'booking@echoplay.live', {
    x: MARGIN + 16, y: BOOKING_Y + BOOKING_H - 46, size: 16, font: display,
    color: C_TEXT, characterSpacing: 0.5,
  })
  page.drawText('Echo Play Live booking · Dallas-Fort Worth, TX', {
    x: MARGIN + 16, y: BOOKING_Y + 12, size: 8, font: helv, color: C_DIM,
  })

  // ── Footer ────────────────────────────────────────────────────
  page.drawRectangle({
    x: MARGIN, y: FOOTER_RULE_Y, width: COL_W, height: 1, color: rgb(0.2, 0.2, 0.2),
  })
  page.drawText('echoplay.live', {
    x: MARGIN, y: FOOTER_Y - 6, size: 9, font: helvBold, color: C_DIM,
    characterSpacing: 1,
  })
  const url = `echoplay.live/bands/${band.slug}`
  const urlWidth = helv.widthOfTextAtSize(url, 9)
  page.drawText(url, {
    x: PAGE_W - MARGIN - urlWidth, y: FOOTER_Y - 6, size: 9, font: helv, color: C_DIM,
  })

  // ── Serialize + respond ───────────────────────────────────────
  const bytes = await pdf.save()
  const filename = `EPL-${(band.shortName || band.slug).replace(/\s+/g, '-')}-Press-Kit.pdf`

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
