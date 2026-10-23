/* Playback service worker: lets the app open offline.
   The page itself is network-first so updates show up right away;
   icons and the manifest are cache-first. Sync requests to the Worker
   are cross-origin and pass straight through. */
const CACHE = 'playback-2026.10.23-a';   // keep in step with BUILD in index.html
const V = '?v=20261021a';
const SHELL = ['./', './index.html', './manifest.webmanifest' + V, './icon-192.png' + V, './icon-512.png' + V, './icon-maskable-512.png' + V, './apple-touch-icon.png' + V, './favicon-32.png' + V];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: cache-first so the app keeps its type offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
