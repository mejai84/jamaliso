# 📘 Manual de Usuario Vivo — JAMALISO
> **Versión:** 3.0 ELITE | **Estado:** Documento Vivo | **Última revisión:** 08 Marzo 2026 (Refuerzo Guardian & Ventas Online)

Este manual es la referencia oficial para todos los roles del sistema. Está divido en dos tipos de secciones:
- 🟢 **Guías Operativas**: Cómo usar cada módulo paso a paso.
- 🔵 **Guías Técnicas**: Casos especiales, soluciones y buenas prácticas.

---

## 1. INTRODUCCIÓN Y CICLO DIARIO

JAMALISO es un sistema POS y ERP modular para restaurantes. Centraliza la operación de salón, cocina, inventario y finanzas en tiempo real. Cada acción queda registrada y es trazable.

### Ciclo Diario de Operación (Resumen Rápido)

| Momento | Responsable | Acción |
| :--- | :--- | :--- |
| Apertura de Jornada | Cajero | Inicia turno y abre sesión de caja con saldo base |
| Durante el Servicio | Mesero / Cocina | Toma de comandas → Producción KDS → Despacho |
| Control del Turno | Admin / Cajero | Gastos de caja menor, arqueos parciales |
| Cierre y Auditoría | Cajero / Admin | Conteo físico ciego, generación de reportes |

---

## 2. ROLES DE USUARIO (RBAC)

El sistema usa Control de Acceso Basado en Roles. Cada usuario solo ve lo que le corresponde.

| Rol | Pantallas | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Administrador** | Todo el sistema | Auditoría, Estrategia, Nómina, Configuración |
| **Cajero** | Caja, POS, Caja Menor, Reportes | Responsabilidad de valores y arqueo |
| **Mesero** | Portal Waiter, Mapa de Mesas | Atención al cliente, comandas |
| **Cocina** | KDS, Inventario (stock) | Eficiencia de producción |
| **Repartidor** | Delivery, Tracking | Cumplimiento de entregas |

---

## 3. GUÍA COMPLETA POR MÓDULO

### 💰 3.1. Control de Caja (Cajero)

El blindaje financiero del negocio. Ninguna venta puede procesarse sin una caja abierta.

#### Al Iniciar el Día (Apertura):
1. Inicie sesión con su usuario y contraseña.
2. Vaya a **Admin → Caja** (`/admin/cashier`).
3. Presione **ABRIR CAJA**.
4. Ingrese el efectivo inicial con el que empieza el turno (Monto de Apertura).
5. Verifique que el estado cambie a **✅ SESIÓN ACTIVA**.

#### Durante el Turno (Movimientos):
- **Para registrar un gasto de caja menor** (ej: comprar bolsas): Vaya a **Caja Menor** → cree un comprobante con motivo y monto.
- **Para registrar un retiro de efectivo**: En la sesión activa, use el botón **RETIRO** e ingrese siempre un motivo descriptivo. *Nunca lo deje en blanco.*
- **Para un arqueo parcial**: Puede contar el efectivo durante el turno sin cerrarlo para verificar que todo cuadra.

5. El sistema calculará y guardará la **Diferencia / Descuadre** automáticamente.

#### 🔄 Cierre con Traspaso (Mesas Abiertas):
Si el turno termina pero hay mesas aún consumiendo, use el botón **CERRAR PENDIENTES (TRASPASO)**:
1. Ingrese el efectivo físico en gaveta.
2. Seleccione a la **Cajera Entrante** que recibirá su turno.
3. El sistema generará un acta digital con el snapshot de mesas y pedidos en cocina.
4. **Cajera Entrante**: Al loguearse, el sistema le pedirá su **Firma Digital** (Nombre) para aceptar el cargo. Una vez aceptado, las mesas pasan a su responsabilidad y su saldo inicial se autocompleta con lo declarado por la saliente.

> [!TIP]
> Use el traspaso de turno cuando el restaurante deba seguir operando sin solución de continuidad durante el cambio de personal.

> [!CAUTION]
> Los comprobantes de Caja Menor son **inmutables** una vez guardados. Si se equivocó, haga un **Depósito de Caja** para reversar el monto, cree uno nuevo y deje nota en la descripción explicando la corrección.

---

### 🗺️ 3.2. Mapa de Mesas (Mesero / Admin)

Réplica visual de la distribución física del restaurante.

- **Pulso Rojo (⚠️ Alerta de Servicio)**: Si una mesa lleva más de **20 minutos** esperando su pedido, emitirá un pulso rojo visible para que el capitán tome acción.
- **Pedidos por QR (Auto-servicio)**: El cliente escanea el código en su mesa. Al enviar el pedido, este aparece en el **KDS de Cocina** inmediatamente. La mesa en el mapa cambiará a **Naranja (Ocupada)** automáticamente.
- **Administración del plano**: El administrador puede reorganizar mesas con **Drag & Drop**, cambiar su forma y definir zonas.

### 📅 3.3. Libro de Reservas — JAMALI GUEST BOOK (`/admin/reservations`)
Gestión premium de la agenda de clientes.

#### Flujo de Reserva:
1.  **Desde la Web Pública**: El cliente presiona **"RESERVAR MESA"**, llena sus datos (Nombre, WhatsApp, Fecha, Hora, Notas) y envía la solicitud.
2.  **En el Admin**: La reserva aparece en estado **"PENDIENTE"** con una alerta en el dashboard.
3.  **Confirmación**: El administrador revisa la disponibilidad y presiona el botón de **[CONFIRMAR]** (ícono verde).
4.  **Concierge IA**: El sistema analiza la ocupación estimada y genera alertas si se detecta una noche de alta demanda (Overbooking detection).

---

### 👨‍💼 3.4. Portal de Meseros — Waiter Pro (`/admin/waiter`)

Herramienta de alta velocidad para el salón. Optimizada para móvil y tablet. Sin papel, sin radio.

> 📄 **Manual completo:** `docs/modulos/MANUAL_WAITER_PRO.md`

#### Las 3 Vistas del Portal:

| Vista | Cuándo aparece | Función |
| :--- | :--- | :--- |
| **Gestión de Salón** | Al entrar | Mapa de mesas con estado en tiempo real |
| **Opciones de Mesa** | Al tocar mesa ocupada | Menú de acciones avanzadas |
| **Tomar Pedido** | Al tocar mesa libre o "Adicionar" | Catálogo + Carrito |

#### Indicadores del Mapa de Mesas:
- 🟢 **Verde**: Mesa libre y disponible
- 🟠 **Naranja**: Mesa ocupada, orden en preparación
- 🟢 **Borde verde pulsante**: ¡Orden **READY**! Los platos están listos en cocina
- 🔴 **Borde rojo pulsante**: Orden con **+20 minutos** sin resolver — crítico
- ⭐ **Borde dorado**: Orden **VIP / Prioritaria**

#### Para Tomar un Pedido Paso a Paso:
1. Toca la mesa libre del cliente en el mapa.
2. Usa la **Barra Quick-Add** (los 5 productos más rápidos) o el catálogo filtrado por categoría.
3. En el carrito, toca los chips de **Modificadores Rápidos**: `SIN CEBOLLA`, `TÉRMINO MEDIO`, `EXTRA QUESO`, etc.
4. Escribe notas libres si el cliente tiene indicaciones especiales.
5. Ajusta cantidades con `+` / `-`.
6. (Opcional) Activa el toggle **PEDIDO VIP** para prioridad absoluta en cocina.
7. Presiona **MARCHAR A COCINA** — la comanda vuela al KDS en tiempo real.

#### Acciones Avanzadas (mesa ocupada):
| Acción | Función |
| :--- | :--- |
| **Adicionar Ítems** | Agrega más productos a la orden ya enviada |
| **Ver Pre-Cuenta** | Muestra borrador del ticket al cliente (no es factura válida) |
| **Dividir Cuenta** | Separa ítems específicos en una nueva orden paralela |
| **Unir Mesas** | Fusiona la orden de dos mesas ocupadas en una sola |
| **Transferir Ítems** | Mueve un producto específico de una mesa a otra |
| **Pagar Cuenta** | Redirige al módulo POS para procesar el cobro |
| **Entregar al Cliente** | Marca la orden como entregada (solo visible si está en READY) |
| **Liberar Mesa** | Pone la mesa en verde (solo si el pago ya fue procesado) |

---

### 👨‍🍳 3.5. Cocina — KDS PRO (`/admin/kitchen`)

Monitor táctil que reemplaza las comandas en papel. Sincronización en tiempo real con el portal del mesero. El cocinero trabaja desde su estación sin papel ni gritos.

> 📄 **Manual completo:** `docs/modulos/MANUAL_KDS_COCINA.md`

#### El Tablero Kanban de 3 Columnas:

| Columna | Estado | Significado |
| :--- | :--- | :--- |
| **PEDIDOS PENDIENTES** | `pending` | Orden recibida, sin tocar aún |
| **ÓRDENES EN MARCHA** | `preparing` | Un cocinero la inició |
| **LISTO / ENTREGA** | `ready` | Completa, esperando al mesero |

#### Semáforo de Urgencia (borde de tarjeta):
- 🟢 **Verde** → 0–4 min | Normal
- 🟠 **Naranja** → 5–9 min | Alerta temprana
- 🔴 **Rojo parpadeante** → 10+ min | **CRÍTICO** — suena alerta sonora cada 30 seg

#### Flujo de Producción Paso a Paso:
1. Mesero envía pedido → suena **ding suave** → nueva tarjeta en **PENDIENTES**.
2. Toca **"Ver Pedido Completo"** para expandir y ver ítems, notas y modificadores.
3. Toca **[INICIAR →]** en cada ítem que empiezas a preparar.
   - ⚡ **Automatización**: Al iniciar el primer ítem, la orden entera pasa sola a **EN MARCHA**.
4. Cuando un ítem está listo, toca **[✓ LISTO]** → queda tachado.
5. Cuando todos los ítems están listos, toca **"MARCAR TODO LISTO"** → tarjeta pasa a **LISTO**.
6. El mesero recoge los platos y confirma entrega → **tarjeta desaparece**.

#### Notas de Ítems y Notas de Orden:
- **Bloque naranja** bajo un ítem: nota especial del cliente (ej: `SIN CEBOLLA`, `TÉRMINO MEDIO`).
- **Bloque ámbar** al final de la tarjeta: nota general de la mesa (ej: `Cliente alérgico al gluten`). **Nunca ignorarla.**

#### Herramientas del Encabezado:
| Botón | Función |
| :--- | :--- |
| **Filtro de Estaciones** | Ver solo los ítems de tu área (Parrilla, Bebidas, Entradas, etc.) |
| **RESUMEN** | Panel lateral con conteo total de ítems pendientes (útil para cocinar en lote) |
| **STOCK** | Modal para marcar/desmarcar productos AGOTADOS al instante |
| **🔊 / 🔇** | Activar o silenciar alertas sonoras |

#### Automatizaciones Inteligentes:
- Si tocas **INICIAR** en cualquier ítem de una orden `pending` → la orden pasa automáticamente a `preparing`.
- Si hay ítems sin iniciar dentro de una orden en marcha → aparece **banner naranja de advertencia**.
- Las órdenes con campo `priority: true` → se muestran **primero** con insignia dorada **⭐ PRIORIDAD VIP**.

---

### 🖥️ 3.6. Terminal POS — Venta Directa (`/admin/pos`)

El corazón operativo para cobros rápidos y ventas de mostrador. Optimizada bajo la estética **Pixora Light** para máxima legibilidad y velocidad.

#### ¿Para qué es este módulo?
Diseñado para la **barra, counter o caja principal**. Su objetivo es procesar transacciones en segundos, ideal para clientes que pagan al pedir o para liquidar cuentas de salón enviadas por los meseros.

#### Funciones de Poder:
1.  **Venta Atómica (Seguridad Financiera):** Cada venta se procesa como una operación única. Si falla el internet en el último milisegundo, el sistema no descuenta inventario ni registra el pago a medias, evitando descuadres de caja.
2.  **Buscador Inteligente:** Filtra por nombre, categoría o escanea códigos de barras para agregar ítems al carrito instantáneamente.
3.  **Cálculo Automático de Impuestos:** Basado en la configuración regional (ej: IVA 19%, Impoconsumo 8%), el sistema desglosa los valores sin intervención humana.
4.  **Botón de Pago Rápido (Cash):** Un solo toque para ventas en efectivo, con cálculo de cambio opcional.

#### Flujo de Operación:
1.  **Selección:** Elige productos del catálogo lateral o usa el buscador superior.
2.  **Revisión:** Ajusta cantidades en el **Resumen de Orden**.
3.  **Pago:**
    - 💵 **Efectivo**: Toca "PAGAR AHORA" para procesar bajo `CASH`.
    - 💳 **Digital/Tarjeta**: Toca el icono de smartphone para registrar pago con datáfono o QR.
4.  **Cierre:** El sistema genera un **Ticket Térmico** automático y limpia el carrito para el siguiente cliente.

> [!TIP]
> Si intentas vender y el sistema te bloquea, verifica que hayas realizado la **Apertura de Caja** en el módulo de Control de Caja. El POS requiere una sesión activa para rastrear el dinero.

---

### 🌐 3.7. Presencia Digital — Ventas Online (`/admin/online-sales`)

Este módulo es tu centro de control para internet. Aquí decides qué ve el mundo y cómo te compra.

#### 🔋 Activación y Modos:
1. **Interruptor Maestro:** Arriba a la derecha activa o desactiva tu sitio web en tiempo real.
2. **Modo de Negocio:**
   - **SOLO MENÚ (MESA):** Los clientes ven tu carta, pero no pueden pedir. Ideal para QR en mesa informativos.
   - **VENTA TOTAL (HÍBRIDO):** Permite recibir pedidos para Domicilio y Recogida en local.

#### 🎨 Identidad Visual (Slot Identity System):
JAMALISO usa un sistema de "Slots" que permite que cada restaurante tenga una identidad única sin romper la estructura técnica.
- **Hero Master:** Configura el video o imagen de alto impacto que ocupa la pantalla inicial.
- **Eslogan Dinámico:** Define la frase de marca que aparece sobre el Hero.
- **Paleta de Colores (Slot UI):** Define el color primario y secundario que se aplicará a botones, enlaces y acentos en toda la web.
- **Tipografía Slot:** Elige el estilo de fuente que mejor represente tu marca (Elegante, Moderna, Rústica).
- **Logotipo Local:** Carga tu logo en alta resolución para el encabezado y el favicon.

#### 🔗 Integración Social y SEO:
- **Redes Sociales:** Vincula Instagram, WhatsApp y Facebook. El sistema generará botones de "Flotantes" en la web para contacto directo.
- **Optimización Meta:** El sistema genera automáticamente los tags para que, al compartir tu link en WhatsApp, aparezca la imagen de tu restaurante y el eslogan correctamente.

#### 💳 Central de Pagos (Mercado Pago):
- Vincula tu cuenta de **Mercado Pago** para recibir pagos con tarjeta de crédito, débito y transferencias locales (PSE/Pix/etc) directamente a tu billetera.
- El sistema valida el pago mediante **Webhooks** (notificaciones automáticas de MP) antes de enviar la orden a producción.

---

### 🛡️ 3.8. JAMALI GUARDIAN — App del Propietario (`/admin/guardian`)

Este es el módulo más sensible y potente del ecosistema. Está diseñado exclusivamente para **Propietarios y Desarrolladores** (No accesible para Managers o Cajeros). Es "El Ojo del Dueño" en su bolsillo.

#### 🧠 ¿Qué es JAMALI GUARDIAN?
Es una interfaz móvil de alta seguridad que utiliza **Inteligencia Predictiva** y **Control Remoto** para blindar la operación contra fraudes, errores humanos y desabastecimiento.

#### ⚡ Centro de Autorización Remota:
Cuando un mesero o cajero intenta una acción que compromete el dinero (como anular un ticket ya cerrado o aplicar un descuento mayor al 30%):
1. El sistema bloquea la acción en la sucursal.
2. Una **Alerta Roja** vuela instantáneamente a tu JAMALI GUARDIAN.
3. Desde tu teléfono, verás la descripción del evento y dos botones: **[AUTORIZAR]** o **[RECHAZAR]**.
4. Al presionar, la sucursal recibe tu decisión en tiempo real. **Tú tienes la llave final del dinero.**

#### 🧠 Inteligencia Predictiva (IA Risk Score):
El sistema analiza los últimos 30 días de comportamiento de cada empleado y genera un **Score de Sospecha (0-100%)**:
- **Ratio de Anulación (50 pts)**: ¿Este mesero anula más pedidos que sus compañeros?
- **Abuso de Descuentos (30 pts)**: ¿Usa los descuentos para "regalar" productos a conocidos?
- **Historial Forense (20 pts)**: ¿Ha tenido alertas previas en el log de auditoría?
- **Alerta de Ráfaga (Burst Detection)**: Si alguien hace 3 anulaciones en menos de 2 horas, el sistema te notificará de inmediato por posible "fuga de efectivo" activa.

#### 🏢 Control Multi-Sede Global:
Si tienes varios restaurantes, usa el **Selector de Sede** en la parte superior. Al tocar una sede:
- Verás los **KPIs Reales** (Ingreso Neto, Margen Real, Labor Cost y Mermas) de esa sucursal específica.
- Podrás ver quién es el empleado de mayor riesgo en esa sucursal hoy.
- Recibirás las alertas de esa sede en tu feed de auditoría.

#### 📦 Watchdog de Inventario:
El Guardian vigila tu bodega 24/7. Si un insumo crítico (ej: Carne, Cerveza, Salmón) cae por debajo del stock mínimo, recibirás una notificación de **STOCK CRÍTICO** para que puedas gestionar la compra antes de perder ventas.

#### 📊 Dashboards en Vivo:
- **Margen Real**: Ingreso Neto (-) Costo de Insumos (-) Costo Laboral. Es tu utilidad pura en ese momento del día.
- **Labor Cost**: El sistema calcula cuánto te cuesta el personal que está marcado con "Entrada" en ese momento comparado con las ventas.

Ajustes estructurales del restaurante. **Crucial para la legalidad y moneda.**

#### 🗺️ País y Moneda:
- Al seleccionar tu **País** (Colombia, México, España, USA), el sistema **auto-selecciona la moneda** y el símbolo correspondiente (COP, MXN, EUR, USD).
- Esto ajusta automáticamente el formato de precios en el POS, el Menú Digital y los Reportes.

#### 🏢 Datos de Empresa:
- **NIT/RUT/RFC:** Edita tu identificador fiscal para que aparezca en los tickets de venta.
- **Dirección y Teléfono:** Estos datos se sincronizan con el pie de página de tu web y el encabezado de las facturas.

---

### 💼 3.9. JAMALI PAYROLL PRO (`/admin/payroll`)

El sistema ha evolucionado a un motor legal de grado enterprise, diseñado para cumplir con la normativa **Colombiana (DIAN/UGPP)** y estándares internacionales **(IFRS/NIIF)**.

#### 1. Gestión de Contratos y Hoja de Vida:
En la pestaña **"Sueldos & Contratos"**, puede configurar el perfil legal de cada colaborador:
- **Tipo de Contrato**: Término Fijo, Indefinido, Obra o Labor, Aprendizaje.
- **Sueldo Base Mensual**: Define la base de cálculo (SMLV 2026 pre-cargado).
- **Seguridad Social**: Define fondos de Salud, Pensión, ARL (Riesgo 1 a 5) y Caja de Compensación.
- **Auxilio de Transporte**: El sistema detecta automáticamente si el empleado devenga menos de 2 SMLV para inyectar el subsidio legal.

#### 2. Ejecución de Nómina Legal:
1. Vaya a la pestaña **"Ejecutar Nómina"**.
2. Presione **"EJECUTAR CÁLCULO PRO"**.
3. El motor ACID realizará miles de cálculos secundarios:
   - **Deducciones de Ley**: Descuento automático del 4% para Salud y 4% para Pensión.
   - **Recargos Prestacionales**: Cálculo exacto de Horas Extra (Diurnas/Nocturnas) y Recargos Dominicales basados en la tabla de turnos.
   - **Costo Real de Empresa**: El sistema calcula los aportes patronales (Pensión, ARL, CCF) y Parafiscales (SENA, ICBF) si aplica.

#### 3. Provisiones IFRS (Salud Financiera):
JAMALI PAYROLL PRO no solo le dice cuánto debe pagar hoy, sino cuánto está acumulando de deuda por:
- **Prima de Servicios** (8.33%)
- **Cesantías** (8.33%) e **Intereses de Cesantías** (1% mensual)
- **Vacaciones** (4.17%)
Esto le permite al dueño conocer la **Rentabilidad Real** de su negocio después de todas las cargas prestacionales ocultas.

#### 4. Sincronización DIAN:
El sistema está optimizado para generar el soporte de **Nómina Electrónica**, marcando cada registro con los estándares requeridos por la autoridad tributaria.

---

### 📦 3.10. Inventario y Recetas (`/admin/inventory`)

Control de materias primas y cálculo de Food Cost.

- **Libro de Recetas**: Cada producto del menú tiene una ficha técnica que lista exactamente qué ingredientes y qué cantidades usa. Al procesar una venta, el sistema descuenta automáticamente esos ingredientes del stock.
- **Compras a Proveedores**: Registro formal de entradas de mercancía que actualiza el stock y el costo promedio del insumo.
- **Mermas**: Registro de pérdidas (caducidad, daños). Cada merma afecta el KPI de rentabilidad visible en los Reportes.
- **Alertas de Stock Mínimo**: El sistema notifica cuando un ingrediente cae por debajo del umbral configurado.

---

### 📊 3.11. Reportes y BI (`/admin/reports`)

Inteligencia del negocio para el Administrador o Dueño.

| KPI | Descripción |
| :--- | :--- |
| **Ventas Brutas (Live)** | Total facturado en el turno o periodo seleccionado |
| **Food Cost** | % del costo de ingredientes sobre el precio de venta por plato |
| **Análisis de Mermas** | Gráfico de pérdidas financieras por categoría y semana |
| **Pareto de Productos** | El 20% de platos que generan el 80% de ingresos |
| **Conciliación de Caja** | Saldo teórico esperado vs saldo declarado por cajero |

---

### 📤 3.12. Data Flow: Importación y Exportación (`/admin/...`)

JAMALI OS permite la gestión masiva de datos para acelerar la puesta en marcha y auditoría externa. Esta función está disponible en los módulos de **Inventario**, **Productos**, **Clientes** y **Empleados**.

#### 🔗 Exportación de Datos (Respaldo):
1. En el encabezado de cualquier módulo compatible, presione **EXPORTAR (CSV)**.
2. El sistema generará un archivo compatible con Excel con todos los registros actuales.
3. Use este archivo para auditorías contables o cambios masivos fuera del sistema.

#### 📥 Importación Masiva (Wizard de Mapeo):
Si tiene una lista de 500 productos o ingredientes en Excel, no los cree uno a uno. Use el **Protocolo de Importación**:
1. Guarde su archivo Excel como **CSV (separado por comas)**.
2. En JAMALI OS, presione **IMPORTAR (CSV)**. Se abrirá el **Asistente de Importación Pixora**.
3. **Paso 1: Carga**: Arrastre su archivo al área designada.
4. **Paso 2: Mapeo**: El sistema le mostrará los campos que necesita (ej: Nombre, Precio). Seleccione qué columna de su archivo corresponde a cada campo.
5. **Paso 3: Previsualización**: Revise las primeras filas para asegurar que los datos coinciden.
6. **Paso 4: Ejecutar**: Presione "Ejecutar Importación". El sistema sincronizará los datos con el Kernel en segundos.

> [!TIP]
> Use la importación masiva durante la **Inauguración** del restaurante para cargar todo su menú e inventario inicial en menos de 5 minutos.

---

## 4. GUÍA DE PRUEBAS (QA TEST PLAN)

Usa esta lista para verificar que todo funcione correcto después de cada actualización:

- **🔵 Ciclo de Orden VIP:**
  - [ ] Crear pedido en Mesa 5, marcar como VIP.
  - [ ] Verificar que en Cocina aparezca con borde distintivo y al inicio de la fila.
  - [ ] Verificar que suene la alerta de nueva entrada.

- **🔵 Pruebas Automatizadas (Playwright & Jest):**
  - El sistema cuenta con pruebas E2E y Unitarias automatizadas. Se recomienda a los administradores de TI ejecutar `npm run test:e2e` antes de cada gran actualización para validar los flujos de POS, Cocina y Caja simultáneamente.

- **🔵 Prueba de División de Cuenta:**
  - [ ] Crear orden con 4 productos en Mesa 2.
  - [ ] Usar "Dividir Cuenta" y mover 2 productos a nueva cuenta.
  - [ ] Verificar que los totales de ambas cuentas sean correctos.

- **🔵 Prueba de Stock Crítico:**
  - [ ] Ir al KDS y marcar un producto como AGOTADO.
  - [ ] Ir al Portal de Mesero y verificar que el producto aparezca gris y bloqueado.

- **🔵 Prueba de Alerta de Tiempo:**
  - [ ] Abrir una cuenta y esperar 20 min (o modificar en DB para prueba rápida).
  - [ ] Verificar que la mesa empiece a "pulsar" en color rojo.

- **🔵 Prueba de Cierre Ciego:**
  - [ ] Abrir caja con $100.000 base.
  - [ ] Registrar venta de $50.000.
  - [ ] Cerrar caja ingresando un monto diferente.
  - [ ] Verificar que el sistema registre el descuadre.

---

## 5. CASOS COMUNES Y SOLUCIONES

| Problema | Solución |
| :--- | :--- |
| El producto se agotó en mitad del turno | En KDS, presione el botón de Estado junto al producto → **AGOTADO**. Se bloquea inmediatamente para los meseros. |
| Se ingresó mal un gasto en Caja Menor | Son inmutables. Haga un **Depósito de Caja** para reversar, cree uno nuevo correcto y deje nota en la descripción. |
| El KDS no muestra nuevas órdenes | Refresque el monitor. Verifique su conexión a internet. Supabase Realtime requiere conexión estable. |
| El mesero cerró sesión en medio del turno | Las órdenes activas permanecen en la BD. Puede retomarlas iniciando sesión nuevamente desde el portal. |

---

## 6. BUENAS PRÁCTICAS OPERATIVAS

- **Justificación siempre**: Nunca registre un retiro de caja con el campo "Descripción" vacío. Facilita la auditoría mensual.
- **Seguridad**: No comparta contraseñas ni PINes. Cada acción queda grabada con el nombre del usuario en los logs de auditoría.
- **Revisión periódica del Food Cost**: Revise semanalmente el porcentaje de costo de ingredientes por plato. Si supera el 33% del precio de venta, alerte al proveedor o ajuste precios.
- **Stock al inicio del turno**: El Jefe de Cocina debe verificar el stock crítico antes de abrir el servicio para evitar frustraciones con platos agotados a media jornada.

---

> [!IMPORTANT]
> **Regla de Oro del Sistema:** Los módulos de Frontend NUNCA se comunican directamente entre sí. Todo cambio de estado (pedido listo, stock agotado, caja cerrada) se escribe en la Base de Datos (PostgreSQL) y los otros módulos lo reciben a través de **Supabase Realtime** de forma automática.

> **Actualización del Manual:** Este documento se actualiza automáticamente cada vez que se implementa una nueva funcionalidad. La fecha de última revisión al inicio indica qué tan reciente está.
