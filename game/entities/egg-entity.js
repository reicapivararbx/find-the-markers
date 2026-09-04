// Ovo da missão da floresta (5 ovos, IDs egg_01..egg_05, progresso persistido).
// Top-down: sombra + depth ≈ y.
import { GAMEPLAY, PHYSICS } from "../config/game-config.js";
import { Sfx } from "../core/audio-manager.js";

export class EggEntity {
  constructor(scene, def, saveManager, hud) {
    this.scene = scene;
    this.def = def;
    this.sm = saveManager;
    this.hud = hud;
    this.collected = false;

    this.shadow = scene.add
      .ellipse(def.x, def.y - 2, 28, 12, 0x1a1a22, 0.24)
      .setDepth(def.y - 2);

    this.sprite = scene.add
      .image(def.x, def.y, "egg")
      .setOrigin(0.5, 1)
      .setDepth(def.y + PHYSICS.depthBias);

    scene.tweens.add({
      targets: this.sprite,
      angle: { from: -4, to: 4 },
      duration: 1200,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1
    });

    this.zone = scene.add.zone(
      def.x,
      def.y - 12,
      GAMEPLAY.collectRadius * 1.7,
      GAMEPLAY.collectRadius * 1.7
    );
    scene.physics.add.existing(this.zone, true);
  }

  tryCollect() {
    if (this.collected) return false;
    this.collected = true;
    this.zone.body.enable = false;
    Sfx.egg();
    this.sm.discoverEgg(this.def.id);
    const found = this.sm.save.discoveredEggIds.length;
    this.hud.toast(`Ovo encontrado: ${found}/5`, { icon: "🥚", duration: 2000 });
    this.hud.updateEggs(found);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.def.y - 46,
      alpha: 0,
      scale: 1.35,
      duration: 380,
      ease: "Cubic.out",
      onComplete: () => this.sprite.destroy()
    });
    if (this.shadow) {
      this.scene.tweens.add({ targets: this.shadow, alpha: 0, duration: 280 });
    }
    this.scene.time.delayedCall(60, () => this.zone.destroy());
    return true;
  }

  destroy() {
    this.sprite.destroy();
    this.shadow?.destroy();
    this.zone.destroy();
  }
}
