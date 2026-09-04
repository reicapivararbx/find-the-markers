// PÁGINA 9 — SPAWN / INÍCIO (top-down 2.5D).
import { ensureMarkerTexture } from "../assets/textures.js";
import { kit } from "../scenes/room-kit.js";
import { Npc } from "../entities/npc.js";

export default {
  id: "room_09_spawn",
  panelMarkerIds: [
    "spawn_effortless",
    "spawn_easy",
    "spawn_medium",
    "spawn_insane",
    "spawn_why",
    "spawn_hard_1",
    "spawn_hard_2"
  ],

  spawns: {
    default: { x: 360, y: 640 },
    from_room_10: { x: 1280, y: 520 },
    from_room_08: { x: 140, y: 520 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xbfe8f7, 0xdff3c8);
    kit.cloud(scene, 200, 130, 1);
    kit.cloud(scene, 700, 90, 0.8);
    kit.cloud(scene, 1150, 150, 0.9);
    kit.ground(scene, ctx, 0x9ec86f);
    kit.dirtPath(scene, [
      [40, 520],
      [360, 560],
      [720, 600],
      [1100, 540],
      [1400, 520]
    ], 80);
    kit.grassTufts(scene, [
      [140, 700],
      [320, 680],
      [640, 720],
      [900, 700],
      [1120, 680],
      [1300, 700]
    ]);

    kit.tree(scene, ctx, 180, 380, { scale: 0.95, canopy: 0x7cae62 });
    kit.tree(scene, ctx, 1260, 360, { scale: 1.0, canopy: 0x86b45e });
    kit.bush(scene, ctx, 100, 700, 1.0);
    kit.bush(scene, ctx, 1340, 700, 0.9);

    // palco central com placa
    const stageBaseY = 620;
    kit.crate(scene, ctx, 500, stageBaseY, 440, 48, 0xd8d2c2);
    const gfx = scene.add.graphics().setDepth(stageBaseY - 40);
    gfx.fillStyle(0xefe7d8, 1);
    gfx.fillRect(500, stageBaseY - 200, 28, 160);
    gfx.fillRect(912, stageBaseY - 200, 28, 160);
    gfx.lineStyle(3, 0x33333d, 0.8);
    gfx.strokeRect(500, stageBaseY - 200, 28, 160);
    gfx.strokeRect(912, stageBaseY - 200, 28, 160);

    gfx.fillStyle(0xf6efdd, 1);
    gfx.fillRoundedRect(480, stageBaseY - 280, 480, 100, 10);
    gfx.lineStyle(4, 0x33333d, 0.9);
    gfx.strokeRoundedRect(480, stageBaseY - 280, 480, 100, 10);
    kit.shadow(scene, 720, stageBaseY - 230, 420, 28, 0.2);

    scene.add
      .text(720, stageBaseY - 250, "Find the Markers", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "36px",
        fontStyle: "bold",
        color: "#e8a13c",
        stroke: "#33333d",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(stageBaseY - 39);
    scene.add
      .text(720, stageBaseY - 212, "(Reuter's Mix)", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "20px",
        fontStyle: "italic",
        color: "#33333d"
      })
      .setOrigin(0.5)
      .setDepth(stageBaseY - 39);

    scene.add.image(420, stageBaseY - 80, "question_block").setDepth(stageBaseY - 20);
    kit.shadow(scene, 420, stageBaseY - 50, 48, 16, 0.22);

    kit.signBoard(scene, ctx, 1150, 560, 130, 90, ["Buh-Blah!"]);
    kit.crate(scene, ctx, 520, 360, 56, 48, 0xd8d2c2);
    kit.lampPost(scene, ctx, 300, 700);
    kit.bench(scene, ctx, 980, 700, 100);
  },

  wire(ctx) {
    const { scene } = ctx;
    const texture = ensureMarkerTexture(scene, "Easy", "classic");
    ctx.addNpc(
      new Npc(scene, {
        id: "spawn_mascot",
        x: 720,
        y: 560,
        texture,
        scale: 1.5,
        dialogue: "Welcome! Find the markers!"
      })
    );
  }
};
