import { STATE_VERSION } from '../domain/state.js';

export { STATE_VERSION };

const VALID_STATUSES = new Set(['presente', 'falta']);

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStudent(value) {
  return (
    isPlainObject(value) &&
    typeof value.id === 'string' &&
    typeof value.fullName === 'string' &&
    (value.code === null || typeof value.code === 'string') &&
    typeof value.registeredOn === 'string'
  );
}

function isSession(value) {
  return (
    isPlainObject(value) &&
    typeof value.id === 'string' &&
    typeof value.date === 'string' &&
    (value.name === null || typeof value.name === 'string')
  );
}

function isAttendanceRecord(value) {
  return (
    isPlainObject(value) &&
    typeof value.studentId === 'string' &&
    typeof value.sessionId === 'string' &&
    VALID_STATUSES.has(value.status)
  );
}

/**
 * Valida la forma del estado persistido (independiente de la versión).
 * Se usa para detectar datos corruptos antes de decidir si migrar o descartar.
 */
export function isValidState(value) {
  return (
    isPlainObject(value) &&
    typeof value.version === 'number' &&
    isPlainObject(value.settings) &&
    Number.isInteger(value.settings.riskThreshold) &&
    value.settings.riskThreshold >= 0 &&
    value.settings.riskThreshold <= 100 &&
    Array.isArray(value.students) &&
    value.students.every(isStudent) &&
    Array.isArray(value.sessions) &&
    value.sessions.every(isSession) &&
    Array.isArray(value.attendance) &&
    value.attendance.every(isAttendanceRecord)
  );
}
