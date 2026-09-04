// Marker coletável com rosto, braços e pernas (desenho do PDF).
// Top-down 2.5D: sombra no chão + depth ≈ y para oclusão.
// Suporta modos: touch (padrão), hidden, quest, puzzle — ver marker-registry.
import { GAMEPLAY, PHYSICS } from "../config/game-config.js";
import { isCollectible, lockedReason } from "../config/marker-registry.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";
import { ensureMarkerTexture } from "../assets/textures.js";

const STAND_OFFSET = 40; // centro visual do sprite acima dos pés

function idleTweenFor(style, def) {
  const y = def.y;
  if (style === "glitch" || style === "null_void") {
    return { y: y - 8, angle: { from: -4, to: 4 }, duration: 720, delay: 0 };
  }
  if (style === "neon_emit" || style === "neon" || style === "lantern" || style === "foghorn") {
    return { y: y - 6, alpha: { from: 0.82, to: 1 }, duration: 700 };
  }
  if (style === "ice" || style === "crystal" || style === "ore") {
    return { y: y - 4, angle: { from: -2, to: 2 }, duration: 1400 };
  }
  if (style === "sewer" || style === "pond" || style === "tide" || style === "buoy") {
    return { y: y - 3, scaleX: { from: 0.97, to: 1.03 }, duration: 1100 };
  }
  if (style === "bee" || style === "bloom" || style === "petal" || style === "sail") {
    return { y: y - 10, angle: { from: -6, to: 6 }, duration: 800 };
  }
  if (style === "vine" || style === "moss" || style === "root" || style === "rope" || style === "net") {
    return { y: y - 4, angle: { from: -1.5, to: 1.5 }, duration: 1300 };
  }
  if (style === "cog" || style === "gear" || style === "bolt" || style === "wrench") {
    return { y: y - 3, angle: { from: -8, to: 8 }, duration: 1600 };
  }
  if (style === "smokestack" || style === "oil" || style === "pipe" || style === "rust") {
    return { y: y - 4, alpha: { from: 0.88, to: 1 }, duration: 1200 };
  }
  if (style === "cart" || style === "rail" || style === "conveyor") {
    return { y: y - 2, x: def.x + 4, duration: 900 };
  }
  if (style === "dynamite" || style === "coal" || style === "shaft") {
    return { y: y - 5, scaleY: { from: 0.96, to: 1.04 }, duration: 1000 };
  }
  if (style === "plasma" || style === "laser" || style === "circuit" || style === "scope") {
    return { y: y - 6, alpha: { from: 0.8, to: 1 }, duration: 750 };
  }
  if (style === "beaker" || style === "petri" || style === "testtube" || style === "sample") {
    return { y: y - 4, scaleX: { from: 0.97, to: 1.03 }, duration: 1000 };
  }
  if (style === "clone" || style === "microscope") {
    return { y: y - 5, angle: { from: -3, to: 3 }, duration: 1200 };
  }
  if (style === "sand" || style === "relic" || style === "mosaic" || style === "glyph") {
    return { y: y - 3, angle: { from: -1.5, to: 1.5 }, duration: 1400 };
  }
  if (style === "obelisk" || style === "column" || style === "arch" || style === "statue" || style === "idol") {
    return { y: y - 4, duration: 1300 };
  }
  if (style === "scroll") {
    return { y: y - 5, angle: { from: -2, to: 2 }, duration: 1100 };
  }
  if (style === "frost" || style === "glacier" || style === "avalanche" || style === "summit") {
    return { y: y - 4, angle: { from: -2, to: 2 }, duration: 1500 };
  }
  if (style === "wind" || style === "flag" || style === "yeti") {
    return { y: y - 8, angle: { from: -5, to: 5 }, duration: 900 };
  }
  if (style === "cliff" || style === "zenith") {
    return { y: y - 5, duration: 1200 };
  }
  if (style === "goldbar" || style === "safe" || style === "lockbox" || style === "vaultdoor") {
    return { y: y - 3, alpha: { from: 0.9, to: 1 }, duration: 1100 };
  }
  if (style === "barcode" || style === "cipher" || style === "keycard" || style === "wire" || style === "ledger") {
    return { y: y - 4, duration: 1000 };
  }
  if (style === "sealstamp") {
    return { y: y - 5, scaleY: { from: 0.96, to: 1.04 }, duration: 900 };
  }
  if (style === "banner" || style === "banner_royal" || style === "herald") {
    return { y: y - 7, angle: { from: -4, to: 4 }, duration: 850 };
  }
  if (style === "moat" || style === "drawbridge") {
    return { y: y - 3, scaleX: { from: 0.97, to: 1.03 }, duration: 1200 };
  }
  if (style === "guard" || style === "knight" || style === "shield" || style === "portcullis") {
    return { y: y - 4, duration: 1100 };
  }
  if (style === "rampart" || style === "watchtower" || style === "barricade" || style === "spire") {
    return { y: y - 3, duration: 1300 };
  }
  if (
    style === "crown" ||
    style === "throne" ||
    style === "scepter" ||
    style === "oracle" ||
    style === "legacy" ||
    style === "finale" ||
    style === "champion"
  ) {
    return { y: y - 6, alpha: { from: 0.88, to: 1 }, duration: 1000 };
  }
  if (style === "miku") {
    return { y: y - 7, duration: 1100 };
  }
  if (style === "orchid" || style === "bloom") {
    return { y: y - 9, angle: { from: -5, to: 5 }, duration: 850 };
  }
  if (style === "beacon" || style === "steam" || style === "packet") {
    return { y: y - 5, alpha: { from: 0.85, to: 1 }, duration: 800 };
  }
  if (style === "prism" || style === "starchart") {
    return { y: y - 6, angle: { from: -3, to: 3 }, duration: 1200 };
  }
  if (style === "mummy" || style === "combination" || style === "blade") {
    return { y: y - 4, duration: 1100 };
  }
  if (style === "hiddencrown" || style === "yellowroom" || style === "debug") {
    return { y: y - 6, alpha: { from: 0.88, to: 1 }, duration: 950 };
  }
  if (style === "menu_champion" || style === "champion") {
    return { y: y - 7, alpha: { from: 0.9, to: 1 }, duration: 1100 };
  }
  return { y: y - 5, duration: 950 };
}

function attachShadow(scene, x, baseY) {
  return scene.add
    .ellipse(x, baseY - 2, 34, 14, 0x1a1a22, 0.26)
    .setDepth(baseY - 2);
}

export class MarkerEntity {
  constructor(scene, def, saveManager, hud) {
    this.scene = scene;
    this.def = def;
    this.sm = saveManager;
    this.hud = hud;
    this.collected = false;
    this.destroyed = false;
    this.hidden =
      (def.mode === "hidden" && !saveManager.save.puzzleStates.creditsBoxesSolved) ||
      (def.mode === "miku" &&
        !saveManager.save.mikuMarkerUnlocked &&
        !saveManager.save.puzzleStates.mikuPuzzleSolved) ||
      (def.mode === "menu_champion" && !saveManager.save.menuSecrets?.championSolved);
    this.blockFeedbackAt = 0;

    const key = ensureMarkerTexture(scene, def.difficulty, def.style);
    const baseY = def.y;
    const depth = baseY + PHYSICS.depthBias;

    this.shadow = attachShadow(scene, def.x, baseY);
    if (this.hidden) this.shadow.setVisible(false);

    if (def.style === "pendulum") {
      // Pendurado por uma corda, balançando (desenho da página 9).
      this.container = scene.add.container(def.x, def.y - 90).setDepth(depth);
      const rope = scene.add.graphics();
      rope.lineStyle(3, 0x6d5340, 1);
      rope.lineBetween(0, 0, 0, 86);
      this.sprite = scene.add.image(0, 90 + STAND_OFFSET - 40, key);
      this.container.add([rope, this.sprite]);
      this.zone = scene.add.zone(def.x, def.y, 110, 150);
      this.scene.physics.add.existing(this.zone, true);
      this.scene.tweens.add({
        targets: this.container,
        angle: 26,
        duration: 1400,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1
      });
    } else {
      this.sprite = scene.add.image(def.x, def.y, key).setOrigin(0.5, 1).setDepth(depth);
      this.zone = scene.add.zone(
        def.x,
        def.y - 20,
        GAMEPLAY.collectRadius * 2,
        GAMEPLAY.collectRadius * 2
      );
      this.scene.physics.add.existing(this.zone, true);

      const idle = idleTweenFor(def.style, def);
      this.scene.tweens.add({
        targets: this.sprite,
        ...idle,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: idle.delay ?? (def.x * 7) % 400
      });
    }

    if (this.hidden) this.sprite.setVisible(false);
    else if (def.mode === "puzzle") {
      this.sprite.setAlpha(0.55);
    } else if (def.mode === "slot") {
      this.sprite.setVisible(false);
      if (this.shadow) this.shadow.setVisible(false);
    }

    if ((def.style === "menu_champion" || def.style === "champion") && !this.hidden) {
      const aura = scene.add.circle(def.x, def.y - 6, 40, 0xf2c94c, 0.14).setDepth(depth - 2);
      scene.tweens.add({
        targets: aura,
        alpha: { from: 0.1, to: 0.28 },
        scale: { from: 0.92, to: 1.15 },
        duration: 1400,
        yoyo: true,
        repeat: -1
      });
      this.aura = aura;
    }

    if (def.style === "miku" && !this.hidden) {
      const aura = scene.add.circle(def.x, def.y - 4, 36, 0x39c5bb, 0.12).setDepth(depth - 2);
      scene.tweens.add({
        targets: aura,
        alpha: { from: 0.08, to: 0.22 },
        scale: { from: 0.95, to: 1.12 },
        duration: 1100,
        yoyo: true,
        repeat: -1
      });
      this.aura = aura;
      scene.time.addEvent({
        delay: 1800,
        loop: true,
        callback: () => {
          if (this.collected || this.destroyed || this.hidden) return;
          const note = scene.add
            .text(def.x + (Math.random() * 40 - 20), def.y - 50, Math.random() > 0.5 ? "♪" : "♫", {
              fontFamily: "sans-serif",
              fontSize: "14px",
              color: "#39c5bb"
            })
            .setAlpha(0.75)
            .setDepth(depth + 20);
          scene.tweens.add({
            targets: note,
            y: note.y - 40,
            alpha: 0,
            duration: 1200,
            onComplete: () => note.destroy()
          });
        }
      });
    }

    if (def.style === "demon") {
      // asinhas do marker dos ovos (desenho da página 7)
      const wings = scene.add.graphics().setDepth(depth - 1);
      wings.fillStyle(0xb0654a, 0.95);
      wings.fillTriangle(-30, -6, -6, -14, -6, 8);
      wings.fillTriangle(30, -6, 6, -14, 6, 8);
      this.wings = wings;
      this.wingFollow = scene.add.container(def.x, def.y - 28, [wings]).setDepth(depth - 1);
      this.scene.tweens.add({
        targets: wings,
        scaleY: 0.55,
        duration: 260,
        yoyo: true,
        repeat: -1
      });
      this.scene.tweens.add({
        targets: this.wingFollow,
        y: def.y - 34,
        duration: 950,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }
  }

  // Chamado pelo RoomScene quando o player encosta na zona.
  tryCollect() {
    if (this.collected || this.destroyed || this.hidden) return false;
    if (!isCollectible(this.def, this.sm.save)) {
      if (this.hud && !this.blockFeedbackAt) {
        this.hud.toast(lockedReason(this.def, this.sm.save), { icon: "🔒" });
        Sfx.gateBlocked();
        this.blockFeedbackAt = this.scene.time.now + 1600;
        this.scene.time.delayedCall(1600, () => (this.blockFeedbackAt = 0));
      }
      return false;
    }
    this.collect();
    return true;
  }

  collect() {
    if (this.collected || this.destroyed) return;
    this.collected = true;

    if (this.def.style === "miku") Sfx.mikuCollect();
    else Sfx.collect();
    const bx = this.def.x;
    const by = this.def.y - 24;
    this.spawnBurst(bx, by);
    if (this.def.style === "miku") {
      for (let i = 0; i < 8; i += 1) {
        const note = this.scene.add
          .text(bx, by, i % 2 ? "♪" : "♫", {
            fontFamily: "sans-serif",
            fontSize: "16px",
            color: "#39c5bb"
          })
          .setDepth(by + 50);
        const angle = (Math.PI * 2 * i) / 8;
        this.scene.tweens.add({
          targets: note,
          x: bx + Math.cos(angle) * 60,
          y: by + Math.sin(angle) * 40 - 20,
          alpha: 0,
          duration: 700,
          onComplete: () => note.destroy()
        });
      }
      this.hud.toast("🎤 Hatsune Miku Marker encontrado!", { icon: "♪", duration: 3200 });
    } else if (this.def.mode === "menu_champion") {
      this.hud.toast("🏆 Menu Champion Marker encontrado! Difficulty: Champion", {
        icon: "♛",
        duration: 3200
      });
    }
    this.sm.collectMarker(this.def.id);
    this.hud.notifyMarker(this.def);

    const targets = this.container || this.sprite;
    this.scene.tweens.add({
      targets,
      alpha: 0,
      scaleX: 1.7,
      scaleY: 1.7,
      angle: 14,
      duration: 320,
      ease: "Back.in",
      onComplete: () => this.destroy()
    });
    if (this.shadow) {
      this.scene.tweens.add({ targets: this.shadow, alpha: 0, duration: 280 });
    }
    if (this.aura) {
      this.scene.tweens.add({ targets: this.aura, alpha: 0, duration: 280 });
    }
    if (this.zone) {
      this.zone.body.enable = false;
      this.scene.time.delayedCall(50, () => this.zone.destroy());
    }
  }

  reveal() {
    if (!this.hidden && this.def.mode !== "puzzle" && this.def.mode !== "miku") return;
    this.hidden = false;
    if (this.shadow) this.shadow.setVisible(true);
    if (this.aura) this.aura.setVisible(true);
    if (!this.sprite.visible) {
      this.sprite.setVisible(true);
      this.sprite.setScale(0.2);
      this.scene.tweens.add({ targets: this.sprite, scale: 1, duration: 420, ease: "Back.out" });
      this.spawnBurst(this.def.x, this.def.y - 24);
    }
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
  }

  spawnBurst(x, y) {
    for (let i = 0; i < 10; i += 1) {
      const dot = this.scene.add.circle(x, y, 4, 0xffffff, 0.95).setDepth(y + 40);
      const angle = (Math.PI * 2 * i) / 10;
      this.scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 52,
        y: y + Math.sin(angle) * 52 - 12,
        alpha: 0,
        scale: 0.3,
        duration: 480,
        ease: "Cubic.out",
        onComplete: () => dot.destroy()
      });
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.container) this.container.destroy();
    if (this.wingFollow) this.wingFollow.destroy();
    if (this.sprite) this.sprite.destroy();
    if (this.shadow) this.shadow.destroy();
    if (this.aura) this.aura.destroy();
    if (this.zone) this.zone.destroy();
  }
}
