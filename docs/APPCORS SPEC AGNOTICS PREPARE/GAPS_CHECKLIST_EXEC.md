# GAPS CHECKLIST — CIERRE DE AMBIGÜEDADES
## Referencias rápidas para Claude Code (3-5 min de lectura)

---

## 1. INICIALIZACIÓN — ¿Dónde se llama initV2()?

**En admin/index.html, dentro del tag `<script>` inicial:**

```html
<script>
  // Línea 1: Verificar versión y seedear si es necesario
  const mesaioVersion = localStorage.getItem('mesaio_version');
  if (!mesaioVersion || mesaioVersion !== '2.1') {
    initV2();  // ← Función que sembrará 25 ingredientes + 15 recetas
  }
</script>
```

**También en mesero/index.html y cocina/index.html** (al cargar, asegurar que los datos están listos).

---

## 2. ARCHIVOS HTML — Script tags exactos que se deben INCLUIR

### Admin/index.html (agregar estos 4 al final, antes de `</body>`):

```html
<!-- Data Layer (abstracción) -->
<script src="../assets/js/mesaio-data.js"></script>

<!-- Core (seed + helpers) -->
<script src="../assets/js/mesaio-core.js"></script>

<!-- Nuevos módulos -->
<script src="../assets/js/mesaio-inventario.js"></script>
<script src="../assets/js/mesaio-contabilidad.js"></script>
<script src="../assets/js/mesaio-facturacion.js"></script>

<!-- QR Library (CDN) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<!-- Theme CSS (al inicio, en <head>) -->
<link rel="stylesheet" href="../assets/css/mesaio-theme.css">
```

### Mesero/index.html (agregar estos 3):

```html
<script src="../assets/js/mesaio-data.js"></script>
<script src="../assets/js/mesaio-core.js"></script>
<script src="../assets/js/mesaio-facturacion.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<link rel="stylesheet" href="../assets/css/mesaio-theme.css">
```

### Cocina/index.html (agregar estos 2):

```html
<script src="../assets/js/mesaio-data.js"></script>
<script src="../assets/js/mesaio-core.js"></script>
<script src="../assets/js/mesaio-inventario.js"></script>
<link rel="stylesheet" href="../assets/css/mesaio-theme.css">
```

---

## 3. FLUJO COCINA — ¿Exactamente qué botón triggerea descuento?

**Ubicación:** En cocina/index.html, cuando se renderiza una orden en estado "PENDIENTE" o "PREPARANDO", hay 2 botones:

```html
<button class="btn btn-sm btn-warning" onclick="marcarPreparando(ordenId)">
  Preparando
</button>

<button class="btn btn-sm btn-success" onclick="marcarListo(ordenId)">
  ✓ Listo
</button>
```

**El descuento se trigguerea aquí:**

```javascript
function marcarListo(ordenId) {
  const orden = MesaioData.getTransaction(ordenId);
  
  // 1. Actualizar estado de orden
  MesaioData.updateTransactionStatus(ordenId, 'listo');
  
  // 2. DESCUENTO INVENTARIO ← AQUÍ PASA LA MAGIA
  MesaioData.applyRecipeDecrement(orden);
  
  // 3. Toast con cambios
  const cambios = MesaioData.getLastInventoryChanges();  // Helper nuevo
  MesaioData.toast(`✓ Inventario: ${cambios}`, 'success');
  
  // 4. Re-render cocina
  renderCocinaDashboard();
}
```

**Helper a agregar a mesaio-core.js:**

```javascript
let lastInventoryChanges = [];

function setLastInventoryChanges(cambios) {
  lastInventoryChanges = cambios;
}

function getLastInventoryChanges() {
  return lastInventoryChanges.join(', ');
}
```

---

## 4. FLUJO MESERO — ¿Cuál es el estado exacto para cobro?

**Estados de mesa:**
- `'libre'` → verde, puedes tomar orden
- `'ocupada'` → amarilla, mesero está atendiendo
- `'listo'` → naranja parpadeante, comida lista
- `'cobro'` → azul, esperando cobro
- `'cerrada'` → gris, no existe más

**Trigger del modal de cobro:**

```javascript
function onMesaClick(mesaId) {
  const mesa = MesaioData.getStation(mesaId);
  
  if (mesa.estado === 'libre') {
    abrirModalOrden(mesaId);
  } else if (mesa.estado === 'ocupada' || mesa.estado === 'listo') {
    // Mostrar opciones: agregar item, marcar entregado
  } else if (mesa.estado === 'cobro') {
    // AQUÍ SE ABRE EL MODAL DE COBRO
    abrirModalCobro(mesaId);
  }
}

function abrirModalCobro(mesaId) {
  // Modal muestra:
  // - Orden completa con items
  // - Cálculo de subtotal + IVA + propina sugerida
  // - Selector método pago
  // - Botón "Cobrar y facturar"
  
  const modal = document.getElementById('modalCobro');
  modal.style.display = 'block';
  
  // Pre-llenar con datos de la orden
  const ordenes = MesaioData.getTransactions()
    .filter(o => o.mesa_id === mesaId && o.estado === 'entregado');
  const ordenActual = ordenes[ordenes.length - 1];
  
  renderModalCobro(ordenActual);
}
```

**Transición de estados:**
1. Mesero abre mesa (libre → ocupada)
2. Cocina prepara (sigue ocupada)
3. Mesero marca entregado (ocupada → listo)
4. Mesero abre modal cobro (listo → cobro)
5. Mesero confirma pago (cobro → libre)

---

## 5. FACTURA — QR exacto + render HTML

### 5.1 Generar QR

```javascript
function generarQR(cufe) {
  // Limpiar canvas anterior
  const canvas = document.getElementById('qrCode');
  if (canvas && canvas.parentElement) {
    canvas.parentElement.innerHTML = '';
  }
  
  // Generar nuevo QR
  const qr = new QRCode(document.getElementById('qrCodeContainer'), {
    text: cufe,       // CUFE es el texto del QR
    width: 150,
    height: 150,
    colorDark: '#5C1A2B',  // Burgundy
    colorLight: '#FAF6EE'  // Cream
  });
}
```

### 5.2 HTML del modal factura (estructura):

```html
<!-- Modal Factura (mesero o admin) -->
<div id="modalFactura" class="modal" style="display: none;">
  <div class="modal-dialog modal-sm">
    <div class="modal-content" style="background: var(--mesaio-cream); border: 2px solid var(--mesaio-burgundy);">
      
      <div style="padding: 20px; font-family: 'Courier New', monospace; font-size: 12px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 15px; border-bottom: 1px solid var(--mesaio-burgundy); padding-bottom: 10px;">
          <h4 style="color: var(--mesaio-burgundy); margin: 0;">🍽️ MESAIO</h4>
          <p style="font-size: 10px; margin: 3px 0; color: var(--mesaio-text-muted);">Sistema de gestión · Restaurante</p>
          <p style="font-size: 10px; margin: 3px 0; color: var(--mesaio-text-secondary);">NIT: 901.040.XXX-0</p>
        </div>
        
        <!-- Datos factura -->
        <div style="margin-bottom: 12px; font-size: 11px;">
          <p style="margin: 2px 0;"><strong>Factura:</strong> #<span id="facturaNro">000001</span></p>
          <p style="margin: 2px 0;"><strong>Mesa:</strong> <span id="facturaMesa">1</span></p>
          <p style="margin: 2px 0;"><strong>Mesero:</strong> <span id="facturaMesero">Carlos R.</span></p>
          <p style="margin: 2px 0;"><strong>Fecha:</strong> <span id="facturaFecha">07/05/2026</span></p>
          <p style="margin: 2px 0;"><strong>Hora:</strong> <span id="facturaHora">14:46</span></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid var(--mesaio-burgundy); margin: 8px 0;">
        
        <!-- Items tabla -->
        <table style="width: 100%; margin-bottom: 10px; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--mesaio-text-muted);">
              <th style="text-align: left; padding: 2px 0;">Descripción</th>
              <th style="text-align: center; width: 30px;">Qty</th>
              <th style="text-align: right; width: 60px;">Valor</th>
            </tr>
          </thead>
          <tbody id="facturaItems">
            <!-- Rellena con JS -->
          </tbody>
        </table>
        
        <hr style="border: none; border-top: 2px solid var(--mesaio-burgundy); margin: 8px 0;">
        
        <!-- Totales -->
        <div style="margin-bottom: 10px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin: 3px 0;">
            <span>Subtotal:</span>
            <span>$<span id="facturaSubtotal">54.000</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 3px 0;">
            <span>IVA 19%:</span>
            <span>$<span id="facturaIVA">10.260</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 10px; color: var(--mesaio-text-secondary);">
            <span>Propina sugerida:</span>
            <span>$<span id="facturaPropina">5.400</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 5px; font-weight: bold; font-size: 13px; color: var(--mesaio-burgundy);">
            <span>TOTAL:</span>
            <span>$<span id="facturaTotal">64.260</span></span>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid var(--mesaio-burgundy); margin: 8px 0;">
        
        <!-- CUFE -->
        <div style="text-align: center; margin: 8px 0; padding: 8px; background: var(--mesaio-gold); border-radius: 4px;">
          <p style="font-size: 10px; margin: 2px 0;"><strong>CUFE:</strong></p>
          <p style="font-size: 11px; font-weight: bold; margin: 2px 0;" id="facturaCUFE">847291036485</p>
          <p style="font-size: 9px; color: var(--mesaio-text-secondary); margin: 2px 0;">(Ficticia — Demo)</p>
        </div>
        
        <!-- QR -->
        <div style="text-align: center; margin: 8px 0; padding: 8px; background: white; border: 1px solid var(--mesaio-text-muted); border-radius: 4px;">
          <div id="qrCodeContainer" style="display: inline-block;"></div>
        </div>
        
        <!-- Resolución -->
        <div style="text-align: center; font-size: 9px; color: var(--mesaio-text-secondary); margin: 8px 0; padding: 8px 0; border-top: 1px dashed var(--mesaio-text-muted);">
          <p style="margin: 2px 0;">Método pago: <strong id="facturaMetodo">Efectivo</strong></p>
          <p style="margin: 2px 0; font-size: 8px;">Res. DIAN: 18764020853100 (2026-01-01)</p>
          <p style="margin: 2px 0; font-size: 8px; color: var(--mesaio-gold);">✓ Ficticia para demostración</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--mesaio-text-muted); font-size: 10px;">
          <p style="margin: 0;">¡Gracias por tu visita! 🙏</p>
          <p style="margin: 2px 0; font-size: 9px; color: var(--mesaio-text-secondary);">Datos almacenados localmente</p>
        </div>
        
      </div>
      
      <!-- Botones -->
      <div style="padding: 12px; border-top: 1px solid var(--mesaio-text-muted); display: flex; gap: 8px;">
        <button class="btn btn-outline-secondary btn-sm" onclick="imprimirFactura()">
          🖨️ Imprimir
        </button>
        <button class="btn btn-primary btn-sm" onclick="cerrarModalFactura()">
          Cerrar
        </button>
      </div>
      
    </div>
  </div>
</div>
```

---

## 6. MESAIO-DATA.JS — Método que faltaba: applyRecipeDecrement

```javascript
// EN mesaio-data.js, agregar este método:

applyRecipeDecrement(orden) {
  /**
   * Cuando cocina marca "Listo", descuenta todos los ingredientes
   * según las recetas de los items de la orden
   */
  const recetas = this.getRecipes();
  const cambios = [];

  orden.items.forEach(item => {
    const receta = recetas.find(r => r.plato_id === item.plato_id);
    if (!receta) return;

    receta.ingredientes.forEach(ing => {
      const cantidadTotal = ing.cantidad * item.cantidad;
      const ingrediente = this.getInventoryItem(ing.ingrediente_id);
      
      // Actualizar stock
      this.updateStock(ing.ingrediente_id, -cantidadTotal, 'VENTA');
      
      // Registrar cambio para mostrar
      cambios.push(`-${cantidadTotal}${ing.unidad} ${ing.nombre}`);
    });
  });

  // Guardar cambios para el toast
  this.setLastInventoryChanges(cambios);
},
```

---

## 7. MESAIO-CORE.JS — Función initV2() exacta

```javascript
function initV2() {
  // ════════════════════════════════════════════
  // INGREDIENTES SEED (25)
  // ════════════════════════════════════════════
  const ingredientes = [
    { id: 1, nombre: "Carne de res", unidad: "g", stock: 8000, stock_minimo: 1000, costo_unitario: 18, categoria: "proteína", proveedor: "Carnes Feliz" },
    { id: 2, nombre: "Carne molida", unidad: "g", stock: 5000, stock_minimo: 500, costo_unitario: 15, categoria: "proteína", proveedor: "Carnes Feliz" },
    // ... (agregar 23 más) — ver sección 2.1 del SUPER_SPEC v2.1
  ];

  // ════════════════════════════════════════════
  // RECETAS SEED (15)
  // ════════════════════════════════════════════
  const recetas = [
    {
      id: 1,
      plato_id: 4,
      nombre: "Bandeja paisa",
      ingredientes: [
        { ingrediente_id: 2, nombre: "Carne molida", cantidad: 150, unidad: "g" },
        { ingrediente_id: 9, nombre: "Frijoles cocidos", cantidad: 1, unidad: "porción" },
        { ingrediente_id: 10, nombre: "Arroz blanco", cantidad: 1, unidad: "porción" },
        // ... (agregar 5 más)
      ]
    },
    // ... (agregar 14 más)
  ];

  // ════════════════════════════════════════════
  // GUARDAR EN LOCALSTORAGE
  // ════════════════════════════════════════════
  localStorage.setItem('mesaio_ingredientes', JSON.stringify(ingredientes));
  localStorage.setItem('mesaio_recetas', JSON.stringify(recetas));
  localStorage.setItem('mesaio_comprobantes_pago', JSON.stringify([]));
  localStorage.setItem('mesaio_comprobante_counter', '0');
  localStorage.setItem('mesaio_version', '2.1');

  console.log('✓ Mesaio v2.1 inicializado');
}
```

---

## 8. MESERO — ¿Cómo se abre el modal de cobro?

**Dos opciones (elige una):**

**Opción A: Cuando mesa está en "cobro", el mesero ve opción automática**
```javascript
function renderMeseroHome() {
  // Renderizar mesas
  const mesas = MesaioData.getStations();
  
  mesas.forEach(mesa => {
    const color = {
      'libre': 'btn-success',
      'ocupada': 'btn-warning',
      'listo': 'btn-info',
      'cobro': 'btn-danger'  // ← Rojo
    }[mesa.estado];
    
    const html = `
      <div class="col-md-3 mb-3">
        <button class="btn ${color} w-100 h-100" onclick="onMesaClick(${mesa.id})">
          <strong>Mesa ${mesa.numero}</strong>
          <br>
          <small>${mesa.estado.toUpperCase()}</small>
        </button>
      </div>
    `;
  });
}

function onMesaClick(mesaId) {
  const mesa = MesaioData.getStation(mesaId);
  
  if (mesa.estado === 'cobro') {
    abrirModalCobro(mesaId);  // ← AQUÍ se abre
  }
  // ... otros casos
}
```

**Opción B: Botón explícito en la orden abierta**
```html
<button onclick="abrirModalCobro(mesaId)" class="btn btn-primary btn-sm">
  💳 Cobrar ($XX.XXX)
</button>
```

**Yo recomiendo Opción A** (mesero toca mesa en rojo, automáticamente abre modal de cobro).

---

## 9. ADMIN — Clases Bootstrap exactas para tabs

```html
<!-- Admin tabs: estructura exacta -->
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item">
    <a class="nav-link active" data-bs-toggle="tab" href="#pane-dashboard">
      Dashboard
    </a>
  </li>
  <!-- ... otros tabs existentes ... -->
  <li class="nav-item">
    <a class="nav-link" data-bs-toggle="tab" href="#pane-inventario">
      <i class="bi bi-bag"></i> Inventario
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link" data-bs-toggle="tab" href="#pane-contabilidad">
      <i class="bi bi-receipt"></i> Contabilidad
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link" data-bs-toggle="tab" href="#pane-facturacion">
      <i class="bi bi-file-text"></i> Facturación
    </a>
  </li>
</ul>

<div class="tab-content">
  <!-- ... tabs existentes ... -->
  <div id="pane-inventario" class="tab-pane fade">
    <!-- Contenido inventario -->
  </div>
  <div id="pane-contabilidad" class="tab-pane fade">
    <!-- Contenido contabilidad -->
  </div>
  <div id="pane-facturacion" class="tab-pane fade">
    <!-- Contenido facturación -->
  </div>
</div>
```

---

## 10. TESTING — 3 tests críticos que deben PASAR

```javascript
// Test 1: ¿Los datos seed están presentes?
console.assert(
  JSON.parse(localStorage.getItem('mesaio_ingredientes')).length === 25,
  'FAIL: No hay 25 ingredientes'
);

// Test 2: ¿Descuento de inventario funciona?
const ordenTest = { items: [{ plato_id: 4, cantidad: 1 }] };
MesaioData.applyRecipeDecrement(ordenTest);
const carneAfter = MesaioData.getInventoryItem(2).stock;
console.assert(carneAfter < 5000, 'FAIL: Inventario no se decrementó');

// Test 3: ¿Factura se crea correctamente?
const comprobante = MesaioData.createReceipt({
  orden_id: 1,
  mesa_id: 1,
  items: [],
  subtotal: 54000,
  metodo_pago: 'efectivo'
});
console.assert(comprobante.numero_factura === '000001', 'FAIL: Factura sin número');
```

---

## 11. CHECKLIST FINAL (antes de deploy)

- [ ] `mesaio-data.js` existe y no tiene errores de sintaxis
- [ ] `mesaio-theme.css` con variables CSS
- [ ] `mesaio-core.js` actualizado con initV2()
- [ ] `mesaio-inventario.js` creado
- [ ] `mesaio-contabilidad.js` creado
- [ ] `mesaio-facturacion.js` creado
- [ ] Admin/index.html tiene 8 tabs (5 old + 3 new)
- [ ] Cocina/index.html descuenta inventario al "Listo"
- [ ] Mesero/index.html tiene modal de cobro + factura
- [ ] Factura tiene QR + CUFE + Resolución ficticia
- [ ] Los 3 tests críticos pasan en consola
- [ ] Flujo de 5 minutos funciona end-to-end
- [ ] Responsive en mobile/tablet/desktop
- [ ] Deploy a Netlify correctamente
- [ ] Git push con mensaje "Mesaio v2.1 — Ready for Hackathon 2"

---

**Estado: 🟢 GAPS CERRADOS · LISTA PARA EJECUTAR**

Si falta algo más, gritá. Pero esto debería ser bulletproof.
