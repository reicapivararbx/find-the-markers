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

    this.toastTimer = null;
    this.noteTimer = null;
    this.currentInteraction = null;
    this.collectionOpen = false;
    this.pauseOpen = false;

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
    document.querySelector("#pause-reset").addEventListener("click", () => this.showPauseReset());
    document.querySelector("#pause-reset-yes").addEventListener("click", () => {
      this.hidePauseReset();
      this.hidePause(true);
      this.callbacks?.onReset();
    });
    document.querySelector("#pause-reset-no").addEventListener("click", () => this.hidePauseReset());

    bus.on(Events.MARKER_COLLECTED, () => this.setCounter());
    bus.on(Events.MARKER_COUNT_CHANGED, () => this.setCounter());
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
    return this.collectionOpen || this.pauseOpen;
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
    const collected = state.saveManager?.save.collectedMarkerIds || [];
    this.collectionGrid.innerHTML = "";
    MARKERS.forEach((def) => {
      const has = collected.includes(def.id);
      const chip = document.createElement("div");
      chip.className = `marker-chip ${has ? "is-collected" : "is-locked"}`;
      chip.innerHTML = `
        <span class="chip-body" style="--diff-color:${hex(def.difficulty)}">
          <span class="chip-cap"></span>
          <span class="chip-face">${has ? "·‿·" : "·_·"}</span>
        </span>
        <span class="chip-name">${has ? def.name : "???"}</span>
        <span class="chip-diff">${def.difficulty}</span>
        <span class="chip-check">${has ? "✓" : ""}</span>
      `;
      this.collectionGrid.appendChild(chip);
    });
    document.querySelector("#collection-count").textContent = `${collected.length}/${TOTAL_MARKERS}`;
  }

  // ---------- pausa ----------
  showPause() {
    this.pauseOpen = true;
    this.pauseEl.classList.add("is-open");
    this.hidePauseReset();
  }

  hidePause(resumeGameplay = false) {
    this.pauseOpen = false;
    this.pauseEl.classList.remove("is-open");
    if (resumeGameplay) this.callbacks?.onResume();
  }

  showPauseReset() {
    this.pauseResetBox.classList.add("is-visible");
  }

  hidePauseReset() {
    this.pauseResetBox.classList.remove("is-visible");
  }

  updateSoundLabel(enabled) {
    document.querySelector("#btn-sound").textContent = enabled ? "🔊" : "🔇";
    document.querySelector("#pause-sound").textContent = enabled ? "Som: ligado" : "Som: desligado";
  }
}
