# SPEC v2.8 — LANDING SHARK TANK LEVEL
## Reemplazar index.html COMPLETO

**Instrucción para Claude Code:**
Reemplazar TODO el `<body>` de `index.html` con el siguiente HTML.
Mantener el `<head>` existente (meta tags, fuentes, Bootstrap).
Agregar el `<style>` de este spec dentro del `<head>`.

---

## ESTILOS — agregar en `<head>`:

```html
<style>
  :root {
    --burgundy: #5C1A2B;
    --burgundy-dark: #3D0F1C;
    --gold: #C8A951;
    --gold-light: #E8C96A;
    --cream: #FAF6EE;
    --cream-dark: #F0E8D8;
    --text: #1A0A0F;
    --muted: #9CA3AF;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--cream);
    color: var(--text);
    overflow-x: hidden;
  }

  h1, h2, h3, h4 { font-family: 'Playfair Display', serif; }

  /* ANIMACIONES */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.05); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes grain {
    0%, 100% { transform: translate(0,0); }
    25%       { transform: translate(2px,-1px); }
    50%       { transform: translate(-1px,2px); }
    75%       { transform: translate(1px,1px); }
  }

  .fade-up { animation: fadeUp 0.7s ease forwards; }
  .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
  .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
  .fade-up-4 { animation: fadeUp 0.7s 0.45s ease both; }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,246,238,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(92,26,43,0.08);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: var(--burgundy);
    text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-size: 13px; font-weight: 500;
    color: #6B7280; text-decoration: none;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--burgundy); }
  .btn-primary {
    background: var(--burgundy); color: white;
    padding: 10px 22px; border-radius: 8px;
    font-size: 13px; font-weight: 700;
    text-decoration: none; border: none; cursor: pointer;
    transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { background: var(--burgundy-dark); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(92,26,43,0.25); }
  .btn-gold {
    background: var(--gold); color: var(--burgundy);
    padding: 14px 28px; border-radius: 10px;
    font-size: 15px; font-weight: 800;
    text-decoration: none; border: none; cursor: pointer;
    transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 20px rgba(200,169,81,0.4);
  }
  .btn-gold:hover { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(200,169,81,0.5); }
  .btn-outline {
    background: transparent; color: var(--burgundy);
    padding: 14px 28px; border-radius: 10px;
    font-size: 15px; font-weight: 700;
    text-decoration: none; border: 2px solid var(--burgundy); cursor: pointer;
    transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 10px;
  }
  .btn-outline:hover { background: var(--burgundy); color: white; }

  /* SECTIONS */
  section { padding: 80px 32px; }
  .container { max-width: 1100px; margin: 0 auto; }
  .container-narrow { max-width: 780px; margin: 0 auto; }

  /* HERO */
  .hero {
    min-height: 88vh;
    background: linear-gradient(160deg, var(--burgundy-dark) 0%, var(--burgundy) 60%, #7C2A3A 100%);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    padding: 80px 64px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .hero-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
    color: var(--gold); text-transform: uppercase;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .hero-eyebrow::before {
    content: ''; display: block;
    width: 24px; height: 2px; background: var(--gold);
  }
  .hero h1 {
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 700; line-height: 1.1;
    color: white; margin-bottom: 20px;
  }
  .hero h1 em {
    font-style: italic; color: var(--gold);
  }
  .hero-sub {
    font-size: 17px; color: rgba(255,255,255,0.75);
    line-height: 1.7; margin-bottom: 36px;
    max-width: 480px;
  }
  .hero-stats {
    display: flex; gap: 32px; margin-top: 48px;
    padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1);
  }
  .hero-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: var(--gold);
  }
  .hero-stat-label { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }

  /* HERO RIGHT - KDS MOCKUP */
  .hero-right { position: relative; }
  .kds-mock {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px; padding: 20px;
    backdrop-filter: blur(8px);
  }
  .kds-header {
    font-size: 11px; font-weight: 700; color: var(--gold);
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .kds-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 2s infinite; }
  .kds-card {
    background: rgba(255,255,255,0.08);
    border-radius: 10px; padding: 12px 14px;
    margin-bottom: 8px; display: flex;
    justify-content: space-between; align-items: center;
    gap: 12px;
  }
  .kds-mesa { font-size: 12px; font-weight: 700; color: white; }
  .kds-items { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }
  .badge-listo { background: #ECFDF5; color: #065F46; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-prep  { background: #FFFBEB; color: #92400E; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-pend  { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }

  /* DOLOR - PRECIO */
  .dolor-section { background: var(--cream-dark); }
  .precio-compare {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 24px; align-items: center;
    margin-top: 48px;
  }
  .precio-box {
    background: white; border-radius: 16px; padding: 28px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .precio-box-header {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 20px;
  }
  .precio-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0; border-bottom: 1px dashed #F3F4F6;
  }
  .precio-item:last-child { border: none; }
  .precio-item-name { font-size: 14px; color: #374151; }
  .precio-item-val { font-size: 16px; font-weight: 700; color: #EF4444; }
  .precio-total-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 16px; padding-top: 16px;
    border-top: 2px solid #EF4444;
  }
  .precio-total-label { font-size: 13px; font-weight: 600; color: #374151; }
  .precio-total-val { font-size: 24px; font-weight: 800; color: #EF4444; text-decoration: line-through; opacity: 0.7; }
  .arrow-mid {
    font-size: 36px; color: var(--burgundy); font-weight: 900;
    text-align: center;
  }
  .precio-box-mesaio {
    background: var(--burgundy); border-radius: 16px; padding: 28px;
    border: 2px solid var(--gold);
    box-shadow: 0 8px 40px rgba(92,26,43,0.3);
  }
  .precio-mesaio-header { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; }
  .precio-mesaio-main { text-align: center; padding: 20px 0; }
  .precio-mesaio-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: var(--gold); line-height: 1; }
  .precio-mesaio-period { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .precio-mesaio-features { margin-top: 20px; }
  .precio-feature {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.85);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .precio-feature:last-child { border: none; }
  .precio-feature-check { color: var(--gold); font-size: 14px; flex-shrink: 0; }
  .ahorro-badge {
    background: var(--gold); color: var(--burgundy);
    border-radius: 8px; padding: 10px 16px; margin-top: 16px;
    text-align: center; font-weight: 800; font-size: 14px;
  }

  /* FEATURES GRID */
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px; margin-top: 48px;
  }
  .feature-card {
    background: white; border-radius: 14px; padding: 24px;
    border: 1px solid #F3F4F6;
    transition: all 0.3s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 3px; height: 100%; background: var(--burgundy);
    transform: scaleY(0); transition: transform 0.3s;
    transform-origin: bottom;
  }
  .feature-card:hover { box-shadow: 0 8px 32px rgba(92,26,43,0.1); transform: translateY(-3px); }
  .feature-card:hover::before { transform: scaleY(1); }
  .feature-icon { font-size: 28px; margin-bottom: 12px; }
  .feature-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--burgundy); margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: #6B7280; line-height: 1.6; }
  .feature-tag { margin-top: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold); }

  /* ROLES */
  .roles-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px; margin-top: 48px;
  }
  .rol-card {
    border-radius: 16px; padding: 28px;
    text-decoration: none; transition: all 0.3s;
    display: block;
  }
  .rol-card:hover { transform: translateY(-4px); }
  .rol-card-mesero { background: var(--burgundy); }
  .rol-card-cocina { background: var(--cream-dark); border: 2px solid var(--burgundy); }
  .rol-card-admin  { background: var(--text); }
  .rol-emoji { font-size: 36px; margin-bottom: 16px; }
  .rol-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .rol-card-mesero .rol-name { color: white; }
  .rol-card-cocina .rol-name { color: var(--burgundy); }
  .rol-card-admin  .rol-name { color: var(--gold); }
  .rol-desc { font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
  .rol-card-mesero .rol-desc { color: rgba(255,255,255,0.7); }
  .rol-card-cocina .rol-desc { color: #6B7280; }
  .rol-card-admin  .rol-desc { color: rgba(255,255,255,0.6); }
  .rol-features { list-style: none; }
  .rol-features li { font-size: 12px; padding: 4px 0; display: flex; align-items: center; gap: 8px; }
  .rol-card-mesero .rol-features li { color: rgba(255,255,255,0.8); }
  .rol-card-cocina .rol-features li { color: #374151; }
  .rol-card-admin  .rol-features li { color: rgba(255,255,255,0.7); }
  .rol-features li::before { content: '→'; font-size: 10px; opacity: 0.6; flex-shrink: 0; }
  .rol-cta {
    display: inline-block; margin-top: 20px; padding: 10px 18px;
    border-radius: 8px; font-size: 12px; font-weight: 700;
    text-decoration: none; transition: all 0.2s;
  }
  .rol-card-mesero .rol-cta { background: var(--gold); color: var(--burgundy); }
  .rol-card-cocina .rol-cta { background: var(--burgundy); color: white; }
  .rol-card-admin  .rol-cta { background: var(--gold); color: var(--text); }

  /* ROI */
  .roi-section { background: var(--burgundy); }
  .roi-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .roi-num {
    font-family: 'Playfair Display', serif;
    font-size: 72px; font-weight: 700; color: var(--gold); line-height: 1;
  }
  .roi-label { font-size: 16px; color: rgba(255,255,255,0.7); margin-top: 8px; }
  .roi-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
  .roi-metric { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; }
  .roi-metric-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--gold); }
  .roi-metric-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .roi-bullets { list-style: none; }
  .roi-bullets li {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.5;
  }
  .roi-bullets li:last-child { border: none; }
  .roi-bullet-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }

  /* CTA FINAL */
  .cta-section {
    background: linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%);
    text-align: center; padding: 100px 32px;
  }
  .cta-title { font-size: clamp(28px, 4vw, 48px); color: var(--burgundy); margin-bottom: 16px; }
  .cta-sub { font-size: 16px; color: #6B7280; margin-bottom: 40px; max-width: 500px; margin-left: auto; margin-right: auto; }
  .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* FOOTER */
  footer {
    background: var(--text); padding: 32px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--gold); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none; }
  .footer-links a:hover { color: var(--gold); }
  .footer-copy { font-size: 11px; color: rgba(255,255,255,0.25); width: 100%; text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 60px 24px; min-height: auto; }
    .hero-right { display: none; }
    .precio-compare { grid-template-columns: 1fr; }
    .arrow-mid { transform: rotate(90deg); }
    .features-grid { grid-template-columns: 1fr; }
    .roles-grid { grid-template-columns: 1fr; }
    .roi-grid { grid-template-columns: 1fr; }
    nav { padding: 0 16px; }
    .nav-links { display: none; }
    section { padding: 60px 20px; }
  }
</style>
```

---

## BODY — reemplazar TODO:

```html
<body>

<!-- ═══════════════════════════════════
     NAV
═══════════════════════════════════ -->
<nav>
  <a href="/" class="nav-logo">Mesaio</a>
  <div class="nav-links">
    <a href="#dolor">El problema</a>
    <a href="#precio">Precio</a>
    <a href="#roles">Roles</a>
    <a href="#roi">ROI</a>
    <a href="/entregables/">Demo</a>
  </div>
  <a href="/login" class="btn-primary">▶ Entrar al sistema</a>
</nav>


<!-- ═══════════════════════════════════
     HERO
═══════════════════════════════════ -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow fade-up">Sistema de gestión para restaurantes</div>
    <h1 class="fade-up-2">
      Su restaurante merece operar como uno<br>
      <em>del 2026.</em>
    </h1>
    <p class="hero-sub fade-up-3">
      Mesero, cocina y administración sincronizados en tiempo real. 
      Inventario automático, facturación electrónica y cierre de día — 
      en un solo sistema desde <strong style="color:var(--gold);">$200.000/mes.</strong>
    </p>
    <div class="fade-up-4" style="display:flex; gap:14px; flex-wrap:wrap;">
      <a href="/login" class="btn-gold">▶ Probar gratis ahora</a>
      <a href="#precio" class="btn-outline" style="color:white;border-color:rgba(255,255,255,0.3);">Ver precios</a>
    </div>

    <div class="hero-stats fade-up-4">
      <div>
        <div class="hero-stat-num">24</div>
        <div class="hero-stat-label">Mesas simultáneas</div>
      </div>
      <div>
        <div class="hero-stat-num">&lt;30s</div>
        <div class="hero-stat-label">Toma de orden</div>
      </div>
      <div>
        <div class="hero-stat-num">100%</div>
        <div class="hero-stat-label">Tiempo real</div>
      </div>
      <div>
        <div class="hero-stat-num">3</div>
        <div class="hero-stat-label">Sistemas en 1</div>
      </div>
    </div>
  </div>

  <!-- KDS MOCKUP -->
  <div class="hero-right fade-up-3">
    <div class="kds-mock">
      <div class="kds-header">
        <div class="kds-dot"></div>
        Cocina · En vivo ahora
      </div>
      <div class="kds-card" style="animation: slideIn 0.5s 0.1s both;">
        <div>
          <div class="kds-mesa">Mesa 12 · Orden #042</div>
          <div class="kds-items">Lomo al trapo · Posta cartagenera</div>
        </div>
        <span class="badge-listo">✓ Listo</span>
      </div>
      <div class="kds-card" style="animation: slideIn 0.5s 0.25s both;">
        <div>
          <div class="kds-mesa">Mesa 4 · Orden #041</div>
          <div class="kds-items">Bandeja paisa ×2 · Sancocho</div>
        </div>
        <span class="badge-prep">⏳ Preparando</span>
      </div>
      <div class="kds-card" style="animation: slideIn 0.5s 0.4s both;">
        <div>
          <div class="kds-mesa">Mesa 8 · Orden #043</div>
          <div class="kds-items">Ajiaco santafereño ×1</div>
        </div>
        <span class="badge-pend">Pendiente</span>
      </div>
      <div class="kds-card" style="animation: slideIn 0.5s 0.55s both;">
        <div>
          <div class="kds-mesa">Mesa 1 · Orden #040</div>
          <div class="kds-items">Cazuela mariscos ×2 · Mojarra ×2</div>
        </div>
        <span class="badge-prep">⏳ Preparando</span>
      </div>
      <!-- Inventario badge -->
      <div style="margin-top:14px; padding:10px 12px; background:rgba(200,169,81,0.15); border:1px solid rgba(200,169,81,0.3); border-radius:8px; font-size:11px; color:var(--gold);">
        📦 Inventario descontado automáticamente al marcar "Listo"
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════
     EL DOLOR — $350K
═══════════════════════════════════ -->
<section class="dolor-section" id="dolor">
  <div class="container">
    <div class="container-narrow" style="text-align:center; margin-bottom:0;">
      <div style="font-size:11px; font-weight:700; color:var(--burgundy); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">El problema real</div>
      <h2 style="font-size:clamp(24px,3.5vw,40px); color:var(--burgundy); margin-bottom:16px; line-height:1.2;">
        Los restaurantes pagan $350.000/mes<br>por 3 sistemas que no se hablan entre sí
      </h2>
      <p style="font-size:16px; color:#6B7280; line-height:1.7;">
        Cuando cocina marca un plato listo, el inventario no se actualiza solo. 
        Cuando el mesero cobra, la contabilidad no se entera. 
        El dueño tiene que cuadrar todo manualmente al final del día.
      </p>
    </div>

    <div class="precio-compare" id="precio" style="margin-top:48px;">
      <!-- LADO IZQUIERDO: el dolor -->
      <div class="precio-box">
        <div class="precio-box-header">Lo que pagan hoy</div>
        <div class="precio-item">
          <div>
            <div class="precio-item-name">Alegra · Contabilidad</div>
            <div style="font-size:11px;color:var(--muted);">No conectado con mesas</div>
          </div>
          <div class="precio-item-val">$150k</div>
        </div>
        <div class="precio-item">
          <div>
            <div class="precio-item-name">Sistema de mesas</div>
            <div style="font-size:11px;color:var(--muted);">No conectado con inventario</div>
          </div>
          <div class="precio-item-val">$80k</div>
        </div>
        <div class="precio-item">
          <div>
            <div class="precio-item-name">Control de inventario</div>
            <div style="font-size:11px;color:var(--muted);">No conectado con contabilidad</div>
          </div>
          <div class="precio-item-val">$120k</div>
        </div>
        <div class="precio-total-row">
          <div class="precio-total-label">Total mensual</div>
          <div class="precio-total-val">$350.000</div>
        </div>
        <div style="margin-top:14px; padding:10px; background:#FEF2F2; border-radius:8px; font-size:12px; color:#991B1B; text-align:center;">
          + horas de cuadre manual cada mes
        </div>
      </div>

      <!-- FLECHA -->
      <div class="arrow-mid">→</div>

      <!-- LADO DERECHO: Mesaio -->
      <div class="precio-box-mesaio">
        <div class="precio-mesaio-header">Con Mesaio — todo integrado</div>
        <div class="precio-mesaio-main">
          <div class="precio-mesaio-num">$200.000</div>
          <div class="precio-mesaio-period">/ mes · todo incluido</div>
        </div>
        <div class="precio-mesaio-features">
          <div class="precio-feature">
            <span class="precio-feature-check">✓</span>
            Mesas + cocina en tiempo real
          </div>
          <div class="precio-feature">
            <span class="precio-feature-check">✓</span>
            Inventario automático (25 ingredientes · 15 recetas)
          </div>
          <div class="precio-feature">
            <span class="precio-feature-check">✓</span>
            Facturación electrónica con CUFE
          </div>
          <div class="precio-feature">
            <span class="precio-feature-check">✓</span>
            Contabilidad y cierre de día con acta
          </div>
          <div class="precio-feature">
            <span class="precio-feature-check">✓</span>
            Dashboard para inversores (KPIs históricos)
          </div>
          <div class="precio-feature">
            <span class="precio-feature-check">✓</span>
            Soporte e implementación incluida
          </div>
        </div>
        <div class="ahorro-badge">
          💰 Ahorro real: $150.000/mes · $1.800.000/año
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════
     FEATURES
═══════════════════════════════════ -->
<section>
  <div class="container">
    <div style="text-align:center; margin-bottom:0;">
      <div style="font-size:11px; font-weight:700; color:var(--gold); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">9 módulos · 1 sistema</div>
      <h2 style="font-size:clamp(24px,3.5vw,38px); color:var(--burgundy);">Todo lo que su restaurante necesita</h2>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🪑</div>
        <div class="feature-title">24 mesas en tiempo real</div>
        <div class="feature-desc">Mapa visual con estado en vivo. Meseros identificados por nombre. Sincronización cada 3 segundos.</div>
        <div class="feature-tag">Operación</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👨‍🍳</div>
        <div class="feature-title">Cocina KDS profesional</div>
        <div class="feature-desc">Pantalla estilo Toast/Square. Cola de pedidos, cronómetro de urgencia, alerta si pasan 20 minutos.</div>
        <div class="feature-tag">Producción</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📦</div>
        <div class="feature-title">Inventario automático</div>
        <div class="feature-desc">Al marcar "listo" en cocina, los ingredientes se descuentan solos según la receta. Sin cuadre manual.</div>
        <div class="feature-tag">Inteligencia</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧾</div>
        <div class="feature-title">Facturación electrónica</div>
        <div class="feature-desc">IVA 19% automático, CUFE, resolución DIAN. Efectivo, tarjeta o Nequi. Imprimible al instante.</div>
        <div class="feature-tag">Legal</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💰</div>
        <div class="feature-title">Contabilidad del día</div>
        <div class="feature-desc">Ingresos, costos de ingredientes, ganancia neta y margen. Todo calculado automáticamente.</div>
        <div class="feature-tag">Finanzas</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔐</div>
        <div class="feature-title">Arqueo y cierre de día</div>
        <div class="feature-desc">Reconciliación de efectivo. Acta formal con firma del responsable. Histórico de todos los cierres.</div>
        <div class="feature-tag">Control</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <div class="feature-title">Dashboard de inversores</div>
        <div class="feature-desc">KPIs históricos 7/30/90 días. Gráfico de ingresos. Ticket promedio. Tendencias de rentabilidad.</div>
        <div class="feature-tag">Estrategia</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🍽️</div>
        <div class="feature-title">Carta digital con QR</div>
        <div class="feature-desc">Menú público con fotos, descripciones y precios actualizados en tiempo real. Sin apps adicionales.</div>
        <div class="feature-tag">Experiencia</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <div class="feature-title">Roles por persona</div>
        <div class="feature-desc">Cada mesero, cocinero y administrador entra con su nombre. Las órdenes quedan registradas por quién las tomó.</div>
        <div class="feature-tag">Equipo</div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════
     ROLES
═══════════════════════════════════ -->
<section style="background:var(--cream-dark);" id="roles">
  <div class="container">
    <div style="text-align:center;">
      <div style="font-size:11px; font-weight:700; color:var(--burgundy); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">3 roles · 3 vistas</div>
      <h2 style="font-size:clamp(24px,3.5vw,38px); color:var(--burgundy);">Cada uno ve solo lo que necesita</h2>
      <p style="color:#6B7280; margin-top:12px; font-size:15px;">Sin botones de más. Sin pasos perdidos. Sin confusión.</p>
    </div>
    <div class="roles-grid">
      <a href="/mesero/" class="rol-card rol-card-mesero">
        <div class="rol-emoji">🧑‍🍽️</div>
        <div class="rol-name">Mesero</div>
        <div class="rol-desc">Opera desde el celular junto a la mesa. Toma la orden, la envía a cocina, cobra y genera la factura en segundos.</div>
        <ul class="rol-features">
          <li>Mapa de 24 mesas en tiempo real</li>
          <li>Modal de orden por categorías</li>
          <li>Cobro con IVA y factura CUFE</li>
          <li>Su nombre aparece en cada orden</li>
        </ul>
        <span class="rol-cta">Entrar como mesero →</span>
      </a>
      <a href="/cocina/" class="rol-card rol-card-cocina">
        <div class="rol-emoji">👨‍🍳</div>
        <div class="rol-name">Cocina</div>
        <div class="rol-desc">Pantalla KDS con las órdenes en tiempo real. Cambia estados, ve el cronómetro, descuenta inventario automático.</div>
        <ul class="rol-features">
          <li>Cola: Pendiente → Preparando → Listo</li>
          <li>Cronómetro con alerta de urgencia</li>
          <li>Inventario se descuenta al marcar listo</li>
          <li>Refresh automático cada 3 segundos</li>
        </ul>
        <span class="rol-cta">Entrar como cocina →</span>
      </a>
      <a href="/admin/" class="rol-card rol-card-admin">
        <div class="rol-emoji">👔</div>
        <div class="rol-name">Dueño / Admin</div>
        <div class="rol-desc">Control total del negocio. Inventario, facturas, contabilidad, arqueo, cierre de día y dashboard de inversores.</div>
        <ul class="rol-features">
          <li>9 módulos integrados</li>
          <li>KPIs históricos 7/30/90 días</li>
          <li>Acta de cierre con firma</li>
          <li>Dashboard para mostrar a inversores</li>
        </ul>
        <span class="rol-cta">Entrar como admin →</span>
      </a>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════
     ROI
═══════════════════════════════════ -->
<section class="roi-section" id="roi">
  <div class="container">
    <div class="roi-grid">
      <div>
        <div style="font-size:11px; font-weight:700; color:var(--gold); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:16px;">Retorno de inversión</div>
        <div class="roi-num">$1.8M</div>
        <div class="roi-label">ahorrados por año vs 3 sistemas separados</div>
        <div class="roi-metrics">
          <div class="roi-metric">
            <div class="roi-metric-num">$150k</div>
            <div class="roi-metric-label">ahorro mensual vs sistemas separados</div>
          </div>
          <div class="roi-metric">
            <div class="roi-metric-num">48h</div>
            <div class="roi-metric-label">tiempo de implementación</div>
          </div>
          <div class="roi-metric">
            <div class="roi-metric-num">0</div>
            <div class="roi-metric-label">horas de cuadre manual</div>
          </div>
          <div class="roi-metric">
            <div class="roi-metric-num">24/7</div>
            <div class="roi-metric-label">acceso desde cualquier dispositivo</div>
          </div>
        </div>
      </div>
      <div>
        <ul class="roi-bullets">
          <li>
            <span class="roi-bullet-icon">📦</span>
            <div>El inventario se descuenta automáticamente con cada orden. <strong style="color:white;">Nunca más conteo manual al final del día.</strong></div>
          </li>
          <li>
            <span class="roi-bullet-icon">🧾</span>
            <div>Cada venta genera una factura electrónica con CUFE y registra el movimiento en contabilidad. <strong style="color:white;">Sin doble digitación.</strong></div>
          </li>
          <li>
            <span class="roi-bullet-icon">🔐</span>
            <div>El arqueo compara el efectivo esperado vs contado. El acta de cierre queda firmada y guardada. <strong style="color:white;">Auditable en cualquier momento.</strong></div>
          </li>
          <li>
            <span class="roi-bullet-icon">📈</span>
            <div>El dueño ve en segundos cuánto ganó, cuánto costaron los ingredientes y cuál es el margen. <strong style="color:white;">Decisiones con datos, no intuición.</strong></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════
     CTA FINAL
═══════════════════════════════════ -->
<section class="cta-section">
  <div class="container-narrow">
    <h2 class="cta-title">¿Listo para operar como un restaurante del 2026?</h2>
    <p class="cta-sub">Implementación en 48 horas con su menú, su equipo y sus datos reales. Sin contratos largos.</p>
    <div class="cta-buttons">
      <a href="/login" class="btn-gold" style="font-size:16px; padding:16px 32px;">
        ▶ Probar el sistema ahora
      </a>
      <a href="https://wa.me/573TUNUMERO?text=Hola,%20vi%20Mesaio%20y%20quiero%20info%20para%20mi%20restaurante" 
        class="btn-outline" style="font-size:16px; padding:16px 32px; border-color:var(--burgundy); color:var(--burgundy);">
        💬 Hablar por WhatsApp
      </a>
    </div>
    <div style="margin-top:32px; display:flex; gap:32px; justify-content:center; flex-wrap:wrap;">
      <div style="font-size:13px; color:var(--muted);">✓ Sin contrato de permanencia</div>
      <div style="font-size:13px; color:var(--muted);">✓ Implementación incluida</div>
      <div style="font-size:13px; color:var(--muted);">✓ Soporte directo con el equipo</div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════
     FOOTER
═══════════════════════════════════ -->
<footer>
  <div class="footer-logo">Mesaio</div>
  <div class="footer-links">
    <a href="/login">Demo</a>
    <a href="/menu">Carta</a>
    <a href="/entregables/">Módulos</a>
    <a href="https://github.com/HernandoSilvaLeal/c8_mesaio">GitHub</a>
  </div>
  <div class="footer-copy">
    Sistema de gestión profesional para restaurantes colombianos · 
    Mesero · Cocina · Administración · Inventario · Facturación · Contabilidad
  </div>
</footer>

</body>
```

---

## GIT COMMIT

```bash
git add index.html
git commit -m "feat: Landing Shark Tank — narrativa venta, ROI, precio correcto, 9 features, roles"
git push origin main
```