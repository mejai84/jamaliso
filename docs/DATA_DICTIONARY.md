# 🗄️ Diccionario de Datos — JAMALI OS
Este documento describe el esquema principal y las reglas que rigen los datos del sistema.

---

## 1. Entidades Principales

### 🏨 Restaurants (`restaurants`)
La tabla raíz para el Multi-tenant. Todo dato en el sistema DEBE tener un `restaurant_id`.
*   `id`: UUID (Primary Key)
*   `name`: Nombre comercial.

### 🪑 Mesas (`tables`)
Geometría y estado del salón.
*   `table_name`: Identificador visual (Mesa 1, Terraza 5).
*   `status`: `free`, `occupied`, `reserved`.
*   `capacity`: Número de personas.

### 🍱 Productos (`products`)
*   `price`: Precio de venta (Numeric).
*   `is_available`: Switch manual de disponibilidad.
*   `stock_quantity`: Saldo actual (para items con inventario).
*   `use_inventory`: (Boolean) Indica si el sistema debe descontar stock de este item.
*   `station_id`: Vincula el producto a una estación (Cocina, Bar, Horno).

### 🧾 Órdenes (`orders`)
*   `status`: `pending`, `preparing`, `ready`, `delivered`, `cancelled`.
*   `order_type`: `dine_in` (Salón), `pos` (Mostrador), `delivery`.
*   `priority`: (Boolean) Flag de urgencia VIP.
*   `total`: Monto total calculado (Incluye impuestos y servicio).

### 🥗 Items de Orden (`order_items`)
*   `order_id`: UUID (FK).
*   `product_id`: UUID (FK).
*   `quantity`: Cantidad pedida.
*   `notes`: Observaciones específicas (ej: "Sin sal").

---

## 2. Reglas de Negocio (Integridad)

1.  **Regla de Ocupación**: Una mesa cambia a `status='occupied'` automáticamente cuando se crea una orden de tipo `dine_in` vinculada a su `id`.
2.  **Regla de Liberación**: Solo el proceso de pago (`sale_payments`) o una cancelación total pueden volver la mesa a `status='free'`.
3.  **Cálculo de Totales**: El total de `orders` es la suma de `subtotal` de sus `order_items` + `tax` + `service_charge`. Se debe recalcular en cada inserción/borrado (Manejado en `orders-fixed.ts`).
4.  **Estaciones de Cocina**: Los items de una orden se filtran en el KDS por el `station_id` del producto. Un mesero "marcha" una vez, pero el pedido puede dividirse visualmente entre Cocina y Bar.

---

## 3. Estados de Flow
| Estado | Visibilidad | Acción Requerida |
| :--- | :--- | :--- |
| `pending` | KDS & Mesero | Cocina debe aceptar/iniciar preparación. |
| `preparing` | KDS & Mesero | El cronómetro de espera está activo. |
| `ready` | Mesero | Alerta sonora al mesero para recoger. |
| `delivered`| Dashboard | Pedido servido al cliente. |

---
> **Nota de Seguridad**: Nunca realices un `DELETE` físico en la tabla `orders` si el cliente ya está en el local. Usa `status='cancelled'` para auditoría legal.
