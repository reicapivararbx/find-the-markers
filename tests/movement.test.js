// Smoke: config top-down + normalização 8-dir (sem Phaser).
import test from "node:test";
import assert from "node:assert/strict";
import { PHYSICS, GAMEPLAY, VIEW } from "../game/config/game-config.js";

test("PHYSICS top-down: gravidade zero e corpo nos pés", () => {
  assert.equal(PHYSICS.gravity, 0);
  assert.ok(PHYSICS.maxSpeed > 0);
  assert.ok(PHYSICS.bodyHeight < PHYSICS.playerHeight, "collider mais baixo que o sprite");
  assert.ok(PHYSICS.bodyOffsetY > 0, "offset empurra o body para os pés");
  assert.ok(Number.isFinite(PHYSICS.depthBias));
});

test("PHYSICS não expõe jump/coyote/buffer (legado platformer)", () => {
  assert.equal("jumpVelocity" in PHYSICS, false);
  assert.equal("coyoteMs" in PHYSICS, false);
  assert.equal("jumpBufferMs" in PHYSICS, false);
  assert.equal("maxFallSpeed" in PHYSICS, false);
  assert.equal("dragX" in PHYSICS, false);
});

test("VIEW e raios de gameplay top-down", () => {
  assert.equal(VIEW.width, 1440);
  assert.equal(VIEW.height, 810);
  assert.ok(GAMEPLAY.collectRadius >= 40);
  assert.ok(GAMEPLAY.interactRadius >= 80);
  assert.ok(GAMEPLAY.gateZoneWidth > 0);
  assert.ok(GAMEPLAY.gateZoneHeight > 0);
});

/** Espelha InputController.vector() — normaliza diagonais para magnitude ≤ 1. */
function normalizeMove(axisX, axisY) {
  let x = axisX;
  let y = axisY;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  return { x, y, len: Math.hypot(x, y) };
}

test("movimento 8-dir: eixos cardinais magnitude 1", () => {
  assert.equal(normalizeMove(1, 0).len, 1);
  assert.equal(normalizeMove(0, -1).len, 1);
  assert.equal(normalizeMove(-1, 0).len, 1);
  assert.equal(normalizeMove(0, 1).len, 1);
});

test("movimento 8-dir: diagonal normalizada (sem speed boost)", () => {
  const d = normalizeMove(1, 1);
  assert.ok(Math.abs(d.len - 1) < 1e-9);
  assert.ok(Math.abs(d.x - Math.SQRT1_2) < 1e-9);
  assert.ok(Math.abs(d.y - Math.SQRT1_2) < 1e-9);
});

test("velocidade = vector * maxSpeed (cardinal e diagonal)", () => {
  const card = normalizeMove(1, 0);
  assert.equal(card.x * PHYSICS.maxSpeed, PHYSICS.maxSpeed);
  assert.equal(card.y * PHYSICS.maxSpeed, 0);

  const diag = normalizeMove(1, -1);
  const vx = diag.x * PHYSICS.maxSpeed;
  const vy = diag.y * PHYSICS.maxSpeed;
  const speed = Math.hypot(vx, vy);
  assert.ok(Math.abs(speed - PHYSICS.maxSpeed) < 1e-6);
});
