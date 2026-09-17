// Testes das quests FIND-N reutilizáveis + gating de coleta dos conceituais.
import test from "node:test";
import assert from "node:assert/strict";
import { SaveManager, migrateSave, createDefaultSave } from "../game/save/save-manager.js";
import { recordQuestFind, isQuestCompleted, questProgress } from "../game/progression/quests.js";
import { isCollectible, lockedReason } from "../game/config/marker-registry.js";
import { QUEST_BY_ID } from "../game/config/hand-drawn-markers.js";

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

test("recordQuestFind: idempotente, progride e conclui uma única vez", () => {
  const save = createDefaultSave();
  const questId = "quest_hidden_coins";
  const r1 = recordQuestFind(save, questId, "hidden_coin_1");
  assert.equal(r1.isNew, true);
  assert.equal(r1.found, 1);
  const r2 = recordQuestFind(save, questId, "hidden_coin_1");
  assert.equal(r2.isNew, false);
  assert.equal(r2.found, 1);
  assert.equal(r2.justCompleted, false);
  recordQuestFind(save, questId, "hidden_coin_2");
  const r4 = recordQuestFind(save, questId, "hidden_coin_3");
  assert.equal(r4.found, 3);
  assert.equal(r4.justCompleted, true);
  const r5 = recordQuestFind(save, questId, "hidden_coin_3");
  assert.equal(r5.justCompleted, false);
});

test("questFind persiste e emite eventos apenas em novidade", () => {
  const sm = new SaveManager(fakeStorage());
  const r1 = sm.questFind("quest_umbra_shards", "umbra_shard_1");
  assert.equal(r1.isNew, true);
  const again = sm.questFind("quest_umbra_shards", "umbra_shard_1");
  assert.equal(again.isNew, false);
  const progress = sm.questProgress("quest_umbra_shards");
  assert.equal(progress.found, 1);
  assert.equal(progress.target, 3);
});

test("progresso de quest sobrevive a reload (novo manager, mesmo storage)", () => {
  const storage = fakeStorage();
  const smA = new SaveManager(storage);
  smA.load();
  smA.questFind("quest_broken_remains", "broken_remains_1");
  smA.questFind("quest_broken_remains", "broken_remains_2");
  const smB = new SaveManager(storage);
  smB.load();
  assert.equal(smB.questProgress("quest_broken_remains").found, 2);
});

test("Money Marker só é coletável com as 3 moedas escondidas", () => {
  const save = createDefaultSave();
  const money = { id: "money_marker", mode: "touch", questId: "quest_hidden_coins" };
  assert.equal(isCollectible(money, save), false);
  assert.match(lockedReason(money, save), /moedas escondidas/);
  save.quests["quest_hidden_coins"] = { foundIds: ["c1", "c2", "c3"], completed: true };
  assert.equal(isCollectible(money, save), true);
});

test("Clock Marker depende do puzzleState clockSolved (unlockKey)", () => {
  const save = createDefaultSave();
  const clock = { id: "clock_marker", mode: "touch", unlockKey: "clockSolved", lockedMessage: "O ponteiro parou na hora errada." };
  assert.equal(isCollectible(clock, save), false);
  assert.match(lockedReason(clock, save), /ponteiro/);
  save.puzzleStates.clockSolved = true;
  assert.equal(isCollectible(clock, save), true);
});

test("marker secreto com questId e mode hidden coleta após a quest", () => {
  const save = createDefaultSave();
  const shadow = { id: "shadow_marker", mode: "hidden", questId: "quest_umbra_shards" };
  assert.equal(isCollectible(shadow, save), false);
  save.quests["quest_umbra_shards"] = { foundIds: ["a", "b", "c"], completed: true };
  assert.equal(isCollectible(shadow, save), true);
  // clássico hidden continua exigindo as caixas dos créditos
  const classic = { id: "credits_box_marker", mode: "hidden" };
  assert.equal(isCollectible(classic, save), false);
  save.puzzleStates.creditsBoxesSolved = true;
  assert.equal(isCollectible(classic, save), true);
});

test("todas as quests têm recompensa válida ou terminal/estado próprio", () => {
  for (const quest of Object.values(QUEST_BY_ID)) {
    assert.ok(quest.targetCount === quest.items.length, quest.id);
    if (quest.rewardMarkerId === null) {
      // quests sem marker-recompensa são resolvidas por puzzle próprio (máquina/terminal)
      assert.ok(["quest_energy_cells", "quest_mech_components"].includes(quest.id), quest.id);
    }
  }
});

test("migração v2→v3 preserva progresso de quests e normaliza lixo", () => {
  const migrated = migrateSave({
    version: 2,
    quests: {
      quest_hidden_coins: { foundIds: ["hidden_coin_1", "hidden_coin_1", 42], completed: false },
      lixo: null
    },
    markerLog: { lilac_marker: "2026-09-17T12:00:00.000Z", ruim: 7 },
    lastCollectedMarkerId: "lilac_marker"
  });
  assert.equal(migrated.quests.quest_hidden_coins.foundIds.length, 2); // dedupe + strings
  assert.equal(migrated.markerLog.lilac_marker, "2026-09-17T12:00:00.000Z");
  assert.equal(migrated.markerLog.ruim, undefined);
  assert.equal(migrated.lastCollectedMarkerId, "lilac_marker");
  assert.equal(isQuestCompleted(migrated, "quest_hidden_coins"), false);
});

test("collectMarker registra markerLog e lastCollectedMarkerId", () => {
  const sm = new SaveManager(fakeStorage());
  sm.load();
  sm.collectMarker("lilac_marker");
  assert.ok(sm.save.markerLog.lilac_marker);
  assert.equal(sm.save.lastCollectedMarkerId, "lilac_marker");
  assert.equal(sm.hasCollected("lilac_marker"), true);
});
