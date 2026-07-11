/**
 * REPORTS.JS
 * Generación de reportes y exportaciones
 */

const Reports = {
  init: () => {
    UI.updateTopbar(
      'Reportes',
      'Genera y exporta reportes financieros',
      [
        {
          id: 'export-json',
          label: '📥 Respaldar JSON',
          onClick: () => Reports.exportJSON()
        },
        {
          id: 'export-csv',
          label: '📊 Exportar CSV',
          onClick: () => Reports.exportCSV()
        },
        {
          id: 'import',
          label: '📤 Restaurar',
          onClick: () => Reports.importFile()
        }
      ]
    );
  },

  render: () => {
    const container = document.getElementById('reportsContent');
    const state = StorageManager.getState();

    if (!container) return;

    const stats = StorageManager.getDataStats();

    container.innerHTML = `
      <div class="grid gap-3">
        <!-- Estadísticas -->
        <div class="summary-grid">
          ${UI.createMetric('Movimientos', stats.movementsCount, '')}
          ${UI.createMetric('Inversiones', stats.investmentsCount, '')}
          ${UI.createMetric('Metas', stats.goalsCount, '')}
          ${UI.createMetric('Categorías', stats.totalCategories, '')}
        </div>

        <!-- Secciones de Reportes -->
        <div class="grid grid-2">
          ${Reports.createReportCard('Resumen Financiero', 'summary')}
          ${Reports.createReportCard('Análisis Mensual', 'monthly')}
        </div>

        <div class="grid grid-2">
          ${Reports.createReportCard('Análisis de Inversiones', 'investments')}
          ${Reports.createReportCard('Progreso de Metas', 'goals')}
        </div>

        <!-- Datos y Respaldos -->
        <div class="panel">
          <h3>Gestión de Datos</h3>
          <div class="grid gap-2" style="margin-top: var(--space-lg);">
            <div style="padding: var(--space-lg); background: var(--bg); border-radius: var(--radius);">
              <div style="color: var(--muted); margin-bottom: var(--space-md);">
                <strong>Espacio utilizado:</strong> ${(stats.storageSize / 1024).toFixed(2)} KB
              </div>
              <div style="color: var(--muted); margin-bottom: var(--space-lg);">
                <strong>Última actualización:</strong> ${AppUtils.formatDate.format(new Date(stats.lastUpdate))}
              </div>
              <button class="btn danger" onclick="Reports.clearData()">Limpiar todos los datos</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Template para reportes -->
      <div id="reportContainer"></div>
    `;

    // Event listeners
    document.querySelectorAll('[data-report]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.report;
        Reports.generateReport(type);
      });
    });
  },

  createReportCard: (title, type) => {
    return `
      <div class="card clickable" data-report="${type}">
        <div class="panel" style="text-align: center; cursor: pointer;">
          <h3>${title}</h3>
          <p style="color: var(--muted); margin: var(--space-md) 0 0;">Haz clic para generar</p>
        </div>
      </div>
    `;
  },

  generateReport: (type) => {
    const state = StorageManager.getState();
    const container = document.getElementById('reportContainer');

    let html = '';

    switch (type) {
      case 'summary':
        html = Reports.generateSummaryReport(state);
        break;
      case 'monthly':
        html = Reports.generateMonthlyReport(state);
        break;
      case 'investments':
        html = Reports.generateInvestmentsReport(state);
        break;
      case 'goals':
        html = Reports.generateGoalsReport(state);
        break;
    }

    container.innerHTML = html;
  },

  generateSummaryReport: (state) => {
    const movements = state.movements || [];
    const investments = state.investments || [];

    const incomes = AppUtils.filter.byType(movements, 'ingreso');
    const expenses = AppUtils.filter.byType(movements, 'egreso');
    const totalIncome = AppUtils.calculate.sum(incomes, 'amount');
    const totalExpenses = AppUtils.calculate.sum(expenses, 'amount');
    const balance = totalIncome - totalExpenses;

    const investmentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const investmentCost = investments.reduce((sum, inv) => sum + (inv.quantity * inv.avgPrice), 0);

    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Resumen Financiero General</h3>
        
        <div class="grid gap-3" style="margin-top: var(--space-lg);">
          <div>
            <h4>Flujo de Dinero</h4>
            <table style="width: 100%;">
              <tr>
                <td style="padding: var(--space-md);">Ingresos Totales</td>
                <td style="padding: var(--space-md); text-align: right; color: var(--green); font-weight: 600;">
                  ${AppUtils.money.format(totalIncome)}
                </td>
              </tr>
              <tr style="border-top: 1px solid var(--line);">
                <td style="padding: var(--space-md);">Gastos Totales</td>
                <td style="padding: var(--space-md); text-align: right; color: var(--red); font-weight: 600;">
                  ${AppUtils.money.format(totalExpenses)}
                </td>
              </tr>
              <tr style="border-top: 1px solid var(--line); background: var(--bg);">
                <td style="padding: var(--space-md);"><strong>Balance</strong></td>
                <td style="padding: var(--space-md); text-align: right; font-weight: 600; color: ${balance >= 0 ? 'var(--green)' : 'var(--red)'};">
                  ${AppUtils.money.format(balance)}
                </td>
              </tr>
            </table>
          </div>

          <div>
            <h4>Patrimonio</h4>
            <table style="width: 100%;">
              <tr>
                <td style="padding: var(--space-md);">Valor de Inversiones</td>
                <td style="padding: var(--space-md); text-align: right; font-weight: 600;">
                  ${AppUtils.money.format(investmentValue)}
                </td>
              </tr>
              <tr style="border-top: 1px solid var(--line);">
                <td style="padding: var(--space-md);">Costo Base</td>
                <td style="padding: var(--space-md); text-align: right; font-weight: 600;">
                  ${AppUtils.money.format(investmentCost)}
                </td>
              </tr>
              <tr style="border-top: 1px solid var(--line); background: var(--bg);">
                <td style="padding: var(--space-md);"><strong>Ganancia/Pérdida</strong></td>
                <td style="padding: var(--space-md); text-align: right; font-weight: 600; color: ${investmentValue >= investmentCost ? 'var(--green)' : 'var(--red)'};">
                  ${AppUtils.money.format(investmentValue - investmentCost)}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  generateMonthlyReport: (state) => {
    const movements = state.movements || [];
    const monthMovements = AppUtils.filter.thisMonth(movements);
    const monthIncomes = AppUtils.filter.byType(monthMovements, 'ingreso');
    const monthExpenses = AppUtils.filter.byType(monthMovements, 'egreso');

    const grouped = AppUtils.calculate.groupByKey(monthExpenses, 'category');
    const byCategory = Object.fromEntries(
      Object.entries(grouped).map(([cat, items]) => [cat, AppUtils.calculate.sum(items, 'amount')])
    );
    const maxCat = Math.max(...Object.values(byCategory), 0) || 1;

    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Reporte Mensual</h3>
        
        <div style="margin-top: var(--space-lg);">
          <div class="summary-grid" style="margin-bottom: var(--space-lg);">
            ${UI.createMetric('Ingresos', AppUtils.money.format(AppUtils.calculate.sum(monthIncomes, 'amount')), '')}
            ${UI.createMetric('Gastos', AppUtils.money.format(AppUtils.calculate.sum(monthExpenses, 'amount')), '')}
          </div>

          <h4 style="margin-top: var(--space-lg);">Gastos por Categoría</h4>
          <div style="margin-top: var(--space-md);">
            ${Object.entries(byCategory).map(([category, amount]) => `
              <div class="bar-row">
                <strong>${category}</strong>
                <div class="bar-track">
                  <div class="bar-fill negative" style="width: ${(amount / maxCat) * 100}%"></div>
                </div>
                <span>${AppUtils.money.format(amount)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  generateInvestmentsReport: (state) => {
    const investments = state.investments || [];

    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Reporte de Inversiones</h3>
        
        <table style="width: 100%; margin-top: var(--space-lg);">
          <thead>
            <tr style="border-bottom: 2px solid var(--line);">
              <th style="padding: var(--space-md); text-align: left;">Ticker</th>
              <th style="padding: var(--space-md); text-align: left;">Tipo</th>
              <th style="padding: var(--space-md); text-align: right;">Cantidad</th>
              <th style="padding: var(--space-md); text-align: right;">Precio Promedio</th>
              <th style="padding: var(--space-md); text-align: right;">Valor Actual</th>
              <th style="padding: var(--space-md); text-align: right;">G/P</th>
            </tr>
          </thead>
          <tbody>
            ${investments.map(inv => {
              const cost = inv.quantity * inv.avgPrice;
              const value = inv.quantity * inv.currentPrice;
              const gain = value - cost;
              return `
                <tr style="border-bottom: 1px solid var(--line);">
                  <td style="padding: var(--space-md);"><strong>${inv.ticker}</strong></td>
                  <td style="padding: var(--space-md);">${inv.assetType}</td>
                  <td style="padding: var(--space-md); text-align: right;">${Number(inv.quantity || 0).toLocaleString('es-MX')}</td>
                  <td style="padding: var(--space-md); text-align: right;">${AppUtils.money.format(inv.avgPrice)}</td>
                  <td style="padding: var(--space-md); text-align: right;">${AppUtils.money.format(value)}</td>
                  <td style="padding: var(--space-md); text-align: right; color: ${gain >= 0 ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">
                    ${AppUtils.money.format(gain)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  generateGoalsReport: (state) => {
    const goals = state.goals || [];

    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Reporte de Metas</h3>
        
        <div style="margin-top: var(--space-lg);">
          ${goals.map(goal => {
            const progress = goal.progress || 0;
            const percentage = Math.min((progress / goal.targetAmount) * 100, 100);
            return `
              <div style="margin-bottom: var(--space-lg); padding: var(--space-lg); background: var(--bg); border-radius: var(--radius);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                  <h4 style="margin: 0;">${goal.name}</h4>
                  <span style="color: var(--muted);">
                    Fecha: ${AppUtils.formatDate.format(new Date(goal.targetDate))}
                  </span>
                </div>
                <div class="bar-track" style="margin-bottom: var(--space-md);">
                  <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); font-size: 0.9rem;">
                  <div>
                    <div style="color: var(--muted);">Progreso</div>
                    <strong>${AppUtils.money.format(progress)}</strong>
                  </div>
                  <div>
                    <div style="color: var(--muted);">Objetivo</div>
                    <strong>${AppUtils.money.format(goal.targetAmount)}</strong>
                  </div>
                  <div>
                    <div style="color: var(--muted);">Completado</div>
                    <strong>${percentage.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  exportJSON: () => {
    const backup = StorageManager.exportJSON();
    const filename = `finanzas-respaldo-${AppUtils.getToday()}.json`;
    AppUtils.download.json(filename, backup);
    UI.toast('Respaldo exportado correctamente', 'success');
  },

  exportCSV: () => {
    const rows = StorageManager.exportCSV();
    const filename = `finanzas-movimientos-${AppUtils.getToday()}.csv`;
    AppUtils.download.csv(filename, rows);
    UI.toast('CSV exportado correctamente', 'success');
  },

  importFile: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const success = StorageManager.importJSON(reader.result);
          if (success) {
            UI.toast('Respaldo restaurado correctamente', 'success');
            window.location.reload();
          } else {
            UI.toast('Error al restaurar el respaldo', 'error');
          }
        } catch (error) {
          UI.toast('Formato de archivo inválido', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  clearData: async () => {
    if (await UI.confirm('¿Eliminar todos los datos? Esta acción no se puede deshacer.')) {
      StorageManager.clearAll();
      window.location.reload();
    }
  }
};

window.Reports = Reports;
