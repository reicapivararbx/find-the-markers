import { makeExpansionRoom, makeSecretRoom } from "./expansion-room-factory.js";
import { MultiSwitchPuzzle } from "../puzzles/multi-switch.js";
import { SlotMachine } from "../entities/slot-machine.js";

function switchPositions(count = 3) {
  const xs = [360, 720, 1080, 540, 900];
  return Array.from({ length: count }, (_, i) => ({ x: xs[i], y: 520 }));
}

function wirePuzzle(solveKey, label, count = 3) {
  return (ctx) => {
    if (ctx.sm.save.puzzleStates[solveKey]) return;
    const puzzle = new MultiSwitchPuzzle(ctx.scene, {
      id: solveKey,
      positions: switchPositions(count),
      solveKey,
      saveManager: ctx.sm,
      hud: ctx.hud,
      label,
      required: count
    });
    ctx.addUpdatable(puzzle);
  };
}

export const room_11_garden = makeExpansionRoom({
  id: "room_11_garden",
  theme: "garden",
  sealId: "seal_garden",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_01: { x: 200, y: 600 },
    from_room_12: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  }
});

export const room_12_harbor = makeExpansionRoom({
  id: "room_12_harbor",
  theme: "harbor",
  sealId: "seal_harbor",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_11: { x: 200, y: 600 },
    from_room_13: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  },
  wireExtra: wirePuzzle("valvesSolved", "válvula", 3)
});

export const room_13_factory = makeExpansionRoom({
  id: "room_13_factory",
  theme: "factory",
  sealId: "seal_factory",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_12: { x: 200, y: 600 },
    from_room_14: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  }
});

export const room_14_mine = makeExpansionRoom({
  id: "room_14_mine",
  theme: "mine",
  sealId: "seal_mine",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_13: { x: 200, y: 600 },
    from_room_15: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  },
  wireExtra: wirePuzzle("batteriesSolved", "bateria", 3)
});

export const room_15_lab = makeExpansionRoom({
  id: "room_15_lab",
  theme: "lab",
  sealId: "seal_lab",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_14: { x: 200, y: 600 },
    from_room_16: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  },
  wireExtra: wirePuzzle("runesSolved", "runa", 3)
});

export const room_16_ruins = makeExpansionRoom({
  id: "room_16_ruins",
  theme: "ruins",
  sealId: "seal_ruins",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_15: { x: 200, y: 600 },
    from_room_17: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  }
});

export const room_17_peak = makeExpansionRoom({
  id: "room_17_peak",
  theme: "peak",
  sealId: "seal_peak",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_16: { x: 200, y: 600 },
    from_room_18: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  },
  wireExtra: wirePuzzle("fragmentsSolved", "fragmento", 4)
});

export const room_18_vault = makeExpansionRoom({
  id: "room_18_vault",
  theme: "vault",
  interior: true,
  sealId: "seal_vault",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_17: { x: 200, y: 600 },
    from_room_19: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  },
  wireExtra: wirePuzzle("firewallSolved", "nó do firewall", 3)
});

export const room_19_citadel_gate = makeExpansionRoom({
  id: "room_19_citadel_gate",
  theme: "citadel",
  sealId: "seal_citadel_gate",
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_18: { x: 200, y: 600 },
    from_room_20: { x: 1280, y: 600 },
    from_secret: { x: 720, y: 500 }
  }
});

export const room_20_citadel = makeExpansionRoom({
  id: "room_20_citadel",
  theme: "citadel",
  interior: true,
  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "secret", x: 720, arrowY: 280, zone: { x: 680, y: 200, width: 80, height: 120 } },
    { key: "backrooms", x: 200, arrowY: 300, zone: { x: 160, y: 220, width: 80, height: 120 } },
    { key: "developer", x: 1240, arrowY: 300, zone: { x: 1200, y: 220, width: 80, height: 120 } }
  ],
  spawns: {
    default: { x: 200, y: 600 },
    from_room_19: { x: 200, y: 600 },
    from_secret: { x: 720, y: 500 },
    from_backrooms: { x: 280, y: 500 },
    from_developer: { x: 1160, y: 500 }
  }
});

export const secret_11_greenhouse = makeSecretRoom({
  id: "secret_11_greenhouse",
  parentRoom: "room_11_garden"
});
export const secret_12_lighthouse = makeSecretRoom({
  id: "secret_12_lighthouse",
  parentRoom: "room_12_harbor"
});
export const secret_13_boiler = makeSecretRoom({
  id: "secret_13_boiler",
  parentRoom: "room_13_factory"
});
export const secret_14_crystal = makeSecretRoom({
  id: "secret_14_crystal",
  parentRoom: "room_14_mine"
});
export const secret_15_server = makeSecretRoom({
  id: "secret_15_server",
  parentRoom: "room_15_lab"
});
export const secret_16_tomb = makeSecretRoom({
  id: "secret_16_tomb",
  parentRoom: "room_16_ruins"
});
export const secret_17_observatory = makeSecretRoom({
  id: "secret_17_observatory",
  parentRoom: "room_17_peak"
});
export const secret_18_safe = makeSecretRoom({
  id: "secret_18_safe",
  parentRoom: "room_18_vault"
});
export const secret_19_armory = makeSecretRoom({
  id: "secret_19_armory",
  parentRoom: "room_19_citadel_gate"
});
export const secret_20_throne = makeSecretRoom({
  id: "secret_20_throne",
  parentRoom: "room_20_citadel"
});
export const secret_backrooms = makeSecretRoom({
  id: "secret_backrooms",
  parentRoom: "room_20_citadel"
});
export const secret_developer = makeSecretRoom({
  id: "secret_developer",
  parentRoom: "room_20_citadel"
});

export { SlotMachine };
