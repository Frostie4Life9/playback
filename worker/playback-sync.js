/* =========================================================
   Playback — sync
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

   Opening the URL in a browser should return {"error":"unauthorized"}.

   ROUTES (all need the x-sync-key header)
   GET  /   -> the saved log JSON (or null)
   PUT  /   -> save the log. Refused with 409 (and the stored copy) if
               the stored copy is newer, so a stale device can't
               overwrite fresher data. ?force=1 overrides that when you
               choose "Keep this device". The previous copy is kept
               under "state-prev" as a safety net.
   ========================================================= */

const KEYNAME = 'state';
const PREV = 'state-prev';
const MAX_BYTES = 1024 * 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-sync-key',
  'Access-Control-Max-Age': '86400'
};

function reply(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, CORS)
  });
}

function keyMatches(given, want) {
  let ok = given.length === want.length;
  for (let i = 0; i < Math.max(given.length, want.length); i++) {
    if (given.charCodeAt(i) !== want.charCodeAt(i)) ok = false;
  }
  return ok;
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

    if (request.method === 'GET') {
      const stored = await env.STATE.get(KEYNAME);
      return new Response(stored || 'null', { headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, CORS) });
    }

    if (request.method === 'PUT') {
      const body = await request.text();
      if (body.length > MAX_BYTES) return reply({ error: 'payload too large' }, 413);
      let parsed;
      try { parsed = JSON.parse(body); } catch (e) { return reply({ error: 'body is not valid JSON' }, 400); }
      if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.music) || !Array.isArray(parsed.screen)) {
        return reply({ error: 'not a Playback log' }, 400);
      }

      const stored = await env.STATE.get(KEYNAME);
      if (stored) {
        let cur = null; try { cur = JSON.parse(stored); } catch (e) {}
        const force = url.searchParams.get('force') === '1';
        if (!force && cur && (cur.mtime || 0) > (parsed.mtime || 0)) {
          return new Response(stored, { status: 409, headers: Object.assign({ 'content-type': 'application/json' }, CORS) });
        }
        await env.STATE.put(PREV, stored);
      }
      await env.STATE.put(KEYNAME, body);
      return reply({ ok: true, bytes: body.length, mtime: parsed.mtime || null });
    }

    return reply({ error: 'method not allowed' }, 405);
  }
};
