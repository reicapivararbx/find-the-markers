// Pure walkability helpers (no Phaser). Feet-AABB vs solids / world bounds.
import { PHYSICS, VIEW } from "../config/game-config.js";

export function playerFeetRect(x, y, bodyW = PHYSICS.bodyWidth, bodyH = PHYSICS.bodyHeight) {
  const w = bodyW;
  const h = bodyH;
  return {
    x: x - w / 2,
    y: y - h,
    w,
    h
  };
}

export function aabbOverlap(a, b, pad = 0) {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}

export function rectInsideBounds(rect, bounds = VIEW, inset = 0) {
  const left = inset;
  const top = inset;
  const right = (bounds.width ?? bounds.w ?? VIEW.width) - inset;
  const bottom = (bounds.height ?? bounds.h ?? VIEW.height) - inset;
  return (
    rect.x >= left &&
    rect.y >= top &&
    rect.x + rect.w <= right &&
    rect.y + rect.h <= bottom
  );
}

export function isPositionWalkable(x, y, solids = [], bounds = VIEW, opts = {}) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  const bodyW = opts.bodyW ?? PHYSICS.bodyWidth;
  const bodyH = opts.bodyH ?? PHYSICS.bodyHeight;
  const pad = opts.pad ?? 0;
  const inset = opts.inset ?? 2;
  const feet = playerFeetRect(x, y, bodyW, bodyH);
  if (!rectInsideBounds(feet, bounds, inset)) return false;
  for (let i = 0; i < solids.length; i += 1) {
    const s = solids[i];
    if (!s) continue;
    const solid = { x: s.x, y: s.y, w: s.w ?? s.width, h: s.h ?? s.height };
    if (!Number.isFinite(solid.w) || !Number.isFinite(solid.h)) continue;
    if (aabbOverlap(feet, solid, pad)) return false;
  }
  return true;
}

export function firstBlockingSolid(x, y, solids = [], opts = {}) {
  const bodyW = opts.bodyW ?? PHYSICS.bodyWidth;
  const bodyH = opts.bodyH ?? PHYSICS.bodyHeight;
  const pad = opts.pad ?? 0;
  const feet = playerFeetRect(x, y, bodyW, bodyH);
  for (let i = 0; i < solids.length; i += 1) {
    const s = solids[i];
    if (!s) continue;
    const solid = { x: s.x, y: s.y, w: s.w ?? s.width, h: s.h ?? s.height };
    if (aabbOverlap(feet, solid, pad)) return solid;
  }
  return null;
}

export function resolveSafePoint(candidates, solids = [], bounds = VIEW, opts = {}) {
  if (!Array.isArray(candidates)) return null;
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    if (!c || !Number.isFinite(c.x) || !Number.isFinite(c.y)) continue;
    if (isPositionWalkable(c.x, c.y, solids, bounds, opts)) {
      return { x: c.x, y: c.y, source: c.source || `candidate_${i}` };
    }
  }
  return null;
}

export function buildUnstuckCandidates({
  roomId,
  room,
  lastSafe = null,
  arriveAt = "default",
  globalStart = { x: 360, y: 640, source: "room_09_spawn" }
} = {}) {
  const list = [];
  if (
    lastSafe &&
    lastSafe.areaId === roomId &&
    Number.isFinite(lastSafe.x) &&
    Number.isFinite(lastSafe.y)
  ) {
    list.push({ x: lastSafe.x, y: lastSafe.y, source: "lastSafePosition" });
  }
  const spawns = room?.spawns || {};
  const named = spawns[arriveAt];
  if (named && Number.isFinite(named.x) && Number.isFinite(named.y)) {
    list.push({ x: named.x, y: named.y, source: `spawn:${arriveAt}` });
  }
  if (spawns.default && Number.isFinite(spawns.default.x) && Number.isFinite(spawns.default.y)) {
    if (!named || named.x !== spawns.default.x || named.y !== spawns.default.y) {
      list.push({ x: spawns.default.x, y: spawns.default.y, source: "spawn:default" });
    }
  }
  for (const [key, sp] of Object.entries(spawns)) {
    if (key === "default" || key === arriveAt) continue;
    if (sp && Number.isFinite(sp.x) && Number.isFinite(sp.y)) {
      list.push({ x: sp.x, y: sp.y, source: `spawn:${key}` });
    }
  }
  if (globalStart && Number.isFinite(globalStart.x) && Number.isFinite(globalStart.y)) {
    list.push({
      x: globalStart.x,
      y: globalStart.y,
      source: "global:room_09_spawn"
    });
  }
  return list;
}
