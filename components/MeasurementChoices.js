'use client'
export default function MeasurementChoices() {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !process.env.NEXT_PUBLIC_META_PIXEL_ID && !process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID) return null
  return <button className="text-link" onClick={() => window.dispatchEvent(new Event('epl:measurement-choices'))}>Change optional cookie choices</button>
}
