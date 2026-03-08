-- 📊 JAMALI OS: INFRAESTRUCTURA FISCAL ELITE (DIAN/SAT)
-- Crea las tablas necesarias para soportar facturación electrónica real y modo contingencia.

-- 1. Tabla de Facturas Electrónicas
CREATE TABLE IF NOT EXISTS public.electronic_invoices (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id),
    restaurant_id uuid REFERENCES public.restaurants(id),
    user_id uuid REFERENCES public.profiles(id),
    invoice_number text NOT NULL, -- Prefijo + Número (ej: SETT-123)
    customer_name text,
    customer_nit text,
    amount numeric NOT NULL DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    status text DEFAULT 'pendiente', -- 'pendiente', 'emitida', 'error', 'contingencia'
    cufe_uuid text, -- Código Único de Factura Electrónica
    qr_url text,
    xml_url text, -- Link al XML en Supabase Storage
    provider text DEFAULT 'DIAN',
    error_message text,
    is_contingency boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Configuración Fiscal del Restaurante (Modo Emergencia)
CREATE TABLE IF NOT EXISTS public.fiscal_settings (
    restaurant_id uuid PRIMARY KEY REFERENCES public.restaurants(id),
    contingency_mode boolean DEFAULT false,
    fiscal_prefix text DEFAULT 'JAM',
    resolucion_number text,
    resolucion_date date,
    range_start integer,
    range_end integer,
    current_number integer DEFAULT 0,
    contingency_prefix text DEFAULT 'CONT',
    contingency_current_number integer DEFAULT 0,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Índices para rendimiento fiscal
CREATE INDEX IF NOT EXISTS idx_fiscal_restaurant ON public.electronic_invoices(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fiscal_status ON public.electronic_invoices(status);

-- 4. RLS para Facturas
ALTER TABLE public.electronic_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view restaurant invoices" ON public.electronic_invoices
    FOR SELECT USING (restaurant_id = public.get_my_restaurant_id());

CREATE POLICY "Staff can insert restaurant invoices" ON public.electronic_invoices
    FOR INSERT WITH CHECK (restaurant_id = public.get_my_restaurant_id());

ALTER TABLE public.fiscal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage fiscal settings" ON public.fiscal_settings
    FOR ALL USING (restaurant_id = public.get_my_restaurant_id());

-- 5. Insertar configuración por defecto para restaurantes existentes
INSERT INTO public.fiscal_settings (restaurant_id, contingency_mode, fiscal_prefix)
SELECT id, false, 'JAM' FROM public.restaurants
ON CONFLICT DO NOTHING;
