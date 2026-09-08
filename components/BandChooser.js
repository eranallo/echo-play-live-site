'use client'
import { useId, useState } from 'react'
import Link from 'next/link'
import { musicChoices, audienceChoices, eventChoices, chooseBands, chooserInquiry } from '@/lib/public/band-chooser.mjs'
import { track } from '@/lib/track'

export default function BandChooser() {
  const id = useId()
  const [music, setMusic] = useState('any')
  const [audience, setAudience] = useState('any')
  const [event, setEvent] = useState('')
  const matches = chooseBands({music, audience})
  return (
    <section id="find-band" className="shell section-bottom band-chooser" aria-labelledby={`${id}-title`}>
      <div className="chooser-intro">
        <p className="eyebrow">Planning a show?</p>
        <h2 id={`${id}-title`}>Find your band.</h2>
        <p>Start with the music your crowd wants to hear. We’ll take it from there.</p>
      </div>
      <div className="chooser-layout">
        <div className="chooser-questions">
          <fieldset>
            <legend>What music do you have in mind?</legend>
            <div className="chooser-music">
              {musicChoices.map(([value, label]) => <label key={value}>
                <input type="radio" name={`${id}-music`} value={value} checked={music === value} onChange={() => setMusic(value)} />
                <span>{label}</span>
              </label>)}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor={`${id}-audience`}>Who’s coming?</label>
            <select id={`${id}-audience`} value={audience} onChange={e => setAudience(e.target.value)}>
              {audienceChoices.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${id}-event`}>What are you planning?</label>
            <select id={`${id}-event`} value={event} onChange={e => setEvent(e.target.value)}>
              <option value="">Still working out the details</option>
              {eventChoices.map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
        </div>
        <div className="chooser-results">
          <p className="chooser-result-count" role="status">{matches.length === 1 ? 'Start with this band.' : `${matches.length} bands to check out.`}</p>
          {music !== 'any' && audience !== 'any' && matches[0].audience !== audience && <p className="chooser-note">Your music choice points here. If you want a different mix of artists, Evan can help you work through it.</p>}
          <div className="chooser-cards">
            {matches.map(band => <article key={band.slug} className="chooser-card">
              <h3>{band.name}</h3>
              <p>{band.description}</p>
              <div className="inline-links">
                <Link href={`/bands/${band.slug}`}>Meet the band ↗</Link>
                <Link href={chooserInquiry(band.slug,event)} onClick={() => track('Band chooser inquiry',{band:band.slug})}>Ask about a date ↗</Link>
              </div>
            </article>)}
          </div>
          <p className="chooser-note">Availability, pricing and production details are confirmed with Evan. <Link href={chooserInquiry('',event)}>Tell him what you’re planning ↗</Link></p>
        </div>
      </div>
    </section>
  )
}
