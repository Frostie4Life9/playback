// ==UserScript==
// @name         Playback Spotify banner helper
// @namespace    https://frostie4life9.github.io/playback/
// @version      2026.11.23.1
// @description  Saves the wide banner from Spotify artist pages you open, so Playback can use it in the artist header. It never loads pages by itself.
// @match        https://open.spotify.com/*
// @match        https://frostie4life9.github.io/playback/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @run-at       document-idle
// @noframes
// @downloadURL  https://frostie4life9.github.io/playback/spotify-banner.user.js
// @updateURL    https://frostie4life9.github.io/playback/spotify-banner.user.js
// ==/UserScript==

/* How it works
   On an artist page YOU opened on open.spotify.com, this reads the banner image the page is
   already showing and keeps it (artist id + picture id + its shape) in Tampermonkey. It makes
   no requests to Spotify of its own. On Playback, it hands that list to the app
   (window.postMessage); Playback says which artists it used, and only those leave the list. */
(function () {
  'use strict';
  const PFX = 'b:';
  const all = () => GM_listValues().filter(k => k.startsWith(PFX)).map(k => { try { return JSON.parse(GM_getValue(k, 'null')); } catch (e) { return null; } }).filter(Boolean);

  if (location.hostname === 'open.spotify.com') spotify(); else playback();

  function spotify() {
    let last = '', tries = 0;
    const find = () => {
      for (const e of document.querySelectorAll('*')) {
        const b = getComputedStyle(e).backgroundImage, m = b && b.match(/image\/ab676186[0-9a-f]{8}([0-9a-f]{24})/);
        if (m) return m[1];
      }
      return '';
    };
    const save = (spid, h, ar) => GM_setValue(PFX + spid, JSON.stringify({ spid, h, ar, at: Date.now() }));
    setInterval(() => {
      const m = location.pathname.match(/^\/(?:intl-[a-z-]+\/)?artist\/([A-Za-z0-9]{22})/);
      if (!m) { last = ''; return; }
      const spid = m[1];
      if (spid === last) return;
      const h = find();
      if (!h) { if (++tries >= 8) { last = spid; tries = 0; save(spid, '', 0); } return; }   /* ~8 s with no banner: this artist has none */
      last = spid; tries = 0;
      const im = new Image();   /* only to learn its shape, from the copy the page already loaded */
      im.onload = () => save(spid, h, im.naturalWidth / (im.naturalHeight || 1));
      im.onerror = () => save(spid, h, 2.33);
      im.src = 'https://i.scdn.co/image/ab67618600000194' + h;
    }, 1000);
  }

  function playback() {
    const send = () => window.postMessage({ src: 'spban-bridge', type: 'queue', v: 1, items: all() }, location.origin);
    window.addEventListener('message', e => {
      if (e.source !== window || e.origin !== location.origin) return;
      const d = e.data;
      if (!d || d.src !== 'playback') return;
      if (d.type === 'spban-ask') send();
      else if (d.type === 'spban-done' && Array.isArray(d.spids)) d.spids.forEach(s => typeof s === 'string' && GM_deleteValue(PFX + s));
    });
    send();
  }
})();
