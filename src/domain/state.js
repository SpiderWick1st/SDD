/** Versión del esquema persistido. */
export const STATE_VERSION = 1;

/** Estado inicial de la aplicación. */
export function createInitialState() {
  return {
    version: STATE_VERSION,
    settings: { riskThreshold: 20 },
    students: [],
    sessions: [],
    attendance: [],
  };
}
