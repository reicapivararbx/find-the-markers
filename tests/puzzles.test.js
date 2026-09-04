// Testes das sequências e configurações de puzzle.
import test from "node:test";
import assert from "node:assert/strict";
import {
  RED_BUTTON_SEQUENCE,
  RED_BUTTON_GRID,
  DIFFICULTY_SEQUENCE,
  EGG_QUEST,
  CREDITS_BOXES
} from "../game/config/puzzle-config.js";
import { METER_ROWS } from "../game/config/difficulty-metadata.js";

test("sequência 3x3 é a EXATA do código da página 11 (5-8-9 / 7-1-4 / 2-6-3)", () => {
  assert.deepEqual([...RED_BUTTON_SEQUENCE], [
    "center",
    "bottomLeft",
    "bottomRight",
    "middleRight",
    "topLeft",
    "bottomCenter",
    "middleLeft",
    "topCenter",
    "topRight"
  ]);
});

test("os 9 botões do grid são exatamente os da sequência, sem repetição", () => {
  const flat = RED_BUTTON_GRID.flat();
  assert.equal(flat.length, 9);
  assert.equal(new Set(flat).size, 9);
  new Set(RED_BUTTON_SEQUENCE).forEach((label) => assert.ok(flat.includes(label)));
});

test("grid tem 3 linhas x 3 colunas (leitores topLeft..bottomRight)", () => {
  assert.equal(RED_BUTTON_GRID.length, 3);
  RED_BUTTON_GRID.forEach((row) => assert.equal(row.length, 3));
});

test("sequência do medidor não é aleatória e tem 10 passos", () => {
  assert.equal(DIFFICULTY_SEQUENCE.length, 10);
  assert.deepEqual(DIFFICULTY_SEQUENCE, [
    "Effortless",
    "Easy",
    "Medium",
    "Why",
    "Hard",
    "Hard",
    "Easy",
    "Easy",
    "Medium",
    "Hard"
  ]);
});

test("medidor visual tem as 12 linhas na ordem do desenho", () => {
  assert.deepEqual([...METER_ROWS], [
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
});

test("missão dos ovos: 5 ovos com IDs únicos egg_01..egg_05", () => {
  const ids = EGG_QUEST.eggs.map((e) => e.id);
  assert.deepEqual(ids, ["egg_01", "egg_02", "egg_03", "egg_04", "egg_05"]);
  assert.equal(EGG_QUEST.total, 5);
});

test("duas caixas nos créditos, IDs únicos", () => {
  assert.equal(CREDITS_BOXES.length, 2);
  assert.equal(new Set(CREDITS_BOXES.map((b) => b.id)).size, 2);
});
