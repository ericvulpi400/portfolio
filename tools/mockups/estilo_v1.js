// Teste de estilo v1 (docs/DIRECAO_DE_ARTE.md): a feira é a moldura. 480x270 lógicos, escala inteira, paleta em rampas,
// luz do alto à esquerda, sem transparência. Gera: preparação e carta (pequena + detalhe).
'use strict';
const W = 480, H = 270;
// ---------- paleta em rampas (escuro -> claro) ----------
const RP = {
  noite: ['#1a1420', '#2a1f2e', '#3d2c3e', '#55405a', '#7a6380'],
  madeira: ['#2b1a12', '#4a2c1c', '#6e4528', '#9a6838', '#c79a5c'],
  balcao: ['#3a2416', '#5a3a22', '#8a5a32', '#b37d45', '#e0b070'],
  lona: ['#4a1418', '#7a2025', '#b03a32', '#d9604a', '#f08a6a'],
  creme: ['#6a5a44', '#9c8a6a', '#cdbb92', '#eadfbe', '#fff6dc'],
  latao: ['#4a3010', '#7a5418', '#b58428', '#e0b440', '#fff0a0'],
  papel: ['#5c4a32', '#8f7a56', '#c9b58a', '#e8dbb4', '#fbf3d8'],
  pedra: ['#2e2c36', '#4a4752', '#6e6a76', '#9893a0', '#c6c1cc'],
  folha: ['#16301e', '#2a5228', '#437a32', '#6fa842', '#a8d464'],
  ceu: ['#3e5c9c', '#5078c0', '#6e9ad8', '#98c0ea', '#cfe6f6'],
  nuvem: ['#8aa6c8', '#b4c8e0', '#dce8f2', '#f4f8fc', '#ffffff'],
  terra: ['#3a2618', '#5e3e26', '#84603a', '#a8824e', '#cfae74'],
  grama: ['#23441e', '#33652a', '#4a8834', '#6cab42', '#9ccc5c'],
  sol: ['#e08a2a', '#f0b040', '#ffd860', '#fff09a', '#fffbe0'],
  comum: ['#2e2836', '#4e4558', '#7a6e88', '#a89cb6', '#d4cce0'],
  incomum: ['#16361c', '#2a6030', '#45964a', '#7cc864', '#bfeea0'],
  rara: ['#122a56', '#1f4a8a', '#3a78cc', '#6fb0f0', '#b8e0ff'],
  epica: ['#2a1450', '#4a2a7a', '#7a48c0', '#ae7ef0', '#dcc0ff'],
  lendaria: ['#4a2a08', '#7a4a10', '#c88a22', '#f0c040', '#fff0a0'],
  tapete_a: ['#3a1a2a', '#6a2a44', '#9a3e5c', '#c4627c', '#e898a8'],
  tapete_b: ['#16303a', '#245264', '#36788c', '#5aa2b0', '#9ad0d4'],
};
const INK = '#140e12', TINTA = '#3a2a1e', CLARO = '#fff6dc';
const CICLO = ['#d9604a', '#f0b040', '#ffd860', '#7cc864', '#6fb0f0', '#ae7ef0', '#e898a8'];

let M, D = {}, T = {}; const IMG = {};
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const out = document.getElementById('out'); const og = out.getContext('2d');

// ---------- primitivas ----------
const R = (x, y, w, h, c) => { if (w <= 0 || h <= 0) return; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const P = (x, y, c) => R(x, y, 1, 1, c);
let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
function dither(x, y, w, h, c, t) { g.fillStyle = c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (BAYER[(y + j) & 3][(x + i) & 3] < t * 16) g.fillRect(x + i, y + j, 1, 1); }
const PALETA = (() => { const L = []; const add = (h) => L.push([parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]); for (const r of Object.values(RP)) r.forEach(add); [INK, TINTA, CLARO].forEach(add); return L; })();
function shade(x, y, w, h, f) { const id = g.getImageData(x, y, w, h), d = id.data, cache = new Map();
  for (let i = 0; i < d.length; i += 4) { const r = d[i] * f, gg = d[i + 1] * f * 0.95, b = d[i + 2] * f * 1.15; const k = (r >> 3) << 10 | (gg >> 3) << 5 | (b >> 3); let c = cache.get(k);
    if (!c) { let best = 1e9; for (const p of PALETA) { const e = (p[0] - r) ** 2 + (p[1] - gg) ** 2 + (p[2] - b) ** 2; if (e < best) { best = e; c = p; } } cache.set(k, c); } d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
  g.putImageData(id, x, y); }
function circle(cx, cy, r, c) { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); R(cx - w, cy + y, w * 2 + 1, 1, c); } }
function ellipse(cx, cy, rx, ry, c) { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))); R(cx - w, cy + y, w * 2 + 1, 1, c); } }
// painel com relevo: contorno, luz em cima/esq, sombra embaixo/dir, cantos chanfrados
function bevel(x, y, w, h, rp, o = {}) {
  const c = o.cut ?? 1;
  R(x + c, y, w - 2 * c, h, rp[0]); R(x, y + c, w, h - 2 * c, rp[0]);
  R(x + 1, y + 1, w - 2, h - 2, rp[o.fill ?? 2]);
  R(x + 1, y + 1, w - 2, 1, rp[o.lite ?? 3]); R(x + 1, y + 1, 1, h - 2, rp[o.lite ?? 3]);
  R(x + 1, y + h - 2, w - 2, 1, rp[1]); R(x + w - 2, y + 1, 1, h - 2, rp[1]);
  if (o.inset) { R(x + 3, y + 3, w - 6, h - 6, rp[1]); R(x + 4, y + 4, w - 8, h - 8, rp[o.insetFill ?? 0]); R(x + 4, y + h - 5, w - 8, 1, rp[1]); }
}
function plank(x, y, w, h, rp, s = 1) { // madeira com veio em aglomerados e nós
  R(x, y, w, h, rp[0]); R(x + 1, y + 1, w - 2, h - 2, rp[2]);
  seed = s * 977; for (let i = 0; i < Math.floor(w * h / 40); i++) { const gx = x + 2 + Math.floor(rnd() * (w - 6)), gy = y + 2 + Math.floor(rnd() * (h - 4)); const L = 3 + Math.floor(rnd() * 8); R(gx, gy, Math.min(L, x + w - 2 - gx), 1, rnd() < 0.6 ? rp[1] : rp[3]); }
  if (w > 20) { const kx = x + 6 + Math.floor(rnd() * (w - 14)), ky = y + Math.floor(h / 2); R(kx, ky - 1, 3, 3, rp[1]); P(kx + 1, ky, rp[0]); }
  R(x + 1, y + 1, w - 2, 1, rp[3]); R(x + 1, y + h - 2, w - 2, 1, rp[1]);
}
function nail(x, y) { P(x, y, RP.latao[3]); P(x + 1, y, RP.latao[2]); P(x, y + 1, RP.latao[2]); P(x + 1, y + 1, RP.latao[0]); }
function rope(x1, y1, x2, y2) { const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let i = 0; i <= n; i++) { const x = Math.round(x1 + (x2 - x1) * i / n), y = Math.round(y1 + (y2 - y1) * i / n); P(x, y, i % 3 ? RP.creme[1] : RP.creme[2]); } }
// sombra elíptica no chão (pontilhado da cor mais escura do chão)
function shadow(cx, cy, rx, rp = RP.grama) { ellipse(cx, cy, rx, 2, rp[1]); }

// ---------- texto pixel (m5x7 16/32 px, binarizado) com acentos compostos ----------
const FONT = { p: { px: 16 }, g: { px: 32 } };
const tcv = document.createElement('canvas'), tg = tcv.getContext('2d', { willReadFrequently: true }); const TC = new Map(); const TOP = {};
function textImg(s, f, color) { const k = s + f + color; if (TC.has(k)) return TC.get(k); const F = FONT[f]; tg.font = `${F.px}px m5x7`; const w = Math.ceil(tg.measureText(s).width) + 2;
  tcv.width = Math.max(1, w); tcv.height = F.px + 8; tg.font = `${F.px}px m5x7`; tg.textBaseline = 'top'; tg.fillStyle = '#000'; tg.fillText(s, 0, 0);
  const id = tg.getImageData(0, 0, tcv.width, tcv.height); const [r, gg, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  for (let i = 0; i < id.data.length; i += 4) { const a = id.data[i + 3] > 110 ? 255 : 0; id.data[i] = r; id.data[i + 1] = gg; id.data[i + 2] = b; id.data[i + 3] = a; }
  const c = document.createElement('canvas'); c.width = tcv.width; c.height = tcv.height; c.getContext('2d').putImageData(id, 0, 0); const res = { c, w: tcv.width }; TC.set(k, res); return res; }
const AC = { '́': [[1, -2], [2, -3]], '̀': [[1, -3], [2, -2]], '̂': [[0, -2], [1, -3], [2, -2]], '̃': [[0, -2], [1, -3], [2, -2], [3, -3]], '̧': [[1, 7], [2, 8], [1, 8]] };
function txt(s, x, y, color = CLARO, f = 'p', sh = INK, align = 'left', outline = false) {
  s = String(s); let base = '', marks = [];
  for (const ch of [...s.normalize('NFD')]) { if (AC[ch]) marks.push([base.length - 1, ch, base[base.length - 1]]); else base += ch; }
  const t = textImg(base, f, color); const w = t.w - 2; const sc = f === 'g' ? 2 : 1;
  if (align === 'center') x -= Math.round(w / 2); else if (align === 'right') x -= w; x = Math.round(x); const yy = Math.round(y) - TOP[f];
  if (outline) { const o = textImg(base, f, sh); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) g.drawImage(o.c, x + dx, yy + dy); }
  else if (sh) { const o = textImg(base, f, sh); g.drawImage(o.c, x + 1, yy + 1); }
  g.drawImage(t.c, x, yy);
  if (marks.length) { tg.font = `${FONT[f].px}px m5x7`; for (const [i, m, b] of marks) { const px = x + Math.round(tg.measureText(base.slice(0, i)).width); const cw = Math.round(tg.measureText(b).width); const up = b === b.toUpperCase();
    for (const [dx, dy] of AC[m]) { const ax = px + Math.floor((cw - 4 * sc) / 2) + dx * sc, ay = Math.round(y) + (up ? 0 : 2 * sc) + dy * sc; if (sh) R(ax + 1, ay + 1, sc, sc, sh); R(ax, ay, sc, sc, color); } } }
  return w;
}
function calibrate() { for (const f of Object.keys(FONT)) { tcv.width = 80; tcv.height = 60; tg.font = `${FONT[f].px}px m5x7`; tg.textBaseline = 'top'; tg.clearRect(0, 0, 80, 60); tg.fillText('H', 2, 2);
  const d = tg.getImageData(0, 0, 80, 60).data; let top = 99; for (let y = 0; y < 60; y++) for (let x = 0; x < 80; x++) if (d[(y * 80 + x) * 4 + 3] > 110) top = Math.min(top, y); TOP[f] = top - 2; } }
const tw = (s, f = 'p') => { tg.font = `${FONT[f].px}px m5x7`; return Math.round(tg.measureText(s.normalize('NFD').replace(/[̀-ͯ]/g, '')).width); };

// ---------- ícones desenhados à mão (letra -> cor) com contorno de adesivo opcional ----------
const IC = {
  moeda: { m: { k: RP.latao[0], d: RP.latao[1], m: RP.latao[2], l: RP.latao[3], w: RP.latao[4] }, b: ['..kkkkk..', '.kllllmk.', 'klwlllmdk', 'klwmkmmdk', 'kllmkmmdk', 'klmmkmmdk', 'kmmmmmddk', '.kdddddk.', '..kkkkk..'] },
  coracao: { m: { k: RP.lona[0], d: RP.lona[1], m: RP.lona[2], l: RP.lona[3], w: RP.lona[4] }, b: ['.kk...kk.', 'kwlk.kmmk', 'klmmkmmdk', 'kmmmmmmdk', 'kmmmmmddk', '.kmmmddk.', '..kmddk..', '...kdk...', '....k....'] },
  lupa: { m: { k: INK, d: RP.madeira[2], g: RP.ceu[3], w: CLARO, m: RP.pedra[3] }, b: ['.kkkk....', 'kmwggk...', 'kwggmk...', 'kggggk...', 'kmggmk...', '.kkkkdk..', '.....kdk.', '......kdk', '.......k.'] },
  carimbo: { m: { k: INK, d: RP.madeira[1], m: RP.madeira[3], r: RP.lona[2], l: RP.madeira[4] }, b: ['...kkk...', '..kmlmk..', '..kmmdk..', '...kmk...', '...kdk...', '.kkkkkkk.', 'kllmmmmdk', 'krrrrrrrk', '.kkkkkkk.'] },
  troca: { m: { k: INK, a: RP.rara[3], b: RP.rara[2] }, b: ['..kkkkk..', '.kaaaaak.', 'kak...kk.', 'kk....kak', '.......k.', '.k.......', 'kak....kk', '.kk...kak', '..kkkkk..'] },
  lacre: { m: { k: RP.lona[0], m: RP.lona[2], l: RP.lona[3], d: RP.lona[1] }, b: ['..kkkkk..', '.kllmmdk.', 'klmmmmmdk', 'kmmkmkmdk', 'kmmmkmmdk', 'kmmkmkmdk', 'kmmmmmddk', '.kddddkk.', '..kkkkk..'] },
  sino: { m: { k: RP.latao[0], d: RP.latao[1], m: RP.latao[2], l: RP.latao[3], w: RP.latao[4] }, b: ['....k....', '...klk...', '..klwmk..', '..klmmk..', '.klmmmdk.', '.klmmmdk.', 'klmmmmmdk', 'kkkkkkkkk', '...kdk...'] },
  escudo: { m: { k: INK, m: RP.pedra[3], l: RP.pedra[4], d: RP.pedra[2] }, b: ['kkkkkkk', 'kllmmdk', 'klmmmdk', 'kmmmmdk', '.kmmdk.', '..kdk..', '...k...'] },
  espada: { m: { k: INK, m: RP.pedra[3], l: RP.pedra[4], h: RP.madeira[3] }, b: ['.....kk', '....klk', '...klk.', 'k.klk..', '.kmk...', '.hk....', 'h.k....'] },
  arco: { m: { k: INK, h: RP.madeira[3], s: RP.creme[3] }, b: ['..khk..', '.kh.s..', 'kh..s..', 'kh..s..', 'kh..s..', '.kh.s..', '..khk..'] },
  bomba: { m: { k: INK, m: RP.noite[3], l: RP.noite[4], f: RP.sol[2] }, b: ['.....f.', '....k..', '..kkk..', '.kllmk.', 'kllmmmk', 'kmmmmmk', '.kkkkk.'] },
  cavalo: { m: { k: INK, m: RP.madeira[3], l: RP.madeira[4] }, b: ['...kk..', '..klmk.', '.klmmk.', 'kmkmmk.', '...kmmk', '...kmmk', '...k..k'] },
  punho: { m: { k: INK, m: RP.creme[3], d: RP.creme[2] }, b: ['.kkkkk.', 'kmmmmmk', 'kmkmkmk', 'kmmmmmk', 'kddmmdk', '.kmmmk.', '..kkk..'] },
  coroa: { m: { k: INK, m: RP.latao[3], d: RP.latao[2] }, b: ['k.k.k.k', 'kmkmkmk', 'kmmmmmk', 'kmdmdmk', 'kmmmmmk', 'kkkkkkk', '.......'] },
  humanos: { m: { k: INK, m: RP.rara[3], d: RP.rara[2] }, b: ['kkkkkkk', 'kmmdmmk', 'kmmdmmk', 'kdddddk', '.kmdmk.', '..kdk..', '...k...'] },
  anoes: { m: { k: INK, m: RP.latao[3], d: RP.latao[2], b: RP.creme[3] }, b: ['.kkkkk.', 'kmmmmmk', 'kdkmkdk', 'kbbbbbk', 'kbbbbbk', '.kbbbk.', '..kkk..'] },
  elfos: { m: { k: INK, m: RP.folha[3], d: RP.folha[2] }, b: ['.....kk', '...kkmk', '..kmmdk', '.kmmdk.', 'kmmdk..', 'kddk...', 'kk.....'] },
  aldeoes: { m: { k: INK, r: RP.lona[2], w: RP.creme[3], d: RP.madeira[3] }, b: ['...k...', '..krk..', '.krrrk.', 'krrrrrk', '.kwwwk.', '.kwdwk.', '.kkkkk.'] },
};
const icCache = new Map();
function icon(name, x, y, sticker = false, sc = 1) {
  const key = name + sticker; let c = icCache.get(key);
  if (!c) { const d = IC[name]; const h = d.b.length, w = d.b[0].length; c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2; const q = c.getContext('2d');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const ch = d.b[j][i]; if (ch !== '.') { q.fillStyle = d.m[ch]; q.fillRect(i + 1, j + 1, 1, 1); } }
    if (sticker) { const id = q.getImageData(0, 0, w + 2, h + 2); const a = (i, j) => i >= 0 && j >= 0 && i < w + 2 && j < h + 2 && id.data[(j * (w + 2) + i) * 4 + 3] > 0; q.fillStyle = CLARO;
      for (let j = 0; j < h + 2; j++) for (let i = 0; i < w + 2; i++) if (!a(i, j) && (a(i - 1, j) || a(i + 1, j) || a(i, j - 1) || a(i, j + 1))) q.fillRect(i, j, 1, 1); }
    icCache.set(key, c); }
  g.drawImage(c, 0, 0, c.width, c.height, x - 1, y - 1, c.width * sc, c.height * sc); return c.width - 2;
}

// ---------- sprites MiniFolks ----------
const sp = (ref) => { const [pk, k] = ref.split('/'); return M.packs[pk].characters[k]; };
function loadImg(src) { return new Promise((res, rej) => { if (IMG[src]) return res(IMG[src]); const i = new Image(); i.onload = () => { IMG[src] = i; res(i); }; i.onerror = () => rej(new Error(src)); i.src = src; }); }
async function preload(refs) { for (const ref of refs) { const c = sp(ref); const v = Object.keys(c.files.pngs).find(v => /outline/i.test(v) && !/without/i.test(v)) || Object.keys(c.files.pngs)[0]; c._src = '../../assets/minifolks/' + c.files.pngs[v]; await loadImg(c._src); } }
function spr(ref, anim, frame, x, y, k = 1, flip = false, sh = true) {
  const c = sp(ref); const A = c.anims[anim] || c.anims.idle; const img = IMG[c._src]; const f = Math.min(frame, A.frames - 1); const cw = c.cell.w, ch = c.cell.h;
  if (sh) shadow(Math.round(x), Math.round(y), 5 * k);
  const dx = Math.round(x - c.pivot.x * k), dy = Math.round(y - c.pivot.y * k);
  if (flip) { g.save(); g.translate(dx + cw * k, dy); g.scale(-1, 1); g.drawImage(img, f * cw, A.row * ch, cw, ch, 0, 0, cw * k, ch * k); g.restore(); }
  else g.drawImage(img, f * cw, A.row * ch, cw, ch, dx, dy, cw * k, ch * k);
}

// ---------- cenário pintado: Vale da Estrada Velha ----------
function sky(x0, y0, w, h) {
  const bands = [[RP.ceu[1], 0.0], [RP.ceu[2], 0.28], [RP.ceu[3], 0.58], [RP.ceu[4], 0.86]];
  for (let i = 0; i < bands.length; i++) { const y1 = y0 + Math.round(bands[i][1] * h), y2 = i + 1 < bands.length ? y0 + Math.round(bands[i + 1][1] * h) : y0 + h; R(x0, y1, w, y2 - y1, bands[i][0]); if (i + 1 < bands.length) { dither(x0, y2 - 4, w, 4, bands[i + 1][0], 0.5); dither(x0, y2, w, 3, bands[i][0], 0.25); } }
}
function sun(cx, cy) { circle(cx, cy, 26, RP.sol[3]); circle(cx, cy, 23, RP.sol[4]); dither(cx - 26, cy - 26, 53, 53, RP.ceu[3], 0); }
function cloud(cx, cy, s) {
  seed = cx * 31 + cy; const puffs = []; for (let i = 0; i < 6 + s; i++) puffs.push([cx + Math.round((rnd() - 0.5) * s * 9), cy - Math.round(rnd() * s * 2), 4 + Math.round(rnd() * s * 1.6)]);
  for (const [x, y, r] of puffs) circle(x, y + 1, r + 1, RP.nuvem[1]);
  for (const [x, y, r] of puffs) circle(x, y, r, RP.nuvem[3]);
  for (const [x, y, r] of puffs) circle(x - 1, y - 1, Math.max(1, r - 2), RP.nuvem[4]);
  const minX = Math.min(...puffs.map(p => p[0] - p[2])), maxX = Math.max(...puffs.map(p => p[0] + p[2])); R(minX, cy + 2, maxX - minX, 3, RP.nuvem[2]); R(minX + 2, cy + 5, maxX - minX - 4, 1, RP.nuvem[1]);
}
function hills(y, amp, rp, sd) { seed = sd; let h = 0; for (let x = 0; x < W; x++) { h += (rnd() - 0.5) * 2; h = Math.max(-amp, Math.min(amp, h * 0.97 + Math.sin((x + sd) / 37) * 0.6)); const top = Math.round(y - amp - h - Math.sin((x + sd) / 61) * amp * 0.6); R(x, top, 1, H - top, rp[1]); P(x, top, rp[2]); } }
function bricks(x, y, w, h, lit) { // parede de pedra: blocos de 6x4 com junta, face iluminada ou de sombra
  const rp = RP.pedra; R(x, y, w, h, lit ? rp[2] : rp[1]);
  for (let j = 0; j < h; j += 4) { const off = (j / 4) % 2 ? 3 : 0; R(x, y + j + 3, w, 1, lit ? rp[1] : rp[0]); for (let i = -off; i < w; i += 6) { if (x + i + 5 < x + w && i + 5 >= 0) R(x + i + 5, y + j, 1, 3, lit ? rp[1] : rp[0]); if (lit && i >= 0) R(x + i, y + j, Math.min(4, w - i), 1, rp[3]); } }
}
function tower(x, y, w, h, broken = 0) {
  bricks(x, y, w - 4, h, true); bricks(x + w - 4, y, 4, h, false); R(x, y - 1, w, 1, RP.pedra[0]); R(x - 1, y, 1, h, RP.pedra[0]);
  for (let i = 0; i < w; i += 6) { if (broken && i > w * 0.5) break; bricks(x + i, y - 4, 4, 4, true); R(x + i, y - 5, 4, 1, RP.pedra[0]); P(x + i, y - 4, RP.pedra[4]); }
  R(x + Math.floor(w / 2) - 3, y + h - 12, 6, 12, RP.noite[0]); R(x + Math.floor(w / 2) - 2, y + h - 13, 4, 1, RP.noite[0]); // arco/porta
  R(x + 4, y + 8, 3, 5, RP.noite[1]); // seteira
  seed = x; for (let i = 0; i < 10; i++) circle(x + 1 + Math.floor(rnd() * 6), y + 4 + Math.floor(rnd() * h * 0.6), 1 + Math.floor(rnd() * 2), rnd() < 0.5 ? RP.folha[2] : RP.folha[1]); // hera
}
function tree(x, base, s) {
  R(x - 2, base - s * 2, 5, s * 2, RP.madeira[2]); R(x - 2, base - s * 2, 1, s * 2, RP.madeira[3]); R(x + 2, base - s * 2, 1, s * 2, RP.madeira[1]); R(x - 3, base - 1, 7, 1, RP.madeira[1]);
  seed = x * 13; const cl = []; for (let i = 0; i < 9 + s; i++) cl.push([x + Math.round((rnd() - 0.5) * s * 2.6), base - s * 2 - Math.round(rnd() * s * 1.6), 3 + Math.round(rnd() * s * 0.45)]);
  for (const [cx, cy, r] of cl) circle(cx, cy, r + 1, RP.folha[0]);
  for (const [cx, cy, r] of cl) circle(cx, cy, r, RP.folha[1]);
  for (const [cx, cy, r] of cl) circle(cx - 1, cy - 1, Math.max(1, r - 1), RP.folha[2]);
  for (const [cx, cy, r] of cl) if (cx <= x + 2) circle(cx - 2, cy - 2, Math.max(1, r - 3), RP.folha[3]);
  for (const [cx, cy, r] of cl.slice(0, 4)) P(cx - r + 2, cy - r + 2, RP.folha[4]);
}
function ground(y0) {
  R(0, y0, W, H - y0, RP.grama[2]);
  seed = 99; for (let i = 0; i < 900; i++) { const x = Math.floor(rnd() * W), y = y0 + 4 + Math.floor(rnd() * (H - y0)); const c = rnd() < 0.5 ? RP.grama[1] : RP.grama[3]; R(x, y, 2 + Math.floor(rnd() * 3), 1, c); if (c === RP.grama[3]) P(x, y - 1, RP.grama[4]); }
  for (let x = 0; x < W; x++) { const t = Math.round(Math.sin(x * 0.7) * 1 + Math.sin(x * 0.23) * 1.5); R(x, y0 - 1 + t, 1, 3, RP.grama[3]); P(x, y0 - 2 + t, x % 3 ? RP.grama[4] : RP.grama[3]); }
  // estrada de terra serpenteando
  for (let x = 70; x < W; x++) { const t = (x - 70) / (W - 70); const cy = Math.round(y0 + 40 - t * 30 + Math.sin(x / 40) * 6); const hw = Math.round(9 - t * 5); R(x, cy - hw, 1, hw * 2, RP.terra[2]); P(x, cy - hw, RP.terra[3]); P(x, cy + hw, RP.terra[1]); if (x % 7 === 0) P(x, cy - 2 + (x % 3), RP.terra[1]); if (x % 11 === 0) P(x, cy + 1, RP.terra[3]); }
  for (const [x, y] of [[230, 150], [330, 140], [410, 168], [200, 182], [380, 186]]) { ellipse(x, y + 2, 5, 2, RP.grama[1]); circle(x, y, 3, RP.pedra[2]); circle(x - 1, y - 1, 1, RP.pedra[3]); }
  for (const [x, y] of [[262, 172], [446, 152], [176, 140]]) { circle(x, y, 5, RP.folha[1]); circle(x - 1, y - 1, 4, RP.folha[2]); circle(x - 2, y - 2, 2, RP.folha[3]); }
  seed = 5; for (let i = 0; i < 40; i++) { const x = Math.floor(rnd() * W), y = y0 + 10 + Math.floor(rnd() * (H - y0 - 10)); const c = [RP.lona[3], RP.sol[3], CLARO, RP.epica[3]][i % 4]; P(x, y, c); P(x, y + 1, RP.grama[1]); }
}
function scene() {
  sky(0, 0, W, 130); sun(368, 60);
  cloud(90, 46, 5); cloud(250, 30, 4); cloud(420, 74, 4); cloud(330, 96, 3);
  hills(118, 10, RP.ceu, 3); hills(126, 8, ['#2f5a5a', '#3c6e62', '#4f846c'], 11);
  // ruínas do forte ao fundo
  tower(150, 78, 26, 52, 1); bricks(176, 98, 40, 32, true); R(176, 97, 40, 1, RP.pedra[0]); for (let i = 0; i < 40; i += 8) { bricks(176 + i, 94, 5, 4, true); } tower(216, 70, 22, 60); tower(392, 88, 20, 42, 1);
  tree(120, 132, 8); tree(268, 130, 7); tree(452, 134, 9); tree(30, 128, 7);
  ground(128);
}

// ---------- a feira como moldura ----------
function awning() {
  plank(0, 0, W, 6, RP.madeira, 3);
  for (let i = 0, x = 0; x < W; i++, x += 16) { const rp = i % 2 ? RP.creme : RP.lona; R(x, 6, 16, 12, rp[2]); R(x, 6, 2, 12, rp[3]); R(x + 13, 6, 3, 12, rp[1]); P(x + 2, 7, rp[4]);
    // recorte em ondas
    for (let k = 0; k < 16; k++) { const d = Math.round(Math.sqrt(Math.max(0, 64 - (k - 7.5) ** 2))); R(x + k, 18, 1, d * 0.6, k > 12 ? rp[1] : rp[2]); P(x + k, 18 + Math.round(d * 0.6), rp[0]); } }
  R(0, 6, W, 1, RP.madeira[0]);
}
function post(x) { plank(x, 18, 10, 172, RP.madeira, x + 1); R(x, 18, 10, 1, RP.madeira[0]); for (let y = 30; y < 180; y += 40) { nail(x + 2, y); nail(x + 6, y + 2); } }
function lantern(x, y) { rope(x + 3, y - 10, x + 3, y); bevel(x, y, 7, 10, RP.latao, { cut: 1 }); R(x + 2, y + 3, 3, 4, RP.sol[3]); P(x + 2, y + 3, RP.sol[4]); }
function sign(x, y, w, h, ropeTo) { rope(x + 4, ropeTo, x + 4, y); rope(x + w - 5, ropeTo, x + w - 5, y); plank(x, y, w, h, RP.madeira, x + y); R(x, y, w, 1, RP.madeira[0]); nail(x + 3, y + 2); nail(x + w - 5, y + 2); }
function bunting(x1, x2, y, waves) { // varal de bandeirinhas = contador de ondas
  const n = waves.length, dx = (x2 - x1) / (n - 1); for (let i = 0; i < n - 1; i++) rope(Math.round(x1 + i * dx), y + Math.round(Math.sin(i / (n - 1) * Math.PI) * 4), Math.round(x1 + (i + 1) * dx), y + Math.round(Math.sin((i + 1) / (n - 1) * Math.PI) * 4));
  waves.forEach((wv, i) => { const fx = Math.round(x1 + i * dx), fy = y + Math.round(Math.sin(i / (n - 1) * Math.PI) * 4) + 1; const cur = wv.atual; const rp = wv.tipo === 'chefe' ? RP.lona : wv.tipo === 'julg' ? RP.latao : wv.feita ? RP.creme : RP.rara; const fw = cur ? 9 : 6, fh = cur ? 14 : 10;
    for (let j = 0; j < fh; j++) { const ww = Math.round(fw * (1 - j / fh)); R(fx - ww, fy + j, ww * 2 + 1, 1, j === 0 ? rp[3] : rp[cur ? 3 : 2]); P(fx - ww, fy + j, rp[0]); P(fx + ww, fy + j, rp[0]); } P(fx, fy + fh, rp[0]);
    if (cur) txt(String(wv.n), fx + 1, fy + 2, INK, 'p', null, 'center'); else if (wv.tipo === 'julg') P(fx, fy + 3, INK); else if (wv.tipo === 'chefe') { P(fx - 1, fy + 2, INK); P(fx + 1, fy + 2, INK); } });
}
function counter(y) {
  R(0, y, W, H - y, RP.balcao[1]);
  for (let x = 0; x < W; x += 60) plank(x, y + 10, 60, H - y - 10, RP.balcao, x + 3); // tábuas da frente
  plank(0, y, W, 10, RP.balcao, 77); R(0, y, W, 1, RP.balcao[4]); R(0, y + 1, W, 1, RP.balcao[3]); R(0, y + 9, W, 1, RP.balcao[0]); R(0, y + 10, W, 2, RP.balcao[0]);
}
function priceTag(x, y, n, hot) { rope(x + 4, y - 6, x + 4, y); bevel(x, y, 17, 9, RP.papel, { fill: 3 }); P(x + 2, y + 4, RP.papel[0]); txt(String(n), x + 10, y + 1, hot ? RP.lona[1] : TINTA, 'p', null, 'center'); }
function packArt(x, y, tipo, o = {}) { // embalagem: folha metálica com dobras, faixa do tipo, selo
  const rp = { feira: RP.lona, povo: RP.rara, pequeno: RP.incomum, colecionador: RP.lendaria, antigo: RP.pedra }[tipo];
  const w = o.w ?? 34, h = o.h ?? 46; shadow(x + w / 2, y + h, w / 2, RP.balcao);
  R(x + 1, y, w - 2, h, rp[0]); R(x, y + 1, w, h - 2, rp[0]); R(x + 1, y + 1, w - 2, h - 2, rp[2]);
  for (let i = 0; i < w - 2; i += 2) { P(x + 1 + i, y + 1, rp[4]); P(x + 2 + i, y + 3, rp[3]); } R(x + 1, y + 5, w - 2, 1, rp[0]); // serrilhado
  R(x + 2, y + 6, 2, h - 9, rp[3]); R(x + w - 4, y + 6, 2, h - 9, rp[1]); // brilho e sombra da folha
  bevel(x + 5, y + 11, w - 10, 18, RP.creme, { fill: 3 }); // rótulo
  if (o.icone) icon(o.icone, x + Math.round(w / 2) - 3, y + 15); else icon('moeda', x + Math.round(w / 2) - 4, y + 15);
  R(x + 1, y + h - 12, w - 2, 9, rp[1]); txt(o.rotulo, x + w / 2, y + h - 11, CLARO, 'p', rp[0], 'center');
  if (o.foco) { for (let i = -2; i < w + 2; i += 2) { P(x + i, y - 3, CLARO); P(x + i, y + h + 2, CLARO); } for (let j = -2; j < h + 3; j += 2) { P(x - 3, y + j, CLARO); P(x + w + 2, y + j, CLARO); } }
}
function rug(cx, cy, rp, st = 'livre') { const w = 22, h = 7; R(cx - w / 2 + 1, cy - 3, w - 2, h, rp[0]); R(cx - w / 2, cy - 2, w, h - 2, rp[0]); R(cx - w / 2 + 1, cy - 2, w - 2, h - 2, rp[st === 'livre' ? 1 : 2]); R(cx - w / 2 + 2, cy - 1, w - 4, 1, rp[3]); for (let i = 0; i < w - 4; i += 3) P(cx - w / 2 + 2 + i, cy + 1, rp[4]); P(cx - w / 2 - 1, cy - 1, rp[3]); P(cx + w / 2, cy - 1, rp[3]); }

// ---------- tela: preparação ----------
function scenePrep() {
  scene();
  // vitrine: tapetes 3x5 + exército
  const cols = [158, 128, 98], rows = [140, 152, 164, 176, 188];
  const army = [['humans/sword', 0, 0], ['humans/shield', 0, 2], ['dwarfs/dwarfwarrior', 0, 4], ['humans/spear', 1, 1], ['dwarfs/dwarfminer', 1, 3], ['humans/archer', 2, 0], ['dwarfs/dwarfhunter', 2, 2], ['humans/mage', 2, 4], ['dwarfs/dwarfgrenadier', 1, 4]];
  const occ = new Set(army.map(a => a[1] + ',' + a[2]));
  for (let c = 0; c < 3; c++) for (let r = 0; r < 5; r++) rug(cols[c], rows[r], (c + r) % 2 ? RP.tapete_a : RP.tapete_b, occ.has(c + ',' + r) ? 'ocupado' : 'livre');
  army.sort((a, b) => a[2] - b[2]).forEach(([ref, c, r], i) => spr(ref, 'idle', i % 4, cols[c], rows[r] + 1, 1, false, false));
  // barraca no campo (o que se defende)
  plank(14, 108, 52, 56, RP.madeira, 41); for (let i = 0; i < 52; i += 13) R(14 + i, 108, 1, 56, RP.madeira[1]);
  for (let i = 0; i < 6; i++) { const rp = i % 2 ? RP.creme : RP.lona; R(10 + i * 10, 98, 10, 10, rp[2]); R(10 + i * 10, 98, 2, 10, rp[3]); R(17 + i * 10, 98, 3, 10, rp[1]); P(14 + i * 10, 108, rp[0]); } R(10, 97, 60, 1, RP.lona[0]);
  plank(12, 132, 56, 6, RP.balcao, 9); spr('villagers2/merchant', 'idle_b', 2, 30, 132, 1, false, false); spr('villagers2/miner', 'work', 1, 50, 132, 1, false, false);
  // vida da barraca: placa
  sign(20, 84, 40, 11, 76); icon('coracao', 24, 85, false); txt('18/20', 46, 86, CLARO, 'p', INK, 'center');
  // moldura: toldo, postes, lampiões, varal de ondas, placas do HUD
  awning(); post(0); post(W - 10); lantern(14, 34); lantern(W - 22, 34);
  const waves = Array.from({ length: 15 }, (_, i) => ({ n: i + 1, feita: i < 2, atual: i === 2, tipo: i === 3 || i === 7 || i === 11 ? 'julg' : i === 9 || i === 14 ? 'chefe' : 'n' }));
  bunting(150, 330, 22, waves);
  txt('ONDA 3 · JULGAMENTO NA PRÓXIMA', 240, 44, CLARO, 'p', INK, 'center', true);
  sign(18, 22, 62, 14, 18); icon('moeda', 23, 25); txt('42', 35, 25, RP.latao[4], 'p', INK); txt('+4', 55, 25, RP.incomum[3], 'p', INK);
  sign(W - 104, 22, 90, 14, 18); let x = W - 100; for (const [ic, n] of [['lupa', 3], ['troca', 2], ['lacre', 1]]) { icon(ic, x, 25); x += 11; x += txt(String(n), x, 25, CLARO, 'p', INK) + 6; }
  // garantia como pergaminho pregado no poste direito
  bevel(W - 66, 56, 52, 40, RP.papel, { fill: 3 }); nail(W - 64, 58); nail(W - 18, 58); txt('GARANTIA', W - 40, 60, TINTA, 'p', null, 'center');
  [['rara', 2, 3], ['epica', 9, 12], ['lendaria', 27, 40]].forEach(([r, n, m], i) => { const y = 70 + i * 8; gem(W - 61, y, r); txt(String(n), W - 48, y - 1, TINTA, 'p', null); R(W - 36, y + 2, 18, 3, RP.papel[1]); R(W - 36, y + 2, Math.round(18 * (m - n) / m), 3, RP[r][2]); });
  // sinergias: plaquinhas penduradas no poste esquerdo
  [['humanos', '2/4', true], ['anoes', '1/2', false], ['espada', '2/4', true], ['arco', '1/2', false], ['aldeoes', '2/3', false]].forEach(([ic, v, on], i) => { const y = 168 + i * 0 + 0; });
  // balcão
  counter(196);
  // vendedor atrás do balcão (comandante) — por cima do balcão, à direita
  // prateleira: 3 pacotes de pé com etiquetas
  packArt(14, 216, 'feira', { rotulo: 'FEIRA', foco: true }); priceTag(31, 212, 14);
  packArt(56, 216, 'povo', { rotulo: 'POVO', icone: 'anoes' }); priceTag(73, 212, 18);
  packArt(98, 216, 'pequeno', { rotulo: 'MIÚDO' }); priceTag(115, 212, 8);
  // caixote do estoque com pacote lacrado
  packArt(152, 216, 'feira', { rotulo: 'FEIRA', w: 30, h: 40 }); bevel(146, 238, 42, 26, RP.madeira); for (let i = 0; i < 3; i++) R(148, 242 + i * 7, 38, 1, RP.madeira[1]); nail(149, 241); nail(181, 241);
  R(150, 230, 34, 7, RP.lona[1]); R(150, 231, 34, 5, RP.lona[2]); txt('+1', 167, 230, CLARO, 'p', RP.lona[0], 'center');
  // bolsa (bolso) com 2 cartas
  bevel(202, 216, 48, 46, RP.creme, { fill: 2 }); R(206, 216, 40, 3, RP.creme[1]); miniCard(207, 222, 'comum', 'elves/elfarcher'); miniCard(226, 222, 'rara', 'dwarfs/dwarfwarrior');
  // núcleos: 3 encaixes de latão
  for (let i = 0; i < 3; i++) { bevel(262 + i * 18, 208, 16, 16, RP.latao, { inset: true, insetFill: 0 }); } icon('lupa', 266, 212);
  // chances: pergaminho pregado na frente do balcão
  bevel(256, 232, 128, 34, RP.papel, { fill: 3 }); nail(258, 234); nail(380, 234);
  txt('1–4', 262, 239, RP.papel[0], 'p', null); txt('ÚLT.', 262, 251, RP.papel[0], 'p', null);
  [['comum', '63', '42'], ['incomum', '28', '35'], ['rara', '8', '18'], ['epica', '1,2', '4,5'], ['lendaria', '0,2', '0,8']].forEach(([r, a, b], i) => { const xx = 286 + i * 19; gem(xx + 3, 245, r); txt(a, xx + 6, 236, TINTA, 'p', null, 'center'); txt(b, xx + 6, 253, RP[r][1], 'p', null, 'center'); });
  // sino: abrir a feira
  const bx = 392, by = 204; bevel(bx, by + 30, 80, 30, RP.lona, { fill: 2 }); R(bx + 2, by + 32, 76, 1, RP.lona[4]);
  txt('ABRIR A', bx + 40, by + 34, CLARO, 'p', RP.lona[0], 'center'); txt('FEIRA!', bx + 40, by + 43, RP.latao[4], 'p', RP.lona[0], 'center');
  rope(bx + 40, by - 2, bx + 40, by + 6); icon('sino', bx + 33, by + 6, true, 2);
  for (let i = -3; i < 84; i += 2) { P(bx + i, by + 27, CLARO); P(bx + i, by + 62, CLARO); }
}
function gem(x, y, r) { const rp = RP[r]; R(x + 1, y, 5, 7, rp[0]); R(x, y + 1, 7, 5, rp[0]); R(x + 1, y + 1, 5, 5, rp[2]); R(x + 1, y + 1, 2, 2, rp[4]); R(x + 4, y + 4, 2, 2, rp[1]); }
function miniCard(x, y, r, ref) { const rp = RP[r]; bevel(x, y, 17, 24, rp); R(x + 2, y + 3, 13, 13, RP.noite[1]); g.save(); g.beginPath(); g.rect(x + 2, y + 3, 13, 13); g.clip(); spr(ref, 'idle', 0, x + 8, y + 17, 1, false, false); g.restore(); gem(x + 5, y + 17, r); }

// ---------- carta (pequena 72x100 e detalhe 132x184) ----------
const statsU = (u) => { const C = D.classes.lista.find(c => c.id === u.classe), r = D.raridades.lista.find(r => r.id === u.raridade).mult; return { vid: Math.round(40 * C.vid * r), atq: Math.round(6 * C.atq * r), int: C.int_s }; };
const CLS_IC = { guerreiro: 'espada', defensor: 'escudo', lanceiro: 'espada', atirador: 'arco', artilheiro: 'bomba', cavaleiro: 'cavalo', bruto: 'punho', lider: 'coroa' };
function backdrop(x, y, w, h, fac) { // mini-cenário da facção dentro da janela da arte
  const sk = fac === 'anoes' ? ['#3a2a2a', '#5a3a30', '#7a5038'] : fac === 'elfos' ? ['#2a5a5a', '#3f7a6a', '#68a080'] : [RP.ceu[1], RP.ceu[2], RP.ceu[3]];
  R(x, y, w, h, sk[0]); R(x, y + Math.round(h * 0.35), w, Math.round(h * 0.3), sk[1]); dither(x, y + Math.round(h * 0.35) - 3, w, 3, sk[1], 0.5); R(x, y + Math.round(h * 0.65), w, h - Math.round(h * 0.65), sk[2]); dither(x, y + Math.round(h * 0.65) - 3, w, 3, sk[2], 0.5);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (fac === 'elfos') { for (let i = 0; i < 4; i++) { const tx = x + 8 + i * Math.round(w / 3.4); R(tx - 1, y + Math.round(h * 0.35), 3, h, '#1e3a2a'); seed = tx * 7; for (let k = 0; k < 7; k++) { const cx = tx + Math.round((rnd() - 0.5) * 12), cy = y + Math.round(h * 0.22) + Math.round(rnd() * 10); circle(cx, cy, 4, RP.folha[0]); circle(cx, cy - 1, 3, RP.folha[1]); P(cx - 1, cy - 2, RP.folha[3]); } } }
  else if (fac === 'anoes') { for (let i = 0; i < w; i += 6) { R(x + i, y + 4 + ((i * 7) % 9), 5, 3, '#2a1e1e'); } circle(x + w - 12, y + 10, 4, RP.sol[1]); circle(x + w - 12, y + 10, 2, RP.sol[3]); }
  else { circle(x + w - 14, y + 12, 6, RP.sol[4]); bricks(x + 4, y + Math.round(h * 0.4), 10, Math.round(h * 0.4), true); }
  R(x, y + h - 10, w, 10, RP.grama[2]); R(x, y + h - 10, w, 1, RP.grama[3]); g.restore();
}
function card(u, x, y, big = false, frame = 0) {
  const w = big ? 132 : 72, h = big ? 184 : 100, rp = RP[u.raridade], sc = big ? 3 : 2;
  // corpo de papel com moldura na cor da raridade
  R(x + 2, y, w - 4, h, rp[0]); R(x, y + 2, w, h - 4, rp[0]); R(x + 1, y + 1, w - 2, h - 2, rp[2]); R(x + 1, y + 1, w - 2, 1, rp[4]); R(x + 1, y + 1, 1, h - 2, rp[3]); R(x + w - 2, y + 2, 1, h - 3, rp[1]); R(x + 2, y + h - 2, w - 3, 1, rp[1]);
  R(x + 3, y + 3, w - 6, h - 6, RP.papel[3]); dither(x + 3, y + h - 20, w - 6, 17, RP.papel[2], 0.25);
  // fita com o nome
  const fy = y + 3, fh = big ? 15 : 11; R(x + 3, fy, w - 6, fh, rp[2]); R(x + 3, fy, w - 6, 1, rp[3]); R(x + 3, fy + fh - 1, w - 6, 1, rp[1]);
  const nome = T[`carta.${u.id}.nome`].toUpperCase(); const f = big && tw(nome, 'g') < w - 12 ? 'g' : 'p'; txt(nome, x + w / 2, fy + (f === 'g' ? 1 : 2), CLARO, f, rp[0], 'center');
  // janela da arte com cantoneiras de latão e cenário da facção
  const ax = x + 6, ay = fy + fh + 3, aw = w - 12, ah = big ? 96 : 52;
  R(ax - 2, ay - 2, aw + 4, ah + 4, rp[1]); R(ax - 1, ay - 1, aw + 2, ah + 2, RP.noite[0]); backdrop(ax, ay, aw, ah, u.faccao);
  for (const [cx, cy] of [[ax - 2, ay - 2], [ax + aw - 2, ay - 2], [ax - 2, ay + ah - 2], [ax + aw - 2, ay + ah - 2]]) { R(cx, cy, 4, 4, RP.latao[1]); P(cx + 1, cy + 1, RP.latao[4]); P(cx + 2, cy + 1, RP.latao[3]); }
  const s = sp(u.sprite); const k = s.cell.w > 32 ? sc - 1 : sc;
  g.save(); g.beginPath(); g.rect(ax, ay, aw, ah); g.clip(); shadow(ax + aw / 2, ay + ah - 5, 5 * k, RP.grama); spr(u.sprite, 'idle', frame, ax + aw / 2, ay + ah - 4, k, false, false); g.restore();
  // pedra da raridade no topo da janela, encravada em latão
  const gx = x + w - 15, gy = ay + 3; bevel(gx - 2, gy - 2, 11, 11, RP.latao, { cut: 1 }); gem(gx, gy, u.raridade);
  // medalhões de classe e facção
  const my = ay + ah - 6; for (const [i, ic] of [[0, CLS_IC[u.classe]], [1, u.faccao]]) { const mx = ax + 2 + i * 12; R(mx, my, 11, 11, RP.latao[0]); R(mx + 1, my + 1, 9, 9, RP.latao[2]); R(mx + 1, my + 1, 9, 1, RP.latao[4]); R(mx + 2, my + 2, 7, 7, RP.noite[1]); icon(ic, mx + 2, my + 2); }
  // atributos e efeito
  const st = statsU(u); const ty = ay + ah + 7;
  icon('coracao', x + 7, ty); txt(String(st.vid), x + 18, ty, TINTA, 'p', null); icon('espada', x + (big ? 44 : 38), ty + 1); txt(String(st.atq), x + (big ? 54 : 48), ty, TINTA, 'p', null);
  if (!big) txt(T['rar.' + u.raridade].toUpperCase(), x + w / 2, y + h - 12, rp[3], 'p', rp[0], 'center', true);
  if (big) { txt(`${String(st.int).replace('.', ',')}s`, x + 80, ty, RP.papel[0], 'p', null); R(x + 7, ty + 11, w - 14, 1, RP.papel[1]);
    wrap(T[`carta.${u.id}.efeito`], x + 8, ty + 15, w - 16, 3);
    txt(`${T['classe.' + u.classe]} · ${T['faccao.' + u.faccao]}`, x + 8, y + h - 24, RP.papel[0], 'p', null);
    txt(T['rar.' + u.raridade].toUpperCase(), x + w / 2, y + h - 13, rp[3], 'p', rp[0], 'center', true); }
}
function wrap(s, x, y, w, maxL) { const words = s.split(' '); let line = '', n = 0; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (tw(t) > w && line) { txt(line, x, y + n * 9, TINTA, 'p', null); n++; line = wd; if (n >= maxL) return; } else line = t; } if (line) txt(line, x, y + n * 9, TINTA, 'p', null); }
function sceneCard() {
  R(0, 0, W, H, RP.noite[1]); for (let y = 0; y < H; y += 2) for (let x = (y / 2) % 2; x < W; x += 4) P(x, y, RP.noite[2]);
  const U = (id) => D.cartas_unidades.lista.find(u => u.id === id);
  card(U('e_mago'), 22, 42, true, 1); card(U('h_espadachim'), 176, 84); card(U('a_demolidor'), 256, 84); card(U('h_principe'), 336, 84, false, 2);
  txt('DETALHE', 88, 28, RP.creme[3], 'p', INK, 'center'); txt('NA ABERTURA (72×100)', 296, 70, RP.creme[3], 'p', INK, 'center');
}


function cardBack(x, y, glowR) {
  if (glowR) { const rp = RP[glowR]; for (let k = 3; k >= 1; k--) { R(x - k, y - k, 72 + 2 * k, 100 + 2 * k, k === 1 ? rp[3] : rp[2]); } dither(x - 3, y - 3, 78, 106, rp[1], 0.25); }
  R(x + 2, y, 68, 100, RP.lona[0]); R(x, y + 2, 72, 96, RP.lona[0]); R(x + 1, y + 1, 70, 98, RP.lona[1]);
  R(x + 4, y + 4, 64, 92, RP.lona[2]); for (let i = 0; i < 92; i += 6) for (let j = ((i / 6) % 2) * 6; j < 64; j += 12) { R(x + 6 + j, y + 6 + i, 2, 2, RP.lona[1]); } R(x + 4, y + 4, 64, 1, RP.lona[3]); R(x + 6, y + 6, 60, 88, RP.lona[2]); for (let i = 0; i < 88; i += 8) for (let j = ((i / 8) % 2) * 8; j < 60; j += 16) { P(x + 9 + j, y + 9 + i, RP.lona[3]); P(x + 10 + j, y + 10 + i, RP.lona[3]); } R(x + 5, y + 5, 62, 1, RP.lona[1]); R(x + 5, y + 94, 62, 1, RP.lona[1]); R(x + 5, y + 5, 1, 90, RP.lona[1]); R(x + 66, y + 5, 1, 90, RP.lona[1]); // padrão de lona discreto
  bevel(x + 18, y + 32, 36, 36, RP.latao, { cut: 2 }); circle(x + 36, y + 50, 12, RP.creme[3]); circle(x + 36, y + 50, 10, RP.creme[4]); icon('moeda', x + 32, y + 46, false);
  txt('B·R', x + 36, y + 84, RP.creme[3], 'p', RP.lona[0], 'center');
}
function sceneOpen() {
  scene(); counter(196); awning(); post(0); post(W - 10);
  shade(10, 18, W - 20, 178, 0.38); // escurece o campo trocando cada cor pela vizinha escura da paleta
  // embalagem rasgada atrás (à esquerda) e cartas
  const U = (id) => D.cartas_unidades.lista.find(u => u.id === id);
  txt('PACOTE DA FEIRA', W / 2, 30, RP.latao[4], 'p', INK, 'center', true);
  const xs = [26, 112, 198, 284, 370], y = 44;
  card(U('h_espadachim'), xs[0], y); card(U('a_minerador'), xs[1], y); card(U('h_mago'), xs[2], y);
  cardBack(xs[3], y, 'epica'); cardBack(xs[4], y, null);
  // partículas da rara
  seed = 3; for (let i = 0; i < 22; i++) { const a = rnd() * 6.28, d = 40 + rnd() * 18; const px = Math.round(xs[2] + 36 + Math.cos(a) * d), py = Math.round(y + 50 + Math.sin(a) * d * 0.9); R(px, py, 2, 2, i % 3 ? RP.rara[3] : CLARO); }
  // rótulo de chance da carta recém-virada
  for (const [i, r, pc] of [[0, 'comum', '63%'], [1, 'comum', '63%'], [2, 'rara', '8%']]) { bevel(xs[i] + 14, y + 102, 44, 11, RP[r], { fill: 2 }); txt(pc, xs[i] + 36, y + 104, CLARO, 'p', RP[r][0], 'center'); }
  txt('VIRAR', xs[3] + 36, y + 104, RP.epica[3], 'p', INK, 'center', true); txt('ÚLTIMA', xs[4] + 36, y + 104, RP.latao[4], 'p', INK, 'center', true);
  // balcão: carimbos de borracha com cargas + botões em placas
  for (const [i, ic, n, nome] of [[0, 'lupa', 3, 'LUPA'], [1, 'troca', 2, 'TROCA'], [2, 'lacre', 1, 'LACRE']]) { const bx = 12 + i * 60; bevel(bx, 206, 57, 30, RP.madeira); icon(ic, bx + 5, 212, true, 2); txt(nome, bx + 27, 211, CLARO, 'p', INK); txt('×' + n, bx + 27, 222, RP.latao[4], 'p', INK); }
  bevel(196, 206, 100, 30, RP.lona); R(198, 208, 96, 1, RP.lona[4]); txt('VIRAR', 246, 210, CLARO, 'g', RP.lona[0], 'center');
  for (let i = -3; i < 103; i += 2) { P(196 + i, 203, CLARO); P(196 + i, 238, CLARO); }
  bevel(304, 210, 64, 22, RP.madeira); txt('TUDO', 336, 216, CLARO, 'p', INK, 'center');
  bevel(376, 210, 84, 22, RP.madeira); txt('PULAR', 418, 216, CLARO, 'p', INK, 'center');
  // garantia no pergaminho
  bevel(20, 242, 440, 22, RP.papel, { fill: 3 }); nail(22, 244); nail(456, 244);
  [['rara', 'Rara+ em 2', 2, 3], ['epica', 'Épica+ em 9', 9, 12], ['lendaria', 'Lendária em 27', 27, 40]].forEach(([r, t, n, m], i) => { const x = 30 + i * 146; gem(x, 249, r); txt(t, x + 10, 248, TINTA, 'p', null); R(x + 94, 251, 38, 3, RP.papel[1]); R(x + 94, 251, Math.round(38 * (m - n) / m), 3, RP[r][2]); });
}
const SCENES = { estilo_preparacao: scenePrep, estilo_cartas: sceneCard, estilo_abertura: sceneOpen };
window.renderScene = (name, k = 4) => { g.clearRect(0, 0, W, H); SCENES[name](); out.width = W * k; out.height = H * k; og.imageSmoothingEnabled = false; og.drawImage(cv, 0, 0, W * k, H * k); return true; };
window.ready = (async () => {
  M = await (await fetch('../../assets/minifolks/manifest.json')).json();
  for (const n of ['classes', 'raridades', 'cartas_unidades']) D[n] = await (await fetch(`../../data/${n}.json`)).json();
  T = await (await fetch('../../data/strings/pt-BR.json')).json();
  const ff = new FontFace('m5x7', 'url(../../assets/fonts/m5x7.ttf)'); await ff.load(); document.fonts.add(ff); calibrate();
  const refs = new Set(['villagers2/merchant', 'villagers2/miner', 'elves/elfarcher', 'dwarfs/dwarfwarrior']); for (const u of D.cartas_unidades.lista) refs.add(u.sprite); await preload([...refs]);
  return TOP;
})();
