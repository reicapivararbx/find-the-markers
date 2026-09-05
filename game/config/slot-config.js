// Tabela única da CAPY SLOT — payouts, pity, timings e símbolos.
// ECONOMY.slotCost / pitySoft / pityHard são a fonte de verdade dos números de economia.
import { ECONOMY } from "./game-config.js";

export const SLOT_SYMBOLS = Object.freeze([
  Object.freeze({ id: "cherry", glyph: "🍒", label: "Cereja" }),
  Object.freeze({ id: "lemon", glyph: "🍋", label: "Limão" }),
  Object.freeze({ id: "star", glyph: "⭐", label: "Estrela" }),
  Object.freeze({ id: "beaver", glyph: "🦫", label: "Capivara" }),
  Object.freeze({ id: "diamond", glyph: "💎", label: "Diamante" }),
  Object.freeze({ id: "crown", glyph: "👑", label: "Coroa" }),
  Object.freeze({ id: "target", glyph: "🎯", label: "Alvo" })
]);

export const SLOT_SYMBOL_BY_ID = Object.freeze(
  Object.fromEntries(SLOT_SYMBOLS.map((s) => [s.id, s]))
);

/** payouts de 3 iguais (exceto jackpot, tratado à parte). */
export const SLOT_TRIPLE_PAYOUTS = Object.freeze({
  cherry: 5,
  lemon: 7,
  star: 10,
  beaver: 15,
  diamond: 25,
  crown: 30
});

export const SLOT_CONFIG = Object.freeze({
  cost: ECONOMY.slotCost,
  symbols: SLOT_SYMBOLS,
  pairPayout: 2,
  triplePayouts: SLOT_TRIPLE_PAYOUTS,
  /** coins se 🎯🎯🎯 e o Jackpot Marker já estiver desbloqueado/coletado */
  jackpotAltCoins: 40,
  jackpotMarkerId: "jackpot_marker",
  highRollerMarkerId: "high_roller_marker",
  highRollerBonusCoins: 10,
  pity: Object.freeze({
    soft: ECONOMY.pitySoft,
    hard: ECONOMY.pityHard,
    softChance: 0.35
  }),
  baseChances: Object.freeze({
    jackpot: 0.04,
    highRoller: 0.08,
    coins: 0.35
  }),
  timings: Object.freeze({
    reelStopMs: Object.freeze([1600, 2100, 2800]),
    resultHoldMs: 900,
    jackpotHoldMs: 1800,
    stripLoops: 8
  }),
  cellPx: 72
});
