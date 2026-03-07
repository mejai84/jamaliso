# 📄 Blueprint: Módulo de Nómina (Payroll) — JAMALI OS
> **Estado:** Planificación / Arquitectura (No Implementar Aún)
> **Contexto:** Este documento contiene la estructura completa para transformar JAMALI OS en un ERP de Nómina especializado en Restaurantes.

---

## 🏗️ 1. Arquitectura de Datos (Supabase)

### Tablas Principales
- `employees`: Datos personales, cargo, fecha de ingreso.
- `contracts`: Tipo de contrato, salario base, jornada, periodicidad.
- `payroll_periods`: Definición de ciclos (Mes, Quincena).
- `payroll_runs`: Ejecución de una nómina específica.
- `payroll_items`: Detalle de cada renglón (Devengado o Deducción).
- `payroll_concepts`: Catálogo de conceptos (Salario, Horas Extra, Salud, Pensión).
- `payroll_novelties`: Registro de novedades (Incapacidades, Vacaciones).

---

## 🧮 2. Lógica de Cálculo (Payroll Engine)

### Componentes de Nómina
1. **Devengados (Earnings):**
   - `salario_base`
   - `horas_extra` (1.25x, 1.75x, 2.0x segun ley)
   - `recargos_nocturnos` (1.35x)
   - `comisiones_ventas` (Integrado con POS)
   - `propinas` (Integrado con liquidación de mesas)
   - `bonificaciones`
   - `auxilio_transporte` (Si aplica por ley)

2. **Deducciones (Deductions):**
   - `salud` (4% empleado)
   - `pension` (4% empleado)
   - `prestamos_empresa`
   - `embargos`
   - `retefuente` (Si aplica)

3. **Provisiones (Employer Costs):**
   - `prima_servicios`
   - `cesantias` e `intereses`
   - `vacaciones`
   - `seguridad_social_patronal` (Salud, Pensión, ARL, Caja Comp.)

---

## ⚡ 3. Ventaja Competitiva: El "Restaurant Edge"
Lo que diferenciará a JAMALI OS de otros sistemas como Runa o Factorial es la integración con la operación:
- **Liquidación por Propinas:** Reparto automático del pozo de propinas según puntos o cargo.
- **Diferencial Nocturno Automático:** El KDS y POS registran el cierre exacto; la nómina calcula el recargo nocturno sin intervención humana.
- **Comisiones por Venta:** Vinculación directa con los productos "estrella" que el mesero impulsó en el POS.
- **Turnos Rotativos:** Gestión de personal según afluencia proyectada por el Analytics Hub.

---

## 📅 4. Roadmap de Implementación (MVP 30 Días)

### Semana 1: Nucleo
- Esquema de base de datos.
- CRUD de Empleados y Contratos.

### Semana 2: Motor Legal (Colombia)
- Funciones PL/pgSQL para cálculo de IBC y porcentajes ley.
- Gestión de novedades básicas.

### Semana 3: Interfaz Operativa
- Panel de gestión de tiempos (Hours Tracking).
- Botón de "Generar Nómina".

### Semana 4: Cumplimiento & Reportes
- Generación de PDF (Desprendibles).
- Exportación para contabilidad.
- Preparación para Nómina Electrónica (DIAN).
