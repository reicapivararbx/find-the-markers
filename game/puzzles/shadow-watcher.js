import { SHADOW_WATCHER } from "../config/puzzle-config.js";
import { SECRET_NPC_SPRITES } from "../config/game-config.js";
import { Interactable } from "../entities/interactable.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";
import { PHYSICS } from "../config/game-config.js";

const INTRO = {
  lines: ["Você encontrou…", "Encontre-me três vezes."],
  toast: "O Observador sumiu nas sombras…"
};

const ENCOUNTERS = Object.freeze([
  { fragment: "23", lines: ["23", "Guarde isso."] },
  { fragment: "45", lines: ["45", "Ainda está acompanhando?"] },
  { fragment: "67", lines: ["67", "Agora você já viu tudo.", "Junte o que recebeu."] }
]);

const DONE_LINES = Object.freeze(["23. 45. 67", "Ela está esperando."]);

export class ShadowWatcherPuzzle {
  constructor(scene, { saveManager, hud, addUpdatable }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.addUpdatable = addUpdatable;
    this.busy = false;
    this.sprite = null;
    this.shadow = null;
    this.interactable = null;
    this.fragmentFx = null;

    const ps = saveManager.save.puzzleStates;
    this.fragments = Math.max(0, Math.min(3, Number(ps.shadowWatcherFragments) || 0));
    this.started = Boolean(ps.shadowWatcherStarted) || this.fragments > 0;
    this.solved = Boolean(ps.shadowWatcherSolved) || this.fragments >= 3;

    this.spawnAtCurrent();
  }

  currentIndex() {
    if (!this.started) return 0;
    if (this.solved) return 2;
    return Math.min(2, this.fragments);
  }

  spawnAtCurrent() {
    this.clearVisuals();
    const idx = this.currentIndex();
    const pos = SHADOW_WATCHER.positions[idx];
    const tex = SECRET_NPC_SPRITES.shadow_watcher;
    const depth = pos.y + PHYSICS.depthBias;

    this.shadow = this.scene.add
      .ellipse(pos.x, pos.y - 2, 40, 14, 0x1a1a22, 0.3)
      .setDepth(pos.y - 2);

    if (this.scene.textures.exists(tex.textureKey)) {
      this.sprite = this.scene.add
        .image(pos.x, pos.y, tex.textureKey)
        .setOrigin(0.5, 1)
        .setDisplaySize((tex.displayHeight * 0.72), tex.displayHeight)
        .setDepth(depth)
        .setTint(0xcc8899);
    } else {
      this.sprite = this.scene.add
        .rectangle(pos.x, pos.y - 50, 48, 100, 0x3a1a22, 0.95)
        .setDepth(depth);
    }

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.75, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    const prompt = this.solved
      ? "[E] O Observador"
      : this.started
        ? `[E] O Observador (${this.fragments}/3)`
        : "[E] Falar com O Observador";

    this.interactable = new Interactable(this.scene, {
      id: "shadow_watcher",
      x: pos.x,
      y: pos.y,
      radius: 110,
      prompt,
      action: () => this.onInteract()
    });
    this.addUpdatable(this.interactable);
  }

  onInteract() {
    if (this.busy) return;
    if (this.solved) {
      this.hud.toast(DONE_LINES.join(" — "), { icon: "👁", duration: 2800 });
      return;
    }
    if (!this.started) {
      this.runIntro();
      return;
    }
    this.runEncounter(this.fragments);
  }

  runIntro() {
    this.busy = true;
    bus.emit(Events.PUZZLE_STARTED, "shadowWatcher");
    this.hud.toast(INTRO.lines[0], { icon: "👁", duration: 1600 });
    this.scene.time.delayedCall(1500, () => {
      this.hud.toast(INTRO.lines[1], { icon: "👁", duration: 2200 });
    });
    this.scene.time.delayedCall(2800, () => {
      this.sm.save.puzzleStates.shadowWatcherStarted = true;
      this.sm.persist();
      this.started = true;
      this.vanishThenRespawn(() => {
        this.busy = false;
        this.hud.toast(INTRO.toast, { icon: "👁", duration: 2000 });
      });
    });
  }

  runEncounter(index) {
    this.busy = true;
    const enc = ENCOUNTERS[index];
    if (!enc) {
      this.busy = false;
      return;
    }

    this.showFragment(enc.fragment);
    this.hud.toast(enc.lines.join(" "), { icon: "👁", duration: 2400 });
    bus.emit(Events.PUZZLE_PROGRESS, {
      key: "shadowWatcher",
      fragment: enc.fragment,
      index: index + 1
    });

    this.scene.time.delayedCall(SHADOW_WATCHER.displayMs, () => {
      const next = this.sm.setShadowWatcherFragments(index + 1);
      this.fragments = next;
      this.solved = next >= 3;
      this.started = true;
      if (this.solved) {
        this.busy = false;
        this.spawnAtCurrent();
        this.hud.toast("O Observador falou em pares…", { icon: "👁", duration: 2600 });
        Sfx.puzzleSolved();
        return;
      }
      this.vanishThenRespawn(() => {
        this.busy = false;
      });
    });
  }

  showFragment(text) {
    const pos = SHADOW_WATCHER.positions[this.currentIndex()];
    if (this.fragmentFx) this.fragmentFx.destroy();
    this.fragmentFx = this.scene.add
      .text(pos.x, pos.y - 140, text, {
        fontFamily: "monospace",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ff4d6d",
        stroke: "#1a0a0e",
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(9000)
      .setAlpha(0);

    const flash = this.scene.add
      .rectangle(pos.x, pos.y - 60, 90, 120, 0xff2244, 0.25)
      .setDepth(pos.y + 20);
    Sfx.glitch?.();
    this.scene.tweens.add({
      targets: this.fragmentFx,
      alpha: 1,
      y: pos.y - 160,
      duration: 280,
      yoyo: true,
      hold: SHADOW_WATCHER.displayMs - 600,
      onComplete: () => {
        this.fragmentFx?.destroy();
        this.fragmentFx = null;
      }
    });
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });
  }

  vanishThenRespawn(done) {
    Sfx.glitch?.();
    const targets = [this.sprite, this.shadow].filter(Boolean);
    this.scene.tweens.add({
      targets,
      alpha: 0,
      duration: 320,
      onComplete: () => {
        if (this.interactable) this.interactable.done = true;
        this.spawnAtCurrent();
        if (this.sprite) this.sprite.setAlpha(0);
        if (this.shadow) this.shadow.setAlpha(0);
        this.scene.tweens.add({
          targets: [this.sprite, this.shadow].filter(Boolean),
          alpha: 1,
          duration: 420,
          onComplete: () => done?.()
        });
      }
    });
  }

  clearVisuals() {
    if (this.interactable) this.interactable.done = true;
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.fragmentFx?.destroy();
    this.sprite = null;
    this.shadow = null;
    this.fragmentFx = null;
    this.interactable = null;
  }

  update() {}

  destroy() {
    this.clearVisuals();
  }
}
