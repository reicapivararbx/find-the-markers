import { state } from "../state.js";
import { TOTAL_MARKERS, MARKER_BY_ID } from "../config/marker-registry.js";
import { Sfx } from "../core/audio-manager.js";

const CHAMPION_TARGET = 67;
const CLICK_DEBOUNCE_MS = 50;

export class MenuUI {
  constructor() {
    this.root = document.querySelector("#menu-screen");
    this.continueBtn = document.querySelector("#btn-continue");
    this.newBtn = document.querySelector("#btn-new");
    this.newConfirm = document.querySelector("#new-confirm");
    this.newYes = document.querySelector("#new-yes");
    this.newNo = document.querySelector("#new-no");
    this.resetBtn = document.querySelector("#btn-reset-save");
    this.resetConfirm = document.querySelector("#reset-confirm");
    this.resetYes = document.querySelector("#reset-yes");
    this.resetNo = document.querySelector("#reset-no");
    this.playLabel = document.querySelector("#btn-play-label");
    this.saveCard = document.querySelector("#menu-save-card");
    this.saveSummary = document.querySelector("#menu-save-summary");
    this.mascot = document.querySelector("#menu-champion-mascot");
    this.mascotFace = document.querySelector("#menu-champion-face");
    this.mascotBubble = document.querySelector("#menu-champion-bubble");
    this.awakenOverlay = document.querySelector("#menu-champion-awaken");
    this.awakenMsg = document.querySelector("#menu-champion-awaken-msg");

    this.lastClickAt = 0;
    this.reactionTimer = null;
    this.locked = false;

    this.continueBtn.addEventListener("click", () => this.callbacks?.onContinue());
    this.newBtn.addEventListener("click", () => this.showNewConfirm());
    this.newYes.addEventListener("click", () => {
      this.hideConfirms();
      this.callbacks?.onNewGame();
    });
    this.newNo.addEventListener("click", () => this.hideConfirms());
    this.resetBtn.addEventListener("click", () => this.showResetConfirm());
    this.resetYes.addEventListener("click", () => {
      this.hideConfirms();
      state.saveManager?.reset();
      this.refresh();
      this.callbacks?.onReset?.();
    });
    this.resetNo.addEventListener("click", () => this.hideConfirms());

    if (this.mascot) {
      const onTap = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.handleChampionClick();
      };
      this.mascot.addEventListener("pointerdown", onTap);
      this.mascot.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
    }
  }

  bind(callbacks) {
    this.callbacks = callbacks;
  }

  refresh() {
    const sm = state.saveManager;
    const hasProgress = sm?.hasProgress() ?? false;
    this.continueBtn.disabled = !hasProgress;
    if (this.playLabel) {
      this.playLabel.textContent = hasProgress ? "▶ CONTINUAR" : "▶ JOGAR";
    }
    this.continueBtn.classList.toggle("button-primary", hasProgress);
    this.newBtn.classList.toggle("button-primary", !hasProgress);
    this.newBtn.classList.toggle("button-ghost", hasProgress);

    if (this.saveCard && this.saveSummary) {
      if (hasProgress && sm) {
        const n = sm.markerCount;
        const coins = sm.save.coins || 0;
        this.saveCard.hidden = false;
        this.saveSummary.textContent = `${n}/${TOTAL_MARKERS} markers · ${coins} coins`;
      } else {
        this.saveCard.hidden = true;
      }
    }

    this.syncChampionVisual(sm?.menuChampionClicks ?? 0, sm?.menuChampionSolved ?? false);
  }

  show() {
    this.hideConfirms();
    this.locked = false;
    if (this.awakenOverlay) this.awakenOverlay.classList.remove("is-visible");
    this.refresh();
    this.root.classList.add("is-active");
  }

  hide() {
    this.root.classList.remove("is-active");
  }

  showNewConfirm() {
    const hasProgress = state.saveManager?.hasProgress() ?? false;
    if (!hasProgress) {
      this.callbacks?.onNewGame();
      return;
    }
    this.newConfirm.classList.add("is-visible");
  }

  showResetConfirm() {
    this.resetConfirm.classList.add("is-visible");
  }

  hideConfirms() {
    this.newConfirm.classList.remove("is-visible");
    this.resetConfirm.classList.remove("is-visible");
  }

  handleChampionClick() {
    if (this.locked) return;
    const sm = state.saveManager;
    if (!sm) return;
    if (sm.menuChampionSolved) {
      this.pulseSolved();
      return;
    }

    const now = performance.now();
    if (now - this.lastClickAt < CLICK_DEBOUNCE_MS) return;
    this.lastClickAt = now;

    const result = sm.recordMenuChampionClick();
    const clicks = result.clicks;
    const pitch = 0.85 + Math.min(clicks, CHAMPION_TARGET) / CHAMPION_TARGET * 0.55;
    Sfx.tick?.(pitch) ?? Sfx.interact();

    this.applyReaction(clicks);
    this.syncChampionVisual(clicks, result.solved);

    if (result.justSolved) {
      this.playAwakenSequence();
    }
  }

  applyReaction(clicks) {
    if (!this.mascot) return;
    this.mascot.classList.remove(
      "rx-sway",
      "rx-look",
      "rx-irritate",
      "rx-question",
      "rx-nudge",
      "rx-face",
      "rx-glow",
      "rx-blink",
      "rx-spark",
      "rx-freeze"
    );

    window.clearTimeout(this.reactionTimer);

    if (clicks >= 66 && clicks < 67) {
      this.mascot.classList.add("rx-freeze");
      if (this.mascotFace) this.mascotFace.textContent = "·_·";
      return;
    }
    if (clicks >= 60) {
      this.mascot.classList.add("rx-spark");
      this.spawnSpark();
    } else if (clicks >= 50) {
      this.mascot.classList.add("rx-blink");
    } else if (clicks >= 40) {
      this.mascot.classList.add("rx-glow");
    } else if (clicks >= 30) {
      this.mascot.classList.add("rx-face");
      if (this.mascotFace) this.mascotFace.textContent = "¬_¬";
    } else if (clicks >= 20) {
      this.mascot.classList.add("rx-nudge");
    } else if (clicks >= 15) {
      this.mascot.classList.add("rx-question");
      if (this.mascotBubble) {
        this.mascotBubble.hidden = false;
        this.mascotBubble.textContent = "?";
        this.reactionTimer = window.setTimeout(() => {
          if (this.mascotBubble) this.mascotBubble.hidden = true;
        }, 1000);
      }
    } else if (clicks >= 10) {
      this.mascot.classList.add("rx-irritate");
      if (this.mascotFace) this.mascotFace.textContent = ">_<";
    } else if (clicks >= 5) {
      this.mascot.classList.add("rx-look");
    } else if (clicks >= 1) {
      this.mascot.classList.add("rx-sway");
    }

    if (clicks < 30 && this.mascotFace && clicks !== 10) {
      this.mascotFace.textContent = "·‿·";
    }
  }

  syncChampionVisual(clicks, solved) {
    if (!this.mascot) return;
    this.mascot.dataset.clicks = String(clicks);
    this.mascot.classList.toggle("is-solved", solved);
    this.mascot.setAttribute("aria-label", solved ? "Champion marker" : "Decorative marker");
    if (solved) {
      this.mascot.classList.add("rx-glow", "is-awakened");
      if (this.mascotFace) this.mascotFace.textContent = "★‿★";
      if (this.mascotBubble) this.mascotBubble.hidden = true;
    }
  }

  pulseSolved() {
    if (!this.mascot) return;
    this.mascot.classList.add("rx-glow");
    Sfx.tick?.(1.2);
  }

  spawnSpark() {
    if (!this.mascot) return;
    const spark = document.createElement("span");
    spark.className = "menu-champion-spark";
    spark.textContent = "✦";
    spark.style.left = `${40 + Math.random() * 40}%`;
    spark.style.top = `${20 + Math.random() * 40}%`;
    this.mascot.appendChild(spark);
    window.setTimeout(() => spark.remove(), 700);
  }

  playAwakenSequence() {
    this.locked = true;
    if (this.mascot) {
      this.mascot.classList.add("rx-freeze", "is-awakening");
      if (this.mascotFace) this.mascotFace.textContent = "★_★";
    }
    if (this.awakenOverlay) {
      this.awakenOverlay.classList.add("is-visible");
      if (this.awakenMsg) {
        this.awakenMsg.innerHTML =
          "<strong>🏆 Something has awakened...</strong><br><span>Procure no início.</span>";
      }
    }
    Sfx.unlock?.();
    window.setTimeout(() => {
      if (this.awakenOverlay) this.awakenOverlay.classList.remove("is-visible");
      if (this.mascot) this.mascot.classList.remove("is-awakening", "rx-freeze");
      this.syncChampionVisual(67, true);
      this.locked = false;
    }, 2800);
  }
}
