// Testes do SaveManager: defaults, merge defensivo, coleta sem duplicação,
// puzzles, caixas e reset.
import test from "node:test";
import assert from "node:assert/strict";
import { SaveManager, createDefaultSave, migrateSave } from "../game/save/save-manager.js";

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

test("save novo: spawn com 0 markers e puzzles não resolvidos", () => {
  const save = new SaveManager(new MemoryStorage()).load();
  assert.equal(save.currentRoom, "room_09_spawn");
  assert.equal(save.collectedMarkerIds.length, 0);
  assert.equal(save.puzzleStates.redButtonsSolved, false);
  assert.equal(save.discoveredEggIds.length, 0);
});

test("collectMarker não duplica e contador é derivado", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  assert.equal(manager.collectMarker("spawn_easy"), true);
  assert.equal(manager.collectMarker("spawn_easy"), false);
  assert.equal(manager.markerCount, 1);
  manager.collectMarker("credits_box_marker");
  assert.equal(manager.markerCount, 2);
  assert.deepEqual(manager.save.collectedMarkerIds, ["spawn_easy", "credits_box_marker"]);
});

test("persistência sobrevive a reload (novo manager, mesmo storage)", () => {
  const storage = new MemoryStorage();
  const a = new SaveManager(storage);
  a.load();
  a.collectMarker("forest_egg_demon");
  a.solvePuzzle("redButtonsSolved");
  a.setCurrentRoom("room_07_forest");

  const b = new SaveManager(storage);
  b.load();
  assert.equal(b.markerCount, 1);
  assert.equal(b.save.puzzleStates.redButtonsSolved, true);
  assert.equal(b.save.currentRoom, "room_07_forest");
  // desbloqueio da área 6 é permanente
  assert.ok(b.save.unlockedRooms.includes("room_06_secret_computer"));
});

test("loader defensivo: JSON corrompido não destrói o jogo", () => {
  const storage = new MemoryStorage();
  storage.setItem("find-the-markers-reuters-mix-save", "{isso não é json");
  const manager = new SaveManager(storage);
  const save = manager.load();
  assert.equal(save.currentRoom, "room_09_spawn");
});

test("migrate: campos ausentes viram defaults, versão normalizada", () => {
  const migrated = migrateSave({ collectedMarkerIds: ["a", "a", "b"], currentRoom: "room_01_market" });
  assert.deepEqual(migrated.collectedMarkerIds, ["a", "b"]);
  assert.equal(migrated.currentRoom, "room_01_market");
  assert.equal(migrated.version, 2);
  assert.equal(migrated.settings.sound, true);
  assert.deepEqual(migrated.puzzleStates, createDefaultSave().puzzleStates);
  assert.equal(migrated.coins, 0);
  assert.deepEqual(migrated.discoveredMusicNoteIds, []);
  assert.equal(migrated.mikuMarkerUnlocked, false);
  assert.deepEqual(migrated.slot, createDefaultSave().slot);
});

test("miku: notas e unlock do marker", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  assert.equal(manager.discoverMusicNote("music_note_1"), true);
  assert.equal(manager.discoverMusicNote("music_note_1"), false);
  assert.equal(manager.save.discoveredMusicNoteIds.length, 1);
  manager.unlockMikuMarker();
  assert.equal(manager.save.mikuMarkerUnlocked, true);
  assert.equal(manager.save.puzzleStates.mikuPuzzleSolved, true);
});

test("playerCharacter: null no save novo; set male/female persiste e não apaga progresso", () => {
  const storage = new MemoryStorage();
  const manager = new SaveManager(storage);
  manager.load();
  assert.equal(manager.save.playerCharacter, null);
  assert.equal(manager.hasPlayerCharacter(), false);
  assert.equal(manager.setPlayerCharacter("alien"), false);
  assert.equal(manager.setPlayerCharacter("male"), true);
  assert.equal(manager.save.playerCharacter, "male");
  assert.equal(manager.hasPlayerCharacter(), true);

  manager.collectMarker("some_marker");
  manager.addCoins(5);
  assert.equal(manager.setPlayerCharacter("female"), true);
  assert.equal(manager.save.playerCharacter, "female");
  assert.equal(manager.markerCount, 1);
  assert.equal(manager.save.coins, 5);

  const reloaded = new SaveManager(storage);
  reloaded.load();
  assert.equal(reloaded.save.playerCharacter, "female");
  assert.equal(reloaded.markerCount, 1);
});

test("caixas: duas abertas resolvem creditsBoxesSolved (sem ordem secreta)", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  manager.openBox("box_right");
  assert.equal(manager.save.puzzleStates.creditsBoxesSolved, false);
  manager.openBox("box_left");
  assert.equal(manager.save.puzzleStates.creditsBoxesSolved, true);
});

test("ovos persistem individualmente", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  ["egg_01", "egg_02", "egg_03", "egg_04"].forEach((egg) => manager.discoverEgg(egg));
  assert.equal(manager.save.discoveredEggIds.length, 4);
  manager.discoverEgg("egg_01");
  assert.equal(manager.save.discoveredEggIds.length, 4);
  manager.discoverEgg("egg_05");
  assert.equal(manager.save.discoveredEggIds.length, 5);
});

test("reset volta ao padrão", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  manager.collectMarker("spawn_easy");
  manager.reset();
  assert.equal(manager.markerCount, 0);
  assert.equal(manager.save.currentRoom, "room_09_spawn");
});

test("hasProgress detecta progresso real", () => {
  const manager = new SaveManager(new MemoryStorage());
  manager.load();
  assert.equal(manager.hasProgress(), false);
  manager.collectMarker("spawn_easy");
  assert.equal(manager.hasProgress(), true);
});
