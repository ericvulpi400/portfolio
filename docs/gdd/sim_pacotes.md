# Simulação de 1.000.000 Pacotes da Feira

Semente 20261121; pool do estágio 1 (Humanos, Anões, Elfos, Vikings, Aldeões, itens, núcleos); garantias de run zeradas a cada 39 pacotes (uma run típica). Tempo: 4.4 s. Gerado por `tools/sim/simular_pacotes.mjs`.

## Raridade sorteada por posição (tabela declarada × observado)

| Raridade | Cartas 1–4: tabela | observado | Última carta: tabela | observado |
|---|---|---|---|---|
| comum | 62.6% | 62.652% | 41.7% | 41.665% |
| incomum | 28.0% | 27.995% | 35.0% | 34.983% |
| rara | 8.0% | 8.002% | 18.0% | 18.050% |
| epica | 1.2% | 1.197% | 4.5% | 4.519% |
| lendaria | 0.1% | 0.153% | 0.8% | 0.783% |

Na coluna "última carta" ficam de fora as 96.703 últimas cartas sorteadas pela garantia (9.670%).

## Tipo de carta por posição

| Tipo | Cartas 1–4: tabela | observado | Última: tabela | observado |
|---|---|---|---|---|
| unidade | 72.0% | 71.994% | 70.0% | 70.097% |
| item | 14.0% | 14.018% | 12.0% | 11.945% |
| especial | 10.0% | 9.984% | 8.0% | 7.994% |
| nucleo | 4.0% | 4.004% | 10.0% | 9.963% |

## Por pacote

| Pelo menos uma… | Sem garantia (cálculo) | Com garantia (observado) | 1 a cada |
|---|---|---|---|
| rara ou melhor | 48.21% | 53.24% | 1.9 pacotes |
| epica ou melhor | 10.31% | 14.69% | 6.8 pacotes |
| lendaria ou melhor | 1.39% | 3.42% | 29.2 pacotes |

## Garantias

| Garantia | Regra | Disparou | % dos pacotes | Maior seca observada (dentro da run p/ rara e épica) |
|---|---|---|---|---|
| rara | 3 pacotes sem → garante (run) | 58.739 | 5.874% | 3 pacotes |
| epica | 12 pacotes sem → garante (run) | 22.082 | 2.208% | 12 pacotes |
| lendaria | 40 pacotes sem → garante (perfil) | 15.882 | 1.588% | 40 pacotes |

## Versões (unidades e ajudantes)

| Versão | Tabela | Observado | 1 a cada |
|---|---|---|---|
| brilhante | 4.00% | 4.005% | 25 cartas (6 pacotes) |
| prisma | 0.05% | 0.050% | 2.010 cartas (495 pacotes) |

## Raridade efetiva (depois da regra "sem carta desse tipo nessa raridade → sobe")

| Raridade | % de todas as cartas |
|---|---|
| comum | 54.900% |
| incomum | 31.465% |
| rara | 10.572% |
| epica | 2.375% |
| lendaria | 0.688% |
