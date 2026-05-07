# SPEC v2.7 — FIX PRECIO LANDING (URGENTE)
## 1 cambio. 5 minutos.

---

## EL BUG

En `index.html` (landing principal https://c8mesaio.netlify.app/), el banner dice:

```
TOTAL ACTUAL          CON MESAIO
$350.000/mes    →     $0/mes       ← MAL. Parece gratis.
```

---

## EL FIX

Buscar en `index.html` el elemento que muestra `$0/mes` o `$0` dentro del bloque
de comparación de precios (el banner burgundy con la flecha →).

**Reemplazar el valor y el label:**

```html
<!-- ANTES (lo que sea que genere "$0/mes") -->
<span>$0/mes</span>
<!-- o -->
$0/mes
<!-- o -->
CON MESAIO ... $0

<!-- DESPUÉS -->
<div style="text-align:center;">
  <div style="font-size:11px; opacity:0.7; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Con Mesaio</div>
  <div style="font-size:32px; font-weight:bold; color:#C8A951;">$200.000</div>
  <div style="font-size:12px; opacity:0.8;">/mes · todo incluido</div>
</div>
```

**Si el valor está en JavaScript (variable o función), buscar:**
```javascript
// Cualquier cosa como:
'$0/mes'  →  '$200.000/mes'
0          →  200000
'$0'       →  '$200.000'
```

---

## GIT COMMIT

```bash
git add index.html
git commit -m "fix: precio landing $0 → $200.000/mes"
git push origin main
```

---

## RESULTADO

```
TOTAL ACTUAL          CON MESAIO
$350.000/mes    →     $200.000/mes
                      todo incluido
```

Ahorro real para el cliente: **$150.000/mes**. Eso es el argumento.