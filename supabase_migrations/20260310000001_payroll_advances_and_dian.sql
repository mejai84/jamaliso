-- 💼 JAMALI PAYROLL PRO Expansion: Préstamos y Nómina Electrónica
-- Fecha: 09 de Marzo de 2026

-- 1. Ampliación de Perfiles para Nómina Real
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS identification_type text DEFAULT 'CC',
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'AHORROS',
ADD COLUMN IF NOT EXISTS account_number text;

-- 2. Tabla de Préstamos y Adelantos
CREATE TABLE IF NOT EXISTS public.payroll_loans (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid REFERENCES public.restaurants(id),
    employee_id uuid REFERENCES public.profiles(id),
    total_amount numeric NOT NULL DEFAULT 0,
    balance numeric NOT NULL DEFAULT 0,
    instalment_amount numeric NOT NULL DEFAULT 0,
    description text,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'PAID', 'CANCELLED')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Tabla de Pagos de Préstamos (Deducciones Registradas)
CREATE TABLE IF NOT EXISTS public.payroll_loan_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id uuid REFERENCES public.payroll_loans(id),
    run_id uuid REFERENCES public.payroll_runs(id),
    amount numeric NOT NULL,
    payment_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Ampliación de Nómina Ejecutada para la DIAN
ALTER TABLE public.payroll_runs
ADD COLUMN IF NOT EXISTS cune_uuid text,
ADD COLUMN IF NOT EXISTS dian_status text DEFAULT 'PENDING' CHECK (dian_status IN ('PENDING', 'SENT', 'ERROR')),
ADD COLUMN IF NOT EXISTS xml_url text,
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS response_message text;

-- 5. Row Level Security
ALTER TABLE public.payroll_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_loan_payments ENABLE ROW LEVEL SECURITY;

-- Policias RLS (Simplificadas para el MVP)
CREATE POLICY "Enable all for same restaurant in loans" ON public.payroll_loans
    FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Enable all for same restaurant in loan payments" ON public.payroll_loan_payments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.payroll_loans l 
        WHERE l.id = payroll_loan_payments.loan_id 
        AND l.restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
    ));

-- Comentarios
COMMENT ON TABLE public.payroll_loans IS 'Registro de préstamos y adelantos a empleados.';
COMMENT ON COLUMN public.payroll_runs.cune_uuid IS 'Código Único de Nómina Electrónica (DIAN).';
