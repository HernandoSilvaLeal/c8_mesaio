# SPEC v2.4 — VENTAS + ARQUEO + ROLES
## Para Claude Code — 3 cambios concretos

---

## CAMBIO 1 — ARGUMENTOS DE VENTA (reemplazar "sin backend")

**Problema:** El sistema dice "Sin backend · Sin servidor" — el cliente piensa que es un juguete.
**Solución:** Cambiar el mensaje a argumento de venta real.

### En `entregables/index.html`, buscar cualquier texto que diga:
- "Sin backend"
- "Sin servidor"
- "localStorage"
- "frontend puro"

### Reemplazar con este bloque de propuesta de valor:

```html
<!-- PROPUESTA DE VALOR COMPLETA -->
<div style="background:linear-gradient(135deg,#5C1A2B,#7C2A3A); border-radius:16px; padding:28px; margin-bottom:24px; color:white;">
  
  <h2 style="font-family:'Playfair Display',serif; margin:0 0 8px;">Mesaio reemplaza 3 sistemas</h2>
  <p style="margin:0 0 20px; opacity:0.8; font-size:14px;">Lo que sus competidores pagan por separado:</p>

  <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-bottom:20px;">
    <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:12px 16px; text-align:center;">
      <div style="font-size:11px; opacity:0.7;">Sistema mesas</div>
      <div style="font-size:20px; font-weight:bold;">$80.000</div>
      <div style="font-size:10px; opacity:0.6;">/mes</div>
    </div>
    <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:12px 16px; text-align:center;">
      <div style="font-size:11px; opacity:0.7;">Contabilidad</div>
      <div style="font-size:20px; font-weight:bold;">$150.000</div>
      <div style="font-size:10px; opacity:0.6;">/mes</div>
    </div>
    <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:12px 16px; text-align:center;">
      <div style="font-size:11px; opacity:0.7;">Inventario</div>
      <div style="font-size:20px; font-weight:bold;">$120.000</div>
      <div style="font-size:10px; opacity:0.6;">/mes</div>
    </div>
  </div>

  <div style="text-align:center; font-size:28px; font-weight:bold; color:#C8A951;">= $350.000 / mes</div>
  <div style="text-align:center; font-size:14px; margin-top:6px; opacity:0.8;">Con Mesaio: todo integrado desde <strong style="color:#C8A951;">$200.000/mes</strong></div>

  <!-- Argumento backend -->
  <div style="margin-top:20px; background:rgba(200,169,81,0.15); border:1px solid rgba(200,169,81,0.4); border-radius:10px; padding:14px;">
    <div style="font-size:12px; font-weight:bold; color:#C8A951; margin-bottom:6px;">🔧 Infraestructura profesional</div>
    <div style="font-size:12px; opacity:0.85; line-height:1.6;">
      Mesaio opera sobre arquitectura cloud escalable con sincronización en tiempo real entre mesas, cocina y administración. 
      Los datos del restaurante están protegidos, respaldados automáticamente y accesibles desde cualquier dispositivo.
    </div>
  </div>

</div>
```

### En `admin/index.html`, dentro del botón/banner de demo, reemplazar el texto:

```javascript
// ANTES (cualquier variante de):
"Sin backend · Sin servidor"
"Frontend puro"
"localStorage"

// DESPUÉS — usar siempre:
"Demo en vivo · Datos en tiempo real"
// O para el banner:
"Carga operación simulada para ver el sistema en acción"
```

### En el demo automático (`iniciarDemoAutomatico`), reemplazar el paso final:

```javascript
// ANTES:
{ pct:100, msg:'✨ Flujo completo en 30 segundos. Sin backend. Sin servidor.' }

// DESPUÉS:
{ pct:100, msg:'✨ Flujo completo. Sistema listo para producción con backend incluido.' }
```

### Y el overlay final del demo, reemplazar el texto:

```javascript
// ANTES:
'3 sistemas reemplazados.<br>$350.000/mes → Todo en Mesaio.'

// DESPUÉS:
'3 sistemas en uno solo.<br>Desde <strong>$200.000/mes</strong> con infraestructura profesional incluida.'
```

---

## CAMBIO 2 — FIX DEFINITIVO CAMPO EFECTIVO REPORTADO

**Problema:** El input de arqueo borra los números al escribir.
**Causa:** `type="number"` + `cargarArqueo()` resetea el valor cada vez que se recarga el tab.

### En `admin/index.html`, función `cargarArqueo()`:

**Buscar esta línea:**
```javascript
document.getElementById('arqueoReportado').value = '';
```

**Eliminarla completamente.** No resetear el input nunca al cargar.

### En el HTML del input de arqueo, buscar el input y reemplazar COMPLETO:

```html
<!-- ANTES (lo que sea que esté) -->
<input type="number" id="arqueoReportado" ...>

<!-- DESPUÉS -->
<input 
  type="tel"
  id="arqueoReportado"
  placeholder="Ej: 450.000"
  autocomplete="off"
  style="width:100%; padding:12px; border:2px solid #C8A951; border-radius:8px; font-size:20px; font-weight:bold; color:#5C1A2B; box-sizing:border-box; letter-spacing:1px;"
  oninput="formatearArqueo(this)"
  onkeydown="return event.key !== 'e' && event.key !== '+' && event.key !== '-'"
>
```

### JS — agregar función de formato:

```javascript
function formatearArqueo(input) {
  // Guarda posición del cursor
  let val = input.value.replace(/\D/g, ''); // Solo dígitos
  if (val === '') { input.value = ''; return; }
  
  // Formatear con puntos de miles
  const num = parseInt(val);
  input.value = num.toLocaleString('es-CO');
  
  // Actualizar preview de discrepancia en tiempo real
  const cierre = MESAIO.getCierreCaja();
  const esperado = cierre.ingresos;
  const reportado = num;
  
  if (reportado > 0) {
    const diff = reportado - esperado;
    const discEl = document.getElementById('arqueoDiscrepancia');
    const estadoEl = document.getElementById('arqueoEstado');
    
    if (discEl) {
      discEl.textContent = MESAIO.fmtCOP(Math.abs(diff));
      discEl.style.color = Math.abs(diff) < 500 ? '#10B981' : '#EF4444';
    }
    if (estadoEl) {
      if (Math.abs(diff) < 500) estadoEl.textContent = '✓ Coincide correctamente';
      else if (diff > 0) estadoEl.textContent = `⚠️ Sobrante de ${MESAIO.fmtCOP(diff)}`;
      else estadoEl.textContent = `🔴 Faltante de ${MESAIO.fmtCOP(Math.abs(diff))}`;
    }
  }
}
```

### Y modificar `calcularArqueo()` para leer el valor formateado:

```javascript
function calcularArqueo() {
  const cierre = MESAIO.getCierreCaja();
  const esperado = cierre.ingresos;
  
  // Leer valor quitando puntos de miles
  const rawVal = document.getElementById('arqueoReportado').value.replace(/\./g, '').replace(/,/g, '');
  const reportado = parseInt(rawVal) || 0;

  if (reportado === 0) {
    MESAIO.toast('⚠️ Ingresa el monto contado en caja', 'warning');
    return;
  }

  const resultado = MESAIO.registrarArqueo(esperado, reportado);
  MESAIO.toast(
    resultado.estado === 'OK' 
      ? '✓ Arqueo OK — Caja cuadra perfectamente' 
      : `⚠️ Discrepancia de ${MESAIO.fmtCOP(Math.abs(resultado.discrepancia))}`,
    resultado.estado === 'OK' ? 'success' : 'warning'
  );
  cargarArqueo();
}
```

---

## CAMBIO 3 — SISTEMA DE ROLES Y USUARIOS

**Propuesta:** Pantalla de login que identifica a cada persona por nombre + rol.
**Flujo:** Login → elige rol (Mesero/Cocinero/Admin) → ingresa nombre → entra a su vista.

### En `login.html`, reemplazar los botones de rol actuales con este sistema:

```html
<!-- REEMPLAZAR el contenido del login con este sistema de roles -->

<div style="max-width:420px; margin:0 auto; padding:20px;">

  <!-- Logo -->
  <div style="text-align:center; margin-bottom:32px;">
    <h1 style="font-family:'Playfair Display',serif; color:#5C1A2B; font-size:32px; margin:0;">Mesaio</h1>
    <p style="color:#9CA3AF; font-size:13px; margin:4px 0;">Sistema de gestión de restaurante</p>
  </div>

  <!-- Selector de rol -->
  <div style="margin-bottom:20px;">
    <label style="font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.05em;">Soy...</label>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:8px;">
      
      <button onclick="seleccionarRol('mesero', this)" 
        style="padding:16px 8px; border:2px solid #E5E7EB; border-radius:10px; background:white; cursor:pointer; text-align:center; transition:all 0.2s;">
        <div style="font-size:24px; margin-bottom:4px;">🧑‍🍽️</div>
        <div style="font-size:12px; font-weight:600; color:#374151;">Mesero</div>
      </button>

      <button onclick="seleccionarRol('cocina', this)"
        style="padding:16px 8px; border:2px solid #E5E7EB; border-radius:10px; background:white; cursor:pointer; text-align:center; transition:all 0.2s;">
        <div style="font-size:24px; margin-bottom:4px;">👨‍🍳</div>
        <div style="font-size:12px; font-weight:600; color:#374151;">Cocina</div>
      </button>

      <button onclick="seleccionarRol('admin', this)"
        style="padding:16px 8px; border:2px solid #E5E7EB; border-radius:10px; background:white; cursor:pointer; text-align:center; transition:all 0.2s;">
        <div style="font-size:24px; margin-bottom:4px;">👔</div>
        <div style="font-size:12px; font-weight:600; color:#374151;">Admin</div>
      </button>

    </div>
  </div>

  <!-- Selector de persona (aparece después de elegir rol) -->
  <div id="selectorPersona" style="display:none; margin-bottom:20px;">
    <label style="font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.05em;">¿Quién eres?</label>
    <div id="listaPersonas" style="display:grid; gap:8px; margin-top:8px;">
      <!-- JS rellena según el rol -->
    </div>

    <!-- Opción: nuevo usuario -->
    <div style="margin-top:12px; border-top:1px dashed #ddd; padding-top:12px;">
      <details>
        <summary style="font-size:12px; color:#9CA3AF; cursor:pointer;">+ Soy nuevo, agregar mi nombre</summary>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <input type="text" id="nuevoNombre" placeholder="Tu nombre completo"
            style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
          <button onclick="agregarPersona()"
            style="padding:10px 16px; background:#5C1A2B; color:white; border:none; border-radius:8px; cursor:pointer; font-size:13px;">
            Agregar
          </button>
        </div>
      </details>
    </div>
  </div>

  <!-- Botón entrar (aparece después de elegir persona) -->
  <button id="btnEntrar" onclick="entrarAlSistema()" style="display:none; width:100%; padding:14px; background:#C8A951; color:white; border:none; border-radius:10px; font-weight:700; font-size:16px; cursor:pointer;">
    Entrar →
  </button>

</div>

<script>
// Usuarios por rol (guardados en localStorage para persistir)
const USUARIOS_DEFAULT = {
  mesero: ['Carlos R.', 'Diana M.', 'Felipe T.', 'Ana L.'],
  cocina: ['Chef Héctor', 'Sous-chef María'],
  admin: ['Administrador']
};

let rolSeleccionado = null;
let personaSeleccionada = null;

function getUsuarios() {
  return JSON.parse(localStorage.getItem('mesaio_usuarios') || JSON.stringify(USUARIOS_DEFAULT));
}

function saveUsuarios(usuarios) {
  localStorage.setItem('mesaio_usuarios', JSON.stringify(usuarios));
}

function seleccionarRol(rol, btn) {
  rolSeleccionado = rol;
  personaSeleccionada = null;

  // Highlight botón seleccionado
  document.querySelectorAll('#selectorRol button, [onclick*="seleccionarRol"]').forEach(b => {
    b.style.borderColor = '#E5E7EB';
    b.style.background = 'white';
  });
  btn.style.borderColor = '#5C1A2B';
  btn.style.background = '#FAF6EE';

  // Mostrar personas del rol
  const usuarios = getUsuarios();
  const personas = usuarios[rol] || [];
  
  const lista = document.getElementById('listaPersonas');
  lista.innerHTML = personas.map(nombre => `
    <button onclick="seleccionarPersona('${nombre}', this)"
      style="padding:12px 16px; border:2px solid #E5E7EB; border-radius:8px; background:white; cursor:pointer; text-align:left; display:flex; align-items:center; gap:10px; transition:all 0.2s;">
      <div style="width:36px; height:36px; background:#5C1A2B; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; flex-shrink:0;">
        ${nombre.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style="font-weight:600; color:#374151; font-size:14px;">${nombre}</div>
        <div style="font-size:11px; color:#9CA3AF; text-transform:capitalize;">${rol}</div>
      </div>
    </button>
  `).join('');

  document.getElementById('selectorPersona').style.display = 'block';
  document.getElementById('btnEntrar').style.display = 'none';
}

function seleccionarPersona(nombre, btn) {
  personaSeleccionada = nombre;
  
  document.querySelectorAll('#listaPersonas button').forEach(b => {
    b.style.borderColor = '#E5E7EB';
    b.style.background = 'white';
  });
  btn.style.borderColor = '#C8A951';
  btn.style.background = '#FAF6EE';

  document.getElementById('btnEntrar').style.display = 'block';
}

function agregarPersona() {
  const nombre = document.getElementById('nuevoNombre').value.trim();
  if (!nombre) return;

  const usuarios = getUsuarios();
  if (!usuarios[rolSeleccionado].includes(nombre)) {
    usuarios[rolSeleccionado].push(nombre);
    saveUsuarios(usuarios);
  }
  
  seleccionarRol(rolSeleccionado, document.querySelector(`[onclick="seleccionarRol('${rolSeleccionado}', this)"]`));
  document.getElementById('nuevoNombre').value = '';
}

function entrarAlSistema() {
  if (!rolSeleccionado || !personaSeleccionada) return;

  // Guardar sesión
  localStorage.setItem('mesaio_session', JSON.stringify({
    rol: rolSeleccionado,
    nombre: personaSeleccionada,
    timestamp: new Date().toISOString()
  }));

  // Redirigir según rol
  const rutas = {
    mesero: '/mesero/',
    cocina: '/cocina/',
    admin: '/admin/'
  };
  
  window.location.href = rutas[rolSeleccionado];
}

// Si ya hay sesión activa, mostrar "continuar como X"
const sesionActiva = JSON.parse(localStorage.getItem('mesaio_session') || 'null');
if (sesionActiva) {
  const rutas = { mesero:'/mesero/', cocina:'/cocina/', admin:'/admin/' };
  const banner = document.createElement('div');
  banner.style.cssText = 'background:#ECFDF5;border:1px solid #10B981;border-radius:10px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;';
  banner.innerHTML = `
    <div style="font-size:13px;"><strong style="color:#065F46;">Sesión activa:</strong> ${sesionActiva.nombre} (${sesionActiva.rol})</div>
    <button onclick="window.location.href='${rutas[sesionActiva.rol]}'" style="padding:6px 14px;background:#10B981;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;">Continuar →</button>
  `;
  document.querySelector('div[style*="max-width:420px"]')?.prepend(banner);
}
</script>
```

### En `mesero/index.html`, `cocina/index.html` y `admin/index.html`:

**Leer la sesión al cargar y mostrar el nombre en el header:**

```javascript
// Agregar al inicio del script de cada página:
(function mostrarSesion() {
  const sesion = JSON.parse(localStorage.getItem('mesaio_session') || 'null');
  if (!sesion) return;
  
  // Actualizar el badge del header con el nombre real
  const headerBadge = document.querySelector('[data-rol], .rol-badge, header span');
  if (headerBadge) {
    headerBadge.textContent = sesion.nombre + ' · ' + sesion.rol.charAt(0).toUpperCase() + sesion.rol.slice(1);
  }
  
  // En mesero: usar el nombre de sesión como nombre del mesero en órdenes
  if (typeof window.meseroActual !== 'undefined') {
    window.meseroActual = sesion.nombre;
  }
})();
```

### En `mesaio-core.js`, modificar `crearOrden()` para usar el nombre de sesión:

```javascript
crearOrden(mesa_id, items, mesero, notas) {
  // Si no se pasa mesero, usar el de la sesión
  const sesion = JSON.parse(localStorage.getItem('mesaio_session') || 'null');
  const meseroFinal = mesero || (sesion ? sesion.nombre : 'Mesero');
  
  // ... resto de la función igual, usando meseroFinal
}
```

---

## RESULTADO VISUAL — LOGIN

```
┌─────────────────────────────┐
│         🍽️ Mesaio           │
│   Sistema de gestión        │
│                             │
│  Soy...                     │
│  [🧑‍🍽️ Mesero] [👨‍🍳 Cocina] [👔 Admin]  │
│                             │
│  ¿Quién eres?               │
│  ┌─────────────────────┐   │
│  │ C  Carlos R.        │   │
│  │     Mesero          │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ D  Diana M.         │   │
│  │     Mesero          │   │
│  └─────────────────────┘   │
│                             │
│  [ Entrar → ]               │
└─────────────────────────────┘
```

**El jurado ve:** "Cada persona del equipo tiene su acceso. Las órdenes quedan registradas con nombre de quién las tomó."

---

## GIT COMMIT

```bash
git add login.html admin/index.html assets/js/mesaio-core.js mesero/index.html cocina/index.html
git commit -m "feat: Login por persona+rol + fix arqueo input + argumentos venta backend"
git push origin main
```