// Som do Bazar das Ruínas: tudo sintetizado em Web Audio (sem arquivos). Funciona ao vivo (AudioContext)
// e offline (OfflineAudioContext) para gravar vídeo: as páginas registram os eventos em window.__sons.
(() => {
'use strict';
const NOTA = (n) => 440 * Math.pow(2, (n - 69) / 12);
let ctx = null, mestre = null, musicaNo = null;
const t0Pagina = Date.now();
window.__sons = [];

function tom(c, dst, t, f, dur, o = {}) {
  const osc = c.createOscillator(), gg = c.createGain();
  osc.type = o.tipo || 'square'; osc.frequency.setValueAtTime(f, t);
  if (o.ate) osc.frequency.exponentialRampToValueAtTime(o.ate, t + dur);
  const v = o.vol ?? 0.15, a = o.ataque ?? 0.004;
  gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(v, t + a); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gg).connect(dst); osc.start(t); osc.stop(t + dur + 0.02);
}
let ruidoBuf = null;
function ruido(c, dst, t, dur, o = {}) {
  if (!ruidoBuf || ruidoBuf.sampleRate !== c.sampleRate) { ruidoBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruidoBuf.getChannelData(0); let s = 7; for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) >>> 0; d[i] = (s / 2147483648) - 1; } }
  const src = c.createBufferSource(); src.buffer = ruidoBuf; const f = c.createBiquadFilter(); f.type = o.filtro || 'bandpass';
  f.frequency.setValueAtTime(o.de || 2000, t); if (o.para) f.frequency.exponentialRampToValueAtTime(o.para, t + dur); f.Q.value = o.q ?? 0.8;
  const gg = c.createGain(); const v = o.vol ?? 0.2; gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(gg).connect(dst); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
}
const RAR_NOTA = { comum: 72, incomum: 76, rara: 79, epica: 83, lendaria: 84, prisma: 84 };
const EFEITOS = {
  foco: (c, d, t) => tom(c, d, t, 1320, 0.03, { vol: 0.05 }),
  clique: (c, d, t) => { tom(c, d, t, 520, 0.05, { ate: 880, vol: 0.09 }); ruido(c, d, t, 0.03, { de: 4000, vol: 0.05 }); },
  voltar: (c, d, t) => tom(c, d, t, 660, 0.06, { ate: 330, vol: 0.08 }),
  moeda: (c, d, t) => { tom(c, d, t, NOTA(88), 0.08, { tipo: 'triangle', vol: 0.18 }); tom(c, d, t + 0.06, NOTA(93), 0.22, { tipo: 'triangle', vol: 0.16 }); },
  sino: (c, d, t) => { for (const [f, v, du] of [[880, 0.22, 1.4], [1320, 0.1, 1.0], [2216, 0.06, 0.7], [3520, 0.03, 0.4]]) tom(c, d, t, f, du, { tipo: 'sine', vol: v, ataque: 0.002 }); },
  treme: (c, d, t) => ruido(c, d, t, 0.06, { de: 900, vol: 0.06 }),
  rasgo: (c, d, t) => { ruido(c, d, t, 0.3, { de: 5000, para: 500, vol: 0.32, q: 0.6 }); ruido(c, d, t + 0.05, 0.2, { filtro: 'highpass', de: 3000, vol: 0.12 }); },
  sai: (c, d, t) => tom(c, d, t, 300 + Math.random() * 60, 0.03, { tipo: 'triangle', vol: 0.1 }),
  brilho: (c, d, t, r) => tom(c, d, t, { incomum: 220, rara: 262, epica: 294, lendaria: 330, prisma: 392 }[r] || 200, 0.45, { tipo: 'triangle', ate: 520, vol: 0.06, ataque: 0.2 }),
  virar: (c, d, t, r) => {
    ruido(c, d, t, 0.05, { de: 3000, vol: 0.08 });
    const n = RAR_NOTA[r] || 72; tom(c, d, t + 0.02, NOTA(n), 0.18, { tipo: 'square', vol: 0.1 });
    if (r === 'rara' || r === 'epica' || r === 'lendaria') [0, 4, 7].forEach((k, i) => tom(c, d, t + 0.08 + i * 0.05, NOTA(n + k), 0.25, { tipo: 'triangle', vol: 0.12 }));
  },
  rufar: (c, d, t) => { let tt = t; for (let i = 0; i < 18; i++) { ruido(c, d, tt, 0.05, { de: 600, vol: 0.05 + i * 0.008, q: 1.5 }); tt += Math.max(0.025, 0.09 - i * 0.004); } },
  jackpot: (c, d, t) => {
    [60, 64, 67, 72, 76, 79, 84, 88].forEach((n, i) => tom(c, d, t + i * 0.05, NOTA(n), 0.3, { tipo: 'square', vol: 0.08 }));
    for (const [f, v] of [[NOTA(96), 0.12], [NOTA(103), 0.06]]) tom(c, d, t + 0.4, f, 1.6, { tipo: 'sine', vol: v, ataque: 0.002 });
    [72, 76, 79, 84].forEach(n => tom(c, d, t + 0.4, NOTA(n), 1.2, { tipo: 'triangle', vol: 0.07, ataque: 0.01 }));
    for (let i = 0; i < 14; i++) ruido(c, d, t + 0.4 + i * 0.07, 0.04, { filtro: 'highpass', de: 6000, vol: 0.04 });
  },
  combo: (c, d, t) => { tom(c, d, t, NOTA(91), 0.12, { tipo: 'triangle', vol: 0.12 }); tom(c, d, t + 0.09, NOTA(96), 0.25, { tipo: 'triangle', vol: 0.12 }); },
  carimbo: (c, d, t) => { tom(c, d, t, 140, 0.12, { tipo: 'sine', ate: 60, vol: 0.35 }); ruido(c, d, t, 0.04, { de: 1500, vol: 0.1 }); },
  passos: (c, d, t) => { ruido(c, d, t, 0.03, { de: 400, vol: 0.06 }); ruido(c, d, t + 0.14, 0.03, { de: 450, vol: 0.05 }); },
};

// música: chiptune de feira (4 canais), laço de 8 compassos
const MUSICAS = {
  menu: { bpm: 92, baixo: [48, 48, 55, 55, 53, 53, 55, 55, 48, 48, 57, 57, 53, 55, 48, 48], mel: [72, 0, 76, 79, 77, 76, 74, 0, 72, 74, 76, 72, 74, 0, 67, 0, 72, 0, 76, 79, 81, 79, 77, 76, 74, 76, 74, 71, 72, 0, 0, 0] },
  prep: { bpm: 104, baixo: [48, 55, 52, 55, 53, 57, 55, 50, 48, 55, 52, 55, 53, 55, 48, 43], mel: [79, 76, 72, 76, 77, 74, 71, 74, 76, 72, 69, 72, 74, 0, 79, 0, 81, 77, 74, 77, 79, 76, 72, 76, 77, 74, 71, 74, 72, 0, 0, 0] },
};
function agendaMusica(c, dst, nome, inicio, dur) {
  const m = MUSICAS[nome]; if (!m) return; const colcheia = 60 / m.bpm / 2; const vol = c.createGain(); vol.gain.value = 0.55; vol.connect(dst);
  for (let t = inicio, i = 0; t < inicio + dur; t += colcheia, i++) {
    const nb = m.baixo[(i >> 1) % m.baixo.length]; if (i % 2 === 0) tom(c, vol, t, NOTA(nb - 12), colcheia * 1.8, { tipo: 'triangle', vol: 0.16, ataque: 0.01 });
    const nm = m.mel[i % m.mel.length]; if (nm) tom(c, vol, t, NOTA(nm), colcheia * 0.9, { tipo: 'square', vol: 0.045, ataque: 0.005 });
    if (i % 2 === 1) ruido(c, vol, t, 0.03, { filtro: 'highpass', de: 7000, vol: 0.03 });
    if (i % 8 === 4) ruido(c, vol, t, 0.08, { de: 300, vol: 0.06 });
  }
}

const SOM = {
  toca(nome, arg) {
    window.__sons.push({ ms: Date.now() - t0Pagina, abs: Date.now(), nome, arg });
    if (!ctx || ctx.state !== 'running') return;
    EFEITOS[nome] && EFEITOS[nome](ctx, mestre, ctx.currentTime + 0.005, arg);
  },
  musica(nome) {
    window.__sons.push({ ms: Date.now() - t0Pagina, abs: Date.now(), nome: 'musica', arg: nome });
    if (!ctx) return; if (musicaNo) { musicaNo.gain.setTargetAtTime(0, ctx.currentTime, 0.2); }
    musicaNo = ctx.createGain(); musicaNo.connect(mestre); agendaMusica(ctx, musicaNo, nome, ctx.currentTime + 0.05, 120);
  },
  liga() { // precisa de um gesto do usuário (política dos navegadores)
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); mestre = ctx.createDynamicsCompressor(); const gg = ctx.createGain(); gg.gain.value = 0.8; mestre.connect(gg).connect(ctx.destination); }
    if (ctx.state !== 'running') ctx.resume();
    const ult = [...window.__sons].reverse().find(e => e.nome === 'musica'); if (ult && !musicaNo) { musicaNo = ctx.createGain(); musicaNo.connect(mestre); agendaMusica(ctx, musicaNo, ult.arg, ctx.currentTime + 0.05, 120); }
  },
  // renderiza offline uma lista de eventos [{ms, nome, arg}] e devolve um WAV (base64) — usado para o vídeo
  async renderiza(eventos, duracaoS) {
    const sr = 44100, c = new OfflineAudioContext(2, Math.ceil(sr * duracaoS), sr);
    const comp = c.createDynamicsCompressor(); const gg = c.createGain(); gg.gain.value = 0.8; comp.connect(gg).connect(c.destination);
    let mus = null;
    for (const e of eventos) {
      const t = e.ms / 1000; if (t < 0 || t > duracaoS) continue;
      if (e.nome === 'musica') { if (mus) mus.gain.setTargetAtTime(0, t, 0.2); mus = c.createGain(); mus.connect(comp); agendaMusica(c, mus, e.arg, t + 0.05, duracaoS - t); }
      else EFEITOS[e.nome] && EFEITOS[e.nome](c, comp, t, e.arg);
    }
    const buf = await c.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, out = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, s) => [...s].forEach((ch, i) => out.setUint8(o + i, ch.charCodeAt(0)));
    w(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true); out.setUint32(24, sr, true); out.setUint32(28, sr * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    let bin = ''; const u8 = new Uint8Array(out.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin);
  },
};
window.SOM = SOM;
addEventListener('pointerdown', () => SOM.liga(), { capture: true }); addEventListener('keydown', () => SOM.liga(), { capture: true });
})();
