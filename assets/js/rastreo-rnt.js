/**
 * RNT - Sistema de Rastreo
 * CP4: puente → sistema Gelotra de RNT
 * CP8: consulta Google Sheets via Netlify Function (antes de abrir Gelotra)
 */

window.RNT_Rastreo = {

  URL_BASE: 'https://mail.rednacionaldetransportes.com/rastreo/lista_rastreo.php',
  URL_WHATSAPP: 'https://wa.me/573124376616',
  CP8_TIMEOUT_MS: 3500,

  // Mapa de estados para UI
  ESTADOS_LABEL: {
    'ASIGNADA':         { texto: 'Asignada',          clase: 'bg-secondary' },
    'EN_PODER_ORIGEN':  { texto: 'En poder origen',   clase: 'bg-secondary' },
    'VIAJE_TRONCAL':    { texto: 'Viaje troncal',     clase: 'bg-primary'   },
    'EN_PODER_DESTINO': { texto: 'En poder destino',  clase: 'bg-info'      },
    'REPARTO_URBANO':   { texto: 'Reparto urbano',    clase: 'bg-info'      },
    'ENTREGADO':        { texto: 'Entregado',         clase: 'bg-success'   },
    'CUMPLIDO':         { texto: 'Cumplido',          clase: 'bg-success'   },
    'DEVOLUCION':       { texto: 'En devolucion',     clase: 'bg-warning'   },
    'NOVEDAD':          { texto: 'Con novedad',       clase: 'bg-danger'    },
    // Legacy states (backwards compat)
    'RECIBIDO':    { texto: 'Recibido',          clase: 'bg-secondary' },
    'EN_TRANSITO': { texto: 'En transito',        clase: 'bg-primary'   },
    'EN_DESTINO':  { texto: 'En ciudad destino',  clase: 'bg-info'      },
  },

  /**
   * Buscar guía: intenta CP8 primero, fallback a Gelotra
   * M6: Parámetro teléfono agregado para validación CP8 futura (seguridad contra brute-force)
   */
  buscar: async function(numeroGuia, telefono) {
    numeroGuia = (numeroGuia || '').trim();
    telefono = (telefono || '').trim();

    if (!numeroGuia) {
      this._mostrarErrorInline('Ingresa el número de guía para continuar.');
      return false;
    }

    if (!/^[0-9A-Za-z\-]+$/.test(numeroGuia)) {
      this._mostrarErrorInline('Formato inválido. Solo letras, números y guiones (ej: RNT-2026-001).');
      return false;
    }

    // SEG-01: teléfono opcional — valida formato solo si se ingresó
    if (telefono) {
      const telLimpio = telefono.replace(/[\D]/g, '');
      if (telLimpio.length < 7 || !/^[\+]?[0-9]{10,13}$/.test(telefono.replace(/[\s\-]/g, ''))) {
        this._mostrarErrorInline('Formato de teléfono inválido. Ingresá solo números (ej: 3124376616).');
        return false;
      }
    }

    // Mostrar estado de carga
    this._mostrarCargando(numeroGuia);

    // Intentar CP8 (Supabase) — con cotejo de teléfono si se proporciona
    const datosCP8 = await this._buscarEnCP8(numeroGuia, telefono);

    // SEG-03: guía existe pero el teléfono no coincide
    if (datosCP8 && datosCP8._telefonoNoCoincide) {
      this._mostrarErrorInline('El teléfono ingresado no coincide con el registrado para esta guía. Verificá el número o contactanos por <a href="https://wa.me/573124376616" target="_blank">WhatsApp</a>.');
      return false;
    }

    if (datosCP8 && datosCP8.id_guia) {
      // CP8 tiene datos → mostrar resultado enriquecido
      this._mostrarResultadoCP8(numeroGuia, datosCP8);
      return true;
    }

    // CP8 sin datos → flujo normal Gelotra
    var cont = this._obtenerContenedor();
    if (cont) {
      cont.innerHTML = '<div class="alert alert-info mt-3" role="status"><strong>Consultando sistema de rastreo anterior...</strong><br><small>Esta guía se encuentra en el sistema Gelotra. Abriendo en nueva ventana.</small></div>';
      cont.style.display = 'block';
    }
    return this._abrirGelotra(numeroGuia);
  },

  /**
   * Consultar Supabase (CP8 — con fallback silencioso a Gelotra)
   * Retorna null silenciosamente ante cualquier error o no-configuración
   *
   * Supabase config (from .env.local or window):
   * - SUPABASE_URL: https://[project].supabase.co
   * - SUPABASE_ANON_KEY: sb_publishable_...
   */
  _buscarEnCP8: async function(guia, telefono) {
    try {
      // Try to get Supabase client if available
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return null; // Supabase not loaded, silent fallback
      }

      // Get credentials from window or localStorage (injected at page load)
      const sbUrl = window.__SB_URL__ || localStorage.getItem('sb_url');
      const sbKey = window.__SB_KEY__ || localStorage.getItem('sb_key');

      if (!sbUrl || !sbKey) {
        return null; // No credentials, silent fallback
      }

      const client = window.supabase.createClient(sbUrl, sbKey);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.CP8_TIMEOUT_MS);

      const { data: guiaData, error } = await client
        .from('guias')
        .select(`
          id_guia, transportadora, guia_operadora,
          remitente_nombre, destinatario_nombre,
          ciudad_origen, ciudad_destino,
          descripcion_contenido, peso_kg, cantidad_unidades, tipo_embalaje,
          estado, fecha_actualizacion, url_cumplido,
          estados(estado, ciudad, observacion, imagen_url, fecha)
        `)
        .eq('id_guia', guia)
        .order('fecha', { foreignTable: 'estados', ascending: false })
        .maybeSingle();

      clearTimeout(timer);

      if (error) {
        console.warn('[RNT Rastreo] Supabase query error (silent fallback):', error.message);
        return null;
      }

      if (!guiaData) return null;

      // SEG-02: cotejar teléfono si se proporcionó
      if (telefono) {
        const telNorm = telefono.replace(/[\D]/g, '').slice(-10);
        const tel1 = (guiaData.telefono_remitente || '').replace(/[\D]/g, '').slice(-10);
        const tel2 = (guiaData.telefono_destinatario || '').replace(/[\D]/g, '').slice(-10);
        const hayTelAlmacenado = tel1.length >= 7 || tel2.length >= 7;
        if (hayTelAlmacenado && telNorm !== tel1 && telNorm !== tel2) {
          return { _telefonoNoCoincide: true };
        }
      }

      // Enrich response with friendly labels
      return {
        id_guia: guiaData.id_guia,
        remitente: guiaData.remitente,
        destinatario: guiaData.destinatario,
        ciudad_origen: guiaData.ciudad_origen,
        ciudad_destino: guiaData.ciudad_destino,
        transportadora: guiaData.transportadora,
        guia_operadora: guiaData.guia_operadora,
        url_cumplido: guiaData.url_cumplido || null,
        estados: (guiaData.estados || []).map(e => ({
          estado: e.estado,
          ciudad: e.ciudad,
          observacion: e.observacion,
          imagen_url: e.imagen_url,
          fecha: e.fecha
        }))
      };
    } catch (e) {
      console.warn('[RNT Rastreo] CP8 error (silent fallback):', e.message);
      return null; // timeout, network, or Supabase config missing → silent fallback
    }
  },

  /**
   * Mostrar spinner mientras se consulta CP8
   */
  _mostrarErrorInline: function(mensaje) {
    const contenedor = this._obtenerContenedor();
    if (!contenedor) return;
    contenedor.innerHTML = `
      <div class="alert alert-warning d-flex align-items-center gap-2 mt-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>${mensaje}</span>
      </div>`;
    contenedor.style.display = 'block';
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  _mostrarCargando: function(guia) {
    const contenedor = this._obtenerContenedor();
    if (!contenedor) return;
    contenedor.innerHTML = `
      <div class="rnt-rastreo-cargando d-flex align-items-center gap-2 p-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        <span class="text-muted small">Consultando estado de guía <strong>${this._esc(guia)}</strong>…</span>
      </div>`;
    contenedor.style.display = 'block';
  },

  /**
   * Mostrar resultado enriquecido desde CP8
   * Incluye: stepper visual de estados + línea de tiempo detallada
   */
  _mostrarResultadoCP8: function(guia, data) {
    var contenedor = this._obtenerContenedor();
    if (!contenedor) return;

    // Supabase usa estados internos; el stepper usa nomenclatura Gelotra. Mapeo:
    var SUPABASE_A_STEPPER = {
      'RECIBIDO':   'EN_PODER_ORIGEN',
      'EN_TRANSITO':'VIAJE_TRONCAL',
      'EN_DESTINO': 'EN_PODER_DESTINO',
      'ENTREGADO':  'ENTREGADO',
      'DEVOLUCION': 'DEVOLUCION'
    };

    var ultimoEstado = data.estados && data.estados.length > 0 ? data.estados[0] : null;
    var estadoRaw    = ultimoEstado ? ultimoEstado.estado : null;
    var estadoVisual = data.url_cumplido ? 'CUMPLIDO' : (SUPABASE_A_STEPPER[estadoRaw] || estadoRaw || 'EN_PODER_ORIGEN');

    var guiaMapped = {
      numero_guia:    data.id_guia,
      transportadora: data.transportadora,
      ciudad_origen:  data.ciudad_origen,
      ciudad_destino: data.ciudad_destino,
      estado_actual:  estadoVisual,
      url_cumplido:   data.url_cumplido || null
    };
    var historial = (data.estados || []).map(function(e) {
      return {
        estado:        SUPABASE_A_STEPPER[e.estado] || e.estado,
        created_at:    e.fecha,
        ciudad:        e.ciudad,
        ciudad_actual: e.ciudad
      };
    });

    // Usar el nuevo render si esta disponible, fallback al legacy
    if (typeof rntRenderizarResultado === 'function') {
      contenedor.innerHTML = rntRenderizarResultado(guiaMapped, historial);
    } else {
      // Legacy fallback inline
      contenedor.innerHTML = '<div class="p-3"><strong>Guia ' + this._esc(data.id_guia) + '</strong></div>';
    }

    contenedor.style.display = 'block';
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  /**
   * Abrir sistema Gelotra en nueva ventana (flujo CP4 original)
   */
  _abrirGelotra: function(numeroGuia) {
    const url = `${this.URL_BASE}?guia=${encodeURIComponent(numeroGuia)}`;

    let popup = null;
    try {
      popup = window.open(url, '_blank', 'width=1000,height=700');
    } catch (e) {
      this._ofrecerFallback(numeroGuia);
      return false;
    }

    if (!popup) {
      this._ofrecerFallback(numeroGuia);
      return false;
    }

    let ventanaAbierta = true;
    try {
      if (popup.closed !== false) ventanaAbierta = false;
    } catch (e) {
      ventanaAbierta = false;
    }

    if (!ventanaAbierta) {
      this._ofrecerFallback(numeroGuia);
      return false;
    }

    return true;
  },

  /**
   * Fallback WhatsApp cuando Gelotra no abre
   */
  _ofrecerFallback: function(numeroGuia) {
    const guiaMsg = encodeURIComponent(`Hola, necesito ayuda para rastrear la guía ${numeroGuia}.`);
    const fallbackUrl = `${this.URL_WHATSAPP}?text=${guiaMsg}`;
    const mensaje = `No pudimos abrir el sistema de rastreo (puede estar en mantenimiento o el navegador bloquea ventanas emergentes).\n\n¿Te llevamos a WhatsApp para rastrear la guía ${numeroGuia}?`;
    if (confirm(mensaje)) {
      window.location.href = fallbackUrl;
    }
  },

  _esc: function(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  /**
   * Obtener o crear contenedor de resultado en el DOM
   */
  _obtenerContenedor: function() {
    let el = document.getElementById('rntRastreoResultado');
    if (el) return el;
    // Buscamos el form hero o el form rntRastreoForm para insertar después
    const form = document.getElementById('heroRastreoForm') || document.getElementById('rntRastreoForm');
    if (!form) return null;
    el = document.createElement('div');
    el.id = 'rntRastreoResultado';
    el.style.display = 'none';
    form.parentNode.insertBefore(el, form.nextSibling);
    return el;
  },

  /**
   * Limpiar resultado anterior
   */
  _limpiarResultado: function() {
    const el = document.getElementById('rntRastreoResultado');
    if (el) { el.innerHTML = ''; el.style.display = 'none'; }
  },

  /**
   * Inicializar formularios de rastreo en el DOM
   */
  init: function() {
    const forms = [
      document.getElementById('heroRastreoForm'),
      document.getElementById('rntRastreoForm'),
    ].filter(Boolean);

    forms.forEach(form => {
      const guiaInput = form.querySelector('input[type="text"], #heroGuiaInput, #rntGuia');
      const telefonoInput = form.querySelector('input[type="tel"]') || form.querySelector('#heroTelefonoInput, #rntTelefono');
      if (!guiaInput) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const telefono = telefonoInput ? telefonoInput.value : '';
        this.buscar(guiaInput.value, telefono);
      });
    });
  }
};

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.RNT_Rastreo.init());
} else {
  window.RNT_Rastreo.init();
}


/* ==========================================================
   STEPPER PREMIUM - 9 estados Gelotra
   Agregado: 19-Abr-2026 - Claude Code Sonnet
   ========================================================== */

var RNT_ESTADOS_STEPPER = [
  { value: 'ASIGNADA',          label: 'Asignada',          emoji: '\u{1F4CB}' },
  { value: 'EN_PODER_ORIGEN',   label: 'En poder origen',   emoji: '\u{1F3ED}' },
  { value: 'VIAJE_TRONCAL',     label: 'Viaje troncal',     emoji: '\u{1F69B}' },
  { value: 'EN_PODER_DESTINO',  label: 'En poder destino',  emoji: '\u{1F4E6}' },
  { value: 'REPARTO_URBANO',    label: 'Reparto urbano',    emoji: '\u{1F3CD}' },
  { value: 'ENTREGADO',         label: 'Entregado',         emoji: 'OK' },
  { value: 'CUMPLIDO',          label: 'Cumplido',          emoji: '\u{1F389}' }
];

var RNT_ESTADOS_ESPECIALES = {
  'DEVOLUCION': { label: 'En devolucion', tipo: 'devolucion' },
  'NOVEDAD':    { label: 'Con novedad',   tipo: 'novedad'   }
};

function rntGenerarStepper(estadoActual, historial) {
  historial = historial || [];
  var idxActual = -1;
  for (var i = 0; i < RNT_ESTADOS_STEPPER.length; i++) {
    if (RNT_ESTADOS_STEPPER[i].value === estadoActual) { idxActual = i; break; }
  }

  var html = '<div class="rnt-stepper" role="list">';

  for (var idx = 0; idx < RNT_ESTADOS_STEPPER.length; idx++) {
    var estado = RNT_ESTADOS_STEPPER[idx];
    var hecho  = idx < idxActual;
    var activo = idx === idxActual;
    var clase  = hecho ? 'done' : activo ? 'active' : 'pending';

    var registro = null;
    for (var h = 0; h < historial.length; h++) {
      if (historial[h].estado === estado.value) { registro = historial[h]; break; }
    }
    var fecha = registro ? new Date(registro.created_at || registro.fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short'
    }) : null;
    var ciudad = registro ? (registro.ciudad_actual || registro.ciudad || null) : null;

    html += '<div class="rnt-step ' + clase + '" role="listitem">';
    html += '<div class="rnt-step-circle">' + (hecho ? 'V' : activo ? estado.emoji : 'O') + '</div>';
    html += '<div class="rnt-step-info"><span class="rnt-step-label">' + estado.label + '</span>';
    if (fecha) {
      html += '<span class="rnt-step-date">' + fecha + (ciudad ? ' - ' + ciudad : '') + '</span>';
    }
    html += '</div></div>';

    if (idx < RNT_ESTADOS_STEPPER.length - 1) {
      html += '<div class="rnt-step-connector' + (hecho ? ' done' : '') + '"></div>';
    }
  }

  html += '</div>';

  var especial = RNT_ESTADOS_ESPECIALES[estadoActual];
  if (especial) {
    html += '<div class="rnt-estado-especial ' + especial.tipo + '">';
    html += '<strong>' + especial.label + '</strong> &mdash; Contacta a RNT por ';
    html += '<a href="https://wa.me/573124376616" target="_blank" rel="noopener">WhatsApp</a>.';
    html += '</div>';
  }

  return html;
}

function rntGenerarCumplido(urlCumplido) {
  if (!urlCumplido) return '';
  return [
    '<div class="rnt-cumplido-card">',
    '  <div class="cumplido-icon">OK</div>',
    '  <div class="flex-grow-1">',
    '    <p class="cumplido-title mb-1">Envio entregado exitosamente</p>',
    '    <p class="cumplido-sub mb-2">El destinatario recibio la mercancia. Descarga el comprobante oficial.</p>',
    '    <a href="' + urlCumplido + '"',
    '       target="_blank" rel="noopener noreferrer"',
    '       class="btn-ver-cumplido">',
    '       <i class="bi bi-file-earmark-check"></i>',
    '       Ver comprobante de entrega',
    '    </a>',
    '  </div>',
    '</div>'
  ].join('\n');
}

function rntRenderizarResultado(guia, historial) {
  var numGuia = guia.numero_guia || guia.id_guia;
  var waUrl = 'https://wa.me/573124376616?text=' + encodeURIComponent('Hola, consulto por la guia ' + numGuia + '.');
  return '<div class="rnt-tracking-result">' +
    '<div class="rnt-track-header">' +
    '<span class="guia-num">Guia: ' + numGuia + '</span>' +
    '<span class="transportadora-badge">' + (guia.transportadora || 'RNT') + '</span>' +
    '</div>' +
    '<div class="rnt-ruta">' +
    '<span class="ciudad">' + (guia.ciudad_origen || 'Bogota') + '</span>' +
    '<span class="flecha">&rarr;</span>' +
    '<span class="ciudad">' + (guia.ciudad_destino || '-') + '</span>' +
    '</div>' +
    '<div style="padding:0 1.25rem 1.25rem">' +
    rntGenerarStepper(guia.estado_actual, historial) +
    rntGenerarCumplido(guia.url_cumplido) +
    '</div>' +
    '<div style="background:#F3EFE9;padding:0.75rem 1.25rem;display:flex;gap:8px;flex-wrap:wrap">' +
    '<a href="' + waUrl + '" target="_blank" class="btn btn-success btn-sm">Contactar WA</a>' +
    '<button onclick="window.RNT_Rastreo._limpiarResultado()" class="btn btn-outline-secondary btn-sm">Nueva consulta</button>' +
    '</div>' +
    '</div>';
}

window.rntGenerarStepper = rntGenerarStepper;
window.rntGenerarCumplido = rntGenerarCumplido;
window.rntRenderizarResultado = rntRenderizarResultado;

/*
  ═══════════════════════════════════════════════
  CONTRATO INTEGRACIÓN API FUTURA — para cualquier IA o dev
  ═══════════════════════════════════════════════
  APIs potenciales: Aeromensajería, Exxe Logística, Servientrega

  Para integrar una nueva API:
  1. Agregar en window.RNT_CONFIG.apis: { nombre: 'URL_API' }
  2. Crear función _buscarEn[Nombre](idGuia, telefono) que retorne:
     {
       id_guia: string,
       estado: 'RECIBIDO|EN_TRANSITO|EN_DESTINO|ENTREGADO|DEVOLUCION',
       historial: [{ estado, ciudad, fecha, descripcion }],
       remitente: { nombre, ciudad },
       destinatario: { nombre, ciudad },
       fuente: 'nombre_api'
     }
  3. En buscarConValidacion(), agregar al array de fuentes antes del fallback Gelotra
  4. El fallback Gelotra siempre es el último recurso

  Estado actual (23-Abr-2026): Solo Supabase + fallback Gelotra activos.
  ═══════════════════════════════════════════════
*/
