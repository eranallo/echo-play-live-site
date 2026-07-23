import fs from 'node:fs/promises'
import path from 'node:path'
import {
  SHOW_DOCUMENT_KINDS,
  documentFilename,
} from '../lib/documents/showDocumentModel.mjs'
import { renderShowDocumentPdf } from '../lib/documents/showDocumentPdf.mjs'
import { phase5FixtureModel } from './phase-5-fixture.mjs'

const outputDir = path.join(process.cwd(), 'tmp', 'pdfs', 'phase-5')
const logoBytes = await fs.readFile(path.join(process.cwd(), 'public', 'logo.png'))
const generatedAt = new Date('2026-10-12T16:00:00.000Z')

await fs.mkdir(outputDir, { recursive: true })

for (const kind of SHOW_DOCUMENT_KINDS) {
  const bytes = await renderShowDocumentPdf({
    kindId: kind.id,
    model: phase5FixtureModel,
    logoBytes,
    generatedAt,
  })
  const outputPath = path.join(outputDir, documentFilename(phase5FixtureModel, kind.id))
  await fs.writeFile(outputPath, bytes)
  console.log(outputPath)
}
