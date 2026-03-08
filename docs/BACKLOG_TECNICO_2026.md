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

### ✅ YA EXISTE: Protección POS contra fraude interno
- El sistema de permisos tiene `discount`, `change_prices`, `void_order`, `refund` como permisos separados.
- **Bloqueo de edición de ventas cerradas:** Se ha agregado un trigger SQL `prevent_closed_order_tampering` que lanza error y auditoría si se intenta alterar una orden con status `COMPLETED`.
- **Log de cambios de precios:** El SQL desencadena `log_product_price_change` que inserta un registro transparente en la nueva tabla `security_events` de cada modificación de precio.

### ⚠️ PARCIAL: Tokens JWT
- Supabase maneja la expiración de tokens automáticamente.
- El middleware valida la existencia de la cookie de sesión pero no valida la expiración del JWT en el edge.
- **Acción requerida:** Configurar `JWT expiry` corto (1 hora) con refresh tokens en Supabase Auth settings.

---

## 3. ESCALABILIDAD

### ✅ YA EXISTE: Cache Nativo (Next.js Edge Caching)
- **Problemática Original:** Cada acceso al Menú QR leía los datos directos de Supabase, lo cual colapsaba la cantidad concurrente de usuarios en un mismo tenant (SaaS).
- **Solución implementada:** Se ha estructurado `src/actions/cache.ts`. Toda llamada de clientes hacia el perfil o catálogo del menú ahora atraviesa un túnel protegido mediante `unstable_cache`.
  - Configuración del restaurante (`getCachedRestaurantBySlug`) y variables de marca.
  - Catálogo y Menú digital (`getCachedMenu`) que retiene categorías y productos con un TTL dinámico de una hora.
- Las consultas excesivas se bloquean en el Edge de Vercel/Next sin tocar la base de datos de Postgres.
- **Acción requerida (futuro corporativo):** Si múltiples clientes VIP lo necesitan, escalar esta integración conectándola con una instancia Upstash/Redis central.

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

### ⚠️ PARCIAL: Sentry / LogTail / DataDog
- Se ha instalado e inicializado el SDK de `@sentry/nextjs` (archivos globales: `sentry.client.config.ts`, `sentry.server.config.ts` y en `next.config.ts`).
- Server Actions críticos de cobro (e.g. `processOrderPayment`) fueron modificados para registrar la variable con `Sentry.captureException()`.
- **Acción requerida:** Vincular variable de entorno `NEXT_PUBLIC_SENTRY_DSN` a la infraestructura de Sentry del proveedor gratuito e inyectar el setup en todo el clúster.

### ✅ YA EXISTE: Health Checks / Uptime Monitoring
- Endpoint de monitoreo base habilitado en `/api/health` 
  - Verificación de la conexión y latencia de Supabase.
  - Verifica el API general de la App y emite 200/503 dependiendo dictando "healthy" o "degraded"
- **Acción requerida (Opción futura):** Conectar a herramientas como UptimeRobot para rastreo en tiempo real constante fuera de AWS.

### ❌ NO EXISTE: Feature Flags
- No hay sistema para activar/desactivar funcionalidades por restaurante.
- Si se agrega una feature nueva, se activa para TODOS los tenants simultáneamente.
- **Riesgo:** Una feature buggy afecta a todos los clientes a la vez.
- **Acción requerida:** Implementar tabla `feature_flags` con `restaurant_id` + `feature_name` + `enabled`. Fase futura: PostHog o LaunchDarkly.

---

## 5. TESTING

### ⚠️ PARCIAL: Tests automatizados
- **Estado actual:** 2 suites completas, más scaffolding base en progreso (Jest + React Testing Library).
  - `button.test.tsx` — test de componente UI
  - `BillingMetrics.test.tsx` — test de componente de negocio
  - *Módulos inicializados:* `pos.test.ts`, `orders-fixed.test.ts`, `payroll-engine.test.ts`.
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

### ⚠️ PARCIAL: Tests E2E (End-to-End)
- ✅ Playwright instalado y configurado (`playwright.config.ts`).
- ✅ Scaffolding de E2E base (`pos-flow.spec.ts`) creado para repasar flujos críticos.
- ✅ Creada guía (workflow) en `.agent/workflows/run-tests.md`.
- **Acción requerida:** Completar y expandir los flujos en los tests E2E y configurar en CI.

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
| Data Flow (Import/Export) | Motores CSV/Excel + Wizard de Mapeo Inteligente (Pixora Design) | Implementado (Inventario, Productos, Clientes, Empleados, Factura, Reservas, Recetas) | 100% |

---
*Documento generado el 7 de marzo de 2026. Verificado contra el repositorio real (mejai84/jamaliso).*
