import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/domain/state.js';
import { setRiskThreshold } from '../../src/domain/settings.js';

test('el umbral por defecto es 20', () => {
  assert.equal(createInitialState().settings.riskThreshold, 20);
});

test('setRiskThreshold acepta enteros entre 0 y 100', () => {
  assert.equal(setRiskThreshold(createInitialState(), 0).state.settings.riskThreshold, 0);
  assert.equal(setRiskThreshold(createInitialState(), 100).state.settings.riskThreshold, 100);
  assert.equal(setRiskThreshold(createInitialState(), 35).state.settings.riskThreshold, 35);
});

test('setRiskThreshold rechaza valores inválidos', () => {
  for (const value of [-1, 101, 20.5, '20', NaN]) {
    const result = setRiskThreshold(createInitialState(), value);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'INVALID_THRESHOLD');
  }
});

test('setRiskThreshold no muta el estado de entrada', () => {
  const state = createInitialState();
  const result = setRiskThreshold(state, 40);
  assert.equal(state.settings.riskThreshold, 20);
  assert.equal(result.state.settings.riskThreshold, 40);
});
