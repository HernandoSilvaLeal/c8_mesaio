# SPEC v2.9 — BARRA DE CONTROL DEMO
## Para Claude Code — admin/index.html

---

## CONCEPTO

Una barra fija siempre visible en admin con 4 acciones:

```
[🚀 Cargar 7 días]  [🧹 Limpiar todo]  [↩ Deshacer última compra]  [🔄 Reset mesas]
     GOLD                 ROJO               GRIS SUAVE                 GRIS SUAVE
```

Cuando se carga demo: el botón "Cargar" queda gris deshabilitado.
Cuando no hay data: los botones de limpiar quedan gris deshabilitado.

---

## HTML — agregar DENTRO del pane-dashboard, al inicio:

```html
<!-- BARRA CONTROL DEMO -->
<div id="barraControlDemo" style="
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
">
  <!-- Label -->
  <div style="font-size:11px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.08em; margin-right:4px; white-space:nowrap;">
    🎛️ Control demo
  </div>

  <div style="width:1px; height:28px; background:#E5E7EB; margin:0 4px;"></div>

  <!-- BTN: Cargar demo -->
  <button id="btnCargarDemo" onclick="accionDemo('cargar')"
    style="
      display:inline-flex; align-items:center; gap:6px;
      padding:8px 16px; border-radius:8px; font-size:13px; font-weight:700;
      background:#C8A951; color:white; border:none; cursor:pointer;
      transition:all 0.2s; white-space:nowrap;
    ">
    🚀 Cargar 7 días
  </button>

  <!-- BTN: Deshacer última compra -->
  <button id="btnDeshacerUltima" onclick="accionDemo('deshacer')"
    style="
      display:inline-flex; align-items:center; gap:6px;
      padding:8px 16px; border-radius:8px; font-size:13px; font-weight:700;
      background:#F3F4F6; color:#6B7280; border:1px solid #E5E7EB; cursor:pointer;
      transition:all 0.2s; white-space:nowrap;
    ">
    ↩ Deshacer última venta
  </button>

  <!-- BTN: Reset mesas -->
  <button id="btnResetMesas" onclick="accionDemo('mesas')"
    style="
      display:inline-flex; align-items:center; gap:6px;
      padding:8px 16px; border-radius:8px; font-size:13px; font-weight:700;
      background:#F3F4F6; color:#6B7280; border:1px solid #E5E7EB; cursor:pointer;
      transition:all 0.2s; white-space:nowrap;
    ">
    🪑 Liberar todas las mesas
  </button>

  <!-- BTN: Limpiar todo -->
  <button id="btnLimpiarTodo" onclick="accionDemo('limpiar')"
    style="
      display:inline-flex; align-items:center; gap:6px;
      padding:8px 16px; border-radius:8px; font-size:13px; font-weight:700;
      background:#FEF2F2; color:#EF4444; border:1px solid #FECACA; cursor:pointer;
      transition:all 0.2s; white-space:nowrap;
    ">
    🗑️ Limpiar todo
  </button>

  <!-- Estado -->
  <div id="demoStatus" style="
    margin-left:auto; font-size:12px; color:#9CA3AF;
    display:flex; align-items:center; gap:6px;
  ">
    <span id="demoStatusDot" style="width:7px;height:7px;border-radius:50%;background:#D1D5DB;display:inline-block;"></span>
    <span id="demoStatusText">Sin datos cargados</span>
  </div>
</div>
```

---

## JS — agregar al script de admin/index.html:

```javascript
// ═══════════════════════════════════════════
// CONTROL DEMO
// ═══════════════════════════════════════════

function accionDemo(tipo) {
  switch(tipo) {

    case 'cargar': {
      const facturas = MESAIO.getFacturas();
      if (facturas.length > 0) {
        MESAIO.toast('⚠️ Ya hay datos cargados. Limpia primero.', 'warning');
        return;
      }
      const btn = document.getElementById('btnCargarDemo');
      btn.textContent = '⏳ Cargando...';
      btn.disabled = true;
      btn.style.background = '#D1D5DB';
      btn.style.cursor = 'not-allowed';

      setTimeout(() => {
        const resultado = MESAIO.cargarDemoData();
        MESAIO.toast(`✓ ${resultado.facturas} facturas · ${resultado.movimientos} movimientos · 7 días`, 'success');
        actualizarEstadoBarra();
        if (typeof cargarDashboard === 'function') cargarDashboard();
      }, 400);
      break;
    }

    case 'deshacer': {
      const facturas = JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
      if (facturas.length === 0) {
        MESAIO.toast('No hay ventas para deshacer', 'warning');
        return;
      }
      const ultima = facturas[facturas.length - 1];
      
      // Quitar última factura
      facturas.pop();
      localStorage.setItem('mesaio_facturas', JSON.stringify(facturas));
      localStorage.setItem('mesaio_factura_counter', String(facturas.length));

      // Quitar movimientos de esa orden
      const movimientos = JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
        .filter(m => m.orden_id !== ultima.orden_id);
      localStorage.setItem('mesaio_movimientos', JSON.stringify(movimientos));

      MESAIO.toast(`↩ Deshecha: Factura #${ultima.numero} — ${MESAIO.fmtCOP(ultima.total)}`, 'success');
      actualizarEstadoBarra();
      if (typeof cargarDashboard === 'function') cargarDashboard();
      break;
    }

    case 'mesas': {
      const mesas = JSON.parse(localStorage.getItem('mesaio_mesas') || '[]')
        .map(m => ({ ...m, estado: 'libre' }));
      localStorage.setItem('mesaio_mesas', JSON.stringify(mesas));

      // También marcar todas las órdenes activas como canceladas
      const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]')
        .map(o => ['pendiente','preparando','listo','entregado'].includes(o.estado)
          ? { ...o, estado: 'cancelado' } : o);
      localStorage.setItem('mesaio_ordenes', JSON.stringify(ordenes));

      MESAIO.toast('🪑 Todas las mesas liberadas', 'success');
      actualizarEstadoBarra();
      break;
    }

    case 'limpiar': {
      if (!confirm('¿Seguro? Esto borra facturas, movimientos, arqueos y cierres del día.')) return;

      localStorage.removeItem('mesaio_facturas');
      localStorage.removeItem('mesaio_factura_counter');
      localStorage.removeItem('mesaio_movimientos');
      localStorage.removeItem('mesaio_arqueos');
      localStorage.removeItem('mesaio_cierres');
      localStorage.removeItem('mesaio_v2_seed');

      // Resetear órdenes activas
      const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]')
        .map(o => ({ ...o, estado: 'cancelado' }));
      localStorage.setItem('mesaio_ordenes', JSON.stringify(ordenes));

      // Liberar mesas
      const mesas = JSON.parse(localStorage.getItem('mesaio_mesas') || '[]')
        .map(m => ({ ...m, estado: 'libre' }));
      localStorage.setItem('mesaio_mesas', JSON.stringify(mesas));

      // Re-seed ingredientes frescos
      MESAIO.initV2();

      MESAIO.toast('🗑️ Sistema limpio · Listo para nueva demo', 'success');
      actualizarEstadoBarra();
      if (typeof cargarDashboard === 'function') cargarDashboard();
      break;
    }
  }
}

function actualizarEstadoBarra() {
  const facturas = JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
  const mesas = JSON.parse(localStorage.getItem('mesaio_mesas') || '[]');
  const mesasOcupadas = mesas.filter(m => m.estado !== 'libre').length;
  const hayCierreHoy = MESAIO.isDiaCerrado ? MESAIO.isDiaCerrado() : false;

  const btnCargar    = document.getElementById('btnCargarDemo');
  const btnDeshacer  = document.getElementById('btnDeshacerUltima');
  const btnMesas     = document.getElementById('btnResetMesas');
  const btnLimpiar   = document.getElementById('btnLimpiarTodo');
  const statusDot    = document.getElementById('demoStatusDot');
  const statusText   = document.getElementById('demoStatusText');

  if (!btnCargar) return;

  // BTN CARGAR: gris si ya hay data
  if (facturas.length > 0) {
    btnCargar.disabled = true;
    btnCargar.style.background = '#D1D5DB';
    btnCargar.style.color = '#9CA3AF';
    btnCargar.style.cursor = 'not-allowed';
    btnCargar.textContent = '✓ Demo cargada';
  } else {
    btnCargar.disabled = false;
    btnCargar.style.background = '#C8A951';
    btnCargar.style.color = 'white';
    btnCargar.style.cursor = 'pointer';
    btnCargar.textContent = '🚀 Cargar 7 días';
  }

  // BTN DESHACER: gris si no hay facturas
  if (facturas.length === 0) {
    btnDeshacer.disabled = true;
    btnDeshacer.style.opacity = '0.4';
    btnDeshacer.style.cursor = 'not-allowed';
  } else {
    const ultima = facturas[facturas.length - 1];
    btnDeshacer.disabled = false;
    btnDeshacer.style.opacity = '1';
    btnDeshacer.style.cursor = 'pointer';
    btnDeshacer.textContent = `↩ Deshacer #${ultima.numero}`;
  }

  // BTN MESAS: gris si no hay mesas ocupadas
  if (mesasOcupadas === 0) {
    btnMesas.disabled = true;
    btnMesas.style.opacity = '0.4';
    btnMesas.style.cursor = 'not-allowed';
    btnMesas.textContent = '🪑 Todas libres';
  } else {
    btnMesas.disabled = false;
    btnMesas.style.opacity = '1';
    btnMesas.style.cursor = 'pointer';
    btnMesas.textContent = `🪑 Liberar ${mesasOcupadas} mesa${mesasOcupadas > 1 ? 's' : ''}`;
  }

  // BTN LIMPIAR: gris si no hay nada que limpiar
  if (facturas.length === 0 && mesasOcupadas === 0) {
    btnLimpiar.disabled = true;
    btnLimpiar.style.opacity = '0.4';
    btnLimpiar.style.cursor = 'not-allowed';
  } else {
    btnLimpiar.disabled = false;
    btnLimpiar.style.opacity = '1';
    btnLimpiar.style.cursor = 'pointer';
  }

  // STATUS
  if (facturas.length > 0) {
    statusDot.style.background = '#10B981';
    statusText.textContent = `${facturas.length} facturas · ${MESAIO.fmtCOP(
      JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
        .filter(m => m.tipo === 'venta')
        .reduce((s,m) => s + m.monto, 0)
    )} en ventas`;
  } else {
    statusDot.style.background = '#D1D5DB';
    statusText.textContent = 'Sin datos cargados';
  }
}

// Llamar al cargar la página
actualizarEstadoBarra();
```

---

## RESULTADO VISUAL

**Estado inicial (sin datos):**
```
🎛️ Control demo  |  [🚀 Cargar 7 días]  [↩ gris]  [🪑 gris]  [🗑️ gris]    ● Sin datos
```

**Después de cargar demo:**
```
🎛️ Control demo  |  [✓ Demo cargada·gris]  [↩ Deshacer #000050]  [🪑 Liberar 3 mesas]  [🗑️ Limpiar todo]    🟢 50 facturas · $2.8M
```

**Después de hacer 1 compra real:**
```
🎛️ Control demo  |  [✓ Demo cargada·gris]  [↩ Deshacer #000051]  [🪑 Liberar 1 mesa]  [🗑️ Limpiar todo]    🟢 51 facturas · $2.86M
```

**Después de limpiar:**
```
🎛️ Control demo  |  [🚀 Cargar 7 días]  [↩ gris]  [🪑 gris]  [🗑️ gris]    ● Sin datos
```

---

## GIT COMMIT

```bash
git add admin/index.html
git commit -m "feat: Barra control demo — cargar/deshacer/liberar mesas/limpiar con estados"
git push origin main
```