# Direção de arte — Bazar das Ruínas

Versão 1 (21/11/2026), depois da recusa dos mockups v0 ("feio: cenário, visual, organização, UI/UX").
Padrão de qualidade pedido: **Slotbound**. Este documento separa o que aprendemos dele (princípios, medidos nos
prints) do que é **nosso** (identidade, formas, layout). Nada de layout, moldura, ícone ou tela copiado.

## 1. O que o Slotbound faz bem (medido nos prints 1920×1080)

| Princípio | Como aparece | Número |
|---|---|---|
| Escala | 480×270 lógicos, 4× em 1080p | pixel = 4 px de tela |
| **Moldura diegética** | o jogo inteiro é um objeto (a máquina): bordas grossas, relevo, parafusos, entalhes, enfeite no topo | moldura 8–14 px lógicos |
| **Contraste de hierarquia** | moldura escura e dessaturada; conteúdo (campo, ícones, cartas) claro e saturado | moldura ~L 20–35%; conteúdo L 50–90% |
| Relevo em 3 tons | toda peça tem luz em cima/esquerda, sombra embaixo/direita, contorno escuro | 1 px de luz, 1–2 px de sombra |
| **Cenário pintado** | céu em faixas, sol grande, nuvens fofas, árvores em aglomerados de folhas, 3–4 tons por material | luz fixa do alto à esquerda |
| Ícones "adesivo" | itens 16–24 px com contorno escuro + borda clara externa de 1 px, cores saturadas, brilho | 2 contornos |
| Papel | escolhas e coleção em pergaminho creme, texto escuro, título em faixa, raridade colorida | texto escuro sobre claro |
| Sombra no chão | todo personagem tem elipse escura embaixo | 1 tom acima do chão |
| Números grandes | onda atual grande no centro, vizinhas menores e apagadas | 2 tamanhos de fonte |
| Personagem como interface | o vendedor da loja é uma ilustração grande atrás do balcão | ~64 px de altura |

## 2. Nossa identidade: **a feira é a moldura**

O Slotbound é uma máquina; nós somos uma **barraca de feira**. Toda tela de jogo é vista de dentro da barraca:

| Peça | Papel na interface |
|---|---|
| **Toldo listrado** (topo) | barra superior; o recorte em ondas da lona delimita o campo |
| **Placas de madeira penduradas** por cordas | HUD: onda, ouro, vida, carimbos, garantia |
| **Bandeirinhas** (varal) | contador de ondas: cada bandeirinha é uma onda; a atual é maior e clara, as próximas mostram o ícone do evento (julgamento, chefe) |
| **Postes laterais** com pregos e lampiões | moldura lateral; sinergias penduradas como plaquinhas |
| **Campo** entre os postes | cenário pintado do estágio (ruínas no vale) |
| **Tapetes** no chão | espaços da vitrine (3×5); a cor do tapete diz o estado (livre, ocupado, travado) |
| **Balcão** (base) | prateleira de pacotes, caixote do estoque, bolsa (bolso), carimbos de borracha, caixa de moedas e o **sino** que abre a feira |
| **Etiquetas de preço** | preço de cada pacote, penduradas por barbante |
| **Pergaminho pregado** | tabela de chances, com pregos nos cantos |
| **Dono da barraca** | o comandante (MiniFolk do Aldeão em 2×) atrás do balcão, reage às cartas |

## 3. Regras de estilo (valem para tudo que é feito em código)

1. **Resolução**: 480×270 lógicos (área segura 426×240 no centro para tudo que é essencial); escala inteira.
2. **Luz** fixa do alto à esquerda; toda peça tem: contorno no tom mais escuro da **própria** rampa (nunca preto puro), 1 px de luz no topo/esquerda, 1–2 px de sombra embaixo/direita.
3. **Paleta em rampas** (5 tons cada): madeira, lona vermelha, lona creme, latão, pergaminho, pedra, folhagem, céu, terra, moldura-noite, mais as rampas de raridade. Sem transparência: escurecer = pontilhado; brilho = ciclo de cores da paleta.
4. **Hierarquia por brilho**: moldura e balcão em tons médios-escuros e quentes; campo, cartas e ícones claros e saturados; o que se clica tem a luz mais forte da tela.
5. **Textura por aglomerado** (folhas, pedra, veio de madeira, grama), nunca pixel solto.
6. **Ícones** desenhados à mão como bitmaps 9×9 a 16×16, com contorno escuro e borda clara de "adesivo" quando sobre fundo escuro.
7. **Texto**: claro sobre madeira/noite com sombra de 1 px; escuro sobre pergaminho sem sombra; números importantes em ouro; duas escalas (m5x7 1× e 2×).
8. **Sombra** elíptica embaixo de todo personagem e objeto apoiado.
9. Cada tela tem **um foco**: na preparação, o pacote em destaque e o sino; na abertura, a carta que vai virar.

## 4. Revisão obrigatória (antes de mostrar)

Ver ampliado 8×: contornos fechados, luz coerente, nada de pixel solto, legibilidade a 3× (Deck), cores dentro da paleta,
nada parecido com o layout do Slotbound (máquina à esquerda, campo emoldurado à direita, livro de coleção).

## 5. Assets que elevariam o nível (opcional)

Os fundos pintados são a peça mais cara de fazer em código. Se o teste de estilo não convencer no cenário, o
`Forest Ruins Battle Background` e o `Cave Battle Background` (ansimuz, US$ 3,99 cada, "sem IA") resolvem os estágios 1 e 3.
