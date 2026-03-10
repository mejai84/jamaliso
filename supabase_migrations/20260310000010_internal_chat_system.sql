-- ============================================================
-- JAMALI OS: Sistema de Chat Interno Multi-Área
-- Fecha: 10 de Marzo de 2026
-- Permite comunicación en tiempo real entre áreas del negocio
-- (Mesero ↔ Cocina ↔ Caja ↔ Admin)
-- ============================================================

-- 1. Tabla Principal de Mensajes Internos
CREATE TABLE IF NOT EXISTS public.internal_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    
    -- Área que envía el mensaje
    from_area text NOT NULL CHECK (from_area IN ('waiter', 'kitchen', 'cashier', 'admin', 'bar')),
    -- Nombre/identificador del remitente (email o nombre de la sesión)
    from_name text NOT NULL DEFAULT 'Sistema',
    
    -- Área destino (NULL = broadcast a todas las áreas)
    to_area text CHECK (to_area IN ('waiter', 'kitchen', 'cashier', 'admin', 'bar', 'all')),
    
    -- Contenido del mensaje
    message text NOT NULL,
    
    -- Tipo de mensaje para filtros visuales
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'alert', 'info', 'urgent')),
    
    -- Estado de lectura
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    
    -- Metadata adicional (ej: número de mesa, orden ID, etc.)
    metadata jsonb DEFAULT '{}',
    
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Índices para rendimiento en tiempo real
CREATE INDEX IF NOT EXISTS idx_internal_messages_restaurant ON public.internal_messages(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_to_area ON public.internal_messages(to_area);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created ON public.internal_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_messages_is_read ON public.internal_messages(is_read);

-- 3. Row Level Security
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados del mismo restaurante pueden leer y escribir mensajes
CREATE POLICY "internal_messages_restaurant_access" ON public.internal_messages
    FOR ALL
    USING (
        restaurant_id = (
            SELECT restaurant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        restaurant_id = (
            SELECT restaurant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- 4. Habilitar Realtime para esta tabla (requerido para suscripciones en tiempo real)
-- NOTA: Esto debe ejecutarse con permisos de superadmin en Supabase Dashboard
-- o via: supabase realtime enable-extension 
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_messages;

-- 5. Función para limpiar mensajes antiguos (> 48 horas)
CREATE OR REPLACE FUNCTION public.cleanup_old_internal_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.internal_messages
    WHERE created_at < NOW() - INTERVAL '48 hours';
END;
$$;

-- Comentario de la tabla
COMMENT ON TABLE public.internal_messages IS 
'Sistema de mensajería interna en tiempo real entre áreas del restaurante (Mesero, Cocina, Caja, Admin, Bar).';
