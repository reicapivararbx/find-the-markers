import { Sfx } from "../core/audio-manager.js";

const KEYS = Object.freeze([
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["←", "0", "✓"]
]);

export class CodeKeypad {
  constructor(scene, { expected, length = 6, title = "Código", onSubmit, onCancel = null }) {
    this.scene = scene;
    this.expected = String(expected);
    this.length = length;
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
    this.value = "";
    this.closed = false;
    this.depth = 50000;

    this.root = scene.add.container(720, 405).setDepth(this.depth).setScrollFactor(0);
    this.block = scene.add
      .rectangle(0, 0, 1440, 810, 0x0b0b12, 0.55)
      .setInteractive()
      .setScrollFactor(0);
    this.root.add(this.block);

    const panel = scene.add.graphics();
    panel.fillStyle(0xfdfaf1, 0.98);
    panel.fillRoundedRect(-220, -250, 440, 500, 18);
    panel.lineStyle(4, 0x33333d, 0.85);
    panel.strokeRoundedRect(-220, -250, 440, 500, 18);
    this.root.add(panel);

    this.titleText = scene.add
      .text(0, -210, title, {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "22px",
        fontStyle: "bold",
        color: "#33333d"
      })
      .setOrigin(0.5);
    this.root.add(this.titleText);

    this.displayText = scene.add
      .text(0, -150, this.formatDisplay(), {
        fontFamily: "monospace",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#1a1a22",
        backgroundColor: "#e8e0d0",
        padding: { x: 18, y: 10 }
      })
      .setOrigin(0.5);
    this.root.add(this.displayText);

    this.hintText = scene.add
      .text(0, -95, "Digite os 6 números", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "15px",
        color: "#6a6a78"
      })
      .setOrigin(0.5);
    this.root.add(this.hintText);

    KEYS.forEach((row, ri) => {
      row.forEach((label, ci) => {
        const x = -120 + ci * 120;
        const y = -20 + ri * 78;
        const btn = scene.add
          .rectangle(x, y, 96, 64, 0xffffff, 1)
          .setStrokeStyle(3, 0x33333d, 0.8)
          .setInteractive({ useHandCursor: true });
        const txt = scene.add
          .text(x, y, label, {
            fontFamily: '"Comic Sans MS", sans-serif',
            fontSize: label === "←" || label === "✓" ? "26px" : "28px",
            fontStyle: "bold",
            color: "#33333d"
          })
          .setOrigin(0.5);
        btn.on("pointerdown", () => this.press(label));
        btn.on("pointerover", () => btn.setFillStyle(0xffe08a, 1));
        btn.on("pointerout", () => btn.setFillStyle(0xffffff, 1));
        this.root.add([btn, txt]);
      });
    });

    const cancel = scene.add
      .text(0, 220, "[ Esc ] Cancelar", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "16px",
        color: "#6a6a78"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    cancel.on("pointerdown", () => this.cancel());
    this.root.add(cancel);

    this.keyHandler = (event) => {
      if (this.closed) return;
      if (event.key === "Escape") {
        this.cancel();
        return;
      }
      if (event.key === "Backspace") {
        this.press("←");
        return;
      }
      if (event.key === "Enter") {
        this.press("✓");
        return;
      }
      if (/^[0-9]$/.test(event.key)) this.press(event.key);
    };
    window.addEventListener("keydown", this.keyHandler);
  }

  formatDisplay() {
    const chars = [];
    for (let i = 0; i < this.length; i += 1) {
      chars.push(this.value[i] ?? "_");
    }
    return `[ ${chars.join("  ")} ]`;
  }

  press(label) {
    if (this.closed) return;
    Sfx.keypad?.() || Sfx.tick?.(1);
    if (label === "←") {
      this.value = this.value.slice(0, -1);
      this.hintText.setText("Digite os 6 números").setColor("#6a6a78");
      this.displayText.setText(this.formatDisplay());
      return;
    }
    if (label === "✓") {
      this.submit();
      return;
    }
    if (this.value.length >= this.length) return;
    this.value += label;
    this.displayText.setText(this.formatDisplay());
    if (this.value.length === this.length) this.hintText.setText("Confirme com ✓").setColor("#2f7a4f");
  }

  submit() {
    if (this.value.length < this.length) {
      this.hintText.setText("Digite os 6 números").setColor("#d1495b");
      Sfx.puzzleError();
      return;
    }
    const ok = this.value === this.expected;
    if (!ok) {
      this.hintText.setText("Código incorreto").setColor("#d1495b");
      Sfx.puzzleError();
      this.value = "";
      this.displayText.setText(this.formatDisplay());
      this.onSubmit?.(false, this.value);
      return;
    }
    Sfx.puzzleSolved();
    this.close();
    this.onSubmit?.(true, this.value);
  }

  cancel() {
    if (this.closed) return;
    this.close();
    this.onCancel?.();
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    window.removeEventListener("keydown", this.keyHandler);
    this.root.destroy(true);
  }
}
