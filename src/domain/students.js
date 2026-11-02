import { ok, fail } from './result.js';
import { isValidDate } from './dates.js';

export const MAX_NAME_LENGTH = 120;
export const MAX_CODE_LENGTH = 30;

const collator = new Intl.Collator('es', { sensitivity: 'base' });

function normalizeName(value) {
  if (typeof value !== 'string') return { error: fail('INVALID_NAME', 'El nombre es obligatorio.') };
  const name = value.trim();
  if (name.length === 0) return { error: fail('INVALID_NAME', 'El nombre es obligatorio.') };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: fail('INVALID_NAME', 'El nombre no puede superar los 120 caracteres.') };
  }
  return { value: name };
}

function normalizeCode(value) {
  if (value === null || value === undefined) return { value: null };
  if (typeof value !== 'string') return { error: fail('INVALID_CODE', 'La identificación no es válida.') };
  const code = value.trim();
  if (code.length === 0) return { value: null };
  if (code.length > MAX_CODE_LENGTH) {
    return { error: fail('INVALID_CODE', 'La identificación no puede superar los 30 caracteres.') };
  }
  return { value: code };
}

function codeKey(code) {
  return code === null ? null : code.toLocaleLowerCase('es');
}

function hasDuplicateCode(students, code, exceptId = null) {
  if (code === null) return false;
  const key = codeKey(code);
  return students.some(
    (student) => student.id !== exceptId && student.code !== null && codeKey(student.code) === key,
  );
}

/** Registra un estudiante. */
export function addStudent(state, { id, fullName, code = null, registeredOn }) {
  if (typeof id !== 'string' || id.length === 0) {
    return fail('UNKNOWN_STUDENT', 'Falta el identificador del estudiante.');
  }
  const name = normalizeName(fullName);
  if (name.error) return name.error;
  const normalizedCode = normalizeCode(code);
  if (normalizedCode.error) return normalizedCode.error;
  if (!isValidDate(registeredOn)) return fail('INVALID_DATE', 'Indica una fecha válida.');
  if (hasDuplicateCode(state.students, normalizedCode.value)) {
    return fail('DUPLICATE_CODE', 'Ya existe un estudiante con esa identificación.');
  }

  const student = {
    id,
    fullName: name.value,
    code: normalizedCode.value,
    registeredOn,
  };
  return ok({ ...state, students: [...state.students, student] });
}

/** Edita el nombre y/o la identificación de un estudiante. */
export function updateStudent(state, id, { fullName, code } = {}) {
  const current = state.students.find((student) => student.id === id);
  if (!current) return fail('UNKNOWN_STUDENT', 'El estudiante no existe.');

  let name = current.fullName;
  if (fullName !== undefined) {
    const normalizedName = normalizeName(fullName);
    if (normalizedName.error) return normalizedName.error;
    name = normalizedName.value;
  }

  let nextCode = current.code;
  if (code !== undefined) {
    const normalizedCode = normalizeCode(code);
    if (normalizedCode.error) return normalizedCode.error;
    if (hasDuplicateCode(state.students, normalizedCode.value, id)) {
      return fail('DUPLICATE_CODE', 'Ya existe un estudiante con esa identificación.');
    }
    nextCode = normalizedCode.value;
  }

  const students = state.students.map((student) =>
    student.id === id ? { ...student, fullName: name, code: nextCode } : student,
  );
  return ok({ ...state, students });
}

/** Elimina un estudiante y, en cascada, sus registros de asistencia. */
export function removeStudent(state, id) {
  if (!state.students.some((student) => student.id === id)) {
    return fail('UNKNOWN_STUDENT', 'El estudiante no existe.');
  }
  return ok({
    ...state,
    students: state.students.filter((student) => student.id !== id),
    attendance: state.attendance.filter((record) => record.studentId !== id),
  });
}

/** Copia ordenada alfabéticamente por nombre. */
export function sortStudents(students) {
  return [...students].sort((a, b) => {
    const byName = collator.compare(a.fullName, b.fullName);
    return byName !== 0 ? byName : a.id.localeCompare(b.id);
  });
}

export { collator };
