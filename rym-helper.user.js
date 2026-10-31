// ==UserScript==
// @name         Playback RYM helper
// @namespace    https://frostie4life9.github.io/playback/
// @version      2026.10.31.1
// @description  Saves your own song ratings from the Rate Your Music album pages you open, so Playback can import them. It never loads pages by itself.
// @match        https://rateyourmusic.com/release/*
// @match        https://frostie4life9.github.io/playback/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @run-at       document-idle
// @noframes
// @downloadURL  https://frostie4life9.github.io/playback/rym-helper.user.js
// @updateURL    https://frostie4life9.github.io/playback/rym-helper.user.js
// ==/UserScript==

/* How it works
   On a Rate Your Music album page YOU opened, this reads the track ratings already
   on the page and adds them to a queue kept by Tampermonkey. It makes no network
   requests of its own: no crawling, no extra page loads.
   On Playback, it hands that queue to the app (window.postMessage). Playback says
   which albums it used, and only those leave the queue. */
(function () {
  'use strict';
  const QKEY = 'queue';
  const getQ = () => { try { return JSON.parse(GM_getValue(QKEY, '{}')) || {}; } catch (e) { return {}; } };
  const setQ = q => GM_setValue(QKEY, JSON.stringify(q));

  if (location.hostname === 'rateyourmusic.com') rymPage();
  else playbackPage();

  /* ---------------- Rate Your Music album page ---------------- */
  function rymPage() {
    const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const firstText = el => {               // artist links can carry a localized name in a nested span
      if (!el) return '';
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
      return own || txt(el);
    };

    function release() {
      const h = document.querySelector('.album_title');
      let title = '';
      if (h) { const c = h.cloneNode(true); c.querySelectorAll('input, .album_shortcut, script, style').forEach(x => x.remove()); title = txt(c); }
      const og = (document.querySelector('meta[property="og:title"]') || {}).content || '';
      const artistEls = [...document.querySelectorAll('.album_info a.artist, span[itemprop="byArtist"] a.artist')];
      let artists = [...new Set(artistEls.map(firstText).filter(Boolean))];
      if (!title || !artists.length) {      // fallback: "Title by Artist" style og:title
        const m = og.match(/^(.*)\s+by\s+(.+?)(?:\s*[-|–].*)?$/);
        if (m) { title = title || m[1].trim(); if (!artists.length) artists = [m[2].trim()]; }
      }
      let type = '';
      document.querySelectorAll('.album_info tr').forEach(tr => { if (/^type$/i.test(txt(tr.querySelector('th')))) type = txt(tr.querySelector('td')); });
      return { title, artists, type };
    }

    const cleanTitle = li => {
      const t = li.querySelector('.tracklist_title') || li;
      const c = t.cloneNode(true);
      c.querySelectorAll('.tracklist_duration, .tracklist_num, .credited_list, .rating_num, .track_rating_disp, img, script, style, input').forEach(x => x.remove());
      const song = c.querySelector('a.song, .rendered_text');
      return txt(song || c);
    };
    /* The number you gave a track. RYM shows track ratings as stars (0.5-5);
       Playback runs 1-10, so stars are doubled further down. */
    function rawRating(li) {
      const n = li.querySelector('.rating_num');
      if (n) { const v = parseFloat(n.textContent); if (v > 0) return v; }
      for (const img of li.querySelectorAll('.track_rating_disp img, [class*="track_rating"] img, img[title*="star"]')) {
        const v = parseFloat(img.getAttribute('title') || img.getAttribute('alt') || '');
        if (v > 0) return v;
      }
      const d = li.querySelector('.track_rating_disp');
      if (d) { const v = parseFloat(d.textContent); if (v > 0) return v; }
      return 0;
    }

    function capture() {
      const list = [...document.querySelectorAll('#tracks li.track')].filter(li => txt(li.querySelector('.tracklist_num')));
      const titles = list.map(cleanTitle);
      const rlis = [...document.querySelectorAll('#track_ratings li.track, .track_rating_hide li.track, .track_rating_hide ul > li')]
        .filter((li, i, a) => a.indexOf(li) === i);
      const raw = [];
      if (rlis.length) {
        rlis.forEach((li, i) => {
          const v = rawRating(li); if (!(v > 0)) return;
          const own = cleanTitle(li);
          raw.push({ t: own || titles[i] || '', v });
        });
      } else {                               // ratings shown inline in the tracklist
        list.forEach((li, i) => { const v = rawRating(li); if (v > 0) raw.push({ t: titles[i], v }); });
      }
      const stars = raw.every(x => x.v <= 5);
      const tracks = raw.filter(x => x.t).map(x => ({ t: x.t.slice(0, 300), r: Math.min(10, Math.round((stars ? x.v * 2 : x.v) * 2) / 2) }));
      return { tracks, tracklist: titles.filter(Boolean).slice(0, 200), stars };
    }

    const badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;max-width:300px;padding:10px 12px;border-radius:10px;font:13px/1.4 system-ui,sans-serif;background:#0f2b2b;color:#e6f4f1;box-shadow:0 4px 18px rgba(0,0,0,.35)';
    document.body.appendChild(badge);
    const btn = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.style.cssText = 'margin:6px 6px 0 0;padding:4px 8px;border-radius:6px;border:1px solid #6cc;background:transparent;color:inherit;cursor:pointer;font:inherit'; b.onclick = fn; return b; };

    function run() {
      const rel = release(), cap = capture(), url = location.origin + location.pathname.replace(/\/*$/, '/');
      badge.textContent = '';
      const head = document.createElement('b'); head.textContent = 'Playback'; badge.append(head, document.createElement('br'));
      const q = getQ();
      if (rel.title && rel.artists.length && cap.tracks.length) {
        q[url] = { url, title: rel.title.slice(0, 300), artists: rel.artists.map(a => a.slice(0, 200)).slice(0, 10), type: rel.type.slice(0, 60), tracks: cap.tracks, tracklist: cap.tracklist, at: Date.now() };
        setQ(q);
        badge.append(`Saved ${cap.tracks.length} song rating${cap.tracks.length === 1 ? '' : 's'} for ${rel.title}. ${Object.keys(q).length} album${Object.keys(q).length === 1 ? '' : 's'} waiting for Playback.`);
        badge.append(btn('Hide', () => badge.remove()));
      } else {
        badge.append(rel.title ? 'No song ratings of yours found on this page.' : 'Could not read this page.');
        const copy = btn('Copy debug info for Claude', () => {
          const pick = s => { const e = document.querySelector(s); return e ? e.outerHTML.slice(0, 20000) : '(none)'; };
          GM_setClipboard(['URL: ' + location.href, 'Release: ' + JSON.stringify(rel), '--- .album_info', pick('.album_info'), '--- #tracks', pick('#tracks'), '--- #track_ratings', pick('#track_ratings'), '--- .track_rating_hide', pick('.track_rating_hide')].join('\n'));
          copy.textContent = 'Copied. Paste it to Claude.';
        });
        badge.append(document.createElement('br'), copy, btn('Hide', () => badge.remove()));
      }
    }
    run();
    /* rate a track while the page is open and the saved copy updates too */
    let t = null;
    const host = document.querySelector('#track_ratings') || document.querySelector('.track_rating_hide') || document.querySelector('#tracks');
    if (host) new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 800); }).observe(host, { subtree: true, childList: true, attributes: true, characterData: true });
  }

  /* ---------------- Playback ---------------- */
  function playbackPage() {
    const send = () => window.postMessage({ src: 'rym-bridge', type: 'queue', v: 1, items: Object.values(getQ()) }, location.origin);
    window.addEventListener('message', e => {
      if (e.source !== window || e.origin !== location.origin) return;
      const d = e.data;
      if (!d || d.src !== 'playback') return;
      if (d.type === 'ask') send();
      else if (d.type === 'done' && Array.isArray(d.urls)) { const q = getQ(); d.urls.forEach(u => delete q[u]); setQ(q); send(); }
    });
    send();
  }
})();
