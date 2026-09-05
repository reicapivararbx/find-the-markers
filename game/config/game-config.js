// Constantes globais do jogo. Nada de regra de gameplay aqui fora.
// Visão: TOP-DOWN 2D / 2.5D (estilo Capyrails) — movimento livre no plano X+Y.
export const VIEW = Object.freeze({ width: 1440, height: 810 });

export const PHYSICS = Object.freeze({
  // zero gravity — top-down puro
  gravity: 0,
  playerWidth: 40,
  playerHeight: 52,
  // corpo de colisão = pés/base (não a silhueta inteira)
  bodyWidth: 28,
  bodyHeight: 18,
  bodyOffsetX: 6,
  bodyOffsetY: 30,
  maxSpeed: 260,
  // depth sort: depth ≈ y dos pés
  depthBias: 10
});

export const PLAYER_CHARACTERS = Object.freeze({
  male: Object.freeze({
    id: "male",
    label: "Homem",
    textureKey: "player_male",
    path: "imagens/player/human.png",
    displayHeight: 100
  }),
  female: Object.freeze({
    id: "female",
    label: "Mulher",
    textureKey: "player_female",
    path: "imagens/player/miku.png",
    displayHeight: 108
  })
});

export const SECRET_NPC_SPRITES = Object.freeze({
  shadow_watcher: Object.freeze({
    textureKey: "npc_shadow_watcher",
    path: "imagens/npcs-secretos/o-observador.png",
    displayHeight: 120
  }),
  mysterious_capybara: Object.freeze({
    textureKey: "npc_mysterious_capybara",
    path: "imagens/npcs-secretos/capivara.png",
    displayHeight: 96
  })
});

export const TRANSITION = Object.freeze({
  fadeMs: 280,
  cooldownMs: 450
});

export const GAMEPLAY = Object.freeze({
  collectRadius: 48,
  interactRadius: 120,
  puzzleClickRadius: 340,
  // gates nas bordas do mapa (top-down)
  gateZoneWidth: 70,
  gateZoneHeight: 220,
  portalCooldownMs: 450
});

// Chave do localStorage. NÃO incluir nenhum número temático aqui.
export const SAVE_STORAGE_KEY = "find-the-markers-reuters-mix-save";
export const SAVE_VERSION = 2;

export const ECONOMY = Object.freeze({
  slotCost: 3,
  pitySoft: 30,
  pityHard: 50,
  totalCoins: 37
});

export const AREA_SEAL_IDS = Object.freeze([
  "seal_garden",
  "seal_harbor",
  "seal_factory",
  "seal_mine",
  "seal_lab",
  "seal_ruins",
  "seal_peak",
  "seal_vault",
  "seal_citadel_gate"
]);

export const COLORS = Object.freeze({
  skyTop: 0xbfe8f7,
  skyBottom: 0xe8f7d8,
  ink: 0x2b2b33,
  paper: 0xf6f2e8
});
