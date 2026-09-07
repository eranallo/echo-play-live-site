import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Link className="wordmark" href="/" aria-label="Echo Play Live home">
            <BrandLogo size={112} />
          </Link>
          <p>
            Good music. Great people.
            <br />
            Nights that stay with you.
          </p>
          <span className="muted">Fort Worth, Texas · Est. 2023</span>
        </div>
        <div>
          <h2>The bands</h2>
          {publicBandPresentation.map((b) => (
            <Link key={b.slug} href={`/bands/${b.slug}`}>
              {b.name}
            </Link>
          ))}
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/shows">Find a show</Link>
          <Link href="/about">Our story</Link>
          <Link href="/musicians">Meet the musicians</Link>
          <Link href="/podcast">Echo Play Podcast</Link>
          <Link href="/shows#stay-in-loop">Stay in the loop</Link>
        </div>
        <div>
          <h2>Let’s make a night of it.</h2>
          <Link href="/contact">Booking inquiries ↗</Link>
          <Link href="/press">Press & band kits</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Echo Play Live.</span>
        <span>Quality. Hustle. Love for the show.</span>
      </div>
    </footer>
  )
}
