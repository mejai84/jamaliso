# 🛡️ JAMALI POS SECURITY SHIELD — Gestión de Crisis y Fricción
> **Referencia:** Soluciones Operativas a los 30 Problemas Reales en Restaurantes.

Este documento detalla cómo **JAMALI OS** aborda mediante software y procesos las 30 situaciones críticas de fricción operativa en el Punto de Venta (POS).

---

## 🚀 1. PROBLEMAS DE EVASIÓN (Dine and Dash)

### 1.1. Cliente se va sin pagar (Individual o Grupo)
*   **Situación:** El cliente abandona el local sin liquidar la cuenta (baño, salida rápida, confusión entre amigos).
*   **Solución JAMALI:** 
    *   **Botón de Incidente:** En el nuevo `CheckoutModal`, existe la opción **[MESA MARCADA COMO INCIDENTE]**.
    *   **Registro Forense:** El cajero debe escribir el motivo. El sistema libera la mesa pero guarda la venta como una **PÉRDIDA (Loss)** vinculada al mesero que atendió.
    *   **Alerta Guardian:** El Propietario recibe una notificación inmediata en su móvil sobre la fuga de capital.

---

## 🥗 2. PROBLEMAS CON LA CUENTA O CONSUMO

### 2.1. "Esto no lo pedimos" / Error de Carga
*   **Situación:** Plato agregado por error o bebida duplicada.
*   **Solución JAMALI:** 
    *   **Blindaje de Anulaciones:** El mesero NO puede borrar platos ni anular órdenes una vez marcharas. Cada anulación individual o total requiere un **PIN DE SUPERVISOR** y un motivo.
    *   **Void Logs Forenses:** Cada centavo que se resta de una comanda queda registrado en la tabla `void_logs`, vinculando al operador que lo pidió y al supervisor que lo autorizó.
    *   **Alertas de Alta Prioridad:** Cualquier ítem anulado dispara una entrada en la `security_audit` como evento de ALTA PRIORIDAD.

### 2.2. Reclamo de Precio o Promoción no aplicada
*   **Situación:** Diferencia entre carta y sistema o Happy Hour no reflejado.
*   **Solución JAMALI:** 
    *   **Descuento Autorizado:** El POS permite aplicar un monto de descuento manual directamente en el flujo de cobro para ajustar discrepancias al instante y calmar al cliente.
    *   **Motor Pixora de Promociones:** El sistema aplica automáticamente cambios de precio por horario si están configurados en el catálogo.

### 2.3. Producto Devuelto (Falla de Cocina/Gusto)
*   **Situación:** Comida fría o plato equivocado.
*   **Solución JAMALI:** 
    *   **Gestión de Mermas:** El cajero marca el ítem como merma. Esto descuenta el inventario pero registra el costo, permitiendo al Admin saber cuánto dinero se pierde por errores de cocina v.s. errores de servicio.

---

## 🍕 3. PROBLEMAS DE DIVISIÓN DE CUENTA

### 3.1. "Cada uno paga lo suyo" / División por Productos
*   **Situación:** Mesas grandes donde cada cliente quiere pagar solo lo que consumió.
*   **Solución JAMALI:** 
    *   **Split por Ítem:** El portal del mesero permite "Dividir Cuenta" antes de notificar el pago, creando sub-cuentas separadas. El cajero las cobra una por una de forma independiente.

### 3.2. División en Partes Iguales
*   **Situación:** Grupo de 4 amigos que quieren dividir el total entre 4.
*   **Solución JAMALI:** 
    *   **Calculadora de División:** En el `CheckoutModal`, el cajero selecciona el número de personas. El sistema calcula automáticamente el monto exacto por cabeza, facilitando el cobro múltiple.

### 3.3. Pago Mixto
*   **Situación:** Un cliente paga $50 en efectivo y el resto con tarjeta.
*   **Solución JAMALI:** 
    *   **Multi-Payment Engine:** El sistema permite agregar múltiples "capas de pago" a una misma transacción. Puedes sumar efectivo + tarjeta + transferencia hasta completar el total.

---

## 💳 4. PROBLEMAS CON MÉTODOS DE PAGO

### 4.1. Tarjeta Rechazada o Datáfono Fallido
*   **Situación:** Falta de fondos o mala conexión del terminal bancario.
*   **Solución JAMALI:** 
    *   **Fallback Inmediato:** El flujo de cobro permite revertir o cambiar el método de pago sin perder los datos de la cuenta ni tener que re-escanear todo el pedido.

### 4.2. Billetes Grandes y Falta de Cambio
*   **Situación:** Cuenta de $18, el cliente paga con un billete de $100.
*   **Solución JAMALI:** 
    *   **Cálculo de Vuelto (Change Explorer):** El sistema muestra en tamaño gigante el cambio exacto a entregar. Si la caja no tiene efectivo, el sistema emite una alerta de "Falta de Base" para que el Admin traiga cambio de la bóveda.

### 4.3. Pago Duplicado
*   **Situación:** El POS se queda cargando y se procesa dos veces el cobro.
*   **Solución JAMALI:** 
    *   **Venta Atómica:** El motor de transacciones de JAMALI OS garantiza que si el servidor no confirma el cierre, la mesa sigue abierta. Si hay un error, existe un historial de pagos temporal para validar si el dinero ya entró.
    *   **Vínculo Atómico Caja-Mesa:** El sistema impide liberar una mesa (marcarla como 'free') si tiene órdenes pendientes de pago. Esto evita que el personal "limpie" mesas sin registrar el ingreso. Cualquier liberación forzada exige PIN de supervisor y genera alerta crítica.

---

## 🛡️ 5. PROBLEMAS ADMINISTRATIVOS Y SEGURIDAD

### 5.1. Fraude Interno (Cobra efectivo y no registra)
*   **Situación:** El mesero o cajero se queda con el dinero sin cerrar la mesa.
*   **Solución JAMALI:** 
    *   **Monitor de Mesas Antiguas:** El Guardian alerta al dueño cuando una mesa lleva más de 3 horas ocupada. "Mesa Eterna" suele ser señal de cobro manual no reportado.
    *   **Arqueo Ciego Certificado:** En el arqueo parcial o cierre de caja, el sistema OCULTA el saldo teórico al cajero. El cajero debe contar y declarar el efectivo "a ciegas". Solo el supervisor ve la diferencia real al final, evitando que el cajero "cuadre" la caja manualmente.

### 5.2. Propinas (Inclusión o Rechazo)
*   **Situación:** El cliente quiere agregar propina o se niega a pagar el servicio sugerido.
*   **Solución JAMALI:** 
    *   **Configuración de Tip:** El cajero puede activar o desactivar la propina (10%, 15% o manual) con un toque, recalculando el total fiscal inmediatamente.

---

## ⏱️ 6. PROBLEMAS DE TIEMPO Y RED

### 6.1. Cliente con Prisa
*   **Situación:** Necesita pagar e irse ya.
*   **Solución JAMALI:** 
    *   **Quick Checkout:** El cajero puede procesar la venta en 2 clics si el pago es exacto, emitiendo el ticket térmico en menos de 1 segundo.

### 6.2. Internet Caído (Offline Mode)
*   **Situación:** Se cae el internet en pleno servicio de fin de semana.
*   **Solución JAMALI:** 
    *   **Persistence Cache:** Los datos de la sesión se guardan en el navegador. Cuando vuelve el internet, el sistema sincroniza masivamente todas las ventas pendientes con el Kernel.

---

## 🏛️ 7. PROBLEMAS LEGALES Y FISCALES

### 7.1. Factura con Datos (NIF/NIT)
*   **Situación:** El cliente exige factura de empresa a último momento.
*   **Solución JAMALI:** 
    *   **Perfil de Cliente:** El POS permite buscar o crear un cliente por su NIT al momento del cobro, actualizando los datos legales del ticket fiscal instantáneamente.
    *   **Trazabilidad de Insumos (Receta Atómica):** Cada venta pagada descuenta automáticamente los ingredientes según la receta configurada. Cualquier desviación entre stock físico y teórico (Robo Hormiga) es fácilmente detectable mediante los `inventory_movements`.

---

> [!IMPORTANT]
> **Regla de Oro:** El sistema JAMALI OS asume que el restaurante es un entorno caótico. Cada solución está diseñada para ser aplicada en menos de **5 segundos** bajo presión.
