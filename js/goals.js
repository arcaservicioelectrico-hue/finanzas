/**
 * GOALS.JS - CORREGIDO
 * Vista de metas financieras
 */

const Goals = {
  init: function() {
    UI.updateTopbar('Metas', 'Tus objetivos financieros', [
      {
        id: 'add-goal',
        label: '+ Nueva Meta',
        className: 'primary',
        onClick: function() {
          Goals.openForm();
        }
      }
    ]);
  },

  render: function() {
    const container = document.getElementById('goalsContent');
    if (!container) return;

    const state = StorageManager.getState();
    const goals = state.goals || [];

    const activeGoals = goals.filter(function(g) { 
      return g && (!g.completed || g.completed === false);
    });
    
    const completedGoals = goals.filter(function(g) { 
      return g && g.completed === true;
    });

    let html = '';

    if (activeGoals.length > 0) {
      html += '<div class="section">' +
              '<h3>Metas Activas (' + activeGoals.length + ')</h3>' +
              this.renderGoals(activeGoals) +
            '</div>';
    } else {
      html += '<div class="section">' +
              '<h3>Metas Activas</h3>' +
              UI.createEmpty('Sin metas activas') +
            '</div>';
    }

    if (completedGoals.length > 0) {
      html += '<div class="section" style="margin-top: 30px;">' +
              '<h3>Metas Completadas (' + completedGoals.length + ')</h3>' +
              this.renderGoals(completedGoals) +
            '</div>';
    }

    if (goals.length === 0) {
      html = '<div class="section">' +
             '<h3>Metas</h3>' +
             UI.createEmpty('Sin metas. ¡Crea tu primera meta!') +
           '</div>';
    }

    container.innerHTML = html;
  },

  renderGoals: function(goals) {
    let html = '<div style="display: grid; gap: 15px;">';

    goals.forEach(function(goal) {
      if (!goal) return;

      const progress = goal.progress || 0;
      const target = goal.targetAmount || 1;
      const percent = Math.min((progress / target) * 100, 100);

      html += '<div class="panel" style="padding: 15px;">' +
              '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                '<h4 style="margin: 0;">' + (goal.name || '') + '</h4>' +
                '<div style="display:flex; gap:6px;">' +
                  (goal.completed ? '' : '<button class="btn primary" style="padding:4px 10px;font-size:12px;" onclick="Goals.addProgress(\'' + (goal.id || '') + '\')">+ Abonar</button>') +
                  '<button class="icon-btn" onclick="Goals.delete(\'' + (goal.id || '') + '\')">🗑️</button>' +
                '</div>' +
              '</div>' +
              '<p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">' + (goal.description || '') + '</p>' +
              '<div style="background: #eee; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">' +
                '<div style="background: #4CAF50; height: 100%; width: ' + percent + '%;"></div>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">' +
                '<span>' + AppUtils.money.format(progress) + ' / ' + AppUtils.money.format(target) + '</span>' +
                '<span>' + percent.toFixed(0) + '%</span>' +
              '</div>' +
              (goal.targetDate ? '<div style="margin-top: 8px; font-size: 12px; color: #999;">Fecha: ' + goal.targetDate + '</div>' : '') +
            '</div>';
    });

    html += '</div>';
    return html;
  },

  openForm: function() {
    const content = '<div style="padding: 20px;">' +
      '<h2>Nueva Meta</h2>' +
      '<form id="goalForm" style="margin-top: 20px;">' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Nombre de la Meta *</label>' +
          '<input type="text" name="name" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Descripción</label>' +
          '<input type="text" name="description" style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Monto Objetivo *</label>' +
          '<input type="number" name="targetAmount" step="0.01" required style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Progreso Actual</label>' +
          '<input type="number" name="progress" step="0.01" value="0" style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="margin-bottom: 15px;">' +
          '<label>Fecha Objetivo</label>' +
          '<input type="date" name="targetDate" style="width: 100%; padding: 8px; margin-top: 5px;">' +
        '</div>' +
        '<div style="display: flex; gap: 10px; margin-top: 20px;">' +
          '<button type="button" class="btn secondary" onclick="UI.closeModal();">Cancelar</button>' +
          '<button type="submit" class="btn primary">Crear</button>' +
        '</div>' +
      '</form>' +
    '</div>';

    UI.showModal(content);

    const form = document.getElementById('goalForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const goal = {
          name: formData.get('name'),
          description: formData.get('description') || null,
          targetAmount: parseFloat(formData.get('targetAmount')) || 0,
          progress: parseFloat(formData.get('progress')) || 0,
          targetDate: formData.get('targetDate') || null,
          completed: false
        };

        StorageManager.addGoal(goal);
        UI.toast('Meta creada', 'success');
        UI.closeModal();
        Goals.render();
      });
    }
  },

  addProgress: function(id) {
    if (!id) return;
    const state = StorageManager.getState();
    const goal = (state.goals || []).find(function(g) { return g && g.id === id; });
    if (!goal) return;

    const input = prompt('¿Cuánto quieres abonar a "' + goal.name + '"?', '0');
    if (input === null) return;
    const amount = parseFloat(input);
    if (isNaN(amount) || amount === 0) {
      UI.toast('Monto inválido', 'error');
      return;
    }

    const newProgress = Math.max(0, (goal.progress || 0) + amount);
    const completed = newProgress >= (goal.targetAmount || 0);
    StorageManager.updateGoal(id, { progress: newProgress, completed: completed });
    UI.toast(completed ? '¡Meta completada! 🎉' : 'Abono registrado', 'success');
    this.render();
  },

  delete: function(id) {
    if (!id) return;
    
    if (confirm('¿Estás seguro de eliminar esta meta?')) {
      StorageManager.deleteGoal(id);
      UI.toast('Meta eliminada', 'success');
      this.render();
    }
  }
};

window.Goals = Goals;
