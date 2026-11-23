/* =========================================================
   Playback — sync  (worker version 21, 2026.11.22)
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
   5 = the morning-brief list, 6 = Discogs pressing search, 7 = Discogs pressing photos, 8 = your own record photos,
   11 = Google accounts, friends and friends' ratings, 12 = a capped copy of a friend's log under their Google account, 13 = the owner can sign in with Google instead of pasting the sync key, 14 = profile picture and account color, 15 = the owner can list every account: GET /users, see the accounts section above the export, 16 = Apple Music artist photos: GET /apple/art, 20 = those photos saved for everyone and open to signed-in friends: GET /acct/apple/art, 21 = &fresh=1 skips the saved copy, 22 = POST /spotify/play starts an album on your Spotify).

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
   POST   /spotify/play {album} (version 22) -> starts that album from its first song on
                    whichever device has Spotify open (or the only one Spotify
                    lists). {ok} | {error:'nodevice'} | {error:'scope'} (the
                    sign-in predates the play permission: reconnect Spotify).
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
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-sync-key, authorization',
  'Access-Control-Expose-Headers': 'x-pb-worker, retry-after, x-pb-cache',
  'Access-Control-Max-Age': '86400',
  'x-pb-worker': '23'
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
  /* new albums and EPs from the artists you follow (version 18): [{a: artist, t: title, d: day}] */
  const rel = [];
  for (const x of (Array.isArray(p.rel) ? p.rel : []).slice(0, 20)) {
    if (!x || typeof x.a !== 'string' || typeof x.t !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(String(x.d))) continue;
    rel.push({ a: x.a.slice(0, 120), t: x.t.slice(0, 200), d: x.d });
  }
  /* the app resends the list every time it opens: only save when it actually changed (a read is free, a write is not) */
  const prev = await getJSON(env, BRIEF);
  if (prev && JSON.stringify(prev.shows) === JSON.stringify(shows) && JSON.stringify(prev.rel || []) === JSON.stringify(rel)) return reply({ ok: true, shows: shows.length, unchanged: true });
  await env.STATE.put(BRIEF, JSON.stringify({ at: Date.now(), shows, rel }));
  return reply({ ok: true, shows: shows.length, releases: rel.length });
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
    thisWeek: shows.filter(x => x.d > t1 && x.d <= t7),
    newReleases: b.rel || []
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
/* Apple Music artist photo (version 16). Apple's keyless lookup has no artist pictures, but every artist page on
   music.apple.com names one in its page metadata (og:image). A browser cannot read that page across sites, so this reads
   it here and hands back only the picture's address minus its size, so the app can ask Apple for the size it wants.
   Owner only (it sits behind the sync key like everything else), one call per artist: the app remembers the answer. */
/* Apple Music artist photos for everyone (version 20): each artist's picture address is saved for 60 days (a miss for 7) in the
   CATALOG table, so the page is only read from Apple once per artist for the whole app, owner and friends alike. A signed-in
   friend may ask for at most AART_CAP fresh ones a day; saved answers are free. */
const AART_TTL = 60 * 86400, AART_MISS_TTL = 7 * 86400, AART_CAP = 120;
async function appleArtCached(env, url, who) {
  const id = (url.searchParams.get('id') || '').replace(/\D/g, '');
  if (!id || id.length > 12 || !env.CATALOG) return appleArt(url);
  const ck = 'aart:' + id;
  const fresh = url.searchParams.get('fresh') === '1';   /* a new release came out: skip the saved copy once (version 21) */
  const hit = fresh ? null : await env.CATALOG.prepare('SELECT v FROM catalog WHERE k = ?1 AND exp > ?2').bind(ck, Date.now()).first('v').catch(() => null);
  if (hit) return hit === 'none' ? reply({ error: 'none' }, 404) : reply({ base: hit });
  if (who !== 'owner') { await acctInit(env); if (!(await rlHit(env, 'aart:' + who, AART_CAP, 86400))) return reply({ error: 'daily limit' }, 429); }
  const r = await appleArt(url);
  if (r.status === 200 || r.status === 404) {
    let v = 'none';
    if (r.status === 200) { try { v = (await r.clone().json()).base || 'none'; } catch (e) {} }
    try { await env.CATALOG.prepare('INSERT OR REPLACE INTO catalog (k, v, exp) VALUES (?1, ?2, ?3)').bind(ck, v, Date.now() + (v === 'none' ? AART_MISS_TTL : AART_TTL) * 1000).run(); } catch (e) { /* skip saving */ }
  }
  return r;
}
/* MORE ARTIST ART (version 23): wide backgrounds and extra photos from fanart.tv, TheAudioDB and Deezer, so the same picture
   doesn't show everywhere. One artist's list (by MusicBrainz id) is saved in CATALOG for 30 days (a miss for 7), shared by
   everyone; a signed-in friend may ask for ART_CAP fresh ones a day. fanart.tv needs the FANART_KEY secret (without it, the
   other two still answer). The app scores the pictures itself and remembers its picks, so each artist is looked at once. */
const ART_TTL = 30 * 86400, ART_MISS_TTL = 7 * 86400, ART_CAP = 120;
const ART_UA = 'PlaybackApp/1.0 (+https://frostie4life9.github.io/playback/)';
const ART_HOSTS = /^https:\/\/(assets\.fanart\.tv|r2\.theaudiodb\.com|www\.theaudiodb\.com|cdn-images\.dzcdn\.net|e-cdns-images\.dzcdn\.net|is\d+-ssl\.mzstatic\.com|i\.scdn\.co)\//;
const artNorm = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
async function artGet(env, url, who) {
  const mb = (url.searchParams.get('mb') || '').toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(mb)) return reply({ error: 'bad id' }, 400);
  const name = (url.searchParams.get('n') || '').slice(0, 120);
  const ck = 'art:' + mb;
  if (env.CATALOG && url.searchParams.get('fresh') !== '1') {
    const hit = await env.CATALOG.prepare('SELECT v FROM catalog WHERE k = ?1 AND exp > ?2').bind(ck, Date.now()).first('v').catch(() => null);
    if (hit) return new Response(hit, { headers: Object.assign({ 'x-pb-cache': 'hit' }, JSON_H) });
  }
  if (who !== 'owner') { await acctInit(env); if (!(await rlHit(env, 'art:' + who, ART_CAP, 86400))) return reply({ error: 'daily limit' }, 429); }
  const jget = async u => { try { const r = await fetch(u, { headers: { 'user-agent': ART_UA, accept: 'application/json' } }); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  const key = env.FANART_KEY ? String(env.FANART_KEY).trim() : '';
  const [fa, adb, dz] = await Promise.all([
    key ? jget('https://webservice.fanart.tv/v3/music/' + mb + '?api_key=' + encodeURIComponent(key)) : null,
    jget('https://www.theaudiodb.com/api/v1/json/123/artist-mb.php?i=' + mb),
    name ? jget('https://api.deezer.com/search/artist?q=' + encodeURIComponent(name) + '&limit=5') : null
  ]);
  /* bg: wide backgrounds, sq: square photos. Each is [address, small preview or '', source, likes] */
  const out = { bg: [], sq: [], fa: !!fa, adb: !!(adb && adb.artists), dz: !!dz };
  const ok = u => typeof u === 'string' && ART_HOSTS.test(u) && u.length < 400;
  const faPrev = u => u.replace('assets.fanart.tv/fanart/', 'assets.fanart.tv/preview/');
  if (fa) {
    for (const x of (fa.artistbackground || []).slice(0, 10)) if (ok(x.url)) out.bg.push([x.url, faPrev(x.url), 'fa', +x.likes || 0]);
    for (const x of (fa.artistthumb || []).slice(0, 4)) if (ok(x.url)) out.sq.push([x.url, faPrev(x.url), 'fa', +x.likes || 0]);
  }
  const a = adb && adb.artists && adb.artists[0];
  if (a) {
    for (const k of ['strArtistFanart', 'strArtistFanart2', 'strArtistFanart3', 'strArtistFanart4']) if (ok(a[k])) out.bg.push([a[k], a[k] + '/preview', 'adb', 0]);
    if (ok(a.strArtistThumb)) out.sq.push([a.strArtistThumb, a.strArtistThumb + '/preview', 'adb', 0]);
  }
  if (dz && Array.isArray(dz.data) && name) {
    const want = artNorm(name), m = dz.data.find(x => artNorm(x.name) === want);
    if (m && ok(m.picture_xl) && !/\/artist\/\//.test(m.picture_xl)) out.sq.push([m.picture_xl, ok(m.picture_medium) ? m.picture_medium : '', 'dz', 0]);   /* an empty hash is Deezer's grey placeholder */
  }
  const body = JSON.stringify(out), none = !out.bg.length && !out.sq.length;
  const gotAll = (!key || fa !== null) && adb !== null && (!name || dz !== null);   /* a source that failed to answer: don't save a half list for 30 days */
  if (env.CATALOG && (gotAll || !none)) {
    try { await env.CATALOG.prepare('INSERT OR REPLACE INTO catalog (k, v, exp) VALUES (?1, ?2, ?3)').bind(ck, body, Date.now() + (none ? ART_MISS_TTL : gotAll ? ART_TTL : ART_MISS_TTL) * 1000).run(); } catch (e) { /* the next ask fetches again */ }
  }
  return new Response(body, { headers: JSON_H });
}
/* A picture from one of the art hosts, passed through with CORS so the app can read its pixels to score it (version 23).
   Open without a key like /photo, but only for those hosts, and only images under 6 MB. */
async function artImg(url, ctx) {
  const u = url.searchParams.get('u') || '';
  if (!ART_HOSTS.test(u) || u.length > 400) return reply({ error: 'host not allowed' }, 400);
  const ck = new Request('https://playback-art.cache/?u=' + encodeURIComponent(u));
  const c = caches.default;
  let r = await c.match(ck).catch(() => null);
  if (r) return r;
  let o;
  try { o = await fetch(u, { headers: { 'user-agent': ART_UA }, cf: { cacheTtl: 2592000, cacheEverything: true } }); } catch (e) { return reply({ error: 'unreachable' }, 502); }
  const ct = o.headers.get('content-type') || '';
  if (!o.ok || !/^image\//.test(ct)) return reply({ error: 'not an image' }, o.status === 404 ? 404 : 502);
  if (+(o.headers.get('content-length') || 0) > 6e6) return reply({ error: 'too big' }, 413);
  r = new Response(o.body, { headers: Object.assign({}, CORS, { 'content-type': ct, 'cache-control': 'public, max-age=2592000' }) });
  if (ctx) ctx.waitUntil(c.put(ck, r.clone()).catch(() => {}));
  return r;
}
async function spBanTest(env) {
  const out = {};
  const body = JSON.stringify({ variables: { uri: 'spotify:artist:0du5cEVh5yTK9QJze8zA0C', locale: '', preReleaseV2: false, includeMusicVideoPreviews: false }, operationName: 'queryArtistOverview', extensions: { persistedQuery: { version: 1, sha256Hash: 'eafb1620d783ece118e72fbfede2b0064483e029d3c1aafafa1c2de0e25a89e7' } } });
  const pf = async (tok, ct) => { try { const r = await fetch('https://api-partner.spotify.com/pathfinder/v2/query', { method: 'POST', headers: Object.assign({ authorization: 'Bearer ' + tok, 'content-type': 'application/json;charset=UTF-8', accept: 'application/json', 'app-platform': 'WebPlayer' }, ct ? { 'client-token': ct } : {}), body }); const t = await r.text(); return { s: r.status, banner: /headerImage[^]{0,300}?ab676186/.test(t), len: t.length, head: r.status === 200 ? '' : t.slice(0, 160) }; } catch (e) { return { err: String(e) }; } };
  const auth = await getJSON(env, SP_AUTH);
  out.userTokenFresh = !!(auth && auth.at && Date.now() < (auth.exp || 0));
  if (out.userTokenFresh) out.withUserToken = await pf(auth.at);
  for (const [k, u] of [['getAccessToken', 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player'], ['apiToken', 'https://open.spotify.com/api/token?reason=init&productType=web-player']]) {
    try { const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', accept: 'application/json' } }); const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) {}
      out[k] = { s: r.status, gotToken: !!(j && j.accessToken), anon: j ? j.isAnonymous : null, head: j && j.accessToken ? '' : t.slice(0, 160) };
      if (j && j.accessToken) out[k].pathfinder = await pf(j.accessToken);
    } catch (e) { out[k] = { err: String(e) }; }
  }
  return reply(out);
}
async function appleArt(url) {
  const id = (url.searchParams.get('id') || '').replace(/\D/g, '');
  if (!id || id.length > 12) return reply({ error: 'bad id' }, 400);
  const cc = /^[a-z]{2}$/.test(url.searchParams.get('c') || '') ? url.searchParams.get('c') : 'us';
  let r;
  try {
    r = await fetch('https://music.apple.com/' + cc + '/artist/' + id, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; PlaybackApp/1.0; +https://frostie4life9.github.io/playback/)', accept: 'text/html' },
      redirect: 'follow'
    });
  } catch (e) { return reply({ error: 'unreachable' }, 502); }
  if (r.status === 404) return reply({ error: 'none' }, 404);
  if (!r.ok || !r.body) return reply({ error: 'apple ' + r.status }, 502);
  /* the picture is named in the first part of the page: read only that much, not the whole 600 KB */
  const rd = r.body.getReader(), dec = new TextDecoder();
  let html = '';
  try {
    while (html.length < 150000) {
      const { done, value } = await rd.read();
      if (done) break;
      html += dec.decode(value, { stream: true });
      if (/<meta[^>]+og:image/i.test(html) && html.includes('</head>')) break;
    }
  } catch (e) {}
  try { await rd.cancel(); } catch (e) {}
  const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  const u = m && m[1].replace(/&amp;/g, '&');
  if (!u || !/^https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/[A-Za-z0-9_\-.\/]+\/[^\/]+$/.test(u)) return reply({ error: 'none' }, 404);
  return reply({ base: u.replace(/\/[^\/]+$/, '') });
}

async function spCatalog(env, url) {
  let p = url.searchParams.get('p') || '';
  if (!CAT_OK.test(p)) return reply({ error: 'path not allowed' }, 400);
  const bust = /[?&]bust=1(&|$)/.test(p);
  if (bust) p = p.replace(/([?&])bust=1(&|$)/, (m, a, b) => (b ? a : ''));
  const ckey = CAT_CACHE.test(p) ? 'spcat:' + p : '';
  if (ckey && !bust) {
    /* saved copies live in D1 (CATALOG); older ones saved in KV before this change are still read until they expire */
    let hit = null;
    if (env.CATALOG) hit = await env.CATALOG.prepare('SELECT v FROM catalog WHERE k = ?1 AND exp > ?2').bind(ckey, Date.now()).first('v').catch(() => null);
    if (!hit) hit = await env.STATE.get(ckey).catch(() => null);
    if (hit) return new Response(hit, { status: 200, headers: Object.assign({ 'x-pb-cache': 'hit' }, JSON_H) });   /* x-pb-cache lets the app count this as free */
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
  /* a failed save only means the next request asks Spotify again; never save to KV (1,000 writes a day) */
  if (ckey && r.status === 200 && env.CATALOG && body.length < 1500000) {
    try { await env.CATALOG.prepare('INSERT OR REPLACE INTO catalog (k, v, exp) VALUES (?1, ?2, ?3)').bind(ckey, body, Date.now() + CAT_TTL * 1000).run(); } catch (e) { /* skip saving */ }
  }
  return new Response(body, { status: r.status, headers: h });
}

/* Similar artists and songs (version 19). Last.fm's listening-based matches, read-only, with the key kept in the
   LASTFM_KEY secret. Answers are saved in the same D1 catalog table for 30 days (an empty answer for 1 day), so a
   repeat lookup by anyone costs no Last.fm call and no daily-cap count. Only a fresh lookup counts toward the cap. */
const SIM_TTL = 30 * 86400, SIM_EMPTY_TTL = 86400, SIM_CAP = 150;
async function similarGet(env, url, who) {
  if (!env.LASTFM_KEY) return reply({ error: 'no lastfm key' }, 409);
  if (!env.CATALOG) return reply({ error: 'similar needs the CATALOG database' }, 409);
  const g = k => (url.searchParams.get(k) || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 120);
  const type = url.searchParams.get('type') === 'track' ? 'track' : 'artist';
  const artist = g('artist'), track = g('track');
  if (!artist || (type === 'track' && !track)) return reply({ error: 'nothing to look up' }, 400);
  const ckey = 'lfm:' + type + ':' + artist.toLowerCase() + (type === 'track' ? '|' + track.toLowerCase() : '');
  const hit = await env.CATALOG.prepare('SELECT v FROM catalog WHERE k = ?1 AND exp > ?2').bind(ckey, Date.now()).first('v').catch(() => null);
  if (hit) return new Response(hit, { status: 200, headers: Object.assign({ 'x-pb-cache': 'hit' }, JSON_H) });
  await acctInit(env);
  if (!(await rlHit(env, 'sim:' + who, SIM_CAP, 86400))) return reply({ error: 'daily limit' }, 429);
  const q = new URLSearchParams({ method: type + '.getsimilar', artist, api_key: String(env.LASTFM_KEY).trim(), format: 'json', autocorrect: '1', limit: type === 'track' ? '40' : '30' });
  if (type === 'track') q.set('track', track);
  let r;
  try { r = await fetch('https://ws.audioscrobbler.com/2.0/?' + q, { headers: { 'user-agent': 'PlaybackApp/1.0 (+https://frostie4life9.github.io/playback/)' } }); } catch (e) { return reply({ error: 'lastfm unreachable' }, 502); }
  const j = await r.json().catch(() => null);
  if (!j) return reply({ error: 'lastfm sent something unreadable' }, 502);
  let rows = [];
  if (j.error) {
    if (j.error === 29) return reply({ error: 'lastfm rate limit' }, 429);
    if (j.error !== 6) return reply({ error: 'lastfm error ' + j.error }, 502);   /* 6 = no such artist or song: saved as an empty answer */
  } else if (type === 'artist') {
    rows = ((j.similarartists || {}).artist || []).map(x => ({ n: String(x.name || '').slice(0, 120), m: Math.round(Number(x.match) * 1000) / 1000 || 0 })).filter(x => x.n);
  } else {
    rows = ((j.similartracks || {}).track || []).map(x => ({ t: String(x.name || '').slice(0, 120), a: String((x.artist || {}).name || '').slice(0, 120), m: Math.round(Number(x.match) * 1000) / 1000 || 0 })).filter(x => x.t && x.a);
  }
  const body = JSON.stringify({ rows });
  /* a failed save only means the next lookup asks Last.fm again */
  try { await env.CATALOG.prepare('INSERT OR REPLACE INTO catalog (k, v, exp) VALUES (?1, ?2, ?3)').bind(ckey, body, Date.now() + (rows.length ? SIM_TTL : SIM_EMPTY_TTL) * 1000).run(); } catch (e) { /* skip saving */ }
  return new Response(body, { status: 200, headers: JSON_H });
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
  const fresh = items.map(x => { const t = x.track || {}; return { p: Date.parse(x.played_at) || 0, t: t.name || '', a: (t.artists || []).map(a => a.name).filter(Boolean), al: (t.album && t.album.name) || '', d: t.duration_ms || 0 }; }).filter(x => x.p && x.t);
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

/* a fresh access token from the stored sign-in, or a reply to send back instead */
async function spAccess(env) {
  const auth = await getJSON(env, SP_AUTH);
  if (!auth) return { res: reply({ error: 'not connected' }, 409) };
  if (auth.at && Date.now() < (auth.exp || 0) - 60000) return { at: auth.at };
  const t = await spRefresh(env, auth);
  if (t.err) {
    if (t.err === 'reconnect') { const meta = (await getJSON(env, SP_META)) || {}; meta.err = 'reconnect'; await env.STATE.put(SP_META, JSON.stringify(meta)); }
    return { res: reply({ error: t.err }, 409) };
  }
  return { at: t.at };
}
/* PLAY AN ALBUM (version 22): owner only, one album id, always from its first song */
async function spPlay(request, env) {
  let b; try { b = JSON.parse(await request.text()); } catch (e) { return reply({ error: 'body is not valid JSON' }, 400); }
  const id = b && typeof b.album === 'string' && /^[A-Za-z0-9]{22}$/.test(b.album) ? b.album : '';
  if (!id) return reply({ error: 'not an album id' }, 400);
  const tk = await spAccess(env); if (tk.res) return tk.res;
  const H = { authorization: 'Bearer ' + tk.at, 'content-type': 'application/json' };
  const body = JSON.stringify({ context_uri: 'spotify:album:' + id, offset: { position: 0 }, position_ms: 0 });
  const go = dev => fetch('https://api.spotify.com/v1/me/player/play' + (dev ? '?device_id=' + encodeURIComponent(dev) : ''), { method: 'PUT', headers: H, body });
  let r = await go('');
  if (r.status === 401 || r.status === 403) { const t = await r.text().catch(() => ''); return reply({ error: /scope|permission/i.test(t) || r.status === 401 ? 'scope' : 'premium' }, 200); }
  if (r.status === 404) {   /* nothing playing right now: use the one device Spotify has open, if any */
    const d = await fetch('https://api.spotify.com/v1/me/player/devices', { headers: H });
    if (d.status === 401 || d.status === 403) return reply({ error: 'scope' }, 200);
    const list = ((await d.json().catch(() => ({}))).devices || []).filter(x => x && x.id && !x.is_restricted);
    if (!list.length) return reply({ error: 'nodevice' }, 200);
    const pick = list.find(x => x.is_active) || list.find(x => x.type === 'Computer') || list[0];
    r = await go(pick.id);
  }
  if (r.status === 204 || r.status === 200 || r.status === 202) return reply({ ok: true });
  if (r.status === 404) return reply({ error: 'nodevice' }, 200);
  return reply({ error: 'spotify ' + r.status }, 200);
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

/* ---------- friend suggestions ----------
   POST /suggest  {name?, text}  needs NO key: friends using the shared app send a suggestion here.
                  Text is cut to 600 characters, a name to 40, one address may send 10 an hour, and
                  only the newest 200 are kept.
   GET  /suggest  (x-sync-key)   -> {items:[{id,t,name,text}]}, newest first
   DELETE /suggest?id=<id> or ?all=1  (x-sync-key)  removes one or all.            */
const SUG_KEY = 'suggestions', SUG_MAX = 200;
async function sugList(env) {
  let list = [];
  try { list = JSON.parse((await env.STATE.get(SUG_KEY)) || '[]'); } catch (e) {}
  return Array.isArray(list) ? list : [];
}
async function sugPost(request, env) {
  let b;
  try { b = await request.json(); } catch (e) { return reply({ error: 'bad body' }, 400); }
  const text = String((b && b.text) || '').trim().slice(0, 600), name = String((b && b.name) || '').trim().slice(0, 40);
  if (!text) return reply({ error: 'empty' }, 400);
  const rk = 'sug-ip:' + (request.headers.get('cf-connecting-ip') || 'x');
  const n = +(await env.STATE.get(rk)) || 0;
  if (n >= 10) return reply({ error: 'too many' }, 429);
  await env.STATE.put(rk, String(n + 1), { expirationTtl: 3600 });
  const list = await sugList(env);
  list.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(), name, text });
  await env.STATE.put(SUG_KEY, JSON.stringify(list.slice(0, SUG_MAX)));
  return reply({ ok: true });
}
async function sugOwner(request, env, url) {
  if (request.method === 'GET') return reply({ items: await sugList(env) });
  if (request.method === 'DELETE') {
    if (url.searchParams.get('all') === '1') { await env.STATE.delete(SUG_KEY); return reply({ ok: true }); }
    const id = url.searchParams.get('id') || '';
    if (!id) return reply({ error: 'no id' }, 400);
    await env.STATE.put(SUG_KEY, JSON.stringify((await sugList(env)).filter(x => x.id !== id)));
    return reply({ ok: true });
  }
  return reply({ error: 'method not allowed' }, 405);
}

/* ---------- bug reports (version 20) ----------
   POST   /bug  {kind?, name?, owner?, auto?, build?, note?, report}  kind 'bug' (default) or 'idea' (version 21, Suggest a change)  needs NO key, like /suggest: the app's Report a bug sheet
                and its crash card send a full report (errors, the last taps, device, page and app state). Kept in D1
                (CATALOG), not KV, so reports never eat KV's 1,000 daily writes. A report is cut to 60 KB, one address
                may send 20 an hour, and only the newest 150 of each kind are kept. The address itself is never stored, only a short hash.
   GET    /bug        (x-sync-key or owner login)  -> {items:[{id,t,name,owner,auto,build,note,bytes}]}, newest first
   GET    /bug?id=<id>                             -> {item:{...,report}}
   DELETE /bug?id=<id> or ?all=1                    removes one or all.                                              */
const BUG_MAX = 150, BUG_BYTES = 60000;
let bugReady = false;
async function bugTable(env) {
  if (bugReady) return;
  await env.CATALOG.prepare('CREATE TABLE IF NOT EXISTS bugs (id TEXT PRIMARY KEY, t INTEGER NOT NULL, ip TEXT, name TEXT, owner INTEGER, auto INTEGER, build TEXT, note TEXT, report TEXT)').run();
  await env.CATALOG.prepare('CREATE INDEX IF NOT EXISTS bugs_t ON bugs (t)').run();
  try { await env.CATALOG.prepare("ALTER TABLE bugs ADD COLUMN kind TEXT DEFAULT 'bug'").run(); } catch (e) {}   /* version 21; throws once it exists */
  bugReady = true;
}
async function bugIp(request) {
  const raw = new TextEncoder().encode('pb-bug|' + (request.headers.get('cf-connecting-ip') || 'x'));
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', raw));
  return Array.from(h.slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
}
async function bugPost(request, env) {
  if (!env.CATALOG) return reply({ error: 'missing the CATALOG D1 binding' }, 500);
  const raw = await request.text();
  if (raw.length > BUG_BYTES * 2) return reply({ error: 'too big' }, 413);
  let b; try { b = JSON.parse(raw); } catch (e) { return reply({ error: 'bad body' }, 400); }
  if (!b || typeof b !== 'object') return reply({ error: 'bad body' }, 400);
  let report = typeof b.report === 'string' ? b.report : JSON.stringify(b.report || {});
  if (report.length > BUG_BYTES) report = report.slice(0, BUG_BYTES);
  const note = String(b.note || '').trim().slice(0, 1000), name = String(b.name || '').trim().slice(0, 40), build = String(b.build || '').slice(0, 24);
  if (!note && report.length < 3) return reply({ error: 'empty' }, 400);
  await bugTable(env);
  const ip = await bugIp(request), now = Date.now();
  const recent = await env.CATALOG.prepare('SELECT COUNT(*) AS n FROM bugs WHERE ip = ?1 AND t > ?2').bind(ip, now - 3600000).first();
  if (recent && recent.n >= 20) return reply({ error: 'too many' }, 429);
  const kind = b.kind === 'idea' ? 'idea' : 'bug';
  const id = now.toString(36) + Math.random().toString(36).slice(2, 6);
  await env.CATALOG.prepare('INSERT INTO bugs (id, t, ip, name, owner, auto, build, note, report, kind) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)')
    .bind(id, now, ip, name, b.owner ? 1 : 0, b.auto ? 1 : 0, build, note, report, kind).run();
  await env.CATALOG.prepare('DELETE FROM bugs WHERE kind = ?2 AND id NOT IN (SELECT id FROM bugs WHERE kind = ?2 ORDER BY t DESC LIMIT ?1)').bind(BUG_MAX, kind).run();
  return reply({ ok: true, id });
}
async function bugOwner(request, env, url) {
  if (!env.CATALOG) return reply({ error: 'missing the CATALOG D1 binding' }, 500);
  await bugTable(env);
  const id = url.searchParams.get('id') || '';
  if (request.method === 'GET') {
    if (id) {
      const item = await env.CATALOG.prepare('SELECT id, t, kind, name, owner, auto, build, note, report FROM bugs WHERE id = ?1').bind(id).first();
      return item ? reply({ item }) : reply({ error: 'not found' }, 404);
    }
    const r = await env.CATALOG.prepare('SELECT id, t, kind, name, owner, auto, build, note, LENGTH(report) AS bytes FROM bugs ORDER BY t DESC LIMIT ?1').bind(BUG_MAX * 2).all();
    return reply({ items: r.results || [] });
  }
  if (request.method === 'DELETE') {
    if (url.searchParams.get('all') === '1') { await env.CATALOG.prepare('DELETE FROM bugs').run(); return reply({ ok: true }); }
    if (!id) return reply({ error: 'no id' }, 400);
    await env.CATALOG.prepare('DELETE FROM bugs WHERE id = ?1').bind(id).run();
    return reply({ ok: true });
  }
  return reply({ error: 'method not allowed' }, 405);
}

/* ---------- accounts (version 11) ----------
   Sign in with Google, friends by code, and friends' ratings. Lives in the same D1 database as the
   catalog cache (CATALOG); the tables are created the first time anyone signs in. Nothing here touches
   the owner's log or the sync key. Needs one variable on the Worker: GOOGLE_CLIENT_ID (set in
   wrangler.jsonc "vars"; it is public, not a secret). Only the Google account's stable id and display
   name are kept; the email address is never stored.
   POST   /acct/google        {credential}  Google ID token -> {token, me}
   GET    /acct/me            -> {me}                       (Authorization: Bearer <token> on every route below)
   PUT    /acct/me            {name?, share?, hue?, pic?}   hue 0-359 or null (automatic); pic a small JPEG data URL (about 192px, under 32 KB) or '' to remove (version 14)
   DELETE /acct/me            removes the account, its ratings and its friendships
   PUT    /acct/ratings       {items:[{kind:'a'|'s', k, t, r, n, a}]}  replaces this person's published ratings
   GET    /acct/friends       -> {friends, incoming, outgoing}
   POST   /acct/friends       {code}        asks that person to be friends
   POST   /acct/friends/accept {uid}
   DELETE /acct/friends?uid=  removes a friend, declines a request or cancels one
   GET    /acct/feed          -> {rows:[{uid,name,hue,kind,k,t,r,n,a,i,d,rv}]}  the 60 newest ratings from friends who are sharing (version 18)
   GET    /acct/similar?type=artist&artist=X  (or type=track&artist=X&track=Y) -> {rows:[{n,m}] or [{t,a,m}]}  similar artists or songs from Last.fm, saved 30 days, capped per person per day (version 19; the owner's sync key uses GET /similar the same way). Needs the LASTFM_KEY secret.
   GET    /acct/apple/art?id=&c=  -> {base}  an artist's Apple Music photo address, saved 60 days for everyone, capped per person per day (version 20)
   GET    /acct/profile?uid=  -> {profile:{name, friends, items}}  your own page, or a friend's who is sharing
   POST   /acct/friends/ratings {kind, ks:[], ts:[]} -> {rows:[{uid,name,k,t,r}]}  accepted friends only
   GET    /acct/sync          -> {mtime, b64} (a person's own gzipped log, base64) or null   (version 12)
   PUT    /acct/sync?base=&force=  {mtime, b64}  saves it. Same stale-device rules as the owner's PUT /: 409 and the stored copy
                              if it changed since ?base= or is newer than this upload; ?force=1 overrides.
   DELETE /acct/sync          removes the saved copy
   POST   /acct/claim         (send the sync key in x-sync-key AND the account's Bearer token) makes this Google account the
                              owner login (version 13). The owner's account id is kept in KV under 'owner-uid'. After that, every
                              owner route (the log, photos, Spotify, Discogs, the brief, suggestions) accepts that account's
                              Bearer token as well as the sync key. The sync key keeps working as a fallback, always.
   DELETE /acct/claim         (sync key, or the owner's token) gives the owner login up again.
   GET    /acct/me            also says {me:{owner:true}} for the owner account.
   Why this is cheap on the free plan: one row per person in D1 (D1 allows 100,000 writes a day, KV only 1,000), the log
   is stored exactly as the app sent it (base64 text; this Worker never unpacks it, so it costs almost no CPU), photos are
   never part of it (they need the owner's sync key), a log over about 1 MB compressed is refused (413), a person can save at
   most 120 times an hour (429), and only ACCT_LOG_USERS people can hold a saved copy at once (507). */
/* a rated-on day: exactly YYYY-MM-DD, a real date, not in the future; anything else is dropped */
const cleanDay = v => { if (typeof v !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(v)) return null; const t = Date.parse(v + 'T00:00:00Z'); return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === v && t <= Date.now() + 86400000 ? v : null; };
const GOOGLE_ISS = ['https://accounts.google.com', 'accounts.google.com'];
const ACCT_MAX_BODY = 1536 * 1024, ACCT_MAX_ROWS = 4000;
const ACCT_LOG_MAX = 1400000, ACCT_LOG_USERS = 200, ACCT_LOG_PER_HOUR = 120;   /* base64 text (about 1 MB gzipped), people with a saved copy, saves per person per hour */
let acctReady = false, gKeys = null, gKeysAt = 0;

async function acctInit(env) {
  if (acctReady) return true;
  if (!env.CATALOG) return false;
  await env.CATALOG.batch([
    env.CATALOG.prepare('CREATE TABLE IF NOT EXISTS acct_users (uid TEXT PRIMARY KEY, sub TEXT UNIQUE NOT NULL, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL, share INTEGER NOT NULL DEFAULT 1, made INTEGER NOT NULL, seen INTEGER NOT NULL, rated INTEGER NOT NULL DEFAULT 0)'),
    env.CATALOG.prepare('CREATE TABLE IF NOT EXISTS acct_ratings (uid TEXT NOT NULL, kind TEXT NOT NULL, k TEXT NOT NULL, t TEXT NOT NULL, r REAL NOT NULL, ttl TEXT, art TEXT, img TEXT, PRIMARY KEY (uid, kind, t))'),
    env.CATALOG.prepare('CREATE INDEX IF NOT EXISTS acct_ratings_k ON acct_ratings (kind, k)'),
    env.CATALOG.prepare('CREATE INDEX IF NOT EXISTS acct_ratings_t ON acct_ratings (kind, t)'),
    env.CATALOG.prepare('CREATE TABLE IF NOT EXISTS acct_friends (a TEXT NOT NULL, b TEXT NOT NULL, st TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (a, b))'),
    env.CATALOG.prepare('CREATE INDEX IF NOT EXISTS acct_friends_b ON acct_friends (b)'),
    env.CATALOG.prepare('CREATE TABLE IF NOT EXISTS acct_rl (k TEXT PRIMARY KEY, n INTEGER NOT NULL, exp INTEGER NOT NULL)'),
    env.CATALOG.prepare('CREATE TABLE IF NOT EXISTS acct_logs (uid TEXT PRIMARY KEY, mtime INTEGER NOT NULL, bytes INTEGER NOT NULL, data TEXT NOT NULL, at INTEGER NOT NULL)')
  ]);
  /* the table first shipped without the cover column: add it once (the error just means it is already there) */
  try { await env.CATALOG.prepare('ALTER TABLE acct_ratings ADD COLUMN img TEXT').run(); } catch (e) { /* already there */ }
  try { await env.CATALOG.prepare('ALTER TABLE acct_ratings ADD COLUMN trk TEXT').run(); } catch (e) { /* already there */ }   /* an album's songs and their ratings, JSON [[title, rating], ...] (version 17) */
  try { await env.CATALOG.prepare('ALTER TABLE acct_users ADD COLUMN songs INTEGER').run(); } catch (e) { /* already there */ }   /* how many songs they have rated, shown on their page */
  try { await env.CATALOG.prepare('ALTER TABLE acct_users ADD COLUMN savg REAL').run(); } catch (e) { /* already there */ }
  try { await env.CATALOG.prepare('ALTER TABLE acct_ratings ADD COLUMN rv TEXT').run(); } catch (e) { /* already there */ }   /* a written review of an album, up to 1000 characters (version 18) */
  try { await env.CATALOG.prepare('ALTER TABLE acct_ratings ADD COLUMN day TEXT').run(); } catch (e) { /* already there */ }   /* the day it was rated, YYYY-MM-DD (version 16) */
  /* profile picture and account color (version 14): hue 0-359 or NULL for the automatic color, pic a small JPEG data URL or empty */
  for (const col of ['hue INTEGER', 'pic TEXT']) { try { await env.CATALOG.prepare('ALTER TABLE acct_users ADD COLUMN ' + col).run(); } catch (e) { /* already there */ } }
  acctReady = true;
  return true;
}

/* a small counter so sign-ins, code guesses and uploads can't be hammered */
async function rlHit(env, k, max, secs) {
  const now = Date.now();
  const row = await env.CATALOG.prepare('SELECT n, exp FROM acct_rl WHERE k = ?1').bind(k).first();
  if (!row || row.exp < now) {
    await env.CATALOG.prepare('INSERT OR REPLACE INTO acct_rl (k, n, exp) VALUES (?1, 1, ?2)').bind(k, now + secs * 1000).run();
    return true;
  }
  if (row.n >= max) return false;
  await env.CATALOG.prepare('UPDATE acct_rl SET n = n + 1 WHERE k = ?1').bind(k).run();
  return true;
}

const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
async function googleKeys(force) {
  if (!force && gKeys && Date.now() - gKeysAt < 3600 * 1000) return gKeys;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!r.ok) throw new Error('google keys ' + r.status);
  gKeys = (await r.json()).keys || []; gKeysAt = Date.now();
  return gKeys;
}
/* checks the signature, the issuer, that it was issued to THIS app's client id, and that it hasn't expired */
async function googleVerify(env, cred) {
  const parts = String(cred || '').split('.');
  if (parts.length !== 3 || String(cred).length > 4096) return null;
  let head, pay;
  try {
    head = JSON.parse(new TextDecoder().decode(b64u(parts[0])));
    pay = JSON.parse(new TextDecoder().decode(b64u(parts[1])));
  } catch (e) { return null; }
  if (head.alg !== 'RS256') return null;
  let jwk = (await googleKeys(false)).find(k => k.kid === head.kid);
  if (!jwk) jwk = (await googleKeys(true)).find(k => k.kid === head.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) return null;
  if (!GOOGLE_ISS.includes(pay.iss) || pay.aud !== String(env.GOOGLE_CLIENT_ID).trim() || !(pay.exp > Date.now() / 1000) || !pay.sub) return null;
  return pay;
}

async function acctSig(env, msg) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode('acct:' + String(env.SECRET).trim()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)))].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function acctToken(env, uid) {
  const body = uid + '.' + (Date.now() + 30 * 86400 * 1000);
  return 'pb1.' + body + '.' + await acctSig(env, body);
}
/* the signed-in person, or null. A deleted account's token stops working at once. */
async function acctWho(env, request) {
  const m = /^Bearer pb1\.([0-9a-f]{16})\.(\d{10,14})\.([0-9a-f]{64})$/.exec(request.headers.get('authorization') || '');
  if (!m || !(Number(m[2]) > Date.now()) || !keyMatches(m[3], await acctSig(env, m[1] + '.' + m[2]))) return null;
  return await env.CATALOG.prepare('SELECT uid, name, code, share, rated, hue FROM acct_users WHERE uid = ?1').bind(m[1]).first();
}
const meOut = (u, owner) => ({ name: u.name, code: u.code, share: !!u.share, rated: u.rated || 0, owner: !!owner, hue: u.hue == null ? null : u.hue, pic: u.pic || '' });
const PIC_OK = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/, PIC_MAX = 32000;
/* the account that is the owner (claimed once with the sync key), cached for a minute so owner requests don't read KV every time */
let ownerCache = { v: null, at: 0 };
async function ownerUid(env) {
  if (Date.now() - ownerCache.at < 60000) return ownerCache.v;
  const v = (await env.STATE.get('owner-uid')) || '';
  ownerCache = { v, at: Date.now() };
  return v;
}
/* a valid account token whose account is the owner: signature and expiry only, no database read */
async function ownerViaToken(env, request) {
  const m = /^Bearer pb1\.([0-9a-f]{16})\.(\d{10,14})\.([0-9a-f]{64})$/.exec(request.headers.get('authorization') || '');
  if (!m || !(Number(m[2]) > Date.now()) || !keyMatches(m[3], await acctSig(env, m[1] + '.' + m[2]))) return false;
  const o = await ownerUid(env);
  return !!o && o === m[1];
}
/* Owner only (the sync key or the owner's token, checked before this runs): who has an account. Names, dates and counts only: no ratings,
   no photos, no email (Playback never stores one). */
async function usersList(env) {
  if (!(await acctInit(env))) return reply({ error: 'accounts are not set up on this Worker' }, 409);
  const rows = (await env.CATALOG.prepare(
    'SELECT u.uid, u.name, u.code, u.share, u.made, u.seen, u.rated, ' +
    "(SELECT COUNT(*) FROM acct_friends f WHERE f.st = 'ok' AND (f.a = u.uid OR f.b = u.uid)) AS friends, " +
    'l.bytes AS logbytes, l.at AS logat FROM acct_users u LEFT JOIN acct_logs l ON l.uid = u.uid ORDER BY u.seen DESC LIMIT 500').all()).results || [];
  const owner = await ownerUid(env);
  return reply({ total: rows.length, users: rows.map(u => ({ name: u.name, code: u.code, share: !!u.share, made: u.made, seen: u.seen, rated: u.rated || 0, friends: u.friends || 0, synced: u.logbytes != null, logAt: u.logat || 0, owner: !!owner && owner === u.uid })) });
}
/* a published cover link must be https and on a known cover host, so nobody can plant a tracking address that opens in a friend's browser */
const IMG_HOSTS = /(^|\.)(scdn\.co|mzstatic\.com|coverartarchive\.org|archive\.org|image\.tmdb\.org)$/;
function cleanImg(u) {
  if (typeof u !== 'string' || u.length > 300) return '';
  try { const x = new URL(u); return x.protocol === 'https:' && !x.username && !x.password && IMG_HOSTS.test(x.hostname) ? x.href : ''; } catch (e) { return ''; }
}
const CODE_CH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const randCode = () => { const b = crypto.getRandomValues(new Uint8Array(8)); return [...b].map(x => CODE_CH[x % CODE_CH.length]).join(''); };
const randUid = () => [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
const cleanReview = s => typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 1000) : '';   /* plain text (a < or > is just a character, like in "<3"); the app escapes every review when it draws it */
const cleanName = s => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 40);
async function readBody(request, max) {
  const t = await request.text();
  if (t.length > (max || 8192)) return { err: reply({ error: 'payload too large' }, 413) };
  try { return { j: JSON.parse(t || '{}') }; } catch (e) { return { err: reply({ error: 'body is not valid JSON' }, 400) }; }
}

async function acct(request, env, url) {
  if (!env.CATALOG) return reply({ error: 'accounts need the CATALOG database' }, 409);
  if (!env.GOOGLE_CLIENT_ID) return reply({ error: 'accounts are not set up yet' }, 409);
  await acctInit(env);
  const path = url.pathname.slice(5), now = Date.now(), M = request.method;

  if (path === '/google' && M === 'POST') {
    const ip = request.headers.get('cf-connecting-ip') || 'x';
    if (!(await rlHit(env, 'login:' + ip, 40, 3600))) return reply({ error: 'too many' }, 429);
    const { j, err } = await readBody(request, 8192); if (err) return err;
    let pay; try { pay = await googleVerify(env, j.credential); } catch (e) { return reply({ error: 'could not check Google right now' }, 502); }
    if (!pay) return reply({ error: 'Google sign-in was not accepted' }, 401);
    let u = await env.CATALOG.prepare('SELECT uid, name, code, share, rated, hue, pic FROM acct_users WHERE sub = ?1').bind(String(pay.sub)).first();
    if (!u) {
      const uid = randUid(), name = cleanName(pay.given_name || pay.name) || 'Friend';
      for (let i = 0; i < 6 && !u; i++) {
        const code = randCode();
        try {
          await env.CATALOG.prepare('INSERT INTO acct_users (uid, sub, name, code, share, made, seen, rated) VALUES (?1, ?2, ?3, ?4, 1, ?5, ?5, 0)').bind(uid, String(pay.sub), name, code, now).run();
          u = { uid, name, code, share: 1, rated: 0 };
        } catch (e) { if (i === 5) return reply({ error: 'could not make the account' }, 500); }
      }
    } else await env.CATALOG.prepare('UPDATE acct_users SET seen = ?2 WHERE uid = ?1').bind(u.uid, now).run();
    return reply({ token: await acctToken(env, u.uid), me: meOut(u, (await ownerUid(env)) === u.uid) });
  }

  const me = await acctWho(env, request);
  if (!me) return reply({ error: 'sign in again' }, 401);

  if (path === '/me') {
    if (M === 'GET') {
      const pr = await env.CATALOG.prepare('SELECT pic FROM acct_users WHERE uid = ?1').bind(me.uid).first();
      return reply({ me: meOut(Object.assign({}, me, { pic: pr && pr.pic }), (await ownerUid(env)) === me.uid), token: await acctToken(env, me.uid) });
    }
    if (M === 'PUT') {
      const { j, err } = await readBody(request, 48 * 1024); if (err) return err;
      const name = j.name === undefined ? me.name : cleanName(j.name), share = j.share === undefined ? me.share : (j.share ? 1 : 0);
      if (!name) return reply({ error: 'name is empty' }, 400);
      let hue = me.hue == null ? null : me.hue;
      if (j.hue !== undefined) { hue = j.hue === null ? null : Math.round(Number(j.hue)); if (hue !== null && !(hue >= 0 && hue <= 359)) return reply({ error: 'bad color' }, 400); }
      let pic = null;   /* null keeps the stored picture, '' removes it */
      if (j.pic !== undefined) {
        if (!(await rlHit(env, 'pic:' + me.uid, 30, 3600))) return reply({ error: 'You changed your picture a lot just now. Try again in a while.' }, 429);
        if (j.pic === '' || j.pic === null) pic = '';
        else if (typeof j.pic === 'string' && j.pic.length <= PIC_MAX && PIC_OK.test(j.pic)) pic = j.pic;
        else return reply({ error: 'bad picture' }, 400);
      }
      await env.CATALOG.prepare('UPDATE acct_users SET name = ?2, share = ?3, hue = ?4, pic = COALESCE(?5, pic) WHERE uid = ?1').bind(me.uid, name, share, hue, pic).run();
      const pr = await env.CATALOG.prepare('SELECT pic FROM acct_users WHERE uid = ?1').bind(me.uid).first();
      return reply({ me: meOut(Object.assign({}, me, { name, share, hue, pic: pr && pr.pic }), (await ownerUid(env)) === me.uid) });
    }
    if (M === 'DELETE') {
      if ((await ownerUid(env)) === me.uid) { await env.STATE.delete('owner-uid'); ownerCache = { v: '', at: Date.now() }; }
      await env.CATALOG.batch([
        env.CATALOG.prepare('DELETE FROM acct_ratings WHERE uid = ?1').bind(me.uid),
        env.CATALOG.prepare('DELETE FROM acct_logs WHERE uid = ?1').bind(me.uid),
        env.CATALOG.prepare('DELETE FROM acct_friends WHERE a = ?1 OR b = ?1').bind(me.uid),
        env.CATALOG.prepare('DELETE FROM acct_users WHERE uid = ?1').bind(me.uid)
      ]);
      return reply({ ok: true });
    }
    return reply({ error: 'method not allowed' }, 405);
  }

  /* make this account the owner login, or give it up (version 13). Claiming needs the sync key, so nobody else can. */
  if (path === '/claim') {
    const given = (request.headers.get('x-sync-key') || '').trim(), isKey = keyMatches(given, String(env.SECRET).trim());
    if (M === 'POST') {
      if (!(await rlHit(env, 'claim:' + me.uid, 10, 3600))) return reply({ error: 'too many' }, 429);
      if (!isKey) return reply({ error: 'the sync key does not match' }, 401);
      await env.STATE.put('owner-uid', me.uid);
      ownerCache = { v: me.uid, at: Date.now() };
      return reply({ ok: true });
    }
    if (M === 'DELETE') {
      if (!isKey && (await ownerUid(env)) !== me.uid) return reply({ error: 'not allowed' }, 403);
      await env.STATE.delete('owner-uid');
      ownerCache = { v: '', at: Date.now() };
      return reply({ ok: true });
    }
    return reply({ error: 'method not allowed' }, 405);
  }

  /* a person's own log, kept so it follows them to every device they sign in on (version 12) */
  if (path === '/sync') {
    if (M === 'GET') {
      const row = await env.CATALOG.prepare('SELECT mtime, data FROM acct_logs WHERE uid = ?1').bind(me.uid).first();
      return reply(row ? { mtime: row.mtime, b64: row.data } : null);
    }
    if (M === 'DELETE') {
      await env.CATALOG.prepare('DELETE FROM acct_logs WHERE uid = ?1').bind(me.uid).run();
      return reply({ ok: true });
    }
    if (M === 'PUT') {
      if (!(await rlHit(env, 'sync:' + me.uid, ACCT_LOG_PER_HOUR, 3600))) return reply({ error: 'too many saves, wait a bit' }, 429);
      const { j, err } = await readBody(request, ACCT_LOG_MAX + 200); if (err) return err;
      const b64 = j && j.b64, mtime = Number(j && j.mtime);
      if (typeof b64 !== 'string' || !b64.startsWith('H4sI') || !/^[A-Za-z0-9+\/=]{16}/.test(b64) || !Number.isFinite(mtime) || mtime < 0) return reply({ error: 'not a Playback log' }, 400);
      if (b64.length > ACCT_LOG_MAX) return reply({ error: 'log too large' }, 413);
      const st = await env.CATALOG.prepare('SELECT mtime, data FROM acct_logs WHERE uid = ?1').bind(me.uid).first();
      if (st) {
        const force = url.searchParams.get('force') === '1', baseQ = url.searchParams.get('base'), base = Number(baseQ);
        const newer = { mtime: st.mtime, b64: st.data };
        if (!force && baseQ !== null && Number.isFinite(base) && st.mtime > base) return reply(newer, 409);
        if (!force && st.mtime > mtime) return reply(newer, 409);
      } else {
        const n = await env.CATALOG.prepare('SELECT COUNT(*) AS c FROM acct_logs').first('c');
        if ((n || 0) >= ACCT_LOG_USERS) return reply({ error: 'account sync is full right now' }, 507);
      }
      await env.CATALOG.prepare('INSERT OR REPLACE INTO acct_logs (uid, mtime, bytes, data, at) VALUES (?1, ?2, ?3, ?4, ?5)').bind(me.uid, Math.round(mtime), b64.length, b64, now).run();
      return reply({ ok: true, bytes: b64.length, mtime });
    }
    return reply({ error: 'method not allowed' }, 405);
  }

  if (path === '/ratings' && M === 'PUT') {
    if (!(await rlHit(env, 'pub:' + me.uid, 120, 3600))) return reply({ error: 'too many' }, 429);
    const { j, err } = await readBody(request, ACCT_MAX_BODY); if (err) return err;
    if (!j || !Array.isArray(j.items)) return reply({ error: 'not a ratings list' }, 400);
    const seen = new Set(), items = [];
    for (const x of j.items.slice(0, ACCT_MAX_ROWS)) {
      if (!x || (x.kind !== 'a' && x.kind !== 's') || typeof x.t !== 'string' || !x.t) continue;
      const r = Number(x.r); if (!(r > 0 && r <= 10)) continue;
      const t = x.t.slice(0, 200), id = x.kind + '|' + t; if (seen.has(id)) continue; seen.add(id);
      let trk = null;
      if (x.kind === 'a' && Array.isArray(x.tr)) {
        const tr = x.tr.slice(0, 80).map(q => Array.isArray(q) && typeof q[0] === 'string' ? [q[0].slice(0, 120), Math.round(Math.min(10, Math.max(0, Number(q[1]) || 0)) * 2) / 2] : null).filter(Boolean);
        if (tr.some(q => q[1] > 0)) trk = JSON.stringify(tr).slice(0, 12000);
        if (trk && !trk.endsWith(']')) trk = null;   /* never keep a cut-off list */
      }
      items.push({ kind: x.kind, k: typeof x.k === 'string' ? x.k.slice(0, 80) : '', t, r: Math.round(r * 2) / 2, n: String(x.n || '').slice(0, 120), a: String(x.a || '').slice(0, 160), i: cleanImg(x.i), d: cleanDay(x.d), trk, rv: x.kind === 'a' ? cleanReview(x.rv) || null : null });
    }
    const songs = Math.min(1000000, Math.max(0, Math.floor(Number(j.songs) || 0))), sa = Number(j.savg), savg = songs > 0 && sa > 0 && sa <= 10 ? Math.round(sa * 100) / 100 : null;
    await env.CATALOG.batch([
      env.CATALOG.prepare('DELETE FROM acct_ratings WHERE uid = ?1').bind(me.uid),
      env.CATALOG.prepare("INSERT OR REPLACE INTO acct_ratings (uid, kind, k, t, r, ttl, art, img, day, trk, rv) SELECT ?1, json_extract(value,'$.kind'), json_extract(value,'$.k'), json_extract(value,'$.t'), json_extract(value,'$.r'), json_extract(value,'$.n'), json_extract(value,'$.a'), json_extract(value,'$.i'), json_extract(value,'$.d'), json_extract(value,'$.trk'), json_extract(value,'$.rv') FROM json_each(?2)").bind(me.uid, JSON.stringify(items)),
      env.CATALOG.prepare('UPDATE acct_users SET rated = ?2, seen = ?3, songs = ?4, savg = ?5 WHERE uid = ?1').bind(me.uid, items.length, now, songs, savg)
    ]);
    return reply({ ok: true, rows: items.length });
  }

  if (path === '/friends') {
    if (M === 'GET') {
      const rows = (await env.CATALOG.prepare('SELECT f.a, f.b, f.st, u.uid AS uid, u.name AS name, u.rated AS rated, u.share AS share, u.hue AS hue, u.pic AS pic FROM acct_friends f JOIN acct_users u ON u.uid = (CASE WHEN f.a = ?1 THEN f.b ELSE f.a END) WHERE f.a = ?1 OR f.b = ?1 ORDER BY u.name COLLATE NOCASE').bind(me.uid).all()).results || [];
      return reply({
        friends: rows.filter(x => x.st === 'ok').map(x => ({ uid: x.uid, name: x.name, rated: x.rated, share: !!x.share, hue: x.hue == null ? null : x.hue, pic: x.pic || '' })),
        incoming: rows.filter(x => x.st === 'pending' && x.b === me.uid).map(x => ({ uid: x.uid, name: x.name, hue: x.hue == null ? null : x.hue, pic: x.pic || '' })),
        outgoing: rows.filter(x => x.st === 'pending' && x.a === me.uid).map(x => ({ uid: x.uid, name: x.name, hue: x.hue == null ? null : x.hue, pic: x.pic || '' }))
      });
    }
    if (M === 'POST') {
      const { j, err } = await readBody(request); if (err) return err;
      const code = String(j.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 8) return reply({ error: 'A friend code is 8 letters and numbers.' }, 400);
      if (!(await rlHit(env, 'find:' + me.uid, 20, 3600))) return reply({ error: 'You have tried a lot of codes just now. Try again in a while.' }, 429);
      const them = await env.CATALOG.prepare('SELECT uid, name FROM acct_users WHERE code = ?1').bind(code).first();
      if (!them) return reply({ error: 'No one has that code.' }, 404);
      if (them.uid === me.uid) return reply({ error: 'That is your own code.' }, 400);
      const ex = await env.CATALOG.prepare('SELECT a, b, st FROM acct_friends WHERE (a = ?1 AND b = ?2) OR (a = ?2 AND b = ?1)').bind(me.uid, them.uid).first();
      if (ex) {
        if (ex.st === 'ok') return reply({ error: 'You are already friends.' }, 409);
        if (ex.a === them.uid) {   /* they already asked you: that is a yes */
          await env.CATALOG.prepare("UPDATE acct_friends SET st = 'ok', at = ?3 WHERE a = ?1 AND b = ?2").bind(them.uid, me.uid, now).run();
          return reply({ ok: true, name: them.name, accepted: true });
        }
        return reply({ error: 'You already asked ' + them.name + '.' }, 409);
      }
      await env.CATALOG.prepare("INSERT INTO acct_friends (a, b, st, at) VALUES (?1, ?2, 'pending', ?3)").bind(me.uid, them.uid, now).run();
      return reply({ ok: true, name: them.name });
    }
    if (M === 'DELETE') {
      const uid = (url.searchParams.get('uid') || '').replace(/[^0-9a-f]/g, '');
      if (uid.length !== 16) return reply({ error: 'no such friend' }, 400);
      await env.CATALOG.prepare('DELETE FROM acct_friends WHERE (a = ?1 AND b = ?2) OR (a = ?2 AND b = ?1)').bind(me.uid, uid).run();
      return reply({ ok: true });
    }
    return reply({ error: 'method not allowed' }, 405);
  }

  if (path === '/friends/accept' && M === 'POST') {
    const { j, err } = await readBody(request); if (err) return err;
    const uid = String(j.uid || '').replace(/[^0-9a-f]/g, '');
    const r = await env.CATALOG.prepare("UPDATE acct_friends SET st = 'ok', at = ?3 WHERE a = ?2 AND b = ?1 AND st = 'pending'").bind(me.uid, uid, now).run();
    return r.meta && r.meta.changes ? reply({ ok: true }) : reply({ error: 'That request is gone.' }, 404);
  }

  /* similar artists or songs from Last.fm (version 19); any signed-in account, saved answers are free, fresh ones are capped per person */
  if (path === '/similar' && M === 'GET') return similarGet(env, url, me.uid);

  /* an artist's Apple Music photo (version 20): saved for everyone, capped per person per day */
  if (path === '/apple/art' && M === 'GET') return appleArtCached(env, url, me.uid);

  /* more art for an artist (version 23): saved for everyone, capped per person per day */
  if (path === '/art' && M === 'GET') return artGet(env, url, me.uid);

  /* what friends rated lately: newest rating days first, only friends who are sharing, only ratings that have a day (version 18) */
  if (path === '/feed' && M === 'GET') {
    const rows = (await env.CATALOG.prepare(
      "SELECT r.uid AS uid, u.name AS name, u.hue AS hue, r.kind AS kind, r.k AS k, r.t AS t, r.r AS r, r.ttl AS n, r.art AS a, r.img AS i, r.day AS d, r.rv AS rv FROM acct_ratings r JOIN acct_users u ON u.uid = r.uid " +
      "WHERE u.share = 1 AND r.day IS NOT NULL AND r.uid IN (SELECT b FROM acct_friends WHERE a = ?1 AND st = 'ok' UNION SELECT a FROM acct_friends WHERE b = ?1 AND st = 'ok') " +
      "ORDER BY r.day DESC, u.name COLLATE NOCASE, r.ttl COLLATE NOCASE LIMIT 60"
    ).bind(me.uid).all()).results || [];
    for (const x of rows) { if (!x.rv) delete x.rv; if (!x.i) delete x.i; }
    return reply({ rows });
  }

  /* a person's page: their published ratings. Yours always; a friend's only if you are friends and they are sharing. */
  if (path === '/profile' && M === 'GET') {
    const uid = (url.searchParams.get('uid') || '').replace(/[^0-9a-f]/g, '');
    if (uid.length !== 16) return reply({ error: 'no such person' }, 400);
    if (uid !== me.uid) {
      const f = await env.CATALOG.prepare("SELECT 1 AS x FROM acct_friends WHERE st = 'ok' AND ((a = ?1 AND b = ?2) OR (a = ?2 AND b = ?1))").bind(me.uid, uid).first();
      if (!f) return reply({ error: 'You are not friends with this person.' }, 404);
    }
    const u = await env.CATALOG.prepare('SELECT uid, name, share, made, hue, pic, songs, savg FROM acct_users WHERE uid = ?1').bind(uid).first();
    if (!u) return reply({ error: 'That account is gone.' }, 404);
    if (uid !== me.uid && !u.share) return reply({ error: u.name + ' is not sharing their ratings right now.' }, 403);
    const items = (await env.CATALOG.prepare('SELECT kind, k, t, r, ttl AS n, art AS a, img AS i, day AS d, trk, rv FROM acct_ratings WHERE uid = ?1 ORDER BY r DESC, ttl COLLATE NOCASE LIMIT 4000').bind(uid).all()).results || [];
    for (const x of items) { if (x.trk) { try { x.tr = JSON.parse(x.trk); } catch (e) { /* skip a bad list */ } } delete x.trk; if (!x.rv) delete x.rv; }
    const fc = await env.CATALOG.prepare("SELECT COUNT(*) AS c FROM acct_friends WHERE st = 'ok' AND (a = ?1 OR b = ?1)").bind(uid).first('c');
    return reply({ profile: { uid, name: u.name, since: u.made, friends: fc || 0, hue: u.hue == null ? null : u.hue, pic: u.pic || '', songs: u.songs || 0, savg: u.savg || 0, items } });
  }

  if (path === '/friends/ratings' && M === 'POST') {
    const { j, err } = await readBody(request, 64 * 1024); if (err) return err;
    const kind = j.kind === 's' ? 's' : 'a';
    const ks = (Array.isArray(j.ks) ? j.ks : []).filter(x => typeof x === 'string' && x).slice(0, 400).map(x => x.slice(0, 80));
    const ts = (Array.isArray(j.ts) ? j.ts : []).filter(x => typeof x === 'string' && x).slice(0, 400).map(x => x.slice(0, 200));
    if (!ks.length && !ts.length) return reply({ rows: [] });
    const rows = (await env.CATALOG.prepare(
      "SELECT r.uid AS uid, u.name AS name, u.hue AS hue, r.k AS k, r.t AS t, r.r AS r, r.rv AS rv FROM acct_ratings r JOIN acct_users u ON u.uid = r.uid " +
      "WHERE r.kind = ?1 AND u.share = 1 AND r.uid IN (SELECT b FROM acct_friends WHERE a = ?2 AND st = 'ok' UNION SELECT a FROM acct_friends WHERE b = ?2 AND st = 'ok') " +
      "AND (r.k IN (SELECT value FROM json_each(?3)) OR r.t IN (SELECT value FROM json_each(?4))) LIMIT 1500"
    ).bind(kind, me.uid, JSON.stringify(ks), JSON.stringify(ts)).all()).results || [];
    return reply({ rows });
  }

  return reply({ error: 'not found' }, 404);
}

export default {
  async scheduled(event, env, ctx) {
    if (env.STATE) ctx.waitUntil(spCheck(env, true, true));
    /* once a day (the 10:00 UTC check), drop saved catalog copies that have expired */
    if (env.CATALOG && new Date(event.scheduledTime).getUTCHours() === 10) ctx.waitUntil(env.CATALOG.prepare('DELETE FROM catalog WHERE exp < ?1').bind(Date.now()).run().catch(() => {}));
    if (env.CATALOG && new Date(event.scheduledTime).getUTCHours() === 10) ctx.waitUntil(env.CATALOG.prepare('DELETE FROM acct_rl WHERE exp < ?1').bind(Date.now()).run().catch(() => {}));
  },

  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.STATE) return reply({ error: 'missing the STATE KV binding' }, 500);
    if (!env.SECRET) return reply({ error: 'missing the SECRET variable' }, 500);

    const url = new URL(request.url);
    if (url.pathname === '/brief' && request.method === 'GET') return briefGet(env, url);   /* its own read-only key */
    if (url.pathname === '/photo' && request.method === 'GET') return photoGet(env, url);   /* signed link, no sync key */
    if (url.pathname === '/art/img' && request.method === 'GET') return artImg(url, ctx);
    if (url.pathname === '/spban/test' && request.method === 'GET') return spBanTest(env);   /* TEMPORARY: banner feasibility, reports only status codes */   /* art hosts only, for scoring (version 23) */
    if (url.pathname === '/suggest' && request.method === 'POST') return sugPost(request, env);   /* open to friends, rate limited */
    if (url.pathname === '/bug' && request.method === 'POST') return bugPost(request, env);   /* open to friends, rate limited, kept in D1 */
    if (url.pathname.startsWith('/acct/')) return acct(request, env, url);   /* Google sign-in token or its own session token, never the sync key */
    const given = (request.headers.get('x-sync-key') || '').trim();
    /* the sync key, or (version 13) the signed-in owner account's token */
    if (!keyMatches(given, String(env.SECRET).trim()) && !(await ownerViaToken(env, request))) return reply({ error: 'unauthorized' }, 401);
    if (url.pathname === '/suggest') return sugOwner(request, env, url);
    if (url.pathname === '/bug') return bugOwner(request, env, url);
    if (url.pathname === '/users') return request.method === 'GET' ? usersList(env) : reply({ error: 'method not allowed' }, 405);   /* owner only: every Google account (version 15) */
    if (url.pathname === '/rating-dates') {   /* the owner's private list of rating days (kept in KV, not in the public repo) */
      if (request.method === 'GET') return new Response((await env.STATE.get('rating-dates')) || '[]', { headers: JSON_H });
      return reply({ error: 'method not allowed' }, 405);
    }
    if (url.pathname === '/apple/art') return request.method === 'GET' ? appleArtCached(env, url, 'owner') : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/art') return request.method === 'GET' ? artGet(env, url, 'owner') : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/spotify/api') return request.method === 'GET' ? spCatalog(env, url) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/spotify/play') return request.method === 'POST' ? spPlay(request, env) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/photo') {
      if (request.method === 'PUT') return photoPut(request, env, url);
      if (request.method === 'DELETE') { const k = url.searchParams.get('k') || ''; if (!PHOTO_RE.test(k)) return reply({ error: 'bad photo key' }, 400); await env.STATE.delete('photo:' + k); return reply({ ok: true }); }
      return reply({ error: 'method not allowed' }, 405);
    }
    if (url.pathname === '/discogs/release') return request.method === 'GET' ? discogsRelease(env, url) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/discogs') return request.method === 'GET' ? discogsSearch(env, url) : reply({ error: 'method not allowed' }, 405);
    if (url.pathname === '/similar') return request.method === 'GET' ? similarGet(env, url, 'owner') : reply({ error: 'method not allowed' }, 405);
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
