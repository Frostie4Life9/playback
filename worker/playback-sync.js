/* =========================================================
   Playback — sync  (worker version 10, 2026.11.13)
   Cloudflare Worker + KV. Same setup pattern as protocol-sync
   and gamelog-sync.

   SETUP (dashboard)
   1. Workers & Pages > Create > Start with Hello World
      -> name it "playback-sync" -> Deploy
   2. Edit code -> delete everything -> paste this file -> Deploy
   3. Settings > Bindings > Add > KV namespace
        Variable name: STATE
        KV namespace:  playback   (already created)
   4. Settings > Variables and Secrets > Add
        Type: Secret   Name: SECRET   Value: a long random string you invent
   5. Deploy again, then paste the Worker URL and the secret into
      Playback's Sync panel (bottom of the app).

   UPDATING an existing Worker: nothing to do. This Worker is connected to
   GitHub (Workers Builds, set up by wrangler.jsonc at the repo root), so every
   push to main deploys it, and the binding and secrets stay. Only if that
   connection is ever removed: open it > Edit code > select all, paste this
   file over it > Deploy.

   SPOTIFY HOURLY CHECK (version 3): Settings > Trigger events > Add >
   Cron trigger > every hour ("0 * * * *") > save. Without it the Worker
   only checks Spotify when the app asks.

   Opening the URL in a browser should return {"error":"unauthorized"}.

   ROUTES (all need the x-sync-key header)
   GET  /   -> the saved log (or null). With ?gz=1 a compressed log comes
               back compressed (content-type application/gzip); without it,
               it is unpacked to plain JSON for older copies of the app.
   PUT  /   -> save the log, either plain JSON (up to 1 MB) or gzipped
               (content-type application/gzip, ?mtime=<log mtime>, up to
               20 MB compressed, which is roughly 80-100 MB of log). Refused
               with 409 (and the stored copy) if the stored copy is newer, so
               a stale device can't overwrite fresher data. Since version 9 the
               app also sends ?base=<the mtime it last synced>, and the upload is
               refused when the stored log has changed since then, because a
               device that fell behind stamps its upload with the current time
               and would otherwise always look newer. ?force=1 overrides both
               when you choose "Keep this device". The previous copy is kept
               under "state-prev", and the first save of each day (Provo time)
               files the log as it stood under "state-day-YYYY-MM-DD" for 15 days.

   Compressed uploads are stored as-is and never unpacked here, which keeps
   each request well inside the free plan's CPU limit. The log's mtime rides
   along as KV metadata so the newer-copy check needs no parsing.
   Every response carries x-pb-worker: 5 so the app knows what this Worker
   can do (2 = compressed sync, 3 = Spotify plays, 4 = Spotify catalog too,
   5 = the morning-brief list, 6 = Discogs pressing search, 7 = Discogs pressing photos, 8 = your own record photos).

   MORNING BRIEF (version 5)
   The app keeps a tiny list of the next episode of each show you follow
   (title, season, episode, air date) under its own key, so this Worker never
   has to unpack your log.
   PUT  /brief  (x-sync-key as usual) -> the app saves that list.
   GET  /brief?k=<BRIEF_KEY> -> {today, tomorrow, timezone, updated, tonight:[],
                    tomorrowEps:[], thisWeek:[]}, with "today" worked out in
                    America/Denver. This one route does NOT use the sync key:
                    it takes a second, read-only secret so your morning brief
                    can fetch it. To turn it on: Settings > Variables and
                    Secrets > Add > Type: Secret, Name: BRIEF_KEY, Value: a long
                    random string you invent (not the SECRET). Without BRIEF_KEY
                    the route answers 404. It only ever holds show titles and
                    air dates.

   SPOTIFY (version 3)
   PUT    /spotify  {cid, rt, at, exp} -> the app hands over its Spotify sign-in
                    (PKCE: client ID + refresh token, no client secret). Checks
                    Spotify straight away.
   GET    /spotify?after=<ms> -> {connected, err, polled, cronAt, plays:[...]}
                    plays newer than <ms>, oldest first. Checks Spotify first if
                    the last check is over a minute old.
   DELETE /spotify  -> forgets the sign-in and the stored plays.
   GET    /spotify/api?p=<path> (version 4) -> a read-only Spotify catalog request
                    (artist search, an artist's albums, an album and its tracks)
                    made with the stored sign-in, so the app can build tracklists
                    from exactly what Spotify carries. Nothing else is allowed through.
                    Since version 10 a single album or single artist answer is kept in KV
                    for 30 days and shared by every device, so asking again costs Spotify
                    nothing. Adding &bust=1 skips the saved copy and refreshes it.
   PUT    /photo?k=<copy>/<slot> (version 8) -> stores your own photo of a record
                    (front, back, inner, labA, labB) in the STATE KV under photo:<k>;
                    answers with a signed link the app keeps in your log
   GET    /photo?k=&s=&v=  -> that photo; no sync key, the signature is the pass
   DELETE /photo?k=  -> removes it
   GET    /discogs/release?id= (version 7) -> one pressing's photos (front, back,
                    inner sleeves, labels) as Discogs owners uploaded them
   GET    /discogs?artist=&title=&barcode=&catno= (version 6) -> a vinyl pressing
                    search on Discogs, answered with Discogs' own JSON ({results:[...]}),
                    so the Collection tab can offer the exact pressing you own.
                    Needs a free personal access token as a Secret named
                    DISCOGS_TOKEN (discogs.com > Settings > Developers > Generate
                    new token; Cloudflare > this Worker > Settings > Variables and
                    Secrets > Add > Secret). Without it the route answers
                    {"error":"no discogs token"} and the Collection tab still works by hand.
   The hourly Cron Trigger checks Spotify's recently played (it only keeps your
   last 50 plays) and adds new ones to a list of the last 3000.
   Spotify rotates the refresh token on every refresh, so only the hourly check
   refreshes it while that check is running (it renews it every hour, so the
   catalog route always has a live token); app requests just use the current
   access token. The sign-in (spotify-auth) and the check results (spotify-meta)
   are separate keys so a check can never write back an old refresh token.
   ========================================================= */

const KEYNAME = 'state';
const PREV = 'state-prev';
const MAX_JSON = 1024 * 1024;
const MAX_GZ = 20 * 1024 * 1024;   // KV allows 25 MiB per value
const SP_AUTH = 'spotify-auth', SP_META = 'spotify-meta', SP_PLAYS = 'spotify-plays', SP_MAX = 3000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-sync-key',
  'Access-Control-Expose-Headers': 'x-pb-worker, retry-after',
  'Access-Control-Max-Age': '86400',
  'x-pb-worker': '10'
};
const JSON_H = Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, CORS);
const GZ_H = Object.assign({ 'content-type': 'application/gzip', 'cache-control': 'no-store' }, CORS);

function reply(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: JSON_H });
}

function keyMatches(given, want) {
  let ok = given.length === want.length;
  for (let i = 0; i < Math.max(given.length, want.length); i++) {
    if (given.charCodeAt(i) !== want.charCodeAt(i)) ok = false;
  }
  return ok;
}

/* the stored log as { buf, enc: 'gzip'|'json', mtime } or null */
async function readStored(env) {
  const { value, metadata } = await env.STATE.getWithMetadata(KEYNAME, 'arrayBuffer');
  if (!value) return null;
  const enc = metadata && metadata.enc === 'gzip' ? 'gzip' : 'json';
  let mtime = metadata && typeof metadata.mtime === 'number' ? metadata.mtime : null;
  if (mtime === null && enc === 'json') {   // saved by worker version 1: read it once
    try { mtime = JSON.parse(new TextDecoder().decode(value)).mtime || 0; } catch (e) { mtime = 0; }
  }
  return { buf: value, enc, mtime: mtime || 0 };
}

function sendStored(st, wantGz, status) {
  if (st.enc === 'gzip' && !wantGz) {
    const plain = new Blob([st.buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(plain, { status: status || 200, headers: JSON_H });
  }
  return new Response(st.buf, { status: status || 200, headers: st.enc === 'gzip' ? GZ_H : JSON_H });
}

/* ---------- Morning brief ---------- */
const BRIEF = 'brief', BRIEF_TZ = 'America/Denver', MAX_BRIEF = 64 * 1024;
const addDay = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

async function briefPut(request, env) {
  const body = await request.text();
  if (body.length > MAX_BRIEF) return reply({ error: 'payload too large' }, 413);
  let p; try { p = JSON.parse(body); } catch (e) { return reply({ error: 'body is not valid JSON' }, 400); }
  if (!p || p.v !== 1 || !Array.isArray(p.shows)) return reply({ error: 'not a brief list' }, 400);
  const shows = [];
  for (const x of p.shows.slice(0, 100)) {
    if (!x || typeof x.t !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(String(x.d))) continue;
    shows.push({ t: x.t.slice(0, 200), n: Math.max(0, parseInt(x.n, 10) || 0), e: Math.max(0, parseInt(x.e, 10) || 0), d: x.d, behind: !!x.behind });
  }
  await env.STATE.put(BRIEF, JSON.stringify({ at: Date.now(), shows }));
  return reply({ ok: true, shows: shows.length });
}

async function briefGet(env, url) {
  const want = env.BRIEF_KEY ? String(env.BRIEF_KEY).trim() : '';
  if (!want) return reply({ error: 'not found' }, 404);
  if (!keyMatches((url.searchParams.get('k') || '').trim(), want)) return reply({ error: 'unauthorized' }, 401);
  const b = (await getJSON(env, BRIEF)) || { at: null, shows: [] };
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: BRIEF_TZ, year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(new Date()).reduce((o, x) => (o[x.type] = x.value, o), {});
  const t0 = today.year + '-' + String(today.month).padStart(2, '0') + '-' + String(today.day).padStart(2, '0');
  const t1 = addDay(t0, 1), t7 = addDay(t0, 7);
  const shows = (b.shows || []).filter(x => x.d >= t0);
  return reply({
    today: t0, tomorrow: t1, timezone: BRIEF_TZ, updated: b.at,
    tonight: shows.filter(x => x.d === t0),
    tomorrowEps: shows.filter(x => x.d === t1),
    thisWeek: shows.filter(x => x.d > t1 && x.d <= t7)
  });
}

/* ---------- Spotify ---------- */
async function getJSON(env, k) { try { return JSON.parse(await env.STATE.get(k)) } catch (e) { return null } }

async function spRefresh(env, auth) {
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: auth.rt, client_id: auth.cid })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { err: j.error === 'invalid_grant' ? 'reconnect' : 'sign-in ' + r.status };
  await env.STATE.put(SP_AUTH, JSON.stringify({ cid: auth.cid, rt: j.refresh_token || auth.rt, at: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 }));
  return { at: j.access_token };
}

/* read-only catalog requests for building tracklists */
const CAT_OK = /^(search|artists\/[A-Za-z0-9]{22}(\/albums)?|albums\/[A-Za-z0-9]{22}(\/tracks)?)\?[A-Za-z0-9_=&%.,:+*'()\-]{0,600}$/;
const CAT_CACHE = /^(albums|artists)\/[A-Za-z0-9]{22}(\?[A-Za-z0-9_=&%.,:+*'()\-]{0,200})?$/;   /* one album or one artist, never lists or searches */
const CAT_TTL = 30 * 86400;
async function spCatalog(env, url) {
  let p = url.searchParams.get('p') || '';
  if (!CAT_OK.test(p)) return reply({ error: 'path not allowed' }, 400);
  const bust = /[?&]bust=1(&|$)/.test(p);
  if (bust) p = p.replace(/([?&])bust=1(&|$)/, (m, a, b) => (b ? a : ''));
  const ckey = CAT_CACHE.test(p) ? 'spcat:' + p : '';
  if (ckey && !bust) {
    const hit = await env.STATE.get(ckey).catch(() => null);
    if (hit) return new Response(hit, { status: 200, headers: JSON_H });
  }
  const auth = await getJSON(env, SP_AUTH);
  if (!auth) return reply({ error: 'not connected' }, 409);
  let at = auth.at;
  if (!at || Date.now() > (auth.exp || 0) - 60000) {
    const meta = (await getJSON(env, SP_META)) || {};
    if (meta.err === 'reconnect') return reply({ error: 'reconnect' }, 409);
    const cronOff = !meta.cronAt || Date.now() - meta.cronAt > 3 * 3600 * 1000;
    if (!cronOff) return new Response(JSON.stringify({ error: 'token' }), { status: 503, headers: Object.assign({ 'retry-after': '30' }, JSON_H) });
    const t = await spRefresh(env, auth);
    if (t.err) { if (t.err === 'reconnect') { meta.err = 'reconnect'; await env.STATE.put(SP_META, JSON.stringify(meta)); } return reply({ error: t.err }, 409); }
    at = t.at;
  }
  const r = await fetch('https://api.spotify.com/v1/' + p, { headers: { authorization: 'Bearer ' + at } });
  if (r.status === 401) return new Response(JSON.stringify({ error: 'token' }), { status: 503, headers: Object.assign({ 'retry-after': '30' }, JSON_H) });
  const h = Object.assign({}, JSON_H);
  const ra = r.headers.get('retry-after'); if (ra) h['retry-after'] = ra;
  const body = await r.text();
  if (ckey && r.status === 200) { try { await env.STATE.put(ckey, body, { expirationTtl: CAT_TTL }); } catch (e) { /* KV write limit: just skip saving */ } }
  return new Response(body, { status: r.status, headers: h });
}

/* Discogs vinyl pressing search (version 6). Read-only: it only ever calls the database
   search, with the token kept in the DISCOGS_TOKEN secret, and hands the answer back. */
async function discogsSearch(env, url) {
  if (!env.DISCOGS_TOKEN) return reply({ error: 'no discogs token' }, 409);
  const g = k => (url.searchParams.get(k) || '').trim().slice(0, 120);
  const artist = g('artist'), title = g('title'), barcode = g('barcode').replace(/[^0-9A-Za-z]/g, ''), catno = g('catno');
  if (!artist && !title && !barcode && !catno) return reply({ error: 'nothing to search for' }, 400);
  const q = new URLSearchParams({ type: 'release', format: 'Vinyl', per_page: '30' });
  if (barcode) q.set('barcode', barcode);
  if (catno) q.set('catno', catno);
  if (artist) q.set('artist', artist);
  if (title) q.set('release_title', title);
  const go = () => fetch('https://api.discogs.com/database/search?' + q, {
    headers: { authorization: 'Discogs token=' + String(env.DISCOGS_TOKEN).trim(), 'user-agent': 'PlaybackApp/1.0 (+https://frostie4life9.github.io/playback/)', accept: 'application/json' }
  });
  let r = await go();
  /* Discogs throttles by source address, and a Worker shares addresses with many others: wait a moment and try once more */
  if (r.status === 429) {
    const wait = Math.min(Math.max(parseFloat(r.headers.get('retry-after')) || 2, 1), 4);
    await new Promise(res => setTimeout(res, wait * 1000));
    r = await go();
  }
  const h = Object.assign({}, JSON_H);
  const ra = r.headers.get('retry-after'); if (ra) h['retry-after'] = ra;
  if (r.status === 401) return reply({ error: 'discogs rejected the token' }, 409);
  if (r.status === 429) {
    const rl = {};
    for (const k of ['x-discogs-ratelimit', 'x-discogs-ratelimit-used', 'x-discogs-ratelimit-remaining']) { const v = r.headers.get(k); if (v) rl[k.replace('x-discogs-', '')] = v; }
    return new Response(JSON.stringify({ error: 'discogs rate limit', ratelimit: rl, retryAfter: ra || '', via: r.headers.get('server') || '', body: (await r.text()).slice(0, 200) }), { status: 429, headers: h });
  }
  return new Response(await r.text(), { status: r.status, headers: h });
}

/* Your own record photos (version 8), kept in the same KV namespace as the log. Image tags
   can't send the sync key, so each stored photo gets a signed link (HMAC of its key with
   SECRET); the link only opens that one photo. */
const PHOTO_RE = /^[A-Za-z0-9_.:-]{1,80}\/(front|back|inner|labA|labB)$/;
const PHOTO_MAX = 4 * 1024 * 1024;
async function photoSig(env, k) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode('photo:' + String(env.SECRET).trim()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(k)));
  return [...sig.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function photoGet(env, url) {
  const k = url.searchParams.get('k') || '', s = url.searchParams.get('s') || '';
  if (!PHOTO_RE.test(k) || !keyMatches(s, await photoSig(env, k))) return new Response('not found', { status: 404, headers: CORS });
  const { value, metadata } = await env.STATE.getWithMetadata('photo:' + k, 'arrayBuffer');
  if (!value) return new Response('not found', { status: 404, headers: CORS });
  return new Response(value, { headers: Object.assign({ 'content-type': (metadata && metadata.ct) || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable' }, CORS) });
}
async function photoPut(request, env, url) {
  const k = url.searchParams.get('k') || '';
  if (!PHOTO_RE.test(k)) return reply({ error: 'bad photo key' }, 400);
  const ct = (request.headers.get('content-type') || '').split(';')[0];
  if (!/^image\/(jpeg|webp|png)$/.test(ct)) return reply({ error: 'not an image' }, 415);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > PHOTO_MAX) return reply({ error: 'photo too large' }, 413);
  await env.STATE.put('photo:' + k, buf, { metadata: { ct, at: Date.now() } });
  const v = Date.now().toString(36);
  return reply({ url: url.origin + '/photo?' + new URLSearchParams({ k, s: await photoSig(env, k), v }), bytes: buf.byteLength });
}

/* One Discogs pressing's photos (version 7). Discogs only hands out image links to signed-in
   requests, so this uses the DISCOGS_TOKEN secret and returns just the image list. */
async function discogsRelease(env, url) {
  if (!env.DISCOGS_TOKEN) return reply({ error: 'no discogs token' }, 409);
  const id = (url.searchParams.get('id') || '').replace(/[^0-9]/g, '').slice(0, 12);
  if (!id) return reply({ error: 'no release id' }, 400);
  const r = await fetch('https://api.discogs.com/releases/' + id, {
    headers: { authorization: 'Discogs token=' + String(env.DISCOGS_TOKEN).trim(), 'user-agent': 'PlaybackApp/1.0 (+https://frostie4life9.github.io/playback/)', accept: 'application/json' }
  });
  if (r.status === 401) return reply({ error: 'discogs rejected the token' }, 409);
  if (!r.ok) return reply({ error: 'discogs ' + r.status }, r.status === 429 ? 429 : 502);
  const j = await r.json();
  const images = (j.images || []).slice(0, 24).map(i => ({ type: i.type, uri: i.uri, uri150: i.uri150, width: i.width, height: i.height }));
  return reply({ id: +id, images, uri: j.uri || '' });
}

/* one check of Spotify's recently played. mayRefresh: allowed to swap the refresh
   token (only the hourly check, or the app when the hourly check is not running) */
async function spCheck(env, mayRefresh, fromCron) {
  const auth = await getJSON(env, SP_AUTH);
  if (!auth) return null;
  const meta = (await getJSON(env, SP_META)) || {};
  if (fromCron) meta.cronAt = Date.now();
  const done = async () => { await env.STATE.put(SP_META, JSON.stringify(meta)); return meta; };
  if (meta.err === 'reconnect') return done();

  let at = auth.at;
  /* the hourly check always renews, so the token never lapses between checks */
  if (!at || Date.now() > (auth.exp || 0) - 60000 || fromCron) {
    if (!mayRefresh) return done();
    const t = await spRefresh(env, auth);
    if (t.err) { meta.err = t.err; return done(); }
    at = t.at;
  }

  const r = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', { headers: { authorization: 'Bearer ' + at } });
  if (r.status === 401) {   /* token went stale early: the next refresh-allowed check renews it */
    if (mayRefresh) await env.STATE.put(SP_AUTH, JSON.stringify(Object.assign({}, auth, { at: '', exp: 0 })));
    return done();
  }
  if (r.status !== 200 && r.status !== 204) { meta.err = 'spotify ' + r.status; return done(); }
  const items = r.status === 204 ? [] : ((await r.json().catch(() => ({}))).items || []);
  const fresh = items.map(x => { const t = x.track || {}; return { p: Date.parse(x.played_at) || 0, t: t.name || '', a: (t.artists || []).map(a => a.name).filter(Boolean), al: (t.album && t.album.name) || '' }; }).filter(x => x.p && x.t);
  if (fresh.length) {
    const plays = (await getJSON(env, SP_PLAYS)) || [];
    const have = new Set(plays.map(x => x.p));
    let added = 0;
    for (const x of fresh) if (!have.has(x.p)) { plays.push(x); have.add(x.p); added++; }
    if (added) { plays.sort((a, b) => a.p - b.p); await env.STATE.put(SP_PLAYS, JSON.stringify(plays.slice(-SP_MAX))); }
  }
  meta.err = ''; meta.polled = Date.now();
  return done();
}

async function spotify(request, env, url) {
  if (request.method === 'DELETE') {
    await Promise.all([SP_AUTH, SP_META, SP_PLAYS].map(k => env.STATE.delete(k)));
    return reply({ connected: false, plays: [] });
  }
  if (request.method === 'PUT') {
    const body = await request.text();
    if (body.length > 8192) return reply({ error: 'payload too large' }, 413);
    let t; try { t = JSON.parse(body); } catch (e) { return reply({ error: 'body is not valid JSON' }, 400); }
    if (!t || typeof t.cid !== 'string' || !/^[0-9a-f]{32}$/i.test(t.cid) || typeof t.rt !== 'string' || !t.rt) return reply({ error: 'not a Spotify sign-in' }, 400);
    await env.STATE.put(SP_AUTH, JSON.stringify({ cid: t.cid, rt: t.rt, at: typeof t.at === 'string' ? t.at : '', exp: Number(t.exp) || 0 }));
    await env.STATE.delete(SP_META);
    await spCheck(env, true, false);
  } else if (request.method !== 'GET') return reply({ error: 'method not allowed' }, 405);

  let meta = await getJSON(env, SP_META);
  const auth = request.method === 'GET' ? await getJSON(env, SP_AUTH) : true;
  if (!auth) return reply({ connected: false, plays: [] });
  if (request.method === 'GET' && (!meta || Date.now() - (meta.polled || 0) > 60000)) {
    const cronOff = !meta || !meta.cronAt || Date.now() - meta.cronAt > 3 * 3600 * 1000;
    meta = (await spCheck(env, cronOff, false)) || meta;
  }
  meta = meta || {};
  const after = Number(url.searchParams.get('after')) || 0;
  const plays = ((await getJSON(env, SP_PLAYS)) || []).filter(x => x.p > after);
  return reply({ connected: true, err: meta.err || '', polled: meta.polled || 0, cronAt: meta.cronAt || 0, plays });
}

/* one dated copy a day (version 9): the first save of each day, Provo time, files the
   log as it stood under state-day-YYYY-MM-DD, kept 15 days. Two extra writes a day. */
const SNAP_LAST = 'snap-last', SNAP_TTL = 15 * 86400;
async function daySnap(env, st) {
  try {
    const day = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
    if ((await env.STATE.get(SNAP_LAST)) === day) return;
    await env.STATE.put('state-day-' + day, st.buf, { metadata: { enc: st.enc, mtime: st.mtime }, expirationTtl: SNAP_TTL });
    await env.STATE.put(SNAP_LAST, day);
  } catch (e) {}
}

export default {
  async scheduled(event, env, ctx) {
    if (env.STATE) ctx.waitUntil(spCheck(env, true, true));
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.STATE) return reply({ error: 'missing the STATE KV binding' }, 500);
    if (!env.SECRET) return reply({ error: 'missing the SECRET variable' }, 500);

    const url = new URL(request.url);
    if (url.pathname === '/brief' && request.method === 'GET') return briefGet(env, url);   /* its own read-only key */
    if (url.pathname === '/photo' && request.method === 'GET') return photoGet(env, url);   /* signed link, no sync key */
    const given = (request.headers.get('x-sync-key') || '').trim();
    if (!keyMatches(given, String(env.SECRET).trim())) return reply({ error: 'unauthorized' }, 401);
    if (url.pathname === '/spotify/api') return request.method === 'GET' ? spCatalog(env, url) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/photo') {
      if (request.method === 'PUT') return photoPut(request, env, url);
      if (request.method === 'DELETE') { const k = url.searchParams.get('k') || ''; if (!PHOTO_RE.test(k)) return reply({ error: 'bad photo key' }, 400); await env.STATE.delete('photo:' + k); return reply({ ok: true }); }
      return reply({ error: 'method not allowed' }, 405);
    }
    if (url.pathname === '/discogs/release') return request.method === 'GET' ? discogsRelease(env, url) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/discogs') return request.method === 'GET' ? discogsSearch(env, url) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/spotify') return spotify(request, env, url);
    if (url.pathname === '/brief') return request.method === 'PUT' ? briefPut(request, env) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname !== '/') return reply({ error: 'not found' }, 404);
    const wantGz = url.searchParams.get('gz') === '1';

    if (request.method === 'GET') {
      const st = await readStored(env);
      return st ? sendStored(st, wantGz) : new Response('null', { headers: JSON_H });
    }

    if (request.method === 'PUT') {
      const isGz = /gzip/.test(request.headers.get('content-type') || '');
      const body = await request.arrayBuffer();
      let mtime;
      if (isGz) {
        if (body.byteLength > MAX_GZ) return reply({ error: 'payload too large' }, 413);
        const b = new Uint8Array(body, 0, Math.min(2, body.byteLength));
        if (b[0] !== 0x1f || b[1] !== 0x8b) return reply({ error: 'body is not gzip' }, 400);
        mtime = Number(url.searchParams.get('mtime'));
        if (!Number.isFinite(mtime) || mtime < 0) return reply({ error: 'missing mtime' }, 400);
      } else {
        if (body.byteLength > MAX_JSON) return reply({ error: 'payload too large' }, 413);
        let parsed;
        try { parsed = JSON.parse(new TextDecoder().decode(body)); } catch (e) { return reply({ error: 'body is not valid JSON' }, 400); }
        if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.music) || !Array.isArray(parsed.screen)) {
          return reply({ error: 'not a Playback log' }, 400);
        }
        mtime = parsed.mtime || 0;
      }

      const st = await readStored(env);
      if (st) {
        const force = url.searchParams.get('force') === '1';
        const baseQ = url.searchParams.get('base'), base = Number(baseQ);
        if (!force && baseQ !== null && Number.isFinite(base) && st.mtime > base) return sendStored(st, wantGz, 409);
        if (!force && st.mtime > mtime) return sendStored(st, wantGz, 409);
        await daySnap(env, st);
        await env.STATE.put(PREV, st.buf, { metadata: { enc: st.enc, mtime: st.mtime } });
      }
      await env.STATE.put(KEYNAME, body, { metadata: { enc: isGz ? 'gzip' : 'json', mtime } });
      return reply({ ok: true, bytes: body.byteLength, mtime: mtime || null });
    }

    return reply({ error: 'method not allowed' }, 405);
  }
};
