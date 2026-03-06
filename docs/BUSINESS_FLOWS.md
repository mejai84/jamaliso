# Flujos de Negocio - Jamali OS

Este documento explica cómo las operaciones reales de un restaurante se mapean y ejecutan dentro de Jamali OS. Para un analista o nuevo integrador, **esta es la guía definitiva de cómo aporta valor el software**.

---

## 1. El ciclo de vida de un Plato (Módulo Inventario -> POS)
Desde que un tomate entra por la puerta trasera hasta que se cobra en la mesa.

1. **Ingreso a Bodega**: El Jefe de Cocina recibe mercancía.
   * *Acción Pargo*: Carga una **Compra (Purchase)** en `/admin/inventory/purchases/new`.
   * *Cambio DB*: `inventory_movements` registra la entrada de `Tomate (+5kg)`.
2. **Transformación (Preparación/Receta)**: El Tomate se usa en un Menú.
   * *Acción Pargo*: El Chef define un  `Recipe` ligando el `Tomate (~50g)` a la `Hamburguesa Clásica`.
3. **Punto de Venta**: 
   * *Acción Pargo*: Al oprimir el botón en el POS para vender una "Hamburguesa Clásica", el sistema descuenta dinámicamente el tomate y la carne calculados.
   * *Mermas ocultas*: Si el tomate se pudrió, el cocinero hace una "Merma" en `/inventory/waste`, afectando el KPI de rentabilidad.

---

## 2. Flujo de Pedido Presencial (POS Dinámico)
El "Core Loop" que usan meseros y cajeros miles de veces por semana.

1. **Atención al Cliente**: Un grupo de 4 se sienta en la "Mesa 5".
   * *Acción*: Mesero ingresa (`/waiter`) usando un PIN de 4 dígitos (sin login complejo de Email).
   * *Dato*: Se abre la Mesa 5 (`status = occupied`).
2. **Toma de Pedido (Comanda)**:
   * *Acción*: El mesero marca 2 Cervezas, 1 Nachos y 1 Hamburguesa. Pulsa **Enviar a Cocina**.
   * *Efecto DB*: Se crea un registro en `orders`, y 4 tuplas en `order_items` (las bebidas suelen ir directo a la barra, la comida al KDS de cocina).
3. **Elaboración (KDS - Kitchen Display System)**:
   * *Visual*: En la cocina, una pantalla grande pinta un ticket en amarillo para los Nachos.
   * *Acción*: El cocinero termina y toca el ticket `[Completado]`. Aumenta el KPI de "Tiempo de Preparación".
4. **Pago y Cierre (Caja)**:
   * *Cajero central*: Busca Mesa 5. Oprime **PAGAR**. 
   * *Dinámico*: Cobra con 2 tarjetas y 1 billete (Cuentas Divididas).
   * *DB*: `tables` vuelve a `available`. `cashbox_sessions` registra los +$120.000 reales en la gaveta del cajero actual.

---

## 3. Flujo Logístico (Delivery de Terceros)
Integración con repartidores propios o plataformas como Rappi/UberEats.

1. **Recepción Centralizada**: El pedido entra (bien sea manual o vía API).
2. **Despacho Automático**: Un motor optimizado verifica si hay conductores activos (`delivery_drivers`).
3. **Asignación (Ruteo)**: El supervisor de despachos o sistema asigna la ruta "Zona Norte" al Motorizado A.
4. **Liquidación (Pago contra-entrega)**: El motorizado vuelve de la calle; entrega los $500.000 recopilados al cajero; el sistema cruza lo vendido vs entregado y bloquea faltantes.

---

## 4. Auditoría y Cuadre de Caja (Prevención de Pérdidas)
El diferencial de Jamali OS contra Excel: "Cuidar el Dinero del Inversor".

* **Apertura (Mañana)**: El Cajero A declara base ($100.000). RLS fija que su `cashbox_sessions` solo vive bajo su firma criptográfica autenticada.
* **Egreso (Caja Menor)**: Compra pan de emergencia ($5.000) de la gaveta. Saca el soporte vía `petty_cash_vouchers`.
* **Cierre Ciego**: Al irse a las 4:00 PM, el cajero A ingresa cuánto ve físicamente en sus manos. 
  * "Tengo $400.000".
  * *Sistema (Secreto)*: Revisa que debía tener $415.000. 
  * *Acción*: Dispara alerta de descuadre o cierre y lo registra para el módulo de Reportes del Dueño.
