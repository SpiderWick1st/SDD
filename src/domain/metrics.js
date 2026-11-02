const collator = new Intl.Collator('es', { sensitivity: 'base' });

function findStudent(state, studentId) {
  return state.students.find((student) => student.id === studentId) ?? null;
}

/**
 * Sesiones elegibles para un estudiante: desde su registro hasta hoy (inclusive).
 * Las sesiones futuras no cuentan.
 */
export function eligibleSessions(state, studentId, today) {
  const student = findStudent(state, studentId);
  if (!student) return [];
  return state.sessions.filter(
    (session) => session.date >= student.registeredOn && session.date <= today,
  );
}

/** Métricas de asistencia de un estudiante. */
export function studentMetrics(state, studentId, today) {
  const student = findStudent(state, studentId);
  if (!student) return null;

  const eligible = eligibleSessions(state, studentId, today);
  const eligibleIds = new Set(eligible.map((session) => session.id));
  const attended = state.attendance.filter(
    (record) =>
      record.studentId === studentId &&
      record.status === 'presente' &&
      eligibleIds.has(record.sessionId),
  ).length;

  const total = eligible.length;
  const absent = total - attended;
  const hasEnoughData = total >= 3;
  const attendanceRate = hasEnoughData ? attended / total : null;
  const absenceRate = hasEnoughData ? absent / total : null;
  const displayPercentage = attendanceRate === null ? null : Math.round(attendanceRate * 100);

  let status = 'ok';
  if (!hasEnoughData) {
    status = 'sin-datos';
  } else if (absenceRate * 100 >= state.settings.riskThreshold) {
    status = 'en-riesgo';
  }

  return {
    studentId,
    fullName: student.fullName,
    eligible: total,
    attended,
    absent,
    attendanceRate,
    absenceRate,
    displayPercentage,
    status,
  };
}

/** Métricas de todos los estudiantes, ordenadas alfabéticamente. */
export function allStudentMetrics(state, today) {
  return [...state.students]
    .sort((a, b) => {
      const byName = collator.compare(a.fullName, b.fullName);
      return byName !== 0 ? byName : a.id.localeCompare(b.id);
    })
    .map((student) => studentMetrics(state, student.id, today));
}
