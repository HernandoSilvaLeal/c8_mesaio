/**
 * pdf-generator.js - Motor de generacion de PDFs RNT
 * Version: 1.1 - 23-Abr-2026 (BUG-02 fix: encoding + rntGenerarCumplido)
 *
 * Genera 4 tipos de documento directamente en el browser:
 *   rotulo      -> Etiqueta adhesiva, 3 copias, 100x180mm
 *   comprobante -> Ticket verticalizado, 80x200mm
 *   carta       -> Hoja Letter con 3 secciones, 216x279mm
 *   cumplido    -> Comprobante con firma activada
 *
 * DEPENDENCIAS (cargadas desde CDN antes de este script):
 *   window.jspdf.jsPDF
 *   window.QRCode
 *
 * VARIABLE SUPABASE EN ESTE PROYECTO: sbClient
 * NIT INVARIANTE: 901.040.715-7 - NUNCA CAMBIAR
 *
 * AUTORIZACION: Nando Silva, AppCors S.A.S. - autonomia total
 */

'use strict';

var _rntPrintWindow = null;

// SEC-7.4: escapa HTML en todos los campos de guía antes de inyectar en innerHTML
function _escPdf(v) {
  return String(v !== null && v !== undefined && v !== '' ? v : '—')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ================================================================
   CONSTANTES INVARIANTES DEL CLIENTE
   ================================================================ */
var RNT = {
  nombre:   'RED NACIONAL DE TRANSPORTES SAS',
  nit:      'NIT 901.040.715-7',
  telefono: 'TELEFONO: 3124376616',
  pbx:      'PBX 2726117 - 2695585',
  web:      'www.rednacionaldetransportes.com',
  email:    'servicioalcliente@rednacionaldetransportes.com',
  logo:     '../assets/img/logo.png',
  rastreo:  'https://rednacionaldetransporte.netlify.app/?guia='
};

var RNT_ROTT = 'El art. 13 del ROTT establece que las autoridades competentes ' +
  'podran fijar contratos tipo o CONDICIONES GENERALES DE CONTRATACION. ' +
  'Declaro que este envio NO contiene JOYAS, DINERO, TITULOS VALORES ' +
  'NI NADA DE PROHIBIDO TRANSPORTE.';

var RNT_DEST_AVISO = 'SR DESTINATARIO: FIRMADA LA REMISION NO DEVUELVA LA ' +
  'MERCANCIA SIN CONSULTARNOS. RESPONDEMOS HASTA POR EL VALOR DECLARADO ' +
  'ART 1010 INCISO 3 CODIGO DE COMERCIO';

/* ================================================================
   HELPER: Identificador de tipo de documento (badge navy/gold)
   ================================================================ */
function rntAgregarTipoDoc(doc, tipo, letra, yOff) {
  var pw = doc.internal.pageSize.width;
  var yo = yOff || 0;
  doc.setFillColor(13, 27, 75);
  doc.roundedRect(pw - 55, yo + 5, 50, 12, 2, 2, 'F');
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo ' + letra + ' · ' + tipo, pw - 30, yo + 12.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
}

/* ================================================================
   FUNCION PRINCIPAL - PUNTO DE ENTRADA DESDE EL ADMIN
   ================================================================ */

/**
 * Llamada desde los botones de impresion del admin.
 * Busca la guia en Supabase y delega al generador correcto.
 *
 * @param {string} numeroGuia  Numero de guia (ej: "RNT-2026-001")
 * @param {string} formato     'rotulo' | 'comprobante' | 'carta' | 'cumplido'
 */
async function rntImprimirGuia(numeroGuia, formato) {
  // Validar que jsPDF esta disponible
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('Error: jsPDF no esta cargado. Recarga la pagina e intenta de nuevo.');
    return;
  }

  // Indicador de carga
  rntSetLoadingState(numeroGuia, true);

  try {
    var client = window.sbClient || (typeof sbClient !== 'undefined' ? sbClient : null);
    if (!client) {
      throw new Error('Cliente Supabase no disponible en admin.');
    }

    // Consultar guia en Supabase - VARIABLE: sbClient (confirmado en MEGA SPEC 1.1)
    var { data: guia, error } = await client
      .from('guias')
      .select('*')
      .eq('id_guia', numeroGuia)
      .single();

    if (error) throw new Error('Supabase error: ' + error.message);
    if (!guia)  throw new Error('Guía ' + numeroGuia + ' no encontrada.');
    guia = rntNormalizarGuia(guia);

    // Generar QR como data URL (con la URL de rastreo)
    var qrUrl   = RNT.rastreo + encodeURIComponent(numeroGuia);
    var qrData  = await rntQRDataUrl(qrUrl);

    // Cargar logo como data URL (canvas blanco para fondo negro del logo)
    var logoData = await rntLogoDataUrl();

    // Delegar al generador segun el formato solicitado
    switch (formato) {
      case 'rotulo':
        await rntGenerarRotulo(guia, qrData, logoData);
        break;
      case 'comprobante':
        await _rntComprobanteJsPDF(guia, qrData, logoData, false);
        break;
      case 'carta':
        await rntGenerarCarta(guia, qrData, logoData);
        break;
      case 'cumplido':
        await _rntComprobanteJsPDF(guia, qrData, logoData, true);
        break;
      default:
        throw new Error('Formato desconocido: ' + formato);
    }

  } catch (err) {
    console.error('[PDF RNT]', err);
    alert('No se pudo generar el PDF: ' + err.message);
  } finally {
    rntSetLoadingState(numeroGuia, false);
  }
}

/* ================================================================
   UTILIDADES
   ================================================================ */

/** Genera el QR code como data URL PNG desde un texto */
function rntQRDataUrl(texto) {
  return new Promise(function(resolve, reject) {
    var div = document.createElement('div');
    div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
    document.body.appendChild(div);

    try {
      new QRCode(div, {
        text:         texto,
        width:        128,
        height:       128,
        colorDark:    '#000000',
        colorLight:   '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      // QRCode.js es sincrono internamente pero usa setTimeout para render
      setTimeout(function() {
        var canvas = div.querySelector('canvas');
        var img    = div.querySelector('img');
        var data   = canvas ? canvas.toDataURL('image/png')
                            : (img ? img.src : null);
        document.body.removeChild(div);
        resolve(data);
      }, 300);
    } catch(e) {
      if (document.body.contains(div)) document.body.removeChild(div);
      resolve(null); // QR opcional - el PDF funciona sin el
    }
  });
}

/** Carga el logo como data URL con fondo blanco (logo tiene fondo negro) */
function rntLogoDataUrl() {
  return new Promise(function(resolve) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      var c = document.createElement('canvas');
      c.width  = img.naturalWidth  || 400;
      c.height = img.naturalHeight || 120;
      var ctx  = c.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; // fondo blanco primero
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = function() {
      console.warn('[PDF RNT] Logo no cargo - PDF sin logo');
      resolve(null);
    };
    img.src = RNT.logo + '?t=' + Date.now(); // cache bust
  });
}

/** Formatea numero a COP: $1.234.567 */
function cop(n) {
  return '$' + (Math.round(parseFloat(n) || 0)).toLocaleString('es-CO');
}

function fecha(iso) {
  if (!iso) return new Date().toLocaleDateString('es-CO');
  return new Date(iso).toLocaleString('es-CO', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
}

/**
 * Normaliza una guía para compatibilidad entre nombres legacy y schema actual.
 * Mantiene aliases para no reescribir todos los generadores PDF.
 */
function rntNormalizarGuia(g) {
  var guia = Object.assign({}, g || {});

  var idGuia = guia.id_guia || guia.numero_guia || guia.numero_guia_carrier || '';
  guia.id_guia = idGuia;
  guia.numero_guia = guia.numero_guia || idGuia;

  guia.fecha_creacion = guia.fecha_creacion || guia.created_at || null;
  guia.ciudad_destino = guia.ciudad_destino || guia.destino_municipio || guia.ciudad_actual || '';
  guia.peso_real = guia.peso_real ?? guia.peso_kg ?? 0;
  guia.unidades = guia.unidades ?? guia.cantidad_unidades ?? 1;
  guia.total_estimado = guia.total_estimado ?? guia.total_cobro ?? 0;

  guia.remitente_telefono =
    guia.remitente_telefono || guia.telefono_remitente || guia.remitente_tel || '';
  guia.destinatario_telefono =
    guia.destinatario_telefono || guia.telefono_destinatario || guia.destinatario_tel || '';

  return guia;
}
/** Activa/desactiva el estado de carga en los botones de la guia */
function rntSetLoadingState(numero, loading) {
  document.querySelectorAll('[onclick*="' + numero + '"]').forEach(function(el) {
    el.style.opacity       = loading ? '0.5' : '1';
    el.style.pointerEvents = loading ? 'none' : '';
  });
}

/* ── Helpers Tipo A / B ── */
function rntFmt(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CO');
}
function rntFecha(fechaStr) {
  if (!fechaStr) return '—';
  var d = new Date(fechaStr);
  return d.toLocaleDateString('es-CO') + ' · ' +
         d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
function rntTipoServicio(pesoReal) {
  return Number(pesoReal) > 20 ? 'MERCANCÍA' : 'PAQUETE';
}

/* ================================================================
   GENERADOR 1: ROTULO / ADHESIVO — html2canvas + jsPDF (spec definitivo)
   ================================================================ */

async function rntGenerarRotulo(idGuia) {
  var client = window.sbClient || (typeof sbClient !== 'undefined' ? sbClient : null);
  if (!client) { alert('Error de configuracion. Recarga la pagina.'); return; }
  if (!window.html2canvas) { alert('Error: html2canvas no cargado. Recarga la pagina.'); return; }
  if (!window.jspdf || !window.jspdf.jsPDF) { alert('Error: jsPDF no cargado. Recarga la pagina.'); return; }

  var res = await client.from('guias').select('*').eq('id_guia', idGuia).single();
  if (res.error || !res.data) { alert('No se encontro la guia: ' + idGuia); return; }
  var g = res.data;

  var safe = _escPdf;
  var totalUnidades = Math.max(1, parseInt(g.unidades) || 1);
  var tipoSrv = g.tipo_servicio ? String(g.tipo_servicio).toUpperCase()
    : (Number(g.peso_real || 0) > 20 ? 'MERCANCIA' : 'PAQUETE');
  var fmtFecha = g.fecha_creacion
    ? new Date(g.fecha_creacion).toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'numeric'})
    : '—';
  var uid = 'r' + Date.now();

  var css = [
    '.rotulo-rnt * { box-sizing:border-box; margin:0; padding:0; }',
    '.rotulo-rnt { width:390px; background:#fff; border:1.5px solid #000;',
    '  padding:10px 12px; font-family:Arial,Helvetica,sans-serif; font-size:9pt;',
    '  color:#000; line-height:1.55; }',
    '.rotulo-rnt .rnt-empresa { text-align:center; margin-bottom:6px; }',
    '.rotulo-rnt .logo-img { width:140px; height:auto; display:block; margin:0 auto 4px; }',
    '.rotulo-rnt .nombre { font-size:11pt; font-weight:700; line-height:1.3; }',
    '.rotulo-rnt .nit,.rotulo-rnt .tel { font-size:9pt; font-weight:700; line-height:1.4; }',
    '.rotulo-rnt .rnt-guia-qr { display:flex; justify-content:space-between;',
    '  align-items:flex-start; margin-bottom:4px; }',
    '.rotulo-rnt .rnt-guia-left { flex:1; padding-right:8px; }',
    '.rotulo-rnt .rnt-num-guia { font-size:20pt; font-weight:900; line-height:1.05; margin-bottom:4px; }',
    '.rotulo-rnt .rnt-tipo-srv { font-size:9pt; font-weight:700; line-height:1.4; }',
    '.rotulo-rnt .rnt-dato { font-size:8.5pt; line-height:1.5; }',
    '.rotulo-rnt .rnt-dato b { font-weight:700; }',
    '.rotulo-rnt .rnt-unidad-badge { display:inline-block; background:#000; color:#fff;',
    '  font-size:13pt; font-weight:900; padding:3px 12px; margin-top:5px; letter-spacing:.04em; }',
    '.rotulo-rnt .rnt-qr-box { flex-shrink:0; }',
    '.rotulo-rnt .rnt-qr-box canvas,.rotulo-rnt .rnt-qr-box img',
    '  { width:120px !important; height:120px !important; display:block; }',
    '.rotulo-rnt .rnt-sep-fina { border:none; border-top:1px solid #000; margin:4px 0; }',
    '.rotulo-rnt .rnt-sep-gruesa { border:none; border-top:3.5px solid #000; margin:5px 0; }',
    '.rotulo-rnt .rnt-seccion { font-size:8.5pt; line-height:1.6; padding:0 2px; }',
    '.rotulo-rnt .rnt-seccion b { font-weight:700; }'
  ].join(' ');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;

  // padding:3px en container garantiza que los 4 bordes del rotulo sean visibles
  var container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-99999px;top:0;background:white;display:inline-block;padding:3px;';
  container.appendChild(styleEl);

  // Fila AFORO solo si hay datos (los campos no existen aun en schema Supabase)
  var aforoLine = (g.aforador || g.oficina)
    ? '<hr class="rnt-sep-fina"><div class="rnt-seccion"><div><b>AFORO:</b> ' + safe(g.aforador) + ', <b>OFICINA:</b> ' + safe(g.oficina) + '</div></div>'
    : '';

  for (var n = 1; n <= totalUnidades; n++) {
    var rDiv = document.createElement('div');
    rDiv.className = 'rotulo-rnt';
    rDiv.innerHTML =
      '<div class="rnt-empresa">' +
        '<img class="logo-img" src="/assets/img/logo_rect.png" alt="RNT" crossorigin="anonymous">' +
        '<div class="nombre">RED NACIONAL DE TRANSPORTES SAS</div>' +
        '<div class="nit">NIT 901.040.715-7</div>' +
        '<div class="tel">TELEFONO: 3124376616</div>' +
      '</div>' +
      '<div class="rnt-guia-qr">' +
        '<div class="rnt-guia-left">' +
          '<div class="rnt-num-guia">No. ' + safe(g.id_guia) + '</div>' +
          '<div class="rnt-tipo-srv">' + tipoSrv + '</div>' +
          '<div class="rnt-dato"><b>FECHA:</b> ' + fmtFecha + '</div>' +
          '<div class="rnt-dato"><b>PESO KILOGRAMOS:</b> ' + safe(g.peso_real) + ' kg</div>' +
          '<div class="rnt-unidad-badge">UNIDAD: ' + n + ' DE ' + totalUnidades + '</div>' +
        '</div>' +
        '<div class="rnt-qr-box" id="' + uid + '-' + n + '"></div>' +
      '</div>' +
      '<hr class="rnt-sep-fina">' +
      '<div class="rnt-seccion">' +
        '<div><b>ORIGEN:</b> ' + safe(g.ciudad_origen).toUpperCase() + '</div>' +
        '<div><b>DE:</b> ' + safe(g.remitente) + ' &nbsp;<b>TEL:</b> ' + safe(g.remitente_telefono) + '</div>' +
        '<div><b>DIRECCION:</b> ' + safe(g.remitente_direccion) + '</div>' +
        '<div><b>EMPAQUE:</b> ' + safe(g.tipo_embalaje) + ', <b>CONT. SIN VERIFICAR, DICE CONTENER:</b></div>' +
        '<div>' + safe(g.descripcion_contenido) + '</div>' +
      '</div>' +
      '<hr class="rnt-sep-gruesa">' +
      '<div class="rnt-seccion">' +
        '<div><b>DESTINO:</b> ' + safe(g.ciudad_destino).toUpperCase() + '</div>' +
        '<div><b>PARA:</b> ' + safe(g.destinatario) + ' &nbsp;<b>TEL:</b> ' + safe(g.destinatario_telefono) + '</div>' +
        '<div><b>DIRECCION:</b> ' + safe(g.destinatario_direccion) + '</div>' +
      '</div>' +
      aforoLine;
    container.appendChild(rDiv);

    if (n < totalUnidades) {
      var corte = document.createElement('div');
      corte.style.cssText = 'width:390px;border-top:1px dashed #999;text-align:center;font-size:7pt;color:#999;padding:3px 0;font-family:Arial;';
      corte.textContent = '── ✂ CORTE ── ' + n + '/' + totalUnidades + ' ──';
      container.appendChild(corte);
    }
  }

  document.body.appendChild(container);

  // Generar TODOS los QR antes del unico await
  var qrOpts = { text: idGuia, width: 120, height: 120,
    colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H };
  for (var i = 1; i <= totalUnidades; i++) {
    var qrEl = document.getElementById(uid + '-' + i);
    if (qrEl && typeof QRCode !== 'undefined') {
      try { new QRCode(qrEl, qrOpts); } catch(e) {}
    }
  }

  await new Promise(function(r) { setTimeout(r, 400); });

  // UN SOLO canvas para todos los rotulos apilados
  var canvas = await window.html2canvas(container, {
    scale: 2, useCORS: true, allowTaint: false,
    backgroundColor: '#ffffff', logging: false,
    width: container.scrollWidth,
    height: container.scrollHeight
  });

  document.body.removeChild(container);

  // Pagina jsPDF con dimensiones exactas del canvas (sin papel desperdiciado)
  var mmPerPx = 25.4 / 96;
  var pageW_mm = Math.ceil((canvas.width  / 2) * mmPerPx);
  var pageH_mm = Math.ceil((canvas.height / 2) * mmPerPx);
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageW_mm, pageH_mm] });
  var imgData = canvas.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData, 'JPEG', 0, 0, pageW_mm, pageH_mm);

  rntAbrirVentanaImpresion(doc.output('bloburl'));
}

/* ================================================================
   COMPROBANTE — Ticket 280px · html2canvas + jsPDF (pagina adaptativa)
   ================================================================ */

async function rntGenerarComprobante(idGuia) {
  var client = window.sbClient || (typeof sbClient !== 'undefined' ? sbClient : null);
  if (!client) { alert('Error de configuracion. Recarga la pagina.'); return; }
  if (!window.html2canvas) { alert('Error: html2canvas no cargado. Recarga la pagina.'); return; }
  if (!window.jspdf || !window.jspdf.jsPDF) { alert('Error: jsPDF no cargado. Recarga la pagina.'); return; }

  var res = await client.from('guias').select('*').eq('id_guia', idGuia).single();
  if (res.error || !res.data) { alert('No se encontro la guia: ' + idGuia); return; }
  var g = res.data;

  var safe = _escPdf;
  var fmtFecha = g.fecha_creacion
    ? new Date(g.fecha_creacion).toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'numeric'})
    : '—';
  var fmtHora = g.fecha_creacion
    ? new Date(g.fecha_creacion).toLocaleTimeString('es-CO', {hour:'2-digit',minute:'2-digit',second:'2-digit'})
    : '';
  var cop = function(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); };
  var flete  = Number(g.flete_calculado || 0);
  var total  = Number(g.total_estimado  || 0);
  var manejo = total - flete;
  var qrUrl  = 'https://rednacionaldetransporte.netlify.app/?guia=' + g.id_guia;
  var uid    = 'cb' + Date.now();

  var css = [
    '.rnt-comp * { box-sizing:border-box; margin:0; padding:0; }',
    '.rnt-comp { width:280px; background:#fff; font-family:Arial,Helvetica,sans-serif;',
    '  font-size:8pt; color:#000; line-height:1.5; padding:8px; }',
    '.rnt-comp .cab { display:flex; align-items:flex-start; gap:6px; margin-bottom:5px; }',
    '.rnt-comp .cab-texto { flex:1; text-align:center; line-height:1.45; }',
    '.rnt-comp .tit1,.rnt-comp .tit2 { font-size:9.5pt; font-weight:700; }',
    '.rnt-comp .guia-num { font-size:8.5pt; font-weight:700; }',
    '.rnt-comp .empresa { font-size:8.5pt; font-weight:700; }',
    '.rnt-comp .info-line { font-size:7.5pt; }',
    '.rnt-comp .cab-qr { flex-shrink:0; width:85px; display:flex; flex-direction:column; align-items:center; gap:4px; }',
    '.rnt-comp .cab-qr canvas,.rnt-comp .cab-qr img { width:85px !important; height:85px !important; display:block; }',
    '.rnt-comp .logo-r { width:44px; height:44px; border-radius:50%; object-fit:contain; border:1px solid #ddd; display:block; }',
    '.rnt-comp .sep { border:none; border-top:1px solid #000; margin:4px 0; }',
    '.rnt-comp .bloque { font-size:7.5pt; line-height:1.55; margin:3px 0; }',
    '.rnt-comp .bloque b { font-weight:700; }',
    '.rnt-comp .fin { border:1px solid #999; padding:4px 5px; margin:4px 0; font-size:7.5pt; }',
    '.rnt-comp .fin-grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px 4px; margin-bottom:4px; }',
    '.rnt-comp .fin-label { font-size:6.5pt; color:#444; }',
    '.rnt-comp .fin-val { font-weight:700; font-size:8pt; }',
    '.rnt-comp .fin-fila { display:flex; gap:8px; margin-bottom:2px; font-size:7.5pt; }',
    '.rnt-comp .fin-fila b { font-weight:700; }',
    '.rnt-comp .fin-dec { font-size:7pt; margin-top:4px; line-height:1.4; }',
    '.rnt-comp .fin-dec b { font-weight:700; }',
    '.rnt-comp .firmas { display:flex; gap:10px; margin:6px 0 4px 0; font-size:7pt; color:#aaa; }',
    '.rnt-comp .firma-item { flex:1; border-top:1px solid #aaa; padding-top:2px; text-align:center; }',
    '.rnt-comp .obs-label { font-size:7.5pt; font-weight:700; margin-bottom:2px; }',
    '.rnt-comp .obs-box { border:1px solid #ccc; height:30px; margin-bottom:5px; }',
    '.rnt-comp .footer { font-size:6.5pt; text-align:center; color:#555; line-height:1.5; margin-top:4px; }'
  ].join(' ');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;

  var container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-99999px;top:0;background:white;display:inline-block;padding:3px;';
  container.appendChild(styleEl);

  var ticket = document.createElement('div');
  ticket.className = 'rnt-comp';
  ticket.innerHTML =
    '<div class="cab">' +
      '<div class="cab-texto">' +
        '<div class="tit1">COMPROBANTE CUMPLIDO</div>' +
        '<div class="tit2">' + safe(g.tipo_servicio || 'CONTRA ENTREGA') + '</div>' +
        '<div class="info-line">No.</div>' +
        '<div class="guia-num">' + safe(g.id_guia) + '</div>' +
        '<div class="empresa">RED NACIONAL DE</div>' +
        '<div class="empresa">TRANSPORTES SAS</div>' +
        '<div class="info-line">NIT 901.040.715-7</div>' +
        '<div class="info-line">TEL: 3124376616</div>' +
        '<div class="info-line">Fecha ' + fmtFecha + '</div>' +
        '<div class="info-line">' + fmtHora + '</div>' +
      '</div>' +
      '<div class="cab-qr">' +
        '<div id="' + uid + '-qr"></div>' +
        '<img class="logo-r" src="/assets/img/logo.png" alt="RNT" crossorigin="anonymous" onerror="this.style.display=\'none\';var f=document.getElementById(\'rnt-logo-fb\');if(f)f.style.display=\'inline\'">' +
        '<svg id="rnt-logo-fb" style="display:none;width:44px;height:44px" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="21" fill="#1a2744"/><text x="22" y="20" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="#f0c040">RNT</text><text x="22" y="31" text-anchor="middle" font-family="Arial" font-size="4.5" fill="white">RED NAL.</text><text x="22" y="38" text-anchor="middle" font-family="Arial" font-size="4" fill="#aac4ff">TRANSPORTES</text></svg>' +
      '</div>' +
    '</div>' +
    '<hr class="sep">' +
    '<div class="bloque">' +
      '<div><b>ORIGEN:</b> ' + safe(g.ciudad_origen) + '</div>' +
      '<div><b>REMITENTE:</b> ' + safe(g.remitente) + '</div>' +
      '<div><b>DIR:</b> ' + safe(g.remitente_direccion) + '</div>' +
    '</div>' +
    '<hr class="sep">' +
    '<div class="bloque">' +
      '<div><b>DESTINO:</b> ' + safe(g.ciudad_destino) + '</div>' +
      '<div><b>DESTINATARIO:</b> ' + safe(g.destinatario) + '</div>' +
      (g.destinatario_documento ? '<div><b>DOC:</b> ' + safe(g.destinatario_documento) + '</div>' : '') +
      '<div><b>TEL:</b> ' + safe(g.destinatario_telefono) + '</div>' +
      '<div><b>DIR:</b> ' + safe(g.destinatario_direccion) + '</div>' +
    '</div>' +
    '<hr class="sep">' +
    '<div class="fin">' +
      '<div class="fin-grid3">' +
        '<div><div class="fin-label">KG. REAL:</div><div class="fin-val">' + safe(g.peso_real) + '</div></div>' +
        '<div><div class="fin-label">KG. FACT:</div><div class="fin-val">' + safe(g.peso_real) + '</div></div>' +
        '<div><div class="fin-label">UNIDADES:</div><div class="fin-val">' + safe(g.unidades) + '</div></div>' +
      '</div>' +
      '<div class="fin-grid3">' +
        '<div><div class="fin-label">FLETE:</div><div class="fin-val">' + cop(flete) + '</div></div>' +
        '<div><div class="fin-label">MANE:</div><div class="fin-val">' + cop(manejo) + '</div></div>' +
        '<div><div class="fin-label">TOTAL:</div><div class="fin-val">' + cop(total) + '</div></div>' +
      '</div>' +
      '<div class="fin-dec">Declaró que el valor de la mercancía es: <b>' + cop(g.valor_declarado) + '</b></div>' +
      '<div class="fin-dec" style="margin-top:4px;"><b>EMPAQUE:</b> ' + safe(g.tipo_embalaje) + ', <b>DICE CONTENER:</b> ' + safe(g.descripcion_contenido) + '</div>' +
    '</div>' +
    '<div class="firmas"><div class="firma-item">ENTREGA</div><div class="firma-item">RECIBIÓ</div></div>' +
    '<div class="obs-label">OBSERVACIONES</div>' +
    '<div class="obs-box"></div>' +
    '<div class="footer">Para peticiones, quejas y recursos: www.rednacionaldetransportes.com · servicioalcliente@rednacionaldetransportes.com · PBX 272 6117</div>';

  container.appendChild(ticket);
  document.body.appendChild(container);

  var qrEl = document.getElementById(uid + '-qr');
  if (qrEl && typeof QRCode !== 'undefined') {
    try {
      new QRCode(qrEl, { text: qrUrl, width: 85, height: 85,
        colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
    } catch(e) {}
  }

  await new Promise(function(r) { setTimeout(r, 700); });

  var canvas = await window.html2canvas(container, {
    scale: 2, useCORS: true, allowTaint: false,
    backgroundColor: '#ffffff', logging: false,
    width: container.scrollWidth, height: container.scrollHeight
  });

  document.body.removeChild(container);

  var mmPerPx = 25.4 / 96;
  var pageW_mm = Math.ceil((canvas.width  / 2) * mmPerPx);
  var pageH_mm = Math.ceil((canvas.height / 2) * mmPerPx);
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageW_mm, pageH_mm] });
  doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW_mm, pageH_mm);
  rntAbrirVentanaImpresion(doc.output('bloburl'));
}

/* ================================================================
   GENERADOR 2: COMPROBANTE / VERTICALIZADO / CUMPLIDO (80x200mm) — jsPDF legacy
   ================================================================ */

/**
 * Genera el comprobante en formato ticket.
 * Si esCumplido=true activa el area de firma de recibido.
 * Es el mismo template - la diferencia es un flag booleano.
 */
async function _rntComprobanteJsPDF(guia, qrData, logoData, esCumplido) {
  var { jsPDF } = window.jspdf;
  var doc = new jsPDF({ orientation:'portrait', unit:'mm', format:[80,200] });

  _dibujarComprobante(doc, guia, qrData, logoData, esCumplido);

  var nombre = esCumplido
    ? 'cumplido_'+guia.numero_guia+'.pdf'
    : 'comprobante_'+guia.numero_guia+'.pdf';
  if (_rntPrintWindow && !_rntPrintWindow.closed) { _rntPrintWindow.close(); }
  _rntPrintWindow = window.open(doc.output('bloburl'), '_blank');
}

function _dibujarComprobante(doc, g, qr, logo, esCumplido) {
  var M = 6;
  var W = 80;
  var y = M;

  // Badge Tipo C (comprobante envio) o Tipo D (cumplido con firma)
  rntAgregarTipoDoc(doc, 'COMPROBANTE', esCumplido ? 'D' : 'C');

  // CABECERA CENTRADA
  doc.setFont('helvetica','bold');
  doc.setFontSize(8.5);
  _txt(doc, esCumplido ? 'COMPROBANTE CUMPLIDO' : 'COMPROBANTE DE ENVIO', W/2, y, {align:'center'});
  y += 5;

  doc.setFontSize(7.5);
  _txt(doc, (g.tipo_servicio||'PAQUETEO').toUpperCase(), W/2, y, {align:'center'});
  y += 4.5;

  doc.setFontSize(13);
  _txt(doc, 'No. '+(g.numero_guia||'-'), W/2, y, {align:'center'});
  y += 7;

  // Logo y QR lado a lado
  var lw = 24, lh = 13, qz = 18;
  if (logo) doc.addImage(logo, 'PNG', M, y, lw, lh);
  if (qr)   doc.addImage(qr,   'PNG', W-M-qz, y, qz, qz);
  y += Math.max(lh, qz) + 3;

  // Info empresa
  doc.setFont('helvetica','bold');
  doc.setFontSize(6.5);
  _txt(doc, RNT.nit,      W/2, y, {align:'center'}); y += 4;
  _txt(doc, RNT.telefono, W/2, y, {align:'center'}); y += 4;
  doc.setFont('helvetica','normal');
  doc.setFontSize(6);
  _txt(doc, 'Fecha: '+fecha(g.fecha_creacion), W/2, y, {align:'center'});
  y += 5;

  _linea(doc, M, y, W-M); y += 4;

  // ORIGEN
  doc.setFont('helvetica','bold'); doc.setFontSize(7);
  _txt(doc, 'ORIGEN: '+(g.ciudad_origen||'-').toUpperCase(), M, y); y += 4;
  doc.setFont('helvetica','normal');
  y = _txtW(doc, 'REMITENTE: '+(g.remitente||'-'), M, y, W-M*2);
  if (g.remitente_direccion) y = _txtW(doc,'DIR: '+g.remitente_direccion, M, y, W-M*2);

  _linea(doc, M, y, W-M); y += 4;

  // DESTINO
  doc.setFont('helvetica','bold');
  _txt(doc, 'DESTINO: '+(g.ciudad_destino||'-').toUpperCase(), M, y); y += 4;
  doc.setFont('helvetica','normal');
  y = _txtW(doc, 'DESTINATARIO: '+(g.destinatario||'-'), M, y, W-M*2);
  if (g.destinatario_telefono) {
    _txt(doc, 'DOC: '+(g.destinatario_doc||'-')+'  TEL: '+g.destinatario_telefono, M, y);
    y += 3.8;
  }
  if (g.destinatario_direccion) y = _txtW(doc,'DIR: '+g.destinatario_direccion, M, y, W-M*2);

  _linea(doc, M, y, W-M); y += 4;

  // BLOQUE FINANCIERO
  var pr   = parseFloat(g.peso_real||0);
  var flt  = parseFloat(g.flete_calculado||0);
  var man  = parseFloat(g.seguro_calculado||0) || Math.round(flt*0.09);
  var stl  = flt+man;
  var tot  = parseFloat(g.total_estimado||stl);
  var vd   = parseFloat(g.valor_declarado||0);

  doc.setFontSize(7);
  _txt(doc,'KG. REAL: '+pr+'  KG. FACT: '+pr+'  UNIDADES: '+(g.unidades||1), M, y); y+=4;
  _txt(doc,'FLTE. '+cop(flt)+'  MANE. '+cop(man)+'  SBTL '+cop(stl), M, y); y+=4;
  _txt(doc,'OTROS $0  TOTAL '+cop(tot), M, y); y+=4;
  y = _txtW(doc,'Declara valor mercancia: '+cop(vd), M, y, W-M*2);

  var emq = 'EMPAQUE: BULTO, DICE CONTENER: '+(g.descripcion_contenido||'-');
  y = _txtW(doc, emq, M, y, W-M*2);
  y += 2;

  _linea(doc, M, y, W-M); y += 4;

  // SECCION FIRMA - activa siempre, solo varia el relleno
  doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
  _txt(doc,'ENTREGO',    M,    y);
  _txt(doc,'RECIBIO', W/2+2, y);
  y += 3;

  // Recuadros de firma
  doc.setDrawColor(180,180,180);
  doc.rect(M,         y, W/2-M-2, 20);
  doc.rect(W/2+2,     y, W/2-M-2, 20);
  doc.setDrawColor(0,0,0);

  if (esCumplido && g.url_cumplido) {
    doc.setFontSize(5.5);
    y = _txtW(doc,'Comprobante: '+g.url_cumplido, M, y+22, W-M*2);
  } else {
    y += 22;
  }

  y += 2;
  y = _txtW(doc,'OBSERVACIONES: _________________________________', M, y, W-M*2);
  y += 2;

  _linea(doc, M, y, W-M); y += 4;

  // PIE
  doc.setFont('helvetica','normal'); doc.setFontSize(5.5);
  var pie = 'Para peticiones remitase a '+RNT.web+' o '+RNT.email+'  '+RNT.pbx;
  _txtW(doc, pie, M, y, W-M*2);
}


/* ================================================================
   GENERADOR 3: GUIA CARTA — html2canvas + jsPDF (diseno spec Tipo B)
   ================================================================ */

async function rntGenerarCarta(idGuia) {
  var client = window.sbClient || (typeof sbClient !== 'undefined' ? sbClient : null);
  if (!client) { alert('Error de configuracion. Recarga la pagina.'); return; }
  if (!window.html2canvas) { alert('Error: html2canvas no cargado. Recarga la pagina.'); return; }
  if (!window.jspdf || !window.jspdf.jsPDF) { alert('Error: jsPDF no cargado. Recarga la pagina.'); return; }

  var result = await client.from('guias').select('*').eq('id_guia', idGuia).single();
  if (result.error || !result.data) { alert('Guia #' + idGuia + ' no encontrada.'); return; }
  var g = result.data;

  var safe = _escPdf;
  var cop  = function(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); };
  var tipoSrv = g.tipo_servicio ? String(g.tipo_servicio).toUpperCase()
    : (Number(g.peso_real || 0) > 20 ? 'MERCANCIA' : 'PAQUETE');
  var fmtFecha = g.fecha_creacion
    ? new Date(g.fecha_creacion).toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'numeric'})
    : '—';
  var uid = 'c' + Date.now();

  var css = [
    '* { box-sizing:border-box; margin:0; padding:0; }',
    '.hoja { width:216mm; background:white; padding:3mm; }',
    '.copia { width:100%; height:88mm; border:0.5mm solid #999; box-sizing:border-box;',
    '  display:flex; flex-direction:column; overflow:hidden; position:relative;',
    '  padding-right:5mm; font-family:Arial,Helvetica,sans-serif; color:#111; }',
    '.copia-id { position:absolute; right:0; top:0; bottom:0; width:5mm;',
    '  border-left:0.3mm solid #ddd; background:#f4f4f4;',
    '  display:flex; align-items:center; justify-content:center; }',
    '.copia-id span { font-size:4.5pt; font-weight:700; color:#555;',
    '  writing-mode:vertical-rl; transform:rotate(180deg);',
    '  letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }',
    '.corte { height:3mm; border-top:0.35mm dashed #bbb; display:flex;',
    '  align-items:center; justify-content:center; font-size:5pt; color:#ccc;',
    '  letter-spacing:2px; background:white; flex-shrink:0; }',
    '.hdr { height:20mm; flex-shrink:0; display:grid;',
    '  grid-template-columns:55mm 1fr 24mm 13mm;',
    '  border-bottom:0.4mm solid #aaa; overflow:hidden; }',
    '.hdr-logo { padding:1.5mm 2mm; display:flex; align-items:center;',
    '  justify-content:flex-start; border-right:0.3mm solid #ddd; background:#fff; overflow:hidden; }',
    '.hdr-logo img { width:51mm; height:auto; max-height:17mm;',
    '  object-fit:contain; object-position:left center; display:block; }',
    '.hdr-empresa { padding:1.5mm 2.5mm; display:flex; flex-direction:column;',
    '  justify-content:center; border-right:0.3mm solid #ddd; overflow:hidden; }',
    '.emp-name { font-size:8pt; font-weight:900; color:#0d1b4b; line-height:1.2;',
    '  text-transform:uppercase; white-space:nowrap; overflow:hidden; }',
    '.emp-sub { font-size:6pt; color:#444; font-weight:700; margin-top:0.8mm; }',
    '.emp-nit { font-size:5pt; color:#777; margin-top:0.8mm; line-height:1.5; }',
    '.hdr-guia { padding:1.5mm 1.5mm; display:flex; flex-direction:column;',
    '  justify-content:space-between; border-right:0.3mm solid #ddd; overflow:hidden; }',
    '.g-label { font-size:4.5pt; font-weight:700; color:#888;',
    '  text-transform:uppercase; letter-spacing:.08em; }',
    '.g-num { font-size:9.5pt; font-weight:900; color:#0d1b4b;',
    '  line-height:1.1; word-break:break-all; }',
    '.g-fecha { font-size:4.5pt; color:#666; line-height:1.4; }',
    '.g-badge { display:inline-block; background:#0d1b4b; color:#FFD700;',
    '  font-size:4.5pt; font-weight:800; padding:0.5mm 1.5mm;',
    '  letter-spacing:.05em; white-space:nowrap; }',
    '.hdr-qr { display:flex; align-items:center; justify-content:center;',
    '  padding:2mm 1mm; background:#fff; }',
    '.hdr-qr canvas,.hdr-qr img { width:13mm !important; height:13mm !important; display:block; }',
    '.rd-title-bar { display:grid; grid-template-columns:1fr 1fr;',
    '  height:3mm; flex-shrink:0; border-bottom:0.3mm solid #c8d0e8; }',
    '.rd-title { font-size:5.5pt; font-weight:800; text-transform:uppercase;',
    '  color:#0d1b4b; background:#eef1f8; padding:0 2.5mm;',
    '  display:flex; align-items:center; letter-spacing:.06em; }',
    '.rd-title + .rd-title { border-left:0.3mm solid #ccc; }',
    '.rd-grid { display:grid; grid-template-columns:1fr 1fr;',
    '  flex:1; min-height:14mm; overflow:hidden; border-bottom:0.35mm solid #ccc; }',
    '.rd-col { padding:1.2mm 2.5mm; overflow:hidden;',
    '  display:flex; flex-direction:column; justify-content:space-evenly; }',
    '.rd-col + .rd-col { border-left:0.3mm solid #ddd; }',
    '.field { display:flex; align-items:baseline; gap:1mm; line-height:1.3; overflow:hidden; }',
    '.fl { font-size:6pt; color:#777; font-weight:700; white-space:nowrap; flex-shrink:0; }',
    '.fv { font-size:7pt; font-weight:700; color:#111;',
    '  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
    '.datos-fin-title { height:3mm; font-size:5.5pt; font-weight:800;',
    '  text-transform:uppercase; color:#0d1b4b; background:#eef1f8;',
    '  padding:0 2.5mm; display:flex; align-items:center; letter-spacing:.06em;',
    '  border-top:0.3mm solid #c8d0e8; border-bottom:0.3mm solid #c8d0e8; flex-shrink:0; }',
    '.datos-fin-grid { display:grid;',
    '  grid-template-columns:1fr 1fr 1fr 1fr 1.2fr 1.5fr 1.4fr 1.2fr 1fr 1.5fr;',
    '  height:7mm; flex-shrink:0; border-bottom:0.35mm solid #ccc; }',
    '.df-cell { padding:0.5mm 1.5mm; border-right:0.2mm solid #e5e5e5;',
    '  display:flex; flex-direction:column; justify-content:center; overflow:hidden; }',
    '.df-cell:last-child { border-right:none; background:#0d1b4b; }',
    '.df-l { font-size:4.5pt; color:#888; white-space:nowrap; overflow:hidden; line-height:1.2; }',
    '.df-v { font-size:8pt; font-weight:900; color:#111;',
    '  white-space:nowrap; overflow:hidden; line-height:1.2; }',
    '.df-cell:last-child .df-l { color:rgba(255,255,255,.65); }',
    '.df-cell:last-child .df-v { color:#FFD700; }',
    '.empaque-row { height:5mm; padding:0 2.5mm; font-size:6.5pt;',
    '  display:flex; align-items:center; gap:5mm;',
    '  border-bottom:0.35mm solid #ccc; flex-shrink:0; overflow:hidden; }',
    '.el { color:#777; font-weight:700; } .ev { font-weight:700; color:#111; }',
    '.legal-firmas { display:grid; grid-template-columns:1.2fr 1fr 1fr;',
    '  height:22mm; flex-shrink:0; border-bottom:0.35mm solid #ccc; overflow:hidden; }',
    '.legal-box { padding:1.5mm 2mm; font-size:5.5pt; color:#555;',
    '  line-height:1.5; border-right:0.3mm solid #ccc; overflow:hidden; }',
    '.firma-box { padding:1.5mm 2mm; display:flex; flex-direction:column;',
    '  border-right:0.3mm solid #ccc; overflow:hidden; }',
    '.firma-box:last-child { border-right:none; }',
    '.f-label { font-size:7pt; font-weight:800; color:#0d1b4b;',
    '  margin-bottom:1mm; white-space:nowrap; }',
    '.f-space { flex:1; }',
    '.f-line { border-bottom:0.4mm solid #333; margin-bottom:1mm; }',
    '.f-sub { font-size:5.5pt; color:#aaa; line-height:1.4; }',
    '.doc-footer { height:4mm; padding:0 2.5mm; font-size:5pt; color:#999;',
    '  text-align:center; flex-shrink:0; display:flex; align-items:center;',
    '  justify-content:center; overflow:hidden; white-space:nowrap; }'
  ].join(' ');

  var COPIAS = [
    {
      id: uid + '-1', label: 'Remitente',
      legal: 'Art. 13 del ROTT: las autoridades competentes podrán establecer contratos tipo o CONDICIONES GENERALES DE CONTRATACIÓN. DECLARO QUE ESTE ENVÍO NO CONTIENE JOYAS, DINERO, TÍTULOS VALORES NI NADA DE PROHIBIDO TRANSPORTE.',
      f1l: 'FIRMA REMITENTE',  f1s: 'Nombre y documento de identificación',
      f2l: 'RECIBÍ CONFORME', f2s: 'Nombre · documento · Fecha entrega'
    },
    {
      id: uid + '-2', label: 'Destinatario',
      legal: 'SR. DESTINATARIO, FIRMADA LA REMISIÓN NO DEVUELVA LA MERCANCÍA SIN CONSULTARNOS. RESPONDEMOS HASTA POR EL VALOR DECLARADO ARTÍCULO 1010 INCISO 3 CÓDIGO DE COMERCIO.',
      f1l: 'FIRMA REMITENTE',  f1s: 'Nombre y documento',
      f2l: 'RECIBÍ CONFORME', f2s: 'Nombre · documento · Fecha'
    },
    {
      id: uid + '-3', label: 'RNT Contab.',
      legal: 'Copia interna RNT · Soporte liquidación ROTT. Aforo y despacho registrados en sistema Supabase. Para peticiones: servicioalcliente@rednacionaldetransportes.com',
      f1l: 'AFORÓ · OPERARIA', f1s: 'Nombre y sede de despacho',
      f2l: 'RECIBÍ CONFORME', f2s: 'Destinatario · doc · Fecha entrega'
    }
  ];

  function buildCopia(c) {
    return '<div class="copia">' +
      '<div class="copia-id"><span>' + c.label + '</span></div>' +
      '<div class="hdr">' +
        '<div class="hdr-logo">' +
          '<img src="/assets/img/logo_rect.png" alt="RNT" crossorigin="anonymous">' +
        '</div>' +
        '<div class="hdr-empresa">' +
          '<div class="emp-name">Red Nacional de Transportes S.A.S.</div>' +
          '<div class="emp-sub">Transporte Terrestre Nacional</div>' +
          '<div class="emp-nit">NIT 901.040.715-7 &nbsp;&middot;&nbsp; PBX (601) 272 6117 &nbsp;&middot;&nbsp; (601) 269 55 85<br>' +
          'WhatsApp 312 437 6616 &nbsp;&middot;&nbsp; servicioalcliente@rednacionaldetransportes.com</div>' +
        '</div>' +
        '<div class="hdr-guia">' +
          '<div class="g-label">Guía · Cuenta Corriente</div>' +
          '<div class="g-num">' + safe(g.id_guia) + '</div>' +
          '<div class="g-fecha">Fecha: ' + fmtFecha + '</div>' +
          '<div class="g-badge">TIPO B &nbsp;·&nbsp; CARTA</div>' +
        '</div>' +
        '<div class="hdr-qr" id="' + c.id + '"></div>' +
      '</div>' +
      '<div class="rd-title-bar">' +
        '<div class="rd-title">Remitente</div>' +
        '<div class="rd-title">Destinatario</div>' +
      '</div>' +
      '<div class="rd-grid">' +
        '<div class="rd-col">' +
          '<div class="field"><span class="fl">ORIGEN:</span><span class="fv">' + safe(g.ciudad_origen).toUpperCase() + '</span></div>' +
          '<div class="field"><span class="fl">DE:</span><span class="fv">' + safe(g.remitente) + ' &nbsp;DOC: ' + safe(g.remitente_documento) + '</span></div>' +
          '<div class="field"><span class="fl">TEL:</span><span class="fv">' + safe(g.remitente_telefono) + '</span></div>' +
          '<div class="field"><span class="fl">DIRECCIÓN:</span><span class="fv">' + safe(g.remitente_direccion) + '</span></div>' +
        '</div>' +
        '<div class="rd-col">' +
          '<div class="field"><span class="fl">DESTINO:</span><span class="fv">' + safe(g.ciudad_destino).toUpperCase() + '</span></div>' +
          '<div class="field"><span class="fl">PARA:</span><span class="fv">' + safe(g.destinatario) + ' &nbsp;DOC: ' + safe(g.destinatario_documento) + '</span></div>' +
          '<div class="field"><span class="fl">TEL:</span><span class="fv">' + safe(g.destinatario_telefono) + '</span></div>' +
          '<div class="field"><span class="fl">DIRECCIÓN:</span><span class="fv">' + safe(g.destinatario_direccion) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="datos-fin-title">Datos del Envío</div>' +
      '<div class="datos-fin-grid">' +
        '<div class="df-cell"><div class="df-l">Piezas</div><div class="df-v">' + safe(g.unidades) + '</div></div>' +
        '<div class="df-cell"><div class="df-l">Peso real</div><div class="df-v">' + safe(g.peso_real) + ' kg</div></div>' +
        '<div class="df-cell"><div class="df-l">Peso vol.</div><div class="df-v">— kg</div></div>' +
        '<div class="df-cell"><div class="df-l">Kg a fact.</div><div class="df-v">' + safe(g.peso_real) + ' kg</div></div>' +
        '<div class="df-cell"><div class="df-l">Tipo serv.</div><div class="df-v">' + tipoSrv + '</div></div>' +
        '<div class="df-cell"><div class="df-l">VLR DECLARADO</div><div class="df-v">' + cop(g.valor_declarado) + '</div></div>' +
        '<div class="df-cell"><div class="df-l">VLR FLETE</div><div class="df-v">' + cop(g.flete_calculado) + '</div></div>' +
        '<div class="df-cell"><div class="df-l">VLR SEGURO</div><div class="df-v">' + cop(g.seguro_calculado) + '</div></div>' +
        '<div class="df-cell"><div class="df-l">VLR OTROS</div><div class="df-v">$0</div></div>' +
        '<div class="df-cell"><div class="df-l">VLR TOTAL</div><div class="df-v">' + cop(g.total_estimado) + '</div></div>' +
      '</div>' +
      '<div class="empaque-row">' +
        '<span><span class="el">EMPAQUE: </span><span class="ev">' + safe(g.tipo_embalaje) + '</span></span>' +
        '<span><span class="el">CONT. SIN VERIFICAR · DICE CONTENER: </span><span class="ev">' + safe(g.descripcion_contenido) + '</span></span>' +
      '</div>' +
      '<div class="legal-firmas">' +
        '<div class="legal-box">' + c.legal + '</div>' +
        '<div class="firma-box"><div class="f-label">' + c.f1l + '</div><div class="f-space"></div><div class="f-line"></div><div class="f-sub">' + c.f1s + '</div></div>' +
        '<div class="firma-box"><div class="f-label">' + c.f2l + '</div><div class="f-space"></div><div class="f-line"></div><div class="f-sub">' + c.f2s + '</div></div>' +
      '</div>' +
      '<div class="doc-footer">servicioalcliente@rednacionaldetransportes.com &nbsp;·&nbsp; PBX (601) 272 6117 · 2695685 &nbsp;·&nbsp; WhatsApp 312 437 6616 &nbsp;·&nbsp; www.rednacionaldetransportes.com</div>' +
    '</div>';
  }

  var container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-99999px;top:0;width:216mm;background:white;';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  var hoja = document.createElement('div');
  hoja.className = 'hoja';
  hoja.innerHTML =
    buildCopia(COPIAS[0]) +
    '<div class="corte">✂ &nbsp;&nbsp; CORTAR AQUÍ &nbsp;&nbsp; ✂</div>' +
    buildCopia(COPIAS[1]) +
    '<div class="corte">✂ &nbsp;&nbsp; CORTAR AQUÍ &nbsp;&nbsp; ✂</div>' +
    buildCopia(COPIAS[2]);
  container.appendChild(styleEl);
  container.appendChild(hoja);
  document.body.appendChild(container);

  var qrOpts = { text: idGuia, width: 49, height: 49, colorDark: '#0d1b4b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M };
  COPIAS.forEach(function(c) {
    var el = document.getElementById(c.id);
    if (el && typeof QRCode !== 'undefined') { try { new QRCode(el, qrOpts); } catch(e) {} }
  });

  await new Promise(function(r) { setTimeout(r, 700); });

  var canvas = await window.html2canvas(hoja, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: hoja.scrollWidth,
    height: hoja.scrollHeight
  });

  document.body.removeChild(container);

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  var pageW = doc.internal.pageSize.getWidth();
  var pageH = doc.internal.pageSize.getHeight();
  var imgData = canvas.toDataURL('image/jpeg', 0.92);
  var ratio = canvas.height / canvas.width;
  var imgH = pageW * ratio;
  if (imgH > pageH) { imgH = pageH; }
  doc.addImage(imgData, 'JPEG', 0, 0, pageW, imgH);

  rntAbrirVentanaImpresion(doc.output('bloburl'));
}
/* ================================================================
   HELPERS INTERNOS DE DIBUJO
   ================================================================ */

/** Dibuja texto en posicion xy */
function _txt(doc, texto, x, y, opts) {
  doc.text(texto||'', x, y, opts||{});
}

/** Dibuja texto con wrap automatico y retorna el nuevo Y */
function _txtW(doc, texto, x, y, maxW) {
  var lines = doc.splitTextToSize(texto||'', maxW);
  lines.forEach(function(l){ doc.text(l, x, y); y += 3.8; });
  return y;
}

/** Dibuja una linea horizontal */
function _linea(doc, x1, y, x2) {
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

/* ================================================================
   rntGenerarCumplido — delega al generador de ticket html2canvas+jsPDF
   ================================================================ */
async function rntGenerarCumplido(idGuia) {
  return rntGenerarComprobante(idGuia);
}

/* ================================================================
   UTILIDAD VENTANA — apertura unica, cierra la anterior, detecta bloqueador
   ================================================================ */
function rntAbrirVentanaImpresion(contenido) {
  if (window._rntPrintWindow) {
    try {
      if (!window._rntPrintWindow.closed) window._rntPrintWindow.close();
    } catch(e) {}
    window._rntPrintWindow = null;
  }
  var url;
  if (typeof contenido === 'string' && contenido.startsWith('blob:')) {
    url = contenido;
  } else {
    // Blob URL → abre como pestaña, no como popup
    var blob = new Blob([contenido], { type: 'text/html; charset=utf-8' });
    url = URL.createObjectURL(blob);
  }
  var w = window.open(url, '_blank');
  if (!w) {
    alert('El navegador bloqueo la ventana emergente.\n' +
          'Permite ventanas emergentes para este sitio e intenta de nuevo.');
    return;
  }
  window._rntPrintWindow = w;
  w.onbeforeunload = function() { window._rntPrintWindow = null; };
}

/* ================================================================
   EXPOSICION AL SCOPE GLOBAL
   ================================================================ */
window.rntImprimirGuia       = rntImprimirGuia;
window.rntGenerarRotulo      = rntGenerarRotulo;
window.rntGenerarComprobante = rntGenerarComprobante;
window.rntGenerarCarta       = rntGenerarCarta;
window.rntGenerarCumplido    = rntGenerarCumplido;
window.rntAbrirVentanaImpresion = rntAbrirVentanaImpresion;

console.info('[PDF RNT] Motor inicializado. Formatos: rotulo, comprobante, carta, cumplido');

