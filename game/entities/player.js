// Movimentação TOP-DOWN: livre no plano X+Y (WASD / setas), sem gravidade/pulo.
// Depth = y dos pés para oclusão 2.5D. Sombra no chão sob o personagem.
import { PHYSICS } from "../config/game-config.js";

export class Player {
  constructor(scene, x, y, input) {
    this.scene = scene;
    this.input = input;

    // sombra no chão (elipse achatada) — depth abaixo do sprite
    this.shadow = scene.add.ellipse(x, y - 4, 36, 14, 0x1a1a22, 0.28).setDepth(y - 1);

    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData("ySort", true);
    this.sprite.setData("depthBias", PHYSICS.depthBias);
    this.sprite.setDepth(y + PHYSICS.depthBias);
    this.sprite.body.setSize(PHYSICS.bodyWidth, PHYSICS.bodyHeight);
    this.sprite.body.setOffset(PHYSICS.bodyOffsetX, PHYSICS.bodyOffsetY);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setMaxVelocity(PHYSICS.maxSpeed, PHYSICS.maxSpeed);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setDrag(0, 0);

    this.walkPhase = 0;
  }

  get body() {
    return this.sprite.body;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  stop() {
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setAngle(0);
  }

  // Deve rodar após input.beginFrame(); dt em ms.
  update(dt, blocked = false) {
    const body = this.sprite.body;

    if (blocked) {
      body.setVelocity(0, 0);
      this.syncVisuals();
      return;
    }

    const dir = this.input.vector();
    body.setVelocity(dir.x * PHYSICS.maxSpeed, dir.y * PHYSICS.maxSpeed);

    if (dir.x < 0) this.sprite.setFlipX(true);
    else if (dir.x > 0) this.sprite.setFlipX(false);

    // balanço sutil ao andar (pseudo-passos)
    const moving = dir.x !== 0 || dir.y !== 0;
    if (moving) {
      this.walkPhase += dt * 0.012;
      this.sprite.setAngle(Math.sin(this.walkPhase) * 2.4);
    } else {
      this.walkPhase = 0;
      this.sprite.setAngle(0);
    }

    this.syncVisuals();
  }

  syncVisuals() {
    const y = this.sprite.y;
    this.sprite.setDepth(y + PHYSICS.depthBias);
    if (this.shadow) {
      this.shadow.setPosition(this.sprite.x, y - 4);
      this.shadow.setDepth(y - 1);
      const moving =
        Math.abs(this.sprite.body.velocity.x) + Math.abs(this.sprite.body.velocity.y) > 8;
      this.shadow.setScale(moving ? 0.92 : 1, moving ? 0.85 : 1);
      this.shadow.setAlpha(moving ? 0.22 : 0.28);
    }
  }
}
