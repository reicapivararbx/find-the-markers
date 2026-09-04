import { PHYSICS, PLAYER_CHARACTERS } from "../config/game-config.js";
import { state } from "../state.js";

export function resolvePlayerTextureKey(character = null) {
  const id = character || state.saveManager?.save?.playerCharacter || "male";
  const def = PLAYER_CHARACTERS[id] || PLAYER_CHARACTERS.male;
  return def.textureKey;
}

export function resolvePlayerDisplayHeight(character = null) {
  const id = character || state.saveManager?.save?.playerCharacter || "male";
  const def = PLAYER_CHARACTERS[id] || PLAYER_CHARACTERS.male;
  return def.displayHeight;
}

export class Player {
  constructor(scene, x, y, input) {
    this.scene = scene;
    this.input = input;

    this.shadow = scene.add.ellipse(x, y - 4, 36, 14, 0x1a1a22, 0.28).setDepth(y - 1);

    const textureKey = resolvePlayerTextureKey();
    const fallback = scene.textures.exists(textureKey)
      ? textureKey
      : scene.textures.exists("player")
        ? "player"
        : textureKey;

    this.sprite = scene.physics.add.sprite(x, y, fallback);
    this.sprite.setOrigin(0.5, 1);
    this.applyCharacterVisuals(state.saveManager?.save?.playerCharacter);
    this.sprite.setData("ySort", true);
    this.sprite.setData("depthBias", PHYSICS.depthBias);
    this.sprite.setDepth(y + PHYSICS.depthBias);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setMaxVelocity(PHYSICS.maxSpeed, PHYSICS.maxSpeed);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setDrag(0, 0);

    this.walkPhase = 0;
  }

  applyCharacterVisuals(character = null) {
    const id = character || state.saveManager?.save?.playerCharacter || "male";
    const def = PLAYER_CHARACTERS[id] || PLAYER_CHARACTERS.male;
    const key = this.scene.textures.exists(def.textureKey)
      ? def.textureKey
      : this.scene.textures.exists("player")
        ? "player"
        : def.textureKey;

    if (this.sprite.texture?.key !== key && this.scene.textures.exists(key)) {
      this.sprite.setTexture(key);
    }

    const displayH = def.displayHeight;
    const src = this.sprite.texture?.getSourceImage?.();
    const srcH = src?.height || displayH;
    const srcW = src?.width || PHYSICS.playerWidth;
    const scale = displayH / srcH;
    this.sprite.setScale(scale);

    const displayW = srcW * scale;
    const bodyW = PHYSICS.bodyWidth;
    const bodyH = PHYSICS.bodyHeight;
    const offsetX = (displayW - bodyW) / 2 / scale;
    const offsetY = (displayH - bodyH) / scale;
    this.sprite.body.setSize(bodyW / scale, bodyH / scale);
    this.sprite.body.setOffset(offsetX, offsetY);
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
