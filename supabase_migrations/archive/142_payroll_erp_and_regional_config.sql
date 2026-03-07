-- 🌍 PERSONALIZACIÓN REGIONAL: MONEDA Y PAÍS
-- Permite que la app se adapte a diferentes divisas y configuraciones legales.

INSERT INTO settings (key, value) VALUES
    ('regional_config', '{
        "country": "Colombia",
        "currency_code": "COP",
        "currency_symbol": "$",
        "locale": "es-CO",
        "timezone": "America/Bogota",
        "decimal_digits": 0
    }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 💼 MÓDULO DE NÓMINA (PAYROLL) - ESTRUCTURA ERP
-- Implementación del Blueprint para JAMALI OS

-- 1. Conceptos de Nómina (Catálogo)
CREATE TABLE IF NOT EXISTS public.payroll_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('EARNING', 'DEDUCTION', 'PROVISION')),
    category VARCHAR(50), -- 'Sueldo', 'Hora Extra', 'Salud', etc.
    percentage NUMERIC(10,4), -- Si es un cálculo porcentual
    is_legal BOOLEAN DEFAULT true, -- Si es mandated por ley
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. Periodos de Nómina
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id),
    name VARCHAR(100), -- 'Noviembre Q1', 'Diciembre 2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PROCESSING', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ejecuciones de Nómina (Payroll Runs)
CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES public.payroll_periods(id) NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id),
    run_date DATE DEFAULT CURRENT_DATE,
    total_earnings NUMERIC(15,2) DEFAULT 0,
    total_deductions NUMERIC(15,2) DEFAULT 0,
    net_total NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'PAID')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ítems de Nómina (Detalle por empleado)
CREATE TABLE IF NOT EXISTS public.payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) NOT NULL,
    concept_id UUID REFERENCES public.payroll_concepts(id),
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Novedades (Novelties)
CREATE TABLE IF NOT EXISTS public.payroll_novelties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.profiles(id) NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id),
    concept_id UUID REFERENCES public.payroll_concepts(id),
    type VARCHAR(50), -- 'VACATIONS', 'SICK_LEAVE', 'BONUS', 'LOAN', 'COMMISSION'
    date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    end_date DATE,
    amount NUMERIC(15,2),
    notes TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS y Permisos
ALTER TABLE public.payroll_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_novelties ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (Solo Admins gestionan nómina)
CREATE POLICY "Admins payroll access" ON public.payroll_concepts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins periods access" ON public.payroll_periods FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins runs access" ON public.payroll_runs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins items access" ON public.payroll_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins novelties access" ON public.payroll_novelties FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notificar recarga de esquema
NOTIFY pgrst, 'reload schema';
