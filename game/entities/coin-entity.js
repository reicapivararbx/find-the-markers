import { GAMEPLAY } from "../config/game-config.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

export class CoinEntity {
  constructor(scene, def, saveManager, hud) {
    this.scene = scene;
    this.def = def;
    this.sm = saveManager;
    this.hud = hud;
    this.collected = false;

    this.shadow = scene.add.ellipse(def.x, def.y - 2, 22, 10, 0x1a1a22, 0.25).setDepth(def.y - 2);
    this.sprite = scene.add.circle(def.x, def.y - 12, 14, 0xf2c94c, 1).setDepth(def.y + 5);
    this.sprite.setStrokeStyle(3, 0xb8860b, 1);
    scene.add
      .text(def.x, def.y - 12, "¢", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#7a5a10"
      })
      .setOrigin(0.5)
      .setDepth(def.y + 6);

    this.zone = scene.add.zone(def.x, def.y - 8, GAMEPLAY.collectRadius * 1.6, GAMEPLAY.collectRadius * 1.6);
    scene.physics.add.existing(this.zone, true);

    scene.tweens.add({
      targets: this.sprite,
      y: def.y - 18,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
  }

  tryCollect() {
    if (this.collected) return false;
    if (!this.sm.collectCoin(this.def.id, 1)) return false;
    this.collected = true;
    Sfx.reveal();
    this.hud?.toast?.("+1 coin", { icon: "🪙", duration: 1600 });
    bus.emit(Events.COIN_COLLECTED, this.def.id);
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.zone?.destroy();
    return true;
  }

  update() {}
}
