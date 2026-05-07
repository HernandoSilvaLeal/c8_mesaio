/**
 * atlas-chat-widget.js — ATLAS v3.0 · AppCors S.A.S.
 * Ventana de chat ENCIMA de la mascota · diseño premium
 * Posición dinámica via CSS var --atlas-h seteada por mascota-rnt.js
 *
 * PORTABILIDAD: solo cambiar SB_FUNCTION_URL para otro cliente
 */
(function () {
  'use strict';

  var SB_FUNCTION_URL = 'https://fttrbfntgxvbfdmndogo.supabase.co/functions/v1/atlas-chat';
  var SB_ANON_KEY = 'sb_publishable_vezVeH9SMl9b_WmG0QMD9Q_j4sMS4Xe';

  var _history = [];

  var CSS = [
    /* ── Botón flotante mobile (mascota oculta <576px) ── */
    '#atlas-btn{position:fixed;bottom:90px;right:20px;width:56px;height:56px;',
    'border-radius:50%;background:linear-gradient(135deg,#0B1D3A,#1B3A6B);',
    'border:2px solid #C8A951;cursor:pointer;z-index:1041;',
    'box-shadow:0 4px 20px rgba(11,29,58,.40);display:none;align-items:center;',
    'justify-content:center;font-size:22px;transition:transform .2s,box-shadow .2s}',
    '#atlas-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(11,29,58,.50)}',
    '#atlas-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;',
    'border-radius:50%;background:#C8A951;font-size:10px;color:#0B1D3A;',
    'display:none;align-items:center;justify-content:center;font-weight:800}',

    /* ── Ventana de chat — ENCIMA de la mascota ── */
    /* --atlas-h es seteada por mascota-rnt.js en tiempo real según altura de la imagen */
    '#atlas-win{position:fixed;',
    'left:10px;',
    'bottom:calc(var(--atlas-h,360px) + 14px);',
    'width:330px;',
    'height:460px;',
    'max-height:calc(100vh - var(--atlas-h,360px) - 24px);',
    'background:#fff;',
    'border-radius:20px;',
    'border:1px solid rgba(200,169,81,.20);',
    'box-shadow:',
    '  0 32px 72px rgba(11,29,58,.22),',
    '  0 12px 28px rgba(11,29,58,.10),',
    '  0 0 0 1px rgba(200,169,81,.08);',
    'z-index:1040;display:none;flex-direction:column;overflow:hidden;',
    "font-family:'Segoe UI',system-ui,-apple-system,sans-serif;",
    'animation:atlasUp .35s cubic-bezier(.34,1.56,.64,1)}',

    '@keyframes atlasUp{',
    'from{opacity:0;transform:translateY(18px) scale(.95)}',
    'to{opacity:1;transform:translateY(0) scale(1)}}',

    /* ── Header premium ── */
    '#atlas-head{',
    'background:linear-gradient(135deg,#0B1D3A 0%,#1B3A6B 100%);',
    'border-bottom:2px solid rgba(200,169,81,.28);',
    'padding:12px 14px;',
    'display:flex;align-items:center;justify-content:space-between;',
    'gap:10px}',
    '#atlas-head-left{display:flex;align-items:center;gap:10px;min-width:0}',
    '#atlas-avatar{width:38px;height:38px;flex-shrink:0;',
    'border-radius:50%;border:2px solid rgba(200,169,81,.40);',
    'background:rgba(255,255,255,.10);',
    'object-fit:contain;padding:2px}',
    '#atlas-head .atl-t{color:#fff;font-weight:800;font-size:13.5px;letter-spacing:.2px}',
    '#atlas-head .atl-s{color:rgba(255,255,255,.65);font-size:10.5px;margin-top:1px;',
    'display:flex;align-items:center;gap:4px}',
    '.atl-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;flex-shrink:0;',
    'box-shadow:0 0 6px rgba(74,222,128,.80)}',
    '#atlas-head button{background:rgba(255,255,255,.10);',
    'border:1px solid rgba(255,255,255,.18);',
    'color:rgba(255,255,255,.85);cursor:pointer;font-size:17px;',
    'width:30px;height:30px;border-radius:8px;flex-shrink:0;',
    'display:flex;align-items:center;justify-content:center;',
    'transition:background .15s;line-height:1;padding:0}',
    '#atlas-head button:hover{background:rgba(255,255,255,.22)}',

    /* ── Área de mensajes ── */
    '#atlas-msgs{flex:1;overflow-y:auto;',
    'padding:14px 12px;',
    'display:flex;flex-direction:column;gap:8px;',
    'background:linear-gradient(180deg,#F8FAFC 0%,#ffffff 50%);',
    'scroll-behavior:smooth}',

    /* Scroll styling */
    '#atlas-msgs::-webkit-scrollbar{width:4px}',
    '#atlas-msgs::-webkit-scrollbar-track{background:transparent}',
    '#atlas-msgs::-webkit-scrollbar-thumb{background:rgba(11,29,58,.15);border-radius:4px}',

    /* Burbujas de mensaje */
    '.am{max-width:84%;padding:9px 13px;border-radius:14px;',
    'font-size:13px;line-height:1.55;word-break:break-word;white-space:pre-wrap}',
    '.am.bot{background:#F1F5F9;color:#1A2332;align-self:flex-start;',
    'border-bottom-left-radius:4px;',
    'box-shadow:0 1px 4px rgba(0,0,0,.07)}',
    '.am.usr{background:linear-gradient(135deg,#0B1D3A,#1B3A6B);color:#fff;',
    'align-self:flex-end;border-bottom-right-radius:4px;',
    'box-shadow:0 2px 10px rgba(11,29,58,.28)}',
    '.am .atl-wa{display:inline-block;margin-top:8px;padding:7px 16px;',
    'background:#25D366;color:#fff;border-radius:10px;text-decoration:none;',
    'font-size:12px;font-weight:800}',

    /* Typing dots */
    '.atl-dots{display:flex;gap:5px;padding:10px 14px;background:#F1F5F9;',
    'border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;',
    'box-shadow:0 1px 4px rgba(0,0,0,.07)}',
    '.atl-dots span{width:7px;height:7px;border-radius:50%;background:#94A3B8;',
    'animation:atlDot 1.2s infinite}',
    '.atl-dots span:nth-child(2){animation-delay:.2s}',
    '.atl-dots span:nth-child(3){animation-delay:.4s}',
    '@keyframes atlDot{0%,60%,100%{transform:translateY(0);opacity:.35}',
    '30%{transform:translateY(-5px);opacity:1}}',

    /* ── Footer ── */
    '#atlas-foot{padding:10px 12px;',
    'border-top:1px solid #E8EEF4;',
    'background:#FAFCFE;',
    'display:flex;gap:8px;align-items:center}',
    '#atlas-input{flex:1;border:1.5px solid #E2E8F0;border-radius:10px;',
    'padding:8px 12px;font-size:13px;outline:none;background:#fff;',
    'transition:border-color .2s,box-shadow .2s;color:#1A2332}',
    '#atlas-input:focus{border-color:#1B3A6B;box-shadow:0 0 0 3px rgba(27,58,107,.08)}',
    '#atlas-input::placeholder{color:#94A3B8}',
    '#atlas-send{width:36px;height:36px;border-radius:10px;flex-shrink:0;',
    'background:linear-gradient(135deg,#C8A951,#E2C87A);border:none;cursor:pointer;',
    'font-size:15px;display:flex;align-items:center;justify-content:center;',
    'transition:transform .15s,box-shadow .15s;',
    'box-shadow:0 2px 8px rgba(200,169,81,.35)}',
    '#atlas-send:hover{transform:scale(1.08);box-shadow:0 4px 14px rgba(200,169,81,.50)}',
    '#atlas-send:disabled,#atlas-input:disabled{opacity:.45;cursor:not-allowed}',

    /* ── Mobile: mascota oculta → botón flotante derecha ── */
    '@media(max-width:575.98px){',
    '#atlas-btn{display:flex}',
    '#atlas-win{left:8px;right:8px;width:auto;',
    'bottom:155px;height:70vh;max-height:70vh;border-radius:16px}',
    '}'
  ].join('');

  function verificarYMontar() {
    var base = SB_FUNCTION_URL.split('/functions/')[0];
    fetch(base + '/rest/v1/atlas_config?id=eq.1&select=atlas_enabled', {
      headers: {
        'apikey': SB_ANON_KEY,
        'Authorization': 'Bearer ' + SB_ANON_KEY
      }
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d[0] && d[0].atlas_enabled === true) montar();
      })
      .catch(function () { /* silencioso */ });
  }

  function montar() {
    var s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);

    /* Botón mobile */
    var btn = document.createElement('button');
    btn.id = 'atlas-btn';
    btn.setAttribute('aria-label', 'Chat con ATLAS');
    btn.innerHTML = '🤖<span id="atlas-badge">1</span>';
    btn.onclick = toggle;
    document.body.appendChild(btn);

    /* Ventana de chat */
    var win = document.createElement('div');
    win.id = 'atlas-win';
    win.innerHTML =
      '<div id="atlas-head">' +
      '  <div id="atlas-head-left">' +
      '    <img id="atlas-avatar" src="assets/img/mascota/atlas.png" alt="ATLAS" onerror="this.style.display=\'none\'">' +
      '    <div>' +
      '      <div class="atl-t">ATLAS · Asistente RNT</div>' +
      '      <div class="atl-s"><span class="atl-dot"></span>En línea · Responde en segundos</div>' +
      '    </div>' +
      '  </div>' +
      '  <button id="atlas-close" aria-label="Cerrar">&#x2715;</button>' +
      '</div>' +
      '<div id="atlas-msgs"></div>' +
      '<div id="atlas-foot">' +
      '  <input id="atlas-input" placeholder="Escribe tu pregunta..." maxlength="300">' +
      '  <button id="atlas-send" aria-label="Enviar">&#x27A4;</button>' +
      '</div>';
    document.body.appendChild(win);

    /* Mensaje de bienvenida */
    setTimeout(function () {
      msg('bot',
        '¡Hola! Soy ATLAS 👋 El asistente de Red Nacional de Transportes.\n\n' +
        '¿En qué te ayudo?\n· Rastrear un envío\n· Cotizar un paquete\n· Información sobre servicios'
      );
      var badge = document.getElementById('atlas-badge');
      if (badge) badge.style.display = 'flex';
    }, 1800);

    document.getElementById('atlas-close').onclick = toggle;
    document.getElementById('atlas-send').onclick = enviar;
    document.getElementById('atlas-input').onkeydown = function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
    };

    /* Exponer toggle global para que la mascota pueda abrir/cerrar */
    window.atlasToggle = toggle;

    /* Si la mascota fue clickeada antes de que el widget montara, abrir ahora */
    if (window._atlasPendingOpen) {
      window._atlasPendingOpen = false;
      setTimeout(toggle, 80);
    }
  }

  function toggle() {
    var win = document.getElementById('atlas-win');
    if (!win) return;
    var abierto = win.style.display === 'flex';
    win.style.display = abierto ? 'none' : 'flex';
    if (!abierto) {
      var badge = document.getElementById('atlas-badge');
      if (badge) badge.style.display = 'none';
      var inp = document.getElementById('atlas-input');
      if (inp) inp.focus();
      document.dispatchEvent(new CustomEvent('atlas:open'));
    } else {
      document.dispatchEvent(new CustomEvent('atlas:close'));
    }
  }

  function msg(tipo, texto) {
    var msgs = document.getElementById('atlas-msgs');
    var d = document.createElement('div');
    d.className = 'am ' + tipo;
    /* Captura link WhatsApp en cualquier formato: URL sola o [texto](url) markdown */
    var waMatch = texto.match(/https:\/\/wa\.me\/[^\s")\]]+/);
    if (waMatch) {
      var limpio = texto
        .replace(/\[([^\]]*)\]\(https:\/\/wa\.me\/[^)]+\)/g, '')  /* [texto](url) */
        .replace(/https:\/\/wa\.me\/[^\s")\]]+/g, '')              /* URL sola */
        .replace(/\s{2,}/g, ' ').trim();
      d.textContent = limpio;
      var br = document.createElement('br');
      var a = document.createElement('a');
      a.className = 'atl-wa';
      a.href = waMatch[0];
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = '💬 Hablar con asesor';
      d.appendChild(br);
      d.appendChild(a);
    } else {
      d.textContent = texto;
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function typing(show) {
    var el = document.getElementById('atl-dots');
    if (show && !el) {
      var d = document.createElement('div');
      d.className = 'atl-dots'; d.id = 'atl-dots';
      d.innerHTML = '<span></span><span></span><span></span>';
      var msgs = document.getElementById('atlas-msgs');
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    } else if (!show && el) {
      el.remove();
    }
  }

  function enviar() {
    var inp = document.getElementById('atlas-input');
    var btn = document.getElementById('atlas-send');
    var txt = (inp.value || '').trim();
    if (!txt) return;

    inp.value = ''; inp.disabled = true; btn.disabled = true;
    msg('usr', txt);
    _history.push({ role: 'user', content: txt });
    typing(true);

    fetch(SB_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: _history })
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        typing(false);
        if (json.error === 'ATLAS_DISABLED') {
          msg('bot', 'El servicio no está disponible ahora. Contáctanos al (601) 272 6117 o WhatsApp +57 312 437 6616.');
          inp.disabled = false; btn.disabled = false; inp.focus();
          return;
        }
        var reply = json.reply || 'Ocurrió un error. Escríbenos al WhatsApp: +57 312 437 6616';
        msg('bot', reply);
        _history.push({ role: 'assistant', content: reply });
        if (_history.length > 20) _history = _history.slice(-20);
        inp.disabled = false; btn.disabled = false; inp.focus();
      })
      .catch(function () {
        typing(false);
        msg('bot', 'Sin conexión 😕 Escríbenos al WhatsApp: +57 312 437 6616');
        inp.disabled = false; btn.disabled = false; inp.focus();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarYMontar);
  } else {
    verificarYMontar();
  }

}());
