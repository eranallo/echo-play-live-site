'use client'

import Script from 'next/script'

const A = process.env.NEXT_PUBLIC_META_PIXEL_ID
const B = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

export default function VendorTags() {
  return (
    <>
      {A && <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />}
      {B && <Script src="https://analytics.tiktok.com/i18n/pixel/events.js" strategy="afterInteractive" />}
    </>
  )
}
