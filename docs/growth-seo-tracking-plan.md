# Growth / SEO Specialist Plan

## Goal

Make the public site easier to discover and make campaigns measurable without cluttering the website or admin dashboard.

## Specialist lane

This belongs to a Growth / SEO Specialist lane under the Chief of Staff.

## SEO foundation

- Server-render show listings.
- Add page-specific metadata.
- Add band-page metadata.
- Keep sitemap and robots clean.
- Add structured data where useful.
- Keep private admin and portal routes out of search.

## Campaign measurement foundation

Use UTM links for every paid campaign before relying on platform pixels.

Recommended campaign URL format:

`https://echoplay.live/shows?utm_source=facebook&utm_medium=paid_social&utm_campaign=<show-slug>&utm_content=<creative-name>`

`https://echoplay.live/shows?utm_source=tiktok&utm_medium=paid_social&utm_campaign=<show-slug>&utm_content=<creative-name>`

## Events to measure

- Public site page views
- Band page views
- Shows page views
- Ticket link taps
- Booking inquiry form submissions
- Contact page visits

## Platform setup

- Meta Pixel ID should be stored as `NEXT_PUBLIC_META_PIXEL_ID`.
- TikTok Pixel ID should be stored as `NEXT_PUBLIC_TIKTOK_PIXEL_ID`.
- Google Search Console verification should be stored as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## Admin UX goal

The Command Center should show a simple Growth card later:

- Top traffic source
- Top band page
- Ticket taps
- Booking leads
- Shows needing campaign links

Do not show raw analytics tables on the admin home.
