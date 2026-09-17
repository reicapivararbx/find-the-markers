// Sistema reutilizável de interação com [E]: prompt aparece só quando perto.
import { GAMEPLAY } from "../config/game-config.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

export class Interactable {
  constructor(scene, { id, x, y, radius = GAMEPLAY.interactRadius, prompt, action, once = false, silent = false }) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.prompt = prompt;
    this.action = action;
    this.silent = silent;
    this.once = once;
    this.done = false;
    this.near = false;
  }

  update(px, py, interactJustDown, hud) {
    if (this.scene.transitioning || this.scene.inCutscene || hud.puzzleModalOpen) return false;
    if (this.done) {
      if (this.near) {
        this.near = false;
        hud.clearInteraction(this);
      }
      return false;
    }

    const distance = Math.hypot(px - this.x, py - this.y);
    const near = distance <= this.radius;

    if (near && (!this.near || !hud.currentInteraction)) {
      this.near = true;
      hud.setInteraction(this);
    } else if (!near && this.near) {
      this.near = false;
      hud.clearInteraction(this);
    } else if (near && typeof this.prompt === "function") {
      // prompt dinâmico (ex.: células restantes): reapresenta a cada frame perto
      hud.setInteraction(this);
    }

    if (near && interactJustDown) {
      if (!this.silent) Sfx.interact();
      if (this.once) this.done = true;
      hud.clearInteraction(this);
      bus.emit(Events.INTERACTION_COMPLETED, this.id);
      this.action();
      return true;
    }
    return false;
  }
}
