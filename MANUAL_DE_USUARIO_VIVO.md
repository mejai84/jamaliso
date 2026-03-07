# 📘 Manual de Usuario Vivo — JAMALISO
> **Versión:** 2.2 Enterprise | **Estado:** Documento Vivo | **Última revisión:** 07 Marzo 2026 (14:30)

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

---

### 👨‍💼 3.3. Portal de Meseros — Waiter Pro (`/admin/waiter`)

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

### 👨‍🍳 3.4. Cocina — KDS PRO (`/admin/kitchen`)

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

### 💼 3.5. Motor de Nómina — Payroll (`/admin/payroll`)

Liquidación automática de sueldos, horas extras y comisiones de ventas.

#### Para Ejecutar el Cálculo de Nómina:
1. Vaya a **Admin → Nómina** → pestaña **"Ejecutar Nómina"**.
2. Revise el número de empleados a liquidar.
3. Presione **"INICIAR DISPERSIÓN DE PAGOS / EJECUTAR CÁLCULO"**.
4. El sistema automáticamente:
   - Busca o crea el **Periodo del mes actual**.
   - Suma las horas regulares y extras de la tabla de turnos (`shifts`).
   - Aplica el **50% de recargo** a las horas extras.
   - Calcula **comisiones automáticas** (1%) sobre todas las ventas POS del empleado en el periodo.
5. Al terminar, aparece un toast de confirmación con el **Total Neto de la Nómina**.

---

### 📦 3.6. Inventario y Recetas (`/admin/inventory`)

Control de materias primas y cálculo de Food Cost.

- **Libro de Recetas**: Cada producto del menú tiene una ficha técnica que lista exactamente qué ingredientes y qué cantidades usa. Al procesar una venta, el sistema descuenta automáticamente esos ingredientes del stock.
- **Compras a Proveedores**: Registro formal de entradas de mercancía que actualiza el stock y el costo promedio del insumo.
- **Mermas**: Registro de pérdidas (caducidad, daños). Cada merma afecta el KPI de rentabilidad visible en los Reportes.
- **Alertas de Stock Mínimo**: El sistema notifica cuando un ingrediente cae por debajo del umbral configurado.

---

### 📊 3.7. Reportes y BI (`/admin/reports`)

Inteligencia del negocio para el Administrador o Dueño.

| KPI | Descripción |
| :--- | :--- |
| **Ventas Brutas (Live)** | Total facturado en el turno o periodo seleccionado |
| **Food Cost** | % del costo de ingredientes sobre el precio de venta por plato |
| **Análisis de Mermas** | Gráfico de pérdidas financieras por categoría y semana |
| **Pareto de Productos** | El 20% de platos que generan el 80% de ingresos |
| **Vendedores Top** | Ranking de eficiencia del personal de servicio |
| **Conciliación de Caja** | Saldo teórico esperado vs saldo declarado por cajero |

---

## 4. GUÍA DE PRUEBAS (QA TEST PLAN)

Usa esta lista para verificar que todo funcione correcto después de cada actualización:

- **🔵 Ciclo de Orden VIP:**
  - [ ] Crear pedido en Mesa 5, marcar como VIP.
  - [ ] Verificar que en Cocina aparezca con borde distintivo y al inicio de la fila.
  - [ ] Verificar que suene la alerta de nueva entrada.

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
