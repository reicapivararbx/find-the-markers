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
    kit.tree(scene, ctx, 640, 460, { scale: 1.05, fruits: 5, canopy: 0x8fba6a });
    kit.tree(scene, ctx, 860, 500, { scale: 1.15, fruits: 6 });
    kit.bush(scene, ctx, 200, 700, 1.0);
    kit.bush(scene, ctx, 760, 680, 0.9);

    kit.crate(scene, ctx, 180, 620, 70, 48, 0xb98a5a);
    kit.crate(scene, ctx, 560, 640, 70, 48, 0xb98a5a);
    kit.crate(scene, ctx, 860, 620, 70, 48, 0xb98a5a);
    kit.rocks(scene, ctx, 450, 360, 0.9);
    kit.branch(scene, ctx, 250, 420, 380);

    const standX = 1180;
    const standBase = 700;
    kit.shadow(scene, standX, standBase + 4, 160, 24, 0.28);
    const stand = scene.add.graphics().setDepth(standBase - 40);
    stand.fillStyle(0xc4b8a0, 1);
    stand.fillRoundedRect(standX - 70, standBase - 36, 140, 36, 6);
    stand.lineStyle(3, 0x33333d, 0.85);
    stand.strokeRoundedRect(standX - 70, standBase - 36, 140, 36, 6);
    ctx.solid(standX - 64, standBase - 28, 128, 30);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;

    const keeper = new Npc(scene, {
      id: "meter_keeper",
      x: 980,
      y: 520,
      texture: ensureMarkerTexture(scene, "Hard", "note"),
      scale: 1.3,
      dialogue:
        "Play on the order of the difficulties of the previous markers. And if you do correctly.. You can collect me."
    });
    ctx.addNpc(keeper);

    scene.difficultyMeter = new DifficultyMeterPuzzle(scene, {
      cx: 1180,
      topY: 200,
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
