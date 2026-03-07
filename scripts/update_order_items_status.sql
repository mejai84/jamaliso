-- ============================================================================
-- ACTUALIZACIÓN DE GRANULARIDAD EN KDS (COLA DE PREPARACIÓN)
-- ============================================================================
-- 
-- Permite que cada ítem de una orden tenga su propio estado de vida.
-- Esto habilita el flujo: INICIAR INDIVIDUAL o INICIAR TODO.
-- 
-- ============================================================================

-- 1. Agregar columna de estado a los ítems si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'order_items' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE public.order_items ADD COLUMN status TEXT DEFAULT 'pending';
        -- Sincronizar estados iniciales basados en la orden (opcional para datos viejos)
        UPDATE public.order_items oi 
        SET status = o.status 
        FROM public.orders o 
        WHERE oi.order_id = o.id;
    END IF;
END $$;

-- 2. Asegurar que los estados válidos sean coherentes (Constraint opcional)
-- ALTER TABLE public.order_items ADD CONSTRAINT order_items_status_check 
-- CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled'));

-- 3. Comentario de documentación
COMMENT ON COLUMN public.order_items.status IS 'Estado de preparación individual del ítem (pending, preparing, ready, cancelled)';
