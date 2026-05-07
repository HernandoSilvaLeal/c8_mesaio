# SPEC MEJORAS VISUALES — MESAIO v2.1
## Para Claude Code — Ejecutar secuencialmente

---

## MEJORA 1 — MODAL DE REPOSICIÓN (reemplazar alert())

**Problema:** `refillIngrediente()` usa `prompt()` de JavaScript — feo, roto en móvil, no branded.

**Acción:** En `admin/index.html`, reemplazar la función `refillIngrediente()` Y agregar el modal HTML.

### HTML del modal (agregar antes de `</body>`):

```html
<!-- MODAL REPOSICIÓN -->
<div id="modalReponer" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center;">
  <div style="background:#FAF6EE; border-radius:16px; padding:28px; width:340px; border:2px solid #5C1A2B; box-shadow:0 20px 60px rgba(92,26,43,0.3);">
    
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
      <div style="background:#5C1A2B; border-radius:10px; padding:8px; display:flex;">
        <svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
          <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      </div>
      <div>
        <h4 style="margin:0; color:#5C1A2B; font-family:'Playfair Display',serif;">Reponer stock</h4>
        <p id="reponerNombre" style="margin:0; font-size:12px; color:#9CA3AF;"></p>
      </div>
    </div>

    <div style="background:white; border-radius:10px; padding:14px; margin-bottom:16px; border:1px solid #E5E7EB;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span style="font-size:12px; color:#9CA3AF;">Stock actual</span>
        <span id="reponerStockActual" style="font-size:12px; font-weight:bold; color:#5C1A2B;"></span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="font-size:12px; color:#9CA3AF;">Mínimo</span>
        <span id="reponerStockMinimo" style="font-size:12px; color:#9CA3AF;"></span>
      </div>
    </div>

    <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:8px;">
      Cantidad a agregar:
    </label>
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
      <button onclick="ajustarCantidadReponer(-10)" style="width:36px; height:36px; background:#F3F4F6; border:1px solid #ddd; border-radius:8px; cursor:pointer; font-size:16px; font-weight:bold;">−</button>
      <input type="number" id="reponerCantidad" value="100" min="1"
        style="flex:1; padding:8px 12px; border:2px solid #C8A951; border-radius:8px; font-size:16px; font-weight:bold; text-align:center; color:#5C1A2B; background:white; outline:none;">
      <button onclick="ajustarCantidadReponer(10)" style="width:36px; height:36px; background:#F3F4F6; border:1px solid #ddd; border-radius:8px; cursor:pointer; font-size:16px; font-weight:bold;">+</button>
    </div>

    <!-- Presets rápidos -->
    <div style="display:flex; gap:6px; margin-bottom:20px;">
      <button onclick="document.getElementById('reponerCantidad').value=50" style="flex:1; padding:6px; background:white; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:12px; color:#6B7280;">+50</button>
      <button onclick="document.getElementById('reponerCantidad').value=100" style="flex:1; padding:6px; background:white; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:12px; color:#6B7280;">+100</button>
      <button onclick="document.getElementById('reponerCantidad').value=500" style="flex:1; padding:6px; background:white; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:12px; color:#6B7280;">+500</button>
      <button onclick="document.getElementById('reponerCantidad').value=1000" style="flex:1; padding:6px; background:white; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:12px; color:#6B7280;">+1000</button>
    </div>

    <div style="display:flex; gap:8px;">
      <button onclick="cerrarModalReponer()" style="flex:1; padding:11px; background:white; border:2px solid #ddd; border-radius:8px; cursor:pointer; font-weight:600; color:#6B7280;">Cancelar</button>
      <button onclick="confirmarReponer()" style="flex:2; padding:11px; background:#5C1A2B; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:14px;">✓ Reponer stock</button>
    </div>
  </div>
</div>
```

### JS — reemplazar función `refillIngrediente()`:

```javascript
// VARIABLE GLOBAL para el modal
let reponerIngredienteId = null;

function refillIngrediente(id) {
  const ing = MESAIO.getIngredientes().find(i => i.id === id);
  if (!ing) return;

  reponerIngredienteId = id;
  document.getElementById('reponerNombre').textContent = ing.nombre + ' · ' + ing.categoria;
  document.getElementById('reponerStockActual').textContent = ing.stock + ' ' + ing.unidad;
  document.getElementById('reponerStockMinimo').textContent = 'Mín: ' + ing.stock_minimo + ' ' + ing.unidad;
  
  // Preset inteligente: sugiere la cantidad para llegar al doble del mínimo
  const sugerido = Math.max(50, (ing.stock_minimo * 2) - ing.stock);
  document.getElementById('reponerCantidad').value = sugerido;
  
  document.getElementById('modalReponer').style.display = 'flex';
}

function ajustarCantidadReponer(delta) {
  const input = document.getElementById('reponerCantidad');
  input.value = Math.max(1, parseInt(input.value || 0) + delta);
}

function cerrarModalReponer() {
  document.getElementById('modalReponer').style.display = 'none';
  reponerIngredienteId = null;
}

function confirmarReponer() {
  if (!reponerIngredienteId) return;
  const cantidad = parseInt(document.getElementById('reponerCantidad').value);
  if (!cantidad || cantidad < 1) {
    MESAIO.toast('⚠️ Ingresa una cantidad válida', 'warning');
    return;
  }
  MESAIO.updateStock(reponerIngredienteId, cantidad);
  MESAIO.toast('✓ Stock repuesto exitosamente', 'success');
  cerrarModalReponer();
  cargarInventario();
}

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModalReponer();
});
```

---

## MEJORA 2 — ALERTA STOCK CRÍTICO EN HEADER

**Problema:** El admin no sabe que hay stock bajo sin ir al tab Inventario.

**Acción:** En `admin/index.html`, dentro del `<header>` (la barra burgundy de arriba), agregar antes del botón "Salir":

```html
<!-- Badge alertas stock — visible siempre -->
<div id="headerAlertaStock" onclick="irAInventario()" style="display:none; align-items:center; gap:6px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); border-radius:20px; padding:5px 12px; cursor:pointer; transition:all 0.2s;">
  <span style="width:8px; height:8px; background:#EF4444; border-radius:50%; display:inline-block; animation:pulse 1.5s infinite;"></span>
  <span id="headerAlertaTexto" style="font-size:12px; color:#EF4444; font-weight:600;"></span>
</div>

<style>
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
</style>
```

### JS — agregar en el script de admin:

```javascript
function actualizarAlertasHeader() {
  const alertas = MESAIO.getAlertasStock();
  const badge = document.getElementById('headerAlertaStock');
  const texto = document.getElementById('headerAlertaTexto');
  if (alertas.length > 0) {
    badge.style.display = 'flex';
    texto.textContent = alertas.length + ' ingrediente' + (alertas.length > 1 ? 's' : '') + ' crítico' + (alertas.length > 1 ? 's' : '');
  } else {
    badge.style.display = 'none';
  }
}

function irAInventario() {
  // Simular click en tab inventario
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const tabInv = document.querySelector('[data-pane="inventario"]');
  if (tabInv) { tabInv.classList.add('active'); tabInv.click(); }
}

// Llamar al cargar y cada 30 segundos
actualizarAlertasHeader();
setInterval(actualizarAlertasHeader, 30000);
```

---

## MEJORA 3 — GRÁFICO DE BARRAS EN INVESTORS (canvas puro)

**Problema:** Investors es solo tablas. El jurado quiere ver algo VISUAL.

**Acción:** En el pane de Investors, DESPUÉS de los 6 KPI cards y ANTES de la tabla comparativa, agregar:

```html
<!-- Gráfico de barras — ingresos últimos 7 días -->
<div style="background:white; border-radius:12px; padding:20px; margin-bottom:24px; border:1px solid #E5E7EB;">
  <h5 style="margin:0 0 16px; color:#5C1A2B; font-family:'Playfair Display',serif;">Ingresos diarios</h5>
  <canvas id="graficoIngresos" width="700" height="200" style="width:100%; height:auto;"></canvas>
</div>
```

### JS — función `dibujarGrafico(datos)`, agregar al script de admin:

```javascript
function dibujarGrafico(datos) {
  const canvas = document.getElementById('graficoIngresos');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const pad = { top: 20, right: 20, bottom: 50, left: 70 };

  ctx.clearRect(0, 0, W, H);

  if (!datos || datos.length === 0) return;

  const maxVal = Math.max(...datos.map(d => d.ingresos), 1);
  const barW = Math.floor((W - pad.left - pad.right) / datos.length) - 10;
  const chartH = H - pad.top - pad.bottom;

  // Fondo grid
  ctx.strokeStyle = '#F3F4F6';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    // Label eje Y
    const val = maxVal - (maxVal / 4) * i;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('$' + (val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val.toFixed(0)), pad.left - 8, y + 4);
  }

  // Barras
  datos.forEach((d, i) => {
    const barH = Math.max(2, (d.ingresos / maxVal) * chartH);
    const x = pad.left + i * (barW + 10);
    const y = pad.top + chartH - barH;

    // Gradiente burgundy
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, '#7C2A3A');
    grad.addColorStop(1, '#5C1A2B');
    ctx.fillStyle = grad;

    // Barra con border-radius simulado
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Valor encima de la barra
    if (d.ingresos > 0) {
      ctx.fillStyle = '#5C1A2B';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = d.ingresos >= 1000000
        ? '$' + (d.ingresos / 1000000).toFixed(1) + 'M'
        : '$' + (d.ingresos / 1000).toFixed(0) + 'K';
      ctx.fillText(label, x + barW / 2, y - 6);
    }

    // Fecha bajo la barra
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    // Mostrar solo día/mes
    const partes = d.fecha.split('/');
    const fechaCorta = partes.length >= 2 ? partes[0] + '/' + partes[1] : d.fecha;
    ctx.fillText(fechaCorta, x + barW / 2, H - pad.bottom + 18);
  });

  // Línea de ganancia (overlay)
  ctx.beginPath();
  ctx.strokeStyle = '#C8A951';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  datos.forEach((d, i) => {
    const gananciaH = Math.max(0, (d.ganancia / maxVal) * chartH);
    const x = pad.left + i * (barW + 10) + barW / 2;
    const y = pad.top + chartH - gananciaH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Leyenda
  ctx.fillStyle = '#5C1A2B';
  ctx.fillRect(W - 130, 8, 12, 12);
  ctx.fillStyle = '#6B7280';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Ingresos', W - 114, 19);

  ctx.strokeStyle = '#C8A951';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(W - 130, 30); ctx.lineTo(W - 118, 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#6B7280';
  ctx.fillText('Ganancia', W - 114, 34);
}
```

### Modificar `cargarInvestors()` para llamar al gráfico:

Al final de la función `cargarInvestors()`, agregar:

```javascript
// Dibujar gráfico después de renderizar KPIs
const porDia7 = MESAIO.getAnaliticssPorDia(7);
dibujarGrafico(porDia7);
```

---

## MEJORA 4 — /entregables/ ACTUALIZADA

**Acción:** En `entregables/index.html`, reemplazar la lista de features con esta versión v2:

```html
<!-- Buscar la sección de features/checkpoints y reemplazar con: -->

<div style="max-width:680px; margin:0 auto;">
  
  <!-- Propuesta de valor -->
  <div style="background:linear-gradient(135deg, #5C1A2B, #7C2A3A); border-radius:16px; padding:28px; margin-bottom:24px; color:white; text-align:center;">
    <h2 style="font-family:'Playfair Display',serif; margin:0 0 8px;">Mesaio reemplaza 3 sistemas</h2>
    <p style="margin:0 0 20px; opacity:0.8;">Antes pagaban por separado:</p>
    <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap; margin-bottom:20px;">
      <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:10px 16px;">
        <div style="font-size:11px; opacity:0.7;">Sistema mesas</div>
        <div style="font-size:18px; font-weight:bold;">$80.000</div>
        <div style="font-size:10px; opacity:0.6;">/mes</div>
      </div>
      <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:10px 16px;">
        <div style="font-size:11px; opacity:0.7;">Contabilidad</div>
        <div style="font-size:18px; font-weight:bold;">$150.000</div>
        <div style="font-size:10px; opacity:0.6;">/mes</div>
      </div>
      <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:10px 16px;">
        <div style="font-size:11px; opacity:0.7;">Inventario</div>
        <div style="font-size:18px; font-weight:bold;">$120.000</div>
        <div style="font-size:10px; opacity:0.6;">/mes</div>
      </div>
    </div>
    <div style="font-size:28px; font-weight:bold; color:#C8A951;">= $350.000 / mes</div>
    <div style="font-size:14px; margin-top:8px; opacity:0.8;">Ahora todo en Mesaio · Sin backend · Sin servidor</div>
  </div>

  <!-- Checkpoints completados -->
  <h3 style="font-family:'Playfair Display',serif; color:#5C1A2B;">✅ 10 checkpoints entregados</h3>
  
  <div style="display:grid; gap:10px;">
    <!-- CP0 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Sistema de mesas en tiempo real</div>
        <div style="font-size:12px; color:#6B7280;">12 mesas · auto-refresh 5s · estados visuales</div>
      </div>
    </div>
    <!-- CP1 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Cocina KDS</div>
        <div style="font-size:12px; color:#6B7280;">Vista cocina · cambio de estados · notificaciones</div>
      </div>
    </div>
    <!-- CP2 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Menú digital</div>
        <div style="font-size:12px; color:#6B7280;">15 platos colombianos · categorías · disponibilidad en tiempo real</div>
      </div>
    </div>
    <!-- CP3 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Inventario automático</div>
        <div style="font-size:12px; color:#6B7280;">25 ingredientes · 15 recetas · descuento automático al marcar listo</div>
      </div>
    </div>
    <!-- CP4 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Facturación electrónica</div>
        <div style="font-size:12px; color:#6B7280;">CUFE · IVA 19% · propina sugerida · 3 métodos de pago</div>
      </div>
    </div>
    <!-- CP5 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Contabilidad en tiempo real</div>
        <div style="font-size:12px; color:#6B7280;">Ingresos · costos · ganancia neta · margen automático</div>
      </div>
    </div>
    <!-- CP6 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Arqueo de caja</div>
        <div style="font-size:12px; color:#6B7280;">Efectivo esperado vs reportado · discrepancia · histórico</div>
      </div>
    </div>
    <!-- CP7 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Cierre de día con acta</div>
        <div style="font-size:12px; color:#6B7280;">Acta formal · firma responsable · histórico imprimible</div>
      </div>
    </div>
    <!-- CP8 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Dashboard de inversores</div>
        <div style="font-size:12px; color:#6B7280;">KPIs históricos · gráfico de barras · 7/30/90 días · tendencias</div>
      </div>
    </div>
    <!-- CP9 -->
    <div style="background:#ECFDF5; border-radius:10px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:bold; color:#065F46;">Arquitectura AppCors-ready</div>
        <div style="font-size:12px; color:#6B7280;">localStorage hoy · API REST mañana · 1 línea de cambio</div>
      </div>
    </div>
  </div>
</div>
```

---

## MEJORA 5 — FIX NaN% EN INVESTORS

**En `admin/index.html`, función `cargarInvestors()`.**

Buscar el bloque `gridComp.innerHTML` y reemplazar las 3 líneas de "variación" con esta función helper:

```javascript
// Agregar ANTES de cargarInvestors():
function fmtVariacion(hoy, promedio) {
  if (promedio === 0 && hoy === 0) return '<span style="color:#9CA3AF;">—</span>';
  if (promedio === 0) return '<span style="color:#10B981;">📈 Nuevo</span>';
  const pct = ((hoy - promedio) / promedio * 100).toFixed(0);
  const color = pct >= 0 ? '#10B981' : '#EF4444';
  const signo = pct >= 0 ? '+' : '';
  return `<span style="color:${color}; font-weight:bold;">${signo}${pct}%</span>`;
}
```

Luego en `gridComp.innerHTML`, reemplazar las celdas de variación:

```javascript
// ANTES (genera NaN):
`${((hoy.ingresos - promedio.ingresos) / promedio.ingresos * 100).toFixed(0)}%`

// DESPUÉS (correcto):
fmtVariacion(hoy.ingresos, promedio.ingresos)
fmtVariacion(hoy.costos, promedio.costos)
fmtVariacion(hoy.ganancia, promedio.ganancia)
```

---

## GIT COMMIT

```bash
git add admin/index.html entregables/index.html
git commit -m "UX: Modal reposición + alerta header + gráfico barras + fix NaN + entregables v2"
git push origin main
```

---

## RESULTADO VISUAL POST-DEPLOY

| Antes | Después |
|-------|---------|
| `prompt("¿Cuántas unidades?")` feo | Modal burgundy branded con presets |
| Sin alerta stock en header | Badge rojo pulsante siempre visible |
| Investors solo tablas | Gráfico barras canvas + línea ganancia |
| /entregables/ desactualizada | Propuesta valor + 10 checkpoints v2 |
| NaN% en tabla comparativa | Variaciones correctas con colores |