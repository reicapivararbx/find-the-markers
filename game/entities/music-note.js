import { GAMEPLAY } from "../config/game-config.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

export class MusicNoteEntity {
  constructor(scene, def, saveManager, hud) {
    this.scene = scene;
    this.def = def;
    this.sm = saveManager;
    this.hud = hud;
    this.collected = false;

    this.shadow = scene.add.ellipse(def.x, def.y - 2, 18, 8, 0x1a1a22, 0.2).setDepth(def.y - 2);
    this.sprite = scene.add
      .text(def.x, def.y - 16, "♪", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        color: "#39c5bb",
        stroke: "#1a1a28",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(def.y + 6);

    this.zone = scene.add.zone(def.x, def.y - 8, GAMEPLAY.collectRadius * 1.5, GAMEPLAY.collectRadius * 1.5);
    scene.physics.add.existing(this.zone, true);

    scene.tweens.add({
      targets: this.sprite,
      y: def.y - 24,
      angle: { from: -8, to: 8 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
  }

  tryCollect() {
    if (this.collected) return false;
    if (!this.sm.discoverMusicNote(this.def.id)) return false;
    this.collected = true;
    Sfx.mikuNote(0);
    const found = this.sm.save.discoveredMusicNoteIds.length;
    this.hud?.toast?.(`Nota musical ${found}/5`, { icon: "♪", duration: 1800 });
    bus.emit(Events.MUSIC_NOTE_FOUND, { id: this.def.id, found });
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.zone?.destroy();
    return true;
  }

  update() {}
}
