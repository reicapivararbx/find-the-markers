// MISSÃO DOS 5 OVOS (página 7 do PDF).
// "Find 5 eggs and then collect me." — marker só libera com 5/5.
// Progresso persistido: ovos achados continuam achados ao voltar.
import { EGG_QUEST } from "../config/puzzle-config.js";
import { EggEntity } from "../entities/egg-entity.js";

export class EggQuest {
  constructor(scene, { roomId, saveManager, hud }) {
    this.sm = saveManager;
    this.hud = hud;
    this.eggs = [];

    const total = EGG_QUEST.eggs.length;
    const found = saveManager.save.discoveredEggIds.length;
    hud.updateEggs(found, total);

    EGG_QUEST.eggs
      .filter((egg) => egg.room === roomId && !saveManager.save.discoveredEggIds.includes(egg.id))
      .forEach((egg) => {
        const entity = new EggEntity(scene, egg, saveManager, hud);
        scene.physics.add.overlap(scene.player.sprite, entity.zone, () => entity.tryCollect());
        this.eggs.push(entity);
      });
  }

  updateHud() {
    this.hud.updateEggs(this.sm.save.discoveredEggIds.length, EGG_QUEST.eggs.length);
  }

  destroy() {
    this.eggs.forEach((egg) => egg.destroy());
    this.eggs = [];
  }
}
