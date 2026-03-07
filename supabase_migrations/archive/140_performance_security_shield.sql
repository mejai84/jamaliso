-- ========================================================
-- 🛡️ MIGRACIÓN 140: PERFORMANCE & SECURITY SHIELD (WORLD-CLASS)
-- Fecha: 7 de marzo de 2026
-- Propósito: Optimización masiva de índices, blindaje RLS y consistencia Multi-Tenancy.
-- ========================================================

-- 1. ESTRATEGIA GLOBAL DE INDEXACIÓN (B-Tree Optimization)
-- Creamos índices en restaurant_id para TODAS las tablas que lo tengan.
-- Esto acelera el 99% de las consultas de la aplicación.

DO $$ 
DECLARE 
    tbl_name TEXT;
    rec RECORD;
BEGIN 
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'restaurant_id'
    LOOP
        tbl_name := rec.table_name;
        -- Crear índice si no existe
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_restaurant_id ON public.%I (restaurant_id)', tbl_name, tbl_name);
    END LOOP;
END $$;

-- 2. ÍNDICES COMPUESTOS PARA RENDIMIENTO OPERATIVO
-- Optimizamos consultas frecuentes de filtros y estados.

-- Órdenes: Búsqueda por estado y fecha (KDS y Reportes)
CREATE INDEX IF NOT EXISTS idx_orders_tenancy_status_date ON public.orders (restaurant_id, status, created_at DESC);

-- Sesiones de Caja: Búsqueda por estado activo
CREATE INDEX IF NOT EXISTS idx_cashbox_sessions_active ON public.cashbox_sessions (restaurant_id, status) WHERE status = 'OPEN';

-- Movimientos de Inventario: Historial cronológico
CREATE INDEX IF NOT EXISTS idx_inventory_movements_history ON public.inventory_movements (restaurant_id, created_at DESC);

-- Usuarios: Búsqueda por rol dentro del restaurante
CREATE INDEX IF NOT EXISTS idx_profiles_tenancy_role ON public.profiles (restaurant_id, role);

-- 3. SEGURIDAD RLS: REFINAMIENTO DE LA FUNCIÓN DE IDENTIDAD
-- Optimizamos get_my_restaurant_id para que sea más rápida (definida como STABLE).

CREATE OR REPLACE FUNCTION public.get_my_restaurant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. AUTOMATIZACIÓN DE TIMESTAMP (Updated At)
-- Creamos un trigger global para que 'updated_at' siempre sea real.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE 
    tbl_name TEXT;
    rec RECORD;
BEGIN 
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
    LOOP
        tbl_name := rec.table_name;
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_timestamp ON public.%I', tbl_name);
        EXECUTE format('CREATE TRIGGER tr_update_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', tbl_name);
    END LOOP;
END $$;

-- 5. BLINDAJE DE INTEGRIDAD MULTI-TENANT
-- Bloqueamos cualquier intento de insertar datos sin restaurant_id en tablas críticas.

DO $$ 
DECLARE 
    tbl_name TEXT;
    tables_to_strict TEXT[] := ARRAY[
        'orders', 'shifts', 'cashbox_sessions', 'cash_movements', 
        'inventory_movements', 'petty_cash_vouchers', 'reservations'
    ];
BEGIN 
    FOREACH tbl_name IN ARRAY tables_to_strict LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN restaurant_id SET NOT NULL', tbl_name);
        END IF;
    END LOOP;
END $$;

-- 6. AUDITORÍA DE SEGURIDAD (Vulnerabilidades comunes)
-- Aseguramos que los buckets de storage también estén protegidos.

-- Bucket de Brand Assets (Lectura pública, escritura protegida)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand_assets', 'brand_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access brand assets" ON storage.objects;
CREATE POLICY "Public access brand assets" ON storage.objects FOR SELECT USING (bucket_id = 'brand_assets');

DROP POLICY IF EXISTS "Authenticated users upload brand assets" ON storage.objects;
CREATE POLICY "Authenticated users upload brand assets" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'brand_assets' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- 7. RECARGAR SISTEMA
NOTIFY pgrst, 'reload schema';

COMMENT ON FUNCTION public.get_my_restaurant_id() IS 'Obtiene el restaurant_id vinculado al perfil del usuario autenticado.';
