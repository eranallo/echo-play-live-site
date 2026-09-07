# Echo Play Live brand assets

Evan supplied the authoritative [Branding folder](https://drive.google.com/drive/folders/1-7P51nqohX28e07t1U1BEwvmxTyIaBIm) on September 7, 2026 and requested replacing the redesign's temporary identity with his logo and fonts.

- **Palette:** `#000000` and `#ffffff`, from `Main Logo/COLOR-AND-FONT-INFO-(1).jpg`. Neutral grays remain interface surfaces and secondary text. Individual bands retain their own existing colors.
- **Typeface:** The supplied `Font/GOTHAM-BOLD.ttf` is used for headings, navigation, buttons, and key labels. Body text remains a readable system sans because this packet contains no regular-weight companion. The supplied font is hosted locally; no Google Fonts request is needed.
- **Master artwork:** `Main Logo/ECHO FILES.svg`, a white seal on a black artboard. The geometric paths match the website's existing black/white press vectors. `public/brand/epl-logo-master.svg` preserves the original artwork with normalized text line endings.
- **Web variants:** `public/brand/epl-seal-black.svg` and `epl-seal-white.svg` retain every original path/polygon coordinate. Only background, approved monochrome fill, and excess artboard padding change. Their PNG files are exports of the same geometry. Never distort, redraw, or use the previous gold treatment for the company seal.
- **Placement:** Shared header/footer, public QR footer, organization metadata, favicon/apple icon, site share image, press downloads, generated band PDF footer, and musician share cards.
- **PDF typography:** The supplied Gotham font is embedded in full, without subsetting. `@pdf-lib/fontkit` enables that embedding; it is not included in the public page bundle.

Drive originals and the designer's copyright document remain untouched. The copyright image is not a website download. Existing historical code/assets remain recoverable in Git; the press page only presents the approved black/white identity.
