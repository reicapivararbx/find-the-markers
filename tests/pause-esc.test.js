// Lógica de prioridade ESC/pausa (espelha room-scene update) — sem Phaser.
import test from "node:test";
import assert from "node:assert/strict";

function resolveEscAction({ topModal, paused, pauseOpen, collectionOpen }) {
  if (topModal) return "modal-owns";
  if (paused || pauseOpen) {
    if (paused) return "toggle-pause";
    return "hide-pause-desync";
  }
  if (collectionOpen) return "close-collection";
  return "toggle-pause";
}

test("ESC: modal aberto não mexe em pause", () => {
  assert.equal(
    resolveEscAction({ topModal: true, paused: false, pauseOpen: false, collectionOpen: false }),
    "modal-owns"
  );
  assert.equal(
    resolveEscAction({ topModal: true, paused: true, pauseOpen: true, collectionOpen: false }),
    "modal-owns"
  );
});

test("ESC: abre e fecha pause com JustDown (1 ação)", () => {
  assert.equal(
    resolveEscAction({ topModal: false, paused: false, pauseOpen: false, collectionOpen: false }),
    "toggle-pause"
  );
  assert.equal(
    resolveEscAction({ topModal: false, paused: true, pauseOpen: true, collectionOpen: false }),
    "toggle-pause"
  );
});

test("ESC: dessync pauseOpen sem paused fecha overlay", () => {
  assert.equal(
    resolveEscAction({ topModal: false, paused: false, pauseOpen: true, collectionOpen: false }),
    "hide-pause-desync"
  );
});

test("ESC: coleção fecha antes de pause quando não pausado", () => {
  assert.equal(
    resolveEscAction({ topModal: false, paused: false, pauseOpen: false, collectionOpen: true }),
    "close-collection"
  );
});

test("togglePause simulado mantém paused e pauseOpen sincronizados", () => {
  const state = { paused: false, pauseOpen: false };
  function togglePause() {
    if (state.paused) {
      state.paused = false;
      state.pauseOpen = false;
    } else {
      state.paused = true;
      state.pauseOpen = true;
    }
  }
  togglePause();
  assert.deepEqual(state, { paused: true, pauseOpen: true });
  togglePause();
  assert.deepEqual(state, { paused: false, pauseOpen: false });
  for (let i = 0; i < 20; i += 1) togglePause();
  assert.equal(state.paused, false);
  assert.equal(state.pauseOpen, false);
});
