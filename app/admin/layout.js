export const metadata = {
  title: 'Admin Command Center | Echo Play Live',
  description: 'Private Echo Play Live admin command center.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'none',
      'max-snippet': 0,
    },
  },
}

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      {children}
    </div>
  )
}
