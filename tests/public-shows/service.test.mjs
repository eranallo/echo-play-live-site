import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { TABLES } from '../../lib/airtable.js'
import { publicBandPresentation } from '../../lib/public/bands-presentation.js'
import { getPublicShows } from '../../lib/public/shows.js'
import {
  BAND_SOURCE_FIELD_IDS,
  SHOW_FIELD_IDS,
  SHOW_SOURCE_FIELD_IDS,
  VENUE_SOURCE_FIELD_IDS,
} from '../../lib/public/shows-contract.mjs'

const fixture = JSON.parse(
  await readFile(new URL('../fixtures/public-shows.json', import.meta.url), 'utf8'),
)
const clone = (value) => structuredClone(value)
const LOOPBACK_ORIGIN = 'http://127.0.0.1:43127'

function recordId(number) {
  return `rec${String(number).padStart(14, '0').slice(-14)}`
}

function unpublishedFiller(number) {
  return {
    id: recordId(number),
    fields: {
      [SHOW_FIELD_IDS.publish]: false,
      [SHOW_FIELD_IDS.date]: '2026-12-31',
      [SHOW_FIELD_IDS.bands]: ['recXXXXXXXXXXXXXX'],
      [SHOW_FIELD_IDS.venue]: ['recVVVVVVVVVVVVVV'],
      [SHOW_FIELD_IDS.status]: 'Confirmed',
      fldPRIVATECANARY: `PRIVATE_FILLER_CANARY_${number}`,
    },
  }
}

function paginatedSource() {
  const firstPage = clone(
    fixture.sourceRecords.filter((record) => record.id !== 'rec00000000000002'),
  )
  for (let index = firstPage.length; index < 100; index += 1) {
    firstPage.push(unpublishedFiller(1000 + index))
  }
  return [
    firstPage,
    [clone(fixture.sourceRecords.find((record) => record.id === 'rec00000000000002'))],
  ]
}

function response(payload, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => clone(payload) }
}

function makeFixtureFetch(options = {}) {
  const calls = []
  const sourcePages = options.sourcePages || paginatedSource()
  const bandRecords = options.bandRecords || clone(fixture.bandRecords)
  const venueRecords = options.venueRecords || clone(fixture.venueRecords)
  const firstOffset = options.firstOffset === undefined ? 'itrNEXT_PAGE_001' : options.firstOffset

  const fetchImpl = async (input, requestOptions = {}) => {
    const url = new URL(input)
    calls.push({ url, options: requestOptions })
    const tableId = url.pathname.split('/').at(-1)

    if (tableId === TABLES.SHOWS) {
      if (!url.searchParams.has('offset')) {
        return response({
          records: sourcePages[0],
          ...(firstOffset ? { offset: firstOffset } : {}),
        })
      }
      if (url.searchParams.get('offset') === firstOffset) {
        return response({
          records: sourcePages[1] || [],
          ...(options.repeatOffset ? { offset: firstOffset } : {}),
        })
      }
      return response({ records: [] })
    }

    const requestedIds = new Set(
      (url.searchParams.get('filterByFormula') || '').match(/rec[A-Za-z0-9]{14}/g) || [],
    )
    if (tableId === TABLES.BANDS) {
      return response({ records: bandRecords.filter((record) => requestedIds.has(record.id)) })
    }
    if (tableId === TABLES.VENUES) {
      return response({ records: venueRecords.filter((record) => requestedIds.has(record.id)) })
    }

    throw new Error('Unexpected fixture URL')
  }

  return { calls, fetchImpl }
}

function makeLogger() {
  const entries = []
  return { entries, logger: { warn: (...args) => entries.push(args) } }
}

function serviceOptions(fetchImpl, logger) {
  return {
    approvedBands: fixture.approvedBands,
    fetchImpl,
    logger,
    now: fixture.clock,
    origin: LOOPBACK_ORIGIN,
    token: 'fixture-token-not-a-credential',
  }
}

test('public venue facts and valid door times survive while private fields and withdrawn shows do not', async () => {
  const record = clone(fixture.sourceRecords[0])
  record.fields[SHOW_FIELD_IDS.doorsTime] = '2026-08-29T23:00:00.000Z'
  const venueRecords = clone(fixture.venueRecords)
  Object.assign(venueRecords[0].fields, {
    fldwFdn1PdJfIVt8G: '123 Fixture Street, Dallas, TX 75201',
    fldN11XAkovT17ouy: 'All Ages',
    fldPRIVATECANARY: 'PRIVATE_CONTACT_NEVER_PUBLIC',
  })
  const read = async () => {
    const fake = makeFixtureFetch({ sourcePages: [[record]], firstOffset: null, venueRecords })
    return getPublicShows(serviceOptions(fake.fetchImpl, makeLogger().logger))
  }
  let result = await read()
  assert.equal(result.shows[0].venue.address, '123 Fixture Street, Dallas, TX 75201')
  assert.equal(result.shows[0].venue.ageRestriction, 'All Ages')
  assert.equal(result.shows[0].doorsTime, '2026-08-29T23:00:00.000Z')
  assert.ok(!JSON.stringify(result).includes('PRIVATE_CONTACT'))
  record.fields[SHOW_FIELD_IDS.doorsTime] = '2026-08-30T01:00:00.000Z'
  result = await read()
  assert.equal(result.shows[0].doorsTime, undefined, 'doors after the set must not be presented')
  record.fields[SHOW_FIELD_IDS.publish] = false
  assert.deepEqual((await read()).shows, [])
})

test('service follows all pages, includes the later-page Jambi case, and requests only field IDs', async () => {
  const fake = makeFixtureFetch()
  const logs = makeLogger()
  const result = await getPublicShows(serviceOptions(fake.fetchImpl, logs.logger))

  assert.equal(result.ok, true)
  assert.equal(result.shows.length, 5)
  assert.equal(
    result.shows.filter((show) => show.bands.some((band) => band.slug === 'jambi')).length,
    2,
  )
  assert.equal(result.shows.filter((show) => show.date === '2026-09-26').length, 1)

  const showCalls = fake.calls.filter((call) => call.url.pathname.endsWith(`/${TABLES.SHOWS}`))
  assert.equal(showCalls.length, 2)
  assert.equal(showCalls[0].url.searchParams.get('pageSize'), '100')
  assert.equal(showCalls[0].url.searchParams.has('maxRecords'), false)
  assert.equal(showCalls[0].url.searchParams.get('returnFieldsByFieldId'), 'true')
  assert.deepEqual(
    new Set(showCalls[0].url.searchParams.getAll('fields[]')),
    new Set(SHOW_SOURCE_FIELD_IDS),
  )
  assert.equal(showCalls[0].url.searchParams.get('sort[0][field]'), SHOW_FIELD_IDS.date)
  assert.equal(
    showCalls[0].url.searchParams.get('filterByFormula'),
    "AND({Publish to Website}=TRUE(),{Date}>='2026-08-28',OR({Status}='Confirmed',{Status}='Cancelled'))",
  )

  const bandCall = fake.calls.find((call) => call.url.pathname.endsWith(`/${TABLES.BANDS}`))
  const venueCall = fake.calls.find((call) => call.url.pathname.endsWith(`/${TABLES.VENUES}`))
  assert.deepEqual(
    new Set(bandCall.url.searchParams.getAll('fields[]')),
    new Set(BAND_SOURCE_FIELD_IDS),
  )
  assert.deepEqual(
    new Set(venueCall.url.searchParams.getAll('fields[]')),
    new Set(VENUE_SOURCE_FIELD_IDS),
  )
  assert.equal(
    bandCall.url.searchParams.get('filterByFormula').includes('recXXXXXXXXXXXXXX'),
    false,
  )

  for (const call of fake.calls) {
    assert.equal(call.options.method, 'GET')
    assert.equal(call.options.cache, 'no-store')
    assert.equal(call.options.signal instanceof AbortSignal, true)
    assert.equal('body' in call.options, false)
    assert.equal(call.url.hostname, '127.0.0.1')
  }

  const publicOutput = JSON.stringify(result)
  const logOutput = JSON.stringify(logs.entries)
  assert.equal(publicOutput.includes('rec000000000000'), false)
  assert.equal(publicOutput.includes('PRIVATE_'), false)
  assert.equal(logOutput.includes('rec000000000000'), false)
  assert.equal(logOutput.includes('PRIVATE_'), false)
})

test('checked to unchecked fixture reads revoke immediately without a stale result', async () => {
  const checkedRecord = clone(fixture.sourceRecords[0])
  const checkedFetch = makeFixtureFetch({ sourcePages: [[checkedRecord], []], firstOffset: null })
  const checked = await getPublicShows(serviceOptions(checkedFetch.fetchImpl, makeLogger().logger))
  assert.equal(checked.ok, true)
  assert.equal(checked.shows.length, 1)

  checkedRecord.fields[SHOW_FIELD_IDS.publish] = false
  const uncheckedFetch = makeFixtureFetch({ sourcePages: [[checkedRecord], []], firstOffset: null })
  const unchecked = await getPublicShows(
    serviceOptions(uncheckedFetch.fetchImpl, makeLogger().logger),
  )
  assert.equal(unchecked.ok, true)
  assert.equal(unchecked.shows.length, 0)
  assert.equal(
    uncheckedFetch.calls.some((call) => call.url.pathname.endsWith(`/${TABLES.BANDS}`)),
    false,
  )
})

test('missing credentials fail closed before any request', async () => {
  let requests = 0
  const result = await getPublicShows({
    ...serviceOptions(async () => {
      requests += 1
    }, makeLogger().logger),
    token: '',
  })
  assert.deepEqual(result, { ok: false, code: 'SHOWS_UNAVAILABLE', shows: [] })
  assert.equal(requests, 0)
})

test('duplicate source rows and malformed pagination fail the whole service', async () => {
  const pages = paginatedSource()
  pages[1] = [clone(pages[0][0])]
  const duplicateFetch = makeFixtureFetch({ sourcePages: pages })
  const duplicate = await getPublicShows(
    serviceOptions(duplicateFetch.fetchImpl, makeLogger().logger),
  )
  assert.equal(duplicate.ok, false)

  const repeatedPages = paginatedSource()
  repeatedPages[1] = Array.from({ length: 100 }, (_, index) => unpublishedFiller(5000 + index))
  const repeatedFetch = makeFixtureFetch({ sourcePages: repeatedPages, repeatOffset: true })
  const repeated = await getPublicShows(
    serviceOptions(repeatedFetch.fetchImpl, makeLogger().logger),
  )
  assert.equal(repeated.ok, false)

  const partialFetch = makeFixtureFetch({ sourcePages: [[clone(fixture.sourceRecords[0])], []] })
  const partial = await getPublicShows(serviceOptions(partialFetch.fetchImpl, makeLogger().logger))
  assert.equal(partial.ok, false)

  const malformedOffsetFetch = makeFixtureFetch({ firstOffset: 'not an Airtable offset' })
  const malformedOffset = await getPublicShows(
    serviceOptions(malformedOffsetFetch.fetchImpl, makeLogger().logger),
  )
  assert.equal(malformedOffset.ok, false)
})

test('incomplete hydration fails closed instead of returning a partial set', async () => {
  const fake = makeFixtureFetch({ bandRecords: clone(fixture.bandRecords.slice(0, 1)) })
  const result = await getPublicShows(serviceOptions(fake.fetchImpl, makeLogger().logger))
  assert.deepEqual(result, { ok: false, code: 'SHOWS_UNAVAILABLE', shows: [] })
})

test('empty inventory is successful and performs no hydration requests', async () => {
  const fake = makeFixtureFetch({ sourcePages: [[], []], firstOffset: null })
  const result = await getPublicShows(serviceOptions(fake.fetchImpl, makeLogger().logger))
  assert.deepEqual(result, { ok: true, shows: [] })
  assert.equal(fake.calls.length, 1)
})

test('source status, timeout, and malformed payload failures stay generic and redacted', async () => {
  const failures = [
    async () => response({ error: 'PRIVATE_PROVIDER_BODY' }, false),
    async () => {
      throw Object.assign(new Error('PRIVATE_TIMEOUT_BODY'), { name: 'AbortError' })
    },
    async () => ({ ok: true, json: async () => ({ records: 'PRIVATE_NOT_AN_ARRAY' }) }),
  ]

  for (const fetchImpl of failures) {
    const logs = makeLogger()
    const result = await getPublicShows(serviceOptions(fetchImpl, logs.logger))
    assert.deepEqual(result, { ok: false, code: 'SHOWS_UNAVAILABLE', shows: [] })
    assert.equal(JSON.stringify(result).includes('PRIVATE_'), false)
    assert.equal(JSON.stringify(logs.entries).includes('PRIVATE_'), false)
  }
})

test('non-loopback test origins are rejected without a request', async () => {
  let requests = 0
  const result = await getPublicShows({
    ...serviceOptions(async () => {
      requests += 1
    }, makeLogger().logger),
    origin: 'https://example.invalid',
  })
  assert.equal(result.ok, false)
  assert.equal(requests, 0)
})

test('the environment test origin is loopback-only and disabled in production-like runtimes', async () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalVercelEnv = process.env.VERCEL_ENV
  const originalTestOrigin = process.env.EPL_PUBLIC_SHOWS_TEST_ORIGIN

  try {
    process.env.NODE_ENV = 'development'
    delete process.env.VERCEL_ENV
    process.env.EPL_PUBLIC_SHOWS_TEST_ORIGIN = LOOPBACK_ORIGIN
    const fake = makeFixtureFetch()
    const result = await getPublicShows({
      approvedBands: fixture.approvedBands,
      fetchImpl: fake.fetchImpl,
      logger: makeLogger().logger,
      now: fixture.clock,
      token: 'fixture-token-not-a-credential',
    })
    assert.equal(result.ok, true)
    assert.equal(
      fake.calls.every((call) => call.url.hostname === '127.0.0.1'),
      true,
    )

    process.env.NODE_ENV = 'production'
    let productionRequests = 0
    const blocked = await getPublicShows({
      approvedBands: fixture.approvedBands,
      fetchImpl: async () => {
        productionRequests += 1
      },
      logger: makeLogger().logger,
      now: fixture.clock,
      token: 'fixture-token-not-a-credential',
    })
    assert.equal(blocked.ok, false)
    assert.equal(productionRequests, 0)
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = originalNodeEnv
    if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = originalVercelEnv
    if (originalTestOrigin === undefined) delete process.env.EPL_PUBLIC_SHOWS_TEST_ORIGIN
    else process.env.EPL_PUBLIC_SHOWS_TEST_ORIGIN = originalTestOrigin
  }
})

test('Bandsintown remains an isolated external route, not a canonical fallback', async () => {
  const root = new URL('../../', import.meta.url)
  const canonicalReaderFiles = ['lib/public/shows.js', 'app/api/shows/route.js', 'lib/jsonld.js']
  for (const path of canonicalReaderFiles) {
    const source = await readFile(new URL(path, root), 'utf8')
    assert.equal(/bandsintown/i.test(source), false, `${path} must not consume Bandsintown`)
  }

  for (const path of ['app/shows/page.js', 'components/ShowsClient.js']) {
    const source = await readFile(new URL(path, root), 'utf8')
    assert.equal(
      /\/api\/bandsintown|fetch\([^)]*bandsintown|import[^\n]*bandsintown/i.test(source),
      false,
      `${path} must not call or import the Bandsintown feed`,
    )
  }

  const bandsintownRoute = await readFile(new URL('app/api/bandsintown/route.js', root), 'utf8')
  assert.equal(/lib\/public\/shows|lib\/airtable|AIRTABLE/i.test(bandsintownRoute), false)
})

test('the Shows client does not import full static band records', async () => {
  const root = new URL('../../', import.meta.url)
  const clientPaths = ['components/ShowsClient.js', 'components/Nav.js', 'components/Footer.js']
  for (const path of clientPaths) {
    const source = await readFile(new URL(path, root), 'utf8')
    assert.equal(
      /@\/lib\/bands|bandsList[^\n]*from ['"]@\/lib\/bands|airtableId/.test(source),
      false,
      `${path} must not import full band records`,
    )
  }

  const pageSource = await readFile(new URL('app/shows/page.js', root), 'utf8')
  const publicModule = await readFile(new URL('lib/public/bands-presentation.js', root), 'utf8')
  assert.equal(/publicBandPresentation/.test(pageSource), true)
  assert.equal(/@\/lib\/bands|airtableId/.test(pageSource), false)
  assert.equal(
    /airtableId|rec[A-Za-z0-9]{14}|bookingEmail|experienceHeadline|galleryPhotos|heroPhoto/.test(
      publicModule,
    ),
    false,
  )

  assert.equal(publicBandPresentation.length > 0, true)
  for (const band of publicBandPresentation) {
    assert.deepEqual(Object.keys(band).sort(), [
      'bandsintown',
      'color',
      'name',
      'shortName',
      'slug',
    ])
  }
})
