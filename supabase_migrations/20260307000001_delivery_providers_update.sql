-- 20260307000001_delivery_providers_update.sql

-- Add columns for handling External Logistics vs Local Fleet
ALTER TABLE delivery_settings ADD COLUMN IF NOT EXISTS active_provider VARCHAR(50) DEFAULT 'JAMALI_FLEET';
ALTER TABLE delivery_settings ADD COLUMN IF NOT EXISTS rappi_store_id VARCHAR(100);
ALTER TABLE delivery_settings ADD COLUMN IF NOT EXISTS uber_store_id VARCHAR(100);

-- Make sure the defaults exist
UPDATE delivery_settings SET active_provider = 'JAMALI_FLEET' WHERE active_provider IS NULL;
