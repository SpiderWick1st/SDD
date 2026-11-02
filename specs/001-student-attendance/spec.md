# Feature Specification: Registro de Asistencia de Taller

**Feature Branch**: `—` (proyecto sin repositorio git; directorio `specs/001-student-attendance`)

**Created**: 2026-11-01

**Status**: Completed

**Input**: User description: "Quiero una app web para que el docente de un taller registre a sus estudiantes, marque la asistencia de cada sesión (presente o falta) y vea el porcentaje de asistencia de cada uno y quién está en riesgo por faltas."

## Clarifications

### Session 2026-11-01

- Q: ¿Cuántas sesiones debe tener un estudiante registradas antes de poder marcarlo como "en riesgo"? → A: Mínimo 3 sesiones desde su registro; antes de eso se muestra "sin datos suficientes".
- Q: ¿Con qué precisión debe mostrarse el porcentaje de asistencia al docente? → A: Entero redondeado al valor más cercano; el riesgo se calcula con el valor exacto.
- Q: ¿Cómo debe presentarse al docente la información de los estudiantes en riesgo? → A: Sección aparte "En riesgo" solo con esos estudiantes, ordenados de mayor a menor porcentaje de faltas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar estudiantes del taller (Priority: P1)

El docente abre la aplicación y registra a los estudiantes que participan en su taller,
indicando al menos su nombre. Puede ver la lista completa, corregir datos y eliminar a
quien ya no pertenece al taller.

**Why this priority**: Sin estudiantes no existe nada que registrar ni que evaluar. Es la
base sobre la que se apoyan las demás historias y por sí sola ya aporta valor (lista
ordenada del taller).

**Independent Test**: Se puede probar registrando tres estudiantes, verificando que
aparecen en la lista, editando uno y eliminando otro, sin necesidad de crear sesiones ni
marcar asistencia.

**Acceptance Scenarios**:

1. **Given** la aplicación sin estudiantes, **When** el docente registra a "Ana Pérez" con
   identificación "A001", **Then** la lista muestra a Ana Pérez con su identificación.
2. **Given** un estudiante ya registrado, **When** el docente intenta registrar otro con la
   misma identificación, **Then** el sistema rechaza la operación con un mensaje claro.
3. **Given** un estudiante registrado, **When** el docente edita su nombre, **Then** la lista
   refleja el nombre actualizado y conserva su historial de asistencia.
4. **Given** un estudiante con asistencias registradas, **When** el docente lo elimina y
   confirma, **Then** el estudiante y sus registros de asistencia desaparecen de la
   aplicación.
5. **Given** un formulario de registro, **When** el docente envía el formulario vacío,
   **Then** el sistema muestra un mensaje de error y no crea el estudiante.

---

### User Story 2 - Pasar lista en una sesión (Priority: P2)

El docente crea una sesión (el encuentro del día) y, para cada estudiante de la lista,
marca "presente" o "falta". Puede corregir marcas antes de guardar y ve un resumen de
cuántos asistieron.

**Why this priority**: Es el corazón operativo del taller y genera los datos que alimentan
los porcentajes y la detección de riesgo.

**Independent Test**: Se puede probar con estudiantes ya registrados: crear una sesión,
marcar a todos, guardar y volver a abrir la sesión para comprobar que las marcas se
conservaron.

**Acceptance Scenarios**:

1. **Given** cinco estudiantes registrados, **When** el docente crea una sesión y marca tres
   como presentes y dos como faltas, **Then** el sistema guarda la sesión con ese resultado.
2. **Given** una sesión guardada, **When** el docente vuelve a abrirla, **Then** ve las
   mismas marcas que dejó.
3. **Given** una sesión en curso, **When** el docente marca a un estudiante y luego cambia su
   estado, **Then** el sistema conserva únicamente el último estado elegido.
4. **Given** una sesión guardada, **When** el docente consulta el resumen, **Then** ve el
   número de presentes, el número de faltas y el total de estudiantes.
5. **Given** una sesión sin estudiantes marcados, **When** el docente intenta guardarla,
   **Then** el sistema advierte que faltan estudiantes por marcar (o guarda las marcas
   existentes y lo informa).

---

### User Story 3 - Consultar el porcentaje de asistencia (Priority: P3)

El docente consulta, para cada estudiante, qué porcentaje de las sesiones del taller ha
asistido.

**Why this priority**: Convierte los registros en información útil para el seguimiento del
taller y es la base para detectar riesgo.

**Independent Test**: Se puede probar con datos precargados o creados en la prueba:
verificar que un estudiante con 8 asistencias de 10 sesiones muestra 80%.

**Acceptance Scenarios**:

1. **Given** un estudiante con 8 asistencias en 10 sesiones, **When** el docente consulta su
   porcentaje, **Then** ve 80%.
2. **Given** un estudiante registrado sin ninguna sesión del taller, **When** el docente
   consulta su porcentaje, **Then** ve un indicador de "sin datos" en lugar de un porcentaje.
3. **Given** dos estudiantes con distinta asistencia, **When** el docente abre la lista de
   porcentajes, **Then** cada estudiante muestra su propio valor, sin mezclarse.

---

### User Story 4 - Identificar estudiantes en riesgo (Priority: P4)

El docente ve de forma destacada qué estudiantes están en riesgo por acumular faltas,
según el umbral definido para el taller.

**Why this priority**: Es el valor de decisión del sistema: permite actuar antes de que el
estudiante pierda el taller.

**Independent Test**: Se puede probar creando un estudiante por debajo del umbral y otro por
encima, y verificando que solo el segundo aparece marcado como "en riesgo".

**Acceptance Scenarios**:

1. **Given** un umbral de riesgo definido, **When** un estudiante alcanza o supera ese
   umbral de faltas, **Then** aparece claramente identificado como "en riesgo".
2. **Given** un estudiante justo en el límite del umbral, **When** el docente consulta el
   estado, **Then** el sistema lo marca como "en riesgo" (el límite es inclusivo) y lo
   indica de forma explícita.
3. **Given** ningún estudiante supera el umbral, **When** el docente consulta el estado,
   **Then** el sistema indica que no hay estudiantes en riesgo.
4. **Given** un estudiante con menos de 3 sesiones desde su registro, **When** el docente
   consulta su estado, **Then** ve "sin datos suficientes" y no aparece como "en riesgo".
5. **Given** varios estudiantes en riesgo con distintos porcentajes de faltas, **When** el
   docente abre la sección "En riesgo", **Then** los ve ordenados de mayor a menor
   porcentaje de faltas y solo aparecen los estudiantes en riesgo.

---

### Edge Cases

- ¿Qué ocurre si un estudiante se registra después de que ya existan sesiones? Su
  porcentaje se calcula sobre las sesiones posteriores a su registro.
- ¿Qué pasa si el docente crea dos sesiones con la misma fecha? Se permiten, pero se
  distinguen por un identificador o nombre de sesión.
- ¿Qué ocurre si se elimina la única sesión del taller? Los porcentajes pasan a "sin datos".
- ¿Qué ocurre si los datos guardados en el dispositivo están dañados o son ilegibles? El
  sistema debe iniciar con una lista vacía, avisar al docente y no bloquearse.
- ¿Qué ocurre si el almacenamiento del dispositivo está lleno? El sistema debe mostrar un
  error comprensible y no perder los datos ya guardados.
- ¿Qué ocurre si el docente intenta eliminar a un estudiante con asistencias? Se pide
  confirmación explícita antes de borrar su historial.
- ¿Qué ocurre con una sesión con fecha futura? No cuenta para el porcentaje ni para el
  riesgo hasta que llegue su fecha; al alcanzarla, pasa a contar como cualquier otra.
- ¿Qué ocurre con un estudiante que tiene menos de 3 sesiones desde su registro? Se
  muestra "sin datos suficientes"; no se calcula porcentaje ni se evalúa su riesgo.
- ¿Qué ocurre con un estudiante que no fue marcado en una sesión? Cuenta como falta según
  la regla de cálculo definida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir registrar estudiantes con nombre completo y una
  identificación del taller; el nombre es obligatorio y la identificación DEBE ser única
  cuando se informa.
- **FR-002**: El sistema DEBE mostrar la lista completa de estudiantes registrados.
- **FR-003**: El docente DEBE poder editar el nombre y la identificación de un estudiante.
- **FR-004**: El docente DEBE poder eliminar un estudiante, con confirmación previa, y el
  sistema DEBE eliminar también sus registros de asistencia.
- **FR-005**: El docente DEBE poder crear cada sesión del taller indicando la fecha y,
  opcionalmente, un nombre descriptivo. Se permiten varias sesiones en la misma fecha,
  siempre que se distingan por su nombre o identificador.
- **FR-006**: El sistema DEBE permitir marcar a cada estudiante como "presente" o "falta"
  en una sesión, con un único estado por estudiante y sesión.
- **FR-007**: El docente DEBE poder corregir el estado de asistencia de un estudiante en
  una sesión ya guardada.
- **FR-008**: El sistema DEBE mostrar, por sesión, el total de presentes, el total de
  faltas y el total de estudiantes.
- **FR-009**: El sistema DEBE calcular el porcentaje de asistencia de cada estudiante
  tomando como base las sesiones del taller realizadas desde la fecha en que el estudiante
  fue registrado; una sesión en la que el estudiante no tiene marca cuenta como falta. Solo
  se consideran las sesiones con fecha entre la fecha de registro del estudiante y la fecha
  actual; las sesiones con fecha futura no cuentan para el porcentaje.
- **FR-018**: El sistema DEBE mostrar el porcentaje de asistencia como un número entero
  redondeado al valor más cercano (por ejemplo, 66,7% se muestra como 67%). La evaluación
  de riesgo DEBE usar el valor exacto, sin redondear.
- **FR-010**: El sistema DEBE identificar como "en riesgo" a los estudiantes cuyo
  porcentaje de faltas alcance o supere un umbral configurable por el docente, con un 20%
  como valor por defecto. El riesgo solo se evalúa una vez que el estudiante acumula al
  menos 3 sesiones desde su registro.
- **FR-017**: El docente DEBE poder cambiar el umbral de riesgo, y el sistema DEBE
  recalcular de inmediato los estudiantes en riesgo.
- **FR-019**: El sistema DEBE mostrar una sección "En riesgo" independiente que contenga
  únicamente a los estudiantes en riesgo, ordenados de mayor a menor porcentaje de faltas;
  los empates se ordenan alfabéticamente por nombre.
- **FR-011**: El sistema DEBE indicar de forma explícita cuándo un estudiante no alcanza
  el mínimo de 3 sesiones desde su registro; en ese caso muestra "sin datos suficientes" y
  no calcula porcentaje ni evalúa riesgo.
- **FR-012**: El sistema DEBE conservar estudiantes, sesiones y asistencias en el
  dispositivo del docente entre aperturas de la aplicación.
- **FR-013**: El docente DEBE poder borrar todos los datos de la aplicación mediante una
  acción explícita y confirmada.
- **FR-014**: La interfaz DEBE estar completamente en español.
- **FR-015**: La interfaz DEBE ser operable solo con teclado y anunciar los cambios de
  estado relevantes a tecnologías de asistencia.
- **FR-016**: El sistema DEBE rechazar marcas de asistencia duplicadas para el mismo
  estudiante y la misma sesión.

### Key Entities *(include if feature involves data)*

- **Estudiante**: Persona inscrita en el taller. Atributos: nombre completo,
  identificación del taller (opcional pero única cuando existe) y fecha de registro. Se
  relaciona con muchos registros de asistencia.
- **Sesión**: Encuentro del taller. Atributos: fecha y nombre o identificador
  diferenciador, además del conjunto de asistencias tomadas.
- **Registro de Asistencia**: Estado de un estudiante en una sesión. Atributos: estudiante,
  sesión y estado ("presente" o "falta"). Es único por par estudiante–sesión.
- **Configuración del Taller**: Preferencias del taller, en particular el umbral de
  riesgo expresado como porcentaje de faltas (20% por defecto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El docente puede registrar un estudiante en menos de 30 segundos y un grupo
  de 30 estudiantes en menos de 5 minutos.
- **SC-002**: El docente puede tomar asistencia de un grupo de 30 estudiantes en menos de 2
  minutos.
- **SC-003**: El 100% de los porcentajes mostrados coinciden con el cálculo esperado en las
  pruebas de aceptación.
- **SC-004**: El docente identifica a los estudiantes en riesgo en menos de 5 segundos
  desde que abre la vista correspondiente.
- **SC-005**: Los datos registrados permanecen disponibles después de cerrar y volver a
  abrir la aplicación en el mismo dispositivo.
- **SC-006**: El 100% de las acciones principales (registrar, marcar, consultar, eliminar)
  se pueden completar sin ratón.
- **SC-007**: El 90% de los docentes de prueba completan el registro de una sesión de 30
  estudiantes sin ayuda externa.
- **SC-008**: Ningún dato guardado en el dispositivo se pierde al corregir una marca de
  asistencia.

## Assumptions

- Un solo taller por instalación y por dispositivo; no se gestionan varios talleres
  simultáneos en la misma aplicación.
- El uso es personal del docente: no hay inicio de sesión ni múltiples usuarios.
- La asistencia es binaria: "presente" o "falta". No se registran tardanzas, faltas
  justificadas ni permisos.
- El docente conoce la lista de estudiantes y la mantiene manualmente; no hay importación
  desde otra fuente en la primera versión.
- Los datos viven en el dispositivo del docente y no se sincronizan entre dispositivos ni
  se comparten por red.
- Se usan navegadores actuales de escritorio; el uso desde móvil es secundario.
- El umbral de riesgo es un porcentaje de faltas configurable por el docente, con 20% por
  defecto, y se aplica de forma inclusiva (alcanzarlo ya implica riesgo).
- El porcentaje de asistencia se calcula solo sobre las sesiones posteriores al registro
  del estudiante; las sesiones sin marca cuentan como falta.
- Un estudiante necesita al menos 3 sesiones desde su registro para tener porcentaje y
  evaluación de riesgo; con menos, se muestra "sin datos suficientes".
