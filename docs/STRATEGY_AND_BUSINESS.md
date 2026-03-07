# 💼 Estrategia de Negocio y Go-To-Market — JAMALI OS
> **Versión:** 2.0 (Consolidado)
> **Fecha:** 7 de marzo de 2026
> **Fuente:** Unificación de `VISION_ROADMAP.md`, `PRODUCT_STRATEGY_JAMALI_OS.md`, `DISTRIBUTION_STRATEGY.md`, `WHITE_LABEL_CONCEPT.md`

---

## 1. VISIÓN DEL PRODUCTO

JAMALI OS es un **Sistema Operativo para Restaurantes** — no solo un POS. Es una plataforma SaaS Multi-Tenant que combina operaciones (POS, KDS, inventario), finanzas (caja, nómina) e inteligencia de negocio (reportes, BI, IA predictiva) en una sola interfaz web.

### Posicionamiento Competitivo
JAMALI OS se posiciona como el **"Punto Medio Perfecto"**:
- **Qamarero / Poster** → Demasiado ligero para crecer
- **Toast / Lightspeed** → Demasiado caro/complejo para empezar
- **JAMALI OS** → Potencia Enterprise, Setup de Startup

| Sección | Propuesta de Valor |
|---|---|
| **Hero** | "La robustez de una gran cadena, lista en tu navegador en 5 minutos." |
| **Hardware** | "Usa tus tablets o móviles con interfaz diseñada para el ritmo real de una cocina." |
| **Setup** | "Sube tu carta y deja que JAMALI OS configure inventario y mesas automáticamente." |
| **Reporting** | "No solo gráficas — te decimos qué platos te están haciendo perder dinero hoy." |

---

## 2. MÓDULOS Y PRICING (SaaS)

| Plan | Precio Sugerido | Incluye |
|---|---|---|
| **Starter** | $60 USD/mes | POS, Mesas, KDS básico, 1 sucursal |
| **Pro** | $120 USD/mes | + Inventario, Recetas, Nómina, Reportes BI, Multi-sucursal |
| **Enterprise** | $250+ USD/mes | + White-Label, API, Delivery integrado, IA Predictiva |

---

## 3. GO-TO-MARKET: Vender DISTRIBUIDORES, no Restaurantes

**Modelo B2B2C:** No vender puerta a puerta. Vender a distribuidores que ya tienen la confianza de restaurantes.

```
Vender uno por uno: 1000 restaurantes = Años de trabajo
Vender distribuidores: 10 distribuidores × 100 clientes = 1000 restaurantes rápido
```

### Los 7 Canales de Distribución (Resellers)

| # | Canal | Gancho Commercial |
|---|---|---|
| 1 | **Empresas de Hardware POS** | Venden "Combo Físico + Software (Powered by JAMALI)". Revenue Share 50/50. |
| 2 | **Contadores Especializados** | Facturación Electrónica DIAN nativa → El contador obliga a sus clientes a usar JAMALI. |
| 3 | **Empresas de Pagos (Fintech)** | Integración fluida de Pagos Integrados. Pasarelas lo recomiendan como "Software Homologado". |
| 4 | **Agencias de Marketing Gastronómico** | POS + IA Marketing + WhatsApp. Ningún POS ofrece esto. |
| 5 | **Franquicias y Cadenas** | Licencia Enterprise, métricas consolidadas, cobro por nodo (sucursal). |
| 6 | **Agregadores de Delivery** | Gestión unificada de pedidos Rappi/UberEats en el KDS. |
| 7 | **Distribuidores de Insumos** | AlertAs de stock mínimo generan pedidos automáticos a proveedores. Comisión pasiva. |

---

## 4. WHITE-LABEL (Marca Blanca)

### Concepto
El software se revende con la marca del partner sin que aparezca "JAMALI OS".

**Ejemplo:**
- El partner "TechRest" vende a restaurantes → $60 USD/mes
- JAMALI OS cobra al partner → $20 USD/mes
- Si el partner tiene 200 restaurantes → $4,000 USD/mes de MRR sin contactar un solo restaurante

### Arquitectura DB
```
tenants (Partner/Reseller)
  └── restaurants (Sucursales del partner)
       └── profiles (Usuarios)
```

### Personalización por Partner
1. **Branding:** Logo, color principal, Favicon
2. **PWA:** Nombre de la app, SplashScreen
3. **Documentos:** Logo en facturas DIAN y recibos térmicos
4. **Comunicaciones:** Remitente de SMS, emails, WhatsApp bot

### Estado de Implementación
- ✅ **Fase 1 (COMPLETADA):** Tabla `tenants`, `RestaurantProvider`, branding dinámico, dashboard Partners
- 🔄 **Fase 2 (PENDIENTE):** Split payments, dominios dinámicos, logos en factura DIAN

---

## 5. ROADMAP (Fases de Escalabilidad)

### ✅ Fase 1: Base Sólida (Meses 0–3) — COMPLETADA
- [x] Arquitectura SaaS Multi-Tenant (RLS)
- [x] Dashboard Financiero (Food Cost y Mermas)
- [x] CI/CD en GitHub Actions
- [x] Consolidación de migraciones (DB Squash)
- [x] Motor de Nómina (Payroll Engine)
- [x] POS robusto con Framer Motion
- [x] Flujo Mesero → KDS → Caja
- [x] PWA con Service Worker

### 🔄 Fase 2: Integración (Meses 3–6) — EN PROGRESO
- [x] Multi-proveedor Delivery (Rappi/Uber Eats/Flota Propia)
- [ ] Facturación Electrónica DIAN con proveedor real (Alegra/Siigo)
- [ ] Automatización de flujos WhatsApp (n8n)
- [ ] Integración física de pagos (datáfonos QR)

### Fase 3: Experiencia (Meses 6–9)
- [x] Pedidos QR desde mesa
- [ ] App móvil de monitoreo para dueños
- [ ] Fidelización (Puntos, Cupones automáticos)
- [ ] Kioscos de Autoservicio

### Fase 4: Inteligencia (Meses 9–12) 🧠
- [ ] Forecasting de demanda ("Se espera +18% el próximo jueves")
- [ ] Anomaly Detection (alertas de fraude vía WhatsApp)
- [ ] Upsell Asistido al Mesero (copilot de ventas)
- [ ] Benchmarking de Rentabilidad (food cost vs margen)

### Fase 5: Dominio (>12 meses)
- [ ] API Pública abierta
- [ ] Suscripciones automatizadas SaaS
- [ ] Micro-créditos basados en ventas comprobadas

---

## 6. EL FOSO ECONÓMICO (The Moat)

JAMALI OS no compite en la "Guerra de los POS baratos". Su valoración se sostiene en **La Fusión de 4 Ecosistemas**:

1. **ERP/POS Real** — Inventario, recetas, mermas, flujos de caja
2. **Fintech** — Pagos integrados, proyecciones para micro-créditos
3. **Growth (WhatsApp + IA)** — Marketing automático y fidelización
4. **White-Label** — Sistema diseñado desde la BD para ser remarcado por partners

---

## 7. SOPORTE Y MÉTRICAS DE ÉXITO

| Métrica | Objetivo |
|---|---|
| **Uptime** | > 99.9% |
| **Churn Rate** | < 5% mensual |
| **SLA Respuesta** | < 2h para incidencias críticas |
| **Onboarding** | < 30 min desde registro hasta primer pedido |

---
*Documento consolidado el 7 de marzo de 2026. Unifica la visión, estrategia comercial, white-label y roadmap en un solo documento.*
