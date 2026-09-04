// Conexões entre áreas — ÚNICA fonte de verdade para progressão/gates.
// requiredMarkers: 0 ou ausente = passagem livre.
// condition: nome de um puzzleState que precisa ser true.
// interaction: "E" = porta interativa em vez de seta de passagem.
// arriveAt: spawn point nomeado na sala de destino.
// to: null = destino ainda não definido (conteúdo futuro, nunca crasha).

export const ROOM_CONNECTIONS = Object.freeze({
  room_09_spawn: {
    left: { to: "room_08_orchard_difficulty", requiredMarkers: 8, arriveAt: "from_room_09" },
    right: { to: "room_10_credits", requiredMarkers: 0, arriveAt: "from_room_09" }
  },

  room_10_credits: {
    left: { to: "room_09_spawn", requiredMarkers: 0, arriveAt: "from_room_10" }
  },

  room_08_orchard_difficulty: {
    left: { to: "room_09_spawn", requiredMarkers: 0, arriveAt: "from_room_08" },
    right: { to: "room_07_forest", requiredMarkers: 17, arriveAt: "from_room_08" }
  },

  room_07_forest: {
    left: { to: "room_04_city_casino", requiredMarkers: 19, arriveAt: "from_room_07" },
    right: { to: "room_05_house", requiredMarkers: 0, arriveAt: "from_room_07" },
    orchard: { to: "room_08_orchard_difficulty", requiredMarkers: 0, arriveAt: "from_room_07" },
    secretComputer: { to: "room_06_secret_computer", requiredMarkers: 0, condition: "redButtonsSolved", arriveAt: "from_room_07" }
  },

  room_06_secret_computer: {
    left: { to: "room_07_forest", requiredMarkers: 0, arriveAt: "from_room_06" }
  },

  room_05_house: {
    left: { to: "room_08_orchard_difficulty", requiredMarkers: 0, arriveAt: "from_room_05" },
    right: { to: "room_07_forest", requiredMarkers: 0, arriveAt: "from_room_05" }
  },

  room_04_city_casino: {
    left: { to: "room_01_market", requiredMarkers: 24, arriveAt: "from_room_04" },
    right: { to: "room_07_forest", requiredMarkers: 0, arriveAt: "from_room_04" },
    casino: { to: "room_02_casino_gallery", requiredMarkers: 0, interaction: "E", arriveAt: "from_casino_door" }
  },

  room_01_market: {
    right: { to: "room_04_city_casino", requiredMarkers: 0, arriveAt: "from_room_01" },
    future30: { requiredMarkers: 30, to: null, arriveAt: "from_room_01" }
  },

  room_02_casino_gallery: {
    next: { to: "room_03_casino_pool", requiredMarkers: 0, arriveAt: "from_room_02" },
    exitCasino: { to: "room_04_city_casino", requiredMarkers: 0, interaction: "E", arriveAt: "outside_casino" }
  },

  room_03_casino_pool: {
    back: { to: "room_02_casino_gallery", requiredMarkers: 0, arriveAt: "from_room_03" }
  }
});

// Nomes de áreas exibidos ao jogador (nunca "Página X").
export const ROOM_NAMES = Object.freeze({
  room_09_spawn: "Início",
  room_10_credits: "Créditos",
  room_08_orchard_difficulty: "Pomar do Medidor",
  room_07_forest: "Floresta",
  room_05_house: "Casa na Mata",
  room_06_secret_computer: "Área Secreta",
  room_04_city_casino: "Cidade & Casino",
  room_02_casino_gallery: "Galeria do Casino",
  room_03_casino_pool: "Salão de Sinuca",
  room_01_market: "Feira"
});

// Requisitos de markers centralizados (fáceis de ajustar depois).
export const MARKER_GATES = Object.freeze({
  spawnToOrchard: 8,
  orchardToForest: 17,
  forestToCity: 19,
  cityToMarket: 24,
  marketFuture: 30
});

// Lógica genérica de gate (pura, testável).
export function canEnter(exit, save) {
  if (!exit) return false;
  const required = exit.requiredMarkers ?? 0;
  const collected = save.collectedMarkerIds.length;
  if (collected < required) return false;
  if (exit.condition && !save.puzzleStates[exit.condition]) return false;
  return true;
}

// "Colete mais 1 marcador." / "Colete mais 3 marcadores."
export function missingMarkerMessage(exit, save) {
  const required = exit.requiredMarkers ?? 0;
  const missing = required - save.collectedMarkerIds.length;
  if (missing <= 0) return null;
  const noun = missing === 1 ? "marcador" : "marcadores";
  return `Colete mais ${missing} ${noun}.`;
}
