import { el, clear } from '../dom.js';
import { allStudentMetrics } from '../../domain/metrics.js';
import { listAtRisk } from '../../domain/risk.js';
import { MESSAGES } from '../messages.js';

const STATUS_LABEL = {
  'en-riesgo': 'En riesgo',
  'sin-datos': 'Sin datos suficientes',
  ok: 'OK',
};

export function createReportsView({ root, today }) {
  const riskList = el('ul', { class: 'list', 'aria-label': 'Estudiantes en riesgo' });
  const tbody = el('tbody');
  const table = el('table', { class: 'table' }, [
    el('caption', { class: 'sr-only', text: 'Porcentaje de asistencia por estudiante' }),
    el('thead', {}, [
      el('tr', {}, [
        el('th', { scope: 'col', text: 'Estudiante' }),
        el('th', { scope: 'col', text: 'Sesiones' }),
        el('th', { scope: 'col', text: 'Asistencias' }),
        el('th', { scope: 'col', text: 'Asistencia (%)' }),
        el('th', { scope: 'col', text: 'Estado' }),
      ]),
    ]),
    tbody,
  ]);

  const heading = el('h2', { id: 'heading-reports', text: 'Reportes' });
  root.append(
    heading,
    el('section', { class: 'risk-section', 'aria-labelledby': 'heading-risk' }, [
      el('h3', { id: 'heading-risk', text: 'En riesgo' }),
      riskList,
    ]),
    table,
  );

  function render(state) {
    clear(riskList);
    const atRisk = listAtRisk(state, today());
    if (atRisk.length === 0) {
      riskList.append(el('li', { class: 'empty', text: MESSAGES.noRisk }));
    } else {
      for (const row of atRisk) {
        riskList.append(
          el('li', { class: 'row risk' }, [
            el('strong', { text: row.fullName }),
            el('span', { class: 'badge', text: `${row.absencePercentage}% de faltas` }),
          ]),
        );
      }
    }

    clear(tbody);
    const metrics = allStudentMetrics(state, today());
    if (metrics.length === 0) {
      tbody.append(
        el('tr', {}, [
          el('td', { colspan: '5', class: 'empty', text: 'Todavía no hay estudiantes registrados.' }),
        ]),
      );
      return;
    }

    for (const row of metrics) {
      tbody.append(
        el('tr', { class: row.status === 'en-riesgo' ? 'risk' : '' }, [
          el('td', { text: row.fullName }),
          el('td', { text: String(row.eligible) }),
          el('td', { text: String(row.attended) }),
          el('td', {
            text:
              row.displayPercentage === null
                ? MESSAGES.noData
                : `${row.displayPercentage}%`,
          }),
          el('td', { text: STATUS_LABEL[row.status] }),
        ]),
      );
    }
  }

  return { render, hasUnsavedChanges: () => false };
}
