// Mech Marker — sequência de ativação: encontre os 2 componentes (quest),
// depois [E] no terminal acorda a máquina adormecida (sparks + olhos acesos).
import { Interactable } from "../entities/interactable.js";
import { Sfx } from "../core/audio-manager.js";

export class MechTerminal {
  constructor(ctx) {
    this.ctx = ctx;
    this.scene = ctx.scene;
    this.sm = ctx.sm;
    this.hud = ctx.hud;
    this.solved = Boolean(this.sm.save.puzzleStates.mechSolved);

    this._drawTerminal();
    this.interactable = new Interactable(this.scene, {
      id: "mech_terminal",
      x: 830,
      y: 660,
      radius: 110,
      prompt: () => this._prompt(),
      action: () => this._activate()
    });
    ctx.addUpdatable(this.interactable);
  }

  _drawTerminal() {
    const g = this.scene.add.graphics().setDepth(655);
    g.fillStyle(0x3a3a48, 1);
    g.fillRoundedRect(816, 636, 28, 22, 4);
    g.fillStyle(this.solved ? 0x62c462 : 0x56ccf2, 1);
    g.fillRect(820, 640, 20, 10);
    g.lineStyle(2.5, 0x33333d, 0.85);
    g.strokeRoundedRect(816, 636, 28, 22, 4);
  }

  _prompt() {
    if (this.solved) return "Máquina ativada";
    const { found, target } = this.sm.questProgress("quest_mech_components");
    return found >= target ? "[E] Ativar a máquina" : `Faltam ${target - found} componentes`;
  }

  _activate() {
    if (this.solved) return;
    const { found, target } = this.sm.questProgress("quest_mech_components");
    if (found < target) {
      this.hud.toast(`Faltam ${target - found} componentes da máquina.`, { icon: "⚙️", duration: 2200 });
      Sfx.gateBlocked();
      return;
    }
    this.solved = true;
    Sfx.puzzleSolved();
    this.hud.toast("A máquina desperta e estica os braços.", { icon: "⚙️", duration: 2800 });
    const marker = this.ctx.getMarker("mech_marker");
    if (marker?.sprite) {
      this.scene.tweens.add({
        targets: marker.sprite,
        scaleY: 1.06,
        duration: 220,
        yoyo: true,
        repeat: 2,
        ease: "Sine.inOut"
      });
    }
    for (let i = 0; i < 8; i += 1) {
      const spark = this.scene.add.circle(830, 650, 3, 0xffe08a, 0.9).setDepth(680);
      this.scene.tweens.add({
        targets: spark,
        x: 830 + (Math.random() * 90 - 45),
        y: 650 + (Math.random() * -50),
        alpha: 0,
        duration: 520,
        onComplete: () => spark.destroy()
      });
    }
    this.sm.solvePuzzle("mechSolved");
  }

  update() {}
  destroy() {}
}
