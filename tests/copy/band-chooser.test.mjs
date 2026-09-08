import test from 'node:test'
import assert from 'node:assert/strict'
import {chooseBands,chooserInquiry} from '../../lib/public/band-chooser.mjs'
test('music preference selects its actual band without claiming event availability',()=>{
  for(const [music,slug] of [['90s','the-dick-beldings'],['emo','so-long-goodnight'],['tool','jambi'],['deftones','elite']]) assert.equal(chooseBands({music,audience:'covers'})[0].slug,slug)
  assert.equal(chooseBands({audience:'tribute'}).length,2)
  assert.equal(chooseBands({audience:'covers'}).length,2)
  assert.equal(chooseBands().length,4)
})
test('chooser links prefill only approved bands and known event types',()=>{
  const good=new URL(chooserInquiry('jambi','Private Event'),'https://echoplay.live')
  assert.equal(good.searchParams.get('band'),'jambi');assert.equal(good.searchParams.get('event'),'Private Event')
  const bad=new URL(chooserInquiry('hidden','<script>'),'https://echoplay.live')
  assert.equal(bad.pathname,'/contact');assert.equal(bad.searchParams.get('band'),null);assert.equal(bad.searchParams.get('event'),null)
})
