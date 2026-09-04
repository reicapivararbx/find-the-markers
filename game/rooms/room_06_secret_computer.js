// PÁGINA 6 — ÁREA SECRETA (top-down 2.5D, atrás do puzzle 3x3).
// Cenário digital; markers Insane e Why no chão walkable. Esquerda: floresta.
import { kit } from "../scenes/room-kit.js";

export default {
  id: "room_06_secret_computer",
  panelMarkerIds: ["secret_insane", "secret_why"],

  spawns: {
    default: { x: 180, y: 600 },
    from_room_07: { x: 180, y: 600 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;

    const bg = scene.add.graphics().setDepth(-100);
    bg.fillStyle(0x1c2340, 1);
    bg.fillRect(0, 0, 1440, 810);
    bg.lineStyle(1, 0x35405e, 0.5);
    for (let x = 0; x < 1440; x += 60) bg.lineBetween(x, 0, x, 810);
    for (let y = 0; y < 810; y += 60) bg.lineBetween(0, y, 1440, y);
    bg.fillStyle(0x27405c, 1);
    bg.fillEllipse(400, 790, 900, 260);
    bg.fillEllipse(1100, 800, 800, 240);

    // bordas do mapa
    ctx.solid(0, 0, 18, 810);
    ctx.solid(1422, 0, 18, 810);
    ctx.solid(0, 0, 1440, 28);
    ctx.solid(0, 792, 1440, 18);

    // estrada digital (decoração)
    const road = scene.add.graphics().setDepth(-80);
    road.fillStyle(0x3a4a6b, 1);
    road.fillTriangle(1080, 810, 1300, 430, 1360, 430);
    road.fillStyle(0xf2c94c, 1);
    for (let i = 0; i < 5; i += 1) {
      road.fillRect(1105 + i * 42, 760 - i * 70, 26, 10);
    }

    const xMark = scene.add.graphics().setDepth(-70);
    xMark.fillStyle(0xd1495b, 0.95);
    xMark.fillCircle(1300, 110, 44);
    xMark.lineStyle(10, 0xffffff, 1);
    xMark.lineBetween(1282, 92, 1318, 128);
    xMark.lineBetween(1318, 92, 1282, 128);

    // janelas flutuantes (decoração, sem collider de plataforma)
    [
      [520, 160, 0.8],
      [980, 200, 0.7],
      [220, 280, 0.6]
    ].forEach(([x, y, s], index) => {
      const win = scene.add.graphics().setDepth(-60);
      win.fillStyle(0xfdfaf1, 0.92);
      win.fillRoundedRect(x, y, 130 * s, 90 * s, 5);
      win.lineStyle(2.5, 0x33333d, 0.7);
      win.strokeRoundedRect(x, y, 130 * s, 90 * s, 5);
      win.fillStyle(0x56ccf2, 0.7);
      win.fillRect(x + 4, y + 4, 122 * s, 14 * s);
      scene.tweens.add({
        targets: win,
        y: y + 8,
        duration: 1600 + index * 300,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut"
      });
    });

    // monitores no chão (obstáculos baixos, markers walkáveis ao lado)
    this.drawFloorMonitor(scene, ctx, 360, 520, 120);
    this.drawFloorMonitor(scene, ctx, 920, 540, 140);

    // computador gigante central
    const pcBase = 620;
    kit.shadow(scene, 720, pcBase + 6, 180, 28, 0.32);
    const pc = scene.add.graphics().setDepth(pcBase);
    pc.fillStyle(0xfdfaf1, 1);
    pc.fillRoundedRect(640, pcBase - 220, 160, 220, 10);
    pc.lineStyle(4, 0x33333d, 0.9);
    pc.strokeRoundedRect(640, pcBase - 220, 160, 220, 10);
    pc.fillStyle(0x56ccf2, 0.85);
    pc.fillRect(650, pcBase - 210, 140, 26);
    pc.fillStyle(0x33333d, 1);
    pc.fillEllipse(690, pcBase - 120, 10, 16);
    pc.fillEllipse(750, pcBase - 120, 10, 16);
    pc.lineStyle(4, 0x33333d, 1);
    pc.beginPath();
    pc.arc(720, pcBase - 70, 16, Math.PI * 0.15, Math.PI * 0.85);
    pc.strokePath();
    ctx.solid(650, pcBase - 28, 140, 32);

    // piso digital (walkable, sem solid full-width)
    const floor = scene.add.graphics().setDepth(-20);
    floor.fillStyle(0x2d3b63, 0.55);
    floor.fillRect(0, 700, 1440, 110);
    floor.lineStyle(2, 0x56ccf2, 0.25);
    for (let x = 0; x < 1440; x += 60) floor.lineBetween(x, 700, x, 810);

    kit.grassTufts(scene, [
      [180, 700],
      [560, 720],
      [900, 690],
      [1300, 710]
    ]);
  },

  drawFloorMonitor(scene, ctx, x, baseY, width) {
    kit.shadow(scene, x + width / 2, baseY + 4, width * 0.9, 18, 0.28);
    const gfx = scene.add.graphics().setDepth(baseY);
    gfx.fillStyle(0xfdfaf1, 0.95);
    gfx.fillRoundedRect(x, baseY - 64, width, 64, 6);
    gfx.lineStyle(3, 0x33333d, 0.8);
    gfx.strokeRoundedRect(x, baseY - 64, width, 64, 6);
    gfx.fillStyle(0x56ccf2, 0.85);
    gfx.fillRect(x + 4, baseY - 60, width - 8, 14);
    ctx.solid(x + 4, baseY - 22, width - 8, 24);
  },

  wire() {}
};
