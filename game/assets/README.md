# game/assets

Os visuais do jogo hoje são **procedurais** (desenhados em runtime em
`game/assets/textures.js`), no estilo desenho à mão do PDF de referência.

## Como substituir por sprites definitivos (PNG)

1. Coloque os arquivos aqui, organizados por categoria:

```
assets/
  player/        ex.: player.png
  markers/       ex.: marker_Easy_classic.png (um por dificuldade/estilo)
  environments/  spawn/, orchard/, forest/, city/, market/, casino/, credits/, secret/
  props/
  ui/
  puzzles/
```

2. Registre o PNG em `manifest.js` (const OPTIONAL_PNG_ASSETS) — o loader
   tenta carregar o arquivo e, se ele não existir, mantém o procedural
   como fallback (aviso no console).

3. Nomes claros, sem `image1.png` / `finalfinal3.png`.

Enquanto não houver PNGs, o jogo funciona 100% com os desenhos procedurais.
