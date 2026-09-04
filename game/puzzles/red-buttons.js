// PUZZLE DOS 9 CÍRCULOS VERMELHOS (página 7 do PDF; código da página 11).
// Clique/toque direto nos círculos. Erro reseta a sequência inteira.
// Sucesso desbloqueia a área secreta (página 6) PERMANENTEMENTE no save.
import { RED_BUTTON_SEQUENCE, RED_BUTTON_GRID } from "../config/puzzle-config.js";
import { Sfx } from "../core/audio-manager.js";

const CELL = 62;
const RADIUS = 24;

export class RedButtonsPuzzle {
  constructor(scene, { cx, cy, saveManager, hud, onSolved }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.onSolved = onSolved;
    this.progress = 0;
    this.solved = saveManager.save.puzzleStates.redButtonsSolved;
    this.playerNear = false;

    this.container = scene.add.container(cx, cy).setDepth(9);

    const board = scene.add.graphics();
    const size = CELL * 3;
    board.fillStyle(0x9fd4e8, 1);
    board.fillRoundedRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 20, 12);
    board.lineStyle(4, 0x33333d, 1);
    board.strokeRoundedRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 20, 12);
    this.container.add(board);

    this.buttons = new Map();
    RED_BUTTON_GRID.forEach((rowLabels, row) => {
      rowLabels.forEach((label, col) => {
        const x = (col - 1) * CELL;
        const y = (row - 1) * CELL;
        const circle = scene.add.circle(x, y, RADIUS, this.solved ? 0x62c462 : 0xd94f4f, 1);
        circle.setStrokeStyle(3.5, 0x33333d, 1);
        this.container.add(circle);
        circle.on("pointerover", () => circle.setScale(1.08));
        circle.on("pointerout", () => circle.setScale(1));
        circle.on("pointerdown", () => this.click(label, circle));
        this.buttons.set(label, circle);
      });
    });

    this.flashRect = scene.add
      .rectangle(cx, cy, size + 20, size + 20, 0xffffff, 0)
      .setDepth(10);
  }

  click(label, circle) {
    if (this.solved) {
      this.scene.tweens.add({ targets: circle, scale: 1.15, duration: 90, yoyo: true });
      return;
    }

    const expected = RED_BUTTON_SEQUENCE[this.progress];
    if (label === expected) {
      this.progress += 1;
      Sfx.puzzleStep();
      circle.setFillStyle(0xf2c94c, 1); // aceso = progresso
      this.scene.tweens.add({ targets: circle, scale: 1.18, duration: 90, yoyo: true });
      if (this.progress >= RED_BUTTON_SEQUENCE.length) this.complete();
    } else {
      // Erro: reseta TUDO — não continua parcialmente.
      this.progress = 0;
      Sfx.puzzleError();
      this.buttons.forEach((button) => button.setFillStyle(0xd94f4f, 1));
      this.flash(0xd1495b);
      this.hud.toast("Sequência reiniciada", { icon: "✗", duration: 1800 });
    }
  }

  flash(color) {
    this.flashRect.setFillStyle(color, 0.4);
    this.scene.tweens.add({
      targets: this.flashRect,
      fillAlpha: 0,
      duration: 460,
      ease: "Cubic.out"
    });
  }

  complete() {
    this.solved = true;
    Sfx.puzzleSolved();
    this.flash(0x62c462);
    this.buttons.forEach((button) => {
      button.setFillStyle(0x62c462, 1);
      this.scene.tweens.add({
        targets: button,
        scale: { from: 1.25, to: 1 },
        duration: 260,
        delay: Math.random() * 200
      });
    });
    this.sm.solvePuzzle("redButtonsSolved");
    this.hud.toast("Área secreta desbloqueada! ✓", { icon: "✓", duration: 2600 });
    // entra na área secreta após a animação (300–700 ms)
    this.scene.time.delayedCall(520, () => {
      if (this.onSolved) this.onSolved();
    });
  }

  update(px, py) {
    if (this.solved) return;
    const near = Math.hypot(px - this.container.x, py - this.container.y) <= 420;
    if (near === this.playerNear) return;
    this.playerNear = near;
    this.buttons.forEach((button) => {
      if (near) button.setInteractive({ useHandCursor: true });
      else button.disableInteractive();
    });
  }

  destroy() {
    this.container.destroy();
    this.flashRect.destroy();
  }
}
