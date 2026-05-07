/**
 * cookies-banner.js — Aviso Ley 1581/2012 Colombia
 * Autocontenido: se monta solo al agregarlo con <script src>
 * No vuelve a aparecer después de que el usuario acepta (localStorage)
 */
(function () {
  'use strict';
  if (localStorage.getItem('rnt_ok')) return;

  var b = document.createElement('div');
  b.id = 'rnt-cookies';
  b.style.cssText =
    'position:fixed;bottom:0;left:0;right:0;' +
    'background:#0B1D3A;color:#fff;' +
    'padding:12px 20px;' +
    'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
    'border-top:2px solid #C8A951;' +
    'box-shadow:0 -4px 20px rgba(0,0,0,.18);' +
    'z-index:1035;' +
    'font-family:system-ui,-apple-system,Segoe UI,sans-serif;' +
    'font-size:13.5px;line-height:1.4;' +
    'flex-wrap:wrap';

  b.innerHTML =
    '<p style="margin:0;flex:1;min-width:200px">' +
    'Usamos cookies esenciales para el rastreo de envíos y funcionamiento del sitio. ' +
    'Al continuar aceptas nuestra ' +
    '<a href="privacy.html" style="color:#C8A951;font-weight:600;text-decoration:underline">' +
    'política de privacidad</a>.' +
    '</p>' +
    '<button id="rnt-ok-btn" style="' +
    'background:#C8A951;color:#0B1D3A;border:none;' +
    'padding:9px 22px;border-radius:6px;cursor:pointer;font-weight:800;' +
    'font-size:13px;white-space:nowrap;flex-shrink:0;' +
    'transition:transform .15s,box-shadow .15s;' +
    'box-shadow:0 2px 8px rgba(200,169,81,.35)">' +
    'Aceptar</button>';

  document.body.appendChild(b);

  var btn = document.getElementById('rnt-ok-btn');
  btn.onmouseover = function () { this.style.transform = 'scale(1.04)'; };
  btn.onmouseout  = function () { this.style.transform = ''; };
  btn.onclick = function () {
    b.style.transition = 'opacity .35s ease';
    b.style.opacity = '0';
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 380);
    localStorage.setItem('rnt_ok', '1');
  };
}());
