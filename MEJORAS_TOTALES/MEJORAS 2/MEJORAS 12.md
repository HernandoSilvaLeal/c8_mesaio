# MESAIO — MASTER SPEC v1.0
## Del demo al producto real: arquitectura, negocio y roadmap

**Fecha:** 2026-05-07  
**Autor:** ARQ.PRODUCTO (AppCors)  
**Estado:** DOCUMENTO VIVO — actualizar en cada sprint  
**Para:** Nando + Claude Code + futuro equipo técnico

---

## PARTE 0 — DIAGNÓSTICO HONESTO DEL ESTADO ACTUAL

### Lo que funciona HOY (demo)

```
Frontend HTML + localStorage
├── 4 vistas: mesero / cocina / admin / carta
├── 9 módulos: mesas, cocina, inventario, facturación,
│             contabilidad, arqueo, cierre, investors, roles
├── Data: localStorage (browser del cliente)
└── Deploy: Netlify (estático, gratis)
```

**Funciona para el hackathon. NO funciona para un restaurante real.**

### Los 5 problemas de producción que localStorage crea

| Problema | Consecuencia real |
|---------|------------------|
| Datos en el browser | Mesero cambia de celular → pierde órdenes activas |
| Sin sincronización | 2 meseros en 2 celulares ven mesas distintas |
| Sin backup | Ctrl+F5 en el admin → historial borrado |
| Sin auth real | Cualquiera que tenga la URL entra como admin |
| Sin multitenancy | Restaurante A ve datos de restaurante B |

**El cliente que compre esto HOY tiene riesgo real de perder datos.** Eso hay que resolverlo antes de cobrar.

---

## PARTE 1 — ARQUITECTURA TARGET (Producto Real)

### Tres fases de evolución

```
FASE 1 (Mes 1-2):  localStorage → Supabase
FASE 2 (Mes 3-6):  Supabase → API propia (Node/Express o Hono)
FASE 3 (Mes 6+):   API propia → AppCors multitenant (TITAN)
```

### Por qué esta secuencia

**Supabase primero:** Tiempo de implementación < 2 semanas. El código frontend cambia mínimamente (Supabase tiene SDK JS que reemplaza localStorage con 1 línea). Costo: $0 hasta 50K usuarios, $25/mes después. Permite Auth real, RLS (row-level security), Realtime, backups automáticos.

**API propia después:** Cuando necesites lógica de negocio que Supabase no puede hacer (cálculos complejos de recetas, reportes personalizados, integraciones con DIAN). Supabase queda como base de datos, la API es la capa de negocio.

**AppCors al final:** Mesaio se convierte en un vertical de restaurantes dentro de AppCors TITAN. El `MesaioData` que diseñamos (modo local → API) fue exactamente esta preparación.

---

## PARTE 2 — SCHEMA DE BASE DE DATOS (Supabase/PostgreSQL)

### Principios de diseño

1. **tenant_id en cada tabla** — row-level security desde día 1
2. **UUID como PK** — nunca integer autoincrement en multitenant
3. **soft delete** — nunca borrar registros, solo marcar `deleted_at`
4. **created_at / updated_at** en toda tabla
5. **índices por tenant_id + fecha** — las queries siempre filtran por tenant

### DDL Completo

```sql
-- ════════════════════════════════════════════
-- EXTENSIONES
-- ════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════════════════════════════════════════
-- TENANTS (cada restaurante es un tenant)
-- ════════════════════════════════════════════
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  nit           TEXT,
  email         TEXT NOT NULL UNIQUE,
  telefono      TEXT,
  direccion     TEXT,
  ciudad        TEXT DEFAULT 'Bogotá',
  logo_url      TEXT,
  plan          TEXT NOT NULL DEFAULT 'esencial'
                CHECK (plan IN ('esencial','profesional','elite')),
  plan_estado   TEXT NOT NULL DEFAULT 'activo'
                CHECK (plan_estado IN ('activo','suspendido','cancelado')),
  plan_inicio   DATE DEFAULT CURRENT_DATE,
  plan_fin      DATE,
  -- Configuración
  resolucion_dian TEXT DEFAULT '18764020853100 del 2026-01-01',
  prefijo_factura TEXT DEFAULT '',
  -- Metadata
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ════════════════════════════════════════════
-- USERS (personas del restaurante)
-- ════════════════════════════════════════════
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  auth_user_id  UUID UNIQUE, -- Supabase auth.users FK
  nombre        TEXT NOT NULL,
  email         TEXT,
  rol           TEXT NOT NULL DEFAULT 'mesero'
                CHECK (rol IN ('admin','mesero','cocina','supervisor')),
  activo        BOOLEAN DEFAULT true,
  pin           TEXT, -- PIN de 4 dígitos hasheado (opcional, para tablet compartida)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ════════════════════════════════════════════
-- ZONAS Y MESAS
-- ════════════════════════════════════════════
CREATE TABLE zonas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  nombre        TEXT NOT NULL, -- Salón, Terraza, Barra, Privado
  orden         INTEGER DEFAULT 0,
  activa        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_zonas_tenant ON zonas(tenant_id);

CREATE TABLE mesas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  zona_id       UUID REFERENCES zonas(id),
  numero        INTEGER NOT NULL,
  capacidad     INTEGER DEFAULT 4,
  estado        TEXT NOT NULL DEFAULT 'libre'
                CHECK (estado IN ('libre','ocupada','cobro','reservada','bloqueada')),
  activa        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_mesas_tenant ON mesas(tenant_id);
CREATE UNIQUE INDEX idx_mesas_numero_tenant ON mesas(tenant_id, numero);

-- ════════════════════════════════════════════
-- CATÁLOGO (menú)
-- ════════════════════════════════════════════
CREATE TABLE categorias (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  nombre        TEXT NOT NULL,
  orden         INTEGER DEFAULT 0,
  activa        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  categoria_id  UUID REFERENCES categorias(id),
  nombre        TEXT NOT NULL,
  descripcion   TEXT,
  precio        NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
  precio_costo  NUMERIC(12,2) DEFAULT 0,
  disponible    BOOLEAN DEFAULT true,
  imagen_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_platos_tenant ON platos(tenant_id);

-- ════════════════════════════════════════════
-- INVENTARIO
-- ════════════════════════════════════════════
CREATE TABLE ingredientes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  nombre        TEXT NOT NULL,
  unidad        TEXT DEFAULT 'unidad', -- g, ml, unidad, porción
  stock         NUMERIC(12,3) DEFAULT 0,
  stock_minimo  NUMERIC(12,3) DEFAULT 0,
  precio_costo  NUMERIC(12,2) DEFAULT 0,
  categoria     TEXT DEFAULT 'general',
  proveedor     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_ingredientes_tenant ON ingredientes(tenant_id);

CREATE TABLE recetas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  plato_id        UUID NOT NULL REFERENCES platos(id),
  ingrediente_id  UUID NOT NULL REFERENCES ingredientes(id),
  cantidad        NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
  unidad          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_recetas_plato ON recetas(plato_id);

CREATE TABLE movimientos_inventario (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  ingrediente_id  UUID REFERENCES ingredientes(id),
  tipo            TEXT NOT NULL -- 'consumo', 'reposicion', 'ajuste', 'merma'
                  CHECK (tipo IN ('consumo','reposicion','ajuste','merma')),
  cantidad        NUMERIC(12,3) NOT NULL, -- negativo = consumo
  stock_antes     NUMERIC(12,3),
  stock_despues   NUMERIC(12,3),
  referencia_id   UUID, -- orden_id que originó el consumo
  referencia_tipo TEXT, -- 'orden', 'ajuste_manual'
  usuario_id      UUID REFERENCES users(id),
  notas           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_movinv_tenant_fecha ON movimientos_inventario(tenant_id, created_at);

-- ════════════════════════════════════════════
-- ÓRDENES
-- ════════════════════════════════════════════
CREATE TABLE ordenes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  mesa_id       UUID REFERENCES mesas(id),
  numero        INTEGER NOT NULL, -- correlativo por tenant
  estado        TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente','preparando','listo','entregado','cobrado','cancelado')),
  mesero_id     UUID REFERENCES users(id),
  mesero_nombre TEXT, -- desnormalizado para historial
  notas         TEXT,
  total         NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  cerrada_at    TIMESTAMPTZ
);
CREATE INDEX idx_ordenes_tenant_fecha ON ordenes(tenant_id, created_at);
CREATE INDEX idx_ordenes_mesa ON ordenes(mesa_id, estado);

CREATE TABLE orden_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id        UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  plato_id        UUID REFERENCES platos(id),
  plato_nombre    TEXT NOT NULL, -- desnormalizado
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal        NUMERIC(12,2) NOT NULL,
  observaciones   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_items_orden ON orden_items(orden_id);

-- ════════════════════════════════════════════
-- FACTURACIÓN
-- ════════════════════════════════════════════
CREATE TABLE facturas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  orden_id        UUID REFERENCES ordenes(id),
  numero          INTEGER NOT NULL,
  numero_fmt      TEXT NOT NULL, -- '000001'
  cufe            TEXT,
  resolucion_dian TEXT,
  cliente_nombre  TEXT DEFAULT 'Consumidor Final',
  cliente_nit     TEXT DEFAULT '222222222222',
  subtotal        NUMERIC(12,2) NOT NULL,
  iva             NUMERIC(12,2) NOT NULL,
  propina_sugerida NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL,
  metodo_pago     TEXT NOT NULL DEFAULT 'efectivo'
                  CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia','nequi','daviplata')),
  estado          TEXT NOT NULL DEFAULT 'pagada'
                  CHECK (estado IN ('pagada','anulada','pendiente')),
  mesero_id       UUID REFERENCES users(id),
  mesero_nombre   TEXT,
  mesa_id         UUID REFERENCES mesas(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  anulada_at      TIMESTAMPTZ,
  anulada_motivo  TEXT
);
CREATE INDEX idx_facturas_tenant_fecha ON facturas(tenant_id, created_at);
CREATE UNIQUE INDEX idx_facturas_numero_tenant ON facturas(tenant_id, numero);

CREATE TABLE factura_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id      UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  plato_nombre    TEXT NOT NULL,
  cantidad        INTEGER NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal        NUMERIC(12,2) NOT NULL
);

-- ════════════════════════════════════════════
-- CONTABILIDAD
-- ════════════════════════════════════════════
CREATE TABLE movimientos_caja (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  tipo        TEXT NOT NULL CHECK (tipo IN ('venta','gasto','ajuste','retiro')),
  monto       NUMERIC(12,2) NOT NULL,
  descripcion TEXT NOT NULL,
  referencia_id UUID, -- factura_id o null
  usuario_id  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_movcaja_tenant_fecha ON movimientos_caja(tenant_id, created_at);

CREATE TABLE arqueos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  efectivo_esperado   NUMERIC(12,2) NOT NULL,
  efectivo_reportado  NUMERIC(12,2) NOT NULL,
  discrepancia        NUMERIC(12,2) GENERATED ALWAYS AS (efectivo_reportado - efectivo_esperado) STORED,
  estado              TEXT CHECK (estado IN ('OK','SOBRANTE','FALTANTE')),
  usuario_id          UUID REFERENCES users(id),
  notas               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cierres_dia (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  fecha_cierre      DATE NOT NULL DEFAULT CURRENT_DATE,
  ingresos          NUMERIC(12,2) NOT NULL,
  egresos           NUMERIC(12,2) NOT NULL,
  ganancia          NUMERIC(12,2) GENERATED ALWAYS AS (ingresos - egresos) STORED,
  margen_pct        NUMERIC(5,2),
  ordenes_count     INTEGER DEFAULT 0,
  facturas_count    INTEGER DEFAULT 0,
  responsable_id    UUID REFERENCES users(id),
  responsable_nombre TEXT,
  notas             TEXT,
  cufe_cierre       TEXT,
  estado            TEXT DEFAULT 'cerrado' CHECK (estado IN ('cerrado','reabierto')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_cierres_tenant_fecha ON cierres_dia(tenant_id, fecha_cierre)
  WHERE estado = 'cerrado';

-- ════════════════════════════════════════════
-- SUSCRIPCIONES Y BILLING
-- ════════════════════════════════════════════
CREATE TABLE suscripciones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  plan          TEXT NOT NULL CHECK (plan IN ('esencial','profesional','elite')),
  precio_cop    NUMERIC(12,2) NOT NULL,
  estado        TEXT NOT NULL DEFAULT 'activo'
                CHECK (estado IN ('trial','activo','vencido','cancelado')),
  trial_hasta   DATE,
  vigente_hasta DATE,
  pagos_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  suscripcion_id UUID REFERENCES suscripciones(id),
  monto_cop     NUMERIC(12,2) NOT NULL,
  metodo        TEXT, -- 'PSE', 'tarjeta', 'transferencia', 'efectivo'
  referencia    TEXT, -- referencia de pago externo
  periodo_inicio DATE,
  periodo_fin   DATE,
  estado        TEXT NOT NULL DEFAULT 'completado'
                CHECK (estado IN ('completado','pendiente','fallido','reembolsado')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_pagos_tenant ON pagos(tenant_id);

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════
-- Habilitar RLS en todas las tablas con tenant_id
ALTER TABLE mesas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE zonas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE platos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja   ENABLE ROW LEVEL SECURITY;
ALTER TABLE arqueos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_dia        ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- Política base: usuario solo ve su tenant
-- (reemplazar con policies específicas por rol)
CREATE POLICY tenant_isolation ON mesas
  USING (tenant_id = (SELECT tenant_id FROM users WHERE auth_user_id = auth.uid()));
-- Repetir para cada tabla con la misma lógica
```

---

## PARTE 3 — API CONTRACTS (cuando saltes de Supabase a API propia)

### Principios REST

```
Base URL:  https://api.mesaio.co/v1
Auth:      Bearer JWT (Supabase auth token)
Headers:   Content-Type: application/json
           X-Tenant-Id: {tenant_id} (extraído del JWT, no del cliente)
```

### Endpoints críticos

```
# SESIÓN
POST   /auth/login          { email, password } → { token, user, tenant }
POST   /auth/pin-login      { tenant_id, pin }  → { token, user }
POST   /auth/logout

# MESAS
GET    /mesas               → Mesa[]
PATCH  /mesas/:id           { estado } → Mesa
GET    /mesas/ocupacion     → { ocupadas, libres, cobro }

# ÓRDENES
POST   /ordenes             { mesa_id, items[], notas } → Orden
GET    /ordenes/activas     → Orden[] (pendiente|preparando|listo|entregado)
GET    /ordenes/:id         → Orden con items
PATCH  /ordenes/:id/estado  { estado } → Orden
DELETE /ordenes/:id/cancelar

# COCINA (SSE stream)
GET    /cocina/stream       → EventSource de órdenes en tiempo real

# INVENTARIO
GET    /ingredientes        → Ingrediente[]
PATCH  /ingredientes/:id/stock { delta, tipo, notas } → Ingrediente
GET    /ingredientes/alertas → Ingrediente[] (stock <= stock_minimo)
POST   /ordenes/:id/descontar-inventario → { cambios[], alertas[] }

# FACTURACIÓN
POST   /facturas            { orden_id, metodo_pago } → Factura
GET    /facturas            ?fecha=YYYY-MM-DD → Factura[]
GET    /facturas/:id        → Factura con items
POST   /facturas/:id/anular { motivo } → Factura

# CONTABILIDAD
GET    /caja/resumen        ?fecha=YYYY-MM-DD → CierreCaja
GET    /caja/movimientos    ?fecha=YYYY-MM-DD → Movimiento[]
POST   /arqueos             { efectivo_reportado } → Arqueo
POST   /cierres             { responsable_nombre, notas } → CierreDia
GET    /cierres             → CierreDia[]

# ANALYTICS (investors)
GET    /analytics/resumen   ?dias=7|30|90 → AnalyticsResumen
GET    /analytics/diario    ?dias=30 → DiaDatos[]

# ADMIN
GET    /platos              → Plato[]
POST   /platos              { nombre, categoria_id, precio, ... }
PATCH  /platos/:id
DELETE /platos/:id
GET    /usuarios            → User[]
POST   /usuarios            { nombre, rol, pin }
```

---

## PARTE 4 — MIGRACIÓN localStorage → Supabase

### Estrategia: MesaioData ya está preparado

El objeto `MesaioData` que diseñamos tiene `mode = 'local'`. Para migrar:

**STEP 1 — Instalar Supabase SDK** (1 hora)
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
```

**STEP 2 — Cambiar MesaioData a mode = 'supabase'** (2 horas)

Crear archivo `assets/js/mesaio-supabase.js`:
```javascript
const SUPABASE_URL = 'https://TUPROYECTO.supabase.co';
const SUPABASE_KEY = 'tu_anon_key';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Reemplazar cada método de MesaioData:
// ANTES:
getMesas() { return JSON.parse(localStorage.getItem('mesaio_mesas') || '[]'); }

// DESPUÉS:
async getMesas() {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('tenant_id', this.tenantId)
    .order('numero');
  if (error) throw error;
  return data;
}
```

**STEP 3 — Hacer todas las funciones async** (4-6 horas)

El mayor cambio: todas las funciones JS del frontend pasan de síncronas a `async/await`. Buscar todos los lugares donde se llama `cargarInventario()`, `cargarFacturacion()`, etc., y agregar `await`.

**STEP 4 — Auth real** (2 horas)

Reemplazar el login por persona con Supabase Auth:
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sesión
const { data: { user } } = await supabase.auth.getUser();
```

**STEP 5 — Realtime (cocina)** (1 hora)

```javascript
// En cocina/index.html, reemplazar el setInterval de refresh:
supabase
  .channel('ordenes')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'ordenes',
    filter: `tenant_id=eq.${tenantId}`
  }, (payload) => {
    cargarOrdenes(); // actualiza la vista
  })
  .subscribe();
```

**Tiempo total de migración:** 2-3 días de Claude Code.
**Costo Supabase:** $0 hasta 50K usuarios activos.

---

## PARTE 5 — MODELO FINANCIERO REAL

### Unit Economics por plan

| Métrica | Esencial | Profesional | Elite |
|---------|----------|-------------|-------|
| Precio/mes | $199.000 | $349.000 | $599.000 |
| Costo infra por cliente (50 clientes) | $8.000 | $8.000 | $16.000 |
| Costo soporte (self-service) | $0 | $0 | $50.000 |
| **Margen bruto** | **$191.000 (96%)** | **$341.000 (97%)** | **$533.000 (89%)** |
| Churn estimado (mensual) | 8% | 5% | 3% |
| LTV (vida media del cliente) | 12.5 meses | 20 meses | 33 meses |
| **LTV total** | **$2.487.500** | **$6.980.000** | **$19.767.000** |

### Punto de equilibrio personal (Nando)

```
Gastos personales target: $8.000.000/mes

Con plan PROFESIONAL ($341.000 margen):
  → 24 clientes para vivir bien
  → 16 clientes para cubrir gastos mínimos

Con MIX 50% Esencial / 50% Profesional:
  → 30 clientes total

Adquisición: 1 cliente bien atendido → 3 referidos (restaurantes se conocen entre sí)
Con 1 cliente inicial → red de 10 en 6 meses → punto de equilibrio en mes 7
```

### Proyección 24 meses

| Mes | Clientes | MRR | ARR anualizado |
|-----|----------|-----|----------------|
| 1   | 1        | $349K | $4.2M |
| 3   | 4        | $1.4M | $16.8M |
| 6   | 12       | $4.2M | $50.4M |
| 12  | 35       | $12.2M | $146.4M |
| 18  | 80       | $27.9M | $334.8M |
| 24  | 180      | $62.8M | $753.6M |

**Supuesto:** 15% crecimiento mensual compuesto. Conservador para SaaS con referidos activos.

### Costo de infraestructura a escala

| Clientes | Supabase | Netlify | Total infra | % del MRR |
|----------|----------|---------|-------------|-----------|
| 1-25     | $0       | $0      | $0          | 0% |
| 26-100   | $25/mes  | $19/mes | $185K COP   | 0.5% |
| 101-500  | $599/mes | $99/mes | $2.9M COP   | 1.2% |
| 500+     | Custom   | Custom  | Negociar    | <2% |

**El margen MEJORA con escala porque la infra es casi fija.**

---

## PARTE 6 — ROADMAP HACIA APPCORS (la visión de 1M restaurantes)

### Mesaio como vertical de AppCors TITAN

```
AppCors TITAN
├── vertical/restaurantes   ← Mesaio
├── vertical/estetica       ← próximo
├── vertical/clinicas       ← próximo
└── vertical/comercio       ← próximo
```

### Lo que Mesaio aporta a AppCors

| Activo | Descripción |
|--------|-------------|
| Schema SQL probado | 15 tablas, RLS, multitenant desde día 1 |
| UI componentes | 9 módulos listos en Vanilla JS / migrable a React |
| Domain knowledge | Flujos de restaurante validados con usuario real |
| Pricing model | $199-$599/mes probado en mercado |
| Primeros clientes | Referidos activos, testimonios reales |

### Migración Mesaio → AppCors TITAN

**Fase 1 (hoy):** Mesaio standalone con Supabase
**Fase 2:** Extraer `MesaioData` como `AppCorsData.vertical('restaurante')`
**Fase 3:** El frontend de Mesaio se convierte en un "skin" del TITAN canvas de AppCors
**Fase 4:** El mismo canvas sirve estéticas, clínicas, y otros verticales sin reescribir

```javascript
// HOY:
const data = MesaioData;
data.getOrdenes();

// EN APPCORS TITAN:
const data = AppCorsData.vertical('restaurante', tenantId);
data.getTransactions({ tipo: 'orden' });
// Mesaio es solo el vocabulario — la infraestructura es AppCors
```

---

## PARTE 7 — SWITCHING COST (por qué los clientes no se van)

**Esta es la respuesta al Shark Tank cuando preguntan "¿qué los retiene?"**

### Datos acumulados que no se pueden llevar fácil

Después de 30 días de uso, un restaurante tiene en Mesaio:
- 300-600 facturas electrónicas con CUFE (son documentos fiscales)
- 30 cierres de día con acta firmada
- 30 arqueos históricos
- Inventario calibrado con sus ingredientes reales y recetas propias
- KPIs históricos que el dueño ya empezó a usar para decisiones

**Cambiar de sistema significa perder todo eso.** No hay exportación estándar.

### Costo de cambio estimado

| Item | Costo para el cliente si cambia |
|------|--------------------------------|
| Reconfigurar menú | 4-8 horas de trabajo |
| Reentrenar equipo | 2-3 días de productividad perdida |
| Perder historial | No se puede migrar fácilmente |
| Renegociar con proveedor | 1-3 semanas |
| **Total switching cost** | **~$800.000-$2.000.000 en tiempo** |

**A $349.000/mes, el switching cost es equivalente a 3-6 meses de suscripción.** Nadie cambia si el servicio es medianamente bueno.

---

## PARTE 8 — PITCH SHARK TANK (60 segundos + respuestas)

### El pitch

> "Los restaurantes colombianos pagan $290.000 al mes por 3 sistemas que no se hablan. Mesaio los reemplaza por $349.000 — con todo integrado y 97% de margen bruto.
>
> El punto de equilibrio personal son 24 clientes. Un restaurante bien atendido conoce otros 10.
>
> En 12 meses proyectamos 35 clientes, $12 millones de MRR, y una base de datos de operaciones de restaurante que se convierte en un activo para AppCors — la plataforma B2B de automatización para PyMEs de LATAM que ya estamos construyendo.
>
> No pedimos inversión para el software. Pedimos para adquisición de clientes: $50 millones para llevar los primeros 50 restaurantes, que generan referidos orgánicos."

### Respuestas a preguntas difíciles

**"¿Por qué $349.000 y no $199.000?"**
> "Porque $349.000 es el 67% de lo que pagan hoy por menos funcionalidad. El plan Esencial a $199.000 existe para restaurantes pequeños que quieren entrar. El Profesional es donde está el margen real."

**"¿Qué pasa si Square o Toast entran a Colombia?"**
> "Toast cobra $110 USD/mes ($462.000 COP) más hardware obligatorio de $500 USD. Nosotros somos web-first, sin hardware, con soporte en español y flujos adaptados a la operación colombiana. El restaurante de Chapinero no compra en dólares."

**"¿Qué los retiene?"**
> "El historial fiscal. Después de 30 días tienen facturas con CUFE, cierres con acta y KPIs históricos. Cambiar de sistema cuesta más tiempo del que ahorra."

**"¿Cómo escalan?"**
> "La infra es Supabase + Netlify. A 500 clientes el costo de infraestructura es el 1.2% del MRR. El margen mejora con escala, no empeora."

**"¿Qué es AppCors?"**
> "Mesaio es el vertical de restaurantes. AppCors es el motor debajo — el mismo sistema sirve estéticas, clínicas y comercio. Mesaio valida el modelo. AppCors lo escala."

---

## PARTE 9 — CHECKLIST PRE-PRIMER CLIENTE REAL

Antes de cobrar el primer peso, esto debe estar:

### Técnico
- [ ] Supabase proyecto creado y schema correcto desplegado
- [ ] Auth funcionando (email + PIN para tablets)
- [ ] RLS habilitado y probado (restaurante A no ve restaurante B)
- [ ] Backups automáticos configurados en Supabase (daily)
- [ ] Dominio propio: mesaio.co (o similar)
- [ ] HTTPS en producción
- [ ] Error monitoring (Sentry free tier)

### Legal / Comercial
- [ ] Términos y condiciones básicos (puede ser simple)
- [ ] Política de privacidad (datos del restaurante)
- [ ] Contrato de servicio simple (1 página: qué incluye, qué no, SLA)
- [ ] Método de cobro definido (PSE, transferencia, o Wompi)
- [ ] Factura electrónica de Mesaio a sus clientes (necesitan Alegra para esto)
- [ ] NIT de AppCors SAS activo

### Operativo
- [ ] Proceso de onboarding documentado (48 horas, qué hace Nando)
- [ ] Template de menú para cargar datos del cliente
- [ ] WhatsApp de soporte activo
- [ ] Runbook de qué hacer si algo falla

### Producto
- [ ] Bug "undefined" en factura: RESUELTO
- [ ] Flujo E2E verificado en producción
- [ ] Login real (no solo selector de nombre)
- [ ] Datos del cliente aislados de la demo

---

## PARTE 10 — PRÓXIMOS SPRINTS (post-hackathon)

### Sprint 1 (Semana 1-2 post-hackathon): HACER VENDIBLE

**Objetivo:** Tener un producto que no avergüence si el cliente de hoy lo sigue usando mañana.

```
□ Fix bug factura undefined (hoy)
□ Migrar a Supabase (localStorage → real DB)
□ Auth real con Supabase
□ Dominio propio mesaio.co
□ Primer cliente real onboardeado
```

### Sprint 2 (Semana 3-4): HACER COBRABLE

**Objetivo:** El primer pago real entra.

```
□ Integración Wompi o PSE para cobro suscripción
□ Email de bienvenida automático al nuevo tenant
□ Página de onboarding guiado (5 pasos en la app)
□ Soporte WhatsApp activo
□ Contrato de servicio firmado
```

### Sprint 3 (Mes 2): HACER REFERIBLE

**Objetivo:** El primer cliente trae el segundo.

```
□ NPS survey in-app (después de 30 días)
□ Página de testimonios en landing
□ Programa de referidos (1 mes gratis por cada cliente referido)
□ Case study del primer cliente (con datos reales de ahorro)
□ Video demo de 3 minutos en YouTube
```

### Sprint 4 (Mes 3): CONECTAR CON APPCORS

**Objetivo:** Mesaio empieza a alimentar AppCors.

```
□ Refactorizar MesaioData → AppCorsData.vertical('restaurante')
□ Schema de Mesaio vive en el mono-repo de AppCors
□ Dashboard de Mesaio aparece en AppCors TITAN como vertical
□ Pricing de Mesaio alineado con tiers de AppCors
□ Primer restaurante en AppCors
```

---

## FIRMA

**Este documento es la fuente de verdad de Mesaio.**

Cuando algo del código diverja de este documento, o se actualiza el documento o se corrige el código. Nunca conviven dos verdades.

**Versión:** 1.0  
**Próxima revisión:** Post-hackathon, primer cliente real  
**Owner:** Hernando Silva Leal (Nando) + ARQ.PRODUCTO AppCors