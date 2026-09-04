# Find the Markers — Reuter's Mix

Jogo 2D de exploração/coleta inspirado no desenho à mão do PDF de referência
(11 páginas — cada página é uma área, **não** uma fase linear).

- **Engine:** Phaser 3 (vendado em `vendor/phaser.min.js`, sem build)
- **Arquitetura:** ES modules em `game/` (scenes, entities, puzzles, progression, save, ui, config, assets)
- **Save:** `localStorage` versionado, com arquitetura trocável (`game/save/save-manager.js`)
- **Total:** 40 markers únicos, missão dos 5 ovos, 3 puzzles, 10 áreas conectadas com backtracking

## Como rodar

O jogo usa ES modules — precisa de um servidor HTTP:

```bash
cd find-the-markers
python3 -m http.server 8080
# abra http://localhost:8080
```

## Controles

Visão **top-down 2.5D** (movimento livre no plano, sem pulo/gravidade).

| Ação | Tecla |
| --- | --- |
| Andar (8 direções) | WASD ou setas |
| Interagir (caixas, portas) | E ou Espaço |
| Coleção | C |
| Pausa | ESC |
| Puzzles (medidor e 3x3) | Clique do mouse / toque |

No celular: D-pad (▲◀▶▼) + botão **E**; puzzles por toque.

## Progressão

```
spawn (9) ──8──> pomar (8) ──17──> floresta (7) ──19──> cidade (4) ──24──> feira (1) ──30──> (futuro)
   │                │                 │    │                  │
   └─livre─> créditos (10)      casa (5) área secreta (6)  casino (2<->3, entra com E)
```

- Os números são **requisitos de markers** para a passagem (gates centrais em
  `game/config/room-connections.js`).
- Voltar é sempre permitido (backtracking).
- Página 11 do PDF não é área: é só o código do puzzle 3x3 (5-8-9 / 7-1-4 / 2-6-3).

## Debug/QA

`http://localhost:8080/?debug=1` → mostra colisões, estado dos puzzles e expõe
`window.FTM` (give/addMarkers/solve/warp/reset) para testes.

## Testes

```bash
node --test tests/
```
