/**
 * CALCULATOR.JS
 * Calculadoras financieras
 */

const Calculator = {
  init: () => {
    UI.updateTopbar(
      'Calculadoras',
      'Herramientas para cálculos financieros'
    );
  },

  render: () => {
    const container = document.getElementById('calculatorContent');
    if (!container) return;

    container.innerHTML = `
      <div class="grid gap-3">
        <div class="grid grid-2">
          ${Calculator.createCalculatorCard('Interés Compuesto', 'compound')}
          ${Calculator.createCalculatorCard('Interés Simple', 'simple')}
        </div>
        <div class="grid grid-2">
          ${Calculator.createCalculatorCard('Valor Futuro', 'futureValue')}
          ${Calculator.createCalculatorCard('Inflación', 'inflation')}
        </div>
      </div>
      <div id="calculatorResult"></div>
    `;

    // Event listeners
    document.querySelectorAll('[data-calculator]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.calculator;
        Calculator.showCalculator(type);
      });
    });
  },

  createCalculatorCard: (title, type) => {
    return `
      <div class="card clickable" data-calculator="${type}">
        <div class="panel" style="text-align: center; cursor: pointer;">
          <h3>${title}</h3>
          <p style="color: var(--muted); margin: var(--space-md) 0 0;">Haz clic para usar</p>
        </div>
      </div>
    `;
  },

  showCalculator: (type) => {
    const calculators = {
      compound: Calculator.compoundInterestCalculator,
      simple: Calculator.simpleInterestCalculator,
      futureValue: Calculator.futureValueCalculator,
      inflation: Calculator.inflationCalculator
    };

    if (calculators[type]) {
      const content = calculators[type]();
      const result = document.getElementById('calculatorResult');
      if (result) result.innerHTML = content;
    }
  },

  compoundInterestCalculator: () => {
    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Calculadora de Interés Compuesto</h3>
        <form id="compoundForm" class="form-grid cols-1" style="margin-top: var(--space-lg);">
          <div class="form-group">
            <label for="principal">Capital Inicial</label>
            <input type="number" id="principal" step="0.01" value="10000" required>
          </div>
          <div class="form-group">
            <label for="rate">Tasa Anual (%)</label>
            <input type="number" id="rate" step="0.01" value="5" required>
          </div>
          <div class="form-group">
            <label for="time">Años</label>
            <input type="number" id="time" step="0.1" value="10" required>
          </div>
          <div class="form-group">
            <label for="frequency">Frecuencia de Capitalización</label>
            <select id="frequency">
              <option value="1">Anual</option>
              <option value="2">Semestral</option>
              <option value="4">Trimestral</option>
              <option value="12" selected>Mensual</option>
              <option value="365">Diaria</option>
            </select>
          </div>
          <button type="submit" class="btn primary" style="margin-top: var(--space-lg);">Calcular</button>
        </form>
        <div id="compoundResult" style="margin-top: var(--space-lg);"></div>
      </div>
    `;
  },

  simpleInterestCalculator: () => {
    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Calculadora de Interés Simple</h3>
        <form id="simpleForm" class="form-grid cols-1" style="margin-top: var(--space-lg);">
          <div class="form-group">
            <label for="principal2">Capital Inicial</label>
            <input type="number" id="principal2" step="0.01" value="10000" required>
          </div>
          <div class="form-group">
            <label for="rate2">Tasa Anual (%)</label>
            <input type="number" id="rate2" step="0.01" value="5" required>
          </div>
          <div class="form-group">
            <label for="time2">Años</label>
            <input type="number" id="time2" step="0.1" value="10" required>
          </div>
          <button type="submit" class="btn primary" style="margin-top: var(--space-lg);">Calcular</button>
        </form>
        <div id="simpleResult" style="margin-top: var(--space-lg);"></div>
      </div>
    `;
  },

  futureValueCalculator: () => {
    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Calculadora de Valor Futuro</h3>
        <form id="futureForm" class="form-grid cols-1" style="margin-top: var(--space-lg);">
          <div class="form-group">
            <label for="pv">Valor Presente</label>
            <input type="number" id="pv" step="0.01" value="5000" required>
          </div>
          <div class="form-group">
            <label for="fv">Valor Futuro Deseado</label>
            <input type="number" id="fv" step="0.01" value="10000" required>
          </div>
          <div class="form-group">
            <label for="rate3">Tasa Anual (%)</label>
            <input type="number" id="rate3" step="0.01" value="5" required>
          </div>
          <div class="form-group">
            <label for="time3">Años Necesarios</label>
            <input type="number" id="time3" step="0.1" value="10" required>
          </div>
          <button type="submit" class="btn primary" style="margin-top: var(--space-lg);">Calcular</button>
        </form>
        <div id="futureResult" style="margin-top: var(--space-lg);"></div>
      </div>
    `;
  },

  inflationCalculator: () => {
    return `
      <div class="panel" style="margin-top: var(--space-lg);">
        <h3>Calculadora de Inflación</h3>
        <form id="inflationForm" class="form-grid cols-1" style="margin-top: var(--space-lg);">
          <div class="form-group">
            <label for="amount">Monto Actual</label>
            <input type="number" id="amount" step="0.01" value="10000" required>
          </div>
          <div class="form-group">
            <label for="inflationRate">Tasa de Inflación Anual (%)</label>
            <input type="number" id="inflationRate" step="0.01" value="3.5" required>
          </div>
          <div class="form-group">
            <label for="years">Años</label>
            <input type="number" id="years" step="0.1" value="5" required>
          </div>
          <button type="submit" class="btn primary" style="margin-top: var(--space-lg);">Calcular</button>
        </form>
        <div id="inflationResult" style="margin-top: var(--space-lg);"></div>
      </div>
    `;
  }
};

// Event delegation para los formularios
document.addEventListener('submit', (e) => {
  if (e.target.id === 'compoundForm') {
    e.preventDefault();
    const principal = parseFloat(document.getElementById('principal').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const time = parseFloat(document.getElementById('time').value);
    const frequency = parseFloat(document.getElementById('frequency').value);

    const result = AppUtils.calculate.compoundInterest(principal, rate, time, frequency);
    const interest = result - principal;

    document.getElementById('compoundResult').innerHTML = `
      <div class="summary-grid">
        ${UI.createMetric('Capital Inicial', AppUtils.money.format(principal), '')}
        ${UI.createMetric('Interés Generado', AppUtils.money.format(interest), '', 'positive')}
        ${UI.createMetric('Monto Final', AppUtils.money.format(result), '', 'positive')}
        ${UI.createMetric('ROI', ((interest / principal) * 100).toFixed(2) + '%', '')}
      </div>
    `;
  }

  if (e.target.id === 'simpleForm') {
    e.preventDefault();
    const principal = parseFloat(document.getElementById('principal2').value);
    const rate = parseFloat(document.getElementById('rate2').value);
    const time = parseFloat(document.getElementById('time2').value);

    const result = AppUtils.calculate.simpleInterest(principal, rate, time);
    const interest = result - principal;

    document.getElementById('simpleResult').innerHTML = `
      <div class="summary-grid">
        ${UI.createMetric('Capital Inicial', AppUtils.money.format(principal), '')}
        ${UI.createMetric('Interés', AppUtils.money.format(interest), '', 'positive')}
        ${UI.createMetric('Total', AppUtils.money.format(result), '', 'positive')}
        ${UI.createMetric('ROI', ((interest / principal) * 100).toFixed(2) + '%', '')}
      </div>
    `;
  }

  if (e.target.id === 'futureForm') {
    e.preventDefault();
    const presentValue = parseFloat(document.getElementById('pv').value);
    const targetValue = parseFloat(document.getElementById('fv').value);
    const rate = parseFloat(document.getElementById('rate3').value);
    const time = parseFloat(document.getElementById('time3').value);
    const result = presentValue * Math.pow(1 + rate / 100, time);
    const difference = result - targetValue;
    const yearsNeeded = rate > 0 && presentValue > 0 && targetValue > presentValue
      ? Math.log(targetValue / presentValue) / Math.log(1 + rate / 100)
      : 0;

    document.getElementById('futureResult').innerHTML = `
      <div class="summary-grid">
        ${UI.createMetric('Valor Presente', AppUtils.money.format(presentValue), '')}
        ${UI.createMetric('Valor Futuro Calculado', AppUtils.money.format(result), '', 'positive')}
        ${UI.createMetric('Diferencia vs Objetivo', AppUtils.money.format(difference), '', difference >= 0 ? 'positive' : 'negative')}
        ${UI.createMetric('Años para Objetivo', yearsNeeded > 0 ? yearsNeeded.toFixed(1) : '0.0', '')}
      </div>
    `;
  }

  if (e.target.id === 'inflationForm') {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const rate = parseFloat(document.getElementById('inflationRate').value);
    const years = parseFloat(document.getElementById('years').value);

    const futureValue = amount / Math.pow(1 + rate / 100, years);

    document.getElementById('inflationResult').innerHTML = `
      <div class="summary-grid">
        ${UI.createMetric('Valor Actual', AppUtils.money.format(amount), '')}
        ${UI.createMetric('Valor Real en ' + years + ' años', AppUtils.money.format(futureValue), '', 'negative')}
        ${UI.createMetric('Pérdida de Poder', AppUtils.money.format(amount - futureValue), '', 'negative')}
        ${UI.createMetric('Porcentaje', ((amount - futureValue) / amount * 100).toFixed(2) + '%', '')}
      </div>
    `;
  }
});

window.Calculator = Calculator;
