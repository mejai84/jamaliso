-- 🏥 JAMALI PAYROLL: Novedades, Ausentismos e Integraciones
-- Fecha: 10 de Marzo de 2026

-- 1. Tabla de Novedades (Ausentismos, Incapacidades, Permisos)
CREATE TABLE IF NOT EXISTS public.payroll_absences (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid REFERENCES public.restaurants(id),
    employee_id uuid REFERENCES public.profiles(id),
    type text NOT NULL CHECK (type IN ('INCAPACITY', 'PERMIT_PAID', 'PERMIT_UNPAID', 'VACATION', 'SUSPENSION')),
    start_date date NOT NULL,
    end_date date NOT NULL,
    days integer GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    description text,
    is_processed boolean DEFAULT false, -- Si ya se incluyó en un cálculo de nómina
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Registro de Notificaciones de Nómina
CREATE TABLE IF NOT EXISTS public.payroll_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    run_id uuid REFERENCES public.payroll_runs(id),
    employee_id uuid REFERENCES public.profiles(id),
    channel text CHECK (channel IN ('WHATSAPP', 'EMAIL')),
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_log text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. RLS
ALTER TABLE public.payroll_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for same restaurant in absences" ON public.payroll_absences
    FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Enable all for same restaurant in notifications" ON public.payroll_notifications
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.payroll_runs r 
        WHERE r.id = payroll_notifications.run_id 
        AND r.restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
    ));

-- Comentarios
COMMENT ON TABLE public.payroll_absences IS 'Registro de incapacidades, vacaciones y permisos de empleados.';
COMMENT ON TABLE public.payroll_notifications IS 'Log de envío de comprobantes de pago a empleados.';
