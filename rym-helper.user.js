// ==UserScript==
// @name         Playback RYM helper
// @namespace    https://frostie4life9.github.io/playback/
// @version      2026.11.03.3
// @description  Saves your own song ratings from the Rate Your Music album pages you open, so Playback can import them. It never loads pages by itself.
// @match        https://rateyourmusic.com/release/*
// @match        https://frostie4life9.github.io/playback/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
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
  /* Each album is its own stored value ("a:" + page URL). A batch of tabs
     saving at the same moment then can't overwrite each other, which a single
     shared list did. */
  const PFX = 'a:';
  const getQ = () => { const q = {}; for (const k of GM_listValues()) if (k.startsWith(PFX)) { try { const v = JSON.parse(GM_getValue(k, 'null')); if (v) q[v.url] = v; } catch (e) {} } return q; };
  const putA = a => GM_setValue(PFX + a.url, JSON.stringify(a));
  const delA = url => GM_deleteValue(PFX + url);
  const count = () => GM_listValues().filter(k => k.startsWith(PFX)).length;
  if (GM_getValue('qv', 0) < 3) { GM_setValue(QKEY, '{}'); GM_setValue('qv', 3); }
  if (GM_getValue('qv', 0) < 4) {            // move the old shared list over to one value per album
    try { Object.values(JSON.parse(GM_getValue(QKEY, '{}')) || {}).forEach(a => a && a.url && putA(a)); } catch (e) {}
    GM_deleteValue(QKEY); GM_setValue('qv', 4);
  }

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
      if (h) {
        title = [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
        if (!title) { const c = h.cloneNode(true); c.querySelectorAll('input, .album_shortcut, script, style').forEach(x => x.remove()); title = txt(c); }
        title = title.replace(/\s+By\s+.*$/i, '').trim();
      }
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
      const st = li.querySelector('.rating_stars');                 // class "star-8m" = 8 half-stars
      const m = st && st.className.match(/star-(\d+)m/);
      if (m && +m[1] > 0) return +m[1] / 2;
      return 0;
    }

    function capture() {
      const list = [...document.querySelectorAll('#tracks li.track')].filter(li => txt(li.querySelector('.tracklist_num')));
      const titles = list.map(cleanTitle);
      /* only the "my track ratings" box: the .track_rating_hide lists under
         reviews are other people's ratings */
      const box = document.querySelector('#my_track_ratings') || document;
      const rlis = [...box.querySelectorAll('#track_ratings li.track')];
      const raw = [];
      if (rlis.length) {
        rlis.forEach((li, i) => {
          const v = rawRating(li); if (!(v > 0)) return;
          const own = cleanTitle(li);
          raw.push({ t: own || titles[i] || '', v });
        });
      }
      const stars = true;                    // RYM shows track ratings as 0.5-5 stars
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
      const n = cap.tracks.length, total = cap.tracklist.length;
      const tooMany = total > 0 && n > total;
      if (rel.title && rel.artists.length && n && !tooMany) {
        putA({ url, title: rel.title.slice(0, 300), artists: rel.artists.map(a => a.slice(0, 200)).slice(0, 10), type: rel.type.slice(0, 60), tracks: cap.tracks, tracklist: cap.tracklist, at: Date.now() });
        const c = count();
        badge.append(`Saved ${n} song rating${n === 1 ? '' : 's'} (of ${total || '?'} songs) for ${rel.title}. ${c} album${c === 1 ? '' : 's'} waiting for Playback.`);
      } else if (tooMany) {
        delA(url);
        badge.append(`Found ${n} ratings but only ${total} songs, so something is off. Nothing saved for this album.`);
      } else {
        badge.append(rel.title ? 'No song ratings of yours found on this page.' : 'Could not read this page.');
      }
      const copy = btn('Copy debug info for Claude', () => {
        const pick = s => { const e = document.querySelector(s); return e ? e.outerHTML.slice(0, 15000) : '(none)'; };
        const path = e => { const out = []; for (let i = 0; i < 7 && e; i++, e = e.parentElement) out.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '')); return out.join(' < '); };
        const sels = ['#tracks li.track', '#tracks_mobile li.track', '#track_ratings li.track', '.track_rating_hide ul > li', '.rating_num', '.track_rating_disp', '.tracklist_num'];
        GM_setClipboard(['URL: ' + location.href, 'Release: ' + JSON.stringify(rel), 'Captured: ' + JSON.stringify(cap.tracks),
          'Counts: ' + sels.map(x => x + '=' + document.querySelectorAll(x).length).join(', '),
          'Where .rating_num lives: ' + [...document.querySelectorAll('.rating_num')].slice(0, 4).map(path).join(' || '),
          '--- #tracks', pick('#tracks'), '--- #track_ratings', pick('#track_ratings'), '--- .track_rating_hide', pick('.track_rating_hide')].join('\n'));
        copy.textContent = 'Copied. Paste it to Claude.';
      });
      badge.append(document.createElement('br'), copy, btn('Hide', () => badge.remove()));
    }
    run();
    /* rate a track while the page is open and the saved copy updates too */
    let t = null;
    const host = document.querySelector('#track_ratings');
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
      else if (d.type === 'done' && Array.isArray(d.urls)) { d.urls.forEach(u => typeof u === 'string' && delA(u)); send(); }
    });
    send();
  }
})();
