// Run against a credential-free local production server only.
import assert from 'node:assert/strict'
const base = process.env.EPL_TEST_URL || 'http://127.0.0.1:3107'
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))
  throw new Error('Local test server required')
for (const path of [
  '/',
  '/bands',
  '/bands/jambi',
  '/shows',
  '/contact',
  '/about',
  '/press',
  '/podcast',
  '/musicians',
  '/privacy',
  '/sitemap.xml',
  '/robots.txt',
]) {
  const r = await fetch(base + path)
  assert.equal(r.status, 200, path)
  console.log(`PASS ${path}`)
}
for (const path of [
  '/admin',
  '/admin/availability',
  '/portal',
  '/portal/member/example',
  '/api/admin/tasks',
]) {
  const r = await fetch(base + path)
  assert.equal(r.status, 404, path)
  console.log(`REMOVED ${path}`)
}
const api = await fetch(base + '/api/shows')
assert.equal(api.status, 503)
assert.match(api.headers.get('cache-control'), /no-store/)
assert.deepEqual((await api.json()).shows, [])
console.log('PASS missing show credentials fail closed')
const request = await fetch(base + '/api/inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: base },
  body: JSON.stringify({
    name: 'Fixture',
    email: 'fixture@example.com',
    message: 'Local test only',
    requestId: 'a03e22d1-43a0-4ac5-8cc8-2b405aa6d801',
  }),
})
assert.equal(request.status, 503)
assert.notEqual((await request.json()).success, true)
console.log('PASS missing inquiry credentials never report success')
const reject = await fetch(base + '/api/inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'https://example.invalid' },
  body: '{}',
})
assert.equal(reject.status, 403)
console.log('PASS cross-origin inquiry rejected')
