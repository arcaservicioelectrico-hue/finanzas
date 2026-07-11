/**
 * UTILS.JS - CORREGIDO
 * Funciones de utilidad compartidas
 */

const AppUtils = {
  // Formateo de moneda
  money: {
    format: function(amount) {
      if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
      }
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount);
    },

    parse: function(str) {
      if (typeof str === 'string') {
        return parseFloat(str.replace(/[^\d.-]/g, '')) || 0;
      }
      return parseFloat(str) || 0;
    }
  },

  // Formateo de fechas
  formatDate: {
    format: function(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    },

    time: function(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleTimeString('es-MX');
    },

    fullDateTime: function(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleString('es-MX');
    },

    relative: function(date) {
      if (!date) return '';
      const d = new Date(date);
      const now = new Date();
      const diff = Math.floor((now - d) / 1000);

      if (diff < 60) return 'hace poco';
      if (diff < 3600) return 'hace ' + Math.floor(diff / 60) + 'm';
      if (diff < 86400) return 'hace ' + Math.floor(diff / 3600) + 'h';
      return 'hace ' + Math.floor(diff / 86400) + 'd';
    }
  },

  // Generar ID único
  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Sanitizar HTML
  escapeHtml: function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Validadores
  validator: {
    email: function(email) {
      if (!email) return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    date: function(date) {
      if (!date) return false;
      const d = new Date(date);
      return d instanceof Date && !isNaN(d);
    },

    positiveNumber: function(num) {
      const n = parseFloat(num);
      return !isNaN(n) && n > 0;
    },

    empty: function(value) {
      return !value || value.trim() === '';
    }
  },

  // Ordenamiento
  sortBy: {
    asc: function(arr, prop) {
      if (!Array.isArray(arr)) return [];
      return arr.slice().sort(function(a, b) {
        return (a[prop] || 0) - (b[prop] || 0);
      });
    },

    desc: function(arr, prop) {
      if (!Array.isArray(arr)) return [];
      return arr.slice().sort(function(a, b) {
        return (b[prop] || 0) - (a[prop] || 0);
      });
    },

    byDate: function(arr, prop) {
      if (!Array.isArray(arr)) return [];
      return arr.slice().sort(function(a, b) {
        const da = new Date(a[prop] || 0);
        const db = new Date(b[prop] || 0);
        return db - da;
      });
    }
  },

  // Filtrado
  filter: {
    byDate: function(arr, start, end) {
      if (!Array.isArray(arr)) return [];
      return arr.filter(function(item) {
        if (!item || !item.date) return false;
        const d = new Date(item.date);
        return d >= new Date(start) && d <= new Date(end);
      });
    },

    today: function(arr) {
      const today = AppUtils.getToday();
      return arr.filter(function(item) {
        return item && item.date === today;
      });
    },

    thisWeek: function(arr) {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() + 6));

      return arr.filter(function(item) {
        if (!item || !item.date) return false;
        const d = new Date(item.date);
        return d >= startOfWeek && d <= endOfWeek;
      });
    },

    thisMonth: function(arr) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      return arr.filter(function(item) {
        if (!item || !item.date) return false;
        const d = new Date(item.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    },

    thisYear: function(arr) {
      const now = new Date();
      const year = now.getFullYear();

      return arr.filter(function(item) {
        if (!item || !item.date) return false;
        const d = new Date(item.date);
        return d.getFullYear() === year;
      });
    },

    byType: function(arr, type) {
      if (!type) return arr;
      return arr.filter(function(item) {
        return item && item.type === type;
      });
    },

    byCategory: function(arr, category) {
      if (!category) return arr;
      return arr.filter(function(item) {
        return item && item.category === category;
      });
    },

    search: function(arr, query, fields) {
      if (!query) return arr;
      const q = query.toLowerCase();
      return arr.filter(function(item) {
        if (!item) return false;
        return fields.some(function(field) {
          const val = item[field];
          return val && val.toString().toLowerCase().includes(q);
        });
      });
    }
  },

  // Cálculos
  calculate: {
    sum: function(arr, prop) {
      if (!Array.isArray(arr)) return 0;
      return arr.reduce(function(sum, item) {
        return sum + (parseFloat(item[prop]) || 0);
      }, 0);
    },

    average: function(arr, prop) {
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      const sum = AppUtils.calculate.sum(arr, prop);
      return sum / arr.length;
    },

    groupByKey: function(arr, key) {
      if (!Array.isArray(arr)) return {};
      return arr.reduce(function(acc, item) {
        const k = item[key];
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
        return acc;
      }, {});
    },

    percentage: function(part, total) {
      if (total === 0) return 0;
      return (part / total) * 100;
    },

    change: function(old, newVal) {
      if (old === 0) return 0;
      return ((newVal - old) / old) * 100;
    },

    compoundInterest: function(principal, rate, time, compounds) {
      return principal * Math.pow((1 + rate / (100 * compounds)), compounds * time);
    },

    simpleInterest: function(principal, rate, time) {
      return principal + (principal * rate * time / 100);
    }
  },

  // Descarga de archivos
  download: {
    csv: function(rows, filename) {
      if (!Array.isArray(rows)) return;
      
      const csv = rows.map(function(row) {
        return row.map(function(cell) {
          return '"' + (cell || '').toString().replace(/"/g, '""') + '"';
        }).join(',');
      }).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.file(blob, filename || 'data.csv');
    },

    json: function(data, filename) {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      this.file(blob, filename || 'data.json');
    },

    file: function(blob, filename) {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // Helpers de fecha
  getToday: function() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  },

  getDateRange: function(type) {
    const now = new Date();
    let start, end;

    if (type === 'today') {
      start = AppUtils.getToday();
      end = AppUtils.getToday();
    } else if (type === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      start = AppUtils.formatDate.format(d);
      end = AppUtils.getToday();
    } else if (type === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = AppUtils.formatDate.format(d);
      end = AppUtils.getToday();
    } else if (type === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      start = AppUtils.formatDate.format(d);
      end = AppUtils.getToday();
    }

    return { start: start, end: end };
  },

  // Paleta de colores para gráficas
  colors: {
    palette: ['#15724b', '#2d9d6f', '#4dbf8f', '#e0a800', '#e94e1b', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'],
    getPaletteForChart: function(n) {
      const out = [];
      for (let i = 0; i < n; i++) out.push(AppUtils.colors.palette[i % AppUtils.colors.palette.length]);
      return out;
    }
  }
};

window.AppUtils = AppUtils;
