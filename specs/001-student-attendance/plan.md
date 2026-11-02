# Implementation Plan: Registro de Asistencia de Taller

**Branch**: `001-student-attendance` | **Date**: 2026-11-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-student-attendance/spec.md`

## Summary

Aplicación web estática, sin dependencias ni paso de compilación, para que un docente
registre estudiantes, tome asistencia binaria por sesión, consulte porcentajes y detecte
estudiantes en riesgo por faltas. La lógica de negocio vive en módulos puros
(`src/domain/`) sin acceso al DOM ni al almacenamiento; la interfaz (`src/ui/`) solo
traduce eventos y renderiza; la persistencia se encapsula en un adaptador sobre
`localStorage` (`src/storage/`). Las pruebas se escriben antes que el código de dominio y
se ejecutan con `node --test`.

## Technical Context

**Language/Version**: JavaScript ES2022 (módulos ES), HTML5, CSS3. Node.js 20 solo como
runtime de pruebas (mínimo 18).

**Primary Dependencies**: Ninguna en runtime. Solo APIs nativas del navegador
(`localStorage`, `Intl`, `crypto.randomUUID`) y, en pruebas, módulos integrados de Node
(`node:test`, `node:assert/strict`).

**Storage**: `localStorage` del navegador, clave única `ssd:state` con objeto versionado.

**Testing**: `node --test` con `node:assert/strict`. Pruebas de dominio puras; pruebas de
almacenamiento con un doble de `Storage` en memoria.

**Target Platform**: Navegadores evergreen de escritorio (Chrome, Firefox, Edge, Safari
actuales). Servido como archivos estáticos; sin build ni bundler.

**Project Type**: Aplicación web estática de un solo proyecto (frontend sin servidor).

**Performance Goals**: renderizar la lista de hasta 100 estudiantes en menos de 100 ms;
recalcular porcentajes y riesgo tras un cambio en menos de 50 ms.

**Constraints**: cero dependencias en runtime; sin paso de compilación; funciona offline una
vez cargada; interfaz 100% en español y navegable por teclado; datos confinados al
dispositivo del docente.

**Scale/Scope**: un taller por instalación, hasta 100 estudiantes, hasta 200 sesiones y
unos 20 000 registros de asistencia (muy por debajo del límite típico de `localStorage`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Puerta | Estado |
|-----------|--------|--------|
| I. Cero dependencias | Sin `dependencies` en `package.json`; sin frameworks ni bundler; solo APIs nativas | PASS |
| II. Pruebas antes del código | Cada tarea de dominio tendrá su prueba en `tests/` escrita antes; `node --test` como único runner | PASS |
| III. Separación lógica/UI | `src/domain/` no importa DOM, `window`, `document` ni `localStorage`; el almacenamiento se accede vía `src/storage/` | PASS |
| IV. Datos solo en localStorage | Adaptador único, clave con prefijo `ssd:`, esquema versionado, manejo de datos corruptos y cuota | PASS |
| V. Interfaz en español y accesible | `lang="es"`, HTML semántico, etiquetas, foco visible, teclado, `aria-live`, contraste y alternativa textual al color | PASS |

**Resultado**: sin violaciones. No se requiere justificación en Complexity Tracking.

**Re-evaluación tras Fase 1**: PASS. El diseño mantiene las tres capas, el adaptador único
de almacenamiento, el esquema versionado y los requisitos de accesibilidad; no aparecieron
dependencias ni fugas de implementación en la especificación.

## Project Structure

### Documentation (this feature)

```text
specs/001-student-attendance/
├── plan.md              # Este archivo
├── research.md          # Fase 0: decisiones técnicas
├── data-model.md        # Fase 1: entidades, reglas e invariantes
├── quickstart.md        # Fase 1: guía de validación manual y automática
├── contracts/           # Fase 1: contratos de dominio, almacenamiento y UI
│   ├── domain.md
│   ├── storage.md
│   └── ui.md
└── tasks.md             # Fase 2 (/speckit.tasks, no creado aquí)
```

### Source Code (repository root)

```text
index.html              # Punto de entrada único, lang="es"
package.json            # Solo metadatos y script de pruebas; sin dependencias
styles/
└── main.css            # Estilos; sin frameworks

src/
├── domain/             # Lógica pura, sin DOM ni almacenamiento
│   ├── students.js     # Alta, edición, baja y validación de estudiantes
│   ├── sessions.js     # Creación y ordenación de sesiones
│   ├── attendance.js   # Marcas de asistencia y resumen por sesión
│   ├── metrics.js      # Porcentajes y estado "sin datos suficientes"
│   ├── risk.js         # Umbral, evaluación y orden de riesgo
│   ├── settings.js     # Umbral de riesgo validado
│   └── state.js        # Estado inicial y transiciones puras
├── storage/
│   ├── schema.js       # Versión del esquema y migración/descarte seguro
│   └── store.js        # Adaptador localStorage (inyectable para pruebas)
└── ui/
    ├── app.js          # Arranque, estado en memoria y orquestación
    ├── views/
    │   ├── students.js
    │   ├── sessions.js
    │   ├── attendance.js
    │   ├── reports.js
    │   └── settings.js
    └── dom.js          # Utilidades de renderizado y eventos accesibles

tests/
├── domain/
│   ├── students.test.js
│   ├── sessions.test.js
│   ├── attendance.test.js
│   ├── metrics.test.js
│   └── risk.test.js
└── storage/
    └── store.test.js
```

**Structure Decision**: Proyecto único de tipo aplicación web estática. Se adopta la
separación en tres capas que exige la constitución: `domain` (puro y testeable en Node),
`storage` (adaptador aislado y sustituible) y `ui` (DOM y eventos). Los módulos de dominio
reciben el estado y los datos como argumentos y devuelven nuevos valores, sin efectos
secundarios, de modo que puedan probarse con `node --test` sin navegador.

## Complexity Tracking

> No hay violaciones de la constitución que justificar.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Design Decisions

- **Estado único en memoria** (`{ version, students, sessions, attendance, settings }`) y
  guardado explícito tras cada mutación; las funciones de dominio devuelven un nuevo
  estado en lugar de mutarlo.
- **Identificadores** generados con `crypto.randomUUID()` e inyectables en pruebas para
  mantener determinismo.
- **Fechas como cadenas ISO `YYYY-MM-DD`**, sin horas, para evitar problemas de zona
  horaria; la fecha de registro del estudiante es el corte inferior del cálculo y la fecha
  actual (`today`, inyectada en el dominio) el corte superior, de modo que las sesiones
  futuras no penalizan.
- **Porcentaje**: `presentes / sesiones desde el registro`; las sesiones sin marca cuentan
  como falta. Se muestra redondeado al entero más cercano; la comparación de riesgo usa el
  valor exacto.
- **Riesgo**: `faltas / sesiones >= umbral / 100`, con umbral por defecto 20% e inclusivo,
  evaluado solo con 3 o más sesiones; orden descendente por tasa de faltas y desempate
  alfabético con `Intl.Collator('es')`.
- **Accesibilidad**: secciones con encabezados, `fieldset`/`legend` para grupos de
  asistencia, mensajes en `aria-live="polite"`, foco gestionado al abrir vistas y estado de
  riesgo indicado con texto además de color.
