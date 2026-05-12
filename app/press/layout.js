// Server-component layout. Provides per-route metadata since the page itself
// is a 'use client' component and can't export metadata directly.

export const metadata = {
  title: 'Press & EPK',
  description: 'Echo Play Live press kit — band one-pagers, logo downloads, photos, and booking contacts for all four bands: So Long Goodnight, The Dick Beldings, Jambi, and Elite.',
  alternates: { canonical: '/press' },
  openGraph: {
    title: 'Echo Play Live · Press & EPK',
    description: 'Download band one-pager PDFs, logo files, and booking contacts for Echo Play Live\'s tribute and cover bands.',
    url: 'https://echoplay.live/press',
  },
}

export default function PressLayout({ children }) {
  return children
}
