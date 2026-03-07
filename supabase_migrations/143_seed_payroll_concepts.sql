-- 🧾 CONCEPTOS SEMILLA - NÓMINA COLOMBIA
-- Valores estándar por ley para iniciar la operación.

INSERT INTO public.payroll_concepts (name, type, category, percentage, is_legal) VALUES
    ('Sueldo Básico', 'EARNING', 'Sueldo', NULL, true),
    ('Salud (Empleado)', 'DEDUCTION', 'Seguridad Social', 4.00, true),
    ('Pensión (Empleado)', 'DEDUCTION', 'Seguridad Social', 4.00, true),
    ('Hora Extra Diurna', 'EARNING', 'Horas Extra', 25.00, true),
    ('Hora Extra Nocturna', 'EARNING', 'Horas Extra', 75.00, true),
    ('Hora Extra Festiva', 'EARNING', 'Horas Extra', 100.00, true),
    ('Recargo Nocturno', 'EARNING', 'Recargos', 35.00, true),
    ('Auxilio de Transporte', 'EARNING', 'Auxilios', NULL, true),
    ('Comisión por Ventas', 'EARNING', 'Comisiones', NULL, false)
ON CONFLICT DO NOTHING;
