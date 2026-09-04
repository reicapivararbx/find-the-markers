// Kit de desenho TOP-DOWN 2.5D — volume aparente, sombras no chão, colliders na BASE.
// Tudo continua em coordenadas 2D; depth ≈ y para oclusão (player atrás/frente de árvores).
const INK = 0x33333d;
import { ensureMarkerTexture } from "../assets/textures.js";

function g(scene, depth) {
  return scene.add.graphics().setDepth(depth);
}

function outlined(gfx, fill, alpha = 1) {
  gfx.fillStyle(fill, alpha);
  gfx.lineStyle(3, INK, 0.85);
}

/** Sombra elíptica no chão sob objetos com altura. */
function groundShadow(scene, x, baseY, w = 48, h = 18, alpha = 0.28) {
  return scene.add
    .ellipse(x, baseY - 2, w, h, 0x1a1a22, alpha)
    .setDepth(baseY - 2);
}

export const kit = {
  shadow: groundShadow,

  // Céu com faixas + sol (decorativo de fundo — top-down ainda mostra horizonte).
  sky(scene, top = 0xbfe8f7, bottom = 0xe8f7d8) {
    const bg = g(scene, -100);
    bg.fillStyle(top, 1);
    bg.fillRect(0, 0, 1440, 280);
    bg.fillStyle(bottom, 1);
    bg.fillRect(0, 280, 1440, 530);
    // transição suave horizonte
    bg.fillStyle(bottom, 0.55);
    bg.fillRect(0, 240, 1440, 60);
    const sun = scene.add.circle(1290, 90, 42, 0xffe08a, 0.9).setDepth(-99);
    scene.add.circle(1290, 90, 54, 0xffe08a, 0.22).setDepth(-99);
    return sun;
  },

  // Interior: parede de fundo + piso walkable (SEM solid no chão).
  interiorWall(scene, ctx, wall = 0xefe6d4, floor = 0x6fae7c) {
    const bg = g(scene, -100);
    bg.fillStyle(wall, 1);
    bg.fillRect(0, 0, 1440, 220);
    // painel de parede com “volume”
    bg.fillStyle(0x000000, 0.06);
    bg.fillRect(0, 180, 1440, 40);
    bg.fillStyle(floor, 1);
    bg.fillRect(0, 220, 1440, 590);
    // madeira / rodapé
    bg.lineStyle(5, 0x8a6238, 0.55);
    bg.lineBetween(0, 220, 1440, 220);
    // padrão de piso
    bg.lineStyle(1.5, 0x000000, 0.07);
    for (let y = 240; y < 810; y += 48) bg.lineBetween(0, y, 1440, y);
    for (let x = 0; x < 1440; x += 64) bg.lineBetween(x, 220, x, 810);
    // bordas do mapa (paredes laterais finas)
    if (ctx) {
      ctx.solid(0, 0, 24, 810);
      ctx.solid(1416, 0, 24, 810);
      ctx.solid(0, 0, 1440, 40);
      ctx.solid(0, 790, 1440, 20);
    }
  },

  // Chão walkable full-screen — NÃO registra solid (top-down anda em cima).
  ground(scene, ctx, color = 0x9ec86f, top = 0) {
    const gfx = g(scene, -50);
    // campo completo
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, 1440, 810);
    // variação de terreno (manchas)
    gfx.fillStyle(0x000000, 0.04);
    for (let i = 0; i < 28; i += 1) {
      const x = (i * 197 + 40) % 1400;
      const y = (i * 311 + 80) % 780;
      gfx.fillEllipse(x, y, 90 + (i % 5) * 20, 40 + (i % 3) * 12);
    }
    gfx.fillStyle(0xffffff, 0.05);
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 251 + 120) % 1380;
      const y = (i * 173 + 60) % 760;
      gfx.fillEllipse(x, y, 50, 22);
    }
    // bordas do mundo
    if (ctx) {
      ctx.solid(0, 0, 18, 810);
      ctx.solid(1422, 0, 18, 810);
      ctx.solid(0, 0, 1440, 28);
      ctx.solid(0, 792, 1440, 18);
    }
    return top;
  },

  // Calçada / rua urbana top-down com volume.
  cobblestone(scene, ctx, top = 0) {
    const gfx = g(scene, -50);
    // asfalto / base
    gfx.fillStyle(0x8a8680, 1);
    gfx.fillRect(0, 0, 1440, 810);
    // calçada superior (faixa de fundo)
    gfx.fillStyle(0xc4bfb2, 1);
    gfx.fillRect(0, 0, 1440, 200);
    gfx.fillStyle(0xb9b4a4, 1);
    gfx.fillRect(0, 180, 1440, 40);
    // rua central
    gfx.fillStyle(0x6e6b66, 1);
    gfx.fillRect(0, 360, 1440, 220);
    // faixas amarelas
    gfx.fillStyle(0xf2c94c, 0.85);
    for (let x = 40; x < 1400; x += 90) gfx.fillRect(x, 462, 48, 6);
    // paralelepípedos na calçada
    gfx.lineStyle(1.5, 0x7a7568, 0.45);
    for (let row = 0; row < 8; row += 1) {
      const y = 210 + row * 18;
      for (let x = (row % 2) * 22; x < 1440; x += 44) {
        gfx.strokeRect(x, y, 40, 16);
      }
    }
    // calçada inferior
    gfx.fillStyle(0xc4bfb2, 1);
    gfx.fillRect(0, 580, 1440, 230);
    gfx.lineStyle(1.5, 0x7a7568, 0.4);
    for (let row = 0; row < 10; row += 1) {
      const y = 600 + row * 18;
      for (let x = (row % 2) * 22; x < 1440; x += 44) gfx.strokeRect(x, y, 40, 16);
    }
    if (ctx) {
      ctx.solid(0, 0, 18, 810);
      ctx.solid(1422, 0, 18, 810);
      ctx.solid(0, 0, 1440, 28);
      ctx.solid(0, 792, 1440, 18);
    }
  },

  // Caminho de terra no chão (floresta/pomar).
  dirtPath(scene, points, width = 70) {
    const gfx = g(scene, -48);
    gfx.lineStyle(width, 0xc4a574, 0.95);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
    gfx.lineStyle(width * 0.55, 0xd4b888, 0.5);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
    // pedrinhas
    gfx.fillStyle(0x8a7a5a, 0.35);
    points.forEach(([x, y], i) => {
      if (i % 2 === 0) gfx.fillCircle(x + 18, y + 8, 3);
      if (i % 3 === 0) gfx.fillCircle(x - 22, y - 6, 2.5);
    });
  },

  grassTufts(scene, positions, baseY = 700) {
    const gfx = g(scene, -40);
    const list = Array.isArray(positions[0])
      ? positions
      : positions.map((x) => [x, baseY + ((x * 17) % 40) - 20]);
    list.forEach(([x, y]) => {
      const d = y;
      gfx.fillStyle(0x5d8f46, 1);
      gfx.fillTriangle(x - 8, y, x - 2, y - 16, x + 3, y);
      gfx.fillTriangle(x - 1, y, x + 4, y - 20, x + 9, y);
      gfx.fillStyle(0x7cae62, 1);
      gfx.fillTriangle(x + 2, y, x + 8, y - 14, x + 12, y);
      // folhinhas caídas
      gfx.fillStyle(0x8fba6a, 0.5);
      gfx.fillEllipse(x + 14, y + 4, 8, 4);
    });
  },

  rocks(scene, ctx, x, baseY, scale = 1) {
    groundShadow(scene, x, baseY, 42 * scale, 16 * scale, 0.3);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x9a9590);
    gfx.fillEllipse(x, baseY - 10 * scale, 36 * scale, 22 * scale);
    gfx.strokeEllipse(x, baseY - 10 * scale, 36 * scale, 22 * scale);
    gfx.fillStyle(0xb0aba6, 1);
    gfx.fillEllipse(x - 6 * scale, baseY - 14 * scale, 14 * scale, 8 * scale);
    if (ctx) ctx.solid(x - 18 * scale, baseY - 14 * scale, 36 * scale, 16 * scale);
  },

  cloud(scene, x, y, scale = 1) {
    const image = scene.add.image(x, y, "cloud").setDepth(-90).setScale(scale);
    scene.tweens.add({
      targets: image,
      x: x + 14 * scale,
      duration: 5200,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1
    });
    return image;
  },

  /**
   * Árvore 2.5D: sombra no chão + tronco (depth=baseY) + copa alta (depth alta).
   * Collider só na BASE do tronco — player pode passar “atrás” da copa.
   */
  tree(scene, ctxOrX, xOrBaseY, baseYOrOpts, maybeOpts) {
    let ctx = null;
    let x;
    let baseY;
    let opts = {};
    if (ctxOrX && typeof ctxOrX.solid === "function") {
      ctx = ctxOrX;
      x = xOrBaseY;
      baseY = baseYOrOpts;
      opts = maybeOpts || {};
    } else {
      x = ctxOrX;
      baseY = xOrBaseY;
      opts = baseYOrOpts || {};
    }
    const { scale = 1, fruits = 0, canopy = 0x7cae62 } = opts;
    return kit._treeDraw(scene, ctx, x, baseY, { scale, fruits, canopy });
  },

  _treeDraw(scene, ctx, x, baseY, { scale = 1, fruits = 0, canopy = 0x7cae62 } = {}) {
    groundShadow(scene, x, baseY, 70 * scale, 24 * scale, 0.32);

    const trunkH = 70 * scale;
    const trunk = g(scene, baseY);
    // tronco com shading
    outlined(trunk, 0x8a6238);
    trunk.fillRoundedRect(x - 12 * scale, baseY - trunkH, 24 * scale, trunkH, 6 * scale);
    trunk.strokeRoundedRect(x - 12 * scale, baseY - trunkH, 24 * scale, trunkH, 6 * scale);
    trunk.fillStyle(0x6d4a2a, 0.45);
    trunk.fillRect(x + 2 * scale, baseY - trunkH, 8 * scale, trunkH);
    trunk.fillStyle(0xb07a48, 0.35);
    trunk.fillRect(x - 10 * scale, baseY - trunkH, 6 * scale, trunkH);

    // copa em camadas (volume) — depth alto para ficar na frente quando player está atrás (y menor)
    // Na verdade: se player.y < baseY e está “atrás”, árvore deve cobrir.
    // depth = baseY para tronco; copa usa baseY + offset visual alto no eixo Y de sort
    // Usamos depth da base: copa depth = baseY + 1 (mesmo sorting pela base da árvore)
    const canopyGfx = g(scene, baseY + 1);
    const cy = baseY - trunkH - 28 * scale;
    // sombra interna da copa
    canopyGfx.fillStyle(0x4a6e3a, 0.55);
    canopyGfx.fillCircle(x, cy + 18 * scale, 58 * scale);
    canopyGfx.fillStyle(canopy, 1);
    canopyGfx.fillCircle(x - 40 * scale, cy + 14 * scale, 44 * scale);
    canopyGfx.fillCircle(x + 40 * scale, cy + 14 * scale, 44 * scale);
    canopyGfx.fillCircle(x, cy - 22 * scale, 52 * scale);
    canopyGfx.fillCircle(x, cy + 22 * scale, 40 * scale);
    // highlight
    canopyGfx.fillStyle(0xffffff, 0.12);
    canopyGfx.fillCircle(x - 18 * scale, cy - 18 * scale, 22 * scale);
    canopyGfx.lineStyle(2.5, INK, 0.35);
    canopyGfx.strokeCircle(x, cy - 8 * scale, 56 * scale);

    for (let i = 0; i < fruits; i += 1) {
      const angle = (i / Math.max(1, fruits)) * Math.PI * 2;
      canopyGfx.fillStyle(0xf2994a, 1);
      canopyGfx.fillCircle(
        x + Math.cos(angle) * 42 * scale,
        cy + 4 * scale + Math.sin(angle) * 32 * scale,
        6 * scale
      );
    }

    // collider só na base do tronco
    if (ctx) {
      const bw = 28 * scale;
      const bh = 22 * scale;
      ctx.solid(x - bw / 2, baseY - bh, bw, bh);
    }
    return { x, baseY, canopyTop: baseY - trunkH - 80 * scale };
  },

  bush(scene, ctxOrX, xOrBaseY, baseYOrScale, maybeScale) {
    let ctx = null;
    let x;
    let baseY;
    let scale = 1;
    if (ctxOrX && typeof ctxOrX.solid === "function") {
      ctx = ctxOrX;
      x = xOrBaseY;
      baseY = baseYOrScale;
      scale = maybeScale ?? 1;
    } else {
      x = ctxOrX;
      baseY = xOrBaseY;
      scale = baseYOrScale ?? 1;
    }
    groundShadow(scene, x, baseY, 48 * scale, 16 * scale, 0.25);
    const gfx = g(scene, baseY);
    gfx.fillStyle(0x5d8f46, 1);
    gfx.fillCircle(x - 16 * scale, baseY - 10 * scale, 18 * scale);
    gfx.fillCircle(x + 14 * scale, baseY - 12 * scale, 20 * scale);
    gfx.fillStyle(0x6fae7c, 1);
    gfx.fillCircle(x, baseY - 22 * scale, 22 * scale);
    gfx.fillStyle(0x8fba6a, 0.5);
    gfx.fillCircle(x - 8 * scale, baseY - 26 * scale, 10 * scale);
    if (ctx) ctx.solid(x - 20 * scale, baseY - 14 * scale, 40 * scale, 16 * scale);
  },

  /**
   * Caixa / crate no chão — volume 2.5D (topo + face) + sombra + collider na base.
   */
  crate(scene, ctx, x, baseY, w = 56, h = 48, fill = 0xb98a5a) {
    groundShadow(scene, x + w / 2, baseY + 4, w * 0.95, 18, 0.28);
    const gfx = g(scene, baseY + h);
    const topH = 14;
    // face frontal
    outlined(gfx, fill);
    gfx.fillRoundedRect(x, baseY - h + topH, w, h - topH, 4);
    gfx.strokeRoundedRect(x, baseY - h + topH, w, h - topH, 4);
    // topo (perspectiva)
    gfx.fillStyle(Phaser.Display.Color.IntegerToColor(fill).brighten(18).color, 1);
    gfx.fillRect(x, baseY - h, w, topH);
    gfx.lineStyle(2.5, INK, 0.75);
    gfx.strokeRect(x, baseY - h, w, topH);
    // pregos / detalhes
    gfx.fillStyle(INK, 0.35);
    gfx.fillCircle(x + 10, baseY - h / 2, 2);
    gfx.fillCircle(x + w - 10, baseY - h / 2, 2);
    if (ctx) ctx.solid(x + 4, baseY - 20, w - 8, 22);
    return gfx;
  },

  // Compat: platform vira crate no chão (não mais plataforma de pulo).
  platform(scene, ctx, x, y, width, height, { fill = 0xb98a5a } = {}) {
    // y era o topo no platformer; no top-down usamos y+height como baseY
    const baseY = y + height;
    return kit.crate(scene, ctx, x, baseY, width, Math.min(height, 56), fill);
  },

  branch(scene, ctx, x1, x2, y) {
    // galho caído no chão (obstáculo baixo)
    const baseY = y + 40;
    groundShadow(scene, (x1 + x2) / 2, baseY, (x2 - x1) * 0.7, 14, 0.22);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x8a6238);
    gfx.fillRoundedRect(x1, baseY - 14, x2 - x1, 16, 8);
    gfx.strokeRoundedRect(x1, baseY - 14, x2 - x1, 16, 8);
    if (ctx) ctx.solid(x1 + 8, baseY - 12, x2 - x1 - 16, 14);
    return gfx;
  },

  signBoard(scene, a, b, c, d, e, f, maybeOpts) {
    let ctx = null;
    let x;
    let baseY;
    let width;
    let height;
    let lines;
    let opts = {};
    if (a && typeof a.solid === "function") {
      ctx = a;
      x = b;
      baseY = c;
      width = d;
      height = e;
      lines = f;
      opts = maybeOpts || {};
    } else {
      x = a;
      baseY = b + (typeof d === "number" ? d : 0);
      width = c;
      height = d;
      lines = e;
      opts = f || {};
    }
    const fill = opts.fill ?? 0xdcb476;
    groundShadow(scene, x, baseY, 36, 14, 0.25);
    const gfx = g(scene, baseY);
    // poste
    outlined(gfx, 0x8a6238);
    gfx.fillRoundedRect(x - 6, baseY - height - 40, 12, height + 40, 3);
    gfx.strokeRoundedRect(x - 6, baseY - height - 40, 12, height + 40, 3);
    // placa
    outlined(gfx, fill);
    gfx.fillRoundedRect(x - width / 2, baseY - height - 50, width, height, 8);
    gfx.strokeRoundedRect(x - width / 2, baseY - height - 50, width, height, 8);
    (lines || []).forEach((line, index) => {
      scene.add
        .text(
          x,
          baseY - height - 50 + height / 2 + (index - (lines.length - 1) / 2) * 20,
          typeof line === "string" ? line : line.text || line,
          {
            fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
            fontSize: (line && line.size) || "15px",
            fontStyle: "bold",
            color: (line && line.color) || "#33333d",
            wordWrap: { width: width - 20 }
          }
        )
        .setOrigin(0.5)
        .setDepth(baseY + 1);
    });
    if (ctx) ctx.solid(x - 14, baseY - 18, 28, 18);
  },

  /**
   * Prédio top-down 2.5D: sombra, paredes com volume, telhado aparente, porta.
   * Collider = footprint da base (não a altura visual inteira).
   */
  building(scene, ctx, opts) {
    const {
      x,
      w,
      h,
      wall,
      doorColor,
      windows = [],
      door = null,
      roof = null,
      label = null
    } = opts;
    const baseY = opts.baseY ?? (opts.y != null ? opts.y + h : 750);
    const top = baseY - h;
    const solidCtx = ctx && typeof ctx.solid === "function" ? ctx : null;
    groundShadow(scene, x + w / 2, baseY + 6, w * 1.05, 28, 0.35);

    const gfx = g(scene, baseY);
    // parede
    outlined(gfx, wall);
    gfx.fillRect(x, top, w, h);
    gfx.strokeRect(x, top, w, h);
    // sombreamento lateral (volume)
    gfx.fillStyle(0x000000, 0.12);
    gfx.fillRect(x + w - 22, top, 22, h);
    gfx.fillStyle(0xffffff, 0.08);
    gfx.fillRect(x, top, 18, h);

    if (roof) {
      const roofGfx = g(scene, baseY + 2);
      roofGfx.fillStyle(roof, 1);
      roofGfx.fillTriangle(x - 10, top, x + w + 10, top, x + w / 2, top - 54);
      roofGfx.lineStyle(3, INK, 0.85);
      roofGfx.beginPath();
      roofGfx.moveTo(x - 10, top);
      roofGfx.lineTo(x + w / 2, top - 54);
      roofGfx.lineTo(x + w + 10, top);
      roofGfx.strokePath();
      // face do telhado (espessura)
      roofGfx.fillStyle(0x000000, 0.15);
      roofGfx.fillTriangle(x + w / 2, top - 54, x + w + 10, top, x + w - 20, top);
    }

    windows.forEach(([wx, wy]) => {
      gfx.fillStyle(0xbfe8f7, 1);
      gfx.fillRect(wx, wy, 44, 44);
      gfx.lineStyle(3, INK, 0.85);
      gfx.strokeRect(wx, wy, 44, 44);
      gfx.lineBetween(wx + 22, wy, wx + 22, wy + 44);
      gfx.lineBetween(wx, wy + 22, wx + 44, wy + 22);
      // brilho
      gfx.fillStyle(0xffffff, 0.25);
      gfx.fillRect(wx + 4, wy + 4, 12, 12);
    });

    if (door) {
      const [dx, dy, dw, dh] = door;
      gfx.fillStyle(doorColor || 0xd1495b, 1);
      gfx.fillRect(dx, dy, dw, dh);
      gfx.lineStyle(3, INK, 0.85);
      gfx.strokeRect(dx, dy, dw, dh);
      gfx.fillStyle(0xf2c94c, 1);
      gfx.fillCircle(dx + dw - 12, dy + dh / 2, 5);
    }

    if (label) {
      scene.add
        .text(x + w / 2, top + 28, label, {
          fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
          fontSize: "28px",
          fontStyle: "bold",
          color: "#e8df9a",
          stroke: "#33333d",
          strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(baseY + 3);
    }

    if (solidCtx) solidCtx.solid(x + 8, baseY - 36, w - 16, 40);
    return gfx;
  },

  goldFrame(scene, cx, cy, w, h) {
    const gfx = g(scene, cy);
    groundShadow(scene, cx, cy + h / 2 + 4, w * 0.7, 16, 0.2);
    gfx.fillStyle(0xd9b45d, 1);
    gfx.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    gfx.lineStyle(4, 0x8a6238, 1);
    gfx.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    gfx.fillStyle(0xfdfaf1, 1);
    gfx.fillRect(cx - w / 2 + 14, cy - h / 2 + 14, w - 28, h - 28);
    // moldura interna volume
    gfx.lineStyle(2, 0xc9a04a, 0.8);
    gfx.strokeRect(cx - w / 2 + 10, cy - h / 2 + 10, w - 20, h - 20);
    return gfx;
  },

  panelStrip(scene, defs, collectedIds) {
    if (!defs.length) return null;
    const frameW = 74;
    const frameH = 96;
    const gap = 12;
    const total = defs.length * frameW + (defs.length - 1) * gap;
    let x = 720 - total / 2 + frameW / 2;

    const bg = g(scene, 9000);
    bg.fillStyle(0xfdfaf1, 0.9);
    bg.fillRoundedRect(720 - total / 2 - 16, 10, total + 32, frameH + 30, 12);
    bg.lineStyle(3, INK, 0.5);
    bg.strokeRoundedRect(720 - total / 2 - 16, 10, total + 32, frameH + 30, 12);

    defs.forEach((def) => {
      const style = def.style === "pendulum" ? "classic" : def.style;
      const key = ensureMarkerTexture(scene, def.difficulty, style);
      scene.add.image(x, 62, key).setScale(0.82).setDepth(9001).setName(`panel_mini_${def.id}`);
      const frame = g(scene, 9000);
      frame.lineStyle(3, INK, 0.55);
      frame.strokeRoundedRect(x - frameW / 2, 18, frameW, frameH, 8);
      frame.fillStyle(0xffffff, 0.25);
      frame.fillRect(x - frameW / 2, 18, frameW, 62);

      scene.add
        .text(x, 104, def.difficulty, {
          fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
          fontSize: "12px",
          fontStyle: "bold",
          color: "#33333d",
          backgroundColor: "#f2c94ccc",
          padding: { x: 4, y: 1 }
        })
        .setOrigin(0.5)
        .setDepth(9001);

      if (collectedIds.includes(def.id)) {
        scene.add
          .text(x + frameW / 2 - 8, 24, "✓", {
            fontFamily: '"Comic Sans MS", sans-serif',
            fontSize: "20px",
            fontStyle: "bold",
            color: "#2f7a4f"
          })
          .setOrigin(0.5)
          .setDepth(9002)
          .setName(`panel_check_${def.id}`);
      }
      x += frameW + gap;
    });
    return bg;
  },

  water(scene, xOrY, yOrW, wOrH, maybeH) {
    let x;
    let y;
    let w;
    let h;
    if (arguments.length <= 2) {
      x = 690;
      y = typeof xOrY === "number" ? xOrY : 620;
      w = 520;
      h = 100;
    } else {
      x = xOrY;
      y = yOrW;
      w = wOrH;
      h = maybeH ?? 100;
    }
    const gfx = g(scene, -45);
    gfx.fillStyle(0x5eb8b0, 0.88);
    gfx.fillRoundedRect(x, y, w, h, 16);
    gfx.lineStyle(3, 0x3a9088, 0.7);
    gfx.strokeRoundedRect(x, y, w, h, 16);
    gfx.lineStyle(2, 0xffffff, 0.25);
    for (let i = 0; i < 5; i += 1) {
      const lx = x + 20 + i * (w / 5);
      gfx.lineBetween(lx, y + 18 + (i % 2) * 10, lx + 28, y + 18 + (i % 2) * 10);
    }
    gfx.fillStyle(0xffffff, 0.12);
    gfx.fillEllipse(x + w * 0.35, y + h * 0.35, w * 0.35, h * 0.2);
  },

  log(scene, ctxOrX1, x1OrX2, x2OrBaseY, maybeBaseY) {
    let ctx = null;
    let x1;
    let x2;
    let baseY;
    if (ctxOrX1 && typeof ctxOrX1.solid === "function") {
      ctx = ctxOrX1;
      x1 = x1OrX2;
      x2 = x2OrBaseY;
      baseY = maybeBaseY;
    } else {
      x1 = ctxOrX1;
      x2 = x1OrX2;
      baseY = x2OrBaseY;
    }
    groundShadow(scene, (x1 + x2) / 2, baseY + 4, (x2 - x1) * 0.85, 18, 0.28);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xa9805a);
    gfx.fillRoundedRect(x1, baseY - 28, x2 - x1, 32, 12);
    gfx.strokeRoundedRect(x1, baseY - 28, x2 - x1, 32, 12);
    gfx.lineStyle(2.5, 0x7c5a3c, 0.8);
    for (let x = x1 + 50; x < x2; x += 90) {
      gfx.beginPath();
      gfx.arc(x, baseY - 12, 9, Math.PI * 0.6, Math.PI * 1.4);
      gfx.strokePath();
    }
    if (ctx) ctx.solid(x1 + 10, baseY - 20, x2 - x1 - 20, 22);
  },

  bricks(scene, ctxOrX, xOrBaseY, baseYOrRows, maybeRows) {
    let ctx = null;
    let x;
    let baseY;
    let rows = 2;
    if (ctxOrX && typeof ctxOrX.solid === "function") {
      ctx = ctxOrX;
      x = xOrBaseY;
      baseY = baseYOrRows;
      rows = maybeRows ?? 2;
    } else {
      x = ctxOrX;
      baseY = xOrBaseY;
      rows = baseYOrRows ?? 2;
    }
    groundShadow(scene, x + 50, baseY, 90, 18, 0.25);
    const gfx = g(scene, baseY);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const bx = x + col * 34 + (row % 2) * 17;
        const by = baseY - 18 * (row + 1);
        gfx.fillStyle(row % 2 ? 0xc97f5f : 0xb96f52, 1);
        gfx.fillRect(bx, by, 30, 15);
        gfx.lineStyle(2, INK, 0.5);
        gfx.strokeRect(bx, by, 30, 15);
      }
    }
    if (ctx) ctx.solid(x, baseY - 22, 100, 22);
  },

  turbine(scene, ctxOrX, xOrBaseY, maybeBaseY) {
    let ctx = null;
    let x;
    let baseY;
    if (ctxOrX && typeof ctxOrX.solid === "function") {
      ctx = ctxOrX;
      x = xOrBaseY;
      baseY = maybeBaseY;
    } else {
      x = ctxOrX;
      baseY = xOrBaseY;
    }
    groundShadow(scene, x, baseY, 40, 16, 0.3);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xdfe5ec);
    const poleH = 200;
    gfx.fillRoundedRect(x - 7, baseY - poleH, 14, poleH, 6);
    gfx.strokeRoundedRect(x - 7, baseY - poleH, 14, poleH, 6);
    gfx.fillStyle(INK, 1);
    gfx.fillEllipse(x - 8, baseY - 120, 5, 8);
    gfx.fillEllipse(x + 8, baseY - 120, 5, 8);
    gfx.lineStyle(2.5, INK, 1);
    gfx.beginPath();
    gfx.arc(x, baseY - 102, 6, Math.PI * 0.15, Math.PI * 0.85);
    gfx.strokePath();

    const hub = scene.add.container(x, baseY - poleH).setDepth(baseY + 1);
    const blades = scene.add.graphics();
    blades.fillStyle(0xf4f7fa, 1);
    blades.lineStyle(2.5, INK, 0.7);
    for (let i = 0; i < 3; i += 1) {
      blades.save();
      blades.rotateCanvas((Math.PI * 2 * i) / 3);
      blades.fillRoundedRect(-6, -70, 12, 74, 6);
      blades.strokeRoundedRect(-6, -70, 12, 74, 6);
      blades.restore();
    }
    blades.fillStyle(INK, 1);
    blades.fillCircle(0, 0, 7);
    hub.add(blades);
    scene.tweens.add({ targets: hub, angle: 360, duration: 9000, repeat: -1 });
    if (ctx) ctx.solid(x - 16, baseY - 20, 32, 22);
    return hub;
  },

  // Poste de luz / utilitário.
  lampPost(scene, ctx, x, baseY) {
    groundShadow(scene, x, baseY, 28, 12, 0.25);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x5a5a66);
    gfx.fillRect(x - 5, baseY - 120, 10, 120);
    gfx.strokeRect(x - 5, baseY - 120, 10, 120);
    gfx.fillStyle(0xffe08a, 0.9);
    gfx.fillCircle(x, baseY - 128, 14);
    gfx.fillStyle(0xffe08a, 0.15);
    gfx.fillCircle(x, baseY - 128, 36);
    if (ctx) ctx.solid(x - 10, baseY - 16, 20, 16);
  },

  bench(scene, ctx, x, baseY, w = 90) {
    groundShadow(scene, x + w / 2, baseY, w * 0.9, 16, 0.22);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xa9805a);
    gfx.fillRoundedRect(x, baseY - 28, w, 14, 4);
    gfx.strokeRoundedRect(x, baseY - 28, w, 14, 4);
    gfx.fillRect(x + 8, baseY - 14, 10, 14);
    gfx.fillRect(x + w - 18, baseY - 14, 10, 14);
    if (ctx) ctx.solid(x + 4, baseY - 16, w - 8, 16);
  },

  stonePath(scene, points, width = 56) {
    const gfx = g(scene, -47);
    gfx.lineStyle(width, 0x9a9590, 0.92);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
    gfx.lineStyle(width * 0.55, 0xb0aba6, 0.45);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
    gfx.fillStyle(0x7a7568, 0.35);
    points.forEach(([x, y], i) => {
      if (i % 2 === 0) gfx.fillEllipse(x + 14, y + 6, 18, 10);
      if (i % 3 === 0) gfx.fillEllipse(x - 16, y - 4, 14, 8);
    });
  },

  fountain(scene, ctx, x, baseY) {
    groundShadow(scene, x, baseY, 90, 28, 0.32);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xb0aba6);
    gfx.fillEllipse(x, baseY - 8, 88, 36);
    gfx.strokeEllipse(x, baseY - 8, 88, 36);
    gfx.fillStyle(0x5eb8b0, 0.88);
    gfx.fillEllipse(x, baseY - 10, 64, 24);
    gfx.fillStyle(0x9a9590, 1);
    gfx.fillRoundedRect(x - 10, baseY - 52, 20, 40, 4);
    gfx.strokeRoundedRect(x - 10, baseY - 52, 20, 40, 4);
    gfx.fillStyle(0x7ed4cc, 0.7);
    gfx.fillCircle(x, baseY - 56, 10);
    gfx.fillStyle(0xffffff, 0.35);
    gfx.fillEllipse(x - 12, baseY - 16, 22, 8);
    if (ctx) ctx.solid(x - 36, baseY - 18, 72, 22);
  },

  greenhouse(scene, ctx, x, baseY, w = 160, h = 110) {
    groundShadow(scene, x + w / 2, baseY + 4, w * 1.05, 26, 0.3);
    const gfx = g(scene, baseY);
    const top = baseY - h;
    outlined(gfx, 0xbfe8f7);
    gfx.fillStyle(0xbfe8f7, 0.82);
    gfx.fillRect(x, top + 28, w, h - 28);
    gfx.strokeRect(x, top + 28, w, h - 28);
    gfx.fillStyle(0xd8f0f8, 0.9);
    gfx.fillTriangle(x - 6, top + 28, x + w + 6, top + 28, x + w / 2, top - 8);
    gfx.lineStyle(3, INK, 0.85);
    gfx.beginPath();
    gfx.moveTo(x - 6, top + 28);
    gfx.lineTo(x + w / 2, top - 8);
    gfx.lineTo(x + w + 6, top + 28);
    gfx.strokePath();
    gfx.lineStyle(2.5, 0x5a8a9a, 0.75);
    gfx.lineBetween(x + w / 2, top - 8, x + w / 2, baseY - 4);
    gfx.lineBetween(x, top + 55, x + w, top + 55);
    gfx.lineBetween(x + w * 0.33, top + 28, x + w * 0.33, baseY - 4);
    gfx.lineBetween(x + w * 0.66, top + 28, x + w * 0.66, baseY - 4);
    gfx.fillStyle(0x8a6238, 1);
    gfx.fillRect(x + w / 2 - 14, baseY - 36, 28, 32);
    gfx.lineStyle(2.5, INK, 0.8);
    gfx.strokeRect(x + w / 2 - 14, baseY - 36, 28, 32);
    gfx.fillStyle(0x5d8f46, 0.85);
    gfx.fillEllipse(x + 28, baseY - 20, 22, 14);
    gfx.fillEllipse(x + w - 28, baseY - 18, 20, 12);
    if (ctx) ctx.solid(x + 8, baseY - 28, w - 16, 28);
  },

  hedgeWall(scene, ctx, x, baseY, w = 120, h = 48) {
    groundShadow(scene, x + w / 2, baseY, w * 0.95, 18, 0.26);
    const gfx = g(scene, baseY);
    gfx.fillStyle(0x4a6e3a, 1);
    gfx.fillRoundedRect(x, baseY - h, w, h, 10);
    gfx.fillStyle(0x5d8f46, 1);
    gfx.fillRoundedRect(x + 4, baseY - h - 6, w - 8, h * 0.55, 12);
    gfx.fillStyle(0x7cae62, 0.7);
    gfx.fillCircle(x + 18, baseY - h + 4, 12);
    gfx.fillCircle(x + w - 18, baseY - h + 6, 14);
    gfx.fillCircle(x + w / 2, baseY - h - 4, 16);
    if (ctx) ctx.solid(x + 4, baseY - 20, w - 8, 20);
  },

  ruinPillar(scene, ctx, x, baseY, h = 90) {
    groundShadow(scene, x, baseY, 36, 14, 0.28);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xc4b8a0);
    gfx.fillRoundedRect(x - 12, baseY - h, 24, h, 4);
    gfx.strokeRoundedRect(x - 12, baseY - h, 24, h, 4);
    gfx.fillStyle(0xd8d0bc, 1);
    gfx.fillRect(x - 18, baseY - h - 8, 36, 12);
    gfx.fillStyle(0x5d8f46, 0.55);
    gfx.fillEllipse(x + 8, baseY - h * 0.4, 14, 10);
    if (ctx) ctx.solid(x - 14, baseY - 18, 28, 18);
  },

  flowerBed(scene, x, baseY, colors = [0xd1495b, 0xf2c94c, 0xb37feb]) {
    const gfx = g(scene, baseY - 1);
    gfx.fillStyle(0x6b4a2a, 0.85);
    gfx.fillEllipse(x, baseY, 70, 22);
    colors.forEach((c, i) => {
      const ox = (i - 1) * 18;
      gfx.fillStyle(0x5d8f46, 1);
      gfx.fillTriangle(x + ox - 3, baseY - 2, x + ox + 3, baseY - 2, x + ox, baseY - 18);
      gfx.fillStyle(c, 1);
      gfx.fillCircle(x + ox, baseY - 20, 6);
    });
  },

  fallenLog(scene, ctx, x, baseY, w = 110) {
    groundShadow(scene, x + w / 2, baseY, w * 0.9, 16, 0.26);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x8a6238);
    gfx.fillRoundedRect(x, baseY - 22, w, 24, 10);
    gfx.strokeRoundedRect(x, baseY - 22, w, 24, 10);
    gfx.fillStyle(0xd4b888, 1);
    gfx.fillEllipse(x + 6, baseY - 10, 14, 16);
    gfx.lineStyle(2, 0x6d4a2a, 0.7);
    gfx.strokeEllipse(x + 6, baseY - 10, 14, 16);
    if (ctx) ctx.solid(x + 8, baseY - 16, w - 16, 16);
  },

  waterBody(scene, x, y, w, h) {
    const gfx = g(scene, -48);
    gfx.fillStyle(0x3a8ab8, 0.92);
    gfx.fillEllipse(x, y, w, h);
    gfx.fillStyle(0x5eb8d8, 0.45);
    gfx.fillEllipse(x - w * 0.12, y - h * 0.1, w * 0.55, h * 0.4);
    gfx.lineStyle(2, 0x2a6a90, 0.5);
    for (let i = 0; i < 5; i += 1) {
      const yy = y - h * 0.3 + i * (h * 0.15);
      gfx.beginPath();
      gfx.moveTo(x - w * 0.35, yy);
      gfx.lineTo(x - w * 0.1, yy + 4);
      gfx.lineTo(x + w * 0.15, yy - 2);
      gfx.lineTo(x + w * 0.35, yy + 3);
      gfx.strokePath();
    }
  },

  dock(scene, ctx, x, baseY, w = 200) {
    groundShadow(scene, x + w / 2, baseY, w * 0.95, 22, 0.3);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x8a6238);
    gfx.fillRoundedRect(x, baseY - 28, w, 32, 4);
    gfx.strokeRoundedRect(x, baseY - 28, w, 32, 4);
    gfx.lineStyle(2, 0x6d4a2a, 0.7);
    for (let i = 1; i < 5; i += 1) {
      gfx.lineBetween(x + (w / 5) * i, baseY - 28, x + (w / 5) * i, baseY + 4);
    }
    gfx.fillStyle(0x6d4a2a, 1);
    gfx.fillRect(x + 10, baseY + 2, 12, 18);
    gfx.fillRect(x + w - 22, baseY + 2, 12, 18);
    if (ctx) ctx.solid(x + 4, baseY - 16, w - 8, 18);
  },

  crane(scene, ctx, x, baseY, h = 140) {
    groundShadow(scene, x, baseY, 50, 18, 0.3);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xd4a017);
    gfx.fillRect(x - 10, baseY - h, 20, h);
    gfx.strokeRect(x - 10, baseY - h, 20, h);
    gfx.fillRect(x - 10, baseY - h - 8, 90, 14);
    gfx.strokeRect(x - 10, baseY - h - 8, 90, 14);
    gfx.lineStyle(3, 0x8a7000, 0.9);
    gfx.lineBetween(x + 70, baseY - h, x + 70, baseY - h + 50);
    gfx.fillStyle(0x6a6a70, 1);
    gfx.fillRect(x + 62, baseY - h + 50, 16, 12);
    gfx.fillStyle(0x8a6238, 1);
    gfx.fillRect(x - 18, baseY - 16, 36, 16);
    if (ctx) ctx.solid(x - 16, baseY - 18, 32, 18);
  },

  buoy(scene, x, baseY) {
    const gfx = g(scene, baseY);
    gfx.fillStyle(0xd1495b, 1);
    gfx.fillEllipse(x, baseY - 18, 22, 28);
    gfx.fillStyle(0xf2c94c, 1);
    gfx.fillEllipse(x, baseY - 28, 14, 10);
    gfx.lineStyle(2.5, INK, 0.85);
    gfx.strokeEllipse(x, baseY - 18, 22, 28);
    gfx.fillStyle(0x3a8ab8, 0.4);
    gfx.fillEllipse(x, baseY + 4, 30, 10);
  },

  cargoCrate(scene, ctx, x, baseY, color = 0xb85a2a) {
    groundShadow(scene, x + 28, baseY, 56, 16, 0.26);
    const gfx = g(scene, baseY);
    outlined(gfx, color);
    gfx.fillRoundedRect(x, baseY - 40, 56, 42, 4);
    gfx.strokeRoundedRect(x, baseY - 40, 56, 42, 4);
    gfx.lineStyle(2, 0x000000, 0.25);
    gfx.lineBetween(x + 28, baseY - 40, x + 28, baseY + 2);
    gfx.lineBetween(x, baseY - 20, x + 56, baseY - 20);
    if (ctx) ctx.solid(x + 4, baseY - 18, 48, 18);
  },

  lighthouse(scene, ctx, x, baseY, h = 160) {
    groundShadow(scene, x, baseY, 48, 18, 0.32);
    const gfx = g(scene, baseY);
    outlined(gfx, 0xf0ece4);
    gfx.fillTriangle(x - 22, baseY - h + 30, x + 22, baseY - h + 30, x, baseY - h - 10);
    gfx.fillRect(x - 18, baseY - h + 30, 36, h - 30);
    gfx.strokeRect(x - 18, baseY - h + 30, 36, h - 30);
    gfx.fillStyle(0xd1495b, 1);
    gfx.fillRect(x - 18, baseY - h + 50, 36, 18);
    gfx.fillRect(x - 18, baseY - h + 100, 36, 18);
    gfx.fillStyle(0xf2c94c, 0.9);
    gfx.fillCircle(x, baseY - h + 18, 10);
    gfx.fillStyle(0xffe08a, 0.25);
    gfx.fillCircle(x, baseY - h + 18, 28);
    if (ctx) ctx.solid(x - 16, baseY - 20, 32, 20);
  },

  ropeCoil(scene, x, baseY) {
    const gfx = g(scene, baseY);
    gfx.fillStyle(0xc4a574, 1);
    gfx.fillEllipse(x, baseY - 8, 36, 20);
    gfx.lineStyle(2.5, 0x8a6238, 0.9);
    gfx.strokeEllipse(x, baseY - 8, 28, 14);
    gfx.strokeEllipse(x, baseY - 8, 16, 8);
  },

  smokestack(scene, ctx, x, baseY, h = 130) {
    groundShadow(scene, x, baseY, 40, 16, 0.3);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x6a6058);
    gfx.fillRect(x - 14, baseY - h, 28, h);
    gfx.strokeRect(x - 14, baseY - h, 28, h);
    gfx.fillStyle(0x8a8078, 1);
    gfx.fillRect(x - 18, baseY - h - 8, 36, 12);
    gfx.fillStyle(0x888890, 0.45);
    gfx.fillEllipse(x + 8, baseY - h - 30, 28, 18);
    gfx.fillEllipse(x + 18, baseY - h - 48, 22, 14);
    if (ctx) ctx.solid(x - 14, baseY - 18, 28, 18);
  },

  conveyor(scene, ctx, x, baseY, w = 180) {
    groundShadow(scene, x + w / 2, baseY, w * 0.95, 18, 0.24);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x5a5048);
    gfx.fillRoundedRect(x, baseY - 24, w, 28, 4);
    gfx.strokeRoundedRect(x, baseY - 24, w, 28, 4);
    gfx.fillStyle(0x3a3830, 1);
    for (let i = 0; i < 6; i += 1) {
      gfx.fillRect(x + 12 + i * 28, baseY - 18, 16, 16);
    }
    if (ctx) ctx.solid(x + 4, baseY - 14, w - 8, 14);
  },

  pipeRun(scene, points, color = 0x8a9088) {
    const gfx = g(scene, -46);
    gfx.lineStyle(14, color, 0.95);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
    gfx.lineStyle(6, 0xb0b8b0, 0.4);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
  },

  gearDecor(scene, x, baseY, r = 28) {
    const gfx = g(scene, baseY);
    gfx.fillStyle(0x8a8070, 1);
    gfx.fillCircle(x, baseY - r, r);
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      gfx.fillRect(x + Math.cos(a) * r - 5, baseY - r + Math.sin(a) * r - 5, 10, 10);
    }
    gfx.fillStyle(0x5a5048, 1);
    gfx.fillCircle(x, baseY - r, r * 0.35);
    gfx.lineStyle(2.5, INK, 0.7);
    gfx.strokeCircle(x, baseY - r, r);
  },

  oilDrum(scene, ctx, x, baseY) {
    groundShadow(scene, x, baseY, 28, 14, 0.26);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x3a6a3a);
    gfx.fillRoundedRect(x - 14, baseY - 36, 28, 38, 6);
    gfx.strokeRoundedRect(x - 14, baseY - 36, 28, 38, 6);
    gfx.fillStyle(0xd1495b, 1);
    gfx.fillRect(x - 14, baseY - 22, 28, 8);
    if (ctx) ctx.solid(x - 12, baseY - 16, 24, 16);
  },

  factoryWindow(scene, x, baseY, w = 60, h = 40) {
    const gfx = g(scene, baseY);
    gfx.fillStyle(0x3a4858, 0.9);
    gfx.fillRect(x, baseY - h, w, h);
    gfx.fillStyle(0xf2c94c, 0.35);
    gfx.fillRect(x + 4, baseY - h + 4, w - 8, h - 8);
    gfx.lineStyle(2.5, INK, 0.8);
    gfx.strokeRect(x, baseY - h, w, h);
    gfx.lineBetween(x + w / 2, baseY - h, x + w / 2, baseY);
    gfx.lineBetween(x, baseY - h / 2, x + w, baseY - h / 2);
  },

  mineRail(scene, points) {
    const gfx = g(scene, -47);
    gfx.lineStyle(10, 0x4a4038, 0.95);
    gfx.beginPath();
    gfx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0], points[i][1]);
    gfx.strokePath();
    gfx.lineStyle(3, 0x8a8070, 0.85);
    gfx.beginPath();
    gfx.moveTo(points[0][0] - 8, points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0] - 8, points[i][1]);
    gfx.strokePath();
    gfx.beginPath();
    gfx.moveTo(points[0][0] + 8, points[0][1]);
    for (let i = 1; i < points.length; i += 1) gfx.lineTo(points[i][0] + 8, points[i][1]);
    gfx.strokePath();
    gfx.lineStyle(2, 0x6a6050, 0.7);
    points.forEach(([x, y], i) => {
      if (i % 2 === 0) gfx.lineBetween(x - 14, y, x + 14, y);
    });
  },

  mineCart(scene, ctx, x, baseY) {
    groundShadow(scene, x, baseY, 48, 16, 0.28);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x6a5040);
    gfx.fillRoundedRect(x - 22, baseY - 32, 44, 28, 4);
    gfx.strokeRoundedRect(x - 22, baseY - 32, 44, 28, 4);
    gfx.fillStyle(0x3a3028, 1);
    gfx.fillCircle(x - 12, baseY - 4, 8);
    gfx.fillCircle(x + 12, baseY - 4, 8);
    gfx.fillStyle(0x5a8a3a, 0.8);
    gfx.fillEllipse(x, baseY - 28, 30, 12);
    if (ctx) ctx.solid(x - 18, baseY - 16, 36, 16);
  },

  crystalCluster(scene, x, baseY, color = 0x7eb8e8) {
    const gfx = g(scene, baseY);
    gfx.fillStyle(color, 0.9);
    gfx.fillTriangle(x, baseY - 48, x - 12, baseY - 8, x + 8, baseY - 8);
    gfx.fillTriangle(x + 14, baseY - 40, x + 4, baseY - 6, x + 22, baseY - 6);
    gfx.fillTriangle(x - 14, baseY - 36, x - 22, baseY - 4, x - 4, baseY - 4);
    gfx.fillStyle(0xffffff, 0.35);
    gfx.fillTriangle(x - 2, baseY - 44, x - 8, baseY - 16, x + 2, baseY - 16);
  },

  tunnelMouth(scene, ctx, x, baseY, w = 100, h = 80) {
    groundShadow(scene, x, baseY, w * 0.9, 20, 0.3);
    const gfx = g(scene, baseY);
    gfx.fillStyle(0x1a1810, 1);
    gfx.fillEllipse(x, baseY - h * 0.35, w, h);
    gfx.fillStyle(0x3a3028, 1);
    gfx.fillRect(x - w / 2 - 8, baseY - 20, w + 16, 24);
    gfx.lineStyle(3, 0x5a5040, 0.9);
    gfx.strokeEllipse(x, baseY - h * 0.35, w, h);
    if (ctx) {
      ctx.solid(x - w / 2 - 6, baseY - 18, 14, 18);
      ctx.solid(x + w / 2 - 8, baseY - 18, 14, 18);
    }
  },

  supportBeam(scene, ctx, x, baseY, h = 90) {
    groundShadow(scene, x, baseY, 24, 12, 0.22);
    const gfx = g(scene, baseY);
    outlined(gfx, 0x6d4a2a);
    gfx.fillRect(x - 6, baseY - h, 12, h);
    gfx.fillRect(x - 28, baseY - h - 6, 56, 12);
    gfx.strokeRect(x - 6, baseY - h, 12, h);
    if (ctx) ctx.solid(x - 8, baseY - 14, 16, 14);
  },

  orePile(scene, x, baseY) {
    const gfx = g(scene, baseY);
    gfx.fillStyle(0x4a4038, 1);
    gfx.fillEllipse(x, baseY - 6, 50, 22);
    gfx.fillStyle(0x6a8a3a, 0.7);
    gfx.fillCircle(x - 10, baseY - 14, 8);
    gfx.fillStyle(0x8a6a3a, 0.7);
    gfx.fillCircle(x + 8, baseY - 12, 7);
    gfx.fillStyle(0x5a7ab0, 0.6);
    gfx.fillCircle(x + 2, baseY - 18, 5);
  }
};
