# Research: Registro de Asistencia de Taller

Decisiones técnicas de la Fase 0. No quedan incógnitas `NEEDS CLARIFICATION`: la
constitución y la especificación resuelven el contexto técnico.

## 1. Cero dependencias y sin build

- **Decision**: Usar módulos ES nativos (`<script type="module">`) servidos como archivos
  estáticos. Sin bundler, sin transpilador, sin frameworks.
- **Rationale**: Es un requisito no negociable de la constitución y basta para el tamaño
  del proyecto.
- **Alternatives considered**: Vite/Webpack (añaden dependencias y build), un único archivo
  JS (dificulta la separación de capas y las pruebas).

## 2. Pruebas con `node --test`

- **Decision**: `node:test` + `node:assert/strict`, con archivos `tests/**/*.test.js` y
  `package.json` con `"type": "module"` y `"scripts": { "test": "node --test" }`.
- **Rationale**: Runner incluido en Node, sin dependencias, y compatible con la exigencia
  de pruebas antes del código.
- **Alternatives considered**: Jest, Vitest y Mocha (prohibidos por la constitución).

## 3. Estado puro con transiciones inmutables

- **Decision**: Un objeto de estado
  `{ version, students, sessions, attendance, settings }`; cada operación de dominio
  devuelve un nuevo estado o un resultado `{ ok, error }`, sin mutar la entrada.
- **Rationale**: Facilita pruebas deterministas y evita efectos ocultos entre capas.
- **Alternatives considered**: Clases con estado mutable y observadores (más complejo de
  probar y de razonar).

## 4. Persistencia: adaptador sobre `localStorage`

- **Decision**: Clave única `ssd:state`. El módulo `src/storage/store.js` recibe una
  interfaz tipo `Storage` (con `getItem`/`setItem`/`removeItem`), por defecto
  `window.localStorage`; las pruebas usan un doble en memoria.
- **Rationale**: Aísla el navegador, permite probar en Node y cumple el principio IV.
- **Alternatives considered**: Acceso directo disperso a `localStorage` (imposible de
  probar y viola la constitución), IndexedDB (excluido por la especificación).

## 5. Esquema versionado y recuperación

- **Decision**: El estado persistido incluye `version: 1`. Al cargar:
  - JSON inválido o forma incorrecta → se descarta, se informa al docente y se arranca con
    estado vacío.
  - Versión desconocida o superior → se conserva una copia en `ssd:state.backup` y se
    arranca vacío, informando.
  - `QuotaExceededError` al guardar → se informa y se mantiene el estado en memoria.
- **Rationale**: Cumple el caso límite de datos corruptos y cuota llena sin bloquear la
  aplicación.
- **Alternatives considered**: Migraciones automáticas complejas (innecesarias en v1);
  fallar en silencio (oculta pérdida de datos).

## 6. Fechas sin hora

- **Decision**: Las sesiones y la fecha de registro del estudiante se guardan como
  `YYYY-MM-DD` (fecha local del dispositivo).
- **Rationale**: Evita ambigüedades de zona horaria y hace trivial la comparación
  `sesion.fecha >= estudiante.fechaRegistro`.
- **Alternatives considered**: Timestamps ISO completos (introducen problemas de husos y
  de "misma fecha" para sesiones dobles).

## 7. Identificadores

- **Decision**: `crypto.randomUUID()` en la UI; las funciones de dominio aceptan el id como
  parámetro para que las pruebas sean deterministas.
- **Rationale**: Sin colisiones y sin dependencias; el dominio permanece puro.
- **Alternatives considered**: Contadores incrementales (frágiles al borrar), ids
  generados dentro del dominio (rompen determinismo).

## 8. Cálculo del porcentaje

- **Decision**:
  - Denominador = sesiones con `fecha >= fechaRegistro` del estudiante.
  - Numerador = marcas `presente` de esas sesiones.
  - Una sesión elegible sin marca cuenta como falta.
  - Con menos de 3 sesiones elegibles → estado `sin-datos` (sin porcentaje).
  - Se muestra como entero redondeado al más cercano (mitad hacia arriba).
- **Rationale**: Regla explícita, verificable y alineada con las aclaraciones Q2 y Q3.
- **Alternatives considered**: Excluir sesiones sin marcar (distorsiona el denominador y
  contradice la aclaración aceptada).

## 9. Evaluación de riesgo

- **Decision**: `enRiesgo = sesionesElegibles >= 3 && (faltas / sesionesElegibles) * 100 >= umbral`.
  Umbral configurable, entero entre 0 y 100, por defecto 20. Orden descendente por tasa de
  faltas; empate alfabético con `Intl.Collator('es', { sensitivity: 'base' })`.
- **Rationale**: El límite inclusivo y el mínimo de sesiones evitan falsos positivos;
  el orden responde al criterio de éxito SC-004.
- **Alternatives considered**: Umbral en número absoluto de faltas (descartado en Q3);
  ordenar por porcentaje de asistencia (equivalente pero menos intuitivo para "gravedad").

## 10. Accesibilidad

- **Decision**: HTML semántico, `lang="es"`, `fieldset`/`legend` por sesión, etiquetas
  asociadas, foco visible, navegación completa por teclado, `aria-live="polite"` para
  mensajes y confirmaciones, insignia textual "En riesgo" además del color, contraste
  ≥ 4.5:1 y respeto a `prefers-reduced-motion`.
- **Rationale**: Cumple el principio V y WCAG 2.1 AA en los criterios aplicables.
- **Alternatives considered**: Solo color para indicar riesgo (prohibido por la
  constitución), notificaciones con `alert()` (interrumpen y no son anunciadas de forma
  consistente).

## 11. Servir la aplicación en desarrollo

- **Decision**: Documentar `python3 -m http.server 8000` (o cualquier servidor estático
  equivalente) porque los módulos ES no cargan desde `file://`.
- **Rationale**: No añade dependencias al proyecto; es solo una herramienta de desarrollo.
- **Alternatives considered**: `npx serve` (dependencia externa), un servidor propio en
  Node (código extra sin valor para la feature).
