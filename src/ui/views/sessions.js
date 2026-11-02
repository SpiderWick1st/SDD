import { el, clear } from '../dom.js';
import { sortSessions } from '../../domain/sessions.js';
import { MESSAGES } from '../messages.js';

export function createSessionsView({ root, today, actions, onTakeAttendance }) {
  const dateInput = el('input', { id: 'session-date', name: 'date', type: 'date', required: true });
  dateInput.value = today();
  const nameInput = el('input', { id: 'session-name', name: 'name', type: 'text', maxlength: '80', autocomplete: 'off' });

  const form = el('form', { class: 'panel', novalidate: true }, [
    el('div', { class: 'field' }, [
      el('label', { for: 'session-date', text: 'Fecha' }),
      dateInput,
    ]),
    el('div', { class: 'field' }, [
      el('label', { for: 'session-name', text: 'Nombre de la sesión (opcional)' }),
      nameInput,
    ]),
    el('div', { class: 'actions' }, [
      el('button', { type: 'submit', class: 'primary', text: 'Crear sesión' }),
    ]),
  ]);

  const list = el('ul', { class: 'list', 'aria-label': 'Sesiones del taller' });
  const heading = el('h2', { id: 'heading-sessions', text: 'Sesiones' });
  root.append(heading, form, list);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = actions.addSession({
      date: dateInput.value,
      name: nameInput.value.trim() || null,
    });
    if (result.ok) {
      nameInput.value = '';
      dateInput.value = today();
    }
  });

  function render(state) {
    clear(list);
    const sessions = sortSessions(state.sessions);
    if (sessions.length === 0) {
      list.append(el('li', { class: 'empty', text: 'Todavía no hay sesiones creadas.' }));
      return;
    }
    for (const session of sessions) {
      list.append(
        el('li', { class: 'row' }, [
          el('div', { class: 'row-main' }, [
            el('strong', { text: session.name ?? 'Sesión sin nombre' }),
            el('span', { class: 'meta', text: `Fecha: ${session.date}` }),
          ]),
          el('div', { class: 'actions' }, [
            el('button', {
              type: 'button',
              class: 'primary',
              text: 'Tomar asistencia',
              onclick: () => onTakeAttendance(session.id),
            }),
            el('button', {
              type: 'button',
              class: 'danger',
              text: 'Eliminar',
              onclick: () => {
                if (confirm(MESSAGES.deleteSession)) actions.removeSession(session.id);
              },
            }),
          ]),
        ]),
      );
    }
  }

  return { render, hasUnsavedChanges: () => false };
}
