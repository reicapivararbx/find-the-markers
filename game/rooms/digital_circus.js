import { Interactable } from "../entities/interactable.js";
import { state } from "../state.js";

export const digitalCircusSpawn = Object.freeze({ x: 1300, y: 1080 });
const BOUNDS = Object.freeze({ width: 3200, height: 2400 });
const C = { ink: 0x64384e, red: 0xe9444f, darkRed: 0xa92347, yellow: 0xffd35b,
  orange: 0xf69642, salmon: 0xf49c99, green: 0x70c494, blue: 0x548ce0, cream: 0xffebc7 };

// Each structure has one feet anchor; only its visible base blocks walking.
// Graphics belong to RoomScene and are destroyed by Phaser on scene restart.
function structure(ctx, id, x, y, width, baseHeight = 54) {
  const { scene } = ctx;
  scene.add.ellipse(x + 20, y + 14, width + 65, baseHeight + 35, C.ink, 0.16).setDepth(-20);
  const g = scene.add.graphics().setPosition(x, y).setDepth(y).setName(id);
  g.setData("ySort", true);
  g.setData("depthBias", 0);
  g.lineStyle(4, C.ink, 0.8);
  if (baseHeight) ctx.solid(x - width / 2, y - baseHeight, width, baseHeight);
  if (state.debug) {
    scene.add.line(0, 0, x - width / 2, y, x + width / 2, y, 0x00ffff)
      .setOrigin(0).setDepth(99996);
    scene.add.text(x, y + 22, `${id} · feet ${y}`, { fontSize: "12px", color: "#173b54" }).setDepth(99996);
  }
  return g;
}

function rounded(g, x, y, w, h, color, radius = 12) {
  g.fillStyle(color, 1).fillRoundedRect(x, y, w, h, radius);
  g.lineStyle(4, C.ink, 0.8).strokeRoundedRect(x, y, w, h, radius);
}

function cloud(g, x, y, scale = 1) {
  g.fillStyle(0xffffff, 0.88);
  g.fillEllipse(x, y, 180 * scale, 54 * scale);
  g.fillCircle(x - 30 * scale, y - 22 * scale, 35 * scale);
  g.fillCircle(x + 20 * scale, y - 35 * scale, 46 * scale);
}

function checker(g, x, y, cols, rows, size, a, b) {
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    g.fillStyle((row + col) % 2 ? a : b, 1).fillRect(x + col * size, y + row * size, size, size);
  }
  g.lineStyle(8, C.cream, 1).strokeRect(x, y, cols * size, rows * size);
}

function spiral(ctx) {
  const g = structure(ctx, "circus_spiral", 1650, 1120, 290, 85);
  rounded(g, -145, -85, 290, 85, C.orange, 28);
  // The back of each turn is darker and is painted before the central column.
  for (let i = 0; i < 5; i++) {
    g.lineStyle(32, C.darkRed, 1).strokeEllipse(0, -150 - i * 122, 390, 92);
  }
  rounded(g, -75, -800, 150, 748, C.orange, 25);
  g.fillStyle(C.yellow, 1).fillRect(-68, -780, 88, 715);
  g.fillStyle(0xffed95, 1).fillEllipse(0, -800, 150, 52);
  g.lineStyle(4, C.ink, 0.8).strokeEllipse(0, -800, 150, 52);
  // Sloping treads wrap across the face of the cylinder, with an outer rail.
  for (let turn = 0; turn < 5; turn++) {
    for (const shadow of [true, false]) {
      for (let step = 0; step < 16; step++) {
        const a = step / 15 * Math.PI;
        const x = Math.cos(a) * 183;
        const y = -86 - turn * 122 - step * 6 - Math.sin(a) * 15 + (shadow ? 12 : 0);
        g.lineStyle(shadow ? 15 : 11, shadow ? C.darkRed : C.red, 1).lineBetween(x * 0.36, y, x, y);
        if (!shadow && step % 3 === 0) g.lineStyle(4, C.red, 1).lineBetween(x, y - 36, x, y);
      }
    }
    g.lineStyle(5, C.red, 1);
    g.beginPath();
    for (let step = 0; step <= 32; step++) {
      const a = step / 32 * Math.PI;
      const x = Math.cos(a) * 183, y = -122 - turn * 122 - step * 90 / 32 - Math.sin(a) * 15;
      if (step === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokePath();
  }
  g.fillStyle(C.yellow, 1).fillCircle(0, -864, 26);
  g.lineStyle(7, C.orange, 1).lineBetween(0, -838, 0, -816);
}

function castle(ctx) {
  const g = structure(ctx, "circus_castle", 600, 780, 520, 0);
  // A real passage between the towers; no collider across the arch opening.
  ctx.solid(340, 706, 160, 74);
  ctx.solid(700, 706, 160, 74);
  rounded(g, -230, -290, 460, 80, C.salmon);
  for (const [x, color] of [[-260, C.blue], [100, C.green]]) {
    rounded(g, x, -400, 160, 400, color);
    rounded(g, x - 12, -418, 184, 58, C.yellow);
    for (let i = 0; i < 4; i++) rounded(g, x - 12 + i * 48, -451, 38, 45, color, 4);
    rounded(g, x + 48, -305, 64, 106, C.cream, 30);
    g.fillStyle(C.ink, 0.35).fillRoundedRect(x + 60, -291, 40, 80, 20);
    g.lineStyle(4, C.ink, 0.3);
    for (let y = -180; y < 0; y += 60) g.lineBetween(x, y, x + 160, y);
    g.fillStyle(C.cream, 0.3).fillRect(x + 10, -160, 22, 138);
  }
  g.lineStyle(44, C.orange, 1).beginPath().arc(0, -122, 102, Math.PI, Math.PI * 2).strokePath();
  rounded(g, -124, -125, 42, 125, C.orange, 4);
  rounded(g, 82, -125, 42, 125, C.orange, 4);
  ctx.solid(476, 736, 42, 44);
  ctx.solid(682, 736, 42, 44);
  g.fillStyle(C.red, 1).fillTriangle(-180, -526, -180, -466, -96, -499);
  g.lineStyle(6, C.ink, 1).lineBetween(-180, -532, -180, -441);
  g.fillStyle(C.yellow, 1).beginPath();
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 12 : 28;
    if (i === 0) g.moveTo(Math.cos(a) * r, -263 + Math.sin(a) * r);
    else g.lineTo(Math.cos(a) * r, -263 + Math.sin(a) * r);
  }
  g.closePath().fillPath();
}

function stack(ctx) {
  const g = structure(ctx, "circus_stacked_toy", 2650, 930, 350, 64);
  rounded(g, -175, -64, 350, 64, C.salmon, 24);
  rounded(g, -23, -677, 46, 620, C.orange, 20);
  const rings = [[0, -125, 350, 120, C.green], [-24, -241, 300, 125, C.salmon],
    [12, -359, 246, 130, C.yellow], [-20, -475, 188, 120, C.green], [16, -578, 130, 98, C.salmon]];
  for (const [x, y, w, h, color] of rings) {
    g.fillStyle(color, 1).fillEllipse(x, y, w, h);
    g.lineStyle(4, C.ink, 0.8).strokeEllipse(x, y, w, h);
    g.fillStyle(0xffffff, 0.23).fillEllipse(x - w * 0.1, y - 17, w * 0.67, h * 0.32);
  }
  g.fillStyle(C.yellow, 1).fillCircle(0, -698, 42);
  g.lineStyle(4, C.ink, 0.8).strokeCircle(0, -698, 42);
}

function arcade(ctx) {
  const g = structure(ctx, "circus_arcade", 2480, 1940, 400, 90);
  rounded(g, -200, -420, 400, 420, C.blue, 26);
  g.fillStyle(C.ink, 0.24).fillRect(142, -393, 46, 376);
  rounded(g, -227, -496, 454, 100, C.red, 22);
  for (let x = -174; x < 200; x += 58) g.fillStyle(C.yellow, 1).fillCircle(x, -448, 13);
  rounded(g, -153, -370, 287, 203, C.yellow, 18);
  rounded(g, -137, -353, 255, 169, 0x274d89, 14);
  cloud(g, -9, -268, 0.54);
  g.fillStyle(C.salmon, 1).fillCircle(-52, -314, 15);
  g.lineStyle(9, C.green, 1).strokeCircle(55, -245, 28);
  rounded(g, -222, -147, 426, 67, C.orange, 18);
  g.lineStyle(12, C.ink, 1).lineBetween(-115, -138, -115, -184);
  g.fillStyle(C.red, 1).fillCircle(-115, -186, 28);
  g.fillStyle(C.green, 1).fillEllipse(34, -122, 50, 26);
  g.fillStyle(C.yellow, 1).fillEllipse(111, -122, 50, 26);
  rounded(g, -52, -62, 104, 28, C.ink, 6);
}

function balloonDog(ctx) {
  const g = structure(ctx, "circus_balloon_dog", 680, 1830, 340, 50);
  rounded(g, -170, -50, 340, 50, C.blue, 24);
  const parts = [[-93, -100, 50, 132], [-25, -102, 46, 126], [90, -100, 47, 130],
    [144, -100, 44, 126], [5, -186, 250, 80], [-97, -253, 66, 143],
    [-124, -340, 45, 110], [-76, -338, 42, 112], [-132, -285, 118, 58], [161, -231, 42, 103]];
  for (const [x, y, w, h] of parts) {
    g.fillStyle(C.red, 1).fillEllipse(x, y, w, h);
    g.lineStyle(3, C.darkRed, 1).strokeEllipse(x, y, w, h);
    g.fillStyle(0xffffff, 0.3).fillEllipse(x - w * 0.15, y - h * 0.15, w * 0.19, h * 0.43);
  }
  g.fillStyle(C.darkRed, 1).fillCircle(-178, -285, 10);
}

function toyBlock(ctx, x, y, color, symbol) {
  const g = structure(ctx, `circus_block_${x}_${y}`, x, y, 128, 46);
  rounded(g, -64, -158, 128, 158, color);
  g.fillStyle(0xffffff, 0.23).fillTriangle(-60, -151, 56, -151, -60, -108);
  g.lineStyle(8, C.cream, 1);
  if (symbol === 0) g.strokeCircle(0, -80, 31);
  else if (symbol === 1) g.strokeTriangle(0, -119, -34, -48, 34, -48);
  else g.strokeRect(-30, -113, 60, 64);
}

function exitArch(ctx) {
  const g = structure(ctx, "circus_gallery_exit", 1060, 1110, 220, 0);
  rounded(g, -110, -230, 220, 230, C.yellow, 30);
  rounded(g, -86, -209, 172, 208, C.ink, 22);
  g.fillStyle(0x668e78, 1).fillRoundedRect(-69, -190, 138, 188, 18);
  g.lineStyle(8, C.orange, 1).strokeRoundedRect(-61, -183, 122, 174, 14);
  g.fillStyle(C.cream, 0.48).fillCircle(0, -108, 29);
  g.lineStyle(7, C.cream, 1).lineBetween(24, -108, -24, -108);
  g.lineBetween(-24, -108, -7, -122);
  g.lineBetween(-24, -108, -7, -94);
  ctx.solid(950, 1078, 26, 32);
  ctx.solid(1144, 1078, 26, 32);
  ctx.scene.add.text(1060, 1133, "GALERIA", { fontFamily: "sans-serif", fontSize: "15px", color: "#64384e" })
    .setOrigin(0.5).setDepth(-10);
}

function environment(ctx) {
  const { scene } = ctx;
  const g = scene.add.graphics().setDepth(-100);
  g.fillStyle(0xf5ba96, 1).fillRect(0, 0, BOUNDS.width, BOUNDS.height);
  g.fillStyle(C.salmon, 1).fillRoundedRect(145, 420, 880, 1710, 170);
  g.fillStyle(0xffd8a0, 1).fillRoundedRect(2140, 470, 870, 1720, 180);
  // Broad, connected paths around an open central plaza.
  g.lineStyle(170, C.cream, 1).beginPath().moveTo(600, 850).lineTo(600, 1150)
    .lineTo(1300, 1320).lineTo(1840, 1320).lineTo(2670, 1150).lineTo(2670, 985).strokePath();
  g.beginPath().moveTo(1300, 1320).lineTo(1150, 1930).lineTo(2480, 2100).strokePath();
  g.beginPath().moveTo(1150, 1930).lineTo(550, 2030).lineTo(380, 1420).lineTo(600, 850).strokePath();
  g.beginPath().moveTo(1840, 1320).lineTo(2030, 1720).lineTo(2800, 1720).lineTo(2670, 1150).strokePath();
  checker(g, 950, 870, 15, 7, 70, C.salmon, C.cream);
  checker(g, 2180, 1940, 9, 3, 65, C.orange, C.cream);
  checker(g, 375, 780, 7, 3, 65, C.yellow, C.cream);
  // Tall striped wall, with a deliberately impossible indoor sky opening.
  for (let x = 0; x < BOUNDS.width; x += 120) {
    g.fillStyle((x / 120) % 2 ? C.yellow : C.red, 1).fillRect(x, 0, 120, 360);
  }
  g.fillStyle(C.ink, 0.16).fillRect(0, 312, 3200, 48);
  rounded(g, 1940, 45, 1010, 270, C.orange, 80);
  g.fillStyle(0x6fbff1, 1).fillRoundedRect(1960, 60, 970, 235, 70);
  cloud(g, 2150, 169, 0.9); cloud(g, 2570, 209, 1.2); cloud(g, 2800, 120, 0.6);
  // Rails high above the wall, drawn in the background without gameplay bodies.
  g.lineStyle(45, C.orange, 1).beginPath().moveTo(60, 92).lineTo(670, 92).lineTo(880, 210).lineTo(1590, 210).strokePath();
  g.lineStyle(17, C.yellow, 1).beginPath().moveTo(60, 84).lineTo(680, 84).lineTo(890, 202).lineTo(1600, 202).strokePath();
  g.lineStyle(26, C.darkRed, 1).strokeEllipse(1380, 100, 620, 230);
  for (let x = 190; x < 1840; x += 230) {
    g.lineStyle(4, C.cream, 0.65).lineBetween(x, 0, x, 70);
    g.fillStyle(C.yellow, 1).fillCircle(x, 78, 12);
  }
  // Continuous finished perimeter: colliders coincide with the colored skirting.
  g.fillStyle(C.red, 1).fillRect(0, 360, 48, 2040).fillRect(3152, 360, 48, 2040).fillRect(0, 2352, 3200, 48);
  g.fillStyle(C.yellow, 1).fillRect(48, 360, 12, 1992).fillRect(3140, 360, 12, 1992).fillRect(48, 2340, 3104, 12);
  ctx.solid(0, 0, 3200, 360);
  ctx.solid(0, 360, 48, 2040);
  ctx.solid(3152, 360, 48, 2040);
  ctx.solid(0, 2352, 3200, 48);
  // Sparse bubbles, no particles/timers/listeners and no invisible obstacles.
  const bubbles = scene.add.graphics().setDepth(3000);
  for (const [x, y, r] of [[410, 460, 34], [1220, 650, 48], [2210, 920, 35], [2820, 1440, 55], [1550, 2050, 42]]) {
    bubbles.fillStyle(0xd3f7ff, 0.12).fillCircle(x, y, r);
    bubbles.lineStyle(3, 0xfaffff, 0.55).strokeCircle(x, y, r);
    bubbles.lineStyle(5, C.salmon, 0.35).beginPath().arc(x, y, r - 4, 0.1, 1.6).strokePath();
    bubbles.fillStyle(0xffffff, 0.65).fillEllipse(x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.4);
  }
}

export default {
  id: "digital_circus",
  bounds: BOUNDS,
  ambience: "digital_circus",
  spawns: { default: digitalCircusSpawn, from_gallery: digitalCircusSpawn },
  gates: [],
  panelMarkerIds: [],
  build(ctx) {
    environment(ctx);
    castle(ctx); stack(ctx); spiral(ctx); arcade(ctx); balloonDog(ctx); exitArch(ctx);
    [[350, 1200, C.green, 0], [810, 1330, C.blue, 1], [2050, 690, C.salmon, 2],
      [2850, 1550, C.red, 0], [1690, 1980, C.green, 1], [1820, 2100, C.yellow, 2],
      [460, 2160, C.yellow, 0]].forEach((args) => toyBlock(ctx, ...args));
    // Walkable arch: only the two feet collide, its overhead tube occludes by Y.
    const arch = structure(ctx, "circus_tube_arch", 1870, 1710, 380, 0);
    arch.lineStyle(54, C.green, 1).beginPath().arc(0, -165, 170, Math.PI, 2 * Math.PI).strokePath();
    rounded(arch, -197, -170, 54, 170, C.green, 10);
    rounded(arch, 143, -170, 54, 170, C.green, 10);
    ctx.solid(1673, 1666, 54, 44); ctx.solid(2013, 1666, 54, 44);
  },
  wire(ctx) {
    ctx.addUpdatable(new Interactable(ctx.scene, {
      id: "digital_circus_exit", x: 1060, y: 1145, radius: 88,
      prompt: "[E] Voltar à Galeria", action: () => ctx.travel("gallery")
    }));
    if (state.debug) {
      ctx.scene.add.circle(1060, 1145, 88, 0x22c55e, 0.13).setDepth(99996);
    }
  }
};
