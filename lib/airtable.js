// Phase 38e — Single source of truth for Airtable base + table IDs.
//
// Before this file existed, the base ID and table IDs were hardcoded across
// 5 different route + lib files. Rename a table or rotate to a new base, and
// you had to hunt them all down. Now they live here.
//
// Note: these are NOT secrets. Airtable's security model relies on the API
// token, not on hiding base/table IDs. Anyone with the token can do anything;
// anyone without the token can do nothing regardless of what IDs they know.
// We keep IDs in source for cleaner change management.

export const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'

// All known tables in the Echo Play Live base.
// When a new table is added that needs code access, add it here first, then
// import { TABLES } from '@/lib/airtable' in your route or lib file.
export const TABLES = {
  SHOWS:      'tblSFV8wY62hD7kCW',
  BANDS:      'tble6HQKSixIUdGcH',
  MEMBERS:    'tbliQzVzmfMfcNpjI',
  VENUES:     'tbleV69KlU8tygF5B',
  INQUIRIES:  'tbliRPed3vD70R476',
  SONGS:      'tblrC2brkr3mVNnl1',
  UPLOADS:    'tblCwq9vUEORSXNKg',  // Phase 26: fan upload portal
}

// SONG_REQUESTS comes from an env var because the table was added after the
// initial release and the env-var bootstrap is still wired through Vercel.
// Returns null if not set; callers should return 500 with a helpful message.
export function getSongRequestsTableId() {
  return process.env.AIRTABLE_SONG_REQUESTS_TABLE_ID || null
}

// Build the v0 REST API URL for a given table ID.
// Usage: const url = tableUrl(TABLES.INQUIRIES)
export function tableUrl(tableId) {
  return `https://api.airtable.com/v0/${AIRTABLE_BASE}/${tableId}`
}

// Standard Airtable auth header given an API token.
// Usage: fetch(url, { headers: { ...authHeaders(token), 'Content-Type': 'application/json' } })
export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}
