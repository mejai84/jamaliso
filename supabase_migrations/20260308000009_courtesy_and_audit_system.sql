-- 🛡️ JAMALI OS: SISTEMA DE CORTESÍAS Y AUDITORÍA DE CRISIS
-- Añade soporte para marcar órdenes como cortesía, rastrear quién autorizó y discriminar en caja.

-- 1. Ampliar tabla de orders para manejar cortesías
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_courtesy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS courtesy_reason TEXT,
ADD COLUMN IF NOT EXISTS authorized_by UUID REFERENCES public.profiles(id);

-- 2. Ampliar cash_movements para rastrear el valor cedido en cortesía
-- NOTA: Estas entradas no afectarán el balance físico de efectivo pero quedarán en el log.
ALTER TABLE public.cash_movements 
ADD COLUMN IF NOT EXISTS is_courtesy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS authorized_by UUID REFERENCES public.profiles(id);

-- 3. Actualizar la función complete_sale_atomic para soportar cortesías
CREATE OR REPLACE FUNCTION public.complete_sale_atomic(
    p_user_id UUID,
    p_cashbox_session_id UUID,
    p_items JSONB,
    p_payment_method TEXT,
    p_subtotal NUMERIC,
    p_total NUMERIC,
    p_tax NUMERIC DEFAULT 0,
    p_customer_id UUID DEFAULT NULL,
    p_table_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    -- Nuevos parámetros para cortesía
    p_is_courtesy BOOLEAN DEFAULT false,
    p_courtesy_reason TEXT DEFAULT NULL,
    p_authorized_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_product RECORD;
    v_cashbox_open BOOLEAN;
    v_restaurant_id UUID;
    v_result JSONB;
    v_movement_type TEXT;
    v_final_total NUMERIC;
BEGIN
    -- 0. OBTENER TENANT ID
    SELECT restaurant_id INTO v_restaurant_id FROM public.profiles WHERE id = p_user_id;
    
    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Usuario sin restaurante asignado. Operación abortada.';
    END IF;

    -- Validar que si es cortesía, venga con autorizador y razón
    IF p_is_courtesy AND (p_authorized_by IS NULL OR p_courtesy_reason IS NULL) THEN
        RAISE EXCEPTION 'Toda cortesía debe registrar autorizador y motivo para auditoría.';
    END IF;

    -- 1. VALIDACIÓN: Verificar que la caja esté abierta
    SELECT (status = 'OPEN' AND restaurant_id = v_restaurant_id)
    INTO v_cashbox_open
    FROM cashbox_sessions
    WHERE id = p_cashbox_session_id;
    
    IF NOT COALESCE(v_cashbox_open, false) THEN
        RAISE EXCEPTION 'La caja no está abierta o no pertenece a tu restaurante.';
    END IF;

    -- Ajustar total si es cortesía (el total real de la orden es lo que se descuenta, pero el cliente paga 0)
    -- Sin embargo, guardamos el total original en la orden para saber cuánto "costó" la cortesía.
    v_final_total := CASE WHEN p_is_courtesy THEN 0 ELSE p_total END;
    v_movement_type := CASE WHEN p_is_courtesy THEN 'COURTESY' ELSE 'SALE' END;

    -- 2. CREAR LA ORDEN
    INSERT INTO orders (
        user_id,
        restaurant_id,
        order_type,
        status,
        subtotal,
        total,
        payment_method,
        payment_status,
        notes,
        is_courtesy,
        courtesy_reason,
        authorized_by,
        table_id,
        created_at
    ) VALUES (
        p_user_id,
        v_restaurant_id,
        CASE WHEN p_table_id IS NOT NULL THEN 'dine_in' ELSE 'pickup' END,
        'delivered', 
        p_subtotal,
        p_total, -- Guardamos el valor nominal en la orden
        p_payment_method,
        CASE WHEN p_is_courtesy THEN 'paid' ELSE 'paid' END,
        p_notes,
        p_is_courtesy,
        p_courtesy_reason,
        p_authorized_by,
        p_table_id,
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- 3. INSERTAR ITEMS
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- 3.1 Obtener info del producto (Validando Tenancy)
        SELECT id, name, price
        INTO v_product
        FROM products
        WHERE id = (v_item->>'product_id')::UUID
          AND restaurant_id = v_restaurant_id;
        
        IF v_product.id IS NULL THEN
            RAISE EXCEPTION 'Producto no disponible: %', v_item->>'product_id';
        END IF;

        -- 3.2 Insertar item de la orden
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price
        ) VALUES (
            v_order_id,
            v_product.id,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::NUMERIC
        );
    END LOOP;

    -- 5. REGISTRAR MOVIMIENTO DE CAJA
    -- REGISTRAMOS EL VALOR TOTAL EN EL MOVIMIENTO, PERO EL SISTEMA LO DISCRIMINARÁ POR EL TIPO 'COURTESY'
    INSERT INTO cash_movements (
        cashbox_session_id,
        user_id,
        restaurant_id,
        movement_type,
        amount,
        payment_method,
        description,
        reference_id,
        is_courtesy,
        authorized_by,
        created_at
    ) VALUES (
        p_cashbox_session_id,
        p_user_id,
        v_restaurant_id,
        v_movement_type,
        p_total, -- El valor de la cortesía es el total de la orden
        p_payment_method,
        CASE WHEN p_is_courtesy THEN 'CORTESÍA AUTORIZADA: ' || p_courtesy_reason ELSE 'Venta POS #' || v_order_id END,
        v_order_id,
        p_is_courtesy,
        p_authorized_by,
        NOW()
    );

    -- 6. REGISTRO EN AUDITORÍA DE SEGURIDAD (Security Shield)
    IF p_is_courtesy THEN
        INSERT INTO public.security_audit (
            restaurant_id,
            user_id,
            event_type,
            severity,
            description,
            metadata
        ) VALUES (
            v_restaurant_id,
            p_user_id,
            'COURTESY_GRANTED',
            'INFO',
            'Se otorgó una cortesía por valor de ' || p_total || ' autorizada por UID: ' || p_authorized_by,
            jsonb_build_object(
                'order_id', v_order_id,
                'total', p_total,
                'reason', p_courtesy_reason,
                'authorized_by', p_authorized_by
            )
        );
    END IF;

    -- 7. RETORNAR RESULTADO
    v_result := jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'total', v_final_total,
        'is_courtesy', p_is_courtesy,
        'message', CASE WHEN p_is_courtesy THEN 'Cortesía aplicada exitosamente' ELSE 'Venta completada exitosamente' END
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error en transacción: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;
