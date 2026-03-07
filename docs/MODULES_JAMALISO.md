# Módulos del Sistema - JAMALI OS

JAMALISO está construido con una arquitectura modular. Cada módulo es semi-independiente pero comparte la misma base de datos (PostgreSQL) y el mismo proveedor de autenticación y multi-tenencia (Supabase). 

A continuación, se detalla la funcionalidad core y las tablas que componen cada módulo. Esta es la guía principal para entender qué partes de la base de datos se ven afectadas cuando un usuario realiza una acción en el sistema.

---

## 1. Módulo POS (Punto de Venta)
Es el corazón operativo del restaurante. Permite la toma ágil de pedidos.

**Rutas Frontend:** `/src/app/admin/pos`, `/src/app/admin/waiter`

**Funciones Principales:**
- Abrir mesa y asignarla a un mesero.
- Agregar productos al pedido en tiempo real.
- Modificar componentes de un producto (sin cebolla, extra queso).
- Enviar pedido a cocina (KDS).
- Dividir cuentas y procesar pagos múltiples.
- Cerrar mesa y liberar el espacio.

**Tablas Afectadas:**
- `orders`: Cabeza del pedido, almacena el estado y el total.
- `order_items`: Los productos individuales dentro del pedido.
- `sale_payments`: Registra cómo se pagó la orden (Efectivo, Tarjeta, Transferencia).
- `tables`: Se actualiza su estado (ocupada, libre).

---

## 2. Módulo Inventario y Recetas (ERP Culinario)
Control estricto de los costos y existencias.

**Rutas Frontend:** `/src/app/admin/inventory/*`

**Funciones Principales:**
- Entradas de mercancía (Compras a proveedores).
- Salidas por ajustes u otros motivos.
- Registro de mermas valorizadas en dinero real.
- Creación de Escandallos (Recetas) para proyectar el Food Cost.
- Descuento automático (bombeo en reversa) de insumos cuando se vende en el POS.

**Tablas Afectadas:**
- `ingredients`: Catálogo maestro de materia prima.
- `inventory_movements`: Kardex y auditoría de cambios.
- `purchases` y `purchase_items`: Control de compras y gastos asociados.
- `inventory_waste` (o `waste_reports`): Pérdidas registradas con su motivo.
- `recipes` y `recipe_items`: Fórmula para armar un producto de venta.

---

## 3. Módulo KDS (Kitchen Display System)
Control central para chefs y cocineros.

**Rutas Frontend:** `/src/app/admin/kitchen`

**Funciones Principales:**
- Visualizar pedidos entrantes en tiempo real (vía Supabase Realtime).
- **Alertas Sonoras Inteligentes:** Sonidos distintivos para nuevos pedidos y alertas críticas para pedidos retrasados (>10 min).
- **Resumen de Producción Consolidado:** Vista agrupada de todos los ítems pendientes para preparación masiva.
- **Gestor de Stock Crítico:** Capacidad de marcar productos como "Agotados" directamente desde la cocina para sincronizar con meseros.
- **Prioridad VIP:** Resaltado visual diferenciado para comandas marcadas como urgentes o prioritarias.
- **Estimador de Tiempo Dinámico:** Seguimiento de tiempo real vs tiempo objetivo de preparación por producto con alertas visuales.
- Marcar productos como "Preparando" o "Listo".
- Medir los tiempos de preparación para el Dashboard Financiero.

**Tablas Afectadas:**
- `orders` y `order_items`: Se alteran sus columnas de `status` a PREPARING o DELIVERED_TO_TABLE.
- `products`: Actualización de la columna `is_available` mediante el Gestor de Stock.

---

## 3.1. Módulo Pedidos QR (Auto-servicio)
Extensión del POS para el cliente final.

**Rutas Frontend:** `/src/app/[slug]/mesa/[mesa]`

**Funciones Principales:**
- Escaneo de mesa vinculada a un restaurante específico (`slug`).
- Selección de productos y envío directo a la cocina.
- Cambio automático de estado de mesa a `occupied`.

**Tablas Afectadas:**
- `orders` y `order_items`: Se insertan nuevos registros.
- `tables`: Se actualiza el `status`.

---

## 4. Módulo Caja y Finanzas
Prevención de fraude y cierres de turno.

**Rutas Frontend:** `/src/app/admin/cashier/*`, `/src/app/admin/petty-cash`

**Funciones Principales:**
- Declarar base de efectivo al abrir turno.
- Registrar movimientos de entrada/salida (pagos a proveedores).
- **Traspaso de Turno (Handoff)**: Permite cerrar sesión aun con mesas abiertas, transfiriendo la responsabilidad a la siguiente cajera con firma digital.
- Realizar el Cierre Ciego al finalizar el día (el cajero no sabe cuánto espera el sistema).
- Comparativo entre ventas del sistema vs dinero reportado.

**Tablas Afectadas:**
- `cashbox_sessions`: Contrato de responsabilidad del turno actual. Columnas para handoff: `closed_with_pending`, `transferred_to`.
- `shift_handoffs`: Nueva tabla para documentar el traspaso (Snapshots de mesas y órdenes).
- `cash_movements`: Trazabilidad granular del dinero que sale o entra.
- `petty_cash_vouchers`: Egresos formales (recibos).

---

## 5. Módulo Reportes y B.I.
Inteligencia artificial y visualización de datos.

**Rutas Frontend:** `/src/app/admin/reports`

**Funciones Principales:**
- Dashboard general de ventas, tickets promedio y proyecciones IA.
- Control del Food Cost real (Comparativo de Precio de Venta vs Costo Real).
- Análisis visual de impacto económico por Mermas.

**Tablas Afectadas (Solo Lectura):**
- Lee principalmente información consolidada de `orders`, `sale_payments`, `inventory_waste` y `recipe_items`.

---

## 6. Módulo Logística y Delivery
Gestión para envíos propios.

**Rutas Frontend:** `/src/app/admin/delivery/*`

**Funciones Principales:**
- Despacho de órdenes hacia domiciliarios (Drivers).
- Seguimiento de tiempos de viaje y estatus de entrega.
- Liquidación final con el repartidor.

**Tablas Afectadas:**
- `delivery_drivers`: Gestión de motorizados.
- `order_deliveries`: Vínculo entre un pedido y el viaje logístico.
- `delivery_tracking`: Tiempos y GPS (si aplica).

---

## 7. Módulo Partner Master Hub (B2B Reseller)
El panel de control supremo para el dueño del código (Tu Panel).

**Rutas Frontend:** `/src/app/admin/partners`

**Funciones Principales:**
- Reclutar y gestionar socios distribuidores (Partners).
- Monitorear el MRR (Ingreso Mensual Recurrente) de la red.
- Ver estadísticas consolidadas de restaurantes por partner.

**Tablas Afectadas:**
- `tenants`: Maestro de distribuidores.
- `restaurants`: Lectura de sucursales vinculadas.

---

## 8. Módulo Configuración de Identidad (White-Label)
Permite a cada restaurante o partner personalizar su "Aura Visual".

**Rutas Frontend:** `/src/app/admin/settings` (Pestaña Branding)

**Funciones Principales:**
- Carga de logos corporativos.
- Selección de color primario de marca (Hexadecimal).
- Previsualización en vivo de la interfaz.

**Tablas Afectadas:**
- `restaurants`: Se actualiza `primary_color`, `logo_url`, `name` y `subdomain`.

---

## 9. Módulo Motor de Nómina (Payroll Engine)
Automatización financiera del personal y cálculo de incentivos conectando POS y Turnos.

**Rutas Frontend:** `/src/app/admin/payroll`

**Funciones Principales:**
- Finalización forzosa de turnos activos (Shifts).
- Creación de periodos automáticos (Mes o Quincena).
- Cálculo en bloque de Horas Regulares y Extras (con recargo).
- Inyección de Comisiones Automáticas (Lectura de `pos_sales`).
- Dashboard en tiempo real de contratos, salarios base e IBC estimado.

**Tablas Afectadas:**
- `payroll_runs` y `payroll_items`: Registros contables definitivos de la nómina calculada.
- `payroll_periods`: Ciclos de pago.
- `shifts`: Actualizados al cruzarlos.

---

> **Nota para Desarrolladores:** La regla de oro en JAMALISO es que los módulos de Frontend NUNCA deben puentear componentes unos con otros; cualquier cambio de estado transversal se hace escribiendo en la Base de Datos, y el otro módulo debe escuchar esos cambios mediante *Supabase Realtime* o revalidación de cache (Next.js Data Fetching).
