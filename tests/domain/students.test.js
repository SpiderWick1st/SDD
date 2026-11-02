import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/domain/state.js';
import {
  addStudent,
  updateStudent,
  removeStudent,
  sortStudents,
} from '../../src/domain/students.js';

function withStudent(overrides = {}, state = createInitialState()) {
  return addStudent(state, {
    id: 's1',
    fullName: 'Ana Pérez',
    code: 'A001',
    registeredOn: '2026-03-01',
    ...overrides,
  });
}

test('addStudent registra y recorta nombre e identificación', () => {
  const result = withStudent({ fullName: '  Ana Pérez  ', code: '  A001  ' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.students[0], {
    id: 's1',
    fullName: 'Ana Pérez',
    code: 'A001',
    registeredOn: '2026-03-01',
  });
  assert.equal(result.state, result.state);
  assert.equal(createInitialState().students.length, 0);
});

test('addStudent rechaza nombre vacío o demasiado largo', () => {
  assert.equal(withStudent({ fullName: '   ' }).error.code, 'INVALID_NAME');
  assert.equal(withStudent({ fullName: 'a'.repeat(121) }).error.code, 'INVALID_NAME');
});

test('addStudent convierte identificación vacía en null', () => {
  const result = withStudent({ code: '   ' });
  assert.equal(result.ok, true);
  assert.equal(result.state.students[0].code, null);
});

test('addStudent rechaza identificaciones duplicadas sin distinguir mayúsculas', () => {
  const first = withStudent();
  const second = addStudent(first.state, {
    id: 's2',
    fullName: 'Luis',
    code: 'a001',
    registeredOn: '2026-03-01',
  });
  assert.equal(second.ok, false);
  assert.equal(second.error.code, 'DUPLICATE_CODE');
});

test('addStudent permite varios estudiantes sin identificación', () => {
  const first = withStudent({ code: null });
  const second = addStudent(first.state, {
    id: 's2',
    fullName: 'Luis',
    code: null,
    registeredOn: '2026-03-01',
  });
  assert.equal(second.ok, true);
});

test('addStudent rechaza fechas inválidas', () => {
  assert.equal(withStudent({ registeredOn: '2026-02-30' }).error.code, 'INVALID_DATE');
  assert.equal(withStudent({ registeredOn: '01/03/2026' }).error.code, 'INVALID_DATE');
});

test('updateStudent conserva id y fecha de registro', () => {
  const created = withStudent();
  const updated = updateStudent(created.state, 's1', { fullName: 'Ana María', code: null });
  assert.equal(updated.ok, true);
  assert.deepEqual(updated.state.students[0], {
    id: 's1',
    fullName: 'Ana María',
    code: null,
    registeredOn: '2026-03-01',
  });
});

test('updateStudent rechaza estudiantes inexistentes y códigos duplicados', () => {
  const created = withStudent();
  assert.equal(updateStudent(created.state, 'nope', { fullName: 'X' }).error.code, 'UNKNOWN_STUDENT');

  const withSecond = addStudent(created.state, {
    id: 's2',
    fullName: 'Luis',
    code: 'B002',
    registeredOn: '2026-03-02',
  });
  const duplicated = updateStudent(withSecond.state, 's2', { code: 'A001' });
  assert.equal(duplicated.error.code, 'DUPLICATE_CODE');
});

test('removeStudent elimina en cascada su asistencia', () => {
  const created = withStudent();
  const state = {
    ...created.state,
    attendance: [
      { studentId: 's1', sessionId: 'x1', status: 'presente' },
      { studentId: 's2', sessionId: 'x1', status: 'falta' },
    ],
  };
  const removed = removeStudent(state, 's1');
  assert.equal(removed.ok, true);
  assert.equal(removed.state.students.length, 0);
  assert.deepEqual(removed.state.attendance, [
    { studentId: 's2', sessionId: 'x1', status: 'falta' },
  ]);
});

test('sortStudents ordena alfabéticamente respetando acentos', () => {
  const students = [
    { id: '3', fullName: 'Beatriz', code: null, registeredOn: '2026-03-01' },
    { id: '1', fullName: 'Álvaro', code: null, registeredOn: '2026-03-01' },
    { id: '2', fullName: 'ana', code: null, registeredOn: '2026-03-01' },
  ];
  assert.deepEqual(
    sortStudents(students).map((student) => student.id),
    ['1', '2', '3'],
  );
});
