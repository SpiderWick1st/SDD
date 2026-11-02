/**
 * Resultados uniformes del dominio.
 * Nunca se muta el estado de entrada.
 */

export function ok(state, value) {
  return value === undefined ? { ok: true, state } : { ok: true, state, value };
}

export function fail(code, message) {
  return { ok: false, error: { code, message } };
}
