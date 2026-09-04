// PÁGINA 4 — CIDADE & CASINO (top-down 2.5D).
import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { MusicNoteEntity } from "../entities/music-note.js";
import { MUSIC_NOTE_DEFS } from "../config/expansion-markers.js";
import { canEnter, blockedReason, ROOM_CONNECTIONS } from "../config/room-connections.js";

export default {
  id: "room_04_city_casino",
  panelMarkerIds: ["city_easy_1", "city_easy_2", "city_difficult"],

  spawns: {
    default: { x: 180, y: 600 },
    from_room_07: { x: 1280, y: 600 },
    from_room_01: { x: 180, y: 600 },
    outside_casino: { x: 1000, y: 640 },
    from_digital_stage: { x: 360, y: 560 }
  },

  gates: [
    { key: "left", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } },
    { key: "right", x: 1400, arrowY: 520, zone: { x: 1370, y: 400, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xc7e8f5, 0xe8f5dc);
    kit.cloud(scene, 300, 110, 0.9);
    kit.cloud(scene, 1000, 90, 0.8);
    kit.cobblestone(scene, ctx, 750);

    // prédio roxo com cara
    const purpleBase = 700;
    kit.shadow(scene, 210, purpleBase + 6, 320, 30, 0.35);
    const purple = scene.add.graphics().setDepth(purpleBase);
    purple.fillStyle(0xb9a5e0, 1);
    purple.fillRect(60, purpleBase - 420, 300, 420);
    purple.lineStyle(4, 0x33333d, 0.85);
    purple.strokeRect(60, purpleBase - 420, 300, 420);
    purple.fillStyle(0xb9a5e0, 1);
    purple.fillRoundedRect(90, purpleBase - 470, 60, 70, 16);
    purple.strokeRoundedRect(90, purpleBase - 470, 60, 70, 16);
    purple.fillRoundedRect(270, purpleBase - 470, 60, 70, 16);
    purple.strokeRoundedRect(270, purpleBase - 470, 60, 70, 16);
    purple.fillStyle(0x33333d, 1);
    purple.fillEllipse(160, purpleBase - 250, 22, 40);
    purple.fillEllipse(260, purpleBase - 250, 22, 40);
    purple.lineStyle(6, 0x33333d, 1);
    purple.beginPath();
    purple.arc(210, purpleBase - 120, 40, Math.PI * 0.2, Math.PI * 0.8);
    purple.strokePath();
    ctx.solid(70, purpleBase - 40, 280, 44);
    scene.add
      .text(342, purpleBase - 400, "5", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "26px",
        fontStyle: "bold",
        color: "#33333d"
      })
      .setDepth(purpleBase + 1);

    kit.crate(scene, ctx, 200, 640, 80, 48, 0x8a6238);

    kit.building(scene, ctx, {
      x: 420,
      baseY: 700,
      w: 360,
      h: 380,
      wall: 0xd98a7a,
      doorColor: 0xdedede,
      windows: [
        [450, 380],
        [540, 380],
        [630, 380],
        [450, 460],
        [540, 460],
        [630, 460]
      ],
      door: [560, 520, 100, 180]
    });

    kit.building(scene, ctx, {
      x: 820,
      baseY: 700,
      w: 360,
      h: 360,
      wall: 0x8fae5f,
      doorColor: 0xdedede,
      windows: [[880, 400]],
      door: [940, 520, 120, 180],
      label: "Cascino"
    });
    scene.add
      .text(1090, 360, "8", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "30px",
        fontStyle: "bold",
        color: "#e8df9a",
        stroke: "#33333d",
        strokeThickness: 4
      })
      .setDepth(701);

    kit.crate(scene, ctx, 1190, 640, 70, 48, 0x8a6238);
    kit.lampPost(scene, ctx, 1280, 680);

    // poste de barbeiro
    const barber = scene.add.graphics().setDepth(680);
    barber.fillStyle(0xfdfaf1, 1);
    barber.fillRect(1216, 520, 24, 160);
    barber.lineStyle(3, 0x33333d, 0.8);
    barber.strokeRect(1216, 520, 24, 160);
    for (let y = 530; y < 670; y += 30) {
      barber.fillStyle(0xd1495b, 1);
      barber.fillTriangle(1216, y, 1240, y + 14, 1216, y + 28);
    }
    kit.shadow(scene, 1228, 680, 28, 12, 0.25);
    ctx.solid(1212, 660, 32, 22);

    // hidrante
    const hydrant = scene.add.graphics().setDepth(700);
    hydrant.fillStyle(0xd1495b, 1);
    hydrant.fillRoundedRect(1338, 640, 44, 60, 10);
    hydrant.fillRoundedRect(1330, 632, 60, 20, 8);
    hydrant.fillCircle(1360, 628, 14);
    hydrant.lineStyle(3, 0x33333d, 0.7);
    hydrant.strokeRoundedRect(1338, 640, 44, 60, 10);
    kit.shadow(scene, 1360, 700, 50, 16, 0.28);
    ctx.solid(1334, 680, 52, 22);

    const poop = scene.add.graphics().setDepth(642);
    poop.fillStyle(0x8a6238, 1);
    poop.fillCircle(512, 640, 9);
    poop.fillCircle(505, 632, 6);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;
    scene.casinoDoor = new Interactable(scene, {
      id: "casino_door",
      x: 1000,
      y: 640,
      radius: 150,
      prompt: "[E] Entrar no Casino",
      action: () => ctx.travel("casino")
    });
    ctx.addUpdatable(scene.casinoDoor);

    MUSIC_NOTE_DEFS.filter((n) => n.room === "room_04_city_casino").forEach((def) => {
      if (sm.save.discoveredMusicNoteIds?.includes(def.id)) return;
      const note = new MusicNoteEntity(scene, def, sm, hud);
      ctx.addUpdatable(note);
      scene.time.delayedCall(0, () => {
        if (scene.player?.sprite) {
          scene.physics.add.overlap(scene.player.sprite, note.zone, () => note.tryCollect());
        }
      });
    });

    const notesFound = (sm.save.discoveredMusicNoteIds || []).length;
    const stageLit = notesFound >= 5 || sm.save.mikuMarkerUnlocked;
    const stageX = 360;
    const stageY = 520;
    const glow = scene.add.circle(stageX, stageY - 40, 48, 0x39c5bb, stageLit ? 0.35 : 0.08).setDepth(stageY);
    if (stageLit) {
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.2, to: 0.5 },
        scale: { from: 0.95, to: 1.15 },
        duration: 900,
        yoyo: true,
        repeat: -1
      });
    }
    scene.add
      .text(stageX, stageY - 90, "DIGITAL STAGE", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "14px",
        fontStyle: "bold",
        color: stageLit ? "#39c5bb" : "#6a6a78",
        backgroundColor: "#1a1a28cc",
        padding: { x: 6, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(stageY + 2);

    const stageDoor = new Interactable(scene, {
      id: "digital_stage_door",
      x: stageX,
      y: stageY,
      radius: 120,
      prompt: stageLit ? "[E] Entrar no Digital Stage" : `[E] Digital Stage (${notesFound}/5 ♪)`,
      action: () => {
        const exit = ROOM_CONNECTIONS.room_04_city_casino.digitalStage;
        if (!canEnter(exit, sm.save)) {
          hud.toast(blockedReason(exit, sm.save) || "Encontre as 5 notas musicais.", {
            icon: "♪",
            duration: 2200
          });
          return;
        }
        ctx.travel("digitalStage");
      }
    });
    ctx.addUpdatable(stageDoor);
  }
};
