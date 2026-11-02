import { ok, fail } from './result.js';
import { isValidDate } from './dates.js';
import { collator } from './students.js';

export const MAX_SESSION_NAME_LENGTH = 80;

function normalizeSessionName(value) {
  if (value === null || value === undefined) return { value: null };
  if (typeof value !== 'string') {
    return { error: fail('INVALID_SESSION_NAME', 'El nombre de la sesión no es válido.') };
  }
  const name = value.trim();
  if (name.length === 0) return { value: null };
  if (name.length > MAX_SESSION_NAME_LENGTH) {
    return {
      error: fail('INVALID_SESSION_NAME', 'El nombre de la sesión no puede superar los 80 caracteres.'),
    };
  }
  return { value: name };
}

function nameKey(name) {
  return name === null ? '' : name.toLocaleLowerCase('es');
}

/** Crea una sesión del taller. */
export function addSession(state, { id, date, name = null }) {
  if (typeof id !== 'string' || id.length === 0) {
    return fail('UNKNOWN_SESSION', 'Falta el identificador de la sesión.');
  }
  if (!isValidDate(date)) return fail('INVALID_DATE', 'Indica una fecha válida.');
  const normalizedName = normalizeSessionName(name);
  if (normalizedName.error) return normalizedName.error;

  const sameDate = state.sessions.filter((session) => session.date === date);
  const duplicated = sameDate.some(
    (session) =>
      (session.name === null && normalizedName.value === null) ||
      (session.name !== null &&
        normalizedName.value !== null &&
        nameKey(session.name) === nameKey(normalizedName.value)),
  );
  if (duplicated) {
    return fail(
      'DUPLICATE_SESSION_NAME',
      normalizedName.value === null
        ? 'Ya hay una sesión sin nombre en esa fecha. Escribe un nombre distinto.'
        : 'Ya existe una sesión con ese nombre en esa fecha.',
    );
  }

  const session = { id, date, name: normalizedName.value };
  return ok({ ...state, sessions: [...state.sessions, session] });
}

/** Elimina una sesión y, en cascada, sus registros de asistencia. */
export function removeSession(state, id) {
  if (!state.sessions.some((session) => session.id === id)) {
    return fail('UNKNOWN_SESSION', 'La sesión no existe.');
  }
  return ok({
    ...state,
    sessions: state.sessions.filter((session) => session.id !== id),
    attendance: state.attendance.filter((record) => record.sessionId !== id),
  });
}

/** Copia ordenada por fecha ascendente y luego por nombre. */
export function sortSessions(sessions) {
  return [...sessions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const byName = collator.compare(a.name ?? '', b.name ?? '');
    return byName !== 0 ? byName : a.id.localeCompare(b.id);
  });
}
