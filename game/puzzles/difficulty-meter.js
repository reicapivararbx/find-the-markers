// PUZZLE DO MEDIDOR DE DIFICULDADE (página 8 do PDF).
// Usa CLIQUE do mouse / toque (não é interação com E).
// Sequência exata: Effortless, Easy, Medium, Why, Hard, Hard, Easy, Easy, Medium, Hard.
// Erro reinicia a sequência sem quebrar o save.
import { DIFFICULTY_SEQUENCE } from "../config/puzzle-config.js";
import { METER_ROWS, difficultyColor } from "../config/difficulty-metadata.js";
import { GAMEPLAY } from "../config/game-config.js";
import { Sfx } from "../core/audio-manager.js";

const ROW_HEIGHT = 20;
const ROW_WIDTH = 200;

export class DifficultyMeterPuzzle {
  constructor(scene, { cx, topY, saveManager, hud, onSolved }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.onSolved = onSolved;
    this.progress = 0;
    this.solved = saveManager.save.puzzleStates.difficultySolved;
    this.playerNear = false;

    this.container = scene.add.container(cx, topY).setDepth(9);

    // corpo do medidor
    const body = scene.add.graphics();
    const totalHeight = METER_ROWS.length * ROW_HEIGHT + 16;
    body.fillStyle(0xfdfaf1, 1);
    body.fillRoundedRect(-ROW_WIDTH / 2 - 10, -8, ROW_WIDTH + 20, totalHeight + 16, 10);
    body.lineStyle(4, 0x33333d, 1);
    body.strokeRoundedRect(-ROW_WIDTH / 2 - 10, -8, ROW_WIDTH + 20, totalHeight + 16, 10);
    this.container.add(body);

    // 12 linhas clicáveis, ordem visual do desenho (Finale no topo ... Effortless na base)
    this.rows = METER_ROWS.map((label, index) => {
      const y = index * ROW_HEIGHT + ROW_HEIGHT / 2 + 2;
      const rowColor = difficultyColor(label);
      const rect = scene.add.rectangle(0, y, ROW_WIDTH, ROW_HEIGHT - 2, rowColor, 0.92);
      const text = scene.add
        .text(0, y, label, {
          fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
          fontSize: "13px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#33333d",
          strokeThickness: 2.5
        })
        .setOrigin(0.5);
      this.container.add([rect, text]);

      rect.on("pointerover", () => rect.setScale(1.04, 1.08));
      rect.on("pointerout", () => rect.setScale(1, 1));
      rect.on("pointerdown", () => this.click(label, rect));

      return { label, rect, index };
    });

    if (this.solved) {
      this.rows.forEach((row) => row.rect.setFillStyle(0x62c462, 0.55));
    }

    // contador discreto de progresso
    this.progressText = scene.add
      .text(cx, topY + totalHeight + 22, this.solved ? "Sequência correta! ✓" : "Clique na ordem das dificuldades", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "15px",
        color: "#33333d",
        backgroundColor: "#fdfaf1dd",
        padding: { x: 8, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(9);

    this.flashRect = scene.add
      .rectangle(cx, topY + totalHeight / 2, ROW_WIDTH + 20, totalHeight + 16, 0xffffff, 0)
      .setDepth(10);

    this.interactiveEnabled = false;
  }

  click(label, rect) {
    if (this.solved) return;

    const expected = DIFFICULTY_SEQUENCE[this.progress];
    if (label === expected) {
      this.progress += 1;
      Sfx.puzzleStep();
      this.scene.tweens.add({
        targets: rect,
        alpha: { from: 1, to: 0.35 },
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

  // Cliques só valem perto do medidor (evita clicar "através" das paredes).
  update(px, py) {
    if (this.solved) return;
    const near = Math.hypot(px - this.container.x, py - this.container.y - 100) <= GAMEPLAY.puzzleClickRadius;
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
