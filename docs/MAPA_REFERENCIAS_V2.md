# MAPA DE REFERENCIAS Y ARQUITECTURA V2

**Para:** Arquitecto (Claude Web) y Claude Code local  
**Propósito:** Referencia unificada de qué toca qué. Consultar antes de escribir cualquier línea de V2.

---

## 1. ÁRBOL DE DEPENDENCIAS — V1 FUNCIONAL (NO TOCAR)

```
login.html
  ├─→ mesero/index.html
  ├─→ cocina/index.html
  └─→ admin/index.html

mesero/index.html
  ├─→ ../assets/vendor/bootstrap-icons/bootstrap-icons.css
  ├─→ https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1  (CDN)
  └─→ ../assets/js/mesaio-core.js  ★ NÚCLEO

cocina/index.html
  ├─→ ../assets/vendor/bootstrap-icons/bootstrap-icons.css
  ├─→ https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1  (CDN)
  └─→ ../assets/js/mesaio-core.js  ★ NÚCLEO

admin/index.html
  ├─→ ../assets/vendor/bootstrap-icons/bootstrap-icons.css
  ├─→ https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1  (CDN)
  └─→ ../assets/js/mesaio-core.js  ★ NÚCLEO

inventario/index.html  [V2 PLACEHOLDER]
  ├─→ ../assets/vendor/bootstrap-icons/bootstrap-icons.css
  ├─→ https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1  (CDN)
  └─→ ../assets/js/mesaio-core.js  ★ NÚCLEO

contabilidad/index.html  [V2 PLACEHOLDER]
  ├─→ ../assets/vendor/bootstrap-icons/bootstrap-icons.css
  ├─→ https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1  (CDN)
  └─→ ../assets/js/mesaio-core.js  ★ NÚCLEO

facturacion/index.html  [V2 PLACEHOLDER]
  ├─→ ../assets/vendor/bootstrap-icons/bootstrap-icons.css
  ├─→ https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1  (CDN)
  └─→ ../assets/js/mesaio-core.js  ★ NÚCLEO
```

---

## 2. _redirects — RUTAS PÚBLICAS COMPLETAS (V1 + V2)

```
# V1 — FUNCIONALES
/admin         → /admin/index.html
/mesero        → /mesero/index.html
/cocina        → /cocina/index.html
/login         → /login.html
/menu          → /menu.html
/carta         → /menu.html (alias)
/entregables   → /entregables/index.html
/demo          → /entregables/index.html (alias)

# V2 — PLACEHOLDERS ACTIVOS
/inventario    → /inventario/index.html
/contabilidad  → /contabilidad/index.html
/facturacion   → /facturacion/index.html
```

---

## 3. LOCALSTORAGE — KEYS EXISTENTES V1 (INTOCABLES)

```javascript
mesaio_mesas          // [{ id, numero, capacidad, estado, ubicacion }]
mesaio_platos         // [{ id, nombre, categoria, precio, disponible, descripcion }]
mesaio_ordenes        // [{ id, mesa_id, mesero_nombre, estado, total, notas, items[], created_at, updated_at }]
mesaio_orden_counter  // Number (auto-increment para IDs)
```

**Schema de items (dentro de cada orden):**
```javascript
items: [{
  plato_id: Number,
  plato_nombre: String,
  cantidad: Number,
  precio_unitario: Number,
  subtotal: Number,
  observaciones: String
}]
```

**Estados de orden:**
`pendiente → preparando → listo → entregado → cobrado | cancelado`

**Estados de mesa:**
`libre → ocupada → cobro → libre`

---

## 4. LOCALSTORAGE — KEYS NUEVAS V2 (agregar sin modificar V1)

```javascript
// INVENTARIO
mesaio_ingredientes  // [{ id, nombre, unidad, stock, stock_minimo, precio_costo }]
mesaio_recetas       // [{ plato_id, ingredientes: [{ ingrediente_id, cantidad, unidad }] }]

// CONTABILIDAD
mesaio_movimientos   // [{ id, tipo ('venta'|'gasto'), monto, descripcion, created_at }]
mesaio_caja_abierta  // Boolean (si la caja está abierta)

// FACTURACIÓN
mesaio_facturas      // [{ id, orden_id, cufe, numero, total, cliente_nombre, created_at }]
mesaio_factura_counter  // Number (numeración correlativa)
```

**Importante:** Al iniciar V2, verificar si `mesaio_v2_seed` existe en localStorage. Si no, hacer seed de ingredientes y recetas base.

---

## 5. mesaio-core.js — FUNCIONES EXISTENTES V1 (NO MODIFICAR)

```javascript
MESAIO.init()
MESAIO.getMesas()
MESAIO.updateMesa(id, campos)
MESAIO.getPlatos(categoria?)
MESAIO.getAllPlatos()
MESAIO.togglePlato(id)
MESAIO.getOrdenes(estado?)
MESAIO.getOrdenesActivas()
MESAIO.crearOrden(mesa_id, items, mesero, notas)
MESAIO.actualizarEstadoOrden(orden_id, nuevoEstado)
MESAIO.getStats()
MESAIO.suscribirOrdenes(callback)
MESAIO.fmtCOP(n)
MESAIO.fmtHora(iso)
MESAIO.tiempoTranscurrido(iso)
MESAIO.badgeEstado(estado)
MESAIO.toast(msg, type)
```

---

## 6. mesaio-core.js — FUNCIONES NUEVAS A AGREGAR EN V2

Agregar al final del objeto `MESAIO`, antes del cierre `};`

```javascript
// ── INVENTARIO ──────────────────────────────────
getIngredientes()           // → Array de ingredientes con stock
updateStock(id, delta)      // delta negativo = descontar; positivo = reponer
descontarInventarioOrden(orden_id)  // aplica recetas de todos los platos de la orden
getAlertasStock()           // → Array de ingredientes con stock < stock_minimo

// ── CONTABILIDAD ────────────────────────────────
registrarMovimiento(tipo, monto, descripcion)
getMovimientos(fecha?)      // fecha = YYYY-MM-DD; sin fecha = hoy
getCierreCaja(fecha?)       // → { ingresos, egresos, neto, ordenes_count }

// ── FACTURACIÓN ─────────────────────────────────
generarFactura(orden_id, cliente_nombre?)  // → factura con CUFE generado
getFacturas(fecha?)
imprimirFactura(factura_id)  // → HTML de factura para window.print()
```

---

## 7. PUNTOS DE EXTENSIÓN EN ARCHIVOS EXISTENTES

### cocina/index.html — función `cambiarEstado()`
Insertar cuando `nuevoEstado === 'listo'`:
```javascript
// HOOK V2: descontar inventario al marcar listo
if (nuevoEstado === 'listo') {
  try {
    await MESAIO.descontarInventarioOrden(id);
    // toast opcional de confirmación
  } catch(e) {
    console.warn('Inventario no disponible:', e);
  }
}
```

### mesero/index.html — función `cerrarCuenta(id)`
Insertar antes de `actualizarEstadoOrden`:
```javascript
// HOOK V2: generar factura y registrar en contabilidad
const factura = await MESAIO.generarFactura(id);
await MESAIO.registrarMovimiento('venta', orden.total, `Mesa ${orden.mesa_id} - Factura #${factura.numero}`);
// Opcional: mostrar modal de factura antes de cerrar
```

### admin/index.html — agregar 3 tabs
```html
<!-- En div.tabs, después de "Reportes": -->
<a href="#" class="tab" data-pane="inventario"><i class="bi bi-boxes"></i> Inventario</a>
<a href="#" class="tab" data-pane="contabilidad"><i class="bi bi-cash-stack"></i> Contabilidad</a>
<a href="#" class="tab" data-pane="facturacion"><i class="bi bi-receipt-cutoff"></i> Facturación</a>

<!-- Nuevos panes (antes del </div> del wrap): -->
<div class="pane" id="pane-inventario"><!-- contenido V2 --></div>
<div class="pane" id="pane-contabilidad"><!-- contenido V2 --></div>
<div class="pane" id="pane-facturacion"><!-- contenido V2 --></div>
```

```javascript
// En tabFns (script inline de admin):
const tabFns = {
  dashboard: cargarDashboard,
  platos: cargarPlatos,
  mesas: cargarMesas,
  ordenes: cargarOrdenes,
  reportes: cargarReportes,
  inventario: cargarInventario,       // V2
  contabilidad: cargarContabilidad,   // V2
  facturacion: cargarFacturacion      // V2
};
```

---

## 8. SCHEMA SQL V2 (agregar al final de sql/schema.sql)

```sql
-- ═══════════════════════════
-- TABLAS V2 — MESAIO
-- ═══════════════════════════

CREATE TABLE IF NOT EXISTS ingredientes (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  unidad      TEXT DEFAULT 'unidad',  -- g, ml, unidad, porción
  stock       NUMERIC DEFAULT 0,
  stock_min   NUMERIC DEFAULT 0,
  precio_costo NUMERIC DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recetas (
  id              SERIAL PRIMARY KEY,
  plato_id        INT REFERENCES platos(id),
  ingrediente_id  INT REFERENCES ingredientes(id),
  cantidad        NUMERIC NOT NULL,
  unidad          TEXT
);

CREATE TABLE IF NOT EXISTS movimientos_caja (
  id          SERIAL PRIMARY KEY,
  tipo        TEXT CHECK (tipo IN ('venta','gasto','ajuste')),
  monto       NUMERIC NOT NULL,
  descripcion TEXT,
  orden_id    INT REFERENCES ordenes(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facturas (
  id             SERIAL PRIMARY KEY,
  orden_id       INT REFERENCES ordenes(id),
  numero         INT NOT NULL,
  cufe           TEXT,
  cliente_nombre TEXT DEFAULT 'Consumidor Final',
  total          NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. ESTRUCTURA DE ARCHIVOS — ESTADO FINAL

```
c5_mesaio/
├── index.html               [landing — público]
├── login.html               [selector roles — público]
├── menu.html                [carta digital — público]
├── _redirects               [11 rutas: 8 V1 + 3 V2]
├── mesaio.code-workspace
│
├── mesero/index.html        [V1 — funcional]
├── cocina/index.html        [V1 — funcional]
├── admin/index.html         [V1 — extender en V2]
├── entregables/index.html   [demo portal]
│
├── inventario/index.html    [V2 — placeholder]
├── contabilidad/index.html  [V2 — placeholder]
├── facturacion/index.html   [V2 — placeholder]
│
├── assets/
│   ├── js/mesaio-core.js   [★ NÚCLEO — extender en V2]
│   └── vendor/bootstrap-icons/  [compartido por todos]
│
├── sql/schema.sql           [+ tablas V2 al final]
│
├── docs/                    [documentación spec]
│   ├── SUPER_SPEC_MESAIO_v1.md
│   ├── SPEC_DIAGNOSTICO_ARQUITECTO.md
│   ├── SPEC_PITCH_CHATGPT.md
│   ├── INSTRUCCIONES_NANDO.md
│   ├── RESPUESTAS_CLAUDE_CODE_AL_ARQUITECTO.md
│   ├── MAPA_REFERENCIAS_V2.md  [← ESTE ARCHIVO]
│   └── legacy/              [archivos RNT heredados]
│       ├── MANUAL_OPERARIO.md
│       └── manual.html
│
└── MEJORAS_TOTALES/         [roadmap estratégico]
    ├── ROADMAP_MADUREZ_MESAIO_CLASE_MUNDIAL.md
    └── PLATAFORMA_AGNÓSTICA_PYMES_80_20_ARQUITECTURA_CLASE_MUNDIAL.md
```

---

## 10. REGLAS DE ORO

1. **NUNCA mover** `assets/js/mesaio-core.js` sin actualizar los 6 HTMLs que lo referencian
2. **NUNCA mover** `assets/vendor/bootstrap-icons/` sin actualizar los 6 HTMLs
3. **SIEMPRE agregar** funciones nuevas al OBJETO MESAIO, no crear objetos paralelos
4. **SIEMPRE usar** `../assets/js/mesaio-core.js` (ruta relativa con `../`) desde subcarpetas
5. **NUNCA modificar** las keys V1 de localStorage; solo agregar keys nuevas
6. **Al cobrar** (mesero) → generar factura + registrar movimiento de caja
7. **Al marcar listo** (cocina) → descontar inventario según receta
