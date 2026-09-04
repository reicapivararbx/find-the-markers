// Texturas procedurais desenhadas em runtime (estilo desenho à mão do PDF).
// Marker: canvas 56x80, corpo centralizado; pés em y=77.
// Se um dia existirem PNGs definitivos em game/assets/, registre-os no
// OPTIONAL_PNG_ASSETS (game/assets/manifest.js) — PNG existente vence o procedural.
import { difficultyColor } from "../config/difficulty-metadata.js";

const INK = 0x33333d;
const PAPER = 0xf8f4ea;

function graphics(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

function markerFeet(g, color, ox = 0) {
  g.lineStyle(4, INK, 1);
  g.lineBetween(22 + ox, 68, 20 + ox, 75);
  g.lineBetween(34 + ox, 68, 36 + ox, 75);
  g.fillStyle(INK, 1);
  g.fillEllipse(18 + ox, 76, 9, 4);
  g.fillEllipse(38 + ox, 76, 9, 4);
  if (color != null) {
    g.fillStyle(color, 1);
    g.fillCircle(5 + ox, 59, 3.4);
    g.fillCircle(51 + ox, 59, 3.4);
  }
}

function markerArms(g, color) {
  g.lineStyle(4, INK, 1);
  g.lineBetween(12, 50, 6, 58);
  g.lineBetween(44, 50, 50, 58);
  g.fillStyle(color, 1);
  g.fillCircle(5, 59, 3.4);
  g.fillCircle(51, 59, 3.4);
}

function faceDots(g, lx = 23, rx = 34, ey = 44) {
  g.fillStyle(INK, 1);
  g.fillEllipse(lx, ey, 6, 8);
  g.fillEllipse(rx, ey, 6, 8);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(lx + 1.2, ey - 1.4, 1.5);
  g.fillCircle(rx + 1.2, ey - 1.4, 1.5);
}

function gMarkerSilhouette(g, color, style) {
  if (style === "moss") {
    markerFeet(g, color);
    g.fillStyle(0x4a7a3a, 1);
    g.fillEllipse(28, 48, 38, 44);
    g.fillStyle(0x6fae5a, 1);
    g.fillEllipse(18, 40, 18, 16);
    g.fillEllipse(38, 42, 16, 14);
    g.fillEllipse(28, 58, 22, 18);
    g.fillStyle(0x8fba6a, 0.7);
    g.fillCircle(22, 34, 8);
    g.fillCircle(36, 36, 7);
    g.fillStyle(color, 1);
    g.fillTriangle(28, 8, 12, 28, 44, 28);
    g.fillStyle(0x3d6b2e, 1);
    g.fillCircle(16, 22, 5);
    g.fillCircle(40, 20, 4);
    g.fillCircle(28, 14, 6);
    g.lineStyle(2.5, INK, 0.85);
    g.strokeEllipse(28, 48, 38, 44);
    faceDots(g, 22, 34, 46);
    return true;
  }
  if (style === "vine") {
    markerFeet(g, 0x5d8f46);
    g.fillStyle(0x6b4a2a, 1);
    g.fillRoundedRect(22, 28, 12, 42, 4);
    g.lineStyle(3.5, 0x4a7a3a, 1);
    g.beginPath();
    g.moveTo(28, 30);
    g.lineTo(10, 18);
    g.lineTo(6, 8);
    g.moveTo(28, 34);
    g.lineTo(46, 22);
    g.lineTo(50, 10);
    g.moveTo(28, 50);
    g.lineTo(8, 48);
    g.moveTo(28, 54);
    g.lineTo(48, 56);
    g.strokePath();
    g.fillStyle(0x7cae62, 1);
    g.fillEllipse(8, 10, 12, 8);
    g.fillEllipse(48, 12, 12, 8);
    g.fillEllipse(6, 48, 10, 7);
    g.fillEllipse(50, 56, 10, 7);
    g.fillStyle(color, 1);
    g.fillCircle(28, 24, 10);
    faceDots(g, 24, 32, 24);
    return true;
  }
  if (style === "bloom") {
    markerFeet(g, color);
    const petals = 6;
    for (let i = 0; i < petals; i += 1) {
      const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
      g.fillStyle(i % 2 ? color : 0xffb0c8, 1);
      g.fillEllipse(28 + Math.cos(a) * 16, 40 + Math.sin(a) * 14, 14, 10);
    }
    g.fillStyle(0xfff0a0, 1);
    g.fillCircle(28, 40, 12);
    g.lineStyle(2.5, INK, 0.8);
    g.strokeCircle(28, 40, 12);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "trellis") {
    markerFeet(g, 0x8a6238);
    g.lineStyle(3, 0x8a6238, 1);
    g.strokeRect(14, 14, 28, 54);
    g.lineBetween(14, 28, 42, 28);
    g.lineBetween(14, 42, 42, 42);
    g.lineBetween(14, 56, 42, 56);
    g.lineBetween(28, 14, 28, 68);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(20, 22, 4);
    g.fillCircle(36, 34, 4);
    g.fillCircle(22, 48, 3.5);
    g.fillStyle(color, 1);
    g.fillRoundedRect(18, 30, 20, 28, 4);
    faceDots(g, 23, 33, 42);
    return true;
  }
  if (style === "pond") {
    markerFeet(g, 0x3a9088);
    g.fillStyle(0x5eb8b0, 0.95);
    g.fillEllipse(28, 48, 40, 36);
    g.fillStyle(0x7ed4cc, 0.5);
    g.fillEllipse(22, 42, 16, 10);
    g.fillStyle(color, 1);
    g.fillRoundedRect(18, 28, 20, 30, 10);
    g.lineStyle(2.5, INK, 0.75);
    g.strokeEllipse(28, 48, 40, 36);
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(20, 40, 10, 5);
    g.fillStyle(0x5d8f46, 1);
    g.fillEllipse(40, 58, 14, 8);
    faceDots(g, 23, 33, 40);
    return true;
  }
  if (style === "bee") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillEllipse(28, 46, 28, 36);
    g.fillStyle(INK, 1);
    g.fillRect(14, 36, 28, 5);
    g.fillRect(14, 48, 28, 5);
    g.fillRect(14, 58, 28, 4);
    g.fillStyle(0xffffff, 0.85);
    g.fillEllipse(8, 34, 14, 10);
    g.fillEllipse(48, 34, 14, 10);
    g.lineStyle(2, INK, 0.5);
    g.strokeEllipse(8, 34, 14, 10);
    g.strokeEllipse(48, 34, 14, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 22, 10);
    g.fillStyle(INK, 1);
    g.fillTriangle(24, 8, 28, 2, 32, 8);
    faceDots(g, 24, 32, 22);
    return true;
  }
  if (style === "lantern") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0x5a4030, 1);
    g.fillRect(25, 6, 6, 14);
    g.fillStyle(0xf2c94c, 1);
    g.fillRoundedRect(12, 18, 32, 40, 6);
    g.fillStyle(0xffe08a, 0.55);
    g.fillRoundedRect(16, 24, 24, 28, 4);
    g.lineStyle(3, INK, 0.9);
    g.strokeRoundedRect(12, 18, 32, 40, 6);
    g.lineBetween(12, 30, 44, 30);
    g.lineBetween(28, 18, 28, 58);
    g.fillStyle(color, 1);
    g.fillCircle(28, 38, 8);
    faceDots(g, 24, 32, 38);
    return true;
  }
  if (style === "root") {
    markerFeet(g, 0x6b4a2a);
    g.fillStyle(0x8a6238, 1);
    g.fillEllipse(28, 40, 24, 32);
    g.lineStyle(4, 0x6b4a2a, 1);
    g.beginPath();
    g.moveTo(20, 55);
    g.lineTo(8, 72);
    g.moveTo(28, 58);
    g.lineTo(28, 76);
    g.moveTo(36, 55);
    g.lineTo(48, 72);
    g.moveTo(16, 48);
    g.lineTo(4, 58);
    g.moveTo(40, 48);
    g.lineTo(52, 58);
    g.strokePath();
    g.fillStyle(color, 1);
    g.fillCircle(28, 28, 12);
    g.fillStyle(0x4a7a3a, 0.7);
    g.fillCircle(18, 22, 5);
    faceDots(g, 24, 32, 28);
    return true;
  }
  if (style === "petal") {
    markerFeet(g, 0xe884b5);
    g.fillStyle(0xffb0c8, 1);
    g.fillTriangle(28, 12, 8, 48, 48, 48);
    g.fillStyle(0xe884b5, 1);
    g.fillTriangle(28, 20, 14, 52, 42, 52);
    g.fillStyle(color, 1);
    g.fillEllipse(28, 44, 18, 24);
    g.lineStyle(2.5, INK, 0.75);
    g.strokeTriangle(28, 12, 8, 48, 48, 48);
    faceDots(g, 24, 32, 44);
    return true;
  }
  if (style === "greenhouse") {
    markerFeet(g, 0x7ed4cc);
    g.fillStyle(0xbfe8f7, 0.95);
    g.fillTriangle(28, 6, 6, 36, 50, 36);
    g.fillRect(10, 36, 36, 32);
    g.lineStyle(3, 0x5a8a9a, 1);
    g.strokeTriangle(28, 6, 6, 36, 50, 36);
    g.strokeRect(10, 36, 36, 32);
    g.lineBetween(28, 6, 28, 68);
    g.lineBetween(10, 52, 46, 52);
    g.fillStyle(0x5d8f46, 1);
    g.fillEllipse(20, 58, 10, 8);
    g.fillEllipse(36, 60, 10, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 44, 9);
    faceDots(g, 24, 32, 44);
    return true;
  }
  if (style === "crystal") {
    markerFeet(g, color);
    g.fillStyle(color, 0.85);
    g.fillTriangle(28, 4, 10, 36, 46, 36);
    g.fillStyle(0xffffff, 0.35);
    g.fillTriangle(28, 10, 18, 32, 28, 32);
    g.fillStyle(color, 0.7);
    g.fillTriangle(14, 34, 28, 72, 8, 68);
    g.fillTriangle(42, 34, 28, 72, 48, 68);
    g.fillStyle(color, 0.9);
    g.fillTriangle(20, 34, 36, 34, 28, 70);
    g.lineStyle(2.5, INK, 0.8);
    g.strokeTriangle(28, 4, 10, 36, 46, 36);
    g.strokeTriangle(20, 34, 36, 34, 28, 70);
    faceDots(g, 23, 33, 48);
    return true;
  }
  if (style === "sewer") {
    markerFeet(g, 0x5a7a3a);
    g.fillStyle(0x6a7060, 1);
    g.fillRoundedRect(10, 20, 30, 48, 10);
    g.fillStyle(0x4a8a3a, 0.9);
    g.fillEllipse(40, 50, 18, 28);
    g.fillCircle(44, 68, 6);
    g.fillCircle(48, 74, 3);
    g.fillStyle(0x3a6a2a, 0.7);
    g.fillEllipse(16, 58, 12, 10);
    g.lineStyle(2.5, INK, 0.85);
    g.strokeRoundedRect(10, 20, 30, 48, 10);
    g.fillStyle(color, 1);
    g.fillCircle(24, 34, 10);
    faceDots(g, 20, 28, 34);
    return true;
  }
  if (style === "ice") {
    markerFeet(g, 0xa8d4f0);
    g.fillStyle(0xd0e8ff, 0.95);
    g.fillRoundedRect(14, 18, 28, 50, 4);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(18, 22, 28, 8, 38, 22);
    g.fillTriangle(12, 40, 8, 28, 16, 36);
    g.fillTriangle(44, 40, 48, 28, 40, 36);
    g.lineStyle(2.5, 0x7ab0d0, 0.9);
    g.strokeRoundedRect(14, 18, 28, 50, 4);
    g.fillStyle(color, 0.85);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "neon_emit") {
    markerFeet(g, color);
    const bands = [0xff5d5d, 0xf2c94c, 0x62c462, 0x56ccf2, 0xb37feb];
    g.fillStyle(0x1a1a28, 1);
    g.fillRoundedRect(12, 16, 32, 52, 6);
    bands.forEach((band, i) => {
      g.fillStyle(band, 1);
      g.fillRect(14, 20 + i * 8, 28, 6);
    });
    g.fillStyle(color, 0.4);
    g.fillCircle(28, 42, 22);
    g.lineStyle(3, color, 1);
    g.strokeRoundedRect(12, 16, 32, 52, 6);
    faceDots(g, 23, 33, 44);
    return true;
  }
  if (style === "null_void") {
    markerFeet(g, 0x62c462, -4);
    g.fillStyle(0x2a2a38, 1);
    g.fillRoundedRect(8, 20, 28, 44, 4);
    g.fillStyle(0x62c462, 1);
    g.fillRect(4, 28, 8, 8);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(40, 36, 10, 6);
    g.fillStyle(0x56ccf2, 1);
    g.fillRect(36, 52, 12, 8);
    g.fillStyle(PAPER, 1);
    g.fillRoundedRect(18, 26, 28, 40, 6);
    g.fillStyle(0xff5d5d, 0.7);
    g.fillRect(42, 22, 6, 20);
    g.lineStyle(2, 0x62c462, 1);
    g.strokeRoundedRect(8, 20, 28, 44, 4);
    g.lineStyle(2, INK, 0.7);
    g.strokeRoundedRect(18, 26, 28, 40, 6);
    faceDots(g, 26, 36, 42);
    g.fillStyle(0x62c462, 1);
    g.fillRect(22, 40, 4, 4);
    g.fillStyle(0xff5d5d, 1);
    g.fillRect(34, 44, 4, 4);
    return true;
  }
  if (style === "anchor") {
    markerFeet(g, 0x5a7088);
    g.fillStyle(0x4a5a70, 1);
    g.fillCircle(28, 18, 8);
    g.fillRect(24, 18, 8, 36);
    g.fillTriangle(12, 58, 28, 48, 28, 68);
    g.fillTriangle(44, 58, 28, 48, 28, 68);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 11);
    g.lineStyle(2.5, INK, 0.85);
    g.strokeCircle(28, 18, 8);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "buoy") {
    markerFeet(g, 0xd1495b);
    g.fillStyle(0xd1495b, 1);
    g.fillEllipse(28, 44, 28, 40);
    g.fillStyle(0xf2c94c, 1);
    g.fillEllipse(28, 28, 22, 16);
    g.fillStyle(0xffffff, 1);
    g.fillRect(24, 8, 8, 18);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 10);
    g.lineStyle(2.5, INK, 0.8);
    g.strokeEllipse(28, 44, 28, 40);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "crane") {
    markerFeet(g, 0xd4a017);
    g.fillStyle(0xd4a017, 1);
    g.fillRect(24, 20, 8, 48);
    g.fillRect(24, 16, 28, 10);
    g.lineStyle(3, 0x8a7000, 1);
    g.lineBetween(48, 26, 48, 50);
    g.fillStyle(0x6a6a70, 1);
    g.fillRect(42, 50, 12, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "dock") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0xa9805a, 1);
    g.fillRoundedRect(10, 30, 36, 36, 4);
    g.lineStyle(2.5, 0x6d4a2a, 0.9);
    g.lineBetween(18, 30, 18, 66);
    g.lineBetween(28, 30, 28, 66);
    g.lineBetween(38, 30, 38, 66);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "foghorn") {
    markerFeet(g, 0x6a7060);
    g.fillStyle(0x8a9080, 1);
    g.fillTriangle(28, 12, 8, 48, 48, 48);
    g.fillRect(18, 48, 20, 20);
    g.fillStyle(0x3a8ab8, 0.5);
    g.fillEllipse(28, 8, 24, 12);
    g.fillStyle(color, 1);
    g.fillCircle(28, 44, 10);
    faceDots(g, 24, 32, 44);
    return true;
  }
  if (style === "net") {
    markerFeet(g, 0x5a8a9a);
    g.lineStyle(2.5, 0x4a7080, 1);
    for (let i = 0; i < 5; i += 1) {
      g.lineBetween(12 + i * 8, 16, 12 + i * 8, 68);
      g.lineBetween(10, 20 + i * 10, 46, 20 + i * 10);
    }
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 11);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "pier") {
    markerFeet(g, 0x6d4a2a);
    g.fillStyle(0x8a6238, 1);
    g.fillRect(8, 50, 40, 16);
    g.fillRect(14, 20, 10, 30);
    g.fillRect(32, 24, 10, 26);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "rope") {
    markerFeet(g, 0xc4a574);
    g.fillStyle(0xc4a574, 1);
    g.fillEllipse(28, 44, 30, 28);
    g.lineStyle(3, 0x8a6238, 1);
    g.strokeEllipse(28, 44, 22, 20);
    g.strokeEllipse(28, 44, 12, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 9);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "sail") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0x8a6238, 1);
    g.fillRect(26, 16, 4, 52);
    g.fillStyle(0xf0ece4, 1);
    g.fillTriangle(30, 18, 30, 50, 50, 48);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "tide") {
    markerFeet(g, 0x3a8ab8);
    g.fillStyle(0x5eb8d8, 0.9);
    g.fillEllipse(28, 50, 36, 28);
    g.fillStyle(0xa8d4f0, 0.7);
    g.fillEllipse(28, 42, 28, 16);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 11);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "bolt") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0xb0a898, 1);
    g.fillCircle(28, 28, 14);
    g.fillRect(22, 28, 12, 36);
    g.fillStyle(0x5a5048, 1);
    g.fillCircle(28, 28, 5);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 9);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "cog") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0x8a8070, 1);
    g.fillCircle(28, 40, 22);
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      g.fillRect(28 + Math.cos(a) * 22 - 5, 40 + Math.sin(a) * 22 - 5, 10, 10);
    }
    g.fillStyle(0x5a5048, 1);
    g.fillCircle(28, 40, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "conveyor") {
    markerFeet(g, 0x5a5048);
    g.fillStyle(0x5a5048, 1);
    g.fillRoundedRect(8, 40, 40, 24, 4);
    g.fillStyle(0x3a3830, 1);
    g.fillRect(12, 44, 10, 14);
    g.fillRect(24, 44, 10, 14);
    g.fillRect(36, 44, 8, 14);
    g.fillStyle(color, 1);
    g.fillCircle(28, 30, 11);
    faceDots(g, 24, 32, 30);
    return true;
  }
  if (style === "gear") {
    markerFeet(g, 0xa9805a);
    g.fillStyle(0xb0a090, 1);
    g.fillCircle(28, 42, 20);
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      g.fillRect(28 + Math.cos(a) * 20 - 4, 42 + Math.sin(a) * 20 - 4, 8, 8);
    }
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "oil") {
    markerFeet(g, 0x3a6a3a);
    g.fillStyle(0x3a6a3a, 1);
    g.fillRoundedRect(14, 18, 28, 48, 8);
    g.fillStyle(0xd1495b, 1);
    g.fillRect(14, 36, 28, 10);
    g.fillStyle(0x2a2a20, 0.7);
    g.fillEllipse(28, 68, 20, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 30, 9);
    faceDots(g, 24, 32, 30);
    return true;
  }
  if (style === "pipe") {
    markerFeet(g, 0x8a9088);
    g.fillStyle(0x8a9088, 1);
    g.fillRoundedRect(18, 12, 20, 56, 6);
    g.fillEllipse(28, 12, 24, 12);
    g.fillStyle(0xb0b8b0, 0.6);
    g.fillRect(20, 30, 16, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 44, 10);
    faceDots(g, 24, 32, 44);
    return true;
  }
  if (style === "press") {
    markerFeet(g, 0x6a6058);
    g.fillStyle(0x6a6058, 1);
    g.fillRect(10, 14, 36, 14);
    g.fillRect(22, 28, 12, 20);
    g.fillRect(14, 48, 28, 18);
    g.fillStyle(color, 1);
    g.fillCircle(28, 38, 9);
    faceDots(g, 24, 32, 38);
    return true;
  }
  if (style === "rust") {
    markerFeet(g, 0xb85a2a);
    g.fillStyle(0xb85a2a, 1);
    g.fillRoundedRect(12, 20, 32, 48, 6);
    g.fillStyle(0x8a3a1a, 0.7);
    g.fillCircle(18, 32, 6);
    g.fillCircle(38, 50, 8);
    g.fillCircle(24, 58, 5);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "smokestack") {
    markerFeet(g, 0x6a6058);
    g.fillStyle(0x6a6058, 1);
    g.fillRect(18, 24, 20, 44);
    g.fillRect(14, 18, 28, 10);
    g.fillStyle(0x888890, 0.5);
    g.fillEllipse(32, 10, 18, 12);
    g.fillEllipse(38, 2, 14, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 10);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "wrench") {
    markerFeet(g, 0x8a9088);
    g.fillStyle(0xa0a8a0, 1);
    g.fillCircle(18, 22, 10);
    g.fillRect(16, 22, 8, 40);
    g.fillCircle(38, 58, 10);
    g.fillStyle(0x5a6058, 1);
    g.fillCircle(18, 22, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "cart") {
    markerFeet(g, 0x6a5040);
    g.fillStyle(0x6a5040, 1);
    g.fillRoundedRect(10, 30, 36, 28, 4);
    g.fillStyle(0x3a3028, 1);
    g.fillCircle(18, 60, 8);
    g.fillCircle(38, 60, 8);
    g.fillStyle(0x5a8a3a, 0.8);
    g.fillEllipse(28, 32, 28, 12);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 9);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "coal") {
    markerFeet(g, 0x2a2820);
    g.fillStyle(0x2a2820, 1);
    g.fillEllipse(28, 44, 32, 36);
    g.fillStyle(0x4a4840, 1);
    g.fillCircle(20, 36, 8);
    g.fillCircle(36, 48, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 9);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "dynamite") {
    markerFeet(g, 0xd1495b);
    g.fillStyle(0xd1495b, 1);
    g.fillRoundedRect(16, 20, 10, 44, 4);
    g.fillRoundedRect(28, 24, 10, 40, 4);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(16, 18, 10, 6);
    g.fillRect(28, 22, 10, 6);
    g.lineStyle(2, 0x33333d, 1);
    g.lineBetween(21, 16, 21, 8);
    g.lineBetween(33, 20, 33, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 9);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "helmet") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillEllipse(28, 28, 34, 28);
    g.fillRect(10, 28, 36, 12);
    g.fillStyle(0x3a3a40, 1);
    g.fillRect(24, 22, 8, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 11);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "ore") {
    markerFeet(g, 0x5a7ab0);
    g.fillStyle(0x6a6a60, 1);
    g.fillEllipse(28, 48, 30, 28);
    g.fillStyle(0x5a7ab0, 0.9);
    g.fillCircle(22, 40, 8);
    g.fillStyle(0x7a9a3a, 0.8);
    g.fillCircle(36, 46, 7);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 10);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "pickaxe") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0x8a6238, 1);
    g.fillRect(26, 24, 6, 44);
    g.fillStyle(0x6a7060, 1);
    g.fillTriangle(10, 28, 46, 28, 28, 16);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 10);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "rail") {
    markerFeet(g, 0x4a4038);
    g.fillStyle(0x4a4038, 1);
    g.fillRect(8, 50, 40, 8);
    g.fillRect(12, 30, 6, 28);
    g.fillRect(38, 30, 6, 28);
    g.fillStyle(0x8a8070, 1);
    g.fillRect(10, 36, 36, 4);
    g.fillRect(10, 46, 36, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 28, 11);
    faceDots(g, 24, 32, 28);
    return true;
  }
  if (style === "shaft") {
    markerFeet(g, 0x3a3028);
    g.fillStyle(0x1a1810, 1);
    g.fillEllipse(28, 44, 32, 40);
    g.fillStyle(0x5a5040, 1);
    g.fillRect(10, 58, 36, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 10);
    faceDots(g, 24, 32, 36);
    return true;
  }
  return false;
}

function gMarker(g, color, style) {
  if (gMarkerSilhouette(g, color, style)) return;

  markerFeet(g, null);
  markerArms(g, color);

  g.fillStyle(PAPER, 1);
  g.fillRoundedRect(12, 22, 32, 46, 8);
  g.lineStyle(3, color, 1);
  g.strokeRoundedRect(12, 22, 32, 46, 8);
  g.lineStyle(2.5, INK, 0.85);
  g.strokeRoundedRect(12, 22, 32, 46, 8);

  // tampa
  if (style === "neon") {
    const bands = [0xff5d5d, 0xf2c94c, 0x62c462, 0x56ccf2, 0xb37feb];
    bands.forEach((band, i) => {
      g.fillStyle(band, 1);
      g.fillRect(14, 11 + i * 3.4, 28, 3.4);
    });
    g.lineStyle(2.5, INK, 0.85);
    g.strokeRoundedRect(14, 10, 28, 18, 5);
  } else {
    g.fillStyle(color, 1);
    g.fillRoundedRect(14, 10, 28, 18, 5);
    g.lineStyle(2.5, INK, 0.85);
    g.strokeRoundedRect(14, 10, 28, 18, 5);
  }

  // rosto
  g.fillStyle(INK, 1);
  if (style === "sleeper") {
    g.lineStyle(2.5, INK, 1);
    g.beginPath();
    g.arc(23, 46, 3.2, Math.PI * 1.15, Math.PI * 1.85);
    g.strokePath();
    g.beginPath();
    g.arc(34, 46, 3.2, Math.PI * 1.15, Math.PI * 1.85);
    g.strokePath();
    g.beginPath();
    g.arc(28.5, 52, 3, Math.PI * 0.15, Math.PI * 0.85);
    g.strokePath();
  } else if (style === "demon") {
    g.fillEllipse(23, 44, 7, 8);
    g.fillEllipse(34, 44, 7, 8);
    g.lineStyle(3, INK, 1);
    g.lineBetween(18, 38, 27, 41);
    g.lineBetween(39, 38, 30, 41);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(22, 55, 26, 55, 24, 59);
    g.fillTriangle(30, 55, 34, 55, 32, 59);
  } else if (style === "worried") {
    g.fillEllipse(23, 44, 6, 8);
    g.fillEllipse(34, 44, 6, 8);
    g.fillCircle(28.5, 56, 3);
  } else if (style === "8ball") {
    g.fillStyle(0x23252d, 1);
    g.fillRoundedRect(12, 22, 32, 46, 8);
    g.lineStyle(3, color, 1);
    g.strokeRoundedRect(12, 22, 32, 46, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(28, 46, 9.5);
    g.fillStyle(0x23252d, 1);
    g.fillCircle(28, 46, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(26.5, 44.5, 1.6);
  } else if (style === "brick") {
    g.lineStyle(2, 0x8c5a3c, 0.9);
    for (let y = 28; y < 66; y += 8) {
      g.lineBetween(13, y, 43, y);
      const offset = ((y - 28) / 8) % 2 === 0 ? 18 : 28;
      g.lineBetween(offset, y, offset, y + 8);
    }
    g.lineStyle(4, INK, 1);
    g.lineBetween(17, 42, 27, 44);
    g.lineBetween(39, 42, 29, 44);
    g.fillStyle(0x23252d, 1);
    g.fillRect(16, 41, 13, 6);
    g.fillRect(27, 41, 13, 6);
  } else {
    g.fillEllipse(23, 44, 7, 9);
    g.fillEllipse(34, 44, 7, 9);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24.2, 42.6, 1.7);
    g.fillCircle(35.2, 42.6, 1.7);
    g.fillStyle(INK, 1);
    g.lineStyle(2.5, INK, 1);
    g.beginPath();
    g.arc(28.5, 52, 5, Math.PI * 0.18, Math.PI * 0.82);
    g.strokePath();
  }

  // acessórios
  if (style === "tophat") {
    g.fillStyle(0x2b4a8f, 1);
    g.fillRect(10, 8, 36, 5);
    g.fillRect(15, -4, 26, 13);
    g.fillStyle(0xd1495b, 1);
    g.fillRect(15, 3, 26, 4);
  } else if (style === "ears") {
    g.fillStyle(0x7a4fd0, 1);
    g.fillCircle(15, 11, 6);
    g.fillCircle(41, 11, 6);
  } else if (style === "window") {
    g.lineStyle(2.5, 0x35405e, 0.9);
    g.strokeRoundedRect(16, 28, 24, 12, 2);
    g.fillStyle(0x56ccf2, 1);
    g.fillRect(17, 29, 22, 4);
  } else if (style === "note") {
    g.fillStyle(0x35405e, 1);
    g.fillEllipse(33, 17, 9, 7);
    g.lineStyle(2.5, 0x35405e, 1);
    g.lineBetween(37, 16, 37, 4);
  } else if (style === "glitch") {
    g.fillStyle(0x62c462, 1);
    g.fillRect(4, 30, 6, 6);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(46, 38, 6, 6);
    g.fillStyle(0x56ccf2, 1);
    g.fillRect(5, 52, 5, 5);
  } else if (style === "bow") {
    // lacinho rosa (marker dos créditos)
    g.fillStyle(0xe884b5, 1);
    g.fillTriangle(28, 8, 18, 2, 18, 14);
    g.fillTriangle(28, 8, 38, 2, 38, 14);
    g.fillCircle(28, 8, 3.4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(23, 42.6, 1.7);
    g.fillCircle(34.2, 42.6, 1.7);
  } else if (style === "headphones") {
    // fones (marker dos créditos)
    g.lineStyle(4, 0x33333d, 1);
    g.beginPath();
    g.arc(28, 34, 19, Math.PI, 0);
    g.strokePath();
    g.fillStyle(0x35405e, 1);
    g.fillRoundedRect(3, 30, 9, 16, 3);
    g.fillRoundedRect(44, 30, 9, 16, 3);
  } else if (style === "shark") {
    // padrão rosa/amarelo do marker da sinuca (página 3)
    g.fillStyle(0xf291c2, 1);
    g.fillRoundedRect(12, 22, 32, 46, 8);
    g.fillStyle(0xf2c94c, 1);
    g.fillTriangle(16, 26, 26, 26, 21, 36);
    g.fillTriangle(30, 26, 40, 26, 35, 36);
    g.fillTriangle(23, 44, 33, 44, 28, 54);
    g.lineStyle(3, 0xd4699f, 1);
    g.strokeRoundedRect(12, 22, 32, 46, 8);
  } else if (style === "miku") {
    const MIKU = 0x39c5bb;
    const MIKU_DARK = 0x2a9a92;
    const MIKU_LIGHT = 0x7ee8df;
    const GRAPHITE = 0x2a2a32;
    const BODY = 0xe8ecef;

    g.fillStyle(MIKU_DARK, 1);
    g.fillEllipse(4, 52, 14, 48);
    g.fillEllipse(52, 52, 14, 48);
    g.fillStyle(MIKU, 1);
    g.fillEllipse(5, 48, 11, 42);
    g.fillEllipse(51, 48, 11, 42);
    g.fillStyle(MIKU_LIGHT, 0.55);
    g.fillEllipse(3, 40, 5, 18);
    g.fillEllipse(53, 40, 5, 18);
    g.fillStyle(MIKU_DARK, 0.85);
    g.fillEllipse(4, 72, 10, 12);
    g.fillEllipse(52, 72, 10, 12);

    g.lineStyle(4, GRAPHITE, 1);
    g.lineBetween(22, 68, 20, 75);
    g.lineBetween(34, 68, 36, 75);
    g.fillStyle(GRAPHITE, 1);
    g.fillEllipse(18, 76, 10, 5);
    g.fillEllipse(38, 76, 10, 5);
    g.fillStyle(MIKU, 1);
    g.fillRect(16, 74, 6, 2);
    g.fillRect(34, 74, 6, 2);

    g.fillStyle(BODY, 1);
    g.fillRoundedRect(12, 22, 32, 46, 8);
    g.fillStyle(GRAPHITE, 1);
    g.fillRect(12, 36, 6, 28);
    g.fillRect(38, 36, 6, 28);
    g.fillStyle(MIKU, 1);
    g.fillTriangle(28, 26, 22, 34, 34, 34);
    g.fillRect(25, 34, 6, 22);
    g.fillStyle(MIKU_DARK, 0.5);
    g.fillRect(28, 34, 3, 22);
    g.lineStyle(2.5, INK, 0.85);
    g.strokeRoundedRect(12, 22, 32, 46, 8);

    g.fillStyle(GRAPHITE, 1);
    g.fillRoundedRect(2, 42, 11, 22, 3);
    g.fillRoundedRect(43, 42, 11, 22, 3);
    g.fillStyle(MIKU, 1);
    g.fillRect(3, 48, 9, 2);
    g.fillRect(44, 48, 9, 2);
    g.fillStyle(MIKU_LIGHT, 1);
    g.fillRect(4, 52, 3, 3);
    g.fillRect(8, 52, 3, 3);
    g.fillStyle(0xffffff, 0.7);
    g.fillRect(4, 57, 3, 3);
    g.fillRect(8, 57, 2, 3);
    g.fillStyle(BODY, 1);
    g.fillCircle(5, 66, 3.2);
    g.fillCircle(51, 66, 3.2);
    g.fillStyle(0xeb5757, 1);
    g.fillRect(3, 43, 8, 5);

    g.fillStyle(GRAPHITE, 1);
    g.fillRoundedRect(14, 8, 28, 16, 5);
    g.lineStyle(2, MIKU, 0.9);
    g.strokeRoundedRect(14, 8, 28, 16, 5);
    g.fillStyle(MIKU, 1);
    g.fillTriangle(16, 22, 22, 12, 26, 22);
    g.fillTriangle(24, 22, 28, 10, 32, 22);
    g.fillTriangle(30, 22, 34, 12, 40, 22);
    g.fillStyle(MIKU_LIGHT, 0.5);
    g.fillTriangle(26, 20, 28, 12, 30, 20);
    g.fillStyle(GRAPHITE, 1);
    g.fillRoundedRect(6, 18, 10, 8, 2);
    g.fillRoundedRect(40, 18, 10, 8, 2);
    g.fillStyle(MIKU, 1);
    g.fillRect(7, 21, 8, 2);
    g.fillRect(41, 21, 8, 2);
    g.fillStyle(GRAPHITE, 1);
    g.fillRoundedRect(1, 28, 10, 14, 3);
    g.fillRoundedRect(45, 28, 10, 14, 3);
    g.fillStyle(MIKU, 1);
    g.fillCircle(6, 32, 2);
    g.fillCircle(50, 32, 2);
    g.lineStyle(2, GRAPHITE, 1);
    g.lineBetween(5, 40, 14, 48);
    g.fillStyle(0xeb5757, 1);
    g.fillCircle(14, 48, 1.6);

    g.fillStyle(INK, 1);
    g.fillEllipse(23, 44, 6, 8);
    g.fillEllipse(34, 44, 6, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 42.5, 1.5);
    g.fillCircle(35, 42.5, 1.5);
    g.lineStyle(2.2, INK, 1);
    g.beginPath();
    g.arc(28.5, 52, 4.5, Math.PI * 0.15, Math.PI * 0.85);
    g.strokePath();
  }
}

function gPlayer(g) {
  g.fillStyle(0x35405e, 1);
  g.fillRoundedRect(12, 48, 7, 11, 3);
  g.fillRoundedRect(21, 48, 7, 11, 3);
  g.fillStyle(0x4f86f7, 1);
  g.fillRoundedRect(9, 26, 22, 24, 7);
  g.lineStyle(4, 0x4f86f7, 1);
  g.lineBetween(9, 32, 3, 42);
  g.lineBetween(31, 32, 37, 42);
  g.fillStyle(0xffd9b3, 1);
  g.fillCircle(3, 44, 3);
  g.fillCircle(37, 44, 3);
  g.fillCircle(20, 14, 11);
  g.fillStyle(0xe8734a, 1);
  g.fillEllipse(20, 7, 24, 12);
  g.fillRoundedRect(19, 3, 17, 7, 3);
  g.fillStyle(INK, 1);
  g.fillCircle(24, 16, 1.8);
  g.fillCircle(16, 16, 1.8);
  g.lineStyle(2, INK, 1);
  g.beginPath();
  g.arc(20, 19, 3.4, Math.PI * 0.15, Math.PI * 0.85);
  g.strokePath();
}

function gEgg(g) {
  g.fillStyle(0x2b2b33, 0.18);
  g.fillEllipse(14, 32, 22, 5);
  g.fillStyle(0xfffaf0, 1);
  g.fillEllipse(14, 16, 24, 31);
  g.lineStyle(2.5, 0xd9cba8, 1);
  g.strokeEllipse(14, 16, 24, 31);
  g.fillStyle(0x9aa5b1, 1);
  g.fillCircle(10, 12, 2.2);
  g.fillCircle(18, 20, 2.2);
  g.fillCircle(13, 25, 1.8);
}

function gArrow(g) {
  g.fillStyle(0xf8f4ea, 1);
  g.fillRect(4, 14, 34, 20);
  g.fillTriangle(34, 2, 34, 46, 60, 24);
  g.lineStyle(3.5, 0x33333d, 1);
  g.strokeRect(4, 14, 34, 20);
  g.beginPath();
  g.moveTo(34, 2);
  g.lineTo(60, 24);
  g.lineTo(34, 46);
  g.strokePath();
}

function gQuestionBlock(g) {
  g.fillStyle(0xf2c94c, 1);
  g.fillRoundedRect(2, 2, 52, 52, 8);
  g.lineStyle(3.5, 0x33333d, 1);
  g.strokeRoundedRect(2, 2, 52, 52, 8);
  g.fillStyle(0x33333d, 1);
  for (const [x, y] of [[8, 8], [48, 8], [8, 48], [48, 48]]) g.fillCircle(x, y, 3);
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(17, 12, 22, 28, 4);
  g.fillStyle(0x33333d, 1);
  g.fillCircle(23, 20, 3.4);
  g.fillRect(25, 22, 11, 4.5);
  g.fillCircle(31, 34, 3);
}

function gTurtle(g) {
  g.fillStyle(0x62c462, 1);
  g.fillEllipse(32, 20, 50, 28);
  g.lineStyle(2.5, 0x2f7a4f, 1);
  g.strokeEllipse(32, 20, 50, 28);
  g.fillStyle(0x8fd98f, 1);
  g.fillCircle(30, 19, 6);
  g.fillStyle(0x62c462, 1);
  g.fillCircle(57, 24, 8);
  g.fillStyle(INK, 1);
  g.fillCircle(60, 22, 1.6);
  g.lineStyle(3.5, 0x2f7a4f, 1);
  g.lineBetween(14, 30, 14, 39);
  g.lineBetween(30, 32, 30, 41);
  g.lineBetween(46, 30, 46, 39);
}

function gCloud(g) {
  g.fillStyle(0xffffff, 0.92);
  g.fillCircle(22, 24, 13);
  g.fillCircle(40, 18, 16);
  g.fillCircle(58, 24, 12);
  g.fillRect(14, 22, 50, 14);
}

export function generateAllTextures(scene) {
  const ensure = (key, builder, width, height) => {
    if (scene.textures.exists(key)) return key;
    const g = graphics(scene);
    builder(g);
    g.generateTexture(key, width, height);
    g.destroy();
    return key;
  };

  ensure("player", gPlayer, 40, 60);
  ensure("egg", gEgg, 28, 34);
  ensure("arrow", gArrow, 64, 48);
  ensure("question_block", gQuestionBlock, 56, 56);
  ensure("turtle", gTurtle, 70, 44);
  ensure("cloud", gCloud, 72, 40);
}

export function markerTextureKey(difficulty, style) {
  return `marker_${difficulty}_${style || "classic"}`.replace(/[^a-z0-9_]/gi, "");
}

// Texturas de marker sob demanda — a dificuldade define a cor (por isso entra
// na chave). Funciona em qualquer cena (o TextureManager é global ao jogo).
export function ensureMarkerTexture(scene, difficulty, style = "classic") {
  const key = markerTextureKey(difficulty, style);
  if (scene.textures.exists(key)) return key;
  const g = graphics(scene);
  gMarker(g, difficultyColor(difficulty), style);
  g.generateTexture(key, 56, 80);
  g.destroy();
  return key;
}
