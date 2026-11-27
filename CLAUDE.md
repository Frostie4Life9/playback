# Playback: how Skyler works

Playback is Skyler's music + movie/TV app, live at https://frostie4life9.github.io/playback. Nearly everything lives in one big `index.html`, so read targeted line ranges (grep first) instead of the whole file.

## Shipping
- Commit and push to `main` without asking. That counts as approval for any change he asks for.
- **Every release bumps both version numbers to the same string:**
  - the build: a new entry at the top of `CHANGELOG` in `index.html` (`{v:'YYYY.MM.DD-x', note:'…'}`), which `BUILD` reads;
  - `CACHE` in `sw.js` (`playback-YYYY.MM.DD-x`).
  Letters go a, b, c… within a day.
- Changelog notes are plain English about what he'll notice, not code names.
- "Quick fix" means: make the change, one sanity check, push. No harness run, no write-up.

## Usage and testing
- Keep usage lean. For performance or animation work, **measure once before and once after**, not repeatedly.
- Measure in headless Chrome at iPhone size: 430×932, touch, 3× pixels, 4× CPU slowdown. Use a synthetic library seeded into localStorage (`playback_v1`, plus `_tab=music` and `_sel_music`). Report main-thread time (`render()` and long tasks) and the worst frame. Also check in Playwright WebKit when iPhone rendering matters (setup notes are in the Project doc `claude/phone-jacket-built-2026-11-27.md`, under Testing setup). Use real bitmap covers.
- Headless Chrome isn't his iPhone. Say so when a fix can only be confirmed on the phone.
- He tests on an iPhone (Safari and Brave). Crash and reload notes land in the Suggest box: Cloudflare KV namespace `123626e20f3e4780ba3064ff22077e7e`, key `suggestions` (newest first). Look for `[crash]` and `[dropped]` there after phone releases.

## Design rules
- Match the approved mockups exactly (album mockups canvas: https://claude.ai/artifact/J5MTCXBMo4nz1Mi4vUBMH5).
- Give new features motion automatically. Respect reduced motion.
- **The album must always look like a real vinyl:** records stay sleeved and only peek out of the outer edges, never lying on an inside panel, and the inside panels are printed card. The cover art printed faintly on the card is wanted; it shouldn't look see-through like frosted glass.
- The phone is the main target. Avoid big blurs, backdrop filters and large composited layers on phones: iPhone Safari silently reloads the page when it runs out of graphics memory.

## Notes
- Write-ups of finished work go in the claude.ai Project "Music and Movies" as `claude/<topic>-<date>.md`.
