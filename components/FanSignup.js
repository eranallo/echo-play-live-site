'use client'
import { useId, useState, useRef } from 'react'
import Link from 'next/link'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
import { newsletterForm, validNewsletterForm } from '@/lib/public/newsletter-config.mjs'
import TrackedLink from './TrackedLink'
import { track } from '@/lib/track'

export default function FanSignup({ bandSlug = '', compact = false }) {
  const id = useId()
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [hosted, setHosted] = useState(false)
  const statusRef = useRef(null)
  const selected = publicBandPresentation.find((band) => band.slug === bandSlug)
  const enabled = validNewsletterForm(newsletterForm)
  async function submit(event) {
    if (event.nativeEvent.submitter?.dataset.hosted === 'true') return
    event.preventDefault()
    if (state === 'sending') return
    const fields = new FormData(event.currentTarget)
    setState('sending'); setError(''); setHosted(false)
    track('Newsletter form submitted', { band: bandSlug })
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        email: fields.get('EMAIL'), city: fields.get('CITY') || '', website: fields.get(newsletterForm.honeypot) || '',
        bands: Object.entries(newsletterForm.bands).filter(([, field]) => fields.has(field.name)).map(([slug]) => slug),
      }), signal: AbortSignal.timeout(15000) })
      const data = await response.json()
      if (!response.ok) { setHosted(Boolean(data.hosted)); throw new Error(data.error || 'Please try again.') }
      if (!['subscribed', 'pending', 'accepted'].includes(data.status)) throw new Error('We couldn’t confirm your signup. Please try again.')
      setState(data.status)
      track(data.status === 'subscribed' ? 'Newsletter confirmed' : 'Newsletter accepted', { band: bandSlug })
      requestAnimationFrame(() => statusRef.current?.focus())
    } catch (error) { setState('error'); setError(error.name === 'TimeoutError' ? 'We couldn’t confirm your signup. You can finish directly with Mailchimp.' : error.message); if (error.name === 'TimeoutError') setHosted(true) }
  }
  return (
    <section
      id={compact ? undefined : 'stay-in-loop'}
      className={`fan-signup ${compact ? 'fan-signup-compact' : 'shell section-bottom'}`}
    >
      <div className="fan-signup-inner">
        <div>
          <p className="eyebrow">Show updates</p>
          <h2>
            {selected
              ? `Get ${selected.shortName} updates.`
              : 'We’ll let you know when we’re playing.'}
          </h2>
          <p>
            {enabled
              ? 'Choose the bands you want to hear from, and we’ll email you show announcements and news.'
              : 'Follow your favorites on Bandsintown for their next show announcement.'}
          </p>
        </div>
        {['subscribed', 'pending', 'accepted'].includes(state) ? <div className="signup-thanks" role="status" tabIndex={-1} ref={statusRef}>
          <h3>{state === 'subscribed' ? 'You’re on the list.' : state === 'pending' ? 'Check your inbox.' : 'Thanks for signing up.'}</h3>
          <p>{state === 'subscribed' ? 'Thanks for keeping up with us. We’ll see you at a show.' : 'Mailchimp received your signup. If a confirmation email arrives, follow its link to finish joining the list.'}</p>
          <Link className="text-link" href={bandSlug ? `/shows?band=${bandSlug}` : '/shows'}>Find your next show ↗</Link>
        </div> : enabled ? (
          <form
            onSubmit={submit}
            action={newsletterForm.action}
            method="post"
            target="_blank"
            rel="noopener noreferrer"
            className="fan-signup-form"
          >
            <label htmlFor={`${id}-email`}>Email address</label>
            <input
              id={`${id}-email`}
              name="EMAIL"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
            {newsletterForm.bands && (
              <fieldset>
                <legend>Your bands</legend>
                <div className="fan-band-choices">
                  {publicBandPresentation
                    .filter((band) => newsletterForm.bands[band.slug])
                    .map((band) => (
                      <label key={band.slug}>
                        <input
                          type="checkbox"
                          name={newsletterForm.bands[band.slug].name}
                          value={newsletterForm.bands[band.slug].value}
                          defaultChecked={band.slug === bandSlug}
                        />
                        {band.name}
                      </label>
                    ))}
                </div>
              </fieldset>
            )}
            {newsletterForm.cityField && (
              <>
                <label htmlFor={`${id}-city`}>
                  City <span className="muted">(optional)</span>
                </label>
                <input
                  id={`${id}-city`}
                  name={newsletterForm.cityField}
                  maxLength={100}
                  autoComplete="address-level2"
                />
              </>
            )}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor={`${id}-extra`}>Leave blank</label>
              <input
                id={`${id}-extra`}
                name={newsletterForm.honeypot}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <p className="form-note">
              By subscribing, you agree to receive Echo Play Live emails. Unsubscribe anytime.
              Mailchimp manages the list. <Link href="/privacy">Privacy</Link>.
            </p>
            {error && <p role="alert" className="form-note">{error}</p>}
            <button className="button" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Joining the list…' : 'Keep me in the loop ↗'}
            </button>
            {hosted && <button type="submit" className="text-link" data-hosted="true">Finish on Mailchimp ↗</button>}
          </form>
        ) : (
          <div className="fan-follow-links">
            {(selected ? [selected] : publicBandPresentation).map((band) => (
              <TrackedLink
                key={band.slug}
                href={band.bandsintown}
                event="Follow band"
                band={band.slug}
                target="_blank"
                rel="noopener noreferrer"
              >
                {band.name}
                <span aria-hidden="true">↗</span>
              </TrackedLink>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
