# Contract: Interfaz

Contrato observable de la UI (`index.html` + `src/ui/`). La interfaz no contiene reglas de
negocio: lee el estado, llama al dominio y renderiza el resultado.

## Estructura y navegación

- Documento único `index.html` con `lang="es"`.
- Regiones: `header` con título, `nav` con enlaces a las vistas, `main`, `footer` con la
  versión.
- Vistas conmutables sin recargar: **Estudiantes**, **Sesiones**, **Asistencia**,
  **Reportes**, **Configuración**.
- El enlace activo usa `aria-current="page"`; al cambiar de vista, el foco se mueve al
  encabezado `h2` de la vista y se anuncia el cambio en `aria-live="polite"`.
- Enlace "Saltar al contenido" como primer elemento enfocable.

## Vista Estudiantes

- Formulario con campos "Nombre completo" (obligatorio) e "Identificación" (opcional),
  ambos con `<label>` asociado.
- Botón "Registrar estudiante".
- Lista ordenada alfabéticamente con nombre, identificación y fecha de registro.
- Acciones por fila: "Editar" y "Eliminar".
- Eliminar abre una confirmación explícita que menciona la pérdida del historial.
- Errores mostrados junto al campo y en `aria-live="polite"`.

## Vista Sesiones

- Formulario con "Fecha" (`input type="date"`, obligatorio) y "Nombre de la sesión"
  (opcional).
- Botón "Crear sesión".
- Lista ordenada por fecha ascendente y nombre; muestra fecha y nombre (o "Sesión sin
  nombre").
- Acciones: "Tomar asistencia" (lleva a la vista de asistencia con esa sesión) y
  "Eliminar" (con confirmación).

## Vista Asistencia

- Selector "Sesión" con las sesiones ordenadas.
- Para cada estudiante, un `fieldset` con `legend` = nombre y dos `radio`:
  "Presente" / "Falta".
- Barra o texto de resumen: "Presentes: N · Faltas: M · Sin marcar: K · Total: T".
- Botón "Guardar sesión" que confirma con "Asistencia guardada."
- Si hay cambios sin guardar y el docente cambia de vista o de sesión, se pide
  confirmación.
- Los estudiantes sin marcar se guardan implícitamente como falta en los cálculos, y la
  interfaz lo advierte antes de guardar.

## Vista Reportes

- Tabla con encabezados "Estudiante", "Sesiones", "Asistencias", "Porcentaje", "Estado".
- Porcentaje como entero con signo `%`; `null` → "Sin datos suficientes".
- Estado: "En riesgo", "Sin datos suficientes" u "OK" (texto, no solo color).
- Sección **"En riesgo"** independiente, encima de la tabla, con únicamente los estudiantes
  en riesgo, ordenados de mayor a menor porcentaje de faltas.
- Si no hay estudiantes en riesgo: "No hay estudiantes en riesgo."
- La tabla se actualiza tras cualquier cambio de asistencia, estudiante o umbral.

## Vista Configuración

- Campo "Umbral de riesgo (% de faltas)" numérico, entero 0–100, con valor actual.
- Botón "Guardar umbral"; al guardar se recalculan los reportes.
- Botón "Borrar todos los datos" con confirmación que exige una segunda acción explícita.
- Mensaje de resultado en `aria-live="polite"`.

## Accesibilidad (obligatoria)

- `lang="es"` y todo el texto visible en español.
- HTML semántico: `header`, `nav`, `main`, `section`, `table`, `fieldset`, `legend`,
  `label`, `button`.
- Navegación completa con `Tab`, `Shift+Tab`, flechas en radios y `Enter`/`Espacio` en
  botones.
- Foco visible con contraste suficiente; nunca se elimina el contorno sin reemplazo.
- Mensajes y cambios de estado anunciados con `aria-live="polite"`.
- Contraste mínimo 4.5:1 para texto normal.
- El color nunca es el único indicador; el riesgo lleva texto "En riesgo".
- Respeto a `prefers-reduced-motion` (sin animaciones imprescindibles).

## Mensajes canónicos (español)

| Situación | Mensaje |
|-----------|---------|
| Nombre vacío | "El nombre es obligatorio." |
| Identificación duplicada | "Ya existe un estudiante con esa identificación." |
| Fecha inválida | "Indica una fecha válida." |
| Sesión duplicada sin nombre | "Ya hay una sesión sin nombre en esa fecha. Escribe un nombre distinto." |
| Umbral fuera de rango | "El umbral debe ser un número entero entre 0 y 100." |
| Guardado correcto | "Cambios guardados." |
| Asistencia guardada | "Asistencia guardada." |
| Cuota llena | "No se pudieron guardar los datos: el almacenamiento del navegador está lleno." |
| Datos corruptos | "Los datos guardados estaban dañados. Se inició una lista vacía." |
| Esquema incompatible | "Se guardó una copia de los datos anteriores y se inició una lista vacía." |
| Sin riesgo | "No hay estudiantes en riesgo." |
| Sin datos | "Sin datos suficientes" |
