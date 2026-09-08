import test from 'node:test'
import assert from 'node:assert/strict'
import { publicEvent, withoutQuery, publicCampaign } from '../../lib/public/measurement.mjs'
import { pageMetadata, bandSearchCopy } from '../../lib/public/seo.mjs'
import { publicShowToEventJsonLd } from '../../lib/public/shows-contract.mjs'

test('measurement drops private fields and distinguishes intent from completed outcomes', () => {
  assert.deepEqual(publicEvent('Ticket click', { band: 'elite', email: 'private@example.invalid', message: 'private', show: 'recPrivateRecord1', url: 'https://example.invalid/?email=private' }), { name: 'ticket_click', fields: { band: 'elite' } })
  assert.equal(publicEvent('Booking inquiry sent').name, 'generate_lead')
  assert.equal(publicEvent('Newsletter form submitted').name, 'newsletter_form_submitted')
  assert.equal(publicEvent('Purchase'), null)
  assert.equal(withoutQuery('https://echoplay.live/contact?email=private#form'), 'https://echoplay.live/contact')
  assert.equal(withoutQuery('not-a-url'), '')
  assert.deepEqual(publicCampaign('https://echoplay.live/shows?utm_source=facebook&utm_campaign=jambi-sept26&email=private@example.com&utm_content=private@example.com'), { campaign_source: 'facebook', campaign_name: 'jambi-sept26' })
})

test('band previews explicitly carry their own copy, artwork and canonical URLs', () => {
  const titles = new Set()
  for (const [slug, copy] of Object.entries(bandSearchCopy)) {
    const m = pageMetadata({ ...copy, path: `/bands/${slug}`, image: `/social/${slug}.png` })
    assert.equal(m.alternates.canonical, `/bands/${slug}`)
    assert.equal(m.openGraph.description, copy.description)
    assert.equal(m.twitter.description, copy.description)
    assert.equal(m.twitter.images[0], `/social/${slug}.png`)
    titles.add(m.title)
  }
  assert.equal(titles.size, 4)
  const hub = pageMetadata({ title: 'Elite links', description: 'Shows and music', path: '/elite', canonical: '/bands/elite', noindex: true })
  assert.equal(hub.robots.index, false)
  assert.equal(hub.alternates.canonical, '/bands/elite')
  assert.equal(hub.openGraph.url, 'https://echoplay.live/elite')
})

test('event schema parses a verified complete address without inventing missing facts', () => {
  const show = { id: 'show_abcdefghijklmnopqrstuv', date: '2026-09-26', state: 'scheduled', bands: [{ name: 'Jambi', slug: 'jambi' }], venue: { name: 'Haltom Theater', address: '5601 E Belknap St, Haltom City, TX 76117' } }
  const m = publicShowToEventJsonLd(show)
  assert.deepEqual(m.location.address, { '@type': 'PostalAddress', streetAddress: '5601 E Belknap St', addressLocality: 'Haltom City', addressRegion: 'TX', postalCode: '76117', addressCountry: 'US' })
  assert.equal(m.startDate, '2026-09-26')
  assert.equal(m.endDate, undefined)
  assert.equal(m.doorTime, undefined)
  assert.equal(m.offers, undefined)
  assert.equal(publicShowToEventJsonLd({ ...show, venue: { name: 'Hall' } }).location.address, undefined)
})
