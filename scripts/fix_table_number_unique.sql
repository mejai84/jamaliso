-- =====================================================
-- FIX: Constraint table_number → UNIQUE por restaurante
-- Fecha: 07 Marzo 2026
-- =====================================================

-- Eliminar el UNIQUE global (permite que diferentes restaurantes tengan Mesa 1)
ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_table_number_key;

-- Crear UNIQUE compuesto: table_number es único DENTRO de cada restaurante
ALTER TABLE tables ADD CONSTRAINT tables_table_number_restaurant_unique 
    UNIQUE (restaurant_id, table_number);

-- Verificar
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'tables' AND constraint_type = 'UNIQUE';
