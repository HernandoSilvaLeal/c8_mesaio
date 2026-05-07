# SPEC v2.5 — REESCRITURA TOTAL /entregables/
## Transformar página de hackathon en propuesta de venta para cliente

---

## CONTEXTO

La página actual dice:
- "Hackathon 2026 · Premio $2.000.000" ← cliente piensa "es un proyecto escolar"
- "Entregables del MVP" ← lenguaje interno, no de venta
- "Stack técnico / Sin frameworks" ← cliente no entiende ni le importa

**Lo que el cliente debe sentir al entrar:**
> "Este sistema ya existe, funciona, reemplaza lo que pago por separado, y lo puedo probar ahora."

---

## ACCIÓN — Reemplazar TODO el contenido de `entregables/index.html`

Mantener solo: el `<head>` con los links de CSS/fuentes/bootstrap, y el `<header>` con logo.
Reemplazar el `<main>` completo con esto:

```html
<main style="max-width:700px; margin:0 auto; padding:24px 16px 60px;">

  <!-- GANCHO PRINCIPAL -->
  <div style="background:linear-gradient(135deg, #5C1A2B 0%, #7C2A3A 100%); border-radius:20px; padding:32px 28px; margin-bottom:24px; color:white; text-align:center;">
    
    <div style="font-size:13px; color:#C8A951; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:12px;">
      ¿Cuánto paga su restaurante por estos 3 sistemas?
    </div>

    <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-bottom:24px;">
      <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:14px 18px; text-align:center;">
        <div style="font-size:11px; opacity:0.7; margin-bottom:4px;">Mesas y pedidos</div>
        <div style="font-size:22px; font-weight:bold;">$80.000</div>
        <div style="font-size:10px; opacity:0.5;">/mes</div>
      </div>
      <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:14px 18px; text-align:center;">
        <div style="font-size:11px; opacity:0.7; margin-bottom:4px;">Contabilidad</div>
        <div style="font-size:22px; font-weight:bold;">$150.000</div>
        <div style="font-size:10px; opacity:0.5;">/mes</div>
      </div>
      <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:14px 18px; text-align:center;">
        <div style="font-size:11px; opacity:0.7; margin-bottom:4px;">Inventario</div>
        <div style="font-size:22px; font-weight:bold;">$120.000</div>
        <div style="font-size:10px; opacity:0.5;">/mes</div>
      </div>
    </div>

    <div style="font-size:36px; font-weight:bold; color:#C8A951; margin-bottom:6px;">$350.000 / mes</div>
    <div style="font-size:14px; opacity:0.7; margin-bottom:20px;">en 3 facturas separadas que no se hablan entre sí</div>

    <div style="background:rgba(200,169,81,0.2); border:2px solid #C8A951; border-radius:12px; padding:16px;">
      <div style="font-size:13px; opacity:0.8; margin-bottom:4px;">Con Mesaio, todo integrado desde</div>
      <div style="font-size:30px; font-weight:bold; color:#C8A951;">$200.000 / mes</div>
      <div style="font-size:12px; opacity:0.7; margin-top:4px;">Un solo sistema · Una sola factura · Cero duplicación</div>
    </div>

  </div>

  <!-- QUÉ INCLUYE -->
  <h3 style="font-family:'Playfair Display',serif; color:#5C1A2B; font-size:20px; margin:0 0 16px;">¿Qué tiene Mesaio?</h3>

  <div style="display:grid; gap:10px; margin-bottom:28px;">

    <div style="background:white; border:1px solid #E5E7EB; border-radius:12px; padding:16px; display:flex; gap:14px; align-items:center;">
      <div style="font-size:28px; flex-shrink:0;">🪑</div>
      <div>
        <div style="font-weight:700; color:#111827; font-size:14px;">Mesas en tiempo real</div>
        <div style="font-size:12px; color:#6B7280; margin-top:2px;">24 mesas · 4 zonas · meseros identificados por nombre · sincronización cada 3 segundos</div>
      </div>
    </div>

    <div style="background:white; border:1px solid #E5E7EB; border-radius:12px; padding:16px; display:flex; gap:14px; align-items:center;">
      <div style="font-size:28px; flex-shrink:0;">👨‍🍳</div>
      <div>
        <div style="font-weight:700; color:#111827; font-size:14px;">Cocina digital (KDS)</div>
        <div style="font-size:12px; color:#6B7280; margin-top:2px;">Pantalla exclusiva para cocina · estados de pedido · alerta si pasan 10 minutos</div>
      </div>
    </div>

    <div style="background:white; border:1px solid #E5E7EB; border-radius:12px; padding:16px; display:flex; gap:14px; align-items:center;">
      <div style="font-size:28px; flex-shrink:0;">📦</div>
      <div>
        <div style="font-weight:700; color:#111827; font-size:14px;">Inventario automático</div>
        <div style="font-size:12px; color:#6B7280; margin-top:2px;">25 ingredientes · 15 recetas · se descuenta solo cuando cocina marca "listo" · alerta de stock bajo</div>
      </div>
    </div>

    <div style="background:white; border:1px solid #E5E7EB; border-radius:12px; padding:16px; display:flex; gap:14px; align-items:center;">
      <div style="font-size:28px; flex-shrink:0;">🧾</div>
      <div>
        <div style="font-weight:700; color:#111827; font-size:14px;">Facturación electrónica</div>
        <div style="font-size:12px; color:#6B7280; margin-top:2px;">IVA 19% automático · CUFE · imprimible · 3 métodos de pago: Efectivo, Tarjeta, Nequi</div>
      </div>
    </div>

    <div style="background:white; border:1px solid #E5E7EB; border-radius:12px; padding:16px; display:flex; gap:14px; align-items:center;">
      <div style="font-size:28px; flex-shrink:0;">📊</div>
      <div>
        <div style="font-weight:700; color:#111827; font-size:14px;">Contabilidad y cierre de día</div>
        <div style="font-size:12px; color:#6B7280; margin-top:2px;">Ingresos · costos · margen · arqueo de caja · acta de cierre imprimible con firma</div>
      </div>
    </div>

    <div style="background:white; border:1px solid #E5E7EB; border-radius:12px; padding:16px; display:flex; gap:14px; align-items:center;">
      <div style="font-size:28px; flex-shrink:0;">📈</div>
      <div>
        <div style="font-weight:700; color:#111827; font-size:14px;">Dashboard para el dueño</div>
        <div style="font-size:12px; color:#6B7280; margin-top:2px;">KPIs históricos · gráfico de ingresos · tendencias 7/30/90 días · ticket promedio</div>
      </div>
    </div>

  </div>

  <!-- DEMO EN VIVO -->
  <h3 style="font-family:'Playfair Display',serif; color:#5C1A2B; font-size:20px; margin:0 0 16px;">Pruébelo ahora</h3>

  <div style="display:grid; gap:10px; margin-bottom:28px;">

    <a href="/mesero/" style="text-decoration:none; background:#FAF6EE; border:2px solid #C8A951; border-radius:12px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="font-size:24px;">🧑‍🍽️</div>
        <div>
          <div style="font-weight:700; color:#5C1A2B; font-size:14px;">Vista del Mesero</div>
          <div style="font-size:12px; color:#9CA3AF;">Tomar pedidos, cobrar, generar factura</div>
        </div>
      </div>
      <div style="color:#C8A951; font-weight:bold; font-size:18px;">→</div>
    </a>

    <a href="/cocina/" style="text-decoration:none; background:#FAF6EE; border:2px solid #E5E7EB; border-radius:12px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="font-size:24px;">👨‍🍳</div>
        <div>
          <div style="font-weight:700; color:#374151; font-size:14px;">Vista de Cocina</div>
          <div style="font-size:12px; color:#9CA3AF;">Pedidos en tiempo real, gestión de estados</div>
        </div>
      </div>
      <div style="color:#9CA3AF; font-size:18px;">→</div>
    </a>

    <a href="/admin/" style="text-decoration:none; background:#FAF6EE; border:2px solid #E5E7EB; border-radius:12px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="font-size:24px;">👔</div>
        <div>
          <div style="font-weight:700; color:#374151; font-size:14px;">Panel del Dueño</div>
          <div style="font-size:12px; color:#9CA3AF;">Inventario, contabilidad, facturas, inversores</div>
        </div>
      </div>
      <div style="color:#9CA3AF; font-size:18px;">→</div>
    </a>

  </div>

  <!-- CTA CONTACTO -->
  <div style="background:#5C1A2B; border-radius:16px; padding:24px; text-align:center; color:white;">
    <div style="font-family:'Playfair Display',serif; font-size:20px; font-weight:bold; margin-bottom:8px;">
      ¿Le interesa para su restaurante?
    </div>
    <div style="font-size:13px; opacity:0.8; margin-bottom:20px; line-height:1.6;">
      Hacemos la implementación completa con sus datos reales.<br>
      Menú propio · equipo configurado · listo en 48 horas.
    </div>
    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
      <a href="https://wa.me/573XXXXXXXXX?text=Hola,%20vi%20Mesaio%20y%20me%20interesa%20para%20mi%20restaurante"
        style="padding:12px 24px; background:#25D366; color:white; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px;">
        💬 WhatsApp
      </a>
      <a href="mailto:contacto@mesaio.co?subject=Quiero%20Mesaio%20para%20mi%20restaurante"
        style="padding:12px 24px; background:rgba(255,255,255,0.15); color:white; border:1px solid rgba(255,255,255,0.3); border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
        ✉️ Email
      </a>
    </div>
    <div style="font-size:11px; opacity:0.5; margin-top:16px;">
      Mesaio · Sistema de gestión profesional para restaurantes colombianos
    </div>
  </div>

</main>
```

---

## LO QUE DESAPARECE

Eliminar completamente del HTML:
- `"Hackathon 2026 · Premio $2.000.000"` → era para el jurado, no el cliente
- `"Entregables del MVP"` → lenguaje de hackathon
- `"Stack técnico: HTML5, CSS3..."` → al cliente no le importa
- `"Sin frameworks pesados"` → confunde
- Cualquier mención a "Supabase", "Netlify CI/CD" visible → información técnica interna

---

## LO QUE PERMANECE

- El `<header>` con logo Mesaio y botón "Volver"
- Los links al repo GitHub (en el footer, discreto)
- El `<head>` con todas las dependencias CSS

---

## GIT COMMIT

```bash
git add entregables/index.html
git commit -m "feat: /entregables/ reescrita como propuesta de valor para cliente"
git push origin main
```

---

## RESULTADO

| Antes | Después |
|-------|---------|
| "Hackathon 2026 · Premio $2M" | Banner "$350K/mes → $200K con Mesaio" |
| "Entregables del MVP" | "¿Qué tiene Mesaio?" |
| "Stack técnico / HTML5 / Supabase" | 6 cards de features en lenguaje de negocio |
| Sin CTA | WhatsApp + Email + "listo en 48 horas" |
| Para jurado técnico | Para dueño de restaurante |