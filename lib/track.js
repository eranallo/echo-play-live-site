'use client'
import { track as vercelTrack } from '@vercel/analytics'
import { publicEvent } from './public/measurement.mjs'

export function track(name, context) {
  const event = publicEvent(name, context)
  if (!event || typeof window === 'undefined') return
  try {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && window.gtag) window.gtag('event', event.name, event.fields)
    if (process.env.NEXT_PUBLIC_VERCEL_CUSTOM_EVENTS === 'true') vercelTrack(name, event.fields)
  } catch { /* Measurement must never prevent the visitor's action. */ }
}
