import test from "node:test";
import assert from "node:assert/strict";
import { SLOT_CONFIG, SLOT_SYMBOLS, SLOT_TRIPLE_PAYOUTS } from "../game/config/slot-config.js";
import {
  resolveSpin,
  applySpinResult,
  chooseOutcomeKind,
  buildResultFromKind,
  evaluateReels
} from "../game/config/slot-engine.js";
import { ECONOMY } from "../game/config/game-config.js";
import { SaveManager, createDefaultSave } from "../game/save/save-manager.js";
import { isCollectible, MARKER_BY_ID } from "../game/config/marker-registry.js";

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

function rngSeq(values) {
  let i = 0;
  return () => {
    const v = values[Math.min(i, values.length - 1)];
    i += 1;
    return v;
  };
}

test("SLOT_CONFIG: cost 3, symbols, pity from ECONOMY, single payout table", () => {
  assert.equal(SLOT_CONFIG.cost, 3);
  assert.equal(SLOT_CONFIG.cost, ECONOMY.slotCost);
  assert.equal(SLOT_CONFIG.pity.soft, ECONOMY.pitySoft);
  assert.equal(SLOT_CONFIG.pity.hard, ECONOMY.pityHard);
  assert.equal(SLOT_SYMBOLS.length, 7);
  assert.equal(SLOT_CONFIG.pairPayout, 2);
  assert.equal(SLOT_TRIPLE_PAYOUTS.cherry, 5);
  assert.equal(SLOT_TRIPLE_PAYOUTS.lemon, 7);
  assert.equal(SLOT_TRIPLE_PAYOUTS.star, 10);
  assert.equal(SLOT_TRIPLE_PAYOUTS.beaver, 15);
  assert.equal(SLOT_TRIPLE_PAYOUTS.diamond, 25);
  assert.equal(SLOT_TRIPLE_PAYOUTS.crown, 30);
  assert.deepEqual(SLOT_CONFIG.timings.reelStopMs, [1600, 2100, 2800]);
  assert.ok(SLOT_CONFIG.timings.reelStopMs[0] < SLOT_CONFIG.timings.reelStopMs[1]);
  assert.ok(SLOT_CONFIG.timings.reelStopMs[1] < SLOT_CONFIG.timings.reelStopMs[2]);
});

test("resolveSpin: insufficient coins", () => {
  const save = { ...createDefaultSave(), coins: 2 };
  const r = resolveSpin(save);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "insufficient");
  assert.match(r.message, /3 Coins/);
});

test("resolveSpin: exact 3 coins is allowed", () => {
  const save = {
    ...createDefaultSave(),
    coins: 3,
    slot: { spins: 0, pity: 0, jackpotWon: false, highRollerWon: false }
  };
  const r = resolveSpin(save, { rng: () => 0.99 });
  assert.equal(r.ok, true);
  assert.equal(r.cost, 3);
  assert.equal(r.reels.length, 3);
  assert.equal(r.glyphs.length, 3);
  assert.ok(r.spinId);
});

test("resolveSpin: busy blocks", () => {
  const save = { ...createDefaultSave(), coins: 10 };
  const r = resolveSpin(save, { busy: true });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "busy");
});

test("pity hard guarantees jackpot when not yet won", () => {
  const slot = { spins: 50, pity: ECONOMY.pityHard, jackpotWon: false, highRollerWon: true };
  assert.equal(chooseOutcomeKind(slot, () => 0.99), "jackpot");
  const built = buildResultFromKind("jackpot", slot, { collectedMarkerIds: [] }, () => 0);
  assert.equal(built.kind, "jackpot");
  assert.equal(built.unlockJackpot, true);
  assert.deepEqual(built.reels, ["target", "target", "target"]);
  assert.equal(built.coinsDelta, 0);
});

test("jackpot already unlocked → alt coins, no second unlock", () => {
  const slot = { spins: 10, pity: 0, jackpotWon: true, highRollerWon: false };
  const built = buildResultFromKind("jackpot", slot, { collectedMarkerIds: [] }, () => 0);
  assert.equal(built.kind, "jackpotAlt");
  assert.equal(built.unlockJackpot, false);
  assert.equal(built.coinsDelta, SLOT_CONFIG.jackpotAltCoins);
});

test("evaluateReels: pair / triple / miss / jackpot", () => {
  const slot = { pity: 0, jackpotWon: false, highRollerWon: false };
  assert.equal(evaluateReels(["cherry", "cherry", "lemon"], slot).kind, "pair");
  assert.equal(evaluateReels(["cherry", "cherry", "lemon"], slot).coinsDelta, 2);
  assert.equal(evaluateReels(["diamond", "diamond", "diamond"], slot).kind, "triple");
  assert.equal(evaluateReels(["diamond", "diamond", "diamond"], slot).coinsDelta, 25);
  assert.equal(evaluateReels(["cherry", "lemon", "star"], slot).kind, "miss");
  assert.equal(evaluateReels(["target", "target", "target"], slot).kind, "jackpot");
  assert.equal(evaluateReels(["target", "target", "target"], slot).unlockJackpot, true);
});

test("applySpinResult: debit once, pity++, no double via spinId caller", () => {
  const storage = new MemoryStorage();
  const sm = new SaveManager(storage);
  sm.load();
  sm.addCoins(10);
  const before = sm.save.coins;

  const result = resolveSpin(sm.save, {
    rng: rngSeq([0.99, 0.99, 0.99, 0.5, 0.5, 0.5, 0.5]),
    spinId: "spin_test_1"
  });
  assert.equal(result.ok, true);

  assert.equal(sm.spendCoins(result.cost), true);
  applySpinResult(sm, result, { alreadyDebited: true });

  const expectedCoins = before - result.cost + result.coinsDelta;
  assert.equal(sm.save.coins, expectedCoins);
  assert.equal(sm.save.slot.spins, 1);

  if (result.unlockJackpot || result.kind === "jackpot" || result.kind === "jackpotAlt") {
    assert.equal(sm.save.slot.jackpotWon, true);
    assert.equal(sm.save.slot.pity, 0);
  } else if (result.unlockHighRoller || result.kind === "highRoller") {
    assert.equal(sm.save.slot.highRollerWon, true);
    assert.equal(sm.save.slot.pity, 0);
  } else {
    assert.equal(sm.save.slot.pity, 1);
  }
});

test("applySpinResult does not double-pay if called with alreadyDebited after manual spend", () => {
  const sm = new SaveManager(new MemoryStorage());
  sm.load();
  sm.addCoins(20);
  const result = {
    ok: true,
    spinId: "x",
    cost: 3,
    reels: ["cherry", "cherry", "lemon"],
    glyphs: ["🍒", "🍒", "🍋"],
    kind: "pair",
    coinsDelta: 2,
    unlockJackpot: false,
    unlockHighRoller: false,
    jackpot: false,
    highRoller: false,
    message: "+2"
  };
  sm.spendCoins(3);
  applySpinResult(sm, result, { alreadyDebited: true });
  assert.equal(sm.save.coins, 20 - 3 + 2);
  assert.equal(sm.save.slot.spins, 1);
  assert.equal(sm.save.slot.pity, 1);
});

test("isCollectible slot markers only after jackpot/highRoller won", () => {
  const jp = MARKER_BY_ID.jackpot_marker;
  const hr = MARKER_BY_ID.high_roller_marker;
  assert.ok(jp && hr);
  const base = createDefaultSave();
  assert.equal(isCollectible(jp, base), false);
  assert.equal(isCollectible(hr, base), false);

  const afterJp = { ...base, slot: { ...base.slot, jackpotWon: true } };
  assert.equal(isCollectible(jp, afterJp), true);
  assert.equal(isCollectible(hr, afterJp), false);

  const afterHr = { ...base, slot: { ...base.slot, highRollerWon: true } };
  assert.equal(isCollectible(hr, afterHr), true);

  const collected = {
    ...afterJp,
    collectedMarkerIds: ["jackpot_marker"]
  };
  assert.equal(isCollectible(jp, collected), false);
});

test("reload: jackpotWon persists and marker stays unlockable until collected", () => {
  const storage = new MemoryStorage();
  const a = new SaveManager(storage);
  a.load();
  a.addCoins(10);
  a.recordSlotSpin({ jackpot: true });
  assert.equal(a.save.slot.jackpotWon, true);
  assert.equal(a.save.slot.pity, 0);

  const b = new SaveManager(storage);
  b.load();
  assert.equal(b.save.slot.jackpotWon, true);
  assert.equal(isCollectible(MARKER_BY_ID.jackpot_marker, b.save), true);
});

test("forced miss vs forced jackpot via rng on chooseOutcomeKind", () => {
  const fresh = { pity: 0, jackpotWon: false, highRollerWon: false };
  assert.equal(chooseOutcomeKind(fresh, () => 0.99), "miss");
  assert.equal(chooseOutcomeKind(fresh, () => 0.01), "jackpot");
});
