<!--
Sync Impact Report
- Version: 1.0.0
- Ratified: 2026-11-01
- Last Amended: 2026-11-01
- Source: constitución definida por el autor del proyecto (prueba corta).
- Principios establecidos: 5.
- Secciones adicionales: Restricciones Técnicas, Flujo de Desarrollo, Gobernanza.
-->

# Constitución del Proyecto SSD

Aplicación web simple construida con HTML, CSS y JavaScript nativo. Este documento
define los principios no negociables que toda especificación, plan y tarea deben
respetar.

## Principios Fundamentales

### I. Cero Dependencias

La aplicación se construye únicamente con HTML, CSS y JavaScript estándar.

- Prohibido usar frameworks, librerías de terceros, polyfills o utilidades externas
  (React, Vue, jQuery, Alpine, Tailwind, etc.).
- Prohibido añadir dependencias vía `package.json` para el código de la aplicación.
- Sin paso de compilación ni empaquetado: los archivos deben ejecutarse directamente
  en el navegador.
- Se permite JavaScript moderno nativo: módulos ES (`import`/`export`), `fetch`,
  `Intl`, `AbortController`, etc.
- Solo se admite Node.js como herramienta de desarrollo para ejecutar las pruebas;
  nunca como runtime de la aplicación.

**Razón**: simplicidad, portabilidad y ausencia de mantenimiento de dependencias.

### II. Pruebas Antes del Código (NO NEGOCIABLE)

Ninguna funcionalidad se implementa antes de tener una prueba que la describa.

- Toda lógica de negocio nueva debe tener pruebas escritas con `node --test`.
- El ciclo obligatorio es: prueba escrita → prueba que falla → implementación →
  prueba que pasa → refactor.
- Las pruebas se ejecutan con `node --test` sin frameworks de testing externos
  (sin Jest, Mocha, Vitest).
- Una tarea de `tasks.md` solo se marca como completada si sus pruebas pasan.
- Los errores corregidos deben ir acompañados de una prueba de regresión.

**Razón**: garantizar comportamiento verificable y evitar regresiones en un proyecto
sin herramientas de build ni tipado.

### III. Separación entre Lógica y Interfaz

La lógica del negocio debe ser independiente de la interfaz.

- El módulo de dominio no debe acceder al DOM, a `window`, a `document` ni a
  `localStorage` directamente.
- La capa de interfaz solo traduce eventos y renderiza resultados; no contiene reglas
  de negocio.
- La lógica debe poder probarse en Node sin navegador ni DOM simulado.
- Los accesos a almacenamiento se realizan a través de un adaptador explícito, no
  dispersos por el código.

**Razón**: pruebas rápidas y deterministas, y posibilidad de reutilizar la lógica.

### IV. Datos Solo en localStorage

La persistencia se limita al `localStorage` del navegador.

- Prohibido usar backend, API remota, cookies, IndexedDB o `sessionStorage` como
  almacén principal.
- Todas las claves deben usar un prefijo del proyecto (por ejemplo `ssd:`).
- El esquema de datos debe incluir una versión y una estrategia de migración o
  descarte seguro.
- Todo acceso debe manejar `JSON.parse` fallido, cuota excedida y datos corruptos
  sin romper la aplicación.
- Prohibido almacenar datos sensibles (contraseñas, tokens, información personal
  innecesaria).
- El usuario debe poder borrar sus datos desde la interfaz.

**Razón**: la aplicación es local, sin servidor, y debe sobrevivir a datos inválidos.

### V. Interfaz en Español y Accesible

La interfaz de usuario está en español y cumple accesibilidad básica.

- Todo texto visible para el usuario debe estar en español.
- El documento debe declarar `lang="es"`.
- Uso de HTML semántico (`header`, `nav`, `main`, `section`, `button`, `label`).
- Todo control de formulario debe tener etiqueta asociada.
- La aplicación debe ser navegable completamente con teclado, con foco visible.
- Contraste mínimo de 4.5:1 para texto normal.
- Los mensajes dinámicos deben anunciarse con `aria-live`.
- No se debe transmitir información solo por color.
- Las imágenes decorativas llevan `alt=""`; las informativas, texto alternativo.
- Respetar `prefers-reduced-motion` en animaciones.

**Razón**: la aplicación debe ser usable por cualquier persona en el contexto del
proyecto.

## Restricciones Técnicas

- **Runtime del navegador**: versiones evergreen (Chrome, Firefox, Edge, Safari
  actuales). Sin transpilación.
- **Runtime de desarrollo**: Node.js 18 o superior, solo para `node --test`.
- **Estructura sugerida** (puede ajustarse en el plan de cada feature):
  ```text
  index.html
  styles/
    main.css
  src/
    domain/      # lógica pura, sin DOM
    storage/     # adaptador de localStorage
    ui/          # renderizado y eventos
  tests/
    *.test.js
  ```
- **Sin paso de build**: no hay `dist/`, ni bundler, ni minificación obligatoria.
- **Formato de código**: JavaScript con módulos ES, nombres en inglés para el código
  y en español para los textos de interfaz.

## Flujo de Desarrollo

1. **Especificar** antes de planificar y planificar antes de implementar.
2. **Prueba primero**: la tarea de prueba precede a la tarea de implementación y
   ambas deben existir en `tasks.md`.
3. **Puertas de calidad** antes de dar una tarea por terminada:
   - `node --test` pasa sin fallos.
   - No se han añadido dependencias.
   - La lógica modificada no importa APIs del navegador.
   - La interfaz nueva está en español y es accesible con teclado.
4. **Revisión de coherencia**: ejecutar `/speckit.analyze` antes de implementar y
   `/speckit.converge` si quedó trabajo pendiente.
5. **Cambios de alcance** deben reflejarse primero en `spec.md`, no directamente en
   el código.

## Gobernanza

- Esta constitución prevalece sobre cualquier otra práctica, plan o preferencia.
- Cualquier violación detectada por `/speckit.plan` o `/speckit.analyze` es crítica y
  debe corregirse en la especificación, el plan o las tareas; no puede ignorarse ni
  reinterpretarse.
- Las enmiendas requieren: justificación escrita, actualización de este documento,
  incremento de versión y revisión del impacto en artefactos existentes.
- Versionado semántico: MAYOR por eliminación o redefinición de principios, MENOR por
  añadir principios o secciones, PARCHE por aclaraciones sin cambio de reglas.
- Todo artefacto generado debe poder rastrearse hasta un requisito o principio de este
  documento.

**Versión**: 1.0.0 | **Ratificada**: 2026-11-01 | **Última enmienda**: 2026-11-01
