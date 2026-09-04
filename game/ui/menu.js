// Tela de título: Continuar (se houver save), Novo jogo (com confirmação
// quando existir progresso) e Apagar progresso (confirmação obrigatória).
import { state } from "../state.js";

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
  }

  bind(callbacks) {
    this.callbacks = callbacks;
  }

  refresh() {
    const hasProgress = state.saveManager?.hasProgress() ?? false;
    this.continueBtn.disabled = !hasProgress;
  }

  show() {
    this.hideConfirms();
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
}
