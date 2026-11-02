import { ok, fail } from './result.js';

const VALID_STATUSES = new Set(['presente', 'falta']);

/**
 * Reemplaza por completo los registros de asistencia de una sesión.
 * marks: Array<{ studentId, status: "presente" | "falta" }>
 */
export function saveSessionAttendance(state, sessionId, marks) {
  if (!state.sessions.some((session) => session.id === sessionId)) {
    return fail('UNKNOWN_SESSION', 'La sesión no existe.');
  }
  if (!Array.isArray(marks)) {
    return fail('INVALID_STATUS', 'Las marcas de asistencia no son válidas.');
  }

  const byStudent = new Map();
  for (const mark of marks) {
    if (!mark || typeof mark.studentId !== 'string') {
      return fail('UNKNOWN_STUDENT', 'La marca de asistencia no tiene estudiante.');
    }
    if (!state.students.some((student) => student.id === mark.studentId)) {
      return fail('UNKNOWN_STUDENT', 'El estudiante no existe.');
    }
    if (!VALID_STATUSES.has(mark.status)) {
      return fail('INVALID_STATUS', 'El estado de asistencia no es válido.');
    }
    byStudent.set(mark.studentId, mark.status);
  }

  const others = state.attendance.filter((record) => record.sessionId !== sessionId);
  const replacement = [...byStudent.entries()].map(([studentId, status]) => ({
    studentId,
    sessionId,
    status,
  }));

  return ok({ ...state, attendance: [...others, ...replacement] });
}

/** Resumen de una sesión. */
export function sessionSummary(state, sessionId) {
  const total = state.students.length;
  let present = 0;
  let absent = 0;
  for (const record of state.attendance) {
    if (record.sessionId !== sessionId) continue;
    if (record.status === 'presente') present += 1;
    else if (record.status === 'falta') absent += 1;
  }
  return { present, absent, unmarked: Math.max(0, total - present - absent), total };
}
