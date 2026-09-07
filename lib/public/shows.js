import { bandsList } from '../bands.js'
import { AIRTABLE_BASE, TABLES } from '../airtable.js'
import {
  BAND_FIELD_IDS,
  BAND_SOURCE_FIELD_IDS,
  SHOW_FIELD_IDS,
  SHOW_SOURCE_FIELD_IDS,
  VENUE_FIELD_IDS,
  VENUE_SOURCE_FIELD_IDS,
  buildPublicShowFormula,
  buildPublicShows,
  chicagoDate,
  prepareShowRows,
  validOffset,
} from './shows-contract.mjs'

const DEFAULT_AIRTABLE_ORIGIN = 'https://api.airtable.com'
const PAGE_SIZE = 100
const HYDRATION_BATCH_SIZE = 50
const SOURCE_TIMEOUT_MS = 10_000
const SAFE_ERROR_CODE = 'SHOWS_UNAVAILABLE'
const RECORD_ID_PATTERN = /^rec[A-Za-z0-9]{14}$/

class PublicShowSourceError extends Error {
  constructor(code) {
    super(code)
    this.name = 'PublicShowSourceError'
    this.code = code
  }
}

function safeDiagnostic(logger, event, details = {}) {
  if (!logger || typeof logger.warn !== 'function') return
  logger.warn('[public-shows]', { event, ...details })
}

function resolveAirtableOrigin(override) {
  const raw = override || DEFAULT_AIRTABLE_ORIGIN
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new PublicShowSourceError('invalid_source_origin')
  }

  const normalized = url.origin
  if (normalized === DEFAULT_AIRTABLE_ORIGIN) return normalized

  const productionLike = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_ENV)
  const loopback = ['127.0.0.1', '::1', 'localhost'].includes(url.hostname)
  if (productionLike || !loopback || !['http:', 'https:'].includes(url.protocol)) {
    throw new PublicShowSourceError('unsafe_source_origin')
  }

  return normalized
}

function tableUrl(origin, tableId) {
  return new URL(`/v0/${AIRTABLE_BASE}/${tableId}`, origin)
}

function appendFieldIds(url, fieldIds) {
  for (const fieldId of fieldIds) url.searchParams.append('fields[]', fieldId)
}

async function fetchJson(fetchImpl, url, token) {
  let response
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
    })
  } catch {
    throw new PublicShowSourceError('source_request_failed')
  }

  if (!response || response.ok !== true) {
    throw new PublicShowSourceError('source_status_failed')
  }

  try {
    return await response.json()
  } catch {
    throw new PublicShowSourceError('source_payload_failed')
  }
}

async function fetchAllPages({ fetchImpl, makeUrl, token, pageSize = PAGE_SIZE }) {
  const records = []
  const seenRecordIds = new Set()
  const seenOffsets = new Set()
  let offset = null

  do {
    const url = makeUrl(offset)
    const payload = await fetchJson(fetchImpl, url, token)

    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      !Array.isArray(payload.records)
    ) {
      throw new PublicShowSourceError('invalid_page_shape')
    }
    if (payload.records.length > pageSize) {
      throw new PublicShowSourceError('invalid_page_size')
    }

    for (const record of payload.records) {
      if (
        !record ||
        typeof record !== 'object' ||
        !RECORD_ID_PATTERN.test(record.id) ||
        !record.fields ||
        typeof record.fields !== 'object' ||
        Array.isArray(record.fields)
      ) {
        throw new PublicShowSourceError('invalid_record_shape')
      }
      if (seenRecordIds.has(record.id)) {
        throw new PublicShowSourceError('duplicate_source_record')
      }
      seenRecordIds.add(record.id)
      records.push(record)
    }

    const nextOffset = payload.offset
    if (nextOffset === undefined || nextOffset === null) {
      offset = null
      continue
    }
    if (
      !validOffset(nextOffset) ||
      seenOffsets.has(nextOffset) ||
      payload.records.length !== pageSize
    ) {
      throw new PublicShowSourceError('invalid_pagination')
    }
    seenOffsets.add(nextOffset)
    offset = nextOffset
  } while (offset)

  return records
}

function makeShowPageUrl(origin, today) {
  const formula = buildPublicShowFormula(today)

  return (offset) => {
    const url = tableUrl(origin, TABLES.SHOWS)
    url.searchParams.set('returnFieldsByFieldId', 'true')
    url.searchParams.set('filterByFormula', formula)
    url.searchParams.set('pageSize', String(PAGE_SIZE))
    url.searchParams.set('sort[0][field]', SHOW_FIELD_IDS.date)
    url.searchParams.set('sort[0][direction]', 'asc')
    appendFieldIds(url, SHOW_SOURCE_FIELD_IDS)
    if (offset) url.searchParams.set('offset', offset)
    return url
  }
}

function recordFormula(recordIds) {
  const expressions = recordIds.map((id) => `RECORD_ID()='${id}'`)
  return expressions.length === 1 ? expressions[0] : `OR(${expressions.join(',')})`
}

function hydrationPageUrl({ origin, tableId, fieldIds, recordIds }) {
  return (offset) => {
    const url = tableUrl(origin, tableId)
    url.searchParams.set('returnFieldsByFieldId', 'true')
    url.searchParams.set('filterByFormula', recordFormula(recordIds))
    url.searchParams.set('pageSize', String(PAGE_SIZE))
    appendFieldIds(url, fieldIds)
    if (offset) url.searchParams.set('offset', offset)
    return url
  }
}

function chunks(items, size) {
  const result = []
  for (let index = 0; index < items.length; index += size)
    result.push(items.slice(index, index + size))
  return result
}

async function hydrateNames({
  fetchImpl,
  origin,
  token,
  tableId,
  fieldIds,
  nameFieldId,
  recordIds,
}) {
  const uniqueIds = [...new Set(recordIds)]
  const records = []

  for (const batch of chunks(uniqueIds, HYDRATION_BATCH_SIZE)) {
    if (!batch.length) continue
    const batchRecords = await fetchAllPages({
      fetchImpl,
      token,
      makeUrl: hydrationPageUrl({ origin, tableId, fieldIds, recordIds: batch }),
    })
    const requested = new Set(batch)
    if (batchRecords.some((record) => !requested.has(record.id))) {
      throw new PublicShowSourceError('unexpected_hydration_record')
    }
    records.push(...batchRecords)
  }

  const names = new Map()
  for (const record of records) {
    if (names.has(record.id)) throw new PublicShowSourceError('duplicate_hydration_record')
    const value = record.fields[nameFieldId]
    if (value !== undefined && value !== null && typeof value !== 'string') {
      throw new PublicShowSourceError('invalid_hydration_value')
    }
    names.set(record.id, typeof value === 'string' ? value.trim() : '')
  }

  if (uniqueIds.some((id) => !names.has(id))) {
    throw new PublicShowSourceError('incomplete_hydration')
  }

  return names
}

function combinedReasons(...reasonSets) {
  const combined = {}
  for (const reasons of reasonSets) {
    for (const [reason, count] of Object.entries(reasons || {})) {
      combined[reason] = (combined[reason] || 0) + count
    }
  }
  return combined
}

export async function getPublicShows(options = {}) {
  const logger = options.logger || console

  try {
    const fetchImpl = options.fetchImpl || globalThis.fetch
    const token = Object.hasOwn(options, 'token')
      ? options.token
      : process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
    const originOverride = Object.hasOwn(options, 'origin')
      ? options.origin
      : process.env.EPL_PUBLIC_SHOWS_TEST_ORIGIN
    const origin = resolveAirtableOrigin(originOverride)
    const today = chicagoDate(options.now || new Date())

    if (typeof fetchImpl !== 'function') throw new PublicShowSourceError('missing_fetch')
    if (typeof token !== 'string' || !token.trim())
      throw new PublicShowSourceError('missing_credential')
    if (!today) throw new PublicShowSourceError('invalid_clock')

    const sourceRecords = await fetchAllPages({
      fetchImpl,
      token: token.trim(),
      makeUrl: makeShowPageUrl(origin, today),
    })
    const prepared = prepareShowRows(sourceRecords, today)

    const bandIds = prepared.rows.flatMap((row) => row.bandIds)
    const venueIds = prepared.rows.map((row) => row.venueId)
    const [bandNamesById, venueNamesById] = await Promise.all([
      hydrateNames({
        fetchImpl,
        origin,
        token: token.trim(),
        tableId: TABLES.BANDS,
        fieldIds: BAND_SOURCE_FIELD_IDS,
        nameFieldId: BAND_FIELD_IDS.name,
        recordIds: bandIds,
      }),
      hydrateNames({
        fetchImpl,
        origin,
        token: token.trim(),
        tableId: TABLES.VENUES,
        fieldIds: VENUE_SOURCE_FIELD_IDS,
        nameFieldId: VENUE_FIELD_IDS.name,
        recordIds: venueIds,
      }),
    ])

    const built = buildPublicShows({
      rows: prepared.rows,
      bandNamesById,
      venueNamesById,
      approvedBands: options.approvedBands || bandsList,
    })
    const reasons = combinedReasons(prepared.reasons, built.reasons)
    const rejected = Object.values(reasons).reduce((sum, count) => sum + count, 0)
    if (rejected) safeDiagnostic(logger, 'records_filtered', { rejected, reasons })

    return { ok: true, shows: built.shows }
  } catch (error) {
    const reason = error instanceof PublicShowSourceError ? error.code : 'unexpected_failure'
    safeDiagnostic(logger, 'source_unavailable', { reason })
    return { ok: false, code: SAFE_ERROR_CODE, shows: [] }
  }
}
