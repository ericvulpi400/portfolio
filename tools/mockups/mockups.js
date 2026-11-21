// Mockups do GDD (Fase 2): desenha as telas principais na área segura 426x240 com os sprites reais
// (manifest + PNGs) e as fontes pixel; o Playwright salva cada cena ampliada 3x (escala inteira).
// Não é código do jogo: serve para conferir layout, legibilidade e hierarquia antes do protótipo.
'use strict';
const W = 426, H = 240;
const P = { ink: '#14101c', night: '#221a30', plum: '#3a2a4a', dusk: '#5a4468', mist: '#8b7b9a', bone: '#e8dcc8', white: '#fff8ec',
  dirtD: '#3b281f', dirt: '#5b3f2e', dirtL: '#7a5638', dirtLL: '#a8774d', grassD: '#2e4a2c', grass: '#3f6b3a', grassL: '#5f8f45', grassLL: '#8fbf5a',
  stoneD: '#45434d', stone: '#6d6a74', stoneL: '#9a97a3', goldD: '#7a4f1c', goldM: '#b07a28', gold: '#f2c14e', goldL: '#ffe9a3',
  redD: '#5a1e22', redM: '#8a2a2a', red: '#d9503f', blueD: '#1e3a66', blueM: '#2c5d9e', blue: '#5aa7e0', purD: '#3a2357', purM: '#5e3a8a', pur: '#a86ad8',
  grnDD: '#24402a', grnD: '#3c7a3a', grn: '#7ccf6b', tealD: '#123640', tealM: '#1f4f5c', cyan: '#7fe3e0', orange: '#f08a3c', pink: '#ef8fc8' };
const RAR = { comum: { c: P.mist, m: P.dusk, d: P.plum, s: '●' }, incomum: { c: P.grn, m: P.grnD, d: P.grnDD, s: '■' }, rara: { c: P.blue, m: P.blueM, d: P.blueD, s: '◆' },
  epica: { c: P.pur, m: P.purM, d: P.purD, s: '▲' }, lendaria: { c: P.gold, m: P.goldM, d: P.goldD, s: '★' }, prisma: { c: P.cyan, m: P.tealM, d: P.tealD, s: '★' } };

let M, D = {}, T = {}; const IMG = {};
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const out = document.getElementById('out'); const og = out.getContext('2d');

// ---------- texto pixel nítido: desenha a fonte TTF e binariza o alfa (sem antisserrilhado) ----------
// Só a m5x7 rasteriza sem pixel parcial no Canvas (16 e 32 px). m3x6 e m6x11 viram aliases aqui;
// no jogo, as fontes saem de um atlas de bitmap gerado dos contornos do TTF (Fase 3).
const FONT = { m5x7: { px: 16, face: 'm5x7' }, m3x6: { px: 16, face: 'm5x7' }, m6x11: { px: 32, face: 'm5x7' } };
const R0 = null;
const tcv = document.createElement('canvas'), tg = tcv.getContext('2d', { willReadFrequently: true });
const cacheTxt = new Map();
function textImg(s, font, color) {
  const key = s + '|' + font + '|' + color; if (cacheTxt.has(key)) return cacheTxt.get(key);
  const F = FONT[font]; tg.font = `${F.px}px ${F.face}`; const w = Math.ceil(tg.measureText(s).width) + 2;
  tcv.width = Math.max(1, w); tcv.height = F.px + 6; tg.font = `${F.px}px ${F.face}`; tg.textBaseline = 'top'; tg.fillStyle = '#000'; tg.fillText(s, 0, 0);
  const id = tg.getImageData(0, 0, tcv.width, tcv.height); const [r, gg, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  for (let i = 0; i < id.data.length; i += 4) { const a = id.data[i + 3] > 110 ? 255 : 0; id.data[i] = r; id.data[i + 1] = gg; id.data[i + 2] = b; id.data[i + 3] = a; }
  const c = document.createElement('canvas'); c.width = tcv.width; c.height = tcv.height; c.getContext('2d').putImageData(id, 0, 0);
  // fator: a fonte é desenhada em 16 px; se cada "pixel da fonte" virou 2 px, reduz pela metade (vizinho mais próximo)
  const scale = font === 'm6x11' ? 1 : 1; const res = { c, w: tcv.width, scale }; cacheTxt.set(key, res); return res;
}
const ACENTO = { '\u0301': [[1, -2], [2, -3]], '\u0300': [[1, -3], [2, -2]], '\u0302': [[0, -2], [1, -3], [2, -2]], '\u0303': [[0, -2], [1, -3], [2, -2], [3, -3]], '\u0327': [[1, 7], [2, 8], [1, 8]] };
function txt(s, x, y, color = P.bone, font = 'm5x7', shadow = P.ink, align = 'left') {
  s = String(s); const k = TEXT_K[font];
  // separa letra-base e acento (NFD): a fonte desenha a base; o acento é pintado em código, 1 px por ponto
  const chars = [...s.normalize('NFD')]; let base = '', marks = [];
  for (const ch of chars) { if (ACENTO[ch]) marks.push([base.length - 1, ch, base[base.length - 1]]); else base += ch; }
  const t = textImg(base, font, color); const ts = shadow ? textImg(base, font, shadow) : null;
  const w = Math.round(t.w / k);
  if (align === 'center') x -= Math.round(w / 2); else if (align === 'right') x -= w;
  x = Math.round(x); y = Math.round(y) - TOP[font];
  const dw = Math.round(t.w / k), dh = Math.round(t.c.height / k);
  if (ts) g.drawImage(ts.c, 0, 0, ts.w, ts.c.height, x + 1, y + 1, dw, dh);
  g.drawImage(t.c, 0, 0, t.w, t.c.height, x, y, dw, dh);
  if (marks.length) { tg.font = `${FONT[font].px}px ${FONT[font].face}`;
    for (const [i, m, b] of marks) { const px = x + Math.round(tg.measureText(base.slice(0, i)).width / k); const cw = Math.round(tg.measureText(b).width / k);
      const up = b === b.toUpperCase() && b !== b.toLowerCase(); const top = y + TOP[font] + (up ? 0 : 2) + (m === '\u0327' ? 0 : 0);
      for (const [dx, dy] of ACENTO[m]) { if (shadow) R(px + Math.floor((cw - 4) / 2) + dx + 1, top + dy + 1, 1, 1, shadow); R(px + Math.floor((cw - 4) / 2) + dx, top + dy, 1, 1, color); } } }
  return w;
}
const TEXT_K = { m5x7: 1, m3x6: 1, m6x11: 1 }; const TOP = { m5x7: 0, m3x6: 0, m6x11: 0 };
function calibrate() { // mede o topo do 'H' (o canvas zera a fonte ao mudar de tamanho: definir a fonte DEPOIS)
  for (const f of Object.keys(FONT)) { const F = FONT[f]; tcv.width = 80; tcv.height = 60; tg.font = `${F.px}px ${F.face}`; tg.textBaseline = 'top'; tg.clearRect(0, 0, 80, 60); tg.fillText('H', 2, 2);
    const d = tg.getImageData(0, 0, 80, 60).data; let top = 99; for (let y = 0; y < 60; y++) for (let x = 0; x < 80; x++) if (d[(y * 80 + x) * 4 + 3] > 110) top = Math.min(top, y);
    TEXT_K[f] = 1; TOP[f] = top - 2; }
}

// ---------- sprites ----------
const sp = (ref) => { const [pk, k] = ref.split('/'); return M.packs[pk].characters[k]; };
function loadImg(src) { return new Promise((res, rej) => { if (IMG[src]) return res(IMG[src]); const i = new Image(); i.onload = () => { IMG[src] = i; res(i); }; i.onerror = () => rej(new Error(src)); i.src = src; }); }
async function preload(refs) { for (const ref of refs) { const c = sp(ref); const v = Object.keys(c.files.pngs).find(v => /outline/i.test(v) && !/without/i.test(v)) || Object.keys(c.files.pngs)[0]; c._src = '../../assets/minifolks/' + c.files.pngs[v]; await loadImg(c._src); } }
async function preloadVariant(ref, variant) { const c = sp(ref); const k = Object.keys(c.files.pngs).find(v => v.includes(variant) && !/without/i.test(v)); c._srcV = c._srcV || {}; c._srcV[variant] = '../../assets/minifolks/' + c.files.pngs[k]; await loadImg(c._srcV[variant]); }
function spr(ref, anim, frame, x, y, k = 1, flip = false, variant = null, silhouette = false) {
  const c = sp(ref); const A = c.anims[anim] || c.anims.idle; const img = IMG[variant ? c._srcV[variant] : c._src]; const f = Math.min(frame, A.frames - 1);
  const cw = c.cell.w, ch = c.cell.h; const dx = Math.round(x - c.pivot.x * k), dy = Math.round(y - c.pivot.y * k);
  if (silhouette) { const t = document.createElement('canvas'); t.width = cw; t.height = ch; const q = t.getContext('2d'); q.drawImage(img, f * cw, A.row * ch, cw, ch, 0, 0, cw, ch); q.globalCompositeOperation = 'source-in'; q.fillStyle = P.ink; q.fillRect(0, 0, cw, ch); g.drawImage(t, 0, 0, cw, ch, dx, dy, cw * k, ch * k); return; }
  if (flip) { g.save(); g.translate(dx + cw * k, dy); g.scale(-1, 1); g.drawImage(img, f * cw, A.row * ch, cw, ch, 0, 0, cw * k, ch * k); g.restore(); }
  else g.drawImage(img, f * cw, A.row * ch, cw, ch, dx, dy, cw * k, ch * k);
}

// ---------- primitivas de UI (paleta única) ----------
// escurecer sem sair da paleta: pontilhado (1 em 2, 1 em 4...) com a cor mais escura
function dither(x, y, w, h, c, nivel) { g.fillStyle = c; for (let j = 0; j < h; j++) for (let i = (j % 2) * (nivel >= 2 ? 1 : 0); i < w; i += nivel >= 2 ? 2 : 4) { if (nivel === 1 && (j % 2)) continue; g.fillRect(x + i, y + j, 1, 1); } if (nivel >= 3) { g.fillStyle = c; for (let j = 0; j < h; j += 2) for (let i = 1 - (j % 2); i < w; i += 2) g.fillRect(x + i, y + j + 1, 1, 1); } }
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function panel(x, y, w, h, fill = P.night, edge = P.mist, dark = P.ink) { R(x, y, w, h, dark); R(x + 1, y + 1, w - 2, h - 2, edge); R(x + 2, y + 2, w - 4, h - 4, fill); R(x + 2, y + 2, w - 4, 1, P.plum); }
function button(x, y, w, label, c = P.goldM, cl = P.gold, focus = false) { R(x, y, w, 15, P.ink); R(x + 1, y + 1, w - 2, 13, cl); R(x + 1, y + 2, w - 2, 12, c); R(x + 1, y + 13, w - 2, 1, P.goldD); txt(label, x + w / 2, y + 3, P.white, 'm5x7', P.goldD, 'center'); if (focus) { R(x - 2, y - 2, w + 4, 1, P.white); R(x - 2, y + 16, w + 4, 1, P.white); R(x - 2, y - 2, 1, 19, P.white); R(x + w + 1, y - 2, 1, 19, P.white); } }
const ICON = { // ícones 7x7 gerados em código
  guerreiro: ['0000011', '0000110', '0001100', '1011000', '0110000', '0110000', '1001000'], defensor: ['0111110', '1111111', '1111111', '1111111', '0111110', '0011100', '0001000'],
  lanceiro: ['0000001', '0000010', '0000100', '0001000', '0010000', '0100000', '1000000'], atirador: ['0011000', '0100100', '1000110', '1111111', '1000110', '0100100', '0011000'],
  artilheiro: ['0001000', '0011100', '0111110', '1111111', '0111110', '0011100', '0001000'], cavaleiro: ['0011100', '0111110', '1101110', '0011110', '0011100', '0110110', '0100010'],
  bruto: ['0111110', '1111111', '1011101', '1111111', '0111110', '0101010', '0101010'], lider: ['1010101', '1111111', '0111110', '0111110', '0111110', '1111111', '0000000'],
  humanos: ['0111110', '1100011', '1011101', '1011101', '1100011', '0110110', '0011100'], anoes: ['0011100', '0111110', '1101011', '1111111', '1111111', '0111110', '0010100'],
  elfos: ['0000110', '0001111', '0011110', '0111100', '1111000', '1110000', '1000000'], vikings: ['1000001', '1011101', '0111110', '0111110', '0101010', '0111110', '0011100'],
  aldeoes: ['0001000', '0011100', '0111110', '1111111', '0101010', '0101010', '0111110'], moeda: ['0011100', '0111110', '1101011', '1101011', '1101011', '0111110', '0011100'],
  coracao: ['0110110', '1111111', '1111111', '1111111', '0111110', '0011100', '0001000'], lupa: ['0111000', '1000100', '1000100', '1000100', '0111100', '0000110', '0000011'],
  troca: ['0011100', '0100010', '0000111', '1000000', '1110000', '0100010', '0011100'], lacre: ['0011100', '0111110', '1101011', '1110111', '1101011', '0111110', '0011100'],
  cadeado: ['0011100', '0100010', '0100010', '1111111', '1110111', '1110111', '1111111'],
};
function icon(name, x, y, c, k = 1) { const b = ICON[name]; g.fillStyle = c; for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (b[j][i] === '1') g.fillRect(x + i * k, y + j * k, k, k); }
function badge(rar, x, y) { const r = RAR[rar]; R(x, y, 9, 9, P.ink); R(x + 1, y + 1, 7, 7, r.d); const c = r.c; const cx = x + 4, cy = y + 4; g.fillStyle = c;
  const shape = { comum: () => { R(cx - 1, cy - 2, 3, 5, c); R(cx - 2, cy - 1, 5, 3, c); }, incomum: () => R(cx - 2, cy - 2, 5, 5, c), rara: () => { R(cx, cy - 3, 1, 7, c); R(cx - 1, cy - 2, 3, 5, c); R(cx - 2, cy - 1, 5, 3, c); R(cx - 3, cy, 7, 1, c); },
    epica: () => { for (let i = 0; i < 4; i++) R(cx - i, cy - 2 + i, i * 2 + 1, 1, c); }, lendaria: () => { R(cx, cy - 3, 1, 7, c); R(cx - 3, cy, 7, 1, c); R(cx - 1, cy - 1, 3, 3, c); }, prisma: () => { R(cx, cy - 3, 1, 7, P.pink); R(cx - 3, cy, 7, 1, P.cyan); R(cx - 1, cy - 1, 3, 3, P.white); } }; shape[rar](); }
// 'arco-íris' do Prisma e do confete: ciclo pelas cores da paleta, nunca cores novas
const CICLO = [P.red, P.orange, P.gold, P.grn, P.cyan, P.blue, P.pur, P.pink];
const CICLO_ESC = [P.redM, P.goldD, P.goldM, P.grnD, P.tealM, P.blueM, P.purM, P.redD];
const hsl = (h, s, l) => (l < 45 ? CICLO_ESC : CICLO)[Math.floor(((h % 360 + 360) % 360) / 45)];

// ---------- carta ----------
const statsU = (u, nv = 1) => { const C = D.classes.lista.find(c => c.id === u.classe), r = D.raridades.lista.find(r => r.id === u.raridade).mult, lv = 1 + 0.12 * (nv - 1); return { vid: Math.round(40 * C.vid * r * lv), atq: Math.round(6 * C.atq * r * lv), int: C.int_s, esp: C.espacos }; };
function slotIcon(x, y, n, c) { for (let i = 0; i < n; i++) { R(x + i * 6, y, 5, 5, c); R(x + i * 6 + 1, y + 1, 3, 3, P.ink); } }
function card(u, x, y, opts = {}) {
  const big = !!opts.big, w = big ? 128 : 72, h = big ? 176 : 100, ver = opts.versao || 'normal';
  const rk = ver === 'prisma' ? 'prisma' : u.raridade, r = RAR[rk];
  R(x, y, w, h, P.ink); R(x + 1, y + 1, w - 2, h - 2, r.c); R(x + 2, y + 2, w - 4, h - 4, r.m); R(x + 2, y + 2, w - 4, 1, r.c);
  const ax = x + 4, ay = y + (big ? 16 : 12), aw = w - 8, ah = big ? 100 : 52;
  R(ax - 1, ay - 1, aw + 2, ah + 2, r.d); R(ax, ay, aw, ah, P.night);
  if (ver === 'prisma') for (let i = 0; i < ah; i += 2) R(ax, ay + i, aw, 2, hsl(i * 7 + (opts.t || 0) * 120, 70, 32));
  if (ver === 'brilhante') { for (let i = 0; i < 6; i++) R(ax + 6 + i * 2, ay, 2, ah, P.white); }
  if (ver === 'prisma') dither(ax, ay + ah - 8, aw, 8, P.ink, 2); else R(ax, ay + ah - 8, aw, 8, P.plum);
  const s = sp(u.sprite); const k = s.cell.w > 32 || s.cell.h > 32 ? (big ? 2 : 1) : (big ? 3 : 2);
  g.save(); g.beginPath(); g.rect(ax, ay, aw, ah); g.clip(); spr(u.sprite, 'idle', opts.frame || 0, ax + aw / 2, ay + ah - 3, k, false, null, !!opts.silhueta); g.restore();
  const nome = T[`carta.${u.id}.nome`].toUpperCase(); tg.font = '32px m5x7'; const fit = big && tg.measureText(nome).width < w - 8; txt(fit ? nome : nome.length * 5 > w - 6 ? nome.split(' ')[0] : nome, x + w / 2, y + (fit ? 1 : 3), P.white, fit ? 'm6x11' : 'm5x7', r.d, 'center');
  if (opts.silhueta) { txt('?', x + w / 2, ay + ah / 2 - 4, P.mist, 'm6x11', null, 'center'); return; }
  badge(rk, x + w - 13, ay + 2);
  const st = statsU(u, opts.nivel || 1); const fy = ay + ah + 3;
  if (u.tipo === 'unidade') {
    icon(u.classe, x + 4, fy, P.white); icon(u.faccao, x + 13, fy, P.white); slotIcon(x + w - 4 - st.esp * 6, fy + 1, st.esp, P.white);
    if (big) txt(T['classe.' + u.classe], x + 23, fy, P.white, 'm5x7', r.d);
    if (big) txt(`VID ${st.vid}  ATQ ${st.atq}  ${String(st.int).replace('.', ',')}s`, x + 4, fy + 9, P.goldL, 'm5x7', r.d); else { icon('coracao', x + 4, fy + 10, P.red); txt(String(st.vid), x + 13, fy + 9, P.goldL, 'm5x7', r.d); icon('guerreiro', x + 36, fy + 10, P.bone); txt(String(st.atq), x + 45, fy + 9, P.goldL, 'm5x7', r.d); }
  }
  if (big) { wrap(T[`carta.${u.id}.efeito`], x + 4, fy + 20, w - 8, 'm5x7', 3, P.bone, r.d); txt(`${T['rar.' + u.raridade]}${ver !== 'normal' ? ' · ' + T['versao.' + ver] : ''}`, x + 4, y + h - 11, P.white, 'm5x7', r.d); }
  else if (u.tipo !== 'unidade') wrap(T[`carta.${u.id}.efeito`], x + 4, fy, w - 8, 'm3x6', 3, P.bone, r.d);
  if (ver === 'prisma') { for (let i = 0; i < 14; i++) { const px = ax + 2 + ((i * 37) % (aw - 4)), py = ay + 2 + ((i * 53) % (ah - 12)); R(px, py, 1, 1, P.white); if (i % 3 === 0) { R(px - 1, py, 3, 1, P.white); R(px, py - 1, 1, 3, P.white); } } }
}
function wrap(s, x, y, w, font, maxLines, c, sh) { const words = s.split(' '); let line = '', ly = y, n = 0; const lh = font === 'm6x11' ? 16 : 9; tg.font = `${FONT[font].px}px ${FONT[font].face}`;
  const meas = (t) => Math.round(tg.measureText(t).width / TEXT_K[font]);
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (meas(t) > w && line) { txt(line, x, ly, c, font, sh); ly += lh; line = wd; if (++n >= maxLines) return; } else line = t; } if (line) txt(line, x, ly, c, font, sh); }
function cardBack(x, y, glow, t = 0) {
  if (glow) { R(x - 3, y - 3, 78, 106, glow === 'prisma' ? hsl(t * 200, 90, 70) : glow); dither(x - 3, y - 3, 78, 106, P.ink, 2); }
  R(x, y, 72, 100, P.ink); R(x + 1, y + 1, 70, 98, P.dusk); R(x + 2, y + 2, 68, 96, P.plum);
  for (let i = 6; i < 94; i += 4) R(x + 6, y + i, 60, 2, P.purD);
  R(x + 22, y + 36, 28, 28, P.goldD); R(x + 23, y + 37, 26, 26, P.gold); R(x + 26, y + 40, 20, 20, P.plum); icon('moeda', x + 29, y + 43, P.gold, 2);
}
function pack(x, y, tipo, price, opts = {}) { // embalagem gerada em código 40x52
  const cor = { feira: [P.redM, P.red], povo: [P.blueM, P.blue], pequeno: [P.grnD, P.grn], colecionador: [P.goldM, P.gold], antigo: [P.stoneD, P.stone] }[tipo];
  R(x, y, 40, 52, P.ink); R(x + 1, y + 1, 38, 50, cor[1]); R(x + 2, y + 2, 36, 48, cor[0]);
  for (let i = 0; i < 48; i += 6) R(x + 2, y + 2 + i, 36, 1, cor[1]);
  for (let i = 0; i < 36; i += 3) R(x + 3 + i, y + 7, 2, 1, P.goldL); // linha de rasgo
  R(x + 6, y + 13, 28, 24, P.bone); R(x + 7, y + 14, 26, 22, P.white);
  if (opts.icone) icon(opts.icone, x + 13, y + 18, cor[0], 2); else icon('moeda', x + 13, y + 18, P.goldM, 2);
  txt({ feira: 'FEIRA', povo: 'POVO', pequeno: 'MIÚDO', colecionador: 'COLEC.', antigo: 'ANTIGO' }[tipo], x + 20, y + 39, P.white, 'm3x6', P.ink, 'center');
  if (price !== null) { R(x + 26, y + 2, 16, 9, P.ink); R(x + 27, y + 3, 14, 7, P.goldL); txt(String(price), x + 34, y + 3, P.ink, 'm3x6', null, 'center'); }
  if (opts.lacrado) { R(x - 2, y + 21, 44, 10, P.redD); R(x - 2, y + 22, 44, 8, P.red); txt(`LACRE +${opts.lacrado}`, x + 20, y + 22, P.white, 'm5x7', P.redD, 'center'); }
}

// ---------- cenário: céu, ruínas, chão e barraca (código, paleta única) ----------
function field(night = false) {
  for (let y = 0; y < 92; y++) R(0, y, W, 1, night ? (y < 50 ? P.ink : P.night) : (y < 34 ? P.blueD : y < 64 ? P.blueM : P.stone));
  // ruínas ao fundo
  g.fillStyle = night ? P.plum : P.stoneD;
  for (const [x, w, h] of [[150, 30, 40], [190, 14, 56], [214, 46, 28], [300, 20, 48], [330, 40, 34], [390, 26, 52]]) { g.fillRect(x, 92 - h, w, h); for (let i = 0; i < w; i += 6) g.fillRect(x + i, 92 - h - 3, 3, 3); }
  for (let y = 92; y < H; y++) R(0, y, W, 1, y < 95 ? P.grassLL : y < 99 ? P.grassL : y < 190 ? P.grass : P.grassD);
  g.fillStyle = P.grassL; for (let y = 102; y < H; y += 7) for (let x = (y * 13) % 17; x < W; x += 19) g.fillRect(x, y, 3, 1);
  // barraca
  const bx = 6, by = 40; R(bx, by + 26, 50, 40, P.dirtD); R(bx + 2, by + 28, 46, 36, P.dirt); for (let i = 0; i < 46; i += 6) R(bx + 2 + i, by + 28, 1, 36, P.dirtL);
  for (let i = 0; i < 58; i += 8) { R(bx - 4 + i, by + 10, 8, 16, i % 16 ? P.red : P.bone); } R(bx - 4, by + 8, 58, 3, P.redD); R(bx - 4, by + 24, 58, 3, P.redD);
  R(bx + 4, by + 46, 42, 4, P.dirtLL); // balcão
}

// ---------- cenas ----------
const U = (id) => D.cartas_unidades.lista.find(u => u.id === id) || D.cartas_especiais.lista.find(u => u.id === id);
function hud(onda = 3, ouro = 42) {
  R(0, 0, W, 13, P.ink); R(0, 12, W, 1, P.plum); let x = 4;
  x += txt(`ONDA ${onda}/15`, x, 3, P.white) + 6; x += txt('▸JULG. EM 1', x, 3, P.gold) + 10;
  icon('moeda', x, 3, P.gold); x += 9; x += txt(`${ouro}(+4)`, x, 3, P.goldL) + 8;
  icon('coracao', x, 3, P.red); x += 9; x += txt('18/20', x, 3) + 8;
  for (const [ic, n] of [['lupa', 3], ['troca', 2], ['lacre', 1]]) { icon(ic, x, 3, P.bone); x += 9; x += txt(String(n), x, 3) + 5; }
  let gx = W - 66; for (const [r, n] of [['rara', 2], ['epica', 9], ['lendaria', 27]]) { badge(r, gx, 2); gx += 10; gx += txt(String(n), gx, 3, RAR[r].c) + 5; }
}
function synergies(x, y) {
  const L = [['humanos', '2/4', true], ['anoes', '1/2', false], ['guerreiro', '2/4', true], ['atirador', '1/2', false], ['aldeoes', '2/3', false]];
  L.forEach(([ic, v, on], i) => { R(x, y + i * 13, 26, 12, P.ink); R(x + 1, y + i * 13 + 1, 24, 10, on ? P.purM : P.plum); icon(ic, x + 3, y + i * 13 + 3, on ? P.white : P.mist); txt(v, x + 12, y + i * 13 + 2, on ? P.white : P.mist, 'm3x6'); });
}
const slots = () => { const S = []; for (let c = 0; c < 3; c++) for (let r = 0; r < 5; r++) S.push([132 - c * 26, 110 + r * 14]); return S; };
function scenePrep() {
  field(); hud();
  // vitrine: espaços + unidades
  const S = slots(); S.slice(0, 15).forEach(([x, y], i) => R(x - 9, y - 1, 18, 2, i < 10 ? P.grassD : P.grass));
  const army = [['humans/sword', 0], ['humans/shield', 1], ['dwarfs/dwarfwarrior', 2], ['humans/spear', 3], ['dwarfs/dwarfminer', 4], ['humans/archer', 10], ['dwarfs/dwarfhunter', 11], ['humans/mage', 12], ['dwarfs/dwarfgrenadier', 13]];
  army.forEach(([ref, i], n) => spr(ref, 'idle', n % 4, S[i][0], S[i][1], 1));
  // dono e balcão
  spr('villagers2/merchant', 'idle_b', 2, 18, 86, 1); spr('villagers2/miner', 'work', 1, 40, 86, 1);
  synergies(4, 104); txt('VITRINE 9/10', 106, 16, P.bone, 'm5x7', P.ink, 'center');
  // painel de baixo
  panel(0, 168, W, 72, P.night);
  txt('PRATELEIRA', 6, 171, P.gold, 'm5x7', P.ink); txt('REROLL 5', 140, 173, P.bone, 'm3x6', null, 'right');
  pack(6, 183, 'feira', 14); pack(52, 183, 'povo', 18, { icone: 'anoes' }); pack(98, 183, 'pequeno', 8);
  R(146, 172, 1, 64, P.plum);
  txt('ESTOQUE', 152, 171, P.gold); pack(152, 182, 'feira', null, { lacrado: 1 });
  R(200, 172, 1, 64, P.plum);
  txt('BOLSO', 206, 171, P.gold); for (let i = 0; i < 3; i++) { R(206 + i * 22, 184, 20, 28, P.ink); R(207 + i * 22, 185, 18, 26, i < 2 ? RAR[i ? 'rara' : 'comum'].m : P.plum); }
  spr('elves/elfarcher', 'idle', 0, 216, 207, 1); spr('dwarfs/dwarfwarrior', 'idle', 0, 238, 207, 1);
  txt('NÚCLEOS', 206, 215, P.gold, 'm3x6'); for (let i = 0; i < 3; i++) { R(206 + i * 14, 224, 12, 12, P.ink); R(207 + i * 14, 225, 10, 10, i === 0 ? P.blueM : P.plum); } icon('lupa', 209, 227, P.white);
  R(276, 172, 1, 64, P.plum);
  txt('CHANCES  1-4     ÚLTIMA', 282, 171, P.cyan);
  const rows = [['comum', '62,7%', '41,7%'], ['incomum', '28%', '35%'], ['rara', '8%', '18%'], ['epica', '1,2%', '4,5%'], ['lendaria', '0,15%', '0,8%']];
  
  rows.forEach(([r, a, b], i) => { badge(r, 282, 179 + i * 8); txt(a, 300, 180 + i * 8, P.bone); txt(b, 360, 180 + i * 8, RAR[r].c); });
  button(290, 223, 128, 'ABRIR A FEIRA!', P.goldM, P.gold, true);
}
function sceneOpen() {
  field(); hud(3, 28); dither(0, 13, W, H - 13, P.ink, 3);
  const xs = [13, 95, 177, 259, 341], y = 30;
  card(U('h_espadachim'), xs[0], y); card(U('a_minerador'), xs[1], y); card(U('h_mago'), xs[2], y);
  cardBack(xs[3], y, P.pur, 0); txt('VIRAR', xs[3] + 36, y + 103, P.pur, 'm5x7', P.ink, 'center');
  cardBack(xs[4], y, null); txt('ÚLTIMA', xs[4] + 36, y + 103, P.gold, 'm5x7', P.ink, 'center');
  // partículas da rara recém-virada
  for (let i = 0; i < 16; i++) R(xs[2] + 36 + Math.round(Math.cos(i) * (40 + i % 5 * 4)), y + 46 + Math.round(Math.sin(i * 1.7) * 44), 2, 2, i % 2 ? P.blue : P.white);
  txt('PACOTE DA FEIRA · 3/5', W / 2, 17, P.bone, 'm5x7', P.ink, 'center');
  panel(8, 176, 196, 58, P.night); txt('CARIMBOS', 14, 180, P.gold);
  [['lupa', 'LUPA', 3, 'espia a próxima'], ['troca', 'TROCA', 2, 'troca 1 carta'], ['lacre', 'LACRE', 1, 'guarda 1 carta']].forEach(([ic, n, q, d], i) => { R(14, 190 + i * 14, 186, 13, P.plum); icon(ic, 17, 193 + i * 14, P.white); txt(`${n} ×${q}`, 27, 192 + i * 14, P.white); txt(d, 196, 193 + i * 14, P.mist, 'm3x6', null, 'right'); });
  panel(212, 176, 206, 58, P.night); txt('GARANTIA', 218, 180, P.gold);
  [['rara', 'Rara ou melhor em', 2, 3], ['epica', 'Épica ou melhor em', 9, 12], ['lendaria', 'Lendária em', 27, 40]].forEach(([r, t, n, max], i) => { badge(r, 218, 191 + i * 14); txt(`${t} ${n}`, 230, 192 + i * 14, P.bone, 'm5x7'); R(342, 195 + i * 14, 68, 3, P.ink); R(342, 195 + i * 14, Math.round(68 * (max - n) / max), 3, RAR[r].c); });
  button(130, 152, 80, 'VIRAR (A)', P.goldM, P.gold, true); button(216, 152, 80, 'TUDO (Y)', P.plum, P.mist);
}
function scenePrism() {
  field(); dither(0, 0, W, H, P.ink, 3); R(0, 0, W, H, P.ink);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const c = CICLO_ESC[i % 8]; for (let d = 30; d < 280; d += 2) { const px = Math.round(213 + Math.cos(a) * d), py = Math.round(118 + Math.sin(a) * d); if ((d >> 1) % 2) R(px, py, 2, 2, c); } }
  card(U('a_rei'), 149, 30, { big: true, versao: 'prisma', t: 0.3 });
  for (let i = 0; i < 90; i++) { const x = (i * 97) % W, y = 14 + (i * 61) % 200; if (x > 140 && x < 285 && y > 24 && y < 212) continue; R(x, y, 2, 3, hsl(i * 41, 85, 65)); }
  txt('JACKPOT!', W / 2, 8, P.goldL, 'm6x11', P.goldD, 'center');
  txt('+50 OURO · TODO ANÃO +1 NÍVEL', W / 2, 218, P.white, 'm5x7', P.ink, 'center'); txt('PRISMA · 1 em 2.000 cartas', W / 2, 228, P.cyan, 'm3x6', null, 'center');
}
function sceneCombat() {
  field(); hud(9, 61);
  R(110, 15, 206, 7, P.ink); R(111, 16, 204, 5, P.redD); R(111, 16, 120, 5, P.red); txt('ONDA 9 · 11/16 INIMIGOS', 213, 23, P.bone, 'm3x6', P.ink, 'center');
  const S = slots(); const army = ['humans/sword', 'humans/shield', 'dwarfs/dwarfwarrior', 'humans/spear', 'dwarfs/dwarfminer', 'humans/archer', 'dwarfs/dwarfhunter', 'elves/elfarcher', 'humans/mage', 'dwarfs/dwarfgrenadier', 'elves/elfspear', 'humans/halberd'];
  const pos = [[168, 112], [160, 132], [176, 152], [150, 172], [184, 196], [100, 112], [96, 140], [98, 166], [72, 126], [70, 156], [140, 148], [154, 212]];
  army.forEach((ref, i) => { const melee = i < 5 || i > 9; const anim = melee ? (i % 2 ? 'attack' : 'walk') : 'attack'; spr(ref, anim, (i * 2) % 5, pos[i][0], pos[i][1], 1); R(pos[i][0] - 6, pos[i][1] - 27, 12, 2, P.ink); R(pos[i][0] - 6, pos[i][1] - 27, 8 + (i % 4), 2, P.grn); });
  const foes = [['forest_animals/boar', 196, 114], ['forest_animals/wolf', 204, 134], ['forest_animals/wolf', 200, 156], ['forest_animals/fox', 192, 176], ['forest_animals/boar', 214, 200], ['forest_animals/wolf', 252, 120], ['forest_animals/wolf', 270, 150], ['forest_animals/fox', 300, 186], ['forest_animals/boar', 320, 130], ['forest_animals/wolf', 350, 170], ['forest_animals/fox', 380, 116], ['forest_animals/wolf', 400, 206]];
  foes.forEach(([ref, x, y], i) => { spr(ref, i < 5 ? 'attack' : 'walk', i % 4, x, y, 1, true); R(x - 6, y - 25, 12, 2, P.ink); R(x - 6, y - 25, 4 + (i % 7), 2, P.red); });
  // efeitos e números
  for (const [x, y, n, c] of [[196, 88, '12', P.white], [206, 110, '7', P.white], [214, 172, '24!', P.gold], [176, 124, 'BLOQ', P.cyan]]) txt(n, x, y, c, 'm3x6', P.ink);
  for (let i = 0; i < 12; i++) R(204 + Math.round(Math.cos(i) * 8), 196 + Math.round(Math.sin(i) * 5), 2, 2, i % 2 ? P.orange : P.gold); // granada explodindo
  synergies(4, 104);
  R(0, 226, W, 14, P.ink); txt('1×  [2×]  3×', 6, 229, P.bone); R(84, 229, 2, 7, P.bone); R(88, 229, 2, 7, P.bone); txt('PAUSA', 94, 229, P.bone); txt('LB/RB velocidade', W - 6, 230, P.mist, 'm3x6', null, 'right');
}
function sceneCatalog() {
  R(0, 0, W, H, P.night);
  ['humanos', 'anoes', 'elfos', 'vikings', 'aldeoes'].forEach((f, i) => { R(16 + i * 22, 3, 20, 12, i ? P.dirt : P.dirtLL); icon(f, 22 + i * 22, 5, i ? P.bone : P.ink); });
  R(128, 3, 54, 12, P.dirt); txt('BESTIÁRIO', 155, 5, P.bone, 'm3x6', null, 'center'); txt('CATÁLOGO 31/58', W - 8, 5, P.gold, 'm5x7', P.ink, 'right');
  R(8, 15, 410, 222, P.dirtD); R(11, 18, 404, 216, P.dirtL); R(13, 20, 198, 212, P.bone); R(215, 20, 198, 212, P.bone); R(211, 20, 4, 212, P.dirt);
  txt('HUMANOS', 20, 24, P.dirtD, 'm5x7', null); txt('9/12', 204, 24, P.redM, 'm5x7', null, 'right');
  const H_ = D.cartas_unidades.lista.filter(u => u.faccao === 'humanos'); const falta = new Set(['h_arquimago', 'h_rei', 'h_cavaleiro_real']);
  H_.forEach((u, i) => { const x = 18 + (i % 4) * 48, y = 35 + Math.floor(i / 4) * 60; const r = RAR[u.raridade]; const miss = falta.has(u.id);
    R(x, y, 44, 56, P.ink); R(x + 1, y + 1, 42, 54, miss ? P.stoneD : r.c); R(x + 2, y + 2, 40, 52, miss ? P.stone : r.m); R(x + 4, y + 4, 36, 34, P.night);
    g.save(); g.beginPath(); g.rect(x + 4, y + 4, 36, 34); g.clip(); spr(u.sprite, 'idle', 0, x + 22, y + 36, 1, false, null, miss); g.restore();
    if (!miss) badge(u.raridade, x + 32, y + 40); else txt('?', x + 22, y + 13, P.stoneL, 'm6x11', null, 'center');
    if (u.id === 'h_espadachim') { for (let k = 0; k < 4; k++) R(x + 8 + k * 3, y + 4, 1, 34, P.white); }
    if (i === 1) { R(x - 2, y - 2, 48, 1, P.ink); R(x - 2, y + 57, 48, 1, P.ink); R(x - 2, y - 2, 1, 60, P.ink); R(x + 45, y - 2, 1, 60, P.ink); }
    if (miss) txt('???', x + 22, y + 44, P.stoneL, 'm5x7', null, 'center'); });
  txt('Completa: Povo fixo + 5% VID', 112, 218, P.dirtD, 'm5x7', null, 'center');
  card(U('h_lanceiro'), 250, 24, { big: true });
  txt('Cai em: Feira, Povo', 314, 202, P.dirtD, 'm5x7', null, 'center'); txt('Brilhante não · Prisma não', 314, 210, P.dirtD, 'm5x7', null, 'center');
  button(250, 219, 128, 'COMPRAR FALTANTE: 50', P.blueM, P.blue);
}
function sceneCards() {
  R(0, 0, W, H, P.night); for (let y = 0; y < H; y += 8) R(0, y, W, 1, P.plum);
  card(U('h_espadachim'), 8, 34, { big: true }); card(U('e_mago'), 149, 34, { big: true, frame: 1 }); card(U('a_rei'), 290, 34, { big: true, versao: 'prisma', t: 0.6 });
  txt('COMUM', 72, 14, RAR.comum.c, 'm6x11', P.ink, 'center'); txt('RARA', 213, 14, RAR.rara.c, 'm6x11', P.ink, 'center'); txt('PRISMA', 354, 14, P.cyan, 'm6x11', P.ink, 'center');
}

const SCENES = { preparacao: scenePrep, abertura: sceneOpen, prisma: scenePrism, combate: sceneCombat, catalogo: sceneCatalog, cartas: sceneCards };
window.renderScene = (name, k = 3) => { g.clearRect(0, 0, W, H); SCENES[name](); out.width = W * k; out.height = H * k; og.imageSmoothingEnabled = false; og.drawImage(cv, 0, 0, W * k, H * k); return true; };
window.ready = (async () => {
  M = await (await fetch('../../assets/minifolks/manifest.json')).json();
  for (const n of ['classes', 'raridades', 'cartas_unidades', 'cartas_especiais']) D[n] = await (await fetch(`../../data/${n}.json`)).json();
  T = await (await fetch('../../data/strings/pt-BR.json')).json();
  for (const f of ['m5x7', 'm3x6', 'm6x11']) { const ff = new FontFace(f, `url(../../assets/fonts/${f}.ttf)`); await ff.load(); document.fonts.add(ff); }
  calibrate(); window.__fontInfo = { TEXT_K, TOP };
  const refs = new Set(['villagers2/merchant', 'villagers2/miner', 'forest_animals/boar', 'forest_animals/wolf', 'forest_animals/fox']);
  for (const u of D.cartas_unidades.lista) refs.add(u.sprite);
  await preload([...refs]);
  return { TEXT_K, TOP };
})();
