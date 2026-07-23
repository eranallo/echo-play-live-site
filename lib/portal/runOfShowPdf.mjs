import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 44
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_Y = 24
const PDF_SUBJECT = 'Showday run of show'

const COLOR = {
  background: rgb(0.031, 0.031, 0.031),
  surface: rgb(0.072, 0.072, 0.072),
  surfaceRaised: rgb(0.098, 0.098, 0.098),
  line: rgb(0.20, 0.20, 0.20),
  text: rgb(0.98, 0.98, 0.98),
  muted: rgb(0.68, 0.68, 0.68),
  dim: rgb(0.46, 0.46, 0.46),
  gold: rgb(0.831, 0.627, 0.090),
  black: rgb(0.031, 0.031, 0.031),
}

const TYPE_COLORS = {
  Performance: COLOR.gold,
  Break: rgb(0.49, 0.54, 0.65),
  Production: COLOR.gold,
  'Guest / Support': rgb(0.69, 0.42, 0.87),
  'Wedding / Program': rgb(0.84, 0.56, 0.62),
  'Travel / Logistics': rgb(0.33, 0.65, 0.63),
  Other: rgb(0.54, 0.54, 0.54),
}

function safeText(value) {
  return String(value || '')
    .replace(/[–—]/g, '-')
    .replace(/•/g, '/')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
}

function wrapText(text, font, size, maxWidth) {
  const paragraphs = safeText(text).split(/\r?\n/)
  const lines = []

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }

    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate
        continue
      }

      if (line) lines.push(line)
      line = word
    }
    if (line) lines.push(line)
  }

  return lines
}

function drawLetterSpacedText(page, text, options) {
  const value = safeText(text)
  let x = options.x
  for (const character of value) {
    page.drawText(character, { ...options, x })
    x += options.font.widthOfTextAtSize(character, options.size) + (options.spacing || 0)
  }
}

function drawLogo(page, logo, x, y, size) {
  if (!logo) return
  const scale = Math.min(size / logo.width, size / logo.height)
  const width = logo.width * scale
  const height = logo.height * scale
  page.drawImage(logo, {
    x: x + (size - width) / 2,
    y: y + (size - height) / 2,
    width,
    height,
  })
}

function drawPageBase(page) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLOR.background,
  })
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 6,
    width: PAGE_WIDTH,
    height: 6,
    color: COLOR.gold,
  })
}

function drawSummaryCell(page, label, value, x, y, width, fonts) {
  page.drawRectangle({
    x,
    y,
    width,
    height: 54,
    color: COLOR.surfaceRaised,
    borderColor: COLOR.line,
    borderWidth: 0.75,
  })
  drawLetterSpacedText(page, label.toUpperCase(), {
    x: x + 8,
    y: y + 34,
    size: 6.5,
    font: fonts.bold,
    color: COLOR.gold,
    spacing: 0.6,
  })

  const displayValue = safeText(value || 'TBD')
  let size = 10
  while (fonts.bold.widthOfTextAtSize(displayValue, size) > width - 16 && size > 7) size -= 0.5
  page.drawText(displayValue, {
    x: x + 8,
    y: y + 14,
    size,
    font: fonts.bold,
    color: COLOR.text,
  })
}

function drawFirstHeader(page, show, fonts, logo) {
  drawLogo(page, logo, MARGIN, 690, 48)
  drawLetterSpacedText(page, 'ECHO PLAY LIVE', {
    x: MARGIN + 62,
    y: 730,
    size: 8,
    font: fonts.bold,
    color: COLOR.gold,
    spacing: 1.2,
  })
  page.drawText('RUN OF SHOW', {
    x: MARGIN + 62,
    y: 698,
    size: 27,
    font: fonts.display,
    color: COLOR.text,
  })

  const venueLines = wrapText(show.venueName || 'Venue TBD', fonts.display, 28, CONTENT_WIDTH)
  let y = 650
  for (const line of venueLines.slice(0, 2)) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: 28,
      font: fonts.display,
      color: COLOR.text,
    })
    y -= 31
  }

  const bands = safeText(show.bandNames?.join(' / ') || 'Band TBD')
  page.drawText(bands, {
    x: MARGIN,
    y: y - 2,
    size: 11,
    font: fonts.bold,
    color: COLOR.gold,
  })
  page.drawText(safeText(show.dateLabel || 'Date TBD'), {
    x: MARGIN,
    y: y - 21,
    size: 9.5,
    font: fonts.regular,
    color: COLOR.muted,
  })

  const summaryY = y - 92
  const gap = 5
  const cellWidth = (CONTENT_WIDTH - gap * 4) / 5
  const summary = [
    ['Trailer', show.trailerLoadIn],
    ['Venue', show.loadIn],
    ['Sound', show.soundCheck],
    ['Start', show.start],
    ['End', show.end],
  ]

  summary.forEach(([label, value], index) => {
    drawSummaryCell(
      page,
      label,
      value,
      MARGIN + index * (cellWidth + gap),
      summaryY,
      cellWidth,
      fonts
    )
  })

  drawLetterSpacedText(page, 'TIMELINE', {
    x: MARGIN,
    y: summaryY - 29,
    size: 8,
    font: fonts.bold,
    color: COLOR.muted,
    spacing: 1.3,
  })
  page.drawRectangle({
    x: MARGIN + 76,
    y: summaryY - 26,
    width: CONTENT_WIDTH - 76,
    height: 0.75,
    color: COLOR.line,
  })

  return summaryY - 50
}

function drawContinuationHeader(page, show, fonts, logo) {
  drawLogo(page, logo, MARGIN, 716, 28)
  drawLetterSpacedText(page, 'ECHO PLAY LIVE / RUN OF SHOW', {
    x: MARGIN + 40,
    y: 740,
    size: 7,
    font: fonts.bold,
    color: COLOR.gold,
    spacing: 0.8,
  })
  page.drawText(safeText(`${show.venueName || 'Venue TBD'} - ${show.dateLabel || 'Date TBD'}`), {
    x: MARGIN + 40,
    y: 720,
    size: 10,
    font: fonts.bold,
    color: COLOR.text,
  })
  page.drawRectangle({
    x: MARGIN,
    y: 704,
    width: CONTENT_WIDTH,
    height: 0.75,
    color: COLOR.line,
  })
  return 682
}

function splitSegment(segment, fonts) {
  const nameLines = wrapText(segment.name, fonts.display, 15, 370)
  const detailLines = wrapText(segment.details, fonts.regular, 9, 370)
  const chunks = []
  const maxDetailsPerChunk = 24

  if (!detailLines.length) {
    return [{ nameLines, detailLines: [], continued: false }]
  }

  for (let index = 0; index < detailLines.length; index += maxDetailsPerChunk) {
    chunks.push({
      nameLines,
      detailLines: detailLines.slice(index, index + maxDetailsPerChunk),
      continued: index > 0,
    })
  }
  return chunks
}

function segmentHeight(chunk) {
  const nameHeight = Math.max(chunk.nameLines.length, 1) * 18
  const detailsHeight = chunk.detailLines.length ? chunk.detailLines.length * 12 + 7 : 0
  return Math.max(76, 24 + nameHeight + detailsHeight + 15)
}

function drawSegment(page, segment, chunk, topY, fonts) {
  const height = segmentHeight(chunk)
  const bottomY = topY - height
  const accent = TYPE_COLORS[segment.type] || TYPE_COLORS.Other

  page.drawRectangle({
    x: MARGIN,
    y: bottomY,
    width: CONTENT_WIDTH,
    height,
    color: COLOR.surface,
    borderColor: COLOR.line,
    borderWidth: 0.75,
  })
  page.drawRectangle({
    x: MARGIN,
    y: bottomY,
    width: 3,
    height,
    color: accent,
  })

  page.drawText(safeText(segment.startLabel || 'TBD'), {
    x: MARGIN + 13,
    y: topY - 25,
    size: 10,
    font: fonts.bold,
    color: COLOR.text,
  })
  if (segment.endLabel) {
    page.drawText(safeText(`to ${segment.endLabel}`), {
      x: MARGIN + 13,
      y: topY - 40,
      size: 7.5,
      font: fonts.regular,
      color: COLOR.muted,
    })
  }

  page.drawRectangle({
    x: MARGIN + 92,
    y: bottomY + 12,
    width: 0.75,
    height: height - 24,
    color: COLOR.line,
  })

  const contentX = MARGIN + 108
  const typeLabel = safeText(segment.type || 'Other').toUpperCase()
  page.drawText(typeLabel, {
    x: contentX,
    y: topY - 20,
    size: 7,
    font: fonts.bold,
    color: accent,
  })
  if (segment.durationLabel) {
    const duration = safeText(segment.durationLabel).toUpperCase()
    const durationWidth = fonts.bold.widthOfTextAtSize(duration, 7)
    page.drawText(duration, {
      x: MARGIN + CONTENT_WIDTH - durationWidth - 13,
      y: topY - 20,
      size: 7,
      font: fonts.display,
      color: COLOR.dim,
    })
  }

  let y = topY - 42
  chunk.nameLines.forEach((line, index) => {
    page.drawText(safeText(`${line}${chunk.continued && index === 0 ? ' (continued)' : ''}`), {
      x: contentX,
      y,
      size: 15,
      font: fonts.bold,
      color: COLOR.text,
    })
    y -= 18
  })

  if (chunk.detailLines.length) {
    y -= 3
    for (const line of chunk.detailLines) {
      page.drawText(safeText(line), {
        x: contentX,
        y,
        size: 9,
        font: fonts.regular,
        color: COLOR.muted,
      })
      y -= 12
    }
  } else if (!segment.startLabel) {
    page.drawText('Start time has not been entered yet.', {
      x: contentX,
      y: y - 2,
      size: 8,
      font: fonts.bold,
      color: COLOR.gold,
    })
  }

  return bottomY - 10
}

function drawEmptyState(page, topY, fonts) {
  page.drawRectangle({
    x: MARGIN,
    y: topY - 112,
    width: CONTENT_WIDTH,
    height: 112,
    color: COLOR.surface,
    borderColor: COLOR.line,
    borderWidth: 0.75,
  })
  page.drawText('RUN OF SHOW IS BEING BUILT', {
    x: MARGIN + 18,
    y: topY - 40,
    size: 16,
    font: fonts.display,
    color: COLOR.text,
  })
  page.drawText('Detailed segments will appear automatically as they are added to Airtable.', {
    x: MARGIN + 18,
    y: topY - 64,
    size: 9,
    font: fonts.regular,
    color: COLOR.muted,
  })
}

function drawFooters(pdf, fonts) {
  const pages = pdf.getPages()
  pages.forEach((page, index) => {
    page.drawRectangle({
      x: MARGIN,
      y: FOOTER_Y + 15,
      width: CONTENT_WIDTH,
      height: 0.75,
      color: COLOR.line,
    })
    drawLetterSpacedText(page, 'ECHO PLAY LIVE', {
      x: MARGIN,
      y: FOOTER_Y,
      size: 6.5,
      font: fonts.bold,
      color: COLOR.gold,
      spacing: 0.8,
    })
    const pageLabel = `PAGE ${index + 1} OF ${pages.length}`
    const width = fonts.bold.widthOfTextAtSize(pageLabel, 6.5)
    page.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN - width,
      y: FOOTER_Y,
      size: 6.5,
      font: fonts.bold,
      color: COLOR.dim,
    })
  })
}

export async function renderRunOfShowPdf({ show, segments = [], logoBytes }) {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${safeText(show.venueName || 'Show')} - Run of Show`)
  pdf.setAuthor('Echo Play Live')
  pdf.setSubject(PDF_SUBJECT)
  pdf.setCreator('echoplay.live')

  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Courier),
    bold: await pdf.embedFont(StandardFonts.CourierBold),
    display: await pdf.embedFont(StandardFonts.HelveticaBold),
  }

  let logo = null
  if (logoBytes) {
    try {
      logo = await pdf.embedPng(logoBytes)
    } catch {
      logo = null
    }
  }

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawPageBase(page)
  let cursorY = drawFirstHeader(page, show, fonts, logo)

  if (!segments.length) {
    drawEmptyState(page, cursorY, fonts)
  } else {
    for (const segment of segments) {
      const chunks = splitSegment(segment, fonts)
      for (const chunk of chunks) {
        const height = segmentHeight(chunk)
        if (cursorY - height < FOOTER_Y + 34) {
          page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
          drawPageBase(page)
          cursorY = drawContinuationHeader(page, show, fonts, logo)
        }
        cursorY = drawSegment(page, segment, chunk, cursorY, fonts)
      }
    }
  }

  drawFooters(pdf, fonts)
  return pdf.save()
}
