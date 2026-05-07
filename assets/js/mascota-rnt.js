/**
 * mascota-rnt.js v9 — Decorativa por defecto · interactiva si atlas_enabled=true
 * Consulta atlas_config en Supabase antes de activar burbuja/CTA/click.
 * Un solo SQL controla todo: atlas_enabled true/false.
 */
(function () {
  'use strict';

  var SB_URL      = 'https://fttrbfntgxvbfdmndogo.supabase.co';
  var SB_ANON_KEY = 'sb_publishable_vezVeH9SMl9b_WmG0QMD9Q_j4sMS4Xe';

  document.documentElement.style.setProperty('--atlas-h', '350px');

  var _wrap; // referencia global dentro del IIFE

  function montarMascota() {
    if (document.getElementById('atlas-rnt')) return;

    /* ── Estilos (animaciones + burbuja + CTA) ── */
    var style = document.createElement('style');
    style.textContent = [
      '@keyframes mascotaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
      '@keyframes bubblePop{0%{opacity:0;transform:translateX(-50%) scale(.7) translateY(8px)}',
      '70%{transform:translateX(-50%) scale(1.05) translateY(-2px)}',
      '100%{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}',
      '@keyframes ctaPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,169,81,.6)}',
      '60%{box-shadow:0 0 0 10px rgba(200,169,81,0)}}',
      '#atlas-bubble{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);',
      'background:#fff;border:2px solid #C8A951;border-radius:14px;padding:9px 16px;',
      'font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13px;',
      'color:#0B1D3A;font-weight:700;line-height:1.3;white-space:nowrap;',
      'box-shadow:0 4px 18px rgba(11,29,58,.20);pointer-events:auto !important;',
      'cursor:pointer;opacity:0;transition:opacity 400ms ease;z-index:2}',
      '#atlas-bubble::after{content:"";position:absolute;top:100%;left:50%;',
      'transform:translateX(-50%);border-left:9px solid transparent;',
      'border-right:9px solid transparent;border-top:10px solid #C8A951}',
      '#atlas-bubble::before{content:"";position:absolute;top:calc(100% - 2px);left:50%;',
      'transform:translateX(-50%);border-left:7px solid transparent;',
      'border-right:7px solid transparent;border-top:9px solid #fff;z-index:1}',
      '#atlas-cta{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);',
      'background:linear-gradient(135deg,#C8A951 0%,#E2C87A 100%);',
      'color:#0B1D3A;font-weight:800;font-size:12px;border:none;border-radius:20px;',
      'padding:7px 18px;cursor:pointer;white-space:nowrap;',
      'box-shadow:0 3px 12px rgba(200,169,81,.50);animation:ctaPulse 2.2s infinite;',
      'pointer-events:auto !important;z-index:3;opacity:0;',
      'font-family:system-ui,-apple-system,Segoe UI,sans-serif;transition:transform .15s,opacity .4s}',
      '#atlas-cta:hover{transform:translateX(-50%) scale(1.07)!important}',
      '@media(max-width:991.98px){#atlas-bubble{font-size:12px;padding:7px 12px}}',
      '@media(max-width:767.98px){#atlas-bubble{font-size:11px;padding:6px 10px}',
      '#atlas-cta{font-size:11px;padding:6px 14px}}'
    ].join('');
    document.head.appendChild(style);

    /* ── Wrapper — NO interactivo por defecto ── */
    var wrap = document.createElement('div');
    _wrap = wrap;
    wrap.id = 'atlas-rnt';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'ATLAS — Mascota RNT');
    wrap.style.cssText =
      'position:fixed !important;left:0 !important;bottom:0 !important;' +
      'z-index:1040 !important;pointer-events:none !important;cursor:default !important;' +
      'background:transparent !important;border-radius:0 !important;overflow:visible !important;' +
      'opacity:0;transition:opacity 500ms ease;' +
      'animation:mascotaFloat 3.5s ease-in-out infinite;';

    /* ── Imagen ── */
    var img = document.createElement('img');
    img.src = 'assets/img/mascota/atlas.png';
    img.alt = 'ATLAS';
    img.style.cssText =
      'width:100%;height:auto;display:block;pointer-events:none !important;' +
      'filter:drop-shadow(0 8px 24px rgba(0,0,0,.35)) drop-shadow(0 2px 8px rgba(13,27,75,.25));';
    img.onerror = function () { this.onerror = null; wrap.style.display = 'none'; };

    img.addEventListener('load', function () {
      requestAnimationFrame(function () {
        var h = wrap.offsetHeight;
        if (h > 0) document.documentElement.style.setProperty('--atlas-h', h + 'px');
      });
    });

    wrap.appendChild(img);
    document.body.appendChild(wrap);

    /* ── Responsive ── */
    function responsive() {
      var w = window.innerWidth;
      if (w < 576)      { wrap.style.display = 'none'; }
      else if (w < 768) { wrap.style.display = 'block'; wrap.style.width = '160px'; }
      else if (w < 992) { wrap.style.display = 'block'; wrap.style.width = '220px'; }
      else              { wrap.style.display = 'block'; wrap.style.width = '300px'; }
    }
    responsive();
    window.addEventListener('resize', responsive, { passive: true });

    /* ── Mascota aparece siempre ── */
    setTimeout(function () { wrap.style.opacity = '1'; }, 1000);

    /* ── Luego verifica si debe ser interactiva ── */
    fetch(SB_URL + '/rest/v1/atlas_config?id=eq.1&select=atlas_enabled', {
      headers: { 'apikey': SB_ANON_KEY, 'Authorization': 'Bearer ' + SB_ANON_KEY }
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d[0] && d[0].atlas_enabled === true) activarInteractividad(wrap);
      })
      .catch(function () { /* silencioso — mascota queda decorativa */ });
  }

  /* ── Se llama SOLO si atlas_enabled = true ── */
  function activarInteractividad(wrap) {
    /* Hacer wrapper clickeable */
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', 'Abrir chat ATLAS');
    wrap.setAttribute('tabindex', '0');
    wrap.style.setProperty('pointer-events', 'auto', 'important');
    wrap.style.cursor = 'pointer';

    /* Burbuja sobre la cabeza */
    var bubble = document.createElement('div');
    bubble.id = 'atlas-bubble';
    bubble.textContent = '¡Hola! ¿En qué te ayudo? 💬';
    wrap.insertBefore(bubble, wrap.firstChild);

    /* Botón CTA */
    var cta = document.createElement('button');
    cta.id = 'atlas-cta';
    cta.type = 'button';
    cta.textContent = '💬 Hablar con ATLAS';
    wrap.appendChild(cta);

    /* Handler de click */
    function abrirChat(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (typeof window.atlasToggle === 'function') { window.atlasToggle(); return; }
      var win = document.getElementById('atlas-win');
      if (win) {
        var ab = win.style.display === 'flex';
        win.style.display = ab ? 'none' : 'flex';
        bubble.style.opacity = ab ? '1' : '0';
        cta.style.opacity    = ab ? '1' : '0';
        if (!ab) {
          var inp = document.getElementById('atlas-input');
          if (inp) inp.focus();
          document.dispatchEvent(new CustomEvent('atlas:open'));
        } else {
          document.dispatchEvent(new CustomEvent('atlas:close'));
        }
        return;
      }
      window._atlasPendingOpen = true;
    }

    wrap.addEventListener('click', abrirChat);
    bubble.addEventListener('click', abrirChat);
    cta.addEventListener('click', abrirChat);
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') abrirChat(e);
    });

    /* Sincronizar con eventos del chat */
    document.addEventListener('atlas:open',  function () {
      bubble.style.opacity = '0'; cta.style.opacity = '0';
    });
    document.addEventListener('atlas:close', function () {
      bubble.style.opacity = '1'; cta.style.opacity = '1';
    });

    /* Animar burbuja y CTA */
    setTimeout(function () {
      bubble.style.opacity = '1';
      bubble.style.animation = 'bubblePop .5s cubic-bezier(.34,1.56,.64,1) forwards';
    }, 1200);
    setTimeout(function () { cta.style.opacity = '1'; }, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montarMascota);
  } else {
    montarMascota();
  }
}());