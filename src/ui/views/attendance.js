import { el, clear } from '../dom.js';
import { sortSessions } from '../../domain/sessions.js';
import { sortStudents } from '../../domain/students.js';
import { MESSAGES } from '../messages.js';

export function createAttendanceView({ root, actions, getState }) {
  let currentSessionId = null;
  let loadedSessionId = null;
  let draft = new Map();
  let dirty = false;

  const select = el('select', { id: 'attendance-session', name: 'session' });
  const summary = el('p', { class: 'summary', 'aria-live': 'polite' });
  const fields = el('div', { class: 'fields' });
  const saveButton = el('button', { type: 'button', class: 'primary', text: 'Guardar sesión' });
  const empty = el('p', { class: 'empty', text: 'Crea una sesión para tomar asistencia.' });

  const heading = el('h2', { id: 'heading-attendance', text: 'Asistencia' });
  root.append(
    heading,
    el('div', { class: 'field' }, [el('label', { for: 'attendance-session', text: 'Sesión' }), select]),
    summary,
    fields,
    empty,
    el('div', { class: 'actions' }, [saveButton]),
  );

  function loadDraft(state, sessionId) {
    draft = new Map(
      state.attendance
        .filter((record) => record.sessionId === sessionId)
        .map((record) => [record.studentId, record.status]),
    );
    dirty = false;
    loadedSessionId = sessionId;
  }

  function updateSummary(state) {
    const present = [...draft.values()].filter((status) => status === 'presente').length;
    const absent = [...draft.values()].filter((status) => status === 'falta').length;
    const total = state.students.length;
    const unmarked = Math.max(0, total - present - absent);
    summary.textContent = `Presentes: ${present} · Faltas: ${absent} · Sin marcar: ${unmarked} · Total: ${total}`;
  }

  function renderFields(state) {
    clear(fields);
    const students = sortStudents(state.students);
    if (students.length === 0) {
      fields.append(el('p', { class: 'empty', text: 'Registra estudiantes para tomar asistencia.' }));
      return;
    }

    for (const student of students) {
      const groupName = `status-${student.id}`;
      const current = draft.get(student.id) ?? '';
      const fieldset = el('fieldset', { class: 'student-field' }, [
        el('legend', { text: student.fullName }),
      ]);

      for (const [value, label] of [
        ['presente', 'Presente'],
        ['falta', 'Falta'],
      ]) {
        const inputId = `${groupName}-${value}`;
        const radio = el('input', {
          id: inputId,
          type: 'radio',
          name: groupName,
          value,
          checked: current === value,
        });
        radio.addEventListener('change', () => {
          if (!radio.checked) return;
          draft.set(student.id, value);
          dirty = true;
          updateSummary(getState());
        });
        fieldset.append(
          el('div', { class: 'radio' }, [radio, el('label', { for: inputId, text: label })]),
        );
      }

      fields.append(fieldset);
    }
  }

  function render(state) {
    clear(select);
    const sessions = sortSessions(state.sessions);
    for (const session of sessions) {
      select.append(
        el('option', {
          value: session.id,
          text: `${session.date} · ${session.name ?? 'Sesión sin nombre'}`,
        }),
      );
    }

    const exists = sessions.some((session) => session.id === currentSessionId);
    if (!exists) currentSessionId = sessions[0]?.id ?? null;

    const hasSession = currentSessionId !== null;
    select.disabled = !hasSession;
    saveButton.disabled = !hasSession;
    empty.hidden = hasSession;
    fields.hidden = !hasSession;
    summary.hidden = !hasSession;

    if (hasSession) {
      select.value = currentSessionId;
      if (loadedSessionId !== currentSessionId) loadDraft(state, currentSessionId);
      for (const studentId of [...draft.keys()]) {
        if (!state.students.some((student) => student.id === studentId)) draft.delete(studentId);
      }
      renderFields(state);
      updateSummary(state);
    } else {
      draft = new Map();
      dirty = false;
      loadedSessionId = null;
      updateSummary(state);
    }
  }

  select.addEventListener('change', () => {
    if (dirty && !confirm(MESSAGES.unsaved)) {
      select.value = currentSessionId;
      return;
    }
    currentSessionId = select.value;
    loadDraft(getState(), currentSessionId);
    render(getState());
  });

  saveButton.addEventListener('click', () => {
    const state = getState();
    if (currentSessionId === null) return;
    const unmarked = state.students.length - draft.size;
    if (unmarked > 0 && !confirm(MESSAGES.unmarkedWarning(unmarked))) return;

    const marks = [...draft.entries()].map(([studentId, status]) => ({ studentId, status }));
    const result = actions.saveAttendance(currentSessionId, marks);
    if (result.ok) {
      dirty = false;
      loadedSessionId = currentSessionId;
    }
  });

  function selectSession(sessionId) {
    currentSessionId = sessionId;
    loadDraft(getState(), sessionId);
    render(getState());
  }

  return {
    render,
    selectSession,
    hasUnsavedChanges: () => dirty,
  };
}
