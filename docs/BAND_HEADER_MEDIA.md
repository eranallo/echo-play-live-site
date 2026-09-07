# Band header media

Evan clarified on September 7, 2026 that the short, silent `heroVideo` clips are looping header backgrounds. They must not be presented as standalone performance videos or advertised as having audio.

The So Long Goodnight, Jambi, and Elite pages render their existing clips behind the band title with muted autoplay, looping, inline playback, and a pause/resume button. The original hero photo remains the loading/error fallback. Reduced-motion visitors receive the photo without mounting or fetching the video. Bands without a header clip retain their photo header.

The separate Watch live navigation item, video player, and sound instruction were removed. Original media files are unchanged.

Validation: production build and all 28 existing tests pass. Browser checks cover playback on all three clip pages, pause/resume, the 1440px layout, and all four public band headers at 390px without horizontal overflow. The Dick Beldings retains its photo. Reduced-motion behavior was inspected in source; OS preference emulation was not performed in the browser.
