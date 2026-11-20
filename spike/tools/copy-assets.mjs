// Copia para spike/assets/ só o que o spike usa: manifest.json + PNGs com contorno (pasta ignorada pelo Git).
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const SRC = path.resolve(here, '../../assets/minifolks'), DST = path.resolve(here, '../assets');
const m = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
fs.rmSync(DST, { recursive: true, force: true }); fs.mkdirSync(path.join(DST, 'minifolks'), { recursive: true });
let n = 0;
for (const p of Object.values(m.packs)) for (const c of Object.values(p.characters)) for (const [v, rel] of Object.entries(c.files.pngs)) {
  if (!/outline/i.test(v) || /without/i.test(v) || /blue/i.test(v)) continue;
  const d = path.join(DST, 'minifolks', rel); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(SRC, rel), d); n++;
}
fs.copyFileSync(path.join(SRC, 'manifest.json'), path.join(DST, 'manifest.json'));
console.log(`copiados ${n} PNGs + manifest para ${path.relative(process.cwd(), DST)}`);
