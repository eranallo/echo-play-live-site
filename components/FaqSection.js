// Phase 39.1 — Visible FAQ section.
//
// Renders the same FAQ array the layout passes to FAQPage JSON-LD. Google
// awards the FAQ rich snippet only when the same Q&A content also appears
// on the page; this component is what makes that match real.
//
// Usage: <FaqSection items={FAQ_CONTACT} heading="Booking FAQ" />
//
// Uses native <details>/<summary> for accessibility — keyboard, screen reader,
// and JS-disabled support free. The summary acts as the toggle, no JS needed.

import RevealOnView from '@/components/RevealOnView'

export default function FaqSection({ items, heading = 'FAQ', anchorId = 'faq' }) {
  if (!items || items.length === 0) return null

  return (
    <RevealOnView>
      <section
        id={anchorId}
        style={{
          padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)',
          background: 'var(--c-bg)',
          borderTop: '1px solid var(--c-border)',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div
            className="reveal"
            style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--c-text-dim)',
              marginBottom: '12px',
            }}
          >
            Frequently Asked
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'var(--t-h2)',
              lineHeight: '0.95',
              color: 'var(--c-text)',
              margin: '0 0 40px',
            }}
          >
            {heading}
          </h2>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            {items.map((item, i) => (
              <li
                key={i}
                className="reveal"
                style={{
                  borderTop: i === 0 ? '1px solid var(--c-border)' : 'none',
                  borderBottom: '1px solid var(--c-border)',
                }}
              >
                <details style={{ width: '100%' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      listStyle: 'none',
                      padding: '24px 0',
                      fontFamily: 'var(--ff-body)',
                      fontSize: 'var(--t-body-l)',
                      fontWeight: 500,
                      color: 'var(--c-text)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px',
                      transition: 'color var(--d-fast) var(--ease)',
                    }}
                  >
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      style={{
                        fontFamily: 'var(--ff-display)',
                        fontSize: '20px',
                        color: 'var(--c-text-dim)',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: '0 0 24px',
                      fontFamily: 'var(--ff-body)',
                      fontSize: 'var(--t-body)',
                      color: 'var(--c-text-muted)',
                      lineHeight: 1.65,
                      maxWidth: '720px',
                    }}
                  >
                    {item.a}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </RevealOnView>
  )
}
