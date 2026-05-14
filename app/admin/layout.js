// Phase 35 — Admin section gate.
//
// Light-touch auth via env-var key in the URL query string (?key=...).
// Full auth (sessions, etc.) is out of scope for v1; this protects the
// admin route from casual discovery and search-engine indexing without
// requiring a user-account system. To rotate the key, update the env var
// in Vercel and restart the deploy.

export const metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {children}
    </div>
  )
}
