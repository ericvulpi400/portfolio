# Fase 0.4 — Teste técnico (spike) em Electron

Data: 20/11/2026. Código em `spike/` (separado do jogo; não é código do jogo). Electron 45.4.1, electron-builder 26.18.0,
steamworks-ffi-node 0.11.3 (Steamworks SDK 1.64), Canvas 2D puro.

**Onde rodei**: um contêiner Linux na nuvem, **sem GPU, sem Steam, sem controle e sem Windows**. Tudo que precisa disso
ficou **pendente no seu PC** com um roteiro de 10 minutos abaixo. Não marquei nada como aprovado sem ter visto funcionar.

## Resultado por item

| # | Item | Resultado aqui | Evidência | Falta |
|---|---|---|---|---|
| 1 | Pacote: rasgar, cartas viradas uma a uma, brilho por raridade antes de virar, prisma com reflexo holográfico | **OK** | `trabalho/spike_estados_1080p.png` (pacote fechado, verso com brilho, 5 cartas reveladas, campo) | — |
| 2 | 80 MiniFolks animados + partículas, escala inteira, sem borrão | **OK** | `imageSmoothingEnabled=false`, buffer 480×270 ampliado por inteiro (4× em 1080p), posições arredondadas; sprites e quadros vêm de `assets/minifolks/manifest.json` | — |
| 3 | 60 fps em 1080p com 80 unidades | **OK em software** (pior caso) | Chromium headless **sem GPU** 1920×1080, 15 s, 80 unidades + ~100–400 partículas: quadro médio 16,72 ms, p95 16,8, p99 16,8, **1 de 898** quadros acima de 18 ms; CPU do jogo **2,0 ms/quadro** (p99 3,2). Electron sob Xvfb: 16,67 ms médio, **0 de 902** acima de 18 ms, CPU 1,6 ms. `trabalho/spike_bench_chromium_1080p.json` | confirmar num PC médio com GPU (tecla **B**) |
| 4 | Steamworks: init 480, conquista desbloquear/resetar, Cloud gravar/ler, placar enviar/baixar, rich presence | **Pendente (sem Steam aqui)**. A ponte carrega a `libsteam_api` por FFI e falha limpo: "SteamAPI_IsSteamRunning() did not locate a running instance of Steam" | log em `trabalho/spike_results_electron_linux.json`; código em `spike/main/main.js` (`runSteamTests`) | rodar `--steam-selftest` no seu PC |
| 5 | Overlay (Shift+Tab) lançado pela Steam como jogo de terceiros | **Pendente** | switches `in-process-gpu` e `disable-direct-composition` no Windows + repintura contínua (rAF) | testar no seu PC (não força troca de engine) |
| 6 | Controle Xbox/PlayStation em todos os botões | **Pendente (sem controle aqui)** | painel **G** lista os 17 botões do mapeamento padrão + eixos, marca os já apertados e grava o resultado ao fechar | testar no seu PC e no Deck |
| 7 | Build de Windows que abre fora da pasta | **Build gerado; abertura pendente** | `npm run dist:win` (de Linux) → `dist/win-unpacked/MiniFolks Packs Spike.exe` (PE32+ x86-64) + zip 157 MB; koffi nativo de Windows incluído e desempacotado do asar. Tentei abrir com Wine: o próprio Wine quebra neste contêiner (`wine cmd` aborta) | abrir no seu Windows a partir da Área de Trabalho |

## Escolha da ponte Steamworks: **steamworks-ffi-node**

| | steamworks-ffi-node 0.11.3 | steamworks.js 0.4.0 |
|---|---|---|
| Última versão | 24/09/2026 (ativa) | 06/08/2024 (parada há 2 anos) |
| SDK | 1.64 | mais antigo, embutido |
| Conquistas, estatísticas, Cloud | sim | sim |
| **Placares (leaderboards)** | **sim** (achar, enviar, baixar) | **não tem** |
| Rich presence | sim | parcial |
| Overlay em Electron | switches + overlay nativo experimental | só switches |
| Instalação | FFI (koffi), sem compilar | binário pronto |
| Custo | você precisa baixar o SDK no site de parceiros e copiar `redistributable_bin` | DLL já vem no pacote |

Placar é obrigatório no pedido (infinito e desafio diário) → **steamworks-ffi-node**. Dependência transitiva: `koffi`
(FFI). Para build de Windows feito fora do Windows, o script `tools/fetch-win-natives.mjs` baixa o binário do koffi para win32-x64.

## Decisão: **seguir com Electron** (sem troca para Godot)

Nenhum critério de troca foi atingido: desempenho sobra (2 ms de CPU por quadro num cenário pior que o real), e
Steamworks, controle e build ainda **não falharam** — só não puderam ser testados aqui. A regra das duas tentativas
de correção começa a contar quando você rodar o roteiro abaixo. Se algum desses falhar duas vezes depois de corrigido,
eu aviso e proponho a troca antes de seguir.

## Achado importante: resolução lógica no Steam Deck

Com 480×270 fixos, o Deck (1280×800) só comporta escala **2×** → imagem de 960×540 com tarja preta e texto miúdo
(`trabalho/spike_deck_480x270_vs_426x266.png`, à esquerda). Com **426×266** o Deck usa **3×** (1278×798) e enche a tela (à direita).

| Tela | 480×270 fixo | Proposta: área segura 426×240, lógica variável |
|---|---|---|
| 1920×1080 | 4× (cheio) | 4× → lógica 480×270 |
| 1280×800 (Deck) | **2×** (960×540) | **3×** → lógica 426×266 |
| 1366×768 | 2× (960×540) | 3× → 455×256 |
| 2560×1440 | 5× (2400×1350) | 6× → 426×240 |
| 3840×2160 | 8× | 9× → 426×240 |

**Recomendação**: escala inteira = `floor(min(L/426, A/240))`; a resolução lógica é a tela dividida por essa escala
(entre 426×240 e ~480×270). A UI é desenhada para a área segura de 426×240 e ancorada nas bordas; o campo e o fundo
se estendem. Continua pixel-perfect e com escala inteira. **Preciso do seu ok** para trocar o "480×270 fixo" do pedido.

## Outros achados

- **Manifesto**: 42 personagens nos 4 packs grátis. As tags dos `.aseprite` às vezes incluem um quadro de respiro nas
  bordas (ex.: urso "jump" 4 na tag × 3 no PNG). O script usa o **PNG como verdade** e alinha as durações pela contagem de
  pixels. Personagens 40×40 e 64×32 existem nos packs novos (Demons, Slimes, Forest Protectors, Lizardmen, Goblins) —
  o manifesto marca `heavy: true` para eles (encaixa no traço "pesado = 2 espaços").
- Aldeões (Villagers) quase não têm ataque: o spike só põe em combate quem tem idle, walk, ataque, hit e death de verdade.
- `HumansProjectiles` e `Anvil` são objetos, não personagens (marcados como `prop`).
- A fonte 3×5 gerada em código é legível a 4×, mas pequena a 2×; o GDD vai usar m5x7/m3x6 (ver `assets/PESQUISA_ASSETS.md`).
- Electron não tem tela cheia exclusiva: "tela cheia" já é janela sem borda do tamanho do monitor. O menu terá Janela e Tela cheia (sem borda).

## Roteiro para o seu PC (Windows 10/11, ~10 min)

1. Instale Node.js 22 LTS e Git. Clone a branch `claude/minifolks-roguelite-packs-a4frj5`.
2. Copie os packs MiniFolks para `assets/minifolks/` (ver `assets/minifolks/LEIA-ME.md`) e rode `node tools/minifolks/build_manifest.mjs`.
3. Baixe o **Steamworks SDK** em partner.steamgames.com → copie a pasta `sdk/redistributable_bin` para `spike/steamworks_sdk/redistributable_bin`.
4. `cd spike && npm install && npm run dist:win`. Copie `spike/dist/win-unpacked` para a Área de Trabalho (fora do projeto) → **item 7**: abre?
5. Com a Steam aberta e logada (adicione o Spacewar se pedir: `steam://install/480`), rode no terminal:
   `"MiniFolks Packs Spike.exe" --steam-selftest` → **item 4**. O resultado fica em `%APPDATA%\MiniFolks Packs Spike\spike-results.json`.
6. Na Steam: *Adicionar um jogo → Adicionar jogo não Steam* → escolha o .exe → abra pela Steam → **Shift+Tab** e tecla **O** → **item 5**.
7. Conecte o controle (Xbox e/ou PS), tecla **G**, aperte todos os botões e mexa os dois analógicos, **G** de novo para gravar → **item 6**. Repita com o Steam Input ligado e desligado.
8. **F** (tela cheia) e **B** (bench de 15 s com 80 unidades) → **item 3**.
9. Me mande o `spike-results.json`.

Teclas do spike: Espaço/A = rasgar e virar · A (tecla) = abrir tudo · P = pacote com prisma · N = novo pacote ·
S = invocar 80 · G = controle · T = testes Steam · O = overlay · F/W = tela cheia/janela · B = bench.
No navegador: sirva a pasta `spike/` (`python -m http.server -d spike 8080`) e abra `renderer/index.html`; a Steam vira stub.
