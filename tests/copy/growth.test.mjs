import test from 'node:test'
import assert from 'node:assert/strict'
import { subscribeFan } from '../../lib/newsletter-service.mjs'
import { parseEpisodes } from '../../lib/public/podcast-feed.mjs'
import { cleanSongCatalog } from '../../lib/public/song-catalog.mjs'
import { hubQrUrl, qrPlacements } from '../../lib/public/qr-placements.mjs'
import { publicEvent } from '../../lib/public/measurement.mjs'

test('newsletter confirmation requires a recognized provider response, and pending opt-in remains pending', async () => {
  const body = { email: 'fixture@example.invalid', city: 'Fort Worth', bands: ['elite', 'jambi'], website: '' }
  for (const [msg, status] of [['Thank you for subscribing!', 'subscribed'], ['Almost finished... We need to confirm your email address. Click the link in the email.', 'pending'], ['Request received.', 'accepted']]) {
    const result = await subscribeFan(body, { fetchImpl: async (url, options) => {
      assert.equal(url.origin, 'https://live.us2.list-manage.com')
      assert.equal(url.pathname, '/subscribe/post-json')
      assert.equal(url.searchParams.get('group[22799][4]'), '1')
      assert.equal(url.searchParams.get('group[22799][1]'), '1')
      assert.equal(url.searchParams.get('group[22799][8]'), null)
      assert.equal(url.searchParams.get('CITY'), 'Fort Worth')
      assert.equal(options.redirect, 'error')
      return new Response(`eplSignup(${JSON.stringify({ result: 'success', msg })})`)
    } })
    assert.deepEqual(result, { status: 200, body: { status } })
  }
})
test('newsletter never executes provider scripts, reflects HTML or reports failed subscriptions as success', async () => {
  const body = { email: 'fixture@example.invalid', city: '', bands: [] }
  for (const response of ['<html>provider challenge</html>', 'eplSignup({"result":"error","msg":"captcha","params":{"EMAIL":"private@example.invalid"}})', 'eplSignup({"result":"success","msg":"Thank you for subscribing!"});badCode()']) {
    const result = await subscribeFan(body, { fetchImpl: async () => new Response(response) })
    assert.ok(result.status >= 400)
    assert.equal(result.body.hosted, true)
    assert.equal(JSON.stringify(result).includes('private@example'), false)
  }
  let requests = 0
  const result = await subscribeFan({ ...body, bands: ['unknown'] }, { fetchImpl: async () => { requests++ } })
  assert.equal(result.status, 400); assert.equal(requests, 0)
})
test('podcast episodes use the actual RSS enclosure when there is no link tag and decode literal entities safely', () => {
  const [episode] = parseEpisodes('<rss><item><title>Rock &amp; Talk</title><pubDate>invalid date</pubDate><description><![CDATA[<p>We&apos;re back &#x2014; let&#39;s talk.</p>]]></description><enclosure url="https://www.buzzsprout.com/2377760/episodes/12345-rock-talk.mp3" type="audio/mpeg" /></item></rss>')
  assert.equal(episode.buzzsproutId, '12345'); assert.equal(episode.slug, 'rock-talk')
  assert.equal(episode.title, 'Rock & Talk'); assert.equal(episode.description, "We're back — let's talk."); assert.equal(episode.date, null)
})
test('the public song catalog corrects the reviewed reversal and removes duplicate display entries without mutating source records', () => {
  const songs = [{ title: 'Bush', artist: 'Machine Head', id: 'a', year: '2007' }, { title: 'Machinehead', artist: 'BUSH', id: 'b', year: '1994' }, { title: 'Other', artist: 'Machine Head', id: 'c' }]
  const clean = cleanSongCatalog(songs)
  assert.equal(clean.length, 2); assert.equal(clean[0].title, 'Machinehead'); assert.equal(clean[0].artist, 'Bush'); assert.equal(clean[0].year, '1994')
  assert.equal(songs[0].title, 'Bush'); assert.equal(clean[1].artist, 'Machine Head')
})
test('QR variants preserve printed destinations and attach only bounded placement information', () => {
  assert.equal(hubQrUrl('/elite', 'elite'), 'https://echoplay.live/elite')
  for (const [placement] of qrPlacements) {
    const url = new URL(hubQrUrl('/hub', 'hub', placement))
    assert.equal(url.origin, 'https://echoplay.live'); assert.equal(url.pathname, '/hub')
    assert.equal(url.searchParams.get('utm_content'), placement === 'standard' ? null : placement)
  }
  assert.throws(() => hubQrUrl('https://attacker.invalid', 'elite'))
  assert.throws(() => hubQrUrl('/elite', 'elite', 'private@example.invalid'))
  assert.deepEqual(publicEvent('Upload completed', { band: 'elite', token: 'private', email: 'private', filename: 'private.jpg' }), { name: 'upload_completed', fields: { band: 'elite' } })
})
