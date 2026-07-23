import assert from 'node:assert/strict'
import {
  SHOW_DOCUMENT_KINDS,
  buildDocumentVersion,
  documentFilename,
  documentReadiness,
} from '../lib/documents/showDocumentModel.mjs'
import { renderShowDocumentPdf } from '../lib/documents/showDocumentPdf.mjs'
import { phase5FixtureModel } from './phase-5-fixture.mjs'

assert.equal(SHOW_DOCUMENT_KINDS.length, 9)
assert.equal(phase5FixtureModel.bandNames[0], 'The Dick Beldings')
assert.equal(phase5FixtureModel.venue.name, 'The Post at River East')
assert.equal(phase5FixtureModel.segments.length, 11)
assert.equal(phase5FixtureModel.contacts.people.length, 7)
assert.equal(phase5FixtureModel.finance.totalExpenses, 650)
assert.equal(phase5FixtureModel.outcome.actualAttendance, 184)
assert.match(phase5FixtureModel.version, /^20261012-[a-f0-9]{8}$/)
assert.equal(buildDocumentVersion(phase5FixtureModel), phase5FixtureModel.version)

for (const kind of SHOW_DOCUMENT_KINDS) {
  const readiness = documentReadiness(phase5FixtureModel, kind.id)
  assert.equal(readiness.ready, true, `${kind.id} should be ready in the complete fixture`)
  assert.equal(documentFilename(phase5FixtureModel, kind.id).endsWith(`${kind.id}.pdf`), true)
}

const incomplete = {
  ...phase5FixtureModel,
  segments: [],
  contacts: {
    event: { name: '', phone: '', email: '' },
    venue: { name: '', phone: '', email: '' },
    people: [],
  },
  notes: {
    ...phase5FixtureModel.notes,
    production: '',
    settlement: '',
  },
  outcome: {
    actualAttendance: null,
    grossTicketRevenue: null,
    recap: '',
    lessonsLearned: '',
  },
}
assert.equal(documentReadiness(incomplete, 'run-of-show').ready, false)
assert(documentReadiness(incomplete, 'run-of-show').issues.some(item => item.label === 'Run of Show segments'))
assert.equal(documentReadiness(incomplete, 'contact-sheet').ready, false)
assert.equal(documentReadiness(incomplete, 'show-recap').ready, false)
assert.equal(documentReadiness(incomplete, 'document-package').ready, false)

const bytes = await renderShowDocumentPdf({
  kindId: 'document-package',
  model: phase5FixtureModel,
  generatedAt: new Date('2026-10-12T16:00:00.000Z'),
})
assert.equal(Buffer.from(bytes).subarray(0, 4).toString('ascii'), '%PDF')
assert(bytes.length > 20000)

console.log('Phase 5 document model and PDF validation passed.')
