// PÁGINA 1 — FEIRA / MARKET (top-down 2.5D).
// Barracas, barraca de frutas, turbina, NPCs. Direita: cidade (livre).
// Esquerda: gate futuro 30 markers (sem destino).
import { ensureMarkerTexture } from "../assets/textures.js";
import { kit } from "../scenes/room-kit.js";
import { Npc } from "../entities/npc.js";

export default {
  id: "room_01_market",
  panelMarkerIds: [
    "market_easy_1",
    "market_easy_2",
    "market_easy_3",
    "market_easy_4",
    "market_easy_5",
    "market_medium",
    "market_insane"
  ],

  spawns: {
    default: { x: 1280, y: 600 },
    from_room_04: { x: 1280, y: 600 },
    from_room_11: { x: 180, y: 600 }
  },

  gates: [
    { key: "future30", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xcfe9f5, 0xe8f5dc);
    kit.cloud(scene, 300, 130, 1.1);
    kit.cloud(scene, 760, 90, 0.8);
    kit.cloud(scene, 1180, 160, 0.95);
    kit.cobblestone(scene, ctx, 0);

    kit.turbine(scene, ctx, 560, 640);

    // barraca 1 — colliders só na base (balcão + postes)
    const stallBase = 620;
    kit.shadow(scene, 270, stallBase + 6, 280, 28, 0.3);
    const stall = scene.add.graphics().setDepth(stallBase);
    stall.fillStyle(0x8a6238, 1);
    stall.fillRect(150, stallBase - 140, 10, 140);
    stall.fillRect(400, stallBase - 140, 10, 140);
    stall.lineStyle(3, 0x33333d, 0.7);
    stall.strokeRect(150, stallBase - 140, 10, 140);
    stall.strokeRect(400, stallBase - 140, 10, 140);
    for (let i = 0; i < 7; i += 1) {
      stall.fillStyle(i % 2 ? 0xfdfaf1 : 0xd1495b, 1);
      stall.fillRect(140 + i * 40, stallBase - 160, 40, 28);
    }
    stall.lineStyle(4, 0x33333d, 0.85);
    stall.strokeRect(140, stallBase - 160, 280, 28);
    stall.fillStyle(0xc99a5f, 1);
    stall.fillRect(170, stallBase - 40, 220, 28);
    stall.lineStyle(3, 0x33333d, 0.8);
    stall.strokeRect(170, stallBase - 40, 220, 28);
    ctx.solid(160, stallBase - 24, 240, 28);
    kit.crate(scene, ctx, 400, 640, 70, 48, 0xb98a5a);

    // barraca de frutas
    const fruitBase = 630;
    kit.shadow(scene, 760, fruitBase + 6, 280, 28, 0.28);
    const fruits = scene.add.graphics().setDepth(fruitBase);
    fruits.fillStyle(0xf2994a, 1);
    fruits.fillTriangle(620, fruitBase - 140, 920, fruitBase - 140, 770, fruitBase - 230);
    fruits.fillStyle(0xfdfaf1, 1);
    fruits.fillTriangle(695, fruitBase - 140, 845, fruitBase - 140, 770, fruitBase - 230);
    fruits.lineStyle(4, 0x33333d, 0.85);
    fruits.beginPath();
    fruits.moveTo(620, fruitBase - 140);
    fruits.lineTo(770, fruitBase - 230);
    fruits.lineTo(920, fruitBase - 140);
    fruits.strokePath();
    fruits.fillStyle(0x8a6238, 1);
    fruits.fillRect(766, fruitBase - 140, 8, 100);
    fruits.fillStyle(0xc99a5f, 1);
    fruits.fillRect(640, fruitBase - 40, 240, 28);
    fruits.lineStyle(3, 0x33333d, 0.8);
    fruits.strokeRect(640, fruitBase - 40, 240, 28);
    ctx.solid(640, fruitBase - 24, 240, 28);
    [
      [680, fruitBase - 48, 0xeb5757],
      [730, fruitBase - 54, 0xf2c94c],
      [840, fruitBase - 48, 0xeb5757],
      [880, fruitBase - 52, 0xf2994a]
    ].forEach(([x, y, color]) => {
      fruits.fillStyle(color, 1);
      fruits.fillCircle(x, y, 11);
    });
    fruits.fillStyle(0xf2c94c, 1);
    fruits.fillEllipse(770, fruitBase - 50, 40, 18);
    kit.crate(scene, ctx, 540, 650, 70, 48, 0xb98a5a);

    kit.bricks(scene, ctx, 70, 680, 2);

    // papel no chão (decoração)
    const paper = scene.add.graphics().setDepth(580);
    paper.save();
    paper.translateCanvas(500, 700);
    paper.rotateCanvas(-0.12);
    paper.fillStyle(0xfdf8dd, 1);
    paper.fillRect(-34, -24, 68, 48);
    paper.lineStyle(2, 0x8a6238, 0.7);
    paper.strokeRect(-34, -24, 68, 48);
    paper.fillStyle(0x33333d, 0.8);
    paper.fillRect(-22, -14, 12, 3);
    paper.fillRect(-2, -14, 12, 3);
    paper.fillRect(-22, -4, 12, 3);
    paper.fillRect(-2, -4, 12, 3);
    paper.fillRect(-22, 6, 12, 3);
    paper.fillRect(-2, 6, 12, 3);
    paper.restore();
  },

  wire(ctx) {
    const { scene } = ctx;
    ctx.addNpc(
      new Npc(scene, {
        id: "tophat_walker",
        x: 480,
        y: 680,
        texture: ensureMarkerTexture(scene, "Easy", "tophat"),
        scale: 1.2,
        dialogue: "Nice day at the market!"
      })
    );
  }
};
