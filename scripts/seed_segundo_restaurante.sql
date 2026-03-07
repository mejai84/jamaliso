-- =====================================================
-- SEED: Segundo Restaurante de Prueba — "El Fogón Criollo"
-- Fecha: 07 Marzo 2026
-- Propósito: Validar aislamiento multi-tenant
-- =====================================================

-- 1. CREAR RESTAURANTE
INSERT INTO restaurants (
    name, subdomain, slug, primary_color,
    tax_percentage, apply_service_charge, service_charge_percentage,
    currency_symbol, online_store_enabled
) VALUES (
    'El Fogón Criollo',
    'el-fogon',
    'el-fogon',
    '#b91c1c',
    8,
    true,
    10,
    '$',
    true
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- 2. OBTENER EL ID (ejecutar esto después de crear el restaurante)
-- Copia el id que devolvió el INSERT anterior y úsalo abajo.
-- O usa esta variable:

DO $$
DECLARE
    v_restaurant_id UUID;
    v_cat_carnes UUID;
    v_cat_bebidas UUID;
    v_cat_entradas UUID;
    v_cat_postres UUID;
BEGIN
    -- Obtener ID del restaurante recién creado
    SELECT id INTO v_restaurant_id FROM restaurants WHERE slug = 'el-fogon';
    
    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Restaurante el-fogon no encontrado';
    END IF;

    -- 3. CREAR CATEGORÍAS
    INSERT INTO categories (restaurant_id, name, slug) VALUES 
        (v_restaurant_id, 'Carnes a la Brasa', 'carnes-a-la-brasa')
    RETURNING id INTO v_cat_carnes;

    INSERT INTO categories (restaurant_id, name, slug) VALUES 
        (v_restaurant_id, 'Bebidas', 'bebidas')
    RETURNING id INTO v_cat_bebidas;

    INSERT INTO categories (restaurant_id, name, slug) VALUES 
        (v_restaurant_id, 'Entradas Criollas', 'entradas-criollas')
    RETURNING id INTO v_cat_entradas;

    INSERT INTO categories (restaurant_id, name, slug) VALUES 
        (v_restaurant_id, 'Postres', 'postres')
    RETURNING id INTO v_cat_postres;

    -- 4. CREAR PRODUCTOS
    -- Carnes
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_available) VALUES
        (v_restaurant_id, v_cat_carnes, 'Churrasco Argentino', 'Corte premium 400g con chimichurri casero y papas rústicas', 68000, true),
        (v_restaurant_id, v_cat_carnes, 'Costillas BBQ', 'Rack completo glaseado con salsa BBQ ahumada, coleslaw', 55000, true),
        (v_restaurant_id, v_cat_carnes, 'Pollo a la Brasa', 'Medio pollo marinado 24h con especias criollas, yuca frita', 38000, true),
        (v_restaurant_id, v_cat_carnes, 'Lomo al Trapo', 'Lomo de res envuelto en sal y tela, cocción ancestral', 72000, true),
        (v_restaurant_id, v_cat_carnes, 'Chorizo Santarrosano', '3 unidades con arepa, guacamole y hogao', 28000, true);

    -- Bebidas
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_available) VALUES
        (v_restaurant_id, v_cat_bebidas, 'Limonada de Coco', 'Limonada natural con leche de coco y hierbabuena', 12000, true),
        (v_restaurant_id, v_cat_bebidas, 'Jugo de Lulo', 'Lulo fresco con agua o leche, endulzado al gusto', 10000, true),
        (v_restaurant_id, v_cat_bebidas, 'Cerveza Artesanal IPA', 'Cervecería local, 330ml, amarga y aromática', 15000, true),
        (v_restaurant_id, v_cat_bebidas, 'Aguapanela con Limón', 'Tradición colombiana, fría o caliente', 6000, true);

    -- Entradas
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_available) VALUES
        (v_restaurant_id, v_cat_entradas, 'Empanadas de Carne', '4 unidades con ají criollo casero', 18000, true),
        (v_restaurant_id, v_cat_entradas, 'Patacones con Hogao', 'Plátano verde frito con salsa hogao y queso rallado', 16000, true),
        (v_restaurant_id, v_cat_entradas, 'Chicharrón Crocante', 'Piel de cerdo crujiente con limón y sal marina', 22000, true);

    -- Postres
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_available) VALUES
        (v_restaurant_id, v_cat_postres, 'Tres Leches', 'Bizcocho empapado en leches, crema chantilly y canela', 14000, true),
        (v_restaurant_id, v_cat_postres, 'Arroz con Leche', 'Receta de la abuela, con pasas y canela', 10000, true);

    -- 5. CREAR MESAS
    INSERT INTO tables (restaurant_id, table_name, table_number, capacity, status) VALUES
        (v_restaurant_id, 'Mesa 1', 101, 4, 'free'),
        (v_restaurant_id, 'Mesa 2', 102, 4, 'free'),
        (v_restaurant_id, 'Mesa 3', 103, 6, 'free'),
        (v_restaurant_id, 'Mesa 4', 104, 2, 'free'),
        (v_restaurant_id, 'Mesa 5', 105, 8, 'free'),
        (v_restaurant_id, 'Mesa 6', 106, 4, 'free'),
        (v_restaurant_id, 'Terraza 1', 107, 6, 'free'),
        (v_restaurant_id, 'Terraza 2', 108, 4, 'free'),
        (v_restaurant_id, 'Barra 1', 109, 2, 'free'),
        (v_restaurant_id, 'Barra 2', 110, 2, 'free');

    RAISE NOTICE 'Restaurante "El Fogón Criollo" creado con ID: %', v_restaurant_id;
    RAISE NOTICE 'Categorías: 4 | Productos: 14 | Mesas: 10';
    RAISE NOTICE 'Prueba en: http://localhost:3000/el-fogon/menu';

END $$;
