'use client'
import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { withoutQuery, publicCampaign } from '@/lib/public/measurement.mjs'
import VendorTags from './VendorTags'

const configuredId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
const measurementId = /^G-[A-Z0-9]+$/.test(configuredId) ? configuredId : ''
const redact = event => ({ ...event, url: withoutQuery(event.url) })
const choiceKey = 'epl:measurement-choice:v1'
const optionalTools = Boolean(measurementId || process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID)

export default function SiteMeasurement() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [choice, setChoice] = useState(null)
  const [showChoices, setShowChoices] = useState(false)
  const previousPath = useRef(null)
  useEffect(() => {
    let saved = null
    try { saved = localStorage.getItem(choiceKey) } catch {}
    setChoice(['allowed', 'declined'].includes(saved) ? saved : 'unset')
    const open = () => setShowChoices(true)
    window.addEventListener('epl:measurement-choices', open)
    return () => window.removeEventListener('epl:measurement-choices', open)
  }, [])
  function choose(next) {
    try { localStorage.setItem(choiceKey, next) } catch {}
    setShowChoices(false)
    if (choice === 'allowed' && next === 'declined') {
      window.location.reload()
      return
    }
    setChoice(next)
  }
  useEffect(() => {
    if (!ready || choice !== 'allowed' || !measurementId || !pathname || previousPath.current === pathname) return
    const page = `${window.location.origin}${pathname}`
    const referrer = previousPath.current ? `${window.location.origin}${previousPath.current}` : withoutQuery(document.referrer)
    window.gtag('event', 'page_view', { page_location: page, page_title: document.title, page_referrer: referrer, ...publicCampaign(window.location.href) })
    previousPath.current = pathname
  }, [pathname, ready, choice])
  return <>
    <Analytics beforeSend={redact} />
    <SpeedInsights beforeSend={redact} />
    {choice === 'allowed' && <VendorTags />}
    {choice === 'allowed' && measurementId && <>
      <Script id="epl-google-measurement" strategy="afterInteractive" onReady={() => setReady(true)}>{`
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){window.dataLayer.push(arguments);};
        gtag('js', new Date());
        gtag('config', ${JSON.stringify(measurementId)}, {send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname, page_referrer: document.referrer.split(/[?#]/)[0]});
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    </>}
    {optionalTools && (choice === 'unset' || showChoices) && <aside className="measurement-choice" aria-label="Optional cookie choices">
      <div><strong>A quick choice about cookies.</strong><p>Optional analytics and advertising cookies help us understand visits and booking activity. The site works either way. <a href="/privacy">Privacy details</a>.</p></div>
      <div className="button-row"><button className="button button-outline" onClick={() => choose('declined')}>Essential only</button><button className="button" onClick={() => choose('allowed')}>Allow optional cookies</button></div>
    </aside>}
  </>
}
