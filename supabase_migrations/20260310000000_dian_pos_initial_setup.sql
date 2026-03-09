-- 📊 JAMALI OS: INFRAESTRUCTURA PARA POS ELECTRÓNICO Y FISCALIZACIÓN DIAN (ANEXO 1.9)
-- Fecha: 10 de Marzo de 2026
-- Objetivo: Preparar la base de datos para Facturación Electrónica de Venta y Documento Equivalente POS.

-- 1. Actualización de perfiles y roles contables
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
    'super_admin',    -- Acceso total multi-tenant
    'developer',      -- Acceso técnico
    'owner',          -- Dueño de negocio
    'admin',          -- Administrador de sucursal
    'manager',        -- Gerente operativo
    'cashier',        -- Cajero
    'waiter',         -- Mesero
    'cook',           -- Cocina
    'chef',           -- Jefe de cocina
    'driver',         -- Repartidor
    'customer',       -- Cliente final
    'fiscal_manager', -- Contador / Gestor fiscal (NUEVO)
    'auditor'         -- Solo lectura contable (NUEVO)
));

-- 2. Tabla de Información del Proveedor de Software (JAMALISO)
CREATE TABLE IF NOT EXISTS public.software_provider_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name text DEFAULT 'JAMALISO SAS',
    software_name text DEFAULT 'JAMALI OS ERP',
    business_name text DEFAULT 'Jaime Jaramillo Dev',
    created_at timestamp with time zone DEFAULT now()
);

-- Insertar info por defecto si no existe
INSERT INTO public.software_provider_info (provider_name, software_name, business_name)
VALUES ('JAMALISO SAS', 'JAMALI OS ERP', 'Jaime Jaramillo Dev')
ON CONFLICT DO NOTHING;

-- 3. Campos técnicos para Factura Electrónica y POS Electrónico
ALTER TABLE public.electronic_invoices 
ADD COLUMN IF NOT EXISTS cash_plate_number text,      -- Identificador físico de la caja (Min 1:07:00 video)
ADD COLUMN IF NOT EXISTS cash_type text DEFAULT 'principal',
ADD COLUMN IF NOT EXISTS cashier_name text,           -- Nombre del cajero al momento de emitir
ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '110111', 
ADD COLUMN IF NOT EXISTS buyer_benefits_points numeric DEFAULT 0, -- Puntos vinculados a la factura
ADD COLUMN IF NOT EXISTS zip_key text,                -- Llave de consulta asíncrona (Min 41:00 video)
ADD COLUMN IF NOT EXISTS is_pos_equivalent boolean DEFAULT false; -- Diferencia Factura de POS Electrónico

-- 4. Expansión de Fiscal Settings para integración API DIAN
ALTER TABLE public.fiscal_settings 
ADD COLUMN IF NOT EXISTS dian_api_token text,          -- Token de sesión con el proveedor
ADD COLUMN IF NOT EXISTS dian_software_id text,        -- ID de software propio en DIAN
ADD COLUMN IF NOT EXISTS dian_software_pin text,       -- PIN de software propio
ADD COLUMN IF NOT EXISTS certificate_base64 text,      -- Certificado .p12 para firma
ADD COLUMN IF NOT EXISTS certificate_password text,    -- Contraseña del certificado
ADD COLUMN IF NOT EXISTS technical_key text,           -- Llave técnica de la resolución
ADD COLUMN IF NOT EXISTS municipality_id text,         -- Código DANE del municipio
ADD COLUMN IF NOT EXISTS test_set_id text,             -- ID para proceso de habilitación
ADD COLUMN IF NOT EXISTS environment text DEFAULT 'hab_dian'; -- 'hab_dian' o 'prod_dian'

-- 5. Comentarios de documentación técnica
COMMENT ON COLUMN public.electronic_invoices.cash_plate_number IS 'Placa física pegada a la máquina registradora según norma DIAN.';
COMMENT ON COLUMN public.electronic_invoices.zip_key IS 'Identificador para consulta de estado en envíos asíncronos.';
