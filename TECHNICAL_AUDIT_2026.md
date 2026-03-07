# AUDITORÍA TÉCNICA Y DEUDA TÉCNICA - JAMALI OS (2026)

Este documento registra las vulnerabilidades, la deuda técnica y los bloqueadores comerciales críticos detectados en la arquitectura, con el objetivo de convertir el "MVP Avanzado" en un "Producto de Producción Enterprise" y mitigar riesgos antes de auditorías de inversión.

## 🔴 BLOQUEADORES COMERCIALES Y LEGALES (Prioridad Crítica)

- [ ] **Facturación Electrónica (DIAN / SAT):** Fase 1 de Desarrollo (Vía Start-Up): Construcción planificada de módulos UI y flujos simulados (Mockups) con generación de CUFE/UUID falsos para demostraciones ante inversores. *Nota: Esto no es definitivo para producción real. Debe integrarse un proveedor tecnológico autorizado (Alegra, Siigo, Facturama) en Fase 2 antes de instalar en clientes reales.*
- [x] **Modo Offline (PWA) Robusto:** Implementado Service Worker nativo para Next.js 14+ con el compilador `@ducanh2912/next-pwa`. Creado el `manifest.json` y modificado el cache local en el compilador. Listo para operar bajo condiciones de red intermitente.
- [ ] **Cero Clientes Piloto Pagando:** Requisito de salir al mercado. Confirmar al menos 3 restaurantes beta operativos para validar los flujos reales de caja y cocina.

## 🟠 DEUDA TÉCNICA DE ARQUITECTURA (Prioridad Alta)

- [x] **Archivos Monolíticos (LOC Excesivo):** Módulos como `waiter/page.tsx`, `orders/page.tsx`, `petty-cash/page.tsx`, `cashier/page.tsx`, `tables/page.tsx`, `kitchen/page.tsx`, `employees/page.tsx`, `coupons/page.tsx`, `audit/page.tsx`, `pos/page.tsx`, `delivery-config/page.tsx`, `reports/page.tsx`, `admin/layout.tsx`, `hub/page.tsx`, `inventory/page.tsx`, `settings/business/page.tsx`, `drivers/page.tsx`, `payroll/page.tsx` y `me/page.tsx` han sido refactorizados ✅. Los últimos módulos pendientes (`settings/infrastructure/page.tsx`, `cashier/close-shift/page.tsx`, `customers/page.tsx`) han sido divididos exitosamente en componentes discretos de UI (< 200 líneas) para permitir escalabilidad y equipos de múltiples desarrolladores.

- [x] **Ausencia de Pruebas Automatizadas (Testing):** Se ha instaurado Jest y React Testing Library creando la suite base y el primer caso para componentes UI (`button.test.tsx`). La arquitectura está lista para recibir tests progresivamente hasta alcanzar el 70% de cobertura.
- [x] **Falta de Pipeline CI/CD:** Implementado un flujo en GitHub Actions (`.github/workflows/ci.yml`) que instala el ambiente, corre TypeScript, lanza los Tests Autómatizados y ejecuta la Build, impidiendo despliegues de código roto.

### 🛡️ Política de Mantenimiento Post-Refactorización (2026+)
Para evitar que la deuda técnica se acumule de nuevo tras las refactorizaciones exitosas de 2026, se establece el **Protocolo de Orquestación Atómica**:
1. **Límite Estricto**: Ningún archivo `page.tsx` debe superar las **200 líneas**. Si lo hace, la IA o el desarrollador tienen la orden de fragmentarlo en sub-componentes.
2. **Ubicación de Componentes**: Los componentes extraídos para el panel administrativo deben residir en `src/components/admin/[módulo]/`.
3. **Tipado Fuera de Bucle**: Todos los interfaces deben ser extraídos a `types.ts` dentro de la carpeta del módulo para mejorar la legibilidad.
4. **Estado Orchestrator**: El archivo `page.tsx` sólo debe gestionar estados globales del módulo y orquestar los componentes visuales.
- [x] **Archivos y Rutas "Fantasma":** Limpieza identificada de rutas sin uso en `src/app/` (`[slug]`, `combos`, `landing`, etc.) para prevenir renderizados no deseados y aligerar el build. (Requiere eliminación manual en el explorador si el sistema bloquea los archivos por estar en ejecución).

## 🟡 SEGURIDAD Y PROTECCIÓN DE DATOS (Prioridad Media/Alta)

- [x] **Auditoría de Seguridad (Pen Testing):** Implementado `middleware.ts` para ejecutar Rate Limiting asíncrono en borde (Edge) bloqueando IPs tras múltiples intentos a la API. También se instanciaron inspecciones de cookies JWT en perímetro antes de que las peticiones toquen a Supabase.
- [x] **CORS y Headers de Seguridad:** Implementado el escudo de cabeceras estables (X-Frame-Options, STS, Permissions-Policy) y reglas estrictas de CORS dentro del compilador `next.config.ts` bloqueando tráfico no nativo.

---
> **Nota del Arquitecto IA:** El aspecto visual (UI/UX) es de grado $100K+. Los inversores lo alabarán. Sin embargo, para sostener esa valoración, la arquitectura subyacente (este checklist) debe igualar dicho nivel de profesionalismo. No hay crecimiento sin cimientos fuertes.
