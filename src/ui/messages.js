export const MESSAGES = {
  saved: 'Cambios guardados.',
  attendanceSaved: 'Asistencia guardada.',
  noRisk: 'No hay estudiantes en riesgo.',
  noData: 'Sin datos suficientes',
  roleStudent: 'Estudiante',
  corrupted: 'Los datos guardados estaban dañados. Se inició una lista vacía.',
  recovered: 'Se guardó una copia de los datos anteriores y se inició una lista vacía.',
  quota: 'No se pudieron guardar los datos: el almacenamiento del navegador está lleno.',
  unavailable: 'No se pudo acceder al almacenamiento del navegador.',
  cleared: 'Se borraron todos los datos.',
  unsaved: 'Hay cambios sin guardar. ¿Salir de todos modos?',
  deleteStudent: (name) =>
    `¿Eliminar a ${name}? Se perderá también su historial de asistencia.`,
  deleteSession: '¿Eliminar esta sesión? Se perderá su asistencia registrada.',
  clearAll: '¿Borrar todos los datos de la aplicación? Esta acción no se puede deshacer.',
  clearAllAgain: 'Confirma de nuevo: se borrarán estudiantes, sesiones y asistencias.',
  unmarkedWarning: (count) =>
    `Quedan ${count} estudiantes sin marcar y contarán como falta. ¿Guardar de todos modos?`,
};

export function messageForResult(result) {
  if (!result) return '';
  if (result.ok) return MESSAGES.saved;
  return result.error?.message ?? '';
}
