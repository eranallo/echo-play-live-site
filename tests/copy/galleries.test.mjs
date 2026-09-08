import test from 'node:test'
import assert from 'node:assert/strict'
import { galleryApiPayload, getBandGallery } from '../../lib/public/gallery.mjs'
import { galleryImageLoader } from '../../lib/public/gallery-image.mjs'

test('galleries expose only reviewed public bands, including hostile lookup keys', () => {
  for (const slug of ['elite', 'jambi', 'so-long-goodnight', 'the-dick-beldings']) {
    const gallery = getBandGallery(slug)
    assert.ok(gallery.photos.length >= 5)
    const result = galleryApiPayload(slug)
    assert.equal(result.count, gallery.photos.length)
    assert.equal(new Set(result.images.map(p => p.id)).size, result.count)
    for (const photo of result.images) {
      assert.deepEqual(Object.keys(photo).sort(), ['album', 'alt', 'credit', 'filename', 'height', 'id', 'src', 'url', 'width'].sort())
      assert.ok(photo.alt && photo.credit && photo.album)
      assert.ok(photo.width >= 960 && photo.height > 0)
      assert.match(photo.src, new RegExp(`/website-media/20260908/${slug}/[a-f0-9]{12}-1920\\.webp$`))
      assert.equal(photo.url, photo.src)
    }
    assert.doesNotMatch(JSON.stringify(result), /drive\.google|sourceId|sourceUrl|\/private\/|GPS/)
  }
  for (const slug of ['limewyre', 'corestalgia', '../elite', '__proto__', 'constructor', 'toString', '', undefined]) {
    assert.equal(getBandGallery(slug), null)
    assert.equal(galleryApiPayload(slug), null)
  }
})

test('responsive images resolve to prepared variants without arbitrary transformations', () => {
  const src = 'https://wkqcpwrvrb9fa0hy.public.blob.vercel-storage.com/website-media/20260908/elite/123456abcdef-1920.webp'
  for (const [width, expected] of [[320,480],[480,480],[481,960],[960,960],[961,1920],[3840,1920]]) {
    assert.equal(galleryImageLoader({src, width}), src.replace('-1920.webp', `-${expected}.webp`))
  }
})
