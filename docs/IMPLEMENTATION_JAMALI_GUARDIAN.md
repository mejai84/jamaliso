# 🛡️ JAMALI GUARDIAN: El Ojo del Propietario

JAMALI GUARDIAN es un subsistema móvil diseñado para que dueños de restaurantes y desarrolladores tengan control total, en tiempo real, sobre la seguridad financiera y operativa de sus sedes.

## 🚀 Hoja de Ruta de Desarrollo

### ✅ Fase 1: Núcleo y Seguridad (COMPLETADO)
- [x] Acceso multi-rol restringido (`owner`, `developer`).
- [x] Tabla `security_audit` y triggers SQL de watchdog (Anulaciones y Descuentos).
- [x] Tema "Pixora Elite" (Dark/Red UI especializada).
- [x] Suscripción Real-time para alertas inmediatas en el móvil.

### ✅ Fase 2: Control Remoto y Bodega (COMPLETADO)
- [x] **Autorización Remota**: Sistema de aprobación/rechazo de eventos fiscales vía Server Actions.
- [x] **Watchdog de Inventario**: Alertas de stock crítico integradas en el feed del Guardian.
- [x] **Gestos y UI App-like**: Animaciones fluidas (`framer-motion`) y navegación táctil optimizada.

### ✅ Fase 3: Inteligencia Predictiva (COMPLETADO)
- [x] **KPIs Reales**: Conexión de métricas de Ingreso Neto, Margen Real y Labor Cost.
- [x] **Scoring de Riesgo Multi-Factor**: Algoritmo IA que pondera Anulaciones, Descuentos y Historial Forense.
- [x] **Burst Detection**: Alertas automáticas por ráfagas de anulaciones en ventanas cortas de tiempo.

### ✅ Fase 4: Multi-Sede Elite (COMPLETADO)
- [x] **Selector de Restaurante**: Capacidad para alternar entre todas las sucursales del ecosistema JAMALI de forma instantánea.
- [x] **Filtrado Inteligente**: Carga dinámica de alertas y métricas según la sede seleccionada.

---

## 🛠️ Stack Técnico e Inteligencia

1. **DB Watchdogs**: Triggers en PostgreSQL que vigilan las tablas `orders` e `ingredients`.
2. **AI scoring Engine**: Vista `guardian_employee_risk` que calcula el índice de sospecha (0-100%).
3. **Pattern Watchdog**: Trigger `pattern_anomaly_watchdog` que detecta ráfagas (BURST) y scores críticos.
4. **Realtime Link**: `supabase.channel('guardian-alerts')` empuja los datos al componente React.
5. **Remote Handlers**: Los dueños envían la decisión vía `authorizeEvent()` (acción de servidor).

---

> [!IMPORTANT]
> **Seguridad Estricta**: Este módulo ignora cualquier perfil que no sea del círculo de confianza superior. Ni siquiera los 'Managers' tienen acceso a esta capa de auditoría forense.
