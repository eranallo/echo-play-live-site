# Public SEO and website measurement

Released implementation scope: distinct titles, descriptions, canonical URLs and Open Graph/Twitter previews for each public page; four original-brand share cards; publication-gated event metadata and sitemap entries; noindex on QR utility hubs and hidden bands. Repeat event titles include dates. Source fields supply venue address, age policy and doors when available. Missing prices, end times and policies are not invented.

## Search topics

| Page | Primary topic |
|---|---|
| Home / bands | DFW tribute and cover bands / band management |
| So Long Goodnight | 2000s emo and pop punk cover band in DFW |
| The Dick Beldings | 90s rock and alternative cover band in DFW |
| Jambi | TOOL tribute band in DFW |
| Elite | Deftones tribute band in Fort Worth / Texas |
| Shows | Announced dates and venue-specific band performances |
| Contact | Book a tribute or cover band in DFW |
| Press / individual kits | Band kits, press photos, logos and booking contacts |
| Musicians / profiles | Actual performer names, instruments and band affiliations |
| Podcast | Echo Play Podcast and its actual interviews |

Keywords belong naturally in useful content and page titles. A meta-keywords list is not a Google ranking mechanism. Search rankings, rich-result appearance and preview-cache refresh timing are not guaranteed.

## Measurement

- Vercel page analytics and Speed Insights remain enabled; URL query strings and fragments are removed from their events.
- Vercel custom-event reporting requires a supported paid plan. `NEXT_PUBLIC_VERCEL_CUSTOM_EVENTS=true` is opt-in; leave it unset on Hobby.
- GA4 is enabled only with a valid `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Do not invent an ID or claim receipt before checking the property. Manual page views avoid duplicate automatic initial/SPA counts; turn off enhanced-measurement page/history, form, click and download auto-events in GA4 when activating this implementation.
- Google, Meta and TikTok load only after the visitor allows optional cookies. Their choice persists locally; the Privacy page can reopen it. Revoking permission reloads the page with optional tools disabled. Cookie choice is not asserted to delete historical provider data.
- Events allow only known public band slugs, opaque show identities and video IDs. No inquiry contents, email, name, contact details or arbitrary URL parameters are sent in authored events.
- `generate_lead` means a successfully saved booking inquiry. `ticket_click` does not mean a ticket sale. `newsletter_form_submitted` does not mean a confirmed opt-in. `performance_player_opened` does not establish video watch time.
- GA4 accepts public `utm_source`, `utm_medium`, `utm_campaign` and `utm_content` labels limited to letters, numbers, dots, underscores and hyphens. Use campaign names such as `jambi-sept26`; never put personal data in campaign links.

## September 7 account checkpoint

The existing Search Console domain property is verified. Its July 7 sitemap submission showed Couldn't fetch and zero discovered URLs before this release. Resubmit `https://echoplay.live/sitemap.xml` after release and inspect actual processing; a successful website response alone does not prove indexing.

The Echo Play Live Google account has no existing GA4 property visible. A free account/property was prepared in Central Time at the Terms of Service acceptance screen; explicit agreement approval is pending. GA4 collection/reporting is not active without completing that step and deploying its measurement ID. No paid upgrade is included.

## Verification

46 service/contract/metadata tests pass. Local fixture crawl checks unique metadata and preview images across 26 pages; production-style no-credential checks preserve fail-closed reads and honest inquiry errors. Four preview cards and 12 PDF pages were visually reviewed. YouTube embeds loaded the correct video identity but the automated browser received a YouTube sign-in/bot check; real audiovisual playback remains a human/browser follow-up. Direct official watch links are included.
