# Economia do estágio 1 (Mercador)

Gerado por `tools/sim/economia.mjs`. Renda = 18 + 4 x onda; preço do Pacote da Feira = (8 + 2 x onda) × escada [1; 1,5; 2,2] para o 1º, 2º e 3º pacote da onda; juros = 1 por 10 guardados (máx. 4). Ouro inicial 25. Os bots **não vendem cartas** (vender todas as cartas de um pacote devolve em média **56% do preço base** da onda; nunca dá lucro).

| Onda | Tipo | Inimigos | VID total | Ouro da onda (renda + abates) | Pacote 1 / 2 / 3 | 3 pacotes | Gastador: compra / sobra | Poupador: compra / sobra |
|---|---|---|---|---|---|---|---|---|
| 1 | normal | 6 | 108 | 22 + 6 = 28 | 10 / 15 / 22 | 47 | 2 / 0 | 1 / 15 |
| 2 | normal | 10 | 218 | 26 + 10 = 36 | 12 / 18 / 26 | 56 | 1 / 16 | 1 / 32 |
| 3 | normal | 12 | 324 | 30 + 12 = 42 | 14 / 21 / 31 | 66 | 2 / 18 | 1 / 57 |
| 4 | julgamento (inspecao) | 12 | 471 | 34 + 13 = 47 | 16 / 24 / 35 | 75 | 2 / 21 | 2 / 63 |
| 5 | normal | 10 | 488 | 38 + 24 = 62 | 18 / 27 / 40 | 85 | 2 / 25 | 2 / 69 |
| 6 | normal | 16 | 801 | 42 + 19 = 61 | 20 / 30 / 44 | 94 | 2 / 39 | 3 / 41 |
| 7 | normal | 11 | 1081 | 46 + 16 = 62 | 22 / 33 / 48 | 103 | 3 / 0 | 2 / 51 |
| 8 | julgamento (feira_cheia) | 16 | 1069 | 50 + 21 = 71 | 24 / 36 / 53 | 113 | 2 / 2 | 2 / 57 |
| 9 | normal | 16 | 1076 | 54 + 30 = 84 | 26 / 39 / 57 | 122 | 2 / 8 | 2 / 67 |
| 10 | chefe (mae_gosma) | 25 | 3146 | 58 + 70 = 128 | 28 / 42 / 62 | 132 | 2 / 22 | 2 / 85 |
| 11 | normal | 9 | 858 | 62 + 9 = 71 | 30 / 45 / 66 | 141 | 3 / 11 | 3 / 76 |
| 12 | julgamento (noite) | 14 | 1576 | 66 + 14 = 80 | 32 / 48 / 70 | 150 | 2 / 3 | 2 / 71 |
| 13 | normal | 15 | 2386 | 70 + 23 = 93 | 34 / 51 / 75 | 160 | 1 / 49 | 2 / 70 |
| 14 | normal | 17 | 3490 | 74 + 29 = 103 | 36 / 54 / 79 | 169 | 2 / 56 | 2 / 77 |
| 15 | chefe (cobrador) | 11 | 4062 | 78 + 74 = 152 | 38 / 57 / 84 | 179 | 2 / 68 | 2 / 89 |

Total de pacotes nas 15 ondas: gastador **30**, poupador **29**. Juros entram depois da onda. Valor médio de um Pacote da Feira: venda 56% do preço base; XP de absorção das unidades 7.0.
