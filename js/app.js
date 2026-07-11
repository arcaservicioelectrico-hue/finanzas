/**
 * APP.JS - CORREGIDO
 * Controlador principal de la aplicación
 */

const App = {
  state: {
    currentView: 'dashboard',
    isOnline: navigator.onLine
  },

  init: function() {
    console.log('🚀 FINANZAS V2 - Iniciando...');
    
    try {
      StorageManager.init();
      UI.initTheme();
      this.setupNavigationListeners();
      this.setupOnlineStatusListener();
      this.setupServiceWorker();
      this.loadView('dashboard');
      
      setTimeout(function() {
        App.showWelcomeIfNeeded();
      }, 500);
      console.log('✅ Aplicación lista');
    } catch (e) {
      console.error('Error al inicializar:', e);
    }
  },

  loadView: function(viewName) {
    if (!viewName) return;
    
    console.log('Cargando vista:', viewName);
    
    try {
      // Ocultar todas las vistas
      document.querySelectorAll('.view').forEach(function(view) {
        view.classList.remove('active');
      });

      // Mostrar vista activa
      const view = document.getElementById(viewName + '-view');
      if (view) {
        view.classList.add('active');
      }

      // Actualizar navegación
      document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.classList.remove('active');
      });
      const navBtn = document.querySelector('[data-view="' + viewName + '"]');
      if (navBtn) {
        navBtn.classList.add('active');
      }

      App.state.currentView = viewName;

      // Renderizar vista
      if (viewName === 'dashboard' && typeof Dashboard !== 'undefined') {
        Dashboard.init();
        Dashboard.render();
      } else if (viewName === 'movements' && typeof Movements !== 'undefined') {
        Movements.init();
        Movements.render();
      } else if (viewName === 'investments' && typeof Investments !== 'undefined') {
        Investments.init();
        Investments.render();
      } else if (viewName === 'goals' && typeof Goals !== 'undefined') {
        Goals.init();
        Goals.render();
      } else if (viewName === 'calculator' && typeof Calculator !== 'undefined') {
        Calculator.init();
        Calculator.render();
      } else if (viewName === 'reports' && typeof Reports !== 'undefined') {
        Reports.init();
        Reports.render();
      }
    } catch (e) {
      console.error('Error al cargar vista:', viewName, e);
    }
  },

  setupNavigationListeners: function() {
    const self = this;
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const viewName = this.getAttribute('data-view');
        self.loadView(viewName);
      });
    });

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        self.showSettings();
      });
    }
  },

  setupOnlineStatusListener: function() {
    const self = this;
    window.addEventListener('online', function() {
      self.state.isOnline = true;
      UI.toast('Conexión restaurada', 'info');
    });

    window.addEventListener('offline', function() {
      self.state.isOnline = false;
      UI.toast('Sin conexión', 'warning');
    });
  },

  setupServiceWorker: function() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function(err) {
        console.log('SW no registrado:', err);
      });
    }
  },

  showWelcomeIfNeeded: function() {
    const state = StorageManager.getState();
    const hasData = (state.movements && state.movements.length > 0) || 
                    (state.investments && state.investments.length > 0);

    if (!hasData) {
      const content = '<div style="text-align: center; padding: 30px;">' +
                       '<h2 style="margin-bottom: 20px;">Bienvenido a FINANZAS V2</h2>' +
                       '<p style="color: #999; margin-bottom: 30px; max-width: 400px; margin-left: auto; margin-right: auto;">' +
                       'Tu gestor financiero profesional. Comienza agregando movimientos, inversiones y metas.' +
                       '</p>' +
                       '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 400px; margin: 0 auto;">' +
                         '<button class="btn primary" onclick="App.loadView(\'movements\'); UI.closeModal();">➕ Movimiento</button>' +
                         '<button class="btn primary" onclick="App.loadView(\'investments\'); UI.closeModal();">📈 Inversión</button>' +
                         '<button class="btn secondary" onclick="App.showDemoData(); UI.closeModal();">📊 Ver Demo</button>' +
                         '<button class="btn secondary" onclick="UI.closeModal();">🚀 Comenzar</button>' +
                       '</div>' +
                     '</div>';

      UI.showModal(content);
    }
  },

  showDemoData: function() {
    const today = AppUtils.getToday();

    const demoState = {
      version: StorageManager.CURRENT_VERSION,
      movements: [
        {
          id: AppUtils.generateId(),
          type: 'ingreso',
          date: today,
          amount: 32000,
          category: 'Nómina',
          account: 'BBVA',
          note: 'Sueldo'
        },
        {
          id: AppUtils.generateId(),
          type: 'egreso',
          date: today,
          amount: 9200,
          category: 'Renta',
          account: 'BBVA',
          note: 'Renta'
        },
        {
          id: AppUtils.generateId(),
          type: 'egreso',
          date: today,
          amount: 3500,
          category: 'Supermercado',
          account: 'Tarjeta',
          note: 'Despensa'
        }
      ],
      investments: [
        {
          id: AppUtils.generateId(),
          ticker: 'VOO',
          assetType: 'ETF',
          quantity: 4,
          avgPrice: 8200,
          currentPrice: 8650,
          priceUpdatedAt: today,
          broker: 'GBM'
        }
      ],
      goals: [],
      categories: StorageManager.getDefaultCategories(),
      accounts: StorageManager.getDefaultAccounts()
    };

    StorageManager.setState(demoState);
    UI.toast('Demo cargada', 'success');
    this.loadView('dashboard');
  },

  showSettings: function() {
    const settings = StorageManager.getSettings();
    const theme = UI.getCurrentTheme();

    const content = '<div style="padding: 20px;">' +
      '<h2>Configuración</h2>' +
      '<div style="margin-top: 20px;">' +
        '<div style="margin-bottom: 20px;">' +
          '<label>Tema</label>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">' +
            '<button class="btn ' + (theme === 'light' ? 'primary' : 'secondary') + '" onclick="UI.setTheme(\'light\');">☀️ Claro</button>' +
            '<button class="btn ' + (theme === 'dark' ? 'primary' : 'secondary') + '" onclick="UI.setTheme(\'dark\');">🌙 Oscuro</button>' +
            '<button class="btn ' + (theme === 'auto' ? 'primary' : 'secondary') + '" onclick="UI.setTheme(\'auto\');">🔄 Auto</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="btn secondary" onclick="UI.closeModal();" style="margin-top: 20px;">Cerrar</button>' +
    '</div>';

    UI.showModal(content);
  }
};

// Inicializar al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });
} else {
  App.init();
}

window.App = App;
