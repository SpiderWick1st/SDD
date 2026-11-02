import { createStore } from '../storage/store.js';
import { createInitialState } from '../domain/state.js';
import { todayString } from '../domain/dates.js';
import { addStudent, updateStudent, removeStudent } from '../domain/students.js';
import { addSession, removeSession } from '../domain/sessions.js';
import { saveSessionAttendance } from '../domain/attendance.js';
import { setRiskThreshold } from '../domain/settings.js';
import { announce, focusHeading } from './dom.js';
import { MESSAGES } from './messages.js';
import { createStudentsView } from './views/students.js';
import { createSessionsView } from './views/sessions.js';
import { createAttendanceView } from './views/attendance.js';
import { createReportsView } from './views/reports.js';
import { createSettingsView } from './views/settings.js';

const VIEW_LABELS = {
  students: 'Estudiantes',
  sessions: 'Sesiones',
  attendance: 'Asistencia',
  reports: 'Reportes',
  settings: 'Configuración',
};

const store = createStore(window.localStorage);
const loaded = store.load();
let state = loaded.state;
let active = 'students';

const today = () => todayString();
const getState = () => state;

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderActive() {
  views[active].render(state);
}

function commit(result, successMessage = MESSAGES.saved) {
  if (!result.ok) {
    announce(result.error.message);
    return result;
  }

  state = result.state;
  const saved = store.save(state);
  if (!saved.ok) announce(MESSAGES[saved.error] ?? MESSAGES.unavailable);
  else announce(successMessage);

  renderActive();
  return result;
}

const actions = {
  addStudent(data) {
    return commit(addStudent(state, { id: newId(), ...data }));
  },
  updateStudent(id, patch) {
    return commit(updateStudent(state, id, patch));
  },
  removeStudent(id) {
    return commit(removeStudent(state, id), 'Estudiante eliminado.');
  },
  addSession(data) {
    return commit(addSession(state, { id: newId(), ...data }), 'Sesión creada.');
  },
  removeSession(id) {
    return commit(removeSession(state, id), 'Sesión eliminada.');
  },
  saveAttendance(sessionId, marks) {
    return commit(saveSessionAttendance(state, sessionId, marks), MESSAGES.attendanceSaved);
  },
  setThreshold(value) {
    return commit(setRiskThreshold(state, value), 'Umbral actualizado.');
  },
  clearData() {
    store.clear();
    state = createInitialState();
    announce(MESSAGES.cleared);
    renderActive();
  },
};

const sections = {
  students: document.getElementById('view-students'),
  sessions: document.getElementById('view-sessions'),
  attendance: document.getElementById('view-attendance'),
  reports: document.getElementById('view-reports'),
  settings: document.getElementById('view-settings'),
};

const shared = { today, actions, getState };

const views = {
  students: createStudentsView({ root: sections.students, ...shared }),
  sessions: createSessionsView({
    root: sections.sessions,
    ...shared,
    onTakeAttendance: (sessionId) => {
      switchView('attendance');
      views.attendance.selectSession(sessionId);
    },
  }),
  attendance: createAttendanceView({ root: sections.attendance, ...shared }),
  reports: createReportsView({ root: sections.reports, ...shared }),
  settings: createSettingsView({ root: sections.settings, ...shared }),
};

function updateNav() {
  for (const button of document.querySelectorAll('[data-view]')) {
    if (button.dataset.view === active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}

function switchView(name, { force = false } = {}) {
  if (!sections[name]) return;
  if (name === active) return;

  const current = views[active];
  if (!force && current.hasUnsavedChanges?.() && !confirm(MESSAGES.unsaved)) return;

  active = name;
  for (const [key, section] of Object.entries(sections)) {
    section.hidden = key !== name;
  }
  views[name].render(state);
  updateNav();
  focusHeading(sections[name].querySelector('h2'));
  announce(VIEW_LABELS[name]);
}

for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => switchView(button.dataset.view));
}

for (const [key, section] of Object.entries(sections)) {
  section.hidden = key !== active;
}
updateNav();
views.students.render(state);

if (loaded.notice === 'corrupted') announce(MESSAGES.corrupted);
if (loaded.notice === 'recovered') announce(MESSAGES.recovered);
