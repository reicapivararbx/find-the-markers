// PÁGINA 2 — GALERIA DO CASINO (interior top-down 2.5D).
// Quadros dourados com markers Hard. Esquerda: [E] sair. Direita: sinuca.
import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { SlotMachine } from "../entities/slot-machine.js";

export default {
  id: "room_02_casino_gallery",
  panelMarkerIds: [],

  spawns: {
    default: { x: 180, y: 600 },
    from_casino_door: { x: 180, y: 600 },
    from_room_03: { x: 1280, y: 600 }
  },

  gates: [
    { key: "next", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.interiorWall(scene, ctx, 0xefe3cd, 0x5f9e6b);

    const trim = scene.add.graphics().setDepth(-20);
    trim.fillStyle(0xd9b45d, 0.45);
    trim.fillRect(0, 240, 1440, 40);

    // quadros na parede de fundo (decoração, markers no chão à frente)
    [270, 640, 1010].forEach((cx) => kit.goldFrame(scene, cx, 160, 140, 180));

    // pedestais / banco no chão (obstáculos de base)
    kit.crate(scene, ctx, 200, 560, 120, 48, 0x8a6238);
    kit.crate(scene, ctx, 560, 580, 200, 48, 0xa9805a);
    kit.crate(scene, ctx, 940, 560, 120, 48, 0x8a6238);

    // porta de saída (esquerda)
    const doorBase = 620;
    kit.shadow(scene, 115, doorBase + 4, 100, 22, 0.28);
    const door = scene.add.graphics().setDepth(doorBase);
    door.fillStyle(0x8a6238, 1);
    door.fillRoundedRect(60, doorBase - 200, 110, 200, 8);
    door.lineStyle(4, 0x33333d, 0.85);
    door.strokeRoundedRect(60, doorBase - 200, 110, 200, 8);
    door.fillStyle(0xf2c94c, 1);
    door.fillCircle(150, doorBase - 100, 8);
    scene.add
      .text(115, doorBase - 220, "SAÍDA", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "16px",
        fontStyle: "bold",
        color: "#33333d",
        backgroundColor: "#f2c94ccc",
        padding: { x: 6, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(doorBase + 1);
    ctx.solid(70, doorBase - 24, 90, 28);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;
    scene.exitDoor = new Interactable(scene, {
      id: "casino_exit",
      x: 115,
      y: 620,
      radius: 130,
      prompt: "[E] Sair do Casino",
      action: () => ctx.travel("exitCasino")
    });
    ctx.addUpdatable(scene.exitDoor);

    const slot = new SlotMachine(scene, {
      x: 720,
      y: 640,
      saveManager: sm,
      hud
    });
    ctx.addUpdatable(slot);
  }
};
