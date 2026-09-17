// PÁGINA 2 — GALERIA DO CASINO (interior top-down 2.5D).
// Quadros dourados com markers Hard. Esquerda: [E] sair. Direita: sinuca.
import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { SlotMachine } from "../entities/slot-machine.js";

export default {
  id: "room_02_casino_gallery",
  panelMarkerIds: [],
  ambience: "casino",

  spawns: {
    default: { x: 180, y: 600 },
    from_archive: { x: 270, y: 385 },
    from_digital_circus: { x: 640, y: 390 },
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
    const opening = scene.add.rectangle(270, 160, 116, 158, 0x010204).setDepth(159).setVisible(false);
    const frame = kit.goldFrame(scene, 270, 160, 140, 180);
    [640, 1010].forEach((cx) => kit.goldFrame(scene, cx, 160, 140, 180));
    // Small abstract painting inside the existing central frame; no distant sign.
    const art = scene.add.graphics().setDepth(161).setName("digital_circus_painting");
    art.fillStyle(0xf6cb74, 1).fillRect(584, 84, 112, 152);
    for (let x = 584; x < 696; x += 28) art.fillStyle(0xd86965, 1).fillRect(x, 84, 14, 110);
    art.fillStyle(0x8da8ae, 1).fillRect(584, 194, 112, 42);
    art.fillStyle(0xfce0a0, 1).fillRoundedRect(633, 114, 17, 97, 6);
    art.lineStyle(6, 0xb94653, 1);
    for (let y = 130; y < 201; y += 22) art.lineBetween(622, y, 661, y + 12);
    art.fillStyle(0xf9e6bc, 0.8).fillCircle(672, 106, 8);
    const shade = scene.add.ellipse(270, 215, 520, 360, 0x000000, 0).setDepth(158);
    scene.secretPainting = { frame, opening, shade };

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
    ctx.addUpdatable(new Interactable(scene, {
      id: "digital_circus_painting", x: 640, y: 280, radius: 76,
      prompt: "[E] Entrar", action: () => ctx.travel("digitalCircus")
    }));
    ctx.addUpdatable(new Interactable(scene, {
      id: "archive_painting", x: 270, y: 255, radius: 62, prompt: "???", silent: true,
      action: () => ctx.travel("archive")
    }));
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
