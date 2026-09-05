// Conexões entre áreas — ÚNICA fonte de verdade para progressão/gates.
// requiredMarkers: 0 ou ausente = passagem livre.
// condition: nome de um puzzleState que precisa ser true.
// requireSeals: true = precisa de todos os 9 areaSeals.
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
    casino: { to: "room_02_casino_gallery", requiredMarkers: 0, interaction: "E", arriveAt: "from_casino_door" },
    digitalStage: {
      to: "secret_digital_stage",
      requiredMarkers: 0,
      condition: "E",
      requireMusicNotes: 5,
      arriveAt: "from_room_04"
    }
  },

  secret_digital_stage: {
    exit: { to: "room_04_city_casino", requiredMarkers: 0, arriveAt: "from_digital_stage" }
  },

  room_01_market: {
    right: { to: "room_04_city_casino", requiredMarkers: 0, arriveAt: "from_room_01" },
    future30: { to: "room_11_garden", requiredMarkers: 30, arriveAt: "from_room_01" }
  },

  room_02_casino_gallery: {
    next: { to: "room_03_casino_pool", requiredMarkers: 0, arriveAt: "from_room_02" },
    exitCasino: { to: "room_04_city_casino", requiredMarkers: 0, interaction: "E", arriveAt: "outside_casino" }
  },

  room_03_casino_pool: {
    back: { to: "room_02_casino_gallery", requiredMarkers: 0, arriveAt: "from_room_03" },
    secretPool: {
      to: "secret_pool_room",
      requiredMarkers: 0,
      condition: "E",
      arriveAt: "from_room_03"
    }
  },

  secret_pool_room: {
    exit: { to: "room_03_casino_pool", requiredMarkers: 0, arriveAt: "from_secret_pool" }
  },

  room_11_garden: {
    left: { to: "room_01_market", requiredMarkers: 0, arriveAt: "from_room_11" },
    right: { to: "room_12_harbor", requiredMarkers: 40, arriveAt: "from_room_11" },
    secret: { to: "secret_11_greenhouse", requiredMarkers: 0, arriveAt: "from_room_11" }
  },

  secret_11_greenhouse: {
    exit: { to: "room_11_garden", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_12_harbor: {
    left: { to: "room_11_garden", requiredMarkers: 0, arriveAt: "from_room_12" },
    right: { to: "room_13_factory", requiredMarkers: 50, condition: "valvesSolved", arriveAt: "from_room_12" },
    secret: { to: "secret_12_lighthouse", requiredMarkers: 0, arriveAt: "from_room_12" }
  },

  secret_12_lighthouse: {
    exit: { to: "room_12_harbor", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_13_factory: {
    left: { to: "room_12_harbor", requiredMarkers: 0, arriveAt: "from_room_13" },
    right: { to: "room_14_mine", requiredMarkers: 60, arriveAt: "from_room_13" },
    secret: { to: "secret_13_boiler", requiredMarkers: 0, arriveAt: "from_room_13" }
  },

  secret_13_boiler: {
    exit: { to: "room_13_factory", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_14_mine: {
    left: { to: "room_13_factory", requiredMarkers: 0, arriveAt: "from_room_14" },
    right: { to: "room_15_lab", requiredMarkers: 70, condition: "batteriesSolved", arriveAt: "from_room_14" },
    secret: { to: "secret_14_crystal", requiredMarkers: 0, arriveAt: "from_room_14" }
  },

  secret_14_crystal: {
    exit: { to: "room_14_mine", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_15_lab: {
    left: { to: "room_14_mine", requiredMarkers: 0, arriveAt: "from_room_15" },
    right: { to: "room_16_ruins", requiredMarkers: 80, condition: "runesSolved", arriveAt: "from_room_15" },
    secret: { to: "secret_15_server", requiredMarkers: 0, arriveAt: "from_room_15" }
  },

  secret_15_server: {
    exit: { to: "room_15_lab", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_16_ruins: {
    left: { to: "room_15_lab", requiredMarkers: 0, arriveAt: "from_room_16" },
    right: { to: "room_17_peak", requiredMarkers: 90, arriveAt: "from_room_16" },
    secret: { to: "secret_16_tomb", requiredMarkers: 0, arriveAt: "from_room_16" }
  },

  secret_16_tomb: {
    exit: { to: "room_16_ruins", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_17_peak: {
    left: { to: "room_16_ruins", requiredMarkers: 0, arriveAt: "from_room_17" },
    right: { to: "room_18_vault", requiredMarkers: 100, condition: "fragmentsSolved", arriveAt: "from_room_17" },
    secret: { to: "secret_17_observatory", requiredMarkers: 0, arriveAt: "from_room_17" }
  },

  secret_17_observatory: {
    exit: { to: "room_17_peak", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_18_vault: {
    left: { to: "room_17_peak", requiredMarkers: 0, arriveAt: "from_room_18" },
    right: { to: "room_19_citadel_gate", requiredMarkers: 115, condition: "firewallSolved", arriveAt: "from_room_18" },
    secret: { to: "secret_18_safe", requiredMarkers: 0, arriveAt: "from_room_18" }
  },

  secret_18_safe: {
    exit: { to: "room_18_vault", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_19_citadel_gate: {
    left: { to: "room_18_vault", requiredMarkers: 0, arriveAt: "from_room_19" },
    right: { to: "room_20_citadel", requiredMarkers: 130, requireSeals: true, arriveAt: "from_room_19" },
    secret: { to: "secret_19_armory", requiredMarkers: 0, arriveAt: "from_room_19" }
  },

  secret_19_armory: {
    exit: { to: "room_19_citadel_gate", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  room_20_citadel: {
    left: { to: "room_19_citadel_gate", requiredMarkers: 0, arriveAt: "from_room_20" },
    secret: { to: "secret_20_throne", requiredMarkers: 0, arriveAt: "from_room_20" },
    backrooms: { to: "secret_backrooms", requiredMarkers: 0, arriveAt: "from_citadel" },
    developer: { to: "secret_developer", requiredMarkers: 0, arriveAt: "from_citadel" }
  },

  secret_20_throne: {
    exit: { to: "room_20_citadel", requiredMarkers: 0, arriveAt: "from_secret" }
  },

  secret_backrooms: {
    exit: { to: "room_20_citadel", requiredMarkers: 0, arriveAt: "from_backrooms" }
  },

  secret_developer: {
    exit: { to: "room_20_citadel", requiredMarkers: 0, arriveAt: "from_developer" }
  }
});

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
  room_01_market: "Feira",
  secret_digital_stage: "Digital Stage",
  secret_pool_room: "Sala das Sombras",
  room_11_garden: "Jardim Suspenso",
  room_12_harbor: "Porto das Válvulas",
  room_13_factory: "Fábrica Enferrujada",
  room_14_mine: "Mina das Baterias",
  room_15_lab: "Laboratório de Runas",
  room_16_ruins: "Ruínas Antigas",
  room_17_peak: "Pico dos Fragmentos",
  room_18_vault: "Cofre Firewall",
  room_19_citadel_gate: "Portão da Cidadela",
  room_20_citadel: "Cidadela Final",
  secret_11_greenhouse: "Estufa Secreta",
  secret_12_lighthouse: "Farol Secreto",
  secret_13_boiler: "Sala da Caldeira",
  secret_14_crystal: "Caverna de Cristal",
  secret_15_server: "Sala de Servidores",
  secret_16_tomb: "Tumba Esquecida",
  secret_17_observatory: "Observatório",
  secret_18_safe: "Cofre Interior",
  secret_19_armory: "Armaria",
  secret_20_throne: "Trono Secreto",
  secret_backrooms: "Backrooms",
  secret_developer: "Sala do Desenvolvedor"
});

export const MARKER_GATES = Object.freeze({
  spawnToOrchard: 8,
  orchardToForest: 17,
  forestToCity: 19,
  cityToMarket: 24,
  marketFuture: 30,
  gardenToHarbor: 40,
  harborToFactory: 50,
  factoryToMine: 60,
  mineToLab: 70,
  labToRuins: 80,
  ruinsToPeak: 90,
  peakToVault: 100,
  vaultToCitadelGate: 115,
  citadelGateToCitadel: 130
});

export function canEnter(exit, save) {
  if (!exit) return false;
  const required = exit.requiredMarkers ?? 0;
  const collected = save.collectedMarkerIds.length;
  if (collected < required) return false;
  if (exit.condition && exit.condition !== "E" && !save.puzzleStates[exit.condition]) return false;
  if (exit.requireSeals) {
    const seals = save.areaSeals || [];
    if (seals.length < 9) return false;
  }
  if (exit.requireMusicNotes) {
    const notes = save.discoveredMusicNoteIds || [];
    if (notes.length < exit.requireMusicNotes) return false;
  }
  return true;
}

export function missingMarkerMessage(exit, save) {
  const required = exit.requiredMarkers ?? 0;
  const missing = required - save.collectedMarkerIds.length;
  if (missing <= 0) return null;
  const noun = missing === 1 ? "marcador" : "marcadores";
  return `Colete mais ${missing} ${noun}.`;
}

export function blockedReason(exit, save) {
  if (!exit) return "Passagem bloqueada.";
  const markerMsg = missingMarkerMessage(exit, save);
  if (markerMsg) return markerMsg;
  if (exit.condition && exit.condition !== "E" && !save.puzzleStates[exit.condition]) {
    const labels = {
      valvesSolved: "Abra as 3 válvulas do porto.",
      batteriesSolved: "Ative as 3 baterias da mina.",
      runesSolved: "Alinhe as runas do laboratório.",
      fragmentsSolved: "Reúna os 4 fragmentos do pico.",
      firewallSolved: "Desative o firewall do cofre.",
      redButtonsSolved: "Resolva o puzzle dos botões vermelhos.",
      mikuPuzzleSolved: "Acerte o ritmo no Digital Stage."
    };
    return labels[exit.condition] || "Volte quando tiver resolvido o puzzle.";
  }
  if (exit.requireMusicNotes) {
    const have = (save.discoveredMusicNoteIds || []).length;
    if (have < exit.requireMusicNotes) {
      return `Encontre as 5 notas musicais (${have}/5).`;
    }
  }
  if (exit.requireSeals) {
    const have = (save.areaSeals || []).length;
    if (have < 9) return `Reúna os 9 selos (${have}/9).`;
  }
  return null;
}
