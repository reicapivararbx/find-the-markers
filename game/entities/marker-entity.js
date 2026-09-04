// Marker coletável com rosto, braços e pernas (desenho do PDF).
// Top-down 2.5D: sombra no chão + depth ≈ y para oclusão.
// Suporta modos: touch (padrão), hidden, quest, puzzle — ver marker-registry.
import { GAMEPLAY, PHYSICS } from "../config/game-config.js";
import { isCollectible, lockedReason } from "../config/marker-registry.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";
import { ensureMarkerTexture } from "../assets/textures.js";

const STAND_OFFSET = 40; // centro visual do sprite acima dos pés

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
      def.mode === "hidden" && !saveManager.save.puzzleStates.creditsBoxesSolved;
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

      if (def.style === "glitch") {
        this.scene.tweens.add({
          targets: this.sprite,
          y: def.y - 8,
          angle: { from: -3, to: 3 },
          duration: 900,
          ease: "Sine.inOut",
          yoyo: true,
          repeat: -1
        });
      } else {
        this.scene.tweens.add({
          targets: this.sprite,
          y: def.y - 5,
          duration: 950,
          delay: (def.x * 7) % 400,
          ease: "Sine.inOut",
          yoyo: true,
          repeat: -1
        });
      }
    }

    if (this.hidden) this.sprite.setVisible(false);
    else if (def.mode === "puzzle") {
      // marker do medidor: visível, mas bloqueado até resolver o puzzle
      this.sprite.setAlpha(0.55);
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

    Sfx.collect();
    const bx = this.def.x;
    const by = this.def.y - 24;
    this.spawnBurst(bx, by);
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
    if (this.zone) {
      this.zone.body.enable = false;
      this.scene.time.delayedCall(50, () => this.zone.destroy());
    }
  }

  // Revela markers escondidos (caixas dos créditos) ou libera os de puzzle.
  reveal() {
    if (!this.hidden && this.def.mode !== "puzzle") return;
    this.hidden = false;
    if (this.shadow) this.shadow.setVisible(true);
    if (!this.sprite.visible) {
      this.sprite.setVisible(true);
      this.sprite.setScale(0.2);
      this.scene.tweens.add({ targets: this.sprite, scale: 1, duration: 420, ease: "Back.out" });
      this.spawnBurst(this.def.x, this.def.y - 24);
    }
    // brilho de "pode me coletar"
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
    if (this.zone) this.zone.destroy();
  }
}
