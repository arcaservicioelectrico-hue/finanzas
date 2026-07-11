/**
 * UI.JS - CORREGIDO
 * Manejo de la interfaz de usuario
 */

const UI = {
  toast: function(message, type, duration) {
    if (!message) return;
    
    type = type || 'info';
    duration = duration || 3000;
    
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    if (duration > 0) {
      setTimeout(function() {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(function() {
          if (toast.parentNode) toast.remove();
        }, 300);
      }, duration);
    }
  },

  showModal: function(content, options) {
    if (!content) return null;
    
    options = options || {};
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const closeBtn = document.getElementById('modalClose');

    if (!modal || !overlay || !body || !closeBtn) {
      console.error('Elementos del modal no encontrados');
      return null;
    }

    body.innerHTML = content;
    modal.classList.add('active');
    overlay.classList.add('active');

    const closeModal = function() {
      modal.classList.remove('active');
      overlay.classList.remove('active');
      if (options.onClose) {
        try {
          options.onClose();
        } catch (e) {
          console.error('Error en onClose:', e);
        }
      }
    };

    closeBtn.onclick = closeModal;
    overlay.onclick = closeModal;

    if (options.autoClose) {
      setTimeout(closeModal, options.autoClose);
    }

    return closeModal;
  },

  closeModal: function() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  },

  showLoading: function() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.classList.add('active');
  },

  hideLoading: function() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.classList.remove('active');
  },

  setTheme: function(theme) {
    if (!theme) return;
    
    const html = document.documentElement;
    
    if (theme === 'auto') {
      html.removeAttribute('color-scheme');
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.style.colorScheme = 'dark';
      } else {
        html.style.colorScheme = 'light';
      }
    } else {
      html.setAttribute('color-scheme', theme);
    }

    StorageManager.setTheme(theme);
    this.toast('Tema actualizado', 'info');
  },

  getCurrentTheme: function() {
    return StorageManager.getTheme();
  },

  initTheme: function() {
    const savedTheme = StorageManager.getTheme();
    this.setTheme(savedTheme);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
        if (StorageManager.getTheme() === 'auto') {
          UI.setTheme('auto');
        }
      });
    }
  },

  updateTopbar: function(title, description, actions) {
    const titleEl = document.getElementById('viewTitle');
    const actionsEl = document.getElementById('topbarActions');

    if (titleEl) {
      titleEl.innerHTML = '<h2>' + (title || '') + '</h2>' + 
                         (description ? '<p>' + description + '</p>' : '');
    }

    if (actionsEl) {
      if (!actions || actions.length === 0) {
        actionsEl.innerHTML = '';
        return;
      }

      actionsEl.innerHTML = actions.map(function(action) {
        return '<button class="btn ' + (action.className || '') + '" data-action="' + (action.id || '') + '">' +
               (action.label || '') +
               '</button>';
      }).join('');

      actions.forEach(function(action) {
        if (action.onClick) {
          const btn = actionsEl.querySelector('[data-action="' + action.id + '"]');
          if (btn) {
            btn.addEventListener('click', function() {
              try {
                action.onClick();
              } catch (e) {
                console.error('Error en click de acción:', e);
              }
            });
          }
        }
      });
    }
  },

  createMetric: function(label, value, hint, type) {
    type = type || 'neutral';
    hint = hint || '';
    
    return '<div class="metric card ' + type + '">' +
             '<div class="metric-label">' + (label || '') + '</div>' +
             '<div class="metric-value">' + (value || '0') + '</div>' +
             (hint ? '<div class="metric-hint">' + hint + '</div>' : '') +
           '</div>';
  },

  createTag: function(label, type) {
    type = type || 'default';
    return '<span class="tag ' + type + '">' + (label || '') + '</span>';
  },

  createEmpty: function(message) {
    return '<div class="empty"><p>' + (message || 'Sin datos') + '</p></div>';
  },

  confirm: function(message) {
    return new Promise(function(resolve) {
      if (!message) {
        resolve(false);
        return;
      }

      const content = '<div style="text-align: center;">' +
                       '<h3 style="margin-bottom: 20px;">' + message + '</h3>' +
                       '<div style="display: flex; gap: 10px; justify-content: center;">' +
                         '<button class="btn secondary" id="confirmCancel">Cancelar</button>' +
                         '<button class="btn danger" id="confirmOk">Aceptar</button>' +
                       '</div>' +
                     '</div>';

      const closeModal = UI.showModal(content);

      const cancelBtn = document.getElementById('confirmCancel');
      const okBtn = document.getElementById('confirmOk');

      if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
          if (closeModal) closeModal();
          resolve(false);
        });
      }

      if (okBtn) {
        okBtn.addEventListener('click', function() {
          if (closeModal) closeModal();
          resolve(true);
        });
      }
    });
  },

  withLoading: function(promise, message) {
    message = message || 'Cargando...';
    
    UI.showLoading();
    
    return promise.then(function(result) {
      UI.hideLoading();
      return result;
    }).catch(function(error) {
      UI.hideLoading();
      throw error;
    });
  }
};

// Inicializar tema cuando esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    UI.initTheme();
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        const currentTheme = UI.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        UI.setTheme(newTheme);
      });
    }
  });
} else {
  UI.initTheme();
}

window.UI = UI;
