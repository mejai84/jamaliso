# 📘 Manual de Usuario Vivo — JAMALI OS
> **Estado:** Documento en Construcción Continua (Actualizado: 06 Marzo 2026)
> este manual describe las capacidades operativas de los módulos de **Mesa/Meseros** y **Cocina (KDS)**.

---

## 👨‍🍳 1. Módulo de Cocina (KDS PRO)
El Kitchen Display System (KDS) es el corazón de la producción. Está diseñado para que los cocineros se concentren en preparar y no en leer papeles.

### 🚀 Funcionalidades Clave:
*   **Tarjetas Inteligentes**: Cada pedido aparece como una tarjeta que muestra:
    *   Tiempo transcurrido (se vuelve rojo después de 10 min).
    *   Mesero que tomó el pedido.
    *   Notas especiales del cliente (ej: "Sin cebolla").
*   **Prioridad VIP / Urgente**: Los pedidos marcados como urgentes por el mesero aparecen con un **borde azul eléctrico/dorado** y se posicionan al principio de la fila.
*   **Resumen de Producción**: Un botón lateral permite ver el **TOTAL** de ítems a preparar (ej: "15 Hamburguesas, 8 Papas"). Esto permite a la cocina anticiparse.
*   **Alertas Sonoras**:
    *   *Ding suave*: Nueva orden ingresada.
    *   *Alerta intensa*: Pedido con más de 10 minutos sin salir (Crítico).
*   **Gestión de Stock Crítico**: El chef puede marcar un producto como **"AGOTADO"** directamente desde el KDS, bloqueándolo inmediatamente para los meseros.

---

## 👨‍💼 2. Portal de Meseros (Waiter Pro)
Una herramienta móvil diseñada para la velocidad y la reducción de errores en el salón.

### ⚡ Características de Alto Rendimiento:
*   **Barra de Favoritos (Quick-Add)**: Los 5 productos más vendidos aparecen en la parte superior para agregarlos con un solo toque.
*   **Reloj de Promesa de Servicio**:
    *   Cada mesa muestra cuánto tiempo lleva el cliente esperando.
    *   **Alerta Roja**: Si la comida no ha salido en **20 minutos**, la mesa emite un pulso rojo visual para alertar al capitán.
*   **Modificadores Rápidos**: Chips pre-configurados (SIN CEBOLLA, TÉRMINO MEDIO, etc.) para no tener que escribir notas manualmente.
*   **Gestión de Cuentas Avanzada**:
    *   **Dividir Cuenta (Split Check)**: Permite seleccionar ítems específicos de una mesa y moverlos a una nueva cuenta independiente.
    *   **Unir Mesas (Merge)**: Fusiona dos mesas ocupadas en una sola cuenta de forma transparente.
    *   **Transferir Ítems**: Mueve un producto por error a otra mesa sin cancelar el pedido.
*   **Pre-Cuenta**: Opción de visualizar un borrador de la factura con estética de ticket térmico para mostrar al cliente antes del pago.

---

## 📋 3. Guía de Pruebas (Test Plan)
Utiliza esta guía para verificar que todo funcione correctamente tras cada actualización.

### 🧪 Pruebas de Flujo Crítico:
1.  **Ciclo de Orden VIP**:
    *   [ ] Crear pedido en Mesa 5, marcar como VIP.
    *   [ ] Verificar que en Cocina aparezca con el borde distintivo y en primer lugar.
    *   [ ] Verificar que suene la alerta de entrada.
2.  **Prueba de División de Cuenta**:
    *   [ ] Crear orden con 4 productos en Mesa 2.
    *   [ ] Usar "Dividir Cuenta" y pasar 2 productos a una nueva cuenta.
    *   [ ] Verificar que la Mesa 2 ahora tenga dos cuentas separadas y los totales sean correctos.
3.  **Prueba de Stock Crítico**:
    *   [ ] Ir al KDS y marcar "Cerveza Club Colombia" como AGOTADO.
    *   [ ] Ir al Portal de Mesero y verificar que el producto aparezca gris, con sello de AGOTADO y no permita agregarlo al carrito.
4.  **Prueba de Alerta de Tiempo**:
    *   [ ] Abrir una cuenta y esperar 20 minutos (puedes manipular la hora en DB para pruebas rápidas).
    *   [ ] Verificar que la mesa en el mapa empiece a "latir" en color rojo.
5.  **Prueba de Unión de Mesas**:
    *   [ ] Abrir cuenta en Mesa 1 (2 gaseosas) y Mesa 2 (2 pizzas).
    *   [ ] Seleccionar Mesa 1 -> Unir Mesas -> Mesa 2.
    *   [ ] Verificar que Mesa 1 quede libre y Mesa 2 tenga los 4 productos y el total sumado.

---

## 🔄 4. Flujo de Trabajo Típico (Workflow)
Aquí se explica cómo deberían interactuar los módulos en un servicio normal:

1.  **Apertura**: El mesero entra al **Waiter Pro** y ve el mapa de mesas. Las mesas en **verde** están libres.
2.  **Toma de pedido**: Selecciona una mesa, usa la **Barra de Favoritos** para añadir bebidas rápido y el buscador para platos fuertes.
3.  **Personalización**: Toca un producto en el carrito y usa los **Quick Modifiers** (ej: "Sin Sal") para evitar errores.
4.  **Despacho (Marcha)**: Al dar clic en "MARCHAR", la orden vuela al **KDS** de cocina.
5.  **Producción**: El cocinero ve la orden. Si hay muchas órdenes similares, usa el **"Resumen de Producción"** para preparar todo en lote.
6.  **Notificación**: Cuando el cocinero marca la orden como **LISTA**, la mesa en el celular del mesero empieza a **parpadear en verde** y suena una campana.
7.  **Cierre**: El mesero verifica la pre-cuenta con el cliente y procede al pago en el POS.

---

## 📊 5. Módulo de Analytics (Business Intelligence)
El sistema extrae datos de la operación para presentar KPIs estratégicos:
1. **Ingresos Live**: Cálculo en tiempo real de ventas cerradas.
2. **Margen de Contribución**: Compara precio de venta vs costo de receta (Food Cost).
3. **Análisis de Merma**: Gráfico semanal de pérdidas financieras por ingredientes.
4. **Pareto de Productos**: Identifica el 20% de platos que generan el 80% de ingresos.
5. **Conciliación de Caja Live**: Widget que muestra el saldo teórico esperado en caja en todo momento.

---

## 💰 6. Control de Caja Inteligente (Smart Cashier)
Blindaje financiero y auditoría de flujo:
1. **Arqueo a Ciegas**: El cajero reporta el físico sin ver el sistema para evitar "ajustes" manuales sospechosos.
2. **Alerta de Excedente**: Notificación visual cuando la caja supera el límite de seguridad establecido.
3. **Integración Caja Menor**: Registro fluido de traslados para gastos operativos menores.
4. **Z-Report (Cierre)**: Comprobante térmico detallado con auditoría de movimientos.

---

## 🛒 7. Terminal POS Premium (Venta Directa)
Estación de alto rendimiento para cobros y gestión de pedidos inmediatos.
- **Venta Atómica**: Sincronización íntegra de orden, pago y caja en una transacción protegida.
- **Impresión Térmica**: Tickets de 80mm optimizados para impresoras locales.
- **Smart Checkout**: Gestión de medios de pago con validación de turno activo.

---

## 🗺️ 8. Geometría del Salón (Arquitectura 2D)
Replicación visual de la estructura física del restaurante.
- **Editor Drag & Drop**: Disposición personalizada de mesas con rotación y escala real.
- **Mapas de Calor**: Análisis térmico para identificar las mesas con mayor rotación y gasto.
- **Arquitectura de Salón**: Sincronización en tiempo real entre el mapa administrativo y el portal del mesero.

---

## 📦 9. Inventario Inteligente (Kernel Supply)
Gestión proactiva de la cadena de suministro.
- **Auto-Pedido**: Botón de "Automatizar Compra" inteligente cuando los niveles cruzan el umbral crítico.
- **Fichas Técnicas**: Descuento por receta automático en cada venta procesada.
- **Vendor Matrix**: Gestión centralizada de proveedores y costos de adquisición.

---

## 🎨 10. Personalización Marca Blanca (White Label)
Gestión de la identidad corporativa:
- **Logo Dinámico**: Aplicado en Sidebar, Dashboard y Tickets.
- **Motor de Color**: Inyecta el color institucional en toda la experiencia del usuario.
- **Contexto Multi-Tenant**: Cada restaurante vive en su propia burbuja de datos y estética.

---
> [!IMPORTANT]
> **Recordatorio Crítico**: NUNCA utilices `git push` o `git commit` sin aviso previo. Los documentos deben guardarse localmente en la carpeta del proyecto.
