import { el } from '../dom.js';
import { MESSAGES } from '../messages.js';

export function createSettingsView({ root, actions }) {
  const input = el('input', {
    id: 'risk-threshold',
    name: 'riskThreshold',
    type: 'number',
    min: '0',
    max: '100',
    step: '1',
    required: true,
  });

  const form = el('form', { class: 'panel', novalidate: true }, [
    el('div', { class: 'field' }, [
      el('label', { for: 'risk-threshold', text: 'Umbral de riesgo (% de faltas)' }),
      input,
      el('p', { class: 'hint', text: 'Un estudiante está en riesgo cuando su porcentaje de faltas alcanza o supera este umbral. Por defecto: 20%.' }),
    ]),
    el('div', { class: 'actions' }, [
      el('button', { type: 'submit', class: 'primary', text: 'Guardar umbral' }),
    ]),
  ]);

  const clearButton = el('button', { type: 'button', class: 'danger', text: 'Borrar todos los datos' });

  const heading = el('h2', { id: 'heading-settings', text: 'Configuración' });
  root.append(
    heading,
    form,
    el('section', { class: 'panel danger-zone', 'aria-labelledby': 'heading-danger' }, [
      el('h3', { id: 'heading-danger', text: 'Datos de la aplicación' }),
      el('p', { text: 'Los datos se guardan únicamente en este navegador.' }),
      clearButton,
    ]),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = Number(input.value);
    const result = actions.setThreshold(value);
    if (!result.ok) input.focus();
  });

  clearButton.addEventListener('click', () => {
    if (!confirm(MESSAGES.clearAll)) return;
    if (!confirm(MESSAGES.clearAllAgain)) return;
    actions.clearData();
  });

  function render(state) {
    input.value = String(state.settings.riskThreshold);
  }

  return { render, hasUnsavedChanges: () => false };
}
