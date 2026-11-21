// Estima quanto tempo leva para completar o catálogo do estágio 1 (58 cartas, versão normal).
// Monte Carlo de jogadores; usa a mesma abertura de pacotes e as regras de crédito de data/meta.json.
// Suposições (ajustáveis abaixo): ondas alcançadas por run, mistura de tipos de pacote e minutos por run.
import fs from 'node:fs';
import { load, rng, RAR, makeCatalog, newPity, openPack } from './pacotes_ref.mjs';
const P = load('pacotes'), M = load('meta'), R = load('raridades');
const credito = Object.fromEntries(R.lista.map(x => [x.id, x.credito_catalogo])), precoFaltante = M.catalogo.creditos.preco_carta_faltante;
const JOGADORES = +(process.argv[2] || 2000), PACOTES_POR_ONDA = 2.3, MIN_POR_ONDA = 2.4;
const ondasPorRun = (run) => [7, 10, 12, 13, 14][run - 1] ?? 15;        // curva de aprendizado: 1ª run cai na 7, depois melhora
const faccoesNaRun = (run) => run === 1 ? ['humanos', 'anoes', 'aldeoes'] : run === 2 ? ['humanos', 'anoes', 'aldeoes', 'elfos'] : ['humanos', 'anoes', 'aldeoes', 'elfos', 'vikings'];
const todas = [...load('cartas_unidades').lista, ...load('cartas_especiais').lista];
const alvo = new Set(todas.map(c => c.id));
const res = { runs100: [], horas100: [], runs50: [], horas50: [], comprouCredito: [] };
for (let j = 0; j < JOGADORES; j++) {
  const r = rng(1000 + j); const tem = new Set(); let cred = 0, run = 0, horas = 0, viu50 = false, compras = 0; const pity = newPity();
  while (tem.size < alvo.size && run < 400) {
    run++; const fac = faccoesNaRun(run), pool = makeCatalog({ faccoes: fac }); pity.rara = 0; pity.epica = 0;
    const ondas = ondasPorRun(run), nPac = Math.round(ondas * PACOTES_POR_ONDA);
    for (let i = 0; i < nPac; i++) {
      // jogador mira o que falta: 25% Pacote de Povo da facção com mais faltas, 10% Pequeno, resto Feira
      const x = r(); let tipo = 'feira', faccao = null;
      if (x < 0.25) { tipo = 'povo'; const falta = {}; for (const c of todas) if (fac.includes(c.faccao) && c.tipo === 'unidade' && !tem.has(c.id)) falta[c.faccao] = (falta[c.faccao] || 0) + 1; faccao = Object.entries(falta).sort((a, b) => b[1] - a[1])[0]?.[0] || 'humanos'; }
      else if (x < 0.35) tipo = 'pequeno';
      for (const c of openPack(r, P, pool, tipo, pity, { faccao }).cards) {
        if (!alvo.has(c.id)) continue;
        if (tem.has(c.id)) cred += credito[c.rar] * (c.versao === 'brilhante' ? 2 : 1); else tem.add(c.id);
      }
    }
    horas += ondas * MIN_POR_ONDA / 60;
    // fim da run: compra as faltantes mais baratas com créditos (só de facções já liberadas)
    const falt = todas.filter(c => !tem.has(c.id) && fac.includes(c.faccao)).sort((a, b) => precoFaltante[a.raridade] - precoFaltante[b.raridade]);
    for (const c of falt) { if (cred >= precoFaltante[c.raridade]) { cred -= precoFaltante[c.raridade]; tem.add(c.id); compras++; } }
    if (!viu50 && tem.size >= alvo.size / 2) { viu50 = true; res.runs50.push(run); res.horas50.push(horas); }
  }
  res.runs100.push(run); res.horas100.push(horas); res.comprouCredito.push(compras);
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
let md = `# Tempo para completar o catálogo do estágio 1\n\n${JOGADORES} jogadores simulados por \`tools/sim/tempo_catalogo.mjs\`. Catálogo: ${alvo.size} cartas (unidades de Humanos, Anões, Elfos e Vikings + 20 ajudantes Aldeões), versão normal. Suposições: ${PACOTES_POR_ONDA} pacotes por onda; ondas alcançadas por run 7, 10, 12, 13, 14 e depois 15; ${MIN_POR_ONDA} min por onda; Elfos a partir da 2ª run e Vikings da 3ª; 25% Pacotes de Povo mirando a facção com mais faltas; créditos de repetidas comprando as faltantes no fim de cada run.\n\n`;
md += `| Marco | Runs (mediana) | Runs (90% dos jogadores) | Horas (mediana) | Horas (90%) |\n|---|---|---|---|---|\n`;
md += `| 50% do catálogo | ${q(res.runs50, .5)} | ${q(res.runs50, .9)} | ${q(res.horas50, .5).toFixed(1)} | ${q(res.horas50, .9).toFixed(1)} |\n`;
md += `| 100% do catálogo | ${q(res.runs100, .5)} | ${q(res.runs100, .9)} | ${q(res.horas100, .5).toFixed(1)} | ${q(res.horas100, .9).toFixed(1)} |\n`;
md += `\nCartas compradas com créditos até completar: média ${avg(res.comprouCredito).toFixed(1)}.\n`;
fs.writeFileSync('docs/gdd/tempo_catalogo.md', md); console.log(md);
