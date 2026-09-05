// CAPY SLOT — modal DOM com 3 rolos animados (translateY), stops escalonados.
// Resultado já vem decidido do slot-engine; UI só anima e reporta onComplete.
import { SLOT_CONFIG, SLOT_SYMBOLS } from "../config/slot-config.js";
import { Sfx } from "../core/audio-manager.js";
import { state } from "../state.js";

const LOOPS = SLOT_CONFIG.timings.stripLoops;

function cellPx() {
  const el = document.querySelector(".slot-window");
  if (el) {
    const h = el.getBoundingClientRect().height;
    if (h > 0) return h;
  }
  return SLOT_CONFIG.cellPx;
}

function buildStripHtml(finalGlyph) {
  const parts = [];
  for (let loop = 0; loop < LOOPS; loop += 1) {
    for (const s of SLOT_SYMBOLS) {
      parts.push(
        `<div class="slot-cell" aria-hidden="true"><span>${s.glyph}</span></div>`
      );
    }
  }
  // célula final (índice = LOOPS * N)
  parts.push(
    `<div class="slot-cell slot-cell-final" role="img" aria-label="${finalGlyph}"><span>${finalGlyph}</span></div>`
  );
  // padding visual abaixo
  for (const s of SLOT_SYMBOLS.slice(0, 3)) {
    parts.push(`<div class="slot-cell" aria-hidden="true"><span>${s.glyph}</span></div>`);
  }
  return parts.join("");
}

function finalOffsetPx() {
  return LOOPS * SLOT_SYMBOLS.length * cellPx();
}

export class SlotMachineUI {
  constructor() {
    this.root = document.querySelector("#slot-overlay");
    this.card = document.querySelector("#slot-card");
    this.balanceEl = document.querySelector("#slot-balance");
    this.costEl = document.querySelector("#slot-cost");
    this.statusEl = document.querySelector("#slot-status");
    this.spinBtn = document.querySelector("#slot-spin");
    this.closeBtn = document.querySelector("#slot-close");
    this.reelsEl = [
      document.querySelector("#slot-reel-0 .slot-strip"),
      document.querySelector("#slot-reel-1 .slot-strip"),
      document.querySelector("#slot-reel-2 .slot-strip")
    ];
    this.reelFrames = [
      document.querySelector("#slot-reel-0"),
      document.querySelector("#slot-reel-1"),
      document.querySelector("#slot-reel-2")
    ];
    this.deltaEl = document.querySelector("#slot-delta");
    this.lightsEl = document.querySelector("#slot-lights");

    this.open = false;
    this.spinning = false;
    this.pendingResult = null;
    this.timers = [];
    this.rafs = [];
    this.onSpinRequest = null;
    this.onClosed = null;
    this._keyHandler = (e) => this.handleKey(e);
    this._bound = false;

    if (this.spinBtn) {
      this.spinBtn.addEventListener("click", () => this.requestSpin());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.tryClose());
    }
    if (this.root) {
      this.root.addEventListener("click", (e) => {
        if (e.target === this.root && !this.spinning) this.tryClose();
      });
    }
  }

  bind({ onSpinRequest, onClosed } = {}) {
    this.onSpinRequest = onSpinRequest || null;
    this.onClosed = onClosed || null;
  }

  isOpen() {
    return this.open;
  }

  isSpinning() {
    return this.spinning;
  }

  show({ coins = 0 } = {}) {
    if (!this.root) return;
    this.open = true;
    this.spinning = false;
    this.pendingResult = null;
    this.clearTimers();
    this.resetVisualIdle();
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    state.hud?.setPuzzleModal?.(true);
    this.updateBalance(coins);
    this.setStatus("Pressione GIRAR · Enter/Espaço");
    this.refreshSpinButton(coins);
    if (this.costEl) this.costEl.textContent = String(SLOT_CONFIG.cost);
    if (!this._bound) {
      window.addEventListener("keydown", this._keyHandler, true);
      this._bound = true;
    }
    this.spinBtn?.focus?.();
  }

  hide() {
    if (!this.root) return;
    this.clearTimers();
    this.spinning = false;
    this.pendingResult = null;
    this.open = false;
    this.root.classList.remove("is-open", "is-jackpot", "is-win", "is-lose");
    this.root.setAttribute("aria-hidden", "true");
    state.hud?.setPuzzleModal?.(false);
    if (this._bound) {
      window.removeEventListener("keydown", this._keyHandler, true);
      this._bound = false;
    }
    this.onClosed?.();
  }

  tryClose() {
    if (!this.open) return;
    if (this.spinning) {
      this.setStatus("Aguarde o giro terminar…");
      return;
    }
    this.hide();
  }

  handleKey(e) {
    if (!this.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.tryClose();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      // não roubar se o foco for em botão close
      if (document.activeElement === this.closeBtn) return;
      e.preventDefault();
      e.stopPropagation();
      this.requestSpin();
    }
  }

  updateBalance(coins) {
    if (this.balanceEl) this.balanceEl.textContent = String(Math.max(0, Math.floor(coins)));
  }

  refreshSpinButton(coins) {
    if (!this.spinBtn) return;
    const enough = coins >= SLOT_CONFIG.cost;
    this.spinBtn.disabled = this.spinning || !enough;
    if (this.spinning) {
      this.spinBtn.textContent = "GIRANDO…";
    } else if (!enough) {
      this.spinBtn.textContent = `❌ Precisa de ${SLOT_CONFIG.cost} Coins`;
    } else {
      this.spinBtn.textContent = `GIRAR (${SLOT_CONFIG.cost} 🪙)`;
    }
  }

  setStatus(text) {
    if (this.statusEl) this.statusEl.textContent = text || "";
  }

  requestSpin() {
    if (!this.open || this.spinning) return;
    this.onSpinRequest?.();
  }

  /**
   * Inicia animação com resultado já decidido.
   * @param {object} result — SpinResult ok:true do slot-engine
   * @param {{ coinsAfterDebit: number, onComplete?: (result) => void }} opts
   */
  playSpin(result, { coinsAfterDebit, onComplete } = {}) {
    if (!this.open || this.spinning || !result?.ok) return;
    this.spinning = true;
    this.pendingResult = result;
    this.clearTimers();
    this.root.classList.remove("is-jackpot", "is-win", "is-lose");
    this.reelFrames.forEach((f) => f?.classList.remove("is-stopped", "is-highlight"));
    if (this.deltaEl) {
      this.deltaEl.textContent = `-${result.cost}`;
      this.deltaEl.classList.add("is-visible", "is-spend");
      this.deltaEl.classList.remove("is-gain");
    }
    this.updateBalance(coinsAfterDebit);
    this.refreshSpinButton(coinsAfterDebit);
    this.setStatus("Girando…");
    Sfx.interact();

    const stops = SLOT_CONFIG.timings.reelStopMs;
    const glyphs = result.glyphs || ["❓", "❓", "❓"];
    const targetY = finalOffsetPx();

    glyphs.forEach((glyph, i) => {
      const strip = this.reelsEl[i];
      if (!strip) return;
      strip.innerHTML = buildStripHtml(glyph);
      strip.style.transition = "none";
      strip.style.transform = "translateY(0px)";
      // force reflow
      void strip.offsetHeight;
      const duration = stops[i] / 1000;
      strip.style.transition = `transform ${duration}s cubic-bezier(0.15, 0.85, 0.25, 1.05)`;
      strip.style.transform = `translateY(-${targetY}px)`;

      const t = window.setTimeout(() => {
        this.reelFrames[i]?.classList.add("is-stopped");
        Sfx.tick(1 + i * 0.15);
        if (i === 0 && glyphs[0] === glyphs[1]) {
          this.setStatus("Será que…?");
        }
        if (i === 1 && glyphs[0] === glyphs[1]) {
          this.setStatus("Quase lá…");
          this.reelFrames[0]?.classList.add("is-highlight");
          this.reelFrames[1]?.classList.add("is-highlight");
        }
        if (i === 2) {
          this.finishSpin(result, { onComplete, coinsAfterDebit });
        }
      }, stops[i]);
      this.timers.push(t);
    });
  }

  finishSpin(result, { onComplete, coinsAfterDebit } = {}) {
    const hold =
      result.kind === "jackpot" || result.kind === "jackpotAlt"
        ? SLOT_CONFIG.timings.jackpotHoldMs
        : SLOT_CONFIG.timings.resultHoldMs;

    const isWin =
      result.coinsDelta > 0 || result.unlockJackpot || result.unlockHighRoller || result.kind === "jackpot";
    const isJackpot = result.kind === "jackpot" || result.kind === "jackpotAlt";

    if (isJackpot) {
      this.root.classList.add("is-jackpot");
      Sfx.unlock();
      this.setStatus(result.message || "JACKPOT!");
    } else if (isWin) {
      this.root.classList.add("is-win");
      Sfx.collect();
      this.reelFrames.forEach((f) => f?.classList.add("is-highlight"));
      this.setStatus(result.message || "✨ Prêmio!");
    } else {
      this.root.classList.add("is-lose");
      this.setStatus(result.message || "Sem prêmio… tente de novo.");
    }

    if (this.deltaEl) {
      if (result.coinsDelta > 0) {
        this.deltaEl.textContent = `+${result.coinsDelta}`;
        this.deltaEl.classList.add("is-visible", "is-gain");
        this.deltaEl.classList.remove("is-spend");
      } else if (isJackpot && result.unlockJackpot) {
        this.deltaEl.textContent = "MARKER!";
        this.deltaEl.classList.add("is-visible", "is-gain");
        this.deltaEl.classList.remove("is-spend");
      } else {
        this.deltaEl.classList.remove("is-visible");
      }
    }

    const coinsNow = (coinsAfterDebit ?? 0) + Math.max(0, result.coinsDelta || 0);
    this.updateBalance(coinsNow);

    const t = window.setTimeout(() => {
      this.spinning = false;
      this.pendingResult = null;
      this.refreshSpinButton(coinsNow);
      if (!isWin) this.setStatus("Pressione GIRAR · Enter/Espaço");
      else if (!isJackpot) this.setStatus(result.message);
      onComplete?.(result);
      this.spinBtn?.focus?.();
    }, hold);
    this.timers.push(t);
  }

  resetVisualIdle() {
    this.root?.classList.remove("is-jackpot", "is-win", "is-lose");
    this.reelFrames.forEach((f) => f?.classList.remove("is-stopped", "is-highlight"));
    if (this.deltaEl) {
      this.deltaEl.classList.remove("is-visible", "is-spend", "is-gain");
      this.deltaEl.textContent = "";
    }
    const idle = ["🍒", "🍋", "⭐"];
    idle.forEach((g, i) => {
      const strip = this.reelsEl[i];
      if (!strip) return;
      strip.style.transition = "none";
      strip.style.transform = "translateY(0px)";
      strip.innerHTML = `<div class="slot-cell slot-cell-final" role="img" aria-label="${g}"><span>${g}</span></div>`;
    });
  }

  clearTimers() {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers = [];
    this.rafs.forEach((id) => window.cancelAnimationFrame(id));
    this.rafs = [];
  }

  destroy() {
    this.clearTimers();
    if (this._bound) {
      window.removeEventListener("keydown", this._keyHandler, true);
      this._bound = false;
    }
    this.hide();
  }
}

/** Singleton lazy — DOM precisa existir. */
let _instance = null;
export function getSlotMachineUI() {
  if (!_instance) _instance = new SlotMachineUI();
  return _instance;
}
