# Hegemony of Faith Divination

This is a small non-BGA side project for experimenting with divination readings based on the 36 Hegemony of Faith cards:

- 16 Skill cards
- 15 Action cards
- 5 Believer cards

The web prototype currently includes working upright/reversed reading text, a three-card spread, follower strength cards, bilingual UI, and optional AI prompt export.

## Files

- `data/cards.md` - human-editable bilingual card table.
- `data/cards.json` - structured source data for a future web page or AI prompt.
- `prompts/reading-notes.md` - scratch notes for prompt/AI reading design.
- `stats-config.js` - optional private analytics endpoint configuration. Empty by default.
- `hof-ledger-ark-2026.html` - unlinked private statistics page.
- `tools/google-apps-script-stats.js` - optional Google Apps Script backend example.

## Design Notes

- Believer cards may become strength, tone, or modifier cards instead of normal upright/reversed draw cards.
- Skill and Action cards are currently prepared with upright and reversed meaning fields.
- No Hegemony of Faith game code or BGA files are included here.

## Web Prototype

Open `index.html` directly in a browser to try the current non-AI draw flow. The prototype embeds the current card data in `app.js`, draws Skill/Action cards without repeats, and attaches repeatable Believer strength cards to each main card.

## Optional Statistics

The site can send minimal aggregate events when `stats-config.js` has an `endpoint`:

- page views
- generated question clicks
- completed readings
- copied AI prompts
- selected language, topic, and draw mode

The client does not send raw question text, full custom topic text, raw IP, referrer, or user agent. Country/IP-style data should be derived server-side if needed, and raw IP should not be stored. The hidden statistics page is:

`hof-ledger-ark-2026.html`

For a simple free backend, create a Google Sheet, open Apps Script, paste `tools/google-apps-script-stats.js`, set `ADMIN_TOKEN`, deploy it as a web app, then paste the web app URL into `stats-config.js`.
