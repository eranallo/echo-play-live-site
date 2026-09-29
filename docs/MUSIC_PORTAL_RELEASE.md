# Music portal presentation

September 29, 2026

The public website uses Echo Play Live's After Hours palette, Cabinet Grotesk headings, and DM Sans supporting text in a compact music-discovery layout. The homepage emphasizes the roster, real performance footage, announced shows, requests, and booking material.

## Navigation and responsive behavior

The masthead contains the brand and booking action. Home, Bands, Shows, Song requests, Band kits, and Our story are the only primary tabs. Six columns become two rows of three at phone widths, with 44px targets. Individual band and press pages highlight their parent section. Quick links, musicians, and podcast remain available through contextual/footer links.

The header remains sticky. Horizontal clipping does not establish a body scroll container. Header heights and scroll padding match desktop and phone layouts. The company vector seal remains the same asset used by the previous production deployment and approved preview.

## Motion

`SiteMotion` progressively enhances visible modules with a 360ms, 8px entrance. Content is rendered visible, including when JavaScript or the animation APIs are unavailable. An IntersectionObserver handles entrances once per element; a scoped MutationObserver includes streamed show rows. There are no scroll listeners, looping decorative animations, animation-library dependencies, or animated page wrappers.

Observers and animations clean up on route changes. Reduced-motion changes immediately cancel animations. Focused controls finish their containing animation. CSS supplies short color transitions, desktop hover feedback, and pressed states. Hover movement is gated to fine pointers; touch form text remains at least 16px to avoid small-text input zoom.

## Scope

The shared theme applies to all public routes. Routes, Airtable queries, booking email, newsletter, voting, upload delivery, analytics, SEO metadata, and security headers are unchanged by the design/motion implementation. Booking-focused band-kit copy and removal of visible photo credits are included in this release, with the corresponding PDF and press-pack downloads.

The theme's API, data and download baseline contains 80 files. Every file remains byte-identical to that baseline after presentation work. This baseline already includes the reviewed kit/copy changes.

## Local verification

- Production build and 107 existing tests pass.
- 26 routes at desktop 1440×1050 and phone 390×844: no horizontal page overflow, error overlays, missing main headings or broken visible images.
- Phone 320px and tablet 768px homepage layouts checked.
- Primary tab and booking navigation verified, including keyboard focus and nested-route active states.
- Rendered entrance animation, reduced-motion cancellation and coarse-pointer styles checked in Chrome device emulation. These are emulated device checks, not physical iOS/Safari certification.
- The local preview has no Airtable credentials; connected calendar/catalog behavior is checked against the Vercel release separately.

Production release evidence and deployment identifiers are recorded outside the source checkout so verification artifacts and private project configuration do not enter the repository.
