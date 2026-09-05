// PÁGINA 5 — CASA NA MATA (top-down 2.5D, subárea da floresta).
import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";

export default {
  id: "room_05_house",
  panelMarkerIds: [],

  spawns: {
    default: { x: 180, y: 600 },
    from_room_07: { x: 180, y: 600 },
    from_room_08: { x: 180, y: 600 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xcfe9f5, 0xe4f5d5);
    kit.cloud(scene, 640, 120, 1.1);
    kit.cloud(scene, 1060, 90, 0.9);
    kit.cloud(scene, 1240, 200, 0.8);
    kit.ground(scene, ctx, 0x8fbc66);
    kit.dirtPath(
      scene,
      [
        [200, 560],
        [500, 580],
        [900, 560],
        [1400, 520]
      ],
      64
    );
    kit.grassTufts(scene, [
      [300, 700],
      [520, 680],
      [980, 720],
      [1200, 690],
      [1360, 700]
    ]);

    // capim alto (decoração de fundo / mid)
    const reeds = scene.add.graphics().setDepth(420);
    for (let x = 560; x < 1440; x += 26) {
      const h = 80 + ((x * 7919) % 70);
      reeds.lineStyle(3, 0x9dc471, 1);
      reeds.lineBetween(x, 480, x + ((x % 3) - 1) * 10, 480 - h);
      reeds.lineStyle(2, 0x7ca457, 0.9);
      reeds.lineBetween(x + 12, 480, x + 14 + ((x % 4) - 1) * 8, 480 - h * 0.8);
    }

    // casa — footprint collider na base
    const houseBase = 620;
    kit.shadow(scene, 300, houseBase + 8, 420, 32, 0.35);
    const gfx = scene.add.graphics().setDepth(houseBase);
    gfx.fillStyle(0xf2df9a, 1);
    gfx.fillRect(90, houseBase - 280, 420, 280);
    gfx.lineStyle(4, 0x33333d, 0.85);
    gfx.strokeRect(90, houseBase - 280, 420, 280);
    gfx.fillStyle(0xd98a8a, 1);
    gfx.fillTriangle(60, houseBase - 280, 540, houseBase - 280, 300, houseBase - 420);
    gfx.lineStyle(4, 0x33333d, 0.85);
    gfx.beginPath();
    gfx.moveTo(60, houseBase - 280);
    gfx.lineTo(300, houseBase - 420);
    gfx.lineTo(540, houseBase - 280);
    gfx.strokePath();
    gfx.fillStyle(0xbfe8f7, 1);
    gfx.fillRect(140, houseBase - 220, 90, 90);
    gfx.strokeRect(140, houseBase - 220, 90, 90);
    gfx.lineBetween(185, houseBase - 220, 185, houseBase - 130);
    gfx.lineBetween(140, houseBase - 175, 230, houseBase - 175);
    gfx.fillStyle(0xe8c9c9, 1);
    gfx.fillRect(330, houseBase - 160, 100, 160);
    gfx.strokeRect(330, houseBase - 160, 100, 160);
    gfx.fillStyle(0xf2c94c, 1);
    gfx.fillCircle(415, houseBase - 80, 8);
    ctx.solid(100, houseBase - 36, 400, 40);

    // água + tronco (obstáculos walkáveis em volta)
    kit.water(scene, 620, 640, 520, 90);
    kit.log(scene, ctx, 100, 1300, 620);

    kit.bush(scene, ctx, 480, 700, 1.0);
    kit.bush(scene, ctx, 1380, 700, 0.9);

    // papel dos 5 ovos — clue da porta branca (321123)
    const paper = scene.add.graphics().setDepth(610);
    paper.fillStyle(0xfdfaf1, 1);
    paper.fillRoundedRect(900, 590, 54, 36, 4);
    paper.lineStyle(2, 0x33333d, 0.7);
    paper.strokeRoundedRect(900, 590, 54, 36, 4);
    paper.lineStyle(1.5, 0x33333d, 0.45);
    paper.lineBetween(910, 600, 944, 600);
    paper.lineBetween(910, 608, 940, 608);
    paper.lineBetween(910, 616, 936, 616);
    scene.add
      .text(927, 608, "321123", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#33333d"
      })
      .setOrigin(0.5)
      .setDepth(611)
      .setAlpha(0.55);
  },

  wire(ctx) {
    const { scene, hud } = ctx;
    const paper = new Interactable(scene, {
      id: "egg_area_paper",
      x: 927,
      y: 620,
      radius: 90,
      prompt: "[E] Papel amassado",
      action: () => {
        hud.toast("No papel: 321123", { icon: "📝", duration: 2800 });
      }
    });
    ctx.addUpdatable(paper);
  }
};
