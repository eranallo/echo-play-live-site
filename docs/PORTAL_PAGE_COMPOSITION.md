# Interior page composition — September 29, 2026

The homepage’s music-portal design now extends to the composition of the public destinations. Interior pages use compact introductions, framed content modules, labeled section bars and contextual sidebars. On phones, content takes priority and sidebars follow; the show filters stay above the calendar.

The Bands directory uses photo-and-caption cards. Artist profiles retain their looping video headers and organize shows, performances, photos, catalogs and booking details into modules. The same treatment covers the show calendar and details, booking pages, band-kit pages, story, musician and podcast pages, uploads, requests and recovery pages. QR hubs retain their focused single-column flow with matching module headers.

Implementation lives in `components/SiteParts.js`, `components/PortalSidebar.js` and `app/portal-pages.css`. The homepage composition is unchanged. Existing motion progressively enhances individual modules and honors reduced-motion settings. Avoid transforms on ancestors of gallery or song-suggestion dialogs.

Validation: production build passed; 107 existing tests passed; 26 public routes checked at desktop and phone widths. Visual review identified and corrected image aspect-ratio containment and narrow-screen grid sizing. Additional 320px/tablet checks and connected-preview checks cover responsive content and live-data views. The 80-file API, data and downloadable-kit baseline remains unchanged. No test subscriptions, votes, inquiries or uploads are submitted for this design release.

Connected-preview verification passed for the live show calendar, filtered results and empty state, 84-song catalog with Spotify links, musician and podcast details, recap pages and 404s. Touch input and reduced-motion checks passed with zero browser errors. Follow-up visual refinements keep ticket actions compact and put musician photographs beside their bios on desktop.
