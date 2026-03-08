-- 🥕 JAMALI GUARDIAN: WATCHDOG DE INVENTARIO (STOCKS CRÍTICOS)

-- 1. Función para detectar bajo stock y alertar al Guardian
CREATE OR REPLACE FUNCTION monitor_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el stock actual cae por debajo del mínimo configurado
    IF (NEW.current_stock <= NEW.min_stock AND (OLD.current_stock > OLD.min_stock OR OLD.current_stock IS NULL)) THEN
        INSERT INTO security_audit (event_type, severity, description, restaurant_id, metadata)
        VALUES (
            'LOW_STOCK_ALERT', 
            'HIGH', 
            'Stock Crítico detectado: ' || NEW.name || ' (' || NEW.current_stock || ' ' || NEW.unit || ')', 
            NEW.restaurant_id, 
            jsonb_build_object(
                'ingredient_id', NEW.id,
                'ingredient_name', NEW.name,
                'current_stock', NEW.current_stock,
                'min_stock', NEW.min_stock,
                'unit', NEW.unit
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger en la tabla ingredients
DROP TRIGGER IF EXISTS inventory_watchdog_trigger ON ingredients;
CREATE TRIGGER inventory_watchdog_trigger
    AFTER UPDATE OR INSERT ON ingredients
    FOR EACH ROW
    EXECUTE FUNCTION monitor_inventory_stock();

-- 3. Comentario para el Guardian
COMMENT ON FUNCTION monitor_inventory_stock IS 'Monitorea niveles de stock en tiempo real y dispara alertas al Guardian App.';
