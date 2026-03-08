# 🚀 JAMALI OS - Sistema de Operación Gastronómica Inteligente
¡Sistema de alto rendimiento implementado! Aquí encontrarás la guía para todas las funcionalidades de nivel empresarial.

## � Transición de Marca (Marzo 2026)
El sistema ha migrado completamente de "Pargo OS" a **JAMALI OS**. Este cambio incluye:
- Nueva identidad visual premium (Pixora Light).
- Unificación de dominios y correos electrónicos (@jamali-os.com).
- Consolidación de base de datos y arquitectura escalable.

## �📖 MANUAL DE OPERACIÓN PRO (NUEVO)
> **[Consultar Manual de Usuario Vivo y Guía de Pruebas](MANUAL_DE_USUARIO_VIVO.md)**
Este documento es la referencia definitiva para:
- Pantalla de Cocina (KDS PRO)
- Portal de Meseros (Waiter Pro)
- Guía para realizar pruebas de calidad.

## 📚 Documentación por Módulo
### 1. 🔔 [Notificaciones y Realtime](NOTIFICACIONES_README.md)
- Sistema de alertas para cocina
- Notificaciones de estado para clientes
- Sonidos y alertas de navegador

### 2. 📱 [Portal de Meseros (Waiter Pro)](/admin/waiter)
- Favoritos de acceso rápido.
- Alertas de tiempo de servicio (Pulso Rojo).
- División de cuentas (Split Check) y Unión de Mesas.
- Transferencia de ítems entre mesas.

### 3. 👨‍🍳 [Cocina KDS PRO](/admin/kitchen)
- Resumen de producción por ingredientes.
- Alertas sonoras inteligentes.
- Gestión de Stock Crítico (Marcar Agotado).

### 4. 📦 [Control de Inventario](IMPLEMENTACION_INVENTARIO.md)
- Gestión de ingredientes y recetas.
- Descuento automático de stock.

### 5. 💳 Pagos Integrados (**Mercado Pago**)
- Integración nativa con **Mercado Pago** para planes Starter, Pro y Enterprise.
- Webhooks de validación y control de suscripciones.

### 6. 💼 [JAMALI PAYROLL PRO](/admin/payroll)
- **Cumplimiento Legal**: Motor de liquidación para Colombia (SMLV, Salud, Pensión, ARL, Auxilio Transporte).
- **Provisiones IFRS**: Acumulación automática de Prima, Cesantías y Vacaciones.
- **Transacciones ACID**: Dispersión segura de pagos y control de costo real de empresa (Employer Cost).

### 7. 🌐 [Ventas Online Central](/admin/online-sales)
- Activación de Web Pública y Menú Digital.
- Configuración de SEO, Instagram y Facebook.
- Switch dinámico entre Menú y E-commerce.

### 8. 🛡️ [JAMALI Guardian (Owner App)](/admin/guardian)
- **Detección de Fraude**: Triggers automáticos para anulación de tickets y descuentos atípicos.
- **Autorización Remota**: El dueño aprueba o rechaza acciones críticas desde su móvil.
- **Watchdog de Inventario**: Alerta push por bajo stock de insumos clave.
- **KPIs en Vivo**: Ingreso neto, margen real y labor cost en tiempo real.
- **Inteligencia Predictiva**: Scoring IA de sospecha (0-100%) y detección de ráfagas (Burst Detection).
- **Multi-Sede Central**: Gestión unificada de todas las sucursales desde la misma interfaz.

### 9. 🛡️ Arquitectura Enterprise & Seguridad
- **Modo Offline (PWA)**: Interfaz resiliente ante caídas de internet en el restaurante.
- **Testing & CI/CD**: Suite de Jest automatizada conectada a GitHub Actions.
- **Edge Security**: Rate Limiting y CORS estrictos para repeler ataques automatizados.

---
## 🏗️ Documentación del Sistema (Developer & Admin)
Para profundizar en el funcionamiento interno y la escalabilidad del sistema:

1.  **[Arquitectura JAMALI OS](docs/ARCHITECTURE_JAMALISO.md)**: Stack técnico, patrones de diseño y estándares visuales (Glassmorphism).
2.  **[Diccionario de Datos](docs/DATA_DICTIONARY.md)**: Esquema de base de datos y reglas de negocio.
3.  **[Estructura Base de Datos](docs/DATABASE_JAMALISO.md)**: Tablas, RLS y referencialidad.
4.  **[Guía de Onboarding](docs/ONBOARDING_RESTAURANTS.md)**: Pasos para configurar un nuevo negocio.

---
## 🚀 Estructura del Sistema
- **Admin**: `/admin` (Dashboard General)
- **Meseros**: `/admin/waiter` (Optimizado para tablets/móvil)
- **Cocina**: `/admin/kitchen` (KDS en tiempo real)

> **Protección Legal**: Copyright (c) 2026 Jaime Jaramillo. Todos los derechos reservados. Este código es propiedad exclusiva del autor y está protegido por la Ley 23 de 1982. Prohibida su reproducción sin autorización escrita.
