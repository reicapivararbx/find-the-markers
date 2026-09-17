// Batter Marker — rebatidas por timing na feira: o cursor varre a barra;
// [E] com o cursor na zona verde conecta. 3 rebatidas liberam o marker.
// Sem precisão absurda: zona generosa e varredura lenta.
import { Interactable } from "../entities/interactable.js";
import { Sfx } from "../core/audio-manager.js";

const BAR = { x: 540, y: 620, w: 220, h: 14 };
const SWEEP_SPEED = 190; // px/s
const GREEN_START = 0.38;
const GREEN_END = 0.62;

export class BaseballMini {
  constructor(ctx) {
    this.scene = ctx.scene;
    this.sm = ctx.sm;
    this.hud = ctx.hud;
    this.solved = Boolean(this.sm.save.puzzleStates.baseballSolved);
    this.hits = this.solved ? 3 : 0;
    this.cursor = 0;
    this.dir = 1;

    this._drawBar();
    this.interactable = new Interactable(this.scene, {
      id: "baseball_swing",
      x: 650,
      y: 690,
      radius: 110,
      prompt: () => (this.solved ? "Batter Marker" : `[E] Rebater (${this.hits}/3)`),
      action: () => this._swing()
    });
    ctx.addUpdatable(this.interactable);
  }

  _drawBar() {
    const g = this.scene.add.graphics().setDepth(618);
    g.fillStyle(0x33333d, 0.85);
    g.fillRoundedRect(BAR.x, BAR.y, BAR.w, BAR.h, 7);
    g.fillStyle(0x62c462, 1);
    g.fillRect(BAR.x + BAR.w * GREEN_START, BAR.y + 2, BAR.w * (GREEN_END - GREEN_START), BAR.h - 4);
    this.hitsGfx = this.scene.add.graphics().setDepth(618);
    this._renderHits();
  }

  _renderHits() {
    this.hitsGfx.clear();
    for (let i = 0; i < 3; i += 1) {
      this.hitsGfx.fillStyle(i < this.hits ? 0x62c462 : 0x8a9088, 1);
      this.hitsGfx.fillCircle(778 + i * 18, 627, 6);
    }
  }

  _swing() {
    if (this.solved) return;
    const pos = this.cursor / BAR.w;
    const inGreen = pos >= GREEN_START && pos <= GREEN_END;
    if (inGreen) {
      this.hits += 1;
      Sfx.puzzleStep();
      this._renderHits();
      this.hud.toast(`Rebatida! ${this.hits}/3`, { icon: "⚾", duration: 1500 });
      if (this.hits >= 3) {
        this.solved = true;
        Sfx.puzzleSolved();
        this.hud.toast("Três rebatidas! O Batter Marker apareceu.", { icon: "⚾", duration: 2800 });
        this.sm.solvePuzzle("baseballSolved");
      }
    } else {
      Sfx.gateBlocked();
    }
  }

  update(_px, _py, _interact, _hud, delta) {
    if (this.solved) return;
    const dt = Math.min(delta || 16, 100) / 1000;
    this.cursor += this.dir * SWEEP_SPEED * dt;
    if (this.cursor > BAR.w) { this.cursor = BAR.w; this.dir = -1; }
    if (this.cursor < 0) { this.cursor = 0; this.dir = 1; }
    if (!this.cursorGfx) this.cursorGfx = this.scene.add.graphics().setDepth(620);
    this.cursorGfx.clear();
    this.cursorGfx.fillStyle(0xffffff, 1);
    this.cursorGfx.fillRect(BAR.x + this.cursor - 2, BAR.y - 5, 4, BAR.h + 10);
  }

  destroy() {
    this.cursorGfx?.destroy();
  }
}
