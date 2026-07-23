import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizeRunOfShowSegments } from '../lib/portal/runOfShow.mjs'
import { renderRunOfShowPdf } from '../lib/portal/runOfShowPdf.mjs'

const show = {
  id: 'fixture-show',
  date: '2026-09-26',
  dateLabel: 'Sat, Sep 26, 2026',
  venueName: 'Haltom Theater',
  bandNames: ['Jambi', 'Lost In Hollywood', 'Primish'],
  trailerLoadIn: '3:00 PM',
  loadIn: '4:00 PM',
  soundCheck: '5:00 PM',
  start: '8:00 PM',
  end: '11:30 PM',
}

const segments = normalizeRunOfShowSegments([
  {
    id: 'load-in',
    fields: {
      'Segment Name': 'Venue Load-In',
      'Segment Type': 'Travel / Logistics',
      'Start Time': '2026-09-26T21:00:00.000Z',
      Order: 1,
      Details: 'All artists and production enter through the rear loading area.',
    },
  },
  {
    id: 'soundcheck',
    fields: {
      'Segment Name': 'Jambi Soundcheck',
      'Segment Type': 'Production',
      'Start Time': '2026-09-26T22:00:00.000Z',
      'Duration Minutes': 30,
      Order: 2,
      Details: 'Full line check, playback verification, and final monitor adjustments.',
    },
  },
  {
    id: 'primish',
    fields: {
      'Segment Name': 'Primish',
      'Segment Type': 'Guest / Support',
      'Start Time': '2026-09-27T01:00:00.000Z',
      'Duration Minutes': 60,
      Order: 3,
      Details: '60-minute opening set.',
    },
  },
  {
    id: 'changeover-one',
    fields: {
      'Segment Name': 'Changeover',
      'Segment Type': 'Production',
      'Start Time': '2026-09-27T02:00:00.000Z',
      'Duration Minutes': 15,
      Order: 4,
      Details: 'Clear Primish backline and verify Lost In Hollywood playback.',
    },
  },
  {
    id: 'lost-in-hollywood',
    fields: {
      'Segment Name': 'Lost In Hollywood',
      'Segment Type': 'Guest / Support',
      'Start Time': '2026-09-27T02:15:00.000Z',
      'Duration Minutes': 60,
      Order: 5,
      Details: '60-minute support set.',
    },
  },
  {
    id: 'changeover-two',
    fields: {
      'Segment Name': 'Changeover',
      'Segment Type': 'Production',
      'Start Time': '2026-09-27T03:15:00.000Z',
      'Duration Minutes': 15,
      Order: 6,
      Details: 'Final stage reset for Jambi. Confirm video, lighting, and intro playback are ready.',
    },
  },
  {
    id: 'jambi',
    fields: {
      'Segment Name': 'Jambi - Aenima 30th Anniversary Set',
      'Segment Type': 'Performance',
      'Start Time': '2026-09-27T03:30:00.000Z',
      'End Time': '2026-09-27T04:30:00.000Z',
      Order: 7,
      Details: 'Jambi performs Aenima in its entirety. House curfew is 11:30 PM.',
    },
  },
])

const logoBytes = await fs.readFile(path.join(process.cwd(), 'public', 'logo.png'))
const pdfBytes = await renderRunOfShowPdf({ show, segments, logoBytes })
const outputDir = path.join(process.cwd(), 'tmp', 'pdfs')
await fs.mkdir(outputDir, { recursive: true })
const outputPath = path.join(outputDir, 'phase-2-run-of-show-fixture.pdf')
await fs.writeFile(outputPath, pdfBytes)
console.log(outputPath)
