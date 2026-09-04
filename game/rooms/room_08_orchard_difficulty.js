// PÁGINA 8 — POMAR DO MEDIDOR (top-down 2.5D).
import { ensureMarkerTexture } from "../assets/textures.js";
import { kit } from "../scenes/room-kit.js";
import { Npc } from "../entities/npc.js";
import { DifficultyMeterPuzzle } from "../puzzles/difficulty-meter.js";

export default {
  id: "room_08_orchard_difficulty",
  panelMarkerIds: [
    "orchard_easy_1",
    "orchard_easy_2",
    "orchard_hard_1",
    "orchard_glitch",
    "orchard_difficult_marker",
    "orchard_difficulty_final"
  ],

  spawns: {
    default: { x: 160, y: 600 },
    from_room_09: { x: 160, y: 600 },
    from_room_07: { x: 1280, y: 600 },
    from_room_05: { x: 1280, y: 600 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xc7ecf5, 0xe4f5d5);
    kit.cloud(scene, 320, 140, 1);
    kit.cloud(scene, 860, 100, 0.85);
    kit.ground(scene, ctx, 0x9ec86f);
    kit.dirtPath(scene, [
      [40, 520],
      [400, 560],
      [800, 540],
      [1200, 520],
      [1400, 520]
    ], 70);
    kit.grassTufts(scene, [
      [120, 700],
      [420, 680],
      [700, 720],
      [980, 690],
      [1260, 710]
    ]);

    kit.tree(scene, ctx, 340, 480, { scale: 1.25, fruits: 7 });
    kit.tree(scene, ctx, 700, 460, { scale: 1.05, fruits: 5, canopy: 0x8fba6a });
    kit.tree(scene, ctx, 990, 500, { scale: 1.15, fruits: 6 });
    kit.bush(scene, ctx, 200, 700, 1.0);
    kit.bush(scene, ctx, 850, 680, 0.9);

    kit.crate(scene, ctx, 180, 620, 70, 48, 0xb98a5a);
    kit.crate(scene, ctx, 560, 640, 70, 48, 0xb98a5a);
    kit.crate(scene, ctx, 860, 620, 70, 48, 0xb98a5a);
    kit.rocks(scene, ctx, 450, 360, 0.9);
    kit.branch(scene, ctx, 250, 420, 380);

    // torre do medidor
    const towerBase = 640;
    kit.shadow(scene, 1205, towerBase + 4, 200, 28, 0.3);
    const tower = scene.add.graphics().setDepth(towerBase);
    tower.fillStyle(0xd8d2c2, 1);
    tower.fillRoundedRect(1110, towerBase - 280, 190, 280, 10);
    tower.lineStyle(4, 0x33333d, 0.9);
    tower.strokeRoundedRect(1110, towerBase - 280, 190, 280, 10);
    tower.fillStyle(0x000000, 0.1);
    tower.fillRect(1260, towerBase - 280, 40, 280);
    ctx.solid(1120, towerBase - 36, 170, 40);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;

    const keeper = new Npc(scene, {
      id: "meter_keeper",
      x: 1200,
      y: 340,
      texture: ensureMarkerTexture(scene, "Hard", "note"),
      scale: 1.3,
      dialogue:
        "Play on the order of the difficulties of the previous markers. And if you do correctly.. You can collect me."
    });
    ctx.addNpc(keeper);

    scene.difficultyMeter = new DifficultyMeterPuzzle(scene, {
      cx: 1200,
      topY: 380,
      saveManager: sm,
      hud,
      onSolved: () => {
        keeper.destroy();
        ctx.getMarker("orchard_difficulty_final")?.reveal();
        hud.toast("You can collect me now!", { icon: "🎵", duration: 2400 });
      }
    });

    if (sm.save.puzzleStates.difficultySolved) {
      keeper.destroy();
      scene.time.delayedCall(50, () => ctx.getMarker("orchard_difficulty_final")?.reveal());
    }
  }
};
