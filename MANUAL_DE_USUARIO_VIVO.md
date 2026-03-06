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

## ❓ 5. Preguntas Frecuentes (FAQ)
*   **¿Qué pasa si un producto no aparece en el Portal de Meseros?**
    *   Probablemente fue marcado como **"AGOTADO"** en el KDS. El chef debe volver a habilitarlo cuando haya stock.
*   **¿Por qué una mesa parpadea en ROJO?**
    *   Significa que el pedido ha superado los **20 minutos** de espera. Es una alerta crítica de servicio.
*   **¿Puedo unir dos mesas si una ya ha pagado?**
    *   No, solo se pueden unir mesas con órdenes en estado `pending`, `preparing` o `ready`.

---

## 🧪 6. Guía de Pruebas Extendida (Q&A de Calidad)
Ejecuta estos escenarios para asegurar la robustez del sistema:

*   **Escenario A: Error de Dedo**
    *   [ ] Marchar una Coca-Cola a la Mesa 1 por error.
    *   [ ] Usar la función "Transferir Ítem" para mover esa Coca-Cola a la Mesa 2 sin cancelar nada.
    *   [ ] Confirmar en "Pre-cuenta" de Mesa 2 que el ítem aparece allí.
*   **Escenario B: El Cliente "Sabelotodo"**
    *   [ ] Un cliente pide la cuenta por separado después de que todo se marchó.
    *   [ ] Usar "Split Check", seleccionar solo su hamburguesa y su bebida.
    *   [ ] Verificar que se cree una nueva "Sub-cuenta" sin afectar el resto de la mesa.
*   **Escenario C: Estrés de Cocina**
    *   [ ] Enviar 5 pedidos diferentes al mismo tiempo.
    *   [ ] Verificar que el botón de "Total de Producción" en el KDS sume correctamente todos los ingredientes de las 5 órdenes.

---
> [!IMPORTANT]
> **Recordatorio Crítico**: NUNCA utilices `git push` o `git commit` sin aviso previo. Los documentos deben guardarse localmente en la carpeta del proyecto.
