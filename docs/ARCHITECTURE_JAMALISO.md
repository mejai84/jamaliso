# Arquitectura del Sistema - JAMALI OS

Este documento describe la arquitectura a alto nivel de JAMALI OS, su estructura de directorios, las tecnologías involucradas y cómo interactúan las diferentes capas de la aplicación. Su propósito es permitir a cualquier desarrollador nuevo (o inversor/comprador) entender el sistema en menos de 1 hora.

## 1. ¿Qué hace el sistema?
JAMALI OS es un sistema integral de punto de venta (POS) y ERP especializado en el sector gastronómico (restaurantes, bares, cafeterías). Está diseñado con una arquitectura **Multi-Tenant (Multi-inquilino)**, lo que significa que un solo despliegue puede servir a múltiples restaurantes, manteniendo los datos estricta y criptográficamente aislados.

## 2. Tecnologías y Stack (Tech Stack)
*   **Frontend / Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Estilos y UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (Animaciones fluidas) + [Shadcn UI](https://ui.shadcn.com/)
*   **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL 15)
*   **Autenticación:** Supabase Auth (Email/Password, Roles basados en Base de Datos)
*   **Visualización de Datos:** [Recharts](https://recharts.org/) (Reportes financieros)

---

## 3. Diagrama del Sistema (Flujo de Datos)

```mermaid
graph TD
    Client[Navegador / POS App] -->|HTTPS / WSS| Nextjs[Next.js 16 Server / Middleware]
    Nextjs -->|Data Fetching| SupabaseAPI[Supabase REST API]
    Nextjs -->|Realtime Subscriptions| SupabaseWSS[Supabase Realtime WSS]
    SupabaseAPI --> Postgres[(PostgreSQL DB)]
    SupabaseWSS --> Postgres
    
    subgraph Core Modules
    POS[Punto de Venta]
    INV[Inventario & Mermas]
    KIT[Kitchen Display System]
    REP[Reportes & BI]
    USR[Empleados & Caja]
    end
    
    Client --> POS
    Client --> INV
    Client --> KIT
    Client --> REP
    Client --> USR
```

---

## 4. Estructura de Directorios (Clean Folder Structure)
Siguiendo las mejores prácticas de mantenibilidad y modularidad, el proyecto está estructurado de la siguiente forma:

```text
/JAMALISO
├── /docs                    # Documentación del proyecto (DB, Arquitectura, Flujos)
├── /scripts                 # Scripts en SQL para migración, despliegue y fixes
│
├── /src                     # Código Fuente Principal
│   ├── /actions             # Server Actions (Lógica segura del backend en Next.js)
│   ├── /app                 # App Router de Next.js (Rutas, páginas, layouts)
│   │   ├── /admin           # Backoffice & POS (Carpeta principal del software)
│   │   ├── /login           # Autenticación
│   │   └── api              # Endpoints API Route
│   │
│   ├── /components          # Componentes visuales genéricos y de dominio (Botones, Modales)
│   │   ├── /admin           # Componentes específicos del POS y Backoffice
│   │   │   └── /waiter      # Componentes atómicos del Portal de Meseros
│   │   └── /ui              # Componentes UI base (Shadcn/Tailwind)

│   │
│   ├── /lib                 # Lógica core compartida
│   │   ├── /supabase        # Clientes Supabase (Server / Browser / Middleware)
│   │   └── utils.ts         # Funciones puras (Formateos, cálculos estadísticos)
│   │
│   ├── /providers           # Context Providers (Global State)
│   │   └── RestaurantProvider.tsx # Manejo de contexto del Tenant actual
│   │
│   └── /types               # Definiciones de TypeScript e Interfaces
```

---

## 5. Módulos Principales
La aplicación se divide en áreas funcionales cohesionadas.

| Módulo | Descripción | Frontend Path |
| :--- | :--- | :--- |
| **Partner Master Hub** | Gestión de socios B2B, resellers y red de marca blanca. | `/src/app/admin/partners` |
| **Punto de Venta (POS)** | Creación de comandas, mesas, delivery y pagos. | `/src/app/admin/pos` y `/admin/waiter` |
| **Kitchen Display (KDS)** | Pantalla para cocina, tiempos de preparación y estados. | `/src/app/admin/kitchen` |
| **Gestión de Inventario** | Entradas, salidas, alertas de stock mínimo y proveedores. | `/src/app/admin/inventory/*` |
| **Recetas y Producción** | Base para el cálculo de Food Cost (rendimientos, mermas). | `/src/app/admin/inventory/recipes` |
| **Cajas y Turnos** | Control de efectivo, descuadres. Soporta **Traspaso de Turno** (Handoff) con mesas pendientes y firma digital. | `/src/app/admin/cashier/*` |
| **Pedidos QR** | Menú digital con pedidos directos desde la mesa vinculados al KDS. | `/src/app/[slug]/mesa/[mesa]` |
| **Reportes y B.I.** | Inteligencia de negocios, proyecciones IA, márgenes. | `/src/app/admin/reports` |
| **Identidad Visual** | Configuración dinámica de marca blanca (logos, colores). | `/src/app/admin/settings` |
| **Nómina (Payroll)** | Gestión de sueldos, contratos, comisiones e impuestos. | `/src/app/admin/payroll` |

---

## 6. Seguridad (Row Level Security)
JAMALISO delega el aislamiento de datos a nivel de base de datos usando **PostgreSQL Row Level Security (RLS)**.
Todas las consultas hechas por el cliente pasan por políticas estrictas que validan:
1. El usuario está autenticado.
2. El rol del usuario permite la acción (`admin`, `owner`, `waiter`, `kitchen`).
3. El registro consultado pertenece ÚNICAMENTE al identificador del inquilino (`restaurant_id`).

Esto hace que sea criptográficamente imposible que el restaurante A consulte las ventas o inventario del restaurante B.

---

## 7. Esquema de Datos — Nómina y Regionalización (Novedad 2026)
JAMALISO ahora integra un motor ERP para la gestión de talento humano y adaptación global.

### A. Configuración Regional
*   **Moneda:** Adaptación dinámica vía `formatPrice`.
*   **Impuestos:** Tabla `regional_taxes` (IVA, Impoconsumo, Sales Tax) vinculada al país.

### B. Módulo de Nómina (Payroll Engine)
*   **Profiles (Staff):** Sueldo base, % comisiones, tipo de contrato.
*   **Concepts:** Catálogo de devengados (Earning) y deducciones (Deduction).
*   **Comisiones:** Automatizadas mediante el trigger `process_sale_commission` en ventas POS.
*   **Novedades:** Registro de pagos extras, mermas o préstamos en `payroll_novelties`.

---

## 8. Onboarding Automático y Pagos (Wizard)
JAMALI OS cuenta con un asistente de configuración inteligente (`Wizard`) a nivel de aplicación (`/register/wizard`):
1.  **Información del Restaurante:** Nombre, branding (Logo/Colores), tipo de cocina.
2.  **Configuración de Mesas:** Creación visual del salón y asignación de códigos QR.
3.  **Configuración del Menú:** Categorías (Entradas, Platos Fuertes, Bebidass) y primeros productos.
4.  **Detalles de Cuenta Admin:** Creación del usuario dueño (`Owner`).
5.  **Suscripción y Pago:** Pasarela de pago nativa con **Mercado Pago** (Starter, Pro, Enterprise).

El sistema solo habilita el acceso total al POS una vez completado el pago exitoso, activando el flag `isPaid` en la tabla `restaurants`.

---

---

## 9. Interfaz y Diseño (Pixora Light Theme)
Desde marzo de 2026, JAMALI OS implementa el estándar **Pixora Light** de forma obligatoria para garantizar una estética premium, corporativa y de marca blanca:
*   **Color System:** Basado en `Slate-900` para textos y `Orange-600` (`#EA580C`) para acciones principales.
*   **Escalado Inteligente:** Implementación de `font-size` dinámico en el `html` vía CSS (100% móvil, 85% tablet, 75% laptop, 65% monitores grandes) para asegurar que la densidad de información sea óptima en cualquier dispositivo.
*   **Branding Dinámico:** Los colores y logos se inyectan mediante el `RestaurantProvider` manteniendo la consistencia visual.

---

*Última actualización: 07 Marzo 2026 (Migración Final Branding JAMALI OS & Pixora Light)*
