// Marker Nervoso — reage à proximidade e ao [E]: três conversas curtas
// acalmam. Ao se acalmar, troca de textura (irritado -> calmo) e libera a coleta.
import { Interactable } from "../entities/interactable.js";
import { Sfx } from "../core/audio-manager.js";

const LINES = [
  "O quê?! Eu não estava dormindo!",
  "Hmm… tudo bem, talvez eu esteja um pouco tenso.",
  "Ok, ok… obrigado por conversar. Pode me colecionar."
];

export class GrumpyNpc {
  constructor(ctx) {
    this.ctx = ctx;
    this.scene = ctx.scene;
    this.sm = ctx.sm;
    this.hud = ctx.hud;
    this.stage = 0;
    this.solved = Boolean(this.sm.save.puzzleStates.grumpyCalmed);

    this.interactable = new Interactable(this.scene, {
      id: "grumpy_talk",
      x: 820,
      y: 640,
      radius: 110,
      prompt: () => (this.solved ? "Marker Nervoso (calmo)" : "[E] Falar com o Marker Nervoso"),
      action: () => this._talk()
    });
    ctx.addUpdatable(this.interactable);

    // rosto acompanha a distância: longe = irritado, perto = encara o player
    this._faceSwap = false;
  }

  _talk() {
    if (this.solved) return;
    this.hud.toast(LINES[this.stage], { icon: "😾", duration: 2400 });
    Sfx.tick(0.8 + this.stage * 0.3);
    this.stage += 1;
    if (this.stage >= LINES.length) {
      this.solved = true;
      const marker = this.ctx.getMarker("grumpy_marker");
      marker?.swapStyle?.("grumpy_calm");
      this.sm.solvePuzzle("grumpyCalmed");
      Sfx.puzzleSolved();
    }
  }

  update(px, py) {
    if (this.solved) return;
    const marker = this.ctx.getMarker("grumpy_marker");
    if (!marker?.sprite || marker.collected) return;
    // encara o player quando perto; treme quando muito perto
    const d = Math.hypot(px - 820, py - 640);
    if (d < 240) marker.sprite.setFlipX(px < 820);
    if (d < 120 && this.scene.time.now > (this._nextShake || 0)) {
      this._nextShake = this.scene.time.now + 700;
      this.scene.tweens.add({
        targets: marker.sprite,
        x: 820 + (Math.random() > 0.5 ? 2 : -2),
        duration: 60,
        yoyo: true,
        repeat: 1,
        onComplete: () => marker.sprite.setX(820)
      });
    }
  }

  destroy() {}
}
