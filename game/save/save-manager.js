// Persistência versionada em localStorage, com storage injetável (testes).
import { SAVE_STORAGE_KEY, SAVE_VERSION } from "../config/game-config.js";
import { bus, Events } from "../core/event-bus.js";

export function createDefaultSave() {
  return {
    version: SAVE_VERSION,
    currentRoom: "room_09_spawn",
    collectedMarkerIds: [],
    discoveredEggIds: [],
    puzzleStates: {
      redButtonsSolved: false,
      difficultySolved: false,
      creditsBoxesSolved: false
    },
    openedBoxes: [],
    unlockedRooms: [],
    settings: {
      sound: true
    }
  };
}

// Loader defensivo: campos ausentes viram defaults; versões futuras não quebram o save.
export function migrateSave(raw) {
  const defaults = createDefaultSave();
  if (!raw || typeof raw !== "object") return defaults;

  const save = {
    ...defaults,
    ...raw,
    puzzleStates: { ...defaults.puzzleStates, ...(raw.puzzleStates || {}) },
    settings: { ...defaults.settings, ...(raw.settings || {}) }
  };

  save.version = SAVE_VERSION;
  save.currentRoom = typeof raw.currentRoom === "string" ? raw.currentRoom : defaults.currentRoom;
  save.collectedMarkerIds = Array.isArray(raw.collectedMarkerIds) ? [...new Set(raw.collectedMarkerIds)] : [];
  save.discoveredEggIds = Array.isArray(raw.discoveredEggIds) ? [...new Set(raw.discoveredEggIds)] : [];
  save.openedBoxes = Array.isArray(raw.openedBoxes) ? [...new Set(raw.openedBoxes)] : [];
  save.unlockedRooms = Array.isArray(raw.unlockedRooms) ? [...new Set(raw.unlockedRooms)] : [];
  save.settings.sound = raw.settings?.sound !== false;

  return save;
}

export class SaveManager {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.save = createDefaultSave();
  }

  load() {
    try {
      const raw = this.storage?.getItem(SAVE_STORAGE_KEY);
      this.save = migrateSave(raw ? JSON.parse(raw) : null);
    } catch (error) {
      console.warn("[Save] Save corrompido, iniciando novo.", error);
      this.save = createDefaultSave();
    }
    return this.save;
  }

  persist() {
    try {
      this.storage?.setItem(SAVE_STORAGE_KEY, JSON.stringify(this.save));
      bus.emit(Events.SAVE_CHANGED, this.save);
    } catch (error) {
      console.warn("[Save] Não foi possível salvar.", error);
    }
  }

  get markerCount() {
    return this.save.collectedMarkerIds.length;
  }

  hasCollected(markerId) {
    return this.save.collectedMarkerIds.includes(markerId);
  }

  collectMarker(markerId) {
    if (this.hasCollected(markerId)) return false;
    this.save.collectedMarkerIds.push(markerId);
    this.persist();
    bus.emit(Events.MARKER_COLLECTED, markerId);
    bus.emit(Events.MARKER_COUNT_CHANGED, this.markerCount);
    return true;
  }

  discoverEgg(eggId) {
    if (this.save.discoveredEggIds.includes(eggId)) return false;
    this.save.discoveredEggIds.push(eggId);
    this.persist();
    bus.emit(Events.EGG_FOUND, { id: eggId, found: this.save.discoveredEggIds.length });
    return true;
  }

  solvePuzzle(key) {
    if (this.save.puzzleStates[key]) return false;
    this.save.puzzleStates[key] = true;
    if (key === "redButtonsSolved" && !this.save.unlockedRooms.includes("room_06_secret_computer")) {
      this.save.unlockedRooms.push("room_06_secret_computer");
      bus.emit(Events.ROOM_UNLOCKED, "room_06_secret_computer");
    }
    this.persist();
    bus.emit(Events.PUZZLE_SOLVED, key);
    return true;
  }

  openBox(boxId) {
    if (this.save.openedBoxes.includes(boxId)) return false;
    this.save.openedBoxes.push(boxId);
    bus.emit(Events.BOX_OPENED, boxId);
    if (this.save.openedBoxes.length >= 2 && !this.save.puzzleStates.creditsBoxesSolved) {
      this.save.puzzleStates.creditsBoxesSolved = true;
      bus.emit(Events.PUZZLE_SOLVED, "creditsBoxesSolved");
    }
    this.persist();
    return true;
  }

  setCurrentRoom(roomId) {
    if (this.save.currentRoom === roomId) return;
    this.save.currentRoom = roomId;
    this.persist();
  }

  setSound(enabled) {
    this.save.settings.sound = Boolean(enabled);
    this.persist();
  }

  hasProgress() {
    const s = this.save;
    return (
      s.collectedMarkerIds.length > 0 ||
      s.discoveredEggIds.length > 0 ||
      s.openedBoxes.length > 0 ||
      s.currentRoom !== "room_09_spawn" ||
      Object.values(s.puzzleStates).some(Boolean)
    );
  }

  reset() {
    this.save = createDefaultSave();
    this.persist();
  }
}
