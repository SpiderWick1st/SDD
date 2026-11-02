import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/domain/state.js';
import { addSession, removeSession, sortSessions } from '../../src/domain/sessions.js';

function add(state, overrides = {}) {
  return addSession(state, { id: 'x1', date: '2026-03-01', name: null, ...overrides });
}

test('addSession crea y recorta el nombre', () => {
  const result = add(createInitialState(), { name: '  Introducción  ' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.sessions[0], {
    id: 'x1',
    date: '2026-03-01',
    name: 'Introducción',
  });
});

test('addSession rechaza fechas inválidas', () => {
  assert.equal(add(createInitialState(), { date: '2026-13-01' }).error.code, 'INVALID_DATE');
});

test('addSession rechaza nombres de más de 80 caracteres', () => {
  assert.equal(
    add(createInitialState(), { name: 'a'.repeat(81) }).error.code,
    'INVALID_SESSION_NAME',
  );
});

test('addSession rechaza dos sesiones sin nombre en la misma fecha', () => {
  const first = add(createInitialState());
  const second = add(first.state, { id: 'x2' });
  assert.equal(second.error.code, 'DUPLICATE_SESSION_NAME');
});

test('addSession rechaza nombres repetidos en la misma fecha sin distinguir mayúsculas', () => {
  const first = add(createInitialState(), { name: 'Práctica' });
  const second = add(first.state, { id: 'x2', name: 'práctica' });
  assert.equal(second.error.code, 'DUPLICATE_SESSION_NAME');
});

test('addSession permite varias sesiones en la misma fecha con nombres distintos', () => {
  const first = add(createInitialState(), { name: 'Práctica' });
  const second = add(first.state, { id: 'x2', name: 'Teoría' });
  assert.equal(second.ok, true);
  assert.equal(second.state.sessions.length, 2);
});

test('removeSession elimina en cascada su asistencia', () => {
  const created = add(createInitialState());
  const state = {
    ...created.state,
    attendance: [
      { studentId: 's1', sessionId: 'x1', status: 'presente' },
      { studentId: 's1', sessionId: 'x2', status: 'falta' },
    ],
  };
  const removed = removeSession(state, 'x1');
  assert.equal(removed.ok, true);
  assert.deepEqual(removed.state.attendance, [
    { studentId: 's1', sessionId: 'x2', status: 'falta' },
  ]);
});

test('removeSession rechaza sesiones inexistentes', () => {
  assert.equal(removeSession(createInitialState(), 'nope').error.code, 'UNKNOWN_SESSION');
});

test('sortSessions ordena por fecha y luego por nombre', () => {
  const sessions = [
    { id: '3', date: '2026-03-02', name: null },
    { id: '2', date: '2026-03-01', name: 'Teoría' },
    { id: '1', date: '2026-03-01', name: 'Práctica' },
  ];
  assert.deepEqual(
    sortSessions(sessions).map((session) => session.id),
    ['1', '2', '3'],
  );
});
