# AUDITORÍA TÉCNICA Y DEUDA TÉCNICA - JAMALI OS (2026)

Este documento registra las vulnerabilidades, la deuda técnica y los bloqueadores comerciales críticos detectados en la arquitectura, con el objetivo de convertir el "MVP Avanzado" en un "Producto de Producción Enterprise" y mitigar riesgos antes de auditorías de inversión.

## 🔴 BLOQUEADORES COMERCIALES Y LEGALES (Prioridad Crítica)

- [ ] **Facturación Electrónica (DIAN & SAT):** Integrar proveedor tecnológico autorizado. Sin esto, la comercialización con restaurantes formales está bloqueada legalmente.
- [ ] **Modo Offline (PWA) Robusto:** Implementar un Service Worker real y estrategia de caché. El sistema actual colapsa ante la pérdida de conectividad en el restaurante. Prioridad para la estabilidad en el mundo real.
- [ ] **Cero Clientes Piloto Pagando:** Requisito de salir al mercado. Confirmar al menos 3 restaurantes beta operativos para validar los flujos reales de caja y cocina.

## 🟠 DEUDA TÉCNICA DE ARQUITECTURA (Prioridad Alta)

- [ ] **Archivos Monolíticos (LOC Excesivo):** Módulos como `waiter/page.tsx` (950 líneas) y `orders/page.tsx` (865 líneas) deben ser refactorizados. Dividir en componentes discretos de UI (< 150 líneas) para permitir escalabilidad y equipos de múltiples desarrolladores.
- [ ] **Ausencia de Pruebas Automatizadas (Testing):** Cero (0) test unitarios o de integración. Se requiere instaurar Jest / React Testing Library inmediatamente. Riesgo extremo de regresiones y errores en cascada por cada cambio en el panel. El objetivo de una refinería es al menos un 70% de Test Coverage.
- [ ] **Falta de Pipeline CI/CD:** Implementar un flujo en GitHub Actions que impida hacer `push` o `merge` si el código no compila o no pasa los tests automatizados.
- [ ] **Archivos y Rutas "Fantasma":** Hacer una limpieza general del routing. Eliminar o implementar verdaderamente las rutas de prueba (`[slug]`, `[mesa]`, etc.) que actualmente se encuentran vacías.

## 🟡 SEGURIDAD Y PROTECCIÓN DE DATOS (Prioridad Media/Alta)

- [ ] **Auditoría de Seguridad (Pen Testing):** El sistema actual no cuenta con rate limiting asíncrono robusto, las políticas de expiración del JWT de Supabase son demasiado flexibles.
- [ ] **CORS y Headers de Seguridad:** Endurecer las vías de comunicación de la API hacia clientes externos evitando uso malintencionado.

---
> **Nota del Arquitecto IA:** El aspecto visual (UI/UX) es de grado $100K+. Los inversores lo alabarán. Sin embargo, para sostener esa valoración, la arquitectura subyacente (este checklist) debe igualar dicho nivel de profesionalismo. No hay crecimiento sin cimientos fuertes.
