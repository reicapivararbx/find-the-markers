import { SAVE_STORAGE_KEY } from "./config/game-config.js";
import { SaveManager } from "./save/save-manager.js";
import { Hud } from "./ui/hud.js";
import { MenuUI } from "./ui/menu.js";
import { CharacterSelectUI } from "./ui/character-select.js";
import { BootScene } from "./scenes/boot-scene.js";
import { RoomScene } from "./scenes/room-scene.js";
import { setMuted } from "./core/audio-manager.js";
import { state } from "./state.js";
import { TOTAL_MARKERS, MARKERS } from "./config/marker-registry.js";

void SAVE_STORAGE_KEY;

const params = new URLSearchParams(window.location.search);
state.debug = params.get("debug") === "1";

const saveManager = new SaveManager(window.localStorage);
saveManager.load();
state.saveManager = saveManager;
setMuted(!saveManager.save.settings.sound);

const hud = new Hud();
state.hud = hud;
const menu = new MenuUI();
state.menu = menu;
const characterSelect = new CharacterSelectUI();
state.characterSelect = characterSelect;

function startRoom(roomId, arriveAt = "default") {
  menu.hide();
  characterSelect.hide();
  hud.showGameplay();
  hud.updateSoundLabel(saveManager.save.settings.sound);
  const scene = state.game.scene;
  if (scene.isActive("BootScene")) scene.stop("BootScene");
  if (scene.isActive("RoomScene")) scene.stop("RoomScene");
  scene.start("RoomScene", { roomId, arriveAt });
}

function returnToMenu() {
  const room = state.game?.scene?.getScene?.("RoomScene");
  room?.flushPositionToSave?.();
  hud.hideGameplay();
  characterSelect.hide();
  const scene = state.game.scene;
  if (scene.isActive("RoomScene")) scene.stop("RoomScene");
  if (!scene.isActive("BootScene")) scene.start("BootScene");
  menu.show();
}

function beginNewGame() {
  saveManager.reset();
  menu.hide();
  characterSelect.show({ mode: "new", allowBack: true });
}

function continueOrSelect() {
  if (!saveManager.hasPlayerCharacter()) {
    menu.hide();
    characterSelect.show({ mode: "continue", allowBack: true });
    return;
  }
  startRoom(saveManager.save.currentRoom, "default");
}

function applyCharacterPick(character, mode) {
  saveManager.setPlayerCharacter(character);
  characterSelect.hide();

  if (mode === "swap") {
    const scene = state.game.scene.getScene("RoomScene");
    if (scene?.player) {
      scene.player.applyCharacterVisuals(character);
    }
    hud.hidePause();
    hud.toast(character === "female" ? "Personagem: Mulher" : "Personagem: Homem", {
      icon: "👤",
      duration: 1800
    });
    return;
  }

  if (mode === "continue") {
    startRoom(saveManager.save.currentRoom || "room_09_spawn", "default");
    return;
  }

  startRoom("room_09_spawn", "default");
}

menu.bind({
  onContinue: () => continueOrSelect(),
  onNewGame: () => beginNewGame()
});

characterSelect.bind({
  onPick: (character, mode) => applyCharacterPick(character, mode),
  onBack: () => {
    characterSelect.hide();
    if (state.game?.scene?.isActive("RoomScene")) {
      hud.showPause();
      return;
    }
    menu.show();
  }
});

hud.bind({
  onResume: () => state.game.scene.getScene("RoomScene")?.togglePause?.(),
  onMenu: () => {
    hud.hidePause();
    returnToMenu();
  },
  onSoundToggle: () => {
    const enabled = !saveManager.save.settings.sound;
    saveManager.setSound(enabled);
    setMuted(!enabled);
    hud.updateSoundLabel(enabled);
  },
  onReset: () => {
    saveManager.reset();
    hud.toast("Progresso apagado.", { icon: "🗑", duration: 2200 });
    menu.hide();
    characterSelect.show({ mode: "new", allowBack: false });
  },
  onChangeCharacter: () => {
    hud.hidePause(false);
    characterSelect.show({ mode: "swap", allowBack: true });
  },
  unstuckCooldownMs: () => {
    const scene = state.game?.scene?.getScene("RoomScene");
    return scene?.unstuckCooldownRemainingMs?.() ?? 0;
  },
  onUnstuck: () => {
    const scene = state.game?.scene?.getScene("RoomScene");
    if (!scene?.unstuck) {
      hud.toast("Não foi possível destravar agora.", { icon: "⚠️", duration: 2000 });
      return;
    }
    const result = scene.unstuck("manual");
    hud.refreshUnstuckButton();
    if (!result?.ok) {
      if (result?.reason === "cooldown") {
        const sec = Math.ceil((result.remainingMs || 0) / 1000);
        hud.toast(`Aguarde ${sec}s para destravar de novo.`, { icon: "⏳", duration: 2000 });
      } else {
        hud.toast("Não foi possível destravar agora.", { icon: "⚠️", duration: 2000 });
      }
      return;
    }
    hud.hidePause(true);
    hud.toast("✅ Personagem movido para um local seguro.", { icon: "🛟", duration: 2400 });
  }
});

function bindTouch() {
  const actions = {
    left: "left",
    right: "right",
    up: "up",
    down: "down",
    interact: "interact"
  };
  document.querySelectorAll("#mobile-controls [data-action]").forEach((button) => {
    const action = actions[button.dataset.action];
    if (!action) return;
    const press = (event) => {
      event.preventDefault();
      button.classList.add("is-pressed");
      window.FTMInput?.setVirtual(action, true);
    };
    const release = (event) => {
      event.preventDefault();
      button.classList.remove("is-pressed");
      window.FTMInput?.setVirtual(action, false);
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });
}

function fatalError(message) {
  const screen = document.querySelector("#fatal-error");
  document.querySelector("#fatal-error-message").textContent = message;
  screen.classList.add("is-active");
}

function createGame() {
  if (!globalThis.Phaser) {
    fatalError("Phaser 3 não foi carregado. Use um servidor HTTP e recarregue a página.");
    return;
  }

  state.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: 1440,
    height: 810,
    backgroundColor: "#bfe8f7",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: state.debug
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: state.debug ? { forceSetTimeOut: true } : undefined,
    input: { activePointers: 4 },
    scene: [BootScene, RoomScene]
  });

  menu.show();
  bindTouch();

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      event.preventDefault();
    }
  });

  if (state.debug) {
    window.FTMGame = state.game;
    window.FTM = Object.freeze({
      state: () => JSON.parse(JSON.stringify(saveManager.save)),
      markerCount: () => saveManager.markerCount,
      total: TOTAL_MARKERS,
      rt: () => {
        const scene = state.game.scene.getScene("RoomScene");
        if (!scene?.player) return null;
        return {
          room: scene.roomId,
          x: Math.round(scene.player.x),
          y: Math.round(scene.player.y),
          count: saveManager.markerCount,
          transitioning: scene.transitioning,
          character: saveManager.save.playerCharacter
        };
      },
      setPos: (x, y) => {
        const scene = state.game.scene.getScene("RoomScene");
        if (!scene?.player || !Number.isFinite(x) || !Number.isFinite(y)) return false;
        scene.player.sprite.body.reset(x, y);
        return true;
      },
      unstuck: () => {
        const scene = state.game.scene.getScene("RoomScene");
        return scene?.unstuck?.("debug") ?? { ok: false };
      },
      give: (id) => saveManager.collectMarker(id),
      addMarkers: (n) => {
        const pending = MARKERS.filter((m) => !saveManager.hasCollected(m.id)).slice(0, n);
        pending.forEach((m) => saveManager.collectMarker(m.id));
        return saveManager.markerCount;
      },
      solve: (key) => saveManager.solvePuzzle(key),
      warp: (roomId) => {
        const scene = state.game.scene.getScene("RoomScene");
        if (scene && state.game.scene.isActive("RoomScene")) {
          scene.scene.restart({ roomId, arriveAt: "default" });
          return true;
        }
        return false;
      },
      setCharacter: (id) => {
        if (!saveManager.setPlayerCharacter(id)) return false;
        const scene = state.game.scene.getScene("RoomScene");
        scene?.player?.applyCharacterVisuals(id);
        return true;
      },
      reset: () => {
        saveManager.reset();
        characterSelect.show({ mode: "new", allowBack: false });
      }
    });
    console.log("[FTM] Debug ativo — use window.FTM para QA.");
  }

  window.FTMStartRoom = startRoom;
  window.FTMReturnToMenu = returnToMenu;

  if (state.debug) {
    window.setTimeout(() => {
      const g = state.game;
      if (g && g.loop && !g.loop.started) g.loop.start(g.step.bind(g));
      let rafFired = false;
      requestAnimationFrame(() => {
        rafFired = true;
      });
      window.setTimeout(() => {
        if (!rafFired && state.game?.loop) {
          state.game.loop._onLoop = () => {};
          window.FTM_QA_MANUAL_LOOP = true;
        }
      }, 350);
    }, 600);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createGame, { once: true });
} else {
  createGame();
}
