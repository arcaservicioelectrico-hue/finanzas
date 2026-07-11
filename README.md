# FINANZAS V2

**Aplicación Profesional de Gestión Financiera**

Una aplicación moderna, modular y responsive para gestionar tus finanzas personales. Registra movimientos, gestiona inversiones, establece metas y obtén análisis detallados de tu situación financiera.

## 🚀 Características Principales

### Dashboard
- Resumen general de tu patrimonio
- Indicadores financieros clave
- Ingresos y gastos del mes
- Últimos movimientos
- Progreso de metas

### Movimientos
- Historial completo de transacciones
- Filtros: Todos, Hoy, Semana, Mes, Año, Personalizado
- Búsqueda y filtros avanzados
- Edición y eliminación de movimientos
- Categorización automática

### Inversiones
- Gestión de portafolio
- Seguimiento de precios
- Cálculo automático de ganancias/pérdidas
- Múltiples tipos de activos (ETF, Acciones, Cetes, FIBRAS)
- Comparativas de rendimiento

### Metas Financieras
- Crear y seguir metas
- Barra de progreso visual
- Tiempo restante
- Monto recomendado mensual
- Múltiples metas simultáneas

### Calculadoras
- Interés compuesto
- Interés simple
- Valor futuro
- Inflación
- Resultados instantáneos

### Reportes
- Resumen financiero
- Análisis mensual
- Análisis de inversiones
- Progreso de metas

### Exportaciones
- Exportar como CSV
- Respaldar en JSON
- Restaurar respaldos
- Datos completos preservados

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- LocalStorage disponible (mínimo 5MB)
- Conexión a Internet para sincronización en la nube (opcional)

## 🏗️ Arquitectura

```
finanzas-v2/
├── index.html              # Punto de entrada principal
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker
├── css/
│   ├── style.css          # Estilos principales
│   ├── responsive.css     # Media queries y responsive
│   └── dark.css           # Tema oscuro
├── js/
│   ├── app.js             # Controlador principal
│   ├── utils.js           # Utilidades compartidas
│   ├── storage.js         # Gestión de datos
│   ├── ui.js              # Componentes de UI
│   ├── dashboard.js       # Vista dashboard
│   ├── movements.js       # Vista movimientos
│   ├── investments.js     # Vista inversiones
│   ├── goals.js           # Vista metas
│   ├── calculator.js      # Calculadoras
│   ├── charts.js          # Gráficos
│   ├── reports.js         # Reportes
│   └── firebase.js        # Preparación Firebase
└── README.md              # Este archivo
```

## 📦 Módulos

### utils.js
Funciones de utilidad compartidas:
- `money.format()` - Formateo de moneda
- `formatDate` - Formateo de fechas
- `sortBy` - Ordenamiento
- `filter` - Filtrado de datos
- `calculate` - Cálculos financieros
- `download` - Descarga de archivos
- `validator` - Validación

### storage.js
Gestión de almacenamiento:
- `StorageManager.getState()` - Obtener estado
- `StorageManager.setState()` - Guardar estado
- Métodos CRUD para movimientos, inversiones, metas
- Migración automática de datos
- Validación de integridad
- Exportación/importación

### ui.js
Componentes y utilidades de UI:
- `UI.toast()` - Notificaciones
- `UI.showModal()` - Diálogos
- `UI.setTheme()` - Cambio de tema
- `UI.createTable()` - Generación de tablas
- `UI.createForm()` - Generación de formularios

### dashboard.js
Vista de resumen:
- Cálculo de métricas
- Gráficos de ingresos/gastos
- Inversiones destacadas
- Últimos movimientos

### movements.js
Gestión de movimientos:
- Tabla con todos los movimientos
- Filtros avanzados
- Formulario de edición
- Búsqueda en tiempo real

### investments.js
Gestión de inversiones:
- Tabla de posiciones
- Cálculos automáticos
- Seguimiento de precios
- Análisis de rendimiento

### goals.js
Gestión de metas:
- Crear/editar metas
- Progreso visual
- Fechas objetivo
- Categorización

### calculator.js
Herramientas financieras:
- Calculadora de interés compuesto
- Calculadora de interés simple
- Cálculo de valor futuro
- Simulador de inflación

### charts.js
Generación de gráficos:
- Gráficos donut
- Gráficos de barras
- Gráficos de línea

### reports.js
Generación de reportes:
- Resumen financiero
- Análisis mensual
- Exportación de datos

## 🎨 Personalización

### Temas
Cambia el tema en Configuración:
- **Claro**: Tema por defecto
- **Oscuro**: Tema oscuro para noches
- **Automático**: Sigue la preferencia del sistema

### Configuración
En Configuración puedes ajustar:
- Moneda (MXN, USD, EUR)
- Decimales (0-4)
- Notificaciones
- Tema

## 💾 Almacenamiento

### LocalStorage
Los datos se almacenan automáticamente en localStorage:
```javascript
StorageManager.getState()  // Obtener datos
StorageManager.setState()  // Guardar datos
```

### Respaldos
- Exporta como JSON: descargas todos tus datos
- Importa desde JSON: restaura un respaldo anterior
- Automático: Se guarda cada cambio

### Límites
- Máximo ~5-10MB por navegador
- Revisar espacio en Reportes

## 🌐 PWA (Aplicación Web Progresiva)

La app se puede instalar en dispositivos como aplicación nativa:

### Instalación
1. Abre la app en el navegador
2. Haz clic en "Instalar" o "Agregar a inicio"
3. Síguelas instrucciones del navegador

### Características PWA
- Funciona sin conexión
- Instalable en dispositivos
- Acceso rápido desde el inicio
- Sincronización en background (próximamente)

## 🔄 Migración de V1

La app detecta automáticamente datos de V1 y los migra:
1. Los campos se validan automáticamente
2. Se asignan IDs únicos si faltan
3. Se preservan todos los datos

## 🚀 Características Próximas (V2.1+)

### V2.1 Dashboard
- Más gráficos y análisis
- Proyecciones financieras

### V2.7 Firebase
- Sincronización en la nube
- Autenticación
- Backup automático

### V2.8 PWA
- Instalación optimizada
- Sincronización en background
- Notificaciones push

## 🔒 Seguridad

### Datos Locales
- Los datos se almacenan localmente en tu dispositivo
- No se envía información sin tu consentimiento
- Control total de tus datos

### Privacidad
- No hay tracking
- No hay cookies de terceros
- No se comparten datos

## ⚡ Rendimiento

- Aplicación ligera (~200KB)
- Sin dependencias externas
- Renderizado rápido
- Optimizado para móvil

## 🤝 Contribuciones

Este es un proyecto de código abierto. Las contribuciones son bienvenidas.

## 📄 Licencia

MIT License - Libre para usar, modificar y distribuir.

## 📞 Soporte

Para reportar errores o sugerencias:
1. Revisa la documentación
2. Prueba en un navegador diferente
3. Limpiar cache (Ctrl+Shift+Delete)

## 📚 Documentación de Módulos

### App.js
```javascript
App.init()              // Inicializar
App.loadView(name)      // Cargar vista
App.syncWithCloud()     // Sincronizar
```

### StorageManager
```javascript
// Movimientos
StorageManager.addMovement(data)
StorageManager.updateMovement(id, data)
StorageManager.deleteMovement(id)

// Inversiones
StorageManager.addInvestment(data)
StorageManager.updateInvestment(id, data)
StorageManager.deleteInvestment(id)

// Metas
StorageManager.addGoal(data)
StorageManager.updateGoal(id, data)
StorageManager.deleteGoal(id)

// Exportación
StorageManager.exportJSON()
StorageManager.exportCSV()
StorageManager.importJSON(json)
```

### UI
```javascript
// Notificaciones
UI.toast(message, type, duration)

// Modales
UI.showModal(content, options)
UI.closeModal()

// Tema
UI.setTheme(theme)
UI.getCurrentTheme()

// Componentes
UI.createTable(columns, rows)
UI.createForm(fields, options)
```

## 🔄 Flujo de Datos

```
Usuario
  ↓
Formulario
  ↓
Validación
  ↓
StorageManager (localStorage)
  ↓
Render Vista
  ↓
Actualizar Dashboard/Reportes
```

## 🎯 Estructura de Datos

### Movimiento
```javascript
{
  id: string,              // ID único
  type: enum,              // 'ingreso', 'egreso', 'inversion'
  date: string,            // YYYY-MM-DD
  amount: number,          // Cantidad
  category: string,        // Categoría
  account: string,         // Cuenta (opcional)
  note: string,            // Descripción (opcional)
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

### Inversión
```javascript
{
  id: string,
  ticker: string,          // Símbolo
  assetType: enum,         // 'ETF', 'Acción', 'Cetes', etc.
  quantity: number,        // Cantidad
  avgPrice: number,        // Precio promedio
  currentPrice: number,    // Precio actual
  priceUpdatedAt: string,  // YYYY-MM-DD
  broker: string,          // Intermediario
  createdAt: string,
  updatedAt: string
}
```

### Meta
```javascript
{
  id: string,
  name: string,            // Nombre de la meta
  description: string,     // Descripción (opcional)
  targetAmount: number,    // Monto objetivo
  progress: number,        // Progreso actual
  targetDate: string,      // YYYY-MM-DD
  category: string,        // Categoría (opcional)
  createdAt: string,
  updatedAt: string
}
```

---

**Versión:** 2.0.0  
**Última actualización:** 2024  
**Autor:** FINANZAS Team

Para más información, visita la documentación completa en el código.
