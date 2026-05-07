# SUPER SPEC MESAIO v2.1 — SPEC DEFINITIVO
## Frontend Completo · Hackathon 2 · Abstracción AppCors-Ready
**Ejecutor:** 1 agente Claude Code (Opus 4.6) secuencial  
**Stack:** HTML5 + CSS3 + Vanilla JS ES6+ · Bootstrap 5.3 · LocalStorage  
**Objetivo:** Ganar hackathon 2 (mejor sistema integrado para restaurante)  
**Visión:** Este frontend se conectará a backend real → luego se ensambla como plantilla vertical en AppCors (TITAN)

---

## 0. CONTRATO CON EL AGENTE EJECUTOR

### Qué eres
Eres un ingeniero frontend elite construyendo un MVP de demostración para un sistema de gestión de restaurantes. Tu trabajo ganó el primer hackathon. Ahora debes ganar el segundo integrando inventario, contabilidad y facturación electrónica.

### Qué puedes hacer libremente
- Estilizar con creatividad dentro de la paleta definida (burgundy/gold/cream)
- Elegir layout de componentes Bootstrap que mejor se vean
- Agregar microinteracciones, transiciones CSS, tooltips
- Mejorar UX de pantallas existentes si encuentras oportunidades
- Reorganizar código internamente para mayor limpieza
- Agregar iconos Bootstrap Icons donde mejoren la legibilidad

### Qué NO puedes cambiar
- Paleta de colores (burgundy #5C1A2B, gold #C8A951, cream #FAF6EE)
- Tipografía (Playfair Display títulos, Inter cuerpo)
- Stack (HTML + vanilla JS + Bootstrap 5.3 + LocalStorage)
- Estructura de datos existente (mesaio_mesas, mesaio_platos, mesaio_ordenes, mesaio_orden_counter)
- Flujo core: mesero → cocina → admin (solo extender, no romper)
- Landing page (index.html) — solo actualizar la sección de features si lo deseas
- Login page (login.html) — intocable

### Principio fundamental
**Por encima:** capa hermosa, personalizada, que dice "Mesaio" en cada pixel.  
**Por debajo:** capa de datos abstracta que mañana se conecta a API REST sin reescribir UI.

---

## 1. ARQUITECTURA DE DATOS — CAPA DE ABSTRACCIÓN

### 1.1 El patrón: DataAdapter

El secreto de este MVP es que TODO acceso a datos pasa por un objeto `MesaioData`. Hoy lee/escribe de LocalStorage. Mañana se reemplaza por fetch() a API REST. La UI NO sabe de dónde vienen los datos.

```javascript
// assets/js/mesaio-data.js — CAPA DE ABSTRACCIÓN (crear este archivo)
//
// HOY: localStorage
// MAÑANA: fetch('https://api.appcors.com/v1/...')
// LA UI NO CAMBIA.

const MesaioData = {
  // ══════════════════════════════════════════
  // MODO: 'local' | 'api' (futuro)
  // ══════════════════════════════════════════
  mode: 'local',

  // ══════════════════════════════════════════
  // ENTIDADES GENÉRICAS (80% — igual para cualquier negocio)
  // ══════════════════════════════════════════

  // --- Transacciones (órdenes) ---
  getTransactions(filter = {}) { /* lee mesaio_ordenes, filtra por estado/fecha */ },
  getTransaction(id) { /* busca orden por id */ },
  createTransaction(data) { /* crea orden, auto-incrementa counter */ },
  updateTransactionStatus(id, status) { /* actualiza estado */ },

  // --- Catálogo (platos/productos/servicios) ---
  getCatalog(category = null) { /* lee mesaio_platos, filtra por categoría */ },
  getCatalogItem(id) { /* busca plato por id */ },
  updateCatalogItem(id, data) { /* actualiza plato */ },
  toggleCatalogAvailability(id) { /* toggle disponible */ },

  // --- Inventario (ingredientes + stock) ---
  getInventory() { /* lee mesaio_ingredientes */ },
  getInventoryItem(id) { /* busca ingrediente por id */ },
  updateStock(id, delta, reason) { /* suma/resta stock, registra motivo */ },
  getLowStockItems() { /* filtra stock < stock_minimo */ },

  // --- Recetas (plato → ingredientes) ---
  getRecipes() { /* lee mesaio_recetas */ },
  getRecipeForItem(catalogId) { /* busca receta por plato_id */ },
  applyRecipeDecrement(transaction) { /* descuenta ingredientes según receta */ },

  // --- Comprobantes de pago (facturas) ---
  getReceipts(filter = {}) { /* lee mesaio_comprobantes_pago */ },
  getReceipt(id) { /* busca comprobante por id */ },
  createReceipt(transactionId, paymentMethod) { /* genera factura mock */ },

  // --- Estadísticas contables ---
  getAccountingStats(dateRange) { /* calcula ingresos, egresos, margen */ },
  getDailySummary() { /* resumen del día */ },

  // ══════════════════════════════════════════
  // ENTIDADES ESPECÍFICAS RESTAURANTE (20% — solo para este vertical)
  // ══════════════════════════════════════════

  // --- Estaciones/Mesas ---
  getStations() { /* lee mesaio_mesas */ },
  getStation(id) { /* busca mesa por id */ },
  updateStationStatus(id, status) { /* actualiza estado mesa */ },

  // ══════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════
  fmtCOP(n) { /* formatea número a pesos colombianos */ },
  fmtHora(iso) { /* formatea ISO a hora legible */ },
  generateCUFE() { /* genera CUFE ficticio 12 dígitos */ },
  generateReceiptNumber() { /* auto-incrementa número factura */ },
  toast(msg, type) { /* muestra notificación temporal */ },
  tiempoTranscurrido(iso) { /* calcula "hace X min" */ },
  badgeEstado(estado) { /* retorna HTML de badge coloreado */ },
};
```

**INSTRUCCIÓN CRÍTICA PARA EL AGENTE:** Implementa `MesaioData` completo como primer archivo. TODA la UI debe llamar a `MesaioData.getX()` y `MesaioData.createX()`. Nunca `JSON.parse(localStorage.getItem(...))` directamente en archivos de UI. Esto es lo que hace a Mesaio ensamblable con AppCors después.

### 1.2 LocalStorage Keys (schema completo)

```javascript
// ═══ EXISTENTES (v1 — NO MODIFICAR ESTRUCTURA) ═══
mesaio_mesas          // Array<{ id, numero, capacidad, estado, ubicacion }>
mesaio_platos         // Array<{ id, nombre, categoria, precio, disponible, descripcion }>
mesaio_ordenes        // Array<{ id, mesa_id, mesero_nombre, estado, total, notas, items[], created_at, updated_at }>
mesaio_orden_counter  // Number (auto-incremento)

// ═══ NUEVOS (v2 — AGREGAR) ═══
mesaio_ingredientes       // Array<IngredienteSchema>
mesaio_recetas            // Array<RecetaSchema>
mesaio_comprobantes_pago  // Array<ComprobanteSchema>
mesaio_comprobante_counter // Number (auto-incremento facturas)
mesaio_version            // String "2.1" (detecta upgrade)
```

### 1.3 Schemas nuevos (detalle)

```javascript
// IngredienteSchema
{
  id: Number,
  nombre: String,
  unidad: String,           // "g" | "ml" | "unidad" | "porción"
  stock: Number,
  stock_minimo: Number,
  costo_unitario: Number,   // COP por unidad
  categoria: String,        // "proteína" | "vegetal" | "grano" | "lácteo" | "bebida" | "condimento"
  proveedor: String
}

// RecetaSchema
{
  id: Number,
  plato_id: Number,         // FK a mesaio_platos
  nombre: String,
  ingredientes: [{
    ingrediente_id: Number,
    nombre: String,
    cantidad: Number,
    unidad: String
  }]
}

// ComprobanteSchema
{
  id: Number,
  numero_factura: String,   // "000001" (padStart 6)
  orden_id: Number,
  mesa_id: Number,
  mesero_nombre: String,
  items: [{                 // copia de items de la orden
    nombre: String,
    cantidad: Number,
    precio_unitario: Number,
    subtotal: Number
  }],
  subtotal: Number,
  iva: Number,              // subtotal × 0.19
  propina_sugerida: Number, // subtotal × 0.10
  total: Number,            // subtotal + iva
  metodo_pago: String,      // "efectivo" | "tarjeta" | "transferencia" | "mixto"
  estado: String,           // "pagado" | "pendiente" | "anulado"
  cufe: String,             // 12 dígitos ficticios
  resolucion_dian: String,  // "18764020853100 del 2026-01-01" (ficticia)
  fecha_emision: String,    // ISO
  fecha_pago: String        // ISO
}
```

---

## 2. DATOS SEED — INGREDIENTES Y RECETAS

### 2.1 Ingredientes (25 items que cubren los 15 platos)

El agente debe crear un seed de 25 ingredientes distribuidos así:

| # | Nombre | Unidad | Stock inicial | Mínimo | Costo unit. (COP) | Categoría |
|---|--------|--------|--------------|--------|-------------------|-----------|
| 1 | Carne de res | g | 8000 | 1000 | 18 | proteína |
| 2 | Carne molida | g | 5000 | 500 | 15 | proteína |
| 3 | Pollo desmechado | g | 4000 | 500 | 12 | proteína |
| 4 | Cerdo (lechona) | g | 3000 | 500 | 16 | proteína |
| 5 | Chicharrón | porción | 30 | 5 | 3000 | proteína |
| 6 | Pescado (mojarra) | unidad | 15 | 3 | 12000 | proteína |
| 7 | Mariscos mixtos | g | 2000 | 300 | 35 | proteína |
| 8 | Huevo | unidad | 60 | 10 | 600 | proteína |
| 9 | Frijoles cocidos | porción | 40 | 8 | 1500 | grano |
| 10 | Arroz blanco | porción | 60 | 10 | 800 | grano |
| 11 | Papa criolla | g | 3000 | 500 | 5 | vegetal |
| 12 | Papa pastusa | g | 4000 | 500 | 4 | vegetal |
| 13 | Plátano maduro | unidad | 40 | 8 | 800 | vegetal |
| 14 | Yuca | g | 2000 | 300 | 6 | vegetal |
| 15 | Mazorca | unidad | 20 | 4 | 1500 | vegetal |
| 16 | Aguacate | unidad | 20 | 4 | 2500 | vegetal |
| 17 | Arepa de maíz | unidad | 50 | 10 | 500 | grano |
| 18 | Leche de coco | ml | 3000 | 500 | 8 | lácteo |
| 19 | Crema de leche | ml | 2000 | 300 | 10 | lácteo |
| 20 | Limón | unidad | 40 | 8 | 300 | vegetal |
| 21 | Panela rallada | g | 1000 | 200 | 6 | condimento |
| 22 | Chocolate amargo | g | 500 | 100 | 40 | condimento |
| 23 | Helado vainilla | porción | 20 | 4 | 2500 | lácteo |
| 24 | Cerveza artesanal | unidad | 48 | 10 | 3500 | bebida |
| 25 | Vino tinto copa | porción | 24 | 5 | 8000 | bebida |

### 2.2 Recetas (15 recetas, una por plato)

El agente debe crear recetas que mapeen cada plato a sus ingredientes. Ejemplo para los primeros 5:

```
Empanadas vallunas (id:1) → Papa pastusa 200g + Carne molida 100g
Ajiaco santafereño (id:2) → Pollo 200g + Papa criolla 150g + Papa pastusa 150g + Mazorca 1 + Crema 50ml
Sancocho trifásico (id:3) → Carne de res 100g + Cerdo 100g + Pollo 100g + Yuca 150g + Plátano 1 + Mazorca 1
Lomo al trapo (id:4) → Carne de res 350g + Papa criolla 200g
Bandeja paisa (id:5) → Carne molida 150g + Frijoles 1 porción + Arroz 1 porción + Huevo 1 + Plátano 1 + Arepa 1 + Aguacate 0.5 + Chicharrón 1 porción
```

**El agente debe completar las 15 recetas** con ingredientes razonables para cada plato del menú. Usar sentido común culinario colombiano.

---

## 3. ESTRUCTURA DE ARCHIVOS

```
c8_mesaio/
│
├── index.html                              ← INTOCABLE (landing)
├── login.html                              ← INTOCABLE (selector roles)
├── menu.html                               ← INTOCABLE (carta digital)
├── _redirects                              ← INTOCABLE
│
├── assets/
│   ├── js/
│   │   ├── mesaio-data.js                  ← ✨ NUEVO: capa de abstracción (CREAR PRIMERO)
│   │   ├── mesaio-core.js                  ← EXTENDER: agregar init v2, seed ingredientes/recetas
│   │   ├── mesaio-inventario.js            ← ✨ NUEVO: lógica inventario
│   │   ├── mesaio-facturacion.js           ← ✨ NUEVO: lógica facturación + QR
│   │   └── mesaio-contabilidad.js          ← ✨ NUEVO: lógica contabilidad
│   ├── css/
│   │   ├── mesaio-theme.css                ← ✨ NUEVO: variables CSS centralizadas + extensiones v2
│   │   └── (CSS existente — mantener)
│   └── (fonts, imágenes — mantener)
│
├── mesero/
│   └── index.html                          ← EXTENDER: agregar botón "Cobrar" → modal facturación
│
├── cocina/
│   └── index.html                          ← EXTENDER: al marcar "Listo" → descontar inventario
│
├── admin/
│   └── index.html                          ← EXTENDER: agregar 3 tabs nuevos
│
├── entregables/
│   └── index.html                          ← ACTUALIZAR: agregar cards de nuevas features
│
└── sql/
    └── schema.sql                          ← ACTUALIZAR: agregar tablas ingredientes/recetas/comprobantes
```

---

## 4. CHECKPOINTS DE IMPLEMENTACIÓN

### Orden secuencial obligatorio (1 agente, paso a paso)

```
CP-0  [10 min]  FUNDACIÓN
      ├── Crear assets/js/mesaio-data.js (capa de abstracción completa)
      ├── Crear assets/css/mesaio-theme.css (variables CSS + estilos v2)
      └── Verificar: archivos creados, sin errores de sintaxis

CP-1  [10 min]  DATOS SEED
      ├── Extender mesaio-core.js: función initV2() que:
      │   ├── Seed 25 ingredientes → mesaio_ingredientes
      │   ├── Seed 15 recetas → mesaio_recetas
      │   ├── Init mesaio_comprobantes_pago = []
      │   ├── Init mesaio_comprobante_counter = 0
      │   └── Set mesaio_version = "2.1"
      ├── Crear mesaio-inventario.js (funciones inventario)
      ├── Crear mesaio-facturacion.js (funciones facturación)
      ├── Crear mesaio-contabilidad.js (funciones contabilidad)
      └── Verificar: abrir consola, llamar initV2(), confirmar datos en localStorage

CP-2  [20 min]  ADMIN — 3 TABS NUEVOS
      ├── Modificar admin/index.html:
      │   ├── Agregar 3 tabs: Inventario, Contabilidad, Facturación
      │   ├── Tab Inventario: grid de ingredientes con badges stock OK/BAJO
      │   ├── Tab Contabilidad: 4 cards KPI + tabla movimientos + cierre caja
      │   ├── Tab Facturación: tabla histórico facturas + modal ver factura
      │   └── Incluir los nuevos JS files en <script>
      └── Verificar: navegar las 8 tabs, datos se muestran correctamente

CP-3  [15 min]  COCINA — DESCUENTO INVENTARIO
      ├── Modificar cocina/index.html:
      │   ├── Al marcar orden "Listo" → llamar MesaioData.applyRecipeDecrement(orden)
      │   ├── Mostrar toast: "Inventario actualizado: -150g carne, -1 porción frijoles..."
      │   └── Si algún ingrediente queda bajo mínimo → toast warning
      └── Verificar: marcar orden listo → ir a admin/inventario → stock decrementado

CP-4  [15 min]  MESERO — FLUJO DE COBRO Y FACTURACIÓN
      ├── Modificar mesero/index.html:
      │   ├── Cuando mesa está en estado "cobro" → mostrar botón "Generar factura"
      │   ├── Modal de cobro:
      │   │   ├── Resumen items + subtotal + IVA (19%) + propina sugerida (10%)
      │   │   ├── Selector método pago (efectivo/tarjeta/transferencia)
      │   │   ├── Botón "Cobrar y generar factura"
      │   │   └── Al confirmar → MesaioData.createReceipt() → mostrar factura visual
      │   ├── Factura visual en modal (ver spec sección 6):
      │   │   ├── Header restaurante + NIT ficticio
      │   │   ├── Tabla items
      │   │   ├── Totales (subtotal + IVA + propina + TOTAL)
      │   │   ├── CUFE ficticio + QR (canvas)
      │   │   ├── Resolución DIAN ficticia
      │   │   └── Botón "Imprimir" (window.print) + "Cerrar"
      │   └── Al cerrar factura → mesa vuelve a "libre"
      └── Verificar: flujo completo mesero → cobrar → factura → mesa libre

CP-5  [10 min]  INTEGRACIÓN Y POLISH
      ├── Verificar flujo completo de 5 minutos (sección 5)
      ├── Actualizar entregables/index.html con nuevas features
      ├── Actualizar sql/schema.sql con tablas nuevas
      ├── Revisar responsive (mobile/tablet/desktop)
      ├── Limpiar console.log innecesarios
      └── Commit + push a GitHub + deploy Netlify

TOTAL: ~80 minutos (con margen para iteración)
```

---

## 5. FLUJO DEMO 5 MINUTOS (guion exacto)

```
ACTO 1: ORDEN (0:00 — 1:00)
  → Login como Mesero
  → Toca Mesa 1 (libre, verde)
  → Modal: selecciona Bandeja paisa ×1 ($42.000) + Limonada de coco ×1 ($12.000)
  → Total: $54.000
  → "Enviar a cocina" → mesa cambia a ocupada (amarilla)

ACTO 2: PREPARACIÓN (1:00 — 2:00)
  → Switch a pestaña Cocina
  → Ve card "Mesa 1 — 2 items" en PENDIENTES
  → Click "Preparando" → card se mueve
  → Click "Listo" → card se mueve a LISTOS
  → Toast: "✓ Inventario actualizado: -150g carne molida, -1 porción frijoles..."
  → (El jurado ve: inventario se descuenta AUTOMÁTICAMENTE)

ACTO 3: COBRO Y FACTURA (2:00 — 3:30)
  → Switch a Mesero
  → Mesa 1 parpadea (esperando entrega)
  → Click mesa → "Marcar entregado"
  → Mesa cambia a estado "cobro" (azul)
  → Click "Generar factura"
  → Modal de cobro:
    • Bandeja paisa ×1 ............ $42.000
    • Limonada de coco ×1 ......... $12.000
    • ─────────────────────────────────────
    • Subtotal ..................... $54.000
    • IVA 19% ..................... $10.260
    • Propina sugerida 10% ........ $5.400
    • ═════════════════════════════════════
    • TOTAL ....................... $64.260
  → Selecciona "Efectivo"
  → "Cobrar y generar factura"
  → Factura aparece:
    • #000001 · CUFE: 847291036485 · QR · Resolución DIAN ficticia
  → Mesa vuelve a LIBRE (verde)

ACTO 4: ADMIN — TODO ACTUALIZADO (3:30 — 4:30)
  → Switch a Admin
  → Tab Dashboard: ventas +$64.260, 1 orden completada, plato top "Bandeja paisa"
  → Tab Inventario: carne molida 4.850g (era 5.000), frijoles 39 porciones (era 40)...
    • Badges verdes "OK" o rojos "BAJO" según stock
  → Tab Contabilidad:
    • Ingresos hoy: $64.260
    • Costo ingredientes: ~$12.400 (calculado automáticamente)
    • Ganancia neta: ~$51.860
    • Margen: ~81%
  → Tab Facturación:
    • Factura #000001 — Mesa 1 — PAGADA — Efectivo — $64.260

ACTO 5: CIERRE (4:30 — 5:00)
  → "Todo funciona en frontend puro. Sin backend. Sin servidor."
  → "Reemplaza Alegra (contabilidad), el sistema de mesas, y el de inventario."
  → "3 sistemas que el restaurante paga por separado → 1 solo: Mesaio."
```

---

## 6. ESPECIFICACIONES VISUALES POR MÓDULO

### 6.1 CSS Theme centralizado (mesaio-theme.css)

```css
/* ═══ VARIABLES CENTRALIZADAS ═══ */
:root {
  /* Brand */
  --mesaio-burgundy: #5C1A2B;
  --mesaio-burgundy-light: #7A2E42;
  --mesaio-burgundy-dark: #3D0F1B;
  --mesaio-gold: #C8A951;
  --mesaio-gold-light: #E0C97A;
  --mesaio-cream: #FAF6EE;
  --mesaio-cream-dark: #F0EBE0;

  /* Estados */
  --mesaio-success: #10B981;
  --mesaio-success-bg: #ECFDF5;
  --mesaio-warning: #F59E0B;
  --mesaio-warning-bg: #FFFBEB;
  --mesaio-danger: #EF4444;
  --mesaio-danger-bg: #FEF2F2;
  --mesaio-info: #3B82F6;
  --mesaio-info-bg: #EFF6FF;

  /* Texto */
  --mesaio-text: #1F1F1F;
  --mesaio-text-secondary: #6B7280;
  --mesaio-text-muted: #9CA3AF;

  /* Layout */
  --mesaio-radius: 8px;
  --mesaio-radius-lg: 12px;
  --mesaio-shadow: 0 1px 3px rgba(0,0,0,0.08);
  --mesaio-shadow-lg: 0 4px 12px rgba(0,0,0,0.12);
  --mesaio-transition: all 0.2s ease;
}
```

El agente tiene libertad para expandir este archivo con clases utilitarias que considere necesarias. Lo importante es que TODAS las páginas compartan estas variables.

### 6.2 Tab Inventario (admin)

**Layout:** Tabla responsiva con 7 columnas.

| Columna | Dato | Visual |
|---------|------|--------|
| Ingrediente | nombre | Texto + ícono categoría |
| Stock | stock actual + unidad | Número grande |
| Mínimo | stock_minimo | Número pequeño gris |
| Barra | % stock vs mínimo | Progress bar (verde >100%, amarillo 50-100%, rojo <50%) |
| Costo | costo_unitario × stock | Formato COP |
| Estado | OK / BAJO / CRÍTICO | Badge coloreado |
| Acción | Refill | Botón outline que abre modal |

**Modal Refill:**
- Input: cantidad a agregar
- Input: proveedor (texto libre)
- Al guardar: stock += cantidad, toast confirmación

**Alert superior:** Si hay ingredientes bajo mínimo, mostrar barra amarilla/roja con conteo.

### 6.3 Tab Contabilidad (admin)

**Layout:** 4 cards KPI arriba + tabla movimientos abajo + cierre de caja.

**Cards KPI (fila de 4):**

| Card | Título | Valor | Color |
|------|--------|-------|-------|
| 1 | Ingresos hoy | $XX.XXX | Verde |
| 2 | Costo ingredientes | $XX.XXX | Ámbar |
| 3 | Ganancia neta | $XX.XXX | Azul |
| 4 | Margen % | XX.X% | Burgundy |

**Tabla movimientos:**

| Hora | Tipo | Concepto | Monto | Saldo acumulado |
|------|------|----------|-------|-----------------|
| 14:46 | INGRESO | Factura #000001 (Mesa 1) | +$64.260 | $64.260 |
| — | COSTO | Ingredientes factura #000001 | -$12.400 | $51.860 |

- Filas INGRESO: fondo verde suave
- Filas COSTO: fondo ámbar suave

**Cierre de caja:**
- Muestra total teórico (sum ingresos)
- Input: "Total contado en caja"
- Botón "Cerrar caja" → compara teórico vs real → muestra diferencia
- Si cuadra: badge verde "✓ CUADRE PERFECTO"
- Si no cuadra: badge rojo con diferencia

### 6.4 Tab Facturación (admin)

**Layout:** Tabla histórico + modal preview factura.

**Tabla:**

| # | Mesa | Fecha | Total | Método | CUFE | Estado | Acción |
|---|------|-------|-------|--------|------|--------|--------|
| 000001 | Mesa 1 | 07/05 14:46 | $64.260 | Efectivo | 847291... | ✓ Pagada | 👁 Ver |

**Modal "Ver factura":** Renderiza la factura completa estilo recibo fiscal:

```
┌─────────────────────────────────────┐
│         🍽️ MESAIO                    │
│   Sistema de gestión · Restaurante  │
│   NIT: 901.040.XXX-0 (ficticio)     │
│─────────────────────────────────────│
│   Factura: #000001                  │
│   Mesa: 1 · Mesero: Carlos R.      │
│   Fecha: 07/05/2026 · 14:46        │
│─────────────────────────────────────│
│   Bandeja paisa    ×1    $42.000    │
│   Limonada coco    ×1    $12.000    │
│─────────────────────────────────────│
│   Subtotal:              $54.000    │
│   IVA 19%:               $10.260    │
│   Propina sugerida 10%:   $5.400    │
│   ═════════════════════════════════ │
│   TOTAL:                 $64.260    │
│─────────────────────────────────────│
│   Método: Efectivo                  │
│─────────────────────────────────────│
│   CUFE: 847291036485                │
│   [███ QR CODE ███]                 │
│   Res. DIAN: 18764020853100         │
│   (Ficticia — Demo Hackathon)       │
│─────────────────────────────────────│
│   ¡Gracias por su visita! 🙏       │
└─────────────────────────────────────┘
```

**QR:** Usar la librería qrcode-generator (CDN: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`). El QR contiene el CUFE como texto.

**Botones:** "Imprimir" (window.print()) + "Cerrar"

### 6.5 Modal de cobro (mesero)

Cuando la mesa está en estado "cobro", el mesero toca y ve:

**Resumen de la orden:**
- Lista de items con nombre, cantidad, precio unitario, subtotal
- Línea separadora
- Subtotal
- IVA 19% (calculado)
- Propina sugerida 10% (checkbox para incluir o no)
- **TOTAL** (grande, bold, burgundy)

**Método de pago:**
- 3 botones radio: Efectivo | Tarjeta | Transferencia
- (visual: pills, no radio buttons feos)

**Botón:** "Cobrar $XX.XXX" (grande, gold, con ícono)

**Al confirmar:**
1. `MesaioData.createReceipt(orden_id, metodo_pago)` → crea comprobante
2. Muestra factura visual en el mismo modal (transición suave)
3. Botón "Cerrar y liberar mesa" → mesa vuelve a libre

---

## 7. LÓGICA DE NEGOCIO — FUNCIONES CLAVE

### 7.1 Descuento de inventario (cocina → listo)

```javascript
// Cuando cocina marca "Listo":
function onOrdenLista(orden) {
  const recetas = MesaioData.getRecipes();
  const cambios = [];

  orden.items.forEach(item => {
    const receta = recetas.find(r => r.plato_id === item.plato_id);
    if (!receta) return;

    receta.ingredientes.forEach(ing => {
      const cantidadTotal = ing.cantidad * item.cantidad;
      MesaioData.updateStock(ing.ingrediente_id, -cantidadTotal, 'VENTA');
      cambios.push(`-${cantidadTotal}${ing.unidad} ${ing.nombre}`);
    });
  });

  // Toast con resumen
  MesaioData.toast(`✓ Inventario: ${cambios.join(', ')}`, 'success');

  // Verificar alertas de stock bajo
  const bajos = MesaioData.getLowStockItems();
  if (bajos.length > 0) {
    MesaioData.toast(`⚠️ ${bajos.length} ingredientes bajo mínimo`, 'warning');
  }
}
```

### 7.2 Generación de comprobante (mesero → cobrar)

```javascript
function generarComprobante(ordenId, metodoPago, incluirPropina = true) {
  const orden = MesaioData.getTransaction(ordenId);
  const subtotal = orden.total;
  const iva = Math.round(subtotal * 0.19);
  const propina = incluirPropina ? Math.round(subtotal * 0.10) : 0;
  const total = subtotal + iva + propina;

  const comprobante = {
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
    estado: 'pagado',
    cufe: MesaioData.generateCUFE(),
    resolucion_dian: '18764020853100 del 2026-01-01',
    fecha_emision: new Date().toISOString(),
    fecha_pago: new Date().toISOString()
  };

  return MesaioData.createReceipt(comprobante);
}
```

### 7.3 Estadísticas contables

```javascript
function calcularEstadisticasHoy() {
  const hoy = new Date().toDateString();
  const comprobantes = MesaioData.getReceipts()
    .filter(c => new Date(c.fecha_pago).toDateString() === hoy && c.estado === 'pagado');

  const ordenes = MesaioData.getTransactions();

  const totalIngresos = comprobantes.reduce((s, c) => s + c.total, 0);

  const totalCostoIngredientes = comprobantes.reduce((s, c) => {
    const orden = ordenes.find(o => o.id === c.orden_id);
    if (!orden) return s;
    return s + calcularCostoReceta(orden);
  }, 0);

  const ganancia = totalIngresos - totalCostoIngredientes;
  const margen = totalIngresos > 0 ? ((ganancia / totalIngresos) * 100).toFixed(1) : 0;

  return { totalIngresos, totalCostoIngredientes, ganancia, margen, numFacturas: comprobantes.length };
}

function calcularCostoReceta(orden) {
  const recetas = MesaioData.getRecipes();
  let costo = 0;

  orden.items.forEach(item => {
    const receta = recetas.find(r => r.plato_id === item.plato_id);
    if (!receta) return;

    receta.ingredientes.forEach(ing => {
      const ingrediente = MesaioData.getInventoryItem(ing.ingrediente_id);
      if (ingrediente) {
        costo += (ing.cantidad * ingrediente.costo_unitario) * item.cantidad;
      }
    });
  });

  return costo;
}
```

---

## 8. COMPATIBILIDAD APPCORS (FUTURO)

### 8.1 Cómo se ensambla después

```
HOY (Hackathon):
  MesaioData.mode = 'local'
  → Lee/escribe de localStorage
  → Frontend funciona solo

MAÑANA (Backend):
  MesaioData.mode = 'api'
  → Lee/escribe de fetch('https://api.mesaio.com/v1/...')
  → Frontend idéntico, solo cambia mesaio-data.js

DESPUÉS (AppCors):
  MesaioData se reemplaza por AppCorsData
  → Misma interfaz: getTransactions(), getCatalog(), getInventory()
  → Pero conecta a microservicios AppCors (conversation-svc, wallet-svc, etc.)
  → La UI de Mesaio se convierte en "plantilla vertical restaurante"
  → Otros verticales (peluquería, retail, farmacia) usan misma estructura con 20% diferente
```

### 8.2 Mapeo de conceptos Mesaio → AppCors

| Concepto Mesaio | Concepto AppCors | Concepto Genérico (TITAN) |
|-----------------|------------------|---------------------------|
| Mesa | Station | Punto de servicio |
| Plato | CatalogItem | Producto/Servicio |
| Orden | Transaction | Transacción |
| Ingrediente | InventoryItem | Item de inventario |
| Receta | BillOfMaterials | Lista de materiales |
| Comprobante | Receipt | Comprobante fiscal |
| Mesero | Agent | Operador |
| Cocina (KDS) | FulfillmentView | Vista de cumplimiento |
| Admin | ManagementView | Vista de gestión |

### 8.3 Lo que NO cambia al migrar

- Estructura visual (HTML/CSS)
- Flujo de usuario (mesero → cocina → admin)
- Brand por tenant (cada restaurante su logo/colores)
- Lógica de negocio (recetas, descuentos, facturación)

### 8.4 Lo que SÍ cambia al migrar

- Fuente de datos (localStorage → API REST)
- Autenticación (demo → Supabase/Auth0)
- Multi-tenancy (1 instancia → tenant_id en header)
- Realtime (polling 3s → WebSocket/SSE)

---

## 9. ENTREGABLES FINALES

### 9.1 Archivos que el agente DEBE crear o modificar

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `assets/js/mesaio-data.js` | CREAR | CP-0 (primero) |
| `assets/css/mesaio-theme.css` | CREAR | CP-0 |
| `assets/js/mesaio-core.js` | EXTENDER (agregar initV2) | CP-1 |
| `assets/js/mesaio-inventario.js` | CREAR | CP-1 |
| `assets/js/mesaio-facturacion.js` | CREAR | CP-1 |
| `assets/js/mesaio-contabilidad.js` | CREAR | CP-1 |
| `admin/index.html` | EXTENDER (3 tabs nuevos) | CP-2 |
| `cocina/index.html` | EXTENDER (descuento inventario) | CP-3 |
| `mesero/index.html` | EXTENDER (modal cobro + factura) | CP-4 |
| `entregables/index.html` | ACTUALIZAR (nuevas features) | CP-5 |
| `sql/schema.sql` | ACTUALIZAR (tablas nuevas) | CP-5 |

### 9.2 Checklist demo (pass/fail)

| # | Test | Resultado esperado |
|---|------|--------------------|
| 1 | Landing carga sin errores | ✅ |
| 2 | Login muestra 3 roles | ✅ |
| 3 | Mesero ve 12 mesas con colores | ✅ |
| 4 | Mesa libre → modal orden funcional | ✅ |
| 5 | Enviar orden → mesa pasa a "ocupada" | ✅ |
| 6 | Cocina ve orden en "Pendientes" | ✅ |
| 7 | Cocina marca "Listo" → inventario se descuenta | ✅ ← NUEVO |
| 8 | Mesero marca "Entregado" → mesa pasa a "cobro" | ✅ |
| 9 | Mesero genera factura con CUFE + QR | ✅ ← NUEVO |
| 10 | Mesa vuelve a "libre" después de cobrar | ✅ |
| 11 | Admin tab Inventario muestra stock actualizado | ✅ ← NUEVO |
| 12 | Admin tab Contabilidad muestra ingresos/costos/margen | ✅ ← NUEVO |
| 13 | Admin tab Facturación muestra historial con preview | ✅ ← NUEVO |
| 14 | Flujo completo en <5 minutos | ✅ |

**8/14 = MVP viable. 14/14 = demo ganadora.**

---

## 10. MENSAJE AL JURADO

> *"El dueño del restaurante hoy paga 3 suscripciones separadas: Alegra para contabilidad ($150K/mes), un sistema de mesas ($80K/mes), y un sistema de inventario ($120K/mes). Son $350K mensuales en software que no se habla entre sí.*
>
> *Mesaio reemplaza los tres. Una sola plataforma. Un solo login. Un solo precio.*
>
> *Cuando el mesero cobra una mesa, automáticamente: se descuenta el inventario, se genera la factura electrónica, se actualiza la contabilidad. Sin que nadie haga nada.*
>
> *Y lo construimos en frontend puro. Sin servidor. Listo para escalar."*

---

## 11. NOTA FINAL PARA EL AGENTE

Tienes Opus 4.6. Tienes libertad creativa para estilizar. Tienes un brand ganador. Tienes datos seed completos.

Lo que te pido:
1. **Primero la abstracción** (mesaio-data.js) — es lo que hace a esto ensamblable
2. **Después la funcionalidad** — que todo funcione end-to-end
3. **Después la belleza** — que cada pixel diga "premium"

No tengas miedo de hacer cosas que no están en este spec si mejoran la UX. Pero nunca rompas el flujo core (mesero → cocina → admin) ni la paleta (burgundy/gold/cream).

Confío en ti.

**Estado: 🟢 SPEC SELLADO · LISTO PARA EJECUCIÓN**
