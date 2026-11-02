import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStorage } from '../helpers/memory-storage.js';
import { createStore, STORAGE_KEY, BACKUP_KEY } from '../../src/storage/store.js';
import { createInitialState } from '../../src/domain/state.js';

test('load devuelve el estado inicial cuando no hay datos', () => {
  const store = createStore(createMemoryStorage());
  const { state, notice } = store.load();
  assert.deepEqual(state, createInitialState());
  assert.equal(notice, null);
});

test('save y load hacen un viaje de ida y vuelta', () => {
  const storage = createMemoryStorage();
  const store = createStore(storage);
  const state = {
    ...createInitialState(),
    students: [{ id: 's1', fullName: 'Ana', code: null, registeredOn: '2026-03-01' }],
  };
  assert.deepEqual(store.save(state), { ok: true });
  assert.deepEqual(store.load().state, state);
});

test('load informa datos corruptos cuando el JSON es inválido', () => {
  const store = createStore(createMemoryStorage({ items: { [STORAGE_KEY]: '{no es json' } }));
  const result = store.load();
  assert.equal(result.notice, 'corrupted');
  assert.deepEqual(result.state, createInitialState());
});

test('load informa datos corruptos cuando la forma es incorrecta', () => {
  const store = createStore(createMemoryStorage({ items: { [STORAGE_KEY]: '{"foo":1}' } }));
  assert.equal(store.load().notice, 'corrupted');
});

test('load respalda y avisa ante una versión desconocida', () => {
  const raw = JSON.stringify({ ...createInitialState(), version: 99 });
  const storage = createMemoryStorage({ items: { [STORAGE_KEY]: raw } });
  const store = createStore(storage);
  const result = store.load();
  assert.equal(result.notice, 'recovered');
  assert.deepEqual(result.state, createInitialState());
  assert.equal(storage.getItem(BACKUP_KEY), raw);
});

test('save devuelve quota cuando el almacenamiento está lleno', () => {
  const store = createStore(createMemoryStorage({ failSet: 'quota' }));
  assert.deepEqual(store.save(createInitialState()), { ok: false, error: 'quota' });
});

test('save devuelve unavailable ante un error de acceso', () => {
  const store = createStore(createMemoryStorage({ failSet: 'unavailable' }));
  assert.deepEqual(store.save(createInitialState()), { ok: false, error: 'unavailable' });
});

test('load no lanza si el almacenamiento está denegado', () => {
  const store = createStore(createMemoryStorage({ failGet: true }));
  const result = store.load();
  assert.deepEqual(result.state, createInitialState());
  assert.equal(result.notice, null);
});

test('clear elimina el estado principal pero conserva el respaldo', () => {
  const storage = createMemoryStorage({
    items: { [STORAGE_KEY]: '{}', [BACKUP_KEY]: 'respaldo' },
  });
  const store = createStore(storage);
  assert.deepEqual(store.clear(), { ok: true });
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(storage.getItem(BACKUP_KEY), 'respaldo');
});
