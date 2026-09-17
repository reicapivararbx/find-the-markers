// Testes do Marker Dex: regras de exibição, busca/filtros e resumos.
import test from "node:test";
import assert from "node:assert/strict";
import { MARKERS, MARKER_BY_ID, TOTAL_MARKERS } from "../game/config/marker-registry.js";
import { HAND_DRAWN_QUESTS } from "../game/config/hand-drawn-markers.js";
import {
  markerView,
  filterMarkers,
  areaSummaries,
  achievements,
  questSummaries
} from "../game/ui/dex-logic.js";

const SAVE = {
  collectedMarkerIds: ["lilac_marker", "overgrown_marker"],
  markerLog: { lilac_marker: "2026-09-17T12:00:00.000Z" },
  quests: { quest_hidden_coins: { foundIds: ["hidden_coin_1"], completed: false } },
  discoveredEggIds: ["e1"],
  areaSeals: [],
  secretAreas: ["secret_11_greenhouse"],
  slot: { jackpotWon: false },
  menuSecrets: { championSolved: false },
  puzzleStates: {}
};

test("marker comum não encontrado mostra dados básicos + dica, sem solução", () => {
  const view = markerView(MARKER_BY_ID.spotted_marker, SAVE);
  assert.equal(view.name, "Speckled Marker");
  assert.equal(view.status, "NÃO ENCONTRADO");
  assert.ok(view.hint);
  assert.equal(view.lore, null);
  assert.equal(view.method, null);
  assert.equal(view.foundAt, null);
});

test("marker coletado revela lore, método e data de descoberta", () => {
  const view = markerView(MARKER_BY_ID.lilac_marker, SAVE);
  assert.equal(view.status, "ENCONTRADO");
  assert.equal(view.collected, true);
  assert.ok(view.lore);
  assert.ok(view.method);
  assert.equal(view.foundAt, "2026-09-17T12:00:00.000Z");
});

test("marker secreto não encontrado é puro '???' — nada vaza", () => {
  const view = markerView(MARKER_BY_ID.shadow_marker, SAVE);
  assert.equal(view.name, "???");
  assert.equal(view.difficulty, "???");
  assert.equal(view.area, "???");
  assert.equal(view.method, null);
  assert.equal(view.lore, null);
});

test("busca não vaza o nome de secreto não encontrado", () => {
  const hits = filterMarkers(MARKERS, SAVE, { query: "shade" });
  assert.equal(hits.some((d) => d.id === "shadow_marker"), false);
  const byHint = filterMarkers(MARKERS, SAVE, { query: "sombrio" });
  assert.equal(byHint.some((d) => d.id === "shadow_marker"), false);
});

test("filtros de status e dificuldade funcionam sobre dados reais", () => {
  const encontrados = filterMarkers(MARKERS, SAVE, { status: "encontrados" });
  assert.equal(encontrados.length, 2);
  const nao = filterMarkers(MARKERS, SAVE, { status: "nao_encontrados" });
  assert.equal(nao.some((d) => d.id === "lilac_marker"), false);
  const secretos = filterMarkers(MARKERS, SAVE, { status: "secretos" });
  assert.ok(secretos.length >= 4);
  assert.ok(secretos.every((d) => d.secret));
  const insane = filterMarkers(MARKERS, SAVE, { difficulty: "Insane" });
  assert.ok(insane.every((d) => d.difficulty === "Insane"));
});

test("áreas agrupam markers com progresso real", () => {
  const areas = areaSummaries(MARKERS, SAVE, { room_11_garden: "Jardim Suspenso" });
  const garden = areas.find((a) => a.roomId === "room_11_garden");
  assert.ok(garden);
  assert.equal(garden.name, "Jardim Suspenso");
  assert.equal(garden.found, 1); // overgrown_marker coletado
  assert.ok(garden.total >= 11);
});

test("conquistas derivam só de dados reais do save", () => {
  const list = achievements(SAVE, TOTAL_MARKERS);
  const primeira = list.find((a) => a.label === "Primeiro marker");
  assert.equal(primeira.ok, true);
  const completa = list.find((a) => a.label === "Coleção completa");
  assert.equal(completa.ok, false);
  const segredo = list.find((a) => a.label === "Primeira área secreta");
  assert.equal(segredo.ok, true);
});

test("quests FIND-N resumem progresso; discretas escondem o título", () => {
  const resumo = questSummaries(HAND_DRAWN_QUESTS, SAVE);
  const coins = resumo.find((q) => q.id === "quest_hidden_coins");
  assert.equal(coins.title, "Moedas Escondidas do Casino");
  assert.equal(coins.found, 1);
  const umbra = resumo.find((q) => q.id === "quest_umbra_shards");
  assert.equal(umbra.title, "???");
  assert.equal(umbra.discreet, true);
});
