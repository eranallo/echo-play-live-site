import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PDFDocument,
  StandardFonts,
  PDFName,
  PDFString,
  PDFArray,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  rectangle,
  clip,
  endPath,
} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import QRCode from 'qrcode'
import { bandKits, KIT_EDITION, planningDetails } from '../lib/press/kit-content.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const W = 612,
  H = 792,
  M = 44,
  CW = W - M * 2
const color = (hex) =>
  rgb(
    ...hex
      .replace('#', '')
      .match(/../g)
      .map((x) => parseInt(x, 16) / 255),
  )
const ink = color('#111113'),
  paper = color('#F5F3EF'),
  gray = color('#656468'),
  white = rgb(1, 1, 1)
const ascii = (value) =>
  value.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...')

await mkdir(path.join(root, 'public/press/kits'), { recursive: true })
for (const kit of bandKits) {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  pdf.setTitle(`${kit.name} | Echo Play Live Band Kit`)
  pdf.setAuthor('Echo Play Live')
  pdf.setSubject(`${kit.label}. Band overview, photography and booking information.`)
  pdf.setCreator('Echo Play Live')
  pdf.setLanguage('en-US')
  pdf.setCreationDate(new Date('2026-09-07T00:00:00Z'))
  pdf.setModificationDate(new Date('2026-09-07T00:00:00Z'))
  // The supplied Gotham font prohibits subsetting. Embed it whole.
  const bold = await pdf.embedFont(await readFile(path.join(root, 'app/fonts/Gotham-Bold.ttf')), {
    subset: false,
  })
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const accent = color(kit.color)
  const assets = path.join(root, 'public/press/bands', kit.slug)
  const [logo, cover, detail, stage, sealWhite, sealBlack, qr] = await Promise.all([
    pdf.embedPng(await readFile(path.join(assets, 'logo.png'))),
    pdf.embedJpg(await readFile(path.join(assets, 'cover.jpg'))),
    pdf.embedJpg(await readFile(path.join(assets, 'detail.jpg'))),
    pdf.embedJpg(await readFile(path.join(assets, 'stage.jpg'))),
    pdf.embedPng(await readFile(path.join(root, 'public/brand/epl-seal-white.png'))),
    pdf.embedPng(await readFile(path.join(root, 'public/brand/epl-seal-black.png'))),
    pdf.embedPng(
      await QRCode.toBuffer(`https://echoplay.live/press/${kit.slug}`, {
        type: 'png',
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
      }),
    ),
  ])
  const txt = (page, value, x, top, size = 11, font = regular, fill = ink) =>
    page.drawText(ascii(value), { x, y: H - top - size, size, font, color: fill })
  const line = (page, x, top, width, fill = accent) =>
    page.drawRectangle({ x, y: H - top - 1, width, height: 1, color: fill })
  function paragraph(
    page,
    value,
    x,
    top,
    width,
    size = 11.5,
    leading = 17,
    fill = ink,
    font = regular,
    maxBottom = 740,
  ) {
    let words = ascii(value).split(/\s+/),
      row = '',
      y = top
    for (const word of words) {
      const next = row ? row + ' ' + word : word
      if (font.widthOfTextAtSize(next, size) > width && row) {
        txt(page, row, x, y, size, font, fill)
        y += leading
        row = word
      } else row = next
    }
    if (row) {
      txt(page, row, x, y, size, font, fill)
      y += leading
    }
    if (y > maxBottom)
      throw new Error(`${kit.slug}: text exceeded its layout region (${y} > ${maxBottom})`)
    return y
  }
  function imageFit(page, img, x, top, width, height) {
    const scale = Math.min(width / img.width, height / img.height),
      w = img.width * scale,
      h = img.height * scale
    page.drawImage(img, {
      x: x + (width - w) / 2,
      y: H - top - h - (height - h) / 2,
      width: w,
      height: h,
    })
  }
  function imageCover(page, img, x, top, width, height, vertical = 0.5) {
    const scale = Math.max(width / img.width, height / img.height),
      w = img.width * scale,
      h = img.height * scale
    page.pushOperators(
      pushGraphicsState(),
      rectangle(x, H - top - height, width, height),
      clip(),
      endPath(),
    )
    page.drawImage(img, {
      x: x - (w - width) / 2,
      y: H - top - height - (h - height) * (1 - vertical),
      width: w,
      height: h,
    })
    page.pushOperators(popGraphicsState())
  }
  function link(page, label, url, x, top, size = 11, fill = ink) {
    txt(page, label, x, top, size, bold, fill)
    const width = bold.widthOfTextAtSize(ascii(label), size)
    const annot = pdf.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, H - top - size - 4, x + width, H - top + 4],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    })
    const ref = pdf.context.register(annot)
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray)
    if (annots) annots.push(ref)
    else page.node.set(PDFName.of('Annots'), pdf.context.obj([ref]))
  }
  function base(number, dark = false) {
    const page = pdf.addPage([W, H])
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: dark ? ink : paper })
    const fill = dark ? white : ink
    imageFit(page, dark ? sealWhite : sealBlack, M, 27, 26, 26)
    txt(page, 'ECHO PLAY LIVE', M + 36, 34, 8.5, bold, fill)
    const label = number === 1 ? 'BAND KIT / 2026' : kit.name.toUpperCase()
    const labelW = bold.widthOfTextAtSize(label, 8)
    txt(page, label, W - M - labelW, 35, 8, bold, fill)
    line(page, M, 747, CW, dark ? color('#37373A') : color('#D3D0CD'))
    link(
      page,
      'echoplay.live',
      `https://echoplay.live/press/${kit.slug}`,
      M,
      761,
      8,
      dark ? color('#BBBBBF') : gray,
    )
    txt(
      page,
      `${KIT_EDITION}  /  ${String(number).padStart(2, '0')}`,
      W - M - 119,
      761,
      8,
      regular,
      dark ? color('#BBBBBF') : gray,
    )
    return page
  }
  // 01: Identity and a single strong photographic field.
  const p1 = base(1, true)
  if (kit.logoStyle === 'badge') {
    imageFit(p1, logo, M, 83, 164, 164)
    txt(p1, 'THE DICK', 235, 105, 31, bold, white)
    txt(p1, 'BELDINGS', 235, 143, 31, bold, white)
    paragraph(
      p1,
      'Fort Worth, Texas / 90s rock',
      235,
      195,
      325,
      10.5,
      16,
      color('#BBBBBF'),
      regular,
      250,
    )
  } else {
    const logoW = kit.logoStyle === 'stacked' ? 264 : 450
    imageFit(p1, logo, M, 81, logoW, 174)
  }
  let headSize = 32
  while (kit.headline.some((s) => bold.widthOfTextAtSize(ascii(s), headSize) > CW)) headSize--
  kit.headline.forEach((s, i) => txt(p1, s, M, 278 + i * 39, headSize, bold, white))
  line(p1, M, 370, 64, accent)
  imageCover(p1, cover, 0, 390, W, 275, kit.slug === 'elite' ? 0.28 : 0.5)
  txt(p1, kit.label.toUpperCase(), M, 686, 9, bold, white)
  paragraph(p1, kit.intro, M, 709, CW, 10.3, 14, color('#BBBBBF'), regular, 741)

  // 02: Short bio, tangible photography, and a clear musical identity.
  const p2 = base(2)
  txt(p2, 'THE SHOW', M, 89, 9, bold, accent)
  txt(p2, 'About the band', M, 113, 36, bold)
  paragraph(p2, kit.bio, M, 175, CW, 11.5, 17, ink, regular, 300)
  const photoTop = 316,
    photoHeight = 184
  imageCover(p2, detail, M, photoTop, 256, photoHeight, 0.35)
  imageCover(p2, stage, M + 268, photoTop, 256, photoHeight, 0.4)
  txt(
    p2,
    kit.slug === 'the-dick-beldings' ? 'BAND PORTRAIT / STAGE SETUP' : 'ON STAGE / IN THE MOMENT',
    M,
    510,
    7.5,
    bold,
    gray,
  )
  txt(p2, 'THE SOUND', M, 547, 9, bold, accent)
  paragraph(p2, kit.soundTitle, M, 569, 210, 20, 25, ink, bold, 635)
  let soundY = 571
  for (const item of kit.sound)
    soundY = paragraph(p2, item, M + 240, soundY, 284, 11.2, 19, ink, regular, 695)
  paragraph(
    p2,
    kit.soundNote,
    M + 240,
    Math.max(soundY + 10, 652),
    284,
    8.7,
    12,
    gray,
    regular,
    729,
  )
  link(p2, 'Explore the music online', `https://echoplay.live/bands/${kit.slug}#music`, M, 694, 9)

  // 03: Event planning information with actual contact/link annotations.
  const p3 = base(3)
  txt(p3, 'FOR VENUES & EVENT PLANNERS', M, 89, 9, bold, accent)
  txt(p3, "Let's talk about", M, 113, 37, bold)
  txt(p3, 'your event.', M, 156, 37, bold)
  paragraph(
    p3,
    "Tell us what you're planning. We'll check availability and work through the details with you.",
    M,
    218,
    470,
    12,
    18,
    gray,
    regular,
    272,
  )
  planningDetails.forEach(([title, body], i) => {
    const x = M + (i % 2) * 278,
      top = 284 + Math.floor(i / 2) * 101
    line(p3, x, top, 246, color('#D3D0CD'))
    txt(p3, `0${i + 1} / ${title.toUpperCase()}`, x, top + 14, 9, bold, accent)
    paragraph(p3, body, x, top + 36, 240, 10.5, 15, ink, regular, top + 96)
  })
  txt(p3, 'SELECTED STAGES', M, 496, 8, bold, gray)
  paragraph(p3, kit.stages.join('  /  '), M, 514, CW, 10.5, 15, ink, regular, 550)
  p3.drawRectangle({ x: M, y: H - 683, width: CW, height: 126, color: ink })
  txt(p3, 'BOOKING / ECHO PLAY LIVE', M + 20, 575, 8, bold, color('#BBBBBF'))
  link(p3, kit.bookingEmail, `mailto:${kit.bookingEmail}`, M + 20, 598, 15, white)
  link(
    p3,
    'Start a booking inquiry',
    `https://echoplay.live/contact?band=${kit.slug}`,
    M + 20,
    635,
    10,
    white,
  )
  imageFit(p3, qr, W - M - 109, 572, 92, 92)
  txt(p3, 'SCAN FOR THE ONLINE KIT', W - M - 121, 668, 6.3, bold, white)
  link(p3, 'Photos, logo & bio', `https://echoplay.live/press/${kit.slug}`, M, 711, 9)
  let socialX = 278
  for (const [label, url] of Object.entries(kit.social)) {
    link(p3, label, url, socialX, 711, 9)
    socialX += 107
  }
  const bytes = await pdf.save()
  await writeFile(path.join(root, 'public/press/kits', `${kit.slug}.pdf`), bytes)
  console.log(`${kit.name}: 3 pages, ${(bytes.length / 1024 / 1024).toFixed(2)} MB`)
}
