# Quickstart: Registro de Asistencia de Taller

Guía de validación. No contiene implementación; describe cómo comprobar que la feature
funciona de extremo a extremo.

## Requisitos

- Node.js 18 o superior (solo para pruebas).
- Un servidor estático para desarrollo. Los módulos ES no cargan desde `file://`.
- Navegador evergreen de escritorio.

## Ejecutar las pruebas

```bash
cd /home/spiderwick/Documentos/Proyectos/Universidad/SSD
npm test            # equivale a: node --test
```

**Esperado**: todas las pruebas de `tests/` en verde, sin dependencias instaladas.

## Servir la aplicación

```bash
cd /home/spiderwick/Documentos/Proyectos/Universidad/SSD
python3 -m http.server 8000
```

Abrir `http://localhost:8000/`. Alternativa: cualquier servidor estático equivalente.

## Escenario 1 — Estudiantes (US1)

1. Ir a **Estudiantes**.
2. Registrar "Ana Pérez" con identificación "A001".
3. Registrar "Luis Gómez" sin identificación.
4. Intentar registrar "Otra persona" con identificación "A001".
5. Editar el nombre de Luis a "Luis Gómez Díaz".
6. Recargar la página.

**Esperado**:

- Ambos aparecen ordenados alfabéticamente.
- El duplicado se rechaza con "Ya existe un estudiante con esa identificación."
- El nombre editado persiste tras recargar.
- Ana mantiene su fecha de registro.

## Escenario 2 — Sesiones y asistencia (US2)

1. Ir a **Sesiones** y crear una sesión con la fecha de hoy, sin nombre.
2. Crear otra sesión con la misma fecha y sin nombre.
3. Crear otra con la misma fecha y nombre "Práctica".
4. Ir a **Asistencia**, elegir la sesión y marcar: Ana presente, Luis falta.
5. Pulsar "Guardar sesión"; recargar y volver a abrir la sesión.
6. Cambiar la marca de Luis a presente y guardar.

**Esperado**:

- La segunda sesión sin nombre se rechaza con el mensaje de nombre distinto.
- El resumen muestra "Presentes: 1 · Faltas: 1 · Sin marcar: 0 · Total: 2".
- Las marcas se conservan tras recargar.
- Al cambiar de vista con cambios sin guardar, se pide confirmación.

## Escenario 3 — Porcentajes (US3)

1. Crear un estudiante nuevo (se registra hoy).
2. Crear 3 sesiones con fecha de hoy o anterior y marcar 2 presentes y 1 falta.
3. Crear una sesión con fecha futura y no marcarla.
4. Abrir **Reportes**.

**Esperado**:

- Porcentaje mostrado: `67%` (2/3 = 66,67 redondeado).
- La sesión futura no altera el porcentaje ni cuenta como falta.
- Un estudiante con menos de 3 sesiones muestra "Sin datos suficientes".
- Un estudiante con 8 presentes de 10 sesiones muestra `80%`.
- Las sesiones anteriores a la fecha de registro de un estudiante no cuentan para él.

## Escenario 4 — Riesgo (US4)

1. En **Configuración**, dejar el umbral en `20`.
2. Preparar un estudiante con 10 sesiones y 2 faltas (20% de faltas).
3. Preparar otro con 10 sesiones y 1 falta (10%).
4. Preparar otro con 2 sesiones y 2 faltas.
5. Abrir **Reportes**.

**Esperado**:

- El primero aparece en la sección "En riesgo" (el límite es inclusivo).
- El segundo **no** aparece en riesgo.
- El tercero muestra "Sin datos suficientes" y no aparece en riesgo.
- Si hay varios en riesgo, están ordenados de mayor a menor porcentaje de faltas.

## Escenario 5 — Cambio de umbral

1. Con el escenario 4 preparado, cambiar el umbral a `10`.
2. Volver a **Reportes**.

**Esperado**: el estudiante con 10% de faltas pasa a estar en riesgo de inmediato.

## Escenario 6 — Robustez del almacenamiento

1. En las herramientas de desarrollo, ejecutar
   `localStorage.setItem("ssd:state", "{no es json")`.
2. Recargar.

**Esperado**: mensaje "Los datos guardados estaban dañados. Se inició una lista vacía." y
la aplicación funciona con el estado vacío.

## Escenario 7 — Accesibilidad

1. Recargar y navegar toda la aplicación solo con teclado.
2. Activar un lector de pantalla si está disponible.

**Esperado**:

- Todas las acciones son alcanzables y activables con teclado.
- El foco siempre es visible.
- Los mensajes se anuncian.
- El estado de riesgo se comunica con texto, no solo con color.

## Criterios de aceptación cubiertos

| Escenario | Requisitos |
|-----------|------------|
| 1 | FR-001 a FR-004 |
| 2 | FR-005 a FR-008, FR-016 |
| 3 | FR-009, FR-011, FR-018 |
| 4 | FR-010, FR-019 |
| 5 | FR-017 |
| 6 | FR-012, FR-013 |
| 7 | FR-014, FR-015 |
