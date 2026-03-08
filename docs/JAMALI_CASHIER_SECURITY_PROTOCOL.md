# 🏦 JAMALI CASHIER ANTIFRAUD — Protocolo de Blindaje de Caja
> **Referencia:** Soluciones Técnicas a los 30 Problemas de Seguridad en Caja.

Este protocolo define cómo **JAMALI OS** neutraliza el fraude y los errores operativos en el punto de cobro.

---

## 🔐 1. CONTROL DE ACCESO Y TURNOS (Pilar 1)

### 1.1. Abandono de Turno o Enfermedad
*   **Solución:** Los turnos (`cashbox_sessions`) están vinculados al UUID del usuario. Un supervisor puede realizar un **[CIERRE FORZADO]** desde el panel Admin, registrando el descuadre y liberando la caja para un nuevo operador.
*   **Auditoría:** Cada cierre registra quién lo ejecutó (Supervisor v.s. Cajero).

### 1.2. Préstamo de Usuario
*   **Solución:** Bloqueo automático por inactividad. Re-login obligatorio con PIN rápido de 4 dígitos para cada transacción sensible.

---

## 💸 2. PREVENCIÓN DE ROBO DE EFECTIVO (Pilar 2)

### 2.1. "Cobra pero no registra" / Mesa Ficticia
*   **Solución:** El sistema bloquea la liberación de la mesa si no existe una venta confirmada. 
*   **Alerta Guardian:** Notificación de "Mesa Eterna" si una mesa supera el tiempo promedio de consumo sin pago registrado.

### 2.2. Cambio Incorrecto (Vuelto)
*   **Solución:** Calculadora visual de cambio. El cajero ingresa el billete recibido y el POS muestra en tamaño gigante el monto a entregar. Cada billete ingresado queda en el log de la venta.

### 2.3. Apertura de Cajón sin Venta
*   **Solución:** Registro inmutable de cada evento `drawer_open`. Si no hay una venta asociada, el cajero debe ingresar un PIN de supervisor o un motivo obligatorio.

---

## 🚫 3. CONTROL DE ANULACIONES Y DESCUENTOS (Pilar 3)

### 3.1. Anulación Post-Cobro (Fraude Típico)
*   **Solución JAMALI:** Una vez cerrada la venta, **no se puede anular**. Solo se admite una "Devolución" que requiere PIN de Supervisor y genera un ticket de crédito fiscal.
*   **Reporte de Anulaciones:** El Admin recibe un resumen diario de "Ventas Canceladas/Platos Eliminados".

### 3.2. Descuentos Falsos
*   **Solución:** Los descuentos manuales están limitados a un % máximo definido por el dueño. Superar ese límite bloquea el botón de confirmación hasta que se ingrese un PIN de autoridad.

### 3.3. Modificación de Precios
*   **Solución:** Los precios están bloqueados por catálogo. Cualquier "Precio Abierto" queda marcado en rojo en el reporte de ventas para auditoría directa.

---

## 📊 4. INTEGRIDAD DE DATOS Y CONCILIACIÓN (Pilar 4)

### 4.1. Mezcla de Dinero Personal
*   **Solución:** Arqueos ciegos obligatorio al cierre. El cajero declara lo que tiene en físico. El sistema compara contra el log digital y reporta el diferencial ("Sobrante" o "Faltante") al dueño.

### 4.2. Registro de Pagos Ficticios (Cuadre Temporal)
*   **Solución:** Conciliación automática con pasarelas de pago (Datáfonos). Si el cajero registra "Tarjeta" pero el monto no coincide con el cierre del terminal bancario, el sistema bloquea el cierre del turno.

---

> [!CAUTION]
> **RECORDATORIO DE SEGURIDAD:** El sistema JAMALI OS graba cada clic. No intentes borrar el historial; los logs son inmutables y se replican en el Kernel Guardian en tiempo real.
