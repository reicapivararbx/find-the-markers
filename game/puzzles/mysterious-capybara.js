import { CAPYBARA_CODE, SECRET_POOL } from "../config/puzzle-config.js";
import { SECRET_NPC_SPRITES, PHYSICS } from "../config/game-config.js";
import { Interactable } from "../entities/interactable.js";
import { CodeKeypad } from "./code-keypad.js";
import { MarkerEntity } from "../entities/marker-entity.js";
import { MARKER_BY_ID } from "../config/marker-registry.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

export class MysteriousCapybara {
  constructor(scene, { saveManager, hud, addUpdatable, getMarker }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.addUpdatable = addUpdatable;
    this.getMarker = getMarker;
    this.keypadOpen = false;
    this.pos = SECRET_POOL.capybara;
    this.ps = () => this.sm.save.puzzleStates;

    this.buildVisual();
    this.bindInteract();
  }

  buildVisual() {
    const { x, y } = this.pos;
    const tex = SECRET_NPC_SPRITES.mysterious_capybara;
    const depth = y + PHYSICS.depthBias;

    this.shadow = this.scene.add
      .ellipse(x, y - 2, 52, 16, 0x1a1a22, 0.28)
      .setDepth(y - 2);

    if (this.scene.textures.exists(tex.textureKey)) {
      this.sprite = this.scene.add
        .image(x, y, tex.textureKey)
        .setOrigin(0.5, 1)
        .setDisplaySize(tex.displayHeight * 0.95, tex.displayHeight)
        .setDepth(depth);
    } else {
      this.sprite = this.scene.add
        .ellipse(x, y - 28, 70, 48, 0x8a6238, 1)
        .setDepth(depth);
    }

    this.scene.tweens.add({
      targets: this.sprite,
      y: y - 4,
      duration: 1400,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1
    });

    if (this.ps().capybaraCodeMarkerUnlocked && !this.sm.hasCollected("capybara_code_marker")) {
      this.ensureMarkerVisible();
    }
  }

  bindInteract() {
    const solved = this.ps().mysteriousCapybaraSolved;
    this.interactable = new Interactable(this.scene, {
      id: "mysterious_capybara",
      x: this.pos.x,
      y: this.pos.y,
      radius: 120,
      prompt: solved
        ? "[E] Capivara Misteriosa"
        : "[E] Falar com Capivara Misteriosa",
      action: () => this.onTalk()
    });
    this.addUpdatable(this.interactable);
  }

  onTalk() {
    if (this.keypadOpen) return;
    const ps = this.ps();
    if (ps.mysteriousCapybaraSolved) {
      this.hud.toast(
        ps.capybaraCodeMarkerCollected
          ? "Você já entendeu o código."
          : "Pode ficar com isto…",
        { icon: "🦫", duration: 2200 }
      );
      return;
    }
    this.hud.toast("Hm… Você tem um código para mim?", { icon: "🦫", duration: 2000 });
    this.scene.time.delayedCall(600, () => this.openKeypad());
  }

  openKeypad() {
    if (this.keypadOpen) return;
    this.keypadOpen = true;
    bus.emit(Events.PUZZLE_STARTED, "mysteriousCapybara");
    this.keypad = new CodeKeypad(this.scene, {
      expected: CAPYBARA_CODE,
      length: 6,
      title: "Código da Capivara",
      onSubmit: (ok) => {
        this.keypadOpen = false;
        this.keypad = null;
        if (!ok) {
          this.hud.toast("Não. Pergunte ao homem das sombras.", {
            icon: "🦫",
            duration: 2600
          });
          return;
        }
        this.onCorrectCode();
      },
      onCancel: () => {
        this.keypadOpen = false;
        this.keypad = null;
      }
    });
  }

  onCorrectCode() {
    this.busy = true;
    this.hud.toast("…", { icon: "🦫", duration: 500 });
    this.scene.time.delayedCall(500, () => {
      this.hud.toast("Então você entendeu. Pode ficar com isto.", {
        icon: "🦫",
        duration: 2800
      });
      this.sm.unlockCapybaraCodeMarker();
      bus.emit(Events.PUZZLE_SOLVED, "mysteriousCapybaraSolved");
      Sfx.unlock();
      this.hatShine(() => {
        this.spawnMarkerPhysical();
        this.busy = false;
        if (this.interactable) {
          this.interactable.prompt = "[E] Capivara Misteriosa";
        }
      });
    });
  }

  hatShine(done) {
    const { x, y } = this.pos;
    const glow = this.scene.add.circle(x, y - 70, 28, 0xf2c94c, 0.55).setDepth(y + 40);
    this.scene.tweens.add({
      targets: glow,
      scale: 2.2,
      alpha: 0,
      duration: 700,
      onComplete: () => {
        glow.destroy();
        done?.();
      }
    });
    if (this.sprite?.setTint) {
      this.sprite.setTint(0xffe08a);
      this.scene.time.delayedCall(500, () => this.sprite.clearTint?.());
    }
  }

  spawnMarkerPhysical() {
    const def = MARKER_BY_ID.capybara_code_marker;
    if (!def) return;
    if (this.sm.hasCollected(def.id)) return;

    let entity = this.getMarker?.(def.id);
    if (!entity) {
      entity = new MarkerEntity(this.scene, def, this.sm, this.hud);
      entity.hidden = false;
      entity.sprite?.setVisible(true);
      entity.shadow?.setVisible(true);
      if (this.scene.markerEntities) this.scene.markerEntities.set(def.id, entity);
      if (this.scene.markers) this.scene.markers.push(entity);
      this.scene.time.delayedCall(0, () => {
        if (this.scene.player?.sprite && entity.zone) {
          this.scene.physics.add.overlap(this.scene.player.sprite, entity.zone, () =>
            entity.tryCollect()
          );
        }
      });
    } else {
      entity.reveal?.();
    }
    bus.emit(Events.MARKER_UNLOCKED, def.id);
    Sfx.reveal();
  }

  ensureMarkerVisible() {
    const existing = this.getMarker?.("capybara_code_marker");
    if (existing) {
      existing.reveal?.();
      return;
    }
    this.spawnMarkerPhysical();
  }

  update() {}

  destroy() {
    this.keypad?.close();
    this.interactable && (this.interactable.done = true);
    this.sprite?.destroy();
    this.shadow?.destroy();
  }
}
