// Tabela de economia das ondas do estágio 1 + valor médio de um pacote (venda e XP), a partir de data/*.json.
// uso: node tools/sim/economia.mjs
import fs from 'node:fs';
import { load, rng, makeCatalog, newPity, openPack } from './pacotes_ref.mjs';
const E = load('economia'), P = load('pacotes'), I = Object.fromEntries(load('inimigos').lista.map(e => [e.id, e])), S = load('estagio1'), R = load('raridades');
const renda = (w) => E.renda_onda.base + E.renda_onda.por_onda * w, base = (w) => P.preco.base + P.preco.por_onda * w, preco = (w, n, mult = 1) => Math.round(base(w) * mult * P.preco.escada_na_onda[n]);
const vidEsc = (w) => Math.pow(1.10, w - 1);
function ondaInfo(o) {
  let ouro = 0, vid = 0, cont = 0;
  const add = (id, q, chefe = false) => { const e = I[id]; ouro += e.ouro * q; cont += q; vid += (e.papel === 'chefe' ? e.vid : Math.round(e.vid * vidEsc(o.onda))) * q;
    if (e.efeito?.ao_morrer) add(e.efeito.ao_morrer.gera, e.efeito.ao_morrer.qtd * q);
    if (e.efeito?.divide) add(e.efeito.divide.gera, e.efeito.divide.qtd * Math.round(1 / e.efeito.divide.a_cada_pct - 1) * q); };
  for (const [id, q] of o.grupos) add(id, q);
  return { ouro, vid, cont };
}
// valor médio de um Pacote da Feira: soma do preço de venda e do XP de absorção das cartas
const r = rng(7), pool = makeCatalog({ faccoes: ['humanos', 'anoes', 'elfos', 'vikings', 'aldeoes'] }); let pity = newPity();
const xpR = Object.fromEntries(R.lista.map(x => [x.id, x.xp_absorcao]));
let venda = 0, xp = 0; const N = 200000;
for (let i = 0; i < N; i++) { const pk = openPack(r, P, pool, 'feira', pity); for (const c of pk.cards) { const m = c.versao === 'brilhante' ? 2 : c.versao === 'prisma' ? 5 : 1; venda += E.venda.fator[c.rar] * m; if (c.tipo === 'unidade') xp += xpR[c.rar] * (c.versao === 'brilhante' ? 2 : c.versao === 'prisma' ? 4 : 1); } }
const vendaMed = venda / N, xpMed = xp / N;
// bots simples (sem vender cartas): gastador compra até 3 por onda; poupador compra só se sobrar ≥ 40 depois
let md = `# Economia do estágio 1 (Mercador)\n\nGerado por \`tools/sim/economia.mjs\`. Renda = ${E.renda_onda.texto}; preço do Pacote da Feira = (${P.preco.texto}) × escada [1; 1,5; 2,2] para o 1º, 2º e 3º pacote da onda; juros = 1 por 10 guardados (máx. 4). Ouro inicial ${E.ouro_inicial}. Os bots **não vendem cartas** (vender todas as cartas de um pacote devolve em média **${(vendaMed*100).toFixed(0)}% do preço base** da onda; nunca dá lucro).\n\n`;
md += `| Onda | Tipo | Inimigos | VID total | Ouro da onda (renda + abates) | Pacote 1 / 2 / 3 | 3 pacotes | Gastador: compra / sobra | Poupador: compra / sobra |\n|---|---|---|---|---|---|---|---|---|\n`;
let g = E.ouro_inicial, p = E.ouro_inicial, gTot = 0, pTot = 0;
for (const o of S.ondas) {
  const info = ondaInfo(o); const pr = [0, 1, 2].map(n => preco(o.onda, n));
  let gc = 0; while (gc < 3 && g >= pr[gc]) { g -= pr[gc]; gc++; } gTot += gc;
  let pc = 0; while (pc < 3 && p - pr[pc] >= 40) { p -= pr[pc]; pc++; } if (pc === 0 && p >= pr[0] && o.onda <= 2) { p -= pr[0]; pc = 1; } pTot += pc;
  const ganho = renda(o.onda) + info.ouro;
  const jg = Math.min(4, Math.floor(g / 10)), jp = Math.min(4, Math.floor(p / 10));
  md += `| ${o.onda} | ${o.tipo}${o.julgamento ? ' (' + o.julgamento + ')' : o.chefe ? ' (' + o.chefe + ')' : ''} | ${info.cont} | ${info.vid} | ${renda(o.onda)} + ${info.ouro} = ${ganho} | ${pr.join(' / ')} | ${pr.reduce((a, b) => a + b, 0)} | ${gc} / ${g} | ${pc} / ${p} |\n`;
  g += ganho + jg; p += ganho + jp;
}
md += `\nTotal de pacotes nas 15 ondas: gastador **${gTot}**, poupador **${pTot}**. Juros entram depois da onda. Valor médio de um Pacote da Feira: venda ${(vendaMed*100).toFixed(0)}% do preço base; XP de absorção das unidades ${xpMed.toFixed(1)}.\n`;
fs.writeFileSync('docs/gdd/economia.md', md); console.log(md);
