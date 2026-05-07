# ORDEN DE BATALLA — MESAIO v2
## Documento único. Sin ambigüedades. Ejecutar secuencialmente.

**Ejecutor:** Claude Code (Opus 4.6), 1 agente, secuencial  
**Tiempo:** 50 minutos máximo  
**Objetivo:** Ganar hackathon 2 con sistema integrado (mesas + inventario + contabilidad + facturación)  
**Stack:** HTML5 + CSS3 + Vanilla JS + Bootstrap 5.3 + LocalStorage  
**Resultado:** Demo funcional de 5 minutos end-to-end

---

## REGLAS ABSOLUTAS

1. **Todo lo nuevo va DENTRO del objeto MESAIO** en `mesaio-core.js`. NO crear archivos JS nuevos.
2. **Los 3 módulos nuevos son TABS dentro de `admin/index.html`**. NO crear páginas HTML nuevas.
3. **NO tocar** las funciones V1 de mesaio-core.js. Solo AGREGAR al final del objeto.
4. **NO tocar** las keys V1 de localStorage. Solo AGREGAR keys nuevas.
5. **NO tocar** index.html (landing), login.html, menu.html.
6. **SÍ modificar** admin/index.html (agregar 3 tabs), cocina/index.html (hook inventario), mesero/index.html (hook facturación).
7. **Paleta intocable:** burgundy #5C1A2B, gold #C8A951, cream #FAF6EE, Playfair Display, Inter.
8. **Libertad creativa** para estilizar componentes nuevos dentro de la paleta.

---

## PASO 1 — AGREGAR FUNCIONES A mesaio-core.js (15 min)

Abrir `assets/js/mesaio-core.js`. El objeto MESAIO existe y tiene ~304 líneas. Agregar las siguientes funciones **ANTES del cierre `};` del objeto MESAIO**.

### 1.1 Seed V2 (ingredientes + recetas)

```javascript
// ══════════════════════════════════════════════════════════
// V2 — SEED DE INGREDIENTES Y RECETAS
// ══════════════════════════════════════════════════════════

initV2() {
  if (localStorage.getItem('mesaio_v2_seed')) return; // Ya seeded

  // ── 25 INGREDIENTES ──
  const ingredientes = [
    { id:1,  nombre:"Carne de res",       unidad:"g",       stock:8000, stock_minimo:1000, precio_costo:18,    categoria:"proteína" },
    { id:2,  nombre:"Carne molida",       unidad:"g",       stock:5000, stock_minimo:500,  precio_costo:15,    categoria:"proteína" },
    { id:3,  nombre:"Pollo desmechado",   unidad:"g",       stock:4000, stock_minimo:500,  precio_costo:12,    categoria:"proteína" },
    { id:4,  nombre:"Cerdo",              unidad:"g",       stock:3000, stock_minimo:500,  precio_costo:16,    categoria:"proteína" },
    { id:5,  nombre:"Chicharrón",         unidad:"porción", stock:30,   stock_minimo:5,    precio_costo:3000,  categoria:"proteína" },
    { id:6,  nombre:"Mojarra",            unidad:"unidad",  stock:15,   stock_minimo:3,    precio_costo:12000, categoria:"proteína" },
    { id:7,  nombre:"Mariscos mixtos",    unidad:"g",       stock:2000, stock_minimo:300,  precio_costo:35,    categoria:"proteína" },
    { id:8,  nombre:"Huevo",              unidad:"unidad",  stock:60,   stock_minimo:10,   precio_costo:600,   categoria:"proteína" },
    { id:9,  nombre:"Frijoles cocidos",   unidad:"porción", stock:40,   stock_minimo:8,    precio_costo:1500,  categoria:"grano" },
    { id:10, nombre:"Arroz blanco",       unidad:"porción", stock:60,   stock_minimo:10,   precio_costo:800,   categoria:"grano" },
    { id:11, nombre:"Papa criolla",       unidad:"g",       stock:3000, stock_minimo:500,  precio_costo:5,     categoria:"vegetal" },
    { id:12, nombre:"Papa pastusa",       unidad:"g",       stock:4000, stock_minimo:500,  precio_costo:4,     categoria:"vegetal" },
    { id:13, nombre:"Plátano maduro",     unidad:"unidad",  stock:40,   stock_minimo:8,    precio_costo:800,   categoria:"vegetal" },
    { id:14, nombre:"Yuca",              unidad:"g",       stock:2000, stock_minimo:300,  precio_costo:6,     categoria:"vegetal" },
    { id:15, nombre:"Mazorca",           unidad:"unidad",  stock:20,   stock_minimo:4,    precio_costo:1500,  categoria:"vegetal" },
    { id:16, nombre:"Aguacate",          unidad:"unidad",  stock:20,   stock_minimo:4,    precio_costo:2500,  categoria:"vegetal" },
    { id:17, nombre:"Arepa de maíz",     unidad:"unidad",  stock:50,   stock_minimo:10,   precio_costo:500,   categoria:"grano" },
    { id:18, nombre:"Leche de coco",     unidad:"ml",      stock:3000, stock_minimo:500,  precio_costo:8,     categoria:"lácteo" },
    { id:19, nombre:"Crema de leche",    unidad:"ml",      stock:2000, stock_minimo:300,  precio_costo:10,    categoria:"lácteo" },
    { id:20, nombre:"Limón",             unidad:"unidad",  stock:40,   stock_minimo:8,    precio_costo:300,   categoria:"vegetal" },
    { id:21, nombre:"Panela rallada",    unidad:"g",       stock:1000, stock_minimo:200,  precio_costo:6,     categoria:"condimento" },
    { id:22, nombre:"Chocolate amargo",  unidad:"g",       stock:500,  stock_minimo:100,  precio_costo:40,    categoria:"condimento" },
    { id:23, nombre:"Helado vainilla",   unidad:"porción", stock:20,   stock_minimo:4,    precio_costo:2500,  categoria:"lácteo" },
    { id:24, nombre:"Cerveza artesanal", unidad:"unidad",  stock:48,   stock_minimo:10,   precio_costo:3500,  categoria:"bebida" },
    { id:25, nombre:"Vino tinto copa",   unidad:"porción", stock:24,   stock_minimo:5,    precio_costo:8000,  categoria:"bebida" }
  ];

  // ── 15 RECETAS (mapeo plato_id → ingredientes) ──
  // IMPORTANTE: los plato_id DEBEN coincidir con los IDs reales en mesaio_platos.
  // El agente debe revisar mesaio_platos y mapear correctamente.
  // Aquí van las recetas base — ajustar IDs según datos reales del seed V1.
  const recetas = [
    { plato_id:1,  nombre:"Empanadas vallunas",     ingredientes:[{ingrediente_id:12,cantidad:200,unidad:"g"},{ingrediente_id:2,cantidad:100,unidad:"g"}] },
    { plato_id:2,  nombre:"Ajiaco santafereño",     ingredientes:[{ingrediente_id:3,cantidad:200,unidad:"g"},{ingrediente_id:11,cantidad:150,unidad:"g"},{ingrediente_id:12,cantidad:150,unidad:"g"},{ingrediente_id:15,cantidad:1,unidad:"unidad"},{ingrediente_id:19,cantidad:50,unidad:"ml"},{ingrediente_id:16,cantidad:0.5,unidad:"unidad"}] },
    { plato_id:3,  nombre:"Sancocho trifásico",     ingredientes:[{ingrediente_id:1,cantidad:100,unidad:"g"},{ingrediente_id:4,cantidad:100,unidad:"g"},{ingrediente_id:3,cantidad:100,unidad:"g"},{ingrediente_id:14,cantidad:150,unidad:"g"},{ingrediente_id:13,cantidad:1,unidad:"unidad"},{ingrediente_id:15,cantidad:1,unidad:"unidad"}] },
    { plato_id:4,  nombre:"Lomo al trapo",          ingredientes:[{ingrediente_id:1,cantidad:350,unidad:"g"},{ingrediente_id:11,cantidad:200,unidad:"g"}] },
    { plato_id:5,  nombre:"Bandeja paisa",           ingredientes:[{ingrediente_id:2,cantidad:150,unidad:"g"},{ingrediente_id:9,cantidad:1,unidad:"porción"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:8,cantidad:1,unidad:"unidad"},{ingrediente_id:13,cantidad:1,unidad:"unidad"},{ingrediente_id:17,cantidad:1,unidad:"unidad"},{ingrediente_id:16,cantidad:0.5,unidad:"unidad"},{ingrediente_id:5,cantidad:1,unidad:"porción"}] },
    { plato_id:6,  nombre:"Cazuela de mariscos",    ingredientes:[{ingrediente_id:7,cantidad:250,unidad:"g"},{ingrediente_id:18,cantidad:200,unidad:"ml"},{ingrediente_id:10,cantidad:1,unidad:"porción"}] },
    { plato_id:7,  nombre:"Mojarra frita",          ingredientes:[{ingrediente_id:6,cantidad:1,unidad:"unidad"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:13,cantidad:1,unidad:"unidad"}] },
    { plato_id:8,  nombre:"Lechona tolimense",      ingredientes:[{ingrediente_id:4,cantidad:300,unidad:"g"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:17,cantidad:1,unidad:"unidad"}] },
    { plato_id:9,  nombre:"Tamal tolimense",        ingredientes:[{ingrediente_id:3,cantidad:150,unidad:"g"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:8,cantidad:1,unidad:"unidad"}] },
    { plato_id:10, nombre:"Patacones con hogao",    ingredientes:[{ingrediente_id:13,cantidad:2,unidad:"unidad"}] },
    { plato_id:11, nombre:"Limonada de coco",       ingredientes:[{ingrediente_id:20,cantidad:3,unidad:"unidad"},{ingrediente_id:18,cantidad:150,unidad:"ml"},{ingrediente_id:21,cantidad:30,unidad:"g"}] },
    { plato_id:12, nombre:"Agua de panela con limón",ingredientes:[{ingrediente_id:21,cantidad:50,unidad:"g"},{ingrediente_id:20,cantidad:2,unidad:"unidad"}] },
    { plato_id:13, nombre:"Chocolate santafereño",   ingredientes:[{ingrediente_id:22,cantidad:40,unidad:"g"},{ingrediente_id:19,cantidad:100,unidad:"ml"}] },
    { plato_id:14, nombre:"Tres leches colombiano",  ingredientes:[{ingrediente_id:19,cantidad:100,unidad:"ml"},{ingrediente_id:18,cantidad:50,unidad:"ml"},{ingrediente_id:8,cantidad:2,unidad:"unidad"}] },
    { plato_id:15, nombre:"Helado de vainilla",      ingredientes:[{ingrediente_id:23,cantidad:1,unidad:"porción"}] }
  ];

  localStorage.setItem('mesaio_ingredientes', JSON.stringify(ingredientes));
  localStorage.setItem('mesaio_recetas', JSON.stringify(recetas));
  localStorage.setItem('mesaio_facturas', JSON.stringify([]));
  localStorage.setItem('mesaio_factura_counter', '0');
  localStorage.setItem('mesaio_movimientos', JSON.stringify([]));
  localStorage.setItem('mesaio_v2_seed', 'true');
  console.log('✓ Mesaio V2 inicializado: 25 ingredientes + 15 recetas');
},
```

### 1.2 Funciones de inventario

```javascript
// ══════════════════════════════════════════════════════════
// V2 — INVENTARIO
// ══════════════════════════════════════════════════════════

getIngredientes() {
  return JSON.parse(localStorage.getItem('mesaio_ingredientes') || '[]');
},

updateStock(ingredienteId, delta) {
  // delta negativo = descontar, positivo = reponer
  const ingredientes = this.getIngredientes();
  const ing = ingredientes.find(i => i.id === ingredienteId);
  if (!ing) return;
  ing.stock = Math.max(0, ing.stock + delta); // nunca negativo
  localStorage.setItem('mesaio_ingredientes', JSON.stringify(ingredientes));
},

descontarInventarioOrden(ordenId) {
  // Busca la orden, obtiene sus items, busca las recetas, descuenta ingredientes
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
  const orden = ordenes.find(o => o.id === ordenId);
  if (!orden) return [];

  const recetas = JSON.parse(localStorage.getItem('mesaio_recetas') || '[]');
  const cambios = [];

  orden.items.forEach(item => {
    const receta = recetas.find(r => r.plato_id === item.plato_id);
    if (!receta) return;

    receta.ingredientes.forEach(ing => {
      const cantidadTotal = ing.cantidad * item.cantidad;
      this.updateStock(ing.ingrediente_id, -cantidadTotal);
      const ingrediente = this.getIngredientes().find(i => i.id === ing.ingrediente_id);
      if (ingrediente) {
        cambios.push(`-${cantidadTotal}${ing.unidad} ${ingrediente.nombre}`);
      }
    });
  });

  return cambios; // array de strings para mostrar en toast
},

getAlertasStock() {
  return this.getIngredientes().filter(i => i.stock <= i.stock_minimo);
},

getCostoOrden(ordenId) {
  // Calcula costo de ingredientes para una orden (para contabilidad)
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
  const orden = ordenes.find(o => o.id === ordenId);
  if (!orden) return 0;

  const recetas = JSON.parse(localStorage.getItem('mesaio_recetas') || '[]');
  const ingredientes = this.getIngredientes();
  let costo = 0;

  orden.items.forEach(item => {
    const receta = recetas.find(r => r.plato_id === item.plato_id);
    if (!receta) return;
    receta.ingredientes.forEach(ing => {
      const ingrediente = ingredientes.find(i => i.id === ing.ingrediente_id);
      if (ingrediente) {
        costo += (ing.cantidad * ingrediente.precio_costo) * item.cantidad;
      }
    });
  });

  return Math.round(costo);
},
```

### 1.3 Funciones de contabilidad

```javascript
// ══════════════════════════════════════════════════════════
// V2 — CONTABILIDAD
// ══════════════════════════════════════════════════════════

registrarMovimiento(tipo, monto, descripcion, ordenId = null) {
  // tipo: 'venta' | 'gasto' | 'ajuste'
  const movimientos = JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]');
  movimientos.push({
    id: movimientos.length + 1,
    tipo,
    monto,
    descripcion,
    orden_id: ordenId,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('mesaio_movimientos', JSON.stringify(movimientos));
},

getMovimientosHoy() {
  const hoy = new Date().toDateString();
  return JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
    .filter(m => new Date(m.created_at).toDateString() === hoy);
},

getCierreCaja() {
  const movimientos = this.getMovimientosHoy();
  const ingresos = movimientos.filter(m => m.tipo === 'venta').reduce((s, m) => s + m.monto, 0);
  const egresos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
  return {
    ingresos,
    egresos,
    neto: ingresos - egresos,
    margen: ingresos > 0 ? (((ingresos - egresos) / ingresos) * 100).toFixed(1) : '0.0',
    numOperaciones: movimientos.length
  };
},
```

### 1.4 Funciones de facturación

```javascript
// ══════════════════════════════════════════════════════════
// V2 — FACTURACIÓN
// ══════════════════════════════════════════════════════════

generarFactura(ordenId, metodoPago = 'efectivo', incluirPropina = true) {
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
  const orden = ordenes.find(o => o.id === ordenId);
  if (!orden) return null;

  const facturas = JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
  let counter = parseInt(localStorage.getItem('mesaio_factura_counter') || '0') + 1;

  const subtotal = orden.total;
  const iva = Math.round(subtotal * 0.19);
  const propina = incluirPropina ? Math.round(subtotal * 0.10) : 0;
  const total = subtotal + iva;
  // Nota: propina es sugerida, no sumada al total fiscal

  const factura = {
    id: counter,
    numero: String(counter).padStart(6, '0'),
    orden_id: ordenId,
    mesa_id: orden.mesa_id,
    mesero_nombre: orden.mesero_nombre,
    items: orden.items.map(i => ({
      nombre: i.plato_nombre,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      subtotal: i.subtotal
    })),
    subtotal,
    iva,
    propina_sugerida: propina,
    total,
    metodo_pago: metodoPago,
    estado: 'pagada',
    cufe: this.generarCUFE(),
    resolucion_dian: '18764020853100 del 2026-01-01',
    cliente_nombre: 'Consumidor Final',
    created_at: new Date().toISOString()
  };

  facturas.push(factura);
  localStorage.setItem('mesaio_facturas', JSON.stringify(facturas));
  localStorage.setItem('mesaio_factura_counter', String(counter));

  // Registrar en contabilidad
  this.registrarMovimiento('venta', total, `Factura #${factura.numero} — Mesa ${orden.mesa_id}`, ordenId);

  // Registrar costo de ingredientes como gasto
  const costoIngredientes = this.getCostoOrden(ordenId);
  if (costoIngredientes > 0) {
    this.registrarMovimiento('gasto', costoIngredientes, `Costo ingredientes Factura #${factura.numero}`, ordenId);
  }

  return factura;
},

getFacturas() {
  return JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
},

getFacturasHoy() {
  const hoy = new Date().toDateString();
  return this.getFacturas().filter(f => new Date(f.created_at).toDateString() === hoy);
},

generarCUFE() {
  // CUFE ficticio de 12 dígitos para demo
  return String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
},
```

### 1.5 Inicialización

```javascript
// ══════════════════════════════════════════════════════════
// V2 — INICIALIZACIÓN (llamar al cargar cualquier página)
// ══════════════════════════════════════════════════════════

initAppV2() {
  this.init();   // V1 init (mesas, platos, órdenes)
  this.initV2(); // V2 seed (ingredientes, recetas)
},
```

**IMPORTANTE:** En cada HTML que ya llama `MESAIO.init()`, cambiar a `MESAIO.initAppV2()`. Esto es:
- `admin/index.html` → buscar `MESAIO.init()` → reemplazar por `MESAIO.initAppV2()`
- `cocina/index.html` → buscar `MESAIO.init()` → reemplazar por `MESAIO.initAppV2()`
- `mesero/index.html` → buscar `MESAIO.init()` → reemplazar por `MESAIO.initAppV2()`

---

## PASO 2 — ADMIN: AGREGAR 3 TABS (15 min)

### 2.1 Agregar tabs al nav

En `admin/index.html`, buscar donde están los tabs (elementos `<a>` con clase `tab`). Después del último tab ("Reportes"), agregar:

```html
<a href="#" class="tab" data-pane="inventario"><i class="bi bi-boxes"></i> Inventario</a>
<a href="#" class="tab" data-pane="contabilidad"><i class="bi bi-cash-stack"></i> Contabilidad</a>
<a href="#" class="tab" data-pane="facturacion"><i class="bi bi-receipt-cutoff"></i> Facturación</a>
```

### 2.2 Agregar los 3 panes

Después del último `<div class="pane">` existente (reportes), agregar:

```html
<!-- ══════════════════════════════════════════ -->
<!-- PANE: INVENTARIO                          -->
<!-- ══════════════════════════════════════════ -->
<div class="pane" id="pane-inventario">
  <h3 style="color:var(--burgundy, #5C1A2B);margin-bottom:16px;">
    <i class="bi bi-boxes"></i> Inventario en tiempo real
  </h3>

  <!-- Alert stock bajo -->
  <div id="alertStockBajo" style="display:none; background:#FFFBEB; border-left:4px solid #F59E0B; padding:12px 16px; border-radius:8px; margin-bottom:16px;">
    <strong>⚠️ Stock bajo:</strong> <span id="alertStockCount">0</span> ingredientes bajo mínimo
  </div>

  <!-- Grid -->
  <div style="overflow-x:auto;">
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#5C1A2B; color:white;">
          <th style="padding:10px 12px; text-align:left;">Ingrediente</th>
          <th style="padding:10px 12px; text-align:center;">Stock</th>
          <th style="padding:10px 12px; text-align:center;">Mínimo</th>
          <th style="padding:10px 12px; text-align:center;">Estado</th>
          <th style="padding:10px 12px; text-align:right;">Valor stock</th>
          <th style="padding:10px 12px; text-align:center;">Acción</th>
        </tr>
      </thead>
      <tbody id="inventarioGrid">
        <!-- JS rellena -->
      </tbody>
    </table>
  </div>
</div>

<!-- ══════════════════════════════════════════ -->
<!-- PANE: CONTABILIDAD                        -->
<!-- ══════════════════════════════════════════ -->
<div class="pane" id="pane-contabilidad">
  <h3 style="color:var(--burgundy, #5C1A2B);margin-bottom:16px;">
    <i class="bi bi-cash-stack"></i> Contabilidad del día
  </h3>

  <!-- 4 KPI cards -->
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:24px;">
    <div style="background:#ECFDF5; border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:12px; color:#6B7280;">Ingresos hoy</div>
      <div id="kpiIngresos" style="font-size:24px; font-weight:bold; color:#10B981;">$0</div>
    </div>
    <div style="background:#FFFBEB; border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:12px; color:#6B7280;">Costo ingredientes</div>
      <div id="kpiEgresos" style="font-size:24px; font-weight:bold; color:#F59E0B;">$0</div>
    </div>
    <div style="background:#EFF6FF; border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:12px; color:#6B7280;">Ganancia neta</div>
      <div id="kpiNeto" style="font-size:24px; font-weight:bold; color:#3B82F6;">$0</div>
    </div>
    <div style="background:#FAF6EE; border:2px solid #C8A951; border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:12px; color:#6B7280;">Margen</div>
      <div id="kpiMargen" style="font-size:24px; font-weight:bold; color:#5C1A2B;">0%</div>
    </div>
  </div>

  <!-- Tabla movimientos -->
  <h5>Movimientos hoy</h5>
  <div style="overflow-x:auto;">
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#5C1A2B; color:white;">
          <th style="padding:8px 10px;">Hora</th>
          <th style="padding:8px 10px;">Tipo</th>
          <th style="padding:8px 10px;">Concepto</th>
          <th style="padding:8px 10px; text-align:right;">Monto</th>
        </tr>
      </thead>
      <tbody id="movimientosGrid">
        <!-- JS rellena -->
      </tbody>
    </table>
  </div>
</div>

<!-- ══════════════════════════════════════════ -->
<!-- PANE: FACTURACIÓN                         -->
<!-- ══════════════════════════════════════════ -->
<div class="pane" id="pane-facturacion">
  <h3 style="color:var(--burgundy, #5C1A2B);margin-bottom:16px;">
    <i class="bi bi-receipt-cutoff"></i> Facturación electrónica
  </h3>

  <!-- Tabla facturas -->
  <div style="overflow-x:auto;">
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#5C1A2B; color:white;">
          <th style="padding:8px 10px;">#</th>
          <th style="padding:8px 10px;">Mesa</th>
          <th style="padding:8px 10px;">Fecha</th>
          <th style="padding:8px 10px; text-align:right;">Total</th>
          <th style="padding:8px 10px;">Método</th>
          <th style="padding:8px 10px;">CUFE</th>
          <th style="padding:8px 10px;">Acción</th>
        </tr>
      </thead>
      <tbody id="facturasGrid">
        <!-- JS rellena -->
      </tbody>
    </table>
  </div>

  <!-- Modal factura (inicialmente oculto) -->
  <div id="modalFacturaPreview" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; overflow-y:auto;">
    <div style="max-width:400px; margin:40px auto; background:white; border-radius:12px; overflow:hidden;">
      <div id="facturaHTML" style="padding:24px; font-family:'Courier New',monospace; font-size:12px;">
        <!-- Se rellena con JS al hacer click "Ver" -->
      </div>
      <div style="padding:12px; border-top:1px solid #ddd; display:flex; gap:8px; justify-content:flex-end;">
        <button onclick="window.print()" style="padding:8px 16px; background:#5C1A2B; color:white; border:none; border-radius:6px; cursor:pointer;">🖨️ Imprimir</button>
        <button onclick="document.getElementById('modalFacturaPreview').style.display='none'" style="padding:8px 16px; background:#6B7280; color:white; border:none; border-radius:6px; cursor:pointer;">Cerrar</button>
      </div>
    </div>
  </div>
</div>
```

### 2.3 Funciones JS para los 3 panes

Agregar al final del `<script>` inline de `admin/index.html`, dentro de `tabFns`:

```javascript
// En el objeto tabFns, agregar:
inventario: cargarInventario,
contabilidad: cargarContabilidad,
facturacion: cargarFacturacion,
```

Y luego las funciones:

```javascript
function cargarInventario() {
  const ingredientes = MESAIO.getIngredientes();
  const alertas = MESAIO.getAlertasStock();

  // Alert
  const alertDiv = document.getElementById('alertStockBajo');
  if (alertas.length > 0) {
    alertDiv.style.display = 'block';
    document.getElementById('alertStockCount').textContent = alertas.length;
  } else {
    alertDiv.style.display = 'none';
  }

  // Grid
  const grid = document.getElementById('inventarioGrid');
  grid.innerHTML = ingredientes.map(ing => {
    const pct = ing.stock_minimo > 0 ? (ing.stock / ing.stock_minimo) * 100 : 999;
    const estado = pct > 150 ? '🟢 OK' : pct > 100 ? '🟡 Justo' : '🔴 BAJO';
    const bgColor = pct > 150 ? '#ECFDF5' : pct > 100 ? '#FFFBEB' : '#FEF2F2';
    const valorStock = MESAIO.fmtCOP(ing.stock * ing.precio_costo);
    return `<tr style="background:${bgColor}; border-bottom:1px solid #eee;">
      <td style="padding:8px 12px;"><strong>${ing.nombre}</strong><br><small style="color:#9CA3AF;">${ing.categoria}</small></td>
      <td style="padding:8px 12px; text-align:center; font-weight:bold;">${ing.stock} ${ing.unidad}</td>
      <td style="padding:8px 12px; text-align:center; color:#9CA3AF;">${ing.stock_minimo} ${ing.unidad}</td>
      <td style="padding:8px 12px; text-align:center;">${estado}</td>
      <td style="padding:8px 12px; text-align:right;">${valorStock}</td>
      <td style="padding:8px 12px; text-align:center;">
        <button onclick="refillIngrediente(${ing.id})" style="padding:4px 10px; background:#C8A951; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">+ Refill</button>
      </td>
    </tr>`;
  }).join('');
}

function refillIngrediente(id) {
  const cantidad = prompt('¿Cuántas unidades agregar al stock?');
  if (!cantidad || isNaN(cantidad)) return;
  MESAIO.updateStock(id, parseInt(cantidad));
  MESAIO.toast('✓ Stock actualizado', 'success');
  cargarInventario();
}

function cargarContabilidad() {
  const cierre = MESAIO.getCierreCaja();
  document.getElementById('kpiIngresos').textContent = MESAIO.fmtCOP(cierre.ingresos);
  document.getElementById('kpiEgresos').textContent = MESAIO.fmtCOP(cierre.egresos);
  document.getElementById('kpiNeto').textContent = MESAIO.fmtCOP(cierre.neto);
  document.getElementById('kpiMargen').textContent = cierre.margen + '%';

  const movimientos = MESAIO.getMovimientosHoy();
  const grid = document.getElementById('movimientosGrid');
  grid.innerHTML = movimientos.map(m => {
    const color = m.tipo === 'venta' ? '#ECFDF5' : '#FEF2F2';
    const signo = m.tipo === 'venta' ? '+' : '-';
    const txtColor = m.tipo === 'venta' ? '#10B981' : '#EF4444';
    return `<tr style="background:${color}; border-bottom:1px solid #eee;">
      <td style="padding:6px 10px;">${MESAIO.fmtHora(m.created_at)}</td>
      <td style="padding:6px 10px;"><span style="background:${txtColor}; color:white; padding:2px 8px; border-radius:4px; font-size:11px;">${m.tipo.toUpperCase()}</span></td>
      <td style="padding:6px 10px;">${m.descripcion}</td>
      <td style="padding:6px 10px; text-align:right; font-weight:bold; color:${txtColor};">${signo}${MESAIO.fmtCOP(m.monto)}</td>
    </tr>`;
  }).join('');

  if (movimientos.length === 0) {
    grid.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:#9CA3AF;">Sin movimientos hoy. ¡A vender!</td></tr>';
  }
}

function cargarFacturacion() {
  const facturas = MESAIO.getFacturasHoy();
  const grid = document.getElementById('facturasGrid');

  grid.innerHTML = facturas.map(f => {
    return `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:6px 10px; font-weight:bold;">#${f.numero}</td>
      <td style="padding:6px 10px;">Mesa ${f.mesa_id}</td>
      <td style="padding:6px 10px;">${MESAIO.fmtHora(f.created_at)}</td>
      <td style="padding:6px 10px; text-align:right; font-weight:bold;">${MESAIO.fmtCOP(f.total)}</td>
      <td style="padding:6px 10px;">${f.metodo_pago}</td>
      <td style="padding:6px 10px; font-family:monospace; font-size:11px;">${f.cufe.substring(0,8)}...</td>
      <td style="padding:6px 10px;">
        <button onclick="verFactura(${f.id})" style="padding:4px 10px; background:#5C1A2B; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">👁 Ver</button>
      </td>
    </tr>`;
  }).join('');

  if (facturas.length === 0) {
    grid.innerHTML = '<tr><td colspan="7" style="padding:20px; text-align:center; color:#9CA3AF;">Sin facturas hoy</td></tr>';
  }
}

function verFactura(facturaId) {
  const facturas = MESAIO.getFacturas();
  const f = facturas.find(x => x.id === facturaId);
  if (!f) return;

  const itemsHTML = f.items.map(i =>
    `<div style="display:flex;justify-content:space-between;margin:4px 0;">
      <span>${i.nombre} ×${i.cantidad}</span>
      <span>${MESAIO.fmtCOP(i.subtotal)}</span>
    </div>`
  ).join('');

  document.getElementById('facturaHTML').innerHTML = `
    <div style="text-align:center;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #5C1A2B;">
      <h3 style="color:#5C1A2B;margin:0;">🍽️ MESAIO</h3>
      <p style="font-size:10px;margin:4px 0;color:#9CA3AF;">Sistema de gestión · Restaurante</p>
      <p style="font-size:10px;margin:2px 0;">NIT: 901.040.XXX-0</p>
    </div>
    <div style="font-size:11px;margin-bottom:10px;">
      <p style="margin:2px 0;"><strong>Factura:</strong> #${f.numero}</p>
      <p style="margin:2px 0;"><strong>Mesa:</strong> ${f.mesa_id} · <strong>Mesero:</strong> ${f.mesero_nombre}</p>
      <p style="margin:2px 0;"><strong>Fecha:</strong> ${new Date(f.created_at).toLocaleDateString('es-CO')} · ${MESAIO.fmtHora(f.created_at)}</p>
      <p style="margin:2px 0;"><strong>Cliente:</strong> ${f.cliente_nombre}</p>
    </div>
    <hr style="border:none;border-top:1px solid #5C1A2B;">
    ${itemsHTML}
    <hr style="border:none;border-top:2px solid #5C1A2B;margin:8px 0;">
    <div style="margin:8px 0;">
      <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span><span>${MESAIO.fmtCOP(f.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>IVA 19%:</span><span>${MESAIO.fmtCOP(f.iva)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#9CA3AF;"><span>Propina sugerida:</span><span>${MESAIO.fmtCOP(f.propina_sugerida)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;color:#5C1A2B;margin-top:6px;"><span>TOTAL:</span><span>${MESAIO.fmtCOP(f.total)}</span></div>
    </div>
    <hr style="border:none;border-top:1px solid #5C1A2B;">
    <div style="text-align:center;margin:10px 0;padding:8px;background:#C8A951;border-radius:6px;">
      <p style="font-size:10px;margin:2px 0;"><strong>CUFE:</strong></p>
      <p style="font-size:12px;font-weight:bold;margin:2px 0;">${f.cufe}</p>
      <p style="font-size:9px;color:#5C1A2B;margin:2px 0;">(Ficticia — Demo Hackathon)</p>
    </div>
    <div style="text-align:center;margin:8px 0;">
      <p style="margin:2px 0;font-size:11px;"><strong>Método:</strong> ${f.metodo_pago}</p>
      <p style="margin:2px 0;font-size:9px;color:#9CA3AF;">Res. DIAN: ${f.resolucion_dian}</p>
    </div>
    <div style="text-align:center;margin-top:12px;padding-top:8px;border-top:1px dashed #9CA3AF;">
      <p style="margin:0;">¡Gracias por tu visita! 🙏</p>
    </div>
  `;

  document.getElementById('modalFacturaPreview').style.display = 'block';
}
```

---

## PASO 3 — COCINA: HOOK INVENTARIO (5 min)

En `cocina/index.html`, buscar la función que cambia estado de orden. Cuando el nuevo estado sea `'listo'`, agregar:

```javascript
// BUSCAR: la línea donde se llama MESAIO.actualizarEstadoOrden(id, 'listo')
// AGREGAR JUSTO DESPUÉS:

if (nuevoEstado === 'listo') {
  const cambios = MESAIO.descontarInventarioOrden(id);
  if (cambios.length > 0) {
    MESAIO.toast('✓ Inventario: ' + cambios.slice(0, 3).join(', ') + (cambios.length > 3 ? '...' : ''), 'success');
  }
  const alertas = MESAIO.getAlertasStock();
  if (alertas.length > 0) {
    MESAIO.toast('⚠️ ' + alertas.length + ' ingredientes bajo mínimo', 'warning');
  }
}
```

**El agente debe buscar dónde exactamente se actualiza el estado a 'listo' en cocina/index.html y agregar este bloque ahí.**

---

## PASO 4 — MESERO: MODAL DE COBRO + FACTURA (10 min)

En `mesero/index.html`, modificar el flujo de cobro:

### 4.1 Agregar modal de cobro al HTML

Antes del cierre `</body>`, agregar:

```html
<!-- MODAL COBRO V2 -->
<div id="modalCobro" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; overflow-y:auto;">
  <div style="max-width:420px; margin:40px auto; background:#FAF6EE; border-radius:12px; overflow:hidden; border:2px solid #5C1A2B;">

    <div style="background:#5C1A2B; color:white; padding:16px; text-align:center;">
      <h4 style="margin:0;">💳 Cobrar Mesa <span id="cobroMesaNum"></span></h4>
    </div>

    <div style="padding:20px;">
      <!-- Items -->
      <div id="cobroItems" style="margin-bottom:12px; font-size:13px;">
        <!-- JS rellena -->
      </div>

      <hr style="border:none; border-top:2px solid #5C1A2B;">

      <!-- Totales -->
      <div style="margin:12px 0; font-size:13px;">
        <div style="display:flex; justify-content:space-between; margin:4px 0;"><span>Subtotal:</span><span id="cobroSubtotal">$0</span></div>
        <div style="display:flex; justify-content:space-between; margin:4px 0;"><span>IVA 19%:</span><span id="cobroIVA">$0</span></div>
        <div style="display:flex; justify-content:space-between; margin:4px 0; font-size:11px; color:#9CA3AF;">
          <span>Propina sugerida 10%:</span><span id="cobroPropina">$0</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:20px; font-weight:bold; color:#5C1A2B;">
          <span>TOTAL:</span><span id="cobroTotal">$0</span>
        </div>
      </div>

      <!-- Método pago -->
      <div style="margin:16px 0;">
        <label style="font-size:12px; font-weight:bold; color:#5C1A2B;">Método de pago:</label>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="metodo-btn" onclick="seleccionarMetodo('efectivo', this)" style="flex:1; padding:10px; border:2px solid #C8A951; background:white; border-radius:8px; cursor:pointer; font-size:13px;">💵 Efectivo</button>
          <button class="metodo-btn" onclick="seleccionarMetodo('tarjeta', this)" style="flex:1; padding:10px; border:2px solid #ddd; background:white; border-radius:8px; cursor:pointer; font-size:13px;">💳 Tarjeta</button>
          <button class="metodo-btn" onclick="seleccionarMetodo('transferencia', this)" style="flex:1; padding:10px; border:2px solid #ddd; background:white; border-radius:8px; cursor:pointer; font-size:13px;">📱 Transfer</button>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div style="padding:12px 20px; border-top:1px solid #ddd; display:flex; gap:8px;">
      <button onclick="document.getElementById('modalCobro').style.display='none'" style="flex:1; padding:12px; background:#6B7280; color:white; border:none; border-radius:8px; cursor:pointer;">Cancelar</button>
      <button id="btnConfirmarCobro" onclick="confirmarCobro()" style="flex:2; padding:12px; background:#C8A951; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:15px;">Cobrar y Facturar</button>
    </div>
  </div>
</div>
```

### 4.2 JS para el modal de cobro

Agregar al `<script>` de mesero/index.html:

```javascript
let cobroOrdenId = null;
let cobroMetodo = 'efectivo';

function abrirCobro(ordenId) {
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
  const orden = ordenes.find(o => o.id === ordenId);
  if (!orden) return;

  cobroOrdenId = ordenId;
  cobroMetodo = 'efectivo';

  document.getElementById('cobroMesaNum').textContent = orden.mesa_id;

  // Items
  document.getElementById('cobroItems').innerHTML = orden.items.map(i =>
    `<div style="display:flex;justify-content:space-between;margin:4px 0;">
      <span>${i.plato_nombre} ×${i.cantidad}</span>
      <span>${MESAIO.fmtCOP(i.subtotal)}</span>
    </div>`
  ).join('');

  // Totales
  const subtotal = orden.total;
  const iva = Math.round(subtotal * 0.19);
  const propina = Math.round(subtotal * 0.10);
  const total = subtotal + iva;

  document.getElementById('cobroSubtotal').textContent = MESAIO.fmtCOP(subtotal);
  document.getElementById('cobroIVA').textContent = MESAIO.fmtCOP(iva);
  document.getElementById('cobroPropina').textContent = MESAIO.fmtCOP(propina);
  document.getElementById('cobroTotal').textContent = MESAIO.fmtCOP(total);

  // Reset botones método
  document.querySelectorAll('.metodo-btn').forEach(b => b.style.borderColor = '#ddd');
  document.querySelector('.metodo-btn').style.borderColor = '#C8A951';

  document.getElementById('modalCobro').style.display = 'block';
}

function seleccionarMetodo(metodo, btn) {
  cobroMetodo = metodo;
  document.querySelectorAll('.metodo-btn').forEach(b => b.style.borderColor = '#ddd');
  btn.style.borderColor = '#C8A951';
}

function confirmarCobro() {
  if (!cobroOrdenId) return;

  // 1. Generar factura (esto también registra movimientos contables)
  const factura = MESAIO.generarFactura(cobroOrdenId, cobroMetodo);

  // 2. Marcar orden como cobrada
  MESAIO.actualizarEstadoOrden(cobroOrdenId, 'cobrado');

  // 3. Liberar mesa
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
  const orden = ordenes.find(o => o.id === cobroOrdenId);
  if (orden) {
    MESAIO.updateMesa(orden.mesa_id, { estado: 'libre' });
  }

  // 4. Toast
  MESAIO.toast(`✓ Factura #${factura.numero} generada — ${MESAIO.fmtCOP(factura.total)}`, 'success');

  // 5. Cerrar modal
  document.getElementById('modalCobro').style.display = 'none';

  // 6. Refrescar mapa de mesas
  cargarMesas(); // o la función que refresque la vista del mesero
}
```

### 4.3 Hook para abrir modal de cobro

El agente debe buscar dónde el mesero tiene la opción de "cobrar" una mesa. Típicamente hay un botón de cobro o se triggerea al tocar una mesa en estado `'cobro'` o `'entregado'`. El hook es:

```javascript
// Donde antes se hacía cerrarCuenta(ordenId) o similar:
// REEMPLAZAR con:
abrirCobro(ordenId);
```

**Si no existe un botón de cobro explícito**, el agente debe agregar uno en el modal de la orden activa, visible cuando el estado es 'entregado' o 'listo':

```html
<button onclick="abrirCobro(ordenActualId)" style="width:100%;padding:12px;background:#C8A951;color:white;border:none;border-radius:8px;font-weight:bold;font-size:15px;cursor:pointer;">
  💳 Cobrar y generar factura
</button>
```

---

## PASO 5 — VERIFICACIÓN (5 min)

### Test manual (hacer en este orden exacto):

```
1. Abrir admin → Tab Inventario → ver 25 ingredientes con stock ✓
2. Abrir mesero → tocar Mesa 1 → agregar Bandeja paisa ×1 + Limonada ×1 → Enviar ✓
3. Abrir cocina → ver orden Mesa 1 → marcar "Preparando" → marcar "Listo" ✓
4. Verificar toast "Inventario: -150g Carne molida, -1porción Frijoles..." ✓
5. Abrir admin → Tab Inventario → verificar stock decrementado ✓
6. Mesero → Mesa 1 (estado entregado/cobro) → click cobrar ✓
7. Modal cobro: ver items + subtotal + IVA + total → seleccionar "Efectivo" → "Cobrar" ✓
8. Verificar toast "Factura #000001 generada" ✓
9. Mesa 1 vuelve a libre (verde) ✓
10. Admin → Tab Contabilidad → ver ingreso + costo + margen ✓
11. Admin → Tab Facturación → ver factura #000001 → click "Ver" → preview ✓
```

**Si los 11 tests pasan: LISTO PARA DEMO.**

### Commit y deploy

```bash
git add -A
git commit -m "Mesaio v2 — Inventario + Contabilidad + Facturación"
git push origin main
# Netlify deploys automáticamente
```

---

## RESUMEN DE ARCHIVOS MODIFICADOS

| Archivo | Acción | Líneas estimadas |
|---------|--------|-----------------|
| `assets/js/mesaio-core.js` | EXTENDER (+funciones V2) | +250 líneas |
| `admin/index.html` | EXTENDER (3 tabs + 3 panes + JS) | +300 líneas |
| `cocina/index.html` | HOOK (5 líneas en función cambiarEstado) | +5 líneas |
| `mesero/index.html` | EXTENDER (modal cobro + JS) | +120 líneas |

**Total: ~675 líneas de código nuevo. 0 archivos nuevos. 0 conflictos.**

---

## DEMO 5 MINUTOS — GUION

```
0:00  Login → Mesero
0:10  Mesa 1 → Bandeja paisa + Limonada → Enviar
0:50  [Cocina] Preparando → Listo → "✓ Inventario actualizado"
1:30  [Mesero] Entregado → Cobrar → Modal: $64.260 → Efectivo → Facturar
2:30  Factura #000001 con CUFE → Mesa libre
3:00  [Admin] Dashboard: +$64.260 ventas
3:30  [Admin] Inventario: stock decrementado
4:00  [Admin] Contabilidad: ingreso + costo + margen 81%
4:30  [Admin] Facturación: factura #000001 → preview completo
5:00  "3 sistemas en 1. Sin backend. Listo para escalar."
```

---

**ESTADO: 🟢 EJECUTAR AHORA. SIN AMBIGÜEDADES. UNA SOLA VERDAD.**
