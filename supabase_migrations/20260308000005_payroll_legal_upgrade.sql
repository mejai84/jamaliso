-- 💼 JAMALI OS: UPGRADE NÓMINA LEGAL COLOMBIANA & INTERNACIONAL (IFRS)

-- 1. Ampliar perfiles con datos contractuales
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contract_type text DEFAULT 'NOT_DEFINED', -- 'INDEFINIDO', 'FIJO', 'OBRA_LABOR', 'APRENDIZAJE'
ADD COLUMN IF NOT EXISTS monthly_salary numeric DEFAULT 1300000, -- Base SMLV 2026 est.
ADD COLUMN IF NOT EXISTS transport_allowance_eligible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS arl_risk_level integer DEFAULT 1, -- 1 a 5
ADD COLUMN IF NOT EXISTS pension_fund_name text,
ADD COLUMN IF NOT EXISTS health_fund_name text,
ADD COLUMN IF NOT EXISTS family_comp_fund_name text,
ADD COLUMN IF NOT EXISTS is_integral_salary boolean DEFAULT false;

-- 2. Categorías extendidas para conceptos
-- Aseguramos que el enum o check exista si es necesario, 
-- por ahora el campo 'category' es varchar(50) en la tabla base.

-- 3. Tabla para Provisiones (Accruals) - Requisito IFRS / IAS 19
-- Esto permite que el dueño sepa cuánto debe en realidad (Cesantías, Vacaciones) aunque no las pague hoy.
CREATE TABLE IF NOT EXISTS public.payroll_provisions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES public.profiles(id),
    restaurant_id uuid REFERENCES public.restaurants(id),
    run_id uuid REFERENCES public.payroll_runs(id),
    type text NOT NULL, -- 'PRIMA', 'CESANTIAS', 'INT_CESANTIAS', 'VACACIONES'
    amount numeric NOT NULL,
    accrued_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Tabla para Parafiscales y Seguridad Social (Costos de Seguridad Social del Empleador)
CREATE TABLE IF NOT EXISTS public.payroll_employer_costs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid REFERENCES public.payroll_runs(id),
    employee_id uuid NOT NULL REFERENCES public.profiles(id),
    restaurant_id uuid REFERENCES public.restaurants(id),
    concept text NOT NULL, -- 'SALUD_PATRONAL', 'PENSION_PATRONAL', 'ARL', 'SENA', 'ICBF', 'CCF'
    amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Semilla de Conceptos Legales Básicos
-- Función para insertar conceptos base si no existen para un restaurante
CREATE OR REPLACE FUNCTION seed_legal_payroll_concepts(p_restaurant_id uuid) 
RETURNS void AS $$
BEGIN
    INSERT INTO public.payroll_concepts (restaurant_id, name, type, category, percentage, is_legal)
    VALUES 
    (p_restaurant_id, 'Salario Básico', 'EARNING', 'BASE', 0, true),
    (p_restaurant_id, 'Auxilio de Transporte', 'EARNING', 'ALLOWANCE', 0, true),
    (p_restaurant_id, 'Recargo Nocturno', 'EARNING', 'OVERTIME', 35, true),
    (p_restaurant_id, 'Recargo Dominical/Festivo', 'EARNING', 'OVERTIME', 75, true),
    (p_restaurant_id, 'Hora Extra Diurna', 'EARNING', 'OVERTIME', 25, true),
    (p_restaurant_id, 'Hora Extra Nocturna', 'EARNING', 'OVERTIME', 75, true),
    (p_restaurant_id, 'Salud (Empleado)', 'DEDUCTION', 'SECURITY_SOCIAL', 4, true),
    (p_restaurant_id, 'Pensión (Empleado)', 'DEDUCTION', 'SECURITY_SOCIAL', 4, true)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
