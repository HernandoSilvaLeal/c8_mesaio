# SPEC COMPLEMENTARIO v2.2
## 3 fixes críticos para el demo

---

## FIX 1 — MODAL NUEVO PLATO (reemplazar "form pendiente")

En `admin/index.html`, agregar antes de `</body>`:

```html
<!-- MODAL NUEVO PLATO -->
<div id="modalNuevoPlato" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center;">
  <div style="background:#FAF6EE; border-radius:16px; padding:28px; width:420px; max-height:90vh; overflow-y:auto; border:2px solid #5C1A2B; box-shadow:0 20px 60px rgba(92,26,43,0.3);">
    
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h4 style="margin:0; color:#5C1A2B; font-family:'Playfair Display',serif;">+ Nuevo plato</h4>
      <button onclick="cerrarModalPlato()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#9CA3AF;">✕</button>
    </div>

    <div style="display:grid; gap:14px;">

      <div>
        <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px;">Nombre del plato *</label>
        <input id="platoNombre" type="text" placeholder="Ej: Bandeja paisa especial"
          style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; transition:border 0.2s;"
          onfocus="this.style.borderColor='#C8A951'" onblur="this.style.borderColor='#ddd'">
      </div>

      <div>
        <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px;">Descripción</label>
        <input id="platoDescripcion" type="text" placeholder="Ej: El clásico antioqueño completo"
          style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none;"
          onfocus="this.style.borderColor='#C8A951'" onblur="this.style.borderColor='#ddd'">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px;">Categoría *</label>
          <select id="platoCategoria"
            style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; background:white; box-sizing:border-box;">
            <option value="Entrada">Entrada</option>
            <option value="Fuerte">Fuerte</option>
            <option value="Postre">Postre</option>
            <option value="Bebida">Bebida</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px;">Precio (COP) *</label>
          <input id="platoPrecio" type="number" placeholder="42000" min="0"
            style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none;"
            onfocus="this.style.borderColor='#C8A951'" onblur="this.style.borderColor='#ddd'">
        </div>
      </div>

      <div style="background:#F9FAFB; border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-size:13px; font-weight:600; color:#374151;">Disponible en menú</div>
          <div style="font-size:11px; color:#9CA3AF;">El plato aparecerá para los meseros</div>
        </div>
        <div id="toggleDisponible" onclick="togglePlatoDisponible()" 
          style="width:44px; height:24px; background:#10B981; border-radius:12px; cursor:pointer; position:relative; transition:background 0.2s;">
          <div id="toggleCircle" style="width:20px; height:20px; background:white; border-radius:50%; position:absolute; top:2px; right:2px; transition:right 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
        </div>
      </div>

    </div>

    <div style="display:flex; gap:8px; margin-top:20px;">
      <button onclick="cerrarModalPlato()" style="flex:1; padding:11px; background:white; border:2px solid #ddd; border-radius:8px; cursor:pointer; font-weight:600; color:#6B7280;">Cancelar</button>
      <button onclick="guardarNuevoPlato()" style="flex:2; padding:11px; background:#5C1A2B; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:14px;">✓ Guardar plato</button>
    </div>
  </div>
</div>
```

### JS del modal plato — agregar al script de admin:

```javascript
let platoDisponible = true;

function abrirModalPlato() {
  document.getElementById('platoNombre').value = '';
  document.getElementById('platoDescripcion').value = '';
  document.getElementById('platoPrecio').value = '';
  document.getElementById('platoCategoria').value = 'Fuerte';
  platoDisponible = true;
  document.getElementById('toggleDisponible').style.background = '#10B981';
  document.getElementById('toggleCircle').style.right = '2px';
  document.getElementById('modalNuevoPlato').style.display = 'flex';
  setTimeout(() => document.getElementById('platoNombre').focus(), 100);
}

function cerrarModalPlato() {
  document.getElementById('modalNuevoPlato').style.display = 'none';
}

function togglePlatoDisponible() {
  platoDisponible = !platoDisponible;
  const tog = document.getElementById('toggleDisponible');
  const circle = document.getElementById('toggleCircle');
  tog.style.background = platoDisponible ? '#10B981' : '#D1D5DB';
  circle.style.right = platoDisponible ? '2px' : '22px';
}

function guardarNuevoPlato() {
  const nombre = document.getElementById('platoNombre').value.trim();
  const precio = parseInt(document.getElementById('platoPrecio').value);

  if (!nombre) {
    document.getElementById('platoNombre').style.borderColor = '#EF4444';
    MESAIO.toast('⚠️ El nombre es obligatorio', 'warning');
    return;
  }
  if (!precio || precio < 1000) {
    document.getElementById('platoPrecio').style.borderColor = '#EF4444';
    MESAIO.toast('⚠️ Ingresa un precio válido', 'warning');
    return;
  }

  const platos = JSON.parse(localStorage.getItem('mesaio_platos') || '[]');
  const nuevoId = Math.max(...platos.map(p => p.id), 0) + 1;

  platos.push({
    id: nuevoId,
    nombre,
    descripcion: document.getElementById('platoDescripcion').value.trim(),
    categoria: document.getElementById('platoCategoria').value,
    precio,
    disponible: platoDisponible
  });

  localStorage.setItem('mesaio_platos', JSON.stringify(platos));
  MESAIO.toast(`✓ "${nombre}" agregado al menú`, 'success');
  cerrarModalPlato();
  cargarPlatos();
}
```

### Conectar el botón "+ NUEVO PLATO" al modal:

Buscar en admin/index.html el botón que dice `+ Nuevo plato` o `NUEVO PLATO` y cambiar su onclick:

```html
<!-- ANTES (lo que sea que tenga) -->
<button onclick="...pendiente...">+ Nuevo plato</button>

<!-- DESPUÉS -->
<button onclick="abrirModalPlato()" style="padding:8px 16px; background:#C8A951; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">+ Nuevo plato</button>
```

---

## FIX 2 — MODAL CONFIRMACIÓN CIERRE (reemplazar confirm() del browser)

En `admin/index.html`, agregar antes de `</body>`:

```html
<!-- MODAL CONFIRMAR CIERRE -->
<div id="modalConfirmarCierre" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center;">
  <div style="background:#FAF6EE; border-radius:16px; padding:28px; width:380px; border:2px solid #5C1A2B; box-shadow:0 20px 60px rgba(92,26,43,0.3);">

    <div style="text-align:center; margin-bottom:20px;">
      <div style="width:56px; height:56px; background:#FEF2F2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
        <svg width="28" height="28" fill="none" stroke="#5C1A2B" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <h4 style="margin:0 0 6px; color:#5C1A2B; font-family:'Playfair Display',serif;">¿Cerrar el día?</h4>
      <p style="margin:0; font-size:13px; color:#6B7280; line-height:1.5;">
        Se generará el acta oficial de cierre.<br>
        Esta acción registra el turno de <strong id="cierreNombreConfirm" style="color:#5C1A2B;"></strong>.
      </p>
    </div>

    <!-- Resumen rápido antes de confirmar -->
    <div style="background:white; border-radius:10px; padding:14px; margin-bottom:20px; border:1px solid #E5E7EB;">
      <div style="font-size:11px; color:#9CA3AF; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em;">Resumen del día</div>
      <div style="display:flex; justify-content:space-between; margin:4px 0;">
        <span style="font-size:13px; color:#374151;">Ingresos</span>
        <span id="cierreResumenIngresos" style="font-size:13px; font-weight:bold; color:#10B981;"></span>
      </div>
      <div style="display:flex; justify-content:space-between; margin:4px 0;">
        <span style="font-size:13px; color:#374151;">Ganancia neta</span>
        <span id="cierreResumenGanancia" style="font-size:13px; font-weight:bold; color:#3B82F6;"></span>
      </div>
      <div style="display:flex; justify-content:space-between; margin:4px 0;">
        <span style="font-size:13px; color:#374151;">Órdenes procesadas</span>
        <span id="cierreResumenOrdenes" style="font-size:13px; font-weight:bold; color:#5C1A2B;"></span>
      </div>
    </div>

    <div style="display:flex; gap:8px;">
      <button onclick="cerrarModalConfirmarCierre()" 
        style="flex:1; padding:12px; background:white; border:2px solid #ddd; border-radius:8px; cursor:pointer; font-weight:600; color:#6B7280;">
        Cancelar
      </button>
      <button onclick="ejecutarCierreDia()"
        style="flex:2; padding:12px; background:#5C1A2B; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:14px;">
        🔐 Sí, cerrar día
      </button>
    </div>
  </div>
</div>
```

### JS — reemplazar función `generarCierre()`:

```javascript
function generarCierre() {
  const responsable = document.getElementById('cierreResponsable').value.trim();
  if (!responsable) {
    document.getElementById('cierreResponsable').style.borderColor = '#EF4444';
    MESAIO.toast('⚠️ Ingresa tu nombre', 'warning');
    return;
  }

  // Mostrar resumen en el modal de confirmación
  const cierre = MESAIO.getCierreCaja();
  document.getElementById('cierreNombreConfirm').textContent = responsable;
  document.getElementById('cierreResumenIngresos').textContent = MESAIO.fmtCOP(cierre.ingresos);
  document.getElementById('cierreResumenGanancia').textContent = MESAIO.fmtCOP(cierre.neto);
  document.getElementById('cierreResumenOrdenes').textContent = cierre.ordenes_count + ' órdenes';

  document.getElementById('modalConfirmarCierre').style.display = 'flex';
}

function cerrarModalConfirmarCierre() {
  document.getElementById('modalConfirmarCierre').style.display = 'none';
}

function ejecutarCierreDia() {
  const responsable = document.getElementById('cierreResponsable').value.trim();
  const notas = document.getElementById('cierreNotas').value.trim();
  const registro = MESAIO.generarCierreDia(responsable, notas);
  cerrarModalConfirmarCierre();
  MESAIO.toast('✓ Día cerrado · Acta generada', 'success');
  cargarCierre();
}
```

---

## FIX 3 — BOTÓN DEMO DATA EN DASHBOARD

**Problema:** No hay forma visual de generar datos de prueba para mostrar facturación y contabilidad llenas.

En `admin/index.html`, dentro del pane `pane-dashboard`, agregar AL INICIO (antes de las cards KPI):

```html
<!-- BANNER DEMO — solo visible si no hay facturas -->
<div id="bannerDemo" style="background:linear-gradient(135deg, #5C1A2B, #7C2A3A); border-radius:14px; padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
  <div style="color:white;">
    <div style="font-family:'Playfair Display',serif; font-size:16px; font-weight:bold; margin-bottom:4px;">🎭 Sin datos de operación</div>
    <div style="font-size:12px; opacity:0.8;">Carga 7 días simulados para ver el sistema completo en acción</div>
  </div>
  <button onclick="ejecutarDemoData()" 
    style="padding:10px 20px; background:#C8A951; color:white; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; white-space:nowrap; flex-shrink:0;">
    🚀 Cargar demo (7 días)
  </button>
</div>
```

### JS del banner demo:

```javascript
function ejecutarDemoData() {
  const btn = event.target;
  btn.textContent = '⏳ Cargando...';
  btn.disabled = true;

  setTimeout(() => {
    const resultado = MESAIO.cargarDemoData();
    MESAIO.toast(`✓ ${resultado.facturas} facturas · ${resultado.cierres} cierres · 7 días`, 'success');
    document.getElementById('bannerDemo').style.display = 'none';
    // Refrescar dashboard
    if (typeof cargarDashboard === 'function') cargarDashboard();
  }, 300);
}

// Mostrar u ocultar banner al cargar
function evaluarBannerDemo() {
  const banner = document.getElementById('bannerDemo');
  if (!banner) return;
  banner.style.display = MESAIO.getFacturas().length === 0 ? 'flex' : 'none';
}

// Llamar al init
evaluarBannerDemo();
```

---

## RESUMEN ARCHIVOS A TOCAR

```
admin/index.html:
  1. Agregar HTML modal #modalNuevoPlato antes de </body>
  2. Agregar HTML modal #modalConfirmarCierre antes de </body>
  3. Agregar HTML #bannerDemo dentro de pane-dashboard al inicio
  4. Agregar JS: abrirModalPlato, cerrarModalPlato, togglePlatoDisponible, guardarNuevoPlato
  5. Agregar JS: generarCierre (REEMPLAZAR función existente), cerrarModalConfirmarCierre, ejecutarCierreDia
  6. Agregar JS: ejecutarDemoData, evaluarBannerDemo
  7. Cambiar onclick del botón "+ Nuevo plato" → abrirModalPlato()
```

## GIT COMMIT

```bash
git add admin/index.html
git commit -m "UX: Modal nuevo plato + modal confirmar cierre + banner demo data"
git push origin main
```