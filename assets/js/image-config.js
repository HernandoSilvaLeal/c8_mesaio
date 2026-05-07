/**
 * image-config.js — Sistema de imágenes configurables RNT
 * Para cambiar cualquier imagen del sitio: editar el objeto RNT_IMAGES
 * y agregar la URL nueva. No tocar HTML.
 *
 * Generado: 19-Abr-2026 — Claude Code Sonnet 4.6
 */

'use strict';

// CDN de Pexels — hotlinking comercial permitido por TOS
const PEXELS_CDN = 'https://images.pexels.com/photos';

/**
 * Catálogo de imágenes del sitio RNT
 * Cada key corresponde al data-img-key del elemento HTML
 */
const RNT_IMAGES = {
  'hero-main': {
    src: `${PEXELS_CDN}/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80`,
    srcMobile: `${PEXELS_CDN}/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=800&q=80`,
    alt: 'Camión de carga en carretera colombiana — Red Nacional de Transportes',
    role: 'lcp',
    fallback: 'assets/img/fallback/hero.jpg'
  },
  'servicio-carga-aerea': {
    src: `${PEXELS_CDN}/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=800&q=80&fit=crop&h=533`,
    alt: 'Servicio de carga aérea Red Nacional de Transportes',
    role: 'below-fold',
    fallback: 'assets/img/fallback/service.jpg'
  },
  'servicio-almacenamiento': {
    src: `${PEXELS_CDN}/4489417/pexels-photo-4489417.jpeg?auto=compress&cs=tinysrgb&w=800&q=80&fit=crop&h=533`,
    alt: 'Servicio de almacenamiento y bodegaje Red Nacional de Transportes',
    role: 'below-fold',
    fallback: 'assets/img/fallback/service.jpg'
  },
  'servicio-transporte-nacional': {
    src: `${PEXELS_CDN}/11087837/pexels-photo-11087837.jpeg?auto=compress&cs=tinysrgb&w=800&q=80&fit=crop&h=533`,
    alt: 'Transporte de carga nacional Red Nacional de Transportes',
    role: 'below-fold',
    fallback: 'assets/img/fallback/service.jpg'
  },
  'feature-experiencia': {
    src: `${PEXELS_CDN}/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=800&q=80&fit=crop&h=600`,
    alt: 'Experiencia y confiabilidad en transporte de carga',
    role: 'below-fold',
    fallback: 'assets/img/fallback/feature.jpg'
  },
  'feature-seguridad': {
    src: `${PEXELS_CDN}/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800&q=80&fit=crop&h=600`,
    alt: 'Seguridad y tranquilidad en envíos con Red Nacional de Transportes',
    role: 'below-fold',
    fallback: 'assets/img/fallback/feature.jpg'
  },
  'feature-cobertura': {
    src: `${PEXELS_CDN}/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=800&q=80&fit=crop&h=600`,
    alt: 'Cobertura nacional completa en todos los municipios de Colombia',
    role: 'below-fold',
    fallback: 'assets/img/fallback/feature.jpg'
  }
};

/**
 * Hidrata todas las imágenes del sitio leyendo data-img-key
 * Se ejecuta en DOMContentLoaded — sin bloquear el parse
 */
function rntHidrateImages() {
  document.querySelectorAll('img[data-img-key]').forEach(function(img) {
    var key = img.getAttribute('data-img-key');
    var config = RNT_IMAGES[key];
    if (!config) return;

    img.alt = config.alt;
    img.setAttribute('data-img-fallback', config.fallback);

    if (config.role === 'lcp') {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
      img.setAttribute('decoding', 'async');
      img.src = config.src;
      return;
    }

    if (config.role === 'below-fold') {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('fetchpriority', 'low');
    } else {
      img.setAttribute('loading', 'eager');
    }

    img.setAttribute('decoding', 'async');
    img.src = config.src;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rntHidrateImages);
} else {
  rntHidrateImages();
}

// Handler de errores — delegado, CSP-safe, sin loop
document.addEventListener('error', function(e) {
  var el = e.target;
  if (!(el instanceof HTMLImageElement)) return;
  if (el.dataset.errorHandled === '1') return;
  el.dataset.errorHandled = '1';

  var fallback = el.getAttribute('data-img-fallback') || 'assets/img/fallback/default.jpg';
  el.removeAttribute('srcset');
  el.removeAttribute('sizes');
  el.src = fallback;

  console.warn('[RNT Images] Broken:', el.getAttribute('data-img-key'), '→ fallback:', fallback);
}, true);
