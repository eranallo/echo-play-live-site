'use client'
import { useId } from 'react'
import Link from 'next/link'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
import { newsletterForm, validNewsletterForm } from '@/lib/public/newsletter-config.mjs'
import TrackedLink from './TrackedLink'

export default function FanSignup({ bandSlug = '', compact = false }) {
  const id = useId()
  const selected = publicBandPresentation.find((band) => band.slug === bandSlug)
  const enabled = validNewsletterForm(newsletterForm)
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
        {enabled ? (
          <form
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
              Mailchimp handles signup in a new tab. <Link href="/privacy">Privacy</Link>.
            </p>
            <button className="button" type="submit">
              Keep me in the loop ↗
            </button>
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
