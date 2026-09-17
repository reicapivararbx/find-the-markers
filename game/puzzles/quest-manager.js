// QuestManager — spawner reutilizável das quests FIND-N por sala.
// Uma única arquitetura serve às quests sombrias (3 entidades / 5 vestígios),
// células de energia, moedas escondidas, fragmentos de glitch e componentes.
// Progresso vive no save (save-manager.questFind); aqui só spawn e coleta.
import { HAND_DRAWN_QUESTS } from "../config/hand-drawn-markers.js";
import { questState } from "../progression/quests.js";
import { QuestItemEntity } from "../entities/quest-item.js";

export class QuestManager {
  constructor(scene, { roomId, saveManager, hud }) {
    this.scene = scene;
    this.items = [];

    for (const quest of HAND_DRAWN_QUESTS) {
      const state = questState(saveManager.save, quest.id);
      if (state.completed) continue;
      quest.items
        .filter((item) => item.room === roomId && !state.foundIds.includes(item.id))
        .forEach((item) => {
          const entity = new QuestItemEntity(scene, item, quest, saveManager, hud);
          scene.physics.add.overlap(scene.player.sprite, entity.zone, () => entity.tryCollect());
          this.items.push(entity);
        });
    }
  }

  destroy() {
    this.items.forEach((item) => item.destroy());
    this.items = [];
  }
}
