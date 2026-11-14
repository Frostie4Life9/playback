# Playback

Personal music and TV/film completion log. Installable web app (Add to Home Screen), works offline, syncs between devices through the `playback-sync` Cloudflare Worker.

- `index.html` — the app
- `sw.js`, `manifest.webmanifest`, icons — install and offline support
- `worker/playback-sync.js` — sync Worker (deployed from this repo by Cloudflare; setup steps are in `SETUP.md` and the file header)
- `SETUP.md` — step-by-step setup for everything: installing, importing from Apple Music, sync, Spotify, TMDB, Discogs

Discographies import from Spotify when connected and from Apple Music otherwise (no account needed), with MusicBrainz as the backup.
