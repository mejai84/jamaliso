-- 🚀 ACTIVACIÓN MULTI-RESTAURANTE (TENANT)
-- Este script vincula al administrador actual con un Tenant y crea una segunda sede/restaurante.

DO $$
DECLARE
    v_target_email TEXT := 'cesar@jamalios.com'; -- Ajustar al email del usuario si es diferente
    v_user_id UUID;
    v_tenant_id UUID;
    v_existing_res_id UUID;
    v_new_res_id UUID := gen_random_uuid();
BEGIN
    -- 1. Identificar al usuario Admin
    SELECT id INTO v_user_id FROM profiles WHERE role IN ('admin', 'super_admin') ORDER BY created_at LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró un usuario administrador para vincular el Tenant.';
    END IF;

    -- 2. Identificar el restaurante actual (Pargo Rojo)
    SELECT id, tenant_id INTO v_existing_res_id, v_tenant_id FROM restaurants WHERE slug = 'pargo-rojo' LIMIT 1;

    -- 3. Si no existe Tenant, crear uno para el grupo
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (name, owner_id) 
        VALUES ('Corporación Gastronómica Jamali', v_user_id)
        RETURNING id INTO v_tenant_id;
        
        -- Vincular el restaurante original al nuevo Tenant
        UPDATE restaurants SET tenant_id = v_tenant_id WHERE id = v_existing_res_id;
    END IF;

    -- 4. Crear el SEGUNDO RESTAURANTE (La Brasa)
    INSERT INTO restaurants (
        id, 
        name, 
        subdomain, 
        slug, 
        tenant_id, 
        primary_color, 
        cuisine_type,
        is_web_active,
        logo_url
    ) VALUES (
        v_new_res_id,
        'La Brasa Jamali',
        'la-brasa',
        'la-brasa',
        v_tenant_id,
        '#e11d48', -- Rojo Brasa
        'Parrilla & Asados',
        true,
        'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop' -- Logo temporal de parrilla
    ) ON CONFLICT (slug) DO NOTHING;

    -- 5. Crear categorías básicas para el nuevo restaurante
    INSERT INTO categories (name, slug, restaurant_id, order_position) VALUES 
    ('Entradas', 'entradas', v_new_res_id, 1),
    ('Cortes de Res', 'cortes-res', v_new_res_id, 2),
    ('Bebidas Heladas', 'bebidas', v_new_res_id, 3)
    ON CONFLICT DO NOTHING;

    -- 6. Crear un producto de ejemplo
    INSERT INTO products (name, description, price, category_id, restaurant_id, is_available)
    SELECT 'Baby Beef Premium', 'Tierno corte de 300g a la brasa con chimichurri', 48000, id, v_new_res_id, true
    FROM categories WHERE restaurant_id = v_new_res_id AND slug = 'cortes-res'
    LIMIT 1
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Tenant vinculado y Segundo Restaurante (La Brasa) creado exitosamente.';
END $$;
