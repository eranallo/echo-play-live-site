// Venue Wi-Fi and carrier networks can share an address. Keep the rolling
// storage/operation budget while allowing a crowd to use the same connection.
export const UPLOAD_QUOTA = Object.freeze({ monthlySubmissions: 150, dailySubmissions: 80, dailyPerNetwork: 40, dailyBytes: 100_000_000_000, monthlyBytes: 1_000_000_000_000 })
export function checkUploadQuota(reservations, { id, total, ip, now }) {
  const active = reservations.filter(r => r.at > now - 31 * 86400000)
  const existing = active.find(r => r.id === id)
  if (existing) return { code: existing.total === total ? 'reserved' : 'session_conflict', active }
  const today = active.filter(r => r.at > now - 86400000)
  const q = UPLOAD_QUOTA
  const full = active.length >= q.monthlySubmissions || today.length >= q.dailySubmissions ||
    today.filter(r => r.ip === ip).length >= q.dailyPerNetwork ||
    today.reduce((n, r) => n + r.total, 0) + total > q.dailyBytes ||
    active.reduce((n, r) => n + r.total, 0) + total > q.monthlyBytes
  return { code: full ? 'upload_quota' : 'available', active }
}
