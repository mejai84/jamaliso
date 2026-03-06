# Marca Blanca (White Label) en Jamali OS

_Este documento define la arquitectura "Marca Blanca" que convertirá a Jamali OS en un ecosistema de reventa valorado en millones de dólares escalando a nivel global, sin fuerza de ventas propia._

---

## 1. ¿Por qué Marca Blanca? La Estrategia Millonaria

Marca blanca (white-label) significa que tu software se puede revender con la marca de otra empresa, sin que aparezca el nombre original de tu producto.

### El Caso Práctico: "TechRest POS"

Supongamos que el motor Jamali OS lo licencia una empresa externa llamada **TechRest** (ej: vendedores de datáfonos o consultores gastronómicos).

El cliente final (el restaurante) verá esto:

- **Nombre:** TechRest POS
- **Landing Page:** `techrestpos.com`
- **Dashboard:** `login.techrestpos.com`
- **Facturas y Recibos:** Impresos con logos y colores de "TechRest".

**La ventaja:** Ellos consiguen a los restaurantes (fuerza de ventas). Tú mantienes el software (tecnología).

### Modelo Típico SaaS White-Label (Revenue Share)

- Empresa partner vende a restaurante → $60 USD/mes
- Tú le cobras al partner → $20 USD/mes
- _Si el partner consigue 200 restaurantes, tú facturas $4,000 USD/mes sin haber contactado a un solo restaurante._

---

## 2. Los 4 Pilares Comerciales de Jamali OS

Para que este software no compita en un "océano rojo" contra monstruos como Toast, Square o Lightspeed, la oferta debe ser una categoría nueva. La estrategia propuesta es:

1. **POS restaurante completo** (Motor transaccional exacto)
2. **Automatización con WhatsApp** (Pedidos y reservaciones nativas)
3. **IA Marketing** (Predicción, recetas cruzadas auto-creadas, Upsell automático)
4. **White Label para Partners** (Oportunidad enterprise B2B)

El ecosistema = **"POS + Pagos + Financiamiento + IA"**

---

## 3. Arquitectura Técnica de White-Label (BD)

Para soportar que un revendedor tenga múltiples restaurantes y tú múltiples revendedores, la arquitectura pasa de un nivel a tres niveles:

### Nivel 1: El Tenant Core (Revendedor / Partner)

Almacena quién compró tu derecho de reventa.

```sql
CREATE TABLE tenants (
   id UUID PRIMARY KEY,
   owner_id UUID REFERENCES auth.users(id), -- Dueño de la franquicia
   name VARCHAR(255), -- "TechRest POS"
   logo_url TEXT,
   primary_color VARCHAR(10), -- "#3B82F6"
   domain VARCHAR(255), -- "login.techrestpos.com"
   subscription_plan VARCHAR(50) -- "enterprise_partner"
);
```

### Nivel 2: El Cliente Final (Restaurante)

Los locales que administra ese reseller.

```sql
CREATE TABLE restaurants (
   id UUID PRIMARY KEY,
   tenant_id UUID REFERENCES tenants(id), -- LIGA CRÍTICA AL REVENDEDOR
   name VARCHAR(255), -- "Pizzería La Mamma"
   nit VARCHAR(50),
   address TEXT
);
```

### Lo que se personaliza al vuelo (Frontend Dinámico):

El software debe permitir al Partner (`tenant`) configurar desde su "Super Admin Panel":

1. **Branding:** Logo, color principal, Favicon.
2. **Apps:** Nombre de la PWA/App, SplashScreen.
3. **Documentos:** Logo inyectado en facturas DIAN y recibos térmicos 80mm.
4. **Comunicaciones:** Remitente de los SMS, emails transaccionales y WhatsApp del BOT.

---

## 4. Diferenciador Clave de tu SaaS

Si Jamali OS implementa esta capa de "Super Admin" temprana, su valoración deja de medirse por "cuántos restaurantes tienes" a "cuántos distribuidores B2B tienes comprando licencias en lote".

Es el modelo de negocio "Shopify Partners", pero llevado al mundo gastronómico complejo (Inventarios, KDS, POS).
---
 
 ## 5. Estado de Implementación (Marzo 2026)
 
 ### ✅ Fase 1: Infraestructura y Branding Dinámico (COMPLETADA)
 - **Base de Datos:** Tabla `tenants` y relación con `restaurants` activa.
 - **Identidad Visual:** Motor de CSS Variables (`--primary`) inyectado en POS y Layout.
 - **Panel Maestro:** Dashboard de Partners (`/admin/partners`) para gestión de resellers.
 - **Configuración Self-Service:** Interfaz para que el cliente/partner suba su logo y elija su color de marca con previsualización en vivo.
 
 ### 🔄 Fase 2: Facturación y Pagos Marca Blanca (PRÓXIMAMENTE)
 - **Transaccionalidad:** Inyección de logos de partner en Factura Electrónica DIAN.
 - **Split Payments:** División de comisiones automáticas entre el Partner y Jamali OS.
 - **Dominios Dinámicos:** Middleware de Next.js para detección de dominios de partners.
