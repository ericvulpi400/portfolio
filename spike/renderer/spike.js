// Spike Fase 0 — Canvas 2D puro. Mede: abertura de pacote, 80 unidades MiniFolks animadas + partículas,
// escala inteira sem borrão, controle (Gamepad API) e chamadas Steam via preload (ou stub no navegador).
'use strict';
(() => {
const Q = new URLSearchParams(location.search);
const LW = +(Q.get('lw') || 480), LH = +(Q.get('lh') || 270);   // resolução lógica (testável por URL)
const BENCH = Q.get('bench') === '1';
const UNITS_TARGET = +(Q.get('units') || 80);

// ---------- paleta única (todas as cores geradas em código saem daqui) ----------
const PAL = {
  ink: '#14101c', night: '#221a30', plum: '#3a2a4a', dusk: '#5a4468', mist: '#8b7b9a', bone: '#e8dcc8', white: '#fff8ec',
  dirt: '#5b3f2e', dirtL: '#7a5638', grass: '#3f6b3a', grassL: '#5f8f45', stone: '#6d6a74',
  gold: '#f2c14e', goldD: '#b07a28', red: '#d9503f', redD: '#8a2a2a', green: '#7ccf6b', blue: '#5aa7e0', blueD: '#2c5d9e',
  purple: '#a86ad8', purpleD: '#5e3a8a', orange: '#f08a3c', cyan: '#7fe3e0', pink: '#ef8fc8',
};
const RAR = [ // forma + cor (acessível: a forma do selo distingue mesmo sem cor)
  { id: 'comum', c: PAL.mist, d: PAL.dusk, glow: null, shape: 'circle' },
  { id: 'incomum', c: PAL.green, d: '#3c7a3a', glow: PAL.green, shape: 'square' },
  { id: 'rara', c: PAL.blue, d: PAL.blueD, glow: PAL.blue, shape: 'diamond' },
  { id: 'epica', c: PAL.purple, d: PAL.purpleD, glow: PAL.purple, shape: 'triangle' },
  { id: 'lendaria', c: PAL.gold, d: PAL.goldD, glow: PAL.gold, shape: 'star' },
  { id: 'prisma', c: PAL.white, d: PAL.cyan, glow: 'prism', shape: 'star' },
];

// ---------- canvas e escala inteira ----------
const screen = document.getElementById('screen');
const sctx = screen.getContext('2d', { alpha: false });
const buf = document.createElement('canvas'); buf.width = LW; buf.height = LH;
const ctx = buf.getContext('2d', { alpha: false });
let scale = 1;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const W = Math.floor(innerWidth * dpr), H = Math.floor(innerHeight * dpr);
  scale = Math.max(1, Math.floor(Math.min(W / LW, H / LH)));
  screen.width = LW * scale; screen.height = LH * scale;
  screen.style.width = (LW * scale / dpr) + 'px'; screen.style.height = (LH * scale / dpr) + 'px';
  screen.style.left = Math.floor((innerWidth - LW * scale / dpr) / 2) + 'px';
  screen.style.top = Math.floor((innerHeight - LH * scale / dpr) / 2) + 'px';
  sctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize); resize();
ctx.imageSmoothingEnabled = false;

// ---------- fonte pixel 3x5 gerada em código ----------
const GL = {
  A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',
  I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',
  Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',
  Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001',
  '5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','.':'000000000000010',',':'000000000010100',
  ':':'000010000010000','-':'000000111000000','+':'000010111010000','/':'001001010100100','%':'101001010100101','(':'010100100100010',')':'010001001001010',
  '!':'010010010000010','?':'110001010000010','=':'000111000111000','>':'100010001010100','<':'001010100010001','#':'101111101111101',' ':'000000000000000',
  'Ç':'011100100011010','Ã':'111010101111101','Á':'001010101111101','É':'001111110100111','Í':'001000010010010','Ó':'001010101101010','Ê':'010101111100111','Õ':'111010101101010','Ú':'001101101101111',
};
function text(s, x, y, color = PAL.bone, shadow = PAL.ink) {
  s = String(s).toUpperCase(); x = Math.round(x); y = Math.round(y);
  for (let pass = shadow ? 0 : 1; pass < 2; pass++) {
    ctx.fillStyle = pass ? color : shadow; const ox = pass ? 0 : 1, oy = pass ? 0 : 1; let cx = x;
    for (const ch of s) { const g = GL[ch] || GL['?']; for (let i = 0; i < 15; i++) if (g[i] === '1') ctx.fillRect(cx + (i % 3) + ox, y + ((i / 3) | 0) + oy, 1, 1); cx += 4; }
  }
}
const textW = (s) => String(s).length * 4 - 1;

// ---------- sprites a partir do manifesto ----------
const ROOT = '../assets/';
let manifest = null; const sheets = {}; let roster = [];
async function loadAssets() {
  manifest = await (await fetch(ROOT + 'manifest.json')).json();
  const jobs = [];
  for (const [pack, p] of Object.entries(manifest.packs)) for (const [key, c] of Object.entries(p.characters)) {
    if (c.kind !== 'character') continue;
    const a = c.anims; const atk = a.attack || a.attack2 || a.attack_melee;
    // Só entra no combate quem tem idle, walk, ataque, hit e death de verdade
    if (!(a.idle && a.walk && atk && a.hit && a.death)) continue;
    const variant = Object.keys(c.files.pngs).find(v => /outline/i.test(v) && !/without/i.test(v) && !/blue/i.test(v)) || Object.keys(c.files.pngs)[0];
    const src = ROOT + 'minifolks/' + c.files.pngs[variant].split('\\').join('/');
    jobs.push(new Promise((res) => { const img = new Image(); img.onload = () => {
      const flip = document.createElement('canvas'); flip.width = img.width; flip.height = img.height; const f = flip.getContext('2d');
      // espelha cada célula, não a folha inteira (as linhas/colunas continuam no lugar)
      for (let cx = 0; cx < img.width; cx += c.cell.w) { f.save(); f.translate(cx * 2 + c.cell.w, 0); f.scale(-1, 1); f.drawImage(img, cx, 0, c.cell.w, img.height, cx, 0, c.cell.w, img.height); f.restore(); }
      sheets[pack + '/' + key] = { img, flip, c, atk: a.attack ? 'attack' : a.attack2 ? 'attack2' : 'attack_melee', ranged: /archer|crossbow|hunter|mage/i.test(key) };
      res(); }; img.onerror = () => res(); img.src = src; }));
  }
  await Promise.all(jobs);
  roster = Object.keys(sheets);
}
function drawSprite(sid, anim, frame, x, y, facingLeft, scaleK = 1) {
  const s = sheets[sid]; if (!s) return; const A = s.c.anims[anim] || s.c.anims.idle; const cw = s.c.cell.w, ch = s.c.cell.h;
  const f = Math.min(frame, A.frames - 1);
  const img = facingLeft ? s.flip : s.img; const px = facingLeft ? cw - s.c.pivot.x : s.c.pivot.x;
  ctx.drawImage(img, f * cw, A.row * ch, cw, ch, Math.round(x - px * scaleK), Math.round(y - s.c.pivot.y * scaleK), cw * scaleK, ch * scaleK);
}
const animDur = (sid, anim) => { const A = sheets[sid].c.anims[anim]; return A.ms ? A.ms.reduce((a, b) => a + b, 0) : A.frames * 100; };
function frameAt(sid, anim, t, loop) {
  const A = sheets[sid].c.anims[anim] || sheets[sid].c.anims.idle; const ms = A.ms || new Array(A.frames).fill(100); const tot = ms.reduce((a, b) => a + b, 0);
  let tt = loop ? t % tot : Math.min(t, tot - 1); for (let i = 0; i < ms.length; i++) { if (tt < ms[i]) return i; tt -= ms[i]; } return ms.length - 1;
}

// ---------- RNG com semente ----------
let seed = +(Q.get('seed') || 12345) >>> 0;
const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[(rnd() * a.length) | 0];

// ---------- partículas (pool em arrays tipados) ----------
const PMAX = 4000; const px = new Float32Array(PMAX), py = new Float32Array(PMAX), pvx = new Float32Array(PMAX), pvy = new Float32Array(PMAX), plife = new Float32Array(PMAX), pmax = new Float32Array(PMAX); const pcol = new Array(PMAX); let pcount = 0;
function burst(x, y, n, colors, speed = 60, life = 0.6, up = 20) {
  for (let i = 0; i < n && pcount < PMAX; i++) { const a = rnd() * Math.PI * 2, v = speed * (0.3 + rnd() * 0.7); const k = pcount++;
    px[k] = x; py[k] = y; pvx[k] = Math.cos(a) * v; pvy[k] = Math.sin(a) * v - up; plife[k] = pmax[k] = life * (0.6 + rnd() * 0.6); pcol[k] = colors[(rnd() * colors.length) | 0]; }
}
function stepParticles(dt) {
  for (let i = 0; i < pcount; i++) { plife[i] -= dt; if (plife[i] <= 0) { const j = --pcount; px[i] = px[j]; py[i] = py[j]; pvx[i] = pvx[j]; pvy[i] = pvy[j]; plife[i] = plife[j]; pmax[i] = pmax[j]; pcol[i] = pcol[j]; i--; continue; }
    pvy[i] += 140 * dt; px[i] += pvx[i] * dt; py[i] += pvy[i] * dt; }
}
function drawParticles() { for (let i = 0; i < pcount; i++) { ctx.fillStyle = pcol[i]; const s = plife[i] > pmax[i] * 0.5 ? 2 : 1; ctx.fillRect(px[i] | 0, py[i] | 0, s, s); } }

// ---------- pacote e cartas ----------
const CW = 72, CH = 100;
const pack = { state: 'closed', t: 0, cards: [], next: 0, shake: 0 };
function rollRarity() { const r = rnd(); return r < 0.002 ? 5 : r < 0.02 ? 4 : r < 0.08 ? 3 : r < 0.25 ? 2 : r < 0.55 ? 1 : 0; }
function newPack(forcePrism = false) {
  pack.state = 'closed'; pack.t = 0; pack.next = 0; pack.cards = [];
  for (let i = 0; i < 5; i++) { const r = forcePrism && i === 4 ? 5 : rollRarity(); pack.cards.push({ sid: pick(roster), rar: r, flipT: -1, x: LW / 2 - CW / 2, y: LH / 2 - CH / 2, tx: 0, ty: 0, fly: 0 }); }
  const gap = 6, tot = 5 * CW + 4 * gap; pack.cards.forEach((c, i) => { c.tx = Math.round((LW - tot) / 2 + i * (CW + gap)); c.ty = 70; });
}
function tear() { if (pack.state !== 'closed') return; pack.state = 'torn'; pack.t = 0; burst(LW / 2, 80, 60, [PAL.bone, PAL.gold, PAL.white], 90, 0.7); flash = 0.25; }
function flipNext() {
  if (pack.state === 'closed') return tear();
  if (pack.state !== 'spread') return;
  if (pack.next >= 5) { pack.state = 'toField'; pack.t = 0; return; }
  const c = pack.cards[pack.next++]; c.flipT = 0;
}
function flipAll() { if (pack.state === 'closed') tear(); pack.cards.forEach(c => { if (c.flipT < 0) c.flipT = 0.2; }); pack.next = 5; }
function drawRarityBadge(r, x, y) {
  const R = RAR[r]; ctx.fillStyle = R.d; ctx.fillRect(x - 4, y - 4, 9, 9); ctx.fillStyle = R.c;
  if (R.shape === 'circle') { ctx.fillRect(x - 1, y - 2, 3, 5); ctx.fillRect(x - 2, y - 1, 5, 3); }
  else if (R.shape === 'square') ctx.fillRect(x - 2, y - 2, 5, 5);
  else if (R.shape === 'diamond') { ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 1, y - 2, 3, 5); ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 3, y, 7, 1); }
  else if (R.shape === 'triangle') { for (let i = 0; i < 4; i++) ctx.fillRect(x - i, y - 2 + i, i * 2 + 1, 1); }
  else { ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x - 1, y - 1, 3, 3); }
}
function hsl(h, s, l) { return `hsl(${h | 0},${s}%,${l}%)`; }
function drawCardBack(x, y, w, glowR, t) {
  // verso gerado em código; o brilho da raridade "vaza" pela borda antes de virar
  if (glowR >= 2) { const a = 0.5 + 0.5 * Math.sin(t * 8); ctx.globalAlpha = 0.35 + 0.4 * a; ctx.fillStyle = RAR[glowR].glow === 'prism' ? hsl(t * 240, 90, 70) : RAR[glowR].glow; ctx.fillRect(x - 3, y - 3, w + 6, CH + 6); ctx.globalAlpha = 1; }
  ctx.fillStyle = PAL.ink; ctx.fillRect(x - 1, y - 1, w + 2, CH + 2);
  ctx.fillStyle = PAL.plum; ctx.fillRect(x, y, w, CH);
  ctx.fillStyle = PAL.dusk; for (let i = 2; i < CH - 2; i += 4) ctx.fillRect(x + 2, y + i, Math.max(0, w - 4), 2);
  if (w > 20) { ctx.fillStyle = PAL.gold; ctx.fillRect(x + w / 2 - 8, y + CH / 2 - 8, 16, 16); ctx.fillStyle = PAL.plum; ctx.fillRect(x + w / 2 - 5, y + CH / 2 - 5, 10, 10); }
}
function drawCardFront(c, x, y, w, t) {
  const R = RAR[c.rar];
  ctx.fillStyle = PAL.ink; ctx.fillRect(x - 1, y - 1, w + 2, CH + 2);
  ctx.fillStyle = R.d; ctx.fillRect(x, y, w, CH);
  ctx.fillStyle = R.c; ctx.fillRect(x + 1, y + 1, Math.max(0, w - 2), 1); ctx.fillRect(x + 1, y + CH - 2, Math.max(0, w - 2), 1);
  if (w < 8) return;
  ctx.fillStyle = PAL.night; ctx.fillRect(x + 4, y + 12, w - 8, 66); // janela da arte
  if (c.rar === 5) { // reflexo holográfico: faixas diagonais em hue que correm
    for (let i = 0; i < 66; i += 2) { ctx.fillStyle = hsl((i * 6 + t * 200) % 360, 80, 30); ctx.fillRect(x + 4, y + 12 + i, w - 8, 2); }
  }
  if (w === CW) {
    const s = sheets[c.sid]; drawSprite(c.sid, 'idle', frameAt(c.sid, 'idle', t * 1000, true), x + w / 2, y + 12 + 62, false, 2);
    const nm = s.c.name.replace(/Man$/, '').slice(0, 14); text(nm, x + Math.round((w - textW(nm)) / 2), y + 4, PAL.white);
    drawRarityBadge(c.rar, x + w - 9, y + CH - 11);
    text(R.id, x + 4, y + CH - 13, R.c);
    if (c.rar === 5 && ((t * 10) | 0) % 3 === 0) burst(x + 6 + rnd() * (w - 12), y + 14 + rnd() * 60, 1, [PAL.white, PAL.cyan, PAL.pink], 10, 0.4, 0);
  }
}
function drawPackClosed(t) {
  const sh = pack.shake > 0 ? Math.round(Math.sin(t * 60) * 2) : 0; const x = LW / 2 - 30 + sh, y = 50;
  ctx.fillStyle = PAL.ink; ctx.fillRect(x - 1, y - 1, 62, 112);
  ctx.fillStyle = PAL.redD; ctx.fillRect(x, y, 60, 110);
  for (let i = 0; i < 110; i += 6) { ctx.fillStyle = hsl((i * 3 + t * 60) % 360, 60, 45); ctx.globalAlpha = 0.35; ctx.fillRect(x, y + i, 60, 2); ctx.globalAlpha = 1; }
  ctx.fillStyle = PAL.gold; for (let i = 0; i < 60; i += 4) ctx.fillRect(x + i, y + 8, 2, 2); // linha de rasgo
  ctx.fillStyle = PAL.bone; ctx.fillRect(x + 6, y + 30, 48, 50); if (roster.length) drawSprite(roster[0], 'idle', frameAt(roster[0], 'idle', t * 1000, true), x + 30, y + 78, false, 1);
  text('PACOTE', x + 30 - textW('PACOTE') / 2, y + 90, PAL.gold);
}

// ---------- campo de batalha ----------
const units = []; const GROUND_Y0 = 150, GROUND_Y1 = 262;
function spawnUnit(side, sid, x, y) {
  const u = { sid: sid || pick(roster), side, x: x ?? (side ? LW - 20 - rnd() * 60 : 20 + rnd() * 60), y: y ?? (GROUND_Y0 + 8 + rnd() * (GROUND_Y1 - GROUND_Y0 - 8)), hp: 30, state: 'walk', t: 0, cd: rnd() * 0.5, target: null, speed: 14 + rnd() * 10 };
  u.range = sheets[u.sid].ranged ? 70 : 12; units.push(u); burst(u.x, u.y - 10, 10, [PAL.white, PAL.gold], 40, 0.4); return u;
}
function fillField(n) { while (units.length < n) spawnUnit(units.length % 2); }
function stepUnits(dt) {
  for (const u of units) {
    u.t += dt * 1000;
    if (u.state === 'death') { if (u.t > animDur(u.sid, 'death') + 600) { u.dead = true; } continue; }
    if (u.state === 'hit' && u.t > animDur(u.sid, 'hit')) { u.state = 'walk'; u.t = 0; }
    if (u.state === 'attack') { if (u.t > animDur(u.sid, sheets[u.sid].atk)) { u.state = 'walk'; u.t = 0; } continue; }
    if (!u.target || u.target.state === 'death' || u.target.dead) { let best = null, bd = 1e9; for (const v of units) if (v.side !== u.side && v.state !== 'death') { const d = Math.abs(v.x - u.x) + Math.abs(v.y - u.y) * 2; if (d < bd) { bd = d; best = v; } } u.target = best; }
    const tg = u.target; if (!tg) { u.state = 'idle'; continue; }
    const dx = tg.x - u.x, dy = tg.y - u.y, dist = Math.hypot(dx, dy); u.face = dx < 0;
    u.cd -= dt;
    if (dist <= u.range) { if (u.cd <= 0 && u.state !== 'hit') { u.state = 'attack'; u.t = 0; u.cd = 0.9 + rnd() * 0.6;
        setTimeout(() => { if (tg.state === 'death') return; tg.hp -= 6 + rnd() * 6; burst(tg.x, tg.y - 12, 6, [PAL.white, PAL.red, PAL.orange], 50, 0.35);
          if (tg.hp <= 0) { tg.state = 'death'; tg.t = 0; burst(tg.x, tg.y - 10, 18, [PAL.bone, PAL.mist, PAL.red], 70, 0.6); } else if (tg.state !== 'attack') { tg.state = 'hit'; tg.t = 0; } }, 250); }
      else if (u.state === 'walk') { u.state = 'idle'; u.t = 0; } }
    else { if (u.state !== 'walk' && u.state !== 'hit') { u.state = 'walk'; u.t = 0; } u.x += dx / dist * u.speed * dt; u.y += dy / dist * u.speed * dt * 0.6; }
  }
  for (let i = units.length - 1; i >= 0; i--) if (units[i].dead) { const s = units[i].side; units.splice(i, 1); if (fieldOn) spawnUnit(s); }
}
function drawField(t) {
  ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, LW, GROUND_Y0);
  ctx.fillStyle = PAL.plum; for (let i = 0; i < LW; i += 40) ctx.fillRect(i, GROUND_Y0 - 30 + ((i * 7) % 13), 40, 30);
  ctx.fillStyle = PAL.grass; ctx.fillRect(0, GROUND_Y0, LW, LH - GROUND_Y0);
  ctx.fillStyle = PAL.grassL; for (let y = GROUND_Y0; y < LH; y += 6) for (let x = (y * 13) % 11; x < LW; x += 17) ctx.fillRect(x, y, 2, 1);
  units.sort((a, b) => a.y - b.y);
  for (const u of units) {
    const anim = u.state === 'attack' ? sheets[u.sid].atk : u.state;
    const f = frameAt(u.sid, anim, u.t, anim === 'walk' || anim === 'idle');
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(Math.round(u.x - 6), Math.round(u.y - 1), 12, 2);
    drawSprite(u.sid, anim, f, u.x, u.y, !!u.face);
    if (u.state !== 'death') { ctx.fillStyle = PAL.ink; ctx.fillRect(Math.round(u.x - 6), Math.round(u.y - 26), 12, 2); ctx.fillStyle = u.side ? PAL.red : PAL.green; ctx.fillRect(Math.round(u.x - 6), Math.round(u.y - 26), Math.max(0, Math.round(12 * u.hp / 30)), 2); }
  }
}

// ---------- entrada: teclado + controle ----------
const keys = {}; addEventListener('keydown', (e) => { if (e.repeat) return; keys[e.code] = true; onAction(mapKey(e.code)); });
function mapKey(code) { return { Space: 'confirm', Enter: 'confirm', KeyA: 'all', KeyP: 'prism', KeyN: 'newpack', KeyS: 'summon', KeyG: 'pad', KeyT: 'steam', KeyO: 'overlay', KeyF: 'full', KeyW: 'windowed', KeyB: 'bench', Escape: 'back' }[code]; }
const PAD_NAMES = ['A/Cruz', 'B/Círculo', 'X/Quadrado', 'Y/Triângulo', 'LB/L1', 'RB/R1', 'LT/L2', 'RT/R2', 'Back/Share', 'Start/Options', 'LS', 'RS', 'Cima', 'Baixo', 'Esq', 'Dir', 'Home/PS'];
const padSeen = {}; let padPrev = []; let padInfo = [];
function pollPads() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : []; padInfo = [];
  for (const p of pads) { if (!p) continue;
    const seen = padSeen[p.id] ||= { buttons: new Set(), axes: new Set(), mapping: p.mapping, nb: p.buttons.length, na: p.axes.length };
    const st = p.buttons.map(b => b.pressed || b.value > 0.5);
    st.forEach((on, i) => { if (on) seen.buttons.add(i); if (on && !padPrev[i]) onAction(['confirm', 'back', 'all', 'prism', 'pad', 'steam', null, 'summon', 'overlay', 'newpack', null, null, null, null, null, null, null][i]); });
    p.axes.forEach((v, i) => { if (Math.abs(v) > 0.6) seen.axes.add(i + (v < 0 ? '-' : '+')); });
    padPrev = st; padInfo.push({ p, st, seen });
  }
}
let showPad = false, showSteam = false, flash = 0, fieldOn = false, steamLines = ['T = RODAR TESTES DA STEAM', 'O = ABRIR OVERLAY'];
const native = window.native || { isElectron: false, info: async () => ({ stub: true }), steamTests: async () => ({ ok: true, stub: true, log: [{ k: 'STUB: navegador sem Steam', ok: true }] }), steamOverlay: async () => 'stub', windowMode: async (m) => m, saveResults: async () => 'stub' };
function onAction(a) {
  if (!a) return;
  if (a === 'confirm') flipNext(); else if (a === 'all') flipAll(); else if (a === 'prism') newPack(true); else if (a === 'newpack') newPack();
  else if (a === 'summon') { fieldOn = true; fillField(UNITS_TARGET); }
  else if (a === 'pad') { showPad = !showPad; if (!showPad) native.saveResults({ gamepads: Object.entries(padSeen).map(([id, s]) => ({ id, mapping: s.mapping, botoes: s.nb, eixos: s.na, testados: [...s.buttons].sort((x, y) => x - y), eixosMovidos: [...s.axes] })) }); }
  else if (a === 'steam') { showSteam = true; steamLines = ['RODANDO...']; native.steamTests().then(r => { steamLines = r.log.map(e => (e.ok ? 'OK  ' : 'XX  ') + e.k); native.saveResults({ steam: r }); }); }
  else if (a === 'overlay') native.steamOverlay('Achievements').then(r => { steamLines.push('OVERLAY: ' + r); showSteam = true; });
  else if (a === 'full') native.windowMode('fullscreen'); else if (a === 'windowed') native.windowMode('windowed');
  else if (a === 'bench') startBench();
  else if (a === 'back') { showPad = false; showSteam = false; }
}

// ---------- medição ----------
const FT = new Float32Array(4096), CPU = new Float32Array(4096); let fi = 0, fn = 0; let bench = null;
function stats(arr, n) { const a = Array.from(arr.slice(0, Math.min(n, arr.length))).sort((x, y) => x - y); const q = (p) => a[Math.min(a.length - 1, Math.floor(p * a.length))] || 0; return { n: a.length, avg: a.reduce((s, v) => s + v, 0) / (a.length || 1), p50: q(0.5), p95: q(0.95), p99: q(0.99), max: a[a.length - 1] || 0 }; }
function startBench() { newPack(true); flipAll(); fieldOn = true; fillField(UNITS_TARGET); setTimeout(() => { fi = 0; fn = 0; bench = { start: performance.now(), dur: +(Q.get('secs') || 15) * 1000 }; }, 2000); }

// ---------- laço principal: passo fixo 60 Hz ----------
const STEP = 1 / 60; let acc = 0, last = performance.now(), T = 0;
function update(dt) {
  T += dt; pollPads(); if (pack.shake > 0) pack.shake -= dt; flash = Math.max(0, flash - dt);
  if (pack.state === 'closed') { pack.t += dt; pack.shake = Math.sin(T * 1.5) > 0.95 ? 0.1 : pack.shake; }
  else if (pack.state === 'torn') { pack.t += dt; for (const c of pack.cards) { c.x += (c.tx - c.x) * Math.min(1, dt * 8); c.y += (c.ty - c.y) * Math.min(1, dt * 8); } if (pack.t > 0.6) pack.state = 'spread'; }
  else if (pack.state === 'spread') { for (const c of pack.cards) { c.x = c.tx; c.y = c.ty; if (c.flipT >= 0) { const was = c.flipT; c.flipT += dt; if (was < 0.15 && c.flipT >= 0.15) { const R = RAR[c.rar]; burst(c.x + CW / 2, c.y + CH / 2, 8 + c.rar * 14, c.rar === 5 ? [PAL.white, PAL.cyan, PAL.pink, PAL.gold] : [R.c, PAL.white], 50 + c.rar * 20, 0.5 + c.rar * 0.1); if (c.rar >= 4) flash = 0.3; } } } }
  else if (pack.state === 'toField') { pack.t += dt; pack.cards.forEach((c, i) => { c.y -= (60 + i * 10) * dt * 3; c.fly += dt; if (c.fly > 0.3 && !c.spawned) { c.spawned = true; fieldOn = true; spawnUnit(0, c.sid, 60 + i * 20, GROUND_Y0 + 40 + i * 12); } }); if (pack.t > 0.8) pack.state = 'done'; }
  stepUnits(dt); stepParticles(dt);
}
function render() {
  drawField(T);
  if (pack.state !== 'done') {
    ctx.globalAlpha = 0.55; ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, LW, LH); ctx.globalAlpha = 1;
    if (pack.state === 'closed') { drawPackClosed(T); text('ESPAÇO/A: RASGAR   A(TECLA): ABRIR TUDO   P: PRISMA', 8, LH - 10, PAL.mist); }
    else { for (const c of pack.cards) { if (c.flipT < 0) drawCardBack(c.x, c.y, CW, c.rar, T); else { const k = Math.min(1, c.flipT / 0.3); const w = Math.max(1, Math.round(CW * Math.abs(Math.cos(k * Math.PI)))); const x = c.x + Math.round((CW - w) / 2); if (k < 0.5) drawCardBack(x, c.y, w, c.rar, T); else drawCardFront(c, x, c.y, w, T); } }
      if (pack.state === 'spread') text(pack.next < 5 ? `ESPAÇO: VIRAR CARTA ${pack.next + 1}/5` : 'ESPAÇO: INVOCAR', 8, LH - 10, PAL.mist); }
  }
  drawParticles();
  if (flash > 0 && !Q.get('noflash')) { ctx.globalAlpha = flash * 1.5; ctx.fillStyle = PAL.white; ctx.fillRect(0, 0, LW, LH); ctx.globalAlpha = 1; }
  // HUD de desempenho
  const s = stats(FT, Math.min(fn, 240)), c = stats(CPU, Math.min(fn, 240));
  ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, 178, 9);
  text(`FPS ${(1000 / (s.avg || 16.7)).toFixed(0)} P95 ${s.p95.toFixed(1)}MS CPU ${c.avg.toFixed(1)}MS U${units.length} P${pcount} X${scale}`, 2, 2, PAL.green, null);
  if (showPad) drawPadPanel(); if (showSteam) drawSteamPanel();
  sctx.drawImage(buf, 0, 0, LW * scale, LH * scale);
}
function drawPanel(x, y, w, h, title) { ctx.fillStyle = PAL.ink; ctx.fillRect(x - 1, y - 1, w + 2, h + 2); ctx.fillStyle = PAL.night; ctx.fillRect(x, y, w, h); ctx.fillStyle = PAL.dusk; ctx.fillRect(x, y, w, 9); text(title, x + 3, y + 2, PAL.gold, null); }
function drawPadPanel() {
  drawPanel(10, 14, 300, 160, 'CONTROLE (G FECHA)');
  if (!padInfo.length) { text('NENHUM CONTROLE. APERTE UM BOTÃO NO CONTROLE.', 14, 30, PAL.bone); return; }
  const { p, st, seen } = padInfo[0];
  text(p.id.slice(0, 70), 14, 26, PAL.mist); text(`MAPEAMENTO: ${p.mapping || 'NENHUM'}  BOTÕES ${p.buttons.length}  EIXOS ${p.axes.length}`, 14, 34, PAL.bone);
  st.forEach((on, i) => { const x = 14 + (i % 4) * 72, y = 46 + ((i / 4) | 0) * 10; ctx.fillStyle = on ? PAL.gold : seen.buttons.has(i) ? PAL.green : PAL.plum; ctx.fillRect(x, y, 6, 6); text((PAD_NAMES[i] || 'B' + i).slice(0, 15), x + 9, y + 1, PAL.bone, null); });
  text(`TESTADOS ${seen.buttons.size}/${p.buttons.length}  EIXOS ${[...seen.axes].join(' ')}`, 14, 112, seen.buttons.size >= Math.min(17, p.buttons.length) ? PAL.green : PAL.orange);
  p.axes.forEach((v, i) => { ctx.fillStyle = PAL.plum; ctx.fillRect(14 + i * 70, 124, 60, 4); ctx.fillStyle = PAL.cyan; ctx.fillRect(14 + i * 70 + 30 + Math.round(v * 28), 123, 2, 6); });
}
function drawSteamPanel() { drawPanel(LW - 230, 14, 220, 14 + steamLines.length * 8, 'STEAM (ESC FECHA)'); steamLines.slice(0, 26).forEach((l, i) => text(l.slice(0, 54), LW - 226, 26 + i * 8, l.startsWith('XX') ? PAL.red : PAL.bone, null)); }

function frame(now) {
  const dtRaw = now - last; last = now; acc += Math.min(0.25, dtRaw / 1000);
  const t0 = performance.now(); let steps = 0;
  while (acc >= STEP && steps < 5) { update(STEP); acc -= STEP; steps++; }
  render();
  const cpu = performance.now() - t0; FT[fi] = dtRaw; CPU[fi] = cpu; fi = (fi + 1) % FT.length; fn++;
  if (bench && now - bench.start >= bench.dur) {
    const r = { logical: [LW, LH], scale, canvas: [screen.width, screen.height], units: units.length, particlesNow: pcount, frame: stats(FT, Math.min(fn, FT.length)), cpu: stats(CPU, Math.min(fn, CPU.length)), over18ms: Array.from(FT.slice(0, Math.min(fn, FT.length))).filter(v => v > 18).length, ua: navigator.userAgent };
    window.__benchResult = r; console.warn('BENCH ' + JSON.stringify(r)); native.saveResults({ bench: r }); bench = null;
  }
  requestAnimationFrame(frame);
}
// Ganchos de teste (mesmo contrato que o jogo vai ter)
window.render_game_to_text = () => JSON.stringify({ pack: pack.state, next: pack.next, cards: pack.cards.map(c => [sheets[c.sid]?.c.name, RAR[c.rar].id, c.flipT >= 0]), units: units.length, particles: pcount, scale });
window.advanceTime = (ms) => { for (let i = 0; i < Math.round(ms / (1000 / 60)); i++) update(STEP); render(); };
window.__act = onAction;

loadAssets().then(() => { newPack(); requestAnimationFrame(frame); if (BENCH) startBench(); }).catch(e => { console.error(e); text('ERRO AO CARREGAR ASSETS: ' + e.message, 8, 8, PAL.red); sctx.drawImage(buf, 0, 0, LW * scale, LH * scale); });
})();
