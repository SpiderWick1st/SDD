# Contract: Dominio

Módulos puros de `src/domain/`. No importan DOM, `window`, `document`, `localStorage` ni
módulos de `src/storage` o `src/ui`. Todas las funciones reciben el estado y devuelven un
resultado nuevo sin mutar la entrada.

## Formato de resultado

```js
// Éxito
{ ok: true, state, value? }
// Error de validación
{ ok: false, error: { code: "INVALID_NAME", message: "…" } }
```

Códigos de error permitidos: `INVALID_NAME`, `INVALID_CODE`, `DUPLICATE_CODE`,
`INVALID_DATE`, `DUPLICATE_SESSION_NAME`, `UNKNOWN_STUDENT`, `UNKNOWN_SESSION`,
`INVALID_STATUS`, `INVALID_THRESHOLD`.

## `state.js`

```js
createInitialState(): State
```

Devuelve `{ version: 1, settings: { riskThreshold: 20 }, students: [], sessions: [], attendance: [] }`.

## `students.js`

```js
addStudent(state, { id, fullName, code, registeredOn }): Result
updateStudent(state, id, { fullName?, code? }): Result
removeStudent(state, id): Result          // elimina asistencia en cascada
sortStudents(students): Student[]         // por fullName con Intl.Collator("es")
```

Reglas:

- `fullName` recortado, 1–120 caracteres, no vacío.
- `code` recortado; `null`/vacío → `null`; ≤ 30 caracteres; único sin distinguir mayúsculas.
- `registeredOn` con formato `YYYY-MM-DD` y fecha válida.
- `updateStudent` conserva `id` y `registeredOn`.

## `sessions.js`

```js
addSession(state, { id, date, name }): Result
removeSession(state, id): Result          // elimina asistencia en cascada
sortSessions(sessions): Session[]         // por date asc y luego name
```

Reglas:

- `date` con formato `YYYY-MM-DD` y fecha válida.
- `name` recortado; vacío → `null`.
- Varias sesiones por fecha solo si sus nombres difieren; si ya hay una sesión sin nombre en
  esa fecha, la nueva debe llevar nombre.

## `attendance.js`

```js
saveSessionAttendance(state, sessionId, marks): Result
  // marks: Array<{ studentId, status: "presente" | "falta" }>
sessionSummary(state, sessionId): { present, absent, unmarked, total }
```

Reglas:

- `sessionId` debe existir; cada `studentId` debe existir; `status` debe ser válido.
- Reemplaza por completo los registros previos de esa sesión.
- Ignora duplicados del mismo `studentId` dentro de `marks` (gana el último).
- Los estudiantes sin marca no generan registro.

## `metrics.js`

```js
eligibleSessions(state, studentId, today): Session[]
studentMetrics(state, studentId, today): {
  eligible, attended, absent,
  attendanceRate: number | null,   // 0..1
  displayPercentage: number | null, // entero redondeado, mitad hacia arriba
  status: "sin-datos" | "ok" | "en-riesgo"
}
```

Reglas:

- `today` es una fecha `YYYY-MM-DD` inyectada por la capa de UI (para pruebas deterministas).
- Sesiones elegibles: `student.registeredOn <= session.date <= today`. Las sesiones con
  fecha futura se excluyen.
- `absent = eligible - attended`; las sesiones sin marca cuentan como falta.
- `eligible < 3` → `attendanceRate = null`, `displayPercentage = null`,
  `status = "sin-datos"`.
- `displayPercentage = Math.round(attendanceRate * 100)`; `Math.round` redondea la mitad
  hacia arriba en valores positivos.

## `risk.js`

```js
isAtRisk(state, studentId, today): boolean
listAtRisk(state, today): Array<{
  studentId, fullName, absenceRate, absencePercentage, displayPercentage
}>
```

Reglas:

- `absenceRate = absent / eligible` (valor exacto, sin redondear).
- En riesgo si `eligible >= 3 && absenceRate * 100 >= settings.riskThreshold`.
- Umbral inclusivo.
- Orden descendente por `absenceRate`; empate alfabético por `fullName` con
  `Intl.Collator("es", { sensitivity: "base" })`.
- `absencePercentage` es el entero redondeado para mostrar.

## `settings.js`

```js
setRiskThreshold(state, value): Result
```

Reglas: entero entre 0 y 100; fuera de rango → `INVALID_THRESHOLD`.
