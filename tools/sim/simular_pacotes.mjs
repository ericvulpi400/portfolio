// Simula N pacotes e confere as chances observadas com as tabelas de data/pacotes.json.
// uso: node tools/sim/simular_pacotes.mjs [N=1000000] [semente=20261121]
import fs from 'node:fs';
import { load, rng, RAR, makeCatalog, newPity, openPack } from './pacotes_ref.mjs';
const N = +(process.argv[2] || 1e6), SEED = +(process.argv[3] || 20261121), PACOTES_POR_RUN = 39;
const P = load('pacotes'); const pool = makeCatalog({ faccoes: ['humanos', 'anoes', 'elfos', 'vikings', 'aldeoes'] });
const r = rng(SEED);
const pos = { padrao: Object.fromEntries(RAR.map(k => [k, 0])), ultima: Object.fromEntries(RAR.map(k => [k, 0])) };
const tipos = { padrao: {}, ultima: {} }; const efetiva = Object.fromEntries(RAR.map(k => [k, 0]));
let nPad = 0, nUlt = 0, nUV = 0; const ver = { normal: 0, brilhante: 0, prisma: 0 };
const best = Object.fromEntries(RAR.map(k => [k, 0])); const garantias = { rara: 0, epica: 0, lendaria: 0 };
const seca = { rara: 0, epica: 0, lendaria: 0 }, secaMax = { rara: 0, epica: 0, lendaria: 0 };
let pity = newPity(); const t0 = Date.now();
for (let i = 0; i < N; i++) {
  if (i % PACOTES_POR_RUN === 0) { pity.rara = 0; pity.epica = 0; seca.rara = 0; seca.epica = 0; } // contadores de run zeram; lendária é do perfil
  const pk = openPack(r, P, pool, 'feira', pity);
  if (pk.viaGarantia) garantias[pk.viaGarantia]++;
  best[pk.best]++;
  for (const t of ['rara', 'epica', 'lendaria']) { if (RAR.indexOf(pk.best) >= RAR.indexOf(t)) seca[t] = 0; else { seca[t]++; secaMax[t] = Math.max(secaMax[t], seca[t]); } }
  for (const c of pk.cards) {
    const k = c.ultima ? 'ultima' : 'padrao'; if (c.ultima) nUlt++; else nPad++;
    if (!(c.ultima && pk.viaGarantia)) pos[k][c.rarSorteada]++;   // a tabela declarada vale para sorteios sem garantia
    tipos[k][c.tipo] = (tipos[k][c.tipo] || 0) + 1; efetiva[c.rar]++;
    if (c.tipo === 'unidade' || c.tipo === 'especial') { ver[c.versao]++; nUV++; }
  }
}
const ms = Date.now() - t0;
const nUltLivre = Object.values(pos.ultima).reduce((a, b) => a + b, 0);
const pct = (x, n) => (100 * x / n).toFixed(3) + '%';
const Tp = P.tabelas_raridade.padrao, Tu = P.tabelas_raridade.ultima;
// valores teóricos SEM garantia (para comparar o efeito dela)
const sem = (k) => { const i = RAR.indexOf(k); const pp = RAR.slice(i).reduce((s, x) => s + Tp[x], 0), pu = RAR.slice(i).reduce((s, x) => s + Tu[x], 0); return 1 - Math.pow(1 - pp, 4) * (1 - pu); };
let md = `# Simulação de ${N.toLocaleString('pt-BR')} Pacotes da Feira\n\nSemente ${SEED}; pool do estágio 1 (Humanos, Anões, Elfos, Vikings, Aldeões, itens, núcleos); garantias de run zeradas a cada ${PACOTES_POR_RUN} pacotes (uma run típica). Tempo: ${(ms / 1000).toFixed(1)} s. Gerado por \`tools/sim/simular_pacotes.mjs\`.\n\n`;
md += `## Raridade sorteada por posição (tabela declarada × observado)\n\n| Raridade | Cartas 1–4: tabela | observado | Última carta: tabela | observado |\n|---|---|---|---|---|\n`;
for (const k of RAR) md += `| ${k} | ${(Tp[k] * 100).toFixed(1)}% | ${pct(pos.padrao[k], nPad)} | ${(Tu[k] * 100).toFixed(1)}% | ${pct(pos.ultima[k], nUltLivre)} |\n`;
md += `\nNa coluna "última carta" ficam de fora as ${(nUlt - nUltLivre).toLocaleString('pt-BR')} últimas cartas sorteadas pela garantia (${pct(nUlt - nUltLivre, nUlt)}).\n\n## Tipo de carta por posição\n\n| Tipo | Cartas 1–4: tabela | observado | Última: tabela | observado |\n|---|---|---|---|---|\n`;
for (const k of ['unidade', 'item', 'especial', 'nucleo']) md += `| ${k} | ${((P.tabelas_tipo.padrao[k] || 0) * 100).toFixed(1)}% | ${pct(tipos.padrao[k] || 0, nPad)} | ${((P.tabelas_tipo.ultima[k] || 0) * 100).toFixed(1)}% | ${pct(tipos.ultima[k] || 0, nUlt)} |\n`;
md += `\n## Por pacote\n\n| Pelo menos uma… | Sem garantia (cálculo) | Com garantia (observado) | 1 a cada |\n|---|---|---|---|\n`;
for (const k of ['rara', 'epica', 'lendaria']) { const obs = RAR.slice(RAR.indexOf(k)).reduce((s, x) => s + best[x], 0) / N; md += `| ${k} ou melhor | ${(sem(k) * 100).toFixed(2)}% | ${(obs * 100).toFixed(2)}% | ${(1 / obs).toFixed(1)} pacotes |\n`; }
md += `\n## Garantias\n\n| Garantia | Regra | Disparou | % dos pacotes | Maior seca observada (dentro da run p/ rara e épica) |\n|---|---|---|---|---|\n`;
for (const g of P.garantias) md += `| ${g.id} | ${g.sem_por} pacotes sem → garante (${g.escopo}) | ${garantias[g.id].toLocaleString('pt-BR')} | ${pct(garantias[g.id], N)} | ${secaMax[g.id]} pacotes |\n`;
md += `\n## Versões (unidades e ajudantes)\n\n| Versão | Tabela | Observado | 1 a cada |\n|---|---|---|---|\n`;
for (const v of ['brilhante', 'prisma']) md += `| ${v} | ${(P.versoes[v] * 100).toFixed(2)}% | ${pct(ver[v], nUV)} | ${Math.round(nUV / ver[v]).toLocaleString('pt-BR')} cartas (${Math.round(N / ver[v]).toLocaleString('pt-BR')} pacotes) |\n`;
md += `\n## Raridade efetiva (depois da regra "sem carta desse tipo nessa raridade → sobe")\n\n| Raridade | % de todas as cartas |\n|---|---|\n`;
const tot = Object.values(efetiva).reduce((a, b) => a + b, 0); for (const k of RAR) md += `| ${k} | ${pct(efetiva[k], tot)} |\n`;
fs.mkdirSync('docs/gdd', { recursive: true }); fs.writeFileSync('docs/gdd/sim_pacotes.md', md);
console.log(md);
