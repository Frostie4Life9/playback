/* =========================================================
   Playback — sync  (worker version 3, 2026.11.03)
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

   UPDATING an existing Worker: open it > Edit code > select all,
   paste this file over it > Deploy. The binding and secret stay.

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
               a stale device can't overwrite fresher data. ?force=1 overrides
               that when you choose "Keep this device". The previous copy is
               kept under "state-prev" as a safety net.

   Compressed uploads are stored as-is and never unpacked here, which keeps
   each request well inside the free plan's CPU limit. The log's mtime rides
   along as KV metadata so the newer-copy check needs no parsing.
   Every response carries x-pb-worker: 3 so the app knows what this Worker
   can do (2 = compressed sync, 3 = Spotify too).

   SPOTIFY (version 3)
   PUT    /spotify  {cid, rt, at, exp} -> the app hands over its Spotify sign-in
                    (PKCE: client ID + refresh token, no client secret). Checks
                    Spotify straight away.
   GET    /spotify?after=<ms> -> {connected, err, polled, cronAt, plays:[...]}
                    plays newer than <ms>, oldest first. Checks Spotify first if
                    the last check is over a minute old.
   DELETE /spotify  -> forgets the sign-in and the stored plays.
   The hourly Cron Trigger checks Spotify's recently played (it only keeps your
   last 50 plays) and adds new ones to a list of the last 3000.
   Spotify rotates the refresh token on every refresh, so only the hourly check
   refreshes it while that check is running; app requests just use the current
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
  'Access-Control-Expose-Headers': 'x-pb-worker',
  'Access-Control-Max-Age': '86400',
  'x-pb-worker': '3'
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

/* ---------- Spotify ---------- */
async function getJSON(env, k) { try { return JSON.parse(await env.STATE.get(k)) } catch (e) { return null } }

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
  if (!at || Date.now() > (auth.exp || 0) - 60000) {
    if (!mayRefresh) return done();
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: auth.rt, client_id: auth.cid })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { meta.err = j.error === 'invalid_grant' ? 'reconnect' : 'sign-in ' + r.status; return done(); }
    at = j.access_token;
    await env.STATE.put(SP_AUTH, JSON.stringify({ cid: auth.cid, rt: j.refresh_token || auth.rt, at, exp: Date.now() + (j.expires_in || 3600) * 1000 }));
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

export default {
  async scheduled(event, env, ctx) {
    if (env.STATE) ctx.waitUntil(spCheck(env, true, true));
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.STATE) return reply({ error: 'missing the STATE KV binding' }, 500);
    if (!env.SECRET) return reply({ error: 'missing the SECRET variable' }, 500);

    const url = new URL(request.url);
    const given = (request.headers.get('x-sync-key') || '').trim();
    if (!keyMatches(given, String(env.SECRET).trim())) return reply({ error: 'unauthorized' }, 401);
    if (url.pathname === '/spotify') return spotify(request, env, url);
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
        if (!force && st.mtime > mtime) return sendStored(st, wantGz, 409);
        await env.STATE.put(PREV, st.buf, { metadata: { enc: st.enc, mtime: st.mtime } });
      }
      await env.STATE.put(KEYNAME, body, { metadata: { enc: isGz ? 'gzip' : 'json', mtime } });
      return reply({ ok: true, bytes: body.byteLength, mtime: mtime || null });
    }

    return reply({ error: 'method not allowed' }, 405);
  }
};
