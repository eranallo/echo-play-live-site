import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import {
  SHOW_DOCUMENT_KINDS,
  documentKind,
  documentReadiness,
  formatDocumentCurrency,
  formatDocumentDateTime,
  formatDocumentTime,
} from './showDocumentModel.mjs'

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 44
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
const GOLD = rgb(0.831, 0.627, 0.09)
const GOLD_SOFT = rgb(0.95, 0.91, 0.76)
const INK = rgb(0.07, 0.07, 0.07)
const TEXT = rgb(0.16, 0.16, 0.16)
const MUTED = rgb(0.42, 0.42, 0.42)
const LINE = rgb(0.84, 0.84, 0.82)
const PAPER = rgb(0.985, 0.982, 0.969)
const WHITE = rgb(1, 1, 1)

const PACKAGE_ORDER = [
  'venue-advance',
  'artist-call-sheet',
  'run-of-show',
  'private-event-schedule',
  'production-notes',
  'contact-sheet',
  'settlement-summary',
  'show-recap',
]

function safeText(value, fallback = '') {
  const text = value === null || value === undefined || value === '' ? fallback : String(value)
  return text
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2022/g, '/')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ')
}

function readableTextWidth(text, font, size, wordSpacing = 0.8) {
  const words = safeText(text).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 0
  const base = words.reduce((total, word) => total + font.widthOfTextAtSize(word, size), 0)
  const space = font.widthOfTextAtSize(' ', size) + wordSpacing
  return base + (Math.max(0, words.length - 1) * space)
}

function drawReadableText(page, text, options) {
  const words = safeText(text).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return
  const wordSpacing = options.wordSpacing ?? 0.8
  const space = options.font.widthOfTextAtSize(' ', options.size) + wordSpacing
  let x = options.x
  for (const word of words) {
    page.drawText(word, { ...options, x })
    x += options.font.widthOfTextAtSize(word, options.size) + space
  }
}

function wrapText(text, font, size, maxWidth) {
  const paragraphs = safeText(text, 'Not provided.').split(/\r?\n/)
  const lines = []

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('')
      continue
    }
    const words = paragraph.trim().split(/\s+/)
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (readableTextWidth(candidate, font, size) <= maxWidth) {
        line = candidate
        continue
      }
      if (line) lines.push(line)
      if (readableTextWidth(word, font, size) <= maxWidth) {
        line = word
        continue
      }
      let chunk = ''
      for (const character of word) {
        const next = `${chunk}${character}`
        if (readableTextWidth(next, font, size) > maxWidth && chunk) {
          lines.push(chunk)
          chunk = character
        } else {
          chunk = next
        }
      }
      line = chunk
    }
    if (line) lines.push(line)
  }

  return lines.length ? lines : ['Not provided.']
}

function value(value, fallback = 'Not provided') {
  return value === null || value === undefined || value === '' ? fallback : String(value)
}

async function createContext({ model, logoBytes, generatedAt }) {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const logo = logoBytes ? await pdf.embedPng(logoBytes).catch(() => null) : null

  pdf.setTitle(`${model.title} - Echo Play Live Show Documents`)
  pdf.setAuthor('Echo Play Live')
  pdf.setCreator('Echo Play Live Command Center')
  pdf.setProducer('Echo Play Live')
  pdf.setSubject('Show advancement and operations documents')
  pdf.setKeywords(['Echo Play Live', 'show advancement', 'run of show', 'call sheet', 'settlement'])
  pdf.setCreationDate(generatedAt)
  pdf.setModificationDate(generatedAt)

  return {
    pdf,
    regular,
    bold,
    logo,
    model,
    generatedAt,
    page: null,
    y: 0,
    currentTitle: '',
    currentSubtitle: '',
  }
}

function drawFooterBase(ctx) {
  const { page, regular, model } = ctx
  page.drawLine({
    start: { x: MARGIN, y: 28 },
    end: { x: PAGE_WIDTH - MARGIN, y: 28 },
    thickness: 0.6,
    color: LINE,
  })
  drawReadableText(page, `Show file updated ${model.sourceUpdatedLabel} / Version ${model.version}`, {
    x: MARGIN,
    y: 16,
    size: 7,
    font: regular,
    color: MUTED,
  })
}

function addPage(ctx, title = ctx.currentTitle, subtitle = ctx.currentSubtitle, continuation = false) {
  const page = ctx.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  ctx.page = page
  ctx.currentTitle = title
  ctx.currentSubtitle = subtitle

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: PAPER })
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 118, width: PAGE_WIDTH, height: 118, color: INK })
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 122, width: PAGE_WIDTH, height: 4, color: GOLD })

  if (ctx.logo) {
    const ratio = ctx.logo.width / ctx.logo.height
    const height = 30
    page.drawImage(ctx.logo, {
      x: MARGIN,
      y: PAGE_HEIGHT - 52,
      height,
      width: height * ratio,
    })
  } else {
    drawReadableText(page, 'ECHO PLAY LIVE', {
      x: MARGIN,
      y: PAGE_HEIGHT - 42,
      size: 11,
      font: ctx.bold,
      color: GOLD,
    })
  }

  drawReadableText(page, continuation ? `${title} / Continued` : title, {
    x: MARGIN,
    y: PAGE_HEIGHT - 83,
    size: 22,
    font: ctx.bold,
    color: WHITE,
  })
  drawReadableText(page, subtitle, {
    x: MARGIN,
    y: PAGE_HEIGHT - 103,
    size: 9,
    font: ctx.regular,
    color: rgb(0.77, 0.77, 0.77),
  })

  ctx.y = PAGE_HEIGHT - 150
  drawFooterBase(ctx)
  return page
}

function ensureSpace(ctx, needed) {
  if (ctx.y - needed >= 42) return
  addPage(ctx, ctx.currentTitle, ctx.currentSubtitle, true)
}

function drawDocumentMeta(ctx, kindId) {
  const readiness = documentReadiness(ctx.model, kindId)
  const generated = formatDocumentDateTime(ctx.generatedAt.toISOString())
  const status = readiness.ready
    ? 'Source data complete'
    : `${readiness.issues.filter(item => item.severity !== 'Helpful').length} required item(s) open`

  drawFactGrid(ctx, [
    ['Show', ctx.model.title],
    ['Date', ctx.model.dateLabel],
    ['Generated', generated],
    ['Document status', status],
  ])

  if (readiness.issues.length) {
    const labels = readiness.issues
      .map(item => `${item.label}${item.severity === 'Helpful' ? ' (helpful)' : ''}`)
      .join(' / ')
    drawNotice(ctx, `Open source items: ${labels}`)
  }
}

function drawSectionTitle(ctx, title, helper = '') {
  ensureSpace(ctx, helper ? 52 : 36)
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - 24,
    width: CONTENT_WIDTH,
    height: 24,
    color: INK,
  })
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - 24,
    width: 5,
    height: 24,
    color: GOLD,
  })
  drawReadableText(ctx.page, title.toUpperCase(), {
    x: MARGIN + 14,
    y: ctx.y - 16,
    size: 9,
    font: ctx.bold,
    color: WHITE,
  })
  ctx.y -= 34
  if (helper) {
    drawParagraph(ctx, helper, { size: 8, color: MUTED, gapAfter: 10 })
  }
}

function drawNotice(ctx, text) {
  const lines = wrapText(text, ctx.regular, 8.5, CONTENT_WIDTH - 24)
  const height = 20 + (lines.length * 11)
  ensureSpace(ctx, height + 8)
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - height,
    width: CONTENT_WIDTH,
    height,
    color: GOLD_SOFT,
    borderColor: GOLD,
    borderWidth: 0.7,
  })
  lines.forEach((line, index) => {
    drawReadableText(ctx.page, line, {
      x: MARGIN + 12,
      y: ctx.y - 17 - (index * 11),
      size: 8.5,
      font: ctx.regular,
      color: TEXT,
    })
  })
  ctx.y -= height + 10
}

function drawParagraph(ctx, text, options = {}) {
  const size = options.size || 9
  const lineHeight = options.lineHeight || size * 1.45
  const maxWidth = options.maxWidth || CONTENT_WIDTH
  const lines = wrapText(text, options.font || ctx.regular, size, maxWidth)
  const height = lines.length * lineHeight
  ensureSpace(ctx, height + (options.gapAfter || 12))
  lines.forEach((line, index) => {
    drawReadableText(ctx.page, line || ' ', {
      x: options.x || MARGIN,
      y: ctx.y - size - (index * lineHeight),
      size,
      font: options.font || ctx.regular,
      color: options.color || TEXT,
    })
  })
  ctx.y -= height + (options.gapAfter ?? 12)
}

function drawFactGrid(ctx, items) {
  const gap = 8
  const width = (CONTENT_WIDTH - gap) / 2

  for (let index = 0; index < items.length; index += 2) {
    const pair = items.slice(index, index + 2)
    const cards = pair.map(([label, fact]) => {
      const lines = wrapText(value(fact), ctx.bold, 9.5, width - 20)
      return { label, lines }
    })
    const height = Math.max(48, ...cards.map(card => 27 + (card.lines.length * 12)))
    ensureSpace(ctx, height + 8)
    cards.forEach((card, cardIndex) => {
      const x = MARGIN + (cardIndex * (width + gap))
      ctx.page.drawRectangle({
        x,
        y: ctx.y - height,
        width,
        height,
        color: WHITE,
        borderColor: LINE,
        borderWidth: 0.6,
      })
      drawReadableText(ctx.page, card.label.toUpperCase(), {
        x: x + 10,
        y: ctx.y - 14,
        size: 7,
        font: ctx.bold,
        color: GOLD,
      })
      card.lines.forEach((line, lineIndex) => {
        drawReadableText(ctx.page, line, {
          x: x + 10,
          y: ctx.y - 30 - (lineIndex * 12),
          size: 9.5,
          font: ctx.bold,
          color: TEXT,
        })
      })
    })
    ctx.y -= height + gap
  }
}

function drawRows(ctx, rows, options = {}) {
  const labelWidth = options.labelWidth || 144
  for (const [label, rowValue] of rows) {
    const lines = wrapText(value(rowValue), ctx.regular, 8.5, CONTENT_WIDTH - labelWidth - 24)
    const height = Math.max(30, 14 + (lines.length * 11))
    ensureSpace(ctx, height + 2)
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - height,
      width: CONTENT_WIDTH,
      height,
      color: WHITE,
      borderColor: LINE,
      borderWidth: 0.5,
    })
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - height,
      width: labelWidth,
      height,
      color: rgb(0.95, 0.95, 0.93),
    })
    drawReadableText(ctx.page, label.toUpperCase(), {
      x: MARGIN + 10,
      y: ctx.y - 19,
      size: 7.2,
      font: ctx.bold,
      color: MUTED,
    })
    lines.forEach((line, lineIndex) => {
      drawReadableText(ctx.page, line, {
        x: MARGIN + labelWidth + 10,
        y: ctx.y - 18 - (lineIndex * 11),
        size: 8.5,
        font: ctx.regular,
        color: TEXT,
      })
    })
    ctx.y -= height + 2
  }
  ctx.y -= 8
}

function drawContacts(ctx, contacts) {
  if (!contacts.length) {
    drawNotice(ctx, 'No contacts are currently listed in Airtable.')
    return
  }
  for (const contact of contacts) {
    const details = [
      contact.role,
      contact.company,
      contact.phone,
      contact.email,
    ].filter(Boolean).join(' / ')
    const lines = wrapText(details || 'Contact details not provided.', ctx.regular, 8.2, CONTENT_WIDTH - 178)
    const height = Math.max(40, 17 + (lines.length * 11))
    ensureSpace(ctx, height + 5)
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - height,
      width: CONTENT_WIDTH,
      height,
      color: WHITE,
      borderColor: LINE,
      borderWidth: 0.5,
    })
    drawReadableText(ctx.page, (contact.type || 'Contact').toUpperCase(), {
      x: MARGIN + 10,
      y: ctx.y - 13,
      size: 6.8,
      font: ctx.bold,
      color: GOLD,
    })
    drawReadableText(ctx.page, contact.name || 'Name TBD', {
      x: MARGIN + 10,
      y: ctx.y - 28,
      size: 9,
      font: ctx.bold,
      color: TEXT,
    })
    lines.forEach((line, index) => {
      drawReadableText(ctx.page, line, {
        x: MARGIN + 168,
        y: ctx.y - 18 - (index * 11),
        size: 8.2,
        font: ctx.regular,
        color: TEXT,
      })
    })
    ctx.y -= height + 5
  }
}

function drawTimeline(ctx, segments) {
  if (!segments.length) {
    drawNotice(ctx, 'No Run of Show segments are currently linked to this show.')
    return
  }

  for (const segment of segments) {
    const timing = [
      segment.startLabel || 'Time TBD',
      segment.endLabel && segment.endLabel !== 'Time TBD' ? `to ${segment.endLabel}` : '',
      segment.durationLabel ? `(${segment.durationLabel})` : '',
    ].filter(Boolean).join(' ')
    const details = wrapText(segment.details || 'No segment notes.', ctx.regular, 8.2, CONTENT_WIDTH - 154)
    const height = Math.max(50, 25 + (details.length * 10.5))
    ensureSpace(ctx, height + 5)
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - height,
      width: CONTENT_WIDTH,
      height,
      color: WHITE,
      borderColor: LINE,
      borderWidth: 0.6,
    })
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - height,
      width: 8,
      height,
      color: GOLD,
    })
    drawReadableText(ctx.page, timing, {
      x: MARGIN + 18,
      y: ctx.y - 17,
      size: 8,
      font: ctx.bold,
      color: GOLD,
    })
    drawReadableText(ctx.page, segment.name || 'Untitled segment', {
      x: MARGIN + 18,
      y: ctx.y - 34,
      size: 9.5,
      font: ctx.bold,
      color: TEXT,
    })
    drawReadableText(ctx.page, (segment.type || 'Custom').toUpperCase(), {
      x: MARGIN + 154,
      y: ctx.y - 16,
      size: 6.8,
      font: ctx.bold,
      color: MUTED,
    })
    details.forEach((line, index) => {
      drawReadableText(ctx.page, line, {
        x: MARGIN + 154,
        y: ctx.y - 31 - (index * 10.5),
        size: 8.2,
        font: ctx.regular,
        color: TEXT,
      })
    })
    ctx.y -= height + 5
  }
}

function commonSchedule(model) {
  return [
    ['Trailer load-in', formatDocumentTime(model.schedule.trailerLoadIn)],
    ['Venue load-in', formatDocumentTime(model.schedule.loadIn)],
    ['Soundcheck', formatDocumentTime(model.schedule.soundCheck)],
    ['Doors', formatDocumentTime(model.schedule.doors)],
    ['Show start', formatDocumentTime(model.schedule.start)],
    ['Show end / curfew', formatDocumentTime(model.schedule.end)],
  ]
}

function showSubtitle(model) {
  return `${model.bandNames.join(' + ') || 'Artist TBD'} / ${model.venue.name} / ${model.dateLabel}`
}

function beginDocument(ctx, kindId) {
  const kind = documentKind(kindId)
  addPage(ctx, kind.label, showSubtitle(ctx.model))
  drawDocumentMeta(ctx, kindId)
}

function renderRunOfShow(ctx) {
  drawSectionTitle(ctx, 'Master schedule', 'Airtable is the source of truth for this timeline.')
  drawRows(ctx, commonSchedule(ctx.model))
  drawSectionTitle(ctx, 'Timeline')
  drawTimeline(ctx, ctx.model.segments)
  drawSectionTitle(ctx, 'Show notes')
  drawRows(ctx, [
    ['Production', ctx.model.notes.production],
    ['Show notes', ctx.model.notes.show],
  ])
}

function renderVenueAdvance(ctx) {
  drawSectionTitle(ctx, 'Show overview')
  drawFactGrid(ctx, [
    ['Artists', ctx.model.bandNames.join(' + ')],
    ['Venue', ctx.model.venue.name],
    ['Address', ctx.model.venue.address],
    ['Deal type', ctx.model.finance.dealType],
    ['Age policy', ctx.model.production.ageRestriction],
    ['Indoor / outdoor', ctx.model.production.indoorOutdoor],
  ])
  drawSectionTitle(ctx, 'Schedule')
  drawRows(ctx, commonSchedule(ctx.model))
  drawSectionTitle(ctx, 'Venue contact')
  drawContacts(ctx, [ctx.model.contacts.venue].filter(contact => contact.name || contact.phone || contact.email))
  drawSectionTitle(ctx, 'Access + room')
  drawRows(ctx, [
    ['Parking / load-in', ctx.model.venue.parkingNotes],
    ['Stage', ctx.model.venue.stageSpecs],
    ['Green room', ctx.model.venue.greenRoom ? 'Available' : 'Not confirmed'],
    ['Capacity', ctx.model.venue.capacity],
    ['Merch', ctx.model.notes.merch],
  ])
  drawSectionTitle(ctx, 'Advance notes')
  drawParagraph(ctx, ctx.model.notes.advance)
}

function renderArtistCallSheet(ctx) {
  drawSectionTitle(ctx, 'Call times')
  drawRows(ctx, commonSchedule(ctx.model))
  drawSectionTitle(ctx, 'Location')
  drawFactGrid(ctx, [
    ['Venue', ctx.model.venue.name],
    ['Address', ctx.model.venue.address],
    ['Parking / access', ctx.model.venue.parkingNotes],
    ['Drive folder', ctx.model.production.driveFolder],
  ])
  drawSectionTitle(ctx, 'Assigned team')
  drawContacts(ctx, ctx.model.contacts.people)
  drawSectionTitle(ctx, 'Show-day instructions')
  drawRows(ctx, [
    ['Production', ctx.model.notes.production],
    ['Sound', ctx.model.notes.sound],
    ['Merch', ctx.model.notes.merch],
    ['General', ctx.model.notes.show],
  ])
  if (ctx.model.setlists.length) {
    drawSectionTitle(ctx, 'Setlists')
    drawRows(ctx, ctx.model.setlists.map(setlist => [
      setlist.name,
      [setlist.duration, setlist.notes].filter(Boolean).join(' / '),
    ]))
  }
}

function renderPrivateEvent(ctx) {
  drawSectionTitle(ctx, 'Event overview')
  drawFactGrid(ctx, [
    ['Client / event contact', ctx.model.contacts.event.name],
    ['Contact phone', ctx.model.contacts.event.phone],
    ['Contact email', ctx.model.contacts.event.email],
    ['Venue', ctx.model.venue.name],
    ['Address', ctx.model.venue.address],
    ['Artists', ctx.model.bandNames.join(' + ')],
  ])
  drawSectionTitle(ctx, 'Event schedule', 'Ceremony, announcements, dinner, performances, breaks, and production moments appear in Airtable order.')
  drawTimeline(ctx, ctx.model.segments)
  drawSectionTitle(ctx, 'Client-facing notes')
  drawRows(ctx, [
    ['Advance notes', ctx.model.notes.advance],
    ['Show notes', ctx.model.notes.show],
  ])
}

function renderProduction(ctx) {
  drawSectionTitle(ctx, 'Production overview')
  drawFactGrid(ctx, [
    ['Sound provider', ctx.model.production.soundProvider],
    ['Sound engineer', ctx.model.production.soundEngineerNames.join(', ')],
    ['Indoor / outdoor', ctx.model.production.indoorOutdoor],
    ['Stage', ctx.model.venue.stageSpecs],
    ['House console', ctx.model.venue.houseConsole],
    ['FOH location', ctx.model.venue.fohLocation],
  ])
  drawSectionTitle(ctx, 'Venue system')
  drawRows(ctx, [
    ['PA system', ctx.model.venue.paSystem],
    ['Power drops', ctx.model.venue.powerDrops],
    ['Mic locker', ctx.model.venue.micLocker],
    ['Room / venue notes', ctx.model.venue.soundNotes],
  ])
  drawSectionTitle(ctx, 'Show-specific notes')
  drawRows(ctx, [
    ['Production', ctx.model.notes.production],
    ['Sound', ctx.model.notes.sound],
    ['Load-in / advance', ctx.model.notes.advance],
  ])
  drawSectionTitle(ctx, 'Production timeline')
  drawTimeline(ctx, ctx.model.segments.filter(segment => ['Production', 'Travel / Logistics'].includes(segment.type)))
}

function renderContactSheet(ctx) {
  drawSectionTitle(ctx, 'Primary contacts')
  drawContacts(ctx, [
    ctx.model.contacts.event,
    ctx.model.contacts.venue,
  ].filter(contact => contact.name || contact.phone || contact.email))
  drawSectionTitle(ctx, 'Artists + crew')
  drawContacts(ctx, ctx.model.contacts.people)
  drawSectionTitle(ctx, 'Location reference')
  drawRows(ctx, [
    ['Venue', ctx.model.venue.name],
    ['Address', ctx.model.venue.address],
    ['Parking / access', ctx.model.venue.parkingNotes],
  ])
}

function renderSettlement(ctx) {
  drawSectionTitle(ctx, 'Deal snapshot')
  drawFactGrid(ctx, [
    ['Deal type', ctx.model.finance.dealType],
    ['Ticket price', formatDocumentCurrency(ctx.model.finance.ticketPrice)],
    ['Performance rate', formatDocumentCurrency(ctx.model.finance.performanceRate)],
    ['Gross ticket revenue', formatDocumentCurrency(ctx.model.finance.grossTicketRevenue)],
    ['Actual attendance', ctx.model.outcome.actualAttendance],
    ['Merch revenue', formatDocumentCurrency(ctx.model.finance.merchRevenue)],
  ])
  drawSectionTitle(ctx, 'Expenses + payout')
  drawRows(ctx, [
    ['EPL management fee', formatDocumentCurrency(ctx.model.finance.eplFee)],
    ['Trailer', formatDocumentCurrency(ctx.model.finance.trailerCost)],
    ['Audio engineer', formatDocumentCurrency(ctx.model.finance.audioEngineerCost)],
    ['Social ads', formatDocumentCurrency(ctx.model.finance.socialAdsSpend)],
    ['Merch cost', formatDocumentCurrency(ctx.model.finance.merchCost)],
    ['Gas', formatDocumentCurrency(ctx.model.finance.gas)],
    ['Lodging', formatDocumentCurrency(ctx.model.finance.lodging)],
    ['Other expenses', formatDocumentCurrency(ctx.model.finance.otherExpenses)],
    ['Total expenses', formatDocumentCurrency(ctx.model.finance.totalExpenses)],
    ['Net income', formatDocumentCurrency(ctx.model.finance.netIncome)],
    ['Band payout', formatDocumentCurrency(ctx.model.finance.bandPayout)],
    ['Merch units sold', ctx.model.finance.merchUnits],
  ])
  drawSectionTitle(ctx, 'Settlement notes')
  drawParagraph(ctx, ctx.model.notes.settlement)
}

function renderShowRecap(ctx) {
  drawSectionTitle(ctx, 'Outcome')
  drawFactGrid(ctx, [
    ['Actual attendance', ctx.model.outcome.actualAttendance],
    ['Gross ticket revenue', formatDocumentCurrency(ctx.model.outcome.grossTicketRevenue)],
    ['Net income', formatDocumentCurrency(ctx.model.finance.netIncome)],
    ['Merch revenue', formatDocumentCurrency(ctx.model.finance.merchRevenue)],
    ['Merch units sold', ctx.model.finance.merchUnits],
    ['Lifecycle snapshot', 'Completed-show review'],
  ])
  drawSectionTitle(ctx, 'Show recap')
  drawParagraph(ctx, ctx.model.outcome.recap)
  drawSectionTitle(ctx, 'Lessons learned')
  drawParagraph(ctx, ctx.model.outcome.lessonsLearned)
  drawSectionTitle(ctx, 'Supporting notes')
  drawRows(ctx, [
    ['Show notes', ctx.model.notes.show],
    ['Production notes', ctx.model.notes.production],
    ['Settlement notes', ctx.model.notes.settlement],
  ])
}

function renderKind(ctx, kindId) {
  switch (kindId) {
    case 'run-of-show':
      return renderRunOfShow(ctx)
    case 'venue-advance':
      return renderVenueAdvance(ctx)
    case 'artist-call-sheet':
      return renderArtistCallSheet(ctx)
    case 'private-event-schedule':
      return renderPrivateEvent(ctx)
    case 'production-notes':
      return renderProduction(ctx)
    case 'contact-sheet':
      return renderContactSheet(ctx)
    case 'settlement-summary':
      return renderSettlement(ctx)
    case 'show-recap':
      return renderShowRecap(ctx)
    default:
      throw new Error('Unknown show document type.')
  }
}

function addPageNumbers(ctx) {
  const pages = ctx.pdf.getPages()
  pages.forEach((page, index) => {
    const label = `PAGE ${index + 1} OF ${pages.length}`
    drawReadableText(page, label, {
      x: PAGE_WIDTH - MARGIN - readableTextWidth(label, ctx.bold, 7),
      y: 16,
      size: 7,
      font: ctx.bold,
      color: MUTED,
    })
  })
}

export async function renderShowDocumentPdf({
  kindId,
  model,
  logoBytes = null,
  generatedAt = new Date(),
}) {
  if (!model?.id) throw new Error('A show document model is required.')
  if (!documentKind(kindId)) throw new Error('Unknown show document type.')

  const ctx = await createContext({ model, logoBytes, generatedAt })
  const kinds = kindId === 'document-package' ? PACKAGE_ORDER : [kindId]

  for (const childKind of kinds) {
    beginDocument(ctx, childKind)
    renderKind(ctx, childKind)
  }

  addPageNumbers(ctx)
  return ctx.pdf.save()
}

export function showDocumentManifest(model) {
  return SHOW_DOCUMENT_KINDS.map(kind => ({
    ...kind,
    ...documentReadiness(model, kind.id),
  }))
}
