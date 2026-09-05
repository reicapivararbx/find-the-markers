// Motor puro da CAPY SLOT: decide resultado ANTES da animação.
// Sem DOM, sem Phaser — testável com rng injetável.
import { SLOT_CONFIG, SLOT_SYMBOLS, SLOT_SYMBOL_BY_ID, SLOT_TRIPLE_PAYOUTS } from "./slot-config.js";

/**
 * @typedef {{ spins: number, pity: number, jackpotWon: boolean, highRollerWon: boolean }} SlotSave
 * @typedef {{
 *   ok: true,
 *   spinId: string,
 *   cost: number,
 *   reels: [string, string, string],
 *   glyphs: [string, string, string],
 *   kind: "miss" | "pair" | "triple" | "jackpot" | "highRoller" | "jackpotAlt",
 *   coinsDelta: number,
 *   unlockJackpot: boolean,
 *   unlockHighRoller: boolean,
 *   jackpot: boolean,
 *   highRoller: boolean,
 *   message: string
 * } | { ok: false, reason: "busy" | "insufficient" | "invalid", message: string }} SpinResult
 */

function defaultRng() {
  return Math.random();
}

function pickSymbolId(rng, exclude = null) {
  const pool = exclude ? SLOT_SYMBOLS.filter((s) => s.id !== exclude) : SLOT_SYMBOLS;
  const i = Math.floor(rng() * pool.length) % pool.length;
  return pool[Math.max(0, i)].id;
}

function glyphsFor(reels) {
  return reels.map((id) => SLOT_SYMBOL_BY_ID[id]?.glyph || "?");
}

function makeSpinId(rng) {
  const n = Math.floor(rng() * 1e9);
  return `spin_${Date.now().toString(36)}_${n.toString(36)}`;
}

/** Três iguais de um id (não-alvo para triples normais). */
function tripleReels(id) {
  return [id, id, id];
}

/** Dois iguais + um diferente (pair). */
function pairReels(rng) {
  const a = pickSymbolId(rng, "target");
  const b = pickSymbolId(rng, a);
  const pos = Math.floor(rng() * 3) % 3;
  const reels = [a, a, a];
  reels[pos] = b;
  // se por azar ficou triple, força o terceiro
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    reels[2] = pickSymbolId(rng, a);
  }
  return reels;
}

/** Três distintos / sem pair / sem jackpot visual. */
function missReels(rng) {
  const a = pickSymbolId(rng, "target");
  let b = pickSymbolId(rng, a);
  if (b === "target") b = pickSymbolId(rng, a);
  let c = pickSymbolId(rng, a);
  let guard = 0;
  while ((c === a || c === b || c === "target") && guard < 12) {
    c = pickSymbolId(rng, a);
    guard += 1;
  }
  if (c === a || c === b) c = pickSymbolId(rng, a === "lemon" ? "cherry" : "lemon");
  // evita pair acidental
  if (a === b || b === c || a === c) {
    return ["cherry", "lemon", "star"];
  }
  return [a, b, c];
}

/**
 * Escolhe a categoria de outcome a partir do pity/save (espelha a lógica antiga).
 * @param {SlotSave} slot
 * @param {() => number} rng
 */
export function chooseOutcomeKind(slot, rng = defaultRng) {
  const s = slot || { pity: 0, jackpotWon: false, highRollerWon: false };
  const { pity, baseChances } = SLOT_CONFIG;
  if (!s.jackpotWon && s.pity >= pity.hard) return "jackpot";
  if (!s.highRollerWon && s.pity >= pity.soft && rng() < pity.softChance) return "highRoller";
  if (!s.jackpotWon && rng() < baseChances.jackpot) return "jackpot";
  if (!s.highRollerWon && rng() < baseChances.highRoller) return "highRoller";
  if (rng() < baseChances.coins) {
    // pair ou triple de prêmio em coins
    return rng() < 0.45 ? "triple" : "pair";
  }
  return "miss";
}

/**
 * Mapeia kind → reels + payouts.
 * @param {"miss"|"pair"|"triple"|"jackpot"|"highRoller"} kind
 * @param {SlotSave} slot
 * @param {{ collectedMarkerIds?: string[] }} save
 * @param {() => number} rng
 */
export function buildResultFromKind(kind, slot, save = {}, rng = defaultRng) {
  const collected = save.collectedMarkerIds || [];
  const jackpotUnlocked = Boolean(slot?.jackpotWon) || collected.includes(SLOT_CONFIG.jackpotMarkerId);
  const highRollerUnlocked =
    Boolean(slot?.highRollerWon) || collected.includes(SLOT_CONFIG.highRollerMarkerId);

  let reels;
  let resultKind = kind;
  let coinsDelta = 0;
  let unlockJackpot = false;
  let unlockHighRoller = false;
  let message = "Sem prêmio… tente de novo.";

  if (kind === "jackpot") {
    reels = tripleReels("target");
    if (jackpotUnlocked) {
      resultKind = "jackpotAlt";
      coinsDelta = SLOT_CONFIG.jackpotAltCoins;
      message = `JACKPOT! +${coinsDelta} Coins`;
    } else {
      resultKind = "jackpot";
      unlockJackpot = true;
      coinsDelta = 0;
      message = "JACKPOT! Marker liberado no chão.";
    }
  } else if (kind === "highRoller") {
    reels = tripleReels("crown");
    if (!highRollerUnlocked) {
      unlockHighRoller = true;
      coinsDelta = SLOT_CONFIG.highRollerBonusCoins;
      message = `High Roller! Marker +${SLOT_CONFIG.highRollerBonusCoins} Coins`;
    } else {
      resultKind = "triple";
      coinsDelta = SLOT_TRIPLE_PAYOUTS.crown;
      message = `✨ +${coinsDelta} Coins`;
    }
  } else if (kind === "triple") {
    const ids = Object.keys(SLOT_TRIPLE_PAYOUTS);
    const id = ids[Math.floor(rng() * ids.length) % ids.length];
    reels = tripleReels(id);
    coinsDelta = SLOT_TRIPLE_PAYOUTS[id] || 0;
    message = `✨ +${coinsDelta} Coins`;
  } else if (kind === "pair") {
    reels = pairReels(rng);
    coinsDelta = SLOT_CONFIG.pairPayout;
    message = `✨ +${coinsDelta} Coins`;
    resultKind = "pair";
  } else {
    reels = missReels(rng);
    coinsDelta = 0;
    resultKind = "miss";
    message = "Sem prêmio… tente de novo.";
  }

  return {
    reels: /** @type {[string, string, string]} */ (reels),
    glyphs: /** @type {[string, string, string]} */ (glyphsFor(reels)),
    kind: resultKind,
    coinsDelta,
    unlockJackpot,
    unlockHighRoller,
    jackpot: unlockJackpot || resultKind === "jackpot" || resultKind === "jackpotAlt",
    highRoller: unlockHighRoller || kind === "highRoller",
    message
  };
}

/**
 * Avalia reels já fixos (útil p/ testes / debug).
 * @param {[string, string, string]} reels
 * @param {SlotSave} slot
 * @param {{ collectedMarkerIds?: string[] }} save
 */
export function evaluateReels(reels, slot, save = {}) {
  const [a, b, c] = reels;
  const collected = save.collectedMarkerIds || [];
  const jackpotUnlocked = Boolean(slot?.jackpotWon) || collected.includes(SLOT_CONFIG.jackpotMarkerId);

  if (a === "target" && b === "target" && c === "target") {
    if (jackpotUnlocked) {
      return {
        kind: "jackpotAlt",
        coinsDelta: SLOT_CONFIG.jackpotAltCoins,
        unlockJackpot: false,
        unlockHighRoller: false,
        message: `JACKPOT! +${SLOT_CONFIG.jackpotAltCoins} Coins`
      };
    }
    return {
      kind: "jackpot",
      coinsDelta: 0,
      unlockJackpot: true,
      unlockHighRoller: false,
      message: "JACKPOT! Marker liberado no chão."
    };
  }

  if (a === b && b === c) {
    if (a === "crown") {
      const highRollerUnlocked =
        Boolean(slot?.highRollerWon) || collected.includes(SLOT_CONFIG.highRollerMarkerId);
      if (!highRollerUnlocked) {
        return {
          kind: "highRoller",
          coinsDelta: SLOT_CONFIG.highRollerBonusCoins,
          unlockJackpot: false,
          unlockHighRoller: true,
          message: `High Roller! Marker +${SLOT_CONFIG.highRollerBonusCoins} Coins`
        };
      }
    }
    const pay = SLOT_TRIPLE_PAYOUTS[a] || 0;
    return {
      kind: pay > 0 ? "triple" : "miss",
      coinsDelta: pay,
      unlockJackpot: false,
      unlockHighRoller: false,
      message: pay > 0 ? `✨ +${pay} Coins` : "Sem prêmio… tente de novo."
    };
  }

  if (a === b || b === c || a === c) {
    return {
      kind: "pair",
      coinsDelta: SLOT_CONFIG.pairPayout,
      unlockJackpot: false,
      unlockHighRoller: false,
      message: `✨ +${SLOT_CONFIG.pairPayout} Coins`
    };
  }

  return {
    kind: "miss",
    coinsDelta: 0,
    unlockJackpot: false,
    unlockHighRoller: false,
    message: "Sem prêmio… tente de novo."
  };
}

/**
 * Resolve um spin completo (custo já deve ser debitável pelo caller).
 * Não muta save — caller aplica spend/add/record/unlock.
 *
 * @param {{ coins: number, slot: SlotSave, collectedMarkerIds?: string[] }} saveLike
 * @param {{ rng?: () => number, spinId?: string, busy?: boolean }} [opts]
 * @returns {SpinResult}
 */
export function resolveSpin(saveLike, opts = {}) {
  if (opts.busy) {
    return { ok: false, reason: "busy", message: "Aguarde o giro terminar." };
  }
  if (!saveLike || typeof saveLike !== "object") {
    return { ok: false, reason: "invalid", message: "Save inválido." };
  }
  const coins = Math.max(0, Math.floor(Number(saveLike.coins) || 0));
  const cost = SLOT_CONFIG.cost;
  if (coins < cost) {
    return {
      ok: false,
      reason: "insufficient",
      message: `❌ Você precisa de ${cost} Coins`
    };
  }

  const rng = typeof opts.rng === "function" ? opts.rng : defaultRng;
  const slot = saveLike.slot || { spins: 0, pity: 0, jackpotWon: false, highRollerWon: false };
  const kind = chooseOutcomeKind(slot, rng);
  const built = buildResultFromKind(kind, slot, saveLike, rng);

  return {
    ok: true,
    spinId: opts.spinId || makeSpinId(rng),
    cost,
    reels: built.reels,
    glyphs: built.glyphs,
    kind: built.kind,
    coinsDelta: built.coinsDelta,
    unlockJackpot: built.unlockJackpot,
    unlockHighRoller: built.unlockHighRoller,
    jackpot: Boolean(built.jackpot),
    highRoller: Boolean(built.highRoller),
    message: built.message
  };
}

/**
 * Aplica o resultado no SaveManager (débito já feito ou faz aqui se opts.debit).
 * @param {import("../save/save-manager.js").SaveManager} sm
 * @param {Extract<SpinResult, { ok: true }>} result
 * @param {{ alreadyDebited?: boolean }} [opts]
 */
export function applySpinResult(sm, result, opts = {}) {
  if (!result?.ok || !sm) return false;
  if (!opts.alreadyDebited) {
    if (!sm.spendCoins(result.cost)) return false;
  }
  if (result.coinsDelta > 0) sm.addCoins(result.coinsDelta);
  sm.recordSlotSpin({
    jackpot: result.unlockJackpot || result.kind === "jackpot" || result.kind === "jackpotAlt",
    highRoller: result.unlockHighRoller || result.kind === "highRoller"
  });
  return true;
}
