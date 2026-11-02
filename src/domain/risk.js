import { allStudentMetrics, studentMetrics } from './metrics.js';

const collator = new Intl.Collator('es', { sensitivity: 'base' });

/** Indica si un estudiante está en riesgo. */
export function isAtRisk(state, studentId, today) {
  const metrics = studentMetrics(state, studentId, today);
  return metrics !== null && metrics.status === 'en-riesgo';
}

/**
 * Estudiantes en riesgo, de mayor a menor tasa de faltas.
 * Los empates se resuelven alfabéticamente por nombre.
 */
export function listAtRisk(state, today) {
  const rows = allStudentMetrics(state, today)
    .filter((metrics) => metrics !== null && metrics.status === 'en-riesgo')
    .map((metrics) => ({
      studentId: metrics.studentId,
      fullName: metrics.fullName,
      absenceRate: metrics.absenceRate,
      absencePercentage: Math.round(metrics.absenceRate * 100),
      displayPercentage: metrics.displayPercentage,
    }));

  return rows.sort((a, b) => {
    if (b.absenceRate !== a.absenceRate) return b.absenceRate - a.absenceRate;
    return collator.compare(a.fullName, b.fullName);
  });
}
