# SUPER_SPEC_MESAIO_v1.md
## Instrucciones exactas para Claude Code · UNA SOLA PASADA
## Hackathon · MVP Restaurante · Mesaio
## Fecha: 2026-05-03

---

> **INSTRUCCIÓN PARA CLAUDE CODE:** Este documento es tu única fuente de verdad.
> Ejecútalo secuencialmente. No preguntes. No debatas. Construye.
> Todo el código es copy-paste. Los archivos destino son exactos.
> Cuando termines cada checkpoint, haz `git add . && git commit -m "CPx" && git push`.

---

## CHECKPOINT 0 — SCHEMA SQL SUPABASE (5 min)

Crear archivo `MVP_RESTAURANTE/sql/schema.sql` con este contenido EXACTO.
Nando lo ejecutará manualmente en Supabase SQL Editor.

```sql
-- ═══════════════════════════════════════════
-- MESAIO · Schema Supabase · Hackathon 2026
-- ═══════════════════════════════════════════

-- 1. USUARIOS (extiende Supabase Auth)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin','mesero','cocinero')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MESAS
CREATE TABLE IF NOT EXISTS mesas (
  id SERIAL PRIMARY KEY,
  numero INT UNIQUE NOT NULL,
  capacidad INT NOT NULL DEFAULT 4,
  estado TEXT NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre','ocupada','cobro')),
  ubicacion TEXT DEFAULT 'salón'
);

-- 3. PLATOS
CREATE TABLE IF NOT EXISTS platos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('entrada','fuerte','postre','bebida')),
  precio INT NOT NULL,
  disponible BOOLEAN DEFAULT true,
  descripcion TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ORDENES
CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  mesa_id INT REFERENCES mesas(id),
  mesero_nombre TEXT NOT NULL DEFAULT 'Demo',
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','preparando','listo','entregado','cobrado','cancelado')),
  total INT DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ORDEN_ITEMS
CREATE TABLE IF NOT EXISTS orden_items (
  id SERIAL PRIMARY KEY,
  orden_id INT REFERENCES ordenes(id) ON DELETE CASCADE,
  plato_id INT REFERENCES platos(id),
  plato_nombre TEXT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario INT NOT NULL,
  subtotal INT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════

-- 12 Mesas
INSERT INTO mesas (numero, capacidad, ubicacion) VALUES
(1,2,'barra'),(2,4,'salón'),(3,4,'salón'),(4,6,'salón'),
(5,2,'terraza'),(6,4,'terraza'),(7,4,'salón'),(8,8,'privado'),
(9,4,'terraza'),(10,2,'barra'),(11,6,'salón'),(12,4,'terraza')
ON CONFLICT (numero) DO NOTHING;

-- 15 Platos colombianos
INSERT INTO platos (nombre, categoria, precio, disponible, descripcion) VALUES
('Empanadas de carne',    'entrada', 12000, true, 'Crujientes empanadas con ají'),
('Ajiaco santafereño',    'entrada', 36000, true, 'Sopa bogotana con pollo, papa y guascas'),
('Patacones con hogao',   'entrada', 15000, true, 'Plátano verde frito con salsa criolla'),
('Bandeja paisa',         'fuerte',  42000, true, 'El clásico antioqueño completo'),
('Lomo al trapo',         'fuerte',  58000, true, 'Lomo de res envuelto en tela, cocción lenta'),
('Cazuela de mariscos',   'fuerte',  62000, true, 'Mariscos frescos en salsa criolla'),
('Mojarra frita',         'fuerte',  45000, true, 'Pescado entero frito con patacón'),
('Pollo a la brasa',      'fuerte',  38000, true, 'Pollo marinado a las brasas con yuca'),
('Chuleta valluna',       'fuerte',  44000, true, 'Chuleta apanada gigante con arroz'),
('Tres leches',           'postre',  18000, true, 'Bizcocho húmedo de tres leches'),
('Cuajada con melao',     'postre',  14000, true, 'Queso fresco con miel de panela'),
('Arroz con leche',       'postre',  12000, true, 'Cremoso arroz con leche y canela'),
('Limonada de coco',      'bebida',   9000, true, 'Refrescante limonada con coco rallado'),
('Jugo de lulo',          'bebida',   8000, true, 'Jugo natural de lulo bien frío'),
('Agua de panela con limón','bebida', 6000, true, 'Tradicional bebida colombiana')
ON CONFLICT DO NOTHING;

-- 3 Usuarios demo
INSERT INTO usuarios (email, nombre, rol) VALUES
('admin@mesaio.co',   'Chef Administrador', 'admin'),
('mesero@mesaio.co',  'Carlos Ramírez',     'mesero'),
('cocina@mesaio.co',  'María Posada',       'cocinero')
ON CONFLICT (email) DO NOTHING;

-- RLS básico (todo público para demo)
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_all" ON mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON platos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON ordenes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON orden_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON usuarios FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ordenes;
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;
```

---

## CHECKPOINT 1 — MÓDULO JS COMPARTIDO (10 min)

Crear archivo `MVP_RESTAURANTE/assets/js/mesaio-core.js`

Este es el ÚNICO archivo JS que todas las páginas cargan. Contiene:
- Init Supabase
- Storage (Supabase con fallback LocalStorage)
- Helpers compartidos

```javascript
// ═══════════════════════════════════════════
// MESAIO CORE · Módulo compartido
// ═══════════════════════════════════════════

const MESAIO = {
  // ── Supabase Config ──
  SB_URL: 'https://TU_PROYECTO.supabase.co',
  SB_KEY: 'TU_ANON_KEY',
  sb: null,
  useLocal: true, // true = LocalStorage demo · false = Supabase real

  // ── Init ──
  async init() {
    // Intentar Supabase
    if (window.supabase && this.SB_URL !== 'https://TU_PROYECTO.supabase.co') {
      try {
        this.sb = window.supabase.createClient(this.SB_URL, this.SB_KEY);
        this.useLocal = false;
        console.log('✅ Supabase conectado');
      } catch(e) {
        console.warn('⚠️ Supabase falló, usando LocalStorage', e);
        this.useLocal = true;
      }
    } else {
      console.log('📦 Modo demo — LocalStorage');
      this.useLocal = true;
    }
    this._initLocalData();
  },

  // ── LocalStorage seed ──
  _initLocalData() {
    if (localStorage.getItem('mesaio_mesas')) return;
    
    const mesas = [];
    for (let i = 1; i <= 12; i++) {
      mesas.push({ id: i, numero: i, capacidad: i === 8 ? 8 : (i <= 2 || i === 10 ? 2 : (i === 4 || i === 11 ? 6 : 4)), estado: 'libre', ubicacion: [1,10].includes(i) ? 'barra' : [5,6,9,12].includes(i) ? 'terraza' : i === 8 ? 'privado' : 'salón' });
    }
    localStorage.setItem('mesaio_mesas', JSON.stringify(mesas));

    const platos = [
      { id:1, nombre:'Empanadas de carne', categoria:'entrada', precio:12000, disponible:true },
      { id:2, nombre:'Ajiaco santafereño', categoria:'entrada', precio:36000, disponible:true },
      { id:3, nombre:'Patacones con hogao', categoria:'entrada', precio:15000, disponible:true },
      { id:4, nombre:'Bandeja paisa', categoria:'fuerte', precio:42000, disponible:true },
      { id:5, nombre:'Lomo al trapo', categoria:'fuerte', precio:58000, disponible:true },
      { id:6, nombre:'Cazuela de mariscos', categoria:'fuerte', precio:62000, disponible:true },
      { id:7, nombre:'Mojarra frita', categoria:'fuerte', precio:45000, disponible:true },
      { id:8, nombre:'Pollo a la brasa', categoria:'fuerte', precio:38000, disponible:true },
      { id:9, nombre:'Chuleta valluna', categoria:'fuerte', precio:44000, disponible:true },
      { id:10, nombre:'Tres leches', categoria:'postre', precio:18000, disponible:true },
      { id:11, nombre:'Cuajada con melao', categoria:'postre', precio:14000, disponible:true },
      { id:12, nombre:'Arroz con leche', categoria:'postre', precio:12000, disponible:true },
      { id:13, nombre:'Limonada de coco', categoria:'bebida', precio:9000, disponible:true },
      { id:14, nombre:'Jugo de lulo', categoria:'bebida', precio:8000, disponible:true },
      { id:15, nombre:'Agua de panela con limón', categoria:'bebida', precio:6000, disponible:true },
    ];
    localStorage.setItem('mesaio_platos', JSON.stringify(platos));
    localStorage.setItem('mesaio_ordenes', JSON.stringify([]));
    localStorage.setItem('mesaio_orden_counter', '0');
  },

  // ── CRUD Genérico ──
  async getMesas() {
    if (this.useLocal) return JSON.parse(localStorage.getItem('mesaio_mesas') || '[]');
    const { data } = await this.sb.from('mesas').select('*').order('numero');
    return data || [];
  },

  async updateMesa(id, campos) {
    if (this.useLocal) {
      let m = JSON.parse(localStorage.getItem('mesaio_mesas') || '[]');
      m = m.map(x => x.id === id ? { ...x, ...campos } : x);
      localStorage.setItem('mesaio_mesas', JSON.stringify(m));
      return;
    }
    await this.sb.from('mesas').update(campos).eq('id', id);
  },

  async getPlatos(categoria) {
    if (this.useLocal) {
      let p = JSON.parse(localStorage.getItem('mesaio_platos') || '[]');
      if (categoria) p = p.filter(x => x.categoria === categoria);
      return p.filter(x => x.disponible);
    }
    let q = this.sb.from('platos').select('*').eq('disponible', true);
    if (categoria) q = q.eq('categoria', categoria);
    const { data } = await q.order('nombre');
    return data || [];
  },

  async getAllPlatos() {
    if (this.useLocal) return JSON.parse(localStorage.getItem('mesaio_platos') || '[]');
    const { data } = await this.sb.from('platos').select('*').order('id');
    return data || [];
  },

  async togglePlato(id) {
    if (this.useLocal) {
      let p = JSON.parse(localStorage.getItem('mesaio_platos') || '[]');
      p = p.map(x => x.id === id ? { ...x, disponible: !x.disponible } : x);
      localStorage.setItem('mesaio_platos', JSON.stringify(p));
      return;
    }
    const { data: current } = await this.sb.from('platos').select('disponible').eq('id', id).single();
    await this.sb.from('platos').update({ disponible: !current.disponible }).eq('id', id);
  },

  async getOrdenes(estado) {
    if (this.useLocal) {
      let o = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      if (estado) o = o.filter(x => x.estado === estado);
      return o.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    let q = this.sb.from('ordenes').select('*, orden_items(*)');
    if (estado) q = q.eq('estado', estado);
    const { data } = await q.order('created_at', { ascending: true });
    return data || [];
  },

  async getOrdenesActivas() {
    if (this.useLocal) {
      let o = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      return o.filter(x => ['pendiente','preparando','listo'].includes(x.estado));
    }
    const { data } = await this.sb.from('ordenes').select('*, orden_items(*)')
      .in('estado', ['pendiente','preparando','listo'])
      .order('created_at');
    return data || [];
  },

  async crearOrden(mesa_id, items, mesero, notas) {
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const now = new Date().toISOString();

    if (this.useLocal) {
      let counter = parseInt(localStorage.getItem('mesaio_orden_counter') || '0') + 1;
      localStorage.setItem('mesaio_orden_counter', String(counter));
      const orden = {
        id: counter, mesa_id, mesero_nombre: mesero || 'Demo',
        estado: 'pendiente', total, notas: notas || '',
        items: items, created_at: now, updated_at: now
      };
      let ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      ordenes.push(orden);
      localStorage.setItem('mesaio_ordenes', JSON.stringify(ordenes));
      // Marcar mesa ocupada
      await this.updateMesa(mesa_id, { estado: 'ocupada' });
      return orden;
    }

    const { data: orden, error } = await this.sb.from('ordenes')
      .insert({ mesa_id, mesero_nombre: mesero || 'Demo', estado: 'pendiente', total, notas })
      .select().single();
    if (error) throw error;

    const itemsInsert = items.map(i => ({
      orden_id: orden.id, plato_id: i.plato_id,
      plato_nombre: i.plato_nombre, cantidad: i.cantidad,
      precio_unitario: i.precio_unitario, subtotal: i.subtotal,
      observaciones: i.observaciones || ''
    }));
    await this.sb.from('orden_items').insert(itemsInsert);
    await this.sb.from('mesas').update({ estado: 'ocupada' }).eq('id', mesa_id);
    return orden;
  },

  async actualizarEstadoOrden(orden_id, nuevoEstado) {
    const now = new Date().toISOString();
    if (this.useLocal) {
      let ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      ordenes = ordenes.map(o => {
        if (o.id === orden_id) {
          o.estado = nuevoEstado;
          o.updated_at = now;
        }
        return o;
      });
      localStorage.setItem('mesaio_ordenes', JSON.stringify(ordenes));

      // Si cobrado → liberar mesa
      if (nuevoEstado === 'cobrado' || nuevoEstado === 'cancelado') {
        const orden = ordenes.find(o => o.id === orden_id);
        if (orden) await this.updateMesa(orden.mesa_id, { estado: 'libre' });
      }
      return;
    }
    await this.sb.from('ordenes').update({ estado: nuevoEstado, updated_at: now }).eq('id', orden_id);
    if (nuevoEstado === 'cobrado' || nuevoEstado === 'cancelado') {
      const { data: orden } = await this.sb.from('ordenes').select('mesa_id').eq('id', orden_id).single();
      if (orden) await this.sb.from('mesas').update({ estado: 'libre' }).eq('id', orden.mesa_id);
    }
  },

  // ── Stats ──
  async getStats() {
    const ordenes = this.useLocal
      ? JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]')
      : (await this.sb.from('ordenes').select('*')).data || [];
    const mesas = await this.getMesas();
    
    const hoy = new Date().toISOString().slice(0, 10);
    const ordenesHoy = ordenes.filter(o => o.created_at && o.created_at.slice(0, 10) === hoy);
    const ventasHoy = ordenesHoy.reduce((s, o) => s + (o.total || 0), 0);
    const activas = ordenes.filter(o => ['pendiente','preparando','listo'].includes(o.estado));
    const ocupadas = mesas.filter(m => m.estado !== 'libre').length;

    // Plato top
    let platoCounts = {};
    ordenesHoy.forEach(o => {
      (o.items || []).forEach(i => {
        platoCounts[i.plato_nombre] = (platoCounts[i.plato_nombre] || 0) + i.cantidad;
      });
    });
    let platoTop = '-'; let platoTopCount = 0;
    Object.entries(platoCounts).forEach(([k, v]) => {
      if (v > platoTopCount) { platoTop = k; platoTopCount = v; }
    });

    return { ventasHoy, ordenesActivas: activas.length, ocupadas, totalMesas: mesas.length, platoTop, platoTopCount };
  },

  // ── Helpers ──
  fmtCOP(n) {
    return '$' + (n || 0).toLocaleString('es-CO');
  },

  fmtHora(iso) {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  },

  tiempoTranscurrido(iso) {
    if (!iso) return '';
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return mins + ' min';
    return Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
  },

  badgeEstado(estado) {
    const map = {
      libre:     'background:#D4EDDA;color:#155724',
      ocupada:   'background:#DBEAFE;color:#1565C0',
      cobro:     'background:#FFF3CD;color:#7C5A00',
      pendiente: 'background:#FFF3CD;color:#7C5A00',
      preparando:'background:#DBEAFE;color:#1565C0',
      listo:     'background:#D4EDDA;color:#155724',
      entregado: 'background:#E8EDF3;color:#4A5568',
      cobrado:   'background:#D1ECF1;color:#0C5460',
      cancelado: 'background:#FCE8E8;color:#721C24'
    };
    const s = map[estado] || 'background:#E8EDF3;color:#4A5568';
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;${s}">${estado.toUpperCase()}</span>`;
  },

  iconoMesa(estado) {
    if (estado === 'libre') return '<i class="bi bi-check-circle" style="color:#2E7D32"></i>';
    if (estado === 'ocupada') return '<i class="bi bi-people-fill" style="color:#1565C0"></i>';
    return '<i class="bi bi-cash-coin" style="color:#7C5A00"></i>';
  },

  toast(msg, type) {
    let t = document.createElement('div');
    t.className = 'mesaio-toast';
    t.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.18);animation:slideIn .3s ease;max-width:340px;';
    t.style.background = type === 'ok' ? '#D4EDDA' : type === 'err' ? '#FCE8E8' : '#DBEAFE';
    t.style.color = type === 'ok' ? '#155724' : type === 'err' ? '#721C24' : '#1565C0';
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => MESAIO.init());
```

**Instrucción:** Agrega esta línea en TODAS las páginas (login, mesero, cocina, admin) ANTES del cierre `</body>`, DESPUÉS del script de Supabase CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.104.1" crossorigin="anonymous"></script>
<script src="/assets/js/mesaio-core.js"></script>
```

Para `mesero/index.html` y `cocina/index.html` y `admin/index.html` la ruta es:
```html
<script src="../assets/js/mesaio-core.js"></script>
```

---

## CHECKPOINT 2 — MESERO FUNCIONAL (15 min)

**Archivo:** `MVP_RESTAURANTE/mesero/index.html`

**Reemplazar TODO el contenido del `<body>` con esto.** Mantener el `<head>` que ya tiene (fonts, bootstrap-icons, styles). Agregar el script al final.

**Instrucción precisa:** El archivo `mesero/index.html` ya existe con un mapa de 12 mesas estático. Reemplazar el `<script>` al final del body (o agregar si no hay) con este bloque completo. El HTML del body se mantiene pero agregar el modal de nueva orden ANTES del cierre `</body>`.

### HTML A INYECTAR — Modal de nueva orden

Agregar este bloque ANTES de los scripts al final del body:

```html
<!-- MODAL NUEVA ORDEN -->
<div class="modal-overlay" id="modalOrden" style="display:none;position:fixed;inset:0;background:rgba(31,19,24,0.6);backdrop-filter:blur(4px);z-index:2000;align-items:center;justify-content:center;padding:16px;">
  <div style="background:#FAF6EE;border-radius:20px;width:100%;max-width:600px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(92,26,43,.25);">
    
    <div style="padding:20px 24px;border-bottom:2px solid #E8DDD0;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C8A951;">Nueva orden</div>
        <h3 style="font-family:'Playfair Display',serif;font-size:22px;color:#5C1A2B;margin:4px 0 0;" id="modalMesaTitle">Mesa 1</h3>
      </div>
      <button onclick="cerrarModal()" style="background:#F2EBDC;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:18px;color:#5A4A4F;">✕</button>
    </div>

    <div style="padding:16px 24px;">
      <!-- Tabs categorías -->
      <div style="display:flex;gap:4px;background:white;border-radius:10px;padding:3px;margin-bottom:16px;">
        <button class="cat-tab active" onclick="filtrarCat('entrada',this)" style="flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:#5C1A2B;color:white;">Entradas</button>
        <button class="cat-tab" onclick="filtrarCat('fuerte',this)" style="flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:transparent;color:#5A4A4F;">Fuertes</button>
        <button class="cat-tab" onclick="filtrarCat('postre',this)" style="flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:transparent;color:#5A4A4F;">Postres</button>
        <button class="cat-tab" onclick="filtrarCat('bebida',this)" style="flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:transparent;color:#5A4A4F;">Bebidas</button>
      </div>

      <!-- Lista platos -->
      <div id="listaPlatos" style="max-height:220px;overflow-y:auto;"></div>

      <!-- Carrito -->
      <div style="margin-top:16px;border-top:2px solid #E8DDD0;padding-top:12px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5C1A2B;margin-bottom:8px;"><i class="bi bi-cart3"></i> Pedido actual</div>
        <div id="carritoLista" style="min-height:40px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid #E8DDD0;">
          <span style="font-size:14px;font-weight:800;color:#5C1A2B;">Total</span>
          <span style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#5C1A2B;" id="carritoTotal">$0</span>
        </div>
      </div>

      <!-- Notas -->
      <textarea id="notasOrden" placeholder="Notas especiales (alergias, sin sal, etc.)" style="width:100%;border:2px solid #E8DDD0;border-radius:10px;padding:10px;font-family:inherit;font-size:13px;margin-top:12px;resize:none;height:60px;"></textarea>

      <!-- Botón enviar -->
      <button onclick="enviarOrden()" id="btnEnviar" style="width:100%;margin-top:12px;padding:14px;background:linear-gradient(135deg,#9a7a1e,#C8A951);border:none;border-radius:10px;font-size:14px;font-weight:800;color:#3D0F1C;cursor:pointer;font-family:inherit;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 16px rgba(200,169,81,0.35);">
        <i class="bi bi-send"></i> Enviar a cocina
      </button>
    </div>
  </div>
</div>
```

### JAVASCRIPT A INYECTAR — Lógica mesero completa

Agregar DESPUÉS de `<script src="../assets/js/mesaio-core.js"></script>`:

```html
<script>
let mesaSeleccionada = null;
let carrito = [];

async function cargarMesas() {
  const mesas = await MESAIO.getMesas();
  const ordenes = await MESAIO.getOrdenesActivas();
  const grid = document.getElementById('mesasGrid') || document.querySelector('.row');
  
  let html = '';
  mesas.forEach(m => {
    const ordenMesa = ordenes.find(o => o.mesa_id === m.id);
    const color = m.estado === 'libre' ? '#2E7D32' : m.estado === 'ocupada' ? '#1565C0' : '#7C5A00';
    const bg = m.estado === 'libre' ? 'rgba(46,125,50,.08)' : m.estado === 'ocupada' ? 'rgba(21,101,192,.08)' : 'rgba(124,90,0,.08)';
    const border = m.estado === 'libre' ? 'rgba(46,125,50,.25)' : m.estado === 'ocupada' ? 'rgba(21,101,192,.25)' : 'rgba(124,90,0,.25)';
    
    html += `
    <div class="col-6 col-md-4 col-lg-3 mb-3">
      <div onclick="${m.estado === 'libre' ? `abrirModal(${m.id}, ${m.numero})` : (m.estado === 'ocupada' && ordenMesa ? `verOrdenMesa(${ordenMesa.id})` : '')}" 
           style="background:${bg};border:2px solid ${border};border-radius:16px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <div style="font-size:28px;">${m.estado === 'libre' ? '🪑' : m.estado === 'ocupada' ? '🍽️' : '💰'}</div>
        <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:${color};">M-${String(m.numero).padStart(2,'0')}</div>
        <div style="font-size:11px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;">${m.estado}</div>
        <div style="font-size:10px;color:#5A4A4F;">${m.capacidad} personas · ${m.ubicacion}</div>
        ${ordenMesa ? `<div style="font-size:11px;color:#5C1A2B;font-weight:600;">${MESAIO.fmtCOP(ordenMesa.total)} · ${MESAIO.tiempoTranscurrido(ordenMesa.created_at)}</div>` : ''}
        ${m.estado === 'libre' ? '<div style="font-size:10px;color:#C8A951;font-weight:700;margin-top:4px;">TAP PARA ORDENAR</div>' : ''}
      </div>
    </div>`;
  });
  
  if (grid) grid.innerHTML = html;
}

function abrirModal(mesaId, mesaNum) {
  mesaSeleccionada = mesaId;
  carrito = [];
  document.getElementById('modalMesaTitle').textContent = 'Mesa ' + mesaNum;
  document.getElementById('modalOrden').style.display = 'flex';
  document.getElementById('carritoLista').innerHTML = '<div style="color:#5A4A4F;font-size:12px;text-align:center;padding:8px;">Selecciona platos del menú</div>';
  document.getElementById('carritoTotal').textContent = '$0';
  filtrarCat('entrada', document.querySelector('.cat-tab'));
}

function cerrarModal() {
  document.getElementById('modalOrden').style.display = 'none';
  mesaSeleccionada = null;
  carrito = [];
}

async function filtrarCat(cat, btn) {
  document.querySelectorAll('.cat-tab').forEach(t => { t.style.background = 'transparent'; t.style.color = '#5A4A4F'; });
  if (btn) { btn.style.background = '#5C1A2B'; btn.style.color = 'white'; }
  
  const platos = await MESAIO.getPlatos(cat);
  const lista = document.getElementById('listaPlatos');
  lista.innerHTML = platos.map(p => `
    <div onclick="agregarAlCarrito(${p.id},'${p.nombre.replace(/'/g,"\\'")}',${p.precio})" 
         style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #E8DDD0;cursor:pointer;transition:background .15s;border-radius:8px;margin-bottom:2px;"
         onmouseover="this.style.background='rgba(200,169,81,.1)'" onmouseout="this.style.background='transparent'">
      <div>
        <div style="font-size:13px;font-weight:700;color:#1F1318;">${p.nombre}</div>
        <div style="font-size:11px;color:#5A4A4F;">${cat}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-weight:800;color:#5C1A2B;font-size:14px;">${MESAIO.fmtCOP(p.precio)}</span>
        <span style="background:#C8A951;color:#3D0F1C;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;">+</span>
      </div>
    </div>
  `).join('');
}

function agregarAlCarrito(id, nombre, precio) {
  const existe = carrito.find(x => x.plato_id === id);
  if (existe) { existe.cantidad++; existe.subtotal = existe.cantidad * existe.precio_unitario; }
  else carrito.push({ plato_id: id, plato_nombre: nombre, precio_unitario: precio, cantidad: 1, subtotal: precio, observaciones: '' });
  renderCarrito();
  MESAIO.toast('+ ' + nombre, 'ok');
}

function quitarDelCarrito(id) {
  const idx = carrito.findIndex(x => x.plato_id === id);
  if (idx === -1) return;
  if (carrito[idx].cantidad > 1) { carrito[idx].cantidad--; carrito[idx].subtotal = carrito[idx].cantidad * carrito[idx].precio_unitario; }
  else carrito.splice(idx, 1);
  renderCarrito();
}

function renderCarrito() {
  const el = document.getElementById('carritoLista');
  if (carrito.length === 0) {
    el.innerHTML = '<div style="color:#5A4A4F;font-size:12px;text-align:center;padding:8px;">Selecciona platos del menú</div>';
    document.getElementById('carritoTotal').textContent = '$0';
    return;
  }
  el.innerHTML = carrito.map(c => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #F2EBDC;">
      <div style="display:flex;align-items:center;gap:8px;">
        <button onclick="quitarDelCarrito(${c.plato_id})" style="background:#FCE8E8;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;color:#721C24;font-weight:900;font-size:12px;">−</button>
        <span style="font-size:13px;font-weight:600;color:#1F1318;">${c.plato_nombre}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="background:#5C1A2B;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:800;">×${c.cantidad}</span>
        <span style="font-weight:700;font-size:13px;color:#5C1A2B;">${MESAIO.fmtCOP(c.subtotal)}</span>
      </div>
    </div>
  `).join('');
  
  const total = carrito.reduce((s, c) => s + c.subtotal, 0);
  document.getElementById('carritoTotal').textContent = MESAIO.fmtCOP(total);
}

async function enviarOrden() {
  if (carrito.length === 0) { MESAIO.toast('Agrega platos al pedido', 'err'); return; }
  const btn = document.getElementById('btnEnviar');
  btn.disabled = true; btn.textContent = 'Enviando...';
  
  try {
    const notas = document.getElementById('notasOrden').value;
    await MESAIO.crearOrden(mesaSeleccionada, carrito, 'Carlos R.', notas);
    MESAIO.toast('✅ Orden enviada a cocina', 'ok');
    cerrarModal();
    cargarMesas();
  } catch (e) {
    MESAIO.toast('Error: ' + e.message, 'err');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-send"></i> Enviar a cocina';
  }
}

async function verOrdenMesa(ordenId) {
  const ordenes = await MESAIO.getOrdenesActivas();
  const o = ordenes.find(x => x.id === ordenId);
  if (!o) return;
  
  let accion = '';
  if (o.estado === 'listo') accion = `<button onclick="marcarEntregado(${o.id})" style="width:100%;margin-top:12px;padding:12px;background:#2E7D32;border:none;border-radius:10px;color:white;font-weight:700;cursor:pointer;font-family:inherit;">✅ Marcar entregado</button>`;
  if (o.estado === 'entregado') accion = `<button onclick="pedirCuenta(${o.id})" style="width:100%;margin-top:12px;padding:12px;background:#C8A951;border:none;border-radius:10px;color:#3D0F1C;font-weight:700;cursor:pointer;font-family:inherit;">💰 Cerrar cuenta</button>`;
  
  const items = (o.items || []).map(i => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;"><span>×${i.cantidad} ${i.plato_nombre}</span><span style="font-weight:700;">${MESAIO.fmtCOP(i.subtotal)}</span></div>`).join('');
  
  // Reuse modal
  document.getElementById('modalMesaTitle').textContent = 'Mesa ' + o.mesa_id + ' — Orden #' + o.id;
  document.getElementById('modalOrden').style.display = 'flex';
  document.querySelector('#modalOrden > div > div:last-child').innerHTML = `
    <div style="margin-bottom:12px;">${MESAIO.badgeEstado(o.estado)} <span style="font-size:11px;color:#5A4A4F;margin-left:8px;">${MESAIO.tiempoTranscurrido(o.created_at)}</span></div>
    ${items}
    <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid #E8DDD0;margin-top:8px;">
      <span style="font-weight:800;color:#5C1A2B;">Total</span>
      <span style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#5C1A2B;">${MESAIO.fmtCOP(o.total)}</span>
    </div>
    ${accion}
  `;
}

async function marcarEntregado(id) { await MESAIO.actualizarEstadoOrden(id, 'entregado'); MESAIO.toast('Orden entregada', 'ok'); cerrarModal(); cargarMesas(); }
async function pedirCuenta(id) { await MESAIO.actualizarEstadoOrden(id, 'cobrado'); MESAIO.toast('Cuenta cerrada — mesa libre', 'ok'); cerrarModal(); cargarMesas(); }

// Polling cada 5s para sincronizar con cocina
setInterval(cargarMesas, 5000);
document.addEventListener('DOMContentLoaded', () => { MESAIO.init().then(cargarMesas); });
</script>
```

**IMPORTANTE:** El HTML actual del body de mesero ya tiene un grid con 12 cards. Reemplaza el contenido del grid con un `<div class="row" id="mesasGrid"></div>` vacío — el JS lo llena dinámicamente.

Buscar en mesero/index.html el bloque de 12 cards hardcodeadas y reemplazar todo ese HTML por:

```html
<div class="row" id="mesasGrid">
  <!-- JS llena dinámicamente -->
</div>
```

---

## CHECKPOINT 3 — COCINA FUNCIONAL (10 min)

**Archivo:** `MVP_RESTAURANTE/cocina/index.html`

El KDS ya tiene 3 columnas (Pendientes / Preparando / Listos). Reemplazar los cards hardcodeados por contenido dinámico.

### JAVASCRIPT A INYECTAR

Agregar DESPUÉS de `<script src="../assets/js/mesaio-core.js"></script>`:

```html
<script>
async function cargarKDS() {
  const ordenes = await MESAIO.getOrdenesActivas();
  
  const cols = {
    pendiente: document.getElementById('colPendiente') || document.querySelectorAll('.col-md-4')[0]?.querySelector('.kds-list'),
    preparando: document.getElementById('colPreparando') || document.querySelectorAll('.col-md-4')[1]?.querySelector('.kds-list'),
    listo: document.getElementById('colListo') || document.querySelectorAll('.col-md-4')[2]?.querySelector('.kds-list'),
  };

  ['pendiente','preparando','listo'].forEach(estado => {
    const items = ordenes.filter(o => o.estado === estado);
    const col = cols[estado];
    if (!col) return;
    
    if (items.length === 0) {
      col.innerHTML = '<div style="text-align:center;padding:24px;color:#5A4A4F;font-size:12px;">Sin órdenes</div>';
      return;
    }

    col.innerHTML = items.map(o => {
      const mins = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000);
      const late = mins > 10;
      const itemsHtml = (o.items || []).map(i => `<div style="font-size:12px;padding:2px 0;display:flex;justify-content:space-between;"><span>×${i.cantidad} ${i.plato_nombre}</span>${i.observaciones ? '<span style="color:#C8A951;font-size:10px;">⚠ '+i.observaciones+'</span>' : ''}</div>`).join('');
      
      let btn = '';
      if (estado === 'pendiente') btn = `<button onclick="cambiarEstado(${o.id},'preparando')" style="width:100%;margin-top:10px;padding:8px;background:#1565C0;border:none;border-radius:8px;color:white;font-weight:700;cursor:pointer;font-family:inherit;font-size:12px;"><i class="bi bi-fire"></i> Iniciar preparación</button>`;
      if (estado === 'preparando') btn = `<button onclick="cambiarEstado(${o.id},'listo')" style="width:100%;margin-top:10px;padding:8px;background:#2E7D32;border:none;border-radius:8px;color:white;font-weight:700;cursor:pointer;font-family:inherit;font-size:12px;"><i class="bi bi-check-lg"></i> Marcar listo</button>`;

      return `
      <div style="background:white;border-radius:12px;padding:14px;margin-bottom:10px;border-left:4px solid ${late ? '#C62828' : estado === 'pendiente' ? '#C8A951' : estado === 'preparando' ? '#1565C0' : '#2E7D32'};box-shadow:0 2px 8px rgba(0,0,0,.06);${late ? 'animation:pulse 1s infinite;' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:800;font-size:15px;color:#5C1A2B;">Mesa ${o.mesa_id} · #${o.id}</span>
          <span style="font-size:11px;font-weight:700;color:${late ? '#C62828' : '#5A4A4F'};">${late ? '🔴 ' : ''}${mins} min</span>
        </div>
        <div style="font-size:11px;color:#5A4A4F;margin-bottom:6px;">${o.mesero_nombre} · ${MESAIO.fmtHora(o.created_at)}</div>
        <div style="border-top:1px solid #E8DDD0;padding-top:6px;">${itemsHtml}</div>
        ${o.notas ? '<div style="font-size:11px;color:#C8A951;margin-top:6px;font-style:italic;">📝 '+o.notas+'</div>' : ''}
        ${btn}
      </div>`;
    }).join('');
  });

  // Contadores en headers
  ['pendiente','preparando','listo'].forEach(e => {
    const count = ordenes.filter(o => o.estado === e).length;
    const badge = document.getElementById('count_' + e);
    if (badge) badge.textContent = count;
  });
}

async function cambiarEstado(id, nuevoEstado) {
  await MESAIO.actualizarEstadoOrden(id, nuevoEstado);
  MESAIO.toast(nuevoEstado === 'preparando' ? '🔥 Preparando' : '✅ Listo para servir', 'ok');
  cargarKDS();
}

// Polling cada 3s — cocina necesita refresh rápido
setInterval(cargarKDS, 3000);
document.addEventListener('DOMContentLoaded', () => { MESAIO.init().then(cargarKDS); });
</script>
<style>@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.7} }</style>
```

**IMPORTANTE — Estructura HTML requerida en cocina:**

Las 3 columnas del KDS necesitan un contenedor con ID para que el JS las encuentre. Buscar las 3 columnas `.col-md-4` y dentro de cada una agregar un div con clase `kds-list` y el ID correspondiente:

```html
<!-- Columna Pendientes -->
<div class="col-md-4">
  <h5>... Pendientes <span id="count_pendiente" class="badge">0</span></h5>
  <div class="kds-list" id="colPendiente"></div>
</div>

<!-- Columna Preparando -->
<div class="col-md-4">
  <h5>... Preparando <span id="count_preparando" class="badge">0</span></h5>
  <div class="kds-list" id="colPreparando"></div>
</div>

<!-- Columna Listos -->
<div class="col-md-4">
  <h5>... Listos <span id="count_listo" class="badge">0</span></h5>
  <div class="kds-list" id="colListo"></div>
</div>
```

---

## CHECKPOINT 4 — ADMIN FUNCIONAL (10 min)

**Archivo:** `MVP_RESTAURANTE/admin/index.html`

El admin ya tiene tabs + tablas con datos hardcodeados. Hay que inyectar JS que reemplace los datos estáticos por dinámicos.

### JAVASCRIPT A INYECTAR

Agregar DESPUÉS de `<script src="../assets/js/mesaio-core.js"></script>`:

```html
<script>
async function cargarAdmin() {
  const stats = await MESAIO.getStats();
  
  // Stats cards — buscar por clase stat-card o por contenido
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards[0]) statCards[0].querySelector('.v').textContent = MESAIO.fmtCOP(stats.ventasHoy);
  if (statCards[1]) statCards[1].querySelector('.v').textContent = stats.ordenesActivas;
  if (statCards[2]) statCards[2].querySelector('.v').textContent = stats.ocupadas + '/' + stats.totalMesas;
  if (statCards[3]) { statCards[3].querySelector('.v').textContent = stats.platoTop || '-'; }

  await cargarTablaPlatos();
  await cargarTablaOrdenes();
}

async function cargarTablaPlatos() {
  const platos = await MESAIO.getAllPlatos();
  const tbody = document.querySelector('#tabPlatos tbody, table:first-of-type tbody');
  if (!tbody) return;
  
  tbody.innerHTML = platos.map(p => `
    <tr>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.categoria}</td>
      <td>${MESAIO.fmtCOP(p.precio)}</td>
      <td>${p.disponible ? '<span class="badge b-disp"><i class="bi bi-check-circle"></i> Sí</span>' : '<span class="badge b-ago"><i class="bi bi-x-circle"></i> No</span>'}</td>
      <td>-</td>
      <td class="acts">
        <button class="ic-btn" onclick="MESAIO.togglePlato(${p.id}).then(cargarAdmin)"><i class="bi bi-${p.disponible ? 'eye-slash' : 'eye'}"></i></button>
      </td>
    </tr>
  `).join('');
}

async function cargarTablaOrdenes() {
  const ordenes = await MESAIO.getOrdenes();
  const tbody = document.querySelector('#tabOrdenes tbody, .panel:last-of-type tbody');
  if (!tbody) return;
  
  tbody.innerHTML = ordenes.slice(-20).reverse().map(o => {
    const itemCount = (o.items || []).reduce((s, i) => s + i.cantidad, 0);
    return `
    <tr>
      <td>${String(o.id).padStart(3,'0')}</td>
      <td>M-${String(o.mesa_id).padStart(2,'0')}</td>
      <td>${o.mesero_nombre}</td>
      <td>${itemCount} items</td>
      <td>${MESAIO.fmtCOP(o.total)}</td>
      <td>${MESAIO.badgeEstado(o.estado)}</td>
      <td>${MESAIO.fmtHora(o.created_at)}</td>
    </tr>`;
  }).join('');
}

// Tab switching — asegurar que los tabs funcionen
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// Refresh cada 10s
setInterval(cargarAdmin, 10000);
document.addEventListener('DOMContentLoaded', () => { MESAIO.init().then(cargarAdmin); });
</script>
```

---

## CHECKPOINT 5 — ENTREGABLES / DEMO AL JURADO (5 min)

Crear archivo `MVP_RESTAURANTE/entregables/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Entregables · Mesaio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
<link href="../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
<style>
  :root{--burgundy:#5C1A2B;--gold:#C8A951;--gold-lt:#E2C87A;--cream:#FAF6EE;--charcoal:#1F1318;--charcoal-2:#5A4A4F;--border:#E8DDD0}
  *{box-sizing:border-box}body{margin:0;font-family:'Inter',sans-serif;background:var(--cream);color:var(--charcoal)}
  .topbar{background:linear-gradient(135deg,var(--burgundy),#3D0F1C);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
  .brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:white}
  .brand span{color:var(--gold-lt)}
  .wrap{max-width:900px;margin:0 auto;padding:40px 20px}
  h1{font-family:'Playfair Display',serif;font-size:32px;color:var(--burgundy);margin-bottom:8px}
  .sub{color:var(--charcoal-2);font-size:14px;margin-bottom:32px}
  .card{background:white;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 4px 20px rgba(92,26,43,.08);border-left:4px solid var(--gold);display:flex;align-items:center;gap:16px;text-decoration:none;color:inherit;transition:transform .2s}
  .card:hover{transform:translateY(-2px)}
  .card .icon{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--burgundy),#8B3A4E);display:flex;align-items:center;justify-content:center;color:var(--gold-lt);font-size:20px;flex-shrink:0}
  .card .tit{font-weight:800;color:var(--burgundy);font-size:15px}
  .card .desc{font-size:12px;color:var(--charcoal-2);margin-top:2px}
  .tag{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:20px;background:rgba(200,169,81,.15);color:var(--gold);margin-top:6px}
</style>
</head>
<body>
<div class="topbar">
  <div class="brand">Mes<span>aio</span></div>
  <a href="/" style="color:rgba(255,255,255,.7);font-size:13px;text-decoration:none;">← Volver al sitio</a>
</div>
<div class="wrap">
  <h1>Entregables del MVP</h1>
  <p class="sub">Hackathon 2026 · Sistema integral de gestión para restaurantes</p>

  <a href="/" class="card">
    <div class="icon"><i class="bi bi-globe"></i></div>
    <div><div class="tit">Landing Page</div><div class="desc">Página principal del producto — narrativa comercial completa</div><div class="tag">público</div></div>
  </a>
  <a href="/login" class="card">
    <div class="icon"><i class="bi bi-box-arrow-in-right"></i></div>
    <div><div class="tit">Login · Selector de Rol</div><div class="desc">Acceso directo a los 3 roles del sistema</div><div class="tag">autenticación</div></div>
  </a>
  <a href="/mesero" class="card">
    <div class="icon"><i class="bi bi-person-badge"></i></div>
    <div><div class="tit">Panel del Mesero</div><div class="desc">Mapa visual de 12 mesas + toma de orden + envío a cocina</div><div class="tag">rol mesero</div></div>
  </a>
  <a href="/cocina" class="card">
    <div class="icon"><i class="bi bi-fire"></i></div>
    <div><div class="tit">Kitchen Display System (KDS)</div><div class="desc">3 columnas: Pendientes → Preparando → Listos. Alertas de retraso.</div><div class="tag">rol cocinero</div></div>
  </a>
  <a href="/admin" class="card">
    <div class="icon"><i class="bi bi-graph-up-arrow"></i></div>
    <div><div class="tit">Dashboard Administrador</div><div class="desc">Stats del día, CRUD de platos, mesas, órdenes y reportes</div><div class="tag">rol admin</div></div>
  </a>
  <a href="/menu" class="card">
    <div class="icon"><i class="bi bi-journal-richtext"></i></div>
    <div><div class="tit">Carta Digital</div><div class="desc">Menú público con 4 categorías — escaneable por QR</div><div class="tag">público</div></div>
  </a>

  <div style="text-align:center;margin-top:40px;font-size:11px;color:var(--charcoal-2);">
    <strong style="color:var(--burgundy);">Mesaio</strong> · Hackathon 2026 · Hecho con ❤️ en Colombia<br>
    Stack: HTML5 + CSS3 + Vanilla JS + Bootstrap 5 + Supabase
  </div>
</div>
</body>
</html>
```

Agregar a `_redirects`:
```
/entregables  /entregables/index.html  200
```

---

## PLAN DE EJECUCIÓN POR TIEMPO

| Bloque | Tiempo | Qué hacer | Riesgo si falla |
|--------|--------|-----------|-----------------|
| CP0 | 5 min | Crear `sql/schema.sql` + `mesaio-core.js` | Sin datos = nada funciona |
| CP1 | 5 min | Inyectar `mesaio-core.js` en todas las páginas | Sin core = no hay lógica |
| CP2 | 15 min | Mesero funcional: modal + carrito + enviar | Sin mesero = no hay demo |
| CP3 | 10 min | Cocina funcional: KDS dinámico | Sin cocina = flujo incompleto |
| CP4 | 5 min | Admin con stats y tablas dinámicas | Menos impacto visual |
| CP5 | 5 min | Entregables + _redirects | Solo presentación |
| **TOTAL** | **45 min** | | |

**Si te quedan solo 20 min:** Haz CP0 + CP1 + CP2. El mesero tomando orden y enviando a cocina es suficiente para impresionar.

**Si te quedan solo 10 min:** Haz CP0 + CP1 y asegura que `mesaio-core.js` carga en todas las páginas con datos LocalStorage. Al menos el mapa de mesas se renderiza dinámico.

---

## CRITERIO "DEMO LISTA PARA JURADO" — Checklist

```
□ 1. Landing carga sin errores (index.html)
□ 2. Login muestra 3 roles clickeables
□ 3. Mesero ve 12 mesas con colores por estado
□ 4. Mesero toca mesa libre → modal de orden aparece
□ 5. Mesero agrega 3 platos → total correcto
□ 6. Mesero envía → mesa cambia a "ocupada"
□ 7. Cocina ve la orden en columna "Pendientes"
□ 8. Cocina marca "Preparando" → card se mueve
□ 9. Cocina marca "Listo" → card se mueve
□ 10. Admin ve stats actualizados del día
```

**Si 7/10 funcionan → DEMO VIABLE.**
**Si 10/10 funcionan → DEMO GANADORA.**

---

## ARCHIVOS FINALES ESPERADOS

```
MVP_RESTAURANTE/
├── index.html                    (ya existe — no tocar)
├── login.html                    (ya existe — no tocar)
├── menu.html                     (ya existe — no tocar)
├── _redirects                    (agregar /entregables)
├── sql/
│   └── schema.sql               ← NUEVO (CP0)
├── assets/
│   └── js/
│       └── mesaio-core.js       ← NUEVO (CP1)
├── mesero/
│   └── index.html               ← MODIFICAR (CP2: modal + JS)
├── cocina/
│   └── index.html               ← MODIFICAR (CP3: JS dinámico)
├── admin/
│   └── index.html               ← MODIFICAR (CP4: JS dinámico)
└── entregables/
    └── index.html               ← NUEVO (CP5)
```

---

## REGLA FINAL

> **Si algo no funciona al primer intento: comenta el bloque roto y sigue con el siguiente checkpoint.** Es mejor un demo con 3 de 4 secciones funcionando que un demo con 4 secciones rotas intentando arreglar una.

> **Push después de CADA checkpoint.** Netlify deploya solo. El jurado puede ver progreso en tiempo real.

> **No optimices. No refactorices. No limpies. FUNCIONE.**

---

*SUPER_SPEC_MESAIO_v1 · 2026-05-03 · Arquitecto ARQ.PRODUCTO · Para Claude Code*
*Una sola bala de plata. Dispara y gana.*
