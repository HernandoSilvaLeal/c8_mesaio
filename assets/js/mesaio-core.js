// ═══════════════════════════════════════════
// MESAIO CORE · Módulo compartido
// Hackathon 2026 · Reutiliza Supabase RNT
// ═══════════════════════════════════════════

const MESAIO = {
  // ── Supabase Config (proyecto RNT compartido) ──
  SB_URL: 'https://fttrbfntgxvbfdmndogo.supabase.co',
  SB_KEY: 'sb_publishable_vezVeH9SMl9b_WmG0QMD9Q_j4sMS4Xe',
  sb: null,
  useLocal: false, // intentar Supabase primero; si falla, fallback LocalStorage

  // ── Init ──
  async init() {
    if (window.supabase) {
      try {
        this.sb = window.supabase.createClient(this.SB_URL, this.SB_KEY);
        // Probar conexión leyendo mesas
        const { error } = await this.sb.from('mesas').select('id').limit(1);
        if (error) throw error;
        this.useLocal = false;
        console.log('✅ MESAIO conectado a Supabase');
      } catch(e) {
        console.warn('⚠️ Supabase falló, usando LocalStorage:', e.message);
        this.useLocal = true;
      }
    } else {
      console.log('📦 Sin lib Supabase — modo LocalStorage');
      this.useLocal = true;
    }
    this._initLocalData();
  },

  // ── LocalStorage seed (fallback si Supabase no responde) ──
  _initLocalData() {
    if (localStorage.getItem('mesaio_mesas')) return;

    const mesas = [
      {id:1,numero:1,capacidad:2,estado:'libre',ubicacion:'Salón'},{id:2,numero:2,capacidad:4,estado:'libre',ubicacion:'Salón'},
      {id:3,numero:3,capacidad:4,estado:'libre',ubicacion:'Salón'},{id:4,numero:4,capacidad:6,estado:'libre',ubicacion:'Salón'},
      {id:5,numero:5,capacidad:6,estado:'libre',ubicacion:'Salón'},{id:6,numero:6,capacidad:4,estado:'libre',ubicacion:'Salón'},
      {id:7,numero:7,capacidad:2,estado:'libre',ubicacion:'Salón'},{id:8,numero:8,capacidad:4,estado:'libre',ubicacion:'Salón'},
      {id:9,numero:9,capacidad:4,estado:'libre',ubicacion:'Terraza'},{id:10,numero:10,capacidad:4,estado:'libre',ubicacion:'Terraza'},
      {id:11,numero:11,capacidad:6,estado:'libre',ubicacion:'Terraza'},{id:12,numero:12,capacidad:6,estado:'libre',ubicacion:'Terraza'},
      {id:13,numero:13,capacidad:2,estado:'libre',ubicacion:'Terraza'},{id:14,numero:14,capacidad:4,estado:'libre',ubicacion:'Terraza'},
      {id:15,numero:15,capacidad:8,estado:'libre',ubicacion:'Terraza'},{id:16,numero:16,capacidad:4,estado:'libre',ubicacion:'Terraza'},
      {id:17,numero:17,capacidad:2,estado:'libre',ubicacion:'Barra'},{id:18,numero:18,capacidad:2,estado:'libre',ubicacion:'Barra'},
      {id:19,numero:19,capacidad:2,estado:'libre',ubicacion:'Barra'},{id:20,numero:20,capacidad:2,estado:'libre',ubicacion:'Barra'},
      {id:21,numero:21,capacidad:8,estado:'libre',ubicacion:'Privado'},{id:22,numero:22,capacidad:10,estado:'libre',ubicacion:'Privado'},
      {id:23,numero:23,capacidad:12,estado:'libre',ubicacion:'Privado'},{id:24,numero:24,capacidad:6,estado:'libre',ubicacion:'Privado'},
    ];
    localStorage.setItem('mesaio_mesas', JSON.stringify(mesas));

    const platos = [
      { id:1,  nombre:'Empanadas de carne',     categoria:'entrada', precio:12000, disponible:true, descripcion:'Crujientes empanadas con ají' },
      { id:2,  nombre:'Ajiaco santafereño',     categoria:'entrada', precio:36000, disponible:true, descripcion:'Sopa bogotana con pollo, papa y guascas' },
      { id:3,  nombre:'Patacones con hogao',    categoria:'entrada', precio:15000, disponible:true, descripcion:'Plátano verde frito con salsa criolla' },
      { id:4,  nombre:'Bandeja paisa',          categoria:'fuerte',  precio:42000, disponible:true, descripcion:'El clásico antioqueño completo' },
      { id:5,  nombre:'Lomo al trapo',          categoria:'fuerte',  precio:58000, disponible:true, descripcion:'Lomo de res envuelto en tela' },
      { id:6,  nombre:'Cazuela de mariscos',    categoria:'fuerte',  precio:62000, disponible:true, descripcion:'Mariscos frescos en salsa criolla' },
      { id:7,  nombre:'Mojarra frita',          categoria:'fuerte',  precio:45000, disponible:true, descripcion:'Pescado entero frito con patacón' },
      { id:8,  nombre:'Pollo a la brasa',       categoria:'fuerte',  precio:38000, disponible:true, descripcion:'Pollo marinado a las brasas' },
      { id:9,  nombre:'Chuleta valluna',        categoria:'fuerte',  precio:44000, disponible:true, descripcion:'Chuleta apanada gigante' },
      { id:10, nombre:'Tres leches',            categoria:'postre',  precio:18000, disponible:true, descripcion:'Bizcocho húmedo de tres leches' },
      { id:11, nombre:'Cuajada con melao',      categoria:'postre',  precio:14000, disponible:true, descripcion:'Queso fresco con miel de panela' },
      { id:12, nombre:'Arroz con leche',        categoria:'postre',  precio:12000, disponible:true, descripcion:'Cremoso arroz con leche y canela' },
      { id:13, nombre:'Limonada de coco',       categoria:'bebida',  precio:9000,  disponible:true, descripcion:'Limonada con coco rallado' },
      { id:14, nombre:'Jugo de lulo',           categoria:'bebida',  precio:8000,  disponible:true, descripcion:'Jugo natural de lulo' },
      { id:15, nombre:'Agua de panela con limón',categoria:'bebida', precio:6000,  disponible:true, descripcion:'Tradicional bebida colombiana' },
    ];
    localStorage.setItem('mesaio_platos', JSON.stringify(platos));
    localStorage.setItem('mesaio_ordenes', JSON.stringify([]));
    localStorage.setItem('mesaio_orden_counter', '0');
  },

  // ── Mesas ──
  async getMesas() {
    if (this.useLocal) return JSON.parse(localStorage.getItem('mesaio_mesas') || '[]');
    const { data, error } = await this.sb.from('mesas').select('*').order('numero');
    if (error) { console.warn(error); this.useLocal = true; return this.getMesas(); }
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

  // ── Platos ──
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

  // ── Órdenes ──
  async getOrdenes(estado) {
    if (this.useLocal) {
      let o = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      if (estado) o = o.filter(x => x.estado === estado);
      return o.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    let q = this.sb.from('ordenes').select('*, items:orden_items(*)');
    if (estado) q = q.eq('estado', estado);
    const { data } = await q.order('created_at', { ascending: true });
    return data || [];
  },

  async getOrdenesActivas() {
    if (this.useLocal) {
      let o = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      return o.filter(x => ['pendiente','preparando','listo','entregado'].includes(x.estado));
    }
    const { data } = await this.sb.from('ordenes').select('*, items:orden_items(*)')
      .in('estado', ['pendiente','preparando','listo','entregado'])
      .order('created_at');
    return data || [];
  },

  async crearOrden(mesa_id, items, mesero, notas) {
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const now = new Date().toISOString();

    if (this.useLocal) {
      let counter = parseInt(localStorage.getItem('mesaio_orden_counter') || '0') + 1;
      localStorage.setItem('mesaio_orden_counter', String(counter));
      const sesion = JSON.parse(localStorage.getItem('mesaio_session') || 'null');
      const orden = {
        id: counter, mesa_id, mesero_nombre: mesero || (sesion ? sesion.nombre : 'Mesero'),
        estado: 'pendiente', total, notas: notas || '',
        items: items, created_at: now, updated_at: now
      };
      let ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
      ordenes.push(orden);
      localStorage.setItem('mesaio_ordenes', JSON.stringify(ordenes));
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
        if (o.id === orden_id) { o.estado = nuevoEstado; o.updated_at = now; }
        return o;
      });
      localStorage.setItem('mesaio_ordenes', JSON.stringify(ordenes));

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
    let ordenes;
    if (this.useLocal) {
      ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
    } else {
      const { data } = await this.sb.from('ordenes').select('*, items:orden_items(*)');
      ordenes = data || [];
    }
    const mesas = await this.getMesas();

    const hoy = new Date().toISOString().slice(0, 10);
    const ordenesHoy = ordenes.filter(o => o.created_at && o.created_at.slice(0, 10) === hoy);
    const ventasHoy = ordenesHoy.reduce((s, o) => s + (o.total || 0), 0);
    const activas = ordenes.filter(o => ['pendiente','preparando','listo'].includes(o.estado));
    const ocupadas = mesas.filter(m => m.estado !== 'libre').length;

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

    return {
      ventasHoy, ordenesActivas: activas.length,
      ocupadas, totalMesas: mesas.length,
      platoTop, platoTopCount,
      ordenesHoy: ordenesHoy.length
    };
  },

  // ── Realtime (Supabase) ──
  suscribirOrdenes(callback) {
    if (this.useLocal || !this.sb) return null;
    return this.sb.channel('ordenes_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orden_items' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, callback)
      .subscribe();
  },

  // ── Helpers ──
  fmtCOP(n) { return '$' + (n || 0).toLocaleString('es-CO'); },

  fmtHora(iso) {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
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
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;${s}">${(estado||'').toUpperCase()}</span>`;
  },

  // ══════════════════════════════════════════════════════════
  // V2 — SEED DE INGREDIENTES Y RECETAS
  // ══════════════════════════════════════════════════════════

  initV2() {
    // Forzar 24 mesas si todavía tiene 12
    const mesasActuales = JSON.parse(localStorage.getItem('mesaio_mesas') || '[]');
    if (mesasActuales.length < 24) {
      localStorage.removeItem('mesaio_mesas');
      this._initLocalData();
    }
    if (localStorage.getItem('mesaio_v2_seed')) return;

    const ingredientes = [
      { id:1,  nombre:"Carne de res",       unidad:"g",       stock:8000, stock_minimo:1000, precio_costo:18,    categoria:"proteína" },
      { id:2,  nombre:"Carne molida",       unidad:"g",       stock:5000, stock_minimo:500,  precio_costo:15,    categoria:"proteína" },
      { id:3,  nombre:"Pollo desmechado",   unidad:"g",       stock:4000, stock_minimo:500,  precio_costo:12,    categoria:"proteína" },
      { id:4,  nombre:"Cerdo",              unidad:"g",       stock:3000, stock_minimo:500,  precio_costo:16,    categoria:"proteína" },
      { id:5,  nombre:"Chicharrón",         unidad:"porción", stock:30,   stock_minimo:5,    precio_costo:3000,  categoria:"proteína" },
      { id:6,  nombre:"Mojarra",            unidad:"unidad",  stock:15,   stock_minimo:3,    precio_costo:12000, categoria:"proteína" },
      { id:7,  nombre:"Mariscos mixtos",    unidad:"g",       stock:2000, stock_minimo:300,  precio_costo:35,    categoria:"proteína" },
      { id:8,  nombre:"Huevo",              unidad:"unidad",  stock:60,   stock_minimo:10,   precio_costo:600,   categoria:"proteína" },
      { id:9,  nombre:"Frijoles cocidos",   unidad:"porción", stock:40,   stock_minimo:8,    precio_costo:1500,  categoria:"grano" },
      { id:10, nombre:"Arroz blanco",       unidad:"porción", stock:60,   stock_minimo:10,   precio_costo:800,   categoria:"grano" },
      { id:11, nombre:"Papa criolla",       unidad:"g",       stock:3000, stock_minimo:500,  precio_costo:5,     categoria:"vegetal" },
      { id:12, nombre:"Papa pastusa",       unidad:"g",       stock:4000, stock_minimo:500,  precio_costo:4,     categoria:"vegetal" },
      { id:13, nombre:"Plátano maduro",     unidad:"unidad",  stock:40,   stock_minimo:8,    precio_costo:800,   categoria:"vegetal" },
      { id:14, nombre:"Yuca",               unidad:"g",       stock:2000, stock_minimo:300,  precio_costo:6,     categoria:"vegetal" },
      { id:15, nombre:"Mazorca",            unidad:"unidad",  stock:20,   stock_minimo:4,    precio_costo:1500,  categoria:"vegetal" },
      { id:16, nombre:"Aguacate",           unidad:"unidad",  stock:20,   stock_minimo:4,    precio_costo:2500,  categoria:"vegetal" },
      { id:17, nombre:"Arepa de maíz",      unidad:"unidad",  stock:50,   stock_minimo:10,   precio_costo:500,   categoria:"grano" },
      { id:18, nombre:"Leche de coco",      unidad:"ml",      stock:3000, stock_minimo:500,  precio_costo:8,     categoria:"lácteo" },
      { id:19, nombre:"Crema de leche",     unidad:"ml",      stock:2000, stock_minimo:300,  precio_costo:10,    categoria:"lácteo" },
      { id:20, nombre:"Limón",              unidad:"unidad",  stock:40,   stock_minimo:8,    precio_costo:300,   categoria:"vegetal" },
      { id:21, nombre:"Panela rallada",     unidad:"g",       stock:1000, stock_minimo:200,  precio_costo:6,     categoria:"condimento" },
      { id:22, nombre:"Chocolate amargo",   unidad:"g",       stock:500,  stock_minimo:100,  precio_costo:40,    categoria:"condimento" },
      { id:23, nombre:"Helado vainilla",    unidad:"porción", stock:20,   stock_minimo:4,    precio_costo:2500,  categoria:"lácteo" },
      { id:24, nombre:"Cerveza artesanal",  unidad:"unidad",  stock:48,   stock_minimo:10,   precio_costo:3500,  categoria:"bebida" },
      { id:25, nombre:"Vino tinto copa",    unidad:"porción", stock:24,   stock_minimo:5,    precio_costo:8000,  categoria:"bebida" }
    ];

    const recetas = [
      { plato_id:1,  nombre:"Empanadas de carne",      ingredientes:[{ingrediente_id:12,cantidad:200,unidad:"g"},{ingrediente_id:2,cantidad:100,unidad:"g"}] },
      { plato_id:2,  nombre:"Ajiaco santafereño",      ingredientes:[{ingrediente_id:3,cantidad:200,unidad:"g"},{ingrediente_id:11,cantidad:150,unidad:"g"},{ingrediente_id:12,cantidad:150,unidad:"g"},{ingrediente_id:15,cantidad:1,unidad:"unidad"},{ingrediente_id:19,cantidad:50,unidad:"ml"},{ingrediente_id:16,cantidad:0.5,unidad:"unidad"}] },
      { plato_id:3,  nombre:"Patacones con hogao",     ingredientes:[{ingrediente_id:13,cantidad:2,unidad:"unidad"}] },
      { plato_id:4,  nombre:"Bandeja paisa",           ingredientes:[{ingrediente_id:2,cantidad:150,unidad:"g"},{ingrediente_id:9,cantidad:1,unidad:"porción"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:8,cantidad:1,unidad:"unidad"},{ingrediente_id:13,cantidad:1,unidad:"unidad"},{ingrediente_id:17,cantidad:1,unidad:"unidad"},{ingrediente_id:16,cantidad:0.5,unidad:"unidad"},{ingrediente_id:5,cantidad:1,unidad:"porción"}] },
      { plato_id:5,  nombre:"Lomo al trapo",           ingredientes:[{ingrediente_id:1,cantidad:350,unidad:"g"},{ingrediente_id:11,cantidad:200,unidad:"g"}] },
      { plato_id:6,  nombre:"Cazuela de mariscos",     ingredientes:[{ingrediente_id:7,cantidad:250,unidad:"g"},{ingrediente_id:18,cantidad:200,unidad:"ml"},{ingrediente_id:10,cantidad:1,unidad:"porción"}] },
      { plato_id:7,  nombre:"Mojarra frita",           ingredientes:[{ingrediente_id:6,cantidad:1,unidad:"unidad"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:13,cantidad:1,unidad:"unidad"}] },
      { plato_id:8,  nombre:"Pollo a la brasa",        ingredientes:[{ingrediente_id:3,cantidad:250,unidad:"g"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:17,cantidad:1,unidad:"unidad"}] },
      { plato_id:9,  nombre:"Chuleta valluna",         ingredientes:[{ingrediente_id:4,cantidad:300,unidad:"g"},{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:8,cantidad:1,unidad:"unidad"}] },
      { plato_id:10, nombre:"Tres leches",             ingredientes:[{ingrediente_id:19,cantidad:100,unidad:"ml"},{ingrediente_id:18,cantidad:50,unidad:"ml"},{ingrediente_id:8,cantidad:2,unidad:"unidad"}] },
      { plato_id:11, nombre:"Cuajada con melao",       ingredientes:[{ingrediente_id:21,cantidad:50,unidad:"g"}] },
      { plato_id:12, nombre:"Arroz con leche",         ingredientes:[{ingrediente_id:10,cantidad:1,unidad:"porción"},{ingrediente_id:19,cantidad:80,unidad:"ml"},{ingrediente_id:21,cantidad:30,unidad:"g"}] },
      { plato_id:13, nombre:"Limonada de coco",        ingredientes:[{ingrediente_id:20,cantidad:3,unidad:"unidad"},{ingrediente_id:18,cantidad:150,unidad:"ml"},{ingrediente_id:21,cantidad:30,unidad:"g"}] },
      { plato_id:14, nombre:"Jugo de lulo",            ingredientes:[{ingrediente_id:21,cantidad:20,unidad:"g"}] },
      { plato_id:15, nombre:"Agua de panela con limón",ingredientes:[{ingrediente_id:21,cantidad:50,unidad:"g"},{ingrediente_id:20,cantidad:2,unidad:"unidad"}] }
    ];

    localStorage.setItem('mesaio_ingredientes', JSON.stringify(ingredientes));
    localStorage.setItem('mesaio_recetas', JSON.stringify(recetas));
    localStorage.setItem('mesaio_facturas', JSON.stringify([]));
    localStorage.setItem('mesaio_factura_counter', '0');
    localStorage.setItem('mesaio_movimientos', JSON.stringify([]));
    localStorage.setItem('mesaio_arqueos', JSON.stringify([]));
    localStorage.setItem('mesaio_cierres', JSON.stringify([]));
    localStorage.setItem('mesaio_v2_seed', 'true');
    console.log('✓ Mesaio V2 inicializado: 25 ingredientes + 15 recetas + Arqueo + Cierre');
  },

  // ══════════════════════════════════════════════════════════
  // V2 — INVENTARIO
  // ══════════════════════════════════════════════════════════

  getIngredientes() {
    return JSON.parse(localStorage.getItem('mesaio_ingredientes') || '[]');
  },

  updateStock(ingredienteId, delta) {
    const ingredientes = this.getIngredientes();
    const ing = ingredientes.find(i => i.id === ingredienteId);
    if (!ing) return;
    ing.stock = Math.max(0, ing.stock + delta);
    localStorage.setItem('mesaio_ingredientes', JSON.stringify(ingredientes));
  },

  descontarInventarioOrden(ordenId) {
    const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return [];
    const recetas = JSON.parse(localStorage.getItem('mesaio_recetas') || '[]');
    const cambios = [];
    orden.items.forEach(item => {
      const receta = recetas.find(r => r.plato_id === item.plato_id);
      if (!receta) return;
      receta.ingredientes.forEach(ing => {
        const cantidadTotal = ing.cantidad * item.cantidad;
        this.updateStock(ing.ingrediente_id, -cantidadTotal);
        const ingrediente = this.getIngredientes().find(i => i.id === ing.ingrediente_id);
        if (ingrediente) cambios.push(`-${cantidadTotal}${ing.unidad} ${ingrediente.nombre}`);
      });
    });
    return cambios;
  },

  getAlertasStock() {
    return this.getIngredientes().filter(i => i.stock <= i.stock_minimo);
  },

  getCostoOrden(ordenId) {
    const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return 0;
    const recetas = JSON.parse(localStorage.getItem('mesaio_recetas') || '[]');
    const ingredientes = this.getIngredientes();
    let costo = 0;
    orden.items.forEach(item => {
      const receta = recetas.find(r => r.plato_id === item.plato_id);
      if (!receta) return;
      receta.ingredientes.forEach(ing => {
        const ingrediente = ingredientes.find(i => i.id === ing.ingrediente_id);
        if (ingrediente) costo += (ing.cantidad * ingrediente.precio_costo) * item.cantidad;
      });
    });
    return Math.round(costo);
  },

  // ══════════════════════════════════════════════════════════
  // V2 — CONTABILIDAD
  // ══════════════════════════════════════════════════════════

  registrarMovimiento(tipo, monto, descripcion, ordenId = null) {
    const movimientos = JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]');
    movimientos.push({
      id: movimientos.length + 1, tipo, monto, descripcion,
      orden_id: ordenId, created_at: new Date().toISOString()
    });
    localStorage.setItem('mesaio_movimientos', JSON.stringify(movimientos));
  },

  getMovimientosHoy() {
    const hoy = new Date().toDateString();
    return JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
      .filter(m => new Date(m.created_at).toDateString() === hoy);
  },

  getCierreCaja() {
    const movimientos = this.getMovimientosHoy();
    const ingresos = movimientos.filter(m => m.tipo === 'venta').reduce((s, m) => s + m.monto, 0);
    const egresos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
    return {
      ingresos, egresos, neto: ingresos - egresos,
      margen: ingresos > 0 ? (((ingresos - egresos) / ingresos) * 100).toFixed(1) : '0.0',
      numOperaciones: movimientos.length
    };
  },

  // ══════════════════════════════════════════════════════════
  // V2 — FACTURACIÓN
  // ══════════════════════════════════════════════════════════

  generarFactura(ordenId, metodoPago = 'efectivo') {
    const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]');
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return null;
    let counter = parseInt(localStorage.getItem('mesaio_factura_counter') || '0') + 1;
    const subtotal = orden.items.reduce((s, i) => s + (i.subtotal || (i.precio_unitario * i.cantidad) || 0), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    const factura = {
      id: counter, numero: String(counter).padStart(6, '0'),
      orden_id: ordenId, mesa_id: orden.mesa_id,
      mesero_nombre: orden.mesero_nombre || orden.mesero || 'Mesero',
      items: orden.items.map(i => ({
        nombre: i.plato_nombre || i.nombre || i.plato || 'Item',
        cantidad: i.cantidad || 1,
        precio_unitario: i.precio_unitario || i.precio || 0,
        subtotal: i.subtotal || ((i.precio_unitario || 0) * (i.cantidad || 1))
      })),
      subtotal, iva, propina_sugerida: Math.round(subtotal * 0.10), total,
      metodo_pago: metodoPago, estado: 'pagada',
      cufe: this.generarCUFE(), resolucion_dian: '18764020853100 del 2026-01-01',
      cliente_nombre: 'Consumidor Final', created_at: new Date().toISOString()
    };
    const facturas = JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
    facturas.push(factura);
    localStorage.setItem('mesaio_facturas', JSON.stringify(facturas));
    localStorage.setItem('mesaio_factura_counter', String(counter));
    this.registrarMovimiento('venta', total, `Factura #${factura.numero} — Mesa ${orden.mesa_id}`, ordenId);
    const costoIngredientes = this.getCostoOrden ? this.getCostoOrden(ordenId) : 0;
    if (costoIngredientes > 0) this.registrarMovimiento('gasto', costoIngredientes, `Costo Factura #${factura.numero}`, ordenId);
    return factura;
  },

  getFacturas() {
    return JSON.parse(localStorage.getItem('mesaio_facturas') || '[]');
  },

  getFacturasHoy() {
    const hoy = new Date().toDateString();
    return this.getFacturas().filter(f => new Date(f.created_at).toDateString() === hoy);
  },

  generarCUFE() {
    return String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
  },

  // ══════════════════════════════════════════════════════════
  // V2 — INIT COMPLETO
  // ══════════════════════════════════════════════════════════

  initAppV2() {
    this.init();
    this.initV2();
  },

  cargarDemoData() {
    const hoy = new Date();
    const movimientos = [];
    const facturas = [];
    const arqueos = [];
    const cierres = [];
    const meseros = ['Carlos M.', 'Diana R.', 'Felipe T.'];
    const platosDemo = [
      { nombre:'Bandeja paisa', precio:42000 },
      { nombre:'Ajiaco santafereño', precio:38000 },
      { nombre:'Mojarra frita', precio:55000 },
      { nombre:'Sancocho trifásico', precio:45000 },
      { nombre:'Limonada de coco', precio:12000 }
    ];
    let facturaCounter = 0;
    let movCounter = 0;
    for (let dia = 6; dia >= 0; dia--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - dia);
      const numOrdenes = 8 + Math.floor(Math.random() * 8);
      let ingresosDelDia = 0;
      let costosDelDia = 0;
      for (let i = 0; i < numOrdenes; i++) {
        const plato = platosDemo[Math.floor(Math.random() * platosDemo.length)];
        const cantidad = 1 + Math.floor(Math.random() * 3);
        const extras = platosDemo[Math.floor(Math.random() * platosDemo.length)];
        const subtotal = (plato.precio * cantidad) + extras.precio;
        const iva = Math.round(subtotal * 0.19);
        const total = subtotal + iva;
        const costo = Math.round(total * 0.22);
        facturaCounter++;
        const hora = new Date(fecha);
        hora.setHours(11 + Math.floor(Math.random() * 9));
        hora.setMinutes(Math.floor(Math.random() * 60));
        const mesaId = 1 + Math.floor(Math.random() * 12);
        facturas.push({
          id: facturaCounter,
          numero: facturaCounter,
          orden_id: facturaCounter,
          mesa_id: mesaId,
          mesero_nombre: meseros[Math.floor(Math.random() * meseros.length)],
          items: [
            { plato_nombre: plato.nombre, cantidad, precio_unitario: plato.precio, subtotal: plato.precio * cantidad },
            { plato_nombre: extras.nombre, cantidad: 1, precio_unitario: extras.precio, subtotal: extras.precio }
          ],
          subtotal_sin_iva: subtotal,
          iva,
          propina: 0,
          total,
          metodo_pago: ['efectivo','tarjeta','nequi'][Math.floor(Math.random() * 3)],
          cufe: String(Math.floor(Math.random() * 1e12)).padStart(12,'0'),
          cliente_nombre: 'Consumidor Final',
          created_at: hora.toISOString()
        });
        movCounter++;
        movimientos.push({ id: movCounter, tipo: 'venta', monto: total, descripcion: `Factura #${String(facturaCounter).padStart(6,'0')} · Mesa ${mesaId}`, orden_id: facturaCounter, created_at: hora.toISOString() });
        movCounter++;
        movimientos.push({ id: movCounter, tipo: 'gasto', monto: costo, descripcion: `Costo ingredientes Fac #${String(facturaCounter).padStart(6,'0')}`, orden_id: facturaCounter, created_at: hora.toISOString() });
        ingresosDelDia += total;
        costosDelDia += costo;
      }
      const disc = Math.floor(Math.random() * 5000) - 2000;
      arqueos.push({ id: arqueos.length + 1, esperado: ingresosDelDia, reportado: ingresosDelDia + disc, discrepancia: disc, created_at: new Date(fecha.setHours(21,0,0)).toISOString() });
      if (dia > 0) {
        const neto = ingresosDelDia - costosDelDia;
        cierres.push({ id: cierres.length + 1, fecha: new Date(fecha).toISOString().slice(0,10), responsable: ['Hernando S.','Diana R.','Carlos M.'][Math.floor(Math.random()*3)], notas: dia === 3 ? 'Alto tráfico, se agotó chicharrón' : '', ingresos: ingresosDelDia, costos: costosDelDia, neto, ordenes_count: numOrdenes, facturas_count: numOrdenes, movimientos_count: numOrdenes * 2, created_at: new Date(fecha.setHours(22,30,0)).toISOString(), cerrado: true });
      }
    }
    // Stock bajo para demo visual
    const ings = this.getIngredientes();
    if (ings.length >= 12) {
      ings[0].stock = 3200;
      ings[1].stock = 1800;
      ings[2].stock = 1200;
      ings[5].stock = 2;
      ings[8].stock = 12;
      localStorage.setItem('mesaio_ingredientes', JSON.stringify(ings));
    }
    localStorage.setItem('mesaio_facturas', JSON.stringify(facturas));
    localStorage.setItem('mesaio_factura_counter', String(facturaCounter));
    localStorage.setItem('mesaio_movimientos', JSON.stringify(movimientos));
    localStorage.setItem('mesaio_arqueos', JSON.stringify(arqueos));
    localStorage.setItem('mesaio_cierres', JSON.stringify(cierres));
    return { facturas: facturas.length, movimientos: movimientos.length, arqueos: arqueos.length, cierres: cierres.length };
  },

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
      id: arqueos.length + 1, fecha: new Date().toISOString(),
      efectivo_esperado: esperado, efectivo_reportado: reportado,
      discrepancia, estado,
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
    return this.getCierres().find(c => new Date(c.fecha).toDateString() === hoy && c.estado === 'cerrado');
  },

  isDiaCerrado() {
    return !!this.getDiaEstaActuallyCerrado();
  },

  generarCierreDia(responsable, notas) {
    const hoy = new Date();
    const cierre = this.getCierreCaja();
    const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]')
      .filter(o => new Date(o.created_at).toDateString() === hoy.toDateString());
    const facturas = this.getFacturasHoy();
    const movimientos = this.getMovimientosHoy();
    const registro = {
      id: this.getCierres().length + 1, fecha: hoy.toISOString(),
      responsable, notas, cierre_caja: cierre,
      ordenes_count: ordenes.length, facturas_count: facturas.length,
      transacciones_count: movimientos.length, cufe_cierre: this.generarCUFE(), estado: 'cerrado'
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
    if (idx >= 0) { cierres[idx].estado = 'reabierto'; localStorage.setItem('mesaio_cierres', JSON.stringify(cierres)); }
  },

  // ══════════════════════════════════════════════════════════
  // V2 — INVESTORS ANALYTICS
  // ══════════════════════════════════════════════════════════

  getMovimientosUltimosNDias(n) {
    const hace = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    return JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]')
      .filter(m => new Date(m.created_at) >= hace);
  },

  getAnaliticsUltimosNDias(n) {
    const movimientos = this.getMovimientosUltimosNDias(n);
    const ingresos = movimientos.filter(m => m.tipo === 'venta').reduce((s, m) => s + m.monto, 0);
    const costos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
    const hace = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]').filter(o => new Date(o.created_at) >= hace);
    const ganancia = ingresos - costos;
    const margen = ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : '0.0';
    return { ingresos, costos, ganancia, margen, ticketPromedio: ordenes.length > 0 ? Math.round(ingresos / ordenes.length) : 0, ordenes_count: ordenes.length, dias_en_periodo: n };
  },

  getAnaliticssPorDia(n) {
    const resultado = [];
    for (let i = n - 1; i >= 0; i--) {
      const fecha = new Date(); fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toDateString();
      const movimientos = JSON.parse(localStorage.getItem('mesaio_movimientos') || '[]').filter(m => new Date(m.created_at).toDateString() === fechaStr);
      const ingresos = movimientos.filter(m => m.tipo === 'venta').reduce((s, m) => s + m.monto, 0);
      const costos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
      const ordenes = JSON.parse(localStorage.getItem('mesaio_ordenes') || '[]').filter(o => new Date(o.created_at).toDateString() === fechaStr).length;
      const ganancia = ingresos - costos;
      resultado.push({ fecha: fecha.toLocaleDateString('es-CO'), ingresos, costos, ganancia, margen: ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : '0.0', ordenes });
    }
    return resultado;
  },

  toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'mesaio-toast';
    const bg = type === 'ok' ? '#D4EDDA' : type === 'err' ? '#FCE8E8' : '#DBEAFE';
    const fg = type === 'ok' ? '#155724' : type === 'err' ? '#721C24' : '#1565C0';
    t.style.cssText = `position:fixed;top:80px;right:20px;z-index:9999;padding:14px 22px;border-radius:12px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.18);background:${bg};color:${fg};max-width:340px;animation:mesaioSlide .3s ease`;
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }
};

// CSS animation toast
(function injectToastCSS(){
  if (document.getElementById('mesaio-toast-css')) return;
  const s = document.createElement('style');
  s.id = 'mesaio-toast-css';
  s.textContent = '@keyframes mesaioSlide{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}';
  document.head.appendChild(s);
})();
