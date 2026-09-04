import { PHYSICS } from "../config/game-config.js";

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.virtual = {
      left: false,
      right: false,
      up: false,
      down: false,
      interact: false
    };

    const keys = scene.input.keyboard.addKeys({
      left: "A",
      right: "D",
      up: "W",
      down: "S",
      altLeft: "LEFT",
      altRight: "RIGHT",
      altUp: "UP",
      altDown: "DOWN",
      interact: "E",
      space: "SPACE",
      pause: "ESC",
      collection: "C"
    });
    this.keys = keys;

    this.interactJustDownFlag = false;
    this.pauseJustDownFlag = false;
    this.collectionJustDownFlag = false;
    this.interactWasDown = false;
    this.pauseWasDown = false;
    this.collectionWasDown = false;

    this.onShutdown = () => this.releaseAll();
    scene.events.once("shutdown", this.onShutdown);
    scene.events.once("destroy", this.onShutdown);
  }

  // Chamado pelos botões touch (DOM) via window.FTMInput.
  setVirtual(action, value) {
    if (!(action in this.virtual)) return;
    const wasDown = this.virtual[action];
    this.virtual[action] = value;
    if (value && !wasDown && action === "interact") {
      this.interactJustDownFlag = true;
    }
  }

  releaseAll() {
    this.virtual.left = false;
    this.virtual.right = false;
    this.virtual.up = false;
    this.virtual.down = false;
    this.virtual.interact = false;
  }

  // Deve ser chamado 1x por frame no início do update.
  beginFrame() {
    const interactDown =
      this.keys.interact.isDown || this.keys.space.isDown || this.virtual.interact;
    const pauseDown = this.keys.pause.isDown;
    const collectionDown = this.keys.collection.isDown;

    this.interactJustDownFlag =
      this.interactJustDownFlag || (interactDown && !this.interactWasDown);
    this.pauseJustDownFlag = pauseDown && !this.pauseWasDown;
    this.collectionJustDownFlag = collectionDown && !this.collectionWasDown;

    this.interactWasDown = interactDown;
    this.pauseWasDown = pauseDown;
    this.collectionWasDown = collectionDown;
  }

  endFrame() {
    this.interactJustDownFlag = false;
    this.pauseJustDownFlag = false;
    this.collectionJustDownFlag = false;
  }

  get axisX() {
    let x = 0;
    if (this.keys.left.isDown || this.keys.altLeft.isDown || this.virtual.left) x -= 1;
    if (this.keys.right.isDown || this.keys.altRight.isDown || this.virtual.right) x += 1;
    return x;
  }

  get axisY() {
    let y = 0;
    if (this.keys.up.isDown || this.keys.altUp.isDown || this.virtual.up) y -= 1;
    if (this.keys.down.isDown || this.keys.altDown.isDown || this.virtual.down) y += 1;
    return y;
  }

  /** Vetor normalizado de movimento 8 direções (magnitude ≤ 1). */
  vector() {
    let x = this.axisX;
    let y = this.axisY;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y, lengthSq: () => x * x + y * y };
  }

  get interactJustDown() {
    return this.interactJustDownFlag;
  }

  get pauseJustDown() {
    return this.pauseJustDownFlag;
  }

  get collectionJustDown() {
    return this.collectionJustDownFlag;
  }
}

// Objeto estático para a camada DOM (botões touch) falar com a cena ativa.
export const Bridge = {
  current: null,
  setVirtual(action, value) {
    if (this.current) this.current.setVirtual(action, value);
  }
};

export const PHYSICS_TUNING = PHYSICS;
