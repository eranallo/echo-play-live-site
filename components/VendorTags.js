'use client'

import Script from 'next/script'
import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const A = process.env.NEXT_PUBLIC_META_PIXEL_ID
const B = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

function pagePath(pathname, searchParams) {
  const query = searchParams?.toString()
  return `${pathname || '/'}${query ? `?${query}` : ''}`
}

function VendorTagsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentPath = pagePath(pathname, searchParams)
    if (A && window.fbq) window.fbq('track', 'PageView', { page_path: currentPath })
    if (B && window.ttq?.page) window.ttq.page()
  }, [pathname, searchParams])

  useEffect(() => {
    const onClick = event => {
      const target = event.target?.closest?.('a, button')
      if (!target) return

      const href = target.getAttribute('href') || ''
      const label = (target.textContent || '').trim().slice(0, 120)
      const combined = `${href} ${label}`.toLowerCase()

      if (!combined.includes('ticket') && !combined.includes('bandsintown') && !combined.includes('eventbrite') && !combined.includes('prekindle')) return

      const params = { link_url: href, link_text: label, page_path: window.location.pathname }
      if (A && window.fbq) window.fbq('trackCustom', 'TicketClick', params)
      if (B && window.ttq?.track) window.ttq.track('ClickButton', params)
    }

    const onSubmit = event => {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return
      if (window.location.pathname !== '/contact') return

      const params = { content_name: 'Booking Inquiry', page_path: window.location.pathname }
      if (A && window.fbq) window.fbq('track', 'Lead', params)
      if (B && window.ttq?.track) window.ttq.track('SubmitForm', params)
    }

    document.addEventListener('click', onClick, { capture: true })
    document.addEventListener('submit', onSubmit, { capture: true })
    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      document.removeEventListener('submit', onSubmit, { capture: true })
    }
  }, [])

  return null
}

export default function VendorTags() {
  return (
    <>
      <Suspense fallback={null}>
        <VendorTagsInner />
      </Suspense>
      {A && (
        <Script id="meta-init" strategy="afterInteractive">
          {`
            window.fbq=window.fbq||function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};
            window.fbq('init','${A}');
            window.fbq('track','PageView');
          `}
        </Script>
      )}
      {A && <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />}
      {B && (
        <Script id="tt-init" strategy="afterInteractive">
          {`
            window.TiktokAnalyticsObject='ttq';
            window.ttq=window.ttq||[];
            ['page','track','identify','ready'].forEach(function(m){window.ttq[m]=window.ttq[m]||function(){window.ttq.push([m].concat([].slice.call(arguments)))}});
            var s=document.createElement('script');s.async=true;s.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${B}&lib=ttq';document.head.appendChild(s);
            window.ttq.page();
          `}
        </Script>
      )}
    </>
  )
}
