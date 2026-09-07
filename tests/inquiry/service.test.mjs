import assert from 'node:assert/strict'
import test from 'node:test'
import { saveInquiry, validateInquiry } from '../../lib/inquiry-service.mjs'
const bands = [
  { name: 'Test Band', airtableId: 'rec00000000000001', bookingEmail: 'band@example.com' },
]
const valid = {
  name: 'Fixture Booker',
  email: 'booker@example.com',
  band: 'Test Band',
  eventType: 'Festival',
  date: '2027-05-08',
  venue: 'Fixture venue',
  message: 'Fixture only',
}
test('invalid, overlong, unknown-band and impossible-date requests are rejected', () => {
  for (const value of [
    null,
    [],
    { ...valid, email: 'not-email' },
    { ...valid, band: 'Invented' },
    { ...valid, eventType: 'New schema option' },
    { ...valid, date: '2027-02-30' },
    { ...valid, message: 'x'.repeat(2001) },
  ])
    assert.ok(validateInquiry(value, bands).error)
})
test('missing credentials and honeypot make zero upstream requests', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls++
    throw new Error('unexpected')
  }
  assert.equal((await saveInquiry(valid, { bands, fetchImpl })).status, 503)
  assert.equal((await saveInquiry({ ...valid, website: 'spam' }, { bands, fetchImpl })).status, 200)
  assert.equal(calls, 0)
})
test('success requires a valid saved Airtable record and does not expose its ID', async () => {
  let sent
  const result = await saveInquiry(valid, {
    bands,
    token: 'fixture-token',
    url: 'https://example.invalid',
    fetchImpl: async (url, options) => {
      sent = JSON.parse(options.body)
      assert.ok(options.signal)
      return { ok: true, json: async () => ({ id: 'rec00000000000002' }) }
    },
  })
  assert.equal(result.status, 200)
  assert.equal(result.body.success, true)
  assert.equal(result.body.bookingEmail, 'band@example.com')
  assert.equal(result.body.recordId, undefined)
  assert.equal(sent.typecast, false)
  assert.deepEqual(sent.fields['Band(s) Requested'], ['rec00000000000001'])
  assert.equal(sent.fields['Booker Email'], valid.email)
})
test('upstream rejection, malformed success and lost connection never become success', async () => {
  for (const fetchImpl of [
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => ({}) }),
    async () => {
      throw new Error('private upstream details')
    },
  ]) {
    const result = await saveInquiry(valid, {
      bands,
      token: 'fixture',
      url: 'https://example.invalid',
      fetchImpl,
    })
    assert.equal(result.status, 502)
    assert.equal(result.body.success, undefined)
    assert.ok(!JSON.stringify(result).includes('private upstream'))
  }
})
test('form choices map to existing Airtable options without creating schema', async () => {
  let fields
  await saveInquiry(
    { ...valid, eventType: 'Bar / Venue Show', inquirySource: 'qr-landing:jambi' },
    {
      bands,
      token: 'fixture',
      url: 'https://example.invalid',
      fetchImpl: async (_, o) => {
        fields = JSON.parse(o.body).fields
        return { ok: true, json: async () => ({ id: 'rec00000000000002' }) }
      },
    },
  )
  assert.equal(fields['Booker Type'], 'Venue/Bar')
  assert.equal(fields['Event Type'], 'Regular Gig')
  assert.equal(fields['Inquiry Source'], 'Jambi QR landing')
  assert.equal(fields['Inquiry Kind'], 'EPL Booking')
})

test('optional booking details reach their existing fields and retain the original message', async () => {
  let fields
  const result = await saveInquiry({ ...valid, attendance: '250', budget: '$2,000–$3,000', production: 'House sound available.' }, {
    bands, token: 'fixture', url: 'https://example.invalid',
    fetchImpl: async (_, request) => {
      fields = JSON.parse(request.body).fields
      return { ok: true, json: async () => ({ id: 'rec00000000000002' }) }
    },
  })
  assert.equal(result.status, 200)
  assert.equal(fields['Expected Attendance'], 250)
  assert.equal(fields.Budget, '$2,000–$3,000')
  assert.equal(fields['Special Requests'], 'Fixture only\n\nSound, lighting & stage: House sound available.')
  for (const attendance of ['0', '-2', '1.5', '1000001', '250 guests'])
    assert.ok(validateInquiry({ ...valid, attendance }, bands).error)
  assert.ok(!validateInquiry(valid, bands).error)
})
