// Phase: motion polish — page transition.
//
// Next.js App Router convention: template.js wraps every route's content
// AND re-renders on every navigation (unlike layout.js, which persists).
// That re-render replays the CSS animation on `.page-fade-in`, so every
// page entrance gets a subtle fade-up. Reduced-motion users skip it via
// the @media block in globals.css.

export default function Template({ children }) {
  return <div className="page-fade-in">{children}</div>
}
