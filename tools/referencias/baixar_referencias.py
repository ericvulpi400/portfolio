#!/usr/bin/env python3
"""Baixa (de novo) as imagens de referência da Fase 0 a partir da Steam (screenshots, cápsulas e quadros de trailer).

As imagens são de terceiros (só para comparação interna) e NÃO vão para o Git: o repositório é público.
Este script recria referencias/<jogo>/<categoria>_NN.png de forma reproduzível.

uso: python3 tools/referencias/baixar_referencias.py  (precisa de ffmpeg e ImageMagick `convert`)
"""
import json, os, subprocess, sys, tempfile, urllib.request, urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'referencias'))
UA = {'User-Agent': 'Mozilla/5.0'}

GAMES = {  # pasta: (app id na Steam, nome)
    'slotbound': (4459590, 'Slotbound'), 'slotbound_demo': (4906570, 'Slotbound Demo'),
    'balatro': (2379780, 'Balatro'), 'marvel_snap': (1997040, 'MARVEL SNAP'),
    'cardboard_conquest': (4937370, 'Cardboard Conquest'), 'dragon_eclipse': (2626860, 'Dragon Eclipse'),
    'auto_dungeon': (2849990, 'Auto Dungeon'), 'seedborne_soldiers': (3039930, 'Seedborne Soldiers'),
    'my_life_as_an_archeologist': (1689350, 'My life as an archeologist'),
}
# (pasta, arquivo destino, fonte, índice/segundo, o que ensina [tags])
#   fonte: 'shot' = screenshot da loja (índice), 'movie' = trailer (índice do vídeo, quadro N da extração 1 quadro a cada 2 s),
#          'header'/'capsule' = arte da loja
SEL = [
    ('slotbound', 'preparacao_01', 'shot', 0, 'Preparação: máquina 3x3 à esquerda, campo à direita, onda/ouro/limite no topo. Tudo numa tela, sem troca de cena.', 'layout,UX,gameplay'),
    ('slotbound', 'revelacao_rara_01', 'shot', 1, 'Invocação lendária: feixe de luz + rótulo com a chance (0,1%). A raridade vem com o número.', 'feedback,visual'),
    ('slotbound', 'revelacao_rara_02', 'shot', 5, 'Jackpot: a moldura inteira da máquina vira ouro e a tela pisca. Escala do feedback ~ raridade.', 'feedback,visual'),
    ('slotbound', 'chefe_01', 'shot', 2, 'Onda de chefe: barra de vida larga no topo, nome do chefe, ícone de chefe sobre a máquina.', 'layout,gameplay'),
    ('slotbound', 'campo_cheio_01', 'shot', 4, 'Campo cheio com ~25 unidades legíveis: sombra, barra de vida mini, escala 1x.', 'visual,legibilidade'),
    ('slotbound', 'escolha_1de3_01', 'shot', 3, 'Escolha de núcleo 1-de-3: pergaminhos com raridade por cor e texto, "quando usa" no rodapé, botão Reroll.', 'UX,layout'),
    ('slotbound', 'loja_01', 'shot', 6, 'Loja: vendedor como personagem, 3 itens + 2 ações (vender/reroll), custo em gemas sob cada item.', 'layout,economia'),
    ('slotbound', 'album_01', 'shot', 7, 'Coleção em livro: grade de silhuetas, página da direita com atributos, habilidade e árvore de promoção.', 'layout,coleção'),
    ('slotbound_demo', 'chances_01', 'movie', (1, 6), 'Tooltip "Warrior (Normal) — Chance 95%" ao invocar: chance explícita no momento da revelação.', 'UX,chances'),
    ('slotbound_demo', 'absorcao_estrelas_01', 'movie', (1, 8), 'Absorção: painel de níveis e efeitos herdados ("Imprint"), confirmação explícita de absorver.', 'gameplay,UX'),
    ('slotbound_demo', 'absorcao_estrelas_02', 'movie', (1, 9), 'Promoção de classe: carta destacada com raios, novos atributos listados.', 'feedback,gameplay'),
    ('slotbound', 'revelacao_rara_03', 'movie', (0, 13), 'Jackpot com confete multicolor saindo da máquina.', 'feedback'),
    ('slotbound', 'infinito_01', 'movie', (0, 25), 'Modo infinito: contador de onda grande (97) no topo.', 'estrutura,marketing'),
    ('slotbound', 'capsula_steam_01', 'header', None, 'Cápsula: heróis em pose de ação + a máquina como ícone do gancho, logo grande em pixel.', 'marketing'),
    ('balatro', 'pacote_fechado_01', 'shot', 4, 'Pacotes fechados lado a lado: Normal/Jumbo/Mega pelo tamanho e brilho; arte da embalagem diz o tipo.', 'visual,pacote'),
    ('balatro', 'abertura_pacote_01', 'shot', 1, 'Pacote aberto: cartas em leque, escolha 1 de N, tooltip da carta sob o leque, partículas douradas.', 'UX,pacote'),
    ('balatro', 'loja_01', 'shot', 8, 'Loja: placa "SHOP", pacote Celestial aberto com 3 cartas, botão Skip. Pacotes vendidos na loja da run.', 'layout,pacote,economia'),
    ('balatro', 'detalhe_carta_01', 'shot', 7, 'Detalhe: caixa com nome, efeito numérico curto e selo de raridade colorido (Uncommon).', 'legibilidade,UX'),
    ('balatro', 'album_01', 'shot', 3, 'Coleção: grade 5x3 de jokers com paginação; faltantes ficam ocultos.', 'coleção,layout'),
    ('balatro', 'versoes_raras_01', 'shot', 2, 'Edições raras (foil/holo/polychrome) na mesma carta: o efeito visual muda, a arte não.', 'visual,raridade'),
    ('balatro', 'menus_01', 'shot', 6, 'Visão do baralho: contagem por naipe/valor, abas no topo (Deck/Vouchers/Poker Hands).', 'UX,menus'),
    ('balatro', 'configuracoes_01', 'shot', 11, 'Desafios: lista numerada com regras, painel de modificadores à direita, botão PLAY grande.', 'menus,estrutura'),
    ('balatro', 'carta_destaque_01', 'movie', (0, 9), 'Carta de planeta isolada no centro durante a revelação: tamanho grande, fundo escuro, sem distrações.', 'feedback,pacote'),
    ('balatro', 'capsula_steam_01', 'header', None, 'Cápsula: só o logo e cartas; legível em tamanho pequeno.', 'marketing'),
    ('marvel_snap', 'album_01', 'shot', 3, 'Coleção: grade densa com custo/poder nos cantos, filtros no topo, álbuns separados.', 'coleção,layout'),
    ('marvel_snap', 'detalhe_carta_01', 'shot', 4, 'Detalhe da carta: carta grande à esquerda, variantes à direita, cosméticos (borda, acabamento).', 'UX,coleção'),
    ('marvel_snap', 'versoes_raras_01', 'shot', 5, 'Variantes da mesma carta em leque: a coleção cresce sem mudar a regra do jogo.', 'coleção,marketing'),
    ('marvel_snap', 'revelacao_rara_01', 'movie', (0, 3), 'Revelação: carta no centro com aura e partículas em anel.', 'feedback'),
    ('marvel_snap', 'album_02', 'movie', (0, 6), 'Muro de cartas: mostra o tamanho da coleção num só quadro (marketing).', 'marketing,coleção'),
    ('marvel_snap', 'fim_de_run_01', 'movie', (0, 53), 'Recompensas da partida: carta ganha em destaque + barra de progresso.', 'feedback,meta'),
    ('marvel_snap', 'revelacao_rara_02', 'movie', (3, 13), 'Carta em tela cheia com moldura quebrada (arte saindo da borda) para a raridade máxima.', 'feedback,visual'),
    ('cardboard_conquest', 'escolha_pacote_01', 'shot', 3, '"Monte seu arsenal": 3 pacotes temáticos, escolhe 1; cada pacote mostra o tema e "ver cartas".', 'pacote,UX'),
    ('cardboard_conquest', 'escolha_pacote_02', 'movie', (0, 9), '"Draft 3 de 23 pacotes": contador do draft visível, pacote = facção/tema.', 'pacote,estrutura'),
    ('cardboard_conquest', 'carta_nova_01', 'movie', (0, 5), '"Novas cartas desbloqueadas": silhueta preta antes da revelação (suspense).', 'feedback,coleção'),
    ('cardboard_conquest', 'carta_nova_02', 'movie', (0, 6), 'A silhueta revela a carta; contador "1068 cartas" reforça o tamanho da coleção.', 'feedback,coleção'),
    ('cardboard_conquest', 'fim_de_run_01', 'shot', 11, 'Vitória: carta nova desbloqueada no centro + 6 estatísticas da run em caixas.', 'meta,layout'),
    ('cardboard_conquest', 'loja_01', 'shot', 13, 'Mercador: cartas na prateleira com preço, poções e "queimar carta" (ralo de baralho).', 'economia,layout'),
    ('cardboard_conquest', 'campo_cheio_01', 'shot', 1, 'Tabuleiro com trilhas: mão de cartas embaixo, controles de velocidade (pausa, >>), log.', 'layout,UX'),
    ('cardboard_conquest', 'menus_01', 'shot', 8, 'Escolha de comandante: personagens em roda, poder do comandante em caixa, botão grande embaixo.', 'menus,UX'),
    ('dragon_eclipse', 'escolha_1de3_01', 'shot', 7, 'Escolha em pedestais: 3 criaturas com "+1 poder", tooltip do talento ao lado.', 'UX,gameplay'),
    ('dragon_eclipse', 'evolucao_01', 'shot', 3, 'Forja de cartas: duplicar / melhorar / remover — três máquinas, três ralos.', 'gameplay,economia'),
    ('dragon_eclipse', 'subclasse_01', 'shot', 9, '"Escolha um novo talento": 3 opções textuais curtas com números em destaque colorido.', 'gameplay,legibilidade'),
    ('dragon_eclipse', 'loja_01', 'shot', 4, 'Loja: 4 cartas com preço em cima, consumíveis embaixo, removedor de cartas.', 'economia,layout'),
    ('dragon_eclipse', 'preparacao_01', 'shot', 13, 'Preparação: 3 criaturas em slots, cartas à direita, cadeado e reroll com custo.', 'layout,UX'),
    ('dragon_eclipse', 'campo_cheio_01', 'shot', 10, 'Combate lateral: efeitos grandes, números de dano, ícones de status sob cada unidade.', 'feedback,visual'),
    ('auto_dungeon', 'campo_cheio_01', 'shot', 9, 'Combate automático em sala: HUD mínimo, botão BATTLE e carta de aflição no canto.', 'layout'),
    ('seedborne_soldiers', 'campo_cheio_01', 'shot', 2, 'Arena com muitas unidades + efeitos de área; retratos do exército nas laterais.', 'layout,visual'),
    ('seedborne_soldiers', 'escolha_1de3_01', 'shot', 3, 'Colheita: tiers I/II/III de unidades com chance por tier no tooltip.', 'chances,UX'),
    ('seedborne_soldiers', 'loja_01', 'shot', 7, 'Mercador de itens: troca 1 item por outro, contador de trocas restantes.', 'economia'),
    ('seedborne_soldiers', 'mapa_01', 'shot', 1, 'Mapa hexagonal com caminhos e tipos de nó.', 'estrutura'),
    ('my_life_as_an_archeologist', 'equipamento_01', 'shot', 1, 'Inventário em grade com raridade por cor e afixos numéricos (+% ouro, +autoclicks).', 'gameplay,itens'),
    ('my_life_as_an_archeologist', 'artefato_1de3_01', 'movie', (0, 14), 'Chefe vencido → 3 artefatos, escolhe 1; cada um com efeito de uma linha.', 'gameplay,UX'),
    ('my_life_as_an_archeologist', 'bestiario_01', 'shot', 5, 'Pesquisa/bestiário: carta por monstro com barra de progresso (6/8), check ao completar, custo em ouro.', 'coleção,meta'),
    ('my_life_as_an_archeologist', 'arvore_permanente_01', 'shot', 4, 'Habilidades: 3 classes em colunas, pontos restantes no topo.', 'meta,layout'),
    ('my_life_as_an_archeologist', 'escolha_1de3_01', 'shot', 6, 'Cartas de tarô com risco/recompensa (enfrentar o chefe já, dobrar inimigo por item lendário).', 'gameplay'),
    ('my_life_as_an_archeologist', 'campo_01', 'shot', 0, 'Faixa de combate lateral com retratos e barras grandes nos cantos inferiores.', 'layout'),
    ('slotbound', 'album_02', 'movie', (0, 7), 'Livro de coleção com contador "120+ unidades": a coleção vira argumento de marketing.', 'coleção,marketing'),
    ('slotbound_demo', 'detalhe_carta_01', 'movie', (1, 12), 'Itens como cartas-pergaminho: nome, ícone, raridade por texto+cor, efeito em 2 linhas, "Use: 1/wave".', 'legibilidade,layout'),
    ('balatro', 'cartas_em_jogo_01', 'shot', 0, 'Mão em jogo: cartas grandes embaixo, jokers no topo, pontuação "+10" saltando sobre a carta.', 'feedback,layout'),
    ('balatro', 'cartas_em_jogo_02', 'shot', 5, 'Mão de 8 cartas em leque com contador 8/8 e botões de ordenar; regra especial em faixa no topo.', 'UX,legibilidade'),
    ('balatro', 'detalhe_carta_02', 'shot', 9, 'Tabela de mãos com nível e exemplo de cartas: regra explicada com as próprias cartas.', 'UX,legibilidade'),
    ('marvel_snap', 'album_03', 'movie', (0, 5), 'Duas fileiras de cartas com custo (azul) e poder (laranja) sempre no mesmo canto.', 'legibilidade,coleção'),
    ('marvel_snap', 'revelacao_rara_03', 'movie', (3, 9), 'Carta jogada cresce até ocupar a tela, com moldura especial e número de poder grande.', 'feedback,visual'),
    ('marvel_snap', 'revelacao_rara_04', 'shot', 1, 'Explosão em estrela branca com o logo no centro: o "momento de aposta" tem efeito próprio.', 'feedback'),
    ('dragon_eclipse', 'mao_de_cartas_01', 'shot', 6, 'Mão de cartas: carta sob o cursor sobe e cresce; custo no canto, texto curto com número em destaque.', 'UX,legibilidade'),
    ('dragon_eclipse', 'mao_de_cartas_02', 'shot', 0, 'Mão com 4 cartas e criaturas acima: barra de vida e intenção de cada inimigo.', 'layout'),
    ('cardboard_conquest', 'mao_de_cartas_01', 'shot', 2, 'Cartas-unidade na mão sob o tabuleiro: cada carta vira um exército na trilha.', 'gameplay,layout'),
    ('my_life_as_an_archeologist', 'capsula_steam_01', 'header', None, 'Cápsula pixel art com personagem e logo curvo.', 'marketing'),
    ('cardboard_conquest', 'capsula_steam_01', 'header', None, 'Cápsula: diorama de papelão com personagens e logo; estilo vende o tema.', 'marketing'),
    ('dragon_eclipse', 'capsula_steam_01', 'header', None, 'Cápsula: criatura central + logo; muito detalhe some em tamanho pequeno.', 'marketing'),
]

def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()

def hls_to_file(master, out):
    lines = get(master).decode().splitlines()
    variants = [l for l in lines if l and not l.startswith('#')]
    vurl = urllib.parse.urljoin(master, variants[min(1, len(variants) - 1)])  # 720p
    parts = []
    for l in get(vurl).decode().splitlines():
        if l.startswith('#EXT-X-MAP'): parts.append(l.split('URI="')[1].split('"')[0])
        elif l and not l.startswith('#'): parts.append(l)
    with open(out, 'wb') as f:
        for p in parts: f.write(get(urllib.parse.urljoin(vurl, p)))

def main():
    tmp = tempfile.mkdtemp(prefix='refs-')
    info, index = {}, []
    for key, (appid, _) in GAMES.items():
        d = json.loads(get(f'https://store.steampowered.com/api/appdetails?appids={appid}&l=english&cc=US'))[str(appid)]['data']
        info[key] = d
    vids = {}
    for game, name, src, arg, teaches, tags in SEL:
        d = info[game]; os.makedirs(os.path.join(ROOT, game), exist_ok=True)
        out = os.path.join(ROOT, game, name + '.png'); raw = os.path.join(tmp, f'{game}_{name}.bin')
        if src == 'shot':
            url = d['screenshots'][arg]['path_full'].split('?')[0]; open(raw, 'wb').write(get(url))
        elif src in ('header', 'capsule'):
            url = (d['header_image'] if src == 'header' else d['capsule_image']).split('?')[0]; open(raw, 'wb').write(get(url))
        else:
            mi, nq = arg; m = d['movies'][mi]; url = m['hls_h264'].split('?')[0]
            vf = os.path.join(tmp, f'{game}_{mi}.mp4')
            if vf not in vids: hls_to_file(m['hls_h264'], vf); vids[vf] = True
            # mesmo critério da triagem: 1 quadro a cada 2 s, pega o N-ésimo (≈ segundo 2*(N-1))
            subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', vf, '-vf', f"fps=1/2,select=eq(n\\,{nq - 1})", '-frames:v', '1', raw + '.png'], check=True); raw += '.png'
            url = f'{url} @ ~{2 * (nq - 1)}s, quadro {nq} ({m.get("name")})'
        subprocess.run(['convert', raw, '-resize', '1280x1280>', out], check=True)
        index.append({'arquivo': os.path.relpath(out, ROOT), 'jogo': GAMES[game][1], 'appid': GAMES[game][0], 'fonte': url, 'ensina': teaches, 'tags': tags})
        print('ok', os.path.relpath(out, ROOT))
    json.dump(index, open(os.path.join(ROOT, 'indice.json'), 'w'), ensure_ascii=False, indent=1)
    print(len(index), 'imagens')

if __name__ == '__main__':
    sys.exit(main())
