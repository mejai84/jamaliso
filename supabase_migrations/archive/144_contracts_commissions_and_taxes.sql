-- 🏗️ EVOLUCIÓN ERP: CONTRATOS, COMISIONES E IMPUESTOS REGIONALES

-- 1. Ampliar Perfiles para Gestión de Nómina y Contratos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS base_salary NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'indefinido',
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS identification_number TEXT;

-- 2. Asegurar que las ventas registren al mesero/vendedor específicamente para comisiones
-- La tabla pos_sales ya tiene user_id, pero añadimos waiter_id para mayor claridad en repartición
ALTER TABLE public.pos_sales 
ADD COLUMN IF NOT EXISTS waiter_id UUID REFERENCES public.profiles(id);

-- 3. Tabla de Impuestos por Región (Configuración Avanzada)
CREATE TABLE IF NOT EXISTS public.regional_taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL,
    tax_name TEXT NOT NULL, -- Ej: IVA, Impoconsumo, VAT
    tax_percentage NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    restaurant_id UUID REFERENCES public.restaurants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country, tax_name, restaurant_id)
);

-- 4. Semilla de Impuestos Comunes (Colombia por defecto)
INSERT INTO public.regional_taxes (country, tax_name, tax_percentage)
VALUES 
    ('Colombia', 'Impoconsumo', 8.00),
    ('Colombia', 'IVA', 19.00),
    ('Mexico', 'IVA', 16.00),
    ('España', 'IVA', 21.00),
    ('USA', 'Sales Tax', 7.00)
ON CONFLICT DO NOTHING;

-- 5. Función para calcular comisiones automáticamente (Opcional, puede ser manual en liquidación)
-- Esta función sumará la comisión al "payroll_novelties" si se desea automatización total
CREATE OR REPLACE FUNCTION process_sale_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_commission_pct NUMERIC;
    v_commission_amount NUMERIC;
    v_waiter_id UUID;
BEGIN
    -- Determinar quién gana la comisión (waiter_id o user_id)
    v_waiter_id := COALESCE(NEW.waiter_id, NEW.user_id);
    
    -- Obtener porcentaje del perfil
    SELECT commission_percentage INTO v_commission_pct 
    FROM public.profiles 
    WHERE id = v_waiter_id;
    
    IF v_commission_pct > 0 THEN
        v_commission_amount := NEW.total_amount * (v_commission_pct / 100);
        
        -- Insertar como novedad de nómina (EARNING)
        INSERT INTO public.payroll_novelties (
            employee_id, concept_id, amount, date, description, status, restaurant_id
        ) 
        SELECT 
            v_waiter_id, 
            id, 
            v_commission_amount, 
            NEW.created_at, 
            'Comisión automática Venta ' || NEW.id,
            'APPROVED',
            NEW.restaurant_id
        FROM public.payroll_concepts 
        WHERE name = 'Comisión por Ventas' AND restaurant_id = NEW.restaurant_id
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar al completar una venta
DROP TRIGGER IF EXISTS trigger_calculate_commission ON public.pos_sales;
CREATE TRIGGER trigger_calculate_commission
AFTER INSERT ON public.pos_sales
FOR EACH ROW
WHEN (NEW.payment_status = 'PAID')
EXECUTE FUNCTION process_sale_commission();
