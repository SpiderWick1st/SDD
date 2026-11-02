import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/domain/state.js';
import { saveSessionAttendance, sessionSummary } from '../../src/domain/attendance.js';

function baseState() {
  return {
    ...createInitialState(),
    students: [
      { id: 's1', fullName: 'Ana', code: null, registeredOn: '2026-03-01' },
      { id: 's2', fullName: 'Luis', code: null, registeredOn: '2026-03-01' },
      { id: 's3', fullName: 'Eva', code: null, registeredOn: '2026-03-01' },
    ],
    sessions: [
      { id: 'x1', date: '2026-03-01', name: null },
      { id: 'x2', date: '2026-03-02', name: null },
    ],
  };
}

test('saveSessionAttendance guarda las marcas de una sesión', () => {
  const result = saveSessionAttendance(baseState(), 'x1', [
    { studentId: 's1', status: 'presente' },
    { studentId: 's2', status: 'falta' },
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.state.attendance.length, 2);
  assert.deepEqual(
    result.state.attendance.map((record) => [record.studentId, record.status]),
    [
      ['s1', 'presente'],
      ['s2', 'falta'],
    ],
  );
});

test('saveSessionAttendance reemplaza solo la sesión indicada', () => {
  const state = {
    ...baseState(),
    attendance: [{ studentId: 's3', sessionId: 'x2', status: 'presente' }],
  };
  const result = saveSessionAttendance(state, 'x1', [
    { studentId: 's1', status: 'presente' },
  ]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.attendance, [
    { studentId: 's3', sessionId: 'x2', status: 'presente' },
    { studentId: 's1', sessionId: 'x1', status: 'presente' },
  ]);
});

test('saveSessionAttendance conserva la última marca si hay duplicados', () => {
  const result = saveSessionAttendance(baseState(), 'x1', [
    { studentId: 's1', status: 'presente' },
    { studentId: 's1', status: 'falta' },
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.state.attendance.length, 1);
  assert.equal(result.state.attendance[0].status, 'falta');
});

test('saveSessionAttendance valida sesión, estudiante y estado', () => {
  assert.equal(
    saveSessionAttendance(baseState(), 'nope', []).error.code,
    'UNKNOWN_SESSION',
  );
  assert.equal(
    saveSessionAttendance(baseState(), 'x1', [{ studentId: 'nope', status: 'presente' }]).error.code,
    'UNKNOWN_STUDENT',
  );
  assert.equal(
    saveSessionAttendance(baseState(), 'x1', [{ studentId: 's1', status: 'tarde' }]).error.code,
    'INVALID_STATUS',
  );
});

test('sessionSummary cuenta presentes, faltas, sin marcar y total', () => {
  const state = {
    ...baseState(),
    attendance: [
      { studentId: 's1', sessionId: 'x1', status: 'presente' },
      { studentId: 's2', sessionId: 'x1', status: 'falta' },
    ],
  };
  assert.deepEqual(sessionSummary(state, 'x1'), {
    present: 1,
    absent: 1,
    unmarked: 1,
    total: 3,
  });
});
