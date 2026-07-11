/**
 * STORAGE.JS - CORREGIDO
 * Gestión de almacenamiento y migración de datos
 */

const StorageManager = {
  KEYS: {
    STATE: 'finanzas_v2_state',
    SETTINGS: 'finanzas_v2_settings',
    THEME: 'finanzas_v2_theme',
    VERSION: 'finanzas_v2_version'
  },

  CURRENT_VERSION: '2.0.0',

  init: function() {
    try {
      this.migrateIfNeeded();
      this.validateData();
    } catch (e) {
      console.error('Error en StorageManager.init:', e);
    }
  },

  migrateIfNeeded: function() {
    const storedVersion = this.getFromStorage(this.KEYS.VERSION);
    
    if (!storedVersion) {
      const oldState = this.getFromStorage('finanzas_state') || 
                       this.getFromStorage('state') || null;
      
      if (oldState) {
        this.migrateFromV1(oldState);
      } else {
        this.initializeEmptyState();
      }
    }
  },

  migrateFromV1: function(oldState) {
    console.log('Migrando datos de V1...');
    
    const newState = {
      version: this.CURRENT_VERSION,
      createdAt: new Date().toISOString(),
      movements: (oldState.movements || []).map(m => ({
        id: m.id || this.generateId(),
        ...m
      })),
      investments: (oldState.investments || []).map(i => ({
        id: i.id || this.generateId(),
        ...i
      })),
      goals: [],
      categories: this.getDefaultCategories(),
      accounts: this.getDefaultAccounts()
    };

    this.saveToStorage(this.KEYS.STATE, newState);
    this.saveToStorage(this.KEYS.VERSION, this.CURRENT_VERSION);
    console.log('Migración completada');
  },

  initializeEmptyState: function() {
    const emptyState = {
      version: this.CURRENT_VERSION,
      createdAt: new Date().toISOString(),
      movements: [],
      investments: [],
      goals: [],
      categories: this.getDefaultCategories(),
      accounts: this.getDefaultAccounts()
    };

    this.saveToStorage(this.KEYS.STATE, emptyState);
    this.saveToStorage(this.KEYS.VERSION, this.CURRENT_VERSION);
  },

  getDefaultCategories: function() {
    return [
      'Nómina', 'Freelance', 'Inversiones', 'Bonificación',
      'Casa', 'Renta', 'Servicios', 'Supermercado', 'Transporte',
      'Utilidades', 'Seguros', 'Salud', 'Educación',
      'Entretenimiento', 'Viajes', 'Ropa', 'Electrodomésticos',
      'Retiro Efectivo', 'Transferencia', 'Otro'
    ];
  },

  getDefaultAccounts: function() {
    return [
      'BBVA', 'Santander', 'Banorte', 'HSBC', 'Scotiabank',
      'GBM', 'Tarjeta Crédito', 'Efectivo', 'Otro'
    ];
  },

  validateData: function() {
    const state = this.getFromStorage(this.KEYS.STATE);
    if (!state) return;

    // Validar movimientos
    if (Array.isArray(state.movements)) {
      state.movements = state.movements.filter(m => {
        return m && m.id && m.date && m.type && m.amount && m.category;
      });
    }

    // Validar inversiones
    if (Array.isArray(state.investments)) {
      state.investments = state.investments.filter(i => {
        return i && i.id && i.ticker && i.quantity && i.avgPrice && i.currentPrice;
      });
    }

    // Validar metas
    if (!Array.isArray(state.goals)) {
      state.goals = [];
    }

    this.saveToStorage(this.KEYS.STATE, state);
  },

  // ===== GETTERS/SETTERS =====

  getState: function() {
    const state = this.getFromStorage(this.KEYS.STATE);
    if (!state) {
      this.initializeEmptyState();
      return this.getFromStorage(this.KEYS.STATE);
    }
    return state;
  },

  setState: function(state) {
    if (!state) return false;
    state.version = this.CURRENT_VERSION;
    state.updatedAt = new Date().toISOString();
    this.saveToStorage(this.KEYS.STATE, state);
    return true;
  },

  // ===== MOVIMIENTOS =====

  addMovement: function(movement) {
    if (!movement) return null;
    
    const state = this.getState();
    const newMovement = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...movement
    };
    
    if (!state.movements) state.movements = [];
    state.movements.unshift(newMovement);
    this.setState(state);
    return newMovement;
  },

  updateMovement: function(id, updates) {
    if (!id || !updates) return null;
    
    const state = this.getState();
    if (!state.movements) return null;
    
    const index = state.movements.findIndex(m => m && m.id === id);
    if (index === -1) return null;
    
    state.movements[index] = {
      ...state.movements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.setState(state);
    return state.movements[index];
  },

  deleteMovement: function(id) {
    if (!id) return false;
    
    const state = this.getState();
    if (!state.movements) return false;
    
    state.movements = state.movements.filter(m => m && m.id !== id);
    this.setState(state);
    return true;
  },

  // ===== INVERSIONES =====

  addInvestment: function(investment) {
    if (!investment) return null;
    
    const state = this.getState();
    const newInvestment = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...investment
    };
    
    if (!state.investments) state.investments = [];
    state.investments.unshift(newInvestment);
    this.setState(state);
    return newInvestment;
  },

  updateInvestment: function(id, updates) {
    if (!id || !updates) return null;
    
    const state = this.getState();
    if (!state.investments) return null;
    
    const index = state.investments.findIndex(i => i && i.id === id);
    if (index === -1) return null;
    
    state.investments[index] = {
      ...state.investments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.setState(state);
    return state.investments[index];
  },

  deleteInvestment: function(id) {
    if (!id) return false;
    
    const state = this.getState();
    if (!state.investments) return false;
    
    state.investments = state.investments.filter(i => i && i.id !== id);
    this.setState(state);
    return true;
  },

  // ===== METAS =====

  addGoal: function(goal) {
    if (!goal) return null;
    
    const state = this.getState();
    const newGoal = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      progress: 0,
      ...goal
    };
    
    if (!state.goals) state.goals = [];
    state.goals.unshift(newGoal);
    this.setState(state);
    return newGoal;
  },

  updateGoal: function(id, updates) {
    if (!id || !updates) return null;
    
    const state = this.getState();
    if (!state.goals) return null;
    
    const index = state.goals.findIndex(g => g && g.id === id);
    if (index === -1) return null;
    
    state.goals[index] = {
      ...state.goals[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.setState(state);
    return state.goals[index];
  },

  deleteGoal: function(id) {
    if (!id) return false;
    
    const state = this.getState();
    if (!state.goals) return false;
    
    state.goals = state.goals.filter(g => g && g.id !== id);
    this.setState(state);
    return true;
  },

  // ===== CATEGORÍAS =====

  getCategories: function() {
    const state = this.getState();
    return state.categories || this.getDefaultCategories();
  },

  addCategory: function(category) {
    if (!category) return false;
    
    const state = this.getState();
    if (!state.categories) state.categories = [];
    
    if (!state.categories.includes(category)) {
      state.categories.push(category);
      this.setState(state);
    }
    return true;
  },

  // ===== CUENTAS =====

  getAccounts: function() {
    const state = this.getState();
    return state.accounts || this.getDefaultAccounts();
  },

  addAccount: function(account) {
    if (!account) return false;
    
    const state = this.getState();
    if (!state.accounts) state.accounts = [];
    
    if (!state.accounts.includes(account)) {
      state.accounts.push(account);
      this.setState(state);
    }
    return true;
  },

  // ===== CONFIGURACIÓN =====

  getSettings: function() {
    const settings = this.getFromStorage(this.KEYS.SETTINGS);
    return settings || {
      theme: 'auto',
      currency: 'MXN',
      dateFormat: 'es-MX',
      decimals: 2,
      notifications: true,
      language: 'es'
    };
  },

  setSettings: function(settings) {
    if (!settings) return false;
    
    const current = this.getSettings();
    const merged = Object.assign({}, current, settings);
    this.saveToStorage(this.KEYS.SETTINGS, merged);
    return true;
  },

  getTheme: function() {
    return this.getFromStorage(this.KEYS.THEME) || 'auto';
  },

  setTheme: function(theme) {
    if (!theme) return false;
    this.saveToStorage(this.KEYS.THEME, theme);
    return true;
  },

  // ===== EXPORTACIÓN/IMPORTACIÓN =====

  exportJSON: function() {
    const state = this.getState();
    const settings = this.getSettings();
    return {
      backup: {
        version: this.CURRENT_VERSION,
        exportedAt: new Date().toISOString(),
        state: state,
        settings: settings
      }
    };
  },

  importJSON: function(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      const backup = data.backup || data;

      if (!backup.state) {
        console.error('Formato de respaldo inválido');
        return false;
      }

      const state = {
        ...backup.state,
        version: this.CURRENT_VERSION,
        updatedAt: new Date().toISOString()
      };

      this.setState(state);

      if (backup.settings) {
        this.setSettings(backup.settings);
      }

      console.log('Importación completada');
      return true;
    } catch (e) {
      console.error('Error al importar:', e);
      return false;
    }
  },

  exportCSV: function() {
    const state = this.getState();
    const rows = [
      ['ID', 'Tipo', 'Fecha', 'Categoría', 'Descripción', 'Cuenta', 'Monto'],
      ...(state.movements || []).map(m => [
        m.id,
        m.type,
        m.date,
        m.category,
        m.note || '',
        m.account || '',
        m.amount
      ])
    ];
    return rows;
  },

  clearAll: function() {
    if (!confirm('¿Estás seguro? Esto eliminará TODOS los datos.')) {
      return false;
    }
    try {
      localStorage.clear();
      this.initializeEmptyState();
      return true;
    } catch (e) {
      console.error('Error al limpiar:', e);
      return false;
    }
  },

  getDataStats: function() {
    const state = this.getState();
    return {
      movementsCount: (state.movements || []).length,
      investmentsCount: (state.investments || []).length,
      goalsCount: (state.goals || []).length,
      totalCategories: (state.categories || []).length,
      totalAccounts: (state.accounts || []).length,
      storageSize: new Blob([JSON.stringify(state)]).size,
      lastUpdate: state.updatedAt || state.createdAt || new Date().toISOString()
    };
  },

  // ===== HELPERS PRIVADOS =====

  getFromStorage: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error al leer storage:', key, e);
      return null;
    }
  },

  saveToStorage: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error al guardar storage:', key, e);
      return false;
    }
  },

  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Inicializar cuando está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    StorageManager.init();
  });
} else {
  StorageManager.init();
}

window.StorageManager = StorageManager;
