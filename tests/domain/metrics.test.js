import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/domain/state.js';
import { eligibleSessions, studentMetrics } from '../../src/domain/metrics.js';

const STUDENT = { id: 's1', fullName: 'Ana', code: null, registeredOn: '2026-03-01' };

function stateWith(sessionDates, attendance = [], threshold = 20) {
  return {
    ...createInitialState(),
    settings: { riskThreshold: threshold },
    students: [STUDENT],
    sessions: sessionDates.map((date, index) => ({ id: `x${index}`, date, name: null })),
    attendance,
  };
}

function marks(sessionCount, status = 'presente') {
  return Array.from({ length: sessionCount }, (_, index) => ({
    studentId: 's1',
    sessionId: `x${index}`,
    status,
  }));
}

test('eligibleSessions excluye sesiones previas al registro y sesiones futuras', () => {
  const state = stateWith(['2026-02-20', '2026-03-01', '2026-03-10', '2026-04-01']);
  const eligible = eligibleSessions(state, 's1', '2026-03-15');
  assert.deepEqual(
    eligible.map((session) => session.date),
    ['2026-03-01', '2026-03-10'],
  );
});

test('studentMetrics incluye los límites: fecha de registro y hoy', () => {
  const state = stateWith(['2026-03-01', '2026-03-15']);
  const eligible = eligibleSessions(state, 's1', '2026-03-15');
  assert.equal(eligible.length, 2);
});

test('studentMetrics calcula 8 de 10 como 80%', () => {
  const dates = Array.from({ length: 10 }, (_, i) => `2026-03-${String(i + 1).padStart(2, '0')}`);
  const state = stateWith(dates, marks(8));
  const metrics = studentMetrics(state, 's1', '2026-03-31');
  assert.equal(metrics.eligible, 10);
  assert.equal(metrics.attended, 8);
  assert.equal(metrics.absent, 2);
  assert.equal(metrics.displayPercentage, 80);
  assert.equal(metrics.attendanceRate, 0.8);
});

test('studentMetrics redondea 2 de 3 como 67 y conserva la tasa exacta', () => {
  const state = stateWith(['2026-03-01', '2026-03-02', '2026-03-03'], marks(2));
  const metrics = studentMetrics(state, 's1', '2026-03-31');
  assert.equal(metrics.displayPercentage, 67);
  assert.equal(metrics.attendanceRate, 2 / 3);
});

test('studentMetrics cuenta como falta las sesiones sin marca', () => {
  const state = stateWith(['2026-03-01', '2026-03-02', '2026-03-03'], marks(1));
  const metrics = studentMetrics(state, 's1', '2026-03-31');
  assert.equal(metrics.attended, 1);
  assert.equal(metrics.absent, 2);
  assert.equal(metrics.displayPercentage, 33);
});

test('studentMetrics devuelve sin-datos con menos de 3 sesiones', () => {
  const state = stateWith(['2026-03-01', '2026-03-02'], marks(1));
  const metrics = studentMetrics(state, 's1', '2026-03-31');
  assert.equal(metrics.status, 'sin-datos');
  assert.equal(metrics.attendanceRate, null);
  assert.equal(metrics.displayPercentage, null);
});

test('studentMetrics devuelve sin-datos sin sesiones elegibles', () => {
  const state = stateWith(['2026-04-01']);
  const metrics = studentMetrics(state, 's1', '2026-03-15');
  assert.equal(metrics.eligible, 0);
  assert.equal(metrics.status, 'sin-datos');
  assert.equal(metrics.displayPercentage, null);
});

test('studentMetrics devuelve null para un estudiante inexistente', () => {
  assert.equal(studentMetrics(stateWith([]), 'nope', '2026-03-31'), null);
});
