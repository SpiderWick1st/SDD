---
description: "Task list for Registro de Asistencia de Taller"
---

# Tasks: Registro de Asistencia de Taller

**Input**: Design documents from `/specs/001-student-attendance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Incluidos y obligatorios. La constitución exige prueba antes del código para
toda la lógica de negocio (`node --test`).

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1–US4)
- Cada tarea indica la ruta exacta del archivo

## Path Conventions

Proyecto único: `index.html`, `styles/`, `src/`, `tests/` en la raíz del repositorio.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y estructura base sin dependencias

- [x] T001 Crear `package.json` con `"type": "module"`, `"scripts": {"test": "node --test"}` y **sin** campo `dependencies`
- [x] T002 Crear `index.html` con `lang="es"`, enlace "Saltar al contenido", `header`, `nav`, `main` y `footer`
- [x] T003 Crear `styles/main.css` con estilos base accesibles: foco visible, contraste ≥ 4.5:1 y tipografía legible
- [x] T004 [P] Crear el doble de `Storage` en memoria en `tests/helpers/memory-storage.js` (métodos `getItem`, `setItem`, `removeItem`, `clear`)
- [x] T005 [P] Escribir la prueba del estado inicial en `tests/domain/state.test.js` (versión 1, umbral 20, colecciones vacías y sin mutación)
- [x] T006 Implementar `src/domain/state.js` con `createInitialState()` que devuelva `{ version: 1, settings: { riskThreshold: 20 }, students: [], sessions: [], attendance: [] }`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Núcleo compartido necesario antes de cualquier historia de usuario

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase.

- [x] T007 [P] Escribir las pruebas del almacenamiento en `tests/storage/store.test.js`: vacío, JSON inválido, forma incorrecta, versión desconocida con respaldo, `QuotaExceededError`, almacenamiento no disponible y `clear()`
- [x] T008 Implementar `src/storage/schema.js`: validación de forma del estado y constante de versión (`version: 1`)
- [x] T009 Implementar `src/storage/store.js` como `createStore(storage)` con `load()`, `save(state)` y `clear()` usando las claves `ssd:state` y `ssd:state.backup`, sin lanzar excepciones
- [x] T010 [P] Implementar `src/ui/dom.js` con utilidades de creación de elementos, escucha de eventos, anuncio en `aria-live="polite"` y traslado de foco a encabezados
- [x] T011 [P] Implementar `src/ui/messages.js` con los mensajes canónicos en español definidos en `contracts/ui.md`
- [x] T012 Implementar `src/ui/app.js`: cargar el estado, guardar tras cada mutación, mostrar avisos de datos dañados o recuperados y conmutar vistas moviendo el foco al `h2`
- [x] T013 Añadir en `index.html` la navegación y las cinco secciones vacías: Estudiantes, Sesiones, Asistencia, Reportes y Configuración

**Checkpoint**: La aplicación carga, navega sin recargar y persiste el estado vacío.

---

## Phase 3: User Story 1 - Registrar estudiantes (Priority: P1) 🎯 MVP

**Goal**: Alta, edición, baja y listado alfabético de estudiantes con persistencia.

**Independent Test**: Registrar tres estudiantes, intentar un duplicado, editar uno,
eliminar otro y recargar; los cambios deben persistir y el duplicado rechazarse.

### Tests for User Story 1 ⚠️

> **NOTE: Escribir primero y comprobar que fallan.**

- [x] T014 [P] [US1] Escribir pruebas de alta y validación en `tests/domain/students.test.js`: `fullName` recortado de 1–120 caracteres, `code` recortado ≤ 30 o `null`, unicidad de `code` sin distinguir mayúsculas y `registeredOn` con formato `YYYY-MM-DD`
- [x] T015 [US1] Escribir pruebas de edición, baja en cascada y orden alfabético en `tests/domain/students.test.js` (mismo archivo que T014; no paralelizar)

### Implementation for User Story 1

- [x] T016 [US1] Implementar `src/domain/students.js` con `addStudent`, `updateStudent`, `removeStudent` y `sortStudents` (orden con `Intl.Collator("es", { sensitivity: "base" })`), devolviendo `{ ok, state }` sin mutar la entrada
- [x] T017 [P] [US1] Implementar la vista `src/ui/views/students.js`: formulario con "Nombre completo" e "Identificación", lista ordenada, acciones "Editar" y "Eliminar" con confirmación
- [x] T018 [US1] Conectar la vista de estudiantes en `src/ui/app.js` y su sección en `index.html`

**Checkpoint**: US1 funciona y es demostrable por sí sola.

---

## Phase 4: User Story 2 - Pasar lista en una sesión (Priority: P2)

**Goal**: Crear sesiones y registrar asistencia binaria por sesión con resumen y borrador
confirmado.

**Independent Test**: Con estudiantes registrados, crear dos sesiones, marcar presentes y
faltas, guardar, recargar y comprobar que las marcas se conservaron.

### Tests for User Story 2 ⚠️

- [x] T019 [P] [US2] Escribir pruebas de sesiones en `tests/domain/sessions.test.js`: fecha válida, `name` recortado ≤ 80 o `null`, varias sesiones por fecha solo con nombres distintos, y baja en cascada
- [x] T020 [P] [US2] Escribir pruebas de asistencia en `tests/domain/attendance.test.js`: reemplazo completo por sesión, un registro por par estudiante–sesión, status `"presente"`/`"falta"`, resumen con `present`, `absent`, `unmarked`, `total`, y verificación de que guardar una sesión **no altera** los registros de las demás sesiones

### Implementation for User Story 2

- [x] T021 [US2] Implementar `src/domain/sessions.js` con `addSession`, `removeSession` y `sortSessions` (fecha ascendente y luego nombre)
- [x] T022 [US2] Implementar `src/domain/attendance.js` con `saveSessionAttendance(state, sessionId, marks)` y `sessionSummary(state, sessionId)`
- [x] T023 [P] [US2] Implementar `src/ui/views/sessions.js`: formulario fecha + nombre, lista y acciones "Tomar asistencia" y "Eliminar" con confirmación
- [x] T024 [P] [US2] Implementar `src/ui/views/attendance.js`: selector de sesión, un `fieldset`/`legend` por estudiante con radios "Presente"/"Falta", resumen en `aria-live`, aviso previo cuando quedan estudiantes sin marcar, botón "Guardar sesión" y confirmación si hay cambios sin guardar
- [x] T025 [US2] Conectar las vistas de sesiones y asistencia en `src/ui/app.js` y sus secciones en `index.html`

**Checkpoint**: US2 funciona con datos de US1 y persiste las marcas.

---

## Phase 5: User Story 3 - Consultar porcentajes (Priority: P3)

**Goal**: Mostrar por estudiante sesiones elegibles, asistencias, porcentaje y estado.

**Independent Test**: Un estudiante con 8 asistencias de 10 sesiones muestra `80%`; otro
con 2 sesiones muestra "Sin datos suficientes".

### Tests for User Story 3 ⚠️

- [x] T026 [P] [US3] Escribir pruebas de métricas en `tests/domain/metrics.test.js`: sesiones elegibles desde `registeredOn` hasta la fecha de referencia inyectada (`today`), exclusión de sesiones futuras, faltas por sesiones sin marca, `attendanceRate`, redondeo con `Math.round`, `null` y `status: "sin-datos"` con menos de 3 sesiones

### Implementation for User Story 3

- [x] T027 [US3] Implementar `src/domain/metrics.js` con `eligibleSessions(state, studentId, today)` y `studentMetrics(state, studentId, today)`, excluyendo sesiones con fecha futura
- [x] T028 [P] [US3] Implementar la tabla de reportes en `src/ui/views/reports.js`: columnas "Estudiante", "Sesiones", "Asistencias", "Porcentaje" y "Estado", con "Sin datos suficientes" cuando corresponde
- [x] T029 [US3] Conectar la vista de reportes en `src/ui/app.js` y su sección en `index.html`

**Checkpoint**: US3 muestra porcentajes correctos y se recalcula tras cada cambio.

---

## Phase 6: User Story 4 - Identificar estudiantes en riesgo (Priority: P4)

**Goal**: Evaluar el umbral configurable, listar solo a los estudiantes en riesgo y
permitir ajustar el umbral.

**Independent Test**: Con umbral 20%, un estudiante con 2 faltas de 10 aparece en la
sección "En riesgo"; otro con 1 de 10 no aparece; uno con 2 sesiones muestra "Sin datos
suficientes".

### Tests for User Story 4 ⚠️

- [x] T030 [P] [US4] Escribir pruebas de riesgo en `tests/domain/risk.test.js`: umbral inclusivo, mínimo de 3 sesiones, uso de la tasa exacta, fecha de referencia inyectada y orden descendente con desempate alfabético
- [x] T031 [P] [US4] Escribir pruebas del umbral en `tests/domain/settings.test.js`: entero 0–100, valor por defecto 20 y error `INVALID_THRESHOLD` fuera de rango

### Implementation for User Story 4

- [x] T032 [US4] Implementar `src/domain/risk.js` con `isAtRisk(state, studentId, today)` y `listAtRisk(state, today)`
- [x] T033 [US4] Implementar `src/domain/settings.js` con `setRiskThreshold`
- [x] T034 [US4] Añadir la sección "En riesgo" en `src/ui/views/reports.js`, encima de la tabla, con solo los estudiantes en riesgo y el mensaje "No hay estudiantes en riesgo." cuando esté vacía
- [x] T035 [P] [US4] Implementar `src/ui/views/settings.js`: campo de umbral, botón "Guardar umbral" y borrado total de datos con doble confirmación
- [x] T036 [US4] Conectar la vista de configuración en `src/ui/app.js` y su sección en `index.html`

**Checkpoint**: US4 identifica y ordena correctamente el riesgo y responde al cambio de umbral.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accesibilidad, robustez y validación final

- [x] T037 [P] Revisar `index.html`: etiquetas asociadas, jerarquía de encabezados, `aria-current="page"` y landmarks
- [x] T038 [P] Revisar `styles/main.css`: contraste, foco visible, estado de riesgo con texto y `prefers-reduced-motion`
- [x] T039 [P] Centralizar los anuncios de `aria-live` de todas las mutaciones en `src/ui/app.js` usando `src/ui/messages.js`
- [x] T040 Gestionar en `src/ui/app.js` los avisos de cuota llena y almacenamiento no disponible al guardar
- [x] T041 Ejecutar `node --test` y corregir todas las pruebas fallidas en `tests/**` y `src/**`
- [x] T042 Recorrer los escenarios 1–7 de `quickstart.md` y verificar los resultados esperados
- [x] T043 [P] Verificar que `package.json` no tenga dependencias y que `src/domain/**` no importe DOM ni `localStorage`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup; bloquea todas las historias.
- **US1 (Fase 3)**: depende de Foundational.
- **US2 (Fase 4)**: depende de US1 (necesita estudiantes).
- **US3 (Fase 5)**: depende de US2 (necesita sesiones y marcas).
- **US4 (Fase 6)**: depende de US3 (usa métricas) y de US2 (configuración sobre sesiones).
- **Polish (Fase 7)**: depende de todas las historias.

### Within Each User Story

1. Pruebas primero (deben fallar).
2. Dominio puro.
3. Vistas.
4. Conexión en `app.js` e `index.html`.

### Parallel Opportunities

- Fase 1: T004 y T005 (archivos distintos).
- Fase 2: T007, T010 y T011 en paralelo; T012 tras T007–T011.
- US1: T014 antes que T015 (mismo archivo); T017 puede ir en paralelo con T016.
- US2: T019 y T020 en paralelo; T023 y T024 en paralelo tras T021–T022.
- US3: T028 puede empezar en paralelo con T027 si usa datos de ejemplo.
- US4: T030 y T031 en paralelo; T035 en paralelo con T032–T034.
- Polish: T037, T038, T039 y T043 en paralelo; T040 después de T039 porque ambas tocan `src/ui/app.js`.

---

## Parallel Example: User Story 2

```bash
# Pruebas en paralelo (archivos distintos)
T019 -> tests/domain/sessions.test.js
T020 -> tests/domain/attendance.test.js

# Vistas en paralelo (archivos distintos)
T023 -> src/ui/views/sessions.js
T024 -> src/ui/views/attendance.js
```

## Parallel Example: User Story 4

```bash
T030 -> tests/domain/risk.test.js
T031 -> tests/domain/settings.test.js
T035 -> src/ui/views/settings.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (Setup).
2. Fase 2 (Foundational).
3. Fase 3 (US1).
4. **Detenerse y validar**: lista de estudiantes persistente, duplicados rechazados y
   edición/borrado funcionando.

El MVP demuestra el flujo completo de Spec Kit, aunque el valor operativo del taller llega
con US2.

### Incremental Delivery

1. Setup + Foundational → base ejecutable.
2. US1 → gestión de estudiantes.
3. US2 → toma de asistencia (núcleo operativo).
4. US3 → porcentajes.
5. US4 → riesgo y configuración.
6. Polish → accesibilidad y robustez.

### Notes

- Cada tarea de prueba debe ejecutarse y **fallar** antes de su implementación.
- No se añaden dependencias en ninguna fase.
- Los mensajes de usuario se toman literalmente de `contracts/ui.md`.
- Las restricciones de campos (longitudes, unicidad, formato de fecha) están en
  `data-model.md` y se citan en las tareas correspondientes.
