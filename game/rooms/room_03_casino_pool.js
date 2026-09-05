import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { CodeKeypad } from "../puzzles/code-keypad.js";
import { POOL_HALL_DOOR_CODE, SECRET_POOL } from "../config/puzzle-config.js";
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
    const door = scene.add.graphics().setDepth(500);
    door.fillStyle(0xfdfaf1, 1);
    door.fillRect(1290, 280, 110, 200);
    door.lineStyle(4, unlocked ? 0x2f7a4f : 0x33333d, 0.85);
    door.strokeRect(1290, 280, 110, 200);
    door.fillStyle(unlocked ? 0x56ccf2 : 0xf2c94c, 1);
    door.fillCircle(1310, 380, 9);
    if (unlocked) {
      const glow = scene.add.circle(1345, 380, 36, 0x56ccf2, 0.18).setDepth(499);
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.12, to: 0.32 },
        scale: { from: 0.95, to: 1.15 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }

    const cue = scene.add.graphics().setDepth(-15);
    cue.lineStyle(6, 0xc99a5f, 1);
    cue.lineBetween(180, 80, 420, 160);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;
    const doorX = SECRET_POOL.whiteDoor.x;
    const doorY = SECRET_POOL.whiteDoor.y;
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
        length: 6,
        title: "Porta Branca",
        onSubmit: (ok) => {
          keypadOpen = false;
          if (!ok) {
            hud.toast("A porta não abre…", { icon: "🔒", duration: 2000 });
            return;
          }
          sm.unlockPoolHallDoor();
          Sfx.unlock();
          hud.toast("A porta branca se abriu!", { icon: "🚪", duration: 2200 });
          scene.time.delayedCall(400, () => ctx.travel("secretPool"));
        },
        onCancel: () => {
          keypadOpen = false;
        }
      });
    };

    const unlocked = sm.save.puzzleStates.poolHallDoorUnlocked;
    const whiteDoor = new Interactable(scene, {
      id: "pool_white_door",
      x: doorX,
      y: doorY,
      radius: 130,
      prompt: unlocked ? "[E] Entrar na sala secreta" : "[E] Porta branca",
      action: tryEnter
    });
    ctx.addUpdatable(whiteDoor);
  }
};
