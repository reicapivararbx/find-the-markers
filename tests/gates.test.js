// Testes da lógica de gates (requisitos de markers e mensagens).
import test from "node:test";
import assert from "node:assert/strict";
import { canEnter, missingMarkerMessage, MARKER_GATES } from "../game/config/room-connections.js";

function saveWith(count, extra = {}) {
  return {
    collectedMarkerIds: Array.from({ length: count }, (_, i) => `m${i}`),
    puzzleStates: { redButtonsSolved: false, difficultySolved: false, creditsBoxesSolved: false, ...extra }
  };
}

test("gate livre entra com 0 markers", () => {
  const exit = { to: "room_10_credits", requiredMarkers: 0 };
  assert.equal(canEnter(exit, saveWith(0)), true);
});

test("gate de 8: com 7 bloqueia, com 8 passa", () => {
  const exit = { to: "x", requiredMarkers: 8 };
  assert.equal(canEnter(exit, saveWith(7)), false);
  assert.equal(canEnter(exit, saveWith(8)), true);
});

test("mensagem do gate usa fórmula missing e singular/plural", () => {
  assert.equal(missingMarkerMessage({ requiredMarkers: 8 }, saveWith(5)), "Colete mais 3 marcadores.");
  assert.equal(missingMarkerMessage({ requiredMarkers: 8 }, saveWith(7)), "Colete mais 1 marcador.");
  assert.equal(missingMarkerMessage({ requiredMarkers: 17 }, saveWith(0)), "Colete mais 17 marcadores.");
  assert.equal(missingMarkerMessage({ requiredMarkers: 8 }, saveWith(9)), null);
});

test("gate por condição de puzzle (área secreta)", () => {
  const exit = { to: "room_06_secret_computer", condition: "redButtonsSolved" };
  assert.equal(canEnter(exit, saveWith(0)), false);
  assert.equal(canEnter(exit, saveWith(0, { redButtonsSolved: true })), true);
});

test("gates centrais têm os requisitos do desenho", () => {
  assert.equal(MARKER_GATES.spawnToOrchard, 8);
  assert.equal(MARKER_GATES.orchardToForest, 17);
  assert.equal(MARKER_GATES.forestToCity, 19);
  assert.equal(MARKER_GATES.cityToMarket, 24);
  assert.equal(MARKER_GATES.marketFuture, 30);
});

test("gate futuro de 30 abre (mensagem 'Em breve' é da UI), destino null é tratado", () => {
  const exit = { requiredMarkers: 30, to: null };
  assert.equal(canEnter(exit, saveWith(30)), true);
  assert.equal(canEnter(exit, saveWith(29)), false);
  assert.equal(canEnter(exit, saveWith(0)), false);
  assert.equal(missingMarkerMessage(exit, saveWith(28)), "Colete mais 2 marcadores.");
  assert.equal(missingMarkerMessage(exit, saveWith(30)), null);
});

test("feira future30: abre Jardim (30 markers, room_11_garden, MARKER_GATES.marketFuture)", async () => {
  const { ROOM_CONNECTIONS } = await import("../game/config/room-connections.js");
  const future = ROOM_CONNECTIONS.room_01_market.future30;
  assert.equal(future.requiredMarkers, MARKER_GATES.marketFuture);
  assert.equal(future.requiredMarkers, 30);
  assert.equal(future.to, "room_11_garden");
  assert.equal(future.arriveAt, "from_room_01");
  assert.equal(canEnter(future, saveWith(29)), false);
  assert.equal(canEnter(future, saveWith(30)), true);
});

test("digital stage: exige 5 notas musicais", () => {
  const exit = { to: "secret_digital_stage", requireMusicNotes: 5 };
  assert.equal(canEnter(exit, saveWith(0)), false);
  assert.equal(canEnter(exit, { ...saveWith(0), discoveredMusicNoteIds: ["a", "b", "c", "d"] }), false);
  assert.equal(canEnter(exit, { ...saveWith(0), discoveredMusicNoteIds: ["a", "b", "c", "d", "e"] }), true);
});

test("cidadela: exige 130 markers + 9 selos", () => {
  const exit = { to: "room_20_citadel", requiredMarkers: 130, requireSeals: true };
  assert.equal(canEnter(exit, saveWith(130)), false);
  const seals = Array.from({ length: 9 }, (_, i) => `seal_${i}`);
  assert.equal(canEnter(exit, { ...saveWith(130), areaSeals: seals }), true);
});

test("backtracking feira↔cidade: ida exige 24, volta é livre", async () => {
  const { ROOM_CONNECTIONS } = await import("../game/config/room-connections.js");
  const cityToMarket = ROOM_CONNECTIONS.room_04_city_casino.left;
  const marketToCity = ROOM_CONNECTIONS.room_01_market.right;

  assert.equal(cityToMarket.to, "room_01_market");
  assert.equal(cityToMarket.requiredMarkers, MARKER_GATES.cityToMarket);
  assert.equal(cityToMarket.requiredMarkers, 24);
  assert.equal(cityToMarket.arriveAt, "from_room_04");

  assert.equal(marketToCity.to, "room_04_city_casino");
  assert.equal(marketToCity.requiredMarkers ?? 0, 0);
  assert.equal(marketToCity.arriveAt, "from_room_01");

  // ida bloqueada com 23, liberada com 24
  assert.equal(canEnter(cityToMarket, saveWith(23)), false);
  assert.equal(canEnter(cityToMarket, saveWith(24)), true);
  // volta sempre livre (0 markers)
  assert.equal(canEnter(marketToCity, saveWith(0)), true);
  assert.equal(canEnter(marketToCity, saveWith(24)), true);

  // spawns de chegada existem nas rooms
  const { ROOMS } = await import("../game/rooms/index.js");
  assert.ok(ROOMS.room_01_market.spawns.from_room_04);
  assert.ok(ROOMS.room_04_city_casino.spawns.from_room_01);
});

test("backtracking: idas progressivas têm volta livre (incl. pomar↔floresta e feira↔cidade)", async () => {
  const { ROOM_CONNECTIONS } = await import("../game/config/room-connections.js");
  const forwardPairs = [
    ["room_09_spawn", "left", "room_08_orchard_difficulty"],
    ["room_08_orchard_difficulty", "right", "room_07_forest"],
    ["room_07_forest", "left", "room_04_city_casino"],
    ["room_04_city_casino", "left", "room_01_market"]
  ];
  for (const [from, key, to] of forwardPairs) {
    const forward = ROOM_CONNECTIONS[from][key];
    assert.equal(forward.to, to);
    assert.ok((forward.requiredMarkers ?? 0) > 0, `${from}.${key} deve exigir markers`);
    const returns = Object.values(ROOM_CONNECTIONS[to] || {}).filter(
      (e) => e.to === from && (e.requiredMarkers ?? 0) === 0
    );
    assert.ok(returns.length >= 1, `falta volta livre ${to} → ${from}`);
  }
  // pomar↔floresta explícito
  assert.equal(ROOM_CONNECTIONS.room_07_forest.orchard.to, "room_08_orchard_difficulty");
  assert.equal(ROOM_CONNECTIONS.room_07_forest.orchard.requiredMarkers ?? 0, 0);
  assert.equal(canEnter(ROOM_CONNECTIONS.room_07_forest.orchard, saveWith(0)), true);
});

test("casa na mata: esquerda→pomar, direita→floresta (voltas livres)", async () => {
  const { ROOM_CONNECTIONS } = await import("../game/config/room-connections.js");
  const { ROOMS } = await import("../game/rooms/index.js");

  const forestToHouse = ROOM_CONNECTIONS.room_07_forest.right;
  const houseToOrchard = ROOM_CONNECTIONS.room_05_house.left;
  const houseToForest = ROOM_CONNECTIONS.room_05_house.right;

  assert.equal(forestToHouse.to, "room_05_house");
  assert.equal(forestToHouse.requiredMarkers ?? 0, 0);
  assert.equal(forestToHouse.arriveAt, "from_room_07");

  assert.equal(houseToOrchard.to, "room_08_orchard_difficulty");
  assert.equal(houseToOrchard.requiredMarkers ?? 0, 0);
  assert.equal(houseToOrchard.arriveAt, "from_room_05");

  assert.equal(houseToForest.to, "room_07_forest");
  assert.equal(houseToForest.requiredMarkers ?? 0, 0);
  assert.equal(houseToForest.arriveAt, "from_room_05");

  assert.equal(canEnter(forestToHouse, saveWith(0)), true);
  assert.equal(canEnter(houseToOrchard, saveWith(0)), true);
  assert.equal(canEnter(houseToForest, saveWith(0)), true);

  assert.ok(ROOMS.room_05_house.spawns.from_room_07);
  assert.ok(ROOMS.room_07_forest.spawns.from_room_05);
  assert.ok(ROOMS.room_08_orchard_difficulty.spawns.from_room_05);

  const houseLeftGate = ROOMS.room_05_house.gates.find((g) => g.key === "left");
  const houseRightGate = ROOMS.room_05_house.gates.find((g) => g.key === "right");
  assert.ok(houseLeftGate, "casa precisa de gate left");
  assert.ok(houseRightGate, "casa precisa de gate right");
  assert.ok(houseLeftGate.x < 120, "gate left na borda esquerda");
  assert.ok(houseRightGate.x > 1320, "gate right na borda direita");
});
