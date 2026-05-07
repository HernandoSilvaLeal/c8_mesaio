'use strict';

/* Ventana de impresión compartida con pdf-generator.js */
if (typeof _rntPrintWindow === 'undefined') { var _rntPrintWindow = null; }

/**
 * pdf-guia-completa.js — Guía Completa Oficio 4 partes
 * Red Nacional de Transportes S.A.S. — NIT 901.040.715-7
 * Formato: Oficio colombiano 216×330mm, 4 secciones con líneas de corte
 * Secciones: Remitente | Destinatario | RNT Contabilidad | Transportadora
 *
 * Dependencias: window.jspdf.jsPDF + window.sbClient (admin)
 * C3-01 — ETAPA 5 — Codex territory absorción por Claude
 */

window.RNT_PDFGuiaCompleta = {

  generar: function(idGuia) {
    var client = window.sbClient || (typeof sbClient !== 'undefined' ? sbClient : null);
    if (!client) {
      alert('Error de configuración. Recarga la página e intenta de nuevo.');
      return;
    }

    var jsPDFLib = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDFLib) {
      alert('Librería PDF no disponible. Recarga la página.');
      return;
    }

    // Indicador visual
    var btns = document.querySelectorAll('[onclick*="RNT_PDFGuiaCompleta"][onclick*="' + idGuia + '"]');
    btns.forEach(function(b) { b.disabled = true; b.style.opacity = '0.5'; });

    client
      .from('guias')
      .select('id_guia, remitente, remitente_direccion, remitente_telefono, destinatario, destinatario_direccion, destinatario_telefono, ciudad_origen, ciudad_destino, peso_real, valor_declarado, unidades, descripcion_contenido, flete_calculado, seguro_calculado, total_estimado, tipo_embalaje, notas_especiales, fecha_creacion')
      .eq('id_guia', idGuia)
      .single()
      .then(function(res) {
        btns.forEach(function(b) { b.disabled = false; b.style.opacity = '1'; });

        if (res.error || !res.data) {
          alert('No se encontró la guía ' + idGuia + (res.error ? ': ' + res.error.message : ''));
          return;
        }

        var guia = (typeof rntNormalizarGuia === 'function') ? rntNormalizarGuia(res.data) : res.data;
        var doc = new jsPDFLib({ orientation: 'portrait', unit: 'mm', format: [216, 330] });
        var alturaSeccion = 330 / 4; // 82.5mm
        var etiquetas = ['COPIA REMITENTE', 'COPIA DESTINATARIO', 'COPIA RNT - CONTABILIDAD', 'COPIA TRANSPORTADORA'];

        for (var i = 0; i < etiquetas.length; i++) {
          var yBase = i * alturaSeccion;
          RNT_PDFGuiaCompleta._seccion(doc, guia, yBase, alturaSeccion, etiquetas[i]);

          if (i < 3) {
            doc.setLineDashPattern([2, 2], 0);
            doc.setDrawColor(150, 150, 150);
            doc.setLineWidth(0.3);
            doc.line(5, yBase + alturaSeccion, 211, yBase + alturaSeccion);
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(0, 0, 0);
          }
        }

        if (_rntPrintWindow && !_rntPrintWindow.closed) { _rntPrintWindow.close(); }
        _rntPrintWindow = window.open(doc.output('bloburl'), '_blank');
      })
      .catch(function(err) {
        btns.forEach(function(b) { b.disabled = false; b.style.opacity = '1'; });
        alert('Error generando PDF: ' + err.message);
      });
  },

  _seccion: function(doc, g, yBase, altura, etiqueta) {
    var M = 8;
    var W = 216;
    var fmt = function(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); };
    var yy = function(n) { return yBase + n; };
    var tipoServicio = Number(g.peso_real) > 20 ? 'MERCANCIA' : 'PAQUETE';

    // Badge Tipo B — guía oficio completa
    if (typeof rntAgregarTipoDoc === 'function') {
      rntAgregarTipoDoc(doc, 'GUIA OFICIO', 'B', yBase);
    }

    // Encabezado navy
    doc.setFillColor(13, 27, 75);
    doc.rect(M, yy(2), W - (M * 2), 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('RED NACIONAL DE TRANSPORTES S.A.S.  NIT 901.040.715-7  Tel: 3124376616', 108, yy(7.5), { align: 'center' });

    // Etiqueta dorada (copia)
    doc.setFillColor(255, 215, 0);
    doc.rect(158, yy(2), 50, 9, 'F');
    doc.setTextColor(13, 27, 75);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(etiqueta, 183, yy(7.5), { align: 'center' });

    // Número guía
    doc.setTextColor(13, 27, 75);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('GUIA N.' + (g.id_guia || '—'), 108, yy(18), { align: 'center' });

    // Fecha + tipo de servicio
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    var fechaStr = g.fecha_creacion ? new Date(g.fecha_creacion).toLocaleDateString('es-CO') : '—';
    doc.text('Fecha: ' + fechaStr + '   |   Tipo: ' + tipoServicio, 108, yy(23), { align: 'center' });

    // Línea divisora
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(M, yy(26), W - M, yy(26));

    // ORIGEN / REMITENTE
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 27, 75);
    doc.text('ORIGEN:', M, yy(31));
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text((g.ciudad_origen || '—').toUpperCase(), 28, yy(31));

    doc.setFont('helvetica', 'bold');
    doc.text('REMITENTE:', M, yy(36));
    doc.setFont('helvetica', 'normal');
    doc.text(g.remitente || '—', 37, yy(36));

    doc.text('DIR: ' + (g.remitente_direccion || '—'), M, yy(41));
    doc.text('TEL: ' + (g.remitente_telefono || '—'), M, yy(46));

    // Línea
    doc.line(M, yy(49), W - M, yy(49));

    // DESTINO / DESTINATARIO
    doc.setFont('helvetica', 'bold');
    doc.text('DESTINO:', M, yy(54));
    doc.setFont('helvetica', 'normal');
    doc.text((g.ciudad_destino || '—').toUpperCase(), 30, yy(54));

    doc.setFont('helvetica', 'bold');
    doc.text('DESTINATARIO:', M, yy(59));
    doc.setFont('helvetica', 'normal');
    doc.text(g.destinatario || '—', 43, yy(59));

    doc.text('DIR: ' + (g.destinatario_direccion || '—'), M, yy(64));
    doc.text('TEL: ' + (g.destinatario_telefono || '—'), M, yy(69));

    // Línea
    doc.line(M, yy(72), W - M, yy(72));

    // VALORES
    doc.setFontSize(6.5);
    doc.text('Peso: ' + (g.peso_real || '—') + ' kg', M, yy(77));
    doc.text('Unidades: ' + (g.unidades || 1), 55, yy(77));
    doc.text('Valor declarado: ' + fmt(g.valor_declarado), 90, yy(77));

    var contenido = g.descripcion_contenido || '—';
    var lineasContenido = doc.splitTextToSize('Contenido: ' + contenido, W - (M * 2) - 5);
    doc.text(lineasContenido[0] || '', M, yy(81));

    // Totales — parte baja de la sección
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Flete: ' + fmt(g.flete_calculado), M, yy(altura - 10));
    doc.text('Seguro: ' + fmt(g.seguro_calculado), 65, yy(altura - 10));
    doc.setTextColor(13, 27, 75);
    doc.text('TOTAL: ' + fmt(g.total_estimado), 130, yy(altura - 10));
    doc.setTextColor(0, 0, 0);

    // Firma receptor
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Firma quien recibe:', M, yy(altura - 4));
    doc.setDrawColor(100, 100, 100);
    doc.line(M + 36, yy(altura - 4), M + 85, yy(altura - 4));
    doc.text('C.C./NIT:', M + 90, yy(altura - 4));
    doc.line(M + 107, yy(altura - 4), M + 145, yy(altura - 4));
    doc.setDrawColor(0, 0, 0);
  }
};
