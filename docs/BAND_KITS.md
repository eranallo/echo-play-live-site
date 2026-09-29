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

## Original kit-overhaul verification

- Existing 34 tests and production build pass; four kit pages are statically generated.
- All 12 PDF pages were rendered and visually inspected. Independent PDF reading confirms three Letter pages per band, embedded Gotham, extractable text and 8–9 real URL links each.
- Read-only local checks cover 28 routes/assets, byte-for-byte PDF equality, all four JPG/PNG/bio downloads, sitemap entries and retired/unknown-route rejection.
- Browser review covers desktop press/Elite layouts and all four kits at a 390px viewport, with no horizontal overflow or broken images. A kit booking link preselects the correct band. The copy action reports success only after the browser Clipboard API resolves; the automation clipboard bridge returned no readable text, so cross-app paste was not verified.
- QR targets and visual placement are checked; a physical QR scan is not claimed. No business form, subscription or operational record was submitted by these checks.

Detailed source hashes, rendered review files and release evidence are retained in the shared workspace's `docs/web/BAND_KIT_OVERHAUL_2026-09-07.md` and dated evidence folder.

## September 7 voice revision

Revision `20260907-copy1` replaces the wording in all four kits following Evan's request to match his sent-email voice. HTML, downloadable bios and PDFs share the updated editorial source. All 12 revised PDF pages were rendered and visually inspected; the four QR codes were independently decoded from the rendered third pages and open the correct online kits. The expanded 41-test suite and production build pass. See `VOICE_AND_COPY.md` for the voice guide and owned QR/link-page maintenance, and the shared workspace's `docs/web/COPY_AND_QR_RELEASE_2026-09-07.md` for the current release evidence.

## September 8, 2026 — media refresh

Revision `20260908-media` replaces the three selected photos in each public kit with photographs from the curated gallery selection. The online kits, four PDFs and four press packs share the new selection and photographer credits; downloadable JPEGs are up to 3000 pixels wide without upscaling. All 12 PDF pages were rendered and visually inspected. Photos are credited to Jules Villalobos (Elite, Jambi, So Long Goodnight) and Jeremy Morgan / HDP (The Dick Beldings). The photo endpoint now serves the fixed local cover asset for each public band and is included in Vercel file tracing. Evan approved publication of this specific photo selection and the refreshed kits on September 8, 2026.

## September 14, 2026 — So Long Goodnight booking-copy review

Evan requested a venue/talent-buyer focus, beginning with So Long Goodnight as the review model before adapting the other bands. The cover, tagline, artist introduction, photographs and booking-planning copy remain as reviewed. The bio now explains the band's growth, musical identity, performance and booking coordination. Thursday and the Atticus-shirt line are removed; the linked band-page summary receives the same factual corrections.

**Owner-confirmed source, September 14:** Evan explicitly confirmed that SLGN formed in 2022 and described its progression from selling out local breweries to performing for 2,000 people at Hurricane Alley. The bio uses those facts without adding growth percentages, attendance guarantees, dates, rankings or venue endorsements. Rehearsal/accuracy/transition language follows the existing reviewed musician profiles and Evan's requested performance emphasis.

Revision `20260914-slgn-booking` updates the shared online/PDF/bio source, the So Long Goodnight PDF and its ZIP press pack. Page two includes a fully clickable **View the song catalog** button linking to `/bands/so-long-goodnight#music`, plus a note describing album artwork and Spotify links. Page-three email, booking, press-material and social links are visibly underlined. The other three PDFs and press packs are unchanged in this review.

The builders now accept public band slugs for focused review: `node scripts/build-band-kits.mjs so-long-goodnight` and `node scripts/build-press-packs.mjs so-long-goodnight`. Omitting arguments retains the existing all-band behavior; unknown slugs are rejected. The selected PDF uses Cabinet Grotesk and DM Sans with the existing After Hours colors. Its modification date is September 14; the edition remains September 2026.

Verification: all three pages rendered and visually inspected; independent PDF inspection confirms three Letter pages and nine URI annotations, including the intended catalog/booking/email destinations. Rendered cover, photos/credit area and QR are pixel-identical to the prior kit. The ZIP's PDF exactly matches the reviewed artifact and its text biography matches the updated source. Read-only live-page verification confirms the music anchor and catalog control exist. This review does not certify a physical QR scan or every external social destination.

Review status: prepared locally for Evan; not published. The 107 existing tests pass. Full build outcome is recorded with the exported review evidence.

### Matching-kit continuation — September 14

After Evan accepted the SLGN revision as “much better,” the earlier request to match the format across the other bands was completed locally. Revision `20260914-booking-kits` extends the buyer-focused copy, catalog button and visible link styling to The Dick Beldings, Jambi and Elite. Their covers, photos, credit blocks and QR artwork are unchanged; the accepted SLGN PDF remains byte-identical to its review copy. Existing Granada performance links remain in Jambi and Elite's kits, with spacing adjusted above the catalog button.

The Dick Beldings' decade-plus Fort Worth history, Jambi's rehearsal and performance history, and Elite's 2017 start and stage history come from the existing public band-kit source. Granada footage is separately recorded in `lib/public/performances.mjs`. No new founding year, growth figure, audience count, endorsement or booking guarantee was added for those three acts. Their online-kit feature copy and packaged bios match the PDF direction; the fan-facing band descriptions remain distinct.

All nine newly rendered pages were visually reviewed. Independent checks confirm three Letter pages per kit, nine links for The Dick Beldings, ten for Jambi and eleven for Elite, correct non-overlapping catalog/booking/video annotations, matching ZIP contents and generated online-kit copy, and identical rendered covers/photos/QR regions. All 107 existing tests and the production build pass. These matching drafts are ready for review; no website deployment or external send occurred.

## September 14, 2026 — visible photo-credit removal

At Evan's request, revision `20260914-credit-free` removes displayed photo attribution from all four PDF kits, their online pages, the press hub and shared press FAQ, plus the READ-ME instructions in all four ZIP press packs. This supersedes the visible-credit presentation described in earlier release entries. The accepted booking-copy revisions are included. Photos, layout, catalog/booking/video links and QR artwork are preserved. The public kit export now selects only photo alt text from the editorial photo record.

All 12 final PDF pages were rendered and visually inspected. The only rendered differences from the preceding booking-copy drafts are the removed page-two credit lines. All 39 PDF URI links remain unchanged, and the PDFs inside the four press packs exactly match the standalone files. All 107 tests and the production build pass. Local HTTP checks cover 17 pages, four media responses and eight PDF/ZIP downloads; 109 generated page, data and browser-script files contain no photo attribution. These checks do not test third-party link availability. Prepared locally for review; not deployed.
