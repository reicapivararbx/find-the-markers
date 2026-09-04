// As 12 dificuldades do medidor, na ordem visual do desenho (topo -> base).
export const METER_ROWS = Object.freeze([
  "Finale",
  "Champion",
  "NOT!",
  "Astonishing",
  "Why",
  "Insane",
  "Challenging",
  "Difficult",
  "Hard",
  "Medium",
  "Easy",
  "Effortless"
]);

// Cores por dificuldade (corpo/cap do marker e UI).
export const DIFFICULTY_COLORS = Object.freeze({
  Effortless: 0xa8e063,
  Easy: 0x62c462,
  Medium: 0xf2c94c,
  Hard: 0xe8734a,
  Difficult: 0xd1495b,
  Challenging: 0xf2994a,
  Insane: 0xd469d4,
  Why: 0x9aa5b1,
  Astonishing: 0x56ccf2,
  "NOT!": 0xeb5757,
  Champion: 0xf2c94c,
  Finale: 0x8b5cf6
});

export function difficultyColor(difficulty) {
  return DIFFICULTY_COLORS[difficulty] || 0x9aa5b1;
}
