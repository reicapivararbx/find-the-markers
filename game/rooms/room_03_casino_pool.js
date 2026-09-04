// PÁGINA 3 — SALÃO DE SINUCA (interior top-down 2.5D).
// Mesa de bilhar, markers 8-ball / bouncer / cue. Esquerda: volta à galeria.
import { kit } from "../scenes/room-kit.js";

export default {
  id: "room_03_casino_pool",
  panelMarkerIds: [],

  spawns: {
    default: { x: 180, y: 600 },
    from_room_02: { x: 180, y: 600 }
  },

  gates: [
    { key: "back", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.interiorWall(scene, ctx, 0xefe3cd, 0x5f9e6b);

    // lâmpada decorativa
    const lamp = scene.add.graphics().setDepth(-20);
    lamp.lineStyle(4, 0x33333d, 0.8);
    lamp.lineBetween(740, 40, 740, 120);
    lamp.fillStyle(0x2d3b63, 1);
    lamp.fillRoundedRect(660, 120, 160, 50, 14);
    lamp.fillStyle(0xffe08a, 0.18);
    lamp.fillEllipse(740, 280, 280, 160);

    // mesa de bilhar no chão (footprint collider)
    const tableBase = 560;
    kit.shadow(scene, 740, tableBase + 8, 360, 40, 0.35);
    const table = scene.add.graphics().setDepth(tableBase);
    table.fillStyle(0x2f7a4f, 1);
    table.fillRoundedRect(560, tableBase - 120, 360, 120, 12);
    table.lineStyle(5, 0x8a6238, 1);
    table.strokeRoundedRect(560, tableBase - 120, 360, 120, 12);
    table.fillStyle(0xfdfaf1, 0.9);
    table.fillRoundedRect(575, tableBase - 105, 330, 90, 8);
    [
      [620, tableBase - 70, 0xd1495b],
      [700, tableBase - 60, 0xf2c94c],
      [820, tableBase - 75, 0x33333d],
      [870, tableBase - 55, 0x56ccf2]
    ].forEach(([x, y, color]) => {
      table.fillStyle(color, 1);
      table.fillCircle(x, y, 10);
      table.lineStyle(2, 0x33333d, 0.6);
      table.strokeCircle(x, y, 10);
    });
    ctx.solid(570, tableBase - 40, 340, 44);

    // porta decorativa à direita
    const door = scene.add.graphics().setDepth(500);
    door.fillStyle(0xfdfaf1, 1);
    door.fillRect(1290, 280, 110, 200);
    door.lineStyle(4, 0x33333d, 0.7);
    door.strokeRect(1290, 280, 110, 200);
    door.fillStyle(0xf2c94c, 1);
    door.fillCircle(1310, 380, 9);

    // taco na parede
    const cue = scene.add.graphics().setDepth(-15);
    cue.lineStyle(6, 0xc99a5f, 1);
    cue.lineBetween(180, 80, 420, 160);
  },

  wire() {}
};
