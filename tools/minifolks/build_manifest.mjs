#!/usr/bin/env node
// Gera assets/minifolks/manifest.json lendo os arquivos REAIS do pack.
// - .aseprite/.ase: tamanho do canvas, tags (nome da animação, quadros, duração)
// - .png: grade de quadros por linha (conta células não vazias), pivô (pé) e caixa opaca
// Cruza as duas fontes e marca divergências. Nunca chuta contagem de quadros.
// Uso: node tools/minifolks/build_manifest.mjs [pasta=assets/minifolks]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(process.argv[2] || 'assets/minifolks');

// ---------- PNG (RGBA 8 bits, paleta ou cinza) ----------
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('não é PNG');
  let p = 8, w, h, depth, ctype, palette = null, trns = null; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ctype = d[9]; if (d[12]) throw new Error('PNG entrelaçado não suportado'); }
    else if (type === 'PLTE') palette = d;
    else if (type === 'tRNS') trns = d;
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const chans = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  const bpp = Math.max(1, (chans * depth) >> 3), stride = (w * chans * depth + 7) >> 3;
  const out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(stride), q = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[q++], line = Buffer.from(raw.subarray(q, q + stride)); q += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4; let r, g, bl, al = 255;
      const sample = (idx) => depth === 8 ? line[idx] : depth === 16 ? line[idx * 2] : (line[(idx * depth) >> 3] >> (8 - depth - ((idx * depth) & 7))) & ((1 << depth) - 1);
      if (ctype === 6) { r = line[x * 4]; g = line[x * 4 + 1]; bl = line[x * 4 + 2]; al = line[x * 4 + 3]; if (depth !== 8) throw new Error('RGBA16'); }
      else if (ctype === 2) { r = line[x * 3]; g = line[x * 3 + 1]; bl = line[x * 3 + 2]; }
      else if (ctype === 3) { const i = sample(x); r = palette[i * 3]; g = palette[i * 3 + 1]; bl = palette[i * 3 + 2]; al = trns && i < trns.length ? trns[i] : 255; }
      else if (ctype === 0) { r = g = bl = sample(x); }
      else if (ctype === 4) { r = g = bl = line[x * 2]; al = line[x * 2 + 1]; }
      out[o] = r; out[o + 1] = g; out[o + 2] = bl; out[o + 3] = al;
    }
    prev = line;
  }
  return { w, h, data: out };
}

// ---------- Aseprite ----------
function readAse(buf) {
  if (buf.readUInt16LE(4) !== 0xa5e0) throw new Error('não é aseprite');
  const nFrames = buf.readUInt16LE(6), w = buf.readUInt16LE(8), h = buf.readUInt16LE(10);
  let p = 128; const durations = [], tags = [], layers = [], slices = [], opaque = [];
  for (let f = 0; f < nFrames; f++) {
    const fb = buf.readUInt32LE(p); if (buf.readUInt16LE(p + 4) !== 0xf1fa) throw new Error('frame inválido');
    let nChunks = buf.readUInt16LE(p + 6); const dur = buf.readUInt16LE(p + 8), nNew = buf.readUInt32LE(p + 12);
    if (nChunks === 0xffff || nNew) nChunks = nNew || nChunks;
    durations.push(dur); let px = 0;
    let c = p + 16;
    for (let k = 0; k < nChunks; k++) {
      const cs = buf.readUInt32LE(c), ct = buf.readUInt16LE(c + 4), d = c + 6;
      if (ct === 0x2018) { // tags
        const n = buf.readUInt16LE(d); let t = d + 10;
        for (let i = 0; i < n; i++) {
          const from = buf.readUInt16LE(t), to = buf.readUInt16LE(t + 2), dir = buf[t + 4];
          const nl = buf.readUInt16LE(t + 17), name = buf.toString('utf8', t + 19, t + 19 + nl);
          tags.push({ name, from, to, dir }); t += 19 + nl;
        }
      } else if (ct === 0x2005) { // cel: conta pixels opacos (para alinhar com o PNG)
        const type = buf.readUInt16LE(d + 7);
        if (type === 2) { const raw = zlib.inflateSync(buf.subarray(d + 20, c + cs)); for (let i = 3; i < raw.length; i += 4) if (raw[i]) px++; }
        else if (type === 0) { for (let i = d + 20 + 3; i < c + cs; i += 4) if (buf[i]) px++; }
      } else if (ct === 0x2004) { // layer
        const nl = buf.readUInt16LE(d + 16); layers.push({ name: buf.toString('utf8', d + 18, d + 18 + nl), visible: !!(buf.readUInt16LE(d) & 1) });
      } else if (ct === 0x2022) { // slice
        const n = buf.readUInt32LE(d), flags = buf.readUInt32LE(d + 4), nl = buf.readUInt16LE(d + 12);
        const name = buf.toString('utf8', d + 14, d + 14 + nl); let s = d + 14 + nl;
        const keys = [];
        for (let i = 0; i < n; i++) {
          const key = { frame: buf.readUInt32LE(s), x: buf.readInt32LE(s + 4), y: buf.readInt32LE(s + 8), w: buf.readUInt32LE(s + 12), h: buf.readUInt32LE(s + 16) }; s += 20;
          if (flags & 1) s += 16; if (flags & 2) { key.pivot = { x: buf.readInt32LE(s), y: buf.readInt32LE(s + 4) }; s += 8; }
          keys.push(key);
        }
        slices.push({ name, keys });
      }
      c += cs;
    }
    p += fb; opaque.push(px);
  }
  return { w, h, nFrames, durations, tags, layers, slices, opaque };
}

// ---------- análise da folha PNG ----------
function analyseSheet(img, cw, ch) {
  const cols = Math.floor(img.w / cw), rows = Math.floor(img.h / ch), out = [];
  for (let r = 0; r < rows; r++) {
    const frames = []; let last = -1;
    for (let c = 0; c < cols; c++) {
      let minX = cw, minY = ch, maxX = -1, maxY = -1, n = 0;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        if (img.data[((r * ch + y) * img.w + c * cw + x) * 4 + 3] > 0) { n++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      const empty = maxX < 0; frames.push(empty ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, n });
      if (!empty) last = c;
    }
    const used = frames.slice(0, last + 1);
    out.push({ row: r, frames: last + 1, holes: used.filter(f => !f).length, bbox: used.filter(Boolean) });
  }
  return { cols, rows, rowsInfo: out };
}


// Sem .ase: escolhe a célula que divide a imagem e corta menos o desenho (pares de pixels opacos dos dois lados de
// uma borda de célula). Empate → a MENOR célula (a borda de uma célula maior é subconjunto da menor). Calibrado com os
// tamanhos declarados pelo autor: 40x40 (Demon Lord, Goblin King, Raptors), 64x32 (Lizardman Brute/Warlord).
function inferCell(img) {
  const op = (x, y) => img.data[(y * img.w + x) * 4 + 3] > 0;
  const cands = [[32, 32], [40, 40], [48, 48], [64, 64], [64, 32], [16, 16]].filter(([w, h]) => img.w % w === 0 && img.h % h === 0);
  let best = null;
  for (const [w, h] of cands) {
    let cut = 0;
    for (let x = w; x < img.w; x += w) for (let y = 0; y < img.h; y++) if (op(x - 1, y) && op(x, y)) cut++;
    for (let y = h; y < img.h; y += h) for (let x = 0; x < img.w; x++) if (op(x, y - 1) && op(x, y)) cut++;
    const score = cut * 1e6 + w * h;
    if (!best || score < best.score) best = { w, h, score, cut };
  }
  return best ? [best.w, best.h] : [32, 32];
}

function rows_check(nm, sheet) { const got = sheet.rowsInfo.filter(r => r.frames).map(r => r.frames); return got.length !== nm.contagens.length || got.some((v, i) => v !== nm.contagens[i]); }

// Nomes de tag do autor -> ação canônica do jogo (só quando existe de fato)
const CANON = [
  [/^idle/i, 'idle'], [/^walk\s*2|^walk2/i, 'walk2'], [/^walk\s*\/?\s*jump|^walk/i, 'walk'], [/^run/i, 'walk'], [/^jump/i, 'jump'], [/^flight|^fly/i, 'fly'],
  [/^attack\s*melee/i, 'attack_melee'], [/^attack\s*throw|^throw/i, 'throw'], [/^attack\s*2|^attack2/i, 'attack2'], [/^attack\s*3|^attack3/i, 'attack3'], [/^attack/i, 'attack'],
  [/^spell\s*2|^spell2/i, 'spell2'], [/^spell|^cast|^magic/i, 'spell'], [/^block|^defen/i, 'block'], [/^warcry|^war cry|^roar/i, 'warcry'], [/^rage/i, 'rage'],
  [/^hit|^hurt|^damage/i, 'hit'], [/^death|^die|^dead/i, 'death'], [/^rising|^rise/i, 'rising'], [/^get\s*up/i, 'getup'], [/^barrel/i, 'barrel'], [/^rotation/i, 'rotate'],
];
const canon = (n) => { for (const [re, v] of CANON) if (re.test(n.trim())) return v; return n.trim().toLowerCase().replace(/\W+/g, '_'); };

const norm = (s) => s.toLowerCase().replace(/^mini/, '').replace(/\.(png|aseprite|ase)$/, '').replace(/[^a-z0-9]/g, '').replace(/test$/, '').replace(/man$/, '').replace(/b$/, '');
function walk(dir, acc = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, acc); else acc.push(p); } return acc; }

const NOMES = (() => { try { return JSON.parse(fs.readFileSync(new URL('./nomes_linhas.json', import.meta.url), 'utf8')); } catch { return {}; } })();
function nomesPara(pack, key) {
  if (NOMES[`${pack}/${key}`]) return NOMES[`${pack}/${key}`];
  for (const [k, v] of Object.entries(NOMES)) if (v.variantes && k.startsWith(pack + '/')) for (const suf of v.variantes) if (k + suf === `${pack}/${key}`) return v;
  return null;
}
const files = walk(ROOT).filter(f => /\.(png|aseprite|ase)$/i.test(f));
const packs = {};
for (const f of files) { const pack = path.relative(ROOT, f).split(path.sep)[0]; (packs[pack] ||= []).push(f); }

const manifest = { generated: new Date().toISOString(), root: path.relative(process.cwd(), ROOT), note: 'Gerado por tools/minifolks/build_manifest.mjs a partir dos arquivos reais. Não editar à mão.', packs: {} }; const issues = [];
for (const [pack, list] of Object.entries(packs).sort()) {
  const ases = list.filter(f => /\.(aseprite|ase)$/i.test(f)), pngs = list.filter(f => /\.png$/i.test(f));
  const chars = {};
  for (const a of ases) {
    const key = norm(path.basename(a)); let info;
    try { info = readAse(fs.readFileSync(a)); } catch (e) { issues.push(`${a}: ${e.message}`); continue; }
    chars[key] = { ...(chars[key] || {}), ase: path.relative(ROOT, a), cell: { w: info.w, h: info.h }, aseFrames: info.nFrames, tags: info.tags, durations: info.durations, opaque: info.opaque, slices: info.slices, layers: info.layers.map(l => l.name) };
  }
  for (const p of pngs) {
    const key = norm(path.basename(p)); const rel = path.relative(ROOT, p).split(path.sep);
    const variant = rel.slice(1, -1).filter(s => !/^\d+$/.test(s) && !/^minifolks/i.test(s)).join('/') || 'default';
    (chars[key] ||= {}).pngs ||= {}; chars[key].pngs[variant] = path.relative(ROOT, p);
  }
  const outChars = {};
  for (const [key, c] of Object.entries(chars)) {
    if (!c.pngs) { issues.push(`${pack}/${key}: tem .ase mas nenhum PNG`); continue; }
    const pngPath = path.join(ROOT, c.pngs[Object.keys(c.pngs).find(v => /outline/i.test(v) && !/without/i.test(v)) || Object.keys(c.pngs)[0]]);
    const img = decodePNG(fs.readFileSync(pngPath));
    // tamanho da célula: do .ase; sem .ase, tenta 32/40/48/64 que divide a imagem e dá linhas consistentes
    let cw = c.cell?.w, ch = c.cell?.h;
    if (!cw) { [cw, ch] = inferCell(img); issues.push(`info ${pack}/${key}: sem .ase, célula inferida ${cw}x${ch} (menos pixels cortados pelas bordas de célula)`); }
    const sheet = analyseSheet(img, cw, ch);
    const rowsN = sheet.rowsInfo.filter(r => r.frames).length;
    let tags = c.tags || []; const nmAll = nomesPara(pack, key);
    // .ase com número de tags diferente do PNG: se a lista do autor/visual bate com o PNG, ela manda
    if (tags.length && tags.length !== rowsN && nmAll && nmAll.contagens && !rows_check(nmAll, sheet)) { issues.push(`info ${pack}/${key}: tags do .ase (${tags.length}) ≠ linhas do PNG (${rowsN}); usada a lista '${nmAll.fonte}'`); tags = []; }
    const anims = {}; const nm = !tags.length ? nmAll : null;
    if (nm && nm.contagens && rows_check(nm, sheet)) issues.push(`${pack}/${key}: contagens da fonte (${nm.contagens.join(',')}) diferem do PNG (${sheet.rowsInfo.filter(r => r.frames).map(r => r.frames).join(',')})`);
    const rows = sheet.rowsInfo.filter(r => r.frames > 0);
    if (tags.length && tags.length !== rows.length) issues.push(`${pack}/${key}: ${tags.length} tags no .ase x ${rows.length} linhas não vazias no PNG`);
    if (tags.length && nmAll && nmAll.linhas && nmAll.linhas.length === tags.length) {
      const a = tags.map(t => canon(t.name)), b = nmAll.linhas; const diff = a.map((x, i) => x !== b[i] ? `${i}:${b[i]}→${x}` : null).filter(Boolean);
      if (diff.length) issues.push(`info-nomes ${pack}/${key}: ${diff.join(' ')}`);
    }
    rows.forEach((r, i) => {
      const tag = tags[i]; const name = tag ? tag.name : nm && nm.linhas[i] ? nm.linhas[i] : `row${r.row}`; let id = tag ? canon(name) : name;
      while (anims[id]) id += '_b';
      const aseCount = tag ? tag.to - tag.from + 1 : null;
      if (r.holes) issues.push(`${pack}/${key}/${name}: ${r.holes} célula(s) vazia(s) no meio da linha`);
      // O PNG exportado é a verdade (é o que o jogo desenha). A tag do .ase às vezes inclui quadros de "respiro"
      // nas bordas; alinhamos pela contagem de pixels opacos para achar a duração certa de cada quadro do PNG.
      let dur = null, aseOffset = null;
      if (tag && aseCount >= r.frames) {
        const sig = r.bbox.map(b => b.n); let best = Infinity;
        for (let o = 0; o <= aseCount - r.frames; o++) {
          let err = 0; for (let i = 0; i < r.frames; i++) err += Math.abs((c.opaque[tag.from + o + i] || 0) - (sig[i] || 0)) > 3 ? 1 : 0;
          if (err < best) { best = err; aseOffset = o; }
        }
        dur = c.durations.slice(tag.from + aseOffset, tag.from + aseOffset + r.frames);
        if (aseCount !== r.frames) issues.push(`info ${pack}/${key}/${name}: tag .ase ${aseCount} quadros, PNG ${r.frames} (usado o PNG, offset ${aseOffset}, ${best} quadro(s) sem casar)`);
      } else if (tag) issues.push(`${pack}/${key}/${name}: PNG tem MAIS quadros (${r.frames}) que a tag .ase (${aseCount}); durações omitidas`);
      const feet = Math.max(...r.bbox.map(b => b.y + b.h));
      anims[id] = { source: name, row: r.row, frames: r.frames, ms: dur, loop: /idle|walk|fly|rotate/.test(id) };
      anims[id].footY = feet; // linha (0-based, exclusiva) onde o pé toca o chão neste quadro-base
    });
    const idleB = sheet.rowsInfo.find(r => r.frames)?.bbox || [];
    const ux = Math.min(...idleB.map(b => b.x)), uy = Math.min(...idleB.map(b => b.y)), ux2 = Math.max(...idleB.map(b => b.x + b.w)), uy2 = Math.max(...idleB.map(b => b.y + b.h));
    const cx = Math.round((ux + ux2) / 2);
    outChars[key] = {
      name: path.basename(pngPath).replace(/\.png$/i, '').replace(/^Mini/, ''), cell: { w: cw, h: ch }, sheet: { cols: sheet.cols, rows: sheet.rows, w: img.w, h: img.h },
      pivot: { x: cx, y: uy2, rule: 'centro horizontal e base da caixa opaca do idle' }, idleBox: { x: ux, y: uy, w: ux2 - ux, h: uy2 - uy },
      kind: nm && nm.tipo ? nm.tipo : (!tags.length && !nm) ? 'pendente' : Object.keys(anims).length <= 1 || !anims.idle ? 'prop' : 'character',
      names: tags.length ? 'aseprite' : nm ? nm.fonte : 'a_confirmar', ...(nm && nm.nota ? { note: nm.nota } : {}), heavy: cw > 32 || ch > 32, files: { pngs: c.pngs, ase: c.ase || null }, actions: Object.keys(anims), anims,
    };
  }
  manifest.packs[pack] = { characters: outChars, count: Object.keys(outChars).length };
}
manifest.issues = issues;
const out = path.join(ROOT, 'manifest.json');
fs.writeFileSync(out, JSON.stringify(manifest, null, 1));
let total = 0; for (const [k, v] of Object.entries(manifest.packs)) { total += v.count; console.log(`${k}: ${v.count} personagens`); }
console.log(`total ${total} personagens; ${issues.length} avisos -> ${path.relative(process.cwd(), out)}`);
const real = issues.filter(i => !i.startsWith('info ')); console.log(`  (${issues.length - real.length} avisos informativos de alinhamento .ase/PNG)`);
for (const i of real.slice(0, 60)) console.log('  ! ' + i);
