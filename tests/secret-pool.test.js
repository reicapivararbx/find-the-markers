// Sala secreta do salão: porta 321123 ≠ capivara 234567, Observador, save, marker.
import test from "node:test";
import assert from "node:assert/strict";
import {
  POOL_HALL_DOOR_CODE,
  CAPYBARA_CODE,
  SHADOW_WATCHER,
  SECRET_POOL
} from "../game/config/puzzle-config.js";
import { SaveManager, createDefaultSave, migrateSave } from "../game/save/save-manager.js";
import { isCollectible, lockedReason, MARKER_BY_ID } from "../game/config/marker-registry.js";
import { ROOMS } from "../game/rooms/index.js";
import { ROOM_CONNECTIONS, ROOM_NAMES } from "../game/config/room-connections.js";

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

test("dois códigos DISTINTOS — porta ≠ capivara", () => {
  assert.equal(POOL_HALL_DOOR_CODE, "321123");
  assert.equal(CAPYBARA_CODE, "234567");
  assert.notEqual(POOL_HALL_DOOR_CODE, CAPYBARA_CODE);
  assert.equal(POOL_HALL_DOOR_CODE.length, 6);
  assert.equal(CAPYBARA_CODE.length, 6);
});

test("CAPYBARA_CODE = fragmentos 23+45+67 do Observador", () => {
  assert.deepEqual([...SHADOW_WATCHER.fragments], ["23", "45", "67"]);
  assert.equal(SHADOW_WATCHER.fragments.join(""), CAPYBARA_CODE);
  assert.equal(SHADOW_WATCHER.positions.length, 3);
  assert.equal(SHADOW_WATCHER.displayMs, 2000);
});

test("cross-code: código da porta NÃO é o da capivara e vice-versa", () => {
  assert.notEqual(POOL_HALL_DOOR_CODE, CAPYBARA_CODE);
  assert.notEqual(POOL_HALL_DOOR_CODE, SHADOW_WATCHER.fragments.join(""));
  assert.equal(CAPYBARA_CODE, "23" + "45" + "67");
});

test("SECRET_POOL layout e room id", () => {
  assert.equal(SECRET_POOL.roomId, "secret_pool_room");
  assert.ok(SECRET_POOL.capybara.x > 0);
  assert.ok(SECRET_POOL.markerSpawn.x > 0);
  assert.ok(SECRET_POOL.whiteDoor.x > 0);
});

test("sala secret_pool_room registrada com spawns e saída livre", () => {
  assert.ok(ROOMS.secret_pool_room);
  assert.ok(ROOMS.secret_pool_room.spawns.from_room_03);
  assert.ok(ROOMS.secret_pool_room.spawns.default);
  assert.ok(ROOM_CONNECTIONS.secret_pool_room.exit);
  assert.equal(ROOM_CONNECTIONS.secret_pool_room.exit.to, "room_03_casino_pool");
  assert.equal(ROOM_CONNECTIONS.secret_pool_room.exit.requiredMarkers ?? 0, 0);
  assert.equal(ROOM_NAMES.secret_pool_room, "Sala das Sombras");
});

test("conexão porta branca room_03 -> secret_pool_room", () => {
  const conn = ROOM_CONNECTIONS.room_03_casino_pool.secretPool;
  assert.ok(conn);
  assert.equal(conn.to, "secret_pool_room");
  assert.equal(conn.condition, "E");
  assert.ok(ROOMS.room_03_casino_pool.spawns.from_secret_pool);
});

test("save defaults: flags da sala secreta false/0", () => {
  const d = createDefaultSave();
  assert.equal(d.puzzleStates.poolHallDoorUnlocked, false);
  assert.equal(d.puzzleStates.shadowWatcherStarted, false);
  assert.equal(d.puzzleStates.shadowWatcherFragments, 0);
  assert.equal(d.puzzleStates.shadowWatcherSolved, false);
  assert.equal(d.puzzleStates.mysteriousCapybaraSolved, false);
  assert.equal(d.puzzleStates.capybaraCodeMarkerUnlocked, false);
  assert.equal(d.puzzleStates.capybaraCodeMarkerCollected, false);
});

test("unlockPoolHallDoor desbloqueia sala e persiste", () => {
  const storage = new MemoryStorage();
  const a = new SaveManager(storage);
  a.load();
  assert.equal(a.unlockPoolHallDoor(), true);
  assert.equal(a.unlockPoolHallDoor(), false);
  assert.equal(a.save.puzzleStates.poolHallDoorUnlocked, true);
  assert.ok(a.save.unlockedRooms.includes("secret_pool_room"));

  const b = new SaveManager(storage);
  b.load();
  assert.equal(b.save.puzzleStates.poolHallDoorUnlocked, true);
  assert.ok(b.save.unlockedRooms.includes("secret_pool_room"));
});

test("setShadowWatcherFragments: 1→2→3 resolve e clamp", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  assert.equal(manager.setShadowWatcherFragments(1), 1);
  assert.equal(manager.save.puzzleStates.shadowWatcherFragments, 1);
  assert.equal(manager.save.puzzleStates.shadowWatcherStarted, true);
  assert.equal(manager.save.puzzleStates.shadowWatcherSolved, false);

  manager.setShadowWatcherFragments(2);
  assert.equal(manager.save.puzzleStates.shadowWatcherSolved, false);

  manager.setShadowWatcherFragments(3);
  assert.equal(manager.save.puzzleStates.shadowWatcherFragments, 3);
  assert.equal(manager.save.puzzleStates.shadowWatcherSolved, true);

  assert.equal(manager.setShadowWatcherFragments(99), 3);
  assert.equal(manager.setShadowWatcherFragments(-1), 0);
});

test("unlockCapybaraCodeMarker + collect gate", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  const def = MARKER_BY_ID.capybara_code_marker;
  assert.equal(isCollectible(def, manager.save), false);
  assert.equal(lockedReason(def, manager.save), "Pergunte à Capivara Misteriosa.");

  assert.equal(manager.unlockCapybaraCodeMarker(), true);
  assert.equal(manager.save.puzzleStates.mysteriousCapybaraSolved, true);
  assert.equal(manager.save.puzzleStates.capybaraCodeMarkerUnlocked, true);
  assert.equal(isCollectible(def, manager.save), true);

  manager.markCapybaraCodeMarkerCollected();
  manager.collectMarker("capybara_code_marker");
  assert.equal(manager.save.puzzleStates.capybaraCodeMarkerCollected, true);
  assert.equal(isCollectible(def, manager.save), false);
});

test("migrate: shadowWatcherFragments clamp e unlockedRooms", () => {
  const m = migrateSave({
    puzzleStates: {
      poolHallDoorUnlocked: true,
      shadowWatcherFragments: 99,
      shadowWatcherSolved: false
    }
  });
  assert.equal(m.puzzleStates.shadowWatcherFragments, 3);
  assert.equal(m.puzzleStates.shadowWatcherStarted, true);
  assert.ok(m.unlockedRooms.includes("secret_pool_room"));

  const solved = migrateSave({
    puzzleStates: { shadowWatcherSolved: true, shadowWatcherFragments: 1 }
  });
  assert.equal(solved.puzzleStates.shadowWatcherFragments, 3);
  assert.equal(solved.puzzleStates.shadowWatcherStarted, true);

  const collected = migrateSave({
    collectedMarkerIds: ["capybara_code_marker"]
  });
  assert.equal(collected.puzzleStates.capybaraCodeMarkerCollected, true);
  assert.equal(collected.puzzleStates.capybaraCodeMarkerUnlocked, true);
  assert.equal(collected.puzzleStates.mysteriousCapybaraSolved, true);
});

test("código da porta NÃO desbloqueia marker da capivara", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  manager.unlockPoolHallDoor();
  const def = MARKER_BY_ID.capybara_code_marker;
  assert.equal(isCollectible(def, manager.save), false);
  assert.equal(manager.save.puzzleStates.capybaraCodeMarkerUnlocked, false);
});

test("código da capivara NÃO desbloqueia porta (flags independentes)", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  manager.unlockCapybaraCodeMarker();
  assert.equal(manager.save.puzzleStates.poolHallDoorUnlocked, false);
  assert.equal(manager.save.puzzleStates.mysteriousCapybaraSolved, true);
});
