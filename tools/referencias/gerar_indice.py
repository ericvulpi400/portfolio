#!/usr/bin/env python3
"""Gera referencias/INDICE.md a partir de referencias/indice.json (saída de baixar_referencias.py)."""
import json, collections, os
R = os.path.join(os.path.dirname(__file__), '..', '..', 'referencias')
idx = json.load(open(os.path.join(R, 'indice.json')))
cat = lambda f: f.split('/')[-1].rsplit('_', 1)[0]
PACK = {'pacote_fechado', 'abertura_pacote', 'carta_destaque', 'escolha_pacote', 'chances', 'revelacao_rara', 'carta_nova', 'album',
        'versoes_raras', 'detalhe_carta', 'bestiario', 'absorcao_estrelas', 'cartas_em_jogo', 'mao_de_cartas'}
n_pack = sum(cat(i['arquivo']) in PACK for i in idx)
L = ['# Índice de referências (Fase 0.1)', '',
     f'{len(idx)} imagens de {len(set(i["jogo"] for i in idx))} jogos; **{n_pack}** ({100*n_pack//len(idx)}%) mostram pacotes, cartas, revelação, coleção ou absorção.', '',
     '> As imagens são de terceiros, só para comparação interna, e **não vão para o Git** (o repositório é público).',
     '> Recrie com `python3 tools/referencias/baixar_referencias.py`, `python3 tools/referencias/gerar_indice.py` e `bash tools/referencias/montar_pranchas.sh`.',
     '> Nada daqui é embutido, recortado, retraçado ou redesenhado no jogo.', '',
     'Tags: visual, gameplay, economia, estrutura, layout, UX, feedback, legibilidade, coleção, chances, marketing.', '',
     '## Pranchas comparativas (`referencias/pranchas/`)', '', '| Prancha | Conteúdo |', '|---|---|']
for n, t in [('01_pacotes_e_abertura', 'pacote fechado, abertura, carta em destaque, draft de pacotes, chance na tela, mão de cartas'),
             ('02_revelacao_rara', 'revelação de raridade alta, silhueta antes da carta nova'), ('03_album_colecao', 'álbuns, coleção, variantes, bestiário'),
             ('04_detalhe_carta', 'detalhe de carta e texto de efeito'), ('05_campo_cheio', 'campo cheio, chefe, infinito'),
             ('06_absorcao_evolucao', 'absorção, promoção, forja'), ('07_loja', 'lojas'), ('08_escolha_1de3', 'escolhas 1-de-3'),
             ('09_meta_e_fim_de_run', 'fim de run, árvore, equipamento, bestiário'), ('10_preparacao_e_menus', 'preparação, menus, desafios, mapa'),
             ('11_capsulas_steam', 'cápsulas da loja')]:
    L.append(f'| `{n}.png` | {t} |')
L += ['', '## Cobertura por categoria pedida', '', '| Categoria | Arquivos |', '|---|---|']
need = {'tela de preparação': ['preparacao'], 'pacote fechado': ['pacote_fechado', 'escolha_pacote'], 'cartas sendo viradas / abertas': ['abertura_pacote', 'carta_destaque', 'chances', 'cartas_em_jogo', 'mao_de_cartas'],
        'revelação de carta rara': ['revelacao_rara', 'carta_nova'], 'álbum de coleção': ['album', 'versoes_raras', 'bestiario'], 'detalhe de carta': ['detalhe_carta', 'subclasse'],
        'campo de batalha cheio': ['campo_cheio', 'campo', 'chefe', 'infinito'], 'absorção e estrelas': ['absorcao_estrelas', 'evolucao'], 'loja': ['loja'],
        'escolha 1-de-3': ['escolha_1de3', 'artefato_1de3'], 'árvore permanente': ['arvore_permanente'], 'escavação': ['escavacao'], 'fim de run': ['fim_de_run'],
        'menus e configurações': ['menus', 'configuracoes', 'mapa'], 'equipamento': ['equipamento'], 'cápsulas da loja Steam': ['capsula_steam']}
for k, cs in need.items():
    fs = [i['arquivo'] for i in idx if cat(i['arquivo']) in cs]
    L.append(f'| {k} | {", ".join("`"+f+"`" for f in fs) if fs else "**faltando** (ver abaixo)"} |')
L += ['', '## Imagens', '']
by = collections.OrderedDict()
for i in idx: by.setdefault(i['jogo'], []).append(i)
for g, items in by.items():
    L += [f'### {g} (app {items[0]["appid"]})', '', '| Arquivo | O que ensina | Tags | Fonte |', '|---|---|---|---|']
    for i in items:
        src = i['fonte']; url, _, extra = src.partition(' @ ')
        L.append(f'| `{i["arquivo"]}` | {i["ensina"]} | {i["tags"]} | [{"trailer" if extra else "imagem"}]({url}){" @ " + extra if extra else ""} |')
    L.append('')
L += ['## O que faltou (preciso de ajuda)', '',
      '- **Pokémon TCG Pocket** e **Hearthstone**: não estão na Steam e os sites com imagens (serebii.net, hearthstone.wiki.gg, sites oficiais) estão fora da rede deste ambiente. Peço prints de: pacote fechado, pacote rasgando, carta virando com brilho de raridade, carta rara/“imersiva”, tela de chances do pacote, álbum, troca por pontos (Pocket) e pó/criação (Hearthstone).',
      '- **Wallpaper Game – Questbar RPG**: só 1 print (campo). O Google Play está fora da rede daqui; prints de equipamento e do personagem ainda ajudariam (opcional).',
      '- **Slotbound jogado** (opcional): prints da demo com a tela de chances, absorção passo a passo, um julgamento e a meta-progressão.',
      '- **Escavação**: nenhum dos jogos tem uma tela de escavação curta; essa tela vai partir de referência de mecânica (camadas, dureza), não de layout.',
      '- YouTube (vídeos de gameplay) não é acessível daqui; os quadros vieram dos trailers oficiais hospedados na Steam. Não achei wiki do Slotbound.', '']
open(os.path.join(R, 'INDICE.md'), 'w').write('\n'.join(L))
print(n_pack, len(idx))
