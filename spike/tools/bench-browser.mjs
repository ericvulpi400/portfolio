// Abre o spike no Chromium do Playwright (servidor local), roda o bench e tira prints dos estados.
// uso: node tools/bench-browser.mjs [outdir] [w] [h] [secs]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || 'bench-out'); const W = +(process.argv[3] || 1920), H = +(process.argv[4] || 1080), SECS = +(process.argv[5] || 15);
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const base = `http://127.0.0.1:${port}/renderer/index.html?seed=7`;
await page.goto(base); await page.waitForTimeout(1200);
const shot = async (n) => page.screenshot({ path: path.join(out, n + '.png') });
await shot('01_pacote_fechado');
await page.keyboard.press('Space'); await page.waitForTimeout(700); await shot('02_cartas_espalhadas_brilho');
await page.keyboard.press('Space'); await page.waitForTimeout(160); await shot('03_carta_virando');
await page.evaluate(() => window.__act('prism')); await page.keyboard.press('Space'); await page.waitForTimeout(700);
for (let i = 0; i < 5; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(350); }
await shot('04_pacote_prisma_revelado');
console.log('estado:', await page.evaluate(() => window.render_game_to_text()));
await page.keyboard.press('Space'); await page.waitForTimeout(900); await page.keyboard.press('KeyS'); await page.waitForTimeout(1500); await shot('05_campo_80_unidades');
await page.goto(base + `&bench=1&secs=${SECS}`); await page.waitForFunction(() => window.__benchResult, null, { timeout: (SECS + 30) * 1000 });
const r = await page.evaluate(() => window.__benchResult); await shot('06_bench_fim');
fs.writeFileSync(path.join(out, 'bench.json'), JSON.stringify({ viewport: [W, H], result: r, errors }, null, 2));
console.log(JSON.stringify({ frame: r.frame, cpu: r.cpu, over18ms: r.over18ms, scale: r.scale, units: r.units }, null, 0)); console.log('erros:', errors);
await browser.close(); srv.close();
