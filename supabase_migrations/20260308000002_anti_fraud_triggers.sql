-- 🛡️ JAMALI GUARDIAN: INFRAESTRUCTURA DE AUDITORÍA Y SEGURIDAD

-- 1. Crear tabla de auditoría de seguridad
CREATE TABLE IF NOT EXISTS security_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'VOID_ORDER', 'LARGE_DISCOUNT', 'CASH_DRAWER_OPEN'
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    order_id UUID REFERENCES orders(id),
    performed_by UUID REFERENCES profiles(id),
    metadata JSONB,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    restaurant_id UUID REFERENCES restaurants(id)
);

-- 2. Habilitar RLS estricto (Guardian Only)
ALTER TABLE security_audit ENABLE ROW LEVEL SECURITY;

-- 3. Políticas: Solo Owner y Developer pueden leerla
CREATE POLICY "Guardian Access" ON security_audit
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'developer', 'admin')
        )
    );

-- 4. Funci n para disparar alertas autom ticas
CREATE OR REPLACE FUNCTION trigger_security_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Ejemplo: Alerta por descuento mayor al 30%
    IF (NEW.total < OLD.total * 0.7 AND NEW.status != 'cancelled') THEN
        INSERT INTO security_audit (event_type, severity, description, order_id, restaurant_id, metadata)
        VALUES (
            'LARGE_DISCOUNT', 
            'MEDIUM', 
            'Descuento superior al 30% detectado en orden #' || NEW.id, 
            NEW.id, 
            NEW.restaurant_id, 
            jsonb_build_object('old_total', OLD.total, 'new_total', NEW.total)
        );
    END IF;

    -- Ejemplo: Alerta por anulaci n de orden preparada/entregada
    IF (NEW.status = 'cancelled' AND OLD.status IN ('prepared', 'delivered')) THEN
        INSERT INTO security_audit (event_type, severity, description, order_id, restaurant_id, metadata)
        VALUES (
            'VOID_ORDER', 
            'HIGH', 
            'Orden cr tica anulada despu s de preparaci n/entrega', 
            NEW.id, 
            NEW.restaurant_id, 
            jsonb_build_object('former_status', OLD.status)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger en la tabla orders
CREATE TRIGGER orders_security_watchdog
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_security_alert();

-- 6. Comentarios para documentaci n
COMMENT ON TABLE security_audit IS 'Log centralizado para JAMALI GUARDIAN. Registra eventos de riesgo y fraudes potenciales.';
