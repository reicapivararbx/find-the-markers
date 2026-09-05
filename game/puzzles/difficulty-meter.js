// PUZZLE DO MEDIDOR DE DIFICULDADE (página 8 do PDF).
// Usa CLIQUE do mouse / toque (não é interação com E).
// Sequência exata: Effortless, Easy, Medium, Why, Hard, Hard, Easy, Easy, Medium, Hard.
// Erro reinicia a sequência sem quebrar o save.
import { DIFFICULTY_SEQUENCE } from "../config/puzzle-config.js";
import { METER_ROWS, difficultyColor } from "../config/difficulty-metadata.js";
import { GAMEPLAY } from "../config/game-config.js";
import { Sfx } from "../core/audio-manager.js";

const LAYOUT = Object.freeze({
  panelW: 300,
  padX: 14,
  padTop: 44,
  padBottom: 14,
  titleY: 18,
  rowH: 28,
  rowGap: 3,
  corner: 12,
  depth: 400
});

function panelHeight() {
  const rowsH = METER_ROWS.length * LAYOUT.rowH + (METER_ROWS.length - 1) * LAYOUT.rowGap;
  return LAYOUT.padTop + rowsH + LAYOUT.padBottom;
}

export class DifficultyMeterPuzzle {
  constructor(scene, { cx, topY, saveManager, hud, onSolved }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.onSolved = onSolved;
    this.progress = 0;
    this.solved = saveManager.save.puzzleStates.difficultySolved;
    this.playerNear = false;
    this.cx = cx;
    this.topY = topY;

    const h = panelHeight();
    const halfW = LAYOUT.panelW / 2;

    this.container = scene.add.container(cx, topY).setDepth(LAYOUT.depth);

    const body = scene.add.graphics();
    body.fillStyle(0xf6f2e8, 1);
    body.fillRoundedRect(-halfW, 0, LAYOUT.panelW, h, LAYOUT.corner);
    body.lineStyle(4, 0x33333d, 1);
    body.strokeRoundedRect(-halfW, 0, LAYOUT.panelW, h, LAYOUT.corner);
    body.fillStyle(0x33333d, 0.08);
    body.fillRoundedRect(-halfW + 4, 4, LAYOUT.panelW - 8, 32, 8);
    this.container.add(body);

    const title = scene.add
      .text(0, LAYOUT.titleY, "DIFFICULTY METER", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "15px",
        fontStyle: "bold",
        color: "#33333d"
      })
      .setOrigin(0.5);
    this.container.add(title);

    const rowW = LAYOUT.panelW - LAYOUT.padX * 2;
    this.rows = METER_ROWS.map((label, index) => {
      const y = LAYOUT.padTop + index * (LAYOUT.rowH + LAYOUT.rowGap) + LAYOUT.rowH / 2;
      const rowColor = difficultyColor(label);
      const rect = scene.add.rectangle(0, y, rowW, LAYOUT.rowH, rowColor, 0.95);
      rect.setStrokeStyle(2, 0x33333d, 0.55);
      rect.setInteractive({ useHandCursor: true });

      const text = scene.add
        .text(0, y, label, {
          fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#2b2b33",
          strokeThickness: 3
        })
        .setOrigin(0.5);

      this.container.add([rect, text]);

      rect.on("pointerover", () => {
        if (!this.solved) rect.setScale(1.02, 1.06);
      });
      rect.on("pointerout", () => rect.setScale(1, 1));
      rect.on("pointerdown", () => this.click(label, rect));

      return { label, rect, text, index };
    });

    if (this.solved) {
      this.rows.forEach((row) => row.rect.setFillStyle(0x62c462, 0.55));
    }

    this.progressText = scene.add
      .text(cx, topY + h + 18, this.solved ? "Sequência correta! ✓" : "Clique na ordem das dificuldades", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "14px",
        color: "#33333d",
        backgroundColor: "#fdfaf1ee",
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0.5)
      .setDepth(LAYOUT.depth);

    this.flashRect = scene.add
      .rectangle(cx, topY + h / 2, LAYOUT.panelW, h, 0xffffff, 0)
      .setDepth(LAYOUT.depth + 1);

    this.rows.forEach((row) => row.rect.disableInteractive());
  }

  click(label, rect) {
    if (this.solved) return;

    const expected = DIFFICULTY_SEQUENCE[this.progress];
    if (label === expected) {
      this.progress += 1;
      Sfx.puzzleStep();
      this.scene.tweens.add({
        targets: rect,
        alpha: { from: 1, to: 0.4 },
        scaleX: { from: 1, to: 1.04 },
        scaleY: { from: 1, to: 1.08 },
        duration: 90,
        yoyo: true,
        repeat: 1
      });
      this.progressText.setText(`Sequência: ${this.progress}/10`);
      if (this.progress >= DIFFICULTY_SEQUENCE.length) this.complete();
    } else {
      this.progress = 0;
      Sfx.puzzleError();
      this.progressText.setText("Sequência: 0/10");
      this.flash(0xd1495b);
      this.hud.toast("Ordem incorreta. Tente novamente.", { icon: "✗", duration: 2200 });
    }
  }

  flash(color) {
    this.flashRect.setFillStyle(color, 0.35);
    this.scene.tweens.add({
      targets: this.flashRect,
      fillAlpha: 0,
      duration: 480,
      ease: "Cubic.out"
    });
  }

  complete() {
    this.solved = true;
    Sfx.puzzleSolved();
    this.flash(0x62c462);
    this.progressText.setText("Sequência correta! ✓");
    this.rows.forEach((row) => row.rect.setFillStyle(0x62c462, 0.55));
    this.sm.solvePuzzle("difficultySolved");
    this.hud.toast("Sequência correta! ✓", { icon: "✓", duration: 2600 });
    if (this.onSolved) this.onSolved();
  }

  update(px, py) {
    if (this.solved) return;
    const centerY = this.topY + panelHeight() / 2;
    const near = Math.hypot(px - this.cx, py - centerY) <= GAMEPLAY.puzzleClickRadius;
    if (near === this.playerNear) return;
    this.playerNear = near;
    this.rows.forEach((row) => {
      if (near) row.rect.setInteractive({ useHandCursor: true });
      else row.rect.disableInteractive();
    });
  }

  destroy() {
    this.container.destroy();
    this.progressText.destroy();
    this.flashRect.destroy();
  }
}
