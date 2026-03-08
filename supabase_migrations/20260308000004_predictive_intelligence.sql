-- 🧠 JAMALI GUARDIAN: REFINAMIENTO DE IA (PUNTUACIÓN DE RIESGO MULTI-FACTOR)

-- ELIMINAR VISTA PREVIA PARA EVITAR ERRORES DE COLUMNAS (REPLACE VIEW NO PERMITE CAMBIO DE NOMBRES)
DROP VIEW IF EXISTS guardian_employee_risk CASCADE;

-- 1. Crear Vista de Riesgo con Scoring Completo
CREATE VIEW guardian_employee_risk AS
WITH employee_stats AS (
    SELECT 
        waiter_id,
        restaurant_id,
        count(*) as total_orders,
        count(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        sum(total) as revenue_generated,
        -- Promedio de descuento aplicado (donde el total < subtotal)
        avg(CASE WHEN subtotal > 0 THEN (subtotal - total) / subtotal ELSE 0 END) as avg_discount_pct
    FROM orders
    WHERE created_at > (NOW() - INTERVAL '30 days')
    GROUP BY waiter_id, restaurant_id
),
audit_history AS (
    -- Contar alertas previas en security_audit para este mesero
    SELECT 
        performed_by, 
        count(*) as total_red_flags
    FROM security_audit
    WHERE created_at > (NOW() - INTERVAL '30 days')
    GROUP BY performed_by
),
restaurant_baselines AS (
    SELECT 
        restaurant_id,
        avg(cancelled_orders::float / NULLIF(total_orders, 0)) as site_avg_cancel_rate,
        avg(avg_discount_pct) as site_avg_discount
    FROM employee_stats
    GROUP BY restaurant_id
)
SELECT 
    es.waiter_id,
    p.full_name as employee_name,
    es.restaurant_id,
    es.total_orders,
    es.cancelled_orders,
    -- Cálculo de Factor 1: Desviación de Anulaciones (0 a 50 pts)
    LEAST(50, ( (es.cancelled_orders::float / NULLIF(es.total_orders, 0)) / NULLIF(rb.site_avg_cancel_rate, 0) ) * 15) as cancel_score,
    -- Cálculo de Factor 2: Abuso de Descuentos (0 a 30 pts)
    LEAST(30, ( es.avg_discount_pct / NULLIF(rb.site_avg_discount, 0) ) * 10) as discount_score,
    -- Cálculo de Factor 3: Historial Forense (0 a 20 pts)
    LEAST(20, COALESCE(ah.total_red_flags, 0) * 5) as history_score,
    -- SCORE GLOBAL (0 a 100)
    (
        LEAST(50, ( (es.cancelled_orders::float / NULLIF(es.total_orders, 0)) / NULLIF(rb.site_avg_cancel_rate, 0) ) * 15) +
        LEAST(30, ( es.avg_discount_pct / NULLIF(rb.site_avg_discount, 0) ) * 10) +
        LEAST(20, COALESCE(ah.total_red_flags, 0) * 5)
    ) as aggregate_risk_score,
    -- NIVEL DE RIESGO
    CASE 
        WHEN (
            LEAST(50, ( (es.cancelled_orders::float / NULLIF(es.total_orders, 0)) / NULLIF(rb.site_avg_cancel_rate, 0) ) * 15) +
            LEAST(30, ( es.avg_discount_pct / NULLIF(rb.site_avg_discount, 0) ) * 10) +
            LEAST(20, COALESCE(ah.total_red_flags, 0) * 5)
        ) > 70 THEN 'CRITICAL'
        WHEN (
            LEAST(50, ( (es.cancelled_orders::float / NULLIF(es.total_orders, 0)) / NULLIF(rb.site_avg_cancel_rate, 0) ) * 15) +
            LEAST(30, ( es.avg_discount_pct / NULLIF(rb.site_avg_discount, 0) ) * 10) +
            LEAST(20, COALESCE(ah.total_red_flags, 0) * 5)
        ) > 40 THEN 'MEDIUM'
        ELSE 'LOW'
    END as risk_level,
    (es.cancelled_orders::float / NULLIF(es.total_orders, 0)) * 100 as cancel_rate_pct,
    rb.site_avg_cancel_rate * 100 as restaurant_avg_pct
FROM employee_stats es
JOIN profiles p ON es.waiter_id = p.id
JOIN restaurant_baselines rb ON es.restaurant_id = rb.restaurant_id
LEFT JOIN audit_history ah ON es.waiter_id = ah.performed_by;

-- 2. Refinar Trigger para detectar "Ráfagas" (Burst Detection)
CREATE OR REPLACE FUNCTION pattern_anomaly_watchdog()
RETURNS TRIGGER AS $$
DECLARE
    v_waiter_name TEXT;
    v_risk_score FLOAT;
    v_recent_cancels INT;
BEGIN
    -- 1. DETECCIÓN DE RÁFAGA (3 anulaciones en las últimas 2 horas)
    SELECT count(*) INTO v_recent_cancels
    FROM orders
    WHERE waiter_id = NEW.waiter_id
    AND status = 'cancelled'
    AND updated_at > (NOW() - INTERVAL '2 hours');

    IF v_recent_cancels >= 3 AND NEW.status = 'cancelled' THEN
        INSERT INTO security_audit (event_type, severity, description, performed_by, restaurant_id)
        VALUES (
            'BURST_ANOMALY', 
            'CRITICAL', 
            'ALERTA DE RÁFAGA: Usuario ha realizado ' || v_recent_cancels || ' anulaciones en menos de 2 horas.', 
            NEW.waiter_id, 
            NEW.restaurant_id
        );
    END IF;

    -- 2. VERIFICACIÓN DE SCORE AGREGADO
    SELECT employee_name, aggregate_risk_score INTO v_waiter_name, v_risk_score
    FROM guardian_employee_risk
    WHERE waiter_id = NEW.waiter_id;

    IF v_risk_score > 70 AND NEW.status = 'cancelled' THEN
        INSERT INTO security_audit (event_type, severity, description, performed_by, restaurant_id, metadata)
        VALUES (
            'PATTERN_ANOMALY', 
            'CRITICAL', 
            'RIESGO CRÍTICO ACUMULADO: ' || v_waiter_name || ' superó el umbral de confianza del sistema (Score: ' || v_risk_score || ')', 
            NEW.waiter_id, 
            NEW.restaurant_id, 
            jsonb_build_object('score', v_risk_score)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
