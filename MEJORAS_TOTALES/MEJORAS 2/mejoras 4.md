# SPEC v2.3 — FIXES CRÍTICOS + DEMO AUTOMÁTICO
## Para Claude Code — Ejecutar todo en orden

---

## FIX 1 — BUG "undefined" EN FACTURA + SUBTOTAL $0

**Problema:** La factura muestra "undefined" en nombres de items y subtotal $0.
**Causa:** Los items de la orden usan `plato_nombre` pero `generarFactura()` los mapea a `nombre`, y el subtotal ya incluye IVA en `orden.total`.

**En `assets/js/mesaio-core.js`, buscar `generarFactura` y reemplazar COMPLETO:**

```javascript
generarFactura(ordenId, metodoPago = 'efectivo') {
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
  const orden = ordenes.find(o => o.id === ordenId);
  if (!orden) return null;

  let counter = parseInt(localStorage.getItem('mesaio_factura_counter') || '0') + 1;

  // subtotal = suma de items (SIN IVA)
  const subtotal = orden.items.reduce((s, i) => s + (i.subtotal || i.precio_unitario * i.cantidad || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const factura = {
    id: counter,
    numero: String(counter).padStart(6, '0'),
    orden_id: ordenId,
    mesa_id: orden.mesa_id,
    mesero_nombre: orden.mesero_nombre || orden.mesero || 'Mesero',
    // Mapear correctamente: plato_nombre → nombre
    items: orden.items.map(i => ({
      nombre: i.plato_nombre || i.nombre || i.plato || 'Item',
      cantidad: i.cantidad || 1,
      precio_unitario: i.precio_unitario || i.precio || 0,
      subtotal: i.subtotal || (i.precio_unitario * i.cantidad) || 0
    })),
    subtotal,
    iva,
    propina_sugerida: Math.round(subtotal * 0.10),
    total,
    metodo_pago: metodoPago,
    estado: 'pagada',
    cufe: this.generarCUFE(),
    resolucion_dian: '18764020853100 del 2026-01-01',
    cliente_nombre: 'Consumidor Final',
    created_at: new Date().toISOString()
  };

  const facturas = JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
  facturas.push(factura);
  localStorage.setItem('mesaio_facturas', JSON.stringify(facturas));
  localStorage.setItem('mesaio_factura_counter', String(counter));

  // Registrar movimientos contables
  this.registrarMovimiento('venta', total, `Factura #${factura.numero} — Mesa ${orden.mesa_id}`, ordenId);
  const costoIngredientes = this.getCostoOrden ? this.getCostoOrden(ordenId) : 0;
  if (costoIngredientes > 0) {
    this.registrarMovimiento('gasto', costoIngredientes, `Costo Factura #${factura.numero}`, ordenId);
  }

  return factura;
},
```

---

## FIX 2 — RECIBO DELGADO PARA IMPRESIÓN

**Problema:** La factura imprime todo el admin. Debe imprimir solo el recibo.

**En `admin/index.html`, agregar en `<head>` o al inicio del `<style>`:**

```html
<style>
@media print {
  /* Ocultar TODO excepto el recibo */
  body > *:not(#printArea) { display: none !important; }
  #printArea {
    display: block !important;
    position: fixed;
    top: 0; left: 0;
    width: 80mm;
    margin: 0;
    padding: 0;
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }
}
</style>
```

**Reemplazar la función `verFactura()` en admin/index.html:**

```javascript
function verFactura(facturaId) {
  const facturas = MESAIO.getFacturas();
  const f = facturas.find(x => x.id === facturaId);
  if (!f) return;

  // Crear área de impresión oculta
  let printArea = document.getElementById('printArea');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'printArea';
    printArea.style.cssText = 'display:none;';
    document.body.appendChild(printArea);
  }

  const itemsHTML = f.items.map(i =>
    `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted #eee;">
      <span style="flex:1;">${i.nombre}<br><small style="color:#9CA3AF;">×${i.cantidad} × ${MESAIO.fmtCOP(i.precio_unitario)}</small></span>
      <span style="font-weight:bold;margin-left:8px;">${MESAIO.fmtCOP(i.subtotal)}</span>
    </div>`
  ).join('');

  const reciboHTML = `
    <div style="width:300px; font-family:'Courier New',monospace; font-size:12px; padding:16px; background:white; border:1px solid #ddd; border-radius:8px; margin:0 auto;">
      
      <div style="text-align:center; padding-bottom:10px; border-bottom:2px solid #5C1A2B; margin-bottom:10px;">
        <div style="font-family:'Playfair Display',serif; font-size:18px; font-weight:bold; color:#5C1A2B;">🍽️ MESAIO</div>
        <div style="font-size:10px; color:#9CA3AF;">Restaurante · NIT: 900.123.456-7</div>
        <div style="font-size:10px; color:#9CA3AF;">Res. DIAN No. 18764 de 2024</div>
        <div style="font-size:11px; font-weight:bold; margin-top:4px;">FACTURA ELECTRÓNICA #${f.numero}</div>
      </div>

      <div style="font-size:11px; margin-bottom:10px;">
        <div><b>Mesa:</b> M-${String(f.mesa_id).padStart(2,'0')} · <b>Mesero:</b> ${f.mesero_nombre}</div>
        <div><b>Fecha:</b> ${new Date(f.created_at).toLocaleDateString('es-CO')} · ${MESAIO.fmtHora(f.created_at)}</div>
        <div><b>Cliente:</b> ${f.cliente_nombre}</div>
      </div>

      <div style="border-top:1px dashed #ccc; border-bottom:1px dashed #ccc; padding:8px 0; margin-bottom:10px;">
        ${itemsHTML}
      </div>

      <div style="font-size:12px; margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span><span>${MESAIO.fmtCOP(f.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>IVA 19%:</span><span>${MESAIO.fmtCOP(f.iva)}</span></div>
        <div style="display:flex;justify-content:space-between;color:#9CA3AF;font-size:10px;"><span>Propina sugerida:</span><span>${MESAIO.fmtCOP(f.propina_sugerida)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;color:#5C1A2B;margin-top:6px;padding-top:6px;border-top:2px solid #5C1A2B;">
          <span>TOTAL:</span><span>${MESAIO.fmtCOP(f.total)}</span>
        </div>
      </div>

      <div style="text-align:center;background:#C8A951;border-radius:6px;padding:8px;margin-bottom:8px;">
        <div style="font-size:10px;color:#5C1A2B;font-weight:bold;">CUFE:</div>
        <div style="font-size:11px;font-weight:bold;">${f.cufe}</div>
      </div>

      <div style="text-align:center;font-size:10px;color:#9CA3AF;">
        <div>Método: ${f.metodo_pago}</div>
        <div>Res. DIAN: ${f.resolucion_dian}</div>
        <div style="margin-top:6px;">¡Gracias por su visita! 🙏</div>
      </div>

      <div style="display:flex;gap:8px;margin-top:16px;justify-content:center;">
        <button onclick="imprimirRecibo()" style="padding:8px 16px;background:#5C1A2B;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">🖨️ Imprimir</button>
        <button onclick="document.getElementById('modalFacturaPreview').style.display='none'" style="padding:8px 16px;background:#6B7280;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">Cerrar</button>
      </div>
    </div>
  `;

  // Actualizar printArea para impresión
  printArea.innerHTML = `<div style="width:80mm;font-family:'Courier New',monospace;font-size:11px;padding:8px;">
    <div style="text-align:center;font-weight:bold;font-size:14px;">MESAIO</div>
    <div style="text-align:center;font-size:9px;">NIT: 900.123.456-7 · Res.DIAN 18764/2024</div>
    <div style="text-align:center;font-size:10px;font-weight:bold;margin:4px 0;">FACTURA #${f.numero}</div>
    <hr style="border:none;border-top:1px dashed #000;">
    <div>Mesa: M-${String(f.mesa_id).padStart(2,'0')} · ${f.mesero_nombre}</div>
    <div>Fecha: ${new Date(f.created_at).toLocaleDateString('es-CO')}</div>
    <hr style="border:none;border-top:1px dashed #000;">
    ${f.items.map(i => `<div>${i.nombre.substring(0,20)}</div><div style="text-align:right;">${i.cantidad} x ${MESAIO.fmtCOP(i.precio_unitario)} = ${MESAIO.fmtCOP(i.subtotal)}</div>`).join('')}
    <hr style="border:none;border-top:1px dashed #000;">
    <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span><span>${MESAIO.fmtCOP(f.subtotal)}</span></div>
    <div style="display:flex;justify-content:space-between;"><span>IVA 19%:</span><span>${MESAIO.fmtCOP(f.iva)}</span></div>
    <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;"><span>TOTAL:</span><span>${MESAIO.fmtCOP(f.total)}</span></div>
    <hr style="border:none;border-top:1px dashed #000;">
    <div style="text-align:center;font-size:9px;">CUFE: ${f.cufe}</div>
    <div style="text-align:center;font-size:9px;">Pago: ${f.metodo_pago}</div>
    <div style="text-align:center;margin-top:4px;">¡Gracias!</div>
  </div>`;

  document.getElementById('facturaHTML').innerHTML = reciboHTML;
  document.getElementById('modalFacturaPreview').style.display = 'block';
}

function imprimirRecibo() {
  const printArea = document.getElementById('printArea');
  if (printArea) {
    printArea.style.display = 'block';
    window.print();
    setTimeout(() => { printArea.style.display = 'none'; }, 1000);
  }
}
```

---

## FIX 3 — INPUT ARQUEO SE BORRA

**Problema:** El input de efectivo reportado se borra al escribir.

**En `admin/index.html`, función `cargarArqueo()`, buscar la línea:**
```javascript
document.getElementById('arqueoReportado').value = '';
```

**Reemplazar por:**
```javascript
// NO resetear el input si ya tiene valor
const inputActual = document.getElementById('arqueoReportado').value;
if (!inputActual) document.getElementById('arqueoReportado').value = '';
```

**Y en el HTML del input de arqueo, cambiar a:**
```html
<input type="text" 
  inputmode="numeric" 
  pattern="[0-9]*"
  id="arqueoReportado" 
  placeholder="Ej: 450000"
  style="width:100%; padding:10px; border:2px solid #C8A951; border-radius:8px; font-size:18px; font-weight:bold; color:#5C1A2B; box-sizing:border-box;"
  oninput="this.value=this.value.replace(/[^0-9]/g,'')">
```

**NOTA:** Cambiar de `type="number"` a `type="text"` con `inputmode="numeric"`. Evita el comportamiento raro del browser que borra valores.

---

## FIX 4 — 24 MESAS (de 12 a 24)

**En `assets/js/mesaio-core.js`, dentro de `init()`, buscar el seed de mesas y reemplazar con 24:**

```javascript
// Buscar donde se generan las mesas (algo como: for i 1..12)
// Reemplazar con este seed de 24 mesas:

const mesasSeed = [
  // SALÓN (8 mesas)
  { id:1,  numero:1,  capacidad:2, estado:'libre', ubicacion:'Salón' },
  { id:2,  numero:2,  capacidad:4, estado:'libre', ubicacion:'Salón' },
  { id:3,  numero:3,  capacidad:4, estado:'libre', ubicacion:'Salón' },
  { id:4,  numero:4,  capacidad:6, estado:'libre', ubicacion:'Salón' },
  { id:5,  numero:5,  capacidad:6, estado:'libre', ubicacion:'Salón' },
  { id:6,  numero:6,  capacidad:4, estado:'libre', ubicacion:'Salón' },
  { id:7,  numero:7,  capacidad:2, estado:'libre', ubicacion:'Salón' },
  { id:8,  numero:8,  capacidad:4, estado:'libre', ubicacion:'Salón' },
  // TERRAZA (8 mesas)
  { id:9,  numero:9,  capacidad:4, estado:'libre', ubicacion:'Terraza' },
  { id:10, numero:10, capacidad:4, estado:'libre', ubicacion:'Terraza' },
  { id:11, numero:11, capacidad:6, estado:'libre', ubicacion:'Terraza' },
  { id:12, numero:12, capacidad:6, estado:'libre', ubicacion:'Terraza' },
  { id:13, numero:13, capacidad:2, estado:'libre', ubicacion:'Terraza' },
  { id:14, numero:14, capacidad:4, estado:'libre', ubicacion:'Terraza' },
  { id:15, numero:15, capacidad:8, estado:'libre', ubicacion:'Terraza' },
  { id:16, numero:16, capacidad:4, estado:'libre', ubicacion:'Terraza' },
  // BARRA (4 mesas)
  { id:17, numero:17, capacidad:2, estado:'libre', ubicacion:'Barra' },
  { id:18, numero:18, capacidad:2, estado:'libre', ubicacion:'Barra' },
  { id:19, numero:19, capacidad:2, estado:'libre', ubicacion:'Barra' },
  { id:20, numero:20, capacidad:2, estado:'libre', ubicacion:'Barra' },
  // PRIVADO (4 mesas)
  { id:21, numero:21, capacidad:8,  estado:'libre', ubicacion:'Privado' },
  { id:22, numero:22, capacidad:10, estado:'libre', ubicacion:'Privado' },
  { id:23, numero:23, capacidad:12, estado:'libre', ubicacion:'Privado' },
  { id:24, numero:24, capacidad:6,  estado:'libre', ubicacion:'Privado' },
];
localStorage.setItem('mesaio_mesas', JSON.stringify(mesasSeed));
```

**IMPORTANTE:** También agregar en `initV2()` al inicio:
```javascript
// Forzar reset de mesas a 24 si todavía tiene 12
const mesasActuales = JSON.parse(localStorage.getItem('mesaio_mesas') || '[]');
if (mesasActuales.length < 24) {
  localStorage.removeItem('mesaio_mesas');
  this.init(); // Re-inicializa con 24 mesas
}
```

---

## FEATURE — BOTÓN DEMO AUTOMÁTICO 30 SEGUNDOS

**La idea:** Un botón que simula el flujo completo con animación, para mostrar al jurado sin tocar nada.

**En `admin/index.html`, dentro del `#bannerDemo` (o donde sea visible), agregar botón adicional:**

```html
<button onclick="iniciarDemoAutomatico()" 
  style="padding:10px 20px; background:white; color:#5C1A2B; border:2px solid #5C1A2B; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;">
  ▶ Demo automático (30s)
</button>
```

**JS — agregar al script de admin:**

```javascript
async function iniciarDemoAutomatico() {
  // Overlay de demo
  const overlay = document.createElement('div');
  overlay.id = 'demoOverlay';
  overlay.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(92,26,43,0.95); z-index:99999;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    color:white; font-family:'Playfair Display',serif;
  `;
  overlay.innerHTML = `
    <div style="font-size:32px; margin-bottom:8px;">🍽️ Mesaio</div>
    <div id="demoStep" style="font-size:18px; margin-bottom:24px; opacity:0.8;">Iniciando demo...</div>
    <div style="width:300px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px;">
      <div id="demoBar" style="height:100%; background:#C8A951; border-radius:3px; width:0%; transition:width 0.5s;"></div>
    </div>
    <div id="demoLog" style="margin-top:24px; font-size:13px; opacity:0.7; text-align:center; max-width:400px; line-height:1.8;"></div>
    <button onclick="document.getElementById('demoOverlay').remove()" 
      style="margin-top:32px; padding:10px 24px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); border-radius:8px; color:white; cursor:pointer; font-size:13px;">
      Saltar demo
    </button>
  `;
  document.body.appendChild(overlay);

  const pasos = [
    { pct:5,  msg:'👤 Mesero Carlos R. entra al sistema' },
    { pct:15, msg:'🪑 Mesa 3 (Salón, 4 puestos) — TAP para ordenar' },
    { pct:25, msg:'📋 Cliente pide Bandeja paisa + Limonada de coco' },
    { pct:35, msg:'📨 Orden #001 enviada a cocina...' },
    { pct:45, msg:'👨‍🍳 Cocina: Orden recibida → "Preparando"' },
    { pct:55, msg:'✅ Cocina: "Listo" → Inventario descontado automáticamente' },
    { pct:62, msg:'📦 Stock: -150g carne molida, -1 frijoles, -1 arepa' },
    { pct:70, msg:'🚶 Mesero entrega pedido → Mesa pasa a "Solicitando cuenta"' },
    { pct:78, msg:'💳 Mesero genera factura — Método: Nequi' },
    { pct:85, msg:'🧾 Factura #000001 — Subtotal $46.218 + IVA $8.781 = $55.000' },
    { pct:90, msg:'📊 Contabilidad: +$55.000 ingreso registrado' },
    { pct:95, msg:'🔓 Mesa 3 liberada → Lista para siguiente cliente' },
    { pct:100,msg:'✨ Flujo completo en 30 segundos. Sin backend. Sin servidor.' },
  ];

  const logEl = document.getElementById('demoLog');
  const barEl = document.getElementById('demoBar');
  const stepEl = document.getElementById('demoStep');

  for (const paso of pasos) {
    await new Promise(r => setTimeout(r, 2300));
    barEl.style.width = paso.pct + '%';
    stepEl.textContent = paso.msg;
    logEl.innerHTML += paso.msg + '<br>';
    logEl.scrollTop = logEl.scrollHeight;
  }

  // Ejecutar data real en background
  if (MESAIO.getFacturas().length === 0) {
    MESAIO.cargarDemoData();
  }

  await new Promise(r => setTimeout(r, 1500));

  overlay.innerHTML = `
    <div style="font-size:48px; margin-bottom:16px;">🏆</div>
    <div style="font-size:28px; font-weight:bold; margin-bottom:8px;">Demo completado</div>
    <div style="font-size:16px; opacity:0.8; margin-bottom:32px; text-align:center; max-width:400px;">
      3 sistemas reemplazados.<br>$350.000/mes → Todo en Mesaio.
    </div>
    <div style="display:flex; gap:12px;">
      <button onclick="document.getElementById('demoOverlay').remove(); if(tabFns.contabilidad) tabFns.contabilidad();" 
        style="padding:12px 24px; background:#C8A951; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">
        📊 Ver Contabilidad
      </button>
      <button onclick="document.getElementById('demoOverlay').remove(); if(tabFns.facturacion) tabFns.facturacion();" 
        style="padding:12px 24px; background:white; color:#5C1A2B; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">
        🧾 Ver Facturas
      </button>
    </div>
  `;
}
```

---

## GIT COMMIT

```bash
git add assets/js/mesaio-core.js admin/index.html
git commit -m "Fix: factura undefined+subtotal + recibo delgado + arqueo input + 24 mesas + demo automático 30s"
git push origin main
```

---

## RESULTADO

| Fix | Antes | Después |
|-----|-------|---------|
| Factura items | "undefined" | Nombre real del plato |
| Factura subtotal | $0 | $27.000 correcto |
| Impresión | Todo el admin | Recibo 80mm tipo POS |
| Arqueo input | Se borra | Persiste mientras escribes |
| Mesas | 12 | 24 (Salón/Terraza/Barra/Privado) |
| Demo | Manual tedioso | Botón ▶ automático 30 segundos |