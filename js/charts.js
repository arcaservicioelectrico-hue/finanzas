/**
 * CHARTS.JS
 * Generación y renderizado de gráficos
 */

const Charts = {
  /**
   * Renderizar gráfico donut
   */
  renderDonut: (canvasId, data, legend) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    Charts.clearCanvas(ctx, canvas);

    const entries = Object.entries(data)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);

    if (!entries.length) {
      Charts.drawText(ctx, 'Sin datos', canvas.width / 2, canvas.height / 2, '#68736d', 16, 'center');
      return;
    }

    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    const colors = AppUtils.colors.getPaletteForChart(entries.length);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.34;

    let start = -Math.PI / 2;
    entries.forEach(([name, value], index) => {
      const angle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      start += angle;
    });

    // Centro blanco
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = '#fbfcfb';
    ctx.fill();

    Charts.drawText(ctx, AppUtils.money.format(total), cx, cy - 2, '#18201d', 18, 'center', 800);
    Charts.drawText(ctx, 'total', cx, cy + 22, '#68736d', 12, 'center');

    // Leyenda
    if (legend) {
      legend.innerHTML = entries.map(([name, value], index) => {
        const pct = ((value / total) * 100).toFixed(1);
        return `
          <div class="chart-list-item">
            <span class="swatch" style="background:${colors[index % colors.length]}"></span>
            <strong>${name} (${pct}%)</strong>
            <span>${AppUtils.money.format(value)}</span>
          </div>
        `;
      }).join('');
    }
  },

  /**
   * Renderizar gráfico de barras
   */
  renderBars: (canvasId, data, options = {}) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    Charts.clearCanvas(ctx, canvas);

    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;

    const pad = { left: 40, right: 20, top: 20, bottom: 30 };
    const width = canvas.width - pad.left - pad.right;
    const height = canvas.height - pad.top - pad.bottom;
    const barWidth = Math.max(1, width / (entries.length * 1.5));
    const maxValue = Math.max(...entries.map(([, v]) => v));

    entries.forEach(([label, value], index) => {
      const x = pad.left + index * (barWidth * 1.5) + 5;
      const barHeight = (value / maxValue) * height;
      const y = pad.top + height - barHeight;

      Charts.drawBar(ctx, x, y, barWidth, barHeight, '#15724b');
      Charts.drawText(ctx, label, x + barWidth / 2, pad.top + height + 15, '#68736d', 10, 'center');
    });
  },

  /**
   * Renderizar gráfico de línea
   */
  renderLine: (canvasId, data, options = {}) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    Charts.clearCanvas(ctx, canvas);

    const entries = data;
    if (!entries.length) return;

    const pad = { left: 40, right: 20, top: 20, bottom: 30 };
    const width = canvas.width - pad.left - pad.right;
    const height = canvas.height - pad.top - pad.bottom;
    const maxValue = Math.max(...entries.map(d => d.value));
    const minValue = Math.min(...entries.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Dibujar línea
    ctx.strokeStyle = '#15724b';
    ctx.lineWidth = 2;
    ctx.beginPath();

    entries.forEach((point, index) => {
      const x = pad.left + (index / (entries.length - 1)) * width;
      const y = pad.top + height - ((point.value - minValue) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dibujar puntos
    entries.forEach((point, index) => {
      const x = pad.left + (index / (entries.length - 1)) * width;
      const y = pad.top + height - ((point.value - minValue) / range) * height;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#15724b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Etiqueta
      Charts.drawText(ctx, point.label, x, pad.top + height + 15, '#68736d', 10, 'center');
    });
  },

  /**
   * Utilidades
   */
  clearCanvas: (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fbfcfb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  drawBar: (ctx, x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, Math.max(1, height));
  },

  drawText: (ctx, text, x, y, color, size, align, weight = 600) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }
};

window.Charts = Charts;
