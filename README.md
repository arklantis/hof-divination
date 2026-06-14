# Hegemony of Faith Divination

This is a small non-BGA side project for experimenting with divination readings based on the 36 Hegemony of Faith cards:

- 16 Skill cards
- 15 Action cards
- 5 Believer cards

The card meanings are intentionally blank for now. The next step is to define upright and reversed meanings, then decide how readings should work in a future web page.

## Files

- `data/cards.md` - human-editable bilingual card table.
- `data/cards.json` - structured source data for a future web page or AI prompt.
- `prompts/reading-notes.md` - scratch notes for future prompt/AI reading design.

## Design Notes

- Believer cards may become strength, tone, or modifier cards instead of normal upright/reversed draw cards.
- Skill and Action cards are currently prepared with upright and reversed meaning fields.
- No Hegemony of Faith game code or BGA files are included here.

## Web Prototype

Open index.html directly in a browser to try the current non-AI draw flow. The prototype embeds the current card data in pp.js, draws Skill/Action cards without repeats, and attaches repeatable Believer strength cards to each main card.
