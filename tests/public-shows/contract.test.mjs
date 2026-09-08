import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  SHOW_FIELD_IDS,
  buildPublicShowFormula,
  buildPublicShows,
  chicagoDate,
  prepareShowRows,
  publicShowToEventJsonLd,
  validDateOnly,
} from '../../lib/public/shows-contract.mjs'
import { showPurchaseLinks } from '../../lib/public/show-presentation.mjs'

const fixture = JSON.parse(
  await readFile(new URL('../fixtures/public-shows.json', import.meta.url), 'utf8'),
)
const clone = (value) => structuredClone(value)

function hydratedMaps() {
  return {
    bandNamesById: new Map(
      fixture.bandRecords.map((record) => [record.id, record.fields.fldjFKclWNjTuGOi5]),
    ),
    venueNamesById: new Map(
      fixture.venueRecords.map((record) => [record.id, record.fields.fldhQR4NRmOtrywrj]),
    ),
  }
}

test('Chicago cutoff and Airtable formula are deterministic', () => {
  assert.equal(chicagoDate(fixture.clock), '2026-08-28')
  assert.equal(chicagoDate('2026-08-29T04:59:59.999Z'), '2026-08-28')
  assert.equal(chicagoDate('2026-08-29T05:00:00.000Z'), '2026-08-29')
  assert.equal(validDateOnly('2026-02-29'), false)
  assert.equal(validDateOnly('2028-02-29'), true)
  assert.equal(
    buildPublicShowFormula('2026-08-28'),
    "AND({Publish to Website}=TRUE(),{Date}>='2026-08-28',OR({Status}='Confirmed',{Status}='Cancelled'))",
  )
})

test('strict publication, date, status, venue relation, and time checks default deny', () => {
  const valid = clone(fixture.sourceRecords[0])
  const variants = [
    { id: 'rec10000000000001', field: SHOW_FIELD_IDS.publish, value: false },
    { id: 'rec10000000000002', field: SHOW_FIELD_IDS.publish, value: 'true' },
    { id: 'rec10000000000003', field: SHOW_FIELD_IDS.publish, value: undefined },
    { id: 'rec10000000000004', field: SHOW_FIELD_IDS.date, value: '2026-08-27' },
    { id: 'rec10000000000005', field: SHOW_FIELD_IDS.date, value: '2026-02-29' },
    { id: 'rec10000000000006', field: SHOW_FIELD_IDS.status, value: 'Hold' },
    { id: 'rec10000000000007', field: SHOW_FIELD_IDS.venue, value: [] },
    {
      id: 'rec10000000000008',
      field: SHOW_FIELD_IDS.venue,
      value: ['recVVVVVVVVVVVVVV', 'recWWWWWWWWWWWWWW'],
    },
    { id: 'rec10000000000009', field: SHOW_FIELD_IDS.startTime, value: '2026-08-29T19:00:00' },
    { id: 'rec10000000000010', field: SHOW_FIELD_IDS.startTime, value: '2026-08-31T00:00:00.000Z' },
  ].map(({ id, field, value }) => {
    const record = clone(valid)
    record.id = id
    if (value === undefined) delete record.fields[field]
    else record.fields[field] = value
    return record
  })

  const prepared = prepareShowRows([valid, ...variants], '2026-08-28')
  assert.equal(prepared.rows.length, 1)
  assert.equal(prepared.rows[0].sourceId, valid.id)
  assert.equal(
    Object.values(prepared.reasons).reduce((sum, count) => sum + count, 0),
    variants.length,
  )
})

test('Chicago date matching handles DST and UTC cross-midnight instants explicitly', () => {
  const makeRecord = (id, date, startTime) => {
    const record = clone(fixture.sourceRecords[0])
    record.id = id
    record.fields[SHOW_FIELD_IDS.date] = date
    record.fields[SHOW_FIELD_IDS.startTime] = startTime
    delete record.fields[SHOW_FIELD_IDS.calendarEventId]
    return record
  }
  const cases = [
    makeRecord('rec30000000000001', '2027-03-14', '2027-03-14T07:30:00.000Z'),
    makeRecord('rec30000000000002', '2027-03-14', '2027-03-14T08:30:00.000Z'),
    makeRecord('rec30000000000003', '2026-11-01', '2026-11-01T06:30:00.000Z'),
    makeRecord('rec30000000000004', '2026-11-01', '2026-11-01T07:30:00.000Z'),
    makeRecord('rec30000000000005', '2026-08-29', '2026-08-30T04:30:00.000Z'),
    makeRecord('rec30000000000006', '2026-08-29', '2026-08-30T05:30:00.000Z'),
    makeRecord('rec30000000000007', '2027-03-14', '2027-03-14T02:30:00'),
  ]

  const prepared = prepareShowRows(cases, '2026-08-28')
  assert.deepEqual(
    prepared.rows.map((row) => row.sourceId),
    cases.slice(0, 5).map((record) => record.id),
  )
  assert.equal(prepared.reasons.invalid_start_time, 2)
})

test('only allowlisted public fields survive and canceled shows suppress tickets', () => {
  const prepared = prepareShowRows(clone(fixture.sourceRecords), '2026-08-28')
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })

  assert.equal(built.shows.length, 5)
  assert.equal(
    built.shows.every((show) => /^show_[A-Za-z0-9_-]{22}$/.test(show.id)),
    true,
  )
  assert.equal(
    built.shows.some((show) => JSON.stringify(show).includes('rec000000000000')),
    false,
  )
  assert.equal(JSON.stringify(built.shows).includes('PRIVATE_'), false)

  const canceled = built.shows.find((show) => show.state === 'canceled')
  assert.ok(canceled)
  assert.equal(canceled.ticket, null)
  assert.equal(canceled.reservation, null)
  assert.equal(canceled.ticketNote, null)

  const missingTicket = built.shows.find((show) => show.date === '2026-10-02')
  assert.equal(missingTicket.startTime, null)
  assert.equal(missingTicket.ticket, null)
  assert.equal(missingTicket.ticketNote, null)

  for (const show of built.shows) {
    assert.deepEqual(
      Object.keys(show).sort(),
      [
        'bands',
        'date',
        'id',
        'startTime',
        'state',
        'ticket',
        'reservation',
        'ticketNote',
        'timeZone',
        'venue',
      ].sort(),
    )
    for (const band of show.bands) assert.deepEqual(Object.keys(band).sort(), ['name', 'slug'])
    assert.deepEqual(Object.keys(show.venue), ['name'])
    if (show.ticket)
      assert.deepEqual(Object.keys(show.ticket).sort(), ['label', 'priceLabel', 'url'])
  }
})

test('eligible rows group only by a consistent Calendar Event ID', () => {
  const prepared = prepareShowRows(clone(fixture.sourceRecords), '2026-08-28')
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })
  const grouped = built.shows.find((show) => show.date === '2026-10-03')

  assert.ok(grouped)
  assert.deepEqual(
    grouped.bands.map((band) => band.slug),
    ['jambi', 'so-long-goodnight'],
  )
  assert.equal(grouped.ticket.url, 'https://tickets.invalid/grouped')
  assert.equal(JSON.stringify(grouped).includes('ticket-canary'), false)

  const withoutSharedIdentity = clone(fixture.sourceRecords.slice(5, 7))
  withoutSharedIdentity.forEach((record, index) => {
    record.id = `rec2000000000000${index + 1}`
    delete record.fields[SHOW_FIELD_IDS.calendarEventId]
  })
  const separateRows = prepareShowRows(withoutSharedIdentity, '2026-08-28')
  const separate = buildPublicShows({
    rows: separateRows.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })
  assert.equal(separate.shows.length, 2)
  assert.notEqual(separate.shows[0].id, separate.shows[1].id)
})

test('a bad checked member blocks its whole Calendar group', () => {
  const rows = clone(fixture.sourceRecords.slice(5, 7))
  rows[0].fields[SHOW_FIELD_IDS.bands] = ['recXXXXXXXXXXXXXX']
  const prepared = prepareShowRows(rows, '2026-08-28')
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })

  assert.equal(built.shows.length, 0)
  assert.equal(built.reasons.invalid_public_band, 1)
  assert.equal(built.reasons.invalid_group_member, 1)
})

test('conflicting grouped status or public facts fail closed', () => {
  const rows = clone(fixture.sourceRecords.slice(5, 7))
  rows[1].fields[SHOW_FIELD_IDS.status] = 'Cancelled'
  const prepared = prepareShowRows(rows, '2026-08-28')
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })

  assert.equal(built.shows.length, 0)
  assert.equal(built.reasons.conflicting_group_facts, 1)
})

test('public band and venue identity must be complete, approved, and non-placeholder', () => {
  const prepared = prepareShowRows([clone(fixture.sourceRecords[0])], '2026-08-28')
  const maps = hydratedMaps()

  const placeholderVenue = buildPublicShows({
    rows: prepared.rows,
    bandNamesById: maps.bandNamesById,
    venueNamesById: new Map([[prepared.rows[0].venueId, 'TBA']]),
    approvedBands: fixture.approvedBands,
  })
  assert.equal(placeholderVenue.shows.length, 0)
  assert.equal(placeholderVenue.reasons.invalid_public_venue, 1)

  const hiddenBand = buildPublicShows({
    rows: prepared.rows,
    ...maps,
    approvedBands: fixture.approvedBands.map((band, index) =>
      index === 0 ? { ...band, hidden: true } : band,
    ),
  })
  assert.equal(hiddenBand.shows.length, 0)

  const mismatchedName = buildPublicShows({
    rows: prepared.rows,
    bandNamesById: new Map([[prepared.rows[0].bandIds[0], 'Contradictory Name']]),
    venueNamesById: maps.venueNamesById,
    approvedBands: fixture.approvedBands,
  })
  assert.equal(mismatchedName.shows.length, 0)

  const partialRecord = clone(fixture.sourceRecords[0])
  partialRecord.fields[SHOW_FIELD_IDS.bands].push('recCCCCCCCCCCCCCC')
  const partial = prepareShowRows([partialRecord], '2026-08-28')
  const partialResult = buildPublicShows({
    rows: partial.rows,
    bandNamesById: new Map([...maps.bandNamesById, ['recCCCCCCCCCCCCCC', 'Unknown Band']]),
    venueNamesById: maps.venueNamesById,
    approvedBands: fixture.approvedBands,
  })
  assert.equal(partialResult.shows.length, 0)
})

test('ticket URLs require HTTPS and ticket amounts never enter public output', () => {
  const rows = [
    { url: 'http://tickets.invalid/insecure', price: 20, note: null },
    { url: '', price: 0, note: null },
    { url: 'https://tickets.invalid/secure', price: 18.5, note: null },
  ].map((item, index) => {
    const record = clone(fixture.sourceRecords[0])
    record.id = `rec4000000000000${index + 1}`
    delete record.fields[SHOW_FIELD_IDS.calendarEventId]
    record.fields[SHOW_FIELD_IDS.ticketUrl] = item.url
    record.fields.fld8KAW94k2KbuNC4 = item.price
    return { item, record }
  })
  const prepared = prepareShowRows(
    rows.map((item) => item.record),
    '2026-08-28',
  )
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })

  for (const { item, record } of rows) {
    const show = built.shows.find(
      (candidate) =>
        candidate.id ===
        buildPublicShows({
          rows: prepareShowRows([record], '2026-08-28').rows,
          ...hydratedMaps(),
          approvedBands: fixture.approvedBands,
        }).shows[0].id,
    )
    assert.equal(show.ticketNote, item.note)
  }
  assert.equal(built.shows.filter((show) => show.ticket).length, 1)
  assert.equal(built.shows.find((show) => show.ticket)?.ticket.priceLabel, null)
  assert.equal(JSON.stringify(built.shows).includes('$'), false)
  assert.equal(JSON.stringify(built.shows).includes('Free'), false)
})

test('same-day ordering is timed first, then chronological, then untimed', () => {
  const times = ['2026-10-04T01:00:00.000Z', null, '2026-10-04T00:00:00.000Z']
  const records = times.map((time, index) => {
    const record = clone(fixture.sourceRecords[0])
    record.id = `rec5000000000000${index + 1}`
    record.fields[SHOW_FIELD_IDS.date] = '2026-10-03'
    if (time) record.fields[SHOW_FIELD_IDS.startTime] = time
    else delete record.fields[SHOW_FIELD_IDS.startTime]
    delete record.fields[SHOW_FIELD_IDS.calendarEventId]
    return record
  })
  const prepared = prepareShowRows(records, '2026-08-28')
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })
  assert.deepEqual(
    built.shows.map((show) => show.startTime),
    [times[2], times[0], null],
  )
})

test('ticket and table-reservation links display independently with no pricing claims', () => {
  for (const [ticket, reservation, labels] of [
    [null, null, []],
    ['https://tickets.invalid/show', null, ['Buy Tickets']],
    [null, 'https://tables.invalid/show', ['Table Reservation']],
    ['https://tickets.invalid/show', 'https://tables.invalid/show', ['Buy Tickets', 'Table Reservation']],
  ]) {
    const record = clone(fixture.sourceRecords[0])
    record.fields[SHOW_FIELD_IDS.ticketUrl] = ticket
    record.fields[SHOW_FIELD_IDS.reservationUrl] = reservation
    record.fields.fld8KAW94k2KbuNC4 = 15
    const show = buildPublicShows({ rows: prepareShowRows([record], '2026-08-28').rows, ...hydratedMaps(), approvedBands: fixture.approvedBands }).shows[0]
    const links = showPurchaseLinks(show)
    assert.deepEqual(links.map(link => link.label), labels)
    assert.deepEqual(links.map(link => link.url), [ticket, reservation].filter(Boolean))
    assert.equal(show.ticketNote, null)
    assert.equal(JSON.stringify(show).includes('$'), false)
    assert.deepEqual(publicShowToEventJsonLd(show).offers, ticket ? { '@type': 'Offer', url: ticket } : undefined, 'table reservations are not ticket offers')
    assert.deepEqual(showPurchaseLinks({ ...show, state: 'canceled' }), [])
    record.fields[SHOW_FIELD_IDS.status] = 'Cancelled'
    const canceled = buildPublicShows({ rows: prepareShowRows([record], '2026-08-28').rows, ...hydratedMaps(), approvedBands: fixture.approvedBands }).shows[0]
    assert.equal(canceled.ticket, null)
    assert.equal(canceled.reservation, null)
  }
})

test('unsafe reservation links are omitted without hiding a valid ticket link', () => {
  for (const url of ['http://tables.invalid', 'javascript:alert(1)', 'https://user:password@tables.invalid', 'not-a-url', '']) {
    const record = clone(fixture.sourceRecords[0])
    record.fields[SHOW_FIELD_IDS.ticketUrl] = 'https://tickets.invalid/show'
    record.fields[SHOW_FIELD_IDS.reservationUrl] = url
    const show = buildPublicShows({ rows: prepareShowRows([record], '2026-08-28').rows, ...hydratedMaps(), approvedBands: fixture.approvedBands }).shows[0]
    assert.equal(show.reservation, null)
    assert.deepEqual(showPurchaseLinks(show).map(link => link.label), ['Buy Tickets'])
  }
})

test('grouped shows combine matching links and ignore different internal ticket amounts', () => {
  const records = clone(fixture.sourceRecords.slice(5, 7))
  records[0].fields[SHOW_FIELD_IDS.reservationUrl] = 'https://tables.invalid/shared'
  records[0].fields.fld8KAW94k2KbuNC4 = 15
  records[1].fields.fld8KAW94k2KbuNC4 = 20
  const built = buildPublicShows({ rows: prepareShowRows(records, '2026-08-28').rows, ...hydratedMaps(), approvedBands: fixture.approvedBands })
  assert.equal(built.shows.length, 1)
  assert.equal(built.shows[0].reservation.url, 'https://tables.invalid/shared')
  assert.deepEqual(showPurchaseLinks(built.shows[0]).map(link => link.label), ['Buy Tickets', 'Table Reservation'])
})

test('conflicting headliner, time, ticket, date, or venue facts block a shared event', () => {
  const mutations = [
    (rows) => {
      rows[0].fields[SHOW_FIELD_IDS.headliner] = ['recAAAAAAAAAAAAAA']
      rows[1].fields[SHOW_FIELD_IDS.headliner] = ['recBBBBBBBBBBBBBB']
    },
    (rows) => {
      rows[1].fields[SHOW_FIELD_IDS.startTime] = '2026-10-04T01:00:00.000Z'
    },
    (rows) => {
      rows[0].fields[SHOW_FIELD_IDS.ticketUrl] = 'https://tickets.invalid/conflict'
    },
    (rows) => {
      rows[0].fields[SHOW_FIELD_IDS.reservationUrl] = 'https://tables.invalid/one'
      rows[1].fields[SHOW_FIELD_IDS.reservationUrl] = 'https://tables.invalid/two'
    },
    (rows) => {
      rows[1].fields[SHOW_FIELD_IDS.date] = '2026-10-04'
    },
    (rows) => {
      rows[1].fields[SHOW_FIELD_IDS.venue] = ['recWWWWWWWWWWWWWW']
    },
  ]

  for (const mutate of mutations) {
    const rows = clone(fixture.sourceRecords.slice(5, 7))
    mutate(rows)
    const prepared = prepareShowRows(rows, '2026-08-28')
    const built = buildPublicShows({
      rows: prepared.rows,
      ...hydratedMaps(),
      approvedBands: fixture.approvedBands,
    })
    assert.equal(built.shows.length, 0)
    assert.equal(built.reasons.conflicting_group_facts, 1)
  }
})

test('JSON-LD is a pure canonical DTO mapping with no canceled offer', () => {
  const prepared = prepareShowRows(clone(fixture.sourceRecords), '2026-08-28')
  const built = buildPublicShows({
    rows: prepared.rows,
    ...hydratedMaps(),
    approvedBands: fixture.approvedBands,
  })
  const scheduled = publicShowToEventJsonLd(
    built.shows.find((show) => show.ticket),
    'https://example.invalid',
  )
  const canceled = publicShowToEventJsonLd(
    built.shows.find((show) => show.state === 'canceled'),
    'https://example.invalid',
  )

  assert.equal(scheduled.offers.url.startsWith('https://tickets.invalid/'), true)
  assert.equal('availability' in scheduled.offers, false)
  assert.equal(canceled.eventStatus, 'https://schema.org/EventCancelled')
  assert.equal('offers' in canceled, false)
  assert.equal(JSON.stringify([scheduled, canceled]).includes('rec000000000000'), false)
})
