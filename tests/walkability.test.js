import test from "node:test";
import assert from "node:assert/strict";
import { PHYSICS, VIEW, SOFTLOCK } from "../game/config/game-config.js";
import {
  playerFeetRect,
  aabbOverlap,
  isPositionWalkable,
  firstBlockingSolid,
  resolveSafePoint,
  buildUnstuckCandidates
} from "../game/physics/walkability.js";
import { ROOMS } from "../game/rooms/index.js";

test("SOFTLOCK config present with sane timings", () => {
  assert.ok(SOFTLOCK.safeSampleMs >= 250 && SOFTLOCK.safeSampleMs <= 500);
  assert.ok(SOFTLOCK.stuckMs >= 1000);
  assert.equal(SOFTLOCK.unstuckCooldownMs, 5000);
  assert.equal(SOFTLOCK.globalStart.roomId, "room_09_spawn");
  assert.equal(SOFTLOCK.globalStart.x, 360);
  assert.equal(SOFTLOCK.globalStart.y, 640);
});

test("playerFeetRect: origin (0.5,1) feet box under pivot", () => {
  const r = playerFeetRect(100, 200, 28, 18);
  assert.equal(r.w, 28);
  assert.equal(r.h, 18);
  assert.equal(r.x, 100 - 14);
  assert.equal(r.y, 200 - 18);
});

test("aabbOverlap: interior overlap true, edge-touch false with pad 0", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  const b = { x: 5, y: 5, w: 10, h: 10 };
  assert.equal(aabbOverlap(a, b), true);
  const edge = { x: 10, y: 0, w: 10, h: 10 };
  assert.equal(aabbOverlap(a, edge), false);
});

test("isPositionWalkable: open space true, inside solid false, OOB false", () => {
  const solids = [{ x: 200, y: 200, w: 100, h: 100 }];
  assert.equal(isPositionWalkable(400, 500, solids, VIEW), true);
  assert.equal(isPositionWalkable(250, 250, solids, VIEW), false);
  assert.equal(isPositionWalkable(-10, 400, solids, VIEW), false);
  assert.equal(isPositionWalkable(VIEW.width + 50, 400, solids, VIEW), false);
});

test("firstBlockingSolid returns intersecting rect", () => {
  const solids = [
    { x: 0, y: 0, w: 10, h: 10 },
    { x: 400, y: 400, w: 80, h: 80 }
  ];
  const hit = firstBlockingSolid(420, 450, solids);
  assert.ok(hit);
  assert.equal(hit.x, 400);
  assert.equal(firstBlockingSolid(100, 100, solids), null);
});

test("resolveSafePoint picks first walkable candidate", () => {
  const solids = [{ x: 300, y: 300, w: 200, h: 200 }];
  const picked = resolveSafePoint(
    [
      { x: 350, y: 350, source: "bad" },
      { x: 100, y: 100, source: "good" }
    ],
    solids,
    VIEW
  );
  assert.equal(picked.source, "good");
  assert.equal(picked.x, 100);
});

test("buildUnstuckCandidates order: lastSafe → named → default → others → global", () => {
  const room = {
    spawns: {
      default: { x: 360, y: 640 },
      from_room_08: { x: 140, y: 520 }
    }
  };
  const list = buildUnstuckCandidates({
    roomId: "room_09_spawn",
    room,
    lastSafe: { areaId: "room_09_spawn", x: 400, y: 500 },
    arriveAt: "from_room_08",
    globalStart: { x: 360, y: 640, source: "room_09_spawn" }
  });
  assert.equal(list[0].source, "lastSafePosition");
  assert.equal(list[1].source, "spawn:from_room_08");
  assert.ok(list.some((c) => c.source === "spawn:default"));
  assert.ok(list.some((c) => c.source === "global:room_09_spawn"));
});

test("all room default/entry spawns are walkable against empty solids (in bounds)", () => {
  for (const [id, room] of Object.entries(ROOMS)) {
    const spawns = room.spawns || {};
    for (const [key, sp] of Object.entries(spawns)) {
      assert.ok(
        isPositionWalkable(sp.x, sp.y, [], VIEW),
        `${id} spawn:${key} (${sp.x},${sp.y}) must be in bounds`
      );
    }
  }
});

test("room_09_spawn default matches SOFTLOCK.globalStart", () => {
  const sp = ROOMS.room_09_spawn.spawns.default;
  assert.equal(sp.x, SOFTLOCK.globalStart.x);
  assert.equal(sp.y, SOFTLOCK.globalStart.y);
});

test("PHYSICS feet body still smaller than sprite height", () => {
  assert.ok(PHYSICS.bodyHeight < PHYSICS.playerHeight);
  assert.equal(PHYSICS.bodyWidth, 28);
  assert.equal(PHYSICS.bodyHeight, 18);
});
