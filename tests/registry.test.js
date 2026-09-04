// Testes do registro de markers: IDs únicos, dificuldades válidas,
// sequência do medidor = dificuldades dos 10 primeiros, salas válidas.
import test from "node:test";
import assert from "node:assert/strict";
import { MARKERS, MARKER_BY_ID, TOTAL_MARKERS, markersForRoom } from "../game/config/marker-registry.js";
import { DIFFICULTY_SEQUENCE } from "../game/config/puzzle-config.js";
import { METER_ROWS, DIFFICULTY_COLORS } from "../game/config/difficulty-metadata.js";
import { ROOMS } from "../game/rooms/index.js";
import { ROOM_CONNECTIONS } from "../game/config/room-connections.js";

test("todos os IDs são únicos", () => {
  const ids = MARKERS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("total de markers é pelo menos 30 (gate futuro precisa ser alcançável)", () => {
  assert.ok(TOTAL_MARKERS >= 30, `total = ${TOTAL_MARKERS}`);
  assert.equal(TOTAL_MARKERS, MARKERS.length);
});

test("as dificuldades dos 10 primeiros = sequência EXATA do medidor", () => {
  const first10 = MARKERS.slice(0, 10).map((m) => m.difficulty);
  assert.deepEqual(first10, [...DIFFICULTY_SEQUENCE]);
  assert.deepEqual(DIFFICULTY_SEQUENCE, [
    "Effortless",
    "Easy",
    "Medium",
    "Why",
    "Hard",
    "Hard",
    "Easy",
    "Easy",
    "Medium",
    "Hard"
  ]);
});

test("todas as dificuldades usadas existem no medidor e têm cor", () => {
  MARKERS.forEach((m) => {
    assert.ok(METER_ROWS.includes(m.difficulty), `dificuldade inválida: ${m.difficulty}`);
    assert.ok(DIFFICULTY_COLORS[m.difficulty], `sem cor: ${m.difficulty}`);
  });
});

test("markers apontam para salas existentes e posições dentro da tela", () => {
  MARKERS.forEach((m) => {
    assert.ok(ROOMS[m.room], `sala inexistente: ${m.room}`);
    assert.ok(m.x >= 0 && m.x <= 1440, `x fora da tela: ${m.id}`);
    assert.ok(m.y >= 0 && m.y <= 810, `y fora da tela: ${m.id}`);
    assert.ok(
      ["touch", "hidden", "quest", "puzzle", "slot", "miku", "menu_champion"].includes(m.mode),
      `modo inválido: ${m.mode}`
    );
  });
});

test("markers especiais existem com o modo certo", () => {
  assert.equal(MARKER_BY_ID.credits_box_marker.mode, "hidden");
  assert.equal(MARKER_BY_ID.credits_box_marker.name, "This is not a marker");
  assert.equal(MARKER_BY_ID.forest_egg_demon.mode, "quest");
  assert.equal(MARKER_BY_ID.orchard_difficulty_final.mode, "puzzle");
  assert.equal(MARKER_BY_ID.credits_box_marker.difficulty, "Hard");
  assert.equal(MARKER_BY_ID.hatsune_miku_marker.mode, "miku");
  assert.equal(MARKER_BY_ID.hatsune_miku_marker.room, "secret_digital_stage");
  assert.equal(MARKER_BY_ID.jackpot_marker.mode, "slot");
  assert.equal(MARKER_BY_ID.menu_champion_marker.mode, "menu_champion");
  assert.equal(MARKER_BY_ID.menu_champion_marker.name, "Menu Champion Marker");
  assert.equal(MARKER_BY_ID.menu_champion_marker.difficulty, "Champion");
  assert.equal(MARKER_BY_ID.menu_champion_marker.room, "room_09_spawn");
  assert.ok(TOTAL_MARKERS >= 140, `expansão deve ter 140+ markers, got ${TOTAL_MARKERS}`);
});

test("cada sala da conexão existe e tem spawns", () => {
  for (const [roomId, exits] of Object.entries(ROOM_CONNECTIONS)) {
    assert.ok(ROOMS[roomId], `sala sem módulo: ${roomId}`);
    for (const [key, exit] of Object.entries(exits)) {
      if (exit.to) {
        assert.ok(ROOMS[exit.to], `destino inexistente: ${roomId}.${key} -> ${exit.to}`);
        assert.ok(ROOMS[exit.to].spawns[exit.arriveAt], `spawn ausente: ${exit.to}.${exit.arriveAt}`);
      }
    }
    assert.ok(ROOMS[roomId].spawns.default, `spawn default ausente: ${roomId}`);
  }
});

test("todas as salas têm gate de retorno quando recebem conexão", () => {
  // nenhuma sala pode ser uma armadilha de sentido único
  const reachable = new Set();
  const walk = (roomId) => {
    if (reachable.has(roomId)) return;
    reachable.add(roomId);
    Object.values(ROOM_CONNECTIONS[roomId] || {}).forEach((exit) => {
      if (exit.to) walk(exit.to);
    });
  };
  walk("room_09_spawn");
  ["room_01_market", "room_10_credits", "room_05_house", "room_06_secret_computer"].forEach((roomId) => {
    assert.ok(reachable.has(roomId), `sala inalcançável ou sem volta: ${roomId}`);
  });
});

test("cada sala com markers tem seus próprios markers registrados", () => {
  for (const roomId of Object.keys(ROOMS)) {
    const inRoom = markersForRoom(roomId);
    inRoom.forEach((m) => assert.equal(m.room, roomId));
  }
});

function assertOrganicArea(roomId, expectedStyles) {
  const markers = markersForRoom(roomId).filter((m) => m.mode === "touch");
  assert.equal(markers.length, 10);
  const styles = markers.map((m) => m.style);
  assert.equal(new Set(styles).size, 10, `${roomId}: silhuetas únicas`);
  assert.deepEqual(styles, expectedStyles);
  const xs = markers.map((m) => m.x);
  const ys = markers.map((m) => m.y);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 400, `${roomId}: layout X orgânico`);
  assert.ok(Math.max(...ys) - Math.min(...ys) > 200, `${roomId}: layout Y orgânico`);
}

test("Jardim: 10 markers com silhuetas únicas e layout orgânico", () => {
  assertOrganicArea("room_11_garden", [
    "moss",
    "vine",
    "bloom",
    "trellis",
    "pond",
    "bee",
    "lantern",
    "root",
    "petal",
    "greenhouse"
  ]);
});

test("Porto/Fábrica/Minas: silhuetas únicas e layout orgânico", () => {
  assertOrganicArea("room_12_harbor", [
    "anchor",
    "buoy",
    "crane",
    "dock",
    "foghorn",
    "net",
    "pier",
    "rope",
    "sail",
    "tide"
  ]);
  assertOrganicArea("room_13_factory", [
    "bolt",
    "cog",
    "conveyor",
    "gear",
    "oil",
    "pipe",
    "press",
    "rust",
    "smokestack",
    "wrench"
  ]);
  assertOrganicArea("room_14_mine", [
    "cart",
    "coal",
    "crystal",
    "dynamite",
    "helmet",
    "lantern",
    "ore",
    "pickaxe",
    "rail",
    "shaft"
  ]);
});

test("Lab/Ruínas/Pico/Cofre/Cidadela: silhuetas únicas e layout orgânico", () => {
  assertOrganicArea("room_15_lab", [
    "beaker",
    "circuit",
    "clone",
    "laser",
    "microscope",
    "petri",
    "plasma",
    "sample",
    "scope",
    "testtube"
  ]);
  assertOrganicArea("room_16_ruins", [
    "arch",
    "column",
    "glyph",
    "idol",
    "mosaic",
    "obelisk",
    "relic",
    "sand",
    "scroll",
    "statue"
  ]);
  assertOrganicArea("room_17_peak", [
    "avalanche",
    "cliff",
    "flag",
    "frost",
    "glacier",
    "ice",
    "summit",
    "wind",
    "yeti",
    "zenith"
  ]);
  assertOrganicArea("room_18_vault", [
    "barcode",
    "cipher",
    "goldbar",
    "keycard",
    "ledger",
    "lockbox",
    "safe",
    "sealstamp",
    "vaultdoor",
    "wire"
  ]);
  assertOrganicArea("room_19_citadel_gate", [
    "banner",
    "barricade",
    "drawbridge",
    "guard",
    "herald",
    "moat",
    "portcullis",
    "rampart",
    "shield",
    "watchtower"
  ]);
  assertOrganicArea("room_20_citadel", [
    "crown",
    "throne",
    "scepter",
    "banner_royal",
    "knight",
    "oracle",
    "spire",
    "legacy",
    "finale",
    "champion"
  ]);
});
