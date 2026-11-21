// Implementação de referência da abertura de pacotes, usada pelo GDD para conferir as chances.
// Lê só data/*.json; determinística por semente. Na Fase 3 vira src/game/30_packs.js + 35_odds.js
// (a mesma lógica, sem depender de Node).
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../..');
export const load = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', n + '.json'), 'utf8'));

export const RAR = ['comum', 'incomum', 'rara', 'epica', 'lendaria'];

// sfc32: rápido, 128 bits de estado, bom o bastante para jogo; semente por splitmix32
export function rng(seed) {
  let s = seed >>> 0; const sm = () => { s = (s + 0x9e3779b9) >>> 0; let z = s; z = Math.imul(z ^ (z >>> 16), 0x85ebca6b); z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35); return (z ^ (z >>> 16)) >>> 0; };
  let a = sm(), b = sm(), c = sm(), d = sm();
  return () => { const t = (((a + b) >>> 0) + d) >>> 0; d = (d + 1) >>> 0; a = b ^ (b >>> 9); b = (c + (c << 3)) >>> 0; c = (c << 21) | (c >>> 11); c = (c + t) >>> 0; return (t >>> 0) / 4294967296; };
}
export const pickWeighted = (r, obj) => { const e = Object.entries(obj).filter(([, w]) => w > 0); const tot = e.reduce((s, [, w]) => s + w, 0); let x = r() * tot; for (const [k, w] of e) { if ((x -= w) < 0) return k; } return e[e.length - 1][0]; };

export function makeCatalog({ faccoes = ['humanos', 'anoes', 'aldeoes'] } = {}) {
  const pool = { unidade: {}, especial: {}, item: {}, nucleo: {}, amaldicoada: {} };
  const add = (c) => { (pool[c.tipo][c.raridade] ||= []).push(c); };
  load('cartas_unidades').lista.filter(c => faccoes.includes(c.faccao)).forEach(add);
  if (faccoes.includes('aldeoes')) load('cartas_especiais').lista.forEach(add);
  load('cartas_itens').lista.forEach(add);
  load('cartas_nucleos').lista.forEach(add);
  load('cartas_amaldicoadas').lista.forEach(add);
  return pool;
}

// Estado da garantia: contadores de pacotes seguidos sem a raridade (ou melhor)
export function newPity() { return { rara: 0, epica: 0, lendaria: 0 }; }

export function openPack(r, P, pool, tipoId, pity, opts = {}) {
  const T = P.tipos.find(t => t.id === tipoId);
  const n = T.cartas + (opts.extra || 0);
  const cards = [];
  // garantia: decidida antes de sortear a última carta
  const forced = P.garantias.filter(g => pity[g.id] >= g.sem_por).map(g => g.garante);
  const minForced = forced.length ? forced.reduce((a, b) => RAR.indexOf(a) > RAR.indexOf(b) ? a : b) : null;
  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    let rt = { ...P.tabelas_raridade[last ? T.ultima : 'padrao'] };
    const tt = P.tabelas_tipo[T.tipos_todas || (last ? 'ultima' : 'padrao')];
    if (last && minForced) { const k = RAR.indexOf(minForced); RAR.forEach((rr, j) => { if (j < k) rt[rr] = 0; }); if (Object.values(rt).every(v => !v)) rt = { [minForced]: 1 }; }
    let rar = pickWeighted(r, rt); const rarSorteada = rar;
    let tipo = pickWeighted(r, tt);
    // sem carta daquele tipo na raridade -> sobe até achar
    let k = RAR.indexOf(rar);
    while (!(pool[tipo][RAR[k]] || []).length && k < 4) k++;
    if (!(pool[tipo][RAR[k]] || []).length) { tipo = 'unidade'; k = RAR.indexOf(rar); while (!(pool.unidade[RAR[k]] || []).length) k = (k + 1) % 5; }
    rar = RAR[k];
    let lst = pool[tipo][rar];
    if (tipoId === 'povo' && tipo === 'unidade' && opts.faccao) { const fa = lst.filter(c => c.faccao === opts.faccao); if (fa.length && r() < T.faccao_alvo_unidades) lst = fa; }
    const card = lst[(r() * lst.length) | 0];
    let versao = 'normal';
    if (tipo === 'unidade' || tipo === 'especial') { const x = r(); versao = x < P.versoes.prisma * (opts.prismaMult || 1) ? 'prisma' : x < P.versoes.prisma * (opts.prismaMult || 1) + P.versoes.brilhante * (opts.brilhoMult || 1) ? 'brilhante' : 'normal'; }
    cards.push({ id: card.id, tipo, rar, rarSorteada, versao, faccao: card.faccao || null, pos: i + 1, ultima: last });
  }
  // atualiza contadores (raridade máxima do pacote)
  const best = Math.max(...cards.map(c => RAR.indexOf(c.rar)));
  const viaGarantia = minForced && RAR.indexOf(cards[cards.length - 1].rar) >= RAR.indexOf(minForced) && minForced;
  for (const g of P.garantias) pity[g.id] = best >= RAR.indexOf(g.garante) ? 0 : pity[g.id] + 1;
  return { cards, viaGarantia, best: RAR[best] };
}
