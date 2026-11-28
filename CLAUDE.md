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
- One feature per release where possible, so a phone report points at one change.

## Usage and testing
- Keep usage lean. For performance or animation work, **measure once before and once after**, not repeatedly.
- Measure in headless Chrome at iPhone size: 430×932, touch, 3× pixels, 4× CPU slowdown. Use a synthetic library seeded into localStorage (`playback_v1`, plus `_tab=music` and `_sel_music`). Report main-thread time (`render()` and long tasks) and the worst frame. Also check in Playwright WebKit when iPhone rendering matters (setup notes are in the Project doc `claude/phone-jacket-built-2026-11-27.md`, under Testing setup). Use real bitmap covers.
- Headless Chrome isn't his iPhone. Say so when a fix can only be confirmed on the phone.
- He tests on an iPhone (Safari and Brave). Crash and reload notes land in the Suggest box: Cloudflare KV namespace `123626e20f3e4780ba3064ff22077e7e`, key `suggestions` (newest first). Look for `[crash]`, `[dropped]` and `[slow]` (Speed watch: taps over 100 ms or frames over 100 ms on his phone, with what was tapped) there after phone releases. Crash-safe (light mode) lasts only until the next build, so each release gets one full try at albums that crashed before. Once a crash is fixed, remove the notes relating to it from that key (leave his friends' real suggestions alone).

## Budgets (enforced — no push if over)
Run the bench before every push that touches the album, rating, sleeves or the artist page:
`cd tools/bench && npm i && npm run bench` (one command after the first install; exits 1 when over budget). Budgets live in `BUDGET` in `tools/bench/bench.mjs`:
- **No full redraw on rating taps** (opening the card, setting a score, Done): `renderFull()` calls = 0, for album, 7-inch and light-mode sheets.
- **Rating tap < 50 ms** to the next painted frame, at 4× CPU.
- **Close after rating < 150 ms** longest main-thread block, including the deferred hero repaint after it lands.
- **Album opening < ~350 MB** estimated layer memory (full-size layer estimate; phone tiling is lower, but it tracks the reloads).
- **Flows** (`ONLY=flows`): 15 end-to-end checks (rating sticks, shows, survives close/reopen and reload, Clear, heard, Next record, 7-inch label). Any miss fails.
- **Lint**: no animated `filter: blur` / `backdrop-filter` in `@keyframes` or `.animate()` (an animated blur in the 7-inch's "Rated" line crashed WebKit's page every time; likely the iPhone reloads after rating singles).
- **Safari engine**: also run `ENGINE=webkit PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run bench` when the album, single or animations change (install once with `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node node_modules/playwright-core/cli.js install webkit`). WebKit timings are meaningless headless, but a crash or a failed flow there is real. A page crash in WebKit is how the 7-inch crash was found.
For anything that scales with the library (artist page, library, saving, colors), also run `BIG=1` (about Skyler's size: 90 artists, ~2,000 releases); the small default library hides those costs.
If a step is over, fix it or say why before pushing. Tap times jitter ±15 ms on this machine: a tap just over 50 ms gets one re-run before it counts. Paste the bench table into the Project write-up. A quick fix that doesn't touch these paths can skip the bench.

## How the album code is put together (keep it this way)
- `render()` is the only redraw entry point. With `UI.gfQ` set it goes to `jkPatch()` (patch the open phone album in place) and never reaches `renderFull()`. Anything that changes inside an open phone album sets `UI.gfQ=true` instead of redrawing the page.
- `jkPatch()` picks the sleeve's patcher from `SLEEVE` (album jacket `jk2`, 7-inch `s7`); any other sleeve falls back to `gfPatchAny`, which patches the whole sleeve in place. A new sleeve type is fast by default; only add a `SLEEVE` entry if parts of it must not be touched, and add its build class to `SLEEVE_FAM`. `GENERIC=1 npm run bench` proves the shared path alone stays in budget.
- Opening/closing on phones: `gfOpenQuick` / `gfCloseQuick` / `gfClosePatch` accept any `.phs` sleeve.
- Never read layout (`scrollTop`, `scrollWidth`, `getBoundingClientRect`, `offset*`) after changing the DOM in a tap handler; read before, or defer to the next frame.
- Work that can wait (hero repaint, saves, place notes) runs after the motion lands, in slices (`HSLOW`), never in the tap.

## Design rules
- Match the approved mockups exactly (album mockups canvas: https://claude.ai/artifact/J5MTCXBMo4nz1Mi4vUBMH5).
- Give new features motion automatically. Respect reduced motion.
- **The album must always look like a real vinyl:** records stay sleeved and only peek out of the outer edges, never lying on an inside panel, and the inside panels are printed card. The cover art printed faintly on the card is wanted; it shouldn't look see-through like frosted glass.
- Never animate a blur (filter or backdrop-filter), in CSS keyframes or script. The bench lints for it.
- The phone is the main target. Avoid big blurs, backdrop filters and large composited layers on phones: iPhone Safari silently reloads the page when it runs out of graphics memory.

## Notes
- Write-ups of finished work go in the claude.ai Project "Music and Movies" as `claude/<topic>-<date>.md`.
