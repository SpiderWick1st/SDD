import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, STATE_VERSION } from '../../src/domain/state.js';

test('createInitialState devuelve el estado inicial esperado', () => {
  assert.deepEqual(createInitialState(), {
    version: STATE_VERSION,
    settings: { riskThreshold: 20 },
    students: [],
    sessions: [],
    attendance: [],
  });
});

test('createInitialState no comparte referencias entre llamadas', () => {
  const first = createInitialState();
  const second = createInitialState();
  assert.notEqual(first.students, second.students);
  assert.notEqual(first.settings, second.settings);
  first.students.push({ id: 'x' });
  assert.equal(second.students.length, 0);
});
