# MESAIO — SPEC DIAGNÓSTICO PARA EL ARQUITECTO

**De:** Claude Code (constructor)
**Para:** Claude Web (arquitecto)
**Misión:** Hackathon — MVP Restaurante en ≤ 50 minutos
**Premio:** $2.000.000 COP · Una sola bala de plata por instancia
**Repo:** `https://github.com/HernandoSilvaLeal/c8_mesaio`
**URL deploy:** `https://c8mesaio.netlify.app` (Netlify auto-deploy desde `main` — ✅ ACTIVO)
**Carpeta local:** `c:\Users\Acer\Desktop\_ACS_cX\c3_rnt\MVP_RESTAURANTE`

---

## 1. CONTEXTO ESTRATÉGICO — LEER PRIMERO

Estamos reutilizando un proyecto propio (RNT — Red Nacional de Transportes, sitio web premium ya en producción) para construir Mesaio (sistema integral de gestión de restaurante) en menos de 1 hora.

**Las reglas del hackathon permiten reutilizar proyectos propios.** Tenemos:
- Sistema de diseño completo navy+gold premium (RNT) → reskin a burgundy+gold (Mesaio)
- Panel admin funcional con Supabase Auth + CRUD + tablas + tabs (RNT `/admin`) → reskin a Mesaio admin
- Componentes reutilizables: hero premium, cards, badges, stepper de estados, footer, modales
- 4 archivos CSS ya fragmentados y mantenibles
- Vendors completos: Bootstrap 5.3.3, AOS, Swiper, FontAwesome, Bootstrap Icons

**Construido ya en MVP_RESTAURANTE/ por Claude Code antes de pasarte este SPEC:**
- ✅ `index.html` — homepage premium completo (10 actos narrativos)
- ✅ `login.html` — selector de rol (3 botones premium)
- ✅ `mesero/index.html` — mapa de mesas visual
- ✅ `cocina/index.html` — KDS de 3 columnas (pendiente / preparando / listo)
- ✅ `admin/index.html` — dashboard con tabs + tablas (placeholder Mesaio)
- ✅ `admin/_REFERENCIA_ADMIN_RNT.html` — código completo del admin RNT (Supabase Auth + CRUD funcional, ~3500 líneas) listo para reusar lógica
- ✅ `menu.html` — carta digital pública
- ✅ `assets/` — todo el folder RNT copiado (CSS, JS, vendor, img)

**FALTA detallar (TU TRABAJO ARQUITECTO):**
- Cableo Supabase real (schema + queries + Realtime)
- Flujo completo de toma de orden (mesero → cocina → entrega → cobro)
- Lógica de transición de estados
- Persistencia (LocalStorage para demo sin backend, Supabase para producción)
- Polish final de cada vista

---

## 2. STACK TECNOLÓGICO INMUTABLE

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework HTML | HTML5 puro | Sin React/Vue/Angular — velocidad máxima |
| CSS Base | Bootstrap 5.3.3 (CDN o vendor local) | Ya cargado en assets/vendor |
| CSS Custom | Inline `<style>` por página | Velocidad de iteración > organización |
| Iconos | Bootstrap Icons 1.11.3 | Vendor local + CDN fallback |
| Animaciones | AOS (Animate On Scroll) | Vendor local |
| Backend | Supabase (PostgreSQL + Auth + Realtime) | Mismo proyecto RNT o nuevo — al final |
| Deploy | Netlify (auto-deploy `main`) | Configurado por usuario |
| Persistencia demo | LocalStorage | Para demo offline antes de cablear Supabase |

**NO usar:**
- ❌ Frameworks JS (React/Vue/Angular/Svelte)
- ❌ Build tools (Vite/Webpack/Parcel)
- ❌ TypeScript
- ❌ Tailwind (usamos vanilla CSS + Bootstrap)
- ❌ Backends custom (Express/Node) — solo Supabase

---

## 3. BRAND IDENTITY MESAIO (decidida y aplicada)

```css
:root {
  --burgundy:    #5C1A2B;   /* primario — vino premium */
  --burgundy-dk: #3D0F1C;   /* hover oscuro */
  --burgundy-lt: #8B3A4E;   /* acento claro */
  --gold:        #C8A951;   /* dorado RNT reutilizado */
  --gold-lt:     #E2C87A;
  --gold-dk:     #9a7a1e;
  --cream:       #FAF6EE;   /* warm off-white background */
  --cream-2:     #F2EBDC;   /* warm beige alternativo */
  --charcoal:    #1F1318;   /* texto principal */
  --charcoal-2:  #5A4A4F;   /* texto secundario */
  --border:      #E8DDD0;
}
```

**Tipografía:**
- Display (h1-h4): **Playfair Display** 700/900 (serif premium para restaurante)
- Body: **Inter** 400-900 (sans moderna)
- Ambas cargadas vía Google Fonts en cada página

**Justificación:** El gold se reutiliza tal cual de RNT (reduce decisiones). El burgundy reemplaza el navy de RNT y aporta calidez gastronómica. La paleta cream/burgundy/gold es estándar de restaurantes premium globales (Per Se, Eleven Madison, Restaurante Andrés Carne de Res).

---

## 4. INVENTARIO DE REUTILIZACIÓN — RNT → MESAIO

### 4.1 ASSETS FÍSICOS (ya copiados)

| Origen RNT | Destino Mesaio | Acción |
|-----------|---------------|--------|
| `rnt_project/assets/vendor/` | `MVP_RESTAURANTE/assets/vendor/` | ✅ COPIADO — Bootstrap, Icons, AOS, Swiper, FontAwesome |
| `rnt_project/assets/css/main.css` | `MVP_RESTAURANTE/assets/css/main.css` | ✅ COPIADO — base de template (no se usa todo, opcional) |
| `rnt_project/assets/css/rnt-base.css` | reusar tal cual o inline en pages | Botones premium gold gradient |
| `rnt_project/assets/css/rnt-hero.css` | reusar/adaptar | Hero eyebrow, search-box, stats-strip |
| `rnt_project/assets/css/rnt-sections.css` | reusar paso-card, dif-card, testi-card | KDS column cards = paso-card stylizado |
| `rnt_project/assets/css/rnt-footer.css` | adaptar a burgundy | Footer premium |
| `rnt_project/assets/img/` | reemplazar logo RNT por logo Mesaio (texto SVG) | Imágenes mascota innecesarias |

### 4.2 COMPONENTES UI MAPEABLES 1:1

| Componente RNT | Componente Mesaio | Uso |
|---------------|-------------------|-----|
| Login admin RNT (Supabase Auth) | Login Mesaio | Misma estructura: email + password → routing por rol |
| `.dif-card` (3 cards diferenciadores) | `.role-card` (3 cards roles) | Mismo grid 3 col, mismo hover lift |
| `.paso-card` (3 pasos cómo funciona) | KDS column cards | Cards verticales con número grande arriba |
| `.testi-card` (testimonios sobre fondo dark) | Order cards en KDS | Cards con border-left de color por estado |
| Stepper RECIBIDO→EN_TRANSITO→ENTREGADO (rastreo) | Stepper de orden cocina (PEND→PREP→LISTO→ENTREGADO) | Idéntica lógica visual |
| Tabla `.rnt-table` (admin RNT) | Tabla CRUD platos/órdenes/usuarios | Misma tabla con badges de estado |
| Tabs `.rnt-tab` (admin) | Tabs admin Mesaio | 6 pestañas: Dashboard / Platos / Mesas / Usuarios / Órdenes / Reportes |
| Badges `.badge-estado` (RECIBIDO etc.) | Badges estado orden | Mismo patrón con colores diferentes |
| `.btn-primary-rnt` gold gradient | `.btn-mesaio` gold gradient | Idéntico — solo cambia variable |
| Hero stats strip (20+/99%/1103/12) | Hero stats Mesaio (3/<30s/100%) | Mismo `.stats-strip` con dividers |
| Cards pricing (4 col tarifas) | Cards menú destacado | Misma estructura con foto + precio |
| Modales Bootstrap (admin RNT) | Modal toma de orden | Reusar `_REFERENCIA_ADMIN_RNT.html` |
| `.section-title` con eyebrow + h2 + subtítulo | `.section-title-mesaio` | Idéntico — ya migrado |

### 4.3 LÓGICA REUTILIZABLE (código fuente referencia)

**Archivo clave:** `MVP_RESTAURANTE/admin/_REFERENCIA_ADMIN_RNT.html` (≈3500 líneas)

Incluye 100% funcional:
- Supabase Auth init (`window.__SB_URL__`, `window.__SB_KEY__`, `supabase.auth.signInWithPassword`)
- Login form con error handling + loading states
- Tabs SPA con state management
- CRUD genérico (crear, leer, actualizar, eliminar)
- Tabla con paginación, búsqueda, filtros por fecha
- Modal de detalle con historial
- Export CSV con BOM UTF-8 (Excel Colombia)
- Validación de inputs
- Toast notifications

**Mapping para Mesaio:**
```js
// RNT
supabase.from('guias').select('*')         → supabase.from('ordenes').select('*')
supabase.from('estados').insert({...})     → supabase.from('orden_items').insert({...})

// Schema RNT (guias + estados)        →   Schema Mesaio (ordenes + orden_items + platos + mesas + usuarios)
```

---

## 5. ESQUEMA DE DATOS MESAIO (Supabase)

### Tablas requeridas:

```sql
-- Usuarios con rol (gestionado por Supabase Auth + tabla extendida)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('mesero', 'cocinero', 'admin')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mesas físicas del restaurante
CREATE TABLE mesas (
  id SERIAL PRIMARY KEY,
  numero INT UNIQUE NOT NULL,
  capacidad INT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre', 'ocupada', 'cobro')),
  ubicacion TEXT  -- "terraza", "salon-principal", etc.
);

-- Catálogo de platos
CREATE TABLE platos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('entrada', 'fuerte', 'postre', 'bebida')),
  precio NUMERIC(10,2) NOT NULL,
  imagen_url TEXT,
  disponible BOOLEAN DEFAULT true,
  tiempo_prep_min INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Órdenes (header)
CREATE TABLE ordenes (
  id SERIAL PRIMARY KEY,
  mesa_id INT REFERENCES mesas(id),
  mesero_id UUID REFERENCES usuarios(id),
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'preparando', 'listo', 'entregada', 'cobrada', 'cancelada')),
  total NUMERIC(10,2) DEFAULT 0,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Items de cada orden (líneas)
CREATE TABLE orden_items (
  id SERIAL PRIMARY KEY,
  orden_id INT REFERENCES ordenes(id) ON DELETE CASCADE,
  plato_id INT REFERENCES platos(id),
  cantidad INT NOT NULL DEFAULT 1,
  precio_unit NUMERIC(10,2) NOT NULL,
  notas TEXT,
  estado TEXT DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'preparando', 'listo', 'entregado'))
);
```

### RLS Policies sugeridas:
- `usuarios`: SELECT solo el propio + admin ve todos
- `platos`: SELECT público (carta web), INSERT/UPDATE/DELETE solo admin
- `mesas`: SELECT autenticados, UPDATE meseros y admin
- `ordenes`: SELECT autenticados, INSERT meseros, UPDATE meseros + cocineros + admin
- `orden_items`: idéntico a ordenes

### Seed data mínima para demo:
- 12 mesas (numero 1-12, capacidades variadas)
- 15 platos (3 entradas, 6 fuertes, 3 postres, 3 bebidas — datos en `menu.html`)
- 3 usuarios demo: `mesero@mesaio.demo`, `cocina@mesaio.demo`, `admin@mesaio.demo` (password: `mesaio2026`)

---

## 6. ARQUITECTURA DE NAVEGACIÓN

```
/                       → index.html (landing pública)
/menu.html              → carta digital pública
/login.html             → selector de rol (demo) / login real (prod)
/mesero/                → panel mesero (mapa mesas + toma orden)
/cocina/                → KDS (kitchen display system)
/admin/                 → dashboard admin (CRUD + reportes)
/entregables/           → (futuro — espacio reservado para demos al jurado)
```

### `_redirects` Netlify sugerido:
```
/admin    /admin/index.html    200
/mesero   /mesero/index.html   200
/cocina   /cocina/index.html   200
/menu     /menu.html           200
```

---

## 7. FLUJOS CRÍTICOS A DETALLAR (TU TRABAJO ARQUITECTO)

### Flujo A — Mesero toma orden:
1. Mesero entra a `/mesero/`
2. Ve mapa de mesas (12 cards, estados color-coded)
3. Tap en mesa libre → modal "Nueva orden"
4. Modal con 4 tabs (entradas/fuertes/postres/bebidas)
5. Tap en plato → suma a "carrito de mesa" (sidebar)
6. Cantidades ajustables, observaciones por item
7. Botón "Enviar a cocina" → INSERT orden + items en Supabase
8. Mesa pasa a estado "ocupada"
9. Card de orden aparece en `/cocina/` (Realtime)

### Flujo B — Cocina prepara:
1. Cocinero entra a `/cocina/`
2. KDS de 3 columnas: Pendientes / Preparando / Listos
3. Click "Iniciar" en card pendiente → estado=preparando, aparece en col 2
4. Click "Marcar listo" → estado=listo, aparece en col 3, mesero recibe notificación
5. Cards rojas si llevan > 10 min sin moverse (alerta visual)

### Flujo C — Mesero entrega y cobra:
1. Mesero ve mesa en estado "listo" (notificación + cambio de color)
2. Tap mesa → "Marcar entregado"
3. Cuando cliente pide cuenta → "Pedir cuenta" → mesa pasa a "cobro"
4. Modal cuenta: total + propina sugerida 10% + división opcional
5. Confirma cobro → orden=cobrada, mesa=libre

### Flujo D — Admin gestiona:
1. Admin entra a `/admin/`
2. Dashboard: stats del día (ventas, órdenes, ocupación, plato top)
3. Tab Platos: CRUD completo con upload de imagen (URL externa OK para demo)
4. Tab Mesas: configurar número y capacidad
5. Tab Usuarios: invitar mesero/cocina (Supabase Auth + tabla usuarios)
6. Tab Órdenes: histórico con filtros + export CSV
7. Tab Reportes: ventas por día/semana, plato más vendido

---

## 8. PRIORIZACIÓN PARA EL TIEMPO LIMITADO

### CHECKPOINT 1 — RENDERIZADO (debe estar para el primer corte):
✅ index.html público + login.html — YA HECHO
✅ mesero/cocina/admin con UI estática + datos hardcoded — YA HECHO
✅ Navegación entre secciones funciona — YA HECHO
✅ Deploy Netlify activo — PENDIENTE PUSH (Claude Code lo hace ahora)

### CHECKPOINT 2 — INTERACTIVIDAD JS (sin backend):
- Carrito de orden con LocalStorage
- Mesero puede agregar items y "enviar a cocina" (escribe en LocalStorage compartido)
- Cocina lee de LocalStorage y simula avance de estados con setInterval
- Admin CRUD sobre arrays en memoria

### CHECKPOINT 3 — SUPABASE REAL (si hay tiempo):
- Schema SQL ejecutado
- Auth real con email+password
- Realtime para sincronizar mesero↔cocina↔admin
- RLS policies activas

**Estrategia:** Si tiempo apremia, dejar todo en LocalStorage (CP2) y mostrar el flujo completo funcionando offline. Es más impresionante que un Supabase a medio cablear.

---

## 9. ARCHIVOS YA EXISTENTES — REFERENCIA RÁPIDA

```
MVP_RESTAURANTE/
├── index.html                          ✅ Landing premium (10 actos)
├── menu.html                           ✅ Carta digital pública con 4 categorías
├── login.html                          ✅ Selector de rol burgundy/cream
├── _redirects                          ⚠️ FALTA crear
├── mesero/
│   └── index.html                      ✅ Mapa de mesas 12 cards
├── cocina/
│   └── index.html                      ✅ KDS 3 columnas con orders demo
├── admin/
│   ├── index.html                      ✅ Dashboard tabs + tablas (placeholder Mesaio)
│   ├── _REFERENCIA_ADMIN_RNT.html      ✅ Código fuente RNT completo (3500 líneas) — REUTILIZAR
│   ├── manual.html                     (RNT — ignorar)
│   └── MANUAL_OPERARIO.md              (RNT — ignorar)
├── assets/
│   ├── vendor/                         ✅ Bootstrap, Icons, AOS, Swiper, FontAwesome
│   ├── css/                            ✅ main, rnt-*, pdf-styles
│   ├── js/                             ✅ Toda la JS de RNT (rastreo, cotizador, etc — opcional reusar)
│   └── img/                            ✅ Logos RNT (reemplazar logo por SVG texto Mesaio)
└── SPEC_DIAGNOSTICO_ARQUITECTO.md      ✅ ESTE ARCHIVO
```

---

## 10. INSTRUCCIONES PARA EL ARQUITECTO

**Tu output esperado:** Un documento `SUPER_SPEC_MESAIO_v1.md` de ≥1500 líneas que detalle:

1. **Schema SQL completo** copy-pasteable (CREATE TABLE + INSERT seed + RLS)
2. **Para cada página existente** — qué falta, qué cambiar, código exacto:
   - `index.html` — opcional, ya está bien
   - `login.html` — agregar form Supabase real (mantener selector demo arriba)
   - `mesero/index.html` — modal toma orden completo + JS
   - `cocina/index.html` — JS para drag/click estados + Realtime subscribe
   - `admin/index.html` — wire real CRUD + dashboard con queries reales
3. **Snippets JS reutilizables** (un único `<script>` global o módulo):
   - `mesaioAuth.js` (login/logout/rol routing)
   - `mesaioOrders.js` (CRUD orden + items + transición estado)
   - `mesaioRealtime.js` (subscribe a `ordenes` channel)
   - `mesaioStorage.js` (fallback LocalStorage si Supabase no responde)
4. **Lista de assets a reemplazar**:
   - Logo SVG inline para Mesaio (sustituir `logo_rect.png`)
   - Imágenes platos (URLs Pexels ya colocadas en `menu.html` — listas)
5. **Plan de ejecución por bloques de tiempo** (5/10/15/20/30/45/50 min)
6. **Criterio de "demo lista"** — qué debe funcionar para enseñar al jurado

**Restricción crítica:**
> Toda decisión que ahorre 1 minuto de implementación al constructor (Claude Code) tiene prioridad sobre la decisión "más correcta" técnicamente. Estamos en hackathon, no en sprint corporativo.

**Filosofía:**
> Reutilizar > Construir nuevo. Si dudas entre reusar de RNT o crear desde cero, REUSA. Si dudas entre 2 enfoques, elige el que tenga MÁS líneas ya escritas que se puedan copy-paste.

---

## 11. ROUTING DE INSTANCIAS

```
USER (Hernando) ──┬─→ Claude Code (esta instancia) ──→ SPEC DIAGNÓSTICO + scaffold inicial + push
                  │
                  └─→ Claude Web (arquitecto) ──→ recibe SPEC + scaffold ──→ SUPER_SPEC_MESAIO_v1.md
                          │
                          ↓
                  Claude Code (esta instancia) ──→ recibe SUPER_SPEC ──→ EJECUTA TODO
                          │
                          ↓
                  DEMO LISTA → Hackathon → $2.000.000 COP 🏆
```

---

## 12. CONFIDENCE NOTES PARA EL ARQUITECTO

- **El scaffold inicial visual ya está deployado en Netlify.** Cuando recibas este SPEC, abre `https://c8mesaio.netlify.app` y verás el render actual.
- **Todos los assets premium están copiados.** No tienes que pensar en CSS base, vendor, fonts.
- **El brand está decidido.** No abras la conversación de paleta — usa burgundy + gold como está.
- **El idioma del MVP es ESPAÑOL COLOMBIANO.** Copy con tildes correctas, COP para precios.
- **No bloqueante para checkpoint 1:** Supabase. El demo puede correr 100% en LocalStorage.
- **Sí bloqueante:** Realtime feel — mesero↔cocina deben sincronizar (con setInterval polling de LocalStorage funciona perfecto).

---

## 13. UN ÚLTIMO NORTE

> El jurado verá: una landing, hace click en "Acceder", elige un rol, opera el sistema 2 minutos por rol, sale impresionado. **Eso es todo lo que importa.**
>
> Cualquier feature que no sirva ese arco — descartar.
> Cualquier feature que lo refuerce — priorizar.

**Devuelve el SUPER SPEC. Construyamos. Ganemos.**

---

*Mesaio · Hackathon Build · 2026-05-03*
*Constructor: Claude Opus 4.7 (1M ctx) · Arquitecto: Claude Web*
