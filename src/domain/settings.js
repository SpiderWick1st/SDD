import { ok, fail } from './result.js';

/** Cambia el umbral de riesgo (porcentaje entero de faltas, 0–100). */
export function setRiskThreshold(state, value) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    return fail('INVALID_THRESHOLD', 'El umbral debe ser un número entero entre 0 y 100.');
  }
  return ok({ ...state, settings: { ...state.settings, riskThreshold: value } });
}
