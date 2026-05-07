/**
 * tarifario-rnt.js - Tarifario parametrico Red Nacional de Transportes
 * Version: 2.0 - 19-Abr-2026
 *
 * MANTENIMIENTO: Para actualizar tarifas, solo editar los objetos
 * RNT_TARIFAS_BASE y RNT_REGLAS. No tocar las funciones.
 *
 * Basado en: Reunion con Fabian Rodriguez 25-Mar-2026
 * Confirmado en: Reunion 16-Abr-2026
 */

'use strict';

// ================================================================
// TARIFARIO 2026 CONFIRMADO CLIENTE (16-Abr-2026)
// ================================================================
var RNT_TARIFARIO = {
  minimos: {
    nacional: 43650,      // Confirmado Fabian 16-Abr-2026
    regional: 36500,      // Confirmado Fabian 16-Abr-2026
    urbano: 27500,        // Confirmado Fabian 16-Abr-2026
    mensajeria2kg: 18750, // Confirmado Fabian 16-Abr-2026 (hasta 2kg)
    minimoLiquidacion: 7500 // Confirmado Fabian 16-Abr-2026
  }
};

// ================================================================
// TARIFAS BASE 2026 (COP)
// ================================================================
var RNT_TARIFAS_BASE = {
  mensajeria: RNT_TARIFARIO.minimos.mensajeria2kg,
  paquete_nacional: RNT_TARIFARIO.minimos.urbano,
  mercancia_urbano: RNT_TARIFARIO.minimos.urbano,
  mercancia_regional: RNT_TARIFARIO.minimos.regional,
  mercancia_nacional: RNT_TARIFARIO.minimos.nacional,
  minimo_liquidacion: RNT_TARIFARIO.minimos.minimoLiquidacion
};

// ================================================================
// REGLAS POR CATEGORIA
// ================================================================
var RNT_REGLAS = {
  mensajeria: {
    nombre: 'Mensajeria',
    descripcion: 'Documentos y paquetes hasta 2 kg — redirigir a WhatsApp',
    peso_max_kg: 2,
    arista_max_cm: 30,
    valor_max_cop: 50000,
    minimo_peso_cobro: 0,
    seguro_pct: 0.01   // 1% — confirmado Fabian 25-Mar-2026
  },
  paquete: {
    nombre: 'Paquete',
    descripcion: 'Peso <=20 kg Y todas aristas <=20 cm',
    peso_max_kg: 20,
    arista_max_cm: 20,
    valor_max_cop: 500000,
    minimo_peso_cobro: 20,  // minimo 20 kg por unidad
    seguro_pct: 0.01   // 1% — confirmado Fabian 25-Mar-2026
  },
  mercancia: {
    nombre: 'Mercancia',
    descripcion: 'Peso >20 kg O alguna arista >20 cm',
    valor_max_cop: 5000000,
    minimo_peso_cobro: 30,  // minimo 30 kg por unidad
    seguro_pct: 0.01   // 1% — confirmado Fabian 25-Mar-2026
  },
  gap_2_6_kg: {
    aplica: 'paquete',
    nota: 'Rango 2-6 kg usa reglas de paquete (minimo 20 kg). Fabian no definio explicitamente.'
  }
};

// Exponer en window.RNT_TARIFARIO para que cotizador-motor.js lo use
if (window.RNT_TARIFARIO) {
  window.RNT_TARIFARIO.RNT_REGLAS = RNT_REGLAS;
}

// ================================================================
// TIEMPOS DE ENTREGA (HORAS)
// ================================================================
var RNT_TIEMPOS = {
  cundinamarca: { label: 'Cundinamarca', horas: '24-48 horas' },
  principales: { label: 'Medellin / Cali / Eje Cafetero', horas: '48-72 horas' },
  costa: { label: 'Costa / Llanos / Resto del pais', horas: '72-96 horas' }
};

// ================================================================
// DETERMINAR CATEGORIA
// ================================================================
function rntDeterminarCategoria(pesoKg, largoCm, anchoCm, altoCm) {
  var peso = parseFloat(pesoKg) || 0;
  var largo = parseFloat(largoCm) || 0;
  var ancho = parseFloat(anchoCm) || 0;
  var alto = parseFloat(altoCm) || 0;

  if (largo > 20 || ancho > 20 || alto > 20) return 'mercancia';
  if (peso > 20) return 'mercancia';
  if (peso <= 2 && largo <= 30 && ancho <= 20 && alto <= 15) return 'mensajeria';
  return 'paquete';
}

// ================================================================
// CALCULAR PESO A LIQUIDAR
// ================================================================
function rntCalcularPesoLiquidar(pesoReal, largoCm, anchoCm, altoCm, categoria, unidades) {
  var L = parseFloat(largoCm) || 0;
  var A = parseFloat(anchoCm) || 0;
  var H = parseFloat(altoCm) || 0;
  var R = parseFloat(pesoReal) || 0;
  var U = parseInt(unidades) || 1;

  var pesoVol = (L * A * H) / 2500;
  var regla = RNT_REGLAS[categoria] || RNT_REGLAS.mercancia;
  var pesoMin = regla.minimo_peso_cobro || 0;
  var pesoUnitario = Math.max(R, pesoVol, pesoMin);

  return pesoUnitario * U;
}

// ================================================================
// CALCULAR FLETE
// ================================================================
function rntCalcularFlete(pesoLiqTotal, categoria, valorDeclarado) {
  var vd = parseFloat(valorDeclarado) || 0;

  var tarifaBase;
  if (categoria === 'mensajeria') {
    tarifaBase = RNT_TARIFAS_BASE.mensajeria;
  } else if (categoria === 'paquete') {
    tarifaBase = RNT_TARIFAS_BASE.paquete_nacional;
  } else {
    tarifaBase = RNT_TARIFAS_BASE.mercancia_nacional;
  }

  var fleteProporcional = pesoLiqTotal > 0
    ? Math.round(pesoLiqTotal * (tarifaBase / 30))
    : tarifaBase;

  var fleteBase = Math.max(fleteProporcional, RNT_TARIFARIO.minimos.minimoLiquidacion);
  var seguro = Math.max(Math.round(vd * 0.01), RNT_TARIFARIO.minimos.minimoLiquidacion); // 1% — confirmado Fabian
  var total = fleteBase + seguro;

  return {
    pesoLiquidado: pesoLiqTotal,
    tarifa: tarifaBase,
    fleteBase: fleteBase,
    seguro: seguro,
    total: total
  };
}

// ================================================================
// COTIZADOR COMPLETO
// ================================================================
function rntCotizar(params) {
  var peso = parseFloat(params.pesoKg) || 0;
  var largo = parseFloat(params.largoCm) || 0;
  var ancho = parseFloat(params.anchoCm) || 0;
  var alto = parseFloat(params.altoCm) || 0;
  var unidades = parseInt(params.unidades) || 1;
  var valor = parseFloat(params.valorDeclarado) || 0;
  var categoria = params.categoria || rntDeterminarCategoria(peso, largo, ancho, alto);

  var regla = RNT_REGLAS[categoria];
  if (regla && valor > regla.valor_max_cop) {
    return {
      error: true,
      mensaje: 'El valor declarado supera el maximo para ' + regla.nombre +
               ' ($' + regla.valor_max_cop.toLocaleString('es-CO') + ').'
    };
  }

  var pesoLiq = rntCalcularPesoLiquidar(peso, largo, ancho, alto, categoria, unidades);
  var resultado = rntCalcularFlete(pesoLiq, categoria, valor);

  return {
    error: false,
    categoria: categoria,
    categoriaLabel: regla ? regla.nombre : categoria,
    pesoReal: peso,
    pesoVolumen: Math.round((largo * ancho * alto / 2500) * 10) / 10,
    pesoLiquidado: Math.round(resultado.pesoLiquidado * 10) / 10,
    unidades: unidades,
    valorDeclarado: valor,
    tarifa: resultado.tarifa,
    fleteBase: resultado.fleteBase,
    seguro: resultado.seguro,
    total: resultado.total,
    tiempoEstimado: RNT_TIEMPOS
  };
}

window.rntCotizar = rntCotizar;
window.rntDeterminarCategoria = rntDeterminarCategoria;
window.rntCalcularPesoLiquidar = rntCalcularPesoLiquidar;
window.rntCalcularFlete = rntCalcularFlete;
window.RNT_TARIFARIO = RNT_TARIFARIO;
window.RNT_TARIFAS_BASE = RNT_TARIFAS_BASE;
window.RNT_REGLAS = RNT_REGLAS;
window.RNT_TIEMPOS = RNT_TIEMPOS;

// TARIFAS INTERNACIONALES — Estructura preparada, pendiente datos de Fabián
window.RNT_INTERNACIONAL = {
  estado: 'pendiente_datos_cliente',
  nota: 'Fabián prometió tabla. Cuando llegue: poblar regiones[] con tarifas reales.',
  regiones: ['Estados Unidos','Canadá','Centroamérica','Suramérica','Europa','Resto del mundo'],
  tablas: null, // null = no disponible → mostrar botón WhatsApp
  activar_ui: false // cambiar a true cuando tablas tenga datos
};
// Para activar en cotizador cuando lleguen los datos:
// 1. Poblar window.RNT_INTERNACIONAL.tablas con el objeto de tarifas
// 2. Cambiar window.RNT_INTERNACIONAL.activar_ui = true

// ================================================================
// ORÍGENES — 12 puntos de despacho RNT
// ================================================================
window.RNT_TARIFARIO.origenes = [
  { id: 'bog', label: 'Bogotá' },
  { id: 'med', label: 'Medellín' },
  { id: 'cal', label: 'Cali' },
  { id: 'bar', label: 'Barranquilla' },
  { id: 'buc', label: 'Bucaramanga' },
  { id: 'ctg', label: 'Cartagena' },
  { id: 'per', label: 'Pereira' },
  { id: 'man', label: 'Manizales' },
  { id: 'iba', label: 'Ibagué' },
  { id: 'vil', label: 'Villavicencio' },
  { id: 'cuc', label: 'Cúcuta' },
  { id: 'sam', label: 'Santa Marta' }
];

// ================================================================
// DESTINOS — ~150 municipios principales (zona para tiempo entrega)
// zonas: cundinamarca=24-48h · principales=48-72h · costa=72-96h
// ================================================================
window.RNT_TARIFARIO.destinos = {
  // ── Cundinamarca y Bogotá ──
  'Bogotá':           { zona: 'cundinamarca' },
  'Soacha':           { zona: 'cundinamarca' },
  'Chía':             { zona: 'cundinamarca' },
  'Zipaquirá':        { zona: 'cundinamarca' },
  'Facatativá':       { zona: 'cundinamarca' },
  'Fusagasugá':       { zona: 'cundinamarca' },
  'Girardot':         { zona: 'cundinamarca' },
  'Mosquera':         { zona: 'cundinamarca' },
  'Madrid':           { zona: 'cundinamarca' },
  'Funza':            { zona: 'cundinamarca' },
  'Cajicá':           { zona: 'cundinamarca' },
  'Tocancipá':        { zona: 'cundinamarca' },
  'Sopó':             { zona: 'cundinamarca' },
  'Cota':             { zona: 'cundinamarca' },
  'La Calera':        { zona: 'cundinamarca' },
  'Sibaté':           { zona: 'cundinamarca' },
  'Tabio':            { zona: 'cundinamarca' },
  'Tenjo':            { zona: 'cundinamarca' },
  'Gachancipá':       { zona: 'cundinamarca' },
  'Villeta':          { zona: 'cundinamarca' },
  'Ubaté':            { zona: 'cundinamarca' },
  'Guaduas':          { zona: 'cundinamarca' },
  'Chocontá':         { zona: 'cundinamarca' },
  'Nemocón':          { zona: 'cundinamarca' },
  'Bojacá':           { zona: 'cundinamarca' },
  // ── Antioquia ──
  'Medellín':         { zona: 'principales' },
  'Bello':            { zona: 'principales' },
  'Itagüí':           { zona: 'principales' },
  'Envigado':         { zona: 'principales' },
  'Sabaneta':         { zona: 'principales' },
  'La Estrella':      { zona: 'principales' },
  'Caldas':           { zona: 'principales' },
  'Copacabana':       { zona: 'principales' },
  'Girardota':        { zona: 'principales' },
  'Barbosa':          { zona: 'principales' },
  'Rionegro':         { zona: 'principales' },
  'Marinilla':        { zona: 'principales' },
  'La Ceja':          { zona: 'principales' },
  'El Retiro':        { zona: 'principales' },
  'Apartadó':         { zona: 'costa' },
  'Turbo':            { zona: 'costa' },
  'Caucasia':         { zona: 'costa' },
  // ── Valle del Cauca ──
  'Cali':             { zona: 'principales' },
  'Palmira':          { zona: 'principales' },
  'Buenaventura':     { zona: 'principales' },
  'Tuluá':            { zona: 'principales' },
  'Cartago':          { zona: 'principales' },
  'Buga':             { zona: 'principales' },
  'Jamundí':          { zona: 'principales' },
  'Yumbo':            { zona: 'principales' },
  'Florida':          { zona: 'principales' },
  'Pradera':          { zona: 'principales' },
  'Buenaventura':     { zona: 'principales' },
  // ── Santander ──
  'Bucaramanga':      { zona: 'principales' },
  'Floridablanca':    { zona: 'principales' },
  'Girón':            { zona: 'principales' },
  'Piedecuesta':      { zona: 'principales' },
  'Barrancabermeja':  { zona: 'principales' },
  'San Gil':          { zona: 'principales' },
  'Socorro':          { zona: 'principales' },
  'Vélez':            { zona: 'principales' },
  // ── Norte de Santander ──
  'Cúcuta':           { zona: 'principales' },
  'Los Patios':       { zona: 'principales' },
  'Villa del Rosario':{ zona: 'principales' },
  'Pamplona':         { zona: 'principales' },
  'Ocaña':            { zona: 'costa' },
  'Tibú':             { zona: 'costa' },
  // ── Eje Cafetero ──
  'Pereira':          { zona: 'principales' },
  'Dosquebradas':     { zona: 'principales' },
  'Armenia':          { zona: 'principales' },
  'Calarcá':          { zona: 'principales' },
  'La Tebaida':       { zona: 'principales' },
  'Montenegro':       { zona: 'principales' },
  'Circasia':         { zona: 'principales' },
  'Manizales':        { zona: 'principales' },
  'Chinchiná':        { zona: 'principales' },
  'Villamaría':       { zona: 'principales' },
  'Anserma':          { zona: 'principales' },
  // ── Tolima ──
  'Ibagué':           { zona: 'principales' },
  'Espinal':          { zona: 'principales' },
  'Flandes':          { zona: 'principales' },
  'Honda':            { zona: 'principales' },
  'Melgar':           { zona: 'principales' },
  'Líbano':           { zona: 'principales' },
  // ── Huila ──
  'Neiva':            { zona: 'principales' },
  'Pitalito':         { zona: 'principales' },
  'Garzón':           { zona: 'principales' },
  'La Plata':         { zona: 'principales' },
  // ── Nariño ──
  'Pasto':            { zona: 'principales' },
  'Ipiales':          { zona: 'principales' },
  'Tumaco':           { zona: 'costa' },
  // ── Cauca ──
  'Popayán':          { zona: 'principales' },
  'Santander de Quilichao': { zona: 'principales' },
  // ── Boyacá ──
  'Tunja':            { zona: 'cundinamarca' },
  'Duitama':          { zona: 'cundinamarca' },
  'Sogamoso':         { zona: 'cundinamarca' },
  'Chiquinquirá':     { zona: 'cundinamarca' },
  // ── Atlántico ──
  'Barranquilla':     { zona: 'costa' },
  'Soledad':          { zona: 'costa' },
  'Malambo':          { zona: 'costa' },
  'Sabanalarga':      { zona: 'costa' },
  'Galapa':           { zona: 'costa' },
  // ── Bolívar ──
  'Cartagena':        { zona: 'costa' },
  'Magangué':         { zona: 'costa' },
  'El Carmen de Bolívar': { zona: 'costa' },
  // ── Cesar ──
  'Valledupar':       { zona: 'costa' },
  'Aguachica':        { zona: 'costa' },
  'Codazzi':          { zona: 'costa' },
  // ── Magdalena ──
  'Santa Marta':      { zona: 'costa' },
  'Ciénaga':          { zona: 'costa' },
  'Fundación':        { zona: 'costa' },
  // ── La Guajira ──
  'Riohacha':         { zona: 'costa' },
  'Maicao':           { zona: 'costa' },
  'Uribia':           { zona: 'costa' },
  // ── Córdoba ──
  'Montería':         { zona: 'costa' },
  'Cereté':           { zona: 'costa' },
  'Sahagún':          { zona: 'costa' },
  'Lorica':           { zona: 'costa' },
  // ── Sucre ──
  'Sincelejo':        { zona: 'costa' },
  'Corozal':          { zona: 'costa' },
  'Sampués':          { zona: 'costa' },
  // ── Meta / Llanos ──
  'Villavicencio':    { zona: 'costa' },
  'Acacías':          { zona: 'costa' },
  'Granada':          { zona: 'costa' },
  'San Martín':       { zona: 'costa' },
  'Puerto López':     { zona: 'costa' },
  'Puerto Gaitán':    { zona: 'costa' },
  // ── Casanare ──
  'Yopal':            { zona: 'costa' },
  'Aguazul':          { zona: 'costa' },
  'Paz de Ariporo':   { zona: 'costa' },
  // ── Arauca ──
  'Arauca':           { zona: 'costa' },
  'Saravena':         { zona: 'costa' },
  // ── Putumayo ──
  'Mocoa':            { zona: 'costa' },
  'Puerto Asís':      { zona: 'costa' },
  // ── Caquetá ──
  'Florencia':        { zona: 'costa' },
  // ── Amazonas ──
  'Leticia':          { zona: 'costa' },
  // ── Vichada ──
  'Puerto Carreño':   { zona: 'costa' },
  // ── Guaviare ──
  'San José del Guaviare': { zona: 'costa' },
  // ── Vaupés ──
  'Mitú':             { zona: 'costa' },
  // ── Chocó ──
  'Quibdó':           { zona: 'costa' }
};

// ================================================================
// HOMOLOGADAS — alias de escritura sin tildes y variantes comunes
// ================================================================
window.RNT_TARIFARIO.homologadas = {
  'Bogota':                   'Bogotá',
  'Medellin':                 'Medellín',
  'Cucuta':                   'Cúcuta',
  'Itaguei':                  'Itagüí',
  'Itagui':                   'Itagüí',
  'Chia':                     'Chía',
  'Zipaquira':                'Zipaquirá',
  'Facatativa':               'Facatativá',
  'Fusagasuga':               'Fusagasugá',
  'Cajica':                   'Cajicá',
  'Tocancipa':                'Tocancipá',
  'Sopo':                     'Sopó',
  'Sibate':                   'Sibaté',
  'Gachancipa':               'Gachancipá',
  'Ubate':                    'Ubaté',
  'Choconta':                 'Chocontá',
  'Nemocon':                  'Nemocón',
  'Bojaca':                   'Bojacá',
  'Ibague':                   'Ibagué',
  'Tulua':                    'Tuluá',
  'Jamundi':                  'Jamundí',
  'Apartado':                 'Apartadó',
  'Barranquilla':             'Barranquilla',
  'Cartagena de Indias':      'Cartagena',
  'Giron':                    'Girón',
  'Velez':                    'Vélez',
  'Sogamoso':                 'Sogamoso',
  'Tunja':                    'Tunja',
  'Chiquinquira':             'Chiquinquirá',
  'Manganue':                 'Magangué',
  'Maganue':                  'Magangué',
  'Sincelejo':                'Sincelejo',
  'Monteria':                 'Montería',
  'Cerete':                   'Cereté',
  'Sahagun':                  'Sahagún',
  'Popayan':                  'Popayán',
  'Pasto':                    'Pasto',
  'Santa marta':              'Santa Marta',
  'Riohacha':                 'Riohacha',
  'Valledupar':               'Valledupar',
  'Florencia':                'Florencia',
  'Villavicencio':            'Villavicencio',
  'Acacias':                  'Acacías',
  'San Martin':               'San Martín',
  'Puerto Lopez':             'Puerto López',
  'Puerto Gaitan':            'Puerto Gaitán',
  'Paz de ariporo':           'Paz de Ariporo',
  'Mocoa':                    'Mocoa',
  'Puerto Asis':              'Puerto Asís',
  'Leticia':                  'Leticia',
  'Puerto Carreno':           'Puerto Carreño',
  'San Jose del Guaviare':    'San José del Guaviare',
  'Mitu':                     'Mitú',
  'Quibdo':                   'Quibdó',
  'Yopal':                    'Yopal',
  'Neiva':                    'Neiva',
  'Pitalito':                 'Pitalito',
  'Garzon':                   'Garzón',
  'Armenia':                  'Armenia',
  'Calarca':                  'Calarcá',
  'Villamaria':               'Villamaría',
  'Chinchina':                'Chinchiná',
  'Dosquebradas':             'Dosquebradas',
  'Libano':                   'Líbano',
  'Cirasia':                  'Circasia',
  'Ciénaga':                  'Ciénaga',
  'Cienaga':                  'Ciénaga',
  'Fundacion':                'Fundación',
  'Codazzi':                  'Codazzi',
  'Aguachica':                'Aguachica',
  'Saravena':                 'Saravena',
  'El Carmen de Bolivar':     'El Carmen de Bolívar',
  'Santander de quilichao':   'Santander de Quilichao',
  'La Plata':                 'La Plata',
  'Garzon':                   'Garzón'
};
// 3. En get-a-quote.html agregar tab "Internacional" que lee este objeto
