// Renderiza os mockups (tools/mockups/index.html) em docs/mockups/*.png a 3x. uso: node tools/mockups/render.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../..'); const OUT = path.join(ROOT, 'docs/mockups'); fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(0);
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 760 }, deviceScaleFactor: 1 });
const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto(`http://127.0.0.1:${srv.address().port}/tools/mockups/index.html`);
console.log('escala das fontes:', JSON.stringify(await pg.evaluate(() => window.ready)));
for (const n of ['preparacao', 'abertura', 'prisma', 'combate', 'catalogo', 'cartas']) {
  await pg.evaluate((n) => window.renderScene(n, 3), n);
  await (await pg.$('#out')).screenshot({ path: path.join(OUT, n + '.png') }); console.log('docs/mockups/' + n + '.png');
}
if (errs.length) console.log('ERROS:', errs);
await b.close(); srv.close();
