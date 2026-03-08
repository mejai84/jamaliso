# JAMALI OS — Executive Summary

> **Versión:** 1.0  
> **Fecha:** Marzo 2026  
> **Contacto:** Jaime Jaramillo — Founder & Lead Architect  
> **Web:** jamali-os.com  
> **Clasificación:** Confidencial — Solo para destinatarios autorizados

---

## 1. Introducción — El Problema

La industria HORECA (Hoteles, Restaurantes y Cafeterías) opera, en su mayoría, con herramientas del siglo pasado: comandas de papel que se pierden, inventarios que no cuadran, cierres de caja a mano y cero visibilidad sobre la salud real del negocio.

Los síntomas son siempre los mismos:

- **Caos operativo:** Comandas perdidas, errores entre sala y cocina, tiempos de servicio impredecibles.
- **Ceguera financiera:** El dueño no sabe qué platos son rentables, cuánto pierde en mermas ni cuál es su food cost real.
- **Sistemas fragmentados:** Un software para el POS, otro para inventario, otro para nómina, otro para marketing. Ninguno habla con el otro.
- **Dependencia del hardware caro:** Soluciones que requieren terminales propietarias de miles de dólares.

**JAMALI OS nace para resolver esto de raíz.**

---

## 2. Propuesta de Valor — ¿Qué es JAMALI OS?

JAMALI OS es un **Sistema Operativo completo para restaurantes** — no un POS convencional. Es una plataforma SaaS (Software as a Service) que unifica todas las operaciones del negocio en una sola interfaz web, accesible desde cualquier navegador, tablet o móvil.

### ¿Por qué es diferente?

| Factor | Competencia Tradicional | **JAMALI OS** |
| :--- | :--- | :--- |
| **Velocidad de setup** | Días o semanas | **< 30 minutos** (Onboarding guiado) |
| **Hardware requerido** | Terminales propietarias ($$$) | **Cualquier dispositivo con navegador** |
| **Sincronización** | Batch (cada X horas) | **Tiempo real** (Supabase Realtime) |
| **Experiencia de usuario** | Interfaces de los años 2000 | **UI Premium** (Glassmorphism, Animaciones fluidas) |
| **Escalabilidad** | 1 local = 1 licencia | **Multi-tenant & Multi-sucursal** nativo |
| **Inteligencia** | Reportes básicos | **IA Predictiva** (Detección de fraude, Forecasting) |

> *"La robustez de una gran cadena, lista en tu navegador en 5 minutos."*

---

## 3. Funcionalidades Principales

### 🖥️ Punto de Venta (POS) Intuitivo
- Gestión de mesas, zonas y delivery en una sola pantalla.
- Pedidos desde mesa vía QR (sin mesero para la toma de comanda).
- División de cuentas (Split Check), unión de mesas y transferencia de ítems.
- Facturación electrónica con soporte fiscal (documento equivalente 80mm).

### 👨‍🍳 Kitchen Display System (KDS) en Tiempo Real
- Las comandas llegan al instante a la pantalla de cocina — cero papel.
- Estados visuales (Pendiente → En preparación → Listo) con alertas sonoras.
- Resumen de producción por ingredientes y gestión de stock crítico (marcar agotado).
- Filtrado por estaciones (Parrilla, Fríos, Bar, etc.).

### 📊 Panel de Administración y Analítica Avanzada
- **Dashboard en vivo:** Ventas, mesas activas, tiempos de servicio y KPIs financieros.
- **Inventario inteligente:** Descuento automático de stock por plato vendido, alertas de mínimos.
- **Nómina integrada (Payroll PRO):** Liquidación con cumplimiento legal (Colombia: SMLV, salud, pensión, ARL).
- **JAMALI Guardian (Owner App):** Detección de fraude con scoring IA (0-100%), autorización remota de acciones críticas y monitoreo multi-sede.
- **Reservas (Guest Book):** Agenda inteligente con confirmación y auditoría de concierge.
- **Ventas Online:** Menú digital y e-commerce con SEO optimizado.

---

## 4. Arquitectura Técnica — Construido para Escalar

JAMALI OS está construido con el mismo stack que usan startups unicornio (Vercel, Supabase, Netflix):

| Capa | Tecnología | Beneficio |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) + React 19 | Velocidad extrema, SSR, SEO nativo |
| **Lenguaje** | TypeScript (Strict Mode) | Código predecible, menos bugs en producción |
| **Estilos** | Tailwind CSS v4 + Framer Motion + Shadcn UI | UX premium con animaciones de 60fps |
| **Backend & DB** | Supabase (PostgreSQL 15) | Base de datos relacional robusta + API REST + Auth + Realtime, todo en uno |
| **Infraestructura** | Vercel (Edge Network) | CDN global, despliegue automático, 99.9% uptime |
| **Seguridad** | Row Level Security (RLS) + Edge Middleware | Aislamiento criptográfico de datos entre restaurantes |
| **Monitoreo** | Sentry | Detección proactiva de errores y cuellos de botella |
| **Resiliencia** | PWA + Offline Engine | El POS sigue funcionando si cae el internet |

### Highlights de Ingeniería:
- **Multi-Tenant desde la base de datos:** Cada restaurante tiene sus datos aislados a nivel de PostgreSQL (RLS). Es criptográficamente imposible que un restaurante vea datos de otro.
- **Transacciones ACID:** Operaciones complejas (Split Check, Merge Tables, dispersión de nómina) se ejecutan con `ROLLBACK` automático si algo falla.
- **Edge Security:** Rate Limiter (100 req/min/IP), CORS estricto, headers de seguridad enterprise.
- **CI/CD automatizado:** Testing con Jest + GitHub Actions. Cada cambio se valida antes de llegar a producción.

---

## 5. Modelo de Negocio — SaaS con Red de Distribución

| Plan | Precio | Incluye |
| :--- | :--- | :--- |
| **Starter** | $60 USD/mes | POS, Mesas, KDS básico, 1 sucursal |
| **Pro** | $120 USD/mes | + Inventario, Recetas, Nómina, Reportes BI, Multi-sucursal |
| **Enterprise** | $250+ USD/mes | + White-Label, API, Delivery integrado, IA Predictiva |

### Estrategia Go-to-Market: B2B2C
No vendemos puerta a puerta. Vendemos a **distribuidores** (hardware POS, contadores, fintechs, agencias gastronómicas) que ya tienen la confianza de cientos de restaurantes. Un solo partner con 200 restaurantes genera **$4,000 USD/mes** de MRR recurrente.

---

## 6. Visión de Futuro

- **Facturación Electrónica DIAN** con proveedores homologados (Alegra/Siigo).
- **Automatización WhatsApp + IA** para marketing, fidelización y soporte.
- **Forecasting de demanda** (predicción de afluencia por día y hora).
- **API Pública** para integraciones de terceros.
- **Micro-créditos** para restaurantes basados en ventas comprobadas.
- **Kioscos de autoservicio** y app móvil exclusiva para dueños.

---

## 7. ¿Por qué Ahora?

El mercado HORECA en LATAM es de **+1M de restaurantes** solo entre Colombia, México y Argentina. La digitalización post-pandemia ha acelerado la demanda de soluciones como JAMALI OS, pero la oferta sigue siendo:

- **Demasiado cara** (Toast, Lightspeed → $200-500 USD/mes + hardware).
- **Demasiado básica** (Qamarero, Poster → no escalan).
- **Fragmentada** (un software por cada función).

**JAMALI OS ocupa el punto medio perfecto:** potencia Enterprise con setup de startup y precio accesible.

---

<p align="center">
  <strong>JAMALI OS</strong><br>
  <em>El sistema operativo que la hostelería moderna estaba esperando.</em><br><br>
  © 2026 Jaime Jaramillo. Todos los derechos reservados.<br>
  Protegido por la Ley 23 de 1982 (Colombia).
</p>
