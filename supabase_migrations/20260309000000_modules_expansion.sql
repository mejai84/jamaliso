-- 🟢 EXPANSIÓN DE MÓDULOS: LEALTAD, KIOSCO Y TIENDA ONLINE AVANZADA
-- Fecha: 09 de marzo de 2026

-------------------------------------------------------------------------------
-- 1. SISTEMA DE LEALTAD (LOYALTY PROGRAM)
-------------------------------------------------------------------------------

-- Configuración del programa por restaurante
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    points_per_currency NUMERIC(10,2) DEFAULT 1.00, -- Ej: 1 punto por cada $1000
    currency_per_point NUMERIC(10,2) DEFAULT 10.00, -- Ej: Cada punto equivale a $10 al redimir
    min_points_to_redeem INTEGER DEFAULT 100,
    expiration_days INTEGER DEFAULT 365,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id)
);

ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loyalty settings" 
ON public.loyalty_settings FOR SELECT USING (true);

CREATE POLICY "Admin can manage loyalty settings" 
ON public.loyalty_settings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'owner')
    )
);

-- Puntos acumulados por cliente
CREATE TABLE IF NOT EXISTS public.customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, restaurant_id)
);

ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view customer loyalty" 
ON public.customer_loyalty FOR SELECT USING (true);

CREATE POLICY "System can manage loyalty points" 
ON public.customer_loyalty FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'owner', 'cashier', 'waiter')
    )
);

-- Historial de transacciones de lealtad
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    restaurant_id UUID REFERENCES public.restaurants(id),
    order_id UUID REFERENCES public.orders(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'refund')),
    points INTEGER NOT NULL, -- Positivo si gana, negativo si redime/expira
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view loyalty tx" ON public.loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "Staff can insert loyalty tx" ON public.loyalty_transactions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner', 'cashier', 'waiter'))
);

-------------------------------------------------------------------------------
-- 2. MÓDULO DE AUTOSERVICIO (KIOSCO)
-------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.kiosk_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    theme_color TEXT DEFAULT '#dc2626', -- Rojo por defecto
    welcome_title TEXT DEFAULT 'Toca para pedir',
    welcome_subtitle TEXT DEFAULT 'Rápido, fácil y sin filas',
    require_customer_name BOOLEAN DEFAULT true,
    allow_cash_payment BOOLEAN DEFAULT false, -- Generalmente kioscos son solo tarjeta
    allow_card_payment BOOLEAN DEFAULT true,
    idle_timeout_seconds INTEGER DEFAULT 60, -- Reiniciar si no hay interacción
    screensaver_video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id)
);

ALTER TABLE public.kiosk_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view kiosk settings" ON public.kiosk_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage kiosk settings" ON public.kiosk_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-------------------------------------------------------------------------------
-- 3. TIENDA ONLINE PROPIA (WEB E-COMMERCE) - MEJORAS ADICIONALES
-------------------------------------------------------------------------------
-- La tabla central_web existe o se agregaron campos a restaurants. 
-- Añadimos configuraciones extendidas de la tienda.

ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS online_store_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS online_payment_methods JSONB DEFAULT '{"cash": true, "card": false, "transfer": false}'::jsonb;

-- Recargar caché de esquema de Supabase/PostgREST
NOTIFY pgrst, 'reload schema';
