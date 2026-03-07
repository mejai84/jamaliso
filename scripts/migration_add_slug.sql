-- =====================================================
-- MIGRACIÓN: Multi-Tenant Slug Routes para JAMALI OS
-- Fecha: 07 Marzo 2026
-- Descripción: Agrega campo 'slug' a restaurants
-- =====================================================

-- 1. Agregar columna slug (usamos subdomain como base)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Migrar: copiar subdomain existente a slug
UPDATE restaurants 
SET slug = LOWER(REPLACE(REPLACE(subdomain, ' ', '-'), '_', '-'))
WHERE slug IS NULL AND subdomain IS NOT NULL;

-- 3. Para restaurantes sin subdomain, generar slug desde el nombre
UPDATE restaurants
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '_', '-'), '''', ''))
WHERE slug IS NULL;

-- 4. Asegurar unicidad
ALTER TABLE restaurants
ADD CONSTRAINT restaurants_slug_unique UNIQUE (slug);

-- 5. Campos opcionales para SaaS futuro
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS online_store_enabled BOOLEAN DEFAULT false;

-- 6. Verificar resultado
SELECT id, name, subdomain, slug, custom_domain, online_store_enabled 
FROM restaurants 
ORDER BY name;
