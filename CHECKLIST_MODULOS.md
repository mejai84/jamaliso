# 🚀 JAMALI OS — Roadmap Checklist 2026

## 🔐 Seguridad y Base de Datos
*Fundación técnica — sin esto no se puede vender a ningún cliente formal*

- [x] Activar RLS en todas las tablas de Supabase (Row Level Security para aislar datos. ✅)
- [ ] Crear índices en columnas restaurant_id y status (SQL, 30 min. ⏳)
- [ ] Activar backups automáticos — Supabase Pro ($25/mes. ⏳)
- [ ] Implementar rate limiting en API (Next.js Middleware. ⏳)
- [ ] Configurar JWT expiry a 1 hora en Supabase Auth (30 min. ⏳)
- [ ] Auditar variables de entorno — ningún .env en git (15 min. ⏳)
- [ ] Configurar CORS para solo dominios propios (30 min. ⏳)

## 🧾 Facturación Electrónica DIAN
*Obligatorio por ley en Colombia — sin esto ningún restaurante formal puede usarte*

- [ ] Investigar proveedores de facturación electrónica certificados DIAN (1 semana. ⏳)
- [ ] Integrar API de facturación con tabla receipts (2 semanas. ⏳)
- [ ] Soporte para múltiples resoluciones DIAN por restaurante (1 semana. ⏳)
- [ ] Generación de PDF de factura y envío por WhatsApp (3 días. ⏳)

## 🛒 Producto — Funcionalidades Clave
*Features que tienen los competidores y que Jamali OS necesita para competir*

- [ ] Modo offline PWA para Portal Mesero y POS (2 semanas. ⏳)
- [ ] Integración con impresoras térmicas ESC/POS (1 semana. ⏳)
- [✅] KDS PRO: Filtrado por estación, Alertas Sonoras, Resumen de Producción y Gestor de Stock (✅)
- [ ] Programa de lealtad / puntos por compra (1 semana. ⏳)
- [ ] Tienda online propia por restaurante (1 mes. ⏳)
- [ ] Módulo de autoservicio (kiosco) (Enero 2026. ⏳)
- [ ] Plano de salón visual drag & drop (1 semana. ⏳)
- [✅] Notificación al mesero cuando pedido está listo (Bell & Zap Indicators. ✅)
- [✅] WAITER PRO: Favoritos, Reloj de Servicio, Split Check, Transferencia y Unión de Mesas (✅)
- [ ] App móvil para el dueño (PWA) (1 semana. ⏳)

## 🔌 Integraciones y Ecosistema
*Conectar Jamali OS con el mundo exterior*

- [ ] Integración Rappi / Uber Eats → vía n8n (2 semanas. ⏳)
- [ ] Integración con datáfonos Bold / Redeban (1 mes. ⏳)
- [ ] Orden automática a proveedor cuando stock baja (3 días. ⏳)
- [ ] Fidelización automática: cupón tras 5 compras vía WhatsApp (2 días. ⏳)
- [ ] Reporte diario automático al dueño por WhatsApp (1 día. ⏳)
- [ ] Email marketing integrado para clientes (Futuro. ⏳)

## 📊 Analytics y Reportes
*El dueño debe sentir que recupera su inversión viendo datos reales*

- [ ] Dashboard en tiempo real para el dueño (3 días. ⏳)
- [ ] Gráfico de merma semanal en pesos (1 día. ⏳)
- [ ] Margen de contribución real por plato (2 días. ⏳)
- [ ] Widget de conciliación de caja en tiempo real (1 día. ⏳)
- [ ] Reporte de rendimiento por mesero (2 días. ⏳)
- [ ] Exportar reportes a Excel / PDF (3 días. ⏳)
- [ ] AI forecast: predicción de demanda (Año 2. ⏳)

## 🚀 Escalabilidad Técnica
*Garantizar que el sistema soporte miles de restaurantes*

- [ ] Implementar caché con Upstash Redis (1 día. ⏳)
- [ ] CDN para imágenes (Cloudinary/Vercel) (1 día. ⏳)
- [ ] Asistente de importación masiva desde Excel (1 semana. ⏳)
- [ ] Panel de personalización de marca (Multi-tenant) (1 semana. ⏳)
- [ ] Soporte de dominios personalizados (Empresa. ⏳)
- [ ] Monitoreo de errores con Sentry (2 horas. ⏳)

## 💼 Estrategia Comercial y Legal
*Activos no técnicos para vender e invertir*

- [ ] Formalizar 3 contratos beta con clientes reales (Urgente. ⏳)
- [ ] Grabar video de tracción (Pitch inicial) (1 día. ⏳)
- [ ] Documentación de arquitectura técnica (2 días. ⏳)
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
- [ ] Micro-interacciones con Framer Motion en Portal Mesero (⏳)
- [ ] Flujo de onboarding guiado (1 semana. ⏳)
- [ ] Tutoriales interactivos dentro de la app (1 semana. ⏳)
- [ ] Instalar como PWA en tablet de cocina y caja (2 días. ⏳)
- [ ] Modo claro/oscuro completo (1 día. ⏳)
- [ ] Atajos de teclado para POS y caja (2 días. ⏳)
