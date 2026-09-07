import test from 'node:test'
import assert from 'node:assert/strict'
import { sharePortrait } from '../../lib/public/share-portrait.mjs'

test('share portraits prefer supported thumbnails and reject expired, oversized or unsupported files', async () => {
  const photo = { thumb: 'https://v5.airtableusercontent.com/thumbnail', url: 'https://v5.airtableusercontent.com/original' }
  const valid = await sharePortrait(photo, async (url) => {
    assert.equal(url.pathname, '/thumbnail')
    return new Response(new Uint8Array([255, 216, 255, 224, 0, 16]))
  })
  assert.match(valid, /^data:image\/jpeg;base64,/)
  assert.equal(await sharePortrait(photo, async () => new Response('Expired', { status: 403 })), null)
  assert.equal(await sharePortrait(photo, async () => new Response('unsupported file')), null)
  assert.equal(await sharePortrait(photo, async () => new Response(new Uint8Array(2 * 1024 * 1024 + 1))), null)
})

test('share portraits do not fetch internal or unapproved destinations', async () => {
  let requests = 0
  for (const url of ['http://127.0.0.1/private', 'https://example.invalid/image', 'https://user:password@v5.airtableusercontent.com/image']) {
    assert.equal(await sharePortrait({ thumb: url }, async () => { requests++; throw new Error('must not fetch') }), null)
  }
  assert.equal(requests, 0)
})
