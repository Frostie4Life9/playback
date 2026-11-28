// Playback phone budget check. One command, from tools/bench:   npm i  (once)   then   npm run bench
// Runs the app at iPhone size (430x932, 3x pixels, touch, 4x CPU slowdown) in headless Chrome with a synthetic
// library and real JPEG covers, then times the album and the 7-inch single: open, rating taps, close after rating,
// and estimates graphics-layer memory while the album opens. Exits 1 if any budget in BUDGET is over.
//
// Options (env): CHROME=/path/to/chrome   ONLY=album|single   RUNS=2 (best of N per step)   JSON=1 (machine output)
//                ENGINE=webkit (Playwright WebKit, needs PLAYWRIGHT_BROWSERS_PATH; no CPU throttle there, so timings are info only)
import { chromium, webkit } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'out');
const ART = path.join(OUT, 'art');

// The budgets. CLAUDE.md points here; change them in one place.
export const BUDGET = {
  tapMs: 50,        // rating taps (open the card, set a score, Done): tap to the next painted frame
  closeMs: 150,     // closing after a rating: longest main-thread block from the tap until it has landed
  rateRenders: 0,   // full render() calls allowed during rating taps
  layersMB: 280,    // estimated composited-layer memory, worst moment of the album opening (was 350; ~240 after 2026.11.28-g)
};

const ENGINE = process.env.ENGINE === 'webkit' ? webkit : chromium;
const IS_WK = process.env.ENGINE === 'webkit';
const RUNS = +(process.env.RUNS || 3);
const ONLY = process.env.ONLY || '';
const CHROME = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));

// ---------- static server: the repo, plus generated covers under /__art/ ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
function serve() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = p.startsWith('/__art/') ? path.join(ART, p.slice(7)) : path.join(ROOT, p === '/' ? 'index.html' : p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

// ---------- synthetic library: 3 artists, 8 albums x 14 songs and 6 singles each ----------
const sid = (...p) => { const s = p.join('|').toLowerCase(); let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0; return 'i' + x.toString(36); };
function library(base) {
  const music = [];
  let n = 0;
  const NA = process.env.BIG ? 90 : 3;   // BIG=1: about the size of Skyler's real log (~90 artists, ~2,000 releases)
  for (let a = 0; a < NA; a++) {
    const aid = sid('artist', 'bench' + a), groups = [];
    for (let g = 0; g < 8; g++) {
      const gid = 'a' + a + 'g' + g, items = [];
      for (let t = 0; t < 14; t++) items.push({ id: gid + 't' + t, title: 'Song ' + (t + 1) + ' of album ' + (g + 1) });
      groups.push({ id: gid, title: 'Album ' + (g + 1), year: String(2010 + g), kind: 'Studio album', img: base + '/__art/c' + (n++ % 24) + '.jpg', items });
    }
    for (let s = 0; s < (process.env.BIG ? 14 : 6); s++) {
      const gid = 'a' + a + 's' + s;
      groups.push({ id: gid, title: 'Single ' + (s + 1), year: String(2018 + s), kind: 'Single', img: base + '/__art/c' + (n++ % 24) + '.jpg', items: [{ id: gid + 't0', title: 'Single ' + (s + 1) }] });
    }
    if (a === 0) {   // a Deluxe (like Mercurial World: 14 + 14 deluxe songs, its own cover) and an album with features (like LONG.LIVE.A$AP)
      const dx = groups[7]; for (let t = 14; t < 28; t++) dx.items.push({ id: dx.id + 't' + t, title: 'Deluxe song ' + (t - 13), dx: true }); dx.dxImg = base + '/__art/c' + ((n++) % 24) + '.jpg';
      groups[6].items.slice(0, 9).forEach((i, k) => { i.f = ['Guest Artist ' + (k + 1)]; });
    }
    music.push({ id: aid, name: 'Bench Artist ' + (a + 1), groups });
  }
  const marks = {};
  // some history so rings, grooves and averages have something to draw
  for (const g of music[0].groups.slice(0, 4)) g.items.slice(0, 9).forEach((i, k) => { marks[i.id] = { done: true, r: 5 + (k % 5) }; });
  if (process.env.BIG) music.slice(1).forEach((a, x) => a.groups.slice(0, 5).forEach(g => g.items.forEach((i, k) => { if ((k + x) % 3) marks[i.id] = { done: true, r: 4 + ((k * 7 + x) % 13) / 2 }; })));
  // Movies & TV: 4 shows (2 seasons of 8) and 6 films, some watched and rated
  const screen = [];
  for (let k = 0; k < 4; k++) { const id = sid('show', 'Bench Show ' + (k + 1)); screen.push({ id, type: 'show', title: 'Bench Show ' + (k + 1), year: String(2015 + k), seasons: [{ n: 1, eps: 8, total: 8 }, { n: 2, eps: 8, total: 8 }] });
    for (let e = 1; e <= 8 - k * 2; e++) marks[sid(id, 's', 1, 'e', e)] = { done: true, ...(e % 3 ? {} : { r: 6 + e % 4 }) }; }
  for (let k = 0; k < 6; k++) { const id = sid('film', 'Bench Film ' + (k + 1), String(2000 + k)); screen.push({ id, type: 'film', title: 'Bench Film ' + (k + 1), year: String(2000 + k) }); if (k % 2) marks[id] = { done: true, r: 5 + k }; }
  return { v: 1, music, screen, marks, flags: { rhAlbums: true, exSeverance: true, r10: true } };
}

async function makeCovers(browser) {
  fs.mkdirSync(ART, { recursive: true });
  if (fs.existsSync(path.join(ART, 'c23.jpg'))) return;
  const p = await browser.newPage();
  const urls = await p.evaluate(() => {
    const out = [];
    for (let i = 0; i < 24; i++) {
      const c = document.createElement('canvas'); c.width = c.height = 640; const x = c.getContext('2d');
      const h = (i * 47) % 360, g = x.createLinearGradient(0, 0, 640, 640);
      g.addColorStop(0, `hsl(${h} 70% 45%)`); g.addColorStop(1, `hsl(${(h + 80) % 360} 60% 20%)`);
      x.fillStyle = g; x.fillRect(0, 0, 640, 640);
      for (let k = 0; k < 40; k++) { x.fillStyle = `hsla(${(h + k * 13) % 360} 80% ${30 + (k % 5) * 10}% / .5)`; x.beginPath(); x.arc((k * 97) % 640, (k * 53 + i * 31) % 640, 20 + (k % 7) * 14, 0, 7); x.fill(); }
      for (let y = 0; y < 640; y += 2) { x.fillStyle = `rgba(0,0,0,${(y * i % 7) / 60})`; x.fillRect(0, y, 640, 1); }
      out.push(c.toDataURL('image/jpeg', .86));
    }
    return out;
  });
  urls.forEach((u, i) => fs.writeFileSync(path.join(ART, 'c' + i + '.jpg'), Buffer.from(u.split(',')[1], 'base64')));
  await p.close();
}

// ---------- in-page probes ----------
// Installed before the app runs: counts render(), records long tasks and frame gaps.
const PROBE = () => {
  window.__B = { long: [], frames: [], renders: 0, renderMs: 0, rec: false };
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) __B.long.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  let last = 0; const f = t => { if (__B.rec && last) __B.frames.push([t, t - last]); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f);
  // counts full redraws of the page (renderFull; render() itself may just patch an open album)
  addEventListener('load', () => { const k = typeof window.renderFull === 'function' ? 'renderFull' : 'render', r = window[k]; if (typeof r !== 'function') return;
    window[k] = function () { const t = performance.now(); __B.renders++; try { return r.apply(this, arguments); } finally { __B.renderMs += performance.now() - t; } }; });
};

async function settle(page, ms = 4500) {
  await page.evaluate(async ms => {
    const t0 = performance.now();
    const busy = () => { try { if (typeof GFP !== 'undefined' && GFP) return true; } catch (e) {}
      return document.getAnimations().some(a => a.playState === 'running' && a.effect && isFinite(a.effect.getComputedTiming().endTime)); };
    while (performance.now() - t0 < ms) { await new Promise(r => setTimeout(r, 60)); if (!busy()) { await new Promise(r => setTimeout(r, 120)); if (!busy()) return; } }
  }, ms);
}

// Click sel, then measure: tap = until the next painted frame; block = longest task until settled; renders; worst frame.
async function step(page, sel, { wait = true, tail = 0 } = {}) {
  const r = await page.evaluate(async sel => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : null;
    if (!el) return { err: 'missing ' + sel };
    __B.long = []; __B.frames = []; __B.renders = 0; __B.renderMs = 0; __B.rec = true;
    const t0 = performance.now(); let err = null;
    const oe = e => { err = String(e.message || e).slice(0, 120); }; addEventListener('error', oe);
    el.click();
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
    const tap = performance.now() - t0;
    window.__T0 = t0; window.__TAP = tap; window.__ERR = () => err;
    return { tap };
  }, sel);
  if (r.err) return r;
  if (wait) await settle(page); else await page.waitForTimeout(450);
  if (tail) await page.waitForTimeout(tail);   // deferred work (the hero repaint after a close) counts too
  return page.evaluate(() => {
    __B.rec = false; const t0 = __T0;
    const long = __B.long.filter(([s]) => s >= t0 - 5);
    return { tasks: long.map(([s, d]) => [Math.round(s - t0), Math.round(d)]), tap: +__TAP.toFixed(1), block: +Math.max(__TAP, ...long.map(x => x[1])).toFixed(1), longN: long.length,
      renders: __B.renders, renderMs: +__B.renderMs.toFixed(1), worstFrame: +Math.max(0, ...__B.frames.map(f => f[1])).toFixed(1), err: __ERR() };
  });
}

async function layersMB(cdp, dpr) {
  const { layers } = await new Promise(res => { const h = e => { cdp.off('LayerTree.layerTreeDidChange', h); res(e); }; cdp.on('LayerTree.layerTreeDidChange', h); setTimeout(() => res({ layers: null }), 400); });
  if (!layers) return null;
  let b = 0; const big = [];
  for (const l of layers) if (l.drawsContent && !l.invisible) { const m = l.width * l.height * 4 * dpr * dpr; b += m; big.push([+(m / 1048576).toFixed(1), l.width + 'x' + l.height, l.backendNodeId]); }
  if (process.env.LAYERS) { big.sort((x, y) => y[0] - x[0]); const top = big.slice(0, 8);
    for (const t of top) if (t[2]) try { const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: t[2] }); const { result } = await cdp.send('Runtime.callFunctionOn', { objectId: object.objectId, functionDeclaration: 'function(){return this.nodeType===1?(this.tagName+"."+[...this.classList].join(".")).slice(0,70):"#"+this.nodeName}', returnByValue: true }); t[2] = result.value; } catch (e) {}
    console.log('  layers', (b / 1048576).toFixed(0), 'MB:', top.map(t => t.join(' ')).join(' | ')); }
  return +(b / 1048576).toFixed(0);
}

// PROF=<step> prints where the main-thread time went in that step (self time by function, and inclusive time of the app's own functions)
async function prof(cdp, name, fn) {
  if (!cdp || process.env.PROF !== name) return fn();
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  const r = await fn();
  const { profile } = await cdp.send('Profiler.stop');
  const byId = new Map(profile.nodes.map(n => [n.id, n])), self = new Map(), dt = profile.timeDeltas, par = new Map();
  for (const n of profile.nodes) for (const c of n.children || []) par.set(c, n.id);
  const incl = new Map();
  profile.samples.forEach((id, i) => { const ms = (dt[i] || 0) / 1000; let n = byId.get(id); const k = n.callFrame.functionName || '(' + n.callFrame.url.split('/').pop() + ')';
    self.set(k, (self.get(k) || 0) + ms); const seen = new Set();
    for (let x = id; x; x = par.get(x)) { const f = byId.get(x).callFrame; if (!f.url.includes('index.html') || !f.functionName || seen.has(f.functionName)) continue; seen.add(f.functionName); incl.set(f.functionName, (incl.get(f.functionName) || 0) + ms); } });
  const top = m => [...m].filter(([k]) => !/^\((idle|program)\)$/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k + ' ' + v.toFixed(1)).join(' | ');
  console.log(`  PROF ${name} self: ${top(self)}\n  PROF ${name} incl: ${top(incl)}`);
  return r;
}

// ---------- one scenario ----------
const BUILD = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/CHANGELOG\s*=\s*\[\s*\{\s*v:'([^']+)'/) || [])[1];
// kinds: album (phone jacket), single (7-inch), safe (an album on the crash-safe list: light sheet, the generic patch path)
async function scenario(browser, base, kind) {
  if (kind === 'pages') return pages(browser, base);
  if (kind === 'flows') return flows(browser, base);
  if (kind === 'stress') return stress(browser, base);
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: !IS_WK, hasTouch: true, serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1', reducedMotion: 'no-preference' });
  const lib = library(base);
  await ctx.addInitScript(([st, sel, safe, v]) => {
    if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1');
    localStorage.clear();
    if (safe) { localStorage.setItem('pb_gfsafe', JSON.stringify([safe])); localStorage.setItem('pb_gfsafev', JSON.stringify({ [safe]: v })); }
    localStorage.setItem('playback_v1', st); localStorage.setItem('playback_v1_tab', 'music'); localStorage.setItem('playback_v1_sel_music', sel); localStorage.setItem('playback_v1_tour', '1');
  }, [JSON.stringify(lib), lib.music[0].id, kind === 'safe' ? 'a0g6' : '', BUILD]);
  await ctx.addInitScript(PROBE);
  await ctx.route('**/*', r => { const u = r.request().url(); return u.startsWith(base) || u.startsWith('data:') || u.startsWith('blob:') ? r.continue() : r.abort(); });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.goto(base + '/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.hxsl[data-g]', { timeout: 20000 });
  await page.waitForTimeout(1500);
  // GENERIC=1: drop the album's and 7-inch's own patchers, to check any sleeve is fast on the shared path alone
  if (process.env.GENERIC) await page.evaluate(() => { for (const k in SLEEVE) delete SLEEVE[k]; });
  const sleeve = await page.evaluate(() => typeof SLEEVE === 'object' ? Object.keys(SLEEVE).join(',') || 'generic only' : 'n/a');
  let cdp = null;
  if (!IS_WK) { cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await cdp.send('LayerTree.enable'); }

  const gid = kind === 'album' ? 'a0g5' : kind === 'safe' ? 'a0g6' : 'a0s1', song = gid + 't0';
  const tile = `.hxsl[data-g="${gid}"]`;
  const out = { kind, sleeve, steps: {} };
  const best = (k, v) => { const o = out.steps[k]; if (!o || (v.block ?? 1e9) < (o.block ?? 1e9)) out.steps[k] = v; };
  for (let run = 0; run < RUNS; run++) {
    // ensure the single isn't hidden in a folded stack
    if (!(await page.$(tile))) { await page.evaluate(() => { const s = document.querySelector('.hxstk'); if (s) s.click(); }); await page.waitForTimeout(900); }
    await page.evaluate(t => { const e = document.querySelector(t); if (e) e.scrollIntoView({ block: 'center' }); }, tile);
    await page.waitForTimeout(300);
    // open, sampling layer memory through the opening
    let lmax = 0;
    const openP = prof(cdp, 'open', () => step(page, tile));
    if (cdp) for (let i = 0; i < 6; i++) { await page.waitForTimeout(220); const m = await layersMB(cdp, 3); if (m) lmax = Math.max(lmax, m); }
    const open = await openP; open.layersMB = lmax || null; best('open', open);
    const shot = async n => { if (process.env.SHOTS && run === 0) { await page.waitForTimeout(250); await page.screenshot({ path: path.join(OUT, `${kind}-${n}.png`) }); } };
    await shot('1-open');
    if (process.env.SHOT2 && run === 0) { await page.evaluate(process.env.SHOT2); await page.waitForTimeout(300); await page.screenshot({ path: path.join(OUT, kind + '-x.png') }); }
    if (process.env.EVAL && run === 0) console.log('  EVAL', JSON.stringify(await page.evaluate(process.env.EVAL)));   // EVAL='js expression' after the album opens
    if (!(await page.$('.group.sleeve.gf'))) { out.err = 'album did not open'; break; }
    const row = `.group.sleeve.gf .track.sl-t[data-id="${song}"]`;
    best('rate:card', await prof(cdp, 'rate:card', () => step(page, row, { wait: false })));
    await shot('2-card');
    await page.waitForTimeout(300);
    // set a score the way the slider does: input then change
    const setR = await page.evaluate(async v => {
      const el = document.querySelector('.rater .rt-s'); if (!el) return { err: 'no slider' };
      __B.long = []; __B.frames = []; __B.renders = 0; __B.renderMs = 0; __B.rec = true; const t0 = performance.now();
      el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
      const tap = performance.now() - t0; await new Promise(r => setTimeout(r, 400)); __B.rec = false;
      const long = __B.long.filter(([s]) => s >= t0 - 5);
      return { tap: +tap.toFixed(1), block: +Math.max(tap, ...long.map(x => x[1])).toFixed(1), renders: __B.renders, renderMs: +__B.renderMs.toFixed(1), worstFrame: +Math.max(0, ...__B.frames.map(f => f[1])).toFixed(1) };
    }, 6 + run + (kind === 'single' ? 1.5 : 0));
    best('rate:set', setR);
    if (kind === 'single') {   // motion check: a changed score turns the 7-inch's label, with the old number riding out
      const pr = page.evaluate(() => new Promise(res => setTimeout(() => { const l = document.querySelector('.gf.s7 .s7-lab');
        res({ turning: !!l && l.getAnimations().length > 0, rot: l ? getComputedStyle(l).rotate : '', old: !!document.querySelector('.gf.s7 .s7-gh') }); }, 700)));
      const d = await prof(cdp, 'rate:done', () => step(page, '.rater [data-act="rclose"]'));
      d.spin = await pr.catch(() => null); best('rate:done', d);
      if (run > 0 && d.spin && !(d.spin.turning && d.spin.old)) out.err = 'label did not turn with the old score: ' + JSON.stringify(d.spin);
    } else best('rate:done', await prof(cdp, 'rate:done', () => step(page, '.rater [data-act="rclose"]')));
    best('close', await prof(cdp, 'close', () => step(page, '.group.sleeve.gf [data-act="gfclose"]', { tail: 1600 })));
    await page.waitForTimeout(900);   // the hero repaint deferred after a close
    await shot('4-closed');
  }
  out.errors = errors;
  await ctx.close();
  return out;
}

// Every main page once: Stats, History, Settings, Account, back to the artist, the library open and shut, another artist.
// Catches page errors anywhere in the app, and reports how long each switch takes (no budget yet, info only).
async function pages(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: !IS_WK, hasTouch: true, serviceWorkers: 'block' });
  const lib = library(base);
  await ctx.addInitScript(([st, sel]) => { if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1'); localStorage.clear();
    localStorage.setItem('playback_v1', st); localStorage.setItem('playback_v1_tab', 'music'); localStorage.setItem('playback_v1_sel_music', sel); localStorage.setItem('playback_v1_tour', '1'); }, [JSON.stringify(lib), lib.music[0].id]);
  await ctx.addInitScript(PROBE);
  await ctx.route('**/*', r => { const u = r.request().url(); return u.startsWith(base) || u.startsWith('data:') || u.startsWith('blob:') ? r.continue() : r.abort(); });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  let cdp = null; if (!IS_WK) { cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  let boot;
  const go = async () => { await page.goto(base + '/index.html', { waitUntil: 'commit' }); await page.waitForSelector('.hxsl[data-g]', { timeout: 30000 });
    boot = await page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(() => r(Math.round(performance.now())), 0)))); return {}; };
  await prof(cdp, 'start', go);
  await page.waitForTimeout(1500);
  const out = { kind: 'pages', sleeve: '-', steps: { start: { tap: boot, block: boot, renders: 0, renderMs: 0, worstFrame: 0 } } };
  const seq = [['stats', '[data-act="mmgo"][data-v="stats"]'], ['history', '[data-act="mmgo"][data-v="history"]'], ['settings', '[data-act="view"][data-v="settings"]'],
    ['account', '[data-act="view"][data-v="account"]'], ['artist', '[data-act="mmgo"][data-v="artists"]'], ['library', '[data-act="lib"]'],
    ['other artist', `#lx [data-id="${lib.music[1].id}"], #lx [data-sel="${lib.music[1].id}"], #lx .entry:nth-child(2), #lx .tile:not(.add):nth-of-type(2)`], ['library 2', '[data-act="lib"]'], ['back', '[data-act="lib"]']];
  for (const [name, sel] of seq) {
    const r = await prof(cdp, name, () => step(page, sel));
    if (process.env.EVAL && process.env.EVALAT === name) console.log('  EVAL', JSON.stringify(await page.evaluate(process.env.EVAL)));
    out.steps[name] = r.err ? { tap: 0, block: 0, renders: 0, renderMs: 0, worstFrame: 0, err: r.err } : r;
    if (r.err) out.steps[name].skip = true;
  }
  // a second start of the same log (what every app open and every reload after a crash is)
  await page.waitForTimeout(4600);
  let again;
  await prof(cdp, 'restart', async () => { await page.goto(base + '/index.html', { waitUntil: 'commit' }); await page.waitForSelector('.hxsl[data-g]', { timeout: 30000 });
    again = await page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(() => r(Math.round(performance.now())), 0)))); return {}; });
  out.steps.restart = { tap: again, block: again, renders: 0, renderMs: 0, worstFrame: 0 };
  // Skyler's own pages (owner mode): Movies & TV and the vinyl Collection. Network is blocked, so nothing is sent anywhere.
  await page.goto(base + '/index.html?owner=1', { waitUntil: 'load' }); await page.waitForSelector('.hxsl[data-g]', { timeout: 30000 }); await page.waitForTimeout(1200);
  for (const [name, sel] of [['movies & tv', '[data-act="tab"][data-v="screen"]'], ['tv: films', '[data-sc="seg"][data-v="films"]'], ['tv: open film', '[data-sc="open"]'], ['tv: close', '[data-sc="close"]'],
    ['tv: box sets', '[data-sc="seg"][data-v="boxes"]'], ['tv: open show', '[data-sc="box"], [data-sc="open"]'], ['tv: episode', '[data-sc="ep"]'], ['tv: close show', '[data-sc="closebox"], [data-sc="close"]'],
    ['tv: diary', '[data-sc="seg"][data-v="diary"]'], ['tv: stats', '[data-sc="seg"][data-v="stats"]'], ['tv: people', '[data-sc="seg"][data-v="people"]'],
    ['collection', '[data-act="view"][data-v="collection"]'], ['music', '[data-act="tab"][data-v="music"], [data-act="mmgo"][data-v="artists"]']]) {
    const r = await prof(cdp, name, () => step(page, sel));
    out.steps[name] = r.err ? { tap: 0, block: 0, renders: 0, renderMs: 0, worstFrame: 0, err: r.err } : r;
  }
  out.errors = errors; await ctx.close(); return out;
}

// What the app should DO, checked end to end (not timings): a rating sticks, shows, survives close/reopen and a reload,
// Clear clears, heard toggles, Next record moves on, a 7-inch's label shows its score. Any miss is a fail.
async function flows(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: !IS_WK, hasTouch: true, serviceWorkers: 'block' });
  const lib = library(base);
  await ctx.addInitScript(([st, sel]) => { if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1'); localStorage.clear();
    localStorage.setItem('playback_v1', st); localStorage.setItem('playback_v1_tab', 'music'); localStorage.setItem('playback_v1_sel_music', sel); localStorage.setItem('playback_v1_tour', '1'); }, [JSON.stringify(lib), lib.music[0].id]);
  await ctx.route('**/*', r => { const u = r.request().url(); return u.startsWith(base) || u.startsWith('data:') || u.startsWith('blob:') ? r.continue() : r.abort(); });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  let crashed = ''; page.on('crash', () => { crashed = 'the page crashed (the browser dropped it)'; }); page.on('close', () => { crashed = crashed || 'the page closed'; });
  const fails = [], ok = [];
  const load = async () => { await page.goto(base + '/index.html', { waitUntil: 'load' }); await page.waitForSelector('.hxsl[data-g]', { timeout: 20000 }); await page.waitForTimeout(1200); };
  const log = m => { if (process.env.STEPLOG) console.log('   .', m); };
  const click = async (sel, wait = true) => { log('click ' + sel); const f = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; e.click(); return true; }, sel); if (!f) return false; if (wait) await settle(page); else await page.waitForTimeout(400); return true; };
  const need = (name, cond, info) => { if (crashed) throw new Error(crashed + ' before: ' + name); (cond ? ok : fails).push(name + (cond || info === undefined ? '' : ' (' + JSON.stringify(info) + ')')); };
  const tile = g => `.hxsl[data-g="${g}"]`;
  const open = async g => { if (!(await page.$(tile(g)))) { await page.evaluate(() => { const s = document.querySelector('.hxstk'); if (s) s.click(); }); await page.waitForTimeout(900); }
    await page.evaluate(t => { const e = document.querySelector(t); if (e) e.scrollIntoView({ block: 'center' }); }, tile(g)); await page.waitForTimeout(200);
    return (await click(tile(g))) && !!(await page.$('.group.sleeve.gf')); };
  const rate = async (id, v) => { if (!(await click(`.group.sleeve.gf .track.sl-t[data-id="${id}"]`, false))) return false;
    await page.waitForTimeout(250);
    const set = await page.evaluate(v => { const el = document.querySelector('.rater .rt-s'); if (!el) return false; el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); return true; }, v);
    await page.waitForTimeout(150); await click('.rater [data-act="rclose"]'); return set; };
  const mark = id => page.evaluate(id => S.marks[id] || null, id);
  const rowNum = id => page.evaluate(id => { const n = document.querySelector(`.group.sleeve.gf .track.sl-t[data-id="${id}"] .rg-n`); return n ? n.textContent.trim() : ''; }, id);
  const close = async () => { await click('.group.sleeve.gf [data-act="gfclose"]'); await page.waitForTimeout(300); return !(await page.$('.group.sleeve.gf')); };
  try {
  await load();
  if (!process.env.SKIPALB) {
  const A = 'a0g2', t0 = A + 't0', t1 = A + 't11';
  need('album opens', await open(A));
  await rate(t0, 7); need('rating saved', ((await mark(t0)) || {}).r === 7, await mark(t0)); need('rating shows on the song', (await rowNum(t0)) === '7', await rowNum(t0));
  await rate(t0, 8.5); need('re-rating saved', ((await mark(t0)) || {}).r === 8.5, await mark(t0)); need('re-rating shows', (await rowNum(t0)) === '8.5', await rowNum(t0));
  await click(`.group.sleeve.gf .track.sl-t[data-id="${t0}"]`, false); await page.waitForTimeout(250); await click('.rater [data-act="rclear"]'); await page.waitForTimeout(300); await click('.rater [data-act="rclose"]');
  need('Clear removes the rating', !((await mark(t0)) || {}).r, await mark(t0));
  await rate(t0, 7);
  const before = !!((await mark(t1)) || {}).done; const found = await click(`.group.sleeve.gf [data-act="tog"][data-id="${t1}"]`);
  need('heard toggles', !!((await mark(t1)) || {}).done !== before, { found, before, after: await mark(t1), st: await page.evaluate(() => ({ rOpen: UI.rOpen, rClosing: UI.rClosing, gfp: !!GFP })) });
  // album score: the sticker on the jacket opens the album's own card
  if (await click('.group.sleeve.gf .gfph-stk', false)) { await page.waitForTimeout(250);
    await page.evaluate(() => { const el = document.querySelector('.rater .rt-s'); el.value = '8'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
    await page.waitForTimeout(150); await click('.rater [data-act="rclose"]');
    const stk = await page.evaluate(() => { const b = document.querySelector('.group.sleeve.gf .gfph-stk b'); return b ? b.textContent.trim() : ''; });
    need('album score saved and on the sticker', ((await mark(A)) || {}).r === 8 && stk === '8', { mark: await mark(A), stk }); }
  else need('album score sticker is there', false);
  // Leave out of avg, on and off again
  await click(`.group.sleeve.gf .track.sl-t[data-id="${t0}"]`, false); await page.waitForTimeout(250);
  await click('.rater [data-act="romit"]', false); const om1 = !!((await mark(t0)) || {}).x;
  await click('.rater [data-act="romit"]', false); const om2 = !!((await mark(t0)) || {}).x;
  await click('.rater [data-act="rclose"]');
  need('Leave out of avg toggles', om1 && !om2, { om1, om2 });
  need('album closes', await close());
  // Mark all heard on another album
  if (await open('a0g4')) { await click('.group.sleeve.gf [data-act="grpall"]');
    need('Mark all heard checks every song', await page.evaluate(() => S.music[0].groups[4].items.every(i => (S.marks[i.id] || {}).done)));
    await close(); }
  // the Deluxe edition shows its extra songs, and back
  if (await open('a0g7')) { const rows = () => page.evaluate(() => document.querySelectorAll('.group.sleeve.gf .gf-rs .track.sl-t').length);
    const std = await rows(); await click('.group.sleeve.gf [data-act="dxsel"][data-v="1"]'); await page.waitForTimeout(500); const dlx = await rows();
    await click('.group.sleeve.gf [data-act="dxsel"][data-v="0"]'); await page.waitForTimeout(500); const back = await rows();
    need('Deluxe shows its extra songs and switches back', std === 14 && dlx === 28 && back === 14, { std, dlx, back });
    await close(); }
  await page.waitForTimeout(400);
  need('hero record spins again after closing', await page.evaluate(() => !!(HERO.wa || HERO.raf) || noMotion()));
  need('reopens with the rating', (await open(A)) && (await rowNum(t0)) === '7', await rowNum(t0));
  await close(); await page.waitForTimeout(900);   // the save is debounced
  await page.evaluate(() => sessionStorage.setItem('__seeded', '1')); await load();
  need('rating survives a reload', ((await mark(t0)) || {}).r === 7, await mark(t0));
  need('after reload it shows', (await open(A)) && (await rowNum(t0)) === '7', await rowNum(t0));
  const nx = await page.evaluate(() => { const b = document.querySelector('.group.sleeve.gf .gfnx-b.n'); return b ? b.dataset.nx : null; });
  if (nx) { await page.evaluate(() => document.querySelector('.group.sleeve.gf .gfnx-b.n').click()); await page.waitForTimeout(2500); await settle(page);
    need('Next record opens the next album', await page.evaluate(nx => !!(UI.alb && UI.alb.g === nx && document.querySelector('.group.sleeve.gf')), nx), nx); }
  else need('Next record link is there', false);
  await close();
  }
  // library search: type a name, Enter opens that artist
  if (await click('[data-act="lib"]')) {
    const typed = await page.evaluate(() => { const q = document.getElementById('lq'); if (!q) return false; q.focus(); q.value = 'Artist 3'; q.dispatchEvent(new Event('input', { bubbles: true })); return true; });
    await page.waitForTimeout(500);
    if (typed) { await page.evaluate(() => document.getElementById('lq').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))); await page.waitForTimeout(1800); await settle(page); }
    const sel = await page.evaluate(() => { const a = S.music.find(x => x.id === UI.sel.music); return a ? a.name : ''; });
    need('library search opens the artist', typed && sel === 'Bench Artist 3', { typed, sel });
    await page.evaluate(id => { UI.sel.music = id; UI.libOpen = false; render(); }, lib.music[0].id); await page.waitForTimeout(800);
  } else need('library opens', false);
  const SG = process.env.SG || 'a0s0';
  need('7-inch opens', await open(SG));
  await rate(SG + 't0', 6.5); await page.waitForTimeout(1600);
  const lab = () => page.evaluate(() => { const b = document.querySelector('.gf.s7 .s7-lab b:not(.s7-gh)'); return b ? b.textContent.trim() : ''; });
  need('7-inch label shows the score', (await lab()) === '6.5', await lab());
  await close(); need('7-inch reopens with its score', (await open(SG)) && (await lab()) === '6.5', await lab()); await close();
  } catch (e) { fails.push(crashed ? crashed + ' (last step after: ' + (ok[ok.length - 1] || 'start') + ')' : 'stopped: ' + String(e.message).split('\n')[0].slice(0, 160)); }
  await ctx.close().catch(() => {});
  return { kind: 'flows', sleeve: '-', steps: {}, errors, fails, ok };
}

async function stress(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: !IS_WK, hasTouch: true, serviceWorkers: 'block' });
  const lib = library(base);
  await ctx.addInitScript(([st, sel]) => { if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1'); localStorage.clear();
    localStorage.setItem('playback_v1', st); localStorage.setItem('playback_v1_tab', 'music'); localStorage.setItem('playback_v1_sel_music', sel); localStorage.setItem('playback_v1_tour', '1'); }, [JSON.stringify(lib), lib.music[0].id]);
  await ctx.route('**/*', r => { const u = r.request().url(); return u.startsWith(base) || u.startsWith('data:') || u.startsWith('blob:') ? r.continue() : r.abort(); });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  let crashed = ''; page.on('crash', () => { crashed = 'page crashed'; });
  const fails = [], done = [];
  try {
    await page.goto(base + '/index.html', { waitUntil: 'load' }); await page.waitForSelector('.hxsl[data-g]', { timeout: 20000 }); await page.waitForTimeout(1200);
    const tap = async sel => { if (crashed) throw new Error(crashed); const f = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); return true; }, sel); await settle(page); return f; };
    for (let i = 0; i < 4; i++) for (const g of ['a0g7', 'a0g6']) {
      if (!(await tap(`.hxsl[data-g="${g}"]`))) { fails.push('no tile ' + g); continue; }
      if (g === 'a0g7') { const sw = await tap(`.group.sleeve.gf [data-act="dxsel"][data-v="${i % 2 ? 0 : 1}"]`); if (sw) done.push('edition ' + (i % 2 ? 'standard' : 'deluxe')); await page.waitForTimeout(400); }
      await tap('.group.sleeve.gf [data-act="gfclose"]'); await page.waitForTimeout(300); done.push('open/close ' + g);
    }
  } catch (e) { fails.push((crashed || 'stopped') + ' after ' + (done[done.length - 1] || 'start') + (crashed ? '' : ': ' + String(e.message).split('\n')[0].slice(0, 120))); }
  await ctx.close().catch(() => {});
  return { kind: 'stress', sleeve: '-', steps: {}, errors, fails, ok: done };
}

function check(res) {
  const fails = [];
  for (const r of res) {
    if (r.err) fails.push(`${r.kind}: ${r.err}`);
    if (r.kind === 'stress') { for (const f of r.fails) fails.push('stress: ' + f); if (r.errors.length) fails.push(`stress: page errors: ${r.errors.join(' | ')}`); continue; }
    if (r.kind === 'flows') { for (const f of r.fails) fails.push('flows: ' + f); if (r.errors.length) fails.push(`flows: page errors: ${r.errors.join(' | ')}`); continue; }
    if (r.kind === 'pages') { if (r.errors.length) fails.push(`pages: page errors: ${r.errors.join(' | ')}`); continue; }
    for (const k of ['rate:card', 'rate:set', 'rate:done']) { const s = r.steps[k]; if (!s) continue;
      if (s.err) fails.push(`${r.kind} ${k}: ${s.err}`);
      if (s.renders > BUDGET.rateRenders) fails.push(`${r.kind} ${k}: ${s.renders} full render() (budget ${BUDGET.rateRenders})`);
      if (!IS_WK && s.tap > BUDGET.tapMs) fails.push(`${r.kind} ${k}: tap ${s.tap} ms (budget ${BUDGET.tapMs})`); }
    const c = r.steps.close; if (c && !IS_WK && c.block > BUDGET.closeMs) fails.push(`${r.kind} close: ${c.block} ms block (budget ${BUDGET.closeMs})`);
    const o = r.steps.open; if (o && r.kind !== 'safe' && o.layersMB > BUDGET.layersMB) fails.push(`${r.kind} open: ~${o.layersMB} MB layers (budget ${BUDGET.layersMB})`);
    if (r.errors.length) fails.push(`${r.kind}: page errors: ${r.errors.join(' | ')}`);
  }
  return fails;
}

// Static checks on index.html, before any browser: things that have crashed the iPhone before.
function lint() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), out = [];
  const css = html.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g))
    if (/(^|[;{\s])(-webkit-)?(backdrop-)?filter\s*:\s*[^;}]*blur\(/.test(m[2])) out.push(`@keyframes ${m[1]} animates a blur (crashed WebKit on the 7-inch, Nov 28)`);
  for (const m of html.matchAll(/\.animate\(\s*\[[^\]]*filter\s*:\s*['"][^'"]*blur/g)) out.push('a script animation animates a blur: ' + m[0].slice(0, 80));
  return out;
}
const LINT = lint();

const srv = await serve();
const base = 'http://127.0.0.1:' + srv.address().port;
const browser = await ENGINE.launch(IS_WK ? {} : { executablePath: CHROME, args: ['--enable-gpu-benchmarking', '--disable-background-timer-throttling'] });
try {
  await makeCovers(browser);
  const kinds = ONLY ? [ONLY] : ['flows', 'stress', 'album', 'single', 'safe', 'pages'];
  const res = [];
  for (const k of kinds) res.push(await scenario(browser, base, k));
  const fails = [...LINT.map(x => 'lint: ' + x), ...check(res)];
  const build = BUILD;
  if (process.env.JSON) console.log(JSON.stringify({ build, budget: BUDGET, res, fails }, null, 1));
  else {
    console.log(`Playback bench · build ${build} · ${IS_WK ? 'WebKit (no CPU throttle)' : 'Chrome 4x CPU'} · 430x932 @3x · best of ${RUNS}`);
    for (const r of res) {
      if (r.kind === 'stress') { console.log(`\nSTRESS  ${r.ok.length} steps (Deluxe and features albums opened, switched and closed 4 times)${r.fails.length ? ', FAILED' : ''}`); for (const f of r.fails) console.log('  x ' + f); continue; }
    if (r.kind === 'flows') { console.log(`\nFLOWS  ${r.ok.length} passed${r.fails.length ? ', ' + r.fails.length + ' FAILED' : ''}`); for (const f of r.fails) console.log('  x ' + f); continue; }
      console.log(`\n${r.kind.toUpperCase()}  (sleeve patchers: ${r.sleeve})`);
      for (const [k, s] of Object.entries(r.steps)) console.log(`  ${k.padEnd(10)}${process.env.TASKS && s.tasks ? " tasks " + JSON.stringify(s.tasks) : ""} tap ${String(s.tap).padStart(6)} ms  block ${String(s.block).padStart(6)} ms  renders ${s.renders} (${s.renderMs} ms)  worst frame ${s.worstFrame} ms${s.layersMB ? `  layers ~${s.layersMB} MB` : ''}${s.spin ? `  label ${s.spin.turning ? 'turning ' + s.spin.rot : 'still'}${s.spin.old ? ', old score riding out' : ''}` : ''}${s.err ? '  ERR ' + s.err : ''}`);
    }
    console.log(fails.length ? `\nOVER BUDGET (do not push):\n  - ${fails.join('\n  - ')}` : '\nAll budgets met.');
  }
  process.exitCode = fails.length ? 1 : 0;
} finally { await browser.close(); srv.close(); }
