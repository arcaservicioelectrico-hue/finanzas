/**
 * DASHBOARD.JS - CORREGIDO
 * Vista de resumen general de finanzas
 */

const Dashboard = {
  init: function() {
    UI.updateTopbar('Dashboard', 'Resumen general de tu situación financiera', []);
  },

  render: function() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    const state = StorageManager.getState();
    const metrics = this.calculateMetrics(state);

    container.innerHTML =
      '<div class="grid">' +
        '<div class="summary-grid">' +
          this.renderMetric('Patrimonio', metrics.patrimony, '') +
          this.renderMetric('Ingresos', metrics.totalIncome, '') +
          this.renderMetric('Gastos', metrics.totalExpenses, '') +
          this.renderMetric('Movimientos', metrics.movementCount, '') +
        '</div>' +

        '<div class="grid grid-2" style="gap:15px;">' +
          '<div class="panel">' +
            '<h3>Gastos por Categoría</h3>' +
            '<canvas id="dashDonut" width="360" height="240" style="max-width:100%;"></canvas>' +
            '<div id="dashDonutLegend" style="margin-top:10px;"></div>' +
          '</div>' +
          '<div class="panel">' +
            '<h3>Ingresos vs Gastos (últimos 6 meses)</h3>' +
            '<canvas id="dashBars" width="360" height="240" style="max-width:100%;"></canvas>' +
            '<div id="dashBarsLegend" style="margin-top:10px; font-size:12px; color:#666; display:flex; gap:15px;">' +
              '<span><span style="display:inline-block;width:10px;height:10px;background:#15724b;border-radius:2px;"></span> Ingresos</span>' +
              '<span><span style="display:inline-block;width:10px;height:10px;background:#e94e1b;border-radius:2px;"></span> Gastos</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="panel">' +
          '<h3>Últimos Movimientos</h3>' +
          this.renderRecentMovements(state) +
        '</div>' +
      '</div>';

    // Renderiza gráficas después de insertar los canvas
    setTimeout(function() { Dashboard.renderCharts(state); }, 0);
  },

  renderCharts: function(state) {
    const movements = state.movements || [];

    // Donut: gastos por categoría (mes actual)
    const monthExpenses = AppUtils.filter.byType(AppUtils.filter.thisMonth(movements), 'egreso');
    const grouped = AppUtils.calculate.groupByKey(monthExpenses, 'category');
    const byCategory = {};
    Object.keys(grouped).forEach(function(cat) {
      byCategory[cat] = AppUtils.calculate.sum(grouped[cat], 'amount');
    });
    Charts.renderDonut('dashDonut', byCategory, document.getElementById('dashDonutLegend'));

    // Barras: ingreso vs gasto últimos 6 meses
    Dashboard.renderMonthlyBars(movements);
  },

  renderMonthlyBars: function(movements) {
    const canvas = document.getElementById('dashBars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fbfcfb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('es-MX', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expense: 0
      });
    }

    movements.forEach(function(m) {
      if (!m || !m.date) return;
      const d = new Date(m.date);
      const bucket = months.find(function(b){ return b.year === d.getFullYear() && b.month === d.getMonth(); });
      if (!bucket) return;
      const amt = parseFloat(m.amount) || 0;
      if (m.type === 'ingreso') bucket.income += amt;
      else if (m.type === 'egreso') bucket.expense += amt;
    });

    const pad = { left: 40, right: 20, top: 20, bottom: 30 };
    const width = canvas.width - pad.left - pad.right;
    const height = canvas.height - pad.top - pad.bottom;
    const maxValue = Math.max.apply(null, months.map(function(b){ return Math.max(b.income, b.expense); }).concat([1]));
    const groupWidth = width / months.length;
    const barWidth = Math.max(4, (groupWidth - 8) / 2);

    months.forEach(function(b, i) {
      const gx = pad.left + i * groupWidth + 4;
      const incH = (b.income / maxValue) * height;
      const expH = (b.expense / maxValue) * height;
      ctx.fillStyle = '#15724b';
      ctx.fillRect(gx, pad.top + height - incH, barWidth, Math.max(1, incH));
      ctx.fillStyle = '#e94e1b';
      ctx.fillRect(gx + barWidth + 2, pad.top + height - expH, barWidth, Math.max(1, expH));
      ctx.fillStyle = '#68736d';
      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, gx + barWidth + 1, pad.top + height + 15);
    });
  },

  calculateMetrics: function(state) {
    const movements = state.movements || [];
    const investments = state.investments || [];

    let totalIncome = 0, totalExpenses = 0;

    movements.forEach(function(m) {
      if (m && m.amount) {
        if (m.type === 'ingreso') {
          totalIncome += parseFloat(m.amount) || 0;
        } else if (m.type === 'egreso') {
          totalExpenses += parseFloat(m.amount) || 0;
        }
      }
    });

    const investmentValue = investments.reduce(function(sum, inv) {
      if (!inv || !inv.quantity || !inv.currentPrice) return sum;
      return sum + (inv.quantity * inv.currentPrice);
    }, 0);

    return {
      patrimony: AppUtils.money.format(totalIncome - totalExpenses + investmentValue),
      totalIncome: AppUtils.money.format(totalIncome),
      totalExpenses: AppUtils.money.format(totalExpenses),
      movementCount: movements.length,
      investmentCount: investments.length
    };
  },

  renderMetric: function(label, value, hint) {
    return UI.createMetric(label, value, hint);
  },

  renderRecentMovements: function(state) {
    const movements = state.movements || [];

    if (movements.length === 0) {
      return UI.createEmpty('Sin movimientos');
    }

    const recent = movements.slice(0, 5);

    let html = '<table>' +
               '<thead><tr>' +
                 '<th>Fecha</th>' +
                 '<th>Tipo</th>' +
                 '<th>Categoría</th>' +
                 '<th>Monto</th>' +
               '</tr></thead>' +
               '<tbody>';

    recent.forEach(function(m) {
      if (!m) return;

      html += '<tr>' +
              '<td>' + (m.date || '') + '</td>' +
              '<td>' + UI.createTag(m.type || '', m.type) + '</td>' +
              '<td>' + (m.category || '') + '</td>' +
              '<td class="' + (m.type === 'egreso' ? 'negative' : 'positive') + '">' +
                AppUtils.money.format(m.amount || 0) +
              '</td>' +
            '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }
};

window.Dashboard = Dashboard;
