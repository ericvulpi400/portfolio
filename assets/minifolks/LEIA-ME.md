# assets/minifolks

Os sprites do MiniFolks (LYASeeK) **não** vão para o Git: o repositório é público e a licença dos packs
proíbe revender (e, nos packs novos, distribuir) os arquivos. Só `manifest.json` (gerado) e este arquivo são versionados.

Coloque cada pack numa subpasta com nome curto, como veio do itch.io (pode manter as subpastas originais):

```
assets/minifolks/
  humans/  villagers/  villagers2/  forest_animals/      (grátis)
  undead/  orcs/  dwarfs/  pirates/  demons/  elves/      (bundle)
  vikings/  bandits/  golems/  slimes/  forest_protectors/
  lizardmen/  goblins/                                    (se tiver)
```

Depois rode:

```
node tools/minifolks/build_manifest.mjs
```

O script lê os `.png` (grade de quadros, pivô, caixa opaca) e os `.aseprite` (nomes das tags e duração de
cada quadro), cruza os dois e grava `manifest.json`. Divergências aparecem em `issues`.
Regra: o PNG exportado é a fonte da verdade da contagem de quadros (é o que o jogo desenha); as tags do
`.aseprite` às vezes incluem um quadro de respiro nas bordas.
