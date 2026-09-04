export class CharacterSelectUI {
  constructor() {
    this.root = document.querySelector("#character-select-screen");
    this.backBtn = document.querySelector("#character-select-back");
    this.pickMode = "new";

    this.root?.querySelectorAll("[data-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const character = btn.getAttribute("data-pick");
        if (character !== "male" && character !== "female") return;
        this.callbacks?.onPick?.(character, this.pickMode);
      });
    });

    this.backBtn?.addEventListener("click", () => {
      this.hide();
      this.callbacks?.onBack?.();
    });
  }

  bind(callbacks) {
    this.callbacks = callbacks;
  }

  show({ mode = "new", allowBack = false } = {}) {
    this.pickMode = mode;
    if (this.backBtn) this.backBtn.hidden = !allowBack;
    this.root?.classList.add("is-active");
  }

  hide() {
    this.root?.classList.remove("is-active");
  }

  isOpen() {
    return Boolean(this.root?.classList.contains("is-active"));
  }
}
