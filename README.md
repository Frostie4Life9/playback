# Playback

Personal music and TV/film completion log. Installable web app (Add to Home Screen), works offline, syncs between devices through the `playback-sync` Cloudflare Worker.

- `index.html` — the app
- `sw.js`, `manifest.webmanifest`, icons — install and offline support
- `worker/playback-sync.js` — sync Worker (paste into the Cloudflare dashboard; setup steps are in the file header)
