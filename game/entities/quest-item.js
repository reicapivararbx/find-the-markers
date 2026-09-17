// Item coletável de quest FIND-N (fragmento sombrio, vestígio, célula, moeda).
// Mesma linguagem do EggEntity: sombra + depth ≈ y + overlap de zona.
import { GAMEPLAY, PHYSICS } from "../config/game-config.js";
import { Sfx } from "../core/audio-manager.js";

const TEXTURE_BY_VARIANT = {
  shard: "quest_shard",
  remains: "quest_remains",
  cell: "quest_cell",
  coin: "quest_coin"
};

export class QuestItemEntity {
  constructor(scene, def, quest, saveManager, hud) {
    this.scene = scene;
    this.def = def;
    this.quest = quest;
    this.sm = saveManager;
    this.hud = hud;
    this.collected = false;

    this.shadow = scene.add
      .ellipse(def.x, def.y - 2, 24, 10, 0x1a1a22, 0.24)
      .setDepth(def.y - 2);

    this.sprite = scene.add
      .image(def.x, def.y, TEXTURE_BY_VARIANT[def.variant] || "quest_shard")
      .setOrigin(0.5, 1)
      .setDepth(def.y + PHYSICS.depthBias);

    scene.tweens.add({
      targets: this.sprite,
      y: def.y - 7,
      angle: { from: -5, to: 5 },
      duration: 1100,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1
    });

    this.zone = scene.add.zone(
      def.x,
      def.y - 10,
      GAMEPLAY.collectRadius * 1.6,
      GAMEPLAY.collectRadius * 1.6
    );
    scene.physics.add.existing(this.zone, true);
  }

  tryCollect() {
    if (this.collected || this.scene.transitioning || this.scene.inCutscene) return false;
    const result = this.sm.questFind(this.quest.id, this.def.id);
    if (!result.ok || !result.isNew) return false;
    this.collected = true;
    this.zone.body.enable = false;

    // UI discreta para quests sombrias: "??? 2/3" — nada de entregar o segredo
    const label = this.quest.discreet ? "???" : this.quest.title;
    this.hud.toast(`${label}: ${result.found}/${result.target}`, {
      icon: this.quest.discreet ? "❔" : "🧩",
      duration: 2000
    });
    if (result.justCompleted) {
      Sfx.unlock();
      this.hud.toast(this.quest.discreet ? "??? algo acordou em outro lugar…" : "Desafio completo!", {
        icon: "✨",
        duration: 2800
      });
    } else {
      Sfx.egg();
    }

    this.scene.tweens.add({
      targets: this.sprite,
      y: this.def.y - 40,
      alpha: 0,
      scale: 1.3,
      duration: 360,
      ease: "Cubic.out",
      onComplete: () => this.sprite.destroy()
    });
    if (this.shadow) this.scene.tweens.add({ targets: this.shadow, alpha: 0, duration: 260 });
    this.scene.time.delayedCall(60, () => this.zone.destroy());
    return true;
  }

  destroy() {
    this.sprite.destroy();
    this.shadow?.destroy();
    this.zone.destroy();
  }
}
