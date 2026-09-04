// PÁGINA 10 — ÁREA DOS CRÉDITOS (top-down 2.5D, acesso livre pela direita do spawn).
import { ensureMarkerTexture } from "../assets/textures.js";
import { kit } from "../scenes/room-kit.js";
import { BoxesPuzzle } from "../puzzles/boxes.js";

export default {
  id: "room_10_credits",
  panelMarkerIds: [
    "credits_easy_1",
    "credits_easy_2",
    "credits_medium",
    "credits_box_marker"
  ],

  spawns: {
    default: { x: 160, y: 600 },
    from_room_09: { x: 160, y: 600 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xcfe9f5, 0xe9f5dc);
    kit.cloud(scene, 260, 120, 0.9);
    kit.cloud(scene, 1000, 100, 1.1);
    kit.ground(scene, ctx, 0x9ec86f);
    kit.dirtPath(scene, [
      [40, 520],
      [200, 560],
      [720, 580],
      [1100, 560],
      [1300, 540]
    ], 70);
    kit.grassTufts(scene, [
      [180, 700],
      [420, 680],
      [900, 720],
      [1200, 690],
      [1360, 700]
    ]);

    // quadro de créditos no chão (obstáculo de base, não plataforma de pulo)
    const boardBase = 480;
    kit.shadow(scene, 720, boardBase + 8, 520, 28, 0.3);
    const gfx = scene.add.graphics().setDepth(boardBase);
    gfx.fillStyle(0xc99a5f, 1);
    gfx.fillRoundedRect(372, boardBase - 200, 696, 200, 12);
    gfx.lineStyle(6, 0x8a6238, 1);
    gfx.strokeRoundedRect(372, boardBase - 200, 696, 200, 12);
    gfx.fillStyle(0xfdfaf1, 1);
    gfx.fillRect(392, boardBase - 180, 656, 160);
    ctx.solid(400, boardBase - 28, 640, 32);

    scene.add
      .text(720, boardBase - 160, "Made by:", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "26px",
        fontStyle: "bold",
        color: "#33333d"
      })
      .setOrigin(0.5)
      .setDepth(boardBase + 1);

    const credits = [
      ["M", 0x2f7abf, "Miguel Reuter", "(Owner)"],
      ["M", 0x62c462, "Matteo Zanona", "(Tester)"],
      ["R", 0xd1495b, "Raphael José", "(Co-Owner)"]
    ];
    credits.forEach(([initial, color, name, role], index) => {
      const y = boardBase - 120 + index * 40;
      const avatar = scene.add.graphics().setDepth(boardBase + 1);
      avatar.fillStyle(color, 1);
      avatar.fillCircle(470, y, 16);
      avatar.lineStyle(3, 0x33333d, 0.9);
      avatar.strokeCircle(470, y, 16);
      scene.add
        .text(470, y, initial, {
          fontFamily: '"Comic Sans MS", sans-serif',
          fontSize: "16px",
          fontStyle: "bold",
          color: "#ffffff"
        })
        .setOrigin(0.5)
        .setDepth(boardBase + 2);
      scene.add
        .text(500, y, `${name}  ${role}`, {
          fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
          fontSize: "18px",
          color: "#33333d"
        })
        .setOrigin(0, 0.5)
        .setDepth(boardBase + 1);
    });

    kit.crate(scene, ctx, 200, 640, 70, 48, 0xc99a5f);
    kit.bush(scene, ctx, 100, 700, 0.9);
    kit.bush(scene, ctx, 1340, 700, 1.0);
  },

  wire(ctx) {
    const { scene, hud, sm } = ctx;

    const boxes = new BoxesPuzzle(scene, {
      saveManager: sm,
      hud,
      onAllOpened: () => ctx.getMarker("credits_box_marker")?.reveal()
    });
    ctx.addUpdatable({
      update: (px, py, interactJustDown, hudRef) => boxes.update(px, py, interactJustDown, hudRef)
    });

    if (sm.save.puzzleStates.creditsBoxesSolved) {
      scene.time.delayedCall(50, () => ctx.getMarker("credits_box_marker")?.reveal());
    }
  }
};
