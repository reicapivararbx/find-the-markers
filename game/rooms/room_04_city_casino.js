// PÁGINA 4 — CIDADE & CASINO (top-down 2.5D).
// Visual only redo: scale, façades, street, props. Progressão/markers/save intactos.
import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { MusicNoteEntity } from "../entities/music-note.js";
import { MUSIC_NOTE_DEFS } from "../config/expansion-markers.js";
import { canEnter, blockedReason, ROOM_CONNECTIONS } from "../config/room-connections.js";

const INK = 0x33333d;
const STREET_Y0 = 400;
const STREET_Y1 = 560;
const CURB_TOP = 392;
const CURB_BOT = 560;
const BLDG_BASE = 560;

function shade(hex, amount) {
  const r = Math.max(0, Math.min(255, ((hex >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((hex >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (hex & 0xff) + amount));
  return (r << 16) | (g << 8) | b;
}

function drawCityStreet(scene, ctx) {
  const floor = scene.add.graphics().setDepth(-50);
  floor.fillStyle(0xb8c4a8, 1);
  floor.fillRect(0, 0, 1440, 810);

  const far = scene.add.graphics().setDepth(-55);
  const skyline = [
    [0, 120, 90, 200],
    [80, 90, 70, 230],
    [140, 140, 110, 180],
    [240, 70, 80, 250],
    [310, 110, 100, 210],
    [400, 85, 60, 235],
    [450, 130, 130, 190],
    [570, 95, 90, 225],
    [650, 60, 75, 260],
    [720, 115, 100, 205],
    [810, 80, 85, 240],
    [890, 125, 120, 195],
    [1000, 70, 70, 250],
    [1060, 100, 95, 220],
    [1145, 55, 80, 265],
    [1215, 110, 100, 210],
    [1305, 90, 135, 230]
  ];
  skyline.forEach(([x, top, w, h], i) => {
    far.fillStyle(i % 3 === 0 ? 0x8a9bb0 : i % 3 === 1 ? 0x7a8a9e : 0x6d7d90, 1);
    far.fillRect(x, top, w, h);
    far.fillStyle(0x000000, 0.12);
    far.fillRect(x + w - 10, top, 10, h);
    if (i % 2 === 0) {
      far.fillStyle(0xc5d4e0, 0.35);
      for (let wy = top + 16; wy < top + h - 20; wy += 22) {
        far.fillRect(x + 10, wy, 8, 10);
        far.fillRect(x + 24, wy, 8, 10);
        if (w > 70) far.fillRect(x + 40, wy, 8, 10);
      }
    }
  });
  far.fillStyle(0x9aaf88, 1);
  far.fillRect(0, 300, 1440, 100);
  far.fillStyle(0x000000, 0.06);
  for (let i = 0; i < 12; i += 1) {
    far.fillEllipse(80 + i * 120, 340 + (i % 3) * 12, 70, 28);
  }

  const walk = scene.add.graphics().setDepth(-48);
  walk.fillStyle(0xc9c3b4, 1);
  walk.fillRect(0, 300, 1440, CURB_TOP - 300 + 8);
  walk.fillStyle(0xbdb7a8, 1);
  walk.fillRect(0, CURB_TOP - 10, 1440, 18);
  walk.lineStyle(1.4, 0x8a8578, 0.4);
  for (let row = 0; row < 5; row += 1) {
    const y = 310 + row * 16;
    for (let x = (row % 2) * 20; x < 1440; x += 40) walk.strokeRect(x, y, 36, 14);
  }

  const road = scene.add.graphics().setDepth(-47);
  road.fillStyle(0x5c5a56, 1);
  road.fillRect(0, STREET_Y0, 1440, STREET_Y1 - STREET_Y0);
  road.fillStyle(0x000000, 0.08);
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 173 + 40) % 1400;
    const y = STREET_Y0 + 20 + (i * 47) % 100;
    road.fillEllipse(x, y, 50 + (i % 4) * 20, 14 + (i % 3) * 6);
  }
  road.fillStyle(0x6a6864, 1);
  road.fillRect(0, STREET_Y0, 1440, 6);
  road.fillRect(0, STREET_Y1 - 6, 1440, 6);
  road.fillStyle(0xd4cfc4, 1);
  road.fillRect(0, CURB_TOP, 1440, 8);
  road.fillRect(0, CURB_BOT, 1440, 10);
  road.lineStyle(2, 0x9a9588, 0.55);
  road.lineBetween(0, CURB_TOP + 4, 1440, CURB_TOP + 4);
  road.lineBetween(0, CURB_BOT + 5, 1440, CURB_BOT + 5);

  const midY = (STREET_Y0 + STREET_Y1) / 2;
  road.fillStyle(0xf2c94c, 0.92);
  for (let x = 24; x < 1410; x += 72) {
    road.fillRoundedRect(x, midY - 3, 40, 6, 2);
  }
  road.fillStyle(0xe8e4dc, 0.35);
  for (let x = 100; x < 1400; x += 220) {
    road.fillRect(x, STREET_Y0 + 18, 3, STREET_Y1 - STREET_Y0 - 36);
  }

  const lower = scene.add.graphics().setDepth(-46);
  lower.fillStyle(0xc9c3b4, 1);
  lower.fillRect(0, CURB_BOT + 10, 1440, 810 - CURB_BOT);
  lower.lineStyle(1.4, 0x8a8578, 0.4);
  for (let row = 0; row < 12; row += 1) {
    const y = CURB_BOT + 18 + row * 16;
    for (let x = (row % 2) * 20; x < 1440; x += 40) lower.strokeRect(x, y, 36, 14);
  }
  lower.fillStyle(0x000000, 0.04);
  for (let i = 0; i < 10; i += 1) {
    lower.fillEllipse(120 + i * 130, 640 + (i % 4) * 30, 60, 18);
  }

  if (ctx) {
    ctx.solid(0, 0, 18, 810);
    ctx.solid(1422, 0, 18, 810);
    ctx.solid(0, 0, 1440, 28);
    ctx.solid(0, 792, 1440, 18);
  }
}

function drawAlley(scene, x, baseY, w = 48) {
  const gfx = scene.add.graphics().setDepth(baseY - 80);
  gfx.fillStyle(0x3a3a44, 1);
  gfx.fillRect(x, baseY - 200, w, 200);
  gfx.fillStyle(0x000000, 0.25);
  gfx.fillRect(x, baseY - 200, w, 200);
  gfx.fillStyle(0x2a2a32, 1);
  gfx.fillRect(x + 4, baseY - 40, w - 8, 40);
  kit.shadow(scene, x + w / 2, baseY + 4, w * 0.9, 14, 0.2);
}

function drawWindow(gfx, x, y, w = 28, h = 34, lit = 0xbfe8f7) {
  gfx.fillStyle(0x2a3340, 1);
  gfx.fillRect(x - 3, y - 3, w + 6, h + 8);
  gfx.fillStyle(lit, 1);
  gfx.fillRect(x, y, w, h);
  gfx.lineStyle(2.5, INK, 0.85);
  gfx.strokeRect(x, y, w, h);
  gfx.lineBetween(x + w / 2, y, x + w / 2, y + h);
  gfx.lineBetween(x, y + h / 2, x + w, y + h / 2);
  gfx.fillStyle(0xffffff, 0.28);
  gfx.fillRect(x + 3, y + 3, 8, 8);
  gfx.fillStyle(0x5a4030, 1);
  gfx.fillRect(x - 4, y + h, w + 8, 5);
}

function drawDoor(gfx, x, y, w, h, color) {
  gfx.fillStyle(0x4a4038, 1);
  gfx.fillRect(x - 6, y - 8, w + 12, 10);
  gfx.fillStyle(color, 1);
  gfx.fillRoundedRect(x, y, w, h, 4);
  gfx.lineStyle(3, INK, 0.9);
  gfx.strokeRoundedRect(x, y, w, h, 4);
  gfx.lineStyle(2, INK, 0.5);
  gfx.lineBetween(x + w / 2, y + 6, x + w / 2, y + h - 6);
  gfx.fillStyle(0xf2c94c, 1);
  gfx.fillCircle(x + w - 10, y + h * 0.48, 4);
  gfx.fillStyle(0x000000, 0.12);
  gfx.fillRect(x + 4, y + 8, w * 0.35, h - 16);
}

/** Prédio roxo — rosto como ornamento de janelas, escala humana. */
function drawPurpleFaceBuilding(scene, ctx) {
  const x = 70;
  const w = 200;
  const h = 250;
  const baseY = BLDG_BASE;
  const top = baseY - h;
  const wall = 0xa894d4;

  kit.shadow(scene, x + w / 2, baseY + 8, w * 1.08, 26, 0.34);
  const gfx = scene.add.graphics().setDepth(baseY);

  gfx.fillStyle(shade(wall, -28), 1);
  gfx.fillRect(x + 8, top - 18, w - 16, 22);
  gfx.fillStyle(wall, 1);
  gfx.fillRect(x, top, w, h);
  gfx.lineStyle(3.5, INK, 0.9);
  gfx.strokeRect(x, top, w, h);
  gfx.fillStyle(0x000000, 0.14);
  gfx.fillRect(x + w - 18, top, 18, h);
  gfx.fillStyle(0xffffff, 0.1);
  gfx.fillRect(x, top, 14, h);

  gfx.fillStyle(shade(wall, -40), 1);
  gfx.fillRect(x - 6, top + 8, 10, h - 16);
  gfx.fillRect(x + w - 4, top + 8, 10, h - 16);
  gfx.lineStyle(2, INK, 0.7);
  gfx.strokeRect(x - 6, top + 8, 10, h - 16);
  gfx.strokeRect(x + w - 4, top + 8, 10, h - 16);

  gfx.fillStyle(shade(wall, 20), 1);
  gfx.fillRoundedRect(x + 28, top - 36, 36, 42, 10);
  gfx.fillRoundedRect(x + w - 64, top - 36, 36, 42, 10);
  gfx.lineStyle(2.5, INK, 0.8);
  gfx.strokeRoundedRect(x + 28, top - 36, 36, 42, 10);
  gfx.strokeRoundedRect(x + w - 64, top - 36, 36, 42, 10);
  gfx.fillStyle(0x5a4a78, 1);
  gfx.fillRect(x + 36, top - 28, 20, 14);
  gfx.fillRect(x + w - 56, top - 28, 20, 14);

  gfx.fillStyle(0x8a7ab8, 1);
  gfx.fillRoundedRect(x + 24, top + 18, w - 48, 100, 18);
  gfx.lineStyle(3, INK, 0.75);
  gfx.strokeRoundedRect(x + 24, top + 18, w - 48, 100, 18);

  drawWindow(gfx, x + 48, top + 36, 32, 40, 0x2a2a48);
  drawWindow(gfx, x + 120, top + 36, 32, 40, 0x2a2a48);
  gfx.lineStyle(4, INK, 0.85);
  gfx.beginPath();
  gfx.arc(x + w / 2, top + 108, 28, Math.PI * 0.15, Math.PI * 0.85);
  gfx.strokePath();
  gfx.fillStyle(0x6a5a98, 0.5);
  gfx.fillCircle(x + w / 2, top + 72, 6);

  drawWindow(gfx, x + 40, top + 140, 26, 30);
  drawWindow(gfx, x + 86, top + 140, 26, 30);
  drawWindow(gfx, x + 132, top + 140, 26, 30);

  gfx.fillStyle(0x6a5a88, 1);
  gfx.fillRect(x + 12, top + 188, w - 24, 10);
  gfx.lineStyle(2, INK, 0.6);
  gfx.strokeRect(x + 12, top + 188, w - 24, 10);

  drawDoor(gfx, x + w / 2 - 28, baseY - 96, 56, 96, 0x5c4a7a);

  gfx.fillStyle(0x4a3a68, 1);
  gfx.fillRect(x - 4, baseY - 14, w + 8, 14);
  gfx.lineStyle(2.5, INK, 0.8);
  gfx.strokeRect(x - 4, baseY - 14, w + 8, 14);

  scene.add
    .text(x + w - 22, top + 12, "5", {
      fontFamily: '"Comic Sans MS", sans-serif',
      fontSize: "22px",
      fontStyle: "bold",
      color: "#33333d"
    })
    .setDepth(baseY + 2);

  ctx.solid(x + 10, baseY - 28, w - 20, 32);
}

/** Prédio coral/laranja com moldura e parapeito. */
function drawCoralBuilding(scene, ctx) {
  const x = 300;
  const w = 230;
  const h = 230;
  const baseY = BLDG_BASE;
  const top = baseY - h;
  const wall = 0xd48a78;

  kit.shadow(scene, x + w / 2, baseY + 8, w * 1.08, 26, 0.34);
  const gfx = scene.add.graphics().setDepth(baseY);

  gfx.fillStyle(shade(wall, -35), 1);
  gfx.fillTriangle(x - 8, top + 8, x + w + 8, top + 8, x + w / 2, top - 36);
  gfx.lineStyle(3, INK, 0.85);
  gfx.beginPath();
  gfx.moveTo(x - 8, top + 8);
  gfx.lineTo(x + w / 2, top - 36);
  gfx.lineTo(x + w + 8, top + 8);
  gfx.closePath();
  gfx.strokePath();
  gfx.fillStyle(0x000000, 0.12);
  gfx.fillTriangle(x + w / 2, top - 36, x + w + 8, top + 8, x + w - 16, top + 8);

  gfx.fillStyle(wall, 1);
  gfx.fillRect(x, top + 8, w, h - 8);
  gfx.lineStyle(3.5, INK, 0.9);
  gfx.strokeRect(x, top + 8, w, h - 8);
  gfx.fillStyle(0x000000, 0.12);
  gfx.fillRect(x + w - 16, top + 8, 16, h - 8);
  gfx.fillStyle(0xffffff, 0.1);
  gfx.fillRect(x, top + 8, 12, h - 8);

  gfx.fillStyle(shade(wall, -25), 1);
  gfx.fillRect(x + 8, top + 14, w - 16, 12);
  gfx.lineStyle(2, INK, 0.5);
  gfx.strokeRect(x + 8, top + 14, w - 16, 12);

  const wins = [
    [x + 28, top + 48],
    [x + 90, top + 48],
    [x + 152, top + 48],
    [x + 28, top + 110],
    [x + 90, top + 110],
    [x + 152, top + 110]
  ];
  wins.forEach(([wx, wy]) => drawWindow(gfx, wx, wy, 30, 36));

  gfx.fillStyle(0xc47a68, 1);
  gfx.fillRect(x + 10, top + 168, w - 20, 8);
  gfx.fillRect(x + 16, top + 176, 8, 14);
  gfx.fillRect(x + w - 24, top + 176, 8, 14);

  drawDoor(gfx, x + w / 2 - 30, baseY - 100, 60, 100, 0xe8e0d4);

  gfx.fillStyle(0x8a5a4a, 1);
  gfx.fillRect(x - 4, baseY - 12, w + 8, 12);
  gfx.lineStyle(2.5, INK, 0.8);
  gfx.strokeRect(x - 4, baseY - 12, w + 8, 12);

  ctx.solid(x + 10, baseY - 28, w - 20, 32);
}

/** Casino — letreiro físico, marquise, entrada dupla, volume. */
function drawCasino(scene, ctx) {
  const x = 580;
  const w = 300;
  const h = 240;
  const baseY = BLDG_BASE;
  const top = baseY - h;
  const wall = 0x6a9a58;

  kit.shadow(scene, x + w / 2, baseY + 10, w * 1.1, 30, 0.38);
  const gfx = scene.add.graphics().setDepth(baseY);

  gfx.fillStyle(0x4a6a40, 1);
  gfx.fillRect(x + 12, top - 22, w - 24, 28);
  gfx.fillStyle(0x000000, 0.15);
  gfx.fillRect(x + w - 28, top - 22, 16, 28);
  gfx.lineStyle(3, INK, 0.85);
  gfx.strokeRect(x + 12, top - 22, w - 24, 28);

  gfx.fillStyle(wall, 1);
  gfx.fillRect(x, top, w, h);
  gfx.lineStyle(3.5, INK, 0.9);
  gfx.strokeRect(x, top, w, h);
  gfx.fillStyle(0x000000, 0.14);
  gfx.fillRect(x + w - 20, top, 20, h);
  gfx.fillStyle(0xffffff, 0.08);
  gfx.fillRect(x, top, 16, h);

  gfx.fillStyle(0x3a3a48, 1);
  gfx.fillRoundedRect(x + 36, top + 16, w - 72, 56, 8);
  gfx.lineStyle(4, 0xf2c94c, 0.95);
  gfx.strokeRoundedRect(x + 36, top + 16, w - 72, 56, 8);
  gfx.lineStyle(2, 0xffe08a, 0.7);
  gfx.strokeRoundedRect(x + 42, top + 22, w - 84, 44, 6);
  for (let i = 0; i < 8; i += 1) {
    const lx = x + 48 + i * 28;
    gfx.fillStyle(0xffe08a, 0.85);
    gfx.fillCircle(lx, top + 20, 4);
    gfx.fillCircle(lx, top + 68, 4);
  }
  scene.add
    .text(x + w / 2, top + 44, "🎰  CASINO  🎰", {
      fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
      fontSize: "26px",
      fontStyle: "bold",
      color: "#f2c94c",
      stroke: "#1a1a28",
      strokeThickness: 5
    })
    .setOrigin(0.5)
    .setDepth(baseY + 4);

  gfx.fillStyle(0x4a4a58, 1);
  gfx.fillRect(x - 16, top + 78, w + 32, 28);
  gfx.fillStyle(0x5a5a6a, 1);
  gfx.fillRect(x - 12, top + 74, w + 24, 10);
  gfx.lineStyle(3, INK, 0.85);
  gfx.strokeRect(x - 16, top + 78, w + 32, 28);
  gfx.fillStyle(0xffe08a, 0.25);
  for (let i = 0; i < 6; i += 1) {
    gfx.fillCircle(x + 20 + i * 48, top + 92, 5);
  }
  gfx.fillStyle(0x3a3a48, 1);
  gfx.fillRect(x + 8, top + 106, 10, 18);
  gfx.fillRect(x + w - 18, top + 106, 10, 18);

  drawWindow(gfx, x + 28, top + 130, 36, 40, 0xffe8a0);
  drawWindow(gfx, x + w - 64, top + 130, 36, 40, 0xffe8a0);

  const doorW = 48;
  const doorH = 100;
  const doorY = baseY - doorH;
  const gap = 14;
  const pairW = doorW * 2 + gap;
  const doorX0 = x + w / 2 - pairW / 2;
  gfx.fillStyle(0x2a2a38, 1);
  gfx.fillRect(doorX0 - 10, doorY - 12, pairW + 20, 14);
  gfx.fillStyle(0xd4cfc4, 1);
  gfx.fillRoundedRect(doorX0 - 6, doorY - 4, pairW + 12, doorH + 4, 4);
  gfx.lineStyle(3, INK, 0.9);
  gfx.strokeRoundedRect(doorX0 - 6, doorY - 4, pairW + 12, doorH + 4, 4);
  drawDoor(gfx, doorX0, doorY, doorW, doorH, 0xc45a4a);
  drawDoor(gfx, doorX0 + doorW + gap, doorY, doorW, doorH, 0xc45a4a);

  gfx.fillStyle(0x3a5a34, 1);
  gfx.fillRect(x - 6, baseY - 14, w + 12, 14);
  gfx.lineStyle(2.5, INK, 0.85);
  gfx.strokeRect(x - 6, baseY - 14, w + 12, 14);
  gfx.fillStyle(0x5a7a50, 1);
  for (let i = 0; i < 10; i += 1) {
    gfx.fillRect(x + 8 + i * 28, baseY - 10, 14, 6);
  }

  scene.add
    .text(x + w - 28, top + 8, "8", {
      fontFamily: '"Comic Sans MS", sans-serif',
      fontSize: "24px",
      fontStyle: "bold",
      color: "#e8df9a",
      stroke: "#33333d",
      strokeThickness: 4
    })
    .setDepth(baseY + 3);

  ctx.solid(x + 12, baseY - 30, w - 24, 34);
}

function drawBarberPole(scene, ctx, x, baseY) {
  kit.shadow(scene, x, baseY, 22, 10, 0.25);
  const gfx = scene.add.graphics().setDepth(baseY);
  gfx.fillStyle(0x4a4a55, 1);
  gfx.fillRect(x - 5, baseY - 8, 10, 8);
  gfx.fillStyle(0xfdfaf1, 1);
  gfx.fillRoundedRect(x - 10, baseY - 110, 20, 102, 4);
  gfx.lineStyle(2.5, INK, 0.8);
  gfx.strokeRoundedRect(x - 10, baseY - 110, 20, 102, 4);
  for (let y = baseY - 100; y < baseY - 20; y += 22) {
    gfx.fillStyle(0xd1495b, 1);
    gfx.fillTriangle(x - 10, y, x + 10, y + 10, x - 10, y + 20);
    gfx.fillStyle(0x3a7abd, 1);
    gfx.fillTriangle(x + 10, y + 10, x - 10, y + 20, x + 10, y + 30);
  }
  gfx.fillStyle(0x4a4a55, 1);
  gfx.fillCircle(x, baseY - 114, 8);
  if (ctx) ctx.solid(x - 12, baseY - 16, 24, 18);
}

function drawHydrant(scene, ctx, x, baseY) {
  kit.shadow(scene, x, baseY, 40, 14, 0.28);
  const gfx = scene.add.graphics().setDepth(baseY);
  gfx.fillStyle(0xd1495b, 1);
  gfx.fillRoundedRect(x - 14, baseY - 44, 28, 44, 6);
  gfx.fillRoundedRect(x - 22, baseY - 52, 44, 14, 5);
  gfx.fillCircle(x, baseY - 58, 10);
  gfx.fillRect(x - 26, baseY - 42, 10, 10);
  gfx.fillRect(x + 16, baseY - 42, 10, 10);
  gfx.lineStyle(2.5, INK, 0.75);
  gfx.strokeRoundedRect(x - 14, baseY - 44, 28, 44, 6);
  gfx.strokeRoundedRect(x - 22, baseY - 52, 44, 14, 5);
  if (ctx) ctx.solid(x - 18, baseY - 16, 36, 18);
}

function drawUtilityBox(scene, ctx, x, baseY) {
  kit.shadow(scene, x, baseY, 36, 14, 0.26);
  const gfx = scene.add.graphics().setDepth(baseY);
  gfx.fillStyle(0x6a7a5a, 1);
  gfx.fillRoundedRect(x - 18, baseY - 40, 36, 40, 4);
  gfx.lineStyle(2.5, INK, 0.8);
  gfx.strokeRoundedRect(x - 18, baseY - 40, 36, 40, 4);
  gfx.fillStyle(0x4a5a3a, 1);
  gfx.fillRect(x - 10, baseY - 28, 20, 8);
  gfx.fillStyle(0xf2c94c, 0.7);
  gfx.fillCircle(x, baseY - 14, 3);
  if (ctx) ctx.solid(x - 16, baseY - 14, 32, 16);
}

function drawTrashCan(scene, ctx, x, baseY) {
  kit.shadow(scene, x, baseY, 28, 12, 0.24);
  const gfx = scene.add.graphics().setDepth(baseY);
  gfx.fillStyle(0x4a5560, 1);
  gfx.fillRoundedRect(x - 14, baseY - 36, 28, 36, 4);
  gfx.fillStyle(0x3a4550, 1);
  gfx.fillEllipse(x, baseY - 36, 30, 10);
  gfx.lineStyle(2.5, INK, 0.8);
  gfx.strokeRoundedRect(x - 14, baseY - 36, 28, 36, 4);
  gfx.strokeEllipse(x, baseY - 36, 30, 10);
  if (ctx) ctx.solid(x - 12, baseY - 14, 24, 16);
}

function drawPlanter(scene, ctx, x, baseY) {
  kit.shadow(scene, x, baseY, 44, 14, 0.22);
  const gfx = scene.add.graphics().setDepth(baseY);
  gfx.fillStyle(0x8a6a4a, 1);
  gfx.fillRoundedRect(x - 22, baseY - 22, 44, 22, 4);
  gfx.lineStyle(2, INK, 0.75);
  gfx.strokeRoundedRect(x - 22, baseY - 22, 44, 22, 4);
  gfx.fillStyle(0x5a8a46, 1);
  gfx.fillEllipse(x, baseY - 28, 36, 16);
  gfx.fillStyle(0x4a7a38, 1);
  gfx.fillCircle(x - 8, baseY - 34, 8);
  gfx.fillCircle(x + 6, baseY - 38, 10);
  gfx.fillCircle(x + 10, baseY - 30, 7);
  if (ctx) ctx.solid(x - 18, baseY - 12, 36, 14);
}

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
    { key: "left", x: 48, arrowY: 620, zone: { x: 0, y: 500, width: 70, height: 240 } },
    { key: "right", x: 1392, arrowY: 620, zone: { x: 1370, y: 500, width: 70, height: 240 } }
  ],

  build(ctx) {
    const { scene } = ctx;
    kit.sky(scene, 0xc5e4f4, 0xd8e8c8);
    kit.cloud(scene, 280, 100, 0.85);
    kit.cloud(scene, 720, 70, 0.7);
    kit.cloud(scene, 1100, 95, 0.9);

    drawCityStreet(scene, ctx);

    drawAlley(scene, 268, BLDG_BASE, 28);
    drawAlley(scene, 538, BLDG_BASE, 36);

    drawPurpleFaceBuilding(scene, ctx);
    drawCoralBuilding(scene, ctx);
    drawCasino(scene, ctx);

    kit.lampPost(scene, ctx, 250, 640);
    kit.lampPost(scene, ctx, 520, 640);
    kit.lampPost(scene, ctx, 920, 640);
    kit.lampPost(scene, ctx, 1240, 640);

    kit.bench(scene, ctx, 160, 680, 88);
    drawPlanter(scene, ctx, 280, 685);
    kit.crate(scene, ctx, 200, 720, 48, 40, 0x8a6238);
    drawTrashCan(scene, ctx, 470, 690);
    drawUtilityBox(scene, ctx, 510, 700);
    kit.crate(scene, ctx, 900, 700, 52, 42, 0x8a6238);
    drawBarberPole(scene, ctx, 1120, 690);
    kit.crate(scene, ctx, 1160, 710, 44, 38, 0x9a7048);
    drawHydrant(scene, ctx, 1300, 700);
    drawPlanter(scene, ctx, 1050, 685);
    drawTrashCan(scene, ctx, 1340, 720);

    const poop = scene.add.graphics().setDepth(642);
    poop.fillStyle(0x8a6238, 1);
    poop.fillCircle(430, 650, 7);
    poop.fillCircle(424, 644, 5);

    const manhole = scene.add.graphics().setDepth(-45);
    manhole.fillStyle(0x4a4a50, 1);
    manhole.fillCircle(720, 480, 22);
    manhole.lineStyle(3, INK, 0.7);
    manhole.strokeCircle(720, 480, 22);
    manhole.lineStyle(1.5, INK, 0.4);
    manhole.strokeCircle(720, 480, 12);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;
    scene.casinoDoor = new Interactable(scene, {
      id: "casino_door",
      x: 730,
      y: 580,
      radius: 140,
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
    const stageY = 620;
    const glow = scene.add.circle(stageX, stageY - 36, 40, 0x39c5bb, stageLit ? 0.35 : 0.08).setDepth(stageY);
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
      .text(stageX, stageY - 78, "DIGITAL STAGE", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "13px",
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
      radius: 110,
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
