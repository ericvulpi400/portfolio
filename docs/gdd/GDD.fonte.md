# Bazar das Ruínas — GDD

> **Este arquivo é gerado.** Edite `docs/gdd/GDD.fonte.md` e rode `node tools/gdd/montar_gdd.mjs`. As tabelas marcadas
> "(gerada)" saem de `data/*.json` — os mesmos arquivos que o jogo e as simulações usam. Números de balanceamento
> nunca são digitados aqui à mão.

Versão 0.1 — 21/11/2026. Conceito aprovado: **D — Bazar das Ruínas** (tema do B, com ideias de A e C; sem escavação,
trocada pelo **cliente da noite**). Escopo detalhado: **estágio 1 completo**; estágios 2–6 em resumo.
Nome provisório em inglês: **Ruin Bazaar**.

---

## 1. Visão, público e pilares

**Uma frase.** Roguelite de defesa com batalha automática em que você abre, especula e vende pacotes de cartas
MiniFolks para defender sua barraca numa feira acampada sobre ruínas.

**Público.**
- Primário: quem joga Slotbound, Balatro e roguelites curtos na Steam (sessões de 30–45 min, gosta de "quebrar" o jogo).
- Secundário: colecionadores de cartas digitais (Pokémon TCG Pocket, Marvel Snap) que querem abrir pacotes **sem pagar por eles**.
- Plataforma: PC Windows e Steam Deck; mouse, teclado ou controle.

**Pilares** (em conflito, vale a ordem):

| # | Pilar | Como medir |
|---|---|---|
| 1 | **Cada pacote é uma aposta legível.** Você sabe as chances, sente a carta virar e entende por que a run foi bem ou mal. | Painel de chances = tabela usada (teste automático); jogador explica a derrota no teste de usabilidade |
| 2 | **A barraca quebra a banca.** Facções, absorção, itens, núcleos e alvarás combinam em builds diferentes, com chefes que punem a build preguiçosa. | Simulação de 1.000 runs: nenhuma estratégia com taxa de vitória > 2× a média |
| 3 | **O catálogo sempre falta uma.** O álbum mostra o que falta e onde cai; cada carta nova muda algo na próxima run. | 50% do catálogo em ≤ 2 runs; 100% do estágio 1 em ~3–4 h |

---

## 2. Loops

| Escala | Duração | O que o jogador faz | Recompensa |
|---|---|---|---|
| **30 s** | um pacote | ler a prateleira → comprar → abrir agora ou lacrar → ver 5 cartas virarem → pôr cada uma na vitrine, absorver, guardar no bolso ou vender | cartas, combos, ouro, progresso de garantia |
| **Onda** | 2–3 min | preparação sem cronômetro (2–3 pacotes, posicionar, equipar) → combate automático 30–60 s → ouro e juros → cliente da noite (≤ 10 s) | unidades mais fortes, ouro, carimbos |
| **Run** | 30–45 min | 15 ondas: 10 normais, 3 julgamentos, 2 chefes; 1 alvará 1-de-3 por chefe | vitória ou derrota; fichas, cartas no catálogo, equipamento do comandante |
| **Meta** | semanas | gastar fichas na árvore, completar páginas do catálogo e do bestiário, liberar facções, comandantes, dificuldades, infinito e diário | poder permanente pequeno, novas opções de build |

```mermaid
flowchart LR
  A[Prateleira: 3 ofertas] -->|compra| B{Abrir ou lacrar?}
  B -->|abrir| C[5 cartas viram uma a uma]
  B -->|lacrar| L[Estoque: +1 carta por onda, ocupa 1 espaço]
  L -->|abrir depois| C
  C --> D[Vitrine / Absorver / Bolso / Vender / Balcão]
  D --> E[Combate automático]
  E -->|vitória| F[Ouro + juros]
  F --> G[Cliente da noite 1-de-3]
  G --> A
  E -->|chefe vencido| H[Alvará 1-de-3 + equipamento]
  E -->|barraca em 0| X[Fim de run: fichas, catálogo, bestiário]
  X --> M[Árvore, catálogo, comandante] --> A
```

---

## 3. Cartas

### 3.1 Tipos

| Tipo | Vai para | Exemplos | Ocupa espaço? |
|---|---|---|---|
| **Unidade** | vitrine (campo) | Espadachim, Rei Anão | 1 (pesado: 2) |
| **Especial (ajudante)** | balcão (3 → 5 espaços) | Mercador, Ladrão, Rainha da Feira | não ocupa a vitrine |
| **Item** | equipado numa unidade (1 por unidade) ou global (manuais) | Espada Afiada, Manual do Atirador | não |
| **Núcleo** | 3 encaixes de núcleo; muda os pacotes até o fim da run | Núcleo do Olho, Núcleo Prismático | não |
| **Amaldiçoada** | efeito imediato e forçado | Contrato Sombrio | não |

Toda carta pode ir para o **bolso** (3 espaços, decide depois) ou ser **vendida** na hora (ver §13).

### 3.2 Anatomia (carta na abertura: 72×100 px lógicos)

```
┌──────────────────────┐  ← moldura na cor da raridade; borda de 1 px no tom escuro da mesma rampa
│ ESPADACHIM       ●   │  ← nome (m5x7) + selo da raridade (forma + cor)
│┌────────────────────┐│
││                    ││  ← janela 64×64: sprite 32×32 ampliado 2× (pesados 40×40 e 64×32 em 1×, com selo "PESADO")
││        (sprite)    ││     o idle do MiniFolk anima dentro da carta
││                    ││
│└────────────────────┘│
│ ⚔ Guerreiro  [H] 1▢ │  ← ícone de classe · ícone de facção · custo de espaço
│ ♥40  ⚔6              │  ← na carta pequena só VID e ATQ com ícone (o efeito fica no detalhe e na dica)
└──────────────────────┘
```

No **detalhe da carta** (botão Y / clique direito) ela aparece em 3× (sprite 96×96) com todos os números,
as animações que a unidade tem, o nível, a estrela, a subclasse e o histórico de absorção.

### 3.3 Raridades e versões

{{tabela:raridades}}

A raridade tem **forma e cor** (acessibilidade): o selo funciona também em escala de cinza.

{{tabela:versoes}}

- **Brilhante**: moldura com faixa de brilho que varre a carta a cada 3 s; na unidade, contorno claro de 1 px.
- **Prisma** (o jackpot): reflexo holográfico em faixas de cor que correm, partículas, flash e som próprio; ao entrar, paga o jackpot da tabela.

---

## 4. Pacotes

### 4.1 Tipos (gerada)

{{tabela:tipos_pacote}}

### 4.2 Tabelas de raridade por posição (gerada)

As cartas 1 até a penúltima usam `padrao`; a **última carta** usa a tabela do pacote (`ultima` no Pacote da Feira). É ela
que vira por último, com pausa e tambor (§16).

{{tabela:tabelas_raridade}}

### 4.3 Tipo de carta por posição (gerada)

{{tabela:tabelas_tipo}}

Regras do sorteio (nesta ordem):
1. Sorteia a raridade pela tabela da posição (aplicando a garantia na última carta, se for o caso).
2. Sorteia o tipo pela tabela de tipo.
3. Se não existir carta daquele tipo naquela raridade (ex.: núcleo Comum), **sobe** para a próxima raridade que tenha.
4. Sorteia a carta entre as do pool (facções liberadas e pesos de núcleos); no Pacote de Povo, 80% das unidades vêm da facção alvo.
5. Unidades e ajudantes sorteiam a versão (Brilhante 4%, Prisma 0,05%).

### 4.4 Prateleira, quantidade e preço

- **Prateleira**: 3 ofertas por onda (mínimo 1 Pacote da Feira), sorteadas pelos pesos da §4.1. Reroll: 5 ouro, +5 a cada novo reroll na mesma onda.
- **Limite**: 3 pacotes comprados por onda (+1 Rainha da Feira, +1 Carta Branca, +1 árvore; máximo 5).
- **Preço** = arred((8 + 2 × onda) × mult. do tipo × escada), com escada **1; 1,5; 2,2; 3,0; 4,0** para o 1º…5º pacote **da onda** (qualquer tipo).
- **Lacrar**: em vez de abrir, o pacote vai para o estoque, ocupa **1 espaço da vitrine** e ganha **+1 carta por onda** guardado (até o tamanho +2). Abrir um lacrado não conta no limite da onda.

### 4.5 Revelação uma a uma

1. Toca o pacote (ou A): ele treme, rasga pela linha pontilhada, as cartas saem de costas em leque.
2. Antes de virar, cada verso **brilha na cor da raridade** por 0,4 s (comum não brilha). É o suspense: o jogador lê o brilho antes de ver a carta.
3. Vira com A/clique (ou "virar tudo"). A **última carta** tem pausa de 0,6 s e rufar de tambor; se for Épica+ ou Prisma, a tela escurece antes.
4. Depois da última: confere combos (§4.6) e mostra o resumo; o jogador distribui as cartas.

### 4.6 Combos dentro do pacote (gerada)

{{tabela:combos}}

### 4.7 Manipulações — carimbos (gerada)

{{tabela:carimbos}}

Recarga: +1 carga (à escolha) por chefe ou julgamento vencido e pelo combo Caravana.

### 4.8 Garantia contra azar (gerada)

{{tabela:garantias}}

O painel do pacote mostra sempre: **"Rara garantida em N · Épica em N · Lendária em N"**. O contador da Lendária é do
perfil (atravessa runs); os outros zeram no começo de cada run.

### 4.9 O que muda os pacotes

- **Núcleos** (§6.4): pesos de facção, tamanho, tabela da última carta, chance de Brilhante/Prisma, preço, visão da última carta.
- **Ajudantes** (§5.4): preço (Mercador), carta extra (Ladrão), +1 carta no Pacote de Povo (Princesa), ver a última carta (Mercador Suspeito).
- **Alvarás** (§10.3): Licença Dourada, Carta Branca, Alvará de Estoque, Balança Viciada.
- **Catálogo** (§12): página completa deixa o Pacote de Povo daquela facção fixo na prateleira.

### 4.10 Simulação de 1.000.000 de pacotes

{{incluir:sim_pacotes.md}}

Conclusões: o observado bate com a tabela (diferença ≤ 0,05 ponto percentual em todas as linhas); a **maior seca é
exatamente o limite da garantia** (3, 12 e 40 pacotes), ou seja, a garantia dispara sempre no pacote certo. Numa run de
~35 pacotes saem em média **~18 Raras+, ~5 Épicas+ e ~1,2 Lendária**; Prisma é 1 a cada ~495 pacotes (~1 a cada 14 runs).

---

## 5. Unidades

### 5.1 Facções

O jogo usa **16 facções** dos 17 packs (Villagers e Villagers 2 viram uma só, Aldeões). No estágio 1, o jogador recruta
Humanos, Anões, Elfos e Vikings e contrata Aldeões como ajudantes; Gosmas, Bichos do Vale e Bandidos são inimigos.
As outras facções entram como inimigos nos estágios 2–6 e viram recrutáveis quando o bestiário delas é completado (§12).

{{tabela:faccoes_jogador}}

Sinergia de facção conta **tipos únicos** em campo (duas cópias do Espadachim contam 1).

### 5.2 Classes (gerada)

Atributo = base × classe × raridade × (1 + 0,12 × (nível − 1)), arredondado. Base: VID 40, ATQ 6, intervalo 1,0 s, alcance 14 px, velocidade 22 px/s.

{{tabela:classes}}

### 5.3 As 38 unidades do estágio 1 (gerada)

Cada unidade usa **só animações que existem** no sprite dela (o gerador confere contra `assets/minifolks/manifest.json` e
falha se faltar alguma). Atributos no nível 1, versão normal.

{{tabela:unidades}}

### 5.4 Os 20 ajudantes Aldeões (gerada)

Ficam no **balcão** da barraca (3 espaços, até 5), animando o trabalho (`work`, `idle_b`, `steal`, `skinning`); não lutam.
Sinergia de Aldeões: 3 tipos = +2 ouro por onda; 5 tipos = +5.

{{tabela:ajudantes}}

### 5.5 Traços e limite do campo

- **Pesado**: classe Bruto e sprites maiores que 32×32 ocupam **2 espaços**.
- **Vitrine** (limite do campo): **8 espaços** no início, +1 nas ondas 5 e 10, +1/+1 na árvore, +1 Camponês, +2 Mercenários; **máximo 14**. Pacote lacrado ocupa 1.
- Se o exército + lacrados passarem do limite, **a prateleira trava** ("Vitrine cheia") até vender, absorver ou abrir/vender um lacrado.
- Posições: 3 colunas (frente x=132, meio x=106, fundo x=80) × 5 linhas (y 110–166, a cada 14 px, acima do painel de baixo da preparação); corpo a corpo vai para a frente, atiradores e artilheiros para o fundo (o jogador pode arrastar).

---

## 6. Absorção e evolução

### 6.1 Níveis e estrelas (gerada)

{{tabela:unidades_niveis}}

- **XP de uma carta absorvida** = XP da raridade (§3.3) × 2 se for o **mesmo personagem** × 2 Brilhante (× 4 Prisma) + 1 por nível acima de 1 da unidade absorvida.
- Absorver: arrastar a carta (ou a unidade em campo) sobre a unidade alvo, ou no detalhe da unidade "Alimentar" → escolher cartas. A pré-visualização mostra o nível final antes de confirmar.
- **Trava** (cadeado): unidade travada não pode ser alimento nem vendida; ícone de cadeado no canto da carta.

### 6.2 Marcos

| Marco | Nível | O que acontece |
|---|---|---|
| ★2 | 4 | **Subclasse 1-de-2** (tabela abaixo) |
| ★3 | 7 | **Herdar efeito**: escolhe 1 efeito entre as cartas que ela absorveu nesta run (o efeito, não os atributos) |
| Mestre | 9 | +1 tipo na sinergia da classe dela |

{{tabela:subclasses}}

### 6.3 Itens e manuais (gerada)

Itens de unidade: 1 por unidade; equipar outro descarta o antigo. Manuais são globais e acumulam até 3.

{{tabela:itens}}

### 6.4 Núcleos (gerada)

3 encaixes; o 4º núcleo substitui um à escolha.

{{tabela:nucleos}}

### 6.5 Cartas amaldiçoadas (gerada)

Só em Pacotes Antigos e com o Núcleo Arriscado; o efeito vale ao virar (a Troca pode trocá-la).

{{tabela:amaldicoadas}}

---

## 7. Sinergias de facção e de classe

- **Facção**: 2/4/6 tipos únicos em campo (tabela da §5.1). **Classe**: 2/4 unidades da classe (tabela da §5.2; aqui contam cópias).
- **Na tela**: coluna à esquerda do campo com um ícone por sinergia ativa — ícone da facção/classe + "3/4" (atual/próximo limiar); cinza quando inativa, cor da facção quando ativa, pisca 2× ao subir de limiar. Ao passar o mouse/cursor: o efeito de cada limiar e quais unidades contam.
- **Prévia**: ao segurar uma carta sobre a vitrine, as sinergias que mudariam piscam com o novo valor (+1).
- Combo "Povo Unido" soma +1 tipo à sinergia da facção só naquela onda.

---

## 8. Combate de defesa automático

**Campo** (área segura 426×240): a **barraca** fica à esquerda (x 8–52) com **20 de vida**; o chão vai de y 92 a 226;
inimigos entram pela borda direita em y sorteado (semente da run).

**Vitória e derrota.** A onda termina quando todo inimigo cai ou chega à barraca. Cada inimigo que chega tira o seu
"dano à barraca" (1 normal, 2–4 elite, 10 chefe) e sai de cena. Barraca em 0 = fim da run. Unidades curam 100% entre
ondas; unidade que cai volta na próxima onda (cair não destrói a carta).

**Formação e alvo** (`data/combate.json`):
- Corpo a corpo sai do espaço até o **raio de guarda** da classe (40–90 px) para atacar o inimigo mais próximo da barraca; sem alvo, volta.
- Atiradores e artilheiros ficam no lugar e miram o inimigo mais próximo da barraca dentro do alcance.
- Inimigos atacam unidade a até 40 px; senão andam até a barraca. "Provoca" puxa inimigos a até 60 px.
- Cavaleiros fazem **investida** no primeiro golpe da onda; Pégaso e Cavaleiro Bandido preferem a retaguarda.

**Cadência**: cada unidade ataca a cada `intervalo` s; o golpe acontece no quadro de impacto da animação de ataque
(meio da animação), então animação e dano batem.

**Dano** = arred(ATQ × bônus × crítico × (1 − redução do alvo)), mínimo 1; crítico 5% base, ×1,5; redução máxima 60%;
**bloqueio** anula o golpe inteiro e toca a animação `block`. Números sempre inteiros.

**Status**:

| Status | Efeito | Cor | Ícone |
|---|---|---|---|
| Queimar | dano por segundo = % do ATQ de quem aplicou; não acumula | laranja | chama |
| Veneno | dano por segundo; acumula até 3 | verde | gota |
| Sangrar | dano por segundo; dobra se o alvo andar | vermelho | gota escura |
| Lentidão | −% velocidade e cadência | ciano | caracol |
| Atordoar | não age | amarelo | estrelinhas |
| Escudo | absorve dano | creme | escudo |

**Quem está ganhando**: barra larga no topo com a vida somada dos inimigos que faltam (vermelha, encolhe) e, embaixo,
a vida da barraca (verde). Números de dano em m3x6 sobem do alvo (brancos; críticos amarelos 2× maiores; bloqueio
"BLOQ"). Velocidade do combate 1×/2×/3× (LB/RB).

---

## 9. Ondas

Sem cronômetro na preparação: a onda só começa quando o jogador aperta **Abrir a feira!** (Start / Espaço).
Inimigos entram em grupos misturados (ordem pela semente) ao longo da "duração de entrada".

### 9.1 Estágio 1 — Vale da Estrada Velha (gerada)

A feira acampa nas ruínas de um forte humano. Ondas 1–9: Gosmas e Bichos do Vale; 11–15: Bandidos.
Cor das Gosmas por faixa: ondas 1–5 verdes, 6–10 azuis, 11–15 laranja (só visual; a escala vem da tabela).

{{tabela:ondas}}

### 9.2 Inimigos do estágio 1 (gerada)

VID na onda *n* = VID × 1,10^(n−1); ATQ × 1,06^(n−1). Chefes usam o valor absoluto.

{{tabela:inimigos}}

### 9.3 Julgamentos (gerada)

Avisados **uma onda antes** (faixa amarela no topo com a regra). A regra vale só naquela onda.

{{tabela:julgamentos}}

### 9.4 Chefes do estágio 1

| | **Mãe Gosma** (onda 10) | **O Cobrador** (onda 15) |
|---|---|---|
| Sprite | `slimes/giantslimer` (40×40, variante vermelha) | `bandits/banditleader` (32×32) com escolta |
| VID / ATQ | 1.400 / 24 | 2.200 / 30 |
| Padrões | salto em área (raio 26, ×1,5) a cada 4 s; a cada 25% de vida perdida solta 2 Gosmas Grandes (que se dividem em 2 Gosmas) | ao entrar **confisca 1 pacote lacrado** (o maior) ou 20% do ouro; grito a cada 12 s: bandidos +30% ATQ por 5 s; fica atrás da escolta |
| O que pune | exército só corpo a corpo amontoado (área) e falta de dano em área para limpar as crias | estoque grande e avareza; exército sem quem alcance a retaguarda |
| Contraponto | artilheiros (Mago, Granadeiro, Demolidor), lanceiros (vários alvos), espalhar a frente | cavaleiros e Pégaso (caçam a retaguarda), atiradores de alcance longo, abrir os lacrados antes |
| Prêmio | alvará 1-de-3, 1 peça de equipamento, 10 fichas; libera Vikings e o Contrabandista | alvará não (fim do estágio); 1 peça de equipamento, 25 fichas de vitória; libera Ferreiro, infinito e diário |

### 9.5 Estágios 2–6 (resumo)

| # | Estágio | Inimigos | Regra nova | Julgamentos | Chefe (o que pune) |
|---|---|---|---|---|---|
| 2 | Porto dos Afogados | Piratas + Mortos-vivos | **Maré**: a cada 3 ondas os inimigos entram também pela esquerda, atrás da barraca | Mercado Fechado, Só Miúdos, Maré | Capitão Pirata + Canhão: tiros em linha reta que atravessam a vitrine (pune formação em fila) |
| 3 | Mina Funda | Golens + Goblins | **Desabamento**: pedras caem em 2 espaços aleatórios da vitrine por onda (unidade ali começa atordoada) | Chuva, Lei do Mais Forte, Desabamento | Golem Derretido: armadura 50% que só cai com queimadura/veneno (pune dano puro) |
| 4 | Bosque Encantado | Protetores da Floresta + Bichos | **Cura da floresta**: inimigos curam 2% por s parados | Espelho, Maré, Chuva | Guardião da Floresta: cura aliados em área (pune ausência de dano em área) |
| 5 | Pântano Velho | Homens-lagarto + Gosmas | **Lama**: velocidade −20% para todos; investidas valem metade | Desabamento, Moeda de Cobre, Espelho | Senhor da Guerra Lagarto (64×32): grito que derruba 2 espaços da vitrine (pune depender de 1 unidade) |
| 6 | Portão em Brasa | Demônios + Orcs | **Brasa**: a cada onda, a carta de maior raridade da prateleira custa o dobro | Eclipse, Lei do Mais Forte, Mercado Fechado | Senhor Demônio (40×40): enfeitiça a unidade de maior nível (vira contra você 6 s; pune absorver tudo numa só) |

Escala por estágio: VID × 2,4^(s−1), ATQ × 1,7^(s−1); cada estágio adiciona 3 julgamentos novos ao sorteio e 1 facção recrutável.

---

## 10. Comandante

O **dono da barraca** fica ao lado do balcão, animado com o sprite do Aldeão correspondente. Não luta; dá um passivo e
carrega **5 peças de equipamento** que ficam entre runs.

### 10.1 Classes iniciais (gerada)

{{tabela:comandante}}

### 10.2 Equipamento

- Encaixes: **Chapéu, Avental, Balança, Lupa, Bolsa** (ícones gerados em código, 16×16).
- Afixos por raridade: Comum 1, Incomum 1 (×1,25), Rara 2, Épica 2 (×1,25), Lendária 3 (×1,5). Afixos de Épica+ podem dar vitrine +1; Lendária pode dar +1 tipo numa sinergia de facção.
- Drop: 1 peça por chefe vencido; 1 peça se perder depois da onda 6. Raridade do drop: Comum 40%, Incomum 35%, Rara 18%, Épica 6%, Lendária 1%.
- Inventário 30; desmanchar dá fichas (1/2/5/12/30).

{{tabela:afixos}}

### 10.3 Alvarás — artefato 1-de-3 dos chefes (gerada)

Depois de cada chefe, 3 alvarás sorteados (sem repetir os que você tem); 1 reroll grátis por run.

{{tabela:alvaras}}

---

## 11. Cliente da noite (substitui a escavação)

Depois de cada **onda normal** (não depois de julgamento nem de chefe), um cliente passa na barraca com **3 propostas**;
aceite 1 ou recuse. Leva até 10 s; um botão recusa tudo. Ele faz o papel que a escavação faria: achados raros entre
ondas que alimentam os pacotes, sem minijogo.

{{tabela:cliente}}

- O **Pacote Antigo** só existe aqui: 5 cartas, tabela da última carta "antigo" (Rara 45%, Épica 20%, Lendária 5%) e 10% de chance de carta amaldiçoada em qualquer posição.
- Ligação com os pacotes: troca **repetidas** (que sobraram no bolso) por pacote raro; a Relíquia é um item Raro+; a Pesquisa alimenta o bestiário.

---

## 12. Catálogo (álbum) e meta-progressão

### 12.1 Catálogo

- **Páginas por facção** (estágio 1: Humanos 12, Anões 10, Elfos 10, Vikings 6, Aldeões 20 = **58 cartas**), cada uma em 3 versões (normal, Brilhante, Prisma).
- Uma carta entra no catálogo **na primeira vez que é revelada** (não precisa ficar com ela).
- Carta que falta: **silhueta preta** com dica ("cai em Pacote de Povo dos Anões · Rara"); contador sempre visível ("Catálogo 31/58").
- **Créditos de catálogo**: no fim da run, cada carta revelada que **já estava** no catálogo vira créditos (Comum 1, Incomum 2, Rara 5, Épica 12, Lendária 30; ×2 Brilhante). Comprar uma carta faltante (versão normal): 10 / 20 / 50 / 120 / 300.

| Página completa | Bônus permanente |
|---|---|
| Normal | Pacote de Povo da facção **fixo** na prateleira + 5% VID da facção |
| Brilhante | +5% ATQ da facção + moldura dourada na página |
| Prisma | título no perfil + verso de carta exclusivo |

### 12.2 Bestiário

- Uma página por facção inimiga (estágio 1: Gosmas 6 espécies, Bichos do Vale 5, Bandidos 6).
- Por espécie: **Pesquisa I / II / III** com 10 / 50 / 150 abates (ou comprando a carta de pesquisa do cliente da noite). Efeitos: +5% dano contra a espécie / +10% ouro dela / +10% dano (total 15%). Comprar II e III custa 10 e 25 fichas.
- Página completa (todas com Pesquisa I): a facção **vira recrutável** (conteúdo pós-fatia: cartas de Gosma, Bichos e Bandidos para o jogador).

### 12.3 Fichas da feira (moeda permanente)

Ganhas sempre, **inclusive em run perdida**: 2 por onda vencida, 4 por julgamento, 10 por chefe, 25 por vencer a run,
1 por carta nova no catálogo, 15 por página completa. A 1ª run perdida na onda 7 rende ~40 fichas (12 por ondas, 4 do julgamento e ~25 cartas novas no catálogo); o primeiro nó custa 15.

### 12.4 Árvore permanente (gerada)

{{tabela:arvore}}

### 12.5 Liberações e dificuldades

| O que | Quando |
|---|---|
| Elfos | concluir a 1ª run (qualquer resultado) |
| Vikings, Contrabandista | vencer a Mãe Gosma pela 1ª vez |
| Ferreiro, infinito, desafio diário | vencer o estágio 1 |
| Pacote Grande | abrir 10 pacotes |
| Pacote de Colecionador | chegar à onda 6 |
| Dificuldades Magnata e Lenda | vencer o estágio 1 na anterior |

{{tabela:dificuldades}}

### 12.6 Quanto tempo leva para completar o álbum

{{incluir:tempo_catalogo.md}}

Leitura: o catálogo **normal** do estágio 1 fecha em ~3,4 h (7 runs); com 6 estágios e 16 facções (~150 cartas), o
catálogo normal completo fica em torno de **18–22 h**. As páginas **Brilhantes** (4% por carta, sem compra por crédito)
são a meta longa: dezenas de horas, sem bônus obrigatório.

---

## 13. Economia

| Fonte de ouro (run) | Valor |
|---|---|
| Ouro inicial | 25 |
| Renda por onda | 18 + 4 × onda |
| Abates | 1 por normal, 2–6 por elite, 40/60 por chefe; Coelho Dourado 15 |
| Juros | 1 por 10 guardados, máx. 4 (+3 Nobre, +6 Fundo de Reserva, +2 árvore) |
| Venda de carta | preço base do Pacote da Feira na onda × fator (Comum 0,05; Incomum 0,10; Rara 0,25; Épica 0,6; Lendária 1,2; ×2 Brilhante; ×5 Prisma) |
| Ajudantes, combos, julgamentos | ver tabelas |

| Ralo | Valor |
|---|---|
| Pacotes | (8 + 2 × onda) × tipo × escada 1 / 1,5 / 2,2 / 3 / 4 |
| Reroll da prateleira | 5, +5 por reroll na onda |
| Cliente da noite | relíquia 25 + 3 × onda; pesquisa 10; carimbo 12 |
| Cobrador | 1 pacote lacrado ou 20% do ouro |

**Vender nunca dá lucro**: as 5 cartas de um pacote valem em média 56% do preço base da onda.

### 13.1 As ondas do estágio 1 (inclui as 10 primeiras)

{{incluir:economia.md}}

**Duração alvo da run**: 15 ondas × (preparação 60–90 s + combate 30–60 s + cliente 10 s) ≈ **32–40 min**.
Moeda permanente: ~15–20 fichas numa derrota cedo depois que o catálogo enche, ~90 numa vitória; a árvore inteira (2.595 fichas) leva ~28–32 runs.
A simulação de 1.000 runs com bots (Fase 3) vai calibrar renda, preços e VID dos inimigos.

---

## 14. Estrutura

- **Campanha**: 6 estágios (§9.5). Cada estágio é uma run de 15 ondas; vencer libera o próximo. Só o estágio 1 entra na fatia vertical.
- **Dificuldades**: Aprendiz, Mercador, Magnata, Lenda (§12.5).
- **Modo infinito** (libera ao vencer o estágio 1): continua depois da onda 15; VID × 1,12^(onda−15), ATQ × 1,05^(onda−15); composição sorteada do bestiário com orçamento de VID; chefe a cada 5 ondas. Pontuação = 1.000 × onda + ouro total / 10 + 50 × combos → placar `infinito_estagio1`.
- **Desafio diário**: semente = data UTC (AAAAMMDD → hash 32 bits); todos recebem as mesmas prateleiras, cartas e ondas; comandante Mascate, dificuldade Mercador, equipamento desligado; 1 tentativa vale no placar `diario_AAAAMMDD`.

---

## 15. Onboarding — a primeira run, minuto a minuto

| Tempo | O que acontece | Sistema que aparece |
|---|---|---|
| 0:00 | Título → "Nova feira". Cena curta (3 quadros com texto): a barraca chega ao vale; uma Gosma pula da ruína. | — |
| 0:30 | Preparação da onda 1. Prateleira com **1 Pacote da Feira grátis** destacado. Seta: "Toque para abrir". | prateleira, abertura |
| 0:45 | Abertura guiada: o 1º verso brilha verde ("Incomum"); o jogador vira as 5. A última carta é garantida **Rara** só nesta 1ª vez. | brilho de raridade, última carta |
| 1:15 | "Arraste as unidades para a vitrine." 3–4 unidades entram; se vier um ajudante, vai para o balcão com dica. | vitrine, balcão |
| 1:40 | Botão **Abrir a feira!** pulsa. Onda 1: 6 Gosmas. Combate automático; dica sobre velocidade 2×. | combate |
| 2:30 | Vitória: ouro sobe com contador; juros explicados numa linha. Cliente da noite aparece com 3 propostas simples. | ouro, juros, cliente |
| 3:00 | Onda 2: 2 pacotes possíveis; o 2º mostra o preço maior ("o preço sobe na mesma onda"). Painel de chances explicado (botão X). | escada de preço, chances |
| 4:30 | Primeira repetida → dica de **absorver** ("arraste sobre a unidade igual: XP ×2"). | absorção |
| 5:30 | Onda 3: aparece a **Lupa** com 3 cargas; dica de uso. Combo "Par" se acontecer. | carimbos, combos |
| 7:00 | Aviso amarelo: "Próxima onda: Julgamento — Inspeção da Guilda". Explica julgamentos. | julgamentos |
| 8:30 | Onda 4 (julgamento); prêmio: carga de carimbo. Dica de **lacrar** ("guarde fechado, ele cresce, mas ocupa espaço"). | lacrar, estoque |
| 10:00 | Onda 5: vitrine +1 espaço; sinergia de facção aparece pela 1ª vez com 2 tipos. | sinergias |
| depois | Troca e Lacre (carimbos) na onda 6; Pacote de Colecionador na 6; alvará na 10. Fim de run: tela de fichas e catálogo; a árvore abre. | resto |

Regras do tutorial: cada dica aparece uma vez, some com qualquer ação e pode ser revista em Pausa → Ajuda. Nenhum
tutorial bloqueia o jogo mais de 5 s.

---

## 16. UX

### 16.1 Mapa de telas

```mermaid
flowchart TD
  T[Título] --> MS[Mapa de estágios] --> PR[Preparação]
  T --> CAT[Catálogo / Bestiário]
  T --> ARV[Árvore]
  T --> CMD[Comandante e equipamento]
  T --> CFG[Configurações]
  T --> PL[Placar]
  T --> CR[Créditos]
  PR --> AB[Abertura de pacote] --> PR
  PR --> DC[Detalhe de carta] --> PR
  PR --> ABS[Absorção] --> PR
  PR --> CB[Combate]
  CB --> CN[Cliente da noite] --> PR
  CB --> E13[Escolha 1-de-3: alvará / subclasse / item] --> PR
  CB --> FR[Fim de run] --> T
  PR -.Esc/Start.-> PA[Pausa] --> CFG
```

### 16.2 Cliques máximos nas ações frequentes

| Ação | Mouse | Controle |
|---|---|---|
| Comprar e abrir o 1º pacote da prateleira | 1 clique (pacote) | A |
| Virar a próxima carta | 1 | A |
| Virar todas | 1 (botão "Virar tudo") | Y |
| Mandar a carta para a vitrine na 1ª posição livre | 1 (clique) / arrastar para escolher lugar | A |
| Absorver a carta na unidade igual | 1 (botão "Absorver" aparece quando há igual) | X |
| Vender a carta | 2 (Vender → confirmar só se Rara+) | B segurado 0,5 s |
| Lacrar o pacote | 1 (botão "Lacrar" no pacote) | segurar A 0,5 s |
| Começar a onda | 1 | Start |
| Pular a animação do pacote | 1 / Esc | B |

### 16.3 Navegação por controle

Foco visível em tudo (moldura branca de 1 px piscando 2×/s + seta). Grade de foco por tela: prateleira ↔ vitrine ↔
balcão ↔ bolso com o direcional; LB/RB trocam de painel; A confirma, B volta, X ação secundária (absorver/lacrar),
Y detalhe; Start começa a onda; Select abre o painel de chances. Nenhuma ação exige teclado (Steam Deck). Steam Input
com layout padrão publicado.

### 16.4 O "juice" da abertura

| Momento | Visual | Som | Duração |
|---|---|---|---|
| Comprar | o pacote salta da prateleira para o centro, gira 1 vez | moeda cai na gaveta | 0,35 s |
| Pacote fechado | treme a cada 2 s; brilho que varre a embalagem na cor da facção (Povo) ou dourado (Colecionador) | — | — |
| Rasgar | tira de cima voa, 30 partículas de papel, flash branco 2 quadros | papel rasgando (ruído filtrado descendente) | 0,4 s |
| Cartas saem | leque de 5 de costas, 0,06 s entre cartas | "tic" por carta | 0,4 s |
| Antes de virar | verso brilha na cor da raridade, pulsando (Comum não brilha) | zumbido grave crescente por raridade | 0,4 s |
| Virar | carta "achata" e abre (escala X 1→0→1), 0,3 s; rótulo de 1 s com a raridade e a chance daquela posição ("Rara · 18%") | nota por raridade (dó, mi, sol, si, dó agudo) | 0,3 s |
| Rara | 12 partículas azuis, carta sobe 2 px | acorde maior curto | 0,4 s |
| Épica | tela escurece 30%, raios roxos atrás, 30 partículas | acorde + "whoosh" | 0,8 s |
| Lendária | escurece 50%, feixe dourado de cima, tremor de 2 px, 60 partículas | fanfarra de 4 notas | 1,2 s |
| Prisma | escurece 70%, reflexo holográfico, explosão de confete multicolor, flash, "JACKPOT" em m6x11 | arpejo subindo + sino + confete | 1,8 s |
| Suspense da última carta | pausa 0,6 s, rufar; Épica+ escurece antes de virar | rufar de tambor (ruído em pulsos acelerando) | 0,6 s |
| Combo | faixa com o nome do combo e o prêmio | "plim-plim" | 0,6 s |
| Carta → campo | a carta encolhe e voa em arco até o espaço da vitrine; vira fumaça; o MiniFolk "pula" (`jump`) ali | "puf" + passos | 0,5 s |

Botões **Pular** (B/Esc: corta para o resumo) e **Virar tudo** (Y). Opção "Animação rápida" (×2) e "Só resumo" nas configurações.

### 16.5 Acessibilidade

- Raridade por **forma + cor** (● ■ ◆ ▲ ★); facção por ícone, não só por cor.
- Tamanho do texto: 100% / 125% / 150% (troca a fonte m5x7 por m6x11 nas caixas de efeito).
- **Reduzir efeitos**: sem tremor, sem flash, partículas −70%; **sem flashes** separado (fotossensibilidade).
- Teclas e botões remapeáveis; modo daltônico (3 paletas testadas: protanopia, deuteranopia, tritanopia) para barras de vida e sinergias.
- Velocidade de combate e de animação ajustáveis; pausa em qualquer momento; legendas para os poucos sons com significado (garantia disparou, chefe chegou).

### 16.6 Estados vazios e de erro

| Situação | O que aparece |
|---|---|
| Catálogo vazio | silhuetas da página com "Abra pacotes para preencher" |
| Prateleira sem ouro | pacotes em cinza com o preço em vermelho; dica "Venda uma carta ou passe a onda" |
| Vitrine cheia | prateleira travada com cadeado + "Vitrine cheia: venda, absorva ou abra um lacrado" |
| Limite de pacotes da onda | prateleira com faixa "Volte na próxima onda" |
| Save corrompido | "O save não abriu. Usando o backup de <data>." (backup automático) |
| Steam desligada | o jogo roda; conquistas e placar ficam na fila e sobem quando a Steam voltar |
| Controle desconectado | pausa automática + "Conecte o controle ou use o mouse" |

---

## 17. UI

### 17.1 Grade, tipografia e paleta

- **Resolução**: área segura **426×240** (lógica variável até 480×270; escala inteira 3× no Deck, 4× em 1080p, 6× em 1440p). Grade de **4 px**; margem 6 px; painéis 9-slice com canto de 4 px.
- **Fontes** (bitmap, desenhadas por inteiro): **m5x7** (texto e botões, linha de 9 px; 2× para títulos), **m3x6** (números pequenos), **m6x11** (títulos). Créditos a Daniel Linssen. **Nunca `fillText`**: os mockups mostraram que só a m5x7 rasteriza sem pixel parcial (16/32 px); a Fase 3 gera um **atlas de bitmap** dos contornos do TTF e compõe os acentos que faltam (´ ` ^ ~ ¸) em código.
- **Paleta única** (32 cores em rampas de 4–5 tons, do escuro ao claro): noite `#14101c #221a30 #3a2a4a #5a4468 #8b7b9a`, osso `#e8dcc8 #fff8ec`, terra `#3b281f #5b3f2e #7a5638 #a8774d`, grama `#2e4a2c #3f6b3a #5f8f45 #8fbf5a`, pedra `#45434d #6d6a74 #9a97a3`, ouro `#7a4f1c #b07a28 #f2c14e #ffe9a3`, vermelho `#5a1e22 #8a2a2a #d9503f`, azul `#1e3a66 #2c5d9e #5aa7e0`, roxo `#3a2357 #5e3a8a #a86ad8`, verde `#3c7a3a #7ccf6b`, ciano `#7fe3e0`, laranja `#f08a3c`, rosa `#ef8fc8`. Mais `#24402a` (verde fundo) e a rampa azul-petróleo `#123640 #1f4f5c` do Prisma. Os sprites MiniFolks mantêm as cores originais; tudo que é gerado em código sai daqui. **Sem transparência**: escurecer a tela é pontilhado com a cor mais escura; brilhos, raios e o holográfico do Prisma ciclam cores da paleta (vermelho → laranja → ouro → verde → ciano → azul → roxo → rosa).
- **Componentes**: carta (72×100 e 128×176 no detalhe), botão 9-slice (altura 15 px, estados normal/foco/apertado/desligado), tooltip (fundo `#221a30`, borda `#8b7b9a`, largura máx. 160 px), barra (vida, XP, garantia; 3 px de altura no campo, 5 px nos painéis), selo de raridade (9×9), ícone de facção/classe (9×9 e 16×16).

### 17.2 Telas

Wireframes na área segura 426×240 (1 caractere ≈ 6 px).

**Título** — logo no alto (m6x11 ampliado 2×), barraca animada com MiniFolks no balcão, menu à esquerda: Continuar · Nova feira · Catálogo · Comandante · Árvore · Placar · Configurações · Créditos · Sair. Estados: sem save (Continuar some), Steam offline (ícone discreto).

**Mapa de estágios** — trilha da estrada com 6 placas (1 liberada); painel direito com facções inimigas, regra nova, dificuldade e melhor resultado; botão Começar.

**Preparação** (a tela principal; o combate acontece nela)
```
┌ ONDA 3/15 ▸ julgamento em 1 │ ◎ 42 (+4) │ ♥ 18/20 │ L3 T2 S1 │ rara em 2·épica em 9·lend. em 27 ┐
│[sinergias]  BARRACA  ║ vitrine 3×5 (unidades)        │  campo (inimigos entram →)             │
│ H 2/4        [dono]  ║  ▢ ▢ ▢                        │                                        │
│ A 1/2      [balcão]  ║  ▢ ▢ ▢                        │                                        │
│ ⚔ 2/4                ║  ▢ ▢ ▢   vitrine 9/10         │                                        │
├──────────────────────┴───────────────────────────────┴────────────────────────────────────────┤
│ PRATELEIRA: [Feira 14] [Povo:Anões 18] [Pequeno 8]  ↻5 │ ESTOQUE: [lacrado 6] │ BOLSO ▢▢▢ │ NÚCLEOS ◇◇◇ │ [ABRIR A FEIRA!] │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```
Hierarquia: 1) prateleira e botão de começar; 2) vitrine e sinergias; 3) HUD do topo. Estados: vitrine cheia, sem ouro, limite de pacotes, julgamento anunciado (faixa amarela), chefe anunciado (faixa vermelha).

**Abertura de pacote** — fundo escurece; pacote no centro; depois 5 cartas em leque (72×100) centradas em y=70; embaixo: painel de chances (recolhível), carimbos (Lupa/Troca/Lacre com cargas), Virar tudo, Pular. Depois da última: faixa de combos e botões por carta (Vitrine / Absorver / Bolso / Vender).

**Detalhe de carta** — carta 128×176 à esquerda (sprite 3×, animações tocando em ciclo); à direita: atributos por nível (1–9), subclasses possíveis, histórico de absorção, onde cai (pacotes), versões que você tem.

**Combate** — mesma tela; o painel de baixo encolhe para uma faixa de 20 px (velocidade 1×/2×/3×, pausa); barra de força da onda no topo; números de dano.

**Absorção** — unidade alvo à esquerda (nível atual → nível previsto, barra de XP); à direita as cartas/unidades que podem ser alimento (cadeado nas travadas); confirmar mostra o ganho de atributos.

**Escolha 1-de-3** (alvará, subclasse, item de prêmio) — 3 cartões grandes (120×150) lado a lado, raridade por forma e cor, efeito em até 3 linhas, botão Reroll (se houver) e Pular.

**Cliente da noite** — o cliente (sprite de Aldeão sorteado) à esquerda falando em balão; 3 propostas em cartões com custo/ganho; Recusar.

**Comandante e equipamento** — dono no centro (2×); 5 encaixes em volta; inventário em grade 6×5 à direita; comparação de afixos ao focar.

**Catálogo** — **fichário de colecionador** (folhas com plástico, 3×3 cartas em cada página; o mockup ainda usa livro e ficou parecido demais com o do Slotbound — trocar na fatia): abas por facção (ícones) e bestiário; silhuetas nas que faltam; detalhe da carta numa janela por cima; contador e bônus da página no rodapé; filtro de versão (Normal/Brilhante/Prisma); botão "Comprar com créditos".

**Árvore** — 3 colunas (Barraca, Prateleira, Vitrine) de 8 nós; fichas no topo; nó focado mostra efeito e custo.

**Pausa** — Continuar · Ajuda (dicas vistas) · Configurações · Desistir da run (confirma) · Salvar e sair (salva entre ondas).

**Configurações** — abas Vídeo (janela/tela cheia, resolução da janela, escala máxima, vsync, mostrar FPS), Áudio (geral, música, efeitos, interface), Controles (remapear teclado e controle, sensibilidade do cursor virtual), Idioma (PT-BR/EN), Acessibilidade (§16.5), Jogo (velocidade padrão, animação de pacote).

**Fim de run** — "A feira resistiu até a onda N" ou "Feira salva!"; 6 caixas: ondas, pacotes abertos, melhor carta, inimigos, ouro gasto, tempo; fichas ganhas com contador; cartas novas no catálogo (viram uma a uma); equipamento ganho; botões Nova feira / Título.

**Placar** — abas Infinito / Diário (hoje, ontem); lista com posição, nome Steam, pontos, onda; "você" destacado; amigos/global.

**Créditos** — LYASeeK (MiniFolks), Daniel Linssen (fontes m5x7/m3x6/m6x11), Ponk (Anvil's RPG icons, CC BY 4.0) e demais assets conforme a licença; equipe; "feito com Electron".

### 17.3 HUD (combate)

Topo: onda e próximo evento · ouro · vida da barraca · cargas de carimbo · contadores de garantia. Esquerda: sinergias.
Faixa de baixo: velocidade, pausa. Sobre cada unidade: barra de vida de 12×2 px (verde) e ícones de status 5×5.

---

## 18. Áudio (tudo sintetizado em Web Audio)

**Motor**: osciladores (quadrada, triângulo, dente de serra, ruído), envelopes ADSR, filtro passa-baixa/alta, um
compressor no mestre. Música em sequenciador próprio (4 canais estilo chiptune: 2 pulsos, triângulo, ruído).

| Grupo | Efeitos (síntese resumida) |
|---|---|
| **Pacote** | moeda na gaveta (2 senos curtos 1.2k/1.6k Hz) · pacote treme (ruído 40 ms) · rasgar (ruído com passa-baixa descendo 4k→600 Hz, 250 ms) · carta sai (clique 3 ms) · brilho antes de virar (triângulo grave crescendo, altura por raridade) · virar (quadrada 30 ms + nota da raridade: Comum C5, Incomum E5, Rara G5, Épica B5, Lendária C6) · Rara (tríade maior arpejada 90 ms) · Épica (tríade + whoosh de ruído filtrado) · Lendária (fanfarra 4 notas em 2 pulsos) · **Prisma** (arpejo ascendente 2 oitavas + sino FM + estalos de confete) · rufar da última carta (pulsos de ruído acelerando 6→20 Hz) · combo (plim-plim 2 notas) · carta → campo ("puf" de ruído + 2 passos) · garantia disparou (sino + voz sintetizada curta "garantida!") |
| **Loja** | comprar, sem ouro (buzz grave), reroll (embaralhar: 6 cliques), vender (moedas descendo), lacrar (carimbo: baque grave + clique) |
| **Combate** | golpe espada (ruído 20 ms + quadrada 200 Hz), flecha (sopro + tic), magia (FM subindo), explosão (ruído grave 300 ms), bloqueio (metal: 2 senos inarmônicos), crítico (golpe + agudo), queimar/veneno (chiado contínuo baixo), unidade cai, inimigo cai (por facção: gosma "blop", bicho grunhido, bandido "ugh"), barraca leva dano (madeira: ruído + 120 Hz), chefe entra (gongo) |
| **Interface** | foco (tic), confirmar, voltar, erro, abrir painel, tooltip, conquista |
| **Música** | Título (feira ao entardecer, 90 bpm) · Preparação (alegre e calma, 100 bpm, loop 64 compassos) · Combate (mesma melodia acelerada 140 bpm com bateria — troca sem corte) · Julgamento (variação em tom menor) · Chefe (tema próprio por chefe) · Vitória (jingle 4 s) · Derrota (jingle 4 s) · Catálogo (caixinha de música) |

Volumes separados; música abaixa 40% durante a abertura do pacote para o suspense.

---

## 19. Steam

### 19.1 Conquistas (gerada) — 42, das quais 14 ligadas ao catálogo e ao bestiário

{{tabela:conquistas}}

Ícones: 64×64 gerados em código a partir do sprite/carta envolvido (ex.: página = mini-carta da facção com selo), versão
cinza para bloqueada. Nenhuma conquista depende só de sorte sem garantia (a do Prisma tem o Núcleo Prismático e
o volume de pacotes como caminho; a da Lendária tem a garantia de 40).

### 19.2 Estatísticas, placares, Cloud e rich presence

- **Estatísticas**: pacotes abertos, cartas reveladas, lendárias, prismas, brilhantes, ondas vencidas, runs, vitórias, ouro gasto, inimigos abatidos, % do catálogo, maior onda no infinito, combos, coelhos.
- **Placares**: `infinito_estagio1` (decrescente) e `diario_AAAAMMDD` (criado sob demanda, decrescente).
- **Steam Cloud**: `save/perfil.json` (catálogo, árvore, equipamento, contador da garantia Lendária), `save/run.json` (run em andamento, salva entre ondas), `save/config.json`; cota 1 MB; o processo principal grava e mantém o backup anterior.
- **Rich presence**: "Onda 7 — preparando a barraca", "Abrindo pacotes (onda 7)", "Defendendo a feira — onda 7", "Folheando o catálogo (62%)".
- **Cartas colecionáveis da Steam** (planejadas, pós-lançamento): 6 cartas com MiniFolks em moldura do jogo; emblemas por raridade.

### 19.3 Demo do Steam Next Fest

Ondas 1–10 do estágio 1 (até a Mãe Gosma), facções Humanos, Anões e Aldeões, Pacote da Feira/Pequeno/Povo, cliente da
noite, 1 alvará; sem catálogo persistente, sem conquistas, save separado; tela final com "Lista de desejos".

---

## 20. Mercado

| Jogo | Preço (EUA) | Avaliações | Nota | Lição |
|---|---|---|---|---|
| Slotbound (nov/2026) | US$ 8,99 | 1.531 (+783 na demo) | 79% | a estrutura funciona; crítica nº 1 é falta de agência |
| Balatro | US$ 14,99 | 105.938 (inglês) | 98% | escolha dentro do pacote; quebras divertidas |
| Dragon Eclipse | US$ 12,99 | 214 | 61% | pouco conteúdo e desequilíbrio derrubam a nota |
| My Life as an Archeologist | US$ 3,99 | 322 | 87% | bestiário e artefatos 1-de-3 funcionam em jogo barato |
| Seedborne Soldiers | US$ 5,99 | 30 | 86% | RNG sem agência é a crítica recorrente |
| Auto Dungeon | US$ 6,99 | 23 | 95% | tela cheia demais confunde |
| MARVEL SNAP | grátis | 20.357 (inglês) | 67% | coleção sem agência e monetização irritam |
| Cardboard Conquest | lança 2027 | — | — | pacotes como draft de facção |

**Preço sugerido**: **US$ 9,99** (desconto de lançamento de 10%); preço regional brasileiro pela tabela sugerida da Steam.
**Gancho da loja**: *"Abra, venda e especule com pacotes de cartas — e defenda sua barraca com o que sair deles."*

---

## 21. Escopo

| Marco | Conteúdo | Fora |
|---|---|---|
| **Protótipo** (Fase 3) | pacotes (Feira, Pequeno, Povo), revelação com brilho e última carta, garantia, vitrine e limite, absorção de repetidas, ondas 1–3, julgamento Inspeção, cliente da noite simplificado, prêmio, catálogo básico, save; sprites MiniFolks, cenário em blocos | arte de cenário, áudio, Steam real, comandante |
| **Fatia vertical** (Fase 4) | estágio 1 inteiro (15 ondas, 3 julgamentos, 2 chefes, alvarás), comandante com equipamento, cliente da noite completo, catálogo de 58 cartas + bestiário, árvore, menus e configurações, controle, som, créditos, Steamworks com App ID 480 | estágios 2–6, infinito, diário |
| **Demo** | ondas 1–10 (§19.3) | catálogo persistente, conquistas |
| **1.0** | 6 estágios, 16 facções recrutáveis, infinito, diário, 4 dificuldades, 42+ conquistas, Cloud, placares | multijogador, editor, trocas entre jogadores, qualquer compra com dinheiro real |

---

## 22. Assets por tela

| Tela | MiniFolks | Pesquisa (grátis / pago) | Feito em código |
|---|---|---|---|
| Título | dono + 3 ajudantes animados | fonte m6x11 | logo, céu, barraca, menu |
| Preparação / combate | todas as unidades, inimigos, projéteis (faca, machado, granada, flecha) | fundo Forest Ruins (pago, opcional); ícones Anvil (moedas, gemas) | barraca, vitrine, balcão, prateleira, embalagens de pacote, HUD, chão, partículas, barras |
| Abertura | sprite da carta (2×) | — | molduras por raridade, verso, brilho, holográfico, confete, embalagem e rasgo |
| Detalhe de carta | sprite 3× com todas as animações | fonte m5x7/m3x6 | carta grande, ícones de classe e facção |
| Absorção / 1-de-3 / cliente | unidades; Aldeão do cliente | ícones Anvil para itens | cartões, setas, barras de XP |
| Comandante | Mascate, Contrabandista, Ferreiro | ícones Anvil (equipamento) | encaixes, inventário |
| Catálogo / bestiário | todos os sprites (silhuetas geradas a partir deles) | — | livro, páginas, abas, selos |
| Árvore, pausa, configurações, fim de run, placar, créditos | ícones de facção feitos de sprites | fontes | painéis 9-slice, botões, ícones |
| Efeitos de combate | — | DK-Corp Pixel VFX (grátis 15 / pago 228) | golpes, faíscas, status, explosões |
| Áudio | — | (referência: Kenney Casino, 512 SFX) | todos os sons e músicas em Web Audio |

---

## 22.1 Mockups

> **v0 recusados** (21/11): visual abaixo do padrão pedido. A direção nova está em `docs/DIRECAO_DE_ARTE.md` e o teste de estilo v1 em `docs/mockups/estilo_*.png`; as telas serão refeitas nesse estilo depois da aprovação.

`docs/mockups/` (preparação, abertura, prisma, combate, catálogo e 3 cartas: Comum, Rara, Prisma) e a comparação com as pranchas em `docs/mockups/COMPARACAO.md`.

![Preparação](mockups/v0/preparacao.png)
![Abertura](mockups/v0/abertura.png)
![Prisma](mockups/v0/prisma.png)
![Combate](mockups/v0/combate.png)
![Catálogo](mockups/v0/catalogo.png)
![Cartas](mockups/v0/cartas.png)

---

## 23. Riscos e perguntas abertas

| Risco | Probabilidade | Resposta |
|---|---|---|
| Sorte demais: "a run morreu porque não veio carta" (a crítica do Slotbound) | alta | garantia visível; 3 carimbos; Pacote de Povo; absorção (nada se perde); bot "sem sorte" na simulação de 1.000 runs com taxa de vitória mínima |
| Estocar lacrados vira estratégia dominante | média | lacrado ocupa vitrine; Cobrador confisca; Feira Cheia premia só às vezes; bot estocador |
| Inflação de ouro no fim (poupador acumula 70–90) | média | juros com teto; preços pela escada; ajustar na Fase 3 |
| Muitos sistemas para uma run de 35 min | média | tutorial distribuído por 10 ondas; cada sistema novo só aparece depois do anterior |
| Electron/overlay/controle falharem no PC | baixa–média | teste do spike no domingo; regra de troca para Godot |
| Tela de 426×240 apertada para 5 cartas + painel | média | cartas de 72 px já cabem (384 px); mockups (abaixo) conferem |
| Legibilidade das cartas no Deck | média | texto mínimo m5x7 em 3× = 21 px de altura; teste em 1280×800 |
| Licença MiniFolks ("não revender/distribuir") com build na Steam | baixa | uso dentro do jogo é o permitido; sprites fora do repositório público; crédito a LYASeeK |
| Escopo de 6 estágios | alta | só o estágio 1 até a aprovação da fatia |

**Perguntas abertas**
1. Nome final do jogo (provisório "Bazar das Ruínas / Ruin Bazaar").
2. Facções inimigas viram recrutáveis já na 1.0 ou num update?
3. Música sintetizada é suficiente para a página da loja, ou vale um músico depois?
4. Teste do spike no PC (domingo): resultado decide Electron × Godot.
5. Comprar o kit pago de US$ 21,46 (fundos, VFX, UI) ou ficar no grátis + código?
