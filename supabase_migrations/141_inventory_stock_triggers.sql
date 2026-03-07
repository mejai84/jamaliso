-- 📦 TRABAJO DE INVENTARIO INTELIGENTE: ACTUALIZACIÓN AUTOMÁTICA DE STOCK
-- Este trigger asegura que cada vez que se registre una compra de insumos, el stock aumente automáticamente.

CREATE OR REPLACE FUNCTION update_ingredient_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar el stock del ingrediente correspondiente
    UPDATE ingredients
    SET current_stock = current_stock + NEW.quantity,
        cost_per_unit = NEW.unit_cost, -- Actualizar el costo con el último precio de compra (opcional, pero recomendado)
        updated_at = NOW()
    WHERE id = NEW.ingredient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para la tabla de items de compra
DROP TRIGGER IF EXISTS tr_update_stock_on_purchase ON inventory_purchase_items;
CREATE TRIGGER tr_update_stock_on_purchase
AFTER INSERT ON inventory_purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_ingredient_stock_on_purchase();

-- 📉 TRABAJO DE MERMAS: REDUCCIÓN DE STOCK
-- Si se registra una merma manual, reducir el stock
CREATE OR REPLACE FUNCTION update_ingredient_stock_on_waste()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ingredients
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.ingredient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_stock_on_waste ON inventory_waste;
CREATE TRIGGER tr_update_stock_on_waste
AFTER INSERT ON inventory_waste
FOR EACH ROW
EXECUTE FUNCTION update_ingredient_stock_on_waste();
