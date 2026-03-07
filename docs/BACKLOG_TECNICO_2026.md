# 🔴 BACKLOG TÉCNICO — Lo Que Falta en JAMALI OS
> **Fecha:** 7 de marzo de 2026
> **Fuente:** Revisión arquitectónica externa + verificación interna del repositorio
> **Objetivo:** Documentar con honestidad cada gap técnico pendiente, priorizado por impacto comercial

---

## LEYENDA DE ESTADO

| Icono | Significado |
|---|---|
| ✅ YA EXISTE | Implementado y verificado en el código |
| ⚠️ PARCIAL | Existe una base pero es insuficiente para producción |
| ❌ NO EXISTE | Completamente ausente del proyecto |

---

## 1. MULTI-TENANT & AISLAMIENTO DE DATOS

### ✅ YA EXISTE: Esquema `shared database` con RLS
- 38+ tablas con `ENABLE ROW LEVEL SECURITY` (verificado en esquema SQL)
- `restaurant_id` como discriminador en todas las tablas de negocio

### ⚠️ PARCIAL: Políticas RLS
- **Existen** ~35+ policies en `archive/_deploy_production_FINAL.sql` (verificado)
- **Problema:** Las policies usan `auth.uid()` (identidad del usuario), pero NO todas filtran por `restaurant_id`. Algunas policies solo verifican el rol (`role = 'admin'`) sin asegurar que el admin pertenezca al restaurante correcto.
- **Riesgo:** Un admin de Restaurante A podría teóricamente ver datos de Restaurante B si la policy solo valida `role = 'admin'` sin cruzar con `restaurant_id`.
- **Acción requerida:** Auditar TODAS las policies y asegurar que cada una incluya `restaurant_id = (SELECT restaurant_id FROM profiles WHERE id = auth.uid())`.

### ✅ YA EXISTE: Queries con `restaurant_id`
- Los Server Actions (`orders-fixed.ts`, `pos.ts`) filtran por `restaurant_id` en las queries.
- El frontend obtiene `restaurant_id` del perfil del usuario autenticado.

### ❌ NO EXISTE: Migraciones backward-compatible documentadas
- No hay protocolo de migración segura para cuando haya múltiples tenants activos.
- **Acción requerida:** Documentar un proceso de migración zero-downtime (ej: `ALTER TABLE ADD COLUMN ... DEFAULT ...` siempre, nunca `DROP COLUMN` sin feature flag).

---

## 2. SEGURIDAD

### ✅ YA EXISTE:
- Rate Limiting (100 req/min/IP) en `middleware.ts` (verificado, 80 LOC)
- Security Headers (CORS, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy) en `next.config.ts`
- JWT session validation para rutas `/admin`
- Sistema de permisos granulares (`permissions.ts` con 13 permisos: sell, refund, discount, void_order, open_cash, etc.)

### ❌ NO EXISTE: Tabla `security_events`
- No hay registro de:
  - Logins fallidos
  - Intentos de acceso no autorizado
  - Abuso de API (429s)
  - Cambios de contraseña
  - Elevaciones de privilegios
- **Acción requerida:** Crear tabla `security_events` y registrar eventos desde el middleware y los Server Actions.

### ⚠️ PARCIAL: Protección POS contra fraude interno
- ✅ El sistema de permisos tiene `discount`, `change_prices`, `void_order`, `refund` como permisos separados.
- ❌ **No hay bloqueo de edición de ventas cerradas.** Una venta con `payment_status = 'COMPLETED'` podría teóricamente ser modificada.
- ❌ **No hay log específico de cambios de precios.** Si alguien cambia el precio de un producto, no queda registrado quién lo hizo ni cuándo.
- **Acción requerida:** Agregar trigger SQL en `products` y `pos_sales` que registre cambios en `audit_logs`.

### ⚠️ PARCIAL: Tokens JWT
- Supabase maneja la expiración de tokens automáticamente.
- El middleware valida la existencia de la cookie de sesión pero no valida la expiración del JWT en el edge.
- **Acción requerida:** Configurar `JWT expiry` corto (1 hora) con refresh tokens en Supabase Auth settings.

---

## 3. ESCALABILIDAD

### ❌ NO EXISTE: Cache (Redis / Upstash)
- El único uso mencionado de Redis es un **comentario** en `middleware.ts` línea 5: `// Para producción masiva se recomienda conectarlo a Redis (Upstash)`
- **Cada request al POS, menú digital, y configuración hace query directa a Supabase.** No hay caching de:
  - Menú (productos + categorías) — cambia pocas veces al día
  - Configuraciones del restaurante — cambia casi nunca
  - Perfil del usuario / permisos — cambia casi nunca
  - Settings generales — cambia casi nunca
- **Impacto:** Con 100+ restaurantes concurrentes, la latencia sube y el pool de conexiones de Supabase se satura (~200 conexiones directas en plan Pro).
- **Acción requerida:** Implementar Upstash Redis (serverless, compatible con Edge) o al mínimo, React `cache()` + `revalidate` en Server Components.

### ❌ NO EXISTE: Queue / Background Jobs
- Todas las operaciones se ejecutan sincrónicamente en el request HTTP.
- Para tareas pesadas (generación de PDFs, envío de emails, sincronización DIAN, reportes BI pesados), esto bloquea la UI.
- **Acción requerida:** Implementar Upstash QStash o similar para:
  - Generación de reportes PDF
  - Envío de notificaciones push/email
  - Sincronización con facturación electrónica
  - Backup automático de datos

### ⚠️ PARCIAL: Índices SQL
- **Estado anterior:** 0 índices explícitos en el esquema maestro.
- **Estado actual:** Migración `20260307000002_critical_indexes.sql` creada con ~80 índices. **Pendiente de ejecutar en Supabase.**

---

## 4. MONITOREO Y OBSERVABILIDAD

### ❌ NO EXISTE: Sentry / LogTail / DataDog
- No hay ninguna librería de error tracking instalada en `package.json`.
- Si un error ocurre en producción, **nadie se entera** hasta que el restaurante llama.
- Los errores se pierden en `console.error()` que no es persistente.
- **Acción requerida:** Instalar `@sentry/nextjs` (free tier: 5K errors/mes). Configurar DSN en variables de entorno. Wrappear Server Actions con `Sentry.captureException()`.

### ❌ NO EXISTE: Health Checks / Uptime Monitoring
- No hay endpoint `/api/health` que verifique:
  - Conexión a Supabase
  - Estado del rate limiter
  - Versión del deploy
- **Acción requerida:** Crear endpoint de health check + conectar con UptimeRobot o similar (gratis).

### ❌ NO EXISTE: Feature Flags
- No hay sistema para activar/desactivar funcionalidades por restaurante.
- Si se agrega una feature nueva, se activa para TODOS los tenants simultáneamente.
- **Riesgo:** Una feature buggy afecta a todos los clientes a la vez.
- **Acción requerida:** Implementar tabla `feature_flags` con `restaurant_id` + `feature_name` + `enabled`. Fase futura: PostHog o LaunchDarkly.

---

## 5. TESTING

### ⚠️ PARCIAL: Tests automatizados
- **Estado actual:** 2 suites, 4 tests (Jest + React Testing Library)
  - `button.test.tsx` — test de componente UI
  - `BillingMetrics.test.tsx` — test de componente de negocio
- **Lo que falta (mínimo para producción):**

| Módulo | Tests necesarios | Prioridad |
|---|---|---|
| POS (`pos.ts`) — 16KB de lógica | Crear venta, split payment, descuento, anulación | 🔴 Crítico |
| Orders (`orders-fixed.ts`) — 19KB | Crear pedido, cambiar estado, cancelar, KDS flow | 🔴 Crítico |
| Payroll (`payroll-engine.ts`) — 9KB | Calcular horas extras, novedades, comisiones | 🔴 Crítico |
| Cashier (sesiones de caja) | Abrir caja, registrar movimiento, cerrar con diferencia | 🟠 Alto |
| Auth / Permisos | Login, check permission, role escalation | 🟠 Alto |
| Inventory | Crear movimiento, verificar stock, receta con descuento | 🟡 Medio |

- **Meta sugerida:** De 4 tests → al menos 40-60 tests antes de primer cliente real.

### ❌ NO EXISTE: Tests E2E (End-to-End)
- No hay Playwright ni Cypress instalados.
- Flujos críticos (Tomar pedido → KDS → Servir → Cobrar → Cerrar caja) no se validan automáticamente.
- **Acción requerida:** Instalar Playwright. Crear 3-5 flujos E2E del happy path.

---

## 6. MODO OFFLINE

### ⚠️ PARCIAL: Offline Engine
- **YA EXISTE** (`src/lib/offline-engine.ts`, 120 LOC, verificado):
  - Singleton pattern ✅
  - Detecta `online`/`offline` events ✅
  - Guarda pedidos en `localStorage` ✅
  - Sincroniza automáticamente al reconectar ✅
  - Genera IDs offline con `crypto.randomUUID()` ✅
- **Lo que falta:**
  - ❌ **Cache de menú offline.** Si la red cae, el POS no puede mostrar productos porque se cargan desde Supabase.
  - ❌ **Cache de mesas.** El mapa de mesas no carga sin conexión.
  - ❌ **Cola local de movimientos de caja.** Si la red cae durante un cobro, el movimiento se pierde.
  - ❌ **UI indicator.** No hay indicador visible en la interfaz de que el sistema está en modo offline.
  - ❌ **Conflict resolution.** Si dos meseros crean pedidos offline con el mismo producto y el stock es insuficiente, no hay resolución de conflictos al sincronizar.

---

## 7. ARQUITECTURA DE CÓDIGO

### ⚠️ PARCIAL: Separación de lógica de dominio
- **Estado actual:** Lógica de negocio mezclada con acceso a datos en Server Actions.
  - `pos.ts` (16KB) contiene: validación, cálculos, queries SQL, formateo de respuesta — todo en un archivo.
  - `orders-fixed.ts` (19KB) mezcla transacciones SQL con lógica de estados.
- **Lo que falta:** Separación en capas:
  ```
  src/
    domain/       → Entidades y reglas de negocio puras
    services/     → Orquestación de lógica de negocio
    repositories/ → Acceso a datos (Supabase)
    integrations/ → APIs externas (Rappi, Uber, DIAN, MercadoPago)
  ```
- **Prioridad:** 🟡 Medio — hacer DESPUÉS del primer cliente pagando.

---

## 8. PRIORIDAD DE IMPLEMENTACIÓN (Orden Recomendado)

| # | Gap | Esfuerzo | Impacto Comercial | Cuando |
|---|---|---|---|---|
| 1 | **Ejecutar migración de índices SQL** | 5 min | 🔴 Crítico | **HOY** — ya creada |
| 2 | **Ejecutar migración de delivery providers** | 5 min | 🟠 Alto | **HOY** — ya creada |
| 3 | **Sentry (error monitoring)** | 2 horas | 🔴 Crítico | Antes del 1er cliente |
| 4 | **Auditar y endurecer políticas RLS** | 4-6 horas | 🔴 Crítico | Antes del 1er cliente |
| 5 | **40+ tests en flujos financieros** | 1-2 semanas | 🔴 Crítico | Antes del 1er cliente |
| 6 | **Tabla `security_events`** | 3 horas | 🟠 Alto | Antes del 1er cliente |
| 7 | **Cache (Upstash Redis)** | 1 día | 🟠 Alto | Antes del cliente #10 |
| 8 | **Endpoint `/api/health`** | 30 min | 🟡 Medio | Antes del 1er cliente |
| 9 | **Cache offline de menú + mesas** | 1-2 días | 🟠 Alto | Antes del 1er cliente |
| 10 | **Feature flags** | 4 horas | 🟡 Medio | Antes del cliente #5 |
| 11 | **Queue system (Upstash QStash)** | 1 día | 🟡 Medio | Antes del cliente #20 |
| 12 | **Tests E2E (Playwright)** | 1 semana | 🟡 Medio | Antes del cliente #10 |
| 13 | **Domain layer separation** | 2-3 semanas | 🟢 Bajo (ahora) | Antes del cliente #50 |
| 14 | **Trigger SQL anti-fraude POS** | 4 horas | 🟠 Alto | Antes del 1er cliente |

---

## RESUMEN EJECUTIVO

| Categoría | Estado |
|---|---|
| Multi-Tenant / RLS | ⚠️ Funcional pero requiere auditoría de policies |
| Seguridad perimetral | ✅ Rate limiting + CORS + Headers |
| Seguridad interna (fraude POS) | ⚠️ Permisos existen, falta enforcement en DB |
| Security Events logging | ❌ No existe |
| Cache / Redis | ❌ No existe |
| Queue / Background Jobs | ❌ No existe |
| Error Monitoring (Sentry) | ❌ No existe |
| Health Checks | ❌ No existe |
| Feature Flags | ❌ No existe |
| Tests automatizados | ⚠️ 4 tests (necesita 40-60 mínimo) |
| Tests E2E | ❌ No existe |
| Modo Offline | ⚠️ Pedidos offline OK, falta cache de menú/mesas |
| Auditoría real (audit_logs) | ✅ Tabla completa con old/new values + IP |
| Índices SQL | ⚠️ Migración creada, pendiente de ejecutar |
| Domain Layer separation | ❌ No existe (prioridad baja por ahora) |

---
*Documento generado el 7 de marzo de 2026. Verificado contra el repositorio real (mejai84/jamaliso).*
