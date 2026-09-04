// NPC simples com balão de fala (aparece quando o jogador se aproxima).
// Top-down: sombra + depth ≈ y.
import { PHYSICS } from "../config/game-config.js";

const BUBBLE_WIDTH = 260;

export class Npc {
  constructor(scene, { id, x, y, texture, dialogue, scale = 1, flip = false }) {
    this.scene = scene;
    this.id = id;
    this.definition = { x, y, dialogue };

    this.shadow = scene.add
      .ellipse(x, y - 2, 32 * scale, 12 * scale, 0x1a1a22, 0.26)
      .setDepth(y - 2);

    this.sprite = scene.add
      .image(x, y, texture)
      .setOrigin(0.5, 1)
      .setDepth(y + PHYSICS.depthBias)
      .setScale(scale)
      .setFlipX(flip);

    scene.tweens.add({
      targets: this.sprite,
      y: y - 5,
      duration: 1100 + ((x * 13) % 300),
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1
    });

    const text = scene.add
      .text(0, 0, dialogue, {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "17px",
        color: "#33333d",
        align: "center",
        wordWrap: { width: BUBBLE_WIDTH - 30, useAdvancedWrap: true },
        lineSpacing: 3
      })
      .setOrigin(0.5);

    const width = BUBBLE_WIDTH;
    const height = Math.max(58, text.height + 26);
    const bg = scene.add.graphics();
    bg.fillStyle(0xfdfaf1, 0.97);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 14);
    bg.fillTriangle(-11, height / 2 - 2, 11, height / 2 - 2, 0, height / 2 + 13);
    bg.lineStyle(2.5, 0x33333d, 0.55);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 14);

    this.bubble = scene.add.container(0, 0, [bg, text]).setDepth(9000).setVisible(false);
    this.bubbleSize = { width, height };
    this.baseY = y;
  }

  update(px, py) {
    const distance = Math.hypot(px - this.sprite.x, py - this.baseY);
    const visible = distance <= 190;
    this.bubble.setVisible(visible);
    if (!visible) return;

    const view = this.scene.cameras.main.worldView;
    this.bubble.x = Phaser.Math.Clamp(
      this.sprite.x,
      view.left + this.bubbleSize.width / 2 + 10,
      view.right - this.bubbleSize.width / 2 - 10
    );
    this.bubble.y = Math.max(
      view.top + this.bubbleSize.height / 2 + 10,
      this.sprite.y - 74 - this.bubbleSize.height / 2
    );
  }

  destroy() {
    this.sprite.destroy();
    this.shadow?.destroy();
    this.bubble.destroy();
  }
}
