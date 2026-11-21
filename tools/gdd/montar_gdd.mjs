// Monta docs/GDD.md a partir de docs/gdd/GDD.fonte.md, trocando {{tabela:nome}} por tabelas geradas de data/*.json
// e {{incluir:arquivo.md}} pelo conteúdo de docs/gdd/arquivo.md (saídas das simulações).
// uso: node tools/gdd/montar_gdd.mjs
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../..');
const J = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', n + '.json'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/strings/pt-BR.json'), 'utf8'));
const M = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/minifolks/manifest.json'), 'utf8'));
const t = (k) => T[k] ?? k;
const pct = (x) => (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
const tab = (cab, linhas) => `| ${cab.join(' | ')} |\n|${cab.map(() => '---').join('|')}|\n` + linhas.map(l => `| ${l.join(' | ')} |`).join('\n') + '\n';
const R = J('raridades'), C = J('classes'), RM = Object.fromEntries(R.lista.map(r => [r.id, r])), CM = Object.fromEntries(C.lista.map(c => [c.id, c]));
const B = C._base;
const sprite = (ref) => { const [pk, k] = ref.split('/'); const c = M.packs[pk]?.characters[k]; return c; };
const forma = { circulo: '●', quadrado: '■', losango: '◆', triangulo: '▲', estrela: '★' };

export function statsUnidade(u, nivel = 1) {
  const r = RM[u.raridade].mult, c = CM[u.classe], lv = 1 + 0.12 * (nivel - 1), a = u.ajuste || {};
  return { vid: Math.round(B.vid * c.vid * r * lv), atq: Math.round(B.atq * c.atq * r * lv), int: a.int_s ?? c.int_s, alc: a.alc ?? c.alc, vel: a.vel ?? c.vel, esp: c.espacos };
}
const G = {
  raridades: () => tab(['Raridade', 'Forma', 'Cor', 'Mult. atributos', 'XP ao absorver', 'Crédito de catálogo', 'Venda (× preço base da onda)'],
    R.lista.map(r => [t('rar.' + r.id), forma[r.forma], '`' + r.cor + '`', '×' + r.mult, r.xp_absorcao, r.credito_catalogo, '×' + J('economia').venda.fator[r.id]])),
  versoes: () => tab(['Versão', 'Chance por carta de unidade/ajudante', 'Bônus de atributos', 'Conta como cópias', 'Extra'],
    R.versoes.map(v => [t('versao.' + v.id), pct(v.chance), '+' + pct(v.bonus_atributos), v.conta_como_copias, v.jackpot ? `nasce no nível ${v.nivel_inicial}; jackpot: +${v.jackpot.ouro} ouro e todas as unidades da facção +${v.jackpot.nivel_faccao} nível` : '—'])),
  classes: () => tab(['Classe', 'VID', 'ATQ', 'Intervalo (s)', 'Alcance (px)', 'Velocidade (px/s)', 'Raio de guarda', 'Espaços', 'Particularidade', 'Sinergia 2 / 4'],
    C.lista.map(c => [t('classe.' + c.id), '×' + c.vid, '×' + c.atq, c.int_s, c.alc, c.vel, c.guarda || 'fica no lugar', c.espacos,
      c.bloqueio ? `bloqueia ${pct(c.bloqueio)}` : c.alvos ? `${c.alvos} alvos` : c.area_raio ? `área ${c.area_raio} px` : c.investida_mult ? `investida ×${c.investida_mult}` : c.aura_raio ? `aura ${c.aura_raio} px` : c.espacos > 1 ? 'pesado' : '—',
      C.sinergia.efeitos[c.id].map(e => Object.entries(e).map(([k, v]) => `${k} ${typeof v === 'number' && v < 1 ? '+' + pct(v) : v === true ? '' : '+' + v}`).join(', ')).join(' / ')])),
  faccoes_jogador: () => tab(['Facção', 'Pack', 'Cartas', 'Tipos únicos 2 / 4 / 6', 'Liberação'],
    J('faccoes').lista.filter(f => f.papel !== 'inimigo').map(f => { const n = f.id === 'aldeoes' ? J('cartas_especiais').lista.length : J('cartas_unidades').lista.filter(u => u.faccao === f.id).length;
      return [t('faccao.' + f.id), f.pack, n, f.limiares.map((l, i) => `${l}: ${typeof f.valores[i] === 'number' && f.valores[i] < 1 ? '+' + pct(f.valores[i]) : '+' + f.valores[i]}`).join(' · ') + ' (' + f.efeito.replaceAll('_', ' ') + ')', f.inicial ? 'inicial' : (f.desbloqueio || '').replaceAll('_', ' ')]; })),
  unidades: () => {
    const L = J('cartas_unidades').lista;
    return tab(['Carta', 'Sprite (pack/arquivo)', 'Tam.', 'Facção', 'Classe', 'Raridade', 'Esp.', 'VID', 'ATQ', 'Int. s', 'Alc.', 'Vel.', 'Animações usadas', 'Efeito'],
      L.map(u => { const s = statsUnidade(u), sp = sprite(u.sprite); const ef = u.efeito || {}; const an = ['idle', 'walk', u.anim_ataque, ef.anim_magia, ef.corpo_a_corpo, ef.bloqueio_anim, ef.anim_mover, ef.anim_ataque2, ef.combo?.anim, ef.onda?.anim, ef.arremesso?.anim, ef.furia?.anim, 'hit', 'death'].filter(Boolean);
        const falta = an.filter(a => !sp?.actions.includes(a)); if (falta.length) throw new Error(`${u.id}: sprite ${u.sprite} não tem ${falta.join(',')}`);
        return [t(`carta.${u.id}.nome`), '`' + u.sprite + '`', sp ? `${sp.cell.w}×${sp.cell.h}` : '?', t('faccao.' + u.faccao), t('classe.' + u.classe), t('rar.' + u.raridade), s.esp, s.vid, s.atq, s.int, s.alc, s.vel, [...new Set(an)].join(', '), t(`carta.${u.id}.efeito`)]; }));
  },
  unidades_niveis: () => { const u = J('cartas_unidades').lista.find(x => x.id === 'h_espadachim'); return tab(['Nível', ...Array.from({ length: 9 }, (_, i) => String(i + 1))], [['XP para o próximo', ...J('progressao').niveis.xp_para_subir.map(String), '—'], ['Estrelas', '★', '★', '★', '★★', '★★', '★★', '★★★', '★★★', '★★★'], ['Espadachim Comum VID', ...Array.from({ length: 9 }, (_, i) => String(statsUnidade(u, i + 1).vid))], ['Espadachim Comum ATQ', ...Array.from({ length: 9 }, (_, i) => String(statsUnidade(u, i + 1).atq))]]); },
  subclasses: () => tab(['Classe', 'Opção A', 'Opção B'], C.lista.map(c => [t('classe.' + c.id), `**${t(`sub.${c.id}.0.nome`)}** — ${t(`sub.${c.id}.0.desc`)}`, `**${t(`sub.${c.id}.1.nome`)}** — ${t(`sub.${c.id}.1.desc`)}`])),
  ajudantes: () => tab(['Ajudante', 'Sprite', 'Raridade', 'Animação no balcão', 'Efeito'], J('cartas_especiais').lista.map(a => { const sp = sprite(a.sprite); if (!sp?.actions.includes(a.anim_balcao)) throw new Error(a.id + ' sem ' + a.anim_balcao); return [t(`carta.${a.id}.nome`), '`' + a.sprite + '`', t('rar.' + a.raridade), a.anim_balcao, t(`carta.${a.id}.efeito`)]; })),
  itens: () => tab(['Item', 'Raridade', 'Alvo', 'Efeito'], J('cartas_itens').lista.map(i => [t(`carta.${i.id}.nome`), t('rar.' + i.raridade), i.alvo, t(`carta.${i.id}.efeito`)])),
  nucleos: () => tab(['Núcleo', 'Raridade', 'Efeito'], J('cartas_nucleos').lista.map(i => [t(`carta.${i.id}.nome`), t('rar.' + i.raridade), t(`carta.${i.id}.efeito`)])),
  amaldicoadas: () => tab(['Carta amaldiçoada', 'Efeito'], J('cartas_amaldicoadas').lista.map(i => [t(`carta.${i.id}.nome`), t(`carta.${i.id}.efeito`)])),
  tipos_pacote: () => { const P = J('pacotes'); return tab(['Pacote', 'Cartas', 'Preço (× base)', 'Tabela da última carta', 'Peso na prateleira', 'Descrição'], P.tipos.map(p => [t(`pacote.${p.id}.nome`), p.cartas, p.preco_mult ?? 'troca (cliente)', p.ultima, p.peso_prateleira + (p.onda_minima ? ` (onda ≥ ${p.onda_minima})` : ''), t(`pacote.${p.id}.desc`)])); },
  tabelas_raridade: () => { const P = J('pacotes'); const ks = Object.keys(P.tabelas_raridade); return tab(['Raridade', ...ks], ['comum', 'incomum', 'rara', 'epica', 'lendaria'].map(r => [t('rar.' + r), ...ks.map(k => pct(P.tabelas_raridade[k][r]))])); },
  tabelas_tipo: () => { const P = J('pacotes'); const ks = Object.keys(P.tabelas_tipo); return tab(['Tipo de carta', ...ks], ['unidade', 'item', 'especial', 'nucleo', 'amaldicoada'].map(r => [r, ...ks.map(k => pct(P.tabelas_tipo[k][r] || 0))])); },
  garantias: () => tab(['Garantia', 'Dispara depois de', 'Garante na última carta', 'Escopo do contador'], J('pacotes').garantias.map(g => [g.id, `${g.sem_por} pacotes seguidos sem ${g.garante} ou melhor`, `${t('rar.' + g.garante)} ou melhor`, g.escopo])),
  combos: () => tab(['Combo', 'Condição', 'Efeito'], J('combos').lista.map(k => [t(`combo.${k.id}.nome`), k.condicao, t(`combo.${k.id}.desc`)])),
  carimbos: () => tab(['Carimbo', 'Cargas iniciais', 'Máximo', 'Uso'], J('carimbos').lista.map(c => [t(`carimbo.${c.id}.nome`), c.cargas, c.max, c.uso])),
  inimigos: () => { const E = J('inimigos'); return tab(['Inimigo', 'Sprite', 'Tam.', 'Papel', 'VID (onda 1)', 'ATQ', 'Int. s', 'Alc.', 'Vel.', 'Dano à barraca', 'Ouro', 'Comportamento'], E.lista.map(e => { const sp = sprite(e.sprite); return [t(`inimigo.${e.id}.nome`), '`' + e.sprite + '`' + (e.variante_cor ? ' (' + e.variante_cor + ')' : ''), sp ? `${sp.cell.w}×${sp.cell.h}` : '?', e.papel, e.vid, e.atq, e.int_s, e.alc, e.vel, e.barraca, e.ouro, t(`inimigo.${e.id}.desc`)]; })); },
  ondas: () => { const S = J('estagio1'), E = Object.fromEntries(J('inimigos').lista.map(e => [e.id, e])); return tab(['Onda', 'Tipo', 'Inimigos', 'Mult. VID', 'Mult. ATQ', 'Entrada em (s)', 'Extra'], S.ondas.map(o => [o.onda, o.tipo === 'julgamento' ? `Julgamento: ${t('julgamento.' + o.julgamento + '.nome')}` : o.tipo === 'chefe' ? `**Chefe: ${t('inimigo.' + o.chefe + '.nome')}**` : 'normal', o.grupos.map(([id, q]) => `${q}× ${t('inimigo.' + id + '.nome')}`).join(', '), '×' + Math.pow(1.10, o.onda - 1).toFixed(2), '×' + Math.pow(1.06, o.onda - 1).toFixed(2), o.duracao_spawn_s, o.vitrine_mais ? `vitrine +${o.vitrine_mais}` : ''])); },
  julgamentos: () => tab(['Julgamento', 'Estágio', 'Regra e prêmio'], J('julgamentos').lista.map(j => [t(`julgamento.${j.id}.nome`), j.estagio, t(`julgamento.${j.id}.desc`)])),
  alvaras: () => tab(['Alvará', 'Raridade', 'Efeito'], J('alvaras').lista.map(a => [t(`alvara.${a.id}.nome`), t('rar.' + a.raridade), t(`alvara.${a.id}.desc`)])),
  cliente: () => tab(['Proposta', 'Peso', 'Custo', 'Ganha'], J('cliente_noite').ofertas.map(o => [t(`cliente.${o.id}.nome`), o.peso, Object.entries(o.custo).map(([k, v]) => `${v} ${k}`).join(', '), t(`cliente.${o.id}.desc`)])),
  comandante: () => { const K = J('comandante'); return tab(['Classe', 'Sprite', 'Liberação', 'Efeito'], K.classes.map(c => [t(`comandante.${c.id}.nome`), '`' + c.sprite + '`', c.inicial ? 'inicial' : c.desbloqueio.replaceAll('_', ' '), t(`comandante.${c.id}.desc`)])); },
  afixos: () => { const K = J('comandante'); return tab(['Afixo', 'Faixa (comum)', 'Restrição'], K.afixos.map(a => [a.id.replaceAll('_', ' '), `${a.min} a ${a.max}`, a.so_raridade_min ? `só ${a.so_raridade_min}+` : a.param ? `escolhe ${a.param}` : '—'])); },
  arvore: () => { const A = J('arvore'); const ramos = ['barraca', 'prateleira', 'vitrine']; return tab(['Ordem', ...ramos.map(r => t('arvore.' + r))], Array.from({ length: 8 }, (_, i) => [i + 1, ...ramos.map(r => { const n = A.nos.find(x => x.ramo === r && x.ordem === i + 1); return `${Object.entries(n.efeito).map(([k, v]) => `${k.replaceAll('_', ' ')} ${v > 0 ? '+' : ''}${v}`).join(', ')} — **${n.custo}**`; })])) + `\nCusto total da árvore: **${A.custo_total} fichas**.\n`; },
  conquistas: () => tab(['#', 'Id', 'Nome', 'Descrição', 'Grupo'], J('steam').conquistas.map((a, i) => [i + 1, '`' + a.id + '`', t(`conquista.${a.id}.nome`), t(`conquista.${a.id}.desc`), a.grupo])),
  dificuldades: () => tab(['Dificuldade', 'VID inimigos', 'ATQ inimigos', 'Outros', 'Liberação'], J('meta').dificuldades.map(d => [t('dificuldade.' + d.id), (d.inimigos_vid >= 0 ? '+' : '') + pct(d.inimigos_vid), (d.inimigos_atq >= 0 ? '+' : '') + pct(d.inimigos_atq), [d.vida_barraca ? `barraca +${d.vida_barraca}` : '', d.preco_pacotes ? `pacotes +${pct(d.preco_pacotes)}` : '', d.garantia_rara ? `garantia rara em ${d.garantia_rara}` : '', d.cliente_noite ? 'cliente só em ondas ímpares' : ''].filter(Boolean).join(', ') || '—', d.desbloqueio.replaceAll('_', ' ')])),
};
let src = fs.readFileSync(path.join(ROOT, 'docs/gdd/GDD.fonte.md'), 'utf8');
src = src.replace(/\{\{tabela:(\w+)\}\}/g, (_, n) => { if (!G[n]) throw new Error('tabela desconhecida ' + n); return G[n](); });
src = src.replace(/\{\{incluir:([\w.]+)\}\}/g, (_, f) => fs.readFileSync(path.join(ROOT, 'docs/gdd', f), 'utf8').replace(/^# .*\n/, '').trim() + '\n');
fs.writeFileSync(path.join(ROOT, 'docs/GDD.md'), src);
console.log('docs/GDD.md', src.split('\n').length, 'linhas');
