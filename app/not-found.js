import Link from 'next/link'
import { Page, Intro } from '@/components/SiteParts'
export default function NotFound() {
  return (
    <Page>
      <Intro
        eyebrow="404 · Page not found"
        title={
          <>
            Let’s get you
            <br />
            back to the music.
          </>
        }
      >
        <p>We couldn’t find this page. Use the links below to find a band or an upcoming show.</p>
      </Intro>
      <div className="shell section-bottom button-row">
        <Link className="button" href="/bands">
          Explore the bands →
        </Link>
        <Link className="text-link" href="/shows">
          Find a show →
        </Link>
      </div>
    </Page>
  )
}
