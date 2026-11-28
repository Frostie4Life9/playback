# Playback bench

Phone-speed budget check. From this folder:

    npm i          # once
    npm run bench  # flows, stress, album, 7-inch single, light-mode album, every page

Headless Chrome at iPhone size (430×932, 3× pixels, touch, 4× CPU), synthetic library (3 artists, 8 albums × 14 songs, 6 singles), real JPEG covers generated into `out/art`. For each record: open (with a layer-memory estimate), open the rating card, set a score, Done, close. Exits 1 when a budget in `BUDGET` (bench.mjs) is over, a flow check fails, the page crashes or throws, or the lint finds an animated blur.

- **flows**: 15 end-to-end checks (rating sticks and shows, survives close/reopen and reload, Clear, heard, Next record, 7-inch label).
- **stress**: a Deluxe album (14+14 songs, own cover) and a features album opened, edition-switched and closed 4 times; any crash fails.
- **pages**: Stats, History, Settings, Account, artist, library, another artist; errors fail, times are info.

Options: `ONLY=flows|stress|album|single|safe|pages`, `RUNS=3` (best of N), `TASKS=1` (long tasks per step), `PROF=<step>` (CPU profile of one step, e.g. `PROF=close`), `LAYERS=1` (biggest layers while opening), `SHOTS=1` (settled screenshots into out/), `GENERIC=1` (drop the album/7-inch patchers to test the shared path), `JSON=1`, `CHROME=/path`, `ENGINE=webkit` (Playwright WebKit; no CPU throttle, timings info only).

Headless Chrome isn't the iPhone: a pass here means no regression on the paths it covers, not that the phone is smooth. The phone's own `[slow]` / `[crash]` / `[dropped]` notes in the Suggest box are the final word.
