// HUD (DOM): contador global, ovos, área atual, toasts, notificação de coleta,
// prompt [E], painel de coleção e menu de pausa (ESC).
import { TOTAL_MARKERS, MARKERS } from "../config/marker-registry.js";
import { DIFFICULTY_COLORS } from "../config/difficulty-metadata.js";
import { bus, Events } from "../core/event-bus.js";
import { state } from "../state.js";

function hex(difficulty) {
  const c = DIFFICULTY_COLORS[difficulty] || 0x9aa5b1;
  return `#${c.toString(16).padStart(6, "0")}`;
}

export class Hud {
  constructor() {
    this.root = document.querySelector("#game-ui");
    this.counterEl = document.querySelector("#hud-markers");
    this.eggsEl = document.querySelector("#hud-eggs");
    this.coinsEl = document.querySelector("#hud-coins");
    this.notesEl = document.querySelector("#hud-notes");
    this.areaEl = document.querySelector("#hud-area");
    this.toastEl = document.querySelector("#toast");
    this.noteEl = document.querySelector("#marker-notification");
    this.noteNameEl = document.querySelector("#mn-name");
    this.noteDiffEl = document.querySelector("#mn-difficulty");
    this.promptEl = document.querySelector("#interaction-prompt");
    this.promptTextEl = document.querySelector("#interaction-text");
    this.collectionEl = document.querySelector("#collection-panel");
    this.collectionGrid = document.querySelector("#collection-grid");
    this.pauseEl = document.querySelector("#pause-overlay");
    this.pauseResetBox = document.querySelector("#pause-reset-confirm");
    this.pauseUnstuckBox = document.querySelector("#pause-unstuck-confirm");
    this.pauseUnstuckBtn = document.querySelector("#pause-unstuck");

    this.toastTimer = null;
    this.noteTimer = null;
    this.currentInteraction = null;
    this.collectionOpen = false;
    this.pauseOpen = false;
    this.puzzleModalOpen = false;

    this.promptEl.addEventListener("click", () => {
      if (!this.currentInteraction) return;
      const interaction = this.currentInteraction;
      this.clearAllInteractions();
      interaction.action();
    });

    document.querySelector("#btn-collection").addEventListener("click", () => this.toggleCollection());
    document.querySelector("#btn-close-collection").addEventListener("click", () => this.toggleCollection(false));
    document.querySelector("#btn-pause").addEventListener("click", () => this.showPause());
    document.querySelector("#btn-sound").addEventListener("click", () => this.callbacks?.onSoundToggle());
    document.querySelector("#pause-resume").addEventListener("click", () => this.hidePause(true));
    document.querySelector("#pause-menu").addEventListener("click", () => this.callbacks?.onMenu());
    document.querySelector("#pause-sound").addEventListener("click", () => this.callbacks?.onSoundToggle());
    document.querySelector("#pause-character")?.addEventListener("click", () => {
      this.callbacks?.onChangeCharacter?.();
    });
    document.querySelector("#pause-reset").addEventListener("click", () => this.showPauseReset());
    document.querySelector("#pause-reset-yes").addEventListener("click", () => {
      this.hidePauseReset();
      this.hidePause(true);
      this.callbacks?.onReset();
    });
    document.querySelector("#pause-reset-no").addEventListener("click", () => this.hidePauseReset());

    this.pauseUnstuckBtn?.addEventListener("click", () => this.showPauseUnstuck());
    document.querySelector("#pause-unstuck-yes")?.addEventListener("click", () => {
      this.hidePauseUnstuck();
      this.callbacks?.onUnstuck?.();
    });
    document.querySelector("#pause-unstuck-no")?.addEventListener("click", () => this.hidePauseUnstuck());

    bus.on(Events.MARKER_COLLECTED, () => this.setCounter());
    bus.on(Events.MARKER_COUNT_CHANGED, () => this.setCounter());
    bus.on(Events.COIN_COLLECTED, () => this.updateCoins());
    bus.on(Events.MUSIC_NOTE_FOUND, () => this.updateMusicNotes());
    bus.on(Events.SAVE_CHANGED, () => {
      this.updateCoins();
      this.updateMusicNotes();
    });
  }

  bind(callbacks) {
    this.callbacks = callbacks;
  }

  // ---------- visibilidade ----------
  showGameplay() {
    this.root.classList.add("is-active");
  }

  hideGameplay() {
    this.root.classList.remove("is-active");
    this.clearAllInteractions();
    this.toggleCollection(false);
    this.hidePause();
  }

  isModalOpen() {
    return (
      this.collectionOpen ||
      this.pauseOpen ||
      this.puzzleModalOpen ||
      Boolean(state.characterSelect?.isOpen?.()) ||
      Boolean(document.querySelector("#slot-overlay.is-open"))
    );
  }

  setPuzzleModal(open) {
    this.puzzleModalOpen = Boolean(open);
    if (this.puzzleModalOpen) this.clearAllInteractions();
  }

  // ---------- valores ----------
  setCounter(count = null) {
    const value = count ?? state.saveManager?.markerCount ?? 0;
    this.counterEl.textContent = `${value}/${TOTAL_MARKERS}`;
  }

  setArea(name) {
    this.areaEl.textContent = name;
  }

  updateEggs(found, total = 5) {
    this.eggsEl.textContent = `${found}/${total}`;
    this.eggsEl.closest(".hud-counter")?.classList.toggle("has-eggs", found > 0);
  }

  updateCoins(count = null) {
    if (!this.coinsEl) return;
    const value = count ?? state.saveManager?.save?.coins ?? 0;
    this.coinsEl.textContent = String(value);
  }

  updateMusicNotes(found = null, total = 5) {
    if (!this.notesEl) return;
    const value = found ?? state.saveManager?.save?.discoveredMusicNoteIds?.length ?? 0;
    this.notesEl.textContent = `${value}/${total}`;
    this.notesEl.closest(".hud-counter")?.classList.toggle("has-notes", value > 0);
  }

  // ---------- toasts ----------
  toast(message, { icon = "", duration = 2200 } = {}) {
    if (!message) return;
    this.toastEl.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    this.toastEl.classList.add("is-visible");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("is-visible"), duration);
  }

  // ---------- notificação de coleta ----------
  notifyMarker(def) {
    this.noteNameEl.textContent = def.name;
    this.noteDiffEl.textContent = `Dificuldade: ${def.difficulty}`;
    this.noteDiffEl.style.setProperty("--diff-color", hex(def.difficulty));
    this.noteEl.classList.add("is-visible");
    window.clearTimeout(this.noteTimer);
    this.noteTimer = window.setTimeout(() => this.noteEl.classList.remove("is-visible"), 2300);
    this.setCounter();
  }

  // ---------- prompt [E] ----------
  setInteraction(interactable) {
    if (this.currentInteraction === interactable) return;
    this.currentInteraction = interactable;
    this.promptTextEl.textContent = interactable.prompt;
    this.promptEl.classList.add("is-visible");
  }

  clearInteraction(interactable) {
    if (this.currentInteraction !== interactable) return;
    this.currentInteraction = null;
    this.promptEl.classList.remove("is-visible");
  }

  clearAllInteractions() {
    this.currentInteraction = null;
    this.promptEl.classList.remove("is-visible");
  }

  // ---------- coleção ----------
  toggleCollection(force) {
    const open = force ?? !this.collectionOpen;
    if (open === this.collectionOpen) return;
    this.collectionOpen = open;
    this.collectionEl.classList.toggle("is-open", open);
    if (open) this.renderCollection();
  }

  renderCollection() {
    const save = state.saveManager?.save;
    const collected = save?.collectedMarkerIds || [];
    this.collectionGrid.innerHTML = "";
    MARKERS.forEach((def) => {
      const has = collected.includes(def.id);
      const isMenuChamp = def.mode === "menu_champion";
      const solved = Boolean(save?.menuSecrets?.championSolved);
      let name = has ? def.name : "???";
      let areaHint = "";
      if (isMenuChamp && !has) {
        name = solved ? def.name : "???";
        areaHint = solved
          ? `<span class="chip-area">Area: Start</span>`
          : `<span class="chip-area chip-hint">Some secrets exist before the game even begins.</span>`;
      } else if (has && def.area) {
        areaHint = `<span class="chip-area">Area: ${def.area}</span>`;
      }
      const chip = document.createElement("div");
      chip.className = `marker-chip ${has ? "is-collected" : "is-locked"}${isMenuChamp ? " is-menu-champion" : ""}`;
      chip.innerHTML = `
        <span class="chip-body" style="--diff-color:${hex(def.difficulty)}">
          <span class="chip-cap"></span>
          <span class="chip-face">${has ? "·‿·" : "·_·"}</span>
        </span>
        <span class="chip-name">${name}</span>
        <span class="chip-diff">${def.difficulty}</span>
        ${areaHint}
        <span class="chip-check">${has ? "✓" : ""}</span>
      `;
      this.collectionGrid.appendChild(chip);
    });
    document.querySelector("#collection-count").textContent = `${collected.length}/${TOTAL_MARKERS}`;
  }

  showPause() {
    this.pauseOpen = true;
    this.pauseEl.classList.add("is-open");
    this.hidePauseReset();
    this.hidePauseUnstuck();
    this.refreshUnstuckButton();
    this._startUnstuckTicker();
  }

  hidePause(resumeGameplay = false) {
    this.pauseOpen = false;
    this.pauseEl.classList.remove("is-open");
    this.hidePauseReset();
    this.hidePauseUnstuck();
    this._stopUnstuckTicker();
    if (resumeGameplay) this.callbacks?.onResume();
  }

  _startUnstuckTicker() {
    this._stopUnstuckTicker();
    this._unstuckTicker = window.setInterval(() => {
      if (!this.pauseOpen) {
        this._stopUnstuckTicker();
        return;
      }
      this.refreshUnstuckButton();
    }, 250);
  }

  _stopUnstuckTicker() {
    if (this._unstuckTicker != null) {
      window.clearInterval(this._unstuckTicker);
      this._unstuckTicker = null;
    }
  }

  showPauseReset() {
    this.hidePauseUnstuck();
    this.pauseResetBox.classList.add("is-visible");
  }

  hidePauseReset() {
    this.pauseResetBox.classList.remove("is-visible");
  }

  showPauseUnstuck() {
    this.hidePauseReset();
    this.pauseUnstuckBox?.classList.add("is-visible");
  }

  hidePauseUnstuck() {
    this.pauseUnstuckBox?.classList.remove("is-visible");
  }

  refreshUnstuckButton() {
    if (!this.pauseUnstuckBtn) return;
    const remaining = this.callbacks?.unstuckCooldownMs?.() ?? 0;
    if (remaining > 0) {
      this.pauseUnstuckBtn.disabled = true;
      this.pauseUnstuckBtn.textContent = `🛟 Aguarde ${Math.ceil(remaining / 1000)}s`;
    } else {
      this.pauseUnstuckBtn.disabled = false;
      this.pauseUnstuckBtn.textContent = "🛟 DESTRAVAR PERSONAGEM";
    }
  }

  updateSoundLabel(enabled) {
    document.querySelector("#btn-sound").textContent = enabled ? "🔊" : "🔇";
    document.querySelector("#pause-sound").textContent = enabled ? "Som: ligado" : "Som: desligado";
  }
}
