// CAIXAS DA ÁREA DE CRÉDITOS (página 10 do PDF).
// Não são decoração: [E] perto -> caixa abre (estado salvo).
// As duas abertas -> marker "This is not a marker" é revelado.
import { CREDITS_BOXES } from "../config/puzzle-config.js";
import { Interactable } from "../entities/interactable.js";
import { Sfx } from "../core/audio-manager.js";

const BOX_W = 92;
const BOX_H = 56;

export class BoxesPuzzle {
  constructor(scene, { saveManager, hud, onAllOpened }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.onAllOpened = onAllOpened;
    this.interactables = [];

    CREDITS_BOXES.forEach((box) => {
      const opened = saveManager.save.openedBoxes.includes(box.id);
      this.drawBox(box, opened);

      const interactable = new Interactable(scene, {
        id: `box_${box.id}`,
        x: box.x,
        y: box.y - 20,
        radius: 130,
        prompt: opened ? "Caixa aberta" : "[E] Abrir caixa",
        once: opened,
        action: () => this.open(box)
      });
      this.interactables.push(interactable);
    });
  }

  drawBox(box, opened) {
    const baseY = box.y; // base da caixa encosta no chão
    const base = this.scene.add.graphics().setDepth(13);
    base.fillStyle(0xc99a5f, 1);
    base.fillRoundedRect(box.x - BOX_W / 2, baseY - BOX_H, BOX_W, BOX_H, 4);
    base.lineStyle(3.5, 0x8a6238, 1);
    base.strokeRoundedRect(box.x - BOX_W / 2, baseY - BOX_H, BOX_W, BOX_H, 4);
    base.lineStyle(2.5, 0x8a6238, 0.7);
    base.lineBetween(box.x - BOX_W / 2, baseY - BOX_H * 0.4, box.x + BOX_W / 2, baseY - BOX_H * 0.4);

    if (opened) {
      // tampa aberta encostada atrás
      const lid = this.scene.add.graphics().setDepth(12);
      lid.fillStyle(0xdcb476, 1);
      lid.fillRoundedRect(-BOX_W / 2, -10, BOX_W, 12, 3);
      lid.lineStyle(3.5, 0x8a6238, 1);
      lid.strokeRoundedRect(-BOX_W / 2, -10, BOX_W, 12, 3);
      const hinge = this.scene.add.container(box.x - BOX_W / 2, baseY - BOX_H, [lid]).setDepth(12);
      hinge.setAngle(-78);
    } else {
      // tampa fechada (vira na dobradiça esquerda ao abrir)
      const lid = this.scene.add.graphics();
      lid.fillStyle(0xdcb476, 1);
      lid.fillRoundedRect(0, -12, BOX_W, 13, 3);
      lid.lineStyle(3.5, 0x8a6238, 1);
      lid.strokeRoundedRect(0, -12, BOX_W, 13, 3);
      const hinge = this.scene.add.container(box.x - BOX_W / 2, baseY - BOX_H, [lid]).setDepth(14);
      this.scene.tweens.add({
        targets: hinge,
        angle: -78,
        duration: 420,
        delay: 120,
        ease: "Back.out"
      });
    }
  }

  open(box) {
    if (this.sm.save.openedBoxes.includes(box.id)) return;
    Sfx.box();
    this.drawBox(box, false); // desenha tampa fechada e anima a abertura
    this.sm.openBox(box.id);
    const opened = this.sm.save.openedBoxes.length;

    if (opened >= CREDITS_BOXES.length) {
      this.hud.toast("Algo saiu de dentro das caixas!", { icon: "✨", duration: 2400 });
      if (this.onAllOpened) this.scene.time.delayedCall(320, this.onAllOpened);
    } else {
      this.hud.toast(`Caixa aberta (${opened}/2)`, { icon: "📦", duration: 1800 });
    }
  }

  update(px, py, interactJustDown, hud) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const interactable of this.interactables) {
      const distance = Math.hypot(px - interactable.x, py - interactable.y);
      if (distance <= interactable.radius && distance < nearestDistance) {
        nearest = interactable;
        nearestDistance = distance;
      }
    }
    for (const interactable of this.interactables) {
      if (interactable === nearest) {
        interactable.update(px, py, interactJustDown, hud);
      } else if (interactable.near) {
        interactable.near = false;
        hud.clearInteraction(interactable);
      }
    }
  }

  destroy() {
    this.interactables = [];
  }
}
