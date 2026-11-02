import { el, clear } from '../dom.js';
import { sortStudents } from '../../domain/students.js';
import { MESSAGES } from '../messages.js';

export function createStudentsView({ root, today, actions }) {
  let editingId = null;

  const nameInput = el('input', { id: 'student-name', name: 'name', type: 'text', required: true, maxlength: '120', autocomplete: 'off' });
  const codeInput = el('input', { id: 'student-code', name: 'code', type: 'text', maxlength: '30', autocomplete: 'off' });
  const submitButton = el('button', { type: 'submit', class: 'primary', text: 'Registrar estudiante' });
  const cancelButton = el('button', { type: 'button', class: 'secondary', text: 'Cancelar edición', hidden: true });

  const form = el('form', { class: 'panel', novalidate: true }, [
    el('div', { class: 'field' }, [
      el('label', { for: 'student-name', text: 'Nombre completo' }),
      nameInput,
    ]),
    el('div', { class: 'field' }, [
      el('label', { for: 'student-code', text: 'Identificación (opcional)' }),
      codeInput,
    ]),
    el('div', { class: 'actions' }, [submitButton, cancelButton]),
  ]);

  const list = el('ul', { class: 'list', 'aria-label': 'Estudiantes registrados' });

  const heading = el('h2', { id: 'heading-students', text: 'Estudiantes' });
  root.append(heading, form, list);

  function resetForm() {
    editingId = null;
    nameInput.value = '';
    codeInput.value = '';
    submitButton.textContent = 'Registrar estudiante';
    cancelButton.hidden = true;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = { fullName: nameInput.value, code: codeInput.value.trim() || null };
    const result = editingId
      ? actions.updateStudent(editingId, data)
      : actions.addStudent({ ...data, registeredOn: today() });
    if (result.ok) resetForm();
    else nameInput.focus();
  });

  cancelButton.addEventListener('click', () => {
    resetForm();
    nameInput.focus();
  });

  function startEdit(student) {
    editingId = student.id;
    nameInput.value = student.fullName;
    codeInput.value = student.code ?? '';
    submitButton.textContent = 'Guardar cambios';
    cancelButton.hidden = false;
    nameInput.focus();
  }

  function buildRow(student) {
    return el('li', { class: 'row' }, [
      el('div', { class: 'row-main' }, [
        el('strong', { text: student.fullName }),
        el('span', { class: 'meta', text: student.code ? `Identificación: ${student.code}` : 'Sin identificación' }),
        el('span', { class: 'meta', text: `Registro: ${student.registeredOn}` }),
      ]),
      el('div', { class: 'actions' }, [
        el('button', { type: 'button', class: 'secondary', text: 'Editar', onclick: () => startEdit(student) }),
        el('button', {
          type: 'button',
          class: 'danger',
          text: 'Eliminar',
          onclick: () => {
            if (confirm(MESSAGES.deleteStudent(student.fullName))) actions.removeStudent(student.id);
          },
        }),
      ]),
    ]);
  }

  function render(state) {
    clear(list);
    const students = sortStudents(state.students);
    if (students.length === 0) {
      list.append(el('li', { class: 'empty', text: 'Todavía no hay estudiantes registrados.' }));
      return;
    }
    for (const student of students) list.append(buildRow(student));
  }

  return { render, hasUnsavedChanges: () => false };
}
