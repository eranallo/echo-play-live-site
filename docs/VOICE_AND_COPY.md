# Echo Play Live voice and website copy

Evan asked for a complete copy audit and directed Web to use his sent Echo Play Live email as the primary voice reference on September 7, 2026. The editorial pass used 18 sent messages from December 2025 through September 2026, covering booking replies, introductions, production coordination, fan support and vendor follow-up. Private correspondence is not included in this repository or republished as website content. Sent messages demonstrate the language Evan uses or approves; individual drafting provenance was not independently verified.

## Voice

- Friendly, appreciative and direct. Use everyday words, contractions and short paragraphs.
- Explain the relevant details and make the next step easy. Say what we do, what music a band plays and what someone needs to send us.
- Enthusiasm belongs where there is a reason for it. A warm greeting or thank-you can have an exclamation point; every heading does not need one.
- A little humor fits the bands. Specific references and the musicians' own interview answers carry more personality than elaborate descriptions of the crowd's feelings.
- Use “we” for the company/band speaking directly. Keep press bios in third person so promoters can reuse them.
- Keep recognized band names, original taglines, music references and factual history. Avoid inflated rankings, universal audience claims, invented testimonials and fixed operational promises.
- Do not turn every section into fragments, three-part slogans or a metaphor about a room, night, frequency or experience. Plain navigation and error messages are helpful.

## Editorial coverage

Revised homepage, About, band summaries, booking and show copy, signup, footer, press hub, all four online/PDF kits, relevant metadata, seven musician bios, song-request wording and the owned QR/link hubs. Privacy text and operational validation retain their factual meaning. The eleven public musician profiles were read; four had no biography to rewrite. Existing interview answers remain unchanged. Podcast episode titles/descriptions remain source-owned feed content; the website introduction was edited. Unrendered legacy band history and unused component files remain preserved historical source, not live voice guidance.

The biography edits in `lib/public/editorial-copy.mjs` apply only to the exact normalized public source versions reviewed. Future edits or removal by the source owner take precedence automatically. The database is not changed. Metadata uses the corresponding revised first sentence while the reviewed version matches.

`lib/press/kit-content.mjs` supplies the same copy to HTML, text bio downloads and PDF generation. Revision `20260907-copy1` identifies this PDF edition. Regenerate and visually review all pages after approved changes; see `BAND_KITS.md`.

## QR/link hubs

The permanent destinations remain `/hub`, `/so-long-goodnight`, `/the-dick-beldings`, `/jambi`, and `/elite`. They use owned public link definitions in `lib/public/link-hubs.mjs`, original logos, optimized photography, visible text links, booking preselection, press resources, newsletter preferences, native sharing/copy fallback and downloadable QR codes. The company hub also links to all four band hubs, the podcast, musicians and About page.

The next-show card reads the existing approved public show service, skips canceled shows and filters by band. It must not use private availability, unannounced shows or external event feeds. If no eligible show is available, a working calendar link remains. These routes are dynamic so canceled or unpublished shows do not stay in a cached QR page. Keep existing canonical/noindex behavior for these link destinations.

Generate print-ready 1200px PNG and scalable SVG codes with `node scripts/build-qr-codes.mjs`. They encode the stable owned page, not a current show or third-party redirect. Keep a white quiet zone and dark modules when printing. Codes do not depend on a separate QR subscription; the domain/site still needs normal maintenance. Machine decoding verifies the generated targets; a physical printed scan is a separate check.

Public company social links use Evan's September 7 owner-supplied Facebook/LinkedIn addresses and the already verified Instagram profile. No social profile or third-party Linktree account is changed by this website release. Existing external Linktree URLs remain separate until their owner replaces them with these owned URLs.

New hub click/share analytics include public band/show identifiers only. Form values, email content and private source-system identifiers are not analytics parameters. Existing signup/inquiry providers and consent rules are retained.
