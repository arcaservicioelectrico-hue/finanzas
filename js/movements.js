/**
 * MOVEMENTS.JS - CORREGIDO
 * Vista de movimientos financieros
 */

const Movements = {
  init: function() {
    UI.updateTopbar('Movimientos', 'Historial de transacciones', [
      {
        id: 'add-movement',
        label: '+ Agregar',
        className: 'primary',
        onClick: function() {
          Movements.openForm();
        }
      }
    ]);
  },

  render: function() {
    const container = document.getElementById('movementsContent');
    if (!container) return;

    const state = StorageManager.getState();
    const movements = state.movements || [];

    container.innerHTML = '<div class="panel">' +
      '<h3>Movimientos (' + movements.length + ')</h3>' +
      this.renderTable(movements) +
    '</div>';
  },

  renderTable: function(movements) {
    if (!movements || movements.length === 0) {
      return UI.createEmpty('Sin movimientos');
    }

    let html = '<table>' +
               '<thead><tr>' +
                 '<th>Fecha</th>' +
                 '<th>Tipo</th>' +
                 '<th>Categoría</th>' +
                 '<th>Descripción</th>' +
                 '<th>Monto</th>' +
                 '<th>Acción</th>' +
               '</tr></thead>' +
               '<tbody>';

    movements.forEach(function(m) {
      if (!m) return;

      html += '<tr>' +
              '<td>' + (m.date || '') + '</td>' +
              '<td>' + UI.createTag(m.type || '', m.type) + '</td>' +
              '<td>' + (m.category || '') + '</td>' +
              '<td><small>' + (m.note || '-') + '</small></td>' +
              '<td class="' + (m.type === 'egreso' ? 'negative' : 'positive') + '">' +
                AppUtils.money.format(m.amount || 0) +
              '</td>' +
              '<td style="white-space:nowrap;">' +
                '<button class="icon-btn" title="Editar" onclick="Movements.openForm(\'' + (m.id || '') + '\')">✏️</button> ' +
                '<button class="icon-btn" title="Eliminar" onclick="Movements.delete(\'' + (m.id || '') + '\')">🗑️</button>' +
              '</td>' +
            '</tr>';
    });

    html += '</tbody></table>';
    return html;
  },

  getAllCategories: function() {
    const state = StorageManager.getState();
    const defaults = StorageManager.getDefaultCategories();
    const saved = state.categories || [];
    const merged = defaults.slice();
    saved.forEach(function(c) {
      if (c && merged.indexOf(c) === -1) merged.push(c);
    });
    return merged;
  },

  openForm: function(id) {
    const editing = !!id;
    let existing = null;
    if (editing) {
      const state = StorageManager.getState();
      existing = (state.movements || []).find(function(m){ return m && m.id === id; });
      if (!existing) return;
    }

    const categories = this.getAllCategories();
    const val = function(k, def) {
      if (existing && existing[k] != null) return existing[k];
      return def == null ? '' : def;
    };
    const selected = function(cur, opt) {
      return String(cur) === String(opt) ? ' selected' : '';
    };

    const content = '<div style="padding: 20px;">' +
      '<h2>' + (editing ? 'Editar' : 'Agregar') + ' Movimiento</h2>' +
      '<form id="movementForm" style="margin-top: 20px;">' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Tipo *</label>' +
          '<select name="type" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
            '<option value="">Seleccionar...</option>' +
            '<option value="ingreso"' + selected(val('type'), 'ingreso') + '>Ingreso</option>' +
            '<option value="egreso"' + selected(val('type'), 'egreso') + '>Gasto</option>' +
            '<option value="inversion"' + selected(val('type'), 'inversion') + '>Inversión</option>' +
          '</select>' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Fecha *</label>' +
          '<input type="date" name="date" value="' + val('date', AppUtils.getToday()) + '" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Categoría *</label>' +
          '<select name="category" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
            categories.map(function(cat) {
              return '<option value="' + cat + '"' + selected(val('category'), cat) + '>' + cat + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Monto *</label>' +
          '<input type="number" name="amount" step="0.01" value="' + val('amount', '') + '" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Descripción</label>' +
          '<input type="text" name="note" value="' + (val('note') || '') + '" style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="display: flex; gap: 10px; margin-top: 20px;">' +
          '<button type="button" class="btn secondary" onclick="UI.closeModal();">Cancelar</button>' +
          '<button type="submit" class="btn primary">Guardar</button>' +
        '</div>' +
      '</form>' +
    '</div>';

    UI.showModal(content);

    const form = document.getElementById('movementForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const movement = {
          type: formData.get('type'),
          date: formData.get('date'),
          category: formData.get('category'),
          amount: parseFloat(formData.get('amount')) || 0,
          note: formData.get('note') || null
        };

        if (editing) {
          StorageManager.updateMovement(id, movement);
          UI.toast('Movimiento actualizado', 'success');
        } else {
          StorageManager.addMovement(movement);
          UI.toast('Movimiento agregado', 'success');
        }
        UI.closeModal();
        Movements.render();
      });
    }
  },

  delete: function(id) {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      StorageManager.deleteMovement(id);
      UI.toast('Movimiento eliminado', 'success');
      this.render();
    }
  }
};

window.Movements = Movements;
