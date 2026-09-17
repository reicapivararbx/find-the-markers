// Clock Marker — puzzle das quartas: três mostradores (12, 3, 6) e um pedestal
// vazio. O ponteiro do marker gira com [E]; a hora que falta fecha o círculo.
// Sem horário real do computador, sem softlock (12 toques no máximo).
import { Interactable } from "../entities/interactable.js";
import { Sfx } from "../core/audio-manager.js";

const TARGET_HOUR = 9;

export class ClockPuzzle {
  constructor(ctx) {
    this.ctx = ctx;
    this.scene = ctx.scene;
    this.sm = ctx.sm;
    this.hud = ctx.hud;
    this.hour = 12;
    this.solved = Boolean(this.sm.save.puzzleStates.clockSolved);

    this._drawDials();
    const marker = this.ctx.getMarker("clock_marker");
    if (marker?.setClockHour) marker.setClockHour(this.hour);

    this.interactable = new Interactable(this.scene, {
      id: "clock_marker_knob",
      x: 620,
      y: 580,
      radius: 110,
      prompt: "[E] Girar o ponteiro",
      action: () => this._advance()
    });
    ctx.addUpdatable(this.interactable);
  }

  _drawDials() {
    const dial = (x, y, hour) => {
      const g = this.scene.add.graphics().setDepth(y - 4);
      g.fillStyle(0xf6f2e8, 1);
      g.fillCircle(x, y, 16);
      g.lineStyle(3, 0xb8860b, 1);
      g.strokeCircle(x, y, 16);
      g.lineStyle(2.5, 0x1a1a22, 1);
      const a = (hour / 12) * Math.PI * 2 - Math.PI / 2;
      g.lineBetween(x, y, x + Math.cos(a) * 9, y + Math.sin(a) * 9);
      g.fillStyle(0x1a1a22, 1);
      g.fillCircle(x, y, 2);
    };
    dial(470, 420, 12);
    dial(770, 420, 3);
    dial(470, 520, 6);
    // pedestal vazio: a pista visual de que falta um mostrador
    const empty = this.scene.add.graphics().setDepth(516);
    empty.fillStyle(0x8a6238, 1);
    empty.fillRect(756, 530, 28, 8);
    this.scene.add
      .text(770, 512, "?", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "20px",
        fontStyle: "bold",
        color: "#8b5cf6"
      })
      .setOrigin(0.5)
      .setDepth(517);
  }

  _advance() {
    if (this.solved) return;
    const marker = this.ctx.getMarker("clock_marker");
    this.hour = (this.hour % 12) + 1;
    Sfx.tick(this.hour / 12 + 0.6);
    marker?.setClockHour?.(this.hour);
    if (this.hour === TARGET_HOUR) {
      this.solved = true;
      Sfx.puzzleSolved();
      this.hud.toast("O relógio bate 9 vezes… e para.", { icon: "🕰️", duration: 2600 });
      this.sm.solvePuzzle("clockSolved");
    }
  }

  update() {}
  destroy() {}
}
