# 📘 Manual de Usuario Vivo — JAMALISO
> **Versión:** 2.1 Enterprise | **Estado:** Documento Vivo — Actualización Continua | **Última revisión:** 07 Marzo 2026

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

#### Al Finalizar el Día (Cierre Ciego):
1. Asegúrese de que todos los pedidos pendientes estén facturados o cancelados.
2. En **Control de Caja**, presione **CERRAR CAJA**.
3. Cuente el dinero físico que tiene en la gaveta.
4. Ingrese el valor en **"Efectivo Contado"** (el sistema no le muestra cuánto espera hasta que usted ingrese el suyo).
5. El sistema calculará y guardará la **Diferencia / Descuadre** automáticamente para la auditoría del dueño.

> [!CAUTION]
> Los comprobantes de Caja Menor son **inmutables** una vez guardados. Si se equivocó, haga un **Depósito de Caja** para reversar el monto, cree uno nuevo y deje nota en la descripción explicando la corrección.

---

### 🗺️ 3.2. Mapa de Mesas (Mesero / Admin)

Réplica visual de la distribución física del restaurante.

- **En la operación diaria**: El mesero ve el mapa al entrar. Las mesas en **verde** están libres; en **rojo/naranja**, ocupadas con tiempo activo.
- **Pulso Rojo (⚠️ Alerta de Servicio)**: Si una mesa lleva más de **20 minutos** esperando su pedido, emitirá un pulso rojo visible para que el capitán tome acción.
- **Administración del plano**: El administrador puede ir a la edición del mapa para reorganizar mesas con **Drag & Drop**, cambiar su forma (circular, cuadrada) y definir zonas (Terraza, Salón).

---

### 👨‍💼 3.3. Portal de Meseros — Waiter Pro (`/admin/waiter`)

Herramienta de alta velocidad y baja fricción para el salón. Diseñada para tablets y teléfonos.

#### Para Tomar un Pedido Paso a Paso:
1. Ingrese al portal con su **PIN de 4 dígitos** (no requiere contraseña completa).
2. Seleccione una mesa libre en el mapa.
3. Use la **Barra de Favoritos (Quick-Add)** (parte superior) para agregar los productos más populares con un toque.
4. Use el buscador para platos específicos.
5. Toque un producto ya en el carrito y aplique **Modificadores Rápidos** (ej: SIN CEBOLLA, TÉRMINO MEDIO, EXTRA QUESO).
6. Presione **ENVIAR A COCINA / MARCHAR**. La orden vuela al KDS.

#### Funciones Avanzadas de Cuenta:
- **Dividir Cuenta (Split Check)**: Seleccione ítems específicos del carrito y asígnelos a una nueva cuenta separada para uno o más clientes.
- **Unir Mesas (Merge)**: Fusiona dos mesas en una sola cuenta. La mesa de origen queda liberada.
- **Transferir Ítem**: Mueve un producto de una mesa a otra por error, sin cancelar el pedido completo.
- **Pre-Cuenta**: Genera un borrador de factura con estética de ticket térmico para mostrar al cliente antes del cobro formal.

---

### 👨‍🍳 3.4. Cocina — KDS PRO (`/admin/kitchen`)

Monitor táctil que reemplaza las comandas en papel. El cocinero no necesita retirarse de su estación.

#### Interfaz del KDS:
- **Tarjetas de Pedido**: Cada orden es una tarjeta con: número de mesa, mesero, lista de ítems y tiempo transcurrido.
  - 🟡 **Amarillo**: Orden reciente (< 10 min).
  - 🟠 **Naranja**: Alerta (entre 10 y 20 min).
  - 🔴 **Rojo parpadeante**: Crítico (> 20 min). Suena alerta intensa.
- **Órdenes VIP / Urgente**: Borde azul eléctrico, se desplazan al inicio de la fila automáticamente.

#### Flujo de Producción Paso a Paso:
1. Nueva orden entra → suena *ding suave* → aparece tarjeta en amarillo.
2. El cocinero toca la tarjeta y presiona **PREPARANDO** → el mesero ve la actualización en su portal.
3. Al terminar, presiona **LISTO** → la tarjeta cambia a verde y el mesero recibe notificación.
4. El mesero lleva el plato y presiona **ENTREGADO** → la tarjeta desaparece del KDS.

#### Herramientas Adicionales del KDS:
- **Resumen de Producción**: Botón lateral que muestra el total acumulado de todos los ítems pendientes (ej: "15 Hamburguesas, 8 Papas"). Útil para preparar en lote.
- **Gestión de Stock Crítico**: Botón para marcar un producto como **AGOTADO** directamente desde cocina. El sistema lo bloquea instantáneamente en el portal de meseros.
- **Filtro por Estación**: Cada pantalla puede configurarse para mostrar solo su área (Parrilla, Bebidas, Entradas).

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
