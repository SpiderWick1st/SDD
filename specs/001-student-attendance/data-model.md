# Data Model: Registro de Asistencia de Taller

## Almacenamiento

Un único documento JSON versionado bajo la clave `ssd:state`:

```json
{
  "version": 1,
  "settings": { "riskThreshold": 20 },
  "students": [],
  "sessions": [],
  "attendance": []
}
```

## Entidades

### Estudiante (`Student`)

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | string (UUID v4) | sí | Único en `students` |
| `fullName` | string | sí | Recortado; 1–120 caracteres; no solo espacios |
| `code` | string \| null | no | Recortado; ≤ 30 caracteres; si existe, único comparando sin distinguir mayúsculas |
| `registeredOn` | string `YYYY-MM-DD` | sí | Fecha local; fecha de corte para el cálculo |

**Relaciones**: 1 estudiante → N registros de asistencia.

### Sesión (`Session`)

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | string (UUID v4) | sí | Único en `sessions` |
| `date` | string `YYYY-MM-DD` | sí | Fecha local válida |
| `name` | string \| null | no | Recortado; ≤ 80 caracteres |

**Reglas de unicidad**: pueden existir varias sesiones en la misma fecha si sus nombres
son distintos (comparados sin distinguir mayúsculas). Si ya existe una sesión sin nombre en
esa fecha, una segunda sesión de la misma fecha **debe** llevar nombre.

**Relaciones**: 1 sesión → N registros de asistencia.

### Registro de Asistencia (`AttendanceRecord`)

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `studentId` | string | sí | Debe existir en `students` |
| `sessionId` | string | sí | Debe existir en `sessions` |
| `status` | `"presente"` \| `"falta"` | sí | Valor cerrado |

**Invariante**: como máximo un registro por par (`studentId`, `sessionId`).

### Configuración (`Settings`)

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `riskThreshold` | number (entero) | sí | 0–100; por defecto 20; representa el porcentaje de faltas |

## Valores derivados (no persistidos)

Se calculan a partir del estado y nunca se guardan:

| Derivado | Definición |
|----------|------------|
| `eligibleSessions(student)` | Sesiones con `student.registeredOn <= session.date <= hoy`; las sesiones futuras no cuentan |
| `attended(student)` | Registros `presente` en sesiones elegibles |
| `absent(student)` | `eligibleSessions.length - attended` (incluye sesiones sin marca) |
| `attendanceRate(student)` | `attended / eligibleSessions.length`, o `null` si no hay sesiones elegibles |
| `absenceRate(student)` | `absent / eligibleSessions.length`, o `null` |
| `status(student)` | `"sin-datos"` si `eligibleSessions.length < 3`; `"en-riesgo"` si `absenceRate * 100 >= riskThreshold`; en otro caso `"ok"` |
| `sessionSummary(session)` | Conteo de `presente`, de `falta` y de estudiantes sin marcar |

**Regla de presentación**: `attendanceRate * 100` se muestra redondeado al entero más
cercano (mitad hacia arriba); la comparación de riesgo usa el valor exacto.

La fecha actual (`today`, `YYYY-MM-DD`) se pasa como argumento a las funciones de cálculo
para que el dominio siga siendo puro y las pruebas sean deterministas.

**Orden de riesgo**: descendente por `absenceRate`; empate resuelto alfabéticamente por
`fullName` con `Intl.Collator("es", { sensitivity: "base" })`.

## Invariantes globales

1. Todo `studentId` de `attendance` referencia un estudiante existente.
2. Todo `sessionId` de `attendance` referencia una sesión existente.
3. No hay dos registros con el mismo par (`studentId`, `sessionId`).
4. No hay dos estudiantes con el mismo `code` no vacío.
5. `settings.riskThreshold` es un entero entre 0 y 100.
6. Eliminar un estudiante elimina en cascada sus registros de asistencia.
7. Eliminar una sesión elimina en cascada sus registros de asistencia.
8. `students` se muestra ordenado por `fullName`; `sessions` por `date` ascendente y luego
   por `name`.

## Borrador de sesión (solo UI)

La vista de asistencia mantiene un **borrador en memoria** (no persistido) con las marcas
de la sesión abierta. Al pulsar "Guardar sesión":

- Se reemplazan todos los registros de esa sesión por los del borrador
  (`saveSessionAttendance`).
- Los estudiantes sin marca no generan registro y, por tanto, cuentan como falta en los
  cálculos.
- Si el docente abandona la vista con cambios sin guardar, la interfaz pide confirmación.

## Transiciones de estado

| Acción | Cambio persistido |
|--------|-------------------|
| Registrar estudiante | Añade a `students` con `registeredOn` = fecha actual |
| Editar estudiante | Actualiza `fullName`/`code`; conserva `id` y `registeredOn` |
| Eliminar estudiante | Quita de `students` y de `attendance` en cascada |
| Crear sesión | Añade a `sessions` |
| Eliminar sesión | Quita de `sessions` y de `attendance` en cascada |
| Guardar asistencia | Reemplaza los registros de la sesión |
| Cambiar umbral | Actualiza `settings.riskThreshold` |

## Ejemplo de estado

```json
{
  "version": 1,
  "settings": { "riskThreshold": 20 },
  "students": [
    {
      "id": "2f1c9a34-5b7e-4c1d-9f0a-1a2b3c4d5e6f",
      "fullName": "Ana Pérez",
      "code": "A001",
      "registeredOn": "2026-03-02"
    },
    {
      "id": "7c8d9e01-2f3a-4b5c-8d9e-0f1a2b3c4d5e",
      "fullName": "Luis Gómez",
      "code": null,
      "registeredOn": "2026-03-02"
    }
  ],
  "sessions": [
    { "id": "s-001", "date": "2026-03-02", "name": "Introducción" },
    { "id": "s-002", "date": "2026-03-09", "name": null }
  ],
  "attendance": [
    { "studentId": "2f1c9a34-5b7e-4c1d-9f0a-1a2b3c4d5e6f", "sessionId": "s-001", "status": "presente" },
    { "studentId": "2f1c9a34-5b7e-4c1d-9f0a-1a2b3c4d5e6f", "sessionId": "s-002", "status": "falta" },
    { "studentId": "7c8d9e01-2f3a-4b5c-8d9e-0f1a2b3c4d5e", "sessionId": "s-001", "status": "falta" }
  ]
}
```
