import test from 'node:test'
import assert from 'node:assert/strict'
import { getLinkHub, linkHubs, nextHubShow } from '../../lib/public/link-hubs.mjs'

test('the five existing QR destinations remain stable and unknown acts stay unavailable', () => {
  assert.deepEqual(
    linkHubs.map((hub) => hub.path),
    ['/hub', '/so-long-goodnight', '/the-dick-beldings', '/jambi', '/elite'],
  )
  assert.equal(getLinkHub('not-a-band'), null)
  assert.equal(getLinkHub('limewyre'), null)
  assert.equal(getLinkHub('../elite'), null)
})

test('every band hub links to its own songs, booking and press resources', () => {
  for (const hub of linkHubs.filter((hub) => hub.slug !== 'hub')) {
    const links = hub.links.map((link) => link[2])
    assert.ok(links.includes(`/bands/${hub.slug}#music`))
    assert.ok(links.includes(`/contact?band=${hub.slug}`))
    assert.ok(links.includes(`/press/${hub.slug}`))
    assert.ok(Object.values(hub.social).every((url) => url.startsWith('https://')))
  }
})

test('next-show cards skip canceled shows and respect the selected band', () => {
  const shows = [
    { id: 'canceled', state: 'canceled', bands: [{ slug: 'elite' }] },
    { id: 'other-band', state: 'scheduled', bands: [{ slug: 'jambi' }] },
    { id: 'elite-show', state: 'scheduled', bands: [{ slug: 'elite' }] },
  ]
  assert.equal(nextHubShow(shows, 'elite').id, 'elite-show')
  assert.equal(nextHubShow(shows, 'hub').id, 'other-band')
  assert.equal(nextHubShow(shows, 'so-long-goodnight'), null)
  assert.equal(nextHubShow(shows, 'not-a-band'), null)
})
