# Mockups × pranchas de referência (Fase 2)

Mockups em `docs/mockups/*.png`, área segura 426×240 ampliada 3× (1278×720, o tamanho do Steam Deck), desenhados por
`tools/mockups/mockups.js` com os sprites reais do MiniFolks, a fonte m5x7 e a paleta do GDD. Recriar:
`node tools/mockups/render.mjs`.

| Mockup | O que mostra |
|---|---|
| `preparacao.png` | HUD, barraca com dono e ajudante, vitrine 3×5, sinergias, prateleira com 3 pacotes e preço, estoque lacrado, bolso, núcleos, tabela de chances, botão "Abrir a feira!" |
| `abertura.png` | 3 cartas viradas (Comum, Comum, Rara com partículas), 4ª de costas brilhando roxo (Épica a caminho), última carta, carimbos e garantia |
| `prisma.png` | revelação Prisma: tela escura pontilhada, raios na paleta, confete, carta grande holográfica, jackpot |
| `combate.png` | 12 unidades × 12 bichos, barras de vida, números de dano, bloqueio, explosão de granada, barra da onda, velocidade |
| `catalogo.png` | página dos Humanos (9/12, silhuetas nas que faltam, uma Brilhante), carta em detalhe, compra com créditos |
| `cartas.png` | 3 cartas no tamanho de detalhe (128×176): Comum, Rara e Prisma |

## Comparação com as pranchas

| Prancha | O que a referência faz | Como o mockup responde | Diferença deliberada / ação |
|---|---|---|---|
| 01 pacotes e abertura | Balatro: pacote grande com arte que diz o tipo; leque de cartas e escolha. Slotbound: chance escrita na hora ("Chance 95%") | embalagem 40×52 com cor + nome do tipo + preço no canto; cartas em fila; painel de chances sempre visível; garantia com barras | **Ação**: mostrar a chance da carta no momento em que vira (rótulo de 1 s, "Rara · 18%"), como o Slotbound faz — entrou no GDD §16.4 |
| 02 revelação rara | Slotbound: feixe de luz e moldura dourada no jackpot. Snap: carta cresce até a tela, moldura quebrada. Cardboard: silhueta antes da carta nova | brilho por raridade antes de virar; Prisma com raios, confete e carta grande | Épica e Lendária ainda não têm mockup próprio (estão descritas no §16.4) |
| 03 álbum | Slotbound: livro com grade à esquerda e detalhe à direita. Snap: grade densa. My Life: cartas com barra de progresso | livro com grade 4×3 e detalhe à direita | **Ação**: o layout ficou parecido demais com o livro do Slotbound. Na fatia, trocar por **fichário de colecionador** (folhas com plástico 3×3 nas duas páginas, detalhe em janela) — registrado em §17 |
| 04 detalhe de carta | Balatro: caixa curta com número em destaque; Dragon Eclipse: números coloridos | carta grande com classe, VID/ATQ/intervalo e efeito em até 3 linhas | ok; números do efeito em cor (amarelo) na Fase 3 |
| 05 campo cheio | Slotbound: campo emoldurado ao lado da máquina, unidades 1× com barras mini | campo ocupa a largura toda, barraca à esquerda; 24 personagens legíveis a 1× | ok; a leitura depende das barras de 2 px e da cor do lado |
| 07 loja / 10 preparação | Slotbound: máquina à esquerda, tudo numa tela. Dragon Eclipse: preço em cima das cartas | painel de baixo com prateleira, estoque, bolso, núcleos e chances numa tela só, sem troca de cena | ok; diferente o bastante do Slotbound (sem máquina, painel embaixo) |
| 11 cápsulas | logo grande + personagens | — | cápsulas ficam para a Fase 5 |

## Defeitos achados nos mockups (e o que mudou)

| Defeito | Correção | Vale para o jogo? |
|---|---|---|
| m3x6 e m6x11 borram no Canvas (pixels parciais em qualquer tamanho); só m5x7 é exata em 16 e 32 px | mockups usam só m5x7 (16 px texto, 32 px títulos) | **sim**: na Fase 3, gerar atlas de bitmap a partir dos contornos do TTF (nada de `fillText`) |
| Acentos maiúsculos ausentes nas fontes ("ÉPICA", "ANÃO") | acentos desenhados em código sobre a letra-base (NFD) | **sim**: o atlas compõe acentos (´ ` ^ ~ ¸) |
| Texto 4–5 px abaixo do lugar (o canvas zerava a fonte ao mudar de tamanho na calibração) | fonte definida depois do redimensionamento | sim (cuidado no gerador do atlas) |
| Carta 72×100 não cabe atributo + efeito | carta pequena mostra ícone de VID e ATQ; efeito só no detalhe e na dica | **sim**: GDD §3.2 atualizado |
| Vitrine escondida atrás do painel de baixo | chão começa em y=92; vitrine 3×5 em y 110–166 | **sim**: `data/combate.json` atualizado |
| Transparência gerava centenas de cores (1.391 no Prisma) | escurecer = pontilhado com a cor mais escura; raios e holográfico ciclam cores da paleta | **sim**: regra de paleta no GDD §17 |
| HUD encavalado | garantia vira selo de raridade + número | sim |

Cores por tela depois das correções: 30–66 (paleta de 35 tons + cores originais dos sprites).
