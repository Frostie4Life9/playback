/* =========================================================
   Playback — sync  (worker version 2, 2026.11.03)
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
   Every response carries x-pb-worker: 2 so the app knows it can compress.
   ========================================================= */

const KEYNAME = 'state';
const PREV = 'state-prev';
const MAX_JSON = 1024 * 1024;
const MAX_GZ = 20 * 1024 * 1024;   // KV allows 25 MiB per value

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-sync-key',
  'Access-Control-Expose-Headers': 'x-pb-worker',
  'Access-Control-Max-Age': '86400',
  'x-pb-worker': '2'
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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.STATE) return reply({ error: 'missing the STATE KV binding' }, 500);
    if (!env.SECRET) return reply({ error: 'missing the SECRET variable' }, 500);

    const url = new URL(request.url);
    const given = (request.headers.get('x-sync-key') || '').trim();
    if (!keyMatches(given, String(env.SECRET).trim())) return reply({ error: 'unauthorized' }, 401);
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
