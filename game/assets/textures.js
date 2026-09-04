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

function gMarker(g, color, style) {
  // pernas
  g.lineStyle(4, INK, 1);
  g.lineBetween(22, 68, 20, 75);
  g.lineBetween(34, 68, 36, 75);
  g.fillStyle(INK, 1);
  g.fillEllipse(18, 76, 9, 4);
  g.fillEllipse(38, 76, 9, 4);

  // braços
  g.lineStyle(4, INK, 1);
  g.lineBetween(12, 50, 6, 58);
  g.lineBetween(44, 50, 50, 58);
  g.fillStyle(color, 1);
  g.fillCircle(5, 59, 3.4);
  g.fillCircle(51, 59, 3.4);

  // corpo
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
