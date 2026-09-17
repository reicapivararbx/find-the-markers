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
  if (style === "beaker") {
    markerFeet(g, 0xd0e0e8);
    g.fillStyle(0xd0e0e8, 0.95);
    g.fillRect(18, 18, 20, 10);
    g.fillStyle(0xa8c8d8, 1);
    g.fillTriangle(14, 28, 42, 28, 36, 62);
    g.fillTriangle(14, 28, 42, 28, 20, 62);
    g.fillStyle(color, 0.85);
    g.fillTriangle(18, 42, 38, 42, 34, 60);
    g.fillTriangle(18, 42, 38, 42, 22, 60);
    faceDots(g, 24, 30, 38);
    return true;
  }
  if (style === "circuit") {
    markerFeet(g, 0x3a3a48);
    g.fillStyle(0x2a2a38, 1);
    g.fillRoundedRect(12, 18, 32, 46, 4);
    g.lineStyle(2, 0x56ccf2, 1);
    g.lineBetween(18, 28, 38, 28);
    g.lineBetween(28, 28, 28, 52);
    g.lineBetween(18, 40, 38, 40);
    g.fillStyle(0x62c462, 1);
    g.fillCircle(18, 28, 3);
    g.fillCircle(38, 40, 3);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 9);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "clone") {
    markerFeet(g, color);
    g.fillStyle(color, 0.55);
    g.fillRoundedRect(8, 20, 20, 42, 8);
    g.fillStyle(color, 1);
    g.fillRoundedRect(24, 16, 22, 48, 9);
    faceDots(g, 30, 34, 32);
    g.fillStyle(0x1a1a22, 0.5);
    g.fillCircle(14, 34, 2);
    g.fillCircle(18, 34, 2);
    return true;
  }
  if (style === "laser") {
    markerFeet(g, 0x4a4a58);
    g.fillStyle(0x3a3a48, 1);
    g.fillRect(20, 30, 16, 28);
    g.fillStyle(0xff5d5d, 1);
    g.fillRect(26, 12, 4, 22);
    g.fillCircle(28, 12, 5);
    g.fillStyle(color, 1);
    g.fillCircle(28, 44, 10);
    faceDots(g, 24, 32, 44);
    return true;
  }
  if (style === "microscope") {
    markerFeet(g, 0x5a5a68);
    g.fillStyle(0x4a4a58, 1);
    g.fillRect(22, 48, 12, 16);
    g.fillRect(18, 28, 8, 24);
    g.fillStyle(0x8a8a98, 1);
    g.fillCircle(22, 22, 10);
    g.fillStyle(color, 1);
    g.fillCircle(34, 40, 10);
    faceDots(g, 30, 38, 40);
    return true;
  }
  if (style === "petri") {
    markerFeet(g, 0xd0e0e8);
    g.fillStyle(0xe8f0f4, 1);
    g.fillEllipse(28, 48, 36, 24);
    g.fillStyle(color, 0.7);
    g.fillCircle(22, 46, 5);
    g.fillCircle(32, 50, 4);
    g.fillCircle(28, 42, 3);
    g.fillStyle(color, 1);
    g.fillCircle(28, 32, 10);
    faceDots(g, 24, 32, 32);
    return true;
  }
  if (style === "plasma") {
    markerFeet(g, 0xb37feb);
    g.fillStyle(0x8b5cf6, 0.85);
    g.fillCircle(28, 40, 20);
    g.fillStyle(0xd8b4fe, 0.6);
    g.fillCircle(22, 34, 8);
    g.fillCircle(34, 44, 7);
    g.fillStyle(color, 1);
    g.fillCircle(28, 38, 10);
    faceDots(g, 24, 32, 38);
    return true;
  }
  if (style === "sample") {
    markerFeet(g, 0xd0d8e0);
    g.fillStyle(0xc8d0d8, 1);
    g.fillRoundedRect(14, 24, 28, 40, 4);
    g.fillStyle(color, 0.8);
    g.fillRect(18, 40, 20, 16);
    g.lineStyle(2, 0x8a9aa8, 1);
    g.strokeRoundedRect(14, 24, 28, 40, 4);
    faceDots(g, 24, 32, 34);
    return true;
  }
  if (style === "scope") {
    markerFeet(g, 0x3a3a48);
    g.fillStyle(0x2a2a38, 1);
    g.fillCircle(28, 36, 18);
    g.fillStyle(0x56ccf2, 0.5);
    g.fillCircle(28, 36, 12);
    g.lineStyle(2, 0x62c462, 1);
    g.strokeCircle(28, 36, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 6);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "testtube") {
    markerFeet(g, 0xd0e0e8);
    g.fillStyle(0xd0e0e8, 0.95);
    g.fillRoundedRect(20, 14, 16, 48, 8);
    g.fillStyle(color, 0.8);
    g.fillRoundedRect(22, 36, 12, 22, 6);
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(24, 18, 4, 20);
    faceDots(g, 24, 32, 30);
    return true;
  }
  if (style === "arch") {
    markerFeet(g, 0xc4b8a0);
    g.fillStyle(0xb8a888, 1);
    g.fillRect(10, 28, 12, 36);
    g.fillRect(34, 28, 12, 36);
    g.fillRect(10, 18, 36, 14);
    g.fillStyle(0x1a1810, 0.5);
    g.fillEllipse(28, 44, 18, 22);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 9);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "column") {
    markerFeet(g, 0xc4b8a0);
    g.fillStyle(0xb8a888, 1);
    g.fillRect(18, 16, 20, 48);
    g.fillRect(14, 12, 28, 10);
    g.fillRect(14, 58, 28, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 9);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "glyph") {
    markerFeet(g, 0xd4b888);
    g.fillStyle(0xc4a574, 1);
    g.fillRoundedRect(12, 18, 32, 46, 4);
    g.fillStyle(0x8a6238, 1);
    g.fillRect(20, 28, 4, 16);
    g.fillRect(28, 24, 4, 20);
    g.fillRect(18, 40, 16, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 8);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "idol") {
    markerFeet(g, 0xb8a888);
    g.fillStyle(0xa89870, 1);
    g.fillTriangle(28, 14, 12, 58, 44, 58);
    g.fillStyle(color, 1);
    g.fillCircle(28, 32, 11);
    faceDots(g, 24, 32, 32);
    g.fillStyle(0xf2c94c, 0.8);
    g.fillCircle(28, 18, 5);
    return true;
  }
  if (style === "mosaic") {
    markerFeet(g, 0xd1495b);
    g.fillStyle(0xd1495b, 1);
    g.fillRect(12, 20, 14, 14);
    g.fillStyle(0x56ccf2, 1);
    g.fillRect(28, 20, 14, 14);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(12, 36, 14, 14);
    g.fillStyle(0x62c462, 1);
    g.fillRect(28, 36, 14, 14);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 9);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "obelisk") {
    markerFeet(g, 0xb8a888);
    g.fillStyle(0xa89870, 1);
    g.fillTriangle(28, 10, 16, 28, 40, 28);
    g.fillRect(18, 28, 20, 36);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 9);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "relic") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillEllipse(28, 40, 28, 36);
    g.fillStyle(0xffe08a, 0.7);
    g.fillEllipse(24, 34, 12, 14);
    g.fillStyle(color, 1);
    g.fillCircle(28, 38, 9);
    faceDots(g, 24, 32, 38);
    return true;
  }
  if (style === "sand") {
    markerFeet(g, 0xd4b888);
    g.fillStyle(0xe8d8b0, 1);
    g.fillEllipse(28, 52, 36, 22);
    g.fillStyle(0xd4b888, 1);
    g.fillEllipse(28, 44, 28, 16);
    g.fillStyle(color, 1);
    g.fillCircle(28, 34, 11);
    faceDots(g, 24, 32, 34);
    return true;
  }
  if (style === "scroll") {
    markerFeet(g, 0xe8d8b0);
    g.fillStyle(0xf0e8d0, 1);
    g.fillRoundedRect(14, 20, 28, 44, 6);
    g.fillStyle(0xc4a574, 1);
    g.fillEllipse(14, 42, 8, 40);
    g.fillEllipse(42, 42, 8, 40);
    g.lineStyle(2, 0x8a6238, 0.7);
    g.lineBetween(20, 32, 36, 32);
    g.lineBetween(20, 40, 36, 40);
    g.fillStyle(color, 1);
    g.fillCircle(28, 50, 8);
    faceDots(g, 24, 32, 50);
    return true;
  }
  if (style === "statue") {
    markerFeet(g, 0xa8a090);
    g.fillStyle(0xb8b0a0, 1);
    g.fillRect(18, 28, 20, 36);
    g.fillCircle(28, 20, 12);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 9);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "avalanche") {
    markerFeet(g, 0xd8e8f0);
    g.fillStyle(0xf0f8ff, 1);
    g.fillTriangle(28, 16, 8, 58, 48, 58);
    g.fillStyle(0xc0d0e0, 1);
    g.fillTriangle(20, 36, 10, 58, 32, 58);
    g.fillStyle(color, 1);
    g.fillCircle(28, 34, 10);
    faceDots(g, 24, 32, 34);
    return true;
  }
  if (style === "cliff") {
    markerFeet(g, 0x8a9aa8);
    g.fillStyle(0x7a8a98, 1);
    g.fillRect(10, 20, 36, 44);
    g.fillStyle(0x5a6a78, 1);
    g.fillTriangle(10, 20, 28, 20, 10, 40);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "flag") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0x8a8070, 1);
    g.fillRect(24, 14, 4, 50);
    g.fillStyle(0xd1495b, 1);
    g.fillTriangle(28, 14, 48, 24, 28, 34);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 10);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "frost") {
    markerFeet(g, 0xd0e8ff);
    g.fillStyle(0xe8f4ff, 0.9);
    g.fillCircle(28, 40, 18);
    g.lineStyle(2, 0xa8c8e8, 1);
    g.lineBetween(28, 22, 28, 58);
    g.lineBetween(14, 40, 42, 40);
    g.lineBetween(18, 28, 38, 52);
    g.lineBetween(38, 28, 18, 52);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 9);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "glacier") {
    markerFeet(g, 0xd0e8ff);
    g.fillStyle(0xc0d8f0, 1);
    g.fillTriangle(28, 12, 8, 56, 48, 56);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(28, 20, 16, 48, 28, 48);
    g.fillStyle(color, 1);
    g.fillCircle(28, 38, 10);
    faceDots(g, 24, 32, 38);
    return true;
  }
  if (style === "summit") {
    markerFeet(g, 0x8a9aa8);
    g.fillStyle(0x9aaab8, 1);
    g.fillTriangle(28, 10, 6, 58, 50, 58);
    g.fillStyle(0xf0f8ff, 1);
    g.fillTriangle(28, 10, 20, 28, 36, 28);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "wind") {
    markerFeet(g, 0xc0d0e0);
    g.lineStyle(3, 0xa8c0d8, 1);
    g.beginPath();
    g.arc(28, 36, 14, 0.2, 2.5);
    g.strokePath();
    g.beginPath();
    g.arc(28, 36, 8, 0.5, 2.8);
    g.strokePath();
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "yeti") {
    markerFeet(g, 0xf0f8ff);
    g.fillStyle(0xf0f8ff, 1);
    g.fillEllipse(28, 42, 34, 40);
    g.fillCircle(16, 30, 8);
    g.fillCircle(40, 30, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 11);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "zenith") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillStar?.(28, 28, 5, 14, 6) || g.fillCircle(28, 28, 12);
    g.fillStyle(0xffe08a, 1);
    g.fillCircle(28, 28, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 10);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "barcode") {
    markerFeet(g, 0x2a2a38);
    g.fillStyle(0x1a1a22, 1);
    g.fillRect(12, 20, 32, 40);
    g.fillStyle(0xffffff, 1);
    for (let i = 0; i < 6; i += 1) {
      g.fillRect(16 + i * 4, 26, i % 2 === 0 ? 2 : 3, 28);
    }
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 8);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "cipher") {
    markerFeet(g, 0x3a3a48);
    g.fillStyle(0x2a2a38, 1);
    g.fillRoundedRect(12, 18, 32, 46, 4);
    g.fillStyle(0x62c462, 1);
    g.fillText?.("", 0, 0);
    g.fillRect(18, 28, 6, 6);
    g.fillRect(28, 28, 6, 6);
    g.fillRect(18, 40, 6, 6);
    g.fillRect(28, 40, 6, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 8);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "goldbar") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillRoundedRect(10, 32, 36, 24, 4);
    g.fillStyle(0xffe08a, 1);
    g.fillRect(14, 36, 28, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 28, 10);
    faceDots(g, 24, 32, 28);
    return true;
  }
  if (style === "keycard") {
    markerFeet(g, 0x56ccf2);
    g.fillStyle(0x4ab8e0, 1);
    g.fillRoundedRect(12, 24, 32, 36, 4);
    g.fillStyle(0x2a2a38, 1);
    g.fillRect(16, 30, 16, 12);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(34, 32, 6, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 8);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "ledger") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0xf0e8d0, 1);
    g.fillRect(14, 18, 28, 44);
    g.fillStyle(0x8a6238, 1);
    g.fillRect(14, 18, 6, 44);
    g.lineStyle(1, 0xc4a574, 1);
    g.lineBetween(24, 28, 38, 28);
    g.lineBetween(24, 36, 38, 36);
    g.lineBetween(24, 44, 38, 44);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 8);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "lockbox") {
    markerFeet(g, 0x4a4a58);
    g.fillStyle(0x3a3a48, 1);
    g.fillRoundedRect(12, 26, 32, 36, 4);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 42, 7);
    g.fillStyle(0x2a2a38, 1);
    g.fillCircle(28, 42, 3);
    g.fillStyle(color, 1);
    g.fillCircle(28, 24, 9);
    faceDots(g, 24, 32, 24);
    return true;
  }
  if (style === "safe") {
    markerFeet(g, 0x4a4a58);
    g.fillStyle(0x3a3a48, 1);
    g.fillRoundedRect(10, 18, 36, 46, 4);
    g.fillStyle(0x5a5a68, 1);
    g.fillCircle(28, 40, 12);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(36, 40, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 28, 8);
    faceDots(g, 24, 32, 28);
    return true;
  }
  if (style === "sealstamp") {
    markerFeet(g, 0xd1495b);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 36, 18);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 36, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 7);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "vaultdoor") {
    markerFeet(g, 0x5a5a68);
    g.fillStyle(0x4a4a58, 1);
    g.fillCircle(28, 38, 20);
    g.fillStyle(0x3a3a48, 1);
    g.fillCircle(28, 38, 10);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(36, 38, 4);
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      g.fillStyle(0x8a8a98, 0.8);
      g.fillCircle(28 + Math.cos(a) * 15, 38 + Math.sin(a) * 15, 3);
    }
    g.fillStyle(color, 1);
    g.fillCircle(28, 38, 6);
    faceDots(g, 24, 32, 56);
    return true;
  }
  if (style === "wire") {
    markerFeet(g, 0x62c462);
    g.lineStyle(3, 0x62c462, 1);
    g.lineBetween(14, 24, 42, 24);
    g.lineBetween(14, 24, 14, 50);
    g.lineBetween(42, 24, 42, 50);
    g.lineBetween(14, 36, 42, 36);
    g.fillStyle(color, 1);
    g.fillCircle(28, 44, 10);
    faceDots(g, 24, 32, 44);
    return true;
  }
  if (style === "banner") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0x8a8070, 1);
    g.fillRect(24, 12, 4, 52);
    g.fillStyle(0x8b5cf6, 1);
    g.fillRect(28, 14, 20, 28);
    g.fillTriangle(28, 42, 48, 42, 38, 52);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 9);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "barricade") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0x8a6238, 1);
    g.fillRect(10, 36, 36, 12);
    g.fillRect(14, 24, 8, 28);
    g.fillRect(34, 24, 8, 28);
    g.fillStyle(color, 1);
    g.fillCircle(28, 30, 10);
    faceDots(g, 24, 32, 30);
    return true;
  }
  if (style === "drawbridge") {
    markerFeet(g, 0x8a6238);
    g.fillStyle(0xa9805a, 1);
    g.fillRoundedRect(10, 40, 36, 16, 2);
    g.lineStyle(2, 0x6d4a2a, 1);
    g.lineBetween(18, 40, 18, 56);
    g.lineBetween(28, 40, 28, 56);
    g.lineBetween(38, 40, 38, 56);
    g.fillStyle(color, 1);
    g.fillCircle(28, 28, 11);
    faceDots(g, 24, 32, 28);
    return true;
  }
  if (style === "guard") {
    markerFeet(g, 0x5a4a78);
    g.fillStyle(0x6a5a88, 1);
    g.fillRect(16, 28, 24, 32);
    g.fillStyle(0x8a8a98, 1);
    g.fillTriangle(28, 12, 14, 30, 42, 30);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "herald") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0x8b5cf6, 1);
    g.fillTriangle(28, 14, 12, 48, 44, 48);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 32, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 9);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "moat") {
    markerFeet(g, 0x3a5a8a);
    g.fillStyle(0x3a5a8a, 0.9);
    g.fillEllipse(28, 48, 36, 24);
    g.fillStyle(0x5a8ab0, 0.6);
    g.fillEllipse(28, 44, 24, 14);
    g.fillStyle(color, 1);
    g.fillCircle(28, 34, 11);
    faceDots(g, 24, 32, 34);
    return true;
  }
  if (style === "portcullis") {
    markerFeet(g, 0x5a5a68);
    g.fillStyle(0x4a4a58, 1);
    g.fillRect(12, 16, 32, 48);
    g.lineStyle(3, 0x8a8a98, 1);
    for (let i = 0; i < 4; i += 1) g.lineBetween(16 + i * 8, 20, 16 + i * 8, 60);
    g.lineBetween(12, 32, 44, 32);
    g.lineBetween(12, 44, 44, 44);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 9);
    faceDots(g, 24, 32, 36);
    return true;
  }
  if (style === "rampart") {
    markerFeet(g, 0x7a6a98);
    g.fillStyle(0x6a5a88, 1);
    g.fillRect(10, 28, 36, 36);
    g.fillRect(10, 16, 10, 16);
    g.fillRect(23, 16, 10, 16);
    g.fillRect(36, 16, 10, 16);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 10);
    faceDots(g, 24, 32, 42);
    return true;
  }
  if (style === "shield") {
    markerFeet(g, 0x8b5cf6);
    g.fillStyle(0x7c3aed, 1);
    g.fillEllipse(28, 36, 28, 36);
    g.fillStyle(0xf2c94c, 1);
    g.fillTriangle(28, 22, 20, 36, 36, 36);
    g.fillStyle(color, 1);
    g.fillCircle(28, 42, 8);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "watchtower") {
    markerFeet(g, 0x6a5a88);
    g.fillStyle(0x5a4a78, 1);
    g.fillRect(18, 24, 20, 40);
    g.fillRect(12, 14, 32, 14);
    g.fillStyle(0x8b5cf6, 0.7);
    g.fillRect(22, 32, 12, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 9);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "crown") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(12, 28, 32, 14);
    g.fillTriangle(12, 28, 18, 14, 24, 28);
    g.fillTriangle(24, 28, 28, 10, 32, 28);
    g.fillTriangle(32, 28, 38, 14, 44, 28);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 18, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 11);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "throne") {
    markerFeet(g, 0x8b5cf6);
    g.fillStyle(0x7c3aed, 1);
    g.fillRect(14, 36, 28, 24);
    g.fillRect(16, 16, 24, 24);
    g.fillTriangle(28, 8, 16, 18, 40, 18);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 10, 5);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "scepter") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(26, 20, 4, 40);
    g.fillCircle(28, 16, 8);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 16, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 10);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "knight") {
    markerFeet(g, 0x8a8a98);
    g.fillStyle(0x7a7a88, 1);
    g.fillRect(16, 28, 24, 32);
    g.fillStyle(0x9a9aa8, 1);
    g.fillRect(18, 14, 20, 16);
    g.fillStyle(0x5a5a68, 1);
    g.fillRect(22, 18, 12, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 10);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "oracle") {
    markerFeet(g, 0xb37feb);
    g.fillStyle(0x8b5cf6, 0.85);
    g.fillCircle(28, 36, 18);
    g.fillStyle(0xf2c94c, 0.7);
    g.fillCircle(28, 36, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 9);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "spire") {
    markerFeet(g, 0x6a5a88);
    g.fillStyle(0x5a4a78, 1);
    g.fillTriangle(28, 8, 16, 58, 40, 58);
    g.fillStyle(0x8b5cf6, 0.6);
    g.fillTriangle(28, 8, 22, 30, 34, 30);
    g.fillStyle(color, 1);
    g.fillCircle(28, 40, 9);
    faceDots(g, 24, 32, 40);
    return true;
  }
  if (style === "legacy") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillEllipse(28, 40, 30, 36);
    g.fillStyle(0x8b5cf6, 1);
    g.fillCircle(28, 36, 10);
    g.fillStyle(color, 1);
    g.fillCircle(28, 36, 7);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "finale") {
    markerFeet(g, 0xd1495b);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 36, 20);
    g.fillStyle(0xf2c94c, 1);
    g.fillStar?.(28, 36, 5, 12, 5) || g.fillCircle(28, 36, 8);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 9);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "champion" || style === "menu_champion") {
    markerFeet(g, 0x2a2418);
    g.fillStyle(0xffffff, 0.95);
    g.fillRoundedRect(14, 22, 28, 36, 10);
    g.fillStyle(0xf2c94c, 1);
    g.fillRoundedRect(16, 24, 24, 18, 6);
    g.fillTriangle(14, 24, 18, 10, 24, 24);
    g.fillTriangle(24, 24, 28, 6, 32, 24);
    g.fillTriangle(32, 24, 38, 10, 42, 24);
    g.fillStyle(0x1a1410, 1);
    g.fillCircle(22, 34, 2.2);
    g.fillCircle(34, 34, 2.2);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 14, 3.5);
    g.fillStyle(0xf6efdd, 0.9);
    g.fillCircle(40, 20, 3);
    g.fillCircle(16, 28, 2.5);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 10);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "banner_royal") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0x8a8070, 1);
    g.fillRect(24, 12, 4, 52);
    g.fillStyle(0xd1495b, 1);
    g.fillRect(28, 14, 22, 30);
    g.fillTriangle(28, 44, 50, 44, 39, 54);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(39, 28, 5);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 9);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "orchid") {
    markerFeet(g, 0x7cae62);
    g.fillStyle(0xf2a0c8, 1);
    g.fillEllipse(28, 34, 28, 22);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(28, 34, 12, 10);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 34, 5);
    g.fillStyle(0x5d8f46, 1);
    g.fillRect(26, 44, 4, 18);
    g.fillStyle(color, 1);
    g.fillCircle(28, 58, 8);
    faceDots(g, 24, 32, 58);
    return true;
  }
  if (style === "beacon") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0x6a7080, 1);
    g.fillRect(20, 28, 16, 36);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 18, 12);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(28, 18, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 8);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "steam") {
    markerFeet(g, 0x6a6058);
    g.fillStyle(0x8a8070, 1);
    g.fillRoundedRect(14, 30, 28, 32, 4);
    g.fillStyle(0xd0d0d8, 0.85);
    g.fillCircle(18, 18, 8);
    g.fillCircle(28, 12, 10);
    g.fillCircle(40, 18, 7);
    g.fillStyle(color, 1);
    g.fillCircle(28, 48, 9);
    faceDots(g, 24, 32, 48);
    return true;
  }
  if (style === "prism") {
    markerFeet(g, 0xb48cff);
    g.fillStyle(0x9b6dff, 1);
    g.fillTriangle(28, 8, 8, 48, 48, 48);
    g.fillStyle(0xe0c8ff, 0.7);
    g.fillTriangle(28, 14, 16, 42, 28, 42);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 8);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "packet") {
    markerFeet(g, 0x3a8a9a);
    g.fillStyle(0x2a3a48, 1);
    g.fillRoundedRect(10, 22, 36, 28, 3);
    g.fillStyle(0x39c5bb, 1);
    for (let i = 0; i < 4; i += 1) g.fillRect(14 + i * 8, 28, 5, 4);
    g.fillStyle(0x62c462, 1);
    g.fillCircle(40, 42, 3);
    g.fillStyle(color, 1);
    g.fillCircle(28, 56, 8);
    faceDots(g, 24, 32, 56);
    return true;
  }
  if (style === "mummy") {
    markerFeet(g, 0xe8d8b0);
    g.fillStyle(0xe8d8b0, 1);
    g.fillRoundedRect(14, 18, 28, 46, 6);
    g.lineStyle(2, 0xc4a574, 1);
    for (let y = 24; y < 60; y += 8) g.lineBetween(16, y, 40, y);
    g.fillStyle(INK, 1);
    g.fillEllipse(22, 34, 5, 6);
    g.fillEllipse(34, 34, 5, 6);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 7);
    return true;
  }
  if (style === "starchart") {
    markerFeet(g, 0x3a4a6a);
    g.fillStyle(0x1a2a48, 1);
    g.fillCircle(28, 36, 22);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(20, 28, 2.5);
    g.fillCircle(34, 24, 2);
    g.fillCircle(30, 40, 3);
    g.fillCircle(18, 42, 2);
    g.lineStyle(1.5, 0x8ab4ff, 0.8);
    g.lineBetween(20, 28, 34, 24);
    g.lineBetween(34, 24, 30, 40);
    g.fillStyle(color, 1);
    g.fillCircle(28, 56, 8);
    faceDots(g, 24, 32, 56);
    return true;
  }
  if (style === "combination") {
    markerFeet(g, 0x6a7080);
    g.fillStyle(0x5a6070, 1);
    g.fillCircle(28, 36, 20);
    g.fillStyle(0x3a3a48, 1);
    g.fillCircle(28, 36, 12);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 24, 3);
    g.fillCircle(40, 36, 3);
    g.fillCircle(28, 48, 3);
    g.fillStyle(color, 1);
    g.fillCircle(28, 56, 7);
    faceDots(g, 24, 32, 56);
    return true;
  }
  if (style === "blade") {
    markerFeet(g, 0x8a8070);
    g.fillStyle(0xd0d4d8, 1);
    g.fillTriangle(28, 8, 22, 48, 34, 48);
    g.fillStyle(0x6a5a48, 1);
    g.fillRect(24, 48, 8, 14);
    g.fillStyle(0xf2c94c, 1);
    g.fillCircle(28, 50, 3);
    g.fillStyle(color, 1);
    g.fillCircle(28, 58, 7);
    faceDots(g, 24, 32, 58);
    return true;
  }
  if (style === "hiddencrown") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillRect(12, 28, 32, 14);
    g.fillTriangle(12, 28, 18, 14, 24, 28);
    g.fillTriangle(24, 28, 28, 10, 32, 28);
    g.fillTriangle(32, 28, 38, 14, 44, 28);
    g.fillStyle(0xd1495b, 1);
    g.fillCircle(28, 18, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 52, 9);
    faceDots(g, 24, 32, 52);
    return true;
  }
  if (style === "yellowroom") {
    markerFeet(g, 0xf2c94c);
    g.fillStyle(0xf2c94c, 1);
    g.fillRoundedRect(10, 16, 36, 48, 4);
    g.fillStyle(0xe0b830, 1);
    g.fillRect(10, 28, 36, 4);
    g.fillRect(10, 44, 36, 4);
    g.fillStyle(0x8a8070, 1);
    g.fillRect(24, 40, 8, 24);
    g.fillStyle(color, 1);
    g.fillCircle(28, 56, 7);
    faceDots(g, 24, 32, 30);
    return true;
  }
  if (style === "debug") {
    markerFeet(g, 0x62c462);
    g.fillStyle(0x1a1a22, 1);
    g.fillRoundedRect(8, 18, 40, 40, 4);
    g.fillStyle(0x62c462, 1);
    g.fillText?.("{}", 18, 42) || g.fillRect(16, 30, 8, 16);
    g.fillRect(28, 30, 8, 16);
    g.fillStyle(0x62c462, 0.5);
    g.fillRect(12, 22, 32, 4);
    g.fillStyle(color, 1);
    g.fillCircle(28, 58, 8);
    faceDots(g, 24, 32, 58);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Markers conceituais (desenhos à mão) — cada silhueta é reconhecível sozinha.
// Canvas padrão 56x80 (pés em y≈76); tamanhos custom quando a def pedir.
// ---------------------------------------------------------------------------
const GRASS_LIGHT = 0x8fba6a;
const GRASS_MID = 0x6fae5a;
const GRASS_DARK = 0x3d6b2e;
const BONE = 0xe8e4d8;
const GOLD = 0xf2c94c;
const GOLD_DARK = 0xb8860b;
const PURPLE = 0x8b5cf6;
const PURPLE_DARK = 0x5a4a78;

function handFeet(g, ox = 0, baseY = 76) {
  g.lineStyle(4, INK, 1);
  g.lineBetween(22 + ox, baseY - 8, 20 + ox, baseY - 1);
  g.lineBetween(34 + ox, baseY - 8, 36 + ox, baseY - 1);
  g.fillStyle(INK, 1);
  g.fillEllipse(18 + ox, baseY, 9, 4);
  g.fillEllipse(38 + ox, baseY, 9, 4);
}

function handBody(g, fill, x = 12, y = 22, w = 32, h = 46) {
  g.fillStyle(fill, 1);
  g.fillRoundedRect(x, y, w, h, 8);
  g.lineStyle(3, INK, 0.85);
  g.strokeRoundedRect(x, y, w, h, 8);
}

function handFace(g, mood = "calm", cx = 28, ey = 44) {
  g.fillStyle(INK, 1);
  if (mood === "angry") {
    g.fillEllipse(cx - 6, ey, 6, 7);
    g.fillEllipse(cx + 6, ey, 6, 7);
    g.lineStyle(3, INK, 1);
    g.lineBetween(cx - 11, ey - 7, cx - 2, ey - 3);
    g.lineBetween(cx + 11, ey - 7, cx + 2, ey - 3);
    g.beginPath();
    g.arc(cx, ey + 10, 4.5, Math.PI * 1.1, Math.PI * 1.9);
    g.strokePath();
  } else if (mood === "greedy") {
    g.fillEllipse(cx - 6, ey, 5, 6);
    g.fillEllipse(cx + 6, ey, 5, 6);
    g.lineStyle(2.5, INK, 1);
    g.beginPath();
    g.arc(cx, ey + 8, 5, Math.PI * 0.15, Math.PI * 0.85);
    g.strokePath();
  } else {
    g.fillEllipse(cx - 5, ey, 6, 8);
    g.fillEllipse(cx + 5, ey, 6, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 3.8, ey - 1.4, 1.5);
    g.fillCircle(cx + 6.2, ey - 1.4, 1.5);
    g.fillStyle(INK, 1);
    g.lineStyle(2.5, INK, 1);
    g.beginPath();
    g.arc(cx, ey + 8, 4.5, Math.PI * 0.18, Math.PI * 0.82);
    g.strokePath();
  }
}

function gHandDrawnSilhouette(g, color, style) {
  switch (style) {
    // Marker lilás calmo — quase um clássico, com faixa circular na tampa
    case "lilac": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x9b6dff, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, 0xffffff, 0.8);
      g.strokeCircle(28, 19, 5);
      markerArms(g, 0x9b6dff);
      handFace(g, "calm");
      return true;
    }
    // Laranja manchado — textura porosa própria (mineral/esporo)
    case "spotted": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0xe8873a, 1);
      g.fillRoundedRect(14, 10, 28, 20, 5);
      g.fillStyle(0xf8c890, 1);
      [[19, 15, 3.4], [27, 12, 2.6], [35, 16, 3.8], [23, 22, 2.8], [33, 23, 3], [39, 12, 2.4]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 20, 5);
      markerArms(g, 0xe8873a);
      handFace(g, "calm");
      return true;
    }
    // Musgo/overgrown — vegetação desce pelo corpo, bordas irregulares
    case "overgrown": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(GRASS_DARK, 1);
      g.fillTriangle(28, 4, 10, 26, 46, 26);
      g.fillStyle(GRASS_MID, 1);
      g.fillEllipse(17, 20, 18, 14);
      g.fillEllipse(39, 18, 16, 12);
      g.fillStyle(GRASS_LIGHT, 0.85);
      g.fillCircle(22, 14, 6);
      g.fillCircle(35, 12, 5);
      g.fillStyle(GRASS_MID, 1);
      g.fillTriangle(16, 26, 12, 52, 20, 30);
      g.fillTriangle(40, 26, 44, 50, 36, 30);
      g.fillStyle(0xd1495b, 1);
      g.fillCircle(14, 56, 2.6);
      g.fillCircle(42, 62, 2.2);
      g.lineStyle(2.5, INK, 0.8);
      g.strokeRoundedRect(12, 22, 32, 46, 8);
      handFace(g, "calm", 28, 46);
      return true;
    }
    // Esqueleto — crânio, costelas, ossos soltos
    case "skeleton": {
      handFeet(g);
      g.fillStyle(PURPLE, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(BONE, 1);
      g.fillRoundedRect(15, 24, 26, 42, 6);
      g.fillEllipse(28, 18, 26, 22);
      g.lineStyle(2.5, INK, 0.9);
      g.strokeRoundedRect(15, 24, 26, 42, 6);
      g.strokeEllipse(28, 18, 26, 22);
      g.fillStyle(0x1a1a22, 1);
      g.fillEllipse(21, 17, 6, 8);
      g.fillEllipse(35, 17, 6, 8);
      g.fillRect(24, 25, 8, 6);
      g.lineStyle(2.5, INK, 0.9);
      for (let i = 0; i < 4; i += 1) g.lineBetween(18, 34 + i * 8, 38, 34 + i * 8);
      g.lineBetween(28, 32, 28, 64);
      return true;
    }
    // Rei — coroa grande, manto, cetro
    case "king": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0xd1495b, 1);
      g.fillTriangle(12, 24, 12, 66, 20, 66);
      g.fillTriangle(44, 24, 44, 66, 36, 66);
      g.lineStyle(2, INK, 0.7);
      g.strokeTriangle(12, 24, 12, 66, 20, 66);
      g.strokeTriangle(44, 24, 44, 66, 36, 66);
      g.fillStyle(GOLD, 1);
      g.fillRoundedRect(12, 8, 32, 12, 3);
      g.fillTriangle(12, 8, 16, -2, 21, 8);
      g.fillTriangle(21, 8, 28, -4, 35, 8);
      g.fillTriangle(35, 8, 40, -2, 44, 8);
      g.fillStyle(0xd1495b, 1);
      g.fillCircle(28, 4, 3.4);
      g.fillStyle(GOLD_DARK, 1);
      g.fillCircle(16, 12, 2);
      g.fillCircle(40, 12, 2);
      g.lineStyle(3, GOLD_DARK, 1);
      g.lineBetween(50, 30, 50, 64);
      g.fillStyle(GOLD, 1);
      g.fillCircle(50, 26, 6);
      handFace(g, "calm", 28, 40);
      return true;
    }
    // Tentáculos — silhueta assimétrica, alienígena
    case "tentacle": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0xc0407a, 1);
      g.fillRoundedRect(14, 8, 30, 22, 8);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 8, 30, 22, 8);
      g.lineStyle(6, 0x8a3a6a, 1);
      g.beginPath();
      g.moveTo(18, 12);
      g.arc(14, 2, 12, Math.PI * 0.4, Math.PI * 1.25);
      g.strokePath();
      g.beginPath();
      g.moveTo(38, 10);
      g.arc(42, 0, 11, Math.PI * 1.7, Math.PI * 0.55);
      g.strokePath();
      g.lineStyle(4, 0x8a3a6a, 0.9);
      g.beginPath();
      g.moveTo(28, 8);
      g.arc(28, -2, 10, Math.PI * 1.15, Math.PI * 1.85);
      g.strokePath();
      g.fillStyle(0xf2c94c, 1);
      g.fillCircle(12, 8, 2);
      g.fillCircle(45, 4, 2.4);
      handFace(g, "calm", 28, 42);
      return true;
    }
    // Relógio — mostrador incorporado, capuz verde-escuro
    case "clock": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x2a5a4a, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(0xf6f2e8, 1);
      g.fillCircle(28, 44, 13);
      g.lineStyle(3, GOLD_DARK, 1);
      g.strokeCircle(28, 44, 13);
      g.fillStyle(INK, 1);
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        g.fillCircle(28 + Math.cos(a) * 10, 44 + Math.sin(a) * 10, 1);
      }
      g.fillCircle(28, 44, 2);
      g.lineStyle(2.5, 0x8a6238, 0.9);
      g.lineBetween(40, 26, 44, 40);
      g.lineBetween(14, 30, 10, 44);
      return true;
    }
    // Máquina conectada — dois corpos + cabo (canvas 96x84)
    case "machine_link": {
      const baseY = 78;
      g.lineStyle(4, INK, 1);
      g.lineBetween(22, baseY - 8, 20, baseY - 1);
      g.lineBetween(30, baseY - 8, 32, baseY - 1);
      g.lineBetween(64, baseY - 8, 62, baseY - 1);
      g.lineBetween(72, baseY - 8, 74, baseY - 1);
      g.fillStyle(INK, 1);
      g.fillEllipse(21, baseY, 8, 4);
      g.fillEllipse(31, baseY, 8, 4);
      g.fillEllipse(63, baseY, 8, 4);
      g.fillEllipse(73, baseY, 8, 4);
      // corpo 1: recipiente amarelado
      g.fillStyle(0xd4b45a, 1);
      g.fillRoundedRect(14, 30, 26, 42, 6);
      g.lineStyle(3, INK, 0.85);
      g.strokeRoundedRect(14, 30, 26, 42, 6);
      g.fillStyle(0xf2df9a, 1);
      g.fillRoundedRect(18, 34, 18, 12, 3);
      g.fillStyle(INK, 1);
      g.fillEllipse(22, 56, 5, 6);
      g.fillEllipse(32, 56, 5, 6);
      g.lineStyle(2.5, INK, 1);
      g.lineBetween(22, 64, 32, 64);
      // cabo
      g.lineStyle(4, 0x3a3a48, 1);
      g.beginPath();
      g.moveTo(40, 52);
      g.lineTo(48, 58);
      g.lineTo(54, 50);
      g.strokePath();
      g.fillStyle(0x62c462, 1);
      g.fillCircle(54, 50, 3.4);
      // corpo 2: estrutura verde tech com estrela
      g.fillStyle(0x3a8a5a, 1);
      g.fillRoundedRect(56, 26, 26, 46, 6);
      g.lineStyle(3, INK, 0.85);
      g.strokeRoundedRect(56, 26, 26, 46, 6);
      g.fillStyle(0xffffff, 0.9);
      g.fillEllipse(63, 40, 8, 10);
      g.fillEllipse(75, 40, 8, 10);
      g.fillStyle(INK, 1);
      g.fillEllipse(63, 40, 4, 6);
      g.fillEllipse(75, 40, 4, 6);
      g.fillStyle(0xff5d5d, 1);
      g.fillStar ? g.fillStar(69, 60, 5, 8, 3.4) : g.fillCircle(69, 60, 6);
      g.fillStyle(0x56ccf2, 1);
      g.fillCircle(69, 74, 3);
      return true;
    }
    // Nervoso azul — olhos inclinados, boca aberta, braços erguidos
    case "grumpy":
    case "grumpy_calm": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x3a7ac4, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(4, INK, 1);
      if (style === "grumpy") {
        g.lineBetween(12, 46, 4, 36);
        g.lineBetween(44, 46, 52, 36);
        g.fillStyle(INK, 1);
        g.fillCircle(3, 34, 3.4);
        g.fillCircle(53, 34, 3.4);
      } else {
        g.lineBetween(12, 48, 4, 56);
        g.lineBetween(44, 48, 52, 56);
        g.fillStyle(INK, 1);
        g.fillCircle(3, 58, 3.4);
        g.fillCircle(53, 58, 3.4);
      }
      if (style === "grumpy") {
        g.fillStyle(INK, 1);
        g.fillEllipse(22, 42, 6, 7);
        g.fillEllipse(34, 42, 6, 7);
        g.lineStyle(3, INK, 1);
        g.lineBetween(16, 35, 25, 39);
        g.lineBetween(40, 35, 31, 39);
        g.fillStyle(0x1a1a22, 1);
        g.fillEllipse(28, 54, 10, 8);
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(24, 51, 27, 51, 25.5, 55);
        g.fillTriangle(29, 51, 32, 51, 30.5, 55);
      } else {
        handFace(g, "calm");
      }
      return true;
    }
    // Dentuço roxo — sorriso GIGANTE faz parte da silhueta
    case "toothy": {
      handFeet(g);
      g.fillStyle(0x2a1a3a, 1);
      g.fillRoundedRect(12, 20, 32, 48, 8);
      g.fillStyle(PURPLE, 1);
      g.fillRoundedRect(14, 10, 28, 16, 5);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(15, 38, 26, 16, 5);
      g.lineStyle(2, 0x1a1a22, 0.7);
      g.lineBetween(21, 38, 21, 54);
      g.lineBetween(28, 38, 28, 54);
      g.lineBetween(35, 38, 35, 54);
      g.fillStyle(INK, 1);
      g.fillCircle(21, 30, 3.2);
      g.fillCircle(35, 30, 3.2);
      return true;
    }
    // Cartola — mágico/apresentador
    case "magician": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0xe8873a, 1);
      g.fillRect(12, 22, 32, 10);
      g.fillStyle(0x23252d, 1);
      g.fillRect(8, 8, 40, 5);
      g.fillRect(16, -6, 24, 15);
      g.fillStyle(0xd1495b, 1);
      g.fillRect(16, 4, 24, 4);
      markerArms(g, 0x23252d);
      handFace(g, "calm");
      g.fillStyle(0xffffff, 1);
      g.fillCircle(24, 42.6, 1.6);
      g.fillCircle(34.4, 42.6, 1.6);
      return true;
    }
    // Construtor — martelo grande, trabalhador
    case "hammer": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0xe86a7a, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(0x8a6238, 1);
      g.fillRect(42, 20, 5, 34);
      g.fillStyle(0x6a7080, 1);
      g.fillTriangle(38, 18, 60, 24, 44, 32);
      g.lineStyle(2, INK, 0.7);
      g.strokeTriangle(38, 18, 60, 24, 44, 32);
      g.lineStyle(4, INK, 1);
      g.lineBetween(44, 50, 48, 58);
      g.fillStyle(0xe86a7a, 1);
      g.fillCircle(49, 60, 3.4);
      handFace(g, "calm");
      return true;
    }
    // Caótico verde — símbolos girando ao redor
    case "chaos": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x62c462, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(0xff5d5d, 1);
      g.fillEllipse(23, 43, 5, 6);
      g.fillEllipse(33, 43, 5, 6);
      g.lineStyle(2.5, INK, 1);
      g.beginPath();
      g.arc(28, 55, 5, Math.PI * 1.1, Math.PI * 1.9);
      g.strokePath();
      g.lineStyle(3, 0xff5d5d, 1);
      g.lineBetween(14, 36, 24, 40);
      g.lineBetween(42, 36, 32, 40);
      g.fillStyle(0xff5d5d, 1);
      g.fillCircle(4, 20, 3);
      g.fillStyle(0xf2c94c, 1);
      g.fillTriangle(50, 26, 56, 32, 47, 34);
      g.fillStyle(0x56ccf2, 1);
      g.fillCircle(6, 58, 3.4);
      g.fillStyle(0x62c462, 1);
      g.fillRect(48, 52, 6, 6);
      return true;
    }
    // Futebol — bola no pé, faixa de camisa
    case "soccer": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x9ac83a, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(0x9ac83a, 1);
      g.fillRect(12, 40, 32, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(44, 66, 8);
      g.lineStyle(2, INK, 0.85);
      g.strokeCircle(44, 66, 8);
      g.fillStyle(INK, 1);
      g.fillCircle(44, 66, 3);
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2;
        g.fillCircle(44 + Math.cos(a) * 5.5, 66 + Math.sin(a) * 5.5, 1.6);
      }
      handFace(g, "calm");
      return true;
    }
    // Baseball — taco no ombro, boné, concentrado
    case "baseball": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x6a7080, 1);
      g.fillRoundedRect(14, 10, 28, 16, 6);
      g.fillStyle(0x8a6238, 1);
      g.fillRect(44, 4, 5, 34);
      g.fillStyle(0xb0654a, 1);
      g.fillTriangle(40, 2, 56, 8, 42, 16);
      g.lineStyle(2, INK, 0.7);
      g.strokeTriangle(40, 2, 56, 8, 42, 16);
      g.fillStyle(INK, 1);
      g.fillEllipse(23, 40, 5, 5);
      g.fillEllipse(33, 40, 5, 5);
      g.lineStyle(2.5, INK, 1);
      g.lineBetween(22, 50, 34, 50);
      g.lineStyle(4, INK, 1);
      g.lineBetween(44, 40, 48, 48);
      return true;
    }
    // Boné vermelho/faixa azul + microfone
    case "cap_mic": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x35405e, 1);
      g.fillRect(12, 22, 32, 8);
      g.fillStyle(0xd1495b, 1);
      g.fillRoundedRect(14, 8, 28, 16, 6);
      g.fillTriangle(40, 10, 56, 16, 40, 20);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 8, 28, 16, 6);
      g.fillStyle(0xd1495b, 1);
      g.fillCircle(28, 44, 6.4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(28, 44, 3);
      g.lineStyle(3, 0x23252d, 1);
      g.lineBetween(46, 30, 50, 48);
      g.fillStyle(0x23252d, 1);
      g.fillCircle(51, 52, 5.4);
      g.fillStyle(0x56ccf2, 1);
      g.fillCircle(51, 52, 2.4);
      handFace(g, "calm");
      return true;
    }
    // Dinheiro — símbolos de Coins do jogo
    case "money": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0x3a8a5a, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(GOLD, 1);
      g.fillCircle(20, 34, 5.4);
      g.fillCircle(36, 32, 5.4);
      g.fillStyle(GOLD_DARK, 1);
      g.fillCircle(20, 34, 2.4);
      g.fillCircle(36, 32, 2.4);
      g.fillStyle(GOLD, 1);
      g.fillCircle(28, 58, 6);
      g.lineStyle(2, GOLD_DARK, 1);
      g.strokeCircle(28, 58, 6);
      g.fillStyle(GOLD_DARK, 1);
      g.fillText ? g.fillText("¢", 25, 62) : g.fillCircle(28, 58, 2.4);
      handFace(g, "greedy");
      return true;
    }
    // Fantasma/bruxa — flutuação, chapéu roxo, barra ondulada
    case "phantom": {
      handFeet(g, 0, 76);
      g.fillStyle(0xe8e0f8, 0.95);
      g.fillRoundedRect(13, 26, 30, 38, 12);
      g.fillTriangle(13, 62, 19, 70, 25, 62);
      g.fillTriangle(21, 64, 28, 72, 34, 64);
      g.fillTriangle(31, 62, 38, 70, 43, 62);
      g.lineStyle(2.5, INK, 0.7);
      g.strokeRoundedRect(13, 26, 30, 38, 12);
      g.fillStyle(PURPLE, 1);
      g.fillTriangle(28, 0, 12, 26, 44, 26);
      g.fillStyle(PURPLE_DARK, 1);
      g.fillRect(14, 22, 28, 5);
      g.lineStyle(2, INK, 0.8);
      g.strokeTriangle(28, 0, 12, 26, 44, 26);
      g.fillStyle(INK, 1);
      g.fillEllipse(22, 40, 5, 7);
      g.fillEllipse(34, 40, 5, 7);
      g.beginPath();
      g.arc(28, 52, 4, Math.PI, Math.PI * 2);
      g.strokePath();
      return true;
    }
    // Sombrio — quase todo preto, olhos vermelhos discretos, garras
    case "shadow_creature": {
      g.fillStyle(0x14141c, 1);
      g.fillRoundedRect(12, 16, 32, 52, 10);
      g.fillTriangle(12, 20, 20, 6, 28, 16);
      g.fillTriangle(28, 16, 36, 6, 44, 20);
      g.lineStyle(4, 0x14141c, 1);
      g.lineBetween(12, 50, 2, 60);
      g.lineBetween(44, 50, 54, 60);
      g.fillStyle(0x14141c, 1);
      g.fillCircle(1, 62, 2.6);
      g.fillCircle(5, 64, 2.6);
      g.fillCircle(55, 62, 2.6);
      g.fillCircle(51, 64, 2.6);
      g.fillStyle(0x14141c, 1);
      g.fillEllipse(20, 70, 8, 4);
      g.fillEllipse(36, 70, 8, 4);
      g.fillStyle(0xff5d5d, 0.95);
      g.fillEllipse(22, 40, 5, 7);
      g.fillEllipse(34, 40, 5, 7);
      g.fillStyle(0x8a1a1a, 0.55);
      g.fillCircle(22, 42, 1.2);
      g.fillCircle(34, 42, 1.2);
      return true;
    }
    // Boca/predador — boca central com dentes e tentáculos
    case "maw": {
      handFeet(g);
      g.fillStyle(0xc04040, 1);
      g.fillRoundedRect(12, 12, 32, 56, 12);
      g.lineStyle(3, INK, 0.85);
      g.strokeRoundedRect(12, 12, 32, 56, 12);
      g.fillStyle(0x2a1010, 1);
      g.fillEllipse(28, 42, 26, 22);
      g.fillStyle(0xffffff, 1);
      for (let i = 0; i < 5; i += 1) {
        g.fillTriangle(17 + i * 5.5, 34, 21 + i * 5.5, 34, 19 + i * 5.5, 40);
        g.fillTriangle(17 + i * 5.5, 52, 21 + i * 5.5, 52, 19 + i * 5.5, 46);
      }
      g.lineStyle(5, 0x8a2a4a, 1);
      g.beginPath();
      g.moveTo(14, 18);
      g.arc(8, 12, 10, Math.PI * 0.35, Math.PI * 1.2);
      g.strokePath();
      g.beginPath();
      g.moveTo(42, 16);
      g.arc(48, 10, 10, Math.PI * 1.75, Math.PI * 0.6);
      g.strokePath();
      g.fillStyle(0xffd9b3, 1);
      g.fillCircle(21, 24, 2.2);
      g.fillCircle(35, 24, 2.2);
      return true;
    }
    // Prédio — fachada alta, janelas, topo escuro (canvas 64x110)
    case "building": {
      const baseY = 106;
      g.lineStyle(4, INK, 1);
      g.lineBetween(24, baseY - 8, 22, baseY - 1);
      g.lineBetween(40, baseY - 8, 42, baseY - 1);
      g.fillStyle(INK, 1);
      g.fillEllipse(21, baseY, 9, 4);
      g.fillEllipse(43, baseY, 9, 4);
      g.fillStyle(0xb0b8c0, 1);
      g.fillRoundedRect(14, 16, 36, 84, 3);
      g.fillStyle(0x23252d, 1);
      g.fillRect(14, 16, 36, 12);
      g.lineStyle(3, INK, 0.85);
      g.strokeRoundedRect(14, 16, 36, 84, 3);
      g.fillStyle(0xffe08a, 1);
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const lit = (row * 3 + col) % 4 !== 1;
          g.fillStyle(lit ? 0xffe08a : 0x35405e, 1);
          g.fillRect(19 + col * 10, 34 + row * 13, 6, 8);
        }
      }
      g.fillStyle(INK, 1);
      g.fillEllipse(26, 74, 4, 6);
      g.fillEllipse(38, 74, 4, 6);
      return true;
    }
    // Pirâmide — corpo triangular com detalhes roxos
    case "pyramid": {
      handFeet(g);
      g.fillStyle(0xd4b45a, 1);
      g.fillTriangle(28, 6, 8, 66, 48, 66);
      g.fillStyle(0xb89a3a, 1);
      g.fillTriangle(28, 6, 20, 66, 36, 66);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeTriangle(28, 6, 8, 66, 48, 66);
      g.fillStyle(PURPLE, 0.9);
      g.fillCircle(28, 22, 3);
      g.fillCircle(28, 38, 3);
      g.fillCircle(28, 54, 3);
      g.fillStyle(0xffffff, 0.55);
      g.fillTriangle(28, 10, 18, 60, 28, 60);
      handFace(g, "calm", 28, 40);
      return true;
    }
    // Dentes laranja — faixa laranja + dentes centrais (predador, não cômico)
    case "fang": {
      handFeet(g);
      g.fillStyle(0xe8873a, 1);
      g.fillRoundedRect(12, 10, 32, 14, 5);
      g.fillStyle(PAPER, 1);
      g.fillRoundedRect(14, 24, 28, 44, 8);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 24, 28, 44, 8);
      g.fillStyle(0x2a1010, 1);
      g.fillRoundedRect(18, 36, 20, 18, 4);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(19, 38, 24, 38, 21.5, 46);
      g.fillTriangle(26, 38, 31, 38, 28.5, 47);
      g.fillTriangle(33, 38, 38, 38, 35.5, 46);
      g.fillTriangle(19, 52, 24, 52, 21.5, 45);
      g.fillTriangle(26, 52, 31, 52, 28.5, 45);
      g.fillTriangle(33, 52, 38, 52, 35.5, 45);
      g.fillStyle(INK, 1);
      g.fillCircle(23, 32, 2.6);
      g.fillCircle(33, 32, 2.6);
      return true;
    }
    // Caixa roxa — corpo quadrado de contêiner com símbolo
    case "crate": {
      handFeet(g);
      g.fillStyle(0xd8d0e8, 1);
      g.fillRoundedRect(10, 20, 36, 48, 4);
      g.fillStyle(PURPLE, 1);
      g.fillRect(10, 20, 36, 14);
      g.fillStyle(PURPLE_DARK, 1);
      g.fillRect(10, 30, 36, 4);
      g.lineStyle(3, INK, 0.85);
      g.strokeRoundedRect(10, 20, 36, 48, 4);
      g.lineStyle(2, INK, 0.4);
      g.lineBetween(16, 40, 16, 62);
      g.lineBetween(28, 40, 28, 62);
      g.lineBetween(40, 40, 40, 62);
      g.fillStyle(PURPLE_DARK, 1);
      g.fillCircle(28, 50, 4);
      g.fillStyle(INK, 1);
      g.fillCircle(26, 49, 1.2);
      g.fillCircle(30, 49, 1.2);
      return true;
    }
    // Torre corrompida — MUITO alta, metade preta metade roxa, topo espinhoso
    case "corrupted_tower": {
      const baseY = 146;
      g.lineStyle(4, INK, 1);
      g.lineBetween(22, baseY - 8, 20, baseY - 1);
      g.lineBetween(38, baseY - 8, 40, baseY - 1);
      g.fillStyle(INK, 1);
      g.fillEllipse(19, baseY, 9, 4);
      g.fillEllipse(41, baseY, 9, 4);
      g.fillStyle(PURPLE, 1);
      g.fillRoundedRect(16, 70, 28, 68, 3);
      g.fillStyle(0x14141c, 1);
      g.fillRoundedRect(16, 24, 28, 48, 3);
      g.lineStyle(3, INK, 0.9);
      g.strokeRoundedRect(16, 24, 28, 114, 3);
      g.fillStyle(0x14141c, 1);
      g.fillTriangle(16, 26, 20, 10, 26, 26);
      g.fillTriangle(26, 26, 32, 2, 38, 24);
      g.fillTriangle(38, 26, 44, 12, 44, 26);
      g.fillStyle(0x62c462, 1);
      g.fillRect(20, 40, 6, 3);
      g.fillRect(30, 52, 8, 3);
      g.fillStyle(0xff5d5d, 1);
      g.fillRect(22, 88, 8, 3);
      g.fillStyle(0x56ccf2, 1);
      g.fillRect(18, 108, 6, 3);
      g.fillStyle(0xff5d5d, 0.95);
      g.fillEllipse(24, 34, 5, 7);
      g.fillEllipse(36, 34, 5, 7);
      return true;
    }
    // Amarelo mecânico — alto, braços com componentes, fios
    case "mech_yellow": {
      const baseY = 108;
      g.lineStyle(4, INK, 1);
      g.lineBetween(24, baseY - 8, 22, baseY - 1);
      g.lineBetween(38, baseY - 8, 40, baseY - 1);
      g.fillStyle(INK, 1);
      g.fillEllipse(21, baseY, 9, 4);
      g.fillEllipse(41, baseY, 9, 4);
      g.fillStyle(0xf2c94c, 1);
      g.fillRoundedRect(16, 26, 28, 74, 6);
      g.fillStyle(0xf8e08a, 1);
      g.fillRoundedRect(18, 12, 24, 18, 6);
      g.lineStyle(3, INK, 0.85);
      g.strokeRoundedRect(16, 26, 28, 74, 6);
      g.strokeRoundedRect(18, 12, 24, 18, 6);
      g.lineStyle(2.5, 0x3a3a48, 1);
      g.lineBetween(20, 40, 40, 40);
      g.lineBetween(20, 52, 40, 52);
      g.fillStyle(0xff5d5d, 1);
      g.fillCircle(24, 46, 2.6);
      g.fillStyle(0x56ccf2, 1);
      g.fillCircle(35, 58, 2.6);
      g.fillStyle(0x6a7080, 1);
      g.fillRoundedRect(2, 40, 12, 20, 3);
      g.fillRoundedRect(46, 40, 12, 20, 3);
      g.lineStyle(3, 0x3a3a48, 1);
      g.lineBetween(8, 40, 16, 32);
      g.lineBetween(52, 40, 44, 32);
      g.fillStyle(INK, 1);
      g.fillEllipse(25, 20, 4, 6);
      g.fillEllipse(35, 20, 4, 6);
      return true;
    }
    // Invisível — só o contorno quase apagado do corpo
    case "invisible": {
      g.lineStyle(2, INK, 0.35);
      g.strokeRoundedRect(14, 18, 28, 46, 8);
      g.strokeRoundedRect(16, 6, 24, 13, 4);
      g.fillStyle(INK, 0.3);
      g.fillCircle(23, 38, 1.8);
      g.fillCircle(33, 38, 1.8);
      g.lineStyle(2, INK, 0.3);
      g.lineBetween(19, 68, 19, 76);
      g.lineBetween(37, 68, 37, 76);
      return true;
    }
    // Lâmina carmesim — marker vermelho com lâmina cartunesca
    case "crimson_blade": {
      handFeet(g);
      handBody(g, PAPER);
      g.fillStyle(0xd1495b, 1);
      g.fillRoundedRect(14, 10, 28, 18, 5);
      g.lineStyle(2.5, INK, 0.85);
      g.strokeRoundedRect(14, 10, 28, 18, 5);
      g.fillStyle(0xd0d4d8, 1);
      g.fillTriangle(50, 8, 44, 44, 54, 44);
      g.lineStyle(2, INK, 0.8);
      g.strokeTriangle(50, 8, 44, 44, 54, 44);
      g.fillStyle(0x6a5a48, 1);
      g.fillRect(45, 44, 9, 12);
      g.fillStyle(0xd1495b, 0.7);
      g.fillCircle(48, 20, 2);
      g.fillCircle(50, 32, 1.6);
      g.lineStyle(4, INK, 1);
      g.lineBetween(44, 50, 50, 56);
      handFace(g, "calm");
      return true;
    }
    default:
      return false;
  }
}

// Itens de quests FIND-N (coletáveis pequenos)
function gQuestItem(g, variant) {
  if (variant === "shard") {
    g.fillStyle(0x2a1a3a, 0.9);
    g.fillTriangle(14, 4, 6, 24, 20, 26);
    g.fillTriangle(14, 4, 20, 24, 26, 18);
    g.fillStyle(PURPLE, 0.9);
    g.fillTriangle(13, 8, 9, 22, 17, 23);
    g.fillStyle(0xe0c8ff, 0.8);
    g.fillCircle(13, 14, 2.4);
    return true;
  }
  if (variant === "remains") {
    g.fillStyle(PAPER, 1);
    g.fillRoundedRect(4, 14, 18, 24, 4);
    g.lineStyle(2.5, INK, 0.85);
    g.strokeRoundedRect(4, 14, 18, 24, 4);
    g.fillStyle(INK, 1);
    g.lineBetween(7, 20, 11, 24);
    g.lineBetween(11, 20, 7, 24);
    g.lineBetween(14, 20, 18, 24);
    g.lineBetween(18, 20, 14, 24);
    g.lineStyle(2, INK, 0.8);
    g.lineBetween(8, 30, 17, 30);
    g.fillStyle(PAPER, 0.9);
    g.fillRoundedRect(19, 26, 8, 8, 2);
    g.lineStyle(2, INK, 0.7);
    g.strokeRoundedRect(19, 26, 8, 8, 2);
    return true;
  }
  if (variant === "cell") {
    g.fillStyle(0x3a3a48, 1);
    g.fillRoundedRect(7, 6, 14, 26, 3);
    g.fillStyle(0x62c462, 1);
    g.fillRoundedRect(9, 9, 10, 16, 2);
    g.fillStyle(0xeaffea, 0.8);
    g.fillCircle(14, 14, 2.4);
    g.fillStyle(0x3a3a48, 1);
    g.fillRect(11, 3, 6, 4);
    g.lineStyle(2, INK, 0.7);
    g.strokeRoundedRect(7, 6, 14, 26, 3);
    return true;
  }
  if (variant === "coin") {
    g.fillStyle(GOLD, 1);
    g.fillCircle(14, 18, 12);
    g.lineStyle(3, GOLD_DARK, 1);
    g.strokeCircle(14, 18, 12);
    g.fillStyle(GOLD_DARK, 1);
    g.fillCircle(14, 18, 5);
    g.fillStyle(0xffe08a, 0.9);
    g.fillCircle(10, 13, 2.4);
    return true;
  }
  return false;
}

function gMarker(g, color, style) {
  if (gMarkerSilhouette(g, color, style)) return;
  if (gHandDrawnSilhouette(g, color, style)) return;

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
  // itens de quests FIND-N (fragmentos, vestígios, células, moedas escondidas)
  ensure("quest_shard", (g) => gQuestItem(g, "shard"), 32, 32);
  ensure("quest_remains", (g) => gQuestItem(g, "remains"), 32, 36);
  ensure("quest_cell", (g) => gQuestItem(g, "cell"), 28, 36);
  ensure("quest_coin", (g) => gQuestItem(g, "coin"), 28, 32);
  // ponteiro do relógio (Clock Marker)
  ensure("clock_hand", (g) => {
    g.fillStyle(0x1a1a22, 1);
    g.fillTriangle(-2, 0, 2, 0, 0, -12);
  }, 4, 13);
  // bola do minigame de futebol (Striker Marker)
  ensure("soccer_ball_tex", (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 10, 9);
    g.lineStyle(2, 0x33333d, 0.9);
    g.strokeCircle(10, 10, 9);
    g.fillStyle(0x33333d, 1);
    g.fillCircle(10, 10, 3);
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      g.fillCircle(10 + Math.cos(a) * 5.5, 10 + Math.sin(a) * 5.5, 1.6);
    }
  }, 20, 20);
}

export function markerTextureKey(difficulty, style) {
  return `marker_${difficulty}_${style || "classic"}`.replace(/[^a-z0-9_]/gi, "");
}

// Texturas de marker sob demanda — a dificuldade define a cor (por isso entra
// na chave). `size` permite canvas custom (torre corrompida, prédio, mecha,
// máquina conectada). Funciona em qualquer cena (o TextureManager é global).
export function ensureMarkerTexture(scene, difficulty, style = "classic", size = null) {
  const suffix = size ? `_${size.width}x${size.height}` : "";
  const key = `${markerTextureKey(difficulty, style)}${suffix}`;
  if (scene.textures.exists(key)) return key;
  const g = graphics(scene);
  gMarker(g, difficultyColor(difficulty), style);
  g.generateTexture(key, size ? size.width : 56, size ? size.height : 80);
  g.destroy();
  return key;
}
