// Persistência versionada em localStorage, com storage injetável (testes).
import { SAVE_STORAGE_KEY, SAVE_VERSION, AREA_SEAL_IDS } from "../config/game-config.js";
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
      creditsBoxesSolved: false,
      valvesSolved: false,
      batteriesSolved: false,
      runesSolved: false,
      fragmentsSolved: false,
      firewallSolved: false,
      mikuPuzzleSolved: false
    },
    openedBoxes: [],
    unlockedRooms: [],
    areaSeals: [],
    secretAreas: [],
    coins: 0,
    collectedCoinIds: [],
    discoveredMusicNoteIds: [],
    mikuMarkerUnlocked: false,
    playerCharacter: null,
    slot: {
      spins: 0,
      pity: 0,
      jackpotWon: false,
      highRollerWon: false
    },
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
    settings: { ...defaults.settings, ...(raw.settings || {}) },
    slot: { ...defaults.slot, ...(raw.slot || {}) }
  };

  save.version = SAVE_VERSION;
  save.currentRoom = typeof raw.currentRoom === "string" ? raw.currentRoom : defaults.currentRoom;
  save.collectedMarkerIds = Array.isArray(raw.collectedMarkerIds) ? [...new Set(raw.collectedMarkerIds)] : [];
  save.discoveredEggIds = Array.isArray(raw.discoveredEggIds) ? [...new Set(raw.discoveredEggIds)] : [];
  save.openedBoxes = Array.isArray(raw.openedBoxes) ? [...new Set(raw.openedBoxes)] : [];
  save.unlockedRooms = Array.isArray(raw.unlockedRooms) ? [...new Set(raw.unlockedRooms)] : [];
  save.areaSeals = Array.isArray(raw.areaSeals)
    ? [...new Set(raw.areaSeals.filter((id) => AREA_SEAL_IDS.includes(id)))]
    : [];
  save.secretAreas = Array.isArray(raw.secretAreas) ? [...new Set(raw.secretAreas)] : [];
  save.collectedCoinIds = Array.isArray(raw.collectedCoinIds) ? [...new Set(raw.collectedCoinIds)] : [];
  save.discoveredMusicNoteIds = Array.isArray(raw.discoveredMusicNoteIds)
    ? [...new Set(raw.discoveredMusicNoteIds)]
    : [];
  save.mikuMarkerUnlocked = Boolean(raw.mikuMarkerUnlocked) || Boolean(save.puzzleStates.mikuPuzzleSolved);
  save.coins = Math.max(0, Number.isFinite(raw.coins) ? Math.floor(raw.coins) : save.collectedCoinIds.length);
  save.slot.spins = Math.max(0, Math.floor(Number(save.slot.spins) || 0));
  save.slot.pity = Math.max(0, Math.floor(Number(save.slot.pity) || 0));
  save.slot.jackpotWon = Boolean(save.slot.jackpotWon);
  save.slot.highRollerWon = Boolean(save.slot.highRollerWon);
  save.settings.sound = raw.settings?.sound !== false;
  const char = raw.playerCharacter;
  save.playerCharacter = char === "male" || char === "female" ? char : null;

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

  discoverMusicNote(noteId) {
    if (this.save.discoveredMusicNoteIds.includes(noteId)) return false;
    this.save.discoveredMusicNoteIds.push(noteId);
    this.persist();
    bus.emit(Events.MUSIC_NOTE_FOUND, {
      id: noteId,
      found: this.save.discoveredMusicNoteIds.length
    });
    return true;
  }

  unlockMikuMarker() {
    this.save.mikuMarkerUnlocked = true;
    this.save.puzzleStates.mikuPuzzleSolved = true;
    if (!this.save.unlockedRooms.includes("secret_digital_stage")) {
      this.save.unlockedRooms.push("secret_digital_stage");
      bus.emit(Events.ROOM_UNLOCKED, "secret_digital_stage");
    }
    this.persist();
    bus.emit(Events.PUZZLE_SOLVED, "mikuPuzzleSolved");
  }

  collectCoin(coinId, amount = 1) {
    if (this.save.collectedCoinIds.includes(coinId)) return false;
    this.save.collectedCoinIds.push(coinId);
    this.save.coins += Math.max(1, Math.floor(amount));
    this.persist();
    bus.emit(Events.COIN_COLLECTED, { id: coinId, coins: this.save.coins });
    return true;
  }

  addCoins(amount) {
    const n = Math.floor(amount);
    if (!Number.isFinite(n) || n === 0) return this.save.coins;
    this.save.coins = Math.max(0, this.save.coins + n);
    this.persist();
    return this.save.coins;
  }

  spendCoins(amount) {
    const n = Math.floor(amount);
    if (!Number.isFinite(n) || n <= 0) return false;
    if (this.save.coins < n) return false;
    this.save.coins -= n;
    this.persist();
    return true;
  }

  grantSeal(sealId) {
    if (!AREA_SEAL_IDS.includes(sealId)) return false;
    if (this.save.areaSeals.includes(sealId)) return false;
    this.save.areaSeals.push(sealId);
    this.persist();
    bus.emit(Events.SEAL_GRANTED, sealId);
    return true;
  }

  hasAllSeals() {
    return AREA_SEAL_IDS.every((id) => this.save.areaSeals.includes(id));
  }

  unlockSecretArea(areaId) {
    if (this.save.secretAreas.includes(areaId)) return false;
    this.save.secretAreas.push(areaId);
    this.persist();
    bus.emit(Events.SECRET_UNLOCKED, areaId);
    return true;
  }

  recordSlotSpin({ jackpot = false, highRoller = false } = {}) {
    this.save.slot.spins += 1;
    if (jackpot) {
      this.save.slot.jackpotWon = true;
      this.save.slot.pity = 0;
    } else if (highRoller) {
      this.save.slot.highRollerWon = true;
      this.save.slot.pity = 0;
    } else {
      this.save.slot.pity += 1;
    }
    this.persist();
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

  setPlayerCharacter(character) {
    if (character !== "male" && character !== "female") return false;
    if (this.save.playerCharacter === character) return false;
    this.save.playerCharacter = character;
    this.persist();
    return true;
  }

  hasPlayerCharacter() {
    return this.save.playerCharacter === "male" || this.save.playerCharacter === "female";
  }

  hasProgress() {
    const s = this.save;
    return (
      s.collectedMarkerIds.length > 0 ||
      s.discoveredEggIds.length > 0 ||
      s.openedBoxes.length > 0 ||
      s.areaSeals.length > 0 ||
      s.collectedCoinIds.length > 0 ||
      s.coins > 0 ||
      s.currentRoom !== "room_09_spawn" ||
      Object.values(s.puzzleStates).some(Boolean)
    );
  }

  reset() {
    this.save = createDefaultSave();
    this.persist();
  }
}
