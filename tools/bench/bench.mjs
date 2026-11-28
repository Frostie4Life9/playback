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
  layersMB: 350,    // estimated composited-layer memory, worst moment of the album opening
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
  for (let a = 0; a < 3; a++) {
    const aid = sid('artist', 'bench' + a), groups = [];
    for (let g = 0; g < 8; g++) {
      const gid = 'a' + a + 'g' + g, items = [];
      for (let t = 0; t < 14; t++) items.push({ id: gid + 't' + t, title: 'Song ' + (t + 1) + ' of album ' + (g + 1) });
      groups.push({ id: gid, title: 'Album ' + (g + 1), year: String(2010 + g), kind: 'Studio album', img: base + '/__art/c' + (n++ % 24) + '.jpg', items });
    }
    for (let s = 0; s < 6; s++) {
      const gid = 'a' + a + 's' + s;
      groups.push({ id: gid, title: 'Single ' + (s + 1), year: String(2018 + s), kind: 'Single', img: base + '/__art/c' + (n++ % 24) + '.jpg', items: [{ id: gid + 't0', title: 'Single ' + (s + 1) }] });
    }
    music.push({ id: aid, name: 'Bench Artist ' + (a + 1), groups });
  }
  const marks = {};
  // some history so rings, grooves and averages have something to draw
  for (const g of music[0].groups.slice(0, 4)) g.items.slice(0, 9).forEach((i, k) => { marks[i.id] = { done: true, r: 5 + (k % 5) }; });
  return { v: 1, music, screen: [], marks, flags: { rhAlbums: true, exSeverance: true } };
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
    const openP = step(page, tile);
    if (cdp) for (let i = 0; i < 6; i++) { await page.waitForTimeout(220); const m = await layersMB(cdp, 3); if (m) lmax = Math.max(lmax, m); }
    const open = await openP; open.layersMB = lmax || null; best('open', open);
    if (!(await page.$('.group.sleeve.gf'))) { out.err = 'album did not open'; break; }
    const row = `.group.sleeve.gf .track.sl-t[data-id="${song}"]`;
    best('rate:card', await prof(cdp, 'rate:card', () => step(page, row, { wait: false })));
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
  }
  out.errors = errors;
  await ctx.close();
  return out;
}

function check(res) {
  const fails = [];
  for (const r of res) {
    if (r.err) fails.push(`${r.kind}: ${r.err}`);
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

const srv = await serve();
const base = 'http://127.0.0.1:' + srv.address().port;
const browser = await ENGINE.launch(IS_WK ? {} : { executablePath: CHROME, args: ['--enable-gpu-benchmarking', '--disable-background-timer-throttling'] });
try {
  await makeCovers(browser);
  const kinds = ONLY ? [ONLY] : ['album', 'single', 'safe'];
  const res = [];
  for (const k of kinds) res.push(await scenario(browser, base, k));
  const fails = check(res);
  const build = BUILD;
  if (process.env.JSON) console.log(JSON.stringify({ build, budget: BUDGET, res, fails }, null, 1));
  else {
    console.log(`Playback bench · build ${build} · ${IS_WK ? 'WebKit (no CPU throttle)' : 'Chrome 4x CPU'} · 430x932 @3x · best of ${RUNS}`);
    for (const r of res) {
      console.log(`\n${r.kind.toUpperCase()}  (sleeve patchers: ${r.sleeve})`);
      for (const [k, s] of Object.entries(r.steps)) console.log(`  ${k.padEnd(10)}${process.env.TASKS && s.tasks ? " tasks " + JSON.stringify(s.tasks) : ""} tap ${String(s.tap).padStart(6)} ms  block ${String(s.block).padStart(6)} ms  renders ${s.renders} (${s.renderMs} ms)  worst frame ${s.worstFrame} ms${s.layersMB ? `  layers ~${s.layersMB} MB` : ''}${s.spin ? `  label ${s.spin.turning ? 'turning ' + s.spin.rot : 'still'}${s.spin.old ? ', old score riding out' : ''}` : ''}${s.err ? '  ERR ' + s.err : ''}`);
    }
    console.log(fails.length ? `\nOVER BUDGET (do not push):\n  - ${fails.join('\n  - ')}` : '\nAll budgets met.');
  }
  process.exitCode = fails.length ? 1 : 0;
} finally { await browser.close(); srv.close(); }
