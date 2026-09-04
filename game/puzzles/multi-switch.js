import { Interactable } from "../entities/interactable.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

export class MultiSwitchPuzzle {
  constructor(scene, {
    id,
    positions,
    solveKey,
    saveManager,
    hud,
    label = "interruptor",
    required = null,
    onSolved = null
  }) {
    this.scene = scene;
    this.id = id;
    this.solveKey = solveKey;
    this.sm = saveManager;
    this.hud = hud;
    this.onSolved = onSolved;
    this.required = required ?? positions.length;
    this.active = new Set();
    this.solved = Boolean(saveManager.save.puzzleStates[solveKey]);
    this.switches = [];

    positions.forEach((pos, index) => {
      const key = `${id}_${index}`;
      const gfx = scene.add.circle(pos.x, pos.y - 10, 18, this.solved ? 0x62c462 : 0xb03a3a, 1).setDepth(pos.y + 4);
      gfx.setStrokeStyle(3, 0x33333d, 0.85);
      scene.add
        .text(pos.x, pos.y - 40, String(index + 1), {
          fontFamily: "sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: "#00000088",
          padding: { x: 4, y: 2 }
        })
        .setOrigin(0.5)
        .setDepth(pos.y + 5);

      const interactable = new Interactable(scene, {
        id: key,
        x: pos.x,
        y: pos.y,
        radius: 90,
        prompt: `[E] Ativar ${label} ${index + 1}`,
        action: () => this.toggle(key, gfx)
      });
      this.switches.push({ key, gfx, interactable });
    });

    if (this.solved) {
      this.switches.forEach((s) => {
        s.gfx.setFillStyle(0x62c462, 1);
        this.active.add(s.key);
      });
    }
  }

  toggle(key, gfx) {
    if (this.solved) {
      this.hud.toast("Já resolvido.", { icon: "✓", duration: 1400 });
      return;
    }
    if (this.active.has(key)) {
      this.active.delete(key);
      gfx.setFillStyle(0xb03a3a, 1);
    } else {
      this.active.add(key);
      gfx.setFillStyle(0x62c462, 1);
      Sfx.reveal();
    }
    bus.emit(Events.PUZZLE_STEP, { id: this.id, active: this.active.size });
    this.hud.toast(`${this.active.size}/${this.required}`, { icon: "🔧", duration: 1200 });
    if (this.active.size >= this.required) this.complete();
  }

  complete() {
    if (this.solved) return;
    this.solved = true;
    this.sm.solvePuzzle(this.solveKey);
    this.hud.toast("Puzzle resolvido!", { icon: "✅", duration: 2400 });
    Sfx.reveal();
    if (typeof this.onSolved === "function") this.onSolved();
  }

  update(px, py, interactJustDown, hud) {
    if (this.solved) return;
    this.switches.forEach((s) => s.interactable.update(px, py, interactJustDown, hud));
  }
}
