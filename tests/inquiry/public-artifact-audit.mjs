// Read-only checks of an already running, credential-free local production build.
import assert from 'node:assert/strict'

const base = process.env.EPL_TEST_URL || 'http://127.0.0.1:3107'
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))
  throw new Error('Local test server required')

const chunks = new Set()
// React's public `reconcilerVersion` property also happens to be 17 characters.
const privateId = /\b(?:rec|tbl|fld)(?!oncilerVersion\b)[a-zA-Z0-9]{14}\b|appYUOoJgvRyZ7fLB/
for (const route of ['/', '/bands', '/bands/jambi', '/shows', '/contact']) {
  const response = await fetch(base + route, { signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200, route)
  const html = await response.text()
  assert.equal(privateId.test(html), false, `${route}: internal source identifier in HTML`)
  for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    if (match[1].startsWith('/_next/static/')) chunks.add(match[1])
  }
}
assert.ok(chunks.size > 0, 'No client bundles discovered')
for (const chunk of chunks) {
  const response = await fetch(base + chunk, { signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200, chunk)
  assert.equal(privateId.test(await response.text()), false, `${chunk}: internal source identifier`)
}
console.log(`PASS public HTML and ${chunks.size} client bundles contain no Airtable source identifiers`)

for (const slug of ['so-long-goodnight', 'the-dick-beldings', 'jambi', 'elite']) {
  const response = await fetch(`${base}/api/press/${slug}`, {
    signal: AbortSignal.timeout(20000),
  })
  assert.equal(response.status, 200, slug)
  assert.match(response.headers.get('content-type'), /application\/pdf/)
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-', slug)
  console.log(`PASS ${slug} press PDF: ${bytes.length} bytes`)
}
