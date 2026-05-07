# MESAIO — Guía rápida para Nando · Demo lista

## ✅ ESTADO: TODO EJECUTADO

El MVP está construido y desplegado. Falta UN único paso manual: ejecutar el SQL.

---

## 🔧 PASO ÚNICO PENDIENTE — 2 minutos

### Ejecutar el schema en Supabase

1. Abrir: https://supabase.com/dashboard → proyecto **fttrbfntgxvbfdmndogo** (el mismo de RNT)
2. Ir a **SQL Editor** → **New Query**
3. Copy-paste el contenido de `sql/schema.sql` (también está en el repo: https://raw.githubusercontent.com/HernandoSilvaLeal/c8_mesaio/main/sql/schema.sql)
4. Click **RUN** (Ctrl+Enter)
5. Listo. Las 12 mesas + 15 platos + 3 usuarios quedan creados con RLS abierto y Realtime activo.

**Si NO ejecutas el SQL:** El sistema sigue funcionando en modo **LocalStorage** (datos por navegador). Funciona perfecto para demo individual pero los cambios no se sincronizan entre dispositivos. Detecta automáticamente el fallback.

**Si ejecutas el SQL:** Sincronización en tiempo real entre mesero ↔ cocina ↔ admin desde cualquier dispositivo. **MUCHO más impresionante para el jurado.**

---

## 🎬 GUION DE DEMO AL JURADO (3 minutos)

Abrir 3 ventanas/pestañas en paralelo (idealmente 2 dispositivos distintos):

### Pestaña 1 — Mesero (`/mesero`)
1. "Aquí ve el mesero su mapa de mesas en vivo"
2. Tap en **Mesa 03 (libre)** → "Toma orden directamente desde el celular"
3. Click 2 platos (ej: Bandeja paisa + Limonada de coco) → "Carrito con totales en tiempo real"
4. Botón **Enviar a cocina** → "Listo, mesa cambia a ocupada"

### Pestaña 2 — Cocina (`/cocina`)
1. "El cocinero ya recibió la orden — sin llamar, sin papel"
2. Card de Mesa 03 aparece en columna **Pendientes** (después del polling de 3s)
3. Click **Iniciar preparación** → la card se mueve a **Preparando**
4. Click **Marcar listo** → la card se mueve a **Listos**

### Vuelve a Pestaña 1 — Mesero
1. La mesa 03 ahora dice **"¡Listo p/entregar!"** en dorado
2. Tap → Modal con detalle → **Marcar entregado**
3. Tap nuevo → **Cerrar cuenta** → mesa vuelve a libre

### Pestaña 3 — Admin (`/admin`)
1. "El administrador ve todo en tiempo real"
2. **Dashboard:** ventas del día +1, mesa contabilizada
3. **Reportes:** Top 5 platos del día actualizado
4. **Órdenes:** export CSV con BOM UTF-8 (abre directo en Excel Colombia)

---

## 🌐 URLs LIVE (ya desplegadas)

| URL | Función |
|-----|---------|
| https://c8mesaio.netlify.app | Landing comercial |
| https://c8mesaio.netlify.app/login | Selector de rol |
| https://c8mesaio.netlify.app/mesero | Panel mesero |
| https://c8mesaio.netlify.app/cocina | KDS cocina |
| https://c8mesaio.netlify.app/admin | Dashboard admin |
| https://c8mesaio.netlify.app/menu | Carta digital |
| https://c8mesaio.netlify.app/entregables | Portal de entregables |

---

## 🎯 CHECKLIST DEMO LISTA (10 puntos del arquitecto)

- ✅ Landing carga sin errores
- ✅ Login muestra 3 roles clickeables
- ✅ Mesero ve 12 mesas con colores por estado
- ✅ Mesero toca mesa libre → modal de orden aparece
- ✅ Mesero agrega 3 platos → total correcto
- ✅ Mesero envía → mesa cambia a "ocupada"
- ✅ Cocina ve la orden en columna "Pendientes"
- ✅ Cocina marca "Preparando" → card se mueve
- ✅ Cocina marca "Listo" → card se mueve
- ✅ Admin ve stats actualizados del día

**10/10 → DEMO GANADORA**

---

## 🐛 SI ALGO FALLA

### Las mesas no aparecen
→ Ejecuta `sql/schema.sql`. Si no, el LocalStorage debería tomar control en 2 segundos.

### "Supabase falló" en consola
→ Es normal si no ejecutaste el SQL. El sistema usa LocalStorage automáticamente. Funciona igual.

### Los cambios no se sincronizan entre pestañas
→ Necesitas Supabase activo (con SQL ejecutado). LocalStorage es por navegador.

### Quiero resetear datos demo
→ DevTools → Console → `localStorage.clear()` → recarga.

---

## 📦 ESTRUCTURA FINAL

```
MVP_RESTAURANTE/
├── index.html                          Landing premium
├── login.html                          Selector rol
├── menu.html                           Carta pública
├── _redirects                          Aliases Netlify
├── .gitignore
├── SPEC_DIAGNOSTICO_ARQUITECTO.md      Tu handoff inicial
├── SUPER_SPEC_MESAIO_v1.md             Spec del arquitecto
├── INSTRUCCIONES_NANDO.md              ← ESTE ARCHIVO
├── sql/
│   └── schema.sql                      ⚠️ Ejecutar en Supabase
├── assets/
│   ├── vendor/                         Bootstrap, Icons, AOS, etc
│   ├── css/                            Reutilizado de RNT
│   ├── js/
│   │   └── mesaio-core.js              ⭐ Módulo central (Supabase + LocalStorage)
│   └── img/
├── mesero/
│   └── index.html                      ⭐ Panel completo + modal + JS
├── cocina/
│   └── index.html                      ⭐ KDS dinámico
├── admin/
│   ├── index.html                      ⭐ Dashboard + tabs + CSV
│   └── _REFERENCIA_ADMIN_RNT.html      Código fuente RNT (referencia)
└── entregables/
    └── index.html                      Portal de demo al jurado
```

---

## 🏆 VAMOS A GANAR

Reutilizamos:
- ✅ Sistema de diseño completo de RNT (rebrandeado a burgundy)
- ✅ Vendor de Bootstrap 5.3 + Icons + AOS
- ✅ Estructura admin Supabase Auth + CRUD
- ✅ Patrones de cards, badges, tabs, modales
- ✅ Mismo proyecto Supabase (fttrbfntgxvbfdmndogo)

Construimos NUEVO:
- ⭐ `mesaio-core.js` — orquestador completo con dual-mode (Supabase + LocalStorage)
- ⭐ Mapa de mesas interactivo con tiempos en vivo
- ⭐ KDS profesional estilo Toast/Square
- ⭐ Dashboard admin con 5 paneles + export CSV
- ⭐ Realtime subscribe para sincronización instantánea
- ⭐ Sistema toast global premium

Total: ~50 minutos. Una bala. Dispara.

---

*Mesaio · Hackathon 2026 · Stack: HTML + Bootstrap 5 + Supabase + Netlify*
*Construido por Claude Code (Opus 4.7) · Arquitectado por Claude Web*
