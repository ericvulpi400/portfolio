# Mecânicas de referência (Fase 0.1)

Como cada jogo resolve **pacotes, raridades, chances, garantia contra azar, repetidas e invocação**, e o que as
avaliações da Steam elogiam e criticam. Fontes ao fim de cada seção. Marquei o grau de certeza:
**[visto]** = observado nas imagens/trailers baixados; **[fonte]** = página oficial, loja ou wiki/guia; **[memória]** =
conhecimento geral que não consegui conferir daqui (rede bloqueada) — tratar como hipótese.

Números de mercado (loja Steam, EUA, 20/11/2026):

| Jogo | Preço | Avaliações | Nota |
|---|---|---|---|
| Slotbound (Optima Arch, 12/11/2026) | US$ 8,99 | 1.531 | 79% positivas |
| Slotbound Demo | grátis | 783 | 81% |
| Balatro | US$ 14,99 | 105.938 (em inglês) | 98% |
| MARVEL SNAP | F2P | 20.357 (em inglês) | 67% |
| Dragon Eclipse | US$ 12,99 | 214 | 61% |
| My life as an archeologist | US$ 3,99 | 322 | 87% |
| Seedborne Soldiers | US$ 5,99 | 30 | 86% |
| Auto Dungeon | US$ 6,99 | 23 | 95% |
| Cardboard Conquest | lança em mar/2027 | — | demo |

---

## 1. Slotbound (estrutura de run que vamos seguir)

**Como funciona** [visto: 8 screenshots, 2 trailers]
- Antes de cada onda, o jogador puxa uma máquina 3×3. Cada linha vencedora invoca uma unidade; o exército luta sozinho contra a onda.
- **Chance explícita na hora**: ao invocar aparece "Warrior (Normal) — Chance 95%", "Spearman (Normal) — 81%", "Bone Mage (Legendary) — 0,1%". A chance vira parte do espetáculo.
- **Raridades**: Normal / Advanced / Rare / Legendary e uma unidade **Prism** citada por jogadores como a mais rara.
- **Feedback por escala**: invocação comum = brilho pequeno; lendária = feixe de luz do céu + rótulo dourado; jackpot = a moldura da máquina inteira fica dourada, tela pisca e sai confete.
- **Absorção**: painel do nível da unidade, "Imprint" (herdar efeito) e confirmação "Convert to Absorb Lv +2". **Promoção de classe** em marco de nível ("Elf Mage" com atributos novos).
- **Itens e núcleos** em cartas-pergaminho 1-de-3 com raridade (Common/Uncommon/Rare), regra curta e "Use: 1/wave" ou "Always active"; Reroll com custo.
- **Loja** entre ondas (gemas), **ondas de chefe** com barra larga, **6 mundos**, **modo infinito**, livro de **coleção** (120+ unidades, 40+ núcleos, 60+ itens, 15 "Fate Stones").
- HUD do topo: ouro, vidas, limite do exército (6/7, 7/7), contador de onda (8/20) e "in N waves" (próximo evento).

**Avaliações (10 mais úteis, inglês)**
- Elogio: "só mais uma run"; variedade de unidades/itens/núcleos; mais meta-progressão do que o esperado; vale o preço; desenvolvedor solo.
- Crítica principal (as 2 negativas do topo): **falta de agência** — "90% das runs acabam porque você não tirou uma unidade melhorada nas primeiras ondas"; "a máquina só me impede de me divertir; o poder da run está fora do meu controle".
- Pedidos: **salvar no meio da run** ("onda 24/30 e tenho que deixar o jogo aberto"); modo de treino/boneco para testar builds; mais estágios; o começo é um "grind" até comprar os 6 cristais que aumentam o exército.
- Um jogador menciona que o dev usou IA para código/arte (não afetou a nota dele, mas é tema recorrente na Steam).

**Lições para nós**
1. Mostrar a chance no momento da revelação funciona — manter, e somar o painel de chances antes de abrir.
2. A crítica de agência é o risco nº 1 do pacote. Respostas no nosso design: manipulações (trocar, guardar, espiar), garantia contra azar visível, pacotes de facção que direcionam, e a absorção transformando repetidas em progresso — nenhum pacote pode ser "zero".
3. Salvar entre ondas é obrigatório (já está no pedido).
4. O primeiro upgrade de meta não pode demorar: a primeira run perdida já paga algo útil.

Fontes: [loja](https://store.steampowered.com/app/4459590/), [demo](https://store.steampowered.com/app/4906570/), [avaliações](https://steamcommunity.com/app/4459590/reviews/?browsefilter=toprated).

---

## 2. Balatro (pacotes de reforço dentro da run)

**Pacotes** [visto + memória]
- Vendidos na loja da run, ao lado dos coringas. Tipos por **conteúdo** (Standard = cartas de baralho, Arcana = tarô, Celestial = planetas, Buffoon = coringas, Spectral = raros) e por **tamanho**: Normal (escolhe 1 de 3), Jumbo (1 de 5), Mega (2 de 5) [memória]. A embalagem diz o tipo pela arte e pelo letreiro (JUMBO, MEGA) [visto].
- Abrir é instantâneo: as cartas aparecem em leque, o jogador escolhe e pode pular ("Skip") [visto].
- **Edições** (Foil, Holographic, Polychrome, Negative) mudam o brilho da carta e dão bônus; a arte não muda [visto: versões raras].
- **Raridade** no rótulo do tooltip (Common/Uncommon/Rare/Legendary) [visto: "Uncommon" em verde].
- **Chances**: não há painel; as probabilidades aparecem só em texto ("1 in 4"). A comunidade brinca com a sensação de azar ("1 em 4 meu ***", "1 em 2 = 100%, 1 em 4 = 0%") — mostra como chance pequena é percebida.
- **Repetidas**: por padrão a loja não oferece um coringa que você já tem (há um coringa que libera repetidas) [memória].
- **Vouchers** mudam a loja de forma permanente na run (mais espaços, reroll mais barato) — análogo aos nossos núcleos que mudam os pacotes.

**Avaliações**: elogiam "simples, elegante, viciante", profundidade que aparece com as horas (baralhos, estacas de dificuldade), quebras absurdas ("mais fichas que átomos no universo"). Críticas no topo: nenhuma; o tema "parece jogo de azar" aparece como piada (classificação PEGI).

**Lições**: pacote com **escolha** dentro dele (não só sorte); tamanho e tipo legíveis na embalagem; edições raras que mudam o visual mas não a identidade da carta; quebra divertida como objetivo de design; humor com a percepção de chance — por isso nosso painel mostra a garantia ("raro garantido em N").

Fontes: [loja](https://store.steampowered.com/app/2379780/), [avaliações](https://steamcommunity.com/app/2379780/reviews/?browsefilter=toprated).

---

## 3. MARVEL SNAP (coleção e variantes)

**Como funciona** [visto + memória]
- Sem pacotes clássicos: cartas chegam por progressão de coleção ("Collection Level"), caixas e loja de tokens [memória]. Coleção dividida em séries (pool 1 a 5) — cartas raras ficam mais raras conforme a coleção cresce [memória].
- **Variantes**: a mesma carta em várias artes; melhorar uma carta muda **acabamento** (borda, brilho, moldura que "quebra") sem mudar a regra [visto: detalhe e variantes].
- **Revelação**: carta cresce até ocupar a tela, moldura especial, números grandes de custo/poder sempre nos mesmos cantos [visto].
- Recompensa ao fim da partida: carta em destaque + barra de progresso [visto].

**Avaliações**: elogio — partidas de menos de 5 min, a fase inicial de colecionar é "divertida e empolgante". Críticas — monetização, **"0% de agência sobre o progresso da coleção"**, sem mecanismo de recuperação para novos jogadores, coleção trava depois da série 3.

**Lições**: (a) coleção cosmética (versões raras) é ótima porque não desbalanceia; (b) dar agência sobre o que falta no álbum — nosso jogo precisa de uma forma de **mirar** a carta que falta (pacote de facção, troca de repetidas por "pó"/pontos); (c) nada de microtransação (já é regra).

Fontes: [loja](https://store.steampowered.com/app/1997040/), [avaliações](https://steamcommunity.com/app/1997040/reviews/?browsefilter=toprated).

---

## 4. Pokémon TCG Pocket (abertura de pacotes) — sem prints, só mecânica

- Pacote de **5 cartas**; as cartas 1–3 vêm da faixa comum e as cartas **4 e 5 têm tabelas próprias**, com a 5ª mais generosa (ex.: uma carta "coroa" 0,013% na 4ª e 0,053% na 5ª; qualquer "duas estrelas" 0,5% na 4ª e 2% na 5ª) [fonte: guias].
- **Pacote raro** (todas as cartas raras) com 0,05% [fonte: Serebii via busca].
- **Chances publicadas no jogo**, por carta e por posição [fonte].
- Contra azar: **pontos de pacote** — cada pacote dá 5 pontos; troca por uma carta específica (35 a 2.500 pontos conforme a raridade). Não há "pity" de raridade; a garantia é a troca determinística [fonte].
- Revelação [memória]: cortar o pacote deslizando o dedo; as cartas são passadas uma a uma; as raras têm brilho/borda e as "imersivas" tocam uma animação própria.

**Lições**: tabela **por posição** dá suspense crescente — a última carta é a mais esperada (vamos usar: a 5ª carta tem tabela melhor e é revelada com pausa). Pontos por pacote como garantia determinística resolvem "agência sobre a coleção".

Fontes: [pokemongohub](https://pokemongohub.net/post/guide/pokemon-tcg-pocket-pull-rates-explained/), [dexerto](https://dexerto.com/pokemon/rarest-cards-in-pokemon-tcg-pocket-pull-rates-2971330), [serebii](https://serebii.net/tcgpocket/boosterpacks.shtml).

---

## 5. Hearthstone (pacotes clássicos) — sem prints, só mecânica

- Pacote de **5 cartas**, pelo menos 1 rara ou melhor [fonte: wiki/suporte].
- **Brilho antes de virar**: as cartas viradas para baixo brilham na cor da raridade ao passar o cursor (sem cor = comum, azul = rara, roxo = épica, laranja = lendária) [fonte: wiki citada na busca]. Exatamente o "suspense antes de virar" que queremos.
- **Garantia contra azar**: lendária nos 10 primeiros pacotes de cada expansão; depois, no máximo 40 pacotes sem lendária (probabilidade média ~5% por pacote) [fonte: wiki; Blizzard só confirmou oficialmente o de 10].
- **Proteção contra repetidas**: não vem cópia de uma carta enquanto houver carta daquela raridade que você não tem [fonte].
- Repetidas viram **pó** para criar a carta que quiser [memória].
- **Douradas**: versão rara animada da mesma carta [memória].

**Lições**: brilho de raridade antes de virar (copiar a ideia, não a cor exata nem a arte); garantia declarada em número de pacotes; proteção contra repetidas no **álbum** (meta), mas não dentro da run (lá as repetidas são combustível de absorção).

Fontes: [wiki](https://hearthstone.wiki.gg/wiki/Card_packs), [suporte](https://us.support.blizzard.com/en/article/32545), [fórum](https://us.forums.blizzard.com/en/hearthstone/t/its-official-no-pity-timer/10106).

---

## 6. Cardboard Conquest (pacotes como draft de facção)

- No começo da run: "Monte seu arsenal" — escolher **3 de 23 pacotes temáticos**, cada um com tema e mecânica (Goblin Horde, Pyromancy, Final Rites…) e botão "ver cartas" [visto].
- Cartas = exércitos que andam por trilhas [visto]. Vitória mostra **carta nova desbloqueada** com silhueta preta que se revela, e o contador "1.068 cartas" [visto].
- Mercador com "queimar carta" (ralo) [visto].

**Lições**: pacote **de facção** como escolha estratégica (é o nosso "pacote especial"); silhueta preta antes de revelar a carta nova para o álbum; contador do tamanho da coleção como gancho.

Fontes: [loja](https://store.steampowered.com/app/4937370/). Sem avaliações (ainda não lançou).

---

## 7. Dragon Eclipse, Auto Dungeon, Seedborne Soldiers (roguelites de cartas/auto-batalha)

- **Dragon Eclipse**: criaturas em pedestais 1-de-3 com "+1 poder"; forja de cartas com 3 ralos (duplicar, melhorar, remover); talentos 1-de-3 em marcos [visto]. Avaliações (61%): pouca variedade de cartas e relíquias, criaturas desbalanceadas, mapa lento, "fica repetitivo depois de poucas runs", abandono do jogo.
- **Seedborne Soldiers**: "colheita" de unidades por tiers com chance por tier no tooltip; mercador de troca de itens [visto]. Avaliações (86%): combos satisfatórios, runs diferentes; crítica — **dependência de RNG e falta de agência**, uma estratégia (nobreza/renda) quase obrigatória.
- **Auto Dungeon**: elogiam charme e humor ("mutei um cachorro num deus"); crítica — "coisa demais na tela depois de algumas horas", câmera ruim, **atributos deveriam ser números inteiros**.

**Lições**: (a) o pool precisa ser grande e as unidades viáveis — 15 facções MiniFolks ajudam; (b) **legibilidade** do campo cheio e números inteiros; (c) evitar uma economia dominante (renda) — o crítico de design vai procurar isso; (d) ralos de baralho (remover/fundir) dão agência.

Fontes: [Dragon Eclipse](https://store.steampowered.com/app/2626860/), [Seedborne](https://store.steampowered.com/app/3039930/), [Auto Dungeon](https://store.steampowered.com/app/2849990/) e as páginas de avaliações correspondentes.

---

## 8. My Life as an Archeologist (camadas menores)

- **Artefato 1-de-3** depois do chefe, cada um com 1 linha de efeito; reroll [visto].
- **Pesquisa/bestiário**: uma carta por monstro com barra "mate X" (6/8); completa → carta comprável com ouro → bônus permanente pequeno (+0,5 HP base, +5% força…) [visto].
- Equipamento com raridade por cor e afixos numéricos; 3 classes na árvore de habilidades [visto].
- Avaliações (87%): polido para o preço, pesquisa "divertida", tooltips claros, 5–15 h de conteúdo; crítica — conquistas que dependem de um artefato 100% aleatório ("metade do meu tempo de jogo"), pouco memorável.

**Lições**: bestiário como página do álbum (monstros derrotados → cartas de pesquisa) encaixa direto; **nenhuma conquista pode depender de sorte pura** sem garantia; bônus permanentes pequenos e numerosos.

Fontes: [loja](https://store.steampowered.com/app/1689350/), [avaliações](https://steamcommunity.com/app/1689350/reviews/?browsefilter=toprated).

---

## 9. Wallpaper Game – Questbar RPG

Não encontrado (Steam, busca por nome e estúdio). Preciso do link. Enquanto isso, a camada "comandante com equipamento de raridades e builds" segue o que vimos em My Life as an Archeologist (afixos numéricos, raridade por cor).

---

## Síntese: tabela comparativa

| | Slotbound | Balatro | Pocket | Hearthstone | Snap | Cardboard C. |
|---|---|---|---|---|---|---|
| Unidade de sorte | giro 3×3 | pacote na loja | pacote 5 | pacote 5 | caixa/progresso | draft de pacotes |
| Escolha dentro | nudges/núcleos | escolhe 1–2 | não | não | não | escolhe 3 de 23 |
| Chance visível | na revelação | texto solto | tabela por posição | não no jogo | não | não |
| Garantia | ? | não | pontos → troca | 10 / 40 pacotes | não | — |
| Repetidas | absorção | bloqueadas | pontos/troca | proteção + pó | proteção | — |
| Versão rara | prisma | edições | arte alternativa/imersiva | dourada/diamante | variantes/acabamento | — |
| Suspense | flash por raridade | leque instantâneo | carta a carta, 5ª melhor | brilho antes de virar | carta cresce na tela | silhueta preta |

**Decisões que essa pesquisa sugere** (entram no conceito e no GDD):
1. Revelação **carta a carta** com **brilho de raridade antes de virar** e a **última carta com tabela própria** (suspense crescente).
2. **Painel de chances** sempre igual ao código + chance mostrada na revelação + **garantia contra azar** com contador visível.
3. **Agência**: escolher entre tipos de pacote (facção, tamanho), trocar/guardar/espiar, absorver repetidas (nada é perdido), núcleos que mudam pesos.
4. **Álbum** com silhueta do que falta, contador da coleção, versões raras cosméticas e uma forma determinística de mirar a carta que falta.
5. **Salvar entre ondas**, primeira meta-recompensa rápida, nenhuma conquista dependente de sorte pura.
