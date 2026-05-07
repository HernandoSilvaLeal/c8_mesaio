# SPEC v2.6 — CARAMELOS FINALES
## Timer cocina + WhatsApp

---

## CARAMELO 1 — TIMER EN COCINA CON COLORES

**En `cocina/index.html`, dentro de cada card de orden:**

### Agregar función de timer al script:

```javascript
function calcularTiempoMinutos(isoString) {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

function badgeTimer(minutos) {
  if (minutos < 10) return `<span style="background:#ECFDF5;color:#065F46;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">🟢 ${minutos} min</span>`;
  if (minutos < 20) return `<span style="background:#FFFBEB;color:#92400E;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">🟡 ${minutos} min</span>`;
  return `<span style="background:#FEF2F2;color:#991B1B;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;animation:pulseRed 1s infinite;">🔴 ${minutos} min — URGENTE</span>`;
}

// Agregar al <style> del head:
// @keyframes pulseRed { 0%,100%{opacity:1} 50%{opacity:0.5} }
```

### En el `<head>` o `<style>` de cocina/index.html, agregar:

```html
<style>
@keyframes pulseRed {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>
```

### Donde se renderizan las cards de orden en cocina, agregar el badge:

**Buscar donde se construye el HTML de cada card (algo como `ordenHTML` o `cardHTML`) y agregar:**

```javascript
// Dentro del template de cada card, donde está el número de orden o la hora:
const mins = calcularTiempoMinutos(orden.created_at || orden.updated_at);
const timerBadge = badgeTimer(mins);

// Agregar timerBadge al HTML de la card, visible y grande:
// <div style="margin:8px 0;">${timerBadge}</div>
```

### Actualizar el timer cada 60 segundos:

```javascript
// Al final del script de cocina, después del init:
setInterval(() => {
  // Re-renderizar solo los timers sin recargar todo
  document.querySelectorAll('[data-orden-time]').forEach(el => {
    const iso = el.getAttribute('data-orden-time');
    const mins = calcularTiempoMinutos(iso);
    el.innerHTML = badgeTimer(mins);
  });
}, 60000);
```

**Nota para Claude Code:** En cada card renderizada, agregar `data-orden-time="${orden.created_at}"` al div del timer para que el intervalo lo encuentre sin re-renderizar todo.

---

## CARAMELO 2 — WHATSAPP REAL EN /entregables/

**En `entregables/index.html`, buscar:**

```
573XXXXXXXXX
```

**Reemplazar con el número real de Nando (formato internacional sin +):**

```
573TUNUMEROREAL
```

**El href completo queda así (ejemplo):**

```html
<a href="https://wa.me/573TUNUMEROREAL?text=Hola,%20vi%20Mesaio%20y%20me%20interesa%20para%20mi%20restaurante"
  style="padding:12px 24px; background:#25D366; color:white; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px;">
  💬 Escribir por WhatsApp
</a>
```

---

## GIT COMMIT

```bash
git add cocina/index.html entregables/index.html
git commit -m "feat: Timer cocina con colores urgencia + WhatsApp real en entregables"
git push origin main
```

---

## RESULTADO VISUAL — COCINA

```
┌─────────────────────────────┐
│  Mesa 3 · Orden #001        │
│  🟢 4 min                   │  ← verde, tranquilo
│  Bandeja paisa ×1           │
│  Limonada de coco ×1        │
│  [Preparando] [Listo]       │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Mesa 7 · Orden #003        │
│  🟡 16 min                  │  ← amarillo, atención
│  Sancocho trifásico ×2      │
│  [Preparando] [Listo]       │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Mesa 1 · Orden #002        │
│  🔴 28 min — URGENTE        │  ← rojo parpadeante
│  Mojarra frita ×1           │
│  [Preparando] [Listo]       │
└─────────────────────────────┘
```