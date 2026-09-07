const MAX_BYTES = 2 * 1024 * 1024

// Use the published thumbnail, with bounded fetching and a branded fallback.
export async function sharePortrait(photo, fetchImpl = fetch) {
  try {
    const url = new URL(photo?.thumb || photo?.url)
    if (url.protocol !== 'https:' || url.username || url.password || !['.airtableusercontent.com', '.vercel-storage.com'].some(suffix => url.hostname.endsWith(suffix))) return null
    const response = await fetchImpl(url, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (!response.ok || Number(response.headers.get('content-length')) > MAX_BYTES || !response.body) return null
    const reader = response.body.getReader()
    const chunks = []; let length = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > MAX_BYTES) { await reader.cancel(); return null }
      chunks.push(value)
    }
    const bytes = Buffer.concat(chunks)
    const type = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'jpeg'
      : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'png' : null
    return type ? `data:image/${type};base64,${bytes.toString('base64')}` : null
  } catch { return null }
}
