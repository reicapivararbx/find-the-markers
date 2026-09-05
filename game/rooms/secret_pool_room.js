import { kit } from "../scenes/room-kit.js";
import { ShadowWatcherPuzzle } from "../puzzles/shadow-watcher.js";
import { MysteriousCapybara } from "../puzzles/mysterious-capybara.js";

export default {
  id: "secret_pool_room",
  panelMarkerIds: ["capybara_code_marker"],

  spawns: {
    default: { x: 200, y: 600 },
    from_room_03: { x: 200, y: 600 },
    from_pool: { x: 200, y: 600 }
  },

  gates: [{ key: "exit", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }],

  build(ctx) {
    const { scene } = ctx;
    kit.interiorWall(scene, ctx, 0x1a1420, 0x2a2230);

    const floor = scene.add.graphics().setDepth(-40);
    floor.fillStyle(0x2a1e28, 1);
    floor.fillRect(0, 470, 1440, 340);
    floor.fillStyle(0x3a2a38, 0.5);
    for (let x = 40; x < 1400; x += 80) {
      floor.fillRect(x, 500, 40, 280);
    }

    [280, 520, 760, 1000, 1240].forEach((x, i) => {
      const lamp = scene.add.circle(x, 120, 18, 0xff4d6d, 0.12 + (i % 2) * 0.06).setDepth(40);
      scene.tweens.add({
        targets: lamp,
        alpha: { from: 0.08, to: 0.22 },
        scale: { from: 0.9, to: 1.25 },
        duration: 1100 + i * 90,
        yoyo: true,
        repeat: -1
      });
    });

    scene.add
      .text(720, 90, "SALA DAS SOMBRAS", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ff8fa3",
        stroke: "#0b0b12",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(200);

    scene.add
      .text(720, 130, "O Observador falou em pares", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "14px",
        color: "#a898a8",
        fontStyle: "italic"
      })
      .setOrigin(0.5)
      .setDepth(200);

    kit.crate(scene, ctx, 160, 620, 70, 40, 0x3a2a38);
    kit.crate(scene, ctx, 1280, 640, 70, 40, 0x3a2a38);

    const mist = scene.add.graphics().setDepth(100);
    mist.fillStyle(0xff2244, 0.04);
    mist.fillEllipse(720, 560, 900, 200);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;

    const watcher = new ShadowWatcherPuzzle(scene, {
      saveManager: sm,
      hud,
      addUpdatable: (u) => ctx.addUpdatable(u)
    });
    ctx.addUpdatable(watcher);

    const capy = new MysteriousCapybara(scene, {
      saveManager: sm,
      hud,
      addUpdatable: (u) => ctx.addUpdatable(u),
      getMarker: (id) => ctx.getMarker(id)
    });
    ctx.addUpdatable(capy);
  }
};
