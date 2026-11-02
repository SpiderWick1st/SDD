import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/domain/state.js';
import { isAtRisk, listAtRisk } from '../../src/domain/risk.js';

const TODAY = '2026-03-31';
const DATES = Array.from({ length: 10 }, (_, i) => `2026-03-${String(i + 1).padStart(2, '0')}`);

function build(students, attendance, threshold = 20) {
  return {
    ...createInitialState(),
    settings: { riskThreshold: threshold },
    students,
    sessions: DATES.map((date, index) => ({ id: `x${index}`, date, name: null })),
    attendance,
  };
}

function student(id, fullName, registeredOn = '2026-03-01') {
  return { id, fullName, code: null, registeredOn };
}

function attendanceFor(studentId, absenceCount) {
  return DATES.map((_, index) => ({
    studentId,
    sessionId: `x${index}`,
    status: index < absenceCount ? 'falta' : 'presente',
  }));
}

test('umbral inclusivo: 2 faltas de 10 con umbral 20% está en riesgo', () => {
  const state = build([student('s1', 'Ana')], attendanceFor('s1', 2));
  assert.equal(isAtRisk(state, 's1', TODAY), true);
  assert.equal(listAtRisk(state, TODAY).length, 1);
});

test('1 falta de 10 con umbral 20% no está en riesgo', () => {
  const state = build([student('s1', 'Ana')], attendanceFor('s1', 1));
  assert.equal(isAtRisk(state, 's1', TODAY), false);
  assert.deepEqual(listAtRisk(state, TODAY), []);
});

test('con menos de 3 sesiones no se evalúa el riesgo aunque el porcentaje sea alto', () => {
  const dates = ['2026-03-01', '2026-03-02'];
  const state = {
    ...createInitialState(),
    students: [student('s1', 'Ana')],
    sessions: dates.map((date, index) => ({ id: `x${index}`, date, name: null })),
    attendance: [
      { studentId: 's1', sessionId: 'x0', status: 'presente' },
      { studentId: 's1', sessionId: 'x1', status: 'falta' },
    ],
  };
  assert.equal(isAtRisk(state, 's1', TODAY), false);
  assert.deepEqual(listAtRisk(state, TODAY), []);
});

test('el umbral configurable cambia la evaluación', () => {
  const state = build([student('s1', 'Ana')], attendanceFor('s1', 1), 10);
  assert.equal(isAtRisk(state, 's1', TODAY), true);
});

test('listAtRisk ordena por tasa de faltas y desempata alfabéticamente', () => {
  const students = [
    student('s1', 'Zoe'),
    student('s2', 'Ana'),
    student('s3', 'Luis'),
    student('s4', 'Eva'),
  ];
  const attendance = [
    ...attendanceFor('s1', 3),
    ...attendanceFor('s2', 3),
    ...attendanceFor('s3', 2),
    ...attendanceFor('s4', 0),
  ];
  const state = build(students, attendance);
  assert.deepEqual(
    listAtRisk(state, TODAY).map((row) => row.fullName),
    ['Ana', 'Zoe', 'Luis'],
  );
});

test('listAtRisk expone el porcentaje de faltas redondeado', () => {
  const state = build([student('s1', 'Ana')], attendanceFor('s1', 2));
  const [row] = listAtRisk(state, TODAY);
  assert.equal(row.absencePercentage, 20);
  assert.equal(row.displayPercentage, 80);
});

test('las sesiones futuras no cuentan para el riesgo', () => {
  const state = build([student('s1', 'Ana')], attendanceFor('s1', 2));
  // Al 2026-03-02 solo hay 2 sesiones elegibles: no se evalúa el riesgo.
  assert.equal(listAtRisk(state, '2026-03-02').length, 0);
  // Al 2026-03-31 las 10 sesiones ya son elegibles.
  assert.equal(listAtRisk(state, TODAY).length, 1);
});
