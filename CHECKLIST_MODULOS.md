# 🚀 JAMALI OS — Roadmap Checklist 2026

## 🔐 Seguridad y Base de Datos
*Fundación técnica — sin esto no se puede vender a ningún cliente formal*

- [✅] Activar RLS en todas las tablas de Supabase (SaaS Isolation Layer. ✅)
- [✅] Crear índices en columnas restaurant_id y status (Performance Shield Active. ✅)
- [ ] Activar backups automáticos — Supabase Pro ($25/mes. ⏳)
- [ ] Implementar rate limiting en API (Next.js Middleware. ⏳)
- [ ] Auditoría de API — logging de requests, detección de uso anómalo (⏳)
- [ ] Protección contra brute force en login y endpoints críticos (⏳)
- [ ] Session management más estricto — expiración, invalidación, single-session por rol (⏳)
- [ ] Configurar JWT expiry a 1 hora en Supabase Auth (30 min. ⏳)
- [✅] Auditar variables de entorno — ningún .env en git (✅)
- [ ] Configurar CORS para solo dominios propios (30 min. ⏳)

## 🧾 Facturación Electrónica DIAN
*Obligatorio por ley en Colombia — sin esto ningún restaurante formal puede usarte*

- [✅] Investigar proveedores de facturación electrónica certificados DIAN (FacturaLatam/API DIAN. ✅)
- [✅] Integrar API de facturación con tabla receipts (Motor Fiscal Pro Anexo 1.9. ✅)
- [✅] Soporte para múltiples resoluciones DIAN por restaurante (Carga vía Wizard Fiscal. ✅)
- [✅] Generación de POS Electrónico (Documento Equivalente Electrónico sin topes de UVT. ✅)
- [ ] Envío automático de factura por WhatsApp (Integración API WhatsApp. ⏳)

## 🛒 Producto — Funcionalidades Clave
*Features que tienen los competidores y que Jamali OS necesita para competir*

- [ ] Modo offline PWA para Portal Mesero y POS (2 semanas. ⏳)
- [✅] Integración con impresoras térmicas ESC/POS (Thermal Print Active. ✅)
- [✅] KDS PRO: Filtrado por estación, Alertas Sonoras, Resumen de Producción y Gestor de Stock (✅)
- [✅] Pedidos por QR: Menú digital auto-servicio con inyección directa a KDS (✅)
- [✅] Programa de lealtad / puntos por compra (Loyalty Engine V1. ✅)
- [✅] Tienda online propia por restaurante (Web E-commerce V1. ✅)
- [✅] Módulo de autoservicio (kiosco) (Self-Service Terminal V1. ✅)
- [✅] Plano de salón visual drag & drop (Architecture Engine v2. ✅)
- [✅] Notificación al mesero cuando pedido está listo (Bell & Zap Indicators. ✅)
- [✅] WAITER PRO: Favoritos, Reloj de Servicio, Split Check, Transferencia y Unión de Mesas (✅)
- [✅] JAMALI Guardian: App móvil para el dueño (Remote Approval & Security Watchdog) (✅)

## 🔌 Integraciones y Ecosistema
*Conectar Jamali OS con el mundo exterior*

- [ ] Integración Rappi / Uber Eats → vía n8n (2 semanas. ⏳)
- [ ] Integración con datáfonos Bold / Redeban (1 mes. ⏳)
- [✅] Orden automática a proveedor cuando stock baja (Auto-Supply Smart. ✅)
- [ ] Fidelización automática: cupón tras 5 compras vía WhatsApp (2 días. ⏳)
- [ ] Reporte diario automático al dueño por WhatsApp (1 día. ⏳)
- [ ] Email marketing integrado para clientes (Futuro. ⏳)

## 📊 Analytics y Reportes
*El dueño debe sentir que recupera su inversión viendo datos reales*

- [✅] Dashboard en tiempo real para el dueño (KPIs Reales. ✅)
- [✅] Gráfico de merma semanal en pesos (Waste Report Hub. ✅)
- [✅] Margen de contribución real por plato (Contribución vs Receta. ✅)
- [✅] Widget de conciliación de caja en tiempo real (Live Cashbox. ✅)
- [✅] Reporte de rendimiento y top productos (Analytics Hub. ✅)
- [✅] Exportar reportes a Excel / PDF (✅)
- [ ] AI forecast: predicción de demanda (Año 2. ⏳)

## 💰 Módulo de Control de Caja (Smart Cashier)
*Blindaje financiero y auditoría de flujo de efectivo*

- [✅] Arqueo a ciegas: Integridad forense en el cierre (Blind closure. ✅)
- [✅] Transferencia SMART a Caja Menor: Integración de flujos (Cash-Flow Sync. ✅)
- [✅] Alertas de "Efectivo Excedido" y PIN de Autorización: (Security Shield Active. ✅)
- [✅] Impresión de Reporte Z: Comprobante térmico de cierre (Z-Report Hub. ✅)
- [✅] Registro de Novedades y Auditoría Forense: (Audit Log Active. ✅)

## 🚀 Escalabilidad Técnica
*Garantizar que el sistema soporte miles de restaurantes*

- [✅] Inventario Avanzado: Fichas Técnicas / Recetas (Descuento automático. ✅)
- [ ] CDN para imágenes (Cloudinary/Vercel) (1 día. ⏳)
- [ ] Asistente de importación masiva desde Excel (1 semana. ⏳)
- [✅] Panel de personalización de marca (Multi-tenant White Label. ✅)
- [ ] Soporte de dominios personalizados (Empresa. ⏳)
- [ ] Monitoreo de errores con Sentry (2 horas. ⏳)

## � Deuda Técnica y Resiliencia (CTO Action Plan)
*Prevención de los Puntos de Ruptura (Breacking Points) antes de escalar a 100 restaurantes*

- [ ] **Desacople Transaccional (Eventual Consistency)**: Migrar el descuento de inventario a Cola Background (Jobs) para no bloquear el checkout del POS (Urgente. ⏳)
- [ ] **Hybrid Sync KDS (Kitchen Fallback)**: Añadir `setInterval` polling al KDS como respaldo a los WebSockets caídos (Urgente. ⏳)
- [ ] **Performance Mode UI**: Diseño sólido (Sin Blur/Sombras paramétricas) para tablets Android de gama baja en Salas y Cocinas (Alta. ⏳)
- [ ] **PWA Memory Leak Prevention**: Forzar recargas de navegador invisibles (Unmounts programados) en estado de inactividad de madrugada, para vaciar DOM de React de turnos largos (Alta. ⏳)
- [ ] **Database Partitioning**: Empezar desarrollo de partición por meses en tabla `orders` para evitar colapso de Queries del Dashboard (1-3 meses. ⏳)
- [ ] **Rate Limiting Hash-based**: Migrar restricción de IPs hacia restricción por ID Dispositivo para evitar falsos bloqueos en la misma WiFi del restaurante (Media. ⏳)

## �💼 Estrategia Comercial y Legal
*Activos no técnicos para vender e invertir*

- [ ] Formalizar 3 contratos beta con clientes reales (Urgente. ⏳)
- [ ] Grabar video de tracción (Pitch inicial) (1 día. ⏳)
- [✅] Documentación de arquitectura técnica, usuario, onboarding y despliegue (✅)
- [ ] Definir planes de suscripción y página de precios (1 día. ⏳)
- [ ] Términos de servicio y política de privacidad (Urgente. ⏳)
- [ ] Pitch deck actualizado con métricas reales (Apps.co. ⏳)
- [ ] Definir SLA y proceso de soporte (Proceso. ⏳)
- [ ] Documentar casos de éxito con KPIs (Marketing. ⏳)

## ✨ UX/UI y Experiencia
*Velocidad y claridad operativa — Feeling "World-Class"*

- [✅] Implementar tipografía de alto contraste (Playfair Display + Outfit. ✅)
- [✅] Sistema de sombras multi-capa y gradientes mesh (Stripe/Apple feel. ✅)
- [✅] Modernización de loaders (Skeletons & Premium Transitions. ✅)
- [✅] Micro-interacciones y animaciones premium (Pulsos, Alertas, Modales. ✅)
- [✅] Flujo de onboarding guiado: Registro autónomo (Wizard) con marca blanca (✅)
- [ ] Tutoriales interactivos dentro de la app (1 semana. ⏳)
- [ ] Instalar como PWA en tablet de cocina y caja (2 días. ⏳)
- [ ] Modo claro/oscuro completo (1 día. ⏳)
- [ ] Atajos de teclado para POS y caja (2 días. ⏳)

## 💼 Talento Humano y Nómina (HR Management)
*Gestión de personal, incentivos y liquidación*

- [✅] Configuración Regional: Soporte Multi-País e Impuestos Dinámicos (✅)
- [✅] Contratos & Sueldos: Gestión de salario base en perfil de empleado (✅)
- [✅] Motor de Comisiones: Cálculo automático por venta cerrada en POS (✅)
- [✅] Dashboard de Nómina: Control de turnos y KPIs de talento (✅)
- [✅] Catálogo Legal: Conceptos de ley (Salud, Pensión, Horas Extra) (✅)
- [✅] Generación de Desprendibles de Pago (PDF) (✅)
- [✅] Reporte de Parafiscales e Integración Contable (SIIGO/Helisa) (✅)
- [✅] Gestión de Novedades (Incapacidades, Vacaciones, Permisos) (✅)
- [✅] Gestión de Préstamos y Adelantos de Sueldo (✅)

## 🤖 Inteligencia de Marketing & IA
*Convertir datos en ventas proactivas y automatizadas*

- [ ] **Gourmet Studio IA**: Remoción de fondos y mejora profesional de fotos de platos (⏳)
- [ ] **Algoritmo de Rescate (Churn Prevention)**: Detección automática de VIPs inactivos y envío de cupones (⏳)
- [ ] **Yield Management (Hot Deals)**: Ofertas dinámicas automáticas según ocupación de mesas (⏳)
- [ ] **WhatsApp Upselling Agent**: IA que sugiere complementos y bebidas durante el pedido (⏳)
- [ ] **Heatmap de Rentabilidad**: Análisis de Food Cost vs Ventas para ingeniería de menú (⏳)

## 📡 Hardware & Operaciones Especiales
- [ ] **Voice-to-KDS**: Comandos de voz en cocina para actualizar estado de pedidos (⏳)
- [✅] **Self-Service Kiosk**: Interfaz táctil para pedidos autónomos e integración fiscal prepago (✅)
- [ ] **Face-ID Entry**: Reconocimiento facial para asistencia y auditoría del Guardian (⏳)

## 💼 ERP Avanzado & Negocio
- [ ] **Factura OCR Scanner**: Carga de compras mediante foto con extracción de datos automática (⏳)
- [ ] **Gourmet Subscriptions**: Venta de membresías y recurrencia para clientes (⏳)
- [ ] **Simulador de Food Cost**: Análisis de impacto ante cambios de precios de insumos (⏳)
- [✅] **Multilingüismo Pro**: Localización total (idioma, fiscalidad y cultura) por país (✅)

## 🛡️ Seguridad Forense (Guardian Expansion)
- [ ] **Guardian Vision**: Vinculación de eventos de seguridad con marcas de tiempo en video NVR (⏳)
- [ ] **CRM de Sentimiento**: Análisis de satisfacción y comportamiento recurrente del cliente (⏳)
- [ ] **App Store de Extensiones**: Ecosistema para activar módulos de terceros sobre JAMALISO (⏳)
