# Curated band galleries

## September 2026 media refresh

The public band gallery is an explicit selection in `lib/public/galleries.json`. It contains 16 Elite, 16 Jambi, 16 So Long Goodnight and 12 The Dick Beldings photographs. The first five appear in a compact preview; expanding shows the whole collection. The lightbox supports keyboard arrows, Escape, focus restoration and touch swipe. The Dick Beldings has separate live and portrait filters.

The manifest is the publication boundary. Page visits and `/api/media` do not query Drive, Airtable or a Blob bucket listing. Unlisted bands and arbitrary lookup keys are rejected. This does not migrate musician headshots or the separate fan-upload workflow.

## Adding or replacing photos

1. Select actual band photos from approved Drive folders. Review identity, quality, near-duplicates, dates, photographer credits and suitability for public display. Keep Drive originals and permissions unchanged.
2. Prepare a private selection JSON containing slug, local path, alt text, album, credit, source ID/name/URL and exact copyright when embedded. Do not commit source IDs, private paths or this selection to the public site.
3. Run `node scripts/prepare-band-gallery.mjs selection.json prepared-directory`. It writes responsive 480/960/1920 WebP variants without upscaling, preserves credit/copyright in XMP, and removes other source metadata. Review the images before publishing. Update the release namespace in both scripts for a future release.
4. With publication authorization, run `node scripts/publish-band-gallery.mjs prepared-directory --publish` with only the existing public media store token in the environment. The script verifies the store identity, fixed path patterns and local file checksums, never overwrites existing objects, and checks existing bytes when retried. Never use the private fan-upload journal token.
5. Verify uploaded URLs and replace the public manifest with `galleries.published.json`. The separate `source-records.json` stays in internal workspace records. Keep derivatives out of the source repository when publishing through Blob.
6. Run automated checks, production build, desktop/mobile gallery checks and press download checks before the normal reviewed Git/Vercel release.

Source/credit evidence for this release is retained in the private shared workspace under `docs/web/media-overhaul-2026-09-08/`. Evan confirmed Jules Villalobos for the July 10 Granada Elite/Jambi albums and April 4 Texas Live SLGN album. The Dick Beldings selections carry Jeremy Morgan / HDP credits and preserve `HDP ALL RIGHTS RESERVED` from their metadata.

## Hosting and performance

Drive is the original media library. The existing public Vercel Blob store serves the published derivatives with stable, content-derived filenames and one-year cache headers. Next Image selects prepared image sizes for galleries without per-visit transformation or folder discovery. The 60 selected originals total 331,035,441 bytes; all 180 web variants total 29,755,524 bytes. This is an asset-size comparison, not a measured page-speed improvement. Only five gallery images are mounted initially; additional photos load on demand. Full-screen photos retain their full composition.

## Release status

Evan approved publication of the reviewed 60-photo selection and refreshed band kits on September 8, 2026. The release includes 180 optimized public image variants and preserves the original Drive files and permissions. GitHub and Vercel retain the exact code/deployment history; the private workspace release record holds validation and source provenance.
