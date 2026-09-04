"use strict";

// Todas as posições usam pixels do mundo do Phaser.
// x cresce para a direita e y cresce para baixo.

const DIFFICULTIES = {
  easy: {
    label: "EASY",
    playerSpeed: 280,
    markerCount: 5,
    eggCount: 5,
    markerRevealDistance: 230,
    markerBaseAlpha: 0.82,
    interactionDistance: 155
  },
  medium: {
    label: "MEDIUM",
    playerSpeed: 235,
    markerCount: 5,
    eggCount: 5,
    markerRevealDistance: 175,
    markerBaseAlpha: 0.66,
    interactionDistance: 140
  },
  hard: {
    label: "HARD",
    playerSpeed: 205,
    markerCount: 5,
    eggCount: 5,
    markerRevealDistance: 135,
    markerBaseAlpha: 0.5,
    interactionDistance: 125
  },
  challenging: {
    label: "CHALLENGING",
    playerSpeed: 182,
    markerCount: 5,
    eggCount: 5,
    markerRevealDistance: 105,
    markerBaseAlpha: 0.36,
    interactionDistance: 115
  },
  insane: {
    label: "INSANE",
    playerSpeed: 162,
    markerCount: 5,
    eggCount: 5,
    markerRevealDistance: 82,
    markerBaseAlpha: 0.24,
    interactionDistance: 105
  }
};

const LEVELS = {
  street: {
    name: "Street",
    width: 2400,
    height: 1600,
    spawn: { x: 220, y: 810 },
    theme: {
      ground: 0xc8c5a7,
      accent: 0xf2b84b,
      road: 0x454a50,
      sidewalk: 0xe8dfc7
    },

    // =====================================================
    // ALTERE A POSIÇÃO DAS CASAS AQUI
    // x = posição horizontal | y = posição vertical
    // visual controla apenas a imagem; collider controla colisão.
    // =====================================================
    objects: [
      {
        id: "street-house-1",
        type: "house",
        x: 350,
        y: 265,
        visual: { width: 330, height: 230 },
        collider: { offsetX: 0, offsetY: 20, width: 300, height: 175 }
      },
      {
        id: "street-house-2",
        type: "house",
        x: 880,
        y: 240,
        visual: { width: 350, height: 240 },
        collider: { offsetX: 0, offsetY: 22, width: 320, height: 180 }
      },
      {
        id: "street-house-3",
        type: "house",
        x: 1400,
        y: 270,
        visual: { width: 320, height: 220 },
        collider: { offsetX: 0, offsetY: 18, width: 292, height: 166 }
      },

      // =====================================================
      // ALTERE A POSIÇÃO DAS BARRACAS AQUI
      // x = posição horizontal | y = posição vertical
      // =====================================================
      {
        id: "street-fruit-stand-1",
        type: "fruit_stand",
        x: 620,
        y: 1190,
        visual: { width: 240, height: 165 },
        collider: { offsetX: 0, offsetY: 18, width: 215, height: 118 }
      },
      {
        id: "street-fruit-stand-2",
        type: "fruit_stand",
        x: 1330,
        y: 1160,
        visual: { width: 230, height: 158 },
        collider: { offsetX: 0, offsetY: 17, width: 205, height: 112 }
      },

      // =====================================================
      // ALTERE A POSIÇÃO DA LOJA GATSSINO AQUI
      // interaction define o ponto em que a tecla E funciona.
      // =====================================================
      {
        id: "gatssino-store",
        type: "store",
        name: "Gatssino",
        x: 1990,
        y: 285,
        visual: { width: 390, height: 270 },
        collider: { offsetX: 0, offsetY: 24, width: 350, height: 205 },
        interaction: { x: 1990, y: 505, radius: 175 }
      },

      // Árvores decorativas da rua. Também usam tree.png quando disponível.
      {
        id: "street-tree-1",
        type: "tree",
        x: 1650,
        y: 1240,
        visual: { width: 145, height: 190 },
        collider: { offsetX: 0, offsetY: 48, width: 70, height: 82 }
      },
      {
        id: "street-tree-2",
        type: "tree",
        x: 2050,
        y: 1220,
        visual: { width: 145, height: 190 },
        collider: { offsetX: 0, offsetY: 48, width: 70, height: 82 }
      }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS NPCs AQUI
    // dialogue = texto exibido no balão
    // =====================================================
    npcs: [
      {
        id: "npc-alley",
        x: 720,
        y: 835,
        dialogue: "Play on the end of the alley, collect 5 eggs"
      }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS OVOS AQUI
    // Cada id deve continuar único em todas as fases.
    // =====================================================
    eggs: [
      { id: "egg-street-1", x: 245, y: 1325 },
      { id: "egg-street-2", x: 1515, y: 1335 }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS MARKERS AQUI
    // type aceita red ou blue e pode receber novas cores depois.
    // =====================================================
    markers: [
      { id: "marker-street-red", x: 1080, y: 475, type: "red" },
      { id: "marker-street-blue", x: 2215, y: 610, type: "blue" }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS PORTAIS AQUI
    // down = próxima fase | up = fase anterior
    // targetSpawn evita nascer sobre outro portal.
    // =====================================================
    portals: [
      {
        id: "street-to-house",
        direction: "down",
        x: 2220,
        y: 1450,
        target: "house",
        targetSpawn: { x: 260, y: 1180 }
      }
    ]
  },

  house: {
    name: "House",
    width: 2200,
    height: 1500,
    spawn: { x: 260, y: 1180 },
    theme: {
      ground: 0xd8c8aa,
      accent: 0x8e6448,
      wall: 0x4c3b35,
      rug: 0xb85d58
    },

    // =====================================================
    // ALTERE OS OBJETOS E CORREDORES DA CASA AQUI
    // wall/table possuem colisores independentes do desenho.
    // A primeira house usa house.png como quadro de referência.
    // =====================================================
    objects: [
      {
        id: "house-portrait",
        type: "house",
        x: 1100,
        y: 135,
        visual: { width: 250, height: 155 },
        solid: false
      },
      {
        id: "house-wall-left-top",
        type: "wall",
        x: 620,
        y: 340,
        visual: { width: 76, height: 420 },
        collider: { offsetX: 0, offsetY: 0, width: 76, height: 420 }
      },
      {
        id: "house-wall-left-bottom",
        type: "wall",
        x: 620,
        y: 1040,
        visual: { width: 76, height: 520 },
        collider: { offsetX: 0, offsetY: 0, width: 76, height: 520 }
      },
      {
        id: "house-wall-right-top",
        type: "wall",
        x: 1550,
        y: 385,
        visual: { width: 76, height: 510 },
        collider: { offsetX: 0, offsetY: 0, width: 76, height: 510 }
      },
      {
        id: "house-wall-right-bottom",
        type: "wall",
        x: 1550,
        y: 1160,
        visual: { width: 76, height: 410 },
        collider: { offsetX: 0, offsetY: 0, width: 76, height: 410 }
      },
      {
        id: "house-table-center",
        type: "table",
        x: 1090,
        y: 520,
        visual: { width: 310, height: 145 },
        collider: { offsetX: 0, offsetY: 0, width: 290, height: 125 }
      },
      {
        id: "house-table-bottom",
        type: "table",
        x: 1080,
        y: 1200,
        visual: { width: 280, height: 130 },
        collider: { offsetX: 0, offsetY: 0, width: 260, height: 110 }
      },
      { id: "house-painting-1", type: "painting", x: 270, y: 240, visual: { width: 150, height: 95 }, solid: false },
      { id: "house-painting-2", type: "painting", x: 1900, y: 780, visual: { width: 145, height: 100 }, solid: false },
      { id: "house-rug", type: "rug", x: 1080, y: 850, visual: { width: 360, height: 230 }, solid: false }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS NPCs AQUI
    // =====================================================
    npcs: [
      { id: "npc-house", x: 1090, y: 840, dialogue: "Find 3 markers" }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS OVOS AQUI
    // =====================================================
    eggs: [
      { id: "egg-house-1", x: 1930, y: 1270 }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS MARKERS AQUI
    // =====================================================
    markers: [
      { id: "marker-house-red", x: 320, y: 390, type: "red" },
      { id: "marker-house-blue", x: 1860, y: 520, type: "blue" }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS PORTAIS AQUI
    // =====================================================
    portals: [
      {
        id: "house-to-street",
        direction: "up",
        x: 175,
        y: 1360,
        target: "street",
        targetSpawn: { x: 2030, y: 1300 }
      },
      {
        id: "house-to-forest",
        direction: "down",
        x: 2020,
        y: 220,
        target: "forest",
        targetSpawn: { x: 300, y: 1460 }
      }
    ]
  },

  forest: {
    name: "Forest",
    width: 2600,
    height: 1800,
    spawn: { x: 300, y: 1460 },
    theme: {
      ground: 0x6e9b64,
      accent: 0xd4df78,
      path: 0xb9a579,
      dark: 0x315b42
    },

    // =====================================================
    // ALTERE A POSIÇÃO DAS ÁRVORES AQUI
    // visual redimensiona tree.png sem deformar.
    // collider fica menor para permitir caminhar sob a copa.
    // =====================================================
    objects: [
      { id: "tree-01", type: "tree", x: 260, y: 260, visual: { width: 185, height: 245 }, collider: { offsetX: 0, offsetY: 65, width: 72, height: 88 } },
      { id: "tree-02", type: "tree", x: 610, y: 330, visual: { width: 175, height: 235 }, collider: { offsetX: 0, offsetY: 62, width: 70, height: 84 } },
      { id: "tree-03", type: "tree", x: 1020, y: 230, visual: { width: 200, height: 260 }, collider: { offsetX: 0, offsetY: 70, width: 78, height: 94 } },
      { id: "tree-04", type: "tree", x: 1510, y: 320, visual: { width: 185, height: 245 }, collider: { offsetX: 0, offsetY: 65, width: 72, height: 88 } },
      { id: "tree-05", type: "tree", x: 2020, y: 265, visual: { width: 195, height: 255 }, collider: { offsetX: 0, offsetY: 68, width: 76, height: 92 } },
      { id: "tree-06", type: "tree", x: 2380, y: 480, visual: { width: 180, height: 240 }, collider: { offsetX: 0, offsetY: 64, width: 70, height: 86 } },
      { id: "tree-07", type: "tree", x: 390, y: 840, visual: { width: 180, height: 240 }, collider: { offsetX: 0, offsetY: 64, width: 70, height: 86 } },
      { id: "tree-08", type: "tree", x: 760, y: 1110, visual: { width: 195, height: 255 }, collider: { offsetX: 0, offsetY: 68, width: 76, height: 92 } },
      { id: "tree-09", type: "tree", x: 1320, y: 1180, visual: { width: 188, height: 248 }, collider: { offsetX: 0, offsetY: 66, width: 74, height: 90 } },
      { id: "tree-10", type: "tree", x: 1760, y: 920, visual: { width: 205, height: 265 }, collider: { offsetX: 0, offsetY: 72, width: 80, height: 96 } },
      { id: "tree-11", type: "tree", x: 2240, y: 1050, visual: { width: 185, height: 245 }, collider: { offsetX: 0, offsetY: 65, width: 72, height: 88 } },
      { id: "tree-12", type: "tree", x: 2430, y: 1500, visual: { width: 200, height: 260 }, collider: { offsetX: 0, offsetY: 70, width: 78, height: 94 } },
      { id: "tree-13", type: "tree", x: 1040, y: 1570, visual: { width: 180, height: 240 }, collider: { offsetX: 0, offsetY: 64, width: 70, height: 86 } },
      { id: "tree-14", type: "tree", x: 1620, y: 1570, visual: { width: 190, height: 250 }, collider: { offsetX: 0, offsetY: 67, width: 74, height: 90 } }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS NPCs AQUI
    // =====================================================
    npcs: [
      { id: "npc-forest", x: 1260, y: 870, dialogue: "This is not a marker" }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS OVOS AQUI
    // =====================================================
    eggs: [
      { id: "egg-forest-1", x: 520, y: 510 },
      { id: "egg-forest-2", x: 2260, y: 650 }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS MARKERS AQUI
    // =====================================================
    markers: [
      { id: "marker-forest-red", x: 2070, y: 1450, type: "red" }
    ],

    // =====================================================
    // ALTERE A POSIÇÃO DOS PORTAIS AQUI
    // A floresta é a última fase: existe apenas retorno.
    // =====================================================
    portals: [
      {
        id: "forest-to-house",
        direction: "up",
        x: 175,
        y: 1630,
        target: "house",
        targetSpawn: { x: 1840, y: 410 }
      }
    ]
  }
};

const LEVEL_ORDER = ["street", "house", "forest"];
const TOTAL_MARKERS = Object.values(LEVELS).reduce((total, level) => total + level.markers.length, 0);
const TOTAL_EGGS = Object.values(LEVELS).reduce((total, level) => total + level.eggs.length, 0);

window.FIND_THE_MARKERS_DATA = Object.freeze({
  DIFFICULTIES,
  LEVELS,
  LEVEL_ORDER,
  TOTAL_MARKERS,
  TOTAL_EGGS
});
