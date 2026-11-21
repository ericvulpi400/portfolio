// Peças de interface e cenário do Bazar das Ruínas, desenhadas em código (pixel art, sem IA, sem transparência).
// Uso: UI.alvo(ctx) define onde desenhar; todas as funções desenham em pixels inteiros, luz do alto à esquerda.
(() => {
'use strict';
const A = window.ARTE;
const INK = A.INK;
// rampas extras (escuro -> claro), estilo "estofado" das cartas de referência: saturadas e com brilho forte
const RP = Object.assign({}, A.RP, {
  lona: ['#4e0c1c', '#861a2a', '#c4303a', '#ea5a4c', '#ff9878', '#ffd8c8'],
  creme: ['#6e5236', '#a8885e', '#d8bc8c', '#f0dcb4', '#fff6e2'],
  azulona: ['#0e2a5c', '#1a4690', '#2c6cc8', '#4c94ec', '#9ccaff', '#e4f2ff'],
  verdona: ['#0e3a22', '#1a5e30', '#2a8a40', '#48b056', '#90dc84', '#e0f8d8'],
  balcao: ['#3a1e10', '#5e341c', '#8a542c', '#b47a42', '#dcac6c'],
  ceu: ['#2e4c94', '#3e66b8', '#5888d4', '#82b0ea', '#c0e0f8'],
  nuvem: ['#7c98c4', '#a8c0e0', '#d6e4f2', '#f2f6fc', '#ffffff'],
  folha: ['#0e2a1c', '#1c4a26', '#2e702e', '#4e9a38', '#86c650', '#c4ec7c'],
  grama: ['#1c3c1c', '#2c5e26', '#428a30', '#64ae3c', '#96d058'],
  terra: ['#3a2416', '#5e3c24', '#865c36', '#ac804c', '#d4aa70'],
  sol: ['#e0782a', '#f4a63c', '#ffd25a', '#ffee96', '#fffbe0'],
  noite: ['#120c1c', '#1e1430', '#2c1e44', '#3e2c5c', '#584478'],
  crep: ['#1e1238', '#3a1a52', '#6a2462', '#a83a62', '#e0645a', '#f8a058', '#ffd27a'],
  telha: ['#2a1420', '#46202c', '#6a3036', '#8e4a40', '#b46a50'],
});
const CLARO = '#fff6e2', TINTA = '#3a2416';
const ARCO = A.ARCO_IRIS;
let g = null; const UI = { RP, INK, CLARO, TINTA, ARCO };
UI.alvo = (ctx) => { g = ctx; g.imageSmoothingEnabled = false; };
UI.g = () => g;

// ------------------------------------------------------------------ primitivas
const R = (x, y, w, h, c) => { if (w <= 0 || h <= 0 || !c) return; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const P = (x, y, c) => R(x, y, 1, 1, c);
let semente = 7; const rnd = () => { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 4294967296; };
const semear = (s) => { semente = (s * 2654435761) >>> 0 || 1; };
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const PADROES = new Map();
function padrao(c, t) { // pontilhado ordenado como padrão de preenchimento (rápido): t em 0..1
  const n = Math.max(0, Math.min(16, Math.round(t * 16))); const k = c + n; let p = PADROES.get(k);
  if (!p) { const cv = document.createElement('canvas'); cv.width = cv.height = 4; const q = cv.getContext('2d'); q.fillStyle = c; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (BAYER[j][i] < n) q.fillRect(i, j, 1, 1); p = g.createPattern(cv, 'repeat'); PADROES.set(k, p); }
  return p;
}
function pont(x, y, w, h, c, t) { if (t <= 0 || w <= 0 || h <= 0) return; g.fillStyle = padrao(c, t); g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function circ(cx, cy, r, c) { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); R(cx - w, cy + y, w * 2 + 1, 1, c); } }
function elip(cx, cy, rx, ry, c) { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); R(cx - w, cy + y, w * 2 + 1, 1, c); } }
function linha(x1, y1, x2, y2, c) { const n = Math.max(1, Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let i = 0; i <= n; i++) P(Math.round(x1 + (x2 - x1) * i / n), Math.round(y1 + (y2 - y1) * i / n), c); }
function camada(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ant = g; UI.alvo(cv.getContext('2d')); fn(); g = ant; return cv; }
const ease = (t) => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
Object.assign(UI, { R, P, rnd, semear, pont, circ, elip, linha, camada, ease, mola: (t) => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(2, -9 * t) * Math.cos(t * 10) });

// retângulo com cantos cortados (raio 1 ou 2) — base de todo painel
function caixa(x, y, w, h, c, corte = 1) { R(x + corte, y, w - 2 * corte, h, c); R(x, y + corte, w, h - 2 * corte, c); if (corte === 2) { R(x + 1, y + 1, w - 2, h - 2, c); } }
// painel com relevo de 3 tons e contorno escuro
function painel(x, y, w, h, rp, o = {}) {
  const k = o.corte ?? 2;
  caixa(x, y, w, h, o.contorno || INK, k);
  caixa(x + 1, y + 1, w - 2, h - 2, rp[o.base ?? 1], Math.max(1, k - 1));
  R(x + 2, y + 2, w - 4, h - 4 - (o.fundo ?? 1), rp[o.cheio ?? 2]);
  R(x + 2, y + 1, w - 4, 1, rp[o.luz ?? 3]); R(x + 1, y + 2, 1, h - 4, rp[o.luz ?? 3]);
  R(x + 2, y + 2, w - 4, 1, rp[(o.luz ?? 3) + (rp.length > 4 ? 1 : 0)] || rp[3]);
}
UI.caixa = caixa; UI.painel = painel;

// madeira: tábua com veio em aglomerados, nós e contorno
function tabua(x, y, w, h, rp = RP.madeira, s = 1, o = {}) {
  R(x, y, w, h, o.contorno || rp[0]); R(x + 1, y + 1, w - 2, h - 2, rp[2]);
  semear(s); const n = Math.floor(w * h / 36);
  for (let i = 0; i < n; i++) { const gx = x + 2 + Math.floor(rnd() * Math.max(1, w - 6)), gy = y + 2 + Math.floor(rnd() * Math.max(1, h - 4)); const L = 3 + Math.floor(rnd() * 9); R(gx, gy, Math.min(L, x + w - 2 - gx), 1, rnd() < 0.62 ? rp[1] : rp[3]); }
  if (w > 24 && h > 5 && !o.semNo) { const kx = x + 6 + Math.floor(rnd() * (w - 14)), ky = y + Math.floor(h / 2); R(kx - 1, ky - 1, 4, 3, rp[1]); R(kx, ky, 2, 1, rp[0]); }
  R(x + 1, y + 1, w - 2, 1, rp[3]); if (h > 4) R(x + 1, y + h - 2, w - 2, 1, rp[1]);
  if (o.brilho) R(x + 1, y + 1, w - 2, 1, rp[4]);
}
function prego(x, y) { P(x, y, RP.ouro[4]); P(x + 1, y, RP.ouro[3]); P(x, y + 1, RP.ouro[2]); P(x + 1, y + 1, RP.ouro[0]); }
function corda(x1, y1, x2, y2) { const n = Math.max(1, Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let i = 0; i <= n; i++) P(Math.round(x1 + (x2 - x1) * i / n), Math.round(y1 + (y2 - y1) * i / n), i % 3 ? RP.creme[1] : RP.creme[3]); }
function catenaria(x1, x2, y, queda, cor, cb) { let py = null; for (let x = x1; x <= x2; x++) { const t = (x - x1) / (x2 - x1), yy = Math.round(y + Math.sin(t * Math.PI) * queda); if (py !== null) for (let k = Math.min(py, yy); k <= Math.max(py, yy); k++) P(x, k, cor); else P(x, yy, cor); py = yy; if (cb) cb(x, yy, t); } }
const quedaEm = (x1, x2, y, queda, x) => Math.round(y + Math.sin((x - x1) / (x2 - x1) * Math.PI) * queda);
Object.assign(UI, { tabua, prego, corda, catenaria, quedaEm });

// ------------------------------------------------------------------ texto (m5x7 binarizado, escalas inteiras, acentos compostos)
const tcv = document.createElement('canvas'), tcx = tcv.getContext('2d', { willReadFrequently: true });
let TOPO = 3, ALT = 7; const PAD = 3; const TC = new Map();
const AC = { '́': [[1, -2], [2, -3]], '̀': [[1, -3], [2, -2]], '̂': [[0, -2], [1, -3], [2, -2]], '̃': [[0, -2], [1, -3], [2, -2], [3, -3]], '̧': [[1, 7], [2, 8], [1, 8]] };
UI.calibra = () => { tcv.width = 40; tcv.height = 40; tcx.clearRect(0, 0, 40, 40); tcx.font = '16px m5x7'; tcx.textBaseline = 'top'; tcx.fillStyle = '#000'; tcx.fillText('H', 2, 2);
  const d = tcx.getImageData(0, 0, 40, 40).data; let a = 99, b = 0; for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) if (d[(y * 40 + x) * 4 + 3] > 110) { a = Math.min(a, y); b = Math.max(b, y); } TOPO = a - 2; ALT = b - a + 1; TC.clear(); };
function tira(s, cor) {
  const k = s + '|' + cor; if (TC.has(k)) return TC.get(k);
  let base = ''; const marcas = []; for (const ch of [...String(s).normalize('NFD')]) { if (AC[ch]) marcas.push([base.length - 1, ch]); else if (/[̀-ͯ]/.test(ch)) continue; else base += ch; }
  tcx.font = '16px m5x7'; const w = Math.max(1, Math.ceil(tcx.measureText(base).width) + 1); tcv.width = w; tcv.height = PAD + ALT + 6;
  tcx.font = '16px m5x7'; tcx.textBaseline = 'top'; tcx.fillStyle = '#000'; tcx.fillText(base, 0, PAD - TOPO);
  const id = tcx.getImageData(0, 0, w, tcv.height); const [r, gg, b] = [1, 3, 5].map(i => parseInt(cor.slice(i, i + 2), 16));
  for (let i = 0; i < id.data.length; i += 4) { const a = id.data[i + 3] > 110 ? 255 : 0; id.data[i] = r; id.data[i + 1] = gg; id.data[i + 2] = b; id.data[i + 3] = a; }
  for (const [i, m] of marcas) { const bch = base[i]; const px = Math.round(tcx.measureText(base.slice(0, i)).width), cw = Math.round(tcx.measureText(bch).width); const up = bch === bch.toUpperCase();
    for (const [dx, dy] of AC[m]) { const ax = px + Math.floor((cw - 4) / 2) + dx, ay = PAD + (up ? 0 : 2) + dy; if (ax >= 0 && ax < w && ay >= 0 && ay < tcv.height) { const j = (ay * w + ax) * 4; id.data[j] = r; id.data[j + 1] = gg; id.data[j + 2] = b; id.data[j + 3] = 255; } } }
  const c = document.createElement('canvas'); c.width = w; c.height = tcv.height; c.getContext('2d').putImageData(id, 0, 0);
  // largura visível (última coluna com pixel)
  let vis = 0; for (let x = w - 1; x >= 0 && !vis; x--) for (let y = 0; y < c.height; y++) if (id.data[(y * w + x) * 4 + 3]) { vis = x + 1; break; }
  const res = { c, w: vis }; TC.set(k, res); return res;
}
function largura(s, k = 1) { return tira(s, '#000000').w * k; }
// texto: (x, y) = topo das maiúsculas; o.k escala; o.al 'esq'|'centro'|'dir'; o.sombra cor (queda 1 px*k); o.contorno cor (8 vizinhos)
function texto(s, x, y, cor = CLARO, o = {}) {
  const k = o.k || 1, t = tira(s, cor); let xx = x; if (o.al === 'centro') xx -= Math.floor(t.w * k / 2); else if (o.al === 'dir') xx -= t.w * k; xx = Math.round(xx); const yy = Math.round(y) - PAD * k;
  const desenha = (tt, dx, dy) => g.drawImage(tt.c, xx + dx, yy + dy, tt.c.width * k, tt.c.height * k);
  if (o.contorno) { const c = tira(s, o.contorno); for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) desenha(c, a * k, b * k); if (o.sombra) for (let d = 1; d <= (o.queda || 1); d++) { const s2 = tira(s, o.sombra); for (const a of [-1, 0, 1]) desenha(s2, a * k, (1 + d) * k); } }
  else if (o.sombra) desenha(tira(s, o.sombra), 0, k);
  if (o.rampa) { // cores por linha (de cima para baixo) — para o logotipo
    const rr = o.rampa; for (let row = 0; row < t.c.height; row++) { const f = Math.max(0, Math.min(rr.length - 1, Math.floor((row - PAD) * rr.length / ALT))); const tt = tira(s, rr[f]); g.drawImage(tt.c, 0, row, tt.c.width, 1, xx, yy + row * k, tt.c.width * k, k); }
  } else desenha(t, 0, 0);
  return t.w * k;
}
Object.assign(UI, { texto, largura, ALT: () => ALT });

// ------------------------------------------------------------------ ícones 9x9 (letra -> cor), opcional borda de adesivo
const IC = {
  moeda: [{ k: RP.ouro[0], d: RP.ouro[1], m: RP.ouro[2], l: RP.ouro[3], w: RP.ouro[5] }, ['..kkkkk..', '.klllllk.', 'klwlllmdk', 'klwmkmmdk', 'kllmkmmdk', 'klmmkmmdk', 'kmmmmmddk', '.kdddddk.', '..kkkkk..']],
  coracao: [{ k: RP.lona[0], d: RP.lona[1], m: RP.lona[2], l: RP.lona[3], w: RP.lona[5] }, ['.kk...kk.', 'kwlk.kmmk', 'klmmkmmdk', 'kmmmmmmdk', 'kmmmmmddk', '.kmmmddk.', '..kmddk..', '...kdk...', '....k....']],
  sino: [{ k: RP.ouro[0], d: RP.ouro[1], m: RP.ouro[2], l: RP.ouro[3], w: RP.ouro[5] }, ['....k....', '...klk...', '..klwmk..', '..klmmk..', '.klmmmdk.', '.klmmmdk.', 'klmmmmmdk', 'kkkkkkkkk', '...kdk...']],
  lupa: [{ k: INK, d: RP.madeira[2], g: RP.azulona[3], w: CLARO, m: RP.azulona[2] }, ['.kkkk....', 'kmwggk...', 'kwggmk...', 'kggggk...', 'kmggmk...', '.kkkkdk..', '.....kdk.', '......kdk', '.......k.']],
  troca: [{ k: INK, a: RP.azulona[4], b: RP.azulona[2] }, ['..kkkkk..', '.kaaaaak.', 'kak...kk.', 'kk....kak', '.......k.', '.k.......', 'kak....kk', '.kk...kak', '..kkkkk..']],
  lacre: [{ k: RP.lona[0], m: RP.lona[2], l: RP.lona[3], d: RP.lona[1] }, ['..kkkkk..', '.kllmmdk.', 'klmmmmmdk', 'kmmkmkmdk', 'kmmmkmmdk', 'kmmkmkmdk', 'kmmmmmddk', '.kddddkk.', '..kkkkk..']],
  espada: [{ k: INK, m: RP.aco[2], l: RP.aco[4], h: RP.madeira[3], o: RP.ouro[3] }, ['......kk.', '.....klk.', '....klk..', '...klk...', 'k.klk....', '.kok.....', '.hko.....', 'h..k.....', '.........']],
  livro: [{ k: INK, r: RP.lona[2], l: RP.lona[3], d: RP.lona[1], p: RP.creme[3], o: RP.ouro[3] }, ['.kkkkkkk.', 'kllrrrrrk', 'klrrorrdk', 'klrooordk', 'klrrorrdk', 'klrrrrrdk', 'kdddddddk', 'kpppppppk', '.kkkkkkk.']],
  engrenagem: [{ k: INK, m: RP.aco[2], l: RP.aco[3], d: RP.aco[1] }, ['...kkk...', '.k.klk.k.', 'kkklllkkk', '.klk.kdk.', 'kll...ddk', '.klk.kdk.', 'kkkdddkkk', '.k.kdk.k.', '...kkk...']],
  porta: [{ k: INK, m: RP.madeira[2], l: RP.madeira[3], d: RP.madeira[1], o: RP.ouro[3] }, ['.kkkkkk..', 'klllmmdk.', 'klmmmmdk.', 'klmmmmdk.', 'klmmmodk.', 'klmmmmdk.', 'klmmmmdk.', 'kdddddddk', 'kkkkkkkkk']],
  bandeira: [{ k: INK, r: RP.lona[2], l: RP.lona[4], h: RP.madeira[3] }, ['kk.......', 'khkkkkk..', 'khllrrrk.', 'khlrrrrrk', 'khrrrrrk.', 'khkkkkk..', 'kh.......', 'kh.......', 'kk.......']],
  estrela: [{ k: INK, o: RP.ouro[3], l: RP.ouro[5], d: RP.ouro[1] }, ['....k....', '...klk...', 'kkkklokkk', 'kloooooddk', '.kooooodk.', '..koodok.', '.kook.kok', '.kdk...kdk', '.kk.....kk']],
  carta: [{ k: INK, m: RP.roxo[2], l: RP.roxo[4], o: RP.ouro[3] }, ['.kkkkkk..', 'klllllmk.', 'klmmmmmk.', 'klmmommk.', 'klmooomk.', 'klmmommk.', 'klmmmmmk.', 'kmmmmmmk.', '.kkkkkk..']],
  gota: [{ k: INK, m: RP.azulona[2], l: RP.azulona[4] }, ['....k....', '...kmk...', '..kmmmk..', '.klmmmmk.', '.klmmmmk.', '.kmmmmmk.', '..kmmmk..', '...kkk...', '.........']],
};
const icCache = new Map();
function icone(nome, x, y, o = {}) {
  const k = o.k || 1, chave = nome + (o.adesivo ? '+a' : ''); let c = icCache.get(chave);
  if (!c) { const [m, b] = IC[nome]; const h = b.length, w = Math.max(...b.map(r => r.length)); c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2; const q = c.getContext('2d');
    for (let j = 0; j < h; j++) for (let i = 0; i < b[j].length; i++) { const ch = b[j][i]; if (ch !== '.' && m[ch]) { q.fillStyle = m[ch]; q.fillRect(i + 1, j + 1, 1, 1); } }
    if (o.adesivo) { const id = q.getImageData(0, 0, w + 2, h + 2); const a = (i, j) => i >= 0 && j >= 0 && i < w + 2 && j < h + 2 && id.data[(j * (w + 2) + i) * 4 + 3] > 0; q.fillStyle = CLARO; for (let j = 0; j < h + 2; j++) for (let i = 0; i < w + 2; i++) if (!a(i, j) && (a(i - 1, j) || a(i + 1, j) || a(i, j - 1) || a(i, j + 1))) q.fillRect(i, j, 1, 1); }
    icCache.set(chave, c); }
  g.drawImage(c, Math.round(x) - k, Math.round(y) - k, c.width * k, c.height * k); return (c.width - 2) * k;
}
function gema(x, y, rp, k = 1) { const s = (a, b, w, h, c) => R(x + a * k, y + b * k, w * k, h * k, c); s(1, 0, 5, 7, INK); s(0, 1, 7, 5, INK); s(1, 1, 5, 5, rp[2]); s(1, 1, 2, 2, rp[rp.length - 1]); s(2, 2, 1, 1, rp[3]); s(4, 4, 2, 2, rp[1]); }
Object.assign(UI, { icone, gema, IC });

// ------------------------------------------------------------------ botões
// estados: normal | foco | apertado | off. cor: rampa. Retorna nada; desenha em (x, y, w, h).
function botao(x, y, w, h, rotulo, o = {}) {
  const est = o.estado || 'normal', rp = est === 'off' ? RP.pedra : (o.rp || RP.lona), t = o.t || 0, k = o.k || 2;
  const prof = est === 'apertado' ? 1 : 3, off = 3 - prof;
  if (est === 'foco') { caixa(x - 2, y - 2 + off, w + 4, h + 4 - off, RP.ouro[4], 2); caixa(x - 1, y - 1 + off, w + 2, h + 2 - off, RP.ouro[2], 2); }
  caixa(x, y + off, w, h - off, INK, 2);                       // contorno
  caixa(x + 1, y + h - prof - 2, w - 2, prof + 1, rp[0], 1);   // espessura (lado de baixo)
  const fy = y + off + 1, fh = h - off - prof - 2;            // face
  caixa(x + 1, fy, w - 2, fh, rp[est === 'foco' ? 3 : 2], 1);
  R(x + 2, fy, w - 4, 1, rp[est === 'foco' ? 5 : 4] || rp[4]); R(x + 1, fy + 1, 1, fh - 2, rp[est === 'foco' ? 4 : 3]);
  R(x + 2, fy + fh - 1, w - 4, 1, rp[1]); R(x + w - 2, fy + 1, 1, fh - 2, rp[1]);
  // brilho estofado (arco no canto superior esquerdo, como nos pacotes)
  R(x + 3, fy + 2, 4, 1, rp[rp.length - 1]); P(x + 3, fy + 3, rp[rp.length - 1]); P(x + 3, fy + 4, rp[4]);
  if (est === 'foco') { // faixa de brilho que corre pela face
    const per = 1400, pos = ((t % per) / per) * (w + fh + 30) - 15;
    for (let j = 0; j < fh - 2; j++) for (let d = 0; d < 3; d++) { const xx = Math.round(x + 2 + pos + d - j); if (xx > x + 1 && xx < x + w - 2) P(xx, fy + 1 + j, rp[5] || rp[4]); }
  }
  let ix = 0; const tw = largura(rotulo, k) + (o.icone ? 13 : 0);
  let cx = Math.round(x + w / 2 - tw / 2); const ty = Math.round(fy + (fh - ALT * k) / 2);
  if (o.icone) { icone(o.icone, cx, ty + Math.round((ALT * k - 9) / 2), {}); cx += 13; }
  const corT = est === 'off' ? RP.pedra[3] : est === 'foco' ? RP.ouro[5] : CLARO;
  texto(rotulo, cx, ty, corT, { k, contorno: rp[0], sombra: rp[0] });
  if (est === 'foco' && o.setas !== false) { // setinhas que pulsam dos lados
    const b = Math.round(Math.sin(t / 120) * 1.5) + 2; seta(x - 7 - b, y + h / 2 + off / 2, 1); seta(x + w + 6 + b, y + h / 2 + off / 2, -1);
  }
}
function seta(x, y, dir) { x = Math.round(x); y = Math.round(y); for (let i = 0; i < 4; i++) { R(x + (dir > 0 ? i : -i) - (dir > 0 ? 0 : 0), y - 3 + i, 1, 7 - 2 * i, i === 0 ? INK : RP.ouro[4 - (i > 2 ? 1 : 0)]); } P(x + dir * 4, y, INK); for (let i = 0; i < 4; i++) { P(x + dir * i, y - 4 + i, INK); P(x + dir * i, y + 4 - i, INK); } }
Object.assign(UI, { botao, seta });

// ------------------------------------------------------------------ placas, pergaminho, etiquetas
function placa(x, y, w, h, o = {}) {
  if (o.corda !== undefined) { corda(x + 5, o.corda, x + 5, y + 1); corda(x + w - 6, o.corda, x + w - 6, y + 1); }
  R(x + 1, y + h, w - 2, 1, o.sombraCor || null);
  tabua(x, y, w, h, o.rp || RP.madeira, x * 3 + y, { contorno: INK, semNo: h < 12 });
  R(x + 1, y + 1, w - 2, 1, (o.rp || RP.madeira)[4]);
  prego(x + 2, y + 2); prego(x + w - 4, y + 2); if (h > 18) { prego(x + 2, y + h - 4); prego(x + w - 4, y + h - 4); }
}
function pergaminho(x, y, w, h, o = {}) {
  const p = RP.papel;
  R(x + 1, y, w - 2, h, INK); R(x, y + 1, w, h - 2, INK); R(x + 1, y + 1, w - 2, h - 2, p[3]); R(x + 1, y + 1, w - 2, 1, p[4]); R(x + 1, y + h - 3, w - 2, 2, p[2]); R(x + w - 2, y + 2, 1, h - 4, p[2]);
  semear(x + y); for (let i = 0; i < w * h / 60; i++) P(x + 3 + rnd() * (w - 6), y + 3 + rnd() * (h - 6), p[2]);
  // rolos nas pontas
  for (const yy of [y - 2, y + h - 3]) { R(x - 2, yy, w + 4, 5, INK); R(x - 1, yy + 1, w + 2, 3, p[2]); R(x - 1, yy + 1, w + 2, 1, p[4]); R(x - 1, yy + 3, w + 2, 1, p[1]); P(x - 1, yy + 2, p[0]); P(x + w, yy + 2, p[0]); }
  if (o.pregos) { prego(x + 2, y + 4); prego(x + w - 4, y + 4); }
}
function etiqueta(x, y, valor, o = {}) { // etiqueta de preço pendurada por barbante
  const w = largura(String(valor)) + 19, h = 11; corda(x + (w >> 1), y - 7, x + (w >> 1), y);
  R(x + 2, y, w - 2, h, INK); R(x, y + 2, w, h - 2, INK); P(x + 1, y + 1, INK); R(x + 1, y + 2, w - 2, h - 3, RP.papel[3]); R(x + 2, y + 1, w - 3, 1, RP.papel[4]); R(x + 1, y + h - 2, w - 2, 1, RP.papel[2]);
  P(x + 3, y + 4, INK); // furo
  icone('moeda', x + 5, y + 1); texto(String(valor), x + 15, y + 2, o.caro ? RP.lona[1] : TINTA, {});
  return w;
}
function balao(x, y, w, h, o = {}) { // dica (tooltip) em pergaminho com bico
  const p = RP.papel;
  caixa(x, y, w, h, INK, 2); caixa(x + 1, y + 1, w - 2, h - 2, p[3], 1); R(x + 2, y + 1, w - 4, 1, p[4]); R(x + 1, y + h - 3, w - 2, 1, p[2]); R(x + 2, y + h - 2, w - 4, 1, p[1]);
  if (o.bico !== undefined) { const bx = Math.round(o.bico); for (let i = 0; i < 4; i++) { R(bx - 3 + i, y + h - 1 + i, 7 - 2 * i, 1, i === 3 ? INK : p[1]); P(bx - 4 + i, y + h - 1 + i, INK); P(bx + 4 - i, y + h - 1 + i, INK); } }
  if (o.titulo) { R(x + 1, y + 1, w - 2, 11, o.rpTitulo ? o.rpTitulo[2] : RP.madeira[2]); R(x + 2, y + 1, w - 4, 1, o.rpTitulo ? o.rpTitulo[4] : RP.madeira[4]); R(x + 1, y + 12, w - 2, 1, INK); texto(o.titulo, x + w / 2, y + 3, CLARO, { al: 'centro', sombra: INK }); }
}
Object.assign(UI, { placa, pergaminho, etiqueta, balao });

// ------------------------------------------------------------------ feira: toldos, postes, luzes, bandeirinhas, mercadorias
function toldo(x, y, w, o = {}) {
  const lis = o.listra || 16, cores = o.cores || [RP.lona, RP.creme], prof = o.alt || 14, onda = o.onda ?? Math.round(lis / 3);
  tabua(x, y, w, 5, RP.madeira, 3, { contorno: INK, semNo: true });
  for (let i = 0, xx = x; xx < x + w; i++, xx += lis) {
    const rp = cores[i % cores.length], lw = Math.min(lis, x + w - xx);
    R(xx, y + 5, lw, prof, rp[2]); R(xx, y + 5, 2, prof, rp[3]); R(xx + lis - 3, y + 5, Math.max(0, Math.min(3, lw - lis + 3)), prof, rp[1]); R(xx + 2, y + 5, Math.max(0, Math.min(lis - 5, lw - 2)), 1, rp[4]); P(xx + 2, y + 6, rp[5] || rp[4]);
    for (let k = 0; k < lw; k++) { const d = Math.round(Math.sqrt(Math.max(0, (lis / 2) ** 2 - (k - lis / 2 + 0.5) ** 2)) / (lis / 2) * onda); R(xx + k, y + 5 + prof, 1, d, k < 2 ? rp[3] : k > lis - 4 ? rp[1] : rp[2]); P(xx + k, y + 5 + prof + d, INK); if (o.sombra) P(xx + k, y + 6 + prof + d, o.sombra); }
  }
  R(x, y + 5, w, 1, INK);
}
function poste(x, y, h, o = {}) { tabua(x, y, o.w || 10, h, o.rp || RP.madeira, x + 1, { contorno: INK }); for (let yy = y + 10; yy < y + h - 6; yy += 34) { prego(x + 2, yy); prego(x + (o.w || 10) - 4, yy + 3); } }
function lampiao(x, y, t, o = {}) { // (x,y) = gancho; brilho pontilhado pulsante
  const fl = 0.5 + 0.5 * Math.sin(t / 130 + x) * Math.sin(t / 77 + y), r = 11 + Math.round(fl * 2);
  if (o.halo !== false) { for (let k = 3; k >= 1; k--) { g.save(); g.beginPath(); g.arc(x + 3.5, y + 10, r * k / 3 + 2, 0, Math.PI * 2); g.clip(); pont(x - 20, y - 12, 48, 48, k === 1 ? RP.sol[2] : k === 2 ? RP.sol[1] : RP.sol[0], 0.16 + (3 - k) * 0.1); g.restore(); } }
  linha(x + 3, y, x + 3, y + 3, INK);
  R(x + 1, y + 3, 5, 2, INK); R(x, y + 5, 7, 10, INK); R(x + 1, y + 5, 5, 1, RP.ouro[3]);
  R(x + 1, y + 6, 5, 8, RP.sol[fl > 0.5 ? 4 : 3]); R(x + 2, y + 8, 3, 4, RP.sol[fl > 0.3 ? 4 : 3]); P(x + 2, y + 7, '#ffffff');
  R(x + 1, y + 6, 1, 8, RP.ouro[1]); R(x + 5, y + 6, 1, 8, RP.ouro[1]); R(x + 1, y + 14, 5, 1, RP.ouro[2]); R(x + 2, y + 15, 3, 1, INK);
}
function luzes(x1, x2, y, queda, t, o = {}) { // varal de lâmpadas que acendem em ondas
  catenaria(x1, x2, y, queda, INK);
  const cores = o.cores || [RP.sol, RP.lona, RP.verdona, RP.azulona, RP.rosa]; const n = o.n || Math.round((x2 - x1) / 18);
  for (let i = 1; i < n; i++) { const x = Math.round(x1 + (x2 - x1) * i / n), yy = quedaEm(x1, x2, y, queda, x); const rp = cores[i % cores.length]; const on = ((t / 260 - i * 0.5) % 3 + 3) % 3 > 0.7;
    if (on && o.halo !== false) { g.save(); g.beginPath(); g.arc(x + 1, yy + 4, 6, 0, Math.PI * 2); g.clip(); pont(x - 6, yy - 2, 14, 14, rp[3], 0.25); g.restore(); }
    R(x, yy + 1, 3, 2, INK); R(x - 1, yy + 3, 5, 4, INK); R(x, yy + 3, 3, 3, on ? rp[4] : rp[1]); P(x, yy + 3, on ? (rp[5] || '#fff') : rp[2]); R(x, yy + 6, 3, 1, INK); }
}
function bandeirinhas(x1, x2, y, queda, ondas, t = 0) { // varal de bandeirinhas: cada uma é uma onda
  catenaria(x1, x2, y, queda, RP.creme[1]);
  const n = ondas.length;
  ondas.forEach((o, i) => { const fx = Math.round(x1 + (x2 - x1) * (i + 0.5) / n), fy = quedaEm(x1, x2, y, queda, fx) + 1; const cur = o.atual;
    const rp = o.tipo === 'chefe' ? RP.lona : o.tipo === 'julg' ? RP.ouro : o.feita ? RP.creme : RP.azulona; const fw = cur ? 8 : 5, fh = cur ? 16 : 10; const bal = cur ? Math.round(Math.sin(t / 300) * 1) : 0;
    for (let j = 0; j < fh; j++) { const ww = Math.round(fw * (1 - j / fh)); R(fx - ww + bal * (j > fh / 2 ? 1 : 0), fy + j, ww * 2 + 1, 1, j < 2 ? rp[4] : rp[cur ? 3 : 2]); P(fx - ww - 1 + bal * (j > fh / 2 ? 1 : 0), fy + j, INK); P(fx + ww + 1 + bal * (j > fh / 2 ? 1 : 0), fy + j, INK); }
    R(fx - fw - 1, fy - 1, fw * 2 + 3, 1, INK); P(fx + bal, fy + fh, INK);
    if (cur) texto(String(o.n), fx + 1, fy + 2, INK, { al: 'centro' }); else if (o.tipo === 'julg') { P(fx, fy + 2, INK); P(fx, fy + 3, INK); P(fx, fy + 5, INK); } else if (o.tipo === 'chefe') { P(fx - 1, fy + 2, INK); P(fx + 1, fy + 2, INK); R(fx - 1, fy + 4, 3, 1, INK); } else if (o.feita) P(fx, fy + 3, RP.creme[1]);
  });
}
function caixote(x, y, w, h, o = {}) {
  const m = o.rp || RP.balcao; R(x, y, w, h, INK); tabua(x + 1, y + 1, w - 2, h - 2, m, x + y, { semNo: true, contorno: m[0] });
  for (let yy = y + 1 + Math.floor((h - 2) / 3); yy < y + h - 2; yy += Math.floor((h - 2) / 3)) R(x + 1, yy, w - 2, 1, m[0]);
  R(x + 1, y + 1, 3, h - 2, m[3]); R(x + w - 4, y + 1, 3, h - 2, m[1]); R(x + 1, y + 1, w - 2, 1, m[4]);
  prego(x + 2, y + 2); prego(x + w - 4, y + 2); prego(x + 2, y + h - 4); prego(x + w - 4, y + h - 4);
}
function barril(x, y, o = {}) { // 14x18
  const m = RP.balcao; const w = 14, h = 18; for (let j = 0; j < h; j++) { const b = Math.round(Math.sin(j / (h - 1) * Math.PI) * 2); R(x + 2 - b, y + j, w - 4 + 2 * b, 1, INK); R(x + 3 - b, y + j, w - 6 + 2 * b, 1, m[2]); P(x + 3 - b, y + j, m[3]); P(x + 4 - b, y + j, m[4]); R(x + w - 5 + b, y + j, 2, 1, m[1]); }
  for (const yy of [y + 3, y + h - 4]) { R(x + 1, yy, w - 2, 2, RP.aco[0]); R(x + 2, yy, w - 4, 1, RP.aco[2]); }
  R(x + 3, y, w - 6, 1, INK); R(x + 4, y + 1, w - 8, 1, m[1]);
}
function saco(x, y, o = {}) { // saco de moedas 14x14
  const c = RP.creme; elip(x + 7, y + 9, 7, 5, INK); elip(x + 7, y + 9, 6, 4, c[2]); elip(x + 5, y + 8, 3, 2, c[3]); P(x + 4, y + 7, c[4]); R(x + 4, y + 3, 6, 3, INK); R(x + 5, y + 3, 4, 2, c[1]); R(x + 3, y + 2, 8, 1, INK); R(x + 4, y + 1, 2, 1, c[2]); R(x + 8, y + 1, 2, 1, c[2]);
  if (o.moedas) { for (const [a, b] of [[2, 12], [9, 13], [12, 11]]) { R(x + a, y + b, 4, 3, INK); R(x + a + 1, y + b, 2, 2, RP.ouro[3]); P(x + a + 1, y + b, RP.ouro[5]); } }
}
function vaso(x, y, rp = RP.telha) { elip(x + 5, y + 8, 5, 5, INK); elip(x + 5, y + 8, 4, 4, rp[2]); elip(x + 4, y + 7, 2, 2, rp[3]); R(x + 3, y + 1, 5, 3, INK); R(x + 4, y + 2, 3, 2, rp[1]); R(x + 2, y + 1, 7, 1, INK); }
function miniPacote(x, y, rp) { // pacote 10x15 para mercadorias ao fundo
  R(x, y, 10, 15, INK); R(x + 1, y + 1, 8, 13, rp[2]); R(x + 1, y + 1, 8, 2, RP.prata[3]); R(x + 1, y + 12, 8, 2, RP.prata[2]); R(x + 1, y + 3, 1, 9, rp[4]); R(x + 8, y + 3, 1, 9, rp[1]); R(x + 3, y + 5, 4, 4, RP.ouro[3]); P(x + 3, y + 5, RP.ouro[5]); R(x + 1, y + 3, 8, 1, INK); R(x + 1, y + 11, 8, 1, INK);
}
Object.assign(UI, { toldo, poste, lampiao, luzes, bandeirinhas, caixote, barril, saco, vaso, miniPacote });

// barraca completa (vista de frente): base = chão; w largura. o.cores do toldo, o.mercadoria(x, yBalcao) desenha por cima do balcão
function barraca(x, base, w, o = {}) {
  const alt = o.alt || 70, topo = base - alt, m = o.rp || RP.madeira;
  const fundoSim = o.parte !== 'frente', frenteSim = o.parte !== 'fundo';
  if (fundoSim) {
  // parede do fundo (tábuas escuras)
  R(x + 4, topo + 14, w - 8, alt - 14, INK); for (let xx = x + 5; xx < x + w - 5; xx += 9) tabua(xx, topo + 15, Math.min(9, x + w - 5 - xx), alt - 16, [m[0], m[0], m[1], m[2], m[2]], xx, { semNo: true });
  if (o.fundo) o.fundo(x, topo, w, alt);
  // postes
  poste(x, topo + 8, alt - 8, { w: 6 }); poste(x + w - 6, topo + 8, alt - 8, { w: 6 });
  // toldo inclinado em cima
  toldo(x - 4, topo, w + 8, { cores: o.cores, listra: o.listra || 12, alt: 10, onda: 3 });
  }
  // balcão
  const by = base - (o.balcao || 26);
  if (!frenteSim) return by;
  if (o.atras) o.atras(x, by, w);
  tabua(x - 2, by, w + 4, 5, RP.balcao, x + 9, { contorno: INK, brilho: true, semNo: true });
  R(x + 1, by + 5, w - 2, base - by - 5, INK); for (let xx = x + 2; xx < x + w - 2; xx += 12) tabua(xx, by + 5, Math.min(12, x + w - 2 - xx), base - by - 5, RP.balcao, xx * 7, { semNo: true, contorno: RP.balcao[0] });
  pont(x + 2, by + 5, w - 4, 2, INK, 0.5);
  if (o.mercadoria) o.mercadoria(x, by, w);
  if (o.placa) { const pw = largura(o.placa) + 10; placa(Math.round(x + w / 2 - pw / 2), by + 8, pw, 11, { rp: RP.balcao }); texto(o.placa, x + w / 2, by + 10, CLARO, { al: 'centro', sombra: INK }); }
  return by;
}
UI.barraca = barraca;

// ------------------------------------------------------------------ sino num suporte de madeira; bal = deslocamento (-3..3)
function sino(x, y, bal = 0, o = {}) { // (x,y) canto do suporte 40x46
  const m = RP.madeira; tabua(x, y, 40, 5, m, 81, { contorno: INK, semNo: true }); tabua(x + 2, y + 5, 5, 41, m, 82, { contorno: INK }); tabua(x + 33, y + 5, 5, 41, m, 83, { contorno: INK });
  R(x - 1, y + 44, 42, 3, INK); R(x, y + 44, 40, 1, m[3]);
  const cx = x + 20 + bal, cy = y + 8, o2 = RP.ouro;
  linha(x + 20, y + 5, cx, cy, INK); linha(x + 21, y + 5, cx + 1, cy, INK);
  const larg = (j) => j < 3 ? 3 : Math.round(4 + (j - 3) * 0.42 + (j > 17 ? (j - 17) * 1.4 : 0));
  for (let j = 0; j < 22; j++) { const hw = larg(j), xx = cx - hw + Math.round(bal * j / 22 * 0.5); R(xx - 1, cy + j, hw * 2 + 3, 1, INK); for (let i = 0; i <= hw * 2; i++) { const u = i / (hw * 2); P(xx + i, cy + j, j === 0 ? o2[3] : u < 0.12 ? o2[3] : u < 0.28 ? o2[5] : u < 0.62 ? o2[3] : u < 0.85 ? o2[2] : o2[1]); } }
  R(cx - 13 + Math.round(bal * 0.5), cy + 21, 28, 2, o2[1]); R(cx - 13 + Math.round(bal * 0.5), cy + 22, 28, 1, o2[0]);
  R(cx - 13 + Math.round(bal * 0.5), cy + 23, 28, 1, INK);
  const bx = cx - Math.round(bal * 1.2) + Math.round(bal * 0.5); R(bx - 2, cy + 22, 5, 4, INK); R(bx - 1, cy + 22, 3, 3, RP.aco[2]); P(bx - 1, cy + 22, RP.aco[4]);
}
UI.sino = sino;

// ------------------------------------------------------------------ tapete da vitrine (casa 3x5)
function tapete(cx, cy, rp, est = 'livre', t = 0) {
  const w = 28, h = 9, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  R(x + 1, y, w - 2, h, INK); R(x, y + 1, w, h - 2, INK);
  R(x + 1, y + 1, w - 2, h - 2, rp[est === 'livre' ? 1 : 2]); R(x + 2, y + 2, w - 4, 1, rp[3]); R(x + 2, y + h - 3, w - 4, 1, rp[0]);
  for (let i = 0; i < w - 6; i += 4) { P(x + 3 + i, y + 4, rp[4]); P(x + 4 + i, y + 5, rp[3]); }
  for (let i = 1; i < w - 1; i += 2) { P(x + i, y - 1, rp[3]); P(x + i, y + h, rp[3]); } // franja
  if (est === 'foco') { const on = (t / 150 | 0) % 2; for (let i = -2; i < w + 2; i += 2) { P(x + i + on, y - 3, RP.ouro[5]); P(x + i + on, y + h + 2, RP.ouro[5]); } for (let j = -2; j < h + 2; j += 2) { P(x - 3, y + j + on, RP.ouro[5]); P(x + w + 2, y + j + on, RP.ouro[5]); } }
}
UI.tapete = tapete;

// ------------------------------------------------------------------ cenário: céu, sol, nuvens, morros, ruínas, árvores, chão
function ceu(x0, y0, w, h, bandas) { // bandas: [[cor, fração], ...] de cima para baixo
  for (let i = 0; i < bandas.length; i++) { const y1 = y0 + Math.round(bandas[i][1] * h), y2 = i + 1 < bandas.length ? y0 + Math.round(bandas[i + 1][1] * h) : y0 + h; R(x0, y1, w, y2 - y1, bandas[i][0]); if (i + 1 < bandas.length) { pont(x0, y2 - 4, w, 2, bandas[i + 1][0], 0.25); pont(x0, y2 - 2, w, 2, bandas[i + 1][0], 0.5); pont(x0, y2, w, 2, bandas[i][0], 0.25); } }
}
function sol(cx, cy, r, rp = RP.sol) { circ(cx, cy, r + 3, rp[2]); circ(cx, cy, r, rp[3]); circ(cx - 2, cy - 2, r - 4, rp[4]); }
function nuvem(cx, cy, s, rp = RP.nuvem) {
  semear(cx * 31 + cy); const b = []; for (let i = 0; i < 6 + s; i++) b.push([cx + Math.round((rnd() - 0.5) * s * 9), cy - Math.round(rnd() * s * 2), 4 + Math.round(rnd() * s * 1.6)]);
  for (const [x, y, r] of b) circ(x, y + 2, r + 1, rp[0]);
  for (const [x, y, r] of b) circ(x, y + 1, r, rp[1]);
  for (const [x, y, r] of b) circ(x, y, r - 1, rp[3]);
  for (const [x, y, r] of b) circ(x - 1, y - 2, Math.max(1, r - 3), rp[4]);
  const mi = Math.min(...b.map(p => p[0] - p[2])), ma = Math.max(...b.map(p => p[0] + p[2])); R(mi + 1, cy + 2, ma - mi - 2, 3, rp[1]); R(mi + 3, cy + 5, ma - mi - 6, 1, rp[0]);
}
function morros(W, H, y, amp, cores, sd) { semear(sd); let h = 0; for (let x = 0; x < W; x++) { h += (rnd() - 0.5) * 2; h = Math.max(-amp, Math.min(amp, h * 0.97 + Math.sin((x + sd) / 37) * 0.6)); const top = Math.round(y - amp - h - Math.sin((x + sd) / 61) * amp * 0.6); R(x, top, 1, H - top, cores[1]); P(x, top, cores[2]); if (cores[3] && (x + top) % 5 === 0) P(x, top + 1, cores[2]); } }
function tijolos(x, y, w, h, claro, rp = RP.pedra) {
  R(x, y, w, h, claro ? rp[2] : rp[1]);
  for (let j = 0; j < h; j += 4) { const off = (j / 4) % 2 ? 3 : 0; R(x, y + j + 3, w, 1, claro ? rp[1] : rp[0]); for (let i = -off; i < w; i += 6) { if (i + 5 >= 0 && i + 5 < w) R(x + i + 5, y + j, 1, 3, claro ? rp[1] : rp[0]); if (claro && i >= 0) R(x + i, y + j, Math.min(4, w - i), 1, rp[3]); } }
}
function torre(x, y, w, h, quebrada = 0, rp = RP.pedra, hera = true) {
  tijolos(x, y, w - 4, h, true, rp); tijolos(x + w - 4, y, 4, h, false, rp); R(x, y - 1, w, 1, rp[0]); R(x - 1, y, 1, h, rp[0]); R(x + w, y, 1, h, rp[0]);
  for (let i = 0; i < w; i += 6) { if (quebrada && i > w * 0.5) break; tijolos(x + i, y - 4, 4, 4, true, rp); R(x + i, y - 5, 4, 1, rp[0]); P(x + i, y - 4, rp[4]); }
  R(x + Math.floor(w / 2) - 3, y + h - 12, 6, 12, RP.noite[1]); R(x + Math.floor(w / 2) - 2, y + h - 13, 4, 1, RP.noite[1]);
  R(x + 4, y + 8, 3, 5, RP.noite[1]);
  if (hera) { semear(x); for (let i = 0; i < 10; i++) circ(x + 1 + Math.floor(rnd() * 6), y + 4 + Math.floor(rnd() * h * 0.6), 1 + Math.floor(rnd() * 2), rnd() < 0.5 ? RP.folha[3] : RP.folha[2]); }
}
function arvore(x, base, s, rp = RP.folha, tronco = RP.madeira) {
  R(x - 2, base - s * 2, 5, s * 2, tronco[2]); R(x - 2, base - s * 2, 1, s * 2, tronco[3]); R(x + 2, base - s * 2, 1, s * 2, tronco[1]); R(x - 3, base - 1, 7, 1, tronco[1]);
  semear(x * 13 + base); const cl = []; for (let i = 0; i < 9 + s; i++) cl.push([x + Math.round((rnd() - 0.5) * s * 2.6), base - s * 2 - Math.round(rnd() * s * 1.6), 3 + Math.round(rnd() * s * 0.45)]);
  for (const [cx, cy, r] of cl) circ(cx, cy, r + 1, rp[0]);
  for (const [cx, cy, r] of cl) circ(cx, cy, r, rp[2]);
  for (const [cx, cy, r] of cl) circ(cx - 1, cy - 1, Math.max(1, r - 1), rp[3]);
  for (const [cx, cy, r] of cl) if (cx <= x + 2) circ(cx - 2, cy - 2, Math.max(1, r - 3), rp[4]);
  for (const [cx, cy, r] of cl.slice(0, 5)) P(cx - r + 2, cy - r + 2, rp[5] || rp[4]);
}
function arbusto(cx, cy, r, rp = RP.folha) { circ(cx, cy + 1, r + 1, rp[0]); circ(cx, cy, r, rp[2]); circ(cx - 1, cy - 1, r - 1, rp[3]); circ(cx - 2, cy - 2, Math.max(1, r - 3), rp[4]); }
function pedra(cx, cy, r) { elip(cx, cy + r - 1, r + 1, 2, RP.grama[1]); circ(cx, cy, r, INK); circ(cx, cy, r - 1, RP.pedra[2]); circ(cx - 1, cy - 1, Math.max(1, r - 2), RP.pedra[3]); P(cx - 1, cy - 2, RP.pedra[4]); }
Object.assign(UI, { ceu, sol, nuvem, morros, tijolos, torre, arvore, arbusto, pedra });

// ------------------------------------------------------------------ sprites MiniFolks (o PNG manda; .ase só dá nomes/tempos)
let M = null; const IMG = {};
UI.carregaSprites = async (refs, raiz = '../../assets/minifolks/') => {
  if (!M) M = await (await fetch(raiz + 'manifest.json')).json();
  await Promise.all(refs.map(ref => { const s = sp(ref); if (s._src) return; const v = Object.keys(s.files.pngs).find(v => /outline/i.test(v) && !/without/i.test(v)) || Object.keys(s.files.pngs)[0]; s._src = raiz + s.files.pngs[v];
    return new Promise((res, rej) => { if (IMG[s._src]) return res(); const i = new Image(); i.onload = () => { IMG[s._src] = i; res(); }; i.onerror = () => rej(new Error(s._src)); i.src = s._src; }); }));
};
const sp = (ref) => { const [p, k] = ref.split('/'); return M.packs[p].characters[k]; };
function quadro(ref, anim, t) { const s = sp(ref), An = s.anims[anim] || s.anims.idle, ms = An.ms || Array(An.frames).fill(130); const tot = ms.reduce((a, b) => a + b, 0); let tt = ((t % tot) + tot) % tot; for (let i = 0; i < ms.length; i++) { if (tt < ms[i]) return i; tt -= ms[i]; } return 0; }
// (x, y) = pés; k escala inteira; o.vira espelha; o.sombra cor da elipse
function spr(ref, anim, t, x, y, k = 1, o = {}) {
  const s = sp(ref), An = s.anims[anim] || s.anims.idle, img = IMG[s._src]; if (!img) return; const f = o.quadro ?? quadro(ref, anim, t), cw = s.cell.w, ch = s.cell.h;
  if (o.sombra) elip(Math.round(x), Math.round(y), 5 * k, k + 1, o.sombra);
  const dx = Math.round(x - (o.vira ? cw - s.pivot.x : s.pivot.x) * k), dy = Math.round(y - s.pivot.y * k);
  if (o.vira) { g.save(); g.translate(dx + cw * k, dy); g.scale(-1, 1); g.drawImage(img, f * cw, An.row * ch, cw, ch, 0, 0, cw * k, ch * k); g.restore(); }
  else g.drawImage(img, f * cw, An.row * ch, cw, ch, dx, dy, cw * k, ch * k);
}
Object.assign(UI, { spr, sp, quadro });

// ------------------------------------------------------------------ cursor (luva/seta pixel) e partículas
const CURSOR = ['k.........', 'kk........', 'kwk.......', 'kwwk......', 'kwwwk.....', 'kwwwwk....', 'kwwwwwk...', 'kwwwwwwk..', 'kwwwwkkkk.', 'kwkwwk....', 'kk.kwwk...', 'k..kwwk...', '....kwwk..', '....kkk...'];
function cursor(x, y, apertado = false) { const d = apertado ? 1 : 0; CURSOR.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'k') P(x + i + d, y + j + d, INK); else if (ch === 'w') P(x + i + d, y + j + d, j < 3 ? '#ffffff' : RP.papel[4]); })); }
UI.cursor = cursor;
const PART = [];
function estoura(x, y, n, cores, vel = 60, vida = 0.7, sobe = 30) { for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, v = vel * (0.3 + rnd() * 0.7); PART.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sobe, v: vida * (0.6 + rnd() * 0.6), m: 0, c: cores[(rnd() * cores.length) | 0], s: rnd() < 0.3 ? 2 : 1 }); } }
function passoPart(dt) { for (let i = PART.length - 1; i >= 0; i--) { const p = PART[i]; p.m += dt; if (p.m > p.v) { PART.splice(i, 1); continue; } p.vy += (p.g ?? 120) * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
function pintaPart() { for (const p of PART) R(p.x, p.y, p.s, p.s, p.c); }
Object.assign(UI, { estoura, passoPart, pintaPart, PART });

window.UI = UI;
})();
