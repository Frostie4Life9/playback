/* Playback service worker: lets the app open offline.
   The page itself is network-first so updates show up right away;
   icons and the manifest are cache-first, and covers and artist photos are
   kept in their own capped cache so art shows offline. Sync requests to the Worker
   are cross-origin and pass straight through. */
const CACHE = 'playback-2026.11.27-s';   // keep in step with BUILD in index.html
const IMG = 'playback-img';   // album covers and artist photos: kept across builds, capped
const IMG_MAX = 1200;
const IMG_HOST = /(^|\.)(scdn\.co|mzstatic\.com|tmdb\.org|coverartarchive\.org|archive\.org|discogs\.com)$/;
const V = '?v=20261123h';
const SHELL = ['./', './index.html', './manifest.webmanifest' + V, './icon-192.png' + V, './icon-512.png' + V, './icon-maskable-512.png' + V, './apple-touch-icon.png' + V, './favicon-32.png' + V];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG).map(k => caches.delete(k))))
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
  // Covers and photos: cache-first, so albums you have seen still have their art offline
  if (req.destination === 'image' && IMG_HOST.test(url.hostname)) {
    e.respondWith(imgFetch(req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Screen (screen.js / screen.css) loads on demand, versioned by ?b=BUILD: kept once fetched so Screen also opens offline
  if (/\/screen\.(js|css)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});

/* Image cache. Cover and photo hosts allow CORS, so we ask for a readable copy (an opaque
   copy is padded to several MB in the browser's storage count); if the host refuses we
   fall back to the plain request. A saved opaque copy is not handed to a CORS request. */
async function imgFetch(req) {
  const cache = await caches.open(IMG);
  const hit = await cache.match(req.url);
  if (hit && !(hit.type === 'opaque' && req.mode === 'cors')) return hit;
  let res;
  try {
    res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
  } catch (err) {
    res = await fetch(req);
  }
  if (res && (res.ok || res.type === 'opaque')) {
    cache.put(req.url, res.clone()).then(imgTrim, () => {});
  }
  return res;
}
let trimming = false;
async function imgTrim() {
  if (trimming) return;
  trimming = true;
  try {
    const cache = await caches.open(IMG);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - IMG_MAX; i++) await cache.delete(keys[i]);
  } finally { trimming = false; }
}
