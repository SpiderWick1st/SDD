import { createInitialState, STATE_VERSION } from '../domain/state.js';
import { isValidState } from './schema.js';

export const STORAGE_KEY = 'ssd:state';
export const BACKUP_KEY = 'ssd:state.backup';

/**
 * Adaptador de almacenamiento. Es el único punto que conoce `localStorage`.
 * @param {Storage} storage implementación de la interfaz Storage
 */
export function createStore(storage) {
  return {
    /** Carga el estado; nunca lanza y siempre devuelve un estado utilizable. */
    load() {
      let raw;
      try {
        raw = storage.getItem(STORAGE_KEY);
      } catch {
        return { state: createInitialState(), notice: null };
      }

      if (raw === null || raw === undefined) {
        return { state: createInitialState(), notice: null };
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { state: createInitialState(), notice: 'corrupted' };
      }

      if (!isValidState(parsed)) {
        return { state: createInitialState(), notice: 'corrupted' };
      }

      if (parsed.version !== STATE_VERSION) {
        try {
          storage.setItem(BACKUP_KEY, raw);
        } catch {
          // Si no se puede respaldar, igualmente se informa y se arranca vacío.
        }
        return { state: createInitialState(), notice: 'recovered' };
      }

      return { state: parsed, notice: null };
    },

    /** Guarda el estado completo. No lanza. */
    save(state) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return { ok: true };
      } catch (error) {
        const name = error && error.name;
        if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          return { ok: false, error: 'quota' };
        }
        return { ok: false, error: 'unavailable' };
      }
    },

    /** Elimina el estado principal (conserva el respaldo). */
    clear() {
      try {
        storage.removeItem(STORAGE_KEY);
        return { ok: true };
      } catch {
        return { ok: false, error: 'unavailable' };
      }
    },
  };
}
