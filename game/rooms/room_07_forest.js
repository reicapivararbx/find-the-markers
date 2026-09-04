// PÁGINA 7 — FLORESTA (top-down 2.5D).
import { kit } from "../scenes/room-kit.js";
import { RedButtonsPuzzle } from "../puzzles/red-buttons.js";

export default {
  id: "room_07_forest",
  panelMarkerIds: [
    "forest_easy_1",
    "forest_easy_2",
    "forest_easy_3",
    "forest_tree_sleeper",
    "forest_egg_demon"
  ],

  spawns: {
    default: { x: 160, y: 600 },
    from_room_08: { x: 160, y: 600 },
    from_room_04: { x: 160, y: 600 },
    from_room_05: { x: 1280, y: 600 },
    from_room_06: { x: 1080, y: 620 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } },
    { key: "orchard", x: 120, arrowY: 280, zone: { x: 40, y: 200, width: 160, height: 120 } },
    {
      key: "secretComputer",
      arrow: false,
      zone: { x: 1100, y: 520, width: 150, height: 160 }
    }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xbde3c9, 0xe4f5d5);
    kit.cloud(scene, 300, 110, 0.9);
    kit.cloud(scene, 900, 90, 0.8);
    kit.ground(scene, ctx, 0x8fbc66);
    kit.dirtPath(scene, [
      [40, 520],
      [300, 560],
      [700, 580],
      [1100, 540],
      [1400, 520]
    ], 72);
    kit.grassTufts(scene, [
      [180, 700],
      [400, 680],
      [640, 720],
      [880, 690],
      [1120, 710],
      [1360, 680]
    ]);

    kit.tree(scene, ctx, 200, 420, { scale: 1.1, canopy: 0x7cae62 });
    kit.tree(scene, ctx, 930, 400, { scale: 1.5, canopy: 0x86b45e });
    kit.tree(scene, ctx, 1290, 440, { scale: 1.15, canopy: 0x9dc471 });
    kit.tree(scene, ctx, 480, 280, { scale: 0.9, canopy: 0x6fae5a });
    kit.bush(scene, ctx, 500, 700, 1.1);
    kit.bush(scene, ctx, 1210, 700, 0.9);
    kit.bush(scene, ctx, 340, 500, 0.85);

    kit.crate(scene, ctx, 240, 620, 70, 48, 0xb98a5a);
    kit.crate(scene, ctx, 560, 640, 64, 48, 0xb98a5a);
    kit.rocks(scene, ctx, 700, 420, 1.1);
    kit.bricks(scene, ctx, 150, 700, 1);
    kit.branch(scene, ctx, 300, 480, 480);

    // estrada com tartaruga
    const road = scene.add.graphics().setDepth(-46);
    road.fillStyle(0x4b4f57, 1);
    road.fillRect(300, 560, 760, 36);
    road.fillStyle(0xf2c94c, 1);
    for (let x = 330; x < 1040; x += 90) road.fillRect(x, 574, 30, 5);
    scene.add.image(760, 575, "turtle").setDepth(576);

    kit.signBoard(scene, ctx, 660, 620, 170, 70, ["Welcome to", "Robloxity!"], { fill: 0xdcb476 });

    // poste + porta secreta
    const pole = scene.add.graphics().setDepth(620);
    pole.fillStyle(0x8a6238, 1);
    pole.fillRect(1177, 480, 16, 160);
    pole.lineStyle(3, 0x33333d, 0.7);
    pole.strokeRect(1177, 480, 16, 160);
    kit.shadow(scene, 1185, 640, 28, 12, 0.25);

    const door = scene.add.graphics().setDepth(640);
    door.fillStyle(0x2d3b63, 0.9);
    door.fillRoundedRect(1112, 520, 120, 140, 8);
    door.lineStyle(4, 0x56ccf2, 0.9);
    door.strokeRoundedRect(1112, 520, 120, 140, 8);
    door.fillStyle(0x56ccf2, 0.25);
    door.fillRect(1122, 530, 100, 120);
    scene.add
      .text(1172, 500, "?", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "26px",
        fontStyle: "bold",
        color: "#56ccf2"
      })
      .setOrigin(0.5)
      .setDepth(641)
      .setName("secret_door_hint");

    const doorGlow = scene.add.rectangle(1172, 590, 120, 140, 0x56ccf2, 0.12).setDepth(639);
    doorGlow.setName("secret_door_glow");
    scene.tweens.add({
      targets: doorGlow,
      alpha: 0.28,
      duration: 900,
      yoyo: true,
      repeat: -1
    });
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;

    scene.redButtons = new RedButtonsPuzzle(scene, {
      cx: 1185,
      cy: 400,
      saveManager: sm,
      hud,
      onSolved: () => {
        scene.time.delayedCall(540, () => {
          const conn = { to: "room_06_secret_computer", arriveAt: "from_room_07" };
          if (!scene.transitioning) scene.travel(conn);
        });
      }
    });

    if (sm.save.puzzleStates.redButtonsSolved) {
      const hint = scene.children.getByName("secret_door_hint");
      hint?.setText("→");
    }
  }
};
