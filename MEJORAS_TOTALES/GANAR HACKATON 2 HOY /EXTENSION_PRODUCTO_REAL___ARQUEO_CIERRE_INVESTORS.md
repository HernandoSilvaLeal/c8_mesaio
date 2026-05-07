# EXTENSIÓN: ARQUEO + CIERRE + INVESTORS
## Convertir prototipo en PRODUCTO REAL que se vende

**Agregado a:** ORDEN_DE_BATALLA_MESAIO_v2_DEFINITIVO.md  
**Tiempo adicional:** +25 minutos (total 75 min)  
**Resultado:** Sistema que parece "enterprise" no "hobby"

---

## CONTEXTO

Cuando el cliente/inversor vea esto en vivo, dirá:
- "¿Esto realmente controla dinero?" → Arqueo responde sí ✓
- "¿Se puede cerrar el día formally?" → Cierre responde sí ✓
- "¿Veo si el negocio crece o cae?" → Investors responde sí ✓
- "Ok, ahora hazlo en backend escalable" → Ya están convencidos

---

## PASO 2.5 — 3 TABS ADICIONALES (agregar a admin/index.html)

Después de los 3 tabs anteriores (Inventario, Contabilidad, Facturación), agregar:

```html
<a href="#" class="tab" data-pane="arqueo"><i class="bi bi-clipboard-check"></i> Arqueo</a>
<a href="#" class="tab" data-pane="cierre"><i class="bi bi-lock"></i> Cierre de día</a>
<a href="#" class="tab" data-pane="investors"><i class="bi bi-graph-up"></i> Investors</a>
```

---

## PASO 2.6 — 3 PANES NUEVOS (agregar a admin/index.html después de facturación)

### Pane 1: ARQUEO

```html
<!-- ══════════════════════════════════════════ -->
<!-- PANE: ARQUEO DE CAJA                       -->
<!-- ══════════════════════════════════════════ -->
<div class="pane" id="pane-arqueo">
  <h3 style="color:var(--burgundy, #5C1A2B);margin-bottom:16px;">
    <i class="bi bi-clipboard-check"></i> Arqueo de caja
  </h3>

  <div style="max-width:500px;">
    <!-- Esperado vs Reportado -->
    <div style="background:#ECFDF5; border-radius:12px; padding:16px; margin-bottom:16px;">
      <h5 style="margin-top:0;">Reconciliación de efectivo</h5>
      
      <div style="margin:12px 0;">
        <label style="font-size:13px; font-weight:bold;">Efectivo ESPERADO (según sistema):</label>
        <div id="ariqueoEsperado" style="font-size:24px; font-weight:bold; color:#10B981; margin-top:4px;">$0</div>
        <small style="color:#9CA3AF;">Suma de todas las transacciones en efectivo hoy</small>
      </div>

      <hr style="border:none; border-top:1px dashed #ddd;">

      <div style="margin:12px 0;">
        <label style="font-size:13px; font-weight:bold;">Efectivo REPORTADO (conteo físico):</label>
        <input type="number" id="arqueoReportado" placeholder="Ingresa cantidad física" 
          style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; font-size:14px; margin-top:6px;">
        <small style="color:#9CA3AF;">Cantidad que contaste en la caja</small>
      </div>

      <hr style="border:none; border-top:1px dashed #ddd;">

      <div style="margin:12px 0;">
        <label style="font-size:13px; font-weight:bold;">DISCREPANCIA:</label>
        <div id="arqueoDiscrepancia" style="font-size:20px; font-weight:bold; color:#EF4444; margin-top:4px;">$0</div>
        <small id="arqueoEstado" style="color:#9CA3AF;">Ingresa monto reportado arriba</small>
      </div>

      <button onclick="calcularArqueo()" 
        style="width:100%; padding:12px; margin-top:16px; background:#10B981; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
        🔍 Calcular discrepancia
      </button>
    </div>

    <!-- Histórico arqueos -->
    <h5>Histórico de arqueos</h5>
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:#5C1A2B; color:white;">
            <th style="padding:8px;">Fecha</th>
            <th style="padding:8px; text-align:right;">Esperado</th>
            <th style="padding:8px; text-align:right;">Reportado</th>
            <th style="padding:8px; text-align:right;">Diferencia</th>
            <th style="padding:8px; text-align:center;">Estado</th>
          </tr>
        </thead>
        <tbody id="arqueoGrid">
          <!-- JS rellena -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### Pane 2: CIERRE DE DÍA

```html
<!-- ══════════════════════════════════════════ -->
<!-- PANE: CIERRE DE DÍA                        -->
<!-- ══════════════════════════════════════════ -->
<div class="pane" id="pane-cierre">
  <h3 style="color:var(--burgundy, #5C1A2B);margin-bottom:16px;">
    <i class="bi bi-lock"></i> Cierre de día
  </h3>

  <div id="estadoCierre" style="background:#ECFDF5; border-radius:12px; padding:16px; margin-bottom:16px;">
    <!-- JS rellena con estado actual -->
  </div>

  <div id="seccionCierreForms" style="max-width:500px;">
    <!-- Datos del cierre -->
    <div style="background:#FAF6EE; border:1px solid #C8A951; border-radius:12px; padding:16px; margin-bottom:16px;">
      <h5 style="margin-top:0;">Datos del cierre</h5>

      <div style="margin:12px 0;">
        <label style="font-size:13px; font-weight:bold;">Fecha de cierre:</label>
        <div id="cierreFecha" style="padding:8px; background:white; border-radius:6px; border:1px solid #ddd; margin-top:4px;">
          <!-- JS rellena -->
        </div>
      </div>

      <div style="margin:12px 0;">
        <label style="font-size:13px; font-weight:bold;">Nombre quien cierra:</label>
        <input type="text" id="cierreResponsable" placeholder="Tu nombre" 
          style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; margin-top:4px;">
      </div>

      <div style="margin:12px 0;">
        <label style="font-size:13px; font-weight:bold;">Notas (opcional):</label>
        <textarea id="cierreNotas" placeholder="Ej: Faltó pagar proveedor..." 
          style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:12px; height:60px; margin-top:4px;"></textarea>
      </div>

      <button onclick="generarCierre()" 
        style="width:100%; padding:12px; margin-top:16px; background:#5C1A2B; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
        🔐 Cerrar día y generar acta
      </button>

      <button id="btnReabrir" onclick="reabrirDia()" style="display:none; width:100%; padding:12px; margin-top:8px; background:#F59E0B; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
        🔓 Reabrir día (solo admin)
      </button>
    </div>
  </div>

  <!-- Acta de cierre (visible después de cerrar) -->
  <div id="seccionActaCierre" style="display:none; max-width:500px;">
    <div style="background:white; border:2px solid #5C1A2B; border-radius:12px; padding:20px;">
      <div style="text-align:center; margin-bottom:16px;">
        <h4 style="color:#5C1A2B; margin:0;">📋 ACTA DE CIERRE</h4>
        <p style="font-size:11px; color:#9CA3AF; margin:4px 0;">Mesaio Sistema de Gestión</p>
      </div>

      <div style="border-top:2px solid #5C1A2B; border-bottom:2px solid #5C1A2B; padding:12px 0; margin:12px 0; font-size:12px;">
        <p style="margin:4px 0;"><strong>Fecha:</strong> <span id="actaFecha"></span></p>
        <p style="margin:4px 0;"><strong>Responsable:</strong> <span id="actaResponsable"></span></p>
        <p style="margin:4px 0;"><strong>Hora cierre:</strong> <span id="actaHora"></span></p>
      </div>

      <div style="margin:12px 0; font-size:12px; background:#ECFDF5; padding:10px; border-radius:6px;">
        <p style="margin:2px 0;"><strong>Ingresos:</strong> <span id="actaIngresos"></span></p>
        <p style="margin:2px 0;"><strong>Costos:</strong> <span id="actaCostos"></span></p>
        <p style="margin:2px 0;"><strong>Ganancia neta:</strong> <span id="actaGanancia"></span></p>
        <p style="margin:2px 0;"><strong>Margen:</strong> <span id="actaMargen"></span></p>
      </div>

      <div style="margin:12px 0; font-size:12px; background:#FEF2F2; padding:10px; border-radius:6px;">
        <p style="margin:2px 0;"><strong>Órdenes procesadas:</strong> <span id="actaOrdenes"></span></p>
        <p style="margin:2px 0;"><strong>Facturas emitidas:</strong> <span id="actaFacturas"></span></p>
        <p style="margin:2px 0;"><strong>Transacciones:</strong> <span id="actaTransacciones"></span></p>
      </div>

      <div id="actaNotas" style="margin:12px 0; font-size:11px; background:#FFFBEB; padding:10px; border-radius:6px;"></div>

      <div style="text-align:center; margin-top:16px; padding-top:12px; border-top:1px dashed #ddd;">
        <p style="font-size:10px; margin:4px 0;">Generado por: Mesaio v2.0</p>
        <p style="font-size:10px; margin:4px 0;" id="actaCUFE"></p>
        <button onclick="window.print()" style="padding:8px 16px; background:#5C1A2B; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">🖨️ Imprimir acta</button>
      </div>
    </div>
  </div>

  <!-- Histórico cierres -->
  <div id="seccionHistoricoCierres" style="margin-top:24px;">
    <h5>Histórico de cierres</h5>
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#5C1A2B; color:white;">
            <th style="padding:6px;">Fecha</th>
            <th style="padding:6px; text-align:right;">Ingresos</th>
            <th style="padding:6px; text-align:right;">Ganancia</th>
            <th style="padding:6px; text-align:center;">Órdenes</th>
            <th style="padding:6px;">Responsable</th>
            <th style="padding:6px;">Acta</th>
          </tr>
        </thead>
        <tbody id="cierresGrid">
          <!-- JS rellena -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### Pane 3: INVESTORS

```html
<!-- ══════════════════════════════════════════ -->
<!-- PANE: DASHBOARD INVESTORS                  -->
<!-- ══════════════════════════════════════════ -->
<div class="pane" id="pane-investors">
  <h3 style="color:var(--burgundy, #5C1A2B);margin-bottom:16px;">
    <i class="bi bi-graph-up"></i> Dashboard de inversores
  </h3>

  <!-- Selector período -->
  <div style="margin-bottom:16px;">
    <label style="font-size:12px; font-weight:bold;">Período:</label>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button onclick="cambiarPeriodoInvestors('7')" class="btn-periodo" data-dias="7" 
        style="padding:6px 12px; background:#C8A951; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">Últimos 7 días</button>
      <button onclick="cambiarPeriodoInvestors('30')" class="btn-periodo" data-dias="30"
        style="padding:6px 12px; background:white; color:#5C1A2B; border:2px solid #5C1A2B; border-radius:6px; cursor:pointer; font-size:12px;">Últimos 30 días</button>
      <button onclick="cambiarPeriodoInvestors('90')" class="btn-periodo" data-dias="90"
        style="padding:6px 12px; background:white; color:#5C1A2B; border:2px solid #5C1A2B; border-radius:6px; cursor:pointer; font-size:12px;">Últimos 90 días</button>
    </div>
  </div>

  <!-- 6 KPI Cards -->
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; margin-bottom:24px;">
    <div style="background:#ECFDF5; border-radius:12px; padding:14px; text-align:center; border-left:4px solid #10B981;">
      <div style="font-size:11px; color:#6B7280;">Ingresos totales</div>
      <div id="invKpiIngresos" style="font-size:20px; font-weight:bold; color:#10B981; margin-top:4px;">$0</div>
      <div id="invTrendIngresos" style="font-size:10px; color:#9CA3AF; margin-top:2px;">-</div>
    </div>

    <div style="background:#FEF2F2; border-radius:12px; padding:14px; text-align:center; border-left:4px solid #EF4444;">
      <div style="font-size:11px; color:#6B7280;">Costos ingredientes</div>
      <div id="invKpiCostos" style="font-size:20px; font-weight:bold; color:#EF4444; margin-top:4px;">$0</div>
      <div id="invTrendCostos" style="font-size:10px; color:#9CA3AF; margin-top:2px;">-</div>
    </div>

    <div style="background:#EFF6FF; border-radius:12px; padding:14px; text-align:center; border-left:4px solid #3B82F6;">
      <div style="font-size:11px; color:#6B7280;">Ganancia neta</div>
      <div id="invKpiGanancia" style="font-size:20px; font-weight:bold; color:#3B82F6; margin-top:4px;">$0</div>
      <div id="invTrendGanancia" style="font-size:10px; color:#9CA3AF; margin-top:2px;">-</div>
    </div>

    <div style="background:#FAF6EE; border-radius:12px; padding:14px; text-align:center; border-left:4px solid #C8A951;">
      <div style="font-size:11px; color:#6B7280;">Margen promedio</div>
      <div id="invKpiMargen" style="font-size:20px; font-weight:bold; color:#C8A951; margin-top:4px;">0%</div>
      <div id="invTrendMargen" style="font-size:10px; color:#9CA3AF; margin-top:2px;">-</div>
    </div>

    <div style="background:#F0F9FF; border-radius:12px; padding:14px; text-align:center; border-left:4px solid #06B6D4;">
      <div style="font-size:11px; color:#6B7280;">Ticket promedio</div>
      <div id="invKpiTicket" style="font-size:20px; font-weight:bold; color:#06B6D4; margin-top:4px;">$0</div>
      <div id="invTrendTicket" style="font-size:10px; color:#9CA3AF; margin-top:2px;">-</div>
    </div>

    <div style="background:#DBEAFE; border-radius:12px; padding:14px; text-align:center; border-left:4px solid #1D4ED8;">
      <div style="font-size:11px; color:#6B7280;">Total órdenes</div>
      <div id="invKpiOrdenes" style="font-size:20px; font-weight:bold; color:#1D4ED8; margin-top:4px;">0</div>
      <div id="invTrendOrdenes" style="font-size:10px; color:#9CA3AF; margin-top:2px;">-</div>
    </div>
  </div>

  <!-- Tabla comparativa: hoy vs promedio -->
  <h5>Hoy vs promedio del período</h5>
  <div style="overflow-x:auto;">
    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      <thead>
        <tr style="background:#5C1A2B; color:white;">
          <th style="padding:8px;">Métrica</th>
          <th style="padding:8px; text-align:right;">Hoy</th>
          <th style="padding:8px; text-align:right;">Promedio período</th>
          <th style="padding:8px; text-align:center;">Variación</th>
        </tr>
      </thead>
      <tbody id="invComparativaGrid">
        <!-- JS rellena -->
      </tbody>
    </table>
  </div>

  <!-- Tabla histórico diario -->
  <h5 style="margin-top:24px;">Ingresos diarios (últimos 30 días)</h5>
  <div style="overflow-x:auto; max-height:300px;">
    <table style="width:100%; border-collapse:collapse; font-size:11px;">
      <thead>
        <tr style="background:#5C1A2B; color:white;">
          <th style="padding:6px;">Fecha</th>
          <th style="padding:6px; text-align:right;">Ingresos</th>
          <th style="padding:6px; text-align:right;">Costos</th>
          <th style="padding:6px; text-align:right;">Ganancia</th>
          <th style="padding:6px; text-align:center;">Margen</th>
          <th style="padding:6px; text-align:center;">Órdenes</th>
        </tr>
      </thead>
      <tbody id="invHistoricoGrid">
        <!-- JS rellena -->
      </tbody>
    </table>
  </div>
</div>
```

---

## PASO 2.7 — AGREGAR FUNCIONES V2 A mesaio-core.js (antes del cierre)

```javascript
// ══════════════════════════════════════════════════════════
// V2 — ARQUEO
// ══════════════════════════════════════════════════════════

getArqueos() {
  return JSON.parse(localStorage.getItem('mesaio_arqueos') || '[]');
},

registrarArqueo(esperado, reportado) {
  const arqueos = this.getArqueos();
  const discrepancia = reportado - esperado;
  const estado = Math.abs(discrepancia) < 100 ? 'OK' : discrepancia > 0 ? 'SOBRANTE' : 'FALTANTE';

  arqueos.push({
    id: arqueos.length + 1,
    fecha: new Date().toISOString(),
    efectivo_esperado: esperado,
    efectivo_reportado: reportado,
    discrepancia,
    estado,
    porcentaje_error: esperado > 0 ? ((Math.abs(discrepancia) / esperado) * 100).toFixed(2) : '0'
  });

  localStorage.setItem('mesaio_arqueos', JSON.stringify(arqueos));
  return { discrepancia, estado };
},

getArqueosHoy() {
  const hoy = new Date().toDateString();
  return this.getArqueos().filter(a => new Date(a.fecha).toDateString() === hoy);
},

// ══════════════════════════════════════════════════════════
// V2 — CIERRE DE DÍA
// ══════════════════════════════════════════════════════════

getCierres() {
  return JSON.parse(localStorage.getItem('mesaio_cierres') || '[]');
},

getDiaEstaActuallyCerrado() {
  const hoy = new Date().toDateString();
  return this.getCierres().find(c => new Date(c.fecha).toDateString() === hoy);
},

generarCierreDia(responsable, notas) {
  const hoy = new Date();
  const cierre = this.getCierreCaja();
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]').filter(
    o => new Date(o.created_at).toDateString() === hoy.toDateString()
  );
  const facturas = this.getFacturasHoy();
  const movimientos = this.getMovimientosHoy();

  const registro = {
    id: this.getCierres().length + 1,
    fecha: hoy.toISOString(),
    responsable,
    notas,
    cierre_caja: cierre,
    ordenes_count: ordenes.length,
    facturas_count: facturas.length,
    transacciones_count: movimientos.length,
    cufe_cierre: this.generarCUFE(),
    estado: 'cerrado'
  };

  const cierres = this.getCierres();
  cierres.push(registro);
  localStorage.setItem('mesaio_cierres', JSON.stringify(cierres));

  return registro;
},

reabrirDia() {
  const cierres = this.getCierres();
  const hoy = new Date().toDateString();
  const idx = cierres.findIndex(c => new Date(c.fecha).toDateString() === hoy);
  if (idx >= 0) {
    cierres[idx].estado = 'reabierto';
    localStorage.setItem('mesaio_cierres', JSON.stringify(cierres));
  }
},

isDiaCerrado() {
  return !!this.getDiaEstaActuallyCerrado();
},

// ══════════════════════════════════════════════════════════
// V2 — INVESTORS ANALYTICS
// ══════════════════════════════════════════════════════════

getMovimientosUltimosNDias(n) {
  const ahora = new Date();
  const hace = new Date(ahora.getTime() - n * 24 * 60 * 60 * 1000);
  return JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
    .filter(m => new Date(m.created_at) >= hace);
},

getAnaliticsUltimosNDias(n) {
  const movimientos = this.getMovimientosUltimosNDias(n);
  const ingresos = movimientos.filter(m => m.tipo === 'venta').reduce((s, m) => s + m.monto, 0);
  const costos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
  
  const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]')
    .filter(o => {
      const oFecha = new Date(o.created_at);
      const ahora = new Date();
      const hace = new Date(ahora.getTime() - n * 24 * 60 * 60 * 1000);
      return oFecha >= hace;
    });

  const ganancia = ingresos - costos;
  const margen = ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : '0.0';
  const ticketPromedio = ordenes.length > 0 ? Math.round(ingresos / ordenes.length) : 0;

  return {
    ingresos,
    costos,
    ganancia,
    margen,
    ticketPromedio,
    ordenes_count: ordenes.length,
    dias_en_periodo: n
  };
},

getAnaliticssPorDia(n) {
  // Array de últimos N días con breakdown diario
  const resultado = [];
  for (let i = n - 1; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const fechaStr = fecha.toDateString();

    const movimientos = JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
      .filter(m => new Date(m.created_at).toDateString() === fechaStr);
    
    const ingresos = movimientos.filter(m => m.tipo === 'venta').reduce((s, m) => s + m.monto, 0);
    const costos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
    
    const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]')
      .filter(o => new Date(o.created_at).toDateString() === fechaStr).length;

    const ganancia = ingresos - costos;
    const margen = ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : '0.0';

    resultado.push({
      fecha: fecha.toLocaleDateString('es-CO'),
      ingresos,
      costos,
      ganancia,
      margen,
      ordenes
    });
  }
  return resultado;
},
```

---

## PASO 2.8 — AGREGAR FUNCIONES JS A admin/index.html (en tabFns)

```javascript
// Actualizar tabFns:
inventario: cargarInventario,
contabilidad: cargarContabilidad,
facturacion: cargarFacturacion,
arqueo: cargarArqueo,
cierre: cargarCierre,
investors: cargarInvestors,
```

```javascript
// ════════════════════════════════════════════════════════════
// ARQUEO
// ════════════════════════════════════════════════════════════

function cargarArqueo() {
  const cierre = MESAIO.getCierreCaja();
  const efectivoEsperado = cierre.ingresos; // solo ventas en efectivo (simplificado)

  document.getElementById('ariqueoEsperado').textContent = MESAIO.fmtCOP(efectivoEsperado);
  document.getElementById('arqueoReportado').value = '';
  document.getElementById('arqueoDiscrepancia').textContent = '$0';
  document.getElementById('arqueoEstado').textContent = 'Ingresa monto reportado arriba';

  // Grid histórico
  const arqueos = MESAIO.getArqueos();
  const grid = document.getElementById('arqueoGrid');
  grid.innerHTML = arqueos.slice(-10).reverse().map(a => {
    const bgColor = a.estado === 'OK' ? '#ECFDF5' : a.estado === 'SOBRANTE' ? '#FFFBEB' : '#FEF2F2';
    const badge = a.estado === 'OK' ? '✓' : a.estado === 'SOBRANTE' ? '⚠️' : '🔴';
    return `<tr style="background:${bgColor}; border-bottom:1px solid #eee;">
      <td style="padding:6px;">${MESAIO.fmtHora(a.fecha)}</td>
      <td style="padding:6px; text-align:right;">${MESAIO.fmtCOP(a.efectivo_esperado)}</td>
      <td style="padding:6px; text-align:right;">${MESAIO.fmtCOP(a.efectivo_reportado)}</td>
      <td style="padding:6px; text-align:right; font-weight:bold; color:${a.discrepancia > 0 ? '#10B981' : '#EF4444'};">${MESAIO.fmtCOP(a.discrepancia)}</td>
      <td style="padding:6px; text-align:center;">${badge} ${a.estado}</td>
    </tr>`;
  }).join('');
}

function calcularArqueo() {
  const cierre = MESAIO.getCierreCaja();
  const esperado = cierre.ingresos;
  const reportado = parseInt(document.getElementById('arqueoReportado').value) || 0;
  
  if (reportado === 0) {
    MESAIO.toast('⚠️ Ingresa el monto reportado', 'warning');
    return;
  }

  const resultado = MESAIO.registrarArqueo(esperado, reportado);
  const discrepancia = resultado.discrepancia;

  document.getElementById('arqueoDiscrepancia').textContent = MESAIO.fmtCOP(Math.abs(discrepancia));
  document.getElementById('arqueoDiscrepancia').style.color = resultado.estado === 'OK' ? '#10B981' : '#EF4444';
  
  const msg = resultado.estado === 'OK' ? '✓ Arqueo OK — Dinero coincide' : `⚠️ Discrepancia: ${MESAIO.fmtCOP(Math.abs(discrepancia))} ${discrepancia > 0 ? 'SOBRANTE' : 'FALTANTE'}`;
  document.getElementById('arqueoEstado').textContent = msg;

  MESAIO.toast(msg, resultado.estado === 'OK' ? 'success' : 'warning');
  cargarArqueo();
}

// ════════════════════════════════════════════════════════════
// CIERRE
// ════════════════════════════════════════════════════════════

function cargarCierre() {
  const cerradoHoy = MESAIO.getDiaEstaActuallyCerrado();

  if (cerradoHoy) {
    // Mostrar acta
    document.getElementById('seccionCierreForms').style.display = 'none';
    document.getElementById('seccionActaCierre').style.display = 'block';
    document.getElementById('btnReabrir').style.display = 'block';

    mostrarActaCierre(cerradoHoy);
  } else {
    // Mostrar formulario
    document.getElementById('seccionCierreForms').style.display = 'block';
    document.getElementById('seccionActaCierre').style.display = 'none';
    document.getElementById('btnReabrir').style.display = 'none';
    
    const ahora = new Date();
    document.getElementById('cierreFecha').textContent = ahora.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('cierreResponsable').value = '';
    document.getElementById('cierreNotas').value = '';
  }

  // Grid histórico
  const cierres = MESAIO.getCierres();
  const grid = document.getElementById('cierresGrid');
  grid.innerHTML = cierres.slice(-7).reverse().map(c => {
    return `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:6px;">${MESAIO.fmtHora(c.fecha)}</td>
      <td style="padding:6px; text-align:right;">${MESAIO.fmtCOP(c.cierre_caja.ingresos)}</td>
      <td style="padding:6px; text-align:right; color:#10B981;">${MESAIO.fmtCOP(c.cierre_caja.neto)}</td>
      <td style="padding:6px; text-align:center;">${c.ordenes_count}</td>
      <td style="padding:6px;">${c.responsable || '-'}</td>
      <td style="padding:6px; text-align:center;">
        <button onclick="mostrarActaCierre({...{${JSON.stringify(c).slice(1, -1)}}${JSON.stringify(c).slice(1)})" 
          style="padding:2px 8px; background:#5C1A2B; color:white; border:none; border-radius:4px; cursor:pointer; font-size:10px;">📋</button>
      </td>
    </tr>`;
  }).join('');
}

function generarCierre() {
  const responsable = document.getElementById('cierreResponsable').value.trim();
  const notas = document.getElementById('cierreNotas').value.trim();

  if (!responsable) {
    MESAIO.toast('⚠️ Ingresa tu nombre', 'warning');
    return;
  }

  const registro = MESAIO.generarCierreDia(responsable, notas);
  MESAIO.toast('✓ Día cerrado exitosamente', 'success');
  cargarCierre();
}

function reabrirDia() {
  if (!confirm('¿Realmente deseas reabrir el día? Solo admin puede hacerlo.')) return;
  MESAIO.reabrirDia();
  MESAIO.toast('🔓 Día reabierto', 'info');
  cargarCierre();
}

function mostrarActaCierre(cierre) {
  document.getElementById('actaFecha').textContent = new Date(cierre.fecha).toLocaleDateString('es-CO');
  document.getElementById('actaResponsable').textContent = cierre.responsable || 'Sistema';
  document.getElementById('actaHora').textContent = MESAIO.fmtHora(cierre.fecha);
  document.getElementById('actaIngresos').textContent = MESAIO.fmtCOP(cierre.cierre_caja.ingresos);
  document.getElementById('actaCostos').textContent = MESAIO.fmtCOP(cierre.cierre_caja.egresos);
  document.getElementById('actaGanancia').textContent = MESAIO.fmtCOP(cierre.cierre_caja.neto);
  document.getElementById('actaMargen').textContent = cierre.cierre_caja.margen + '%';
  document.getElementById('actaOrdenes').textContent = cierre.ordenes_count;
  document.getElementById('actaFacturas').textContent = cierre.facturas_count;
  document.getElementById('actaTransacciones').textContent = cierre.transacciones_count;
  document.getElementById('actaCUFE').textContent = `CUFE: ${cierre.cufe_cierre}`;
  
  const notasDiv = document.getElementById('actaNotas');
  if (cierre.notas) {
    notasDiv.innerHTML = `<strong>Notas:</strong> ${cierre.notas}`;
  } else {
    notasDiv.innerHTML = '';
  }
}

// ════════════════════════════════════════════════════════════
// INVESTORS
// ════════════════════════════════════════════════════════════

let periodoInvestorsActual = 7;

function cambiarPeriodoInvestors(dias) {
  periodoInvestorsActual = parseInt(dias);
  document.querySelectorAll('.btn-periodo').forEach(b => {
    b.style.background = b.getAttribute('data-dias') === dias ? '#C8A951' : 'white';
    b.style.color = b.getAttribute('data-dias') === dias ? 'white' : '#5C1A2B';
  });
  cargarInvestors();
}

function cargarInvestors() {
  const n = periodoInvestorsActual;
  const analytics = MESAIO.getAnaliticsUltimosNDias(n);
  const porDia = MESAIO.getAnaliticssPorDia(n);
  const hoy = porDia[porDia.length - 1] || { ingresos: 0, costos: 0, ganancia: 0, margen: '0', ordenes: 0 };
  const promedio = {
    ingresos: Math.round(analytics.ingresos / n),
    costos: Math.round(analytics.costos / n),
    ganancia: Math.round(analytics.ganancia / n),
    margen: analytics.margen,
    ordenes: Math.round(analytics.ordenes_count / n)
  };

  // KPIs principales
  document.getElementById('invKpiIngresos').textContent = MESAIO.fmtCOP(analytics.ingresos);
  document.getElementById('invKpiCostos').textContent = MESAIO.fmtCOP(analytics.costos);
  document.getElementById('invKpiGanancia').textContent = MESAIO.fmtCOP(analytics.ganancia);
  document.getElementById('invKpiMargen').textContent = analytics.margen + '%';
  document.getElementById('invKpiTicket').textContent = MESAIO.fmtCOP(analytics.ticketPromedio);
  document.getElementById('invKpiOrdenes').textContent = analytics.ordenes_count;

  // Tendencias (hoy vs promedio)
  const trendIngresos = hoy.ingresos >= promedio.ingresos ? '📈 Arriba' : '📉 Abajo';
  const trendCostos = hoy.costos <= promedio.costos ? '📈 Eficiente' : '📉 Alto';
  const trendGanancia = hoy.ganancia >= promedio.ganancia ? '📈 Arriba' : '📉 Abajo';
  const trendMargen = parseFloat(hoy.margen) >= parseFloat(promedio.margen) ? '📈 Mejor' : '📉 Peor';
  const trendTicket = hoy.ordenes > 0 ? (hoy.ingresos / hoy.ordenes >= promedio.ingresos / promedio.ordenes ? '📈 Mayor' : '📉 Menor') : '—';
  const trendOrdenes = hoy.ordenes >= promedio.ordenes ? '📈 Más' : '📉 Menos';

  document.getElementById('invTrendIngresos').textContent = trendIngresos;
  document.getElementById('invTrendCostos').textContent = trendCostos;
  document.getElementById('invTrendGanancia').textContent = trendGanancia;
  document.getElementById('invTrendMargen').textContent = trendMargen;
  document.getElementById('invTrendTicket').textContent = trendTicket;
  document.getElementById('invTrendOrdenes').textContent = trendOrdenes;

  // Grid comparativa
  const gridComp = document.getElementById('invComparativaGrid');
  gridComp.innerHTML = `
    <tr style="background:#ECFDF5;">
      <td style="padding:8px;"><strong>Ingresos</strong></td>
      <td style="padding:8px; text-align:right; font-weight:bold;">${MESAIO.fmtCOP(hoy.ingresos)}</td>
      <td style="padding:8px; text-align:right;">${MESAIO.fmtCOP(promedio.ingresos)}</td>
      <td style="padding:8px; text-align:center;">${hoy.ingresos > promedio.ingresos ? '+' : ''} ${((hoy.ingresos - promedio.ingresos) / promedio.ingresos * 100).toFixed(0)}%</td>
    </tr>
    <tr style="background:#FEF2F2;">
      <td style="padding:8px;"><strong>Costos</strong></td>
      <td style="padding:8px; text-align:right; font-weight:bold;">${MESAIO.fmtCOP(hoy.costos)}</td>
      <td style="padding:8px; text-align:right;">${MESAIO.fmtCOP(promedio.costos)}</td>
      <td style="padding:8px; text-align:center;">${hoy.costos > promedio.costos ? '+' : ''} ${((hoy.costos - promedio.costos) / promedio.costos * 100).toFixed(0)}%</td>
    </tr>
    <tr style="background:#EFF6FF;">
      <td style="padding:8px;"><strong>Ganancia</strong></td>
      <td style="padding:8px; text-align:right; font-weight:bold;">${MESAIO.fmtCOP(hoy.ganancia)}</td>
      <td style="padding:8px; text-align:right;">${MESAIO.fmtCOP(promedio.ganancia)}</td>
      <td style="padding:8px; text-align:center;">${hoy.ganancia > promedio.ganancia ? '+' : ''} ${((hoy.ganancia - promedio.ganancia) / promedio.ganancia * 100).toFixed(0)}%</td>
    </tr>
    <tr style="background:#FAF6EE;">
      <td style="padding:8px;"><strong>Margen</strong></td>
      <td style="padding:8px; text-align:right; font-weight:bold;">${hoy.margen}%</td>
      <td style="padding:8px; text-align:right;">${promedio.margen}%</td>
      <td style="padding:8px; text-align:center;">${parseFloat(hoy.margen) > parseFloat(promedio.margen) ? '📈' : '📉'}</td>
    </tr>
  `;

  // Grid histórico
  const gridHist = document.getElementById('invHistoricoGrid');
  gridHist.innerHTML = porDia.slice().reverse().map(d => {
    const bgColor = d.ganancia > promedio.ganancia ? '#ECFDF5' : '#FEF2F2';
    return `<tr style="background:${bgColor}; border-bottom:1px solid #eee; font-size:10px;">
      <td style="padding:4px;">${d.fecha}</td>
      <td style="padding:4px; text-align:right;">${MESAIO.fmtCOP(d.ingresos)}</td>
      <td style="padding:4px; text-align:right;">${MESAIO.fmtCOP(d.costos)}</td>
      <td style="padding:4px; text-align:right; font-weight:bold;">${MESAIO.fmtCOP(d.ganancia)}</td>
      <td style="padding:4px; text-align:center;">${d.margen}%</td>
      <td style="padding:4px; text-align:center;">${d.ordenes}</td>
    </tr>`;
  }).join('');
}
```

---

## PASO 2.9 — INICIALIZACIÓN V2 EXTENDIDA

En mesaio-core.js, función `initV2()`, agregar al final:

```javascript
localStorage.setItem('mesaio_arqueos', JSON.stringify([]));
localStorage.setItem('mesaio_cierres', JSON.stringify([]));
console.log('✓ Mesaio V2 completo: Arqueo + Cierre + Investors');
```

---

## VERIFICACIÓN EXTENDIDA

Agregar a la lista de tests:

```
12. Admin → Tab Arqueo → Ingresar efectivo reportado → Calcular → OK ✓
13. Admin → Tab Cierre → Ingresa nombre responsable → Cerrar día → Acta generada ✓
14. Admin → Tab Investors → Ver KPIs últimos 7 días → Tabla comparativa hoy vs promedio ✓
15. Intenta tocar otra orden en mesero → tab está bloqueado (día cerrado) ✓
```

---

## TIEMPO TOTAL

| Paso | Tiempo |
|------|--------|
| 1 - mesaio-core.js | 15 min |
| 2 - admin tabs (orig) | 15 min |
| 2.5-2.9 (arqueo+cierre+investors) | +25 min |
| 3 - cocina hook | 5 min |
| 4 - mesero modal | 10 min |
| 5 - verificación | 5 min |
| **Total** | **75 min** |

---

## RESULTADO FINAL

Sistema que ve un inversor y dice:

✅ "Tiene facturación electrónica" (CUFE, IVA)
✅ "Tiene control de caja" (arqueo con discrepancias)
✅ "Tiene cierre formal de día" (acta, auditoría)
✅ "Tengo visibilidad de rentabilidad" (investors dashboard)
✅ "Esto se ve production-ready"

**"Ok, hagamos backend escalable para esto"** → Ahí vendemos.

---

**DOCUMENTO EXTENSIÓN LISTO. Dale a Claude Code los DOS docs en orden:**
1. ORDEN_DE_BATALLA_MESAIO_v2_DEFINITIVO.md (pasos 1-5)
2. EXTENSION_PRODUCTO_REAL___ARQUEO_CIERRE_INVESTORS.md (pasos 2.5-2.9)
