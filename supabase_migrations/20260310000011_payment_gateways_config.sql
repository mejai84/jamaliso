-- ============================================================
-- MIGRATION: Payment Gateway Settings Support
-- JAMALI OS · Sprint: Payment Engine
-- Date: 2026-03-10
-- ============================================================

-- 1) Asegurar que la tabla settings tenga el constraint correcto
-- (ya debería existir, esto es una validación de seguridad)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'settings'
    ) THEN
        CREATE TABLE settings (
            id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
            key             TEXT NOT NULL,
            value           JSONB NOT NULL DEFAULT '{}',
            created_at      TIMESTAMPTZ DEFAULT now(),
            updated_at      TIMESTAMPTZ DEFAULT now(),
            UNIQUE(restaurant_id, key)
        );
    END IF;
END $$;

-- 2) Índice para búsqueda rápida por gateway
CREATE INDEX IF NOT EXISTS idx_settings_payment_gateways 
ON settings(restaurant_id, key) 
WHERE key = 'payment_gateways';

-- 3) Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_timestamp();

-- 4) RLS: Solo el restaurant puede leer/escribir sus propios settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_owner_select" ON settings;
CREATE POLICY "settings_owner_select" ON settings
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "settings_owner_insert" ON settings;
CREATE POLICY "settings_owner_insert" ON settings
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "settings_owner_update" ON settings;
CREATE POLICY "settings_owner_update" ON settings
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 5) Seed: Insertar configuración por defecto para todos los restaurantes que
--    aún no tengan configuración de pasarelas de pago
INSERT INTO settings (restaurant_id, key, value)
SELECT 
    r.id AS restaurant_id,
    'payment_gateways' AS key,
    jsonb_build_object(
        'mercadopago', jsonb_build_object('enabled', false, 'mode', 'sandbox'),
        'nequi',       jsonb_build_object('enabled', false, 'mode', 'production'),
        'stripe',      jsonb_build_object('enabled', false, 'mode', 'sandbox'),
        'wompi',       jsonb_build_object('enabled', false, 'mode', 'sandbox'),
        'card_terminal',  jsonb_build_object('enabled', true, 'mode', 'production'),
        'bank_transfer',  jsonb_build_object('enabled', true, 'mode', 'production')
    ) AS value
FROM restaurants r
WHERE NOT EXISTS (
    SELECT 1 FROM settings s 
    WHERE s.restaurant_id = r.id AND s.key = 'payment_gateways'
)
ON CONFLICT (restaurant_id, key) DO NOTHING;

-- 6) Vista útil para consultar qué pasarelas están activas por restaurante
CREATE OR REPLACE VIEW active_payment_gateways AS
SELECT 
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    s.value->>'mercadopago' AS mercadopago_raw,
    (s.value->'mercadopago'->>'enabled')::boolean AS mercadopago_enabled,
    (s.value->'nequi'->>'enabled')::boolean AS nequi_enabled,
    (s.value->'stripe'->>'enabled')::boolean AS stripe_enabled,
    (s.value->'wompi'->>'enabled')::boolean AS wompi_enabled,
    (s.value->'card_terminal'->>'enabled')::boolean AS card_terminal_enabled,
    (s.value->'bank_transfer'->>'enabled')::boolean AS bank_transfer_enabled,
    s.updated_at
FROM restaurants r
LEFT JOIN settings s ON s.restaurant_id = r.id AND s.key = 'payment_gateways';

COMMENT ON VIEW active_payment_gateways IS 
'Vista de auditoría: muestra qué pasarelas de pago tiene activas cada restaurante.';

-- ============================================================
-- SECURITY NOTE:
-- Las API keys y secrets se almacenan en JSONB como texto.
-- En producción con datos sensibles, considerar usar Supabase Vault
-- o variables de entorno para las claves más críticas (Stripe secret key).
-- ============================================================
