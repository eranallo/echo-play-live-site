'use client'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { usePathname } from 'next/navigation'

const links = [
  ['Home', '/'],
  ['Bands', '/bands'],
  ['Shows', '/shows'],
  ['Song requests', '/requests'],
  ['Band kits', '/press'],
  ['Our story', '/about'],
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="wordmark" href="/" aria-label="Echo Play Live home">
          <BrandLogo size={44} />
          <span className="scene-wordmark">Echo Play Live</span>
        </Link>
        <div className="nav-actions">
          <Link className="button button-small" href="/contact"
            aria-current={pathname === '/contact' ? 'page' : undefined}>
            Book a band <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <nav className="scene-tabs" aria-label="Main navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href}
            aria-current={pathname === href ? 'page'
              : href !== '/' && pathname?.startsWith(href + '/') ? 'location' : undefined}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
