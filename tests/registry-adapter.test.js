import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GAME_ID,
  DEFAULT_MAX_PLAYERS,
  MAXIMUM_ALLOWED_PLAYERS,
  createSessionKey,
  playerProgressSlot,
} from '../game/registry-adapter.js';

test('find-the-markers capacity matches portal registry', () => {
  assert.equal(GAME_ID, 'find-the-markers');
  assert.equal(DEFAULT_MAX_PLAYERS, 8);
  assert.equal(MAXIMUM_ALLOWED_PLAYERS, 8);
});

test('createSessionKey yields 4-char runtime key', () => {
  assert.equal(createSessionKey('mk').length, 4);
  assert.match(createSessionKey('ftm1'), /^[A-Z0-9]{4}$/);
});

test('playerProgressSlot keeps marker progress separated', () => {
  const a = playerProgressSlot(1, 'A');
  const b = playerProgressSlot(2, 'B');
  assert.equal(a.separated, true);
  a.markersFound.push('m1');
  assert.equal(b.markersFound.length, 0);
});
