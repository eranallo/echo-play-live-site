# Public website improvements — September 7, 2026

Evan approved the first recommended package: band-page upcoming shows, fan signup, and clearer booking/press information.

## Implemented

- Band pages stream up to three matching announced shows from the same publication-gated reader used by `/shows`. They are dynamic and do not persist public-event snapshots between requests.
- Each public show has an individual page and a calendar download. Pages, metadata, calendar files, and sitemap all recheck the existing publication boundary; private, removed, past, or invalid events cannot be fetched through an arbitrary source-record ID. A source failure returns unavailable instead of cached event facts.
- Event pages have tickets, lineup links, a Maps search for the published venue name, and native sharing/copy fallback. Unknown door times, addresses, age limits, and accessibility details are not invented. The venue and ticket provider remain the source for those details. Structured metadata has the individual event URL; complete Google event eligibility is not claimed without verified address data.
- Calendar files preserve known start instants, omit unknown end times, clearly label unknown-time date reminders, escape untrusted text, fold Unicode lines correctly, and retain canceled status. Existing downloaded calendars do not automatically update; visitors should recheck the event page.
- Booking essentials use the existing public band introductions and FAQ scope. Only SLGN's existing 3+ hour format is stated; other set lengths and all event-specific production/travel details are discussed with the booking team.
- Press adds text bios and original curated JPEG downloads. Current technical files, additional logos, and photographer credits are requested through booking; unverified historical stage plots are not presented as current assets.
- Ticket, calendar, share, follow, and press actions have minimal Vercel events using only public band/show identifiers. An outbound ticket click does not claim a sale. No personal/form data is included.

## Fan signup

Mailchimp access became available during implementation. The existing Echo Play Live audience was verified and given an optional `CITY` field and a four-choice “Your bands” interest group. A website embed named “Echoplay.live — Fan signup” was generated in that audience. Its public action, form identifier, email/city names and honeypot were copied from Mailchimp’s generated embed; interest field names and selected values were verified against the live hosted form. No API key is used.

Band pages preselect their own band; the Shows page lets visitors choose any combination. The form sends email, optional interests and optional city directly to Mailchimp in a new tab, where the provider handles validation and subscription state. The exact Mailchimp origin is included in the form-action policy. No Mailchimp scripts, tracking popup or local success claim is added. The privacy page describes the collection. Existing single opt-in settings and contact history are preserved.

This release does not send a campaign, import subscribers, subscribe booking contacts, create an audience, or change billing. Rendering, required-email validation and integration fields are verified without creating a test subscriber; actual delivery to an inbox is not claimed as tested.

## Verification

34 existing/new tests pass, including calendar timing, injection/Unicode, cancellation, public URL consistency, and invalid signup destinations. Production build succeeds. Local synthetic-event integration verifies scheduled/canceled/unknown-time details, all eight new downloads, and immediate withdrawal across band page, event page, and calendar. Desktop/390px browser checks cover discovery, event details, booking essentials and press. Compiled HTML and 14 browser bundles pass the internal-identifier scan; all four existing PDF kits still download. Local fixture tools and synthetic credentials are outside the repository and are not deployed.

Physical-device, genuine assistive-technology, and field-performance evaluation remain separate recorded follow-up. This work does not claim measured conversion uplift or full accessibility certification.
