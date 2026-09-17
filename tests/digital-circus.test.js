import test from "node:test";
import assert from "node:assert/strict";
import circus, { digitalCircusSpawn } from "../game/rooms/digital_circus.js";
import gallery from "../game/rooms/room_02_casino_gallery.js";
import { ROOMS } from "../game/rooms/index.js";
import { ROOM_CONNECTIONS } from "../game/config/room-connections.js";
import { ARCHIVE_PENDING, ARCHIVE_ROOM } from "../game/config/archive-config.js";
import { markersForRoom } from "../game/config/marker-registry.js";
import { isPositionWalkable, buildUnstuckCandidates, resolveSafePoint } from "../game/physics/walkability.js";
import { state } from "../game/state.js";
import { setMuted } from "../game/core/audio-manager.js";
import { EventEmitter } from "node:events";
import { InputController } from "../game/core/input.js";

// Collect the real room's collision definitions without starting a renderer.
// This is a layout test, not a replacement for the browser lifecycle audit.
function build(room) {
  const solids = [], objects = [], interactions = [], travel = [];
  function object() {
    const obj = { data: {}, x: 0, y: 0 };
    const proxy = new Proxy(obj, { get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        if (key === "setPosition") [obj.x, obj.y] = args;
        if (key === "setDepth") obj.depth = args[0];
        if (key === "setName") obj.name = args[0];
        if (key === "setData") obj.data[args[0]] = args[1];
        return proxy;
      };
    } });
    objects.push(obj);
    return proxy;
  }
  const scene = { transitioning: false, inCutscene: false, add: new Proxy({}, { get: () => object }) };
  const ctx = { scene, solid: (x, y, w, h) => solids.push({ x, y, w, h }),
    addUpdatable: (u) => interactions.push(u), travel: (key) => travel.push(key) };
  const previousPhaser = globalThis.Phaser;
  // Gallery crates use Phaser's color utility only for a decorative highlight.
  globalThis.Phaser = { Display: { Color: { IntegerToColor: (color) => ({ brighten: () => ({ color }) }) } } };
  try { room.build(ctx); } finally {
    if (previousPhaser === undefined) delete globalThis.Phaser;
    else globalThis.Phaser = previousPhaser;
  }
  return { ctx, solids, objects, interactions, travel };
}

test("Digital Circus has a real central-portal route and safe return; archive remains independent", () => {
  assert.equal(ROOMS.digital_circus, circus);
  const enter = ROOM_CONNECTIONS.room_02_casino_gallery.digitalCircus;
  const exit = ROOM_CONNECTIONS.digital_circus.gallery;
  assert.equal(enter.to, "digital_circus");
  assert.equal(enter.pending, undefined);
  assert.equal(enter.interaction, "E");
  assert.equal(exit.to, gallery.id);
  assert.equal(circus.spawns[enter.arriveAt], digitalCircusSpawn);
  const p = gallery.spawns[exit.arriveAt];
  assert.ok(Math.hypot(p.x - 640, p.y - 280) > 76, "return outside painting interaction radius");
  assert.ok(isPositionWalkable(p.x, p.y, build(gallery).solids));
  assert.equal(ROOM_CONNECTIONS.room_02_casino_gallery.archive.to, ARCHIVE_PENDING ? null : ARCHIVE_ROOM);
  assert.equal(ROOM_CONNECTIONS.room_02_casino_gallery.next.to, "room_03_casino_pool");
  assert.equal(ROOM_CONNECTIONS.room_02_casino_gallery.exitCasino.to, "room_04_city_casino");
  assert.equal(markersForRoom(circus.id).length, 0);
});

test("every circus spawn and unstuck fallback is clear of actual bases and exit interaction", () => {
  const { ctx, solids, interactions } = build(circus);
  circus.wire(ctx);
  for (const p of Object.values(circus.spawns)) {
    assert.ok(isPositionWalkable(p.x, p.y, solids, circus.bounds));
    for (const i of interactions) assert.ok(Math.hypot(p.x - i.x, p.y - i.y) > i.radius);
  }
  const candidates = buildUnstuckCandidates({ roomId: circus.id, room: circus,
    arriveAt: "from_gallery", lastSafe: { areaId: circus.id, x: 1650, y: 1090 } });
  assert.equal(isPositionWalkable(1650, 1090, solids, circus.bounds), false);
  assert.equal(resolveSafePoint(candidates, solids, circus.bounds).source, "spawn:from_gallery");
  const validSafe = { areaId: circus.id, x: 1320, y: 1400 };
  assert.equal(resolveSafePoint(buildUnstuckCandidates({ roomId: circus.id, room: circus,
    lastSafe: validSafe }), solids, circus.bounds).source, "lastSafePosition");
});

test("exploration paths connect spawn, exit, all landmarks and both sides of the tall structures", () => {
  const { solids } = build(circus);
  const size = 20, cols = circus.bounds.width / size, rows = circus.bounds.height / size;
  const at = (x, y) => y * cols + x;
  const start = [digitalCircusSpawn.x / size, digitalCircusSpawn.y / size];
  const queue = [start], visited = new Set([at(...start)]);
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      const key = at(nx, ny);
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || visited.has(key)) continue;
      if (!isPositionWalkable(nx * size, ny * size, solids, circus.bounds)) continue;
      visited.add(key); queue.push([nx, ny]);
    }
  }
  for (const [name, x, y] of [["exit", 1060, 1160], ["castle passage", 600, 780],
    ["castle rear", 600, 660], ["spiral front", 1640, 1180], ["spiral rear", 1640, 980],
    ["stack", 2640, 1020], ["balloon", 680, 1900], ["arcade", 2480, 2020],
    ["tube passage", 1860, 1720], ["north path", 1300, 480], ["south path", 1500, 2260]]) {
    assert.ok(visited.has(at(x / size, y / size)), `${name} must be reachable with player feet clearance`);
  }
});

test("structures sort at their feet and decoration adds no gameplay updatables", () => {
  const { ctx, objects, solids, interactions } = build(circus);
  circus.wire(ctx);
  for (const name of ["spiral", "castle", "stacked_toy", "balloon_dog", "arcade", "tube_arch"]) {
    const obj = objects.find((o) => o.name === `circus_${name}`);
    assert.ok(obj);
    assert.equal(obj.depth, obj.y);
    assert.equal(obj.data.ySort, true);
  }
  assert.equal(interactions.length, 1);
  assert.ok(solids.length < 40, "bases only; no collider for every stair, balloon or bubble");
  for (const s of solids) {
    assert.ok(s.x >= 0 && s.y >= 0 && s.w > 0 && s.h > 0);
    assert.ok(s.x + s.w <= circus.bounds.width && s.y + s.h <= circus.bounds.height);
  }
});

test("exit uses the shared interaction edge and respects transition lock", () => {
  setMuted(true);
  const { ctx, interactions, travel } = build(circus);
  circus.wire(ctx);
  const exit = interactions[0];
  const hud = { setInteraction() {}, clearInteraction() {}, puzzleModalOpen: false };
  exit.update(exit.x, exit.y, false, hud);
  assert.deepEqual(travel, []);
  ctx.scene.transitioning = true;
  exit.update(exit.x, exit.y, true, hud);
  assert.deepEqual(travel, []);
  ctx.scene.transitioning = false;
  exit.update(exit.x, exit.y, true, hud);
  assert.deepEqual(travel, ["gallery"]);
  exit.update(exit.x, exit.y, false, hud);
  assert.deepEqual(travel, ["gallery"]);
});

test("debug annotations are opt-in and do not change collision layout", () => {
  const normal = build(circus);
  state.debug = true;
  try {
    const debug = build(circus);
    assert.deepEqual(debug.solids, normal.solids);
    assert.ok(debug.objects.length > normal.objects.length);
  } finally { state.debug = false; }
});

test("shared input removes lifecycle listeners and keyboard keys over 20 scene shutdowns", () => {
  const events = new EventEmitter(), keys = new Set();
  const scene = { events, input: { keyboard: {
    addKeys: (defs) => Object.fromEntries(Object.keys(defs).map((name) => {
      const key = { isDown: false }; keys.add(key); return [name, key];
    })),
    removeKey: (key) => keys.delete(key)
  } } };
  for (let i = 0; i < 20; i++) {
    const input = new InputController(scene);
    globalThis.FTMInput = input;
    input.setVirtual("interact", true);
    input.setVirtual("right", true);
    assert.equal(input.interactJustDown, true);
    assert.equal(input.vector().x, 1);
    events.emit("shutdown");
    assert.equal(keys.size, 0);
    assert.equal(events.listenerCount("destroy"), 0);
    assert.equal(events.listenerCount("shutdown"), 0);
    assert.equal(globalThis.FTMInput, null);
    input.destroy(); // explicit RoomScene shutdown may dispose it again
  }
});
