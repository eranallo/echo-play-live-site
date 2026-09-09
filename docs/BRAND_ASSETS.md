# Echo Play Live brand assets

## Selected website treatment — September 9, 2026

**Approved by Evan:** Cabinet Grotesk as the primary website font and the After Hours palette. **Web implementation choice:** DM Sans as its secondary for body copy, navigation, forms and controls. This supersedes the September 7 website type/color treatment below; original artwork and source files remain authoritative and preserved.

| Role | Font or color |
| --- | --- |
| Headings | Cabinet Grotesk; default 600 with existing page-specific weights |
| Body and controls | DM Sans; 400 body, 500–700 UI |
| Main background | Night `#11191D` |
| Primary text | Warm white `#F5F0E8` |
| Primary actions and focus | Amber `#EFC47C` |
| Cards and secondary surfaces | Blue slate `#202C32` |
| Supporting text | Stone `#B6B9B8` |

The layout, media, copy, band identities and integrations retain their existing behavior. `app/brand.css` defines the active semantic theme over the established layout styles. Both variable fonts are hosted locally (78,900 bytes total before HTTP compression); [font provenance](../app/fonts/FONT_SOURCES.md) records sources and license references.

Online kits, QR hubs, forms, voting, uploads and social previews use the same roles. Four downloadable PDFs use Cabinet Grotesk Bold and DM Sans Regular embedded in full; their covers use Night, with warm-white interior pages for printing. Standard ligatures are disabled for the PDF Cabinet face because the renderer mis-maps its `ft` ligature during text extraction. All PDF copy and 39 link targets were checked against the preceding release. Press ZIPs contain the same final PDFs and preserve every other entry.

The company seal stays white or black with its original geometry. Amber is a website action color, not a recolored seal. Individual band logos and photographs retain their original colors. This records the selected website treatment; Marketing owns any broader company brand-kit adoption.

**Release approval:** Evan approved publication on September 9, 2026 after reviewing the completed local version on `codex/after-hours-branding`.

## Supplied source identity — September 7, 2026 (preserved history)

Evan supplied the authoritative [Branding folder](https://drive.google.com/drive/folders/1-7P51nqohX28e07t1U1BEwvmxTyIaBIm) on September 7, 2026 and requested replacing the redesign's temporary identity with his logo and fonts.

- **Palette:** `#000000` and `#ffffff`, from `Main Logo/COLOR-AND-FONT-INFO-(1).jpg`. Neutral grays remain interface surfaces and secondary text. Individual bands retain their own existing colors.
- **Typeface:** The supplied `Font/GOTHAM-BOLD.ttf` is used for headings, navigation, buttons, and key labels. Body text remains a readable system sans because this packet contains no regular-weight companion. The supplied font is hosted locally; no Google Fonts request is needed.
- **Master artwork:** `Main Logo/ECHO FILES.svg`, a white seal on a black artboard. The geometric paths match the website's existing black/white press vectors. `public/brand/epl-logo-master.svg` preserves the original artwork with normalized text line endings.
- **Web variants:** `public/brand/epl-seal-black.svg` and `epl-seal-white.svg` retain every original path/polygon coordinate. Only background, approved monochrome fill, and excess artboard padding change. Their PNG files are exports of the same geometry. Never distort, redraw, or use the previous gold treatment for the company seal.
- **Placement:** Shared header/footer, public QR footer, organization metadata, favicon/apple icon, site share image, press downloads, generated band PDF footer, and musician share cards.
- **PDF typography:** The supplied Gotham font is embedded in full, without subsetting. `@pdf-lib/fontkit` enables that embedding; it is not included in the public page bundle.

Drive originals and the designer's copyright document remain untouched. The copyright image is not a website download. Existing historical code/assets remain recoverable in Git; the press page only presents the approved black/white identity.
