-- 🎛️ PRODUCT MODIFIERS SYSTEM
-- Tablas para gestión de extras, tamaños, salsas, etc.
-- Diseñado para restaurantes reales (hamburguesa + queso extra, pizza + tamaño grande)

-- ============================================
-- 1. GRUPOS DE MODIFICADORES (¿Qué tipo de extra?)
-- ============================================
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,           -- "Extras", "Tamaño", "Salsas", "Acompañamientos"
    selection_type VARCHAR(20) DEFAULT 'multiple' CHECK (selection_type IN ('single', 'multiple')),
    -- single = solo puedes elegir 1 (ej: tamaño S/M/L)
    -- multiple = puedes elegir varios (ej: extras: queso + bacon + jalapeños)
    min_selections INTEGER DEFAULT 0,      -- Mínimo de opciones obligatorias (0 = opcional)
    max_selections INTEGER DEFAULT 10,     -- Máximo de opciones permitidas
    is_required BOOLEAN DEFAULT false,     -- ¿Es obligatorio elegir al menos 1?
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. OPCIONES DE MODIFICADOR (¿Qué opciones hay?)
-- ============================================
CREATE TABLE IF NOT EXISTS public.modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,           -- "Queso extra", "Bacon", "Tamaño Grande"
    price_adjustment NUMERIC DEFAULT 0,   -- Cuánto suma al precio (puede ser 0 para salsas gratis)
    is_default BOOLEAN DEFAULT false,     -- ¿Viene marcada por defecto?
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VINCULACIÓN PRODUCTO ↔ GRUPO DE MODIFICADORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(product_id, modifier_group_id)
);

-- ============================================
-- 4. MODIFICADORES EN ORDER ITEMS (¿Qué eligió el cliente?)
-- ============================================
-- Usamos una tabla dedicada en vez de JSONB para mejor reporting y auditoría
CREATE TABLE IF NOT EXISTS public.order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    modifier_option_id UUID NOT NULL REFERENCES public.modifier_options(id),
    modifier_name VARCHAR(100) NOT NULL,    -- Snapshot del nombre (por si cambia después)
    price_adjustment NUMERIC DEFAULT 0,     -- Snapshot del precio (por si cambia después)
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. RLS (SEGURIDAD)
-- ============================================
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;

-- Políticas: Staff del restaurante tiene acceso total
CREATE POLICY "Staff manage modifier_groups" ON public.modifier_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.restaurant_id = modifier_groups.restaurant_id
        )
    );

CREATE POLICY "Staff manage modifier_options" ON public.modifier_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.restaurant_id = modifier_options.restaurant_id
        )
    );

CREATE POLICY "Staff manage product_modifier_groups" ON public.product_modifier_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.products prod ON prod.id = product_modifier_groups.product_id
            WHERE p.id = auth.uid()
            AND p.restaurant_id = prod.restaurant_id
        )
    );

CREATE POLICY "Staff manage order_item_modifiers" ON public.order_item_modifiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.order_items oi ON oi.id = order_item_modifiers.order_item_id
            JOIN public.orders o ON o.id = oi.order_id
            WHERE p.id = auth.uid()
            AND p.restaurant_id = o.restaurant_id
        )
    );

-- Políticas públicas para QR (clientes sin auth pueden leer modifiers)
CREATE POLICY "Public can read modifier_groups" ON public.modifier_groups
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read modifier_options" ON public.modifier_options
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public can read product_modifier_groups" ON public.product_modifier_groups
    FOR SELECT USING (true);

-- Permitir inserción desde QR (pedidos de clientes)
CREATE POLICY "Public can insert order_item_modifiers" ON public.order_item_modifiers
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. ÍNDICES DE RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_modifier_groups_restaurant ON public.modifier_groups(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON public.modifier_options(group_id);
CREATE INDEX IF NOT EXISTS idx_pmg_product ON public.product_modifier_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_pmg_group ON public.product_modifier_groups(modifier_group_id);
CREATE INDEX IF NOT EXISTS idx_oim_order_item ON public.order_item_modifiers(order_item_id);

-- ============================================
-- 7. FOOD COST VIEW (Feature 2)
-- ============================================
CREATE OR REPLACE VIEW public.vw_food_cost_analysis AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.price AS sale_price,
    c.name AS category_name,
    p.restaurant_id,
    COALESCE(recipe_cost.total_cost, 0) AS ingredient_cost,
    CASE 
        WHEN p.price > 0 THEN ROUND(((p.price - COALESCE(recipe_cost.total_cost, 0)) / p.price) * 100, 1)
        ELSE 0
    END AS margin_pct,
    p.price - COALESCE(recipe_cost.total_cost, 0) AS margin_abs,
    CASE
        WHEN COALESCE(recipe_cost.total_cost, 0) = 0 THEN 'SIN RECETA'
        WHEN ((p.price - recipe_cost.total_cost) / NULLIF(p.price, 0)) * 100 < 30 THEN 'MARGEN BAJO'
        WHEN ((p.price - recipe_cost.total_cost) / NULLIF(p.price, 0)) * 100 < 50 THEN 'MARGEN MEDIO'
        ELSE 'MARGEN ALTO'
    END AS margin_status,
    COALESCE(recipe_cost.ingredient_count, 0) AS ingredient_count
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN LATERAL (
    SELECT 
        SUM(ri.quantity * i.cost_per_unit) AS total_cost,
        COUNT(DISTINCT ri.ingredient_id) AS ingredient_count
    FROM public.recipes_new r
    JOIN public.recipe_items ri ON r.id = ri.recipe_id
    JOIN public.ingredients i ON ri.ingredient_id = i.id
    WHERE r.product_id = p.id
    AND r.restaurant_id = p.restaurant_id
) recipe_cost ON true
WHERE p.deleted_at IS NULL
AND p.is_available = true;

COMMENT ON VIEW public.vw_food_cost_analysis IS 'Vista para análisis de Food Cost por producto. Cruza precios de venta con costos de ingredientes de las recetas.';

-- ============================================
-- 8. ANALYTICS: VENTAS POR HORA (Feature 3)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_sales_by_hour(p_restaurant_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    hour_of_day INTEGER,
    total_orders BIGINT,
    total_revenue NUMERIC,
    avg_ticket NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM o.created_at)::INTEGER AS hour_of_day,
        COUNT(*)::BIGINT AS total_orders,
        COALESCE(SUM(o.total), 0) AS total_revenue,
        COALESCE(AVG(o.total), 0) AS avg_ticket
    FROM public.orders o
    WHERE o.restaurant_id = p_restaurant_id
    AND o.status NOT IN ('cancelled')
    AND o.created_at > (NOW() - (p_days || ' days')::INTERVAL)
    GROUP BY EXTRACT(HOUR FROM o.created_at)
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. ANALYTICS: PRODUCTO ESTRELLA (Feature 3)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_product_rankings(p_restaurant_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    category_name TEXT,
    total_quantity BIGINT,
    total_revenue NUMERIC,
    order_count BIGINT,
    avg_quantity_per_order NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        c.name AS category_name,
        COALESCE(SUM(oi.quantity), 0)::BIGINT AS total_quantity,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue,
        COUNT(DISTINCT oi.order_id)::BIGINT AS order_count,
        ROUND(AVG(oi.quantity), 1) AS avg_quantity_per_order
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    JOIN public.products p ON oi.product_id = p.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE o.restaurant_id = p_restaurant_id
    AND o.status NOT IN ('cancelled')
    AND o.created_at > (NOW() - (p_days || ' days')::INTERVAL)
    GROUP BY p.id, p.name, c.name
    ORDER BY total_quantity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. ANALYTICS: TICKET PROMEDIO CON COMPARATIVA (Feature 3)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_ticket_comparison(p_restaurant_id UUID)
RETURNS TABLE(
    current_avg_ticket NUMERIC,
    previous_avg_ticket NUMERIC,
    change_pct NUMERIC,
    current_total_orders BIGINT,
    previous_total_orders BIGINT,
    current_total_revenue NUMERIC,
    previous_total_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COALESCE(AVG(total), 0) AS avg_ticket,
            COUNT(*)::BIGINT AS total_orders,
            COALESCE(SUM(total), 0) AS total_revenue
        FROM orders 
        WHERE restaurant_id = p_restaurant_id 
        AND status NOT IN ('cancelled')
        AND created_at > (NOW() - INTERVAL '7 days')
    ),
    previous_period AS (
        SELECT 
            COALESCE(AVG(total), 0) AS avg_ticket,
            COUNT(*)::BIGINT AS total_orders,
            COALESCE(SUM(total), 0) AS total_revenue
        FROM orders 
        WHERE restaurant_id = p_restaurant_id 
        AND status NOT IN ('cancelled')
        AND created_at BETWEEN (NOW() - INTERVAL '14 days') AND (NOW() - INTERVAL '7 days')
    )
    SELECT 
        ROUND(cp.avg_ticket, 0) AS current_avg_ticket,
        ROUND(pp.avg_ticket, 0) AS previous_avg_ticket,
        CASE 
            WHEN pp.avg_ticket > 0 THEN ROUND(((cp.avg_ticket - pp.avg_ticket) / pp.avg_ticket) * 100, 1)
            ELSE 0
        END AS change_pct,
        cp.total_orders AS current_total_orders,
        pp.total_orders AS previous_total_orders,
        cp.total_revenue AS current_total_revenue,
        pp.total_revenue AS previous_total_revenue
    FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
