# 🎸 Jamali OS — Guía Vibe Coding Completa

Esta guía define el orden exacto de construcción, las fórmulas matemáticas, los protocolos de prueba y las técnicas de protección para desarrollar Jamali OS sin errores.

---

## 🗺️ Parte 1: Orden de Construcción (Etapas)

### 🏗️ Etapa 1: Base del Sistema (✅ COMPLETADO)
*   Registro y configuración de restaurante.
*   Login y roles (Owner, Admin, Mesero, Cocinero).
*   Menú: Categorías, productos y precios.
*   Mesas: Número, capacidad y estado.
*   Seguridad: RLS en Supabase activado.

### 🛒 Etapa 2: Tomar Pedidos (Mesero + KDS) (✅ COMPLETADO)
*   **Portal Mesero:** Tomar pedidos por mesa. (✅)
*   **KDS Cocina:** Visualización Realtime, Alertas Sonoras, Resumen de Producción y Stock Gestor. (✅)
*   **Notificaciones:** Alerta WhatsApp al mesero cuando el pedido está listo.
*   **Estados:** `pending` → `preparing` → `ready` → `delivered`.
*   **KDS por estación:** Cocina fría, caliente, bar. (✅)


### 💰 Etapa 3: Cobrar y Facturar (❌ PENDIENTE)
*   **POS:** Cerrar y cobrar pedidos.
*   **Métodos de pago:** Efectivo, Tarjeta, QR, Nequi/Daviplata.
*   **Apertura/Cierre de caja:** Control de flujo de efectivo.
*   **Facturación Electrónica DIAN:** Integración crítica para Colombia.
*   **Factura Digital:** Envío de PDF por WhatsApp.

### 📦 Etapa 4: Inventario y Recetas (❌ PENDIENTE)
*   **Ingredientes:** Stock actual y niveles mínimos.
*   **Recetas:** Composición de platos (Food Cost).
*   **Descuento Automático:** Bajar stock al vender platos.
*   **Proveedores:** Registro de compras y entrada de insumos.
*   **Mermas:** Registro de pérdidas con costo asociado.

### 📊 Etapa 5: Reportes y Dashboard (❌ PENDIENTE)
*   **Ventas:** Dashboard diario, semanal y mensual.
*   **Rendimiento:** Platos más vendidos y margen neto.
*   **Finanzas:** Conciliación de caja y alertas de descuadre.
*   **Staff:** KPIs por mesero (ventas, ticket promedio).

### 🚀 Etapa 6: Automatizaciones SaaS (🔭 FUTURO)
*   **n8n / WhatsApp:** Flujos automáticos complejos.
*   **Reservas:** Módulo de reserva online.
*   **Delivery:** Integración Rappi/Uber Eats.
*   **Lealtad:** Puntos y cupones de fidelización.

---

## 🔢 Parte 2: Matemáticas del Sistema

### 🛒 Pedido (Etapa 2)
1.  **Subtotal Ítem:** `precio_unitario × cantidad`
2.  **Total Pedido:** `Σ subtotales_items`
3.  **Tiempo Estimado:** `MAX(preparation_time) de los platos en la orden`

### 💰 Cobro (Etapa 3)
4.  **IVA (Colombia):** `subtotal × 0.08`
5.  **Propina (Sugerida):** `subtotal × 0.10`
6.  **Total a Cobrar:** `subtotal + IVA + propina`
7.  **Cambio:** `monto_recibido - total`

### 🗃️ Caja (Etapa 3)
8.  **Ventas Turno:** `Σ pagos_registrados_en_sesion`
9.  **Diferencia:** `dinero_contado - sistema_esperaba` (Alerta si `|diff| > $5.000 COP`)

### 📦 Inventario & Costos (Etapa 4)
10. **Food Cost:** `Σ (cantidad_ingrediente × costo_unitario)`
11. **Margen Real:** `(precio_venta - food_cost) / precio_venta × 100`
12. **Valor Merma:** `cantidad_pérdida × costo_unitario`
13. **% Merma/Ventas:** `(total_merma / total_ventas) × 100` (Crítico si > 5%)

### 📊 KPIs (Etapa 5)
14. **Ticket Promedio:** `total_ventas / número_pedidos`
15. **Puntos Lealtad:** `ROUND(total_compra / 1000)`

---

## 🔒 Parte 3: Protocolo de Protección de Código

1.  **Git Branches:** Crear una rama `feature/nombre` antes de cada cambio grande.
2.  **Contexto Explícito:** Indicar a la IA qué archivos son "INTOCABLES".
3.  **Aislamiento:** Mantener lógica en carpetas separadas (`/modules/kds`, `/modules/pos`).
4.  **Snapshots:** Commit estable antes de pedir una nueva funcionalidad compleja.

---

## ✅ Parte 4: Checklist de Pruebas (Módulos Full)

*(Verificar cada punto antes de dar un módulo por terminado)*

### Portal Mesero
- [ ] Login correcto por rol y restaurante.
- [ ] Cambio de estado de mesa (Libre/Ocupada).
- [ ] Cálculo de subtotal exacto en el carrito.
- [ ] Envío correcto a la tabla `orders`.

### KDS Cocina
- [ ] Recepción en tiempo real (Realtime).
- [ ] Timer visual por urgencia.
- [ ] Cambio de estado a `ready` limpia la pantalla/marca como listo.

### POS & Facturación
- [ ] Cálculo exacto de IVA 8% y Propina.
- [ ] Registro en `sale_payments` y `receipts`.
- [ ] Generación de correlativo de factura único.

*(Continuar con pruebas de Inventario y Dashboard conforme se desarrollen)*

---

## 🏛️ Parte 5: Código Limpio y Arquitectura Estricta (Enterprise Standard)

> **⚠️ REGLA ABSOLUTA PARA LA IA:** El software será tasado buscando valoraciones de +200k USD. Se requiere rigor absoluto en las siguientes reglas antes de sugerir u obrar sobre código base.

1. **Modularidad Cero Acoplamiento:**
   - La caja no toca directamente el estado UI del KDS. Todo se comunica vía DB real (PostgreSQL/Supabase).
   - Componentes ui genéricos van en `components/ui`. Componentes de modulo en `components/admin`.
   
2. **Naming Semántico y Claro:**
   - Nada de `data1`, `fn()`, `val`, `temp`. 
   - Se explícito: `calculateInventoryCost(orderItems)`, `refreshCashboxSession()`.

3. **Variables Consistentes (Diccionario Único):**
   - Siempre que toquemos Mermas: usar `wasteReports` (NO `wasteData` o `mermas`).
   - Siempre que toquemos el carrito de POS: usar `orderItems` (NO `cart` o `itemsTemp`).
   - Siempre que toquemos Turnos de Empleados: usar `shifts` y `profiles`.
   - SIEMPRE asume que la consulta pertenece a un `restaurant_id`.

4. **Documentación Justo A Tiempo:**
   - No comentes getters/setters lógicos evidentes.
   - Comenta fórmulas y reglas de dominio empresarial (ej. `// Se cobra un recargo del 8% de impoconsumo`).
   - Mantén los archivos en la carpeta `docs` actualizados si creas una tabla nueva o un flujo nuevo.

5. **Aesthetics y Frontend World-Class (PIXORA STANDARD):**
   - El software se vende como Marca Blanca. Debe ser agnóstico y elegante.
   - **Forzar Modo Claro:** Inspirado en Pixora (Blanco inmaculado `#FFFFFF`, fondos `#F8FAFC`, acentos en `primary`).
   - Usa **Skeletons** antes de renderizar tablas pesadas.
   - Usa **Framer Motion** para todo cambio de estado crítico (pop-in, slide-in, stagger effects).
   - Micro-animaciones en botones (hover lift, soft shadows).

6. **Arquitectura Atómica de Módulos (OBLIGATORIO):**
   - Todo archivo `page.tsx` o componente que supere las **200 líneas** debe ser fragmentado de inmediato.
   - Extraer interfaces a `types.ts` en la carpeta del módulo.
   - Extraer piezas de UI a `src/components/admin/[módulo]/`.
   - Mantener el archivo `page.tsx` como un **Orquestador Limpio** (< 150 líneas).

---

## ☢️ Parte 6: Protocolo Atómico de Actualización (OBLIGATORIO)

Cualquier IA que trabaje en este proyecto tiene la **obligación contractual y lógica** de ejecutar este ciclo de "Regresión Documental" antes de entregar cualquier tarea:

1. **Detección de Cambios de Estructura:**
   - ¿Agregaste una tabla o columna en SQL? → **Actualiza** `docs/DATABASE_JAMALI_OS.md`.
   - ¿Agregaste una ruta, página o funcionalidad nueva? → **Actualiza** `docs/MODULES_JAMALI_OS.md`.
   - ¿Cambiaste la lógica de cómo se conectan las piezas? → **Actualiza** `docs/ARCHITECTURE_JAMALI_OS.md`.

2. **Alineación con el Roadmap:**
   - Cada tarea terminada debe marcarse como `✅ COMPLETADO` en la `Parte 1` de este mismo archivo (`GUIA_VIBE_CODING.md`).

3. **Verificación de Marca Blanca:**
   - Asegúrate de que NO existan colores "quemados" (ej: `text-orange-500`). Usa siempre variables CSS (ej: `text-primary`).

4. **Regla de Oro de la Documentación:**
   - "Un código sin documentación actualizada NO existe". Si el programador o el comprador lee el código y no coincide con el archivo `.md` de la carpeta `docs`, la tarea se considera FALLIDA.

5. **Protección de Valoración:**
   - Cada línea de código debe acercar el software a la meta de **+$200,000 USD**. Si la solución es "barata", "sucia" o "temporal", debe ser refactorizada de inmediato siguiendo los estándares de Pixora.

