import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { reviewedCopy } from '../../lib/public/editorial-copy.mjs'

const baseline = JSON.parse(readFileSync(new URL('../fixtures/copy-source.json', import.meta.url)))

test('the reviewed public biography receives its website copy edit', () => {
  const result = reviewedCopy(baseline.key, baseline.source)
  assert.match(result, /^Evan Ranallo is a guitarist, bassist and the founder of Echo Play Live\./)
  assert.doesNotMatch(result, /producer-minded|driving forces|bigger vision/)
  assert.equal(reviewedCopy(baseline.key, baseline.source.replaceAll(' ', '  ')), result)
})

test('a later source-owner edit takes precedence over the website version', () => {
  const updated = baseline.source + '\nAn update from the profile owner.'
  assert.equal(reviewedCopy(baseline.key, updated), updated)
})

test('removing a biography does not republish a saved website version', () => {
  for (const source of [null, undefined, '', '   ']) {
    assert.equal(reviewedCopy(baseline.key, source), source)
  }
})

test('profiles outside the reviewed set keep their original wording', () => {
  assert.equal(reviewedCopy('musician:unreviewed', baseline.source), baseline.source)
})
