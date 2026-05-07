# Manual de Operaria — Panel Administrativo RNT
## Red Nacional de Transportes S.A.S.
**Versión 2.1 · Abril 2026 · Estados completos + 5 formatos PDF**

---

## 1. Acceso al Sistema

**URL del panel:**
```
https://rednacionaldetransporte.netlify.app/admin/
```

1. Abre el enlace en cualquier navegador (Chrome o Firefox recomendados).
2. Verás la pantalla de inicio de sesión con dos campos:
   - **Correo electrónico** — tu correo asignado por el administrador
   - **Contraseña** — tu clave personal
3. Haz clic en **"Ingresar al Sistema"**.
4. Si los datos son correctos, entrarás directamente al panel.

> ⚠️ **Importante:** Tu correo y contraseña son personales y confidenciales. Nunca los compartas. Si crees que alguien accedió a tu cuenta, avisa de inmediato a tu supervisor para que restablezcan tu acceso.

> ℹ️ Para cerrar sesión, haz clic en **"Cerrar sesión"** en la parte superior derecha del panel.

---

## 2. Pantalla Principal

Una vez dentro, verás el panel con cuatro pestañas en la parte superior:

| Pestaña | Qué contiene |
|---|---|
| 📋 **Lista de Guías** | Todas las guías registradas — buscar, filtrar, exportar y ver historial |
| ➕ **Nueva Guía** | Formulario para registrar un envío nuevo |
| 🔄 **Actualizar Estado** | Cambiar el estado de una guía existente |
| ✅ **Cumplidas** | Guías con comprobante de entrega — descargar PDF cumplido |

También verás tarjetas de resumen con contadores:
- **Total guías** en el sistema
- **En tránsito** actualmente
- **Entregadas** exitosamente
- **En devolución**

---

## 3. Lista de Guías

Esta es la pestaña principal donde verás todas las guías registradas.

### 3.1 Buscar una guía

Usa la barra de búsqueda para filtrar por cualquiera de estos campos:
- Número de guía RNT (ej: `RNT-2026-001`)
- Nombre del remitente o destinatario
- Ciudad de destino
- Transportadora

### 3.2 Filtrar por estado

Usa el menú desplegable **"Estado"** para ver solo las guías en un estado específico:
- Todas, RECIBIDO, EN_TRANSITO, EN_DESTINO, ENTREGADO, DEVOLUCION

### 3.3 Exportar a Excel (CSV)

1. Opcionalmente, filtra por rango de fechas usando los campos **"Desde"** y **"Hasta"**.
2. Haz clic en el botón **"Exportar CSV"**.
3. Se descargará un archivo `.csv` que puedes abrir directamente en Excel.

> El archivo usa codificación UTF-8 compatible con Excel Colombia.

### 3.4 Ver historial de una guía

Haz clic en cualquier fila de la tabla para abrir el **modal de detalle**. Verás:
- Todos los datos del envío
- Línea de tiempo completa con fechas y ciudades de cada cambio de estado
- Fotos de entrega (si se adjuntaron)

Cierra el modal haciendo clic fuera o presionando **ESC**.

### 3.5 Generar documentos PDF

En cada fila de la tabla, haz clic en el ícono de impresora 🖨️ para desplegar el menú de formatos:

| Formato | Cuándo usarlo |
|---|---|
| **Guía de transporte** | Documento estándar que acompaña el paquete durante el recorrido |
| **Comprobante de entrega** | Formato que firma el destinatario al recibir |
| **Rótulo adhesivo** | Etiqueta para pegar en el paquete — se imprime en 3 copias (100×180 mm) |
| **Carta de porte** | Documento legal requerido para transporte de carga |
| **Guía Oficio (4 partes)** | Formato completo en hoja oficio — 4 secciones separadas para remitente, destinatario, contabilidad y transportadora |

Los PDF se descargan automáticamente en tu carpeta de Descargas.

### 3.6 Acceso rápido a "Actualizar Estado"

Haz clic en el botón de editar ✏️ junto a cualquier guía para ir directamente a la pestaña **"Actualizar Estado"** con esa guía pre-cargada.

---

## 4. Nueva Guía

Usa esta pestaña para registrar un envío nuevo en el sistema.

### Campos del formulario

El formulario está organizado en grupos:

#### Grupo 1 — Identificación de la guía

| Campo | Descripción | Ejemplo |
|---|---|---|
| **ID Guía RNT** *(obligatorio)* | Número de guía propio de RNT | `RNT-2026-001` |
| **Transportadora** | Empresa que transporta el paquete | RNT, Coordinadora, Servientrega, Aeromensajería, TCC, Otro |
| **N° Guía Carrier** | Número de guía del proveedor (si aplica) | `ABC123456` |

#### Grupo 2 — Remitente (quien envía)

| Campo | Obligatorio | Descripción |
|---|---|---|
| Nombre | ✅ Sí | Nombre completo |
| Teléfono | No | Celular o fijo con indicativo |
| Ciudad Origen | ✅ Sí | Donde se recoge el paquete (por defecto: Bogotá) |
| Dirección | No | Dirección exacta de recogida |
| Email | No | Correo para notificaciones |

#### Grupo 3 — Destinatario (quien recibe)

| Campo | Obligatorio | Descripción |
|---|---|---|
| Nombre | ✅ Sí | Nombre completo |
| Teléfono | No | Celular del destinatario |
| Ciudad Destino | ✅ Sí | Ciudad de entrega |
| Dirección de entrega | No | Dirección exacta donde se entrega |
| Email | No | Correo del destinatario |

#### Grupo 4 — Datos de la mercancía

| Campo | Descripción |
|---|---|
| **Tipo de servicio** | Mensajería (≤2 kg), Paquete (2–20 kg), Mercancía (>20 kg) |
| **Unidades** | Cantidad de paquetes |
| **Peso real (kg)** | Peso en kilogramos |
| **Largo / Ancho / Alto (cm)** | Dimensiones para calcular peso volumétrico |
| **Valor declarado ($)** | Valor en pesos COP de la mercancía |
| **Descripción del contenido** | Qué contiene el paquete (ej: "Ropa, 2 camisas") |
| **Tipo de embalaje** | Caja, Bolsa, Tubo, Pallet u Otro |
| **Notas especiales** | Instrucciones adicionales (ej: "Frágil, no apilar") |

#### Estimado automático de flete

Al ingresar el peso, dimensiones y valor declarado, el sistema calcula automáticamente:
- Peso a liquidar (el mayor entre peso real y peso volumétrico)
- Flete base
- Seguro (1% del valor declarado, mínimo $7.500)
- **Total estimado**

> Este estimado es referencial. El valor final puede variar según confirmación en el punto de atención.

### Guardar la guía

Haz clic en **"Registrar Guía"**. Si todo es correcto:
- Verás un mensaje de éxito en verde.
- La guía aparecerá en la Lista de Guías.
- El estado inicial se registra automáticamente como **RECIBIDO**.

---

## 5. Actualizar Estado

Usa esta pestaña para registrar los cambios de estado de una guía durante su recorrido.

### Paso a paso

1. **Ingresa el número de guía RNT** en el campo de búsqueda (ej: `RNT-2026-001`).
2. Haz clic en **"Cargar guía"** — verás la información actual de la guía.
3. **Selecciona el nuevo estado** en el menú desplegable.
4. Opcionalmente completa:
   - **Ciudad actual** — dónde se encuentra el paquete en este momento
   - **Observación** — notas del cambio (ej: "Entregado a portería del edificio")
   - **URL de imagen** — enlace a foto de entrega (si aplica)
5. Haz clic en **"Guardar cambio de estado"**.

### Estados disponibles

| Estado | Significado | Cuándo usarlo |
|---|---|---|
| 📋 **Asignada** | Guía creada y asignada a transportador | Al registrar la guía y asignarla a un mensajero |
| 🏭 **En poder origen** | Paquete en bodega RNT listo para despacho | Cuando el paquete entra a la bodega de despacho |
| 🚛 **En viaje troncal** | En ruta (camión de larga distancia) | Cuando el camión sale hacia la ciudad destino |
| 📦 **En poder destino** | Llegó a la ciudad destino | Cuando el paquete llega a la agencia destino |
| 🏍️ **En reparto urbano** | Mensajero en camino al destinatario | Cuando el mensajero local recoge el paquete |
| ✅ **Entregado** | Entregado al destinatario | Cuando el destinatario recibe el paquete |
| 🎉 **Cumplido con firma** | Entregado con comprobante firmado | Cuando hay firma física o digital del destinatario — **requiere URL del comprobante** |
| ↩️ **En devolución** | Paquete regresando al remitente | Cuando el destinatario rechaza o no se puede entregar |
| ⚠️ **Novedad registrada** | Inconveniente durante la entrega | Dirección incorrecta, destinatario ausente, etc. — detallar en observaciones |

> Cada cambio de estado queda registrado permanentemente en el historial de la guía con fecha, hora y la operaria que lo registró.

### Campo especial — URL del comprobante (solo para "Cumplido con firma")

Cuando seleccionas **"Cumplido con firma"**, aparece automáticamente el campo **"URL del comprobante"**. Este campo es necesario para que la guía aparezca en la pestaña **Cumplidas**.

**Cómo obtener la URL del comprobante:**
1. El mensajero toma foto del comprobante firmado y la envía por WhatsApp
2. Abrir la foto en WhatsApp Web (web.whatsapp.com)
3. Hacer clic derecho en la imagen → "Copiar dirección de la imagen" (o subir a Google Drive y copiar el enlace compartido)
4. Pegar esa URL en el campo antes de guardar

Si no tienes la URL en ese momento, primero guarda el estado como **Entregado**, y cuando tengas el comprobante actualiza a **Cumplido con firma**.

---

## 6. Pestaña Cumplidas

Esta pestaña muestra las guías que tienen comprobante de entrega registrado (URL de imagen).

Desde esta pestaña puedes:
- Ver el listado de guías cumplidas
- Descargar el **PDF cumplido** de cualquier guía haciendo clic en el botón PDF de esa fila

El PDF cumplido incluye los datos completos del envío y la evidencia de entrega.

---

## 7. Consejos y Mejores Prácticas

- **Actualiza el estado en tiempo real:** Registra los cambios apenas ocurran para que los clientes vean información precisa cuando rastreen su guía.
- **Números exactos:** Ingresa el número de guía sin espacios ni caracteres adicionales.
- **Observaciones claras:** Usa el campo de observación para detallar incidencias (ej: "El destinatario no estaba. Se dejó aviso en el portero del edificio").
- **Fotos de entrega:** Cuando entregues, toma foto del paquete con el destinatario y registra la URL del comprobante al actualizar a ENTREGADO.
- **Conexión estable:** El sistema requiere internet. Trabaja desde una red estable.
- **No salir sin cerrar sesión:** Siempre usa "Cerrar sesión" antes de abandonar la computadora.

---

## 8. Solución de Problemas

### No puedo ingresar al sistema
- Verifica que estás usando el correo correcto (el que te asignó el administrador).
- Verifica la contraseña. Ten cuidado con mayúsculas y minúsculas.
- Si olvidaste tu contraseña, avisa a tu supervisor para que restablezca tu acceso.

### No veo una guía que acabo de crear
- Espera 5 segundos y presiona F5 para recargar.
- Verifica que la guía fue creada (debió aparecer un mensaje de éxito verde).

### El PDF no se descarga
- Verifica que tu navegador permite descargas automáticas.
- Intenta desde Chrome si estás usando otro navegador.

### El modal de historial no abre
- Haz clic directamente en el número de guía o en cualquier celda de la fila.
- Si persiste, recarga la página (F5) e intenta de nuevo.

### El sistema muestra un error al guardar
- Verifica que los campos obligatorios están completos (marcados con *).
- Verifica tu conexión a internet.
- Si el error persiste, toma una captura de pantalla y avisa al soporte técnico.

---

## 9. Contacto y Soporte Técnico

Para problemas técnicos con el sistema:

- **WhatsApp soporte:** +57 312 437 6616
- **Email:** servicioalcliente@rednacionaldetransportes.com
- **Horario:** Lunes a viernes, 8:00 AM – 6:00 PM

---

**Red Nacional de Transportes S.A.S.** · NIT: 901.040.715-7

*Manual de Operaria — Panel Admin v2.0 · Abril 2026*
*Este documento es confidencial y de uso exclusivo del personal autorizado de RNT.*
