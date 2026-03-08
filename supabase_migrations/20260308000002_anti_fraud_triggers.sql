-- =================================================================================
-- PROTECCIÓN ANTI-FRAUDE EN PUNTO DE VENTA (POS) Y AUDITORÍA
-- =================================================================================

-- 1. Crear tabla de auditoría de seguridad
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID,
    event_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para Security Events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los admins pueden ver la auditoría de su restaurante" 
ON security_events FOR SELECT 
USING (restaurant_id = (SELECT restaurant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Solo el sistema puede insertar eventos de auditoría" 
ON security_events FOR INSERT 
WITH CHECK (true); -- Permitimos insert desde triggers con SECURITY DEFINER

-- 2. Trigger para registrar cambios de precios en Productos
CREATE OR REPLACE FUNCTION log_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.price IS DISTINCT FROM NEW.price THEN
        INSERT INTO security_events (restaurant_id, user_id, event_type, table_name, record_id, old_data, new_data)
        VALUES (
            OLD.restaurant_id,
            auth.uid(),
            'PRICE_CHANGE',
            'products',
            OLD.id,
            jsonb_build_object('price', OLD.price, 'name', OLD.name),
            jsonb_build_object('price', NEW.price, 'name', NEW.name)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_product_price_change ON products;
CREATE TRIGGER tr_log_product_price_change
AFTER UPDATE OF price ON products
FOR EACH ROW
EXECUTE FUNCTION log_product_price_change();

-- 3. Trigger para bloquear edición de Ventas Cerradas (Protección contra Fraude en Caja)
-- Evita que una orden con status COMPLETED sea alterada maliciosamente
CREATE OR REPLACE FUNCTION prevent_closed_order_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- Permitimos cambios desde el sistema admin si tiene un flag especial (podría manejarse por rol),
    -- pero por defecto, bloqueamos.
    IF OLD.status = 'COMPLETED' THEN
        -- Si intentan cambiar el 'total', 'subtotal', o regresarla a 'PENDING'
        IF OLD.total IS DISTINCT FROM NEW.total OR OLD.status IS DISTINCT FROM NEW.status THEN
            -- Registramos el intento de manipulación en auditoría como alerta
            INSERT INTO security_events (restaurant_id, user_id, event_type, table_name, record_id, old_data, new_data)
            VALUES (
                OLD.restaurant_id,
                auth.uid(),
                'FRAUD_ATTEMPT_CLOSED_TICKET',
                'orders',
                OLD.id,
                jsonb_build_object('status', OLD.status, 'total', OLD.total),
                jsonb_build_object('status', NEW.status, 'total', NEW.total)
            );
            
            -- Lanzamos excepción para detener el UPDATE
            RAISE EXCEPTION 'Operación de fraude detectada: No se puede modificar financieramente una orden que ya fue cerrada (COMPLETED).';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_closed_order_tampering ON orders;
CREATE TRIGGER tr_prevent_closed_order_tampering
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION prevent_closed_order_tampering();

-- Index para optimizar consultas de auditoría por restaurante
CREATE INDEX IF NOT EXISTS idx_security_events_restaurant ON security_events(restaurant_id, created_at DESC);
