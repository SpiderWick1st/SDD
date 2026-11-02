# Contract: Almacenamiento

Módulo `src/storage/store.js`. Es el único punto de la aplicación que conoce
`localStorage`.

## Dependencia inyectada

```js
createStore(storage = window.localStorage)
```

`storage` debe cumplir la interfaz `Storage` del navegador:

```js
{
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
```

En pruebas se inyecta un doble en memoria; nunca se usa `window.localStorage` en Node.

## Clave y forma

- Clave principal: `ssd:state`
- Clave de respaldo ante esquema incompatible: `ssd:state.backup`
- Valor: JSON de `State` según `data-model.md`.

## API

```js
load(): { state: State, notice: null | "corrupted" | "recovered" }
save(state: State): { ok: true } | { ok: false, error: "quota" | "unavailable" }
clear(): void
```

## Comportamiento

1. **Vacío**: no hay valor → devuelve `createInitialState()` con `notice: null`.
2. **JSON inválido o forma incorrecta** (falta `students`, `sessions`, `attendance` o
   `settings`; tipos erróneos): descarta el valor, devuelve estado inicial y
   `notice: "corrupted"`. No borra el valor original automáticamente.
3. **Versión desconocida o mayor que 1**: copia el valor original a `ssd:state.backup`,
   devuelve estado inicial y `notice: "recovered"`.
4. **Guardado correcto**: serializa el estado completo en `ssd:state`.
5. **`QuotaExceededError`**: devuelve `{ ok: false, error: "quota" }` y no lanza excepción.
6. **Storage no disponible** (por ejemplo, modo privado con acceso denegado): devuelve
   `{ ok: false, error: "unavailable" }`.
7. **`clear()`**: elimina `ssd:state` (no el respaldo).

## Garantías

- Ninguna otra capa accede a `localStorage`.
- `load()` nunca lanza; siempre devuelve un estado utilizable.
- `save()` no pierde el estado en memoria si falla.
