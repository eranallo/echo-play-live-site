'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/track'
const metaRaw = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim()
const tikRaw = (process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '').trim()
const meta = /^\d+$/.test(metaRaw) ? metaRaw : ''
const tiktok = /^[A-Za-z0-9]+$/.test(tikRaw) ? tikRaw : ''
export default function VendorTags() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!ready) return
    if (meta && window.fbq) window.fbq('track', 'PageView', { page_path: pathname })
    if (tiktok && window.ttq?.page) window.ttq.page()
  }, [pathname, ready])
  useEffect(() => {
    const ticket = (e) => {
      const a = e.target?.closest?.('a')
      if (!a) return
      if (a.getAttribute('data-epl-event') !== 'Ticket click') return
      const data = { page_path: window.location.pathname }
      if (meta && window.fbq) window.fbq('trackCustom', 'TicketClick', data)
      if (tiktok && window.ttq?.track) window.ttq.track('ClickButton', data)
    }
    const saved = () => {
      track('Booking inquiry sent')
      const data = { content_name: 'Booking Inquiry', page_path: window.location.pathname }
      if (meta && window.fbq) window.fbq('track', 'Lead', data)
      if (tiktok && window.ttq?.track) window.ttq.track('SubmitForm', data)
    }
    document.addEventListener('click', ticket)
    window.addEventListener('epl:inquiry-sent', saved)
    return () => {
      document.removeEventListener('click', ticket)
      window.removeEventListener('epl:inquiry-sent', saved)
    }
  }, [])
  if (!meta && !tiktok) return null
  return (
    <Script id="epl-measurement" strategy="afterInteractive" onReady={() => setReady(true)}>{`
 ${meta ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(meta)});` : ''}
 ${tiktok ? `window.TiktokAnalyticsObject='ttq';window.ttq=window.ttq||[];['page','track','identify','ready'].forEach(function(m){window.ttq[m]=window.ttq[m]||function(){window.ttq.push([m].concat([].slice.call(arguments)))}});var t=document.createElement('script');t.async=true;t.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${tiktok}&lib=ttq';document.head.appendChild(t);` : ''}
 `}</Script>
  )
}
