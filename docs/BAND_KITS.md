# Band kits — September 2026

The press hub now links to a dedicated HTML kit for each of the four public bands. Each kit includes its original band logo, a concise bio, curated photographs, musical identity, selected stage history from existing public copy, downloadable materials and a preselected booking inquiry. The public band pages also link to these kits.

## Source and maintenance

- `lib/press/kit-content.mjs` is the shared public editorial source for the HTML pages, bio downloads and PDF generator. Its explicit four-band list prevents arbitrary paths or private acts from being exposed.
- Original band logos came from each band's existing Drive Branding/Master folder. The website exports trim transparent artboard space and resize proportionally; artwork and colors are unchanged. Company seal and Gotham Bold come from Evan's supplied branding kit.
- Photographs are curated derivatives of existing public site assets. The Dick Beldings' color group portrait was stored in the old `crowdPhoto` field; its former hero is a stage setup, so the new layouts label both honestly.
- Selected stages and bios are editorial summaries of existing public site copy. These are historical positioning, not current booking availability, contracts or endorsements.
- Full-size photos remain available from the bounded, fixed-source photo endpoint. Logo PNGs are web/press derivatives; request original print/vector assets through booking when needed.
- No technical rider, stage plot or input list is represented as current without a supplied and verified document. The kits direct those requests to the band contact.

## Regeneration

Run `node scripts/build-band-kits.mjs` after approved content or asset changes. This uses only checked-in local assets and writes `public/press/kits/*.pdf`. Review every rendered page before committing. Update `KIT_EDITION`, `KIT_REVISION`, document dates and any dated cover label together for a new edition; the revision query ensures existing browser caches receive the new PDF.

The generator embeds the supplied Gotham font in full because its embedding flags prohibit subsetting. Body copy uses Helvetica. The PDFs are US Letter, three pages each, with document metadata, language, extractable text, clickable public URLs and a QR pointing to each stable online kit. They are not tagged PDFs or a PDF/UA accessibility certification; the HTML versions provide semantic headings and controls.

The PDF endpoint serves a reviewed static artifact instead of generating one at request time. Next.js output tracing explicitly includes those PDFs and the selected local full-size photos. Missing/unknown bands return 404; a missing artifact fails with 503.

## Verification for this edition

- Existing 34 tests and production build pass; four kit pages are statically generated.
- All 12 PDF pages were rendered and visually inspected. Independent PDF reading confirms three Letter pages per band, embedded Gotham, extractable text and 8–9 real URL links each.
- Read-only local checks cover 28 routes/assets, byte-for-byte PDF equality, all four JPG/PNG/bio downloads, sitemap entries and retired/unknown-route rejection.
- Browser review covers desktop press/Elite layouts and all four kits at a 390px viewport, with no horizontal overflow or broken images. A kit booking link preselects the correct band. The copy action reports success only after the browser Clipboard API resolves; the automation clipboard bridge returned no readable text, so cross-app paste was not verified.
- QR targets and visual placement are checked; a physical QR scan is not claimed. No business form, subscription or operational record was submitted by these checks.

Detailed source hashes, rendered review files and release evidence are retained in the shared workspace's `docs/web/BAND_KIT_OVERHAUL_2026-09-07.md` and dated evidence folder.
