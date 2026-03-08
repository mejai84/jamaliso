# Estructura de Base de Datos - JAMALI OS

La base de datos de JAMALI OS está construida sobre PostgreSQL, usando Supabase. Está diseñada para manejar alto volumen transaccional de múltiples sucursales/restaurantes de forma concurrente, segura (usando Row Level Security) y con referencialidad íntegra.

Se divide lógicamente en los siguientes subsistemas principales:

## 1. Subsistema Core y Tenencia Múltiple (Multi-Tenant)
La estructura principal sobre la cual todo pivotea.

| Tabla | Función | Descripción |
| :--- | :--- | :--- |
| `tenants` | **Partner / Reseller** | Entidad de más alto nivel para Marca Blanca. Almacena: nombre del distribuidor, logo corporativo, color primario del Partner, subdominio maestro y plan de suscripción B2B. |
| `restaurants` | **Sucursal / Cliente** | Datos de las sucursales. Cada restaurante pertenece a un `tenant_id`. Atributos clave: `name`, `subdomain`, `logo_url`, `primary_color`. Nuevos campos: `is_web_active` (boolean), `web_mode` (menu/ecommerce), `instagram_url`, `facebook_url`, `cuisine_type`. |
| `profiles` | Usuarios | Perfiles vinculados a `auth.users`. Controlan acceso y roles. Vinculados a un `restaurant_id`. |
| `settings` | Configuración | Ajustes globales del restaurante. **PK (restaurant_id, key)** asegura que las configuraciones sean aisladas por tenant. |
| `shift_handoffs` | **Traspaso de Turno** | Registro de entrega de caja entre empleados. Guarda snapshots de mesas abiertas, pedidos en cocina y efectivo contado. |

## 2. Subsistema de Punto de Venta (POS) y Menú
Estructura de ventas en piso.

| Tabla | Función | Descripción |
| :--- | :--- | :--- |
| `categories` | Menú | Clasificación de productos (Ej: "Bebidas", "Fuertes"). |
| `products` | Menú | Productos a la venta final (precio, visibilidad, imagen). |
| `tables` | Salón | Disposición del salón. Atributos: `status` (Libre, Ocupada, Sucia). |
| `orders` | Comandas | Cabeza de un pedido. Atributos críticos: `status` (PENDING, PREPARING, DELIVERED, COMPLETED), `total`. FKs: `waiter_id`, `table_id`. |
| `order_items` | Detalles | Cada producto de una orden. Permite estados de preparación individuales, modificaciones al plato y notas directas. |

## 3. Subsistema de Inventario y Recetas (ERP Culinario)
El motor de la rentabilidad del restaurante.

| Tabla | Función | Descripción |
| :--- | :--- | :--- |
| `ingredients` | Raw Material | Componentes base (Stock, unidad de medida, costo_unitario, alerta mínima). |
| `inventory_movements`| Auditoría | Histórico de TODO lo que entra y sale de bodega. Tipos: `compra`, `merma`, `receta`. |
| `inventory_waste` / `waste_reports` | Mermas ($) | Desperdicios justificados, valoriza la pérdida ($). |
| `recipes` | Escandallos | Conversión de Insumos -> Producto de Venta. Fundamental para "Food Cost". |
| `recipe_items` | Dosificación | Cantidad de cada `ingredient` dentro de un `recipe`. |
| `purchases` / `suppliers` | Cadena | Proveedores y el registro histórico de compras para promediar costos en tiempo real. |

## 4. Subsistema Financiero (Control Efectivo)
Control estricto contra descuadres robos.

| Tabla | Función | Descripción |
| :--- | :--- | :--- |
| `cashboxes` | Físicas | Ubicación/Identificador de caja física (POS 1, Main, Ventanilla). |
| `cashbox_sessions` | Transaccional | Turno de un cajero. Guarda: base inicial, dinero esperado vs declarado, responsable y descuadres. Agregadas columnas: `closed_with_pending`, `transferred_to`. |
| `cash_movements` | Flujo | Entradas y salidas manuales durante una sesión activa. |
| `petty_cash_vouchers` | Egresos | Pagos a proveedores en efectivo, recibos. |

## 5. Subsistema Laboral y Nómina (Payroll Engine)
Administración del personal, entregas a domicilio y liquidación automática de pagos.

| Tabla | Función | Descripción |
| :--- | :--- | :--- |
| `shifts` | Control Asistencia | Marcación de entrada/salida de empleados, total de horas regulares y extras. |
| `shift_definitions` | Horarios | Turnos estándar requeridos por la operación. |
| `payroll_concepts` | Reglas | Leyes o beneficios del negocio (Salario Base, Horas Extras, Comisiones). |
| `payroll_periods` | Periodos | Ciclo de pago mensual o quincenal (Fechas Start - End). |
| `payroll_runs` | Liquidaciones | Ejecución en bóveda (Transacción). Guarda totales por periodo. |
| `payroll_items` | Desprendibles | Detalles cruzados (Empleado -> Concepto -> Valor $). |
| `delivery_tracking` | Logística | Manejo de despachos y tiempos de entrega de Domicilios, KPIs de repartidores. |
| `security_events` | Auditoría Forense | Log de eventos de seguridad (cambios de precios, intentos de edición de órdenes cerradas, violaciones de política RLS). |

---

## 🔒 Consolidación de Esquema (Squash)
⚠️ A partir del 07 de Marzo de 2026, las más de 200 migraciones SQL originales se han archivado por razones de performance y claridad. El esquema entero se consolida en un **único archivo de origen de verdad**:
- `/supabase_migrations/20260307000000_jamaliso_initial_schema.sql`
- `/docs/schema_dump_v1.json` (Mapa JSON para integraciones).

## 6. Protección y Propiedad Intelectual
El código fuente de este proyecto está protegido bajo las leyes de propiedad intelectual internacionales y la Ley 23 de 1982 (Colombia). El repositorio incluye un archivo `LICENSE` que restringe su uso y reproducción sin autorización expresa de **Jaime Jaramillo**.

---

## Patrones de Diseño Utilizados

1. **Aislamiento por Inquilino (Multi-Tenant Isolation)**: RLS configurado en el 90% de las tablas filtrando obligatoriamente por la columna `restaurant_id = auth.user.restaurant()`.
2. **Historiadores Inmutables**: Tablas como `audit_logs` e `inventory_movements` no se actualizan (UPDATE), solo se insertan (INSERT) para seguimiento fiel (Hard Audit Trail).
3. **Casillas blandas**: Muchas tablas utilizan borrado lógico (`is_active = false`) en lugar de `DELETE` SQL para mantener íntegra la referencialidad con facturación e historial.
4. **Calculados vía Triggers / Acciones RPC**: Algunas sumatorias o proyecciones operan con cálculos diferidos en el backend (PostgreSQL) para evitar manipulación HTTP mal intencionada.
