# 🐟 JAMALI OS - Sistema Integral de Gestión Gastronómica
¡Sistema de alto rendimiento implementado! Aquí encontrarás la guía para todas las funcionalidades de nivel empresarial.

## 📖 MANUAL DE OPERACIÓN PRO (NUEVO)
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

### 5. 💳 Pagos Locales (Wompi)
- Integración con Wompi Colombia (Tarjetas, Nequi, PSE).

---
## 🏗️ Documentación del Sistema (Developer & Admin)
Para profundizar en el funcionamiento interno y la escalabilidad del sistema:

1.  **[Blueprint de Arquitectura](docs/ARCHITECTURE_BLUEPRINT.md)**: Stack técnico y patrones de diseño.
2.  **[Diccionario de Datos](docs/DATA_DICTIONARY.md)**: Esquema de base de datos y reglas de negocio.
3.  **[Guía de Despliegue y Seguridad](docs/DEPLOYMENT_SECURITY_GUIDE.md)**: Checklist para pasar a producción.
4.  **[Guía de Onboarding](docs/ONBOARDING_RESTAURANTS.md)**: Pasos para configurar un nuevo negocio.

---
## 🚀 Estructura del Sistema
- **Admin**: `/admin` (Dashboard General)
- **Meseros**: `/admin/waiter` (Optimizado para tablets/móvil)
- **Cocina**: `/admin/kitchen` (KDS en tiempo real)

> **Importante**: No subir este código a GitHub sin autorización. Respetar políticas de privacidad de datos.
