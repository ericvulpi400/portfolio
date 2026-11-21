// Arte em pixel dos pacotes e molduras (sem IA). Usada por pacotes_cartas.html e abertura.html.
(() => {
'use strict';
// ------------------------------------------------------------------ paleta em rampas (escuro -> claro)
const RP = {
  prata: ['#4a4658', '#7e7a8e', '#aeaabc', '#d6d4e0', '#f6f4fc'],
  verde: ['#11502a', '#1c7436', '#2a9c46', '#44bc5a', '#8ee08e', '#e2fadc'],
  azul: ['#103a84', '#1a54b8', '#2a74e4', '#4894f6', '#8cc0ff', '#e0eeff'],
  roxo: ['#341864', '#52288e', '#6c36b0', '#8a54ce', '#b28ae6', '#e8dcfa'],
  ouro: ['#6e420a', '#a66e10', '#dea01a', '#f6c634', '#ffe27a', '#fff6c8'],
  pedra: ['#45414e', '#666270', '#8e8a98', '#b6b2c0', '#dcd8e4', '#f6f4fa'],
  azulm: ['#1c3a80', '#2a5aa8', '#4480cc', '#68a4e8', '#a4ccfa', '#e4f0ff'],
  rosa: ['#5a1a6a', '#8a2a9a', '#b444c4', '#d872e0', '#f0a8f4', '#fde4ff'],
  ardosia: ['#232a38', '#353f50', '#4d5a6c', '#6c7a8c', '#95a2b2'],
  aco: ['#474b5a', '#777d90', '#a8aec0', '#d4d8e4', '#ffffff'],
  madeira: ['#3a2014', '#683a22', '#8c5634', '#ae744c', '#d49e6e'],
  rubi: ['#4a0a24', '#80143c', '#bc2a5c', '#e45c84', '#ffb6cc'],
  safira: ['#0c2460', '#16449c', '#2a6ad8', '#5aa0ff', '#cce4ff'],
  ametista: ['#2a0c50', '#4a1a86', '#7a36c4', '#a874ec', '#e4d0ff'],
  papel: ['#7e5e40', '#b0906e', '#d8c0a0', '#eedcc0', '#fff6e6'],
  janela: ['#140c1c', '#1c1428', '#251a34', '#2e2240', '#3a2c50'],
};
const INK = '#1a1224';
const ARCO_IRIS = ['#ff5a6e', '#ff9a44', '#ffd84a', '#7ee06a', '#4ad8d0', '#5a9cff', '#a070ff', '#f070d8'];

// ------------------------------------------------------------------ "pixmap": grade de cores + contorno automático
class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  set(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < this.w && y < this.h && c) this.d[y * this.w + x] = c; }
  get(x, y) { return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.d[y * this.w + x] : null; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); }
  stamp(rows, x, y, pal) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) this.set(x + i, y + j, pal[ch]); })); }
  paste(o, x, y) { for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) { const c = o.get(i, j); if (c) this.set(x + i, y + j, c); } }
  outline(c = INK) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = this.get(x + a, y + b); if (n && n !== c) { add.push([x, y]); break; } }
    }
    add.forEach(([x, y]) => this.set(x, y, c)); return this;
  }
  draw(ctx, ox = 0, oy = 0) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = this.d[y * this.w + x]; if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); } } }
}

// ------------------------------------------------------------------ emblemas
function escudo() {
  const o = RP.ouro, s = RP.ardosia, a = RP.aco, m = RP.madeira, L = new Pix(18, 25), cx = 9, top = 5;
  const half = (y) => { const t = y - top; return t < 9 ? 8 : Math.round(8 * (1 - Math.pow((t - 9) / 11, 1.3))); };
  const dentro = (x, y) => y >= top && y < top + 20 && x >= cx - half(y) && x < cx + half(y);
  const borda = (x, y, k) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([p, q]) => !dentro(x + p * k, y + q * k));
  for (let y = top; y < top + 20; y++) for (let x = cx - half(y); x < cx + half(y); x++) {
    let c;
    if (borda(x, y, 1)) c = (x < cx && y < top + 12) ? o[4] : o[3];
    else if (borda(x, y, 2)) c = x < cx ? o[3] : o[2];
    else if (borda(x, y, 3)) c = o[1];
    else c = x < cx ? s[3] : s[1];
    L.set(x, y, c);
  }
  for (const x of [1, 2, 15, 16]) L.set(x, top - 1, x < 9 ? o[4] : o[3]);
  for (let y = top + 2; y < top + 18; y++) { L.set(cx - 1, y, a[4]); L.set(cx, y, a[2]); }
  L.set(cx - 1, top + 18, a[2]);
  for (let x = cx - 5; x < cx + 5; x++) { L.set(x, top + 1, x < cx ? o[4] : o[3]); L.set(x, top + 2, o[1]); }
  for (const y of [2, 3, 4]) { L.set(cx - 1, y, m[3]); L.set(cx, y, m[2]); }
  L.set(cx - 1, 1, o[4]); L.set(cx, 1, o[3]); L.set(cx - 1, 0, o[3]); L.set(cx, 0, o[2]);
  return L.outline();
}
function arco() {
  const m = RP.madeira, a = RP.aco, p = RP.papel, L = new Pix(26, 26);
  for (let k = 0; k < 500; k++) {
    const t = (-6 + 102 * k / 499) * Math.PI / 180;
    [[-1, m[1]], [0, m[2]], [1, m[3]], [2, m[4]]].forEach(([dr, c]) => L.set(Math.round(3 + (21 + dr * 0.8) * Math.cos(t)), Math.round(24 - (21 + dr * 0.8) * Math.sin(t)), c));
  }
  for (let k = 0; k <= 21; k++) L.set(3 + k, 3 + k, p[2]);
  for (let k = 0; k < 18; k++) { L.set(4 + k, 21 - k, a[2]); L.set(5 + k, 21 - k, a[1]); }
  L.stamp(['..www', '.wwww', 'wwww.', 'www..', '.w...'], 20, 1, { w: a[4] });
  L.stamp(['ww...', 'www..', '.www.', '..ww.', '...w.'], 1, 20, { w: a[4] });
  L.set(22, 1, a[3]); L.set(2, 22, RP.rubi[3]); L.set(3, 23, RP.rubi[3]);
  return L.outline();
}
function coroa() {
  const o = RP.ouro, g = RP.ametista, L = new Pix(22, 15);
  const rows = [
    '..x.......xx.......x..',
    '.xOx.....xOOx.....xOx.',
    '.xOOx....xOOx....xOOx.',
    '.xOOOx..xOOOOx..xOOOx.',
    '.xOOOOxxOOOOOOxxOOOOx.',
    '.xOOOOOOOOggOOOOOOOOx.',
    '.xOOOOOOOggggOOOOOOOx.',
    '.xOOOOOOOOggOOOOOOOOx.',
    '.xOOOOOOOOOOOOOOOOOOx.',
    '.xddddddddddddddddddx.',
    '.xOOrOOOOOOOOOOOOrOOx.',
    '.xOOOOOOOOOOOOOOOOOOx.',
    '.xddddddddddddddddddx.',
  ];
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === 'O') L.set(x, y, (y <= 1 || (rows[y - 1][x] === 'x' && x < 11)) ? o[5] : x < 11 ? o[3] : o[2]);
    else if (ch === 'd') L.set(x, y, o[1]);
    else if (ch === 'g') L.set(x, y, (x < 11 && y < 7) ? g[3] : g[2]);
    else if (ch === 'r') L.set(x, y, RP.rubi[3]);
  }));
  for (const [x, y] of [[2, 1], [11, 1], [19, 1]]) L.set(x, y, o[5]);
  return L.outline();
}

// ------------------------------------------------------------------ pacote 30x50 "estofado"
function pacote(cor, emblema, faixas) {
  const W = 30, H = 50, P = new Pix(W, H), r = RP[cor], pr = RP.prata;
  const larg = (y) => y < 8 || y > 41 ? 1 : (y < 11 || y > 38) ? 0 : -1; // laterais curvas: estufa no meio
  for (let y = 6; y < 44; y++) {
    const ins = larg(y) + 1;
    for (let x = ins; x < W - ins; x++) {
      const t = (x - ins) / (W - 2 * ins - 1);
      let c = t < 0.07 ? r[3] : t < 0.16 ? r[4] : t < 0.72 ? r[2] : t < 0.88 ? r[1] : r[0];
      if (y < 9) c = t < 0.8 ? r[1] : r[0];                     // sombra do serrilhado de cima
      else if (y > 40) c = t < 0.8 ? r[1] : r[0];               // dobra de baixo
      else if (y > 36 && t > 0.16 && t < 0.72) c = r[2];
      P.set(x, y, c);
    }
  }
  // brilho em arco (dois tons)
  [[3, 14], [3, 13], [3, 12], [4, 11], [4, 10], [5, 10], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9]].forEach(([x, y]) => P.set(x, y, r[5]));
  [[4, 14], [4, 13], [4, 12], [5, 11], [6, 10], [7, 10]].forEach(([x, y]) => P.set(x, y, r[4]));
  // serrilhado de prata (dentes arredondados)
  for (const [y0, top] of [[0, true], [44, false]]) {
    for (let k = 0; k < 6; k++) {
      const y = y0 + k, kk = top ? k : 5 - k;
      for (let x = 0; x < W; x++) {
        if (kk === 0 && (x % 3 === 2)) continue;
        let c = kk === 0 ? pr[3] : kk === 1 ? pr[4] : kk === 2 ? pr[3] : kk === 3 ? pr[2] : pr[1];
        if (x >= W - 3) c = kk <= 1 ? pr[2] : pr[1];
        if (x === 0 && kk > 0) c = pr[3];
        P.set(x, y, c);
      }
    }
    for (let x = 0; x < W; x++) P.set(x, top ? 5 : 44, pr[0]);
  }
  if (faixas) {
    const o = RP.ouro;
    let pv = null, pt = null;
    for (let x = 0; x < W; x++) {
      const v = Math.floor((15 - Math.abs(x - 14.5)) / 4);
      const yb = 10 + v, yt = 39 - v;
      for (let y = 6; y < yb; y++) P.set(x, y, x < W - 4 ? (y === 6 ? o[4] : o[3]) : o[2]);
      for (let y = yt + 1; y < 44; y++) P.set(x, y, x < W - 4 ? o[2] : o[1]);
      for (let y = Math.min(pv ?? yb, yb); y <= Math.max(pv ?? yb, yb); y++) { P.set(x, y, r[0]); P.set(x, y - 3, r[3]); }
      for (let y = Math.min(pt ?? yt, yt); y <= Math.max(pt ?? yt, yt); y++) { P.set(x, y, r[0]); P.set(x, y + 3, r[3]); }
      pv = yb; pt = yt;
    }
  }
  const e = emblema(); P.paste(e, Math.round((W - e.w) / 2), 25 - Math.round(e.h / 2));
  return P.outline();
}

// ------------------------------------------------------------------ moldura 36x50 (exibida em 2x)
function moldura(cor, opt = {}) {
  const W = 36, H = 50, P = new Pix(W, H), r = RP[cor];
  const R = 3;
  const dentro = (x, y, ins = 0, rr = R) => {
    const x0 = ins, y0 = ins, x1 = W - 1 - ins, y1 = H - 1 - ins;
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    for (const [cx, cy] of [[x0 + rr, y0 + rr], [x1 - rr, y0 + rr], [x0 + rr, y1 - rr], [x1 - rr, y1 - rr]])
      if ((x < x0 + rr || x > x1 - rr) && (y < y0 + rr || y > y1 - rr) && Math.abs(x - cx) <= rr && Math.abs(y - cy) <= rr && (x - cx) ** 2 + (y - cy) ** 2 > rr * rr + 1) return false;
    return true;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!dentro(x, y)) continue;
    let c;
    if (!dentro(x, y, 1)) c = (x < W / 2 && y < H * 0.6) ? r[4] : r[3];
    else if (!dentro(x, y, 2)) c = r[2];
    else c = r[1];
    P.set(x, y, c);
  }
  if (opt.verso) {
    const rx = RP.roxo, o = RP.ouro;
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if (dentro(x, y, 2, 2)) P.set(x, y, (x + y) % 6 ? rx[1] : rx[0]);
    for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) if (dentro(x, y, 4, 3) && !dentro(x, y, 5, 3)) P.set(x, y, y < H / 2 ? o[3] : o[2]);
    [[6, 6], [W - 7, 6], [6, H - 7], [W - 7, H - 7]].forEach(([x, y], i) => volutaOuro(P, x, y, i % 2 ? -1 : 1, i < 2 ? 1 : -1));
    estrela(P, W >> 1, H >> 1);
    gemaRedonda(P, W >> 1, 4, 'ouro', 2); gemaRedonda(P, W >> 1, H - 5, 'ouro', 2);
    return P.outline();
  }
  // janela
  const j = RP.janela;
  for (let y = 3; y < 33; y++) for (let x = 3; x < W - 3; x++) if (dentro(x, y, 3, 2)) P.set(x, y, y < 6 ? j[1] : j[2]);
  for (let x = 4; x < W - 4; x++) { P.set(x, 3, j[0]); P.set(x, 32, r[3]); }
  for (let y = 4; y < 32; y++) { P.set(3, y, j[0]); P.set(W - 4, y, r[3]); }
  // filete interno claro (delicadeza)
  for (let x = 5; x < W - 5; x++) P.set(x, 34, r[3]);
  // plaquinha do nome (hexágono alongado)
  const p = RP.papel;
  for (let y = 36; y < 45; y++) {
    const ins = Math.abs(y - 40) >> 1;
    for (let x = 3 + ins; x < W - 3 - ins; x++) P.set(x, y, y === 37 ? p[4] : y < 41 ? p[3] : p[2]);
    P.set(3 + ins, y, r[0]); P.set(W - 4 - ins, y, r[0]);
  }
  for (let x = 5; x < W - 5; x++) { P.set(x, 35, r[0]); P.set(x, 45, r[0]); }
  // enfeites: tampa no topo, botões laterais e de baixo
  tampa(P, W >> 1, 0, cor, opt.gema);
  gemaRedonda(P, 1, 18, opt.gema || cor, 2); gemaRedonda(P, W - 2, 18, opt.gema || cor, 2);
  gemaRedonda(P, W >> 1, H - 2, opt.gema || cor, 2);
  if (opt.cantos) [[3, 3], [W - 4, 3], [3, H - 4], [W - 4, H - 4]].forEach(([x, y]) => gemaRedonda(P, x, y, opt.cantos, 2));
  else [[3, 3], [W - 4, 3], [3, H - 4], [W - 4, H - 4]].forEach(([x, y]) => gemaRedonda(P, x, y, cor, 1));
  return P.outline();
}
function tampa(P, cx, y, cor, gema) {
  const r = RP[cor];
  P.stamp(['..aaaaa..', '.abbbbbc.', 'abbbbbbcc'], cx - 4, y, { a: r[4], b: r[3], c: r[1] });
  if (gema) gemaRedonda(P, cx, y + 2, gema, 2);
}
function gemaRedonda(P, cx, cy, cor, R) {
  const g = RP[cor] || RP.ouro;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    if (dx * dx + dy * dy > R * R + 1) continue;
    P.set(cx + dx, cy + dy, (dx < 0 && dy < 0) ? g[3] : (dx + dy <= 0) ? g[2] : g[1]);
  }
  P.set(cx - 1, cy - 1, g[4]);
}
function voluta(P, x, y, fx, fy, r) { // espiral pequena nos cantos da janela
  [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [2, 1], [1, 2]].forEach(([a, b]) => P.set(x + a * fx, y + b * fy, r[4]));
}
function volutaOuro(P, x, y, fx, fy) { const o = RP.ouro; [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 1]].forEach(([a, b]) => P.set(x + a * fx, y + b * fy, o[4])); }
function estrela(P, cx, cy) {
  const o = RP.ouro, pts = new Set(), k = (a, b) => a + ',' + b;
  for (let dy = -10; dy <= 10; dy++) { const w = Math.round(Math.pow(1 - Math.abs(dy) / 10, 2.4) * 7); for (let dx = -w; dx <= w; dx++) pts.add(k(dx, dy)); }
  for (let dx = -10; dx <= 10; dx++) { const h = Math.round(Math.pow(1 - Math.abs(dx) / 10, 2.4) * 7); for (let dy = -h; dy <= h; dy++) pts.add(k(dx, dy)); }
  for (const s of pts) { const [dx, dy] = s.split(',').map(Number); P.set(cx + dx, cy + dy, (dx < 0 && dy < 0 && -dx - dy < 6) ? o[5] : (dx <= 0 || dy <= 0) ? o[3] : o[2]); }
  for (const s of pts) { const [dx, dy] = s.split(',').map(Number); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!pts.has(k(dx + a, dy + b))) P.set(cx + dx + a, cy + dy + b, o[0]); }
}
window.ARTE = { RP, INK, ARCO_IRIS, Pix, pacote, moldura, escudo, arco, coroa };
})();
