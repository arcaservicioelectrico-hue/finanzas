/**
 * INVESTMENTS.JS - CORREGIDO
 * Vista de inversiones
 */

const Investments = {
  init: function() {
    UI.updateTopbar('Inversiones', 'Gestión de tu portafolio', [
      {
        id: 'add-investment',
        label: '+ Agregar',
        className: 'primary',
        onClick: function() {
          Investments.openForm();
        }
      }
    ]);
  },

  render: function() {
    const container = document.getElementById('investmentsContent');
    if (!container) return;

    const state = StorageManager.getState();
    const investments = state.investments || [];
    const metrics = this.calculateMetrics(investments);

    container.innerHTML = '<div class="grid">' +
      '<div class="summary-grid">' +
        UI.createMetric('Inversión Total', AppUtils.money.format(metrics.totalCost), '') +
        UI.createMetric('Valor Actual', AppUtils.money.format(metrics.totalValue), '') +
        UI.createMetric('Ganancia/Pérdida', AppUtils.money.format(metrics.totalGain), '') +
        UI.createMetric('Posiciones', metrics.count, '') +
      '</div>' +
      '<div class="panel">' +
        '<h3>Mis Inversiones</h3>' +
        this.renderTable(investments) +
      '</div>' +
    '</div>';
  },

  renderTable: function(investments) {
    if (!investments || investments.length === 0) {
      return UI.createEmpty('Sin inversiones');
    }

    let html = '<table>' +
               '<thead><tr>' +
                 '<th>Ticker</th>' +
                 '<th>Tipo</th>' +
                 '<th>Cantidad</th>' +
                 '<th>Precio Promedio</th>' +
                 '<th>Precio Actual</th>' +
                 '<th>Valor Total</th>' +
                 '<th>Ganancia</th>' +
                 '<th>Acción</th>' +
               '</tr></thead>' +
               '<tbody>';

    investments.forEach(function(inv) {
      if (!inv) return;

      const cost = (inv.quantity || 0) * (inv.avgPrice || 0);
      const value = (inv.quantity || 0) * (inv.currentPrice || 0);
      const gain = value - cost;
      const gainPercent = cost > 0 ? ((gain / cost) * 100).toFixed(2) : 0;

      html += '<tr>' +
              '<td><strong>' + (inv.ticker || '') + '</strong></td>' +
              '<td>' + (inv.assetType || '') + '</td>' +
              '<td>' + (inv.quantity || 0) + '</td>' +
              '<td>' + AppUtils.money.format(inv.avgPrice || 0) + '</td>' +
              '<td>' + AppUtils.money.format(inv.currentPrice || 0) + '</td>' +
              '<td>' + AppUtils.money.format(value) + '</td>' +
              '<td class="' + (gain >= 0 ? 'positive' : 'negative') + '">' +
                AppUtils.money.format(gain) + ' (' + gainPercent + '%)' +
              '</td>' +
              '<td style="white-space:nowrap;">' +
                '<button class="icon-btn" title="Comprar más" onclick="Investments.buyMore(\'' + (inv.id || '') + '\')">➕</button> ' +
                '<button class="icon-btn" title="Actualizar precio" onclick="Investments.updatePrice(\'' + (inv.id || '') + '\')">💲</button> ' +
                '<button class="icon-btn" title="Editar" onclick="Investments.openEdit(\'' + (inv.id || '') + '\')">✏️</button> ' +
                '<button class="icon-btn" title="Eliminar" onclick="Investments.delete(\'' + (inv.id || '') + '\')">🗑️</button>' +
              '</td>' +
            '</tr>';
    });

    html += '</tbody></table>';
    return html;
  },

  calculateMetrics: function(investments) {
    let totalCost = 0, totalValue = 0, totalGain = 0, count = 0;

    (investments || []).forEach(function(inv) {
      if (!inv) return;
      
      const cost = (inv.quantity || 0) * (inv.avgPrice || 0);
      const value = (inv.quantity || 0) * (inv.currentPrice || 0);
      
      totalCost += cost;
      totalValue += value;
      totalGain += (value - cost);
      count += 1;
    });

    return {
      totalCost: totalCost,
      totalValue: totalValue,
      totalGain: totalGain,
      count: count
    };
  },

  openForm: function() {
    const content = '<div style="padding: 20px;">' +
      '<h2>Agregar Inversión</h2>' +
      '<form id="investmentForm" style="margin-top: 20px;">' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Ticker *</label>' +
          '<input type="text" name="ticker" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Tipo *</label>' +
          '<select name="assetType" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
            '<option value="">Seleccionar...</option>' +
            '<option value="ETF">ETF</option>' +
            '<option value="Acción">Acción</option>' +
            '<option value="Cetes">Cetes</option>' +
            '<option value="FIBRA">FIBRA</option>' +
            '<option value="Fondo">Fondo Mutualista</option>' +
            '<option value="Otro">Otro</option>' +
          '</select>' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Cantidad *</label>' +
          '<input type="number" name="quantity" step="0.0001" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Precio Promedio *</label>' +
          '<input type="number" name="avgPrice" step="0.01" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Precio Actual *</label>' +
          '<input type="number" name="currentPrice" step="0.01" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Broker</label>' +
          '<input type="text" name="broker" value="GBM" style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="display: flex; gap: 10px; margin-top: 20px;">' +
          '<button type="button" class="btn secondary" onclick="UI.closeModal();">Cancelar</button>' +
          '<button type="submit" class="btn primary">Guardar</button>' +
        '</div>' +
      '</form>' +
    '</div>';

    UI.showModal(content);

    const form = document.getElementById('investmentForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const investment = {
          ticker: formData.get('ticker'),
          assetType: formData.get('assetType'),
          quantity: parseFloat(formData.get('quantity')) || 0,
          avgPrice: parseFloat(formData.get('avgPrice')) || 0,
          currentPrice: parseFloat(formData.get('currentPrice')) || 0,
          broker: formData.get('broker') || 'GBM',
          priceUpdatedAt: AppUtils.getToday()
        };

        StorageManager.addInvestment(investment);
        UI.toast('Inversión agregada', 'success');
        UI.closeModal();
        Investments.render();
      });
    }
  },

  buyMore: function(id) {
    if (!id) return;
    const inv = (StorageManager.getState().investments || []).find(function(i){ return i && i.id === id; });
    if (!inv) return;

    const qtyStr = prompt('Cantidad comprada de ' + inv.ticker + ':', '0');
    if (qtyStr === null) return;
    const priceStr = prompt('Precio de compra por unidad:', String(inv.currentPrice || inv.avgPrice || 0));
    if (priceStr === null) return;

    const qty = parseFloat(qtyStr);
    const price = parseFloat(priceStr);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      UI.toast('Datos inválidos', 'error');
      return;
    }

    const oldQty = inv.quantity || 0;
    const oldAvg = inv.avgPrice || 0;
    const newQty = oldQty + qty;
    const newAvg = ((oldQty * oldAvg) + (qty * price)) / newQty;

    StorageManager.updateInvestment(id, {
      quantity: newQty,
      avgPrice: newAvg,
      currentPrice: price,
      priceUpdatedAt: AppUtils.getToday()
    });
    UI.toast('Compra registrada. Nuevo promedio: ' + AppUtils.money.format(newAvg), 'success');
    this.render();
  },

  updatePrice: function(id) {
    if (!id) return;
    const inv = (StorageManager.getState().investments || []).find(function(i){ return i && i.id === id; });
    if (!inv) return;

    const input = prompt('Precio actual de ' + inv.ticker + ':', String(inv.currentPrice || 0));
    if (input === null) return;
    const price = parseFloat(input);
    if (isNaN(price) || price < 0) {
      UI.toast('Precio inválido', 'error');
      return;
    }

    StorageManager.updateInvestment(id, {
      currentPrice: price,
      priceUpdatedAt: AppUtils.getToday()
    });
    UI.toast('Precio actualizado', 'success');
    this.render();
  },

  openEdit: function(id) {
    if (!id) return;
    const inv = (StorageManager.getState().investments || []).find(function(i){ return i && i.id === id; });
    if (!inv) return;

    const content = '<div style="padding: 20px;">' +
      '<h2>Editar Inversión</h2>' +
      '<form id="investmentEditForm" style="margin-top: 20px;">' +
        '<div style="margin-bottom: 15px;"><label>Ticker</label>' +
          '<input type="text" name="ticker" value="' + (inv.ticker || '') + '" required style="width:100%;padding:8px;margin-top:5px;"></div>' +
        '<div style="margin-bottom: 15px;"><label>Cantidad</label>' +
          '<input type="number" name="quantity" step="0.0001" value="' + (inv.quantity || 0) + '" required style="width:100%;padding:8px;margin-top:5px;"></div>' +
        '<div style="margin-bottom: 15px;"><label>Precio Promedio</label>' +
          '<input type="number" name="avgPrice" step="0.01" value="' + (inv.avgPrice || 0) + '" required style="width:100%;padding:8px;margin-top:5px;"></div>' +
        '<div style="margin-bottom: 15px;"><label>Precio Actual</label>' +
          '<input type="number" name="currentPrice" step="0.01" value="' + (inv.currentPrice || 0) + '" required style="width:100%;padding:8px;margin-top:5px;"></div>' +
        '<div style="display:flex;gap:10px;margin-top:20px;">' +
          '<button type="button" class="btn secondary" onclick="UI.closeModal();">Cancelar</button>' +
          '<button type="submit" class="btn primary">Guardar</button>' +
        '</div>' +
      '</form></div>';

    UI.showModal(content);
    const form = document.getElementById('investmentEditForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(form);
        StorageManager.updateInvestment(id, {
          ticker: fd.get('ticker'),
          quantity: parseFloat(fd.get('quantity')) || 0,
          avgPrice: parseFloat(fd.get('avgPrice')) || 0,
          currentPrice: parseFloat(fd.get('currentPrice')) || 0,
          priceUpdatedAt: AppUtils.getToday()
        });
        UI.toast('Inversión actualizada', 'success');
        UI.closeModal();
        Investments.render();
      });
    }
  },

  delete: function(id) {
    if (!id) return;
    
    if (confirm('¿Estás seguro de eliminar esta inversión?')) {
      StorageManager.deleteInvestment(id);
      UI.toast('Inversión eliminada', 'success');
      this.render();
    }
  }
};

window.Investments = Investments;
