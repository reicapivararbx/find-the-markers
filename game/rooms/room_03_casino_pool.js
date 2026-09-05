import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { CodeKeypad } from "../puzzles/code-keypad.js";
import { POOL_HALL_DOOR, POOL_HALL_DOOR_CODE, SECRET_POOL } from "../config/puzzle-config.js";
import { Sfx } from "../core/audio-manager.js";
import { bus, Events } from "../core/event-bus.js";

export default {
  id: "room_03_casino_pool",
  panelMarkerIds: [],

  spawns: {
    default: { x: 180, y: 600 },
    from_room_02: { x: 180, y: 600 },
    from_secret_pool: { x: 1200, y: 560 }
  },

  gates: [
    { key: "back", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.interiorWall(scene, ctx, 0xefe3cd, 0x5f9e6b);

    const lamp = scene.add.graphics().setDepth(-20);
    lamp.lineStyle(4, 0x33333d, 0.8);
    lamp.lineBetween(740, 40, 740, 120);
    lamp.fillStyle(0x2d3b63, 1);
    lamp.fillRoundedRect(660, 120, 160, 50, 14);
    lamp.fillStyle(0xffe08a, 0.18);
    lamp.fillEllipse(740, 280, 280, 160);

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

    const unlocked = Boolean(ctx.save.puzzleStates?.poolHallDoorUnlocked);
    const doorW = POOL_HALL_DOOR.door.w;
    const doorH = POOL_HALL_DOOR.door.h;
    const doorX = POOL_HALL_DOOR.door.x - doorW / 2;
    const doorY = POOL_HALL_DOOR.door.y - doorH;

    // Porta branca — footprint só enquanto trancada (ao destravar, travel recarrega a sala).
    if (!unlocked) {
      ctx.solid(doorX + 10, doorY + doorH - 40, doorW - 20, 36);
    }

    const door = scene.add.graphics().setDepth(500);
    door.fillStyle(0xfdfaf1, 1);
    door.fillRect(doorX, doorY, doorW, doorH);
    door.lineStyle(4, unlocked ? 0x2f7a4f : 0x33333d, 0.85);
    door.strokeRect(doorX, doorY, doorW, doorH);
    // maçaneta
    door.fillStyle(unlocked ? 0x56ccf2 : 0xf2c94c, 1);
    door.fillCircle(doorX + 20, doorY + 100, 9);
    // luz de status no topo da porta
    door.fillStyle(unlocked ? 0x2f7a4f : 0xd1495b, 1);
    door.fillCircle(doorX + doorW / 2, doorY + 24, 8);
    door.lineStyle(2, 0x33333d, 0.7);
    door.strokeCircle(doorX + doorW / 2, doorY + 24, 8);

    if (!unlocked) {
      // cadeado simples
      door.fillStyle(0x33333d, 1);
      door.fillRoundedRect(doorX + doorW / 2 - 10, doorY + 130, 20, 16, 3);
      door.lineStyle(3, 0x33333d, 1);
      door.strokeCircle(doorX + doorW / 2, doorY + 128, 8);
      // painel eletrônico 2.5D à esquerda da porta
      const px = POOL_HALL_DOOR.panel.x;
      const py = POOL_HALL_DOOR.panel.y;
      kit.shadow(scene, px, py + 18, 48, 16, 0.3);
      const panel = scene.add.graphics().setDepth(py);
      panel.fillStyle(0x2a2a34, 1);
      panel.fillRoundedRect(px - 28, py - 70, 56, 80, 6);
      panel.lineStyle(3, 0x33333d, 0.9);
      panel.strokeRoundedRect(px - 28, py - 70, 56, 80, 6);
      panel.fillStyle(0xd1495b, 1);
      panel.fillCircle(px, py - 48, 6);
      panel.fillStyle(0x1a1a22, 1);
      panel.fillRoundedRect(px - 18, py - 32, 36, 14, 3);
      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          panel.fillStyle(0x4a4a58, 1);
          panel.fillRect(px - 14 + c * 12, py - 10 + r * 12, 8, 8);
        }
      }
      scene.add
        .text(px, py - 58, "●", {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#d1495b"
        })
        .setOrigin(0.5)
        .setDepth(py + 1);
    } else {
      const glow = scene.add.circle(doorX + doorW / 2, doorY + 100, 36, 0x56ccf2, 0.18).setDepth(499);
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.12, to: 0.32 },
        scale: { from: 0.95, to: 1.15 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      // painel verde UNLOCKED
      const px = POOL_HALL_DOOR.panel.x;
      const py = POOL_HALL_DOOR.panel.y;
      const panel = scene.add.graphics().setDepth(py);
      panel.fillStyle(0x2a2a34, 1);
      panel.fillRoundedRect(px - 28, py - 70, 56, 80, 6);
      panel.lineStyle(3, 0x2f7a4f, 0.9);
      panel.strokeRoundedRect(px - 28, py - 70, 56, 80, 6);
      panel.fillStyle(0x2f7a4f, 1);
      panel.fillCircle(px, py - 48, 6);
      scene.add
        .text(px, py - 20, "OK", {
          fontFamily: "monospace",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#56ccf2"
        })
        .setOrigin(0.5)
        .setDepth(py + 1);
    }

    const cue = scene.add.graphics().setDepth(-15);
    cue.lineStyle(6, 0xc99a5f, 1);
    cue.lineBetween(180, 80, 420, 160);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;
    const doorX = SECRET_POOL.whiteDoor.x;
    const doorY = SECRET_POOL.whiteDoor.y;
    const panelX = POOL_HALL_DOOR.panel.x;
    const panelY = POOL_HALL_DOOR.panel.y;
    let keypadOpen = false;

    const tryEnter = () => {
      if (sm.save.puzzleStates.poolHallDoorUnlocked) {
        ctx.travel("secretPool");
        return;
      }
      if (keypadOpen) return;
      keypadOpen = true;
      bus.emit(Events.PUZZLE_STARTED, "poolHallDoor");
      new CodeKeypad(scene, {
        expected: POOL_HALL_DOOR_CODE,
        length: POOL_HALL_DOOR.codeLength,
        title: "Porta Branca",
        onSubmit: (ok) => {
          keypadOpen = false;
          if (!ok) {
            hud.toast("Código incorreto", { icon: "❌", duration: 2000 });
            return;
          }
          sm.unlockPoolHallDoor();
          Sfx.unlock();
          hud.toast("ACESSO LIBERADO", { icon: "🚪", duration: 2200 });
          scene.time.delayedCall(400, () => ctx.travel("secretPool"));
        },
        onCancel: () => {
          keypadOpen = false;
        }
      });
    };

    const unlocked = sm.save.puzzleStates.poolHallDoorUnlocked;
    // Interação no painel (trancada) ou na porta (aberta).
    const interactX = unlocked ? doorX : panelX;
    const interactY = unlocked ? doorY : panelY;
    const whiteDoor = new Interactable(scene, {
      id: unlocked ? "pool_hall_white_door" : "pool_hall_door_code",
      x: interactX,
      y: interactY,
      radius: 130,
      prompt: unlocked ? "[E] Entrar na sala secreta" : "[E] Usar painel",
      action: tryEnter
    });
    ctx.addUpdatable(whiteDoor);
  }
};
