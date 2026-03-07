-- ============================================================================
-- FASE 1 — ARQUITECTURA WHITE-LABEL
-- Implementación del Modelo Multi-Nivel: Tenants -> Restaurantes
-- ============================================================================

-- 1. Crear tabla de Distribuidores/Partners (Tenants)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id), -- Dueño de la agencia reseller
    name VARCHAR(255) NOT NULL, -- Nombre de la agencia (Ej: TechRest POS)
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#FF6B6B', -- Color marca blanca
    domain VARCHAR(255), -- Subdominio o custom domain ej: pos.techrest.com
    subscription_plan VARCHAR(50) DEFAULT 'partner_standard',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Agregar tenant_id a los restaurantes existentes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'restaurants' 
                   AND column_name = 'tenant_id') THEN
        ALTER TABLE public.restaurants ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
    END IF;
END $$;

-- 3. Crear un Tenant Maestro (Para pruebas de Marca Blanca "TechRest") y asignar restaurantes
DO $$ 
DECLARE
    default_tenant_id UUID;
    first_owner_id UUID;
BEGIN
    -- Intentar obtener un usuario existente como dueño del tenant
    SELECT id INTO first_owner_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- Insertar el Tenant de demostración White-Label (Color Azul)
    INSERT INTO public.tenants (name, primary_color, owner_id, subscription_plan, domain)
    VALUES ('TechRest Distribuidores', '#3B82F6', first_owner_id, 'enterprise_reseller', 'techrestpos.com')
    RETURNING id INTO default_tenant_id;
    
    -- Hacer que todos los restaurantes actuales pertenezcan a TechRest
    UPDATE public.restaurants SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    
    -- Sobrescribir el color primario del restaurante usando el de TechRest de forma demostrativa
    UPDATE public.restaurants SET primary_color = '#3B82F6' WHERE primary_color IS NULL OR primary_color = '#FF6B6B';
END $$;

-- 4. Seguridad RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Tenants solo visibles por dueños o super admins" ON public.tenants;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Tenants solo visibles por dueños o super admins" ON public.tenants
    FOR SELECT TO authenticated
    USING (
         owner_id = auth.uid() 
         OR EXISTS (
             SELECT 1 FROM profiles 
             WHERE profiles.id = auth.uid() 
             AND profiles.role = 'super_admin'
         )
    );
