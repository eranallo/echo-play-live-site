import { pageMetadata } from '@/lib/public/seo.mjs'
// Server-component layout. Provides per-route metadata since the page itself
// is a 'use client' component and can't export metadata directly.

export const metadata = pageMetadata({"title": "Our Story", "description": "We’re musicians, too. Meet Echo Play Live, the Fort Worth team handling booking and coordination for four DFW tribute and cover bands.", "path": "/about"})

export default function AboutLayout({ children }) {
  return children
}
