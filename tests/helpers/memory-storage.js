/**
 * Doble en memoria de la interfaz Storage, para pruebas en Node.
 */
export function createMemoryStorage({ items = {}, failSet = null, failGet = false } = {}) {
  const map = new Map(Object.entries(items));

  return {
    failSet,
    failGet,
    getItem(key) {
      if (this.failGet) throw new Error('almacenamiento denegado');
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      if (this.failSet === 'quota') {
        const error = new Error('cuota excedida');
        error.name = 'QuotaExceededError';
        throw error;
      }
      if (this.failSet === 'unavailable') {
        const error = new Error('almacenamiento no disponible');
        error.name = 'SecurityError';
        throw error;
      }
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    get length() {
      return map.size;
    },
    dump() {
      return Object.fromEntries(map);
    },
  };
}
