# SPEC PARA CHATGPT — PITCH DECK MESAIO
## Última bala de plata · Hackathon 2026

---

## 1. TU ROL — LEE ESTO PRIMERO

Eres mi consultor de pitch para una hackathon. Tienes navegación web. Vas a:

1. **Visitar y explorar** las URLs que te paso abajo (sección 4) — son el producto LIVE
2. **Leer este documento completo** para entender contexto, decisiones y narrativa
3. **Generarme** los entregables del pitch que pido al final (sección 11)

**Tono esperado:** Confianza ejecutiva. Cero adornos. Cifras concretas. Storytelling con tensión emocional. Estamos compitiendo por **$2.000.000 COP** y el jurado solo nos ve una vez.

**Idioma:** Español Colombia. "Cliente" no "user". "Mesero" no "waiter". Dinero en COP con punto de miles ($42.000).

**Restricción:** No inventes datos que no estén en este doc o en las URLs. Si necesitas un número, dilo: "asumir X" — no fabriques.

---

## 2. EL PRODUCTO — Mesaio en 30 segundos

**Mesaio** es un sistema integral de gestión de restaurante que conecta a **mesero, cocina y administrador** en una sola plataforma web. Sin instalación, sin hardware especial, sin contratos.

**Tres roles, una misma realidad:**
- 🧑‍💼 **Mesero** toma orden desde el celular junto a la mesa
- 🔥 **Cocina** ve la orden inmediatamente en una pantalla KDS profesional
- 📊 **Administrador** controla menú, mesas, ventas y reportes desde cualquier dispositivo

**Tagline working:** *"El restaurante moderno vive en una pantalla."*

---

## 3. EL PROBLEMA QUE RESUELVE

### Restaurantes de tamaño medio en Colombia (10-50 mesas) operan así HOY:

- Mesero anota en un cuaderno, camina a cocina, dicta el pedido
- Cocina escucha mal o pierde el ticket → plato equivocado o demorado
- Cliente espera sin saber el estado de su orden
- Admin no sabe ventas hasta cierre → no puede reaccionar
- Cuando algo se agota, nadie le avisa al mesero hasta que el cliente lo pide

**Costos invisibles:**
- 15-25% de errores de comanda en restaurantes sin POS
- 3-7 minutos perdidos por orden en ida-vuelta mesero-cocina
- $300.000-$1.500.000 COP/mes en ventas perdidas por mala rotación de mesa

### Las soluciones existentes fallan:

- **POS legacy (Square, Clover):** $200-500 USD/mes + hardware + capacitación. Inviable para mediano colombiano.
- **Apps fragmentadas:** una para mesero, otra para cocina, otra para reportes — no hablan entre sí
- **Excel + WhatsApp:** lo que usan hoy. Cero trazabilidad, cero reportes.

---

## 4. URLs LIVE — VISÍTALAS EN ORDEN

**Por favor abre cada URL y revisa qué muestra. Esto es el producto real, no mock.**

| # | URL | Qué vas a ver |
|---|-----|---------------|
| 1 | https://c8mesaio.netlify.app | Landing comercial — narrativa producto, mockup KDS, stats |
| 2 | https://c8mesaio.netlify.app/login | Selector de rol — entrada al sistema |
| 3 | https://c8mesaio.netlify.app/mesero | **Panel mesero** — mapa 12 mesas color-coded |
| 4 | https://c8mesaio.netlify.app/cocina | **KDS** — 3 columnas: Pendientes / Preparando / Listos |
| 5 | https://c8mesaio.netlify.app/admin | **Dashboard admin** — 5 paneles + export CSV |
| 6 | https://c8mesaio.netlify.app/menu | Carta digital pública (escaneable por QR) |
| 7 | https://c8mesaio.netlify.app/entregables | Portal de entregables (catálogo de demos) |

**Repo público:** https://github.com/HernandoSilvaLeal/c8_mesaio

### Cómo recorrer el flujo end-to-end:
1. Abre `/mesero` → Tap mesa libre (Mesa 03) → Modal con 4 categorías → Agrega Bandeja paisa + Limonada de coco → "Enviar a cocina"
2. Abre `/cocina` (otra pestaña) → La orden aparece en col "Pendientes" → Click "Iniciar preparación" → se mueve a col "Preparando" → Click "Marcar listo"
3. Vuelve a `/mesero` → La mesa 03 dice "¡Listo p/entregar!" en dorado → Tap → "Marcar entregado" → "Cerrar cuenta" → mesa libre
4. Abre `/admin` → Dashboard muestra +1 venta del día → Reportes muestra plato top actualizado

---

## 5. STACK TÉCNICO (para que entiendas la arquitectura)

```
Frontend:
  HTML5 puro · CSS Vanilla · JavaScript ES6+
  Bootstrap 5.3.3 · Bootstrap Icons · AOS (Animate On Scroll)
  Fuentes: Inter (sans) + Playfair Display (serif premium)

Backend:
  Supabase (PostgreSQL + Auth + Realtime subscriptions)
  Schema: usuarios, mesas, platos, ordenes, orden_items
  RLS abierto para demo · Realtime activo en tabla 'ordenes'

Persistencia dual:
  Modo Supabase (producción) ↔ Modo LocalStorage (fallback offline)
  Detecta automáticamente — un solo módulo (mesaio-core.js) lo orquesta

Deploy:
  Netlify · auto-deploy desde GitHub main
  Sin build step · cero dependencias · carga en <1s

Tamaño:
  Sitio completo: ~200KB sin contar vendor
  Con vendor: ~2MB primer load · cacheado después
  Sin frameworks JS pesados (no React/Vue/Angular)
```

**Ventaja técnica vendible:** "Mesaio carga más rápido que abrir el cuaderno donde anotaban antes."

---

## 6. EL TWIST — REUTILIZACIÓN ESTRATÉGICA (transparencia para el jurado)

**Las reglas del hackathon permiten reutilizar proyectos propios.** Mesaio se construyó en menos de 1 hora aprovechando:

- **RNT (Red Nacional de Transportes)** — proyecto comercial real de AppCors, en producción para una empresa colombiana de transporte de carga: https://rednacionaldetransporte.netlify.app
- De ahí venimos: sistema de diseño premium navy+gold, panel admin Supabase con CRUD funcional, vendor de Bootstrap+Icons+AOS, patrones de cards/badges/tabs/modales

**Lo que hicimos NUEVO en hackathon:**
- ⭐ Reskin completo navy → **burgundy** (#5C1A2B) + **cream** (#FAF6EE) — paleta gastronómica premium
- ⭐ `mesaio-core.js` — orquestador dual-mode Supabase + LocalStorage (300+ líneas)
- ⭐ Modelo de datos restaurante: usuarios/mesas/platos/ordenes/orden_items + RLS + Realtime
- ⭐ Mapa de mesas interactivo con tiempos en vivo
- ⭐ KDS profesional estilo Toast/Square con alertas late
- ⭐ Dashboard admin con 5 panels (live + CRUD + reportes top5 + export CSV BOM UTF-8)
- ⭐ Realtime subscribe para sincronización instantánea entre dispositivos
- ⭐ Carta digital escaneable por QR con 15 platos colombianos auténticos

**Mensaje al jurado:** "No reinventamos la rueda. Tomamos un sistema premium en producción y en 50 minutos lo convertimos en un POS de restaurante completamente funcional. Eso ES la velocidad de mercado moderna."

---

## 7. PROPUESTA DE VALOR — 3 ángulos para el pitch

### Ángulo 1 — Para el dueño del restaurante
> "Tus meseros toman orden 3 veces más rápido. Tu cocina nunca pierde un ticket. Tú ves las ventas del día desde tu casa. Sin instalar nada, en menos tiempo del que tomas un café."

### Ángulo 2 — Para el inversionista
> "Restaurante medio colombiano: 50K en el país. SaaS a $99/mes con margen 80%. Ingreso anual potencial $50M USD. Producto construido en horas, no meses, gracias a arquitectura de componentes reutilizables."

### Ángulo 3 — Para el jurado técnico
> "Web nativa que opera offline-first con sincronización Realtime cuando hay red. Cero hardware. Cero capacitación. Stack resistente a obsolescencia: HTML + Postgres."

---

## 8. DIFERENCIADORES (numerados, defendibles)

1. **Sin instalación** — abre navegador, listo. Funciona en celular Android $300K, no necesitas iPad.
2. **Sin contratos** — SaaS mensual, cancelas cuando quieras.
3. **Tres roles en un mismo sistema** — competidores venden módulos separados a $99 cada uno.
4. **Realtime nativo** — cocina ve la orden en menos de 3 segundos. Comparable a sistemas de $500 USD/mes.
5. **Modo offline** — si se cae internet, sigues operando con LocalStorage. Sincroniza al volver.
6. **Carta QR incluida** — los clientes ven menú actualizado sin imprimir nada nunca.
7. **Reportes el mismo día** — no esperar al cierre, las ventas se actualizan en vivo.
8. **Hecho en Colombia** — soporte en español, formato COP, casos de uso locales (bandeja paisa, ajiaco, etc).

---

## 9. MERCADO — orden de magnitud

```
Restaurantes formales en Colombia (DANE 2023): ~85.000
   - Pequeños (1-9 empleados): 70.000 → mercado natural
   - Medianos (10-50 empleados): 12.000 → sweet spot
   - Grandes (50+): 3.000 → enterprise (futuro)

Si capturamos 1% de medianos a $99 USD/mes:
   120 restaurantes × $99 × 12 = $142.560 USD anuales
   Con 5% market share: $712.800 USD/año

Bootstrap mode: rentable con 50 clientes.
```

**Comparables:**
- Justo (Chile): valuación >$100M USD, mismo segmento
- Toast (USA): IPO a $20B, mismo problema mercado distinto
- Bistrot (Colombia): cierra contratos a $150K-$300K COP/mes/restaurante

---

## 10. ROADMAP POST-HACKATHON

**Hoy:** MVP funcional, 1 restaurante demo, datos reales colombianos

**30 días:** Pago integrado (Wompi/PayU), facturación electrónica DIAN, app PWA instalable

**90 días:** 10 restaurantes piloto pagantes en Bogotá, métricas de uso reales

**180 días:** Inventario, control de costos por plato (food cost), integración con domicilios (Rappi/Didi)

**12 meses:** Multi-sucursal, reportes consolidados, IA para predecir demanda y reducir desperdicio

---

## 11. ENTREGABLES QUE TE PIDO — DEVUÉLVEME EXACTAMENTE ESTO

Genera **UN solo documento** llamado `PITCH_DECK_MESAIO.md` con estas secciones, en este orden:

### Sección A — Pitch Deck (10 slides)
Para cada slide: **título + subtítulo + 3 bullets máximo + nota visual** (qué imagen/mockup/grafico iría).

1. Slide 1 · Cover — Mesaio + tagline + el equipo
2. Slide 2 · El problema — restaurantes operan en el siglo XX
3. Slide 3 · La solución — captura de pantalla del flujo
4. Slide 4 · Demo en vivo (3 capturas + caption por cada una)
5. Slide 5 · Diferenciadores (los 8 de la sección 8 condensados a 4)
6. Slide 6 · Mercado y oportunidad ($)
7. Slide 7 · Stack técnico — por qué somos rápidos y económicos de operar
8. Slide 8 · Modelo de negocio — pricing + canales
9. Slide 9 · Roadmap 30/90/180/12 meses
10. Slide 10 · Cierre — pedido al jurado/inversionista (CTA)

### Sección B — Guion de presentación 3 minutos
Texto exacto a leer/decir, dividido en bloques de 30 segundos. Marcado con [PAUSA], [GESTO MOSTRAR PANTALLA], etc.

### Sección C — Preguntas frecuentes del jurado + respuestas blindadas
Mínimo 10 preguntas que te imagines (técnicas, comerciales, estratégicas) con respuesta de 2-3 líneas cada una.

### Sección D — One-liner social
Tweet + LinkedIn post + WhatsApp status para anunciar la demo, listos para copy-paste.

### Sección E — Email a un inversionista
Plantilla de cold email a un VC colombiano (ej: Polymath, Veronorte, Fund Latam) presentando Mesaio en 5 párrafos.

---

## 12. CONTEXTO DEL EQUIPO

- **Hernando Silva Leal** (Nando) — propietario AppCors S.A.S. · Bogotá · Desarrollador full-stack y arquitecto del proyecto
- **AppCors S.A.S.** — empresa de software con cliente real activo (Red Nacional de Transportes) — esto da credibilidad operacional, no somos sólo MVP
- **Stack ganador:** Claude Code (Opus 4.7) construyendo + Claude Web (arquitecto) + ChatGPT (tú — pitch). Tres IAs orquestadas en una hora.

---

## 13. UN ÚLTIMO NORTE PARA TI

> El jurado tiene 3 minutos para decidir. No leas el deck — actúalo. Cuenta una historia: el dueño del restaurante que estaba ahogado en cuadernos, instala Mesaio en 5 minutos, y a la semana ya sabe qué plato vender más.
>
> El producto está construido. Las URLs están vivas. Las cifras son reales. **Tu único trabajo es darle voz.**

---

*Mesaio · Hackathon 2026 · Última bala de plata*
*ChatGPT con web access · Pitch deck · Vamos a ganar*
